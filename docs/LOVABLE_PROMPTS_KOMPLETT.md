# Vermietify Lovable Prompts - Komplette Sammlung

## Übersicht

**43 Prompts** für die vollständige Implementierung von Vermietify in Lovable.

| Phase | Prompts | Features |
|-------|---------|----------|
| 1 | 1-4 | Foundation |
| 2 | 5-11 | Core (Gebäude, Mieter, Verträge, Zahlungen) |
| 3 | 12-17 | Betriebskosten |
| 4 | 18-24 | Zähler |
| 5 | 25 | Task-System |
| 6 | 26 | Mieter-Portal |
| 7 | 27-31 | Steuern, KI, Briefe, E-Signatur, WhatsApp |
| 8 | 32-42 | Integrationen & Erweitert |
| 9 | 43 | Optionale Features |

---

# Phase 1: Foundation

## Prompt 1: Shared Component Library

```
Erstelle eine shared component library unter src/components/shared/ mit folgenden Komponenten:

1. PageHeader.tsx:
- Props: title (string), subtitle? (string), breadcrumbs? (array), actions? (ReactNode)
- Layout: Titel links, Actions rechts
- Breadcrumbs über dem Titel
- Nutze shadcn Typography und Button

2. StatCard.tsx:
- Props: title (string), value (string|number), icon (LucideIcon), trend? ({value: number, isPositive: boolean}), description? (string)
- Card mit Icon oben links, Wert groß, Titel klein
- Optional: Trend-Indikator mit Pfeil und Prozent

3. DataTable.tsx (generisch):
- Props: columns (ColumnDef[]), data (T[]), searchable? (boolean), searchPlaceholder? (string), pagination? (boolean), pageSize? (number)
- Nutze @tanstack/react-table
- Such-Input oben, Pagination unten
- Sortierbare Spalten

4. EmptyState.tsx:
- Props: icon (LucideIcon), title (string), description (string), action? ({label: string, onClick: () => void})
- Zentriert, Icon groß und grau, Button optional

5. LoadingState.tsx:
- Props: rows? (number, default 5)
- Skeleton-Rows mit shadcn Skeleton

6. ConfirmDialog.tsx:
- Props: open (boolean), onOpenChange, title (string), description (string), confirmLabel? (string), onConfirm () => void, destructive? (boolean)
- AlertDialog von shadcn
- Cancel und Confirm Buttons

Exportiere alle aus src/components/shared/index.ts
```

---

## Prompt 2: Neue Routen einrichten

```
Erweitere das Routing in App.tsx mit folgenden neuen Routen:

/gebaeude/:id - BuildingDetail (erstelle Placeholder-Seite)
/einheiten/:id - UnitDetail (erstelle Placeholder-Seite)
/mieter/:id - TenantDetail (erstelle Placeholder-Seite)
/vertraege - ContractList (erstelle Placeholder-Seite)
/vertraege/:id - ContractDetail (erstelle Placeholder-Seite)
/zahlungen - PaymentList (erstelle Placeholder-Seite)
/betriebskosten - OperatingCosts (erstelle Placeholder-Seite)
/betriebskosten/neu - NewBilling (erstelle Placeholder-Seite)
/zaehler - MeterDashboard (erstelle Placeholder-Seite)
/zaehler/:id - MeterDetail (erstelle Placeholder-Seite)
/aufgaben - TaskList (erstelle Placeholder-Seite)
/aufgaben/:id - TaskDetail (erstelle Placeholder-Seite)
/aufgaben/neu - NewTask (erstelle Placeholder-Seite)

Jede Placeholder-Seite soll:
- PageHeader mit Titel und Breadcrumb nutzen
- EmptyState mit "Coming Soon" anzeigen
- ProtectedRoute verwenden (wie bestehende Seiten)

Aktualisiere auch die Sidebar-Navigation mit den neuen Menüpunkten:
- Immobilien (besteht) → Untermenü: Gebäude, Einheiten
- Mieter (besteht)
- Verträge (neu)
- Zahlungen (neu)
- Betriebskosten (neu)
- Zähler (neu)
- Aufgaben (neu)
- Dokumente (besteht)
- Kommunikation (besteht)
```

---

## Prompt 3: Supabase Types erweitern

```
Generiere TypeScript-Types für folgende Supabase-Tabellen und füge sie zu src/types/database.ts hinzu:

buildings:
- id: string (UUID)
- organization_id: string
- name: string
- address: { street: string, zip: string, city: string, country: string }
- image_url?: string
- total_units: number
- created_at: string
- updated_at: string

units:
- id: string
- building_id: string
- name: string (z.B. "Wohnung 1.OG links")
- floor?: number
- size_sqm?: number
- rooms?: number
- rent_cold: number (Cents)
- rent_warm?: number
- status: 'available' | 'rented' | 'maintenance'
- current_tenant_id?: string
- created_at: string

lease_contracts:
- id: string
- unit_id: string
- tenant_id: string
- start_date: string
- end_date?: string
- rent_amount: number
- deposit_amount: number
- deposit_paid: boolean
- status: 'draft' | 'active' | 'terminated' | 'expired'
- created_at: string

tasks:
- id: string
- building_id?: string
- unit_id?: string
- title: string
- description?: string
- category: 'damage' | 'maintenance' | 'request' | 'other'
- priority: 'low' | 'normal' | 'high' | 'urgent'
- status: 'open' | 'in_progress' | 'completed' | 'cancelled'
- created_by: string
- assigned_to?: string
- source: 'tenant' | 'landlord' | 'caretaker' | 'system'
- created_at: string
- updated_at: string

meters:
- id: string
- unit_id: string
- meter_number: string
- type: 'electricity' | 'gas' | 'water' | 'heating'
- installation_date?: string
- last_reading_date?: string
- last_reading_value?: number

meter_readings:
- id: string
- meter_id: string
- reading_date: string
- value: number
- image_url?: string
- created_by: string
- created_at: string

operating_cost_statements:
- id: string
- building_id: string
- period_start: string
- period_end: string
- status: 'draft' | 'calculated' | 'sent' | 'completed'
- total_costs: number
- created_at: string

Erstelle auch Helper-Types:
- BuildingWithUnits (Building + units[])
- UnitWithTenant (Unit + tenant?)
- TaskWithAttachments (Task + attachments[])
```

