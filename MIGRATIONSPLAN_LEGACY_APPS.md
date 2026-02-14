# Migrationsplan: Legacy-Apps ins Fintutto-Portal

*Stand: 14.02.2026*

---

## Ausgangslage

### Analysierte Quellen

| App | Repo | Zustand | Kerntechnologie |
|-----|------|---------|-----------------|
| **ft_calc_rendite** | `ft_calc_rendite-9bb37c94` | 192 Seiten, 300+ Komponenten, 240+ Backend-Funktionen | Base44 + Supabase, React, Recharts, jsPDF |
| **ft_nebenkostenabrechnung** | `ft_nebenkostenabrechnung` | 580+ Dateien, 230+ Backend-Funktionen, 8-Schritt-Wizard | Base44 + Supabase, React, jsPDF, @react-pdf/renderer |
| **ft_ocr_zaehler** | `ft_ocr_zaehler-base44` | LEER (Placeholder-Repo, nur .gitattributes) | - |
| **Portal (Ziel)** | `portal` (dieses Repo) | 10 Checker, Auth, Stripe, Monorepo | React 18, TypeScript, Vite, Supabase, Tailwind |

### Kernbefund

Die beiden Legacy-Apps (`ft_calc_rendite`, `ft_nebenkostenabrechnung`) sind umfangreiche Base44/JavaScript-Anwendungen mit jeweils hunderten Komponenten. Eine 1:1-Migration ist weder sinnvoll noch noetig. Stattdessen: **gezielter Transfer der wertvollsten Geschaeftslogik und Infrastruktur-Patterns** ins Portal.

Das OCR-Repo ist leer -- die OCR-Funktionalitaet muss komplett neu gebaut werden.

---

## Was uebernommen werden soll

### A. Aus ft_calc_rendite (Mietrenditerechner)

#### A1. Berechnungslogik (PRIO 1 -- sofort)

| Was | Wo im Quellrepo | Warum |
|-----|-----------------|-------|
| **Brutto-/Nettorendite-Formeln** | `functions/mietrenditeCalculator.ts` | Kernlogik: Brutto = (Jahresmiete / Kaufpreis) x 100, Netto inkl. Betriebskosten |
| **Kaufpreisfaktor** | gleiche Datei | Kaufpreis / Jahresmiete |
| **Annuitaetendarlehen** | gleiche Datei | P = L x (r x (1+r)^n) / ((1+r)^n - 1) |
| **Eigenkapitalrendite** | gleiche Datei | (Cashflow nach Finanzierung x 12) / Eigenkapital x 100 |
| **Grunderwerbsteuer-Tabelle** | gleiche Datei | Alle 16 Bundeslaender (3.5%--6.5%) |
| **Rendite-Rating-System** | gleiche Datei | >=7% Hervorragend, 5--7% Gut, 4--5% Akzeptabel, 3--4% Niedrig, <3% Kritisch |
| **AfA-Berechnung** | `functions/mietrenditeCalculator.ts` | 2% des Gebaeudewerts jaehrlich |
| **10-Jahres-Projektion** | gleiche Datei | Mietsteigerung 2%/a, Kostensteigerung 1.5%/a |

**Ziel im Portal:** Den bestehenden `RenditeRechner.tsx` (in `apps/vermieter-portal`) mit der vollstaendigen 3-Tier-Logik aufwerten:
- Tier 1: Quick-Check (3 Felder, sofort Ergebnis)
- Tier 2: Detail-Wizard (Schritt-fuer-Schritt)
- Tier 3: Professionelle Analyse (30-Jahres-Projektion, AfA, Finanzierung)

#### A2. Auswertung & Visualisierung (PRIO 2)

