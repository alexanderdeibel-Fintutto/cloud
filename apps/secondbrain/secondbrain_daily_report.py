#!/usr/bin/env python3
"""
SecondBrain Daily Report Generator
==================================
Erstellt einen täglichen Bericht über die verarbeiteten Dokumente
und Verknüpfungsvorschläge des SecondBrain Daemons.
"""

import os
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv
from supabase import create_client, Client

# ── Konfiguration ─────────────────────────────────────────────────────────────
load_dotenv('/home/ubuntu/portal/apps/fintutto-biz/.env')

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Fehler: Supabase Credentials fehlen!")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

REPORT_DIR = "/home/ubuntu/secondbrain_reports"
os.makedirs(REPORT_DIR, exist_ok=True)

# ── Bericht generieren ────────────────────────────────────────────────────────

def generate_report():
    today = datetime.now()
    yesterday = today - timedelta(days=1)
    date_str = yesterday.strftime("%Y-%m-%d")
    
    print(f"Generiere Bericht für {date_str}...")
    
    try:
        # 1. Verarbeitete Dokumente abrufen
        # Wir suchen nach Dokumenten, die gestern aktualisiert wurden und eine ai_summary haben
        docs_res = supabase.table("sb_documents") \
            .select("id, title, document_type, updated_at") \
            .gte("updated_at", yesterday.isoformat()) \
            .lt("updated_at", today.isoformat()) \
            .not_.is_("ai_summary", "null") \
            .execute()
            
        docs = docs_res.data
        
        # 2. Generierte Vorschläge abrufen
        sugg_res = supabase.table("sb_document_suggestions") \
            .select("id, entity_type, confidence, status, created_at") \
            .gte("created_at", yesterday.isoformat()) \
            .lt("created_at", today.isoformat()) \
            .execute()
            
        suggestions = sugg_res.data
        
        # 3. Statistiken berechnen
        doc_types = {}
        for d in docs:
            dtype = d.get("document_type", "other")
            doc_types[dtype] = doc_types.get(dtype, 0) + 1
            
        entity_types = {}
        for s in suggestions:
            etype = s.get("entity_type", "unknown")
            entity_types[etype] = entity_types.get(etype, 0) + 1
            
        # 4. Markdown-Bericht erstellen
        report_path = os.path.join(REPORT_DIR, f"SecondBrain_Report_{date_str}.md")
        
        with open(report_path, "w", encoding="utf-8") as f:
            f.write(f"# SecondBrain Tagesbericht: {date_str}\n\n")
            
            f.write("## Zusammenfassung\n")
            f.write(f"- **Verarbeitete Dokumente:** {len(docs)}\n")
            f.write(f"- **Generierte Verknüpfungsvorschläge:** {len(suggestions)}\n\n")
            
            f.write("## Dokumenttypen\n")
            if doc_types:
                for dtype, count in sorted(doc_types.items(), key=lambda x: x[1], reverse=True):
                    f.write(f"- {dtype.capitalize()}: {count}\n")
            else:
                f.write("- Keine Dokumente verarbeitet.\n")
            f.write("\n")
                
            f.write("## Erkannte Entitäten\n")
            if entity_types:
                for etype, count in sorted(entity_types.items(), key=lambda x: x[1], reverse=True):
                    f.write(f"- {etype.capitalize()}: {count}\n")
            else:
                f.write("- Keine Entitäten erkannt.\n")
            f.write("\n")
            
            f.write("## Details der verarbeiteten Dokumente\n")
            if docs:
                for d in docs:
                    f.write(f"- **{d.get('title', 'Ohne Titel')}** ({d.get('document_type', 'other')})\n")
            else:
                f.write("- Keine Details verfügbar.\n")
                
        print(f"Bericht erfolgreich erstellt: {report_path}")
        
    except Exception as e:
        print(f"Fehler bei der Berichtsgenerierung: {e}")

if __name__ == "__main__":
    generate_report()