---

## Prompt 4: Custom Hooks

```
Erstelle folgende Custom Hooks unter src/hooks/:

1. useBuildings.ts:
- Nutzt Supabase Client
- fetchBuildings(): Building[] mit Pagination
- fetchBuilding(id): BuildingWithUnits
- createBuilding(data): Building
- updateBuilding(id, data): Building
- deleteBuilding(id): void
- Nutze React Query für Caching

2. useUnits.ts:
- fetchUnits(buildingId?): Unit[]
- fetchUnit(id): UnitWithTenant
- createUnit(data): Unit
- updateUnit(id, data): Unit

3. useTasks.ts:
- fetchTasks(filters?): Task[]
- fetchTask(id): TaskWithAttachments
- createTask(data): Task
- updateTask(id, data): Task
- addComment(taskId, content): TaskComment
- addAttachment(taskId, file): TaskAttachment

4. useMeters.ts:
- fetchMeters(unitId?): Meter[]
- fetchMeter(id): Meter with readings
- addReading(meterId, data): MeterReading
- importReadings(file: File): MeterReading[]

5. useContracts.ts:
- fetchContracts(filters?): LeaseContract[]
- fetchContract(id): LeaseContract with unit and tenant
- createContract(data): LeaseContract
- terminateContract(id, date): LeaseContract

Alle Hooks sollen:
- Loading, Error, Data states zurückgeben
- React Query mutations mit optimistic updates nutzen
- Toast-Notifications bei Erfolg/Fehler zeigen
```

---

# Phase 2: Core Features

## Prompt 5: BuildingDetail Seite

```
Erstelle die BuildingDetail-Seite unter src/pages/gebaeude/[id].tsx:

Layout:
- PageHeader mit Gebäudename, Adresse als Subtitle, Breadcrumb (Dashboard > Gebäude > [Name])
- Actions: "Bearbeiten", "Einheit hinzufügen"

Content mit Tabs (shadcn Tabs):

TAB 1 - Übersicht:
- 4 StatCards in einer Row:
  • Einheiten gesamt (Building icon)
  • Vermietet (CheckCircle icon, grün)
  • Leer (Circle icon, orange)
  • Mieteinnahmen/Monat (Euro icon)
- Gebäude-Info Card:
  • Adresse (mit Google Maps Link)
  • Baujahr, Energieausweis
  • Bild (oder Placeholder)
- Letzte Aktivitäten (5 Einträge)

TAB 2 - Einheiten:
- DataTable mit Spalten: Name, Etage, m², Zimmer, Miete kalt, Status, Mieter, Aktionen
- Status als Badge (Vermietet=grün, Frei=blau, Wartung=orange)
- Row-Click → navigiert zu /einheiten/:id
- Button "Einheit hinzufügen" öffnet Dialog

TAB 3 - Dokumente:
- Liste der Gebäude-Dokumente (Grundbuch, Versicherung, etc.)
- Upload-Button
- Filter nach Dokumenttyp

TAB 4 - Finanzen:
- Mieteinnahmen-Chart (letzte 12 Monate)
- Kosten-Übersicht (Instandhaltung, Versicherung, etc.)
- Link zu Betriebskostenabrechnung

Nutze useBuilding(id) Hook für Daten.
Zeige LoadingState während Laden, ErrorState bei Fehler.
```

---

## Prompt 6: Einheit hinzufügen Dialog

```
Erstelle einen UnitFormDialog Komponenten unter src/components/gebaeude/UnitFormDialog.tsx:

Props:
- open: boolean
- onOpenChange: (open: boolean) => void
- buildingId: string
- unit?: Unit (für Edit-Modus)
- onSuccess?: () => void

Dialog mit Formular (react-hook-form + zod):

Felder:
- name: string (required) - z.B. "Wohnung 1.OG links"
- floor: number (optional)
- size_sqm: number (optional)
- rooms: number (optional)
- rent_cold: number (required) - Kaltmiete in Euro (konvertiere zu Cents beim Speichern)
- additional_costs: number (optional) - Nebenkosten-Vorauszahlung
- deposit: number (optional) - Kaution
- features: multi-select Checkboxes (Balkon, Keller, Aufzug, Stellplatz, Einbauküche)
- notes: textarea (optional)

Validierung:
- name min 2 Zeichen
- rent_cold > 0
- size_sqm > 0 wenn angegeben

Buttons:
- Abbrechen (schließt Dialog)
- Speichern (disabled während loading)

Bei Erfolg:
- Toast "Einheit erstellt" / "Einheit aktualisiert"
- onSuccess callback
- Dialog schließen
```

---

## Prompt 7: UnitDetail Seite

