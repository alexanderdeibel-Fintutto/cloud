# Shared Infrastructure Plan: Vermietify & Financial Compass

**Stand:** 25. März 2026
**Ziel:** Aufbau einer gemeinsamen, zentralen Infrastruktur für die beiden Kern-Apps `vermietify` und `fintutto-biz` (Financial Compass), um Entwicklungsaufwand zu minimieren und die Features von Wettbewerbern wie *sevdesk* zu übertreffen.

---

## 1. Ausgangslage & Benchmark (sevdesk)

**sevdesk** ist der Marktführer für einfache Buchhaltung in Deutschland. Die Kern-Features, die wir übertreffen müssen, sind:
1. **Belegerfassung:** KI-gestützter Upload (OCR), automatische Zuordnung.
2. **Banking:** Nahtlose Bankanbindung, automatischer Abgleich von Rechnungen/Belegen mit Transaktionen.
3. **Multi-Company:** Verwaltung mehrerer Firmen/Gewerbe in einem Account.
4. **Rechnungsstellung:** GoBD-konform, E-Rechnung (ZUGFeRD/XRechnung).

**Unser Vorteil:** Wir bauen nicht nur eine Buchhaltung (Financial Compass), sondern verknüpfen sie direkt mit der Immobilienverwaltung (Vermietify). Ein Vermieter, der gleichzeitig Freelancer ist und eine GmbH hat, kann alles in einem Ökosystem verwalten.

---

## 2. Die Shared Infrastructure (Was geteilt wird)

Aktuell liegen viele Funktionen isoliert in `apps/vermietify`. Diese müssen in das `packages/shared` Verzeichnis oder als zentrale Supabase-Module ausgelagert werden, damit `fintutto-biz` sie nutzen kann.

### 2.1 Banking & Transaktionen (FinAPI / GoCardless)
**Aktueller Stand:** `vermietify` hat bereits Tabellen (`finapi_connections`, `bank_accounts`, `bank_transactions`) und einen Hook (`useBanking.ts`).
**Ziel-Architektur:**
- **Zentrale Tabellen:** Die Tabellen bleiben in Supabase, aber die RLS-Policies müssen so angepasst werden, dass sie sowohl für `organization_id` (Vermietify) als auch für `business_id` (Financial Compass) funktionieren.
- **Shared Hook:** Ein neuer Hook in `packages/shared/src/hooks/useBanking.ts`, der je nach Kontext (App) die richtige ID mitgibt.
- **Matching-Engine:** Die Regel-Engine (`transaction_rules`) muss Transaktionen nicht nur Mietern (Vermietify), sondern auch Kunden/Rechnungen (Financial Compass) zuordnen können.

### 2.2 Dokumenten-Upload & OCR (KI-Belegerfassung)
**Aktueller Stand:** `vermietify` hat einen sehr guten `DocumentUploadDialog.tsx` mit OCR-Vorschau (`DocumentOCRPreview.tsx`) und den Hook `useDocuments.ts`.
**Ziel-Architektur:**
- **Shared UI-Komponenten:** Der Upload-Dialog und die OCR-Vorschau werden nach `packages/shared/src/components/documents/` verschoben.
- **Erweiterte Kategorien:** Die Kategorien müssen um Buchhaltungs-Typen erweitert werden (z.B. Bewirtungsbeleg, Reisekosten, Büromaterial).
- **Automatisierung:** Nach dem OCR-Scan in Financial Compass wird direkt ein Eintrag in der Tabelle `biz_expenses` angelegt.

### 2.3 Multi-Company & Authentication
**Aktueller Stand:** `fintutto-biz` hat gerade Multi-Company-Support bekommen (`biz_user_businesses`). `vermietify` nutzt `organizations`.
**Ziel-Architektur:**
- **Unified Identity:** Ein User loggt sich ein und sieht ein "Workspace-Switcher" Dropdown.
- Ein Workspace kann vom Typ `real_estate` (öffnet Vermietify) oder `business` (öffnet Financial Compass) sein.
- Dies erfordert eine Konsolidierung der Tabellen `organizations` und `biz_user_businesses` zu einer zentralen `workspaces` Tabelle in der Zukunft (vorerst können sie parallel existieren, aber das UI sollte es als eins behandeln).

---

## 3. Umsetzungsschritte (Roadmap)

### Schritt 1: Das `shared` Package ausbauen
1. Verschieben der Banking-Typen und Hooks aus `vermietify` nach `packages/shared`.
2. Verschieben der Dokumenten-Upload-Komponenten (inkl. OCR-Logik) nach `packages/shared`.
3. Anpassen der Import-Pfade in `vermietify`.

### Schritt 2: Financial Compass (fintutto-biz) aufrüsten
1. **Dokumente:** Den shared Upload-Dialog in die `Expenses.tsx` (Ausgaben) Seite integrieren. Wenn ein Beleg hochgeladen wird, füllt die OCR automatisch Betrag, Datum und Lieferant aus.
2. **Banking:** Eine neue Seite `Banking.tsx` in `fintutto-biz` erstellen, die den shared Banking-Hook nutzt.
3. **Matching:** Den automatischen Abgleich zwischen `bank_transactions` und `biz_invoices` (Einnahmen) sowie `biz_expenses` (Ausgaben) implementieren.

### Schritt 3: Vermietify stabilisieren
1. Die ausgelagerten Shared-Komponenten testen.
2. Den Bulk-Upload für Dokumente (z.B. 10 Nebenkostenabrechnungen auf einmal) in die Shared-Komponente einbauen, wovon beide Apps profitieren.

---

## 4. Fazit im Vergleich zu sevdesk

Wenn wir diese Shared Infrastructure umsetzen, hast du:
- **Wie sevdesk:** KI-Belegerfassung, Banking-Sync, automatische Zuordnung.
- **Besser als sevdesk:** Du kannst mit demselben Login und derselben Logik nahtlos zwischen deiner Freelance-Buchhaltung, deiner GmbH-Verwaltung und deinen Immobilien wechseln. Die Dokumenten-Ablage ist zentralisiert.
