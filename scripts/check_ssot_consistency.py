#!/usr/bin/env python3
"""
Fintutto SSOT Consistency Checker
==================================
Überprüft die Datenkonsistenz aller SSOT-integrierten Apps im Portal-Ökosystem.

Geprüfte Checks:
  1. SSOT-Abdeckung: Wie viele Records haben bereits core_contact_id / core_address_id?
  2. Verwaiste Referenzen: Zeigen core_contact_id-Felder auf nicht-existente core_contacts?
  3. Duplikate: Gibt es core_contacts mit identischer E-Mail oder identischem Namen?
  4. Adress-Konsistenz: Haben Adressen alle Pflichtfelder (street, city, postal_code)?
  5. SecondBrain-Link-Integrität: Verweisen sb_document_entity_links auf existente Dokumente?
  6. Profil-Vollständigkeit: Haben alle Nutzer first_name und last_name in profiles?

Verwendung:
  python3 check_ssot_consistency.py [--json] [--fix-hints]

  --json        Ausgabe als JSON (für CI/CD-Integration)
  --fix-hints   Zeigt SQL-Snippets zur Behebung gefundener Probleme

Voraussetzungen:
  pip install supabase python-dotenv
  Umgebungsvariablen: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
  (oder SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY für Service-Role-Zugriff)
"""

import os
import sys
import json
import argparse
from datetime import datetime
from typing import Optional

try:
    from supabase import create_client, Client
except ImportError:
    print("Error: supabase package not installed. Run: pip install supabase")
    sys.exit(1)

try:
    from dotenv import load_dotenv
    load_dotenv()
    # Also try loading from the portal apps directory
    for env_path in [
        os.path.join(os.path.dirname(__file__), "../apps/fintutto-biz/.env"),
        os.path.join(os.path.dirname(__file__), "../.env"),
    ]:
        if os.path.exists(env_path):
            load_dotenv(env_path)
            break
except ImportError:
    pass  # dotenv is optional

# ─────────────────────────────────────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────────────────────────────────────

SUPABASE_URL = (
    os.getenv("VITE_SUPABASE_URL")
    or os.getenv("SUPABASE_URL")
    or ""
)
SUPABASE_KEY = (
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")  # Prefer service role for full access
    or os.getenv("VITE_SUPABASE_ANON_KEY")
    or os.getenv("SUPABASE_ANON_KEY")
    or ""
)

# Tables to check for core_contact_id coverage
CONTACT_TABLES = [
    {"table": "tenants",    "label": "Vermietify – Mieter"},
    {"table": "biz_clients","label": "Financial Compass – Kunden"},
    {"table": "leads",      "label": "AMS – Leads"},
    {"table": "user_cases", "label": "Bescheidboxer – Fälle"},
]

# Tables to check for core_address_id coverage
ADDRESS_TABLES = [
    {"table": "properties",   "label": "Vermietify – Objekte"},
    {"table": "buildings",    "label": "Vermietify – Gebäude"},
    {"table": "organizations","label": "AMS – Organisationen"},
    {"table": "apartments",   "label": "Pflanzen-Manager – Wohnungen"},
]

# ─────────────────────────────────────────────────────────────────────────────
# Result tracking
# ─────────────────────────────────────────────────────────────────────────────

results = {
    "timestamp": datetime.now().isoformat(),
    "supabase_url": SUPABASE_URL,
    "checks": [],
    "summary": {
        "total": 0,
        "passed": 0,
        "warnings": 0,
        "errors": 0,
        "skipped": 0,
    }
}

def add_result(check_id: str, label: str, status: str, message: str,
               details: Optional[dict] = None, fix_hint: Optional[str] = None):
    """Record a check result."""
    entry = {
        "check_id": check_id,
        "label": label,
        "status": status,  # "pass" | "warning" | "error" | "skip"
        "message": message,
        "details": details or {},
        "fix_hint": fix_hint,
    }
    results["checks"].append(entry)
    results["summary"]["total"] += 1
    results["summary"][{"pass": "passed", "warning": "warnings",
                         "error": "errors", "skip": "skipped"}[status]] += 1

    icons = {"pass": "✅", "warning": "⚠️", "error": "❌", "skip": "⏭️"}
    print(f"  {icons[status]} [{label}] {message}")
    if details:
        for k, v in details.items():
            print(f"      {k}: {v}")


