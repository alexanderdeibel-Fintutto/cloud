# Konsolidierungsplan: Vermietify + Satellite Apps

## Executive Summary

**Ziel:** Alle Fintutto-Apps in einer zentralen Lovable-Plattform (vermieter-freude) konsolidieren, mit **Supabase als Single Source of Truth**.

### Apps-Übersicht

| App | Repo | Seiten | Zu integrieren als |
|-----|------|--------|-------------------|
| **Vermietify** | vermieter-freude | 16 | Basis-Plattform |
| **ft_vermietify** | ft_vermietify | 631 | Feature-Referenz |
| **Betriebskosten** | betriebskosten-helfer | 12 | Embedded Module |
| **Zähler** | leserally-all | 13 | Embedded + Standalone |
| **Hausmeister** | fintu-hausmeister-app | 17 | Shared Task-System |
| **Mieter-Portal** | wohn-held | 17 | Shared Task-System |

---

## 1. Architektur

### 1.1 Ziel-Architektur

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SUPABASE (King!)                             │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ Tables: buildings, units, tenants, lease_contracts,         │    │
│  │         payments, meters, meter_readings, tasks,            │    │
│  │         operating_cost_statements, documents, messages...    │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ Auth: Single Sign-On für alle Apps                          │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ Storage: Dokumente, Fotos, Zählerbilder                     │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ Edge Functions: PDF-Gen, OCR, Notifications, Calculations   │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    VERMIETIFY (vermieter-freude)                     │
│                         Lovable Plattform                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │                    CORE MODULES (native)                    │     │
│  │  Dashboard │ Gebäude │ Einheiten │ Mieter │ Verträge       │     │
│  │  Zahlungen │ Dokumente │ Kommunikation │ Steuern │ Admin   │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │        BETRIEBSKOSTEN MODULE (from betriebskosten-helfer)  │     │
│  │  Components: BillingWizard, BillingOverview, CostAllocation │     │
│  │  Ohne eigenen Header - nahtlos integriert                   │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │           ZÄHLER MODULE (from leserally-all)               │     │
│  │  Components: MeterDashboard, ReadMeter, MeterDetail        │     │
│  │  + CSV-Import + Historische Auswertung                      │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │     SHARED TASK SYSTEM (Hausmeister + Mieter unified)      │     │
│  │  Components: TaskList, TaskDetail, TaskCreate               │     │
│  │  Rollen: Mieter erstellt → Vermieter/Hausmeister bearbeitet │     │
│  │  Features: Fotos, Dokumente, Status-Workflow, Chat          │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
            ┌───────────┐ ┌───────────┐ ┌───────────┐
            │ Mieter-   │ │Hausmeister│ │ Standalone│
            │ Portal    │ │   App     │ │  Rechner  │
            │(wohn-held)│ │(fintu-hm) │ │(rent-wiz) │
            │ PWA/App   │ │  PWA/App  │ │   Web     │
            └───────────┘ └───────────┘ └───────────┘
            Shared Components → Vermietify UI Kit
