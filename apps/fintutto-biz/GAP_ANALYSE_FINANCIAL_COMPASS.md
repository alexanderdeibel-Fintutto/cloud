# Gap-Analyse: Financial Compass (fintutto-biz)

**Stand:** 25. März 2026
**Kontext:** Nutzer ist Freelancer, hält mehrere Firmenbeteiligungen und verwaltet einige als Geschäftsführer (GF). Ziel: Ablösung von Lexoffice & Co.

---

## 1. Was bereits vorhanden ist ✅

Die App `fintutto-biz` hat eine solide Basis:

| Feature | Status | Qualität |
|---------|--------|----------|
| **Auth (Login/Register)** | ✅ Vorhanden | Supabase Auth, funktional |
| **Onboarding** | ✅ Vorhanden | Business anlegen mit RPC + Fallback |
| **Dashboard** | ✅ Vorhanden | KPIs (Umsatz, Ausgaben, Gewinn), Monats-Chart |
| **Rechnungen (Invoices)** | ✅ Vorhanden | Liste, Filter, Formular, Status-Tracking |
| **Ausgaben (Expenses)** | ✅ Vorhanden | Liste, Kategorisierung |
| **Kunden (Clients)** | ✅ Vorhanden | CRUD |
| **Steuerübersicht (TaxOverview)** | ✅ Vorhanden | Quartalsweise EÜR, USt-Zahllast |
| **Settings** | ✅ Vorhanden | Business-Daten bearbeiten |
| **Pricing / Stripe** | ✅ Vorhanden | Abo-Seite vorhanden |

---

## 2. Was fehlt für den Eigenbedarf (Freelancer + GF + Vermieter) ❌

### 2.1 KRITISCH: Multi-Company / Mandantenfähigkeit

**Problem:** Die aktuelle `useBusiness.ts` lädt nur EIN Business per User (`.limit(1).single()`). Für mehrere Firmen (Freelance-Einzelunternehmen + GmbH 1 + GmbH 2) reicht das nicht.

**Lösung:**
- Neue Supabase-Tabelle `biz_user_businesses` (Many-to-Many: User ↔ Business mit Rollen)
- Business-Switcher in der Sidebar (Dropdown zum Wechseln zwischen Firmen)
- Alle Queries filtern dann nach `activeBusiness.id`

**Aufwand:** ~4-6 Stunden (Migration + Hook + UI)

---

### 2.2 KRITISCH: PDF-Rechnungsgenerierung

**Problem:** Die `biz_invoices` Tabelle hat ein `pdf_url` Feld, aber es gibt keine Logik, die eine PDF erzeugt.

**Lösung:**
- Supabase Edge Function `generate-invoice-pdf` (nutzt `@react-pdf/renderer` oder `jsPDF`)
- Oder: Client-seitige PDF-Generierung mit `jsPDF` + `html2canvas`
- PDF muss Pflichtfelder enthalten: Rechnungsnummer, Datum, Leistungsbeschreibung, USt-Ausweis, Bankverbindung

**Aufwand:** ~3-4 Stunden

---

### 2.3 WICHTIG: Banking-Sync / Transaktionsabgleich

**Problem:** Die `banking_connections` und `banking_transactions` Tabellen existieren im Schema (aus Vermietify), aber `fintutto-biz` nutzt sie nicht.

**Lösung:**
- Banking-Seite in `fintutto-biz` hinzufügen
- Offene Rechnungen können mit eingehenden Transaktionen gematcht werden
- Ausgaben können mit ausgehenden Transaktionen verknüpft werden

**Aufwand:** ~6-8 Stunden

---

### 2.4 WICHTIG: Anlage V (Vermietung & Verpachtung)

**Problem:** Als Vermieter hast du Mieteinnahmen, die steuerlich separat zu deinen Freelance-Einnahmen behandelt werden müssen.

**Lösung:**
- Neuer Bereich "Vermietung" in `fintutto-biz` (oder Verlinkung zu Vermietify)
- Anlage V Wizard: Mieteinnahmen, Werbungskosten (AfA, Zinsen, Reparaturen)
- Integration mit Vermietify: Daten aus `properties` und `payments` automatisch übernehmen

**Aufwand:** ~8-10 Stunden (eigenständig) oder ~2 Stunden (nur Verlinkung zu Vermietify)

---

### 2.5 NICE-TO-HAVE: Zeiterfassung (für Freelancer)

**Problem:** Als Freelancer rechnest du wahrscheinlich nach Stunden ab. Aktuell gibt es keine Zeiterfassung.

**Lösung:**
- Neue Tabelle `biz_time_entries` (Projekt, Stunden, Stundensatz, Beschreibung)
- Direkte Übernahme in Rechnungsposition beim Erstellen einer Rechnung

**Aufwand:** ~4-5 Stunden

---

### 2.6 NICE-TO-HAVE: Wiederkehrende Rechnungen

**Problem:** Als GF hast du wahrscheinlich monatliche Leistungen (z.B. Management-Fee), die immer gleich sind.

**Lösung:**
- `is_recurring` und `recurring_interval` Felder in `biz_invoices`
- Cron-Job (Supabase Edge Function) der monatlich neue Rechnungen aus Vorlagen erstellt

**Aufwand:** ~3-4 Stunden

---

## 3. Priorisierte Roadmap

| Priorität | Feature | Aufwand | Nutzen |
|-----------|---------|---------|--------|
| 🔴 P1 | Multi-Company Switcher | 4-6h | Absolut notwendig für mehrere Firmen |
| 🔴 P1 | PDF-Rechnungsgenerierung | 3-4h | Ohne PDF keine echte Rechnung |
| 🟡 P2 | Banking-Sync | 6-8h | Großer Zeitgewinn beim Abgleich |
| 🟡 P2 | Anlage V / Vermietung | 2-3h | Verlinkung zu Vermietify reicht zunächst |
| 🟢 P3 | Zeiterfassung | 4-5h | Sehr nützlich für Freelancer |
| 🟢 P3 | Wiederkehrende Rechnungen | 3-4h | Komfort-Feature |

**Gesamtaufwand P1:** ~7-10 Stunden → App ist für Eigenbedarf nutzbar
**Gesamtaufwand P1+P2:** ~15-20 Stunden → Lexoffice-Ablösung vollständig

---

## 4. Datenbankänderungen (neue Migration)

```sql
-- 027_biz_multi_company.sql

-- Tabelle für Multi-Company Support
CREATE TABLE IF NOT EXISTS public.biz_user_businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES public.biz_businesses(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, business_id)
);

ALTER TABLE public.biz_user_businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_user_businesses" ON public.biz_user_businesses
  FOR ALL USING (user_id = auth.uid());

-- Zeiterfassung
CREATE TABLE IF NOT EXISTS public.biz_time_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.biz_businesses(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.biz_clients(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  hours NUMERIC NOT NULL,
  hourly_rate NUMERIC NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  billed BOOLEAN DEFAULT false,
  invoice_id UUID REFERENCES public.biz_invoices(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.biz_time_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_time_entries" ON public.biz_time_entries
  FOR ALL USING (
    business_id IN (SELECT id FROM public.biz_businesses WHERE owner_id = auth.uid())
  );
```