# ─────────────────────────────────────────────────────────────────────────────
# Check functions
# ─────────────────────────────────────────────────────────────────────────────

def check_ssot_coverage(supabase: Client, table: str, label: str, ssot_col: str):
    """Check what percentage of records have the SSOT column populated."""
    check_id = f"ssot_coverage_{table}"
    try:
        total_resp = supabase.table(table).select("id", count="exact").limit(1).execute()
        total = total_resp.count or 0

        if total == 0:
            add_result(check_id, label, "skip", f"Tabelle leer (0 Datensätze)")
            return

        linked_resp = (
            supabase.table(table)
            .select("id", count="exact")
            .not_.is_(ssot_col, "null")
            .limit(1)
            .execute()
        )
        linked = linked_resp.count or 0
        missing = total - linked
        pct = (linked / total) * 100

        if pct == 100:
            add_result(check_id, label, "pass",
                       f"100% SSOT-Abdeckung ({linked}/{total} Datensätze verknüpft)")
        elif pct >= 50:
            add_result(check_id, label, "warning",
                       f"Teilweise verknüpft: {linked}/{total} ({pct:.1f}%)",
                       details={"Fehlende Links": missing, "Spalte": ssot_col},
                       fix_hint=(
                           f"UPDATE public.{table} SET {ssot_col} = (\n"
                           f"  SELECT id FROM public.core_contacts\n"
                           f"  WHERE email = {table}.email LIMIT 1\n"
                           f") WHERE {ssot_col} IS NULL;"
                       ))
        else:
            add_result(check_id, label, "error",
                       f"Kaum verknüpft: {linked}/{total} ({pct:.1f}%)",
                       details={"Fehlende Links": missing, "Spalte": ssot_col},
                       fix_hint=(
                           f"-- Automatische Migration für {table}:\n"
                           f"UPDATE public.{table} t\n"
                           f"SET {ssot_col} = cc.id\n"
                           f"FROM public.core_contacts cc\n"
                           f"WHERE cc.email = t.email\n"
                           f"  AND t.{ssot_col} IS NULL;"
                       ))
    except Exception as e:
        add_result(check_id, label, "error", f"Fehler: {e}")


def check_orphaned_references(supabase: Client, table: str, label: str, ssot_col: str, ref_table: str):
    """Check for records where the SSOT foreign key points to a non-existent record."""
    check_id = f"orphan_{table}"
    try:
        # Get all non-null SSOT IDs from the table
        resp = supabase.table(table).select(f"id,{ssot_col}").not_.is_(ssot_col, "null").execute()
        records = resp.data or []

        if not records:
            add_result(check_id, label, "skip", f"Keine verknüpften Datensätze vorhanden")
            return

        orphans = []
        # Check each referenced ID exists in the target table
        # We batch this to avoid too many requests
        ref_ids = list({r[ssot_col] for r in records if r.get(ssot_col)})
        batch_size = 50
        existing_ids = set()

        for i in range(0, len(ref_ids), batch_size):
            batch = ref_ids[i:i + batch_size]
            ref_resp = supabase.table(ref_table).select("id").in_("id", batch).execute()
            existing_ids.update(r["id"] for r in (ref_resp.data or []))

        orphan_ids = [rid for rid in ref_ids if rid not in existing_ids]

        if not orphan_ids:
            add_result(check_id, label, "pass",
                       f"Keine verwaisten Referenzen in {table}.{ssot_col}")
        else:
            add_result(check_id, label, "error",
                       f"{len(orphan_ids)} verwaiste Referenz(en) gefunden",
                       details={"Verwaiste IDs (Auszug)": orphan_ids[:5]},
                       fix_hint=(
                           f"-- Verwaiste Referenzen bereinigen:\n"
                           f"UPDATE public.{table}\n"
                           f"SET {ssot_col} = NULL\n"
                           f"WHERE {ssot_col} NOT IN (\n"
                           f"  SELECT id FROM public.{ref_table}\n"
                           f");"
                       ))
    except Exception as e:
        add_result(check_id, label, "error", f"Fehler: {e}")