```
Erstelle die UnitDetail-Seite unter src/pages/einheiten/[id].tsx:

Layout:
- PageHeader mit Einheitname, Gebäudename als Link, Breadcrumb
- Actions: "Bearbeiten", "Vertrag erstellen" (wenn status=available)

Content mit Tabs:

TAB 1 - Übersicht:
- StatCards:
  • Status (Badge)
  • Miete kalt
  • Nebenkosten
  • Größe m²
- Einheit-Info Card:
  • Etage, Zimmer, Features (als Badges)
  • Notizen
- Wenn vermietet: Mieter-Info Card mit Link zu /mieter/:id

TAB 2 - Mietvertrag:
- Wenn aktiver Vertrag: Vertragsdetails anzeigen
  • Mieter, Mietbeginn, Miete, Kaution (gezahlt?)
  • Button "Vertrag kündigen"
- Wenn kein Vertrag: EmptyState "Keine aktiver Mietvertrag"
  • Button "Vertrag erstellen"

TAB 3 - Zähler:
- Liste aller Zähler der Einheit
- Letzter Stand, letzte Ablesung
- Button "Zähler hinzufügen"
- Button "Ablesen" pro Zähler
- Link zu /zaehler/:id

TAB 4 - Zahlungen:
- DataTable mit Zahlungshistorie
- Spalten: Datum, Typ, Betrag, Status
- Filter nach Jahr/Status

TAB 5 - Dokumente:
- Einheit-spezifische Dokumente
- Übergabeprotokolle, Fotos

Nutze useUnit(id) Hook.
```

---

## Prompt 8: TenantDetail Seite

```
Erstelle die TenantDetail-Seite unter src/pages/mieter/[id].tsx:

Layout:
- PageHeader mit Avatar + Name, E-Mail als Subtitle
- Actions: "Bearbeiten", "Nachricht senden"

Profil-Header Card:
- Avatar (Initialen wenn kein Bild)
- Name, E-Mail, Telefon
- Status-Badge (Aktiv, Gekündigt, Ehemalig)
- Mitglied seit

Content mit Tabs:

TAB 1 - Übersicht:
- Aktuelle Wohnung Card (wenn vorhanden):
  • Gebäude + Einheit mit Links
  • Adresse
  • Mietbeginn
  • Monatliche Miete
- StatCards:
  • Miete gesamt gezahlt
  • Offene Zahlungen
  • Vertragslaufzeit

TAB 2 - Mietvertrag:
- Vertragsdetails
- Miete, Nebenkosten, Kaution
- Sondervereinbarungen
- Dokumente (Vertrag-PDF)

TAB 3 - Zahlungen:
- DataTable: Monat, Sollbetrag, Gezahlt, Status, Zahlungsdatum
- Status-Badges: Bezahlt (grün), Offen (gelb), Überfällig (rot), Teilzahlung (orange)
- Filter: Jahr, Status
- Summen-Row am Ende

TAB 4 - Dokumente:
- Vom Mieter hochgeladene Dokumente
- Vertrag, Übergabeprotokoll, Korrespondenz
- Upload-Button

TAB 5 - Kommunikation:
- Chat-Verlauf mit dem Mieter
- Nachrichten-Input unten
- Nutze Supabase Realtime

TAB 6 - Aktivitäten:
- Timeline aller Ereignisse
- Zahlungen, Meldungen, Dokumente, Vertragsänderungen

Nutze useTenant(id) Hook.
```

---

## Prompt 9: Vertragsverwaltung

```
Erstelle die Verträge-Seite unter src/pages/vertraege/index.tsx:

Layout:
- PageHeader "Mietverträge", Button "Neuer Vertrag"
- Filter-Bar: Status (Alle/Aktiv/Gekündigt/Abgelaufen), Gebäude-Select, Suche

DataTable:
- Spalten: Mieter, Einheit, Gebäude, Mietbeginn, Miete, Status, Aktionen
- Status als Badge mit Farben
- Sortierbar nach allen Spalten
- Row-Click → /vertraege/:id

Stats oben:
- Aktive Verträge (Zahl)
- Auslaufend in 3 Monaten (Zahl, orange)
- Kündigungen diesen Monat (Zahl)

---

Erstelle ContractDetail unter src/pages/vertraege/[id].tsx:

Layout:
- PageHeader mit "Mietvertrag", Mieter + Einheit als Subtitle
- Actions: "Bearbeiten", "Kündigen", "PDF exportieren"

Content:
- Status-Banner oben (bei Kündigung: Kündigungsdatum anzeigen)

Cards:
1. Mietobjekt
   - Gebäude, Einheit, Adresse
   - Links zu Detail-Seiten

2. Mieter
   - Name, Kontakt
   - Link zu /mieter/:id

3. Konditionen
   - Mietbeginn, Mietende (wenn befristet)
   - Kaltmiete, Nebenkosten, Gesamtmiete
   - Kündigungsfrist
   - Zahlungstag (z.B. 3. des Monats)

4. Kaution
   - Betrag
   - Status (Gezahlt/Ausstehend)
   - Zahlungsdatum

5. Sondervereinbarungen
   - Freitext/Markdown

6. Dokumente
   - Vertrags-PDF
   - Übergabeprotokoll
   - Nachträge
```

---

## Prompt 10: Vertrags-Wizard