```

### 1.2 Shared Supabase Tables

Diese Tabellen werden von allen Apps geteilt:

| Tabelle | Verwendet von |
|---------|---------------|
| `buildings` | Alle Apps |
| `units` | Alle Apps |
| `tenants` | Vermietify, Wohn-Held, BK-Helfer |
| `lease_contracts` | Vermietify, BK-Helfer |
| `payments` | Vermietify, BK-Helfer, Wohn-Held |
| `meters` | Vermietify, Leserally, BK-Helfer |
| `meter_readings` | Vermietify, Leserally, BK-Helfer |
| `tasks` | Vermietify, Hausmeister, Wohn-Held |
| `task_comments` | Vermietify, Hausmeister, Wohn-Held |
| `task_attachments` | Vermietify, Hausmeister, Wohn-Held |
| `operating_cost_statements` | Vermietify, BK-Helfer |
| `operating_cost_items` | Vermietify, BK-Helfer |
| `documents` | Alle Apps |
| `messages` | Vermietify, Hausmeister, Wohn-Held |
| `notifications` | Alle Apps |

---

## 2. Komponenten-Migration

### 2.1 Von betriebskosten-helfer (12 Seiten)

| Original-Seite | Ziel in Vermietify | Komponenten zu extrahieren |
|----------------|-------------------|---------------------------|
| BillingsPage.tsx | /betriebskosten | BillingList, BillingCard |
| NewBillingPage.tsx | /betriebskosten/neu | BillingWizard (Steps 1-5) |
| BuildingsPage.tsx | ❌ Nutze native | - |
| UnitsPage.tsx | ❌ Nutze native | - |
| TenantsPage.tsx | ❌ Nutze native | - |
| LeasesPage.tsx | ❌ Nutze native | - |
| DashboardPage.tsx | ❌ Nutze native | BK-KPIs übernehmen |
| SettingsPage.tsx | ❌ Nutze native | BK-Settings integrieren |

**Zu migrierende Komponenten:**
```
src/components/
├── billing/
│   ├── BillingWizard.tsx        → vermietify/src/components/betriebskosten/
│   ├── BillingOverview.tsx
│   ├── CostAllocationTable.tsx
│   ├── CostTypeSelector.tsx
│   ├── TenantResultCard.tsx
│   └── BillingPDFExport.tsx
├── cost-types/
│   ├── CostTypeList.tsx
│   └── CostTypeForm.tsx
└── allocation/
    ├── AllocationKeySelector.tsx
    └── DistributionPreview.tsx
```

### 2.2 Von leserally-all (13 Seiten)

| Original-Seite | Ziel in Vermietify | Komponenten zu extrahieren |
|----------------|-------------------|---------------------------|
| Dashboard.tsx | /zaehler | MeterOverview, MeterStats |
| MeterDetail.tsx | /zaehler/:id | MeterCard, ReadingHistory, ReadingChart |
| ReadMeter.tsx | /zaehler/ablesen | MeterScanner, ManualReadingForm |
| UnitDetail.tsx | ❌ Nutze native | Unit-Zähler-Widget |
| Units.tsx | ❌ Nutze native | - |

**Zu migrierende Komponenten:**
```
src/components/
├── meters/
│   ├── MeterDashboard.tsx       → vermietify/src/components/zaehler/
│   ├── MeterCard.tsx
│   ├── MeterScanner.tsx         # Kamera/OCR
│   ├── ReadingForm.tsx
│   ├── ReadingHistory.tsx
│   ├── ReadingChart.tsx
│   └── CSVImport.tsx            # NEU: Historische Daten
└── readings/
    ├── ReadingComparison.tsx
    └── ConsumptionAnalysis.tsx
```

**Zusätzlich zu implementieren:**
- CSV-Import für historische Zählerstände
- Verbrauchsauswertung über Zeiträume
- Integration mit BK-Abrechnung

### 2.3 Von fintu-hausmeister-app (17 Seiten)

| Original-Seite | Ziel in Vermietify | Komponenten zu extrahieren |
|----------------|-------------------|---------------------------|
| TasksPage.tsx | /aufgaben | TaskList, TaskFilters |
| TaskDetailPage.tsx | /aufgaben/:id | TaskDetail, TaskComments, TaskAttachments |
| CalendarPage.tsx | /kalender | TaskCalendar |
| ChatPage.tsx | /nachrichten | ChatInterface |
| MessagesPage.tsx | /nachrichten | MessageList |
| BuildingsPage.tsx | ❌ Nutze native | - |
| BuildingDetailPage.tsx | ❌ Nutze native | - |
| ProfilePage.tsx | ❌ Nutze native | - |

**Zu migrierende Komponenten:**
```
src/components/
├── tasks/
│   ├── TaskList.tsx             → vermietify/src/components/aufgaben/
│   ├── TaskCard.tsx
│   ├── TaskDetail.tsx
│   ├── TaskForm.tsx
│   ├── TaskComments.tsx
│   ├── TaskAttachments.tsx
│   ├── TaskStatusBadge.tsx
│   └── TaskAssignment.tsx
├── calendar/
│   └── TaskCalendar.tsx
└── chat/
    ├── ChatInterface.tsx
    └── MessageBubble.tsx
