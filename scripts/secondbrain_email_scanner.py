#!/usr/bin/env python3
"""
SecondBrain Posteingangsscanner
================================
Scannt den Gmail-Posteingang nach E-Mails mit Anhängen und importiert
diese automatisch in SecondBrain (Supabase sb_documents + Storage).

Funktionsweise:
1. Sucht nach E-Mails mit Anhängen (PDF, Bilder, Dokumente)
2. Prüft ob die E-Mail bereits verarbeitet wurde (sb_email_scan_log)
3. Lädt Anhänge in Supabase Storage (secondbrain-documents Bucket)
4. Erstellt sb_documents-Einträge mit E-Mail-Metadaten
5. Triggert die analyze-and-suggest-links Edge Function für KI-Analyse
6. Markiert E-Mail mit Gmail-Label "SecondBrain/Importiert"

Ausführung:
  python3 secondbrain_email_scanner.py [--dry-run] [--max-emails 20]

Umgebungsvariablen:
  SECONDBRAIN_SCANNER_USER_ID  Supabase User-ID des Ziel-Accounts
"""

import os
import sys
import json
import argparse
import subprocess
import mimetypes
import tempfile
from datetime import datetime, timezone
from pathlib import Path

# ─── Konfiguration ────────────────────────────────────────────────────────────
SUPABASE_URL = "https://aaefocdqgdgexkcrjhks.supabase.co"
SERVICE_ROLE_KEY = os.environ.get(
    "SUPABASE_SERVICE_ROLE_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhZWZvY2RxZ2RnZXhrY3JqaGtzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODc2MDQ3MCwiZXhwIjoyMDg0MzM2NDcwfQ.cUzSAWSOXSkVkbXewXPaZS-CvdptCx5mE8kjXJnT6Ok"
)
STORAGE_BUCKET = "secondbrain-documents"
EDGE_FUNCTION_URL = f"{SUPABASE_URL}/functions/v1/analyze-and-suggest-links"
SCANNER_USER_ID = os.environ.get("SECONDBRAIN_SCANNER_USER_ID", "")
PROCESSED_LABEL = "SecondBrain/Importiert"

# Erlaubte MIME-Typen → SecondBrain file_type
ALLOWED_MIME_TYPES = {
    "application/pdf": "pdf",
    "image/jpeg": "image",
    "image/png": "image",
    "image/webp": "image",
    "image/heic": "image",
    "image/tiff": "image",
    "application/msword": "other",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "other",
    "text/plain": "text",
    "text/csv": "text",
    "application/vnd.ms-excel": "other",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "other",
}


# ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

def run_mcp_raw(tool_name: str, args: dict) -> tuple[dict, str]:
    """Führt ein Gmail-MCP-Tool aus. Gibt (result_dict, result_file_path) zurück."""
    input_json = json.dumps(args)
    proc = subprocess.run(
        ["manus-mcp-cli", "tool", "call", tool_name, "--server", "gmail",
         "--input", input_json],
        capture_output=True, text=True, timeout=60
    )
    # Ergebnis-Datei: steht auf der Zeile NACH "MCP tool invocation result saved to:"
    result_file = None
    lines = proc.stdout.split("\n")
    for i, line in enumerate(lines):
        if "MCP tool invocation result saved to:" in line:
            # Pfad kann auf derselben Zeile oder der nächsten Zeile stehen
            rest = line.split("saved to:")[-1].strip()
            if rest and os.path.exists(rest):
                result_file = rest
            elif i + 1 < len(lines):
                candidate = lines[i + 1].strip()
                if candidate and os.path.exists(candidate):
                    result_file = candidate
            break
    if result_file and os.path.exists(result_file):
        with open(result_file) as f:
            return json.load(f), result_file
    return {}, ""


def sb_get(path: str) -> list | dict:
    """Supabase REST GET-Request."""
    import requests
    resp = requests.get(
        f"{SUPABASE_URL}{path}",
        headers={"Authorization": f"Bearer {SERVICE_ROLE_KEY}", "apikey": SERVICE_ROLE_KEY},
        timeout=15
    )
    try:
        return resp.json()
    except Exception:
        return {}


