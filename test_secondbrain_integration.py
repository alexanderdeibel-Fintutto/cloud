import os
import sys
import json
import time
import uuid
from supabase import create_client, Client

# Supabase Config aus Umgebungsvariablen oder Hardcoded für den Test
SUPABASE_URL = "https://aaefocqdgdgexkcrjhks.supabase.co"
SUPABASE_KEY = os.environ.get("SB_KEY")

if not SUPABASE_KEY:
    print("Fehler: SB_KEY Umgebungsvariable nicht gesetzt.")
    print("Bitte ausführen mit: SB_KEY='<service_role_key>' python3 test_secondbrain_integration.py")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def print_step(msg):
    print(f"\n\033[1;34m=== {msg} ===\033[0m")

def print_success(msg):
    print(f"\033[1;32m✅ {msg}\033[0m")

def print_error(msg):
    print(f"\033[1;31m❌ {msg}\033[0m")

def run_tests():
    print_step("Starte SecondBrain Integrations-Tests")
    
    # 1. Test-User erstellen/holen
    test_user_id = "00000000-0000-0000-0000-000000000000" # Fallback
    try:
        # Wir versuchen einen echten User zu finden, um RLS zu testen
        users_res = supabase.auth.admin.list_users()
        if users_res and len(users_res.users) > 0:
            test_user_id = users_res.users[0].id
            print_success(f"Test-User gefunden: {test_user_id}")
    except Exception as e:
        print(f"Konnte keinen User abrufen, verwende Dummy-ID. ({e})")

    # 2. Test-Dokument in SecondBrain anlegen
    print_step("Test 1: Dokument in SecondBrain anlegen")
    doc_id = str(uuid.uuid4())
    try:
        doc_res = supabase.table("sb_documents").insert({
            "id": doc_id,
            "user_id": test_user_id,
            "title": "Test Rechnung 2026",
            "file_name": "rechnung_test.pdf",
            "file_type": "pdf",
            "category": "finance",
            "ocr_text": "Dies ist ein Testdokument für die Vermietify Integration.",
            "summary": "Test-Zusammenfassung"
        }).execute()
        print_success(f"Dokument angelegt: {doc_id}")
    except Exception as e:
        print_error(f"Fehler beim Anlegen des Dokuments: {e}")
        return

    # 3. Test-Gebäude in Vermietify anlegen (falls Tabelle existiert)
    print_step("Test 2: Test-Entität (Gebäude) anlegen")
    building_id = str(uuid.uuid4())
    try:
        # Wir prüfen ob die buildings Tabelle existiert
        b_res = supabase.table("buildings").insert({
            "id": building_id,
            "name": "Testgebäude Integration",
            "street": "Teststraße 1",
            "city": "Teststadt"
        }).execute()
        print_success(f"Gebäude angelegt: {building_id}")
    except Exception as e:
        print(f"Hinweis: Konnte kein Gebäude anlegen (Tabelle existiert evtl. nicht oder RLS blockiert). Wir testen die Verknüpfung trotzdem mit der Dummy-ID. ({e})")

    # 4. Cross-App-Link erstellen
    print_step("Test 3: Cross-App-Link erstellen (SecondBrain -> Vermietify)")
    try:
        link_res = supabase.table("sb_document_entity_links").insert({
            "document_id": doc_id,
            "entity_type": "building",
            "entity_id": building_id,
            "entity_label": "Testgebäude Integration",
            "app_source": "test_script"
        }).execute()
        print_success("Verknüpfung erfolgreich erstellt")
    except Exception as e:
        print_error(f"Fehler bei der Verknüpfung: {e}")

    # 5. View abfragen (v_building_documents)
    print_step("Test 4: View v_building_documents abfragen")
    try:
        view_res = supabase.table("v_building_documents").select("*").eq("building_id", building_id).execute()
        if len(view_res.data) > 0:
            print_success(f"View liefert Daten! Gefundenes Dokument: {view_res.data[0]['title']}")
        else:
            print_error("View liefert keine Daten. (Evtl. RLS Problem beim View-Zugriff mit Service-Key)")
    except Exception as e:
        print_error(f"Fehler beim Abfragen der View: {e}")

    # 6. RPC testen (get_documents_for_entity)
    print_step("Test 5: RPC get_documents_for_entity testen")
    try:
        # RPC nutzt auth.uid(), was beim Service-Key null ist. Wir testen ob die RPC existiert.
        rpc_res = supabase.rpc("get_documents_for_entity", {
            "p_entity_type": "building",
            "p_entity_id": building_id
        }).execute()
        print_success("RPC Aufruf erfolgreich (Ergebnis kann leer sein wegen auth.uid() = null)")
    except Exception as e:
        print_error(f"Fehler beim RPC Aufruf: {e}")

    # 7. Aufräumen
    print_step("Test 6: Cleanup")
    try:
        supabase.table("sb_documents").delete().eq("id", doc_id).execute()
        supabase.table("buildings").delete().eq("id", building_id).execute()
        print_success("Testdaten erfolgreich gelöscht")
    except Exception as e:
        print(f"Fehler beim Aufräumen: {e}")

    print_step("Alle Tests abgeschlossen!")

if __name__ == "__main__":
    run_tests()