```

### 2.4 Von wohn-held (17 Seiten)

| Original-Seite | Ziel in Vermietify | Komponenten zu extrahieren |
|----------------|-------------------|---------------------------|
| MangelMelden.tsx | Shared: /aufgaben/neu | DefectReportForm |
| ZaehlerAblesen.tsx | Shared: /zaehler/ablesen | TenantMeterReading |
| DokumentAnfragen.tsx | /dokumente/anfragen | DocumentRequestForm |
| Dokumente.tsx | /dokumente (Mieter-Sicht) | TenantDocumentList |
| Chat.tsx | Shared: /nachrichten | - (nutze Hausmeister) |
| Finanzen.tsx | /finanzen (Mieter-Sicht) | TenantFinanceOverview |
| Wohnung.tsx | /wohnung | TenantUnitView |
| Hausordnung.tsx | /hausordnung | HouseRulesView |
| Notfallkontakte.tsx | /notfall | EmergencyContacts |
| Einstellungen.tsx | ❌ Nutze native | - |

**Zu migrierende Komponenten:**
```
src/components/
├── tenant-portal/
│   ├── DefectReportForm.tsx     → vermietify/src/components/mieter-portal/
│   ├── TenantMeterReading.tsx
│   ├── TenantDocumentList.tsx
│   ├── TenantFinanceOverview.tsx
│   ├── TenantUnitView.tsx
│   ├── DocumentRequestForm.tsx
│   ├── HouseRulesView.tsx
│   └── EmergencyContacts.tsx
```

---

## 3. Shared Task System

### 3.1 Unified Task-Konzept

```
┌─────────────────────────────────────────────────────────────┐
│                     TASK WORKFLOW                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  MIETER (wohn-held)           VERMIETER (vermietify)        │
│  ┌─────────────────┐          ┌─────────────────┐           │
│  │ MangelMelden    │──────────▶│ Task-Eingang    │           │
│  │ + Foto          │          │ (Inbox)         │           │
│  │ + Beschreibung  │          └────────┬────────┘           │
│  └─────────────────┘                   │                    │
│                                        ▼                    │
│                              ┌─────────────────┐            │
│                              │ Zuweisung an:   │            │
│                              │ • Hausmeister   │            │
│                              │ • Handwerker    │            │
│                              │ • Selbst        │            │
│                              └────────┬────────┘            │
│                                       │                     │
│  HAUSMEISTER (fintu-hm)               ▼                     │
│  ┌─────────────────┐          ┌─────────────────┐           │
│  │ Task bearbeiten │◀─────────│ Task zugewiesen │           │
│  │ + Status ändern │          └─────────────────┘           │
│  │ + Fotos/Doku    │                                        │
│  │ + Kommentare    │──────────▶ Alle sehen Updates          │
│  └─────────────────┘                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Task-Tabellen-Schema