```
Erstelle einen ContractWizard unter src/components/vertraege/ContractWizard.tsx:

Multi-Step Wizard mit 5 Schritten:

STEP 1 - Mietobjekt:
- Gebäude auswählen (Dropdown)
- Einheit auswählen (Dropdown, gefiltert nach Gebäude, nur status='available')
- Zeige Einheit-Details (m², Zimmer, Miete)

STEP 2 - Mieter:
- Option A: Bestehenden Mieter auswählen (Suche/Dropdown)
- Option B: Neuen Mieter anlegen (inline Formular)
  • Vorname, Nachname (required)
  • E-Mail (required)
  • Telefon
  • Geburtsdatum

STEP 3 - Konditionen:
- Mietbeginn (Datepicker, required)
- Mietende (Datepicker, optional - bei Befristung)
- Kaltmiete (vorausgefüllt von Einheit, editierbar)
- Nebenkosten-Vorauszahlung
- Kaution (vorausgefüllt: 3x Kaltmiete)
- Zahlungstag im Monat (1-28)
- Kündigungsfrist in Monaten (default: 3)

STEP 4 - Sondervereinbarungen:
- Textarea für besondere Regelungen
- Checkboxes für häufige Klauseln:
  • Haustiere erlaubt
  • Untervermietung erlaubt
  • Kleinreparaturklausel
  • Schönheitsreparaturen

STEP 5 - Zusammenfassung:
- Alle Daten übersichtlich anzeigen
- Checkbox "Ich bestätige die Richtigkeit"
- Buttons: "Zurück", "Vertrag erstellen"

Bei Erfolg:
- Vertrag in Supabase speichern
- Einheit-Status auf 'rented' setzen
- Mieter mit Einheit verknüpfen
- Toast "Vertrag erstellt"
- Redirect zu /vertraege/:id
```

---

## Prompt 11: Zahlungsverwaltung

```
Erstelle die Zahlungen-Seite unter src/pages/zahlungen/index.tsx:

Layout:
- PageHeader "Zahlungen"
- Tabs: Übersicht | Fällig | Überfällig | Historie

TAB Übersicht:
- StatCards:
  • Einnahmen diesen Monat
  • Ausstehend
  • Überfällig (rot)
  • Zahlungsquote %
- Chart: Einnahmen letzte 12 Monate (Bar oder Area)
- Top 5 überfällige Zahlungen (Quick-List)

TAB Fällig (diesen Monat):
- DataTable: Mieter, Einheit, Betrag, Fällig am, Tage übrig, Aktionen
- Action: "Als bezahlt markieren"
- Bulk-Action: Mehrere als bezahlt markieren

TAB Überfällig:
- DataTable: Mieter, Einheit, Betrag, Fällig am, Tage überfällig, Aktionen
- Actions: "Als bezahlt markieren", "Mahnung senden", "Teilzahlung"
- Row-Farbe: Je länger überfällig, desto röter

TAB Historie:
- DataTable: Datum, Mieter, Einheit, Typ, Betrag, Status
- Filter: Zeitraum, Mieter, Gebäude, Status
- Export-Button (CSV)

---

Dialog "Zahlung erfassen":
- Mieter/Vertrag auswählen
- Betrag
- Zahlungsdatum
- Zahlungsmethode (Überweisung, Lastschrift, Bar)
- Verwendungszweck/Referenz
- Typ (Miete, Kaution, Nebenkosten-Nachzahlung)

Dialog "Teilzahlung":
- Ursprungsbetrag anzeigen
- Gezahlter Betrag eingeben
- Restbetrag wird berechnet
- Optional: Zahlungsvereinbarung erstellen
```

---

# Phase 3: Betriebskosten

## Prompt 12: Betriebskosten Übersicht

```
Erstelle die Betriebskosten-Seite unter src/pages/betriebskosten/index.tsx:

Layout:
- PageHeader "Betriebskostenabrechnung", Button "Neue Abrechnung"
- Keine separate Navigation/Header - nahtlos in Vermietify integriert

Stats (4 StatCards):
- Abrechnungen gesamt
- Offen/In Bearbeitung (gelb)
- Nachzahlungen gesamt (€)
- Guthaben gesamt (€)

Filter-Bar:
- Jahr (Dropdown: 2024, 2023, 2022...)
- Gebäude (Multi-Select)
- Status (Alle/Entwurf/Berechnet/Versendet/Abgeschlossen)

DataTable:
- Spalten: Gebäude, Zeitraum, Einheiten, Gesamtkosten, Status, Erstellt, Aktionen
- Status-Badges mit Farben
- Aktionen: Ansehen, Bearbeiten, Löschen, PDF, Versenden
- Row-Click → /betriebskosten/:id

EmptyState wenn keine Abrechnungen:
- Icon: FileSpreadsheet
- "Noch keine Betriebskostenabrechnungen"
- "Erstellen Sie Ihre erste Abrechnung für ein Gebäude"
- Button "Neue Abrechnung"
```

---

## Prompt 13: BK-Abrechnung Detail