def check_duplicate_contacts(supabase: Client):
    """Check for duplicate core_contacts (same email or same name)."""
    check_id = "duplicate_contacts"
    label = "Core Contacts – Duplikate"
    try:
        resp = supabase.table("core_contacts").select("id,email,first_name,last_name").execute()
        contacts = resp.data or []

        if not contacts:
            add_result(check_id, label, "skip", "Keine Kontakte vorhanden")
            return

        # Check for duplicate emails
        emails = [c["email"] for c in contacts if c.get("email")]
        dup_emails = {e for e in emails if emails.count(e) > 1}

        # Check for duplicate names
        names = [f"{c.get('first_name','')} {c.get('last_name','')}".strip() for c in contacts]
        dup_names = {n for n in names if n and names.count(n) > 1}

        issues = []
        if dup_emails:
            issues.append(f"{len(dup_emails)} doppelte E-Mail(s): {list(dup_emails)[:3]}")
        if dup_names:
            issues.append(f"{len(dup_names)} doppelter Name(n): {list(dup_names)[:3]}")

        if not issues:
            add_result(check_id, label, "pass",
                       f"Keine Duplikate unter {len(contacts)} Kontakten")
        else:
            add_result(check_id, label, "warning",
                       "; ".join(issues),
                       fix_hint=(
                           "-- Duplikate per E-Mail finden:\n"
                           "SELECT email, COUNT(*) FROM public.core_contacts\n"
                           "GROUP BY email HAVING COUNT(*) > 1;"
                       ))
    except Exception as e:
        add_result(check_id, label, "error", f"Fehler: {e}")


def check_address_completeness(supabase: Client):
    """Check that core_addresses have all required fields."""
    check_id = "address_completeness"
    label = "Core Addresses – Vollständigkeit"
    required_fields = ["street", "city", "postal_code"]
    try:
        resp = supabase.table("core_addresses").select("id,street,city,postal_code,country").execute()
        addresses = resp.data or []

        if not addresses:
            add_result(check_id, label, "skip", "Keine Adressen vorhanden")
            return

        incomplete = [
            a["id"] for a in addresses
            if any(not a.get(f) for f in required_fields)
        ]

        if not incomplete:
            add_result(check_id, label, "pass",
                       f"Alle {len(addresses)} Adressen vollständig")
        else:
            add_result(check_id, label, "warning",
                       f"{len(incomplete)}/{len(addresses)} Adressen unvollständig",
                       details={"Pflichtfelder": ", ".join(required_fields),
                                 "Unvollständige IDs (Auszug)": incomplete[:3]},
                       fix_hint=(
                           "-- Unvollständige Adressen finden:\n"
                           "SELECT id, street, city, postal_code\n"
                           "FROM public.core_addresses\n"
                           "WHERE street IS NULL OR city IS NULL OR postal_code IS NULL;"
                       ))
    except Exception as e:
        add_result(check_id, label, "error", f"Fehler: {e}")


