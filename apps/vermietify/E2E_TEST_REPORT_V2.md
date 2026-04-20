# Vermietify E2E-Testbericht (Vollständiger Durchlauf)

**Datum:** 20. April 2026  
**Autor:** Manus AI  
**Projekt:** Fintutto Portal (Vermietify)  
**Fokus:** Stammdaten, Dokumenten-Upload (OCR), Transaktions-Zuordnung und Steuererklärung (Anlage V)

---

## 1. Zusammenfassung der Ergebnisse

Der vollständige End-to-End-Test der Vermietify-App wurde erfolgreich auf API-Ebene durchgeführt. Alle Kernprozesse von der Registrierung bis zur Steuererklärung konnten nach Behebung einiger Schema- und RLS-Probleme erfolgreich abgeschlossen werden.

| Phase | Bereich | Status | Tests |
|-------|---------|--------|-------|
| 1 | Schema-Analyse | ✅ PASS | - |
| 2 | Stammdaten (Gebäude, Einheiten, Mieter) | ✅ PASS | 15 / 15 |
| 3 | Dokumente (PDF/CSV) & OCR | ✅ PASS | 11 / 11 |
| 4 | Transaktionen & Zuordnung | ✅ PASS | 15 / 15 |
| 5 | Steuer-Kategorien (Anlage V) | ✅ PASS | 19 / 19 |
| **Gesamt** | | **✅ PASS** | **60 / 60** |

---

## 2. Detaillierte Testergebnisse

### Phase 2: Stammdaten & Onboarding
- **Benutzer & Organisation:** Test-User erfolgreich registriert und Organisation zugeordnet.
- **Gebäude & Einheiten:** Gebäude "Musterstraße 12" mit 4 Einheiten (EG-01, EG-02, OG1-01, OG1-02) erfolgreich angelegt.
- **Mieter & Verträge:** 2 Mieter (Anna Müller, Thomas Schmidt) angelegt und mit Mietverträgen (inkl. Kaltmiete, NK- und HK-Vorauszahlungen) verknüpft.
- **Bankkonten:** Girokonto und Instandhaltungsrücklage erfolgreich via FinAPI-Mock angelegt.

### Phase 3: Dokumente & OCR (Secondbrain Integration)
- **Storage:** PDF (Handwerkerrechnung) und CSV (Kontoauszug) erfolgreich in den `secondbrain-documents` Bucket hochgeladen.
  - *Fix:* Die RLS-Policy für `secondbrain-documents` verlangt, dass der Pfad mit der `user_id` beginnt (`{user_id}/vermietify/...`). Dies wurde im Upload-Prozess korrigiert.
- **OCR-Erkennung:** Rechnungsnummer (RE-2026-0042), Gesamtbetrag (470,05 EUR) und Lieferant wurden erfolgreich aus dem PDF extrahiert.
- **Dokumenten-Verknüpfung:** Das Dokument wurde erfolgreich in `sb_documents` (Secondbrain) und `documents` (Vermietify, verknüpft mit Gebäude und Einheit) angelegt.
  - *Fix:* Der `source`-Wert in `sb_documents` musste auf `upload` gesetzt werden, um den CHECK-Constraint zu erfüllen.

### Phase 4: Transaktionen & Zuordnung
- **CSV-Import:** 7 Transaktionen aus dem Kontoauszug erfolgreich importiert.
- **Mieteinnahmen:** 6 Mietzahlungen wurden automatisch anhand des Verwendungszwecks (MV-001/MV-002) und Namens den korrekten Mietern zugeordnet.
- **Ausgaben:** Ausgaben wurden erfolgreich dem Gebäude zugeordnet und kategorisiert (Strom → `utility`, Reparatur → `maintenance`, Versicherung → `insurance`).
- **Financial Transactions:** Die bereinigten Transaktionen wurden erfolgreich in `financial_transactions` angelegt.
  - *Architektur-Fix:* `financial_transactions.tenant_id` referenziert `user_profiles`, nicht `tenants`. Für Mieter-Zuordnungen wird nun ausschließlich `bank_transactions.matched_tenant_id` verwendet. `financial_transactions` werden für Ausgaben nur mit `building_id` und `unit_id` verknüpft.

### Phase 5: Steuer-Kategorien & Anlage V
- **Gap-Analyse:** Es fehlten entscheidende Felder für die vollständige Abbildung der Anlage V (Vermietung & Verpachtung).
- **Migration durchgeführt (`20260420120000_add_tax_fields_anlage_v.sql`):**
  - `buildings`: `afa_rate`, `afa_basis`, `land_value`, `building_value`, `afa_start_year`, `tax_number` hinzugefügt.
  - `financial_transactions` & `bank_transactions`: `tax_category`, `anlage_v_zeile`, `is_tax_deductible`, `vat_rate`, `vat_amount` hinzugefügt.
  - `tax_declarations`: Enum-Typen (`tax_form_type`, `tax_declaration_status`) angelegt und Spalten umgestellt.
  - `anlage_v_categories`: Neue Tabelle für das Mapping von Transaktions-Typen auf Anlage-V-Zeilen (z.B. `repair` → Zeile 47 Erhaltungsaufwand).
  - `v_anlage_v_summary`: Neue View zur automatischen Aggregation der Einnahmen und Werbungskosten pro Gebäude und Jahr.
- **Steuererklärung:** Eine `tax_declaration` (Anlage V) und ein `tax_document` (Draft) für das Jahr 2026 wurden erfolgreich mit den aggregierten Werten aus den Transaktionen angelegt (Einnahmen: 2.120,00 €, Werbungskosten: 2.405,10 €, Überschuss: -285,10 €).

---

## 3. Offene Punkte & Empfehlungen

1. **Frontend-Integration der Steuer-Felder:**
   - Die neuen Felder für die AfA-Berechnung (`afa_basis`, `land_value`, `building_value`) müssen im Gebäude-Formular im Frontend ergänzt werden.
   - Bei der Transaktions-Zuordnung sollte die `tax_category` (Anlage V Zeile) aus der neuen Tabelle `anlage_v_categories` auswählbar sein.

2. **Secondbrain-Integration im Frontend:**
   - Der Upload von Dokumenten in Vermietify muss zwingend in den `secondbrain-documents` Bucket unter dem Pfad `{user_id}/vermietify/...` erfolgen, damit die RLS-Policies greifen und die Dokumente im Secondbrain für OCR verfügbar sind.

3. **Tenant-Referenz in `financial_transactions`:**
   - Die Spalte `tenant_id` in `financial_transactions` referenziert aktuell `user_profiles`. Da Mieter in Vermietify in der Tabelle `tenants` liegen, sollte diese Spalte entweder umbenannt/geändert werden oder (wie aktuell implementiert) für Mieter-Zahlungen ignoriert werden, da die Zuordnung über `bank_transactions` erfolgt.