```
Erstelle die BK-Detail-Seite unter src/pages/betriebskosten/[id].tsx:

Layout:
- PageHeader mit Gebäudename + Zeitraum
- Actions: "Bearbeiten", "PDF generieren", "An Mieter senden"
- Status-Banner oben (Entwurf/Berechnet/Versendet)

Content:

Section 1 - Übersicht:
- Card mit: Gebäude, Abrechnungszeitraum, Erstelldatum
- Gesamtkosten, Anzahl Einheiten, Anzahl Mieter

Section 2 - Kostenübersicht:
- DataTable der Kostenarten:
  • Kostenart (Heizung, Wasser, Müll, etc.)
  • Gesamtbetrag
  • Verteilerschlüssel (m², Personen, Einheiten, Verbrauch)
  • Anteil pro Einheit (Durchschnitt)
- Summenzeile am Ende
- Pie-Chart: Kostenverteilung nach Kostenart

Section 3 - Ergebnisse pro Mieter:
- DataTable:
  • Mieter, Einheit, Vorauszahlungen, Anteil Kosten, Ergebnis
  • Ergebnis-Spalte: Grün (Guthaben) oder Rot (Nachzahlung)
- Summen: Gesamte Nachzahlungen, Gesamte Guthaben

Section 4 - Dokumente:
- Generierte PDFs (Gesamt-Abrechnung, Einzel-Abrechnungen pro Mieter)
- Upload für Belege
```

---

## Prompt 14: BK-Wizard Step 1-2

```
Erstelle den BK-Wizard unter src/pages/betriebskosten/neu.tsx:

Wizard mit Progress-Indicator oben (5 Steps)

STEP 1 - Gebäude & Zeitraum:
- Gebäude auswählen (Dropdown mit Suche)
- Nach Auswahl: Zeige Gebäude-Info (Adresse, Anzahl Einheiten)
- Abrechnungszeitraum:
  • Von (Datepicker, default: 01.01. Vorjahr)
  • Bis (Datepicker, default: 31.12. Vorjahr)
- Validierung: Von < Bis, max 1 Jahr

STEP 2 - Kostenarten & Beträge:
- Liste der Standard-Kostenarten (vordefiniert):
  • Heizung, Warmwasser, Kaltwasser/Abwasser, Müllabfuhr
  • Hausmeister, Gartenpflege, Allgemeinstrom
  • Gebäudeversicherung, Grundsteuer, Aufzug
  • Schornsteinfeger, Sonstige

- Pro Kostenart:
  • Checkbox (aktiv/inaktiv)
  • Betrag (Euro, Input)
  • Verteilerschlüssel (Dropdown: Nach m², Nach Personen, Nach Einheiten, Nach Verbrauch)

- Button "Kostenart hinzufügen" für individuelle Kosten
- Summe aller Kosten unten anzeigen

Buttons: "Zurück", "Weiter"
Speichere Zwischenstand in localStorage oder Zustand
```

---

## Prompt 15: BK-Wizard Step 3-4

```
Erweitere den BK-Wizard:

STEP 3 - Einheiten & Verteilerdaten:
- DataTable aller Einheiten des Gebäudes:
  • Einheit (Name)
  • Mieter (Name oder "Leerstand")
  • m² (editierbar)
  • Personen (editierbar, Anzahl)
  • Anteil Heizung % (wenn Verbrauchsabrechnung)
  • Vorauszahlungen gesamt (berechnet aus Zahlungen)

- Für jeden Verteilerschlüssel Summe anzeigen:
  • Gesamt m²: XXX
  • Gesamt Personen: XX
  • Gesamt Einheiten: XX

- Bei Leerstand:
  • Option: "Leerstandskosten auf Vermieter" (Checkbox)

- Validierung: Alle Einheiten müssen m² haben wenn "Nach m²" gewählt

STEP 4 - Berechnung & Vorschau:
- System berechnet automatisch:
  • Anteil pro Einheit für jede Kostenart
  • Summe der Kostenanteile pro Einheit
  • Abzug der Vorauszahlungen
  • Ergebnis (Nachzahlung/Guthaben)

- Ergebnis-Tabelle:
  | Einheit | Mieter | Kosten-Anteil | Vorauszahlungen | Ergebnis |

- Farbcodierung: Rot = Nachzahlung, Grün = Guthaben
- Detailansicht pro Mieter aufklappbar
```

---

## Prompt 16: BK-Wizard Step 5

```
Erweitere den BK-Wizard:

STEP 5 - Zusammenfassung & Abschluss:

Summary Cards:
1. Abrechnungsdetails (Gebäude, Zeitraum, Einheiten)
2. Kostenübersicht (Gesamtkosten, Kostenarten)
3. Ergebnisse (Nachzahlungen, Guthaben)

Optionen:
- [ ] Abrechnungen als PDF generieren
- [ ] Einzelabrechnungen pro Mieter erstellen
- [ ] Abrechnungen per E-Mail versenden

Frist für Nachzahlung: Datepicker (default: 4 Wochen)

Buttons: "Als Entwurf speichern", "Abrechnung erstellen"

Bei Erfolg:
- Speichere in Supabase (operating_cost_statements, items, results)
- Generiere PDFs
- Toast + Redirect
```

---

## Prompt 17: Kostenarten-Katalog

```
Erstelle Kostenarten-Verwaltung unter src/pages/betriebskosten/kostenarten.tsx:

- DataTable: Name, Beschreibung, Standard-Verteilerschlüssel, Umlagefähig, Aktionen
- Dialog für Erstellen/Bearbeiten
- Standard-Kostenarten sind nicht löschbar (Badge "System")
- Seed mit allen üblichen BK-Kostenarten nach BetrKV
```

---

# Phase 4: Zähler

## Prompt 18: Zähler-Dashboard

