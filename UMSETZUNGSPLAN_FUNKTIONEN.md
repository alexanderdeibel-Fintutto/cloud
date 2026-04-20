# Umsetzungsplan: Bereinigung und Funktionserweiterung

Basierend auf der Analyse der Codebasis wurde dieser detaillierte Plan zur Bereinigung der Stub-Apps und zur Implementierung der fehlenden Funktionen im Arbeitslos-Portal und in Vermietify erstellt.

## 1. Bereinigung der Stub-Apps

Das Repository enthält derzeit 10 Verzeichnisse, die keine echte React-Struktur (`src/`) aufweisen. Diese sogenannten "Stub"-Apps blähen das Repository auf und sollten bereinigt werden.

### Vorgehen
Die Stub-Apps werden nicht sofort gelöscht, sondern in ein dediziertes Planungs-Dokument überführt, um die Ideen und Konzepte für zukünftige Entwicklungen zu bewahren. Anschließend werden die Verzeichnisse aus dem aktiven Code-Baum entfernt.

### Betroffene Apps
Die folgenden Verzeichnisse werden in das Planungs-Dokument aufgenommen und anschließend gelöscht:
- `admin-hub`
- `ai-guide` (enthält derzeit nur Architektur-Dokumentation für iOS/Android)
- `betriebskosten-helfer`
- `financial-compass`
- `hausmeister`
- `leserally`
- `miet-check-pro`
- `miet-recht`
- `vermieter-freude`
- `_archive` (Dieses Verzeichnis enthält alte, nicht mehr genutzte Apps und kann komplett entfernt werden)

## 2. Implementierung fehlender Funktionen: Arbeitslos-Portal

Im Arbeitslos-Portal fehlt derzeit die Möglichkeit für Nutzer, ihren Account zu löschen.

### Account-Löschung (`ProfilPage.tsx`)
Die Funktion zur Account-Löschung muss in der `ProfilPage.tsx` implementiert werden.

**Schritte:**
1.  **Supabase Edge Function (Optional):** Da die Löschung eines Nutzers in Supabase administrative Rechte erfordert, muss geprüft werden, ob eine Edge Function für diesen Zweck existiert oder erstellt werden muss. Alternativ kann die Löschung über einen RPC-Call (Remote Procedure Call) erfolgen, sofern die RLS-Policies dies zulassen.
2.  **Frontend-Implementierung:** In der Funktion `handleDeleteAccount` in `ProfilPage.tsx` wird der Aufruf zur Löschung des Accounts integriert.
3.  **Feedback:** Nach erfolgreicher Löschung wird der Nutzer abgemeldet (`signOut`) und auf die Startseite weitergeleitet. Eine entsprechende Toast-Benachrichtigung informiert über den Erfolg.

## 3. Implementierung fehlender Funktionen: Vermietify

In Vermietify fehlen noch einige Verknüpfungen und Export-Funktionen.

### Mieter-Daten aus Mietverträgen laden (`BuildingUnitsTab.tsx`)
Derzeit wird in der Einheiten-Übersicht nur statisch "Mieter vorhanden" angezeigt, wenn der Status auf "rented" steht. Die tatsächlichen Mieter-Daten müssen aus der Datenbank geladen werden.

**Schritte:**
1.  **Datenbank-Abfrage:** Die bestehende Query für die Einheiten (`units`) muss so erweitert werden, dass sie über die Tabelle `rental_contracts` die zugehörigen Mieter (`tenants`) joint.
2.  **Frontend-Anpassung:** In der Spaltendefinition für "Mieter" in `BuildingUnitsTab.tsx` wird der Name des Mieters (z.B. `tenant.first_name` und `tenant.last_name`) angezeigt, sofern ein aktiver Mietvertrag existiert.

### PDF-Generierung und E-Mail-Versand (`StepSummary.tsx`)
Im Betriebskosten-Wizard fehlen die Trigger für die PDF-Generierung und den E-Mail-Versand.

**Schritte:**
1.  **Edge Functions:** Es muss geprüft werden, ob Edge Functions für die PDF-Generierung und den E-Mail-Versand existieren. Falls nicht, müssen diese erstellt werden.
2.  **Frontend-Integration:** In der Funktion `handleCreateStatement` in `StepSummary.tsx` werden die entsprechenden API-Aufrufe (z.B. `supabase.functions.invoke`) integriert, abhängig von den gewählten Optionen (`optionsGeneratePdf` und `optionsSendEmail`).

### Export-Funktion für Finanzdaten (`Analytics.tsx`)
Die Export-Funktion für die Finanzdaten im Analytics-Dashboard ist noch nicht implementiert.

**Schritte:**
1.  **Datenaufbereitung:** Die im Dashboard angezeigten Daten (Einnahmen, Ausgaben, etc.) müssen für den Export aufbereitet werden.
2.  **PDF-Export:** Für den PDF-Export kann eine Bibliothek wie `jspdf` oder `html2pdf` verwendet werden, um die Diagramme und Tabellen in ein PDF-Dokument zu konvertieren.
3.  **Excel-Export:** Für den Excel-Export kann eine Bibliothek wie `xlsx` verwendet werden, um die Rohdaten in eine Tabellenkalkulation zu exportieren.
4.  **Frontend-Integration:** Die Funktion `handleExport` in `Analytics.tsx` wird entsprechend implementiert, um den Download der generierten Dateien auszulösen.

---
*Erstellt am 19.04.2026*