def sb_post(path: str, data: dict) -> list | dict:
    """Supabase REST POST-Request."""
    import requests
    resp = requests.post(
        f"{SUPABASE_URL}{path}",
        headers={
            "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
            "apikey": SERVICE_ROLE_KEY,
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        },
        json=data, timeout=15
    )
    try:
        return resp.json()
    except Exception:
        return {}


def upload_to_storage(file_path: str, storage_path: str, mime_type: str) -> bool:
    """Lädt eine Datei in den Supabase Storage Bucket hoch."""
    import requests
    url = f"{SUPABASE_URL}/storage/v1/object/{STORAGE_BUCKET}/{storage_path}"
    headers = {
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "apikey": SERVICE_ROLE_KEY,
        "Content-Type": mime_type,
        "x-upsert": "true",
    }
    with open(file_path, "rb") as f:
        resp = requests.post(url, headers=headers, data=f, timeout=60)
    return resp.status_code in (200, 201)


def is_already_processed(gmail_message_id: str, user_id: str) -> bool:
    """Prüft ob eine E-Mail bereits verarbeitet wurde."""
    result = sb_get(
        f"/rest/v1/sb_email_scan_log"
        f"?gmail_message_id=eq.{gmail_message_id}&user_id=eq.{user_id}&select=id"
    )
    return isinstance(result, list) and len(result) > 0


def get_or_create_label(label_name: str) -> str | None:
    """Erstellt oder findet das Gmail-Label für verarbeitete E-Mails."""
    result, _ = run_mcp_raw("gmail_manage_labels", {"operation": "list"})
    labels = result.get("result", {}).get("labels", []) if isinstance(result, dict) else []
    for label in labels:
        if label.get("name") == label_name:
            return label.get("id")
    # Label erstellen
    create_result, _ = run_mcp_raw("gmail_manage_labels", {
        "operation": "create",
        "name": label_name,
        "label_list_visibility": "labelShow",
        "message_list_visibility": "show"
    })
    return (create_result.get("result") or {}).get("id")


def download_attachment(message_id: str, attachment_id: str, filename: str) -> str | None:
    """
    Lädt einen Anhang aus dem bereits heruntergeladenen gmail-attachments Verzeichnis.
    Falls nicht vorhanden, versucht es über den Thread-Abruf.
    """
    # Zuerst im lokalen Verzeichnis suchen
    local_path = f"/home/ubuntu/gmail-attachments/{message_id}/{filename}"
    if os.path.exists(local_path):
        return local_path
    
    # Alle Dateien im Verzeichnis suchen (Dateiname kann leicht abweichen)
    att_dir = f"/home/ubuntu/gmail-attachments/{message_id}"
    if os.path.exists(att_dir):
        for f in os.listdir(att_dir):
            if filename.lower() in f.lower() or f.lower() in filename.lower():
                return os.path.join(att_dir, f)
    
    return None


def trigger_ai_analysis(document_id: str, user_id: str) -> bool:
    """Triggert die KI-Analyse für ein neues Dokument."""
    import requests
    try:
        resp = requests.post(
            EDGE_FUNCTION_URL,
            headers={
                "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
                "Content-Type": "application/json",
            },
            json={"document_id": document_id, "user_id": user_id},
            timeout=30
        )
        return resp.status_code == 200
    except Exception as e:
        print(f"  ⚠️  KI-Analyse: {e}")
        return False


def parse_internal_date(ts_ms: str | int) -> str:
    """Konvertiert Gmail internalDate (ms seit Epoch) in ISO-8601-String."""
    try:
        ts = int(ts_ms) / 1000
        return datetime.fromtimestamp(ts, tz=timezone.utc).isoformat()
    except Exception:
        return datetime.now(timezone.utc).isoformat()


# ─── Kern-Verarbeitungslogik ──────────────────────────────────────────────────

