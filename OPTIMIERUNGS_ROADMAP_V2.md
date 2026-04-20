# Priorisierte Optimierungs-Roadmap für das Fintutto Portal

Basierend auf einem vollständigen Scan der Codebasis (19 Apps, 4 Packages, 134 Migrationen) wurden folgende Optimierungspotenziale identifiziert. Die Liste ist nach Dringlichkeit und Impact (Kosten/Performance/Sicherheit) priorisiert.

## 1. Kritische Infrastruktur & Kosten (Sofort)

### 1.1 Vercel Deployment-Kosten senken (`ignoreCommand`)
Aktuell werden bei **jedem** Commit im Monorepo 5 Apps neu gebaut, auch wenn sich ihr Code nicht geändert hat. Das verschwendet massiv Vercel-Build-Minuten.
*   **Betroffene Apps:** `arbeitslos-portal`, `bescheidboxer`, `pflanzen-manager`, `hausmeister`, `landing`, `lernapp`, `mieter`, `widerspruch-jobcenter`
*   **Maßnahme:** Eine `vercel.json` mit folgendem `ignoreCommand` in alle betroffenen Apps einfügen: `npx ignore-step` (oder das Vercel-Standard-Skript für Turborepo/pnpm).

### 1.2 Fehlende Edge Functions implementieren
Im Code werden 11 Supabase Edge Functions aufgerufen, die im `supabase/functions/` Verzeichnis **nicht existieren**. Dies führt zu stillen Fehlern im Frontend.
*   **Fehlende Functions:** `amt-scan`, `analyze-receipt`, `get-ecosystem-prices`, `get-maps-key`, `google-maps`, `ocr-invoice`, `ocr-meter`, `ocr-meter-number`, `referral`, `secondbrain-chat`, `send-email`
*   **Maßnahme:** Entweder die Aufrufe im Frontend entfernen/auskommentieren oder die fehlenden Functions aus alten Repositories migrieren.

## 2. Datenbank-Performance & Sicherheit (Kurzfristig)

### 2.1 Fehlende Datenbank-Indizes anlegen
Von 173 Tabellen in Supabase haben **103 Tabellen keinen einzigen Index** (abgesehen vom Primary Key). Bei wachsenden Datenmengen wird dies zu massiven Performance-Einbrüchen bei Joins und Filterungen führen.
*   **Kritische Tabellen ohne Index:** `user_activity_log`, `operating_costs`, `operating_cost_items`, `handover_protocols`, `elster_submissions`, `finance_budgets`
*   **Maßnahme:** Eine neue Migration erstellen, die systematisch Indizes für alle Foreign Keys (`user_id`, `organization_id`, `property_id`, etc.) und häufig gefilterte Spalten (`created_at`, `status`) anlegt.

### 2.2 Doppelte Supabase-Clients konsolidieren
Viele Apps haben zwei Supabase-Client-Dateien (`supabase.ts` und `client.ts`), was zu Verwirrung und potenziellen Fehlern bei der Initialisierung führt.
*   **Betroffene Apps:** `ablesung`, `secondbrain`
*   **Maßnahme:** Auf einen einheitlichen Standard (`src/integrations/supabase/client.ts`) einigen und die Duplikate löschen.

## 3. Architektur & Code-Qualität (Mittelfristig)

### 3.1 Activity-Tracking standardisieren
Wir haben das `@fintutto/activity-logger` Package erstellt, aber **keine einzige App** nutzt es. Stattdessen haben 13 Apps eine eigene, kopierte `activityLogger.ts` Datei.
*   **Maßnahme:** Die lokale `activityLogger.ts` in allen 13 Apps löschen und stattdessen den Import aus dem Shared Package `@fintutto/activity-logger` nutzen.
*   **Fehlendes Tracking:** Die Apps `hausmeister`, `landing`, `lernapp`, `mieter` und `widerspruch-jobcenter` haben noch gar kein Activity-Tracking.

### 3.2 Code-Hygiene verbessern
Der Scan zeigt deutliche technische Schulden, die zu Laufzeitfehlern führen können:
*   **146 `console.log` Statements:** Sollten in Produktion entfernt oder durch einen echten Logger ersetzt werden.
*   **352 `any`-Typen:** Untergraben die Typsicherheit von TypeScript.
*   **32 fehlende Error Boundaries:** Führen dazu, dass die gesamte App abstürzt (White Screen), wenn eine einzelne Komponente einen Fehler wirft.
*   **6 leere `catch`-Blöcke:** Verschlucken Fehler stillschweigend.
*   **Maßnahme:** Einen ESLint-Lauf mit `--fix` durchführen und kritische Fehler (wie leere Catch-Blöcke) manuell beheben.

### 3.3 Test-Abdeckung erhöhen
Von 19 Apps haben nur 6 Apps überhaupt Test-Dateien (`.test.ts` oder `.spec.ts`).
*   **Maßnahme:** Für kritische Geschäftslogik (z.B. Nebenkostenabrechnung in Vermietify, Steuerberechnung im BescheidBoxer) Unit-Tests mit Vitest/Jest einführen.

## 4. Nächste Schritte (Empfehlung)

Ich empfehle, in dieser Reihenfolge vorzugehen:
1.  **Vercel-Kosten stoppen:** Die `ignoreCommand` Konfigurationen für die 8 betroffenen Apps ausrollen.
2.  **Performance sichern:** Die fehlenden Datenbank-Indizes für die 103 Tabellen in einer neuen Migration anlegen.
3.  **Architektur aufräumen:** Das Activity-Tracking auf das Shared Package umstellen und die fehlenden Edge Functions klären.

Soll ich direkt mit Punkt 1 (Vercel `ignoreCommand`) beginnen?