| Was | Wo im Quellrepo | Ziel im Portal |
|-----|-----------------|----------------|
| **30-Jahres-Timeline** | `src/components/dashboard/Timeline30Years.jsx` | Wiederverwendbare Chart-Komponente |
| **Sankey-Diagramm** (Geldfluss) | `src/components/charts/SankeyDiagram.jsx` | Kostenfluss-Visualisierung fuer BK und Rendite |
| **Wasserfall-Chart** (kumulativer Cashflow) | `src/components/charts/WaterfallChart.jsx` | Cashflow-Analyse |
| **KPI-Cards mit Trend** | `src/components/dashboard/InteractiveDashboard.jsx` | Gemeinsames Dashboard-Widget |
| **Szenario-Vergleich** | `src/components/comparison/ScenarioSimulator.jsx` | Immobilien-Vergleichstool |

#### A3. Export-System (PRIO 1 -- Shared Infra)

| Was | Wo im Quellrepo | Ziel im Portal |
|-----|-----------------|----------------|
| **UniversalExportSystem** | `src/components/export/UniversalExportSystem.jsx` | Zentrale Export-Komponente fuer ALLE Tools |
| **PDF-Export (3 Typen)** | `src/components/export/AdvancedPDFReport.jsx` | Basis (Zusammenfassung), Visuell (mit Charts), Bank (komplett) |
| **Excel-Export** | gleiche Datei | xlsx-Integration |
| **Druck-Optimierung** | `src/components/export/PrintOptimization.jsx` | Print-CSS fuer alle Tools |

**Konkret:** Ein `<UniversalExport>` Wrapper, der fuer jeden Rechner/Checker/Formular PDF, Excel und Druck anbietet.

#### A4. Utility-Hooks (PRIO 2)

| Hook | Zweck | Nutzen im Portal |
|------|-------|-----------------|
| `useAutoSave` | Automatisches Speichern mit Debounce | Alle Formulare/Wizards |
| `useUndoRedo` | Aenderungs-Historie (Alt+Z/Y) | Komplexe Eingabeformulare |
| `useKeyboardShortcuts` | Tastaturkuerzel | Portal-weit |

---

### B. Aus ft_nebenkostenabrechnung (BK-Abrechnung)

#### B1. Berechnungslogik (PRIO 1 -- sofort)

| Was | Wo im Quellrepo | Warum |
|-----|-----------------|-------|
| **Umlageschluessel-Engine** | `functions/calculateOperatingCosts.ts` | 4 Verteilerschluessel: m2, Personen, Einheiten, Verbrauch |
| **HeizkostenV-Berechnung** | gleiche Datei | 30% Grundkosten + 70% Verbrauch (konfigurierbar) |
| **Pro-Rata-Berechnung** | gleiche Datei | Zeitanteil = Vertragstage / Abrechnungstage |
| **Leerstandsbehandlung** | gleiche Datei | Nur m2- und Einheiten-basierte Kosten, keine Personen/Verbrauch |
| **BetrKV-Kostenarten** | `functions/initializeCostTypes.ts` | 17 gesetzliche Kostenarten nach ss2 BetrKV |
| **Nicht-umlagefaehige Kosten** | gleiche Datei | Automatische Warnung bei Instandhaltung, Verwaltung, Mietausfallwagnis |
| **Vorauszahlungs-Berechnung** | `functions/calculateOperatingCosts.ts` | Vorschlag neue Monatspauschale = Gesamtkosten / 12 |

**Ziel im Portal:** Den bestehenden `NebenkostenRechner.tsx` zum vollwertigen BK-Abrechnungstool ausbauen.

**Formeln im Detail:**

```
-- Quadratmeter-basiert:
Kostenanteil = (Gesamtkosten x Einheit-m2 / Gesamt-m2) x Tagesfaktor

-- Personenbasiert:
Kostenanteil = (Gesamtkosten x Personen / Gesamt-Personen) x Tagesfaktor

-- Einheitenbasiert:
Kostenanteil = (Gesamtkosten / Anzahl-Einheiten) x Tagesfaktor

-- Verbrauchsbasiert (Heizung):
Grundkosten = Gesamt x Grundanteil% x (Einheit-m2 / Gesamt-m2) x Tagesfaktor
Verbrauchskosten = Gesamt x Verbrauchsanteil% x (Zaehlerstand / Gesamt-Zaehlerstaende)
Heizkosten = Grundkosten + Verbrauchskosten

-- Tagesfaktor:
Tagesfaktor = Vertragstage-im-Zeitraum / Gesamttage-Zeitraum

-- Endergebnis pro Mieter:
Ergebnis = Gesamtkosten - Vorauszahlungen
Positiv = Nachzahlung, Negativ = Guthaben
```

