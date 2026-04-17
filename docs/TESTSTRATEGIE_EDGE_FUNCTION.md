# Teststrategie: Edge Function `analyze-and-suggest-links`

## Übersicht

Die Edge Function `analyze-and-suggest-links` analysiert OCR-Text aus SecondBrain-Dokumenten mit GPT-4.1 und speichert automatische Zuordnungsvorschläge zu Gebäuden, Firmen, Mietern und Zählern in `sb_document_suggestions`.

---

## Deployment (einmalig auf deinem Mac)

```bash
# Im Portal-Verzeichnis:
cd /path/to/portal

# Supabase CLI einloggen (falls noch nicht):
supabase login

# Projekt verknüpfen:
supabase link --project-ref aaefocdqgdgexkcrjhks

# Funktion deployen:
supabase functions deploy analyze-and-suggest-links --no-verify-jwt
```

Das ist der einzige Schritt, der Docker auf deinem Mac benötigt. Danach ist die Funktion dauerhaft live.

---

## Teststrategie: 6 Testszenarien

### T1 — Gebäude-Erkennung (Positiv-Test)

**Ziel:** GPT erkennt eine Adresse im OCR-Text und schlägt das korrekte Gebäude vor.

**Vorbedingung:** Gebäude `Kantstraße 12, 10623 Berlin` ist in der DB vorhanden.

**Testdokument:**
```sql
INSERT INTO sb_documents (id, user_id, title, ocr_text, source, ocr_status)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users LIMIT 1),
  'Nebenkostenabrechnung 2024',
  'Nebenkostenabrechnung für die Wohnung in der Kantstraße 12, 10623 Berlin.
   Abrechnungszeitraum: 01.01.2024 - 31.12.2024.
   Gesamtkosten: 2.450,00 EUR.',
  'upload',
  'completed'
) RETURNING id;
```

**Erwartetes Ergebnis:**
- HTTP 200
- `suggestions` enthält Eintrag mit `entity_type = 'building'`
- `confidence_score >= 0.7`
- `matched_text` enthält "Kantstraße 12"

---

### T2 — Firmen-Erkennung (Positiv-Test)

**Ziel:** GPT erkennt einen Firmennamen und schlägt den korrekten Client vor.

**Testdokument:**
```sql
INSERT INTO sb_documents (id, user_id, title, ocr_text, source, ocr_status)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users LIMIT 1),
  'Rechnung Gamma App',
  'Invoice from Gamma App GmbH
   Invoice #2004-2054
   Date: 2024-03-15
   Amount: $49.00
   For: Pro Plan subscription',
  'email',
  'completed'
) RETURNING id;
```

**Erwartetes Ergebnis:**
- `entity_type = 'business'`
- `matched_text` enthält "Gamma"
- `confidence_score >= 0.6`

---

### T3 — Mieter-Erkennung (Positiv-Test)

**Ziel:** GPT erkennt einen Mieternamen in einem Mietvertrag.

**Testdokument:**
```sql
INSERT INTO sb_documents (id, user_id, title, ocr_text, source, ocr_status)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users LIMIT 1),
  'Mietvertrag Müller',
  'MIETVERTRAG
   Vermieter: Alexander Deibel
   Mieter: Hans Müller, geboren 15.03.1985
   Mietobjekt: Kantstraße 12, Wohnung 3, 10623 Berlin
   Monatliche Miete: 1.200,00 EUR
   Mietbeginn: 01.04.2024',
  'upload',
  'completed'
) RETURNING id;
```

**Erwartetes Ergebnis:**
- Mindestens ein Eintrag mit `entity_type = 'tenant'`
- `matched_text` enthält "Müller" oder "Hans Müller"

---

### T4 — Zähler-Erkennung (Positiv-Test)

**Ziel:** GPT erkennt eine Zählernummer in einem Ableseprotokoll.

**Testdokument:**
```sql
INSERT INTO sb_documents (id, user_id, title, ocr_text, source, ocr_status)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users LIMIT 1),
  'Stromablesung Q1 2024',
  'Ableseprotokoll Stromzähler
   Zählernummer: SZ-2024-001
   Zählerstand: 12.450 kWh
   Ablesedatum: 31.03.2024
   Standort: Kantstraße 12, Keller',
  'upload',
  'completed'
) RETURNING id;
```