```
Erstelle die Zähler-Seite unter src/pages/zaehler/index.tsx:

Stats: Zähler gesamt, Ablesungen diesen Monat, Ausstehende Ablesungen, Durchschnittlicher Verbrauch

Filter: Zählertyp, Gebäude, Status

Gruppierte Ansicht nach Gebäude mit DataTable:
- Spalten: Zählernummer, Typ (mit Icon), Einheit, Letzter Stand, Letzte Ablesung, Status, Aktionen
- Typ-Icons: Zap (Strom), Flame (Gas), Droplet (Wasser), Thermometer (Heizung)
- Status-Badge: Aktuell (grün), Ablesung fällig (orange), Überfällig (rot)
- Quick-Action "Ablesen" öffnet Dialog
```

---

## Prompt 19: Zähler hinzufügen

```
Erstelle MeterFormDialog unter src/components/zaehler/MeterFormDialog.tsx:

Formular:
- Gebäude, Einheit (Dropdowns)
- Zählernummer (string, required, unique)
- Zählertyp (Strom, Gas, Wasser, Heizung)
- Einbaudatum, Eichgültigkeit bis
- Anfangsstand (optional)
- Notizen

Bei Speichern: Erstelle Zähler + erste Ablesung wenn Anfangsstand angegeben
```

---

## Prompt 20: Zähler-Detail

```
Erstelle ZählerDetail unter src/pages/zaehler/[id].tsx:

Zähler-Info Card + Statistiken (3 StatCards)
Verbrauchschart (AreaChart, 24 Monate)
Ablesehistorie als DataTable mit Verbrauchsberechnung
Verbrauchsanalyse (Vergleich Vorjahr, Warnung bei Auffälligkeiten)
```

---

## Prompt 21: Schnell-Ablesung

```
Erstelle QuickReadingDialog:

- Zählerinfo anzeigen
- Ablesedatum, Stand eingeben
- Validierung: Stand >= letzter Stand (mit Überlauf-Option)
- Foto optional (Kamera + Upload)
- Verbrauchsberechnung live anzeigen
```

---

## Prompt 22: CSV-Import

```
Erstelle CSVImportDialog:

Step 1: Datei hochladen (Drag & Drop)
Step 2: Spalten-Mapping
Step 3: Validierung (zeige Fehler/Warnungen)
Step 4: Import mit Progress

Format: Zählernummer, Datum, Stand
Option für Zähler-Neuanlage wenn nicht gefunden
```

---

## Prompt 23: Verbrauchsauswertung

```
Erstelle src/pages/zaehler/auswertung.tsx:

Filter: Zeitraum, Zählertyp, Gebäude, Einheit

Ergebnis:
- Gesamtverbrauch pro Typ (4 Cards)
- LineChart monatlicher Verbrauch
- Gebäude-Vergleich (BarChart, normalisiert auf m²)
- Detail-Tabelle mit Export
- Auffälligkeiten automatisch erkennen
```

---

## Prompt 24: BK-Integration Zähler

```
Erweitere BK-Wizard Step 2 für Verbrauchsabrechnung:

Bei Kostenart mit "Nach Verbrauch":
- Dialog "Zählerstände für Abrechnung"
- Zeige Start- und Endstand pro Einheit
- Warnung bei fehlenden Ständen
- Option für manuelle Eingabe / Schätzwert
- Automatische Verbrauchsanteile berechnen
```

---

# Phase 5: Task-System

## Prompt 25: Komplettes Task-System

```
Erstelle vollständiges Aufgaben-/Ticket-System:

SEITE 1: /aufgaben
- Tabs: Alle | Offen | In Bearbeitung | Erledigt
- Filter: Gebäude, Priorität, Kategorie, Ersteller-Typ
- DataTable mit Status-, Priorität-Badges
- Row-Click → Detail

SEITE 2: /aufgaben/:id
- Header mit Status, Priorität
- Info-Cards, Beschreibung
- Foto-Galerie mit Upload
- Dokumente verknüpfen
- Kommentar-Thread (Realtime)
- Aktivitäts-Timeline

SEITE 3: /aufgaben/neu
- Formular: Titel, Beschreibung, Gebäude, Einheit, Kategorie, Priorität
- Fotos hochladen (Kamera + Datei)
- Zuweisen an Hausmeister

KOMPONENTEN: TaskCard, TaskStatusBadge, TaskPriorityBadge, TaskComments, TaskAttachments

BERECHTIGUNGEN (RLS):
- Mieter: Nur eigene sehen/erstellen
- Vermieter: Alle sehen, zuweisen
- Hausmeister: Zugewiesene bearbeiten

REALTIME für Kommentare aktivieren
```

---

# Phase 6: Mieter-Portal

## Prompt 26: Mieter-Portal komplett

```
Erstelle Mieter-spezifische Views:

/mieter-portal - Dashboard mit Quick-Actions
/mieter-portal/mangel-melden - 3-Step Wizard
/mieter-portal/zaehler - Eigene Zähler ablesen
/mieter-portal/dokumente - Eigene + vom Vermieter
/mieter-portal/finanzen - Miete, Zahlungshistorie
/mieter-portal/wohnung - Wohnungsdetails, Kontakte, Hausordnung

Separate Sidebar-Navigation für Mieter-Portal
Role-Check bei allen Seiten
```

---

# Phase 7: Steuern, KI, Integrationen

## Prompt 27: Steuern & KI

```
STEUERN:
/steuern - Dashboard mit Jahres-Stats
/steuern/anlage-v - 5-Step Wizard für Anlage V
/steuern/belege - Upload mit OCR-Vorschlag

KI:
- AIAssistant Floating Button (Chat-Drawer)
- Kontext-aware, kann auf Daten zugreifen
- /steuern/ki-berater - Vollbild Chat

DOKUMENT-KI:
- Button "Mit KI analysieren" bei Dokumenten
- Extrahiert Datum, Betrag, Kategorie
```

