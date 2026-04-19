# Roadmap: Nächste Optimierungsschritte für das Fintutto Portal

Basierend auf der umfassenden Codebasis-Analyse und der erfolgreichen Bereinigung von `vermieterportal` ergeben sich folgende priorisierte Handlungsfelder zur weiteren Stabilisierung und Optimierung des Repositories.

## 1. Vercel Deployment-Optimierung (Kritisch)

Einige produktive Apps haben noch keine optimierte Vercel-Konfiguration, was zu unnötigen Builds und Kosten führen kann, wenn Änderungen in anderen Monorepo-Teilen vorgenommen werden.

**Aktion:**
- `ignoreCommand` in der `vercel.json` für folgende Apps ergänzen:
  - `pflanzen-manager`
  - `ablesung`
  - `arbeitslos-portal`
  - `bescheidboxer`
  - `finance-coach`
- **Ziel:** Sicherstellen, dass Vercel-Builds nur getriggert werden, wenn sich Dateien im jeweiligen App-Verzeichnis oder in relevanten Shared-Packages ändern.

## 2. Bereinigung von "Stub"-Apps (Architektur)

Das Repository enthält derzeit 10 App-Verzeichnisse, die keine echte React-Struktur (`src/`-Ordner) aufweisen und als reine Platzhalter fungieren. Diese blähen das Repository auf und erschweren die Übersicht.

**Aktion:**
- Evaluierung der folgenden Stub-Apps auf ihre zukünftige Relevanz:
  - `admin-hub`
  - `ai-guide`
  - `betriebskosten-helfer`
  - `financial-compass`
  - `hausmeister`
  - `leserally`
  - `miet-check-pro`
  - `miet-recht`
  - `vermieter-freude`
  - `_archive` (kann ggf. komplett aus dem aktiven Repo entfernt und extern archiviert werden)
- **Ziel:** Nicht mehr benötigte Stubs löschen oder in ein dediziertes Planungs-Dokument überführen, um die Codebasis sauber zu halten.

## 3. Behebung kritischer TODOs in produktiven Apps (Funktionalität)

Der Code-Scan hat mehrere offene TODOs identifiziert, die echte Funktionslücken in bereits genutzten Apps darstellen.

**Aktion:**
- **Arbeitslos-Portal:**
  - Implementierung der Account-Löschung in `ProfilPage.tsx` (`// TODO: Implement account deletion`).
- **Vermietify:**
  - Mieter-Daten dynamisch aus Mietverträgen in `BuildingUnitsTab.tsx` laden (`// TODO: Fetch tenant info from lease`).
  - PDF-Generierung und E-Mail-Versand im Betriebskosten-Wizard (`StepSummary.tsx`) anbinden.
  - Export-Funktion für Finanzdaten in `Analytics.tsx` implementieren.
- **Ziel:** Schließen der funktionalen Lücken für ein vollständiges Nutzererlebnis.

## 4. Datenbank-Optimierung: Indizes (Performance)

Die Analyse der Supabase-Migrationen zeigt, dass für viele Tabellen noch keine expliziten Indizes (abgesehen von Primary Keys) angelegt wurden. Bei wachsender Datenmenge kann dies zu Performance-Einbußen führen.

**Aktion:**
- Erstellung einer neuen Migration zur Anlage von Indizes für häufig abgefragte Fremdschlüssel (Foreign Keys) und Filter-Spalten.
- **Fokus-Tabellen:** `user_activity_log` (Index auf `user_id` und `app_id`), `properties`, `rental_contracts`, `meters`.
- **Ziel:** Proaktive Sicherstellung der Datenbank-Performance.

## 5. Shared Packages Konsolidierung (Wartbarkeit)

Die Struktur der Shared Packages (`packages/`) sollte auf Konsistenz geprüft werden.

**Aktion:**
- Sicherstellen, dass alle Packages eine saubere `index.ts` als Entry-Point und eine korrekte `package.json` besitzen.
- Prüfung, ob weitere redundante Logik aus den Apps in Shared Packages ausgelagert werden kann (z.B. einheitliche UI-Komponenten, die aktuell noch pro App kopiert werden).
- **Ziel:** Erhöhung der Wiederverwendbarkeit und Reduzierung von Code-Duplikation.

---
*Erstellt am 19.04.2026 nach der Konsolidierung von vermieterportal.*