**Erwartetes Ergebnis:**
- `entity_type = 'meter'`
- `matched_text` enthält "SZ-2024-001"

---

### T5 — Kein OCR-Text (Negativ-Test)

**Ziel:** Funktion gibt saubere Fehlermeldung zurück wenn `ocr_text` NULL ist.

**Testdokument:**
```sql
INSERT INTO sb_documents (id, user_id, title, ocr_text, source, ocr_status)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users LIMIT 1),
  'Leeres Dokument',
  NULL,
  'upload',
  'pending'
) RETURNING id;
```

**Erwartetes Ergebnis:**
- HTTP 400
- `error` enthält "No OCR text available"
- Keine Einträge in `sb_document_suggestions`

---

### T6 — Ungültige Document-ID (Negativ-Test)

**Ziel:** Funktion gibt saubere Fehlermeldung zurück wenn Dokument nicht existiert.

**Request:**
```bash
curl -X POST https://aaefocdqgdgexkcrjhks.supabase.co/functions/v1/analyze-and-suggest-links \
  -H "Authorization: Bearer <service_role_key>" \
  -H "Content-Type: application/json" \
  -d '{"document_id": "00000000-0000-0000-0000-000000000000", "user_id": "00000000-0000-0000-0000-000000000001"}'
```

**Erwartetes Ergebnis:**
- HTTP 404
- `error` enthält "Document not found"

---

## Testausführung via SQL-Harness

Nach dem Deployment kann das vollständige Testharness im Supabase SQL-Editor ausgeführt werden:

```sql
-- Testdaten erstellen
DO $$
DECLARE
  v_user_id UUID;
  v_doc_building UUID;
  v_doc_business UUID;
  v_doc_empty UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;

  -- T1: Gebäude-Test
  INSERT INTO sb_documents (user_id, title, ocr_text, source, ocr_status)
  VALUES (v_user_id, 'TEST_T1_Gebäude', 
    'Nebenkostenabrechnung Kantstraße 12, 10623 Berlin. Betrag: 2.450 EUR.',
    'upload', 'completed')
  RETURNING id INTO v_doc_building;
  RAISE NOTICE 'T1 Doc-ID: %', v_doc_building;

  -- T5: Leer-Test
  INSERT INTO sb_documents (user_id, title, ocr_text, source, ocr_status)
  VALUES (v_user_id, 'TEST_T5_Leer', NULL, 'upload', 'pending')
  RETURNING id INTO v_doc_empty;
  RAISE NOTICE 'T5 Doc-ID: %', v_doc_empty;
END $$;
```

Dann die Funktion aufrufen:
```bash
# T1 — Gebäude-Erkennung:
curl -X POST https://aaefocdqgdgexkcrjhks.supabase.co/functions/v1/analyze-and-suggest-links \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{"document_id": "<v_doc_building>"}'

# Ergebnis prüfen:
# SELECT * FROM sb_document_suggestions WHERE document_id = '<v_doc_building>';
```

---

## Erwartete Gesamtergebnisse

| Test | Szenario | Erwartetes HTTP | Erwartete Suggestions |
|---|---|---|---|
| T1 | Gebäude-Adresse im Text | 200 | `building`, confidence ≥ 0.7 |
| T2 | Firmenname im Text | 200 | `business`, confidence ≥ 0.6 |
| T3 | Mietername im Text | 200 | `tenant`, confidence ≥ 0.5 |
| T4 | Zählernummer im Text | 200 | `meter`, confidence ≥ 0.8 |
| T5 | Kein OCR-Text | 400 | 0 Suggestions |
| T6 | Ungültige Doc-ID | 404 | 0 Suggestions |

---

## Monitoring nach Deployment

```sql
-- Alle Suggestions für ein Dokument anzeigen:
SELECT 
  entity_type,
  entity_id,
  confidence_score,
  matched_text,
  created_at
FROM sb_document_suggestions
WHERE document_id = '<doc_id>'
ORDER BY confidence_score DESC;

-- Statistik: Wie viele Dokumente haben Suggestions?
SELECT 
  COUNT(DISTINCT document_id) as docs_with_suggestions,
  COUNT(*) as total_suggestions,
  AVG(confidence_score) as avg_confidence,
  entity_type
FROM sb_document_suggestions
GROUP BY entity_type;
```