#### B2. 8-Schritt-Wizard (PRIO 1)

| Schritt | Komponente | Funktion |
|---------|-----------|----------|
| 1 | `Step1BuildingPeriod.jsx` | Gebaeude & Zeitraum waehlen |
| 2 | `Step2Contracts.jsx` | Vertraege erkennen, Leerstand, Pro-Rata |
| 3 | `Step3Costs.jsx` | Kostenarten & Betraege eingeben (BetrKV) |
| 4 | `Step4DirectCosts.jsx` | Direkte Zuordnung zu einzelnen Einheiten |
| 5 | `Step5HeatingCosts.jsx` | Heizkosten nach HeizkostenV |
| 6 | `Step6Results.jsx` | Berechnung & Ergebnis pro Mieter |
| 7 | `Step7Preview.jsx` | PDF-Vorschau & Download |
| 8 | `Step8Send.jsx` | Email-Versand an Mieter |

**Ziel im Portal:** Dieses Wizard-Pattern als `<MultiStepWizard>` generalisieren und fuer BK-Abrechnung, Formulare und andere komplexe Workflows verwenden.

#### B3. Dokumentenverwaltung (PRIO 1 -- Shared Infra)

| Was | Wo im Quellrepo | Ziel im Portal |
|-----|-----------------|----------------|
| **DocumentUploadForm** | `src/components/properties/DocumentUploadForm.jsx` | Zentrale Upload-Komponente |
| **PropertyDocumentManager** | `src/components/properties/PropertyDocumentManager.jsx` | Dokumenten-Hub pro Objekt |
| **Dokumenttypen** | gleiche Datei | Mietvertrag, Protokoll, Rechnung, Versicherung, Foto, Bescheinigung |
| **Metadaten** | gleiche Datei | Titel, Tags, Datum, Ablaufdatum, Zuordnung |
| **Versionierung** | `functions/manageDocumentVersions.ts` | Dokumenten-Versionshistorie |
| **Freigabe-Workflow** | `src/components/properties/DocumentApprovalPanel.jsx` | Genehmigungsprozess |

**Konkret:** Eine Portal-weite Dokumentenverwaltung mit:
- Upload (Drag & Drop, max 50MB)
- Kategorisierung nach Typ
- Zuordnung zu Gebaeude/Einheit/Mieter
- Versionskontrolle
- Supabase Storage als Backend

#### B4. Auswertung & Analytics (PRIO 2)

| Was | Wo im Quellrepo | Ziel im Portal |
|-----|-----------------|----------------|
| **NKAnalyticsDashboard** | `src/components/nk-wizard/NKAnalyticsDashboard.jsx` | BK-spezifische Auswertungen |
| **Kostenverteilung (Pie)** | gleiche Datei | Kreisdiagramm nach Kategorie |
| **Top-Einheiten (Bar)** | gleiche Datei | Balkendiagramm Kosten pro Einheit |
| **Anomalie-Erkennung** | `functions/detectNKAnomalies.ts` | Automatische Warnung bei ungewoehnlichen Kosten |
| **Jahresvergleich** | `functions/compareNKWithPreviousYear.ts` | Vorjahres-Vergleich |

#### B5. Cross-App Integration (PRIO 3)

| Was | Wo im Quellrepo | Ziel im Portal |
|-----|-----------------|----------------|
| **Cross-App Notifications** | `src/components/crossApp/NotificationBellCrossApp.jsx` | Benachrichtigungen zwischen Portal-Modulen |
| **Document Sharing** | `functions/shareDocumentToApp.ts` | Dokumente moduluebergreifend teilen |
| **User Context Sync** | `functions/getUserContextAcrossApps.ts` | Ein Login, alle Module |

---

### C. OCR/Zaehler (komplett neu zu bauen)

Das `ft_ocr_zaehler` Repo ist **leer**. Folgendes muss neu entwickelt werden:

#### C1. Zaehler-Erfassung (PRIO 2)

| Feature | Beschreibung | Aufwand |
|---------|-------------|--------|
| **MeterDashboard** | Uebersicht aller Zaehler, gruppiert nach Gebaeude/Einheit | 1 Tag |
| **MeterCard** | Einzelner Zaehler mit letztem Stand, Typ-Icon | 0.5 Tag |
| **ReadingForm** | Manuelle Eingabe: Zaehlerstand + Datum + optionales Foto | 1 Tag |
| **ReadingHistory** | Tabelle aller Ablesungen mit Verbrauchsberechnung | 1 Tag |
| **ReadingChart** | Verbrauchsverlauf als Liniendiagramm (Recharts) | 1 Tag |
| **CSVImport** | Upload historischer Zaehlerstaende (Format: Nummer, Datum, Stand) | 2 Tage |

#### C2. OCR-Integration (PRIO 3)

| Feature | Beschreibung | Aufwand |
|---------|-------------|--------|
| **MeterScanner** | Kamera-Zugriff auf Mobilgeraeten, Foto vom Zaehler | 2 Tage |
| **OCR-Edge-Function** | Supabase Edge Function mit Tesseract.js (kostenlos) oder Google Vision API (Premium) | 3 Tage |
| **Ergebnis-Validierung** | Plausibilitaetspruefung: nicht kleiner als letzter Stand, nicht unrealistisch hoch | 1 Tag |

**Empfohlener Ansatz: Hybrid-OCR**
1. Tesseract.js im Browser (kostenlos, offline-faehig)
2. Bei Confidence < 80%: Google Cloud Vision API (bezahlt, hoehere Genauigkeit)
3. Immer: manuelle Korrekturmoeglichkeit

#### C3. Verbrauchsauswertung (PRIO 2)

| Feature | Beschreibung | Aufwand |
|---------|-------------|--------|
| **ConsumptionAnalysis** | Tages-/Wochen-/Monatsverbrauch berechnen & visualisieren | 2 Tage |
| **CostProjection** | Hochrechnung Jahreskosten basierend auf aktuellem Verbrauch | 1 Tag |
| **AnomalyDetection** | Warnung bei ungewoehnlich hohem/niedrigem Verbrauch | 1 Tag |
| **BK-Integration** | Zaehlerstaende automatisch in BK-Abrechnung (Schritt 5) uebernehmen | 1 Tag |

---

## Shared Infrastructure (Portal-weit)

Diese Komponenten werden **einmal** gebaut und von allen Modulen genutzt:

### S1. Export-Framework

```
src/components/shared/export/
  UniversalExport.tsx        -- Wrapper: PDF / Excel / Druck / Email
  PDFGenerator.tsx           -- jsPDF-basierte PDF-Erstellung
  ExcelExport.tsx            -- xlsx-basierte Tabellen
  PrintLayout.tsx            -- Druck-optimiertes CSS
  EmailSender.tsx            -- Ergebnis per Email versenden
```

### S2. Dokumentenverwaltung

```
src/components/shared/documents/
  DocumentUpload.tsx         -- Drag & Drop Upload
  DocumentList.tsx           -- Dokumenten-Uebersicht mit Filter
  DocumentViewer.tsx         -- Vorschau (PDF, Bild)
  DocumentVersions.tsx       -- Versionshistorie
```

### S3. Multi-Step-Wizard

```
src/components/shared/wizard/
  MultiStepWizard.tsx        -- Generischer Wizard-Container
  WizardStep.tsx             -- Einzelschritt mit Validierung
  WizardProgress.tsx         -- Fortschrittsanzeige
  WizardNavigation.tsx       -- Vor/Zurueck/Speichern
  useDraftSave.ts            -- Auto-Save Hook fuer Wizard-Daten
```

### S4. Analytics-Dashboard

```
src/components/shared/analytics/
  KPICard.tsx                -- Kennzahl mit Trend-Indikator
  ChartContainer.tsx         -- Responsive Chart-Wrapper
  TimeRangeSelector.tsx      -- Zeitraum-Auswahl (1M/3M/6M/1J)
  DataExport.tsx             -- Daten als CSV/Excel exportieren
```