```sql
-- Bereits in Supabase vorhanden, ggf. erweitern:

-- tasks (Haupttabelle)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS
  source TEXT CHECK (source IN ('tenant', 'landlord', 'caretaker', 'system')),
  visibility TEXT CHECK (visibility IN ('all', 'internal', 'tenant_visible'));

-- task_participants (wer darf sehen/bearbeiten)
CREATE TABLE IF NOT EXISTS task_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  role TEXT CHECK (role IN ('creator', 'assignee', 'viewer', 'tenant')),
  can_edit BOOLEAN DEFAULT FALSE,
  can_comment BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- task_attachments (Fotos, Dokumente)
CREATE TABLE IF NOT EXISTS task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.3 Berechtigungsmatrix

| Aktion | Mieter | Vermieter | Hausmeister |
|--------|--------|-----------|-------------|
| Task erstellen | ✅ (eigene Wohnung) | ✅ (alle) | ✅ (zugewiesene Gebäude) |
| Task sehen | ✅ (eigene) | ✅ (alle) | ✅ (zugewiesene) |
| Status ändern | ❌ | ✅ | ✅ (zugewiesene) |
| Kommentieren | ✅ (eigene) | ✅ | ✅ |
| Fotos hinzufügen | ✅ (eigene) | ✅ | ✅ |
| Dokumente verknüpfen | ❌ | ✅ | ✅ |
| Task zuweisen | ❌ | ✅ | ❌ |
| Task löschen | ❌ | ✅ | ❌ |

---

## 4. Implementierungs-Roadmap

### Phase 1: Foundation (Woche 1-2)

**Ziel:** Basis-Struktur in Vermietify erweitern

| Task | Aufwand | Priorität |
|------|---------|-----------|
| Shared Component Library Setup | 1 Tag | P0 |
| Routing für neue Module einrichten | 0.5 Tag | P0 |
| Supabase Types aktualisieren | 0.5 Tag | P0 |
| Layout für eingebettete Module | 1 Tag | P0 |

### Phase 2: Core Features (Woche 3-6)

**Ziel:** Wichtigste Features aus ft_vermietify portieren

| Task | Quelle | Aufwand | Priorität |
|------|--------|---------|-----------|
| BuildingDetail Seite | ft_vermietify | 2 Tage | P0 |
| UnitDetail Seite | ft_vermietify | 2 Tage | P0 |
| TenantDetail Seite | ft_vermietify | 2 Tage | P0 |
| ContractManagement | ft_vermietify | 3 Tage | P0 |
| PaymentTracking | ft_vermietify | 2 Tage | P0 |
| DocumentManagement erweitern | ft_vermietify | 2 Tage | P1 |

### Phase 3: Betriebskosten-Modul (Woche 7-8)

**Ziel:** betriebskosten-helfer als Modul einbetten

| Task | Quelle | Aufwand | Priorität |
|------|--------|---------|-----------|
| BillingWizard portieren | betriebskosten-helfer | 3 Tage | P0 |
| BillingOverview portieren | betriebskosten-helfer | 1 Tag | P0 |
| CostAllocation portieren | betriebskosten-helfer | 2 Tage | P0 |
| Route /betriebskosten einrichten | - | 0.5 Tag | P0 |
| Header entfernen, nahtlos einbetten | - | 0.5 Tag | P0 |

### Phase 4: Zähler-Modul (Woche 9-10)

**Ziel:** leserally-all als Modul einbetten + erweitern

| Task | Quelle | Aufwand | Priorität |
|------|--------|---------|-----------|
| MeterDashboard portieren | leserally-all | 1 Tag | P0 |
| MeterDetail portieren | leserally-all | 1 Tag | P0 |
| ReadMeter portieren | leserally-all | 1 Tag | P0 |
| CSV-Import implementieren | NEU | 2 Tage | P1 |
| Historische Auswertung | NEU | 2 Tage | P1 |
| Integration mit BK-Modul | - | 1 Tag | P0 |

### Phase 5: Shared Task System (Woche 11-13)

**Ziel:** Unified Task-System aus Hausmeister + Mieter-Apps

| Task | Quelle | Aufwand | Priorität |
|------|--------|---------|-----------|
| TaskList portieren | fintu-hausmeister | 1 Tag | P0 |
| TaskDetail portieren | fintu-hausmeister | 2 Tage | P0 |
| TaskForm (Mangel melden) portieren | wohn-held | 1 Tag | P0 |
| TaskComments portieren | fintu-hausmeister | 1 Tag | P0 |
| TaskAttachments portieren | fintu-hausmeister | 1 Tag | P0 |
| Berechtigungssystem implementieren | NEU | 2 Tage | P0 |
| CalendarPage portieren | fintu-hausmeister | 1 Tag | P1 |
| Chat-Integration | fintu-hausmeister | 2 Tage | P1 |

### Phase 6: Mieter-Portal Features (Woche 14-15)

**Ziel:** Mieter-spezifische Views aus wohn-held

| Task | Quelle | Aufwand | Priorität |
|------|--------|---------|-----------|
| TenantUnitView | wohn-held | 1 Tag | P1 |
| TenantFinanceOverview | wohn-held | 1 Tag | P1 |
| TenantDocumentList | wohn-held | 1 Tag | P1 |
| DocumentRequestForm | wohn-held | 1 Tag | P1 |
| TenantMeterReading | wohn-held | 1 Tag | P1 |
| HouseRulesView | wohn-held | 0.5 Tag | P2 |
| EmergencyContacts | wohn-held | 0.5 Tag | P2 |

### Phase 7: Steuern & KI (Woche 16-20)

**Ziel:** Features aus ft_vermietify

| Task | Quelle | Aufwand | Priorität |
|------|--------|---------|-----------|
| TaxDashboard | ft_vermietify | 2 Tage | P1 |
| AnlageVWizard | ft_vermietify | 5 Tage | P1 |
| ElsterIntegration | ft_vermietify | 5 Tage | P2 |
| AIDocumentAnalysis | ft_vermietify | 3 Tage | P2 |
| AITaxAdvisor | ft_vermietify | 3 Tage | P2 |
| WorkflowAutomation | ft_vermietify | 5 Tage | P2 |

---

## 5. Lovable Prompts für Konsolidierung

### 5.1 Foundation

**Shared Component Library:**
```
Erstelle eine shared component library unter src/components/shared/ mit:
- PageHeader.tsx (Titel, Breadcrumbs, Actions)
- DataTable.tsx (sortierbar, filterbar, paginiert)
- StatCard.tsx (Icon, Wert, Trend, Label)
- EmptyState.tsx (Icon, Titel, Beschreibung, Action)
- LoadingState.tsx (Skeleton)
- ErrorState.tsx (mit Retry)
Alle Komponenten sollen das bestehende UI-Kit (shadcn) nutzen.
```

### 5.2 Betriebskosten-Modul

**BK-Abrechnung einbetten:**
```
Erstelle eine Route /betriebskosten mit:
- Übersicht aller Abrechnungen (BillingList)
- KPI-Cards: Offene Abrechnungen, Summe Nachzahlungen, Summe Guthaben
- Button "Neue Abrechnung" → Wizard
- Filter: Jahr, Gebäude, Status

