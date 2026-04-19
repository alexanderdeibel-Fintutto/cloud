# Lückenanalyse & Offene Punkte im Fintutto Portal-Repository

Nach der erfolgreichen Integration des zentralen Aktivitäts-Trackings in alle 14 Supabase-fähigen Apps habe ich das gesamte Repository auf fehlende Integrationen, offene TODOs und architektonische Lücken analysiert.

Hier ist die vollständige Übersicht der noch fehlenden Dinge, priorisiert nach Wichtigkeit.

## 1. Kritische Datenbank- & Sicherheitslücken (Supabase)

Die größte aktuelle Lücke betrifft die **Row Level Security (RLS)** in der Datenbank. Mehrere Kern-Tabellen wurden ohne Sicherheitsrichtlinien angelegt, was bedeutet, dass sie entweder für niemanden zugänglich sind (wenn RLS aktiviert aber keine Policy vorhanden ist) oder für alle lesbar/schreibbar sind (wenn RLS nicht aktiviert ist).

Folgende Migrationen haben Tabellen erstellt, aber **kein RLS aktiviert**:
- `004_create_property_tables.sql` (7 Tabellen: `profiles`, `properties`, `units`, `tenants`, `rental_contracts`, `payments`, `documents`)
- `005_create_meter_and_maintenance_tables.sql` (4 Tabellen: `meters`, `meter_readings`, `maintenance_requests`, `tasks`)
- `006_create_bescheidboxer_tables.sql` (2 Tabellen: `tax_notices`, `tax_notice_checks`)

*Hinweis: Einige dieser Policies wurden in späteren Migrationen (z.B. `007_rls_policies.sql`) nachgereicht, aber die Vollständigkeit muss dringend für alle 13 Tabellen verifiziert werden, insbesondere für die neuen Bescheidboxer-Tabellen.*

## 2. Fehlende App-Integrationen im AMS Growth Dashboard

Obwohl alle 14 Apps jetzt ihre Aktivitäten in die `user_activity_log` Tabelle schreiben, werden einige der neuen Apps im **AMS Growth Dashboard** noch nicht visuell unterschieden.

In `apps/ams/src/pages/GrowthDashboard.tsx` fehlen in den Mapping-Objekten (`appColorMap` und `appLabelMap`) noch folgende Apps:
- `ablesung`
- `fintutto-portal`
- `translator`
- `vermieter-portal`
- ~~`vermieterportal`~~ ✅ entfernt (konsolidiert in `vermieter-portal`)

**Auswirkung:** Die Daten dieser Apps werden zwar aggregiert, erscheinen im Dashboard aber unter ihrem rohen ID-Namen und mit einer grauen Standardfarbe (`#94a3b8`), was die Lesbarkeit der Diagramme einschränkt.

## 3. Architektonische Lücken & "Stub"-Apps

Das Repository enthält 24 App-Ordner, von denen 10 sogenannte "Stub"-Apps sind. Diese haben noch keine echte React-Struktur (`src/` Ordner fehlt) und bestehen meist nur aus einem Layout und dem `GlobalAIChatButton.tsx`.

**Apps ohne echte Implementierung:**
- `admin-hub`
- `ai-guide` (enthält nur Architektur-Doku für iOS/Android)
- `betriebskosten-helfer`
- `financial-compass`
- `hausmeister`
- `leserally`
- `miet-check-pro`
- `miet-recht`
- `vermieter-freude`

**Doppelte Apps:**
✅ **Erledigt (19.04.2026):** `vermieterportal` wurde vollständig in `vermieter-portal` konsolidiert und aus dem Repo entfernt.

## 4. Wichtige offene TODOs im Code

Der Code-Scan hat mehrere kritische TODOs in den produktiven Apps zutage gefördert, die echte Funktionslücken darstellen:

### Arbeitslos-Portal
- **Account-Löschung:** In `ProfilPage.tsx` fehlt die Implementierung zur Löschung des eigenen Accounts (`// TODO: Implement account deletion`).
- **Forum-Speicherung:** In `ForumNewPostPage.tsx` und `ForumTopicPage.tsx` fehlt die Anbindung an Supabase (`// TODO: Save to Supabase`). Aktuell laufen diese Seiten nur mit Mock-Daten.

### Vermieter-Portal
- **Credits-System:** Im `CreditsContext.tsx` fehlen die Supabase-Queries zum Lesen und Aktualisieren der Nutzer-Credits (`// TODO: Replace with Supabase query`, `// TODO: Update in Supabase`).

### Vermietify
- **Mieter-Daten:** In `BuildingUnitsTab.tsx` werden die Mieterinformationen noch nicht aus den Mietverträgen geladen (`// TODO: Fetch tenant info from lease`).
- **Betriebskostenabrechnung:** Im Wizard (`StepSummary.tsx`) fehlen die Trigger für die PDF-Generierung und den E-Mail-Versand (`// TODO: If optionsGeneratePdf is true, trigger PDF generation edge function`).
- **Analytics-Export:** In `Analytics.tsx` fehlt die Export-Funktion für die Finanzdaten (`// TODO: Implement export`).

## 5. Fehlende SecondBrain-Integration

Gemäß den Projektrichtlinien soll `secondbrain` als zentraler Hub für alle Dokumente dienen. Aktuell haben Apps wie `vermietify` und `bescheidboxer` noch ihre eigenen, isolierten Dokumenten-Uploads. 

Die systemweite Integration, bei der ein in `secondbrain` hochgeladenes Dokument (z.B. eine Rechnung) direkt einem Objekt in `vermietify` oder einer Steuererklärung in `financial-compass` zugewiesen werden kann, ist architektonisch noch nicht umgesetzt.

## Zusammenfassung der nächsten Schritte

Wenn wir weiterarbeiten, empfehle ich folgende Priorisierung:

1. **Sicherheit:** RLS-Policies für alle Tabellen aus Migration 004-006 verifizieren und ggf. ergänzen.
2. **Sichtbarkeit:** Die 5 neuen Apps in die `appColorMap` und `appLabelMap` des AMS Growth Dashboards eintragen.
3. **Funktionalität:** Die Supabase-Speicherung für das Arbeitslos-Portal-Forum und das Credits-System im Vermieter-Portal implementieren.
4. ✅ ~~**Architektur:** Die doppelte Struktur von `vermieter-portal` und `vermieterportal` auflösen.~~ **Erledigt (19.04.2026)**