---

## Implementierungsplan

### Phase 1: Shared Infrastructure (1 Woche)

| # | Aufgabe | Quelle | Prio |
|---|---------|--------|------|
| 1.1 | `<MultiStepWizard>` Komponente | Pattern aus ft_nebenkostenabrechnung | P0 |
| 1.2 | `<UniversalExport>` (PDF + Excel + Druck) | ft_calc_rendite Export-System | P0 |
| 1.3 | `<DocumentUpload>` + `<DocumentList>` | ft_nebenkostenabrechnung Dokumente | P0 |
| 1.4 | `<KPICard>` + `<ChartContainer>` | ft_calc_rendite Dashboard-Widgets | P1 |
| 1.5 | `useAutoSave` + `useDraftSave` Hooks | ft_calc_rendite Hooks | P1 |

### Phase 2: Renditerechner aufwerten (1 Woche)

| # | Aufgabe | Quelle | Prio |
|---|---------|--------|------|
| 2.1 | Quick-Check (3-Felder-Sofort-Analyse) | ft_calc_rendite QuickCheckForm | P0 |
| 2.2 | Detail-Wizard (Schritt-fuer-Schritt) | ft_calc_rendite DetailWizardContainer | P0 |
| 2.3 | Finanzierungs-Berechnung (Annuitaet, Eigenkapital) | ft_calc_rendite Calculator | P0 |
| 2.4 | Grunderwerbsteuer alle 16 Bundeslaender | ft_calc_rendite Steuertabelle | P0 |
| 2.5 | PDF-Export (Basis + Bank-Version) | ft_calc_rendite AdvancedPDFReport | P1 |
| 2.6 | 10-Jahres-Projektion | ft_calc_rendite Timeline | P1 |
| 2.7 | Rendite-Rating (Hervorragend bis Kritisch) | ft_calc_rendite Rating-System | P0 |

### Phase 3: BK-Abrechnung aufwerten (2 Wochen)

| # | Aufgabe | Quelle | Prio |
|---|---------|--------|------|
| 3.1 | BetrKV-Kostenarten initialisieren (17 Typen) | ft_nebenkostenabrechnung initializeCostTypes | P0 |
| 3.2 | Umlageschluessel-Engine (m2/Personen/Einheiten/Verbrauch) | ft_nebenkostenabrechnung calculateOperatingCosts | P0 |
| 3.3 | 8-Schritt-Wizard fuer BK-Abrechnung | ft_nebenkostenabrechnung NKWizard | P0 |
| 3.4 | HeizkostenV-Berechnung (30/70-Split) | ft_nebenkostenabrechnung Step5HeatingCosts | P0 |
| 3.5 | Pro-Rata-Berechnung (Tagesfaktor) | ft_nebenkostenabrechnung calculateOperatingCosts | P0 |
| 3.6 | Leerstandsbehandlung | ft_nebenkostenabrechnung calculateOperatingCosts | P1 |
| 3.7 | PDF-Abrechnung pro Mieter | ft_nebenkostenabrechnung OperatingCostStatementPDF | P0 |
| 3.8 | Ergebnis-Dashboard (Kosten-Pie, Top-Einheiten) | ft_nebenkostenabrechnung NKAnalyticsDashboard | P1 |
| 3.9 | Anomalie-Erkennung | ft_nebenkostenabrechnung detectNKAnomalies | P2 |
| 3.10 | Vorjahresvergleich | ft_nebenkostenabrechnung compareNKWithPreviousYear | P2 |

### Phase 4: Dokumentenverwaltung (1 Woche)