def check_secondbrain_link_integrity(supabase: Client):
    """Check that all sb_document_entity_links point to existing documents."""
    check_id = "sb_link_integrity"
    label = "SecondBrain – Link-Integrität"
    try:
        links_resp = supabase.table("sb_document_entity_links").select("id,document_id,entity_type").execute()
        links = links_resp.data or []

        if not links:
            add_result(check_id, label, "skip", "Keine Dokument-Links vorhanden")
            return

        # Get all unique document IDs referenced
        doc_ids = list({l["document_id"] for l in links if l.get("document_id")})
        batch_size = 50
        existing_doc_ids = set()

        for i in range(0, len(doc_ids), batch_size):
            batch = doc_ids[i:i + batch_size]
            docs_resp = supabase.table("sb_documents").select("id").in_("id", batch).execute()
            existing_doc_ids.update(d["id"] for d in (docs_resp.data or []))

        orphan_links = [l["id"] for l in links if l.get("document_id") not in existing_doc_ids]

        # Count by entity type
        type_counts = {}
        for l in links:
            t = l.get("entity_type", "unknown")
            type_counts[t] = type_counts.get(t, 0) + 1

        if not orphan_links:
            add_result(check_id, label, "pass",
                       f"Alle {len(links)} Links gültig",
                       details={"Links nach Typ": type_counts})
        else:
            add_result(check_id, label, "error",
                       f"{len(orphan_links)} verwaiste Links (Dokument gelöscht?)",
                       details={"Links nach Typ": type_counts,
                                 "Verwaiste Link-IDs (Auszug)": orphan_links[:5]},
                       fix_hint=(
                           "-- Verwaiste Links bereinigen:\n"
                           "DELETE FROM public.sb_document_entity_links\n"
                           "WHERE document_id NOT IN (\n"
                           "  SELECT id FROM public.sb_documents\n"
                           ");"
                       ))
    except Exception as e:
        add_result(check_id, label, "error", f"Fehler: {e}")


def check_profile_completeness(supabase: Client):
    """Check that all user profiles have first_name and last_name."""
    check_id = "profile_completeness"
    label = "Nutzerprofile – Vollständigkeit"
    try:
        resp = supabase.table("profiles").select("id,first_name,last_name,email").execute()
        profiles = resp.data or []

        if not profiles:
            add_result(check_id, label, "skip", "Keine Profile vorhanden")
            return

        incomplete = [
            p["id"] for p in profiles
            if not p.get("first_name") or not p.get("last_name")
        ]

        if not incomplete:
            add_result(check_id, label, "pass",
                       f"Alle {len(profiles)} Profile vollständig")
        else:
            add_result(check_id, label, "warning",
                       f"{len(incomplete)}/{len(profiles)} Profile ohne Vor-/Nachname",
                       details={"Betroffene IDs (Auszug)": incomplete[:5]},
                       fix_hint=(
                           "-- Profile ohne Namen finden:\n"
                           "SELECT id, email FROM public.profiles\n"
                           "WHERE first_name IS NULL OR last_name IS NULL;"
                       ))
    except Exception as e:
        add_result(check_id, label, "error", f"Fehler: {e}")


