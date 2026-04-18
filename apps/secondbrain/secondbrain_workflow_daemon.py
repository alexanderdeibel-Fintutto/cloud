#!/usr/bin/env python3
"""
SecondBrain Eingehende-Post-Workflow Daemon
===========================================
Dieses Skript automatisiert den Workflow für eingehende Post im Fintutto-Ökosystem.
Es pollt regelmäßig die Supabase-Datenbank nach neuen Dokumenten, die noch nicht
analysiert wurden (ocr_status = 'completed', aber noch keine ai_summary oder document_type),
führt die KI-Analyse durch und speichert Verknüpfungsvorschläge in der Datenbank.

Voraussetzungen:
- pip install supabase openai python-dotenv
- .env Datei mit SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY und OPENAI_API_KEY
"""

import os
import time
import json
import logging
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client
from openai import OpenAI

# ── Konfiguration & Logging ───────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('/home/ubuntu/secondbrain_daemon.log')
    ]
)
logger = logging.getLogger(__name__)

load_dotenv('/home/ubuntu/portal/apps/fintutto-biz/.env')  # Nutze die bestehende .env

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.error("Supabase Credentials fehlen in der Umgebung!")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
openai_client = OpenAI(api_key=OPENAI_API_KEY)

POLL_INTERVAL_SECONDS = 60  # Jede Minute nach neuen Dokumenten suchen

# ── Prompts ───────────────────────────────────────────────────────────────────
DOC_TYPE_SYSTEM_PROMPT = """Du bist ein Experte für deutsche Geschäftsdokumente.
Analysiere das Dokument und antworte NUR mit einem JSON-Objekt:
{
  "document_type": "rechnung" | "nebenkostenabrechnung" | "kontoauszug" | "mietvertrag" | "steuerbescheid" | "sonstiges",
  "confidence": 0-100,
  "summary": "Kurze Zusammenfassung in einem Satz",
  "key_data": {
    "betrag": null oder Zahl,
    "datum": null oder "YYYY-MM-DD",
    "absender": null oder String,
    "empfaenger": null oder String
  },
  "steuerlich_relevant": true | false,
  "steuerliche_kategorie": null oder "Betriebsausgabe" | "Einnahme" | "Sonstiges"
}"""

ENTITY_SYSTEM_PROMPT = """Du bist ein Experte für die Analyse von deutschen Immobilien-, Finanz- und Versorgerdokumenten.
Deine Aufgabe: Extrahiere aus dem Dokumenttext alle Entitäten, die auf konkrete Objekte in einer Immobilienverwaltungssoftware hinweisen könnten.
Erkenne folgende Entitätstypen:
1. GEBÄUDE (building): Vollständige Adressen (Straße + Hausnummer + PLZ + Ort)
2. FIRMA (business): Firmenname, GmbH, AG, KG, Einzelunternehmen, Vermieter-Firmen
3. MIETER (tenant): Personennamen als Mieter, Pächter, Vertragspartner
4. ZÄHLER (meter): Zählernummern (typisch: 8-12 stellige Nummern), Zählertypen (Strom, Gas, Wasser)

Antworte AUSSCHLIESSLICH mit einem JSON-Array. Kein Text davor oder danach.
Format:
[
  {
    "entity_type": "building" | "business" | "tenant" | "meter",
    "name": "Hauptstraße 12, 10115 Berlin",
    "address": "Hauptstraße 12, 10115 Berlin",
    "confidence": 0.92,
    "reason": "Vollständige Lieferadresse im Briefkopf"
  }
]
Confidence-Werte: 0.9+ = sehr sicher, 0.7-0.9 = wahrscheinlich, 0.5-0.7 = möglich, <0.5 = weglassen"""

# ── Funktionen ────────────────────────────────────────────────────────────────

def get_pending_documents():
    """Holt Dokumente, die OCR-verarbeitet, aber noch nicht KI-analysiert wurden."""
    try:
        # Wir suchen nach Dokumenten, die noch keine ai_summary haben
        # In einer echten Umgebung würde man auch ocr_status = 'completed' prüfen,
        # aber für die Robustheit prüfen wir nur auf fehlende ai_summary und vorhandenen ocr_text
        response = supabase.table("sb_documents") \
            .select("id, user_id, title, file_name, ocr_text") \
            .is_("ai_summary", "null") \
            .not_.is_("ocr_text", "null") \
            .limit(10) \
            .execute()
        return response.data
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Dokumente: {e}")
        return []

def analyze_document_type(doc: dict) -> dict:
    """Schritt 1: Dokumenttyp und Zusammenfassung generieren."""
    text = f"Titel: {doc.get('title', '')}\nDateiname: {doc.get('file_name', '')}\n\n{doc.get('ocr_text', '')}"
    
    try:
        resp = openai_client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": DOC_TYPE_SYSTEM_PROMPT},
                {"role": "user", "content": f"Analysiere dieses Dokument:\n\n{text[:8000]}"} # Limit für Token
            ],
            temperature=0,
            response_format={"type": "json_object"},
        )
        return json.loads(resp.choices[0].message.content)
    except Exception as e:
        logger.error(f"Fehler bei der Dokumenttyp-Analyse für {doc['id']}: {e}")
        return {"document_type": "other", "summary": "Analyse fehlgeschlagen"}