def process_message(msg: dict, user_id: str, label_id: str | None, dry_run: bool) -> int:
    """
    Verarbeitet eine einzelne Gmail-Nachricht.
    Gibt die Anzahl erstellter Dokumente zurück.
    """
    # Metadaten aus pickedHeaders und pickedAttachments
    headers = msg.get("pickedHeaders", {})
    subject = headers.get("subject", "Kein Betreff")
    sender = headers.get("from", "")
    message_id = msg.get("id", msg.get("threadId", ""))
    thread_id = msg.get("threadId", message_id)
    date_iso = parse_internal_date(msg.get("internalDate", 0))
    attachments = msg.get("pickedAttachments", [])

    print(f"\n  📧 {subject}")
    print(f"     Von: {sender}")
    print(f"     Datum: {date_iso[:10]}")
    print(f"     Anhänge: {len(attachments)}")

    if not attachments:
        print("     ⏭️  Keine Anhänge")
        return 0

    # Duplikat-Prüfung
    if is_already_processed(message_id, user_id):
        print("     ✅ Bereits importiert — übersprungen")
        return 0

    documents_created = 0

    for att in attachments:
        filename = att.get("filename", "")
        mime_type = att.get("mimeType", "application/octet-stream")
        att_id = att.get("attachmentId", "")
        file_size = att.get("size", 0)

        # Nur erlaubte Dateitypen
        if mime_type not in ALLOWED_MIME_TYPES:
            print(f"     ⏭️  Übersprungen ({mime_type}): {filename}")
            continue

        file_type = ALLOWED_MIME_TYPES[mime_type]

        # Lokale Datei finden
        local_path = download_attachment(message_id, att_id, filename)
        if not local_path:
            print(f"     ⚠️  Datei nicht gefunden: {filename}")
            continue

        # Storage-Pfad
        date_prefix = datetime.now().strftime("%Y-%m")
        safe_name = filename.replace(" ", "_").replace("/", "_")
        storage_path = f"{user_id}/email/{date_prefix}/{message_id[:8]}_{safe_name}"
        title = f"{subject} — {filename}"

        print(f"     📎 {filename} ({file_size // 1024} KB)")

        if dry_run:
            print(f"     🔍 [DRY-RUN] → {storage_path}")
            documents_created += 1
            continue

        # Upload
        print(f"     ⬆️  Upload...")
        if not upload_to_storage(local_path, storage_path, mime_type):
            print(f"     ❌ Upload fehlgeschlagen")
            continue

        # sb_documents-Eintrag
        doc_result = sb_post("/rest/v1/sb_documents", {
            "user_id": user_id,
            "title": title,
            "file_name": filename,
            "file_type": file_type,
            "file_size": file_size,
            "mime_type": mime_type,
            "storage_path": storage_path,
            "source": "email",
            "email_message_id": message_id,
            "email_thread_id": thread_id,
            "email_from": sender,
            "email_subject": subject,
            "email_date": date_iso,
            "ocr_status": "pending",
            "tags": ["email-import", "posteingang"],
            "category": "Posteingang",
        })

        if isinstance(doc_result, list) and doc_result:
            doc_id = doc_result[0].get("id", "")
            print(f"     ✅ Dokument: {doc_id[:8]}...")
            documents_created += 1
            if doc_id:
                trigger_ai_analysis(doc_id, user_id)
        else:
            print(f"     ❌ Fehler: {str(doc_result)[:100]}")

    # Scan-Log
    if not dry_run:
        sb_post("/rest/v1/sb_email_scan_log", {
            "user_id": user_id,
            "gmail_message_id": message_id,
            "gmail_thread_id": thread_id,
            "subject": subject,
            "sender": sender,
            "received_at": date_iso,
            "documents_created": documents_created,
            "status": "processed" if documents_created > 0 else "skipped",
        })
        # Gmail-Label setzen
        if label_id and documents_created > 0:
            run_mcp_raw("gmail_manage_labels", {
                "operation": "apply",
                "label_id": label_id,
                "message_ids": [message_id]
            })

    return documents_created