Der Wizard (5 Steps):
1. Gebäude & Zeitraum wählen
2. Kostenarten und Beträge eingeben
3. Verteilerschlüssel festlegen
4. Vorschau pro Mieter
5. PDF generieren & versenden

Verbinde mit Supabase: operating_cost_statements, operating_cost_items, operating_cost_tenant_results
```

### 5.3 Zähler-Modul

**Zähler-Dashboard:**
```
Erstelle eine Route /zaehler mit:
- Übersicht aller Zähler gruppiert nach Gebäude/Einheit
- Filter: Zählertyp (Strom, Gas, Wasser, Heizung), Gebäude
- KPI-Cards: Zähler gesamt, Ablesungen diesen Monat, Ausstehende Ablesungen
- Schnellablesung: Zähler auswählen → Stand eingeben → Speichern

Zähler-Detail (/zaehler/:id):
- Zählerinfo (Nummer, Typ, Einheit, Einbaudatum)
- Ablesehistorie als Tabelle + Chart
- Verbrauchsberechnung zwischen Ablesungen
- Button "Jetzt ablesen"

CSV-Import:
- Upload von historischen Zählerständen
- Format: Zählernummer, Datum, Stand
- Validierung und Vorschau vor Import

Verbinde mit Supabase: meters, meter_readings
```

### 5.4 Shared Task System

**Unified Task Management:**
```
Erstelle ein Task-System unter /aufgaben mit:

Task-Liste:
- Tabs: Alle | Meine | Offen | Erledigt
- Filter: Gebäude, Priorität, Kategorie, Ersteller
- Sortierung: Datum, Priorität, Status
- Karten-Ansicht mit: Titel, Status-Badge, Gebäude/Einheit, Ersteller, Datum

Task-Detail (/aufgaben/:id):
- Header: Titel, Status, Priorität, Kategorie
- Info: Gebäude, Einheit, Ersteller, Zugewiesen an
- Beschreibung (Markdown)
- Fotos-Galerie (hochladen, anzeigen, löschen)
- Dokumente verknüpfen (aus documents-Tabelle)
- Kommentar-Thread (wie Chat)
- Aktivitäts-Timeline

Task erstellen (/aufgaben/neu):
- Titel, Beschreibung
- Gebäude/Einheit auswählen
- Kategorie (Wasserschaden, Heizung, Elektro, Sonstiges)
- Priorität (Niedrig, Normal, Hoch, Dringend)
- Fotos direkt hochladen (Kamera oder Datei)
- Optional: Zuweisen an Hausmeister

Berechtigungen:
- Mieter: Nur eigene Tasks sehen, erstellen, kommentieren
- Vermieter: Alle Tasks, zuweisen, Status ändern, löschen
- Hausmeister: Zugewiesene Tasks, Status ändern, kommentieren