| # | Aufgabe | Quelle | Prio |
|---|---------|--------|------|
| 4.1 | Document Upload mit Drag & Drop | ft_nebenkostenabrechnung DocumentUploadForm | P0 |
| 4.2 | Dokumenttypen-System (Vertrag, Rechnung, Foto...) | ft_nebenkostenabrechnung Typenliste | P0 |
| 4.3 | Zuordnung zu Gebaeude/Einheit/Mieter | ft_nebenkostenabrechnung PropertyDocumentManager | P0 |
| 4.4 | Such- und Filterfunktion | ft_nebenkostenabrechnung DocumentManager | P1 |
| 4.5 | Versionshistorie | ft_nebenkostenabrechnung manageDocumentVersions | P2 |
| 4.6 | Supabase Storage Integration | ft_nebenkostenabrechnung supabaseClient | P0 |

### Phase 5: Zaehler-Modul (1.5 Wochen)

| # | Aufgabe | Quelle | Prio |
|---|---------|--------|------|
| 5.1 | Zaehler-Dashboard (Uebersicht alle Zaehler) | Neu (Referenz: Vermietify Meters.tsx) | P0 |
| 5.2 | Manuelle Ablesung (ReadingForm) | Neu | P0 |
| 5.3 | Ablesehistorie + Verbrauchsberechnung | Neu | P0 |
| 5.4 | Verbrauchsverlauf-Chart (Recharts) | Neu | P1 |
| 5.5 | CSV-Import historischer Daten | Neu | P1 |
| 5.6 | Integration mit BK-Abrechnung (Schritt 5) | ft_nebenkostenabrechnung Step5HeatingCosts | P0 |
| 5.7 | OCR/Kamera-Ablesung (Hybrid: Tesseract + Cloud) | Neu | P2 |
| 5.8 | Verbrauchs-Anomalie-Erkennung | Neu | P2 |

### Phase 6: Formulare ausbauen (1.5 Wochen)

| # | Aufgabe | Quelle | Prio |
|---|---------|--------|------|
| 6.1 | BK-Abrechnung-Formular (PDF-faehig) | ft_nebenkostenabrechnung PDF-System | P0 |
| 6.2 | Mietvertrag-Formular vervollstaendigen | ft_fromulare_alle (Referenz) | P1 |
| 6.3 | Uebergabeprotokoll-Formular | ft_fromulare_alle (Referenz) | P1 |
| 6.4 | Kuendigung-Formular | ft_fromulare_alle (Referenz) | P1 |
| 6.5 | Mahnung-Formular | ft_fromulare_alle (Referenz) | P2 |
| 6.6 | Alle Formulare: PDF-Export + Druck + Email | Shared UniversalExport | P0 |

---

## Datenmodell-Erweiterungen (Supabase)

### Neue Tabellen fuer das Portal