---

## Prompt 28: Admin & Analytics

```
ADMIN (role=admin):
/admin - System-Stats, Health
/admin/benutzer - User CRUD
/admin/organisationen - Org Management

ANALYTICS:
/analytics - Dashboard mit Widgets
- Einnahmen-Entwicklung
- Leerstandsquote
- Zahlungsmoral
- Rendite pro Objekt
- Kosten-Breakdown
- Report-Export
```

---

## Prompt 29: LetterXpress

```
/briefe - Übersicht, Stats
Neuer Brief Wizard:
- Empfänger (Mieter oder manuell)
- Inhalt (PDF upload oder Template)
- Versandoptionen (Farbe, Einschreiben)
- Kosten-Vorschau

/briefe/vorlagen - Template-Editor
/briefe/einstellungen - API-Key, Absender, Briefpapier

Automatisierung: Trigger für Mahnungen, BK-Versand

Supabase: letter_orders, Edge Functions für API
```

---

## Prompt 30: E-Signatur

```
/unterschriften - Übersicht aller Signatur-Requests

Wizard:
- Dokument wählen/hochladen
- Unterzeichner definieren
- Signaturfelder platzieren (Drag & Drop auf PDF)
- Optionen (Ablauf, Erinnerungen)

Integration im Mieter-Portal
Webhook für Status-Updates

Supabase: esignature_orders
```

---

## Prompt 31: WhatsApp

```
/whatsapp - Chats | Broadcasts | Vorlagen | Einstellungen

Chat-Interface wie WhatsApp Web
Broadcasts mit genehmigten Templates
Vorlagen einreichen (WhatsApp Policy)

Integration überall: Quick-Action "Per WhatsApp"
Opt-in Management (DSGVO)

Supabase: whatsapp_messages, whatsapp_contacts
Realtime für eingehende Nachrichten
```

---

# Phase 8: Erweiterte Features

## Prompt 32: FinAPI Bank-Integration

```
/banking - Dashboard mit Konten-Cards
/banking/verbinden - FinAPI Widget (Bank suchen, Login, 2FA)
/banking/transaktionen - Liste mit Auto-Match-Vorschlägen
/banking/regeln - Matching-Regeln verwalten

Automatisierung:
- Täglicher Sync
- Regeln anwenden
- Bei Mietzahlung erkannt → Payment-Status updaten

Supabase: finapi_connections, bank_accounts, bank_transactions, transaction_rules
Edge Functions: connect, sync, webhook, auto-match
```

---

## Prompt 33: ELSTER

```
/steuern/elster - Dashboard mit Zertifikat-Status
/steuern/elster/senden - Wizard (Formular wählen, Daten prüfen, PIN, Übertragen)

Bescheid-Abruf automatisch
Vergleich Erklärung vs. Bescheid

Supabase: elster_certificates, elster_submissions, elster_notices
Edge Functions: generate-xml, submit, fetch-notices
```

---

## Prompt 34: Übergabeprotokoll

```
/uebergaben - Liste (Geplant, Durchgeführt)
/uebergaben/neu - Wizard (Typ, Einheit, Räume definieren)
/uebergaben/:id - Interaktives Protokoll (Mobile-optimiert)

Pro Raum: Checkliste, Mängel mit Fotos, Schweregrad
Zähler-Erfassung, Schlüsselübergabe
Touch-Unterschriften (SignaturePad)
PDF-Generierung

Supabase: handover_protocols, rooms, defects, signatures, keys
```

---

## Prompt 35: Kalender

```
/kalender - FullCalendar View (Monat/Woche/Tag/Liste)
Farbcodierung nach Event-Typ

Event-Typen: Besichtigung, Übergabe, Frist, Zahlungsfrist, Wartung, Sonstig

Automatische Termine aus Verträgen
Erinnerungen (In-App, E-Mail, Push)
iCal-Export/-Feed

Supabase: calendar_events, calendar_reminders
```

---

## Prompt 36: Indexmiete

```
/miete/anpassungen - Tabs: Indexmieten | Staffelmieten | Mieterhöhungen

Indexmieten:
- Aktuelle Indexänderung anzeigen
- Fällige Anpassungen als DataTable
- Anpassungs-Dialog mit Berechnung
- Ankündigung generieren

Automatischer VPI-Abruf vom Statistischen Bundesamt
Notification bei fälligen Anpassungen

Supabase: rent_adjustments, vpi_index
```

---

## Prompt 37: CO2-Kostenaufteilung

```
/co2 - Dashboard mit Gebäude-Effizienz

CO2-Calculator:
- Gebäudedaten, Energieausweis
- Verbrauchsdaten
- Stufen-Berechnung (1-10 nach Gesetz)
- Aufteilung Mieter/Vermieter

Integration in BK-Abrechnung

Supabase: co2_calculations, energy_certificates
```

---

## Prompt 38: Dokument-OCR

```
Erweiterter Upload-Flow:
1. Upload
2. Automatische OCR + KI-Klassifizierung
3. Vorschau mit extrahierten Daten
4. Bestätigen/Korrigieren

Dokumenttypen erkennen: Rechnung, Bescheid, Vertrag, Brief, etc.
Volltextsuche über OCR-Text
Automatische Aktionen (Rechnung → Buchungsvorschlag)

Supabase: document_ocr_results
Edge Functions: process-ocr, extract-data
```

---