def extract_entities(doc: dict, summary: str) -> list:
    """Schritt 2: Entitäten aus dem Text extrahieren."""
    text = f"Titel: {doc.get('title', '')}\nZusammenfassung: {summary}\n\n{doc.get('ocr_text', '')}"
    
    try:
        resp = openai_client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": ENTITY_SYSTEM_PROMPT},
                {"role": "user", "content": text[:8000]}
            ],
            temperature=0,
        )
        raw = resp.choices[0].message.content.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()
        return json.loads(raw)
    except Exception as e:
        logger.error(f"Fehler bei der Entitätsextraktion für {doc['id']}: {e}")
        return []

def match_entities_in_db(candidates: list, user_id: str) -> list:
    """Schritt 3: Erkannte Entitäten mit der Datenbank abgleichen."""
    suggestions = []
    
    for c in candidates:
        etype = c.get("entity_type")
        matched_ids = []
        
        try:
            if etype == "building":
                addr = c.get("address", c.get("name", ""))
                street = addr.split(",")[0].strip().split(" ")[0] # Sehr vereinfacht
                res = supabase.table("buildings").select("id").eq("user_id", user_id).ilike("street", f"%{street}%").execute()
                matched_ids = [b["id"] for b in res.data]
                
            elif etype == "business":
                name = c.get("name", "")[:15]
                res = supabase.table("biz_clients").select("id").eq("user_id", user_id).ilike("name", f"%{name}%").execute()
                matched_ids = [b["id"] for b in res.data]
                
            elif etype == "tenant":
                name = c.get("name", "").strip().split()
                if name:
                    last_name = name[-1]
                    res = supabase.table("tenants").select("id").eq("user_id", user_id).ilike("last_name", f"%{last_name}%").execute()
                    matched_ids = [t["id"] for t in res.data]
                    
            elif etype == "meter":
                mnum = c.get("meter_number", "")
                if mnum:
                    res = supabase.table("meters").select("id").ilike("meter_number", f"%{mnum}%").execute()
                    matched_ids = [m["id"] for m in res.data]
                    
            for eid in matched_ids:
                suggestions.append({
                    "entity_type": etype,
                    "entity_id": eid,
                    "confidence": c.get("confidence", 0.5),
                    "reason": c.get("reason", "Automatisch erkannt")
                })
                
        except Exception as e:
            logger.error(f"Fehler beim Matching von {etype} '{c.get('name')}': {e}")
            
    return suggestions

def process_document(doc: dict):
    """Verarbeitet ein einzelnes Dokument vollständig."""
    doc_id = doc["id"]
    user_id = doc["user_id"]
    logger.info(f"Verarbeite Dokument {doc_id} ({doc.get('title')})")
    
    # 1. Typ und Zusammenfassung
    analysis = analyze_document_type(doc)
    doc_type = analysis.get("document_type", "other")
    summary = analysis.get("summary", "")
    
    # 2. Entitäten extrahieren
    candidates = extract_entities(doc, summary)
    
    # 3. Mit DB abgleichen
    suggestions = match_entities_in_db(candidates, user_id)
    
    # 4. Ergebnisse in DB speichern
    try:
        # Dokument aktualisieren
        supabase.table("sb_documents").update({
            "document_type": doc_type,
            "summary": summary,
            "ai_summary": summary, # Fallback für ältere Schemata
            "updated_at": datetime.now().isoformat()
        }).eq("id", doc_id).execute()
        
        # Vorschläge speichern
        if suggestions:
            # Alte pending Vorschläge löschen
            supabase.table("sb_document_suggestions").delete() \
                .eq("document_id", doc_id).eq("status", "pending").execute()
                
            # Neue einfügen
            rows = []
            for s in suggestions:
                rows.append({
                    "document_id": doc_id,
                    "entity_type": s["entity_type"],
                    "entity_id": s["entity_id"],
                    "confidence": s["confidence"],
                    "reason": s["reason"],
                    "status": "pending"
                })
            
            if rows:
                supabase.table("sb_document_suggestions").insert(rows).execute()
                
        logger.info(f"Dokument {doc_id} erfolgreich verarbeitet. {len(suggestions)} Vorschläge generiert.")
        
    except Exception as e:
        logger.error(f"Fehler beim Speichern der Ergebnisse für {doc_id}: {e}")

# ── Hauptschleife ─────────────────────────────────────────────────────────────

def main():
    logger.info("SecondBrain Workflow Daemon gestartet.")
    logger.info(f"Polling-Intervall: {POLL_INTERVAL_SECONDS} Sekunden")
    
    while True:
        try:
            docs = get_pending_documents()
            if docs:
                logger.info(f"{len(docs)} neue Dokumente zur Verarbeitung gefunden.")
                for doc in docs:
                    process_document(doc)
            else:
                logger.debug("Keine neuen Dokumente gefunden.")
                
        except Exception as e:
            logger.error(f"Unerwarteter Fehler in der Hauptschleife: {e}")
            
        time.sleep(POLL_INTERVAL_SECONDS)

if __name__ == "__main__":
    main()