def check_secondbrain_suggestions_pending(supabase: Client):
    """Check for pending (unreviewed) SecondBrain link suggestions."""
    check_id = "sb_suggestions_pending"
    label = "SecondBrain – Ausstehende Vorschläge"
    try:
        resp = (
            supabase.table("sb_document_suggestions")
            .select("id,status", count="exact")
            .eq("status", "pending")
            .limit(1)
            .execute()
        )
        pending = resp.count or 0

        if pending == 0:
            add_result(check_id, label, "pass", "Keine ausstehenden KI-Vorschläge")
        elif pending <= 10:
            add_result(check_id, label, "warning",
                       f"{pending} ausstehende KI-Verknüpfungsvorschläge",
                       details={"Empfehlung": "In SecondBrain öffnen und Vorschläge bestätigen"})
        else:
            add_result(check_id, label, "warning",
                       f"{pending} ausstehende KI-Vorschläge – bitte prüfen",
                       details={"Empfehlung": "SecondBrain → Posteingang → Vorschläge bestätigen"})
    except Exception as e:
        add_result(check_id, label, "error", f"Fehler: {e}")


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Fintutto SSOT Consistency Checker")
    parser.add_argument("--json", action="store_true", help="Output results as JSON")
    parser.add_argument("--fix-hints", action="store_true", help="Show SQL fix hints for issues")
    args = parser.parse_args()

    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ Fehler: Supabase-Credentials nicht gefunden.")
        print("   Bitte setze VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY")
        print("   (oder SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY für vollen Zugriff)")
        sys.exit(1)

    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"❌ Verbindung zu Supabase fehlgeschlagen: {e}")
        sys.exit(1)

    if not args.json:
        print("╔══════════════════════════════════════════════════════╗")
        print("║   Fintutto SSOT Consistency Checker                  ║")
        print(f"║   {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}                          ║")
        print("╚══════════════════════════════════════════════════════╝")
        print(f"  Ziel: {SUPABASE_URL}\n")

    # ── Check 1: SSOT Coverage (core_contact_id) ──────────────────────────
    if not args.json:
        print("\n📋 CHECK 1: SSOT-Abdeckung (core_contact_id)")
        print("─" * 50)
    for t in CONTACT_TABLES:
        check_ssot_coverage(supabase, t["table"], t["label"], "core_contact_id")

    # ── Check 2: SSOT Coverage (core_address_id) ──────────────────────────
    if not args.json:
        print("\n📋 CHECK 2: SSOT-Abdeckung (core_address_id)")
        print("─" * 50)
    for t in ADDRESS_TABLES:
        check_ssot_coverage(supabase, t["table"], t["label"], "core_address_id")

    # ── Check 3: Orphaned References ──────────────────────────────────────
    if not args.json:
        print("\n📋 CHECK 3: Verwaiste Referenzen")
        print("─" * 50)
    for t in CONTACT_TABLES:
        check_orphaned_references(supabase, t["table"], t["label"],
                                   "core_contact_id", "core_contacts")
    for t in ADDRESS_TABLES:
        check_orphaned_references(supabase, t["table"], t["label"],
                                   "core_address_id", "core_addresses")

    # ── Check 4: Duplicate Contacts ───────────────────────────────────────
    if not args.json:
        print("\n📋 CHECK 4: Duplikate in Core Contacts")
        print("─" * 50)
    check_duplicate_contacts(supabase)

    # ── Check 5: Address Completeness ─────────────────────────────────────
    if not args.json:
        print("\n📋 CHECK 5: Adress-Vollständigkeit")
        print("─" * 50)
    check_address_completeness(supabase)

    # ── Check 6: SecondBrain Link Integrity ───────────────────────────────
    if not args.json:
        print("\n📋 CHECK 6: SecondBrain – Link-Integrität")
        print("─" * 50)
    check_secondbrain_link_integrity(supabase)

    # ── Check 7: SecondBrain Pending Suggestions ──────────────────────────
    if not args.json:
        print("\n📋 CHECK 7: SecondBrain – Ausstehende Vorschläge")
        print("─" * 50)
    check_secondbrain_suggestions_pending(supabase)

    # ── Check 8: Profile Completeness ─────────────────────────────────────
    if not args.json:
        print("\n📋 CHECK 8: Nutzerprofile – Vollständigkeit")
        print("─" * 50)
    check_profile_completeness(supabase)

    # ── Summary ───────────────────────────────────────────────────────────
    s = results["summary"]

    if args.json:
        print(json.dumps(results, indent=2, ensure_ascii=False))
        sys.exit(0 if s["errors"] == 0 else 1)

    print("\n" + "═" * 52)
    print("  ZUSAMMENFASSUNG")
    print("═" * 52)
    print(f"  Gesamt:    {s['total']} Checks")
    print(f"  ✅ OK:      {s['passed']}")
    print(f"  ⚠️  Warnungen: {s['warnings']}")
    print(f"  ❌ Fehler:  {s['errors']}")
    print(f"  ⏭️  Übersprungen: {s['skipped']}")
    print("═" * 52)

    if args.fix_hints and (s["warnings"] > 0 or s["errors"] > 0):
        print("\n💡 SQL-FIXES FÜR GEFUNDENE PROBLEME")
        print("─" * 52)
        for check in results["checks"]:
            if check["status"] in ("warning", "error") and check.get("fix_hint"):
                print(f"\n-- [{check['label']}]")
                print(check["fix_hint"])

    if s["errors"] > 0:
        print("\n❌ Konsistenzprüfung FEHLGESCHLAGEN – bitte Fehler beheben.")
        sys.exit(1)
    elif s["warnings"] > 0:
        print("\n⚠️  Konsistenzprüfung mit Warnungen abgeschlossen.")
        sys.exit(0)
    else:
        print("\n✅ Alle Checks bestanden – Daten sind konsistent!")
        sys.exit(0)


if __name__ == "__main__":
    main()