## Prompt 39: E-Mail-Templates

```
/kommunikation/vorlagen - Template-Editor
/kommunikation/senden - Compose mit Platzhaltern
/kommunikation/verlauf - Gesendete E-Mails

Rich-Text-Editor mit Platzhalter-Insertion
Standard-Vorlagen (Willkommen, Mahnung, BK, etc.)
Tracking (Gesendet, Zugestellt, Geöffnet)

Supabase: email_templates, email_log
Edge Function: send-email mit Resend/SendGrid
```

---

## Prompt 40: Immobilienportale

```
/inserate - Liste mit Portal-Status-Icons
Inserat-Editor (5 Steps: Grunddaten, Details, Preise, Fotos, Portale)
Anfragen-Inbox mit Quick-Actions
Portal-Verbindungen verwalten

Automatisch deaktivieren bei Vermietung

Supabase: listings, listing_portals, listing_inquiries
Edge Functions: publish-to-immoscout, publish-to-immowelt, sync-inquiries
```

---

## Prompt 41: Workflow-Builder

```
/automatisierung - Dashboard mit Workflow-Liste
/automatisierung/neu - Visueller Builder

TRIGGER: Zeitbasiert oder Ereignisbasiert
BEDINGUNGEN: Filter (Gebäude, Status, Betrag, etc.)
AKTIONEN: E-Mail, Notification, Task, Brief, WhatsApp, Webhook, Warten

Ausführungs-Log mit Details
Vorgefertigte Templates

Supabase: workflows, workflow_executions
Edge Functions: execute, process-triggers, handle-events
```

---

## Prompt 42: Notifications

```
NotificationCenter (Header-Icon mit Badge)
/benachrichtigungen - Vollständige Liste

Typen: payment, task, contract, document, meter, message, system
Channels: In-App, E-Mail, Push

/einstellungen/benachrichtigungen - Pro Typ konfigurieren
Zusammenfassung (täglich/wöchentlich)
Ruhezeiten

Supabase Realtime für Instant-Notifications
PWA Push mit Service Worker

Supabase: notifications, notification_preferences, push_subscriptions
```

---

# Phase 9: Optionale Features

## Prompt 43: Optionale Features

```
1. ONBOARDING-WIZARD
   - 5-Step Setup für neue User
   - Progress-Speicherung, Checkliste auf Dashboard

2. MULTI-MANDANTEN
   - Org-Switcher, separate Daten
   - Rollen: Owner, Admin, Member, Viewer

3. AUDIT-LOG
   - Alle Änderungen protokolliert
   - Filter, Export, 2 Jahre Aufbewahrung

4. DSGVO-TOOLS
   - Datenexport als ZIP
   - Anonymisierung
   - Einwilligungen, Löschfristen

5. DARK MODE
   - Toggle, System-Präferenz
   - Tailwind dark: Klassen

6. MEHRSPRACHIGKEIT
   - DE, EN (weitere)
   - react-i18next
   - Datums-/Währungsformatierung

7. PWA & OFFLINE
   - manifest.json, Service Worker
   - Offline-Fallback
   - Push, "Zum Homescreen"

8. HELP CENTER
   - FAQ, Tutorials, Kontakt
   - Live-Chat optional
   - Changelog

Supabase: organizations, org_memberships, audit_logs, gdpr_requests
```

---

# Zusammenfassung

## Alle 43 Prompts

| # | Feature | Phase |
|---|---------|-------|
| 1 | Shared Component Library | 1 |
| 2 | Routen einrichten | 1 |
| 3 | Supabase Types | 1 |
| 4 | Custom Hooks | 1 |
| 5 | BuildingDetail | 2 |
| 6 | UnitFormDialog | 2 |
| 7 | UnitDetail | 2 |
| 8 | TenantDetail | 2 |
| 9 | Vertragsverwaltung | 2 |
| 10 | Vertrags-Wizard | 2 |
| 11 | Zahlungsverwaltung | 2 |
| 12 | BK-Übersicht | 3 |
| 13 | BK-Detail | 3 |
| 14 | BK-Wizard 1-2 | 3 |
| 15 | BK-Wizard 3-4 | 3 |
| 16 | BK-Wizard 5 | 3 |
| 17 | Kostenarten | 3 |
| 18 | Zähler-Dashboard | 4 |
| 19 | Zähler hinzufügen | 4 |
| 20 | Zähler-Detail | 4 |
| 21 | Schnell-Ablesung | 4 |
| 22 | CSV-Import | 4 |
| 23 | Verbrauchsauswertung | 4 |
| 24 | BK-Integration | 4 |
| 25 | Task-System | 5 |
| 26 | Mieter-Portal | 6 |
| 27 | Steuern & KI | 7 |
| 28 | Admin & Analytics | 7 |
| 29 | LetterXpress | 7 |
| 30 | E-Signatur | 7 |
| 31 | WhatsApp | 7 |
| 32 | FinAPI | 8 |
| 33 | ELSTER | 8 |
| 34 | Übergabeprotokoll | 8 |
| 35 | Kalender | 8 |
| 36 | Indexmiete | 8 |
| 37 | CO2-Kosten | 8 |
| 38 | Dokument-OCR | 8 |
| 39 | E-Mail-Templates | 8 |
| 40 | Immobilienportale | 8 |
| 41 | Workflow-Builder | 8 |
| 42 | Notifications | 8 |
| 43 | Optionale Features | 9 |

---

*Erstellt: 2026-02-05*
*Version: 1.0 - Komplett*