# ─── Hauptfunktion ────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="SecondBrain Posteingangsscanner")
    parser.add_argument("--dry-run", action="store_true", help="Keine Änderungen vornehmen")
    parser.add_argument("--max-emails", type=int, default=20)
    parser.add_argument("--query", type=str,
                        default="in:inbox has:attachment -label:SecondBrain/Importiert")
    parser.add_argument("--user-id", type=str, default="")
    args = parser.parse_args()

    print("=" * 60)
    print("🧠 SecondBrain Posteingangsscanner")
    print(f"   Datum:  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"   Modus:  {'DRY-RUN' if args.dry_run else 'LIVE'}")
    print(f"   Limit:  {args.max_emails} E-Mails")
    print("=" * 60)

    # User-ID
    user_id = args.user_id or SCANNER_USER_ID
    if not user_id:
        result = sb_get("/auth/v1/admin/users?per_page=1")
        users = result.get("users", []) if isinstance(result, dict) else []
        if users:
            user_id = users[0]["id"]
    if not user_id:
        print("❌ Keine User-ID. Bitte SECONDBRAIN_SCANNER_USER_ID setzen.")
        sys.exit(1)
    print(f"\n👤 User: {user_id[:8]}...")

    # Gmail-Label
    label_id = None
    if not args.dry_run:
        print(f"🏷️  Label: {PROCESSED_LABEL}")
        label_id = get_or_create_label(PROCESSED_LABEL)
        print(f"   ID: {label_id or 'nicht erstellt'}")

    # E-Mails suchen (gmail_search_messages gibt Thread-IDs zurück,
    # dann gmail_read_threads für vollständige Nachrichten)
    print(f"\n🔍 Suche: {args.query}")
    search_result, _ = run_mcp_raw("gmail_search_messages", {
        "q": args.query,
        "max_results": args.max_emails
    })

    # Thread-IDs aus dem Suchergebnis extrahieren
    threads_raw = []
    if isinstance(search_result, dict):
        result_data = search_result.get("result", {})
        if isinstance(result_data, dict):
            threads_raw = result_data.get("threads", [])
        elif isinstance(result_data, list):
            threads_raw = result_data

    thread_ids = [t["id"] for t in threads_raw if isinstance(t, dict) and "id" in t]
    print(f"   {len(thread_ids)} Threads gefunden")

    if not thread_ids:
        print("   Keine E-Mails mit Anhängen im Posteingang.")
        print("\n✅ Scan abgeschlossen — nichts zu tun.")
        return 0

    # Vollständige Thread-Daten abrufen (Anhänge + Header)
    print(f"\n📥 Lade Thread-Details...")
    threads_result, _ = run_mcp_raw("gmail_read_threads", {
        "thread_ids": thread_ids[:min(len(thread_ids), 100)],
        "include_full_messages": True
    })

    # Nachrichten aus Threads extrahieren
    all_messages = []
    if isinstance(threads_result, dict):
        result_data = threads_result.get("result", {})
        if isinstance(result_data, dict):
            for thread in result_data.get("threads", []):
                msgs = thread.get("messages", [])
                if msgs:
                    all_messages.append(msgs[-1])  # Letzte Nachricht im Thread
        elif isinstance(result_data, list):
            for thread in result_data:
                msgs = thread.get("messages", [])
                if msgs:
                    all_messages.append(msgs[-1])

    print(f"   {len(all_messages)} Nachrichten geladen")

    # Verarbeiten
    total_docs = 0
    processed = 0
    skipped = 0

    for msg in all_messages:
        docs = process_message(msg, user_id, label_id, dry_run=args.dry_run)
        total_docs += docs
        if docs > 0:
            processed += 1
        else:
            skipped += 1

    # Zusammenfassung
    print("\n" + "=" * 60)
    print("📊 Zusammenfassung")
    print(f"   E-Mails verarbeitet:  {processed}")
    print(f"   E-Mails übersprungen: {skipped}")
    print(f"   Dokumente importiert: {total_docs}")
    if args.dry_run:
        print("   ℹ️  DRY-RUN — keine Änderungen vorgenommen")
    print("=" * 60)

    return total_docs


if __name__ == "__main__":
    main()
