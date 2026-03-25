# Masterplan: Fintutto Ecosystem Konsolidierung & Fokus

**Datum:** 25. März 2026
**Autor:** Manus AI
**Ziel:** Radikale Fokussierung auf die Kern-Apps (Financial Compass / fintutto-biz, Vermietify, Portal) zur Lösung der eigenen Probleme (Freelancer, GF, Vermieter) und anschließender Monetarisierung.

---

## Ausgangslage & Kontext

Das Repository `alexanderdeibel-Fintutto/portal` enthält aktuell ~28 Apps in unterschiedlichen Ausbauzuständen. Die Strategie lautet: **Weniger ist mehr.** 
Der Fokus liegt auf der Lösung der eigenen, akuten Probleme:
1. **Verwaltung der eigenen Firmen & Freelance-Tätigkeiten** (Ablösung von Lexoffice & Co.) -> *Financial Compass (fintutto-biz)*
2. **Verwaltung der eigenen Immobilien** -> *Vermietify*
3. **Lead-Generierung & Monetarisierung** -> *Fintutto Portal*

---

## Phase 1: Radikaler Cleanup (Woche 1-2)

**Ziel:** Das Repository von Ballast befreien und den Fokus auf die 3 Kern-Apps lenken.

### 1.1 Archivierung
Alle Legacy-Repos und Lovable-Duplikate, die keine nennenswerte Logik enthalten (oft nur 2 Dateien: Layout + KI-Button), werden in einen `_archive`-Ordner verschoben.
*Betroffene Apps (Beispiele):* `admin-hub`, `betriebskosten-helfer`, `hausmeister`, `leserally`, `miet-check-pro`, `miet-recht`, `mietenplus-rechner`, `mieterhoehungs-checker`, `rent-wizard`, `vermieter-freude`.

### 1.2 Fokus-Struktur
Das `apps/`-Verzeichnis wird bereinigt, sodass nur noch aktiv entwickelte Apps sichtbar sind:
- `apps/fintutto-biz` (Financial Compass)
- `apps/vermietify` (Immobilienverwaltung)
- `apps/fintutto-portal` (Lead-Generator)
- *Optional/Später:* `apps/bescheidboxer`, `apps/arbeitslos-portal` (als separate, aber nicht primär fokussierte Projekte).

---

## Phase 2: Fintutto Biz für den Eigenbedarf (Woche 3-6)

**Ziel:** Die App `fintutto-biz` so weit stabilisieren, dass sie für die eigenen Firmen (Freelance + GF-Mandate) nutzbar ist und bestehende Abos (z.B. Lexoffice) gekündigt werden können.

### 2.1 Multi-Company & Rollen-Support
Da du Freelancer bist und mehrere Firmenbeteiligungen als GF verwaltest, muss das System zwingend mandantenfähig sein.
- **Anforderung:** Ein User-Account muss zwischen verschiedenen "Businesses" (Freelance, GmbH 1, GmbH 2) wechseln können.
- **Umsetzung:** Prüfung und ggf. Anpassung der Supabase-Tabellenstruktur (`businesses`, `user_businesses` mit Rollen).

### 2.2 Invoicing & Expenses
Die Kernfunktionen müssen reibungslos funktionieren.
- **Invoicing:** Rechnungen erstellen, als PDF exportieren, Status-Tracking (Draft, Sent, Paid).
- **Expenses:** Belege hochladen (OCR-Integration prüfen), kategorisieren, mit Transaktionen verknüpfen.

### 2.3 Banking-Sync
- **Anforderung:** Anbindung der Supabase-Tabellen `banking_connections` und `banking_transactions`.
- **Ziel:** Automatischer Abgleich von Zahlungseingängen mit offenen Rechnungen und Ausgaben.

### 2.4 Tax Overview
- **Anforderung:** Die Dashboard-Logik in `TaxOverview.tsx` muss finalisiert werden.
- **Ziel:** Echtzeit-Überblick über Umsatzsteuer-Zahllast, EÜR-Prognose und Gewinn/Verlust pro Quartal.

---

## Phase 3: Vermietify Konsolidierung (Monat 2-3)

**Ziel:** Das riesige Vermietify-Projekt (92 Seiten) stabilisieren und für externe Beta-Tester vorbereiten.

### 3.1 Feature-Freeze
Es werden keine neuen Funktionen mehr entwickelt. Der Fokus liegt zu 100% auf Konsolidierung und Bugfixing.

### 3.2 UI/UX Merge
- **Problem:** Es existiert ein Lovable-Design (`vermieter-freude`) und eine funktionalere lokale Version (`apps/vermietify`).
- **Lösung:** Das ansprechende Design aus der Lovable-Version wird mit der robusten Logik (React Query, Supabase) der lokalen Version verheiratet.

### 3.3 Kern-Workflow Test
Der "Happy Path" muss fehlerfrei durchlaufen werden können:
1. Immobilie anlegen
2. Einheit (Wohnung) anlegen
3. Mieter anlegen
4. Mietvertrag hinterlegen
5. Miete via Banking-Sync prüfen (Zahlungseingang)

---

## Phase 4: Monetarisierung via Portal (Monat 4+)

**Ziel:** Das `fintutto-portal` als Traffic- und Lead-Generator nutzen, um Einnahmen zu generieren.

### 4.1 Lead-Generator
Das Portal bündelt alle Rechner (Kaufnebenkosten, Rendite) und Checker (Mietpreisbremse, Nebenkosten). Diese Tools ziehen organischen Traffic an.

### 4.2 Quick Wins (Affiliate-Strategie)
Implementierung der in der `MONETARISIERUNG-STRATEGIE.md` definierten Quick Wins:
- **Rechtsschutz:** Nach Nutzung eines Mietrecht-Checkers (z.B. Mieterhöhung) wird ein Affiliate-Link für eine Rechtsschutzversicherung eingeblendet.
- **Kautionsversicherung:** Nach Nutzung des Kautionsrechners wird eine Kautionsfrei-Alternative angeboten.
- **Umzugsservice:** Nach dem Kündigungs-Checker werden Umzugsunternehmen empfohlen.

---

## Nächste Schritte

1. **Sofort:** Ausführung von Phase 1 (Cleanup des Repositories).
2. **Anschließend:** Detaillierte Analyse der `fintutto-biz` Codebase zur Vorbereitung von Phase 2.