Verbinde mit Supabase: tasks, task_comments, task_attachments, task_participants
Nutze Supabase Realtime für Live-Updates
```

---

## 6. Ordnerstruktur nach Konsolidierung

```
vermieter-freude/src/
├── components/
│   ├── ui/                          # shadcn (besteht)
│   ├── layout/                      # Layout (besteht)
│   ├── shared/                      # NEU: Shared Components
│   │   ├── PageHeader.tsx
│   │   ├── DataTable.tsx
│   │   ├── StatCard.tsx
│   │   └── ...
│   ├── betriebskosten/              # NEU: Von betriebskosten-helfer
│   │   ├── BillingWizard/
│   │   ├── BillingList.tsx
│   │   ├── CostAllocationTable.tsx
│   │   └── ...
│   ├── zaehler/                     # NEU: Von leserally-all
│   │   ├── MeterDashboard.tsx
│   │   ├── MeterCard.tsx
│   │   ├── ReadingForm.tsx
│   │   ├── CSVImport.tsx
│   │   └── ...
│   ├── aufgaben/                    # NEU: Von hausmeister + wohn-held
│   │   ├── TaskList.tsx
│   │   ├── TaskDetail.tsx
│   │   ├── TaskForm.tsx
│   │   ├── TaskComments.tsx
│   │   ├── TaskAttachments.tsx
│   │   └── ...
│   ├── mieter-portal/               # NEU: Von wohn-held
│   │   ├── DefectReportForm.tsx
│   │   ├── TenantUnitView.tsx
│   │   └── ...
│   ├── gebaeude/                    # NEU: Von ft_vermietify
│   │   ├── BuildingDetail.tsx
│   │   ├── BuildingForm.tsx
│   │   └── ...
│   ├── einheiten/                   # NEU: Von ft_vermietify
│   ├── mieter/                      # NEU: Von ft_vermietify
│   ├── vertraege/                   # NEU: Von ft_vermietify
│   ├── zahlungen/                   # NEU: Von ft_vermietify
│   ├── dokumente/                   # Erweitert
│   ├── steuern/                     # NEU: Von ft_vermietify
│   └── ki/                          # NEU: Von ft_vermietify
├── pages/
│   ├── Index.tsx
│   ├── Dashboard.tsx
│   ├── Properties.tsx               # Erweitern
│   ├── Tenants.tsx                  # Erweitern
│   ├── Documents.tsx                # Erweitern
│   ├── Communication.tsx            # Erweitern
│   ├── Finances.tsx                 # Erweitern
│   ├── Taxes.tsx                    # Erweitern
│   ├── betriebskosten/              # NEU
│   │   ├── index.tsx
│   │   └── neu.tsx
│   ├── zaehler/                     # NEU
│   │   ├── index.tsx
│   │   ├── [id].tsx
│   │   └── ablesen.tsx
│   ├── aufgaben/                    # NEU
│   │   ├── index.tsx
│   │   ├── [id].tsx
│   │   └── neu.tsx
│   └── ...
├── hooks/
│   ├── useAuth.tsx                  # Besteht
│   ├── useTasks.tsx                 # NEU
│   ├── useMeters.tsx                # NEU
│   ├── useBillings.tsx              # NEU
│   └── ...
└── types/
    ├── index.ts                     # Erweitern mit allen Typen
    └── ...
```

---

## 7. Timeline

```
Woche 1-2:   Foundation & Setup
             ├── Shared Components
             └── Routing

Woche 3-6:   Core Features (ft_vermietify)
             ├── Building/Unit/Tenant Details
             ├── Contracts
             └── Payments

Woche 7-8:   Betriebskosten-Modul
             └── Von betriebskosten-helfer

Woche 9-10:  Zähler-Modul
             ├── Von leserally-all
             └── + CSV-Import

Woche 11-13: Shared Task System
             ├── Von fintu-hausmeister
             └── Von wohn-held

Woche 14-15: Mieter-Portal Features
             └── Von wohn-held

Woche 16-20: Steuern & KI
             └── Von ft_vermietify

GESAMT: ~20 Wochen für vollständige Konsolidierung
```

---

## 8. Nächste Schritte

1. **Sofort:** Entscheiden ob wir mit Phase 1 (Foundation) starten
2. **Diese Woche:** Shared Component Library erstellen
3. **Nächste Woche:** Erste Core Features portieren

---

*Erstellt: 2026-02-04*
*Version: 1.0*