```sql
-- Zaehler
CREATE TABLE meters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID REFERENCES units(id),
  meter_number TEXT NOT NULL,
  type TEXT CHECK (type IN ('electricity', 'gas', 'water', 'heating')),
  installation_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE meter_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meter_id UUID REFERENCES meters(id) ON DELETE CASCADE,
  reading_date DATE NOT NULL,
  value DECIMAL NOT NULL,
  image_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BK-Abrechnung
CREATE TABLE operating_cost_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID,
  accounting_year INTEGER,
  period_start DATE,
  period_end DATE,
  status TEXT CHECK (status IN ('draft', 'calculated', 'sent', 'corrected')),
  draft_data JSONB,
  current_step INTEGER DEFAULT 1,
  total_costs DECIMAL,
  total_prepayments DECIMAL,
  total_result DECIMAL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE operating_cost_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  statement_id UUID REFERENCES operating_cost_statements(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  betrkv_number TEXT,
  total_amount DECIMAL NOT NULL,
  allocation_key TEXT CHECK (allocation_key IN ('sqm', 'persons', 'units', 'consumption')),
  is_allocatable BOOLEAN DEFAULT TRUE,
  is_heating_cost BOOLEAN DEFAULT FALSE,
  base_cost_percentage INTEGER DEFAULT 30,
  consumption_cost_percentage INTEGER DEFAULT 70
);

CREATE TABLE operating_cost_tenant_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  statement_id UUID REFERENCES operating_cost_statements(id) ON DELETE CASCADE,
  unit_id UUID,
  tenant_name TEXT,
  is_vacancy BOOLEAN DEFAULT FALSE,
  effective_start DATE,
  effective_end DATE,
  day_factor DECIMAL,
  total_costs DECIMAL,
  total_prepayments DECIMAL,
  result DECIMAL,
  cost_details JSONB,
  suggested_new_prepayment DECIMAL
);

-- BetrKV-Kostenarten (Seed-Daten)
CREATE TABLE cost_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  betrkv_number TEXT,
  default_allocation_key TEXT,
  is_allocatable BOOLEAN DEFAULT TRUE,
  is_heating_cost BOOLEAN DEFAULT FALSE,
  sort_order INTEGER,
  warning_message TEXT
);

-- Dokumente
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  property_id UUID,
  unit_id UUID,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  document_type TEXT CHECK (document_type IN (
    'lease', 'invoice', 'insurance', 'photo',
    'protocol', 'certificate', 'permit', 'other'
  )),
  tags TEXT[],
  description TEXT,
  relevant_date DATE,
  expiration_date DATE,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Technische Migrationsstrategie

### Grundsatz: Adapt, nicht Copy-Paste

Die Legacy-Apps (ft_calc_rendite, ft_nebenkostenabrechnung) nutzen **Base44 SDK + JavaScript**.
Das Portal nutzt **Supabase direkt + TypeScript**. Daher:

1. **Geschaeftslogik** (Formeln, Validierungen, Regeln) --> uebersetzen nach TypeScript
2. **UI-Patterns** (Wizard, Dashboard, Export) --> als generische Komponenten nachbauen
3. **Datenmodelle** --> als Supabase-Tabellen implementieren
4. **Backend-Funktionen** --> als Supabase Edge Functions oder Client-Side-Logik

### Was NICHT uebernommen wird

| Kategorie | Grund |
|-----------|-------|
| Base44 SDK Integration | Portal nutzt Supabase direkt |
| 240+ Backend-Funktionen (ft_calc_rendite) | Grossteils Base44-spezifisch |
| 230+ Backend-Funktionen (ft_nebenkosten) | Grossteils Base44-spezifisch |
| Payment-Integration (Stripe/PayPal/Klarna) | Portal hat eigenes Stripe-System |
| Gamification | Overengineered fuer MVP |
| Cross-App Messaging | Nicht noetig im Portal |
| AI Core Service (15.000 Zeilen) | Zu komplex, eigene AI-Strategie |
| Marketplace | Nicht relevant |
| Team/Collaboration Features | Spaeter |

---

## Zusammenfassung

### Gesamtaufwand: ~8 Wochen

| Phase | Dauer | Inhalt |
|-------|-------|--------|
| Phase 1 | 1 Woche | Shared Infrastructure (Wizard, Export, Dokumente, Dashboard) |
| Phase 2 | 1 Woche | Renditerechner 3-Tier-Ausbau |
| Phase 3 | 2 Wochen | BK-Abrechnung mit vollstaendiger Umlageerkennung |
| Phase 4 | 1 Woche | Dokumentenverwaltung Portal-weit |
| Phase 5 | 1.5 Wochen | Zaehler-Modul inkl. OCR |
| Phase 6 | 1.5 Wochen | Formulare ausbauen + PDF |

### Top-5 Mehrwert-Transfers

1. **Umlageschluessel-Engine** aus ft_nebenkostenabrechnung -- das Herzsueck jeder BK-Abrechnung
2. **Universal-Export** aus ft_calc_rendite -- PDF/Excel/Druck fuer alle Tools
3. **Rendite-Berechnungslogik** aus ft_calc_rendite -- professionelle Immobilienbewertung
4. **Dokumentenverwaltung** aus ft_nebenkostenabrechnung -- zentrale Ablage mit Versionierung
5. **Multi-Step-Wizard Pattern** aus ft_nebenkostenabrechnung -- wiederverwendbar fuer BK, Formulare, Onboarding

---

*Erstellt: 14.02.2026*
*Basierend auf Analyse von: ft_calc_rendite-9bb37c94, ft_nebenkostenabrechnung, ft_ocr_zaehler-base44, portal (dieses Repo)*
