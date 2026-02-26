# Fintutto FinTech-Universe: Vollstandige Verwertbarkeitsanalyse & Integrationsplan

> Stand: 26.02.2026 | Basierend auf Analyse aller 17 aktiven Repos + Portal-Monorepo

---

## Inhaltsverzeichnis

1. [IST-Zustand: Das aktuelle Fintutto-Universum](#1-ist-zustand)
2. [Verwertbarkeitsanalyse der 6 FinTech-Konzepte](#2-verwertbarkeitsanalyse)
3. [Synergien mit bestehendem Oekosystem](#3-synergien)
4. [Integrationsarchitektur](#4-integrationsarchitektur)
5. [Konkrete Umsetzung: SQL, Stripe, Edge Functions](#5-konkrete-umsetzung)
6. [Priorisierte Roadmap](#6-roadmap)
7. [Risiken & Empfehlungen](#7-risiken)

---

## 1. IST-Zustand: Das aktuelle Fintutto-Universum

### 1.1 Aktive Apps (17 Repos, Live auf Vercel)

| # | App | Repo | Live URL | Zweck | Monetarisierung |
|---|-----|------|----------|-------|-----------------|
| 1 | **Portal** (Zentrale) | `portal` | fintutto-checker.vercel.app | 10 Checker, 7 Rechner, 10 Formulare | Stripe Abos (Free/4.99/7.99/11.99/19.99) |
| 2 | **Vermietify** | `vermietify_final` | vermietify.vercel.app | Immobilienverwaltung (Properties, Tenants, Banking) | Stripe Abos (Free/9.99/24.99/49.99) |
| 3 | **Mieter-Portal** | `mieter` | mieter-kw8d.vercel.app | Mieter-Perspektive (Maengel, Dokumente, Chat) | Teil vom Portal-Abo |
| 4 | **Ablesung** | `ablesung` | ablesung.vercel.app | Zaehlererfassung + OCR | Eigenstaendiges Abo |
| 5 | **BescheidBoxer** | `bescheidboxer` | bescheidboxer.vercel.app | Dokumenten-Assistent (Behoerdenbescheide) | Eigenes Abo |
| 6 | **Personaltrainer/FitTutto** | `Personaltrainer` | personaltrainer-murex.vercel.app | Fitness-App mit KI-Coach | Stripe Abos (2.99/4.99/9.99) |
| 7 | **HausmeisterPro** | `hausmeisterPro` | hausmeister-pro.vercel.app | Hausmeister-Aufgabenverwaltung | In Vermietify integriert |
| 8 | **Admin Hub** | `admin` | fintutto-admin-hub.vercel.app | User- & System-Management | Intern |
| 9 | **Zimmerpflanze** | `zimmerpflanze` | zimmerpflanze.vercel.app | Pflanzenpflege-Manager | Freemium |
| 10 | **Translator** | `translator` | translator-fintutto.vercel.app | Offline-Uebersetzer (Whisper STT) | Eigenstaendig |
| 11 | **GuideTranslator Sales** | `guidetranslator-sales` | aiguide-salesfinal.vercel.app | Sales Landing fuer Translator | Marketing |
| 12 | **LernApp** | `LernApp` | - | Lern-Plattform | In Entwicklung |
| 13 | **Financial Compass** | `fintutto-your-financial-compass` | fintutto.vercel.app | Finanz-Dashboard/Landing | Landing Page |
| 14 | **LuggageX** | `luggageX` | luggagex-fintutto.vercel.app | Gepaeck-Tracker | Eigenstaendig |
| 15 | **Command Center** | `fintutto-command-center` | - | System-Steuerung | Intern |
| 16 | **a-docs** | `a-docs` | a-docs.vercel.app | Dokumenten-System | - |
| 17 | **Cloud** | `cloud` | - | Cloud-Infrastruktur | - |

### 1.2 Bestehende Technische Infrastruktur

```
TECH STACK (bereits produktiv):
├── Frontend: React 18 + TypeScript + Vite + Tailwind + shadcn/ui
├── Backend: Supabase (Auth, DB, RLS, Storage)
├── Payments: Stripe (Abos, Webhooks, Credits-System)
├── Deployment: Vercel (Multi-App)
├── Monorepo: pnpm workspaces + Turbo
├── Shared Package: @fintutto/shared (Stripe, Credits, Hooks)
└── AI: OpenAI-Integration (KI-Assistent in Checkern)
```

### 1.3 Bestehende Supabase-Tabellen (EINE Instanz fuer alles)

```
CORE:          users, profiles, checker_sessions, checker_results, ai_advice_cache
PAYMENTS:      (in users: stripe_customer_id, stripe_subscription_id, tier)
REFERRAL:      referral_codes, referrals, referral_rewards
IMMOBILIEN:    properties, units, tenants, rental_contracts, payments, documents
ZAEHLER:       meters, meter_readings
WARTUNG:       maintenance_requests, tasks
BANKING:       banking_connections, banking_transactions
BESCHEID:      (bescheidboxer-spezifische Tabellen)
FITNESS:       fitness_training, fitness_body_measurements
```

### 1.4 Bestehende Monetarisierung (Stripe)

```
AKTIVE PRODUKTE:
├── Portal: Free → Mieter (4.99) → Vermieter (7.99) → Kombi Pro (11.99) → Unlimited (19.99)
├── Vermietify: Starter (Free) → Basic (9.99) → Pro (24.99) → Enterprise (49.99)
├── FitTutto: Free → Save&Load (2.99) → Basic (4.99) → Premium (9.99)
├── Mieter-Checker: Free → Basis (0.99) → Premium (3.99)
└── Credits-System: Pay-per-Use ueber alle Apps hinweg
```

---

## 2. Verwertbarkeitsanalyse der 6 FinTech-Konzepte

### Bewertungskriterien

- **Synergie** (1-10): Wie gut passt es zum bestehenden Oekosystem?
- **Machbarkeit** (1-10): Wie schnell umsetzbar mit aktuellem Stack?
- **Umsatzpotenzial** (1-10): Wie profitabel?
- **Differenzierung** (1-10): Wie einzigartig gegenueber Wettbewerbern?

---

### Konzept 1: Fintutto Next - AI Finance Coach

| Kriterium | Bewertung | Begruendung |
|-----------|-----------|-------------|
| **Synergie** | 9/10 | Ihr habt BEREITS Banking-Sync in Vermietify + KI-Assistent im Portal. Der Finance Coach ist die logische Erweiterung |
| **Machbarkeit** | 8/10 | Bankin API oder Open Banking bereits im Konzept. Supabase + Vercel + OpenAI vorhanden. Transaction-Kategorisierung existiert in banking_transactions |
| **Umsatzpotenzial** | 9/10 | Premium-Abo (10-12 EUR/Monat) + AI-Addon (5 EUR) = hohe Margins. Weltweit skalierbar |
| **Differenzierung** | 7/10 | Markt ist crowded (Finanzguru, Outbank, etc.), aber euer Vorteil: Integration mit Immobilien-Oekosystem |

**VERWERTBARKEIT: SEHR HOCH (33/40)**

**Konkrete Synergien mit bestehendem System:**
- `banking_connections` + `banking_transactions` = bereits die Datenbasis
- `users.tier` + Credits-System = Monetarisierung ready
- Vermietify-Banking-Modul = kann als Datenquelle dienen
- KI-Assistent = bereits in Checkern implementiert, erweiterbar auf Finance Coaching

**Empfehlung:** SOFORT STARTEN. Als neues Modul im Portal oder eigenstaendige App, die auf die gleiche Supabase-Instanz zugreift.

---

### Konzept 2: Social Wealth & Challenges

| Kriterium | Bewertung | Begruendung |
|-----------|-----------|-------------|
| **Synergie** | 5/10 | Passt thematisch, aber kein direkter Anknuepfungspunkt im aktuellen System. Referral-System existiert aber schon |
| **Machbarkeit** | 6/10 | Gamification + Social Features = viel neuer Code. Kein bestehendes Social-Layer |
| **Umsatzpotenzial** | 5/10 | Schwierig zu monetarisieren ohne kritische Masse. Brand-Sponsorships brauchen viel Traffic |
| **Differenzierung** | 6/10 | Interessant aber nischenmaessig. Risiko: Nutzer wollen Finanzen privat halten |

**VERWERTBARKEIT: MITTEL (22/40)**

**Empfehlung:** SPAETER (Phase 2-3). Als Gamification-Layer auf dem Finance Coach aufsetzen. Nicht als eigenstaendige App. Referral-System ist bereits der Keim.

---

### Konzept 3: Fintutto Biz - Freelancer Finance OS

| Kriterium | Bewertung | Begruendung |
|-----------|-----------|-------------|
| **Synergie** | 10/10 | Vermietify ist BEREITS ein Biz-Tool fuer Vermieter! Rechnungen, Banking, Steuern = alles da. Erweiterung auf Freelancer ist logisch |
| **Machbarkeit** | 9/10 | `biz_businesses`, `biz_invoices`, `biz_expenses` = einfach auf bestehende Strukturen aufsetzen. Stripe Payments fuer Rechnungsempfaenger = Stripe Connect |
| **Umsatzpotenzial** | 10/10 | Hoechste Margen im SaaS-Bereich. 9-39 EUR/Monat ist realistisch. Freelancer zahlen gerne fuer Tools |
| **Differenzierung** | 8/10 | Kombination aus Buchhaltung + KI-Cashflow + Immobilien-Integration ist einzigartig |

**VERWERTBARKEIT: EXTREM HOCH (37/40)**

**Konkrete Synergien:**
- Vermietify's `biz_businesses`, Invoice-Logik, Banking-Module = Basis
- Financial Compass (`fintutto-your-financial-compass`) = Landing/Dashboard
- Steuer-Rechner im Portal = direkt integrierbar
- Stripe-Infrastruktur = komplett wiederverwendbar

**Empfehlung:** HOECHSTE PRIORITAET nach Finance Coach. Vermietify zu "Fintutto Biz" erweitern mit Freelancer-Modus.

---

### Konzept 5: Finance Mentor - AI Learning Platform

| Kriterium | Bewertung | Begruendung |
|-----------|-----------|-------------|
| **Synergie** | 8/10 | LernApp-Repo existiert bereits! Checker liefern Educational Content. KI-Assistent kann als Tutor fungieren |
| **Machbarkeit** | 8/10 | `learn_courses`, `learn_progress`, `learn_quizzes` = einfache Tabellen. LernApp-Repo als Basis. Quiz-Logik aehnlich wie Checker-Logik |
| **Umsatzpotenzial** | 7/10 | Kursbundles (29-99 EUR) + Schullizenzen. Aber: Finanz-Education ist Nische |
| **Differenzierung** | 8/10 | Gamifizierte Finanz-Education + Integration mit echten Tools (Rechner, Checker) = stark |

**VERWERTBARKEIT: HOCH (31/40)**

**Konkrete Synergien:**
- `LernApp`-Repo = bereits existierender Basis-Code
- Checker-Logik = Quiz-Engine-Basis (Fragebogen → Ergebnis → Empfehlung)
- KI-Assistent = Financial Tutor
- Portal-Credits = Lern-Credits

**Empfehlung:** PHASE 2. LernApp-Repo als Basis, Checker-Engine fuer Quizzes umbauen.

---

### Konzept 6: B2B API Service

| Kriterium | Bewertung | Begruendung |
|-----------|-----------|-------------|
| **Synergie** | 7/10 | Vercel API-Routes existieren. Supabase-Daten koennen exponiert werden. Credits-System = API-Metering |
| **Machbarkeit** | 7/10 | Vercel Functions als API-Layer. Rate Limiting + API Keys + Usage Tracking noetig |
| **Umsatzpotenzial** | 8/10 | B2B = hohe Tickets. Usage-based Billing via Stripe Metered. 100-5000 EUR/Monat pro Client |
| **Differenzierung** | 7/10 | Immobilien-Daten + Mietrecht-Intelligence + Banking-Insights = spezifisch fuer DACH-Markt |

**VERWERTBARKEIT: HOCH (29/40)**

**Konkrete Synergien:**
- Vercel Functions (`/api/`) = API-Infrastruktur existiert
- Stripe-Metered-Billing = erweiterbar
- Checker-Logik = als API exponierbar (Mietpreisbremse-API, Nebenkostencheck-API)
- Banking-Daten = Cashflow-API

**Empfehlung:** PHASE 2-3. Zuerst interne APIs stabilisieren, dann externen Zugang oeffnen.

---

### Gesamt-Ranking

| Rang | Konzept | Score | Phase | Grund |
|------|---------|-------|-------|-------|
| 1 | **Fintutto Biz** | 37/40 | SOFORT | Hoechste Synergie mit Vermietify, hoechstes Umsatzpotenzial |
| 2 | **Finance Coach** | 33/40 | SOFORT | Banking-Basis existiert, KI existiert, schnell monetarisierbar |
| 3 | **Finance Mentor** | 31/40 | Phase 2 | LernApp existiert, Checker-Logik wiederverwendbar |
| 4 | **B2B API** | 29/40 | Phase 2-3 | API-Infrastruktur vorhanden, braucht aber Stabilisierung |
| 5 | **Social Wealth** | 22/40 | Phase 3 | Kein direkter Anknuepfungspunkt, hohes Risiko |

---

## 3. Synergien mit bestehendem Oekosystem

### 3.1 Synergie-Matrix: Neues ↔ Bestehendes

```
                    Portal  Vermietify  Mieter  Ablesung  BescheidBoxer  FitTutto  LernApp  Admin
Finance Coach         ■■■      ■■■■       ■■      ■          ■              -        ■■       ■■
Fintutto Biz          ■■       ■■■■■      ■       ■          ■■■            -        ■        ■■■
Finance Mentor        ■■■■     ■■         ■■■     ■          ■■             ■        ■■■■■    ■
B2B API               ■■■■     ■■■        ■■      ■■         ■■             ■        ■        ■■■■
Social (spaeter)      ■■       ■          ■       -          -              ■■■      ■■       ■

■ = geringe Synergie | ■■■ = mittlere | ■■■■■ = maximale Synergie
```

### 3.2 Wiederverwendbare Komponenten

| Bestehende Komponente | Wiederverwendung |
|----------------------|------------------|
| `users` + Auth-System | Alle neuen Apps nutzen denselben User |
| `banking_connections` + `banking_transactions` | Finance Coach: direkt, Biz: erweitert |
| Stripe-Abo-System + Credits | Alle neuen Module: Entitlements |
| Checker-Fragebogen-Engine | Finance Mentor: Quiz-Engine |
| KI-Assistent (OpenAI) | Finance Coach, Biz AI CFO, Learn Tutor |
| Referral-System | Erweiterbar auf alle neuen Module |
| Vercel API Routes | B2B API Basis |
| `@fintutto/shared` Package | Geteilter Code fuer alle neuen Module |

---

## 4. Integrationsarchitektur

### 4.1 Erweitertes Oekosystem-Diagramm

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         FINTUTTO UNIVERSE (erweitert)                            │
│                                                                                  │
│  BESTEHEND (Phase 0 - Live):                                                    │
│  ┌──────────┐ ┌───────────┐ ┌────────┐ ┌─────────┐ ┌──────────┐ ┌───────────┐ │
│  │  Portal   │ │ Vermietify│ │ Mieter │ │Ablesung │ │BescheidB.│ │ FitTutto  │ │
│  │ (Checker/ │ │ (Immo-   │ │ (Mieter│ │ (Zaehler│ │ (Doku-   │ │ (Fitness) │ │
│  │  Rechner) │ │  verw.)  │ │  tools)│ │  OCR)   │ │  hilfe)  │ │           │ │
│  └──────────┘ └───────────┘ └────────┘ └─────────┘ └──────────┘ └───────────┘ │
│                                                                                  │
│  NEU (Phase 1):                                                                  │
│  ┌──────────────────────┐  ┌──────────────────────┐                             │
│  │ FINANCE COACH (App 1)│  │ FINTUTTO BIZ (App 3) │                             │
│  │ Budget, KI-Insights, │  │ Freelancer-OS,       │                             │
│  │ Bank-Sync, Forecast  │  │ Rechnungen, Steuern  │                             │
│  └──────────────────────┘  └──────────────────────┘                             │
│                                                                                  │
│  NEU (Phase 2):                                                                  │
│  ┌──────────────────────┐  ┌──────────────────────┐                             │
│  │ FINANCE MENTOR (5)   │  │ B2B API (6)          │                             │
│  │ Lernpfade, Quizzes,  │  │ Transactions API,    │                             │
│  │ Zertifikate          │  │ Risk Scoring, Forecast│                             │
│  └──────────────────────┘  └──────────────────────┘                             │
│                                                                                  │
│  NEU (Phase 3):                                                                  │
│  ┌──────────────────────────────────────────────────┐                            │
│  │ SOCIAL WEALTH (App 2) + GAMIFICATION LAYER       │                            │
│  │ Challenges, Leaderboards, Community              │                            │
│  └──────────────────────────────────────────────────┘                            │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                    CORE INFRASTRUCTURE (SHARED)                           │   │
│  │  Supabase (Auth, DB, RLS, Edge Functions) | Stripe (Payments, Metered)  │   │
│  │  @fintutto/shared (Credits, Plans, Hooks) | Vercel (Deploy, API)        │   │
│  │  Entitlements Engine | AI Pipeline | Referral System                     │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Neues Entitlement-System (Herzstck der Erweiterung)

Das bisherige `users.tier`-System reicht fuer ein Multi-App-Oekosystem nicht mehr aus.
Wir brauchen ein **Feature-Flag-basiertes Entitlement-System**:

```
VORHER:  users.tier = 'premium' → pauschaler Zugang
NACHHER: entitlements = [
   { feature: 'finance_coach_basic', expires: ... },
   { feature: 'finance_forecast', expires: ... },
   { feature: 'biz_unlimited_invoices', expires: ... },
   { feature: 'learn_premium_courses', expires: ... },
]
```

Das erlaubt:
- App-spezifische Upgrades (nur Biz Pro, nicht alles)
- Addons (AI Forecast als Zusatz)
- Usage-basierte Features (API-Calls)
- Referral-Rewards (30 Tage Feature XY gratis)

### 4.3 Erweiterte Stripe-Produkt-Struktur

```
BESTEHENDE Produkte (bleiben):
├── Portal: Free / Mieter / Vermieter / Kombi Pro / Unlimited
├── Vermietify: Starter / Basic / Pro / Enterprise
├── FitTutto: Free / Save&Load / Basic / Premium
└── Mieter-Checker: Free / Basis / Premium

NEUE Produkte (kommen hinzu):
├── Finance Coach: Premium (9.99) | AI Forecast Addon (4.99)
├── Fintutto Biz: Starter (Free) | Pro (19.99) | AI CFO (39.99)
├── Finance Mentor: Kursbundle (29.99 einmalig) | Tutor-Abo (9.99)
├── B2B API: Free (1k calls) | Startup (49.99/50k) | Pro (199.99/500k)
└── Universe Bundle: Alles-in-einem (49.99) ← Cross-Sell
```

---

## 5. Konkrete Umsetzung

### 5.1 Neue Supabase-Migrationen

#### Migration 020: Entitlements Engine

```sql
-- 020_entitlements.sql
-- Feature-basiertes Berechtigungssystem fuer das gesamte Oekosystem

CREATE TABLE IF NOT EXISTS public.entitlements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  feature_key TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  source TEXT NOT NULL DEFAULT 'stripe', -- stripe, referral, admin, trial
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, feature_key)
);

CREATE INDEX idx_entitlements_user ON public.entitlements(user_id);
CREATE INDEX idx_entitlements_feature ON public.entitlements(feature_key);
CREATE INDEX idx_entitlements_expires ON public.entitlements(expires_at) WHERE expires_at IS NOT NULL;

ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entitlements" ON public.entitlements
  FOR SELECT USING (auth.uid() = user_id);

-- Feature Registry: Definiert alle verfuegbaren Features
CREATE TABLE IF NOT EXISTS public.feature_registry (
  key TEXT PRIMARY KEY,
  app TEXT NOT NULL, -- finance_coach, biz, learn, api, social
  name TEXT NOT NULL,
  description TEXT,
  is_premium BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Feature Registry
INSERT INTO public.feature_registry (key, app, name, description, is_premium) VALUES
  -- Finance Coach Features
  ('finance_coach_basic', 'finance_coach', 'Finance Coach Basic', 'Grundlegende Budgetierung und Ausgabenverfolgung', false),
  ('finance_multi_bank', 'finance_coach', 'Multi-Bank-Sync', 'Mehrere Bankkonten verbinden', true),
  ('finance_ai_insights', 'finance_coach', 'KI-Insights', 'KI-gestuetzte Ausgabenanalyse', true),
  ('finance_forecast', 'finance_coach', 'Cashflow-Forecast', '90-Tage Liquiditaetsprognose', true),
  ('finance_ai_coach', 'finance_coach', 'KI-Finance-Coach', 'Persoenliche Finanzberatung per KI', true),
  -- Biz Features
  ('biz_basic', 'biz', 'Biz Basic', 'Grundlegende Geschaeftsfunktionen', false),
  ('biz_unlimited_invoices', 'biz', 'Unbegrenzte Rechnungen', 'Keine Limitierung bei Rechnungserstellung', true),
  ('biz_tax_reports', 'biz', 'Steuer-Reports', 'Automatische Steueruebersichten', true),
  ('biz_ai_cfo', 'biz', 'KI-CFO', 'KI-gestuetzte Cashflow-Prognose und Optimierung', true),
  ('biz_cashflow_forecast', 'biz', 'Cashflow-Forecast', 'Geschaeftliche Liquiditaetsplanung', true),
  -- Learn Features
  ('learn_basic', 'learn', 'Basis-Kurse', 'Zugang zu Intro-Modulen', false),
  ('learn_premium_courses', 'learn', 'Premium-Kurse', 'Alle Kurse und Lernpfade', true),
  ('learn_certificates', 'learn', 'Zertifikate', 'Abschluss-Zertifikate', true),
  ('learn_ai_tutor', 'learn', 'KI-Tutor', 'Persoenlicher KI-Lernassistent', true),
  -- API Features
  ('api_basic', 'api', 'API Basic', '1.000 Calls/Monat', false),
  ('api_startup', 'api', 'API Startup', '50.000 Calls/Monat', true),
  ('api_pro', 'api', 'API Pro', '500.000 Calls/Monat', true),
  ('api_enterprise', 'api', 'API Enterprise', 'Unbegrenzte Calls', true)
ON CONFLICT (key) DO NOTHING;
```

#### Migration 021: Finance Coach Tabellen

```sql
-- 021_finance_coach.sql
-- Persoenliche Finanzverwaltung mit KI-Coaching

CREATE TABLE IF NOT EXISTS public.finance_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL DEFAULT 'checking', -- checking, savings, credit, investment
  bank_name TEXT,
  iban TEXT,
  balance NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  is_synced BOOLEAN DEFAULT false,
  bankin_connection_id TEXT,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.finance_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_accounts" ON public.finance_accounts FOR ALL USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.finance_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES public.finance_accounts(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inflow', 'outflow')),
  category TEXT,
  merchant TEXT,
  description TEXT,
  recurring BOOLEAN DEFAULT false,
  occurred_at DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_finance_tx_user ON public.finance_transactions(user_id, occurred_at);
ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_transactions" ON public.finance_transactions FOR ALL USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.finance_budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  monthly_limit NUMERIC NOT NULL,
  alert_threshold NUMERIC DEFAULT 0.8, -- 80% warning
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.finance_budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_budgets" ON public.finance_budgets FOR ALL USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.finance_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC DEFAULT 0,
  deadline DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'achieved', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.finance_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_goals" ON public.finance_goals FOR ALL USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.finance_ai_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  insight_type TEXT NOT NULL, -- spending_alert, savings_tip, forecast_warning, optimization
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  confidence NUMERIC,
  action_payload JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.finance_ai_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_insights" ON public.finance_ai_insights FOR ALL USING (user_id = auth.uid());

-- Materialized financial state per user (recomputed nightly)
CREATE TABLE IF NOT EXISTS public.financial_state (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  income_mean NUMERIC DEFAULT 0,
  income_volatility NUMERIC DEFAULT 0,
  expense_mean NUMERIC DEFAULT 0,
  expense_volatility NUMERIC DEFAULT 0,
  burn_rate NUMERIC DEFAULT 0,
  runway_days NUMERIC DEFAULT 0,
  savings_rate NUMERIC DEFAULT 0,
  liquidity_ratio NUMERIC DEFAULT 0,
  recurring_ratio NUMERIC DEFAULT 0,
  debt_ratio NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.financial_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_state" ON public.financial_state FOR ALL USING (user_id = auth.uid());
```

#### Migration 022: Fintutto Biz Tabellen

```sql
-- 022_biz.sql
-- Freelancer & Kleinunternehmer Finance OS

CREATE TABLE IF NOT EXISTS public.biz_businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  business_type TEXT DEFAULT 'freelancer', -- freelancer, einzelunternehmen, gbr, ug, gmbh
  tax_id TEXT, -- Steuernummer
  vat_id TEXT, -- USt-IdNr
  address JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.biz_businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_business" ON public.biz_businesses FOR ALL USING (owner_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.biz_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.biz_businesses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  company TEXT,
  address JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.biz_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_clients" ON public.biz_clients
  FOR ALL USING (
    business_id IN (SELECT id FROM public.biz_businesses WHERE owner_id = auth.uid())
  );

CREATE TABLE IF NOT EXISTS public.biz_invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.biz_businesses(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.biz_clients(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax_rate NUMERIC DEFAULT 19.0,
  tax_amount NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  items JSONB DEFAULT '[]', -- [{description, quantity, unit_price, total}]
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.biz_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_invoices" ON public.biz_invoices
  FOR ALL USING (
    business_id IN (SELECT id FROM public.biz_businesses WHERE owner_id = auth.uid())
  );

CREATE TABLE IF NOT EXISTS public.biz_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.biz_businesses(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  receipt_url TEXT,
  tax_deductible BOOLEAN DEFAULT true,
  occurred_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.biz_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_expenses" ON public.biz_expenses
  FOR ALL USING (
    business_id IN (SELECT id FROM public.biz_businesses WHERE owner_id = auth.uid())
  );

CREATE TABLE IF NOT EXISTS public.biz_tax_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.biz_businesses(id) ON DELETE CASCADE NOT NULL,
  report_type TEXT NOT NULL, -- monthly_vat, quarterly_vat, annual_income, eur
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'submitted')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.biz_tax_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_tax_reports" ON public.biz_tax_reports
  FOR ALL USING (
    business_id IN (SELECT id FROM public.biz_businesses WHERE owner_id = auth.uid())
  );

CREATE TABLE IF NOT EXISTS public.biz_cashflow_forecasts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.biz_businesses(id) ON DELETE CASCADE NOT NULL,
  forecast JSONB NOT NULL, -- [{date, projected_income, projected_expense, balance}]
  horizon_days INT DEFAULT 90,
  confidence NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.biz_cashflow_forecasts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_forecasts" ON public.biz_cashflow_forecasts
  FOR ALL USING (
    business_id IN (SELECT id FROM public.biz_businesses WHERE owner_id = auth.uid())
  );
```

#### Migration 023: Finance Mentor / Learn

```sql
-- 023_learn.sql
-- Finanz-Education mit Gamification und Zertifikaten

CREATE TABLE IF NOT EXISTS public.learn_courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- budgeting, investing, taxes, credit, emergency_fund
  difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  is_premium BOOLEAN DEFAULT false,
  lesson_count INT DEFAULT 0,
  estimated_minutes INT DEFAULT 30,
  image_url TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses are public readable
ALTER TABLE public.learn_courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "courses_public_read" ON public.learn_courses FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.learn_lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.learn_courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL, -- structured lesson content
  sort_order INT DEFAULT 0,
  quiz JSONB DEFAULT '[]', -- [{question, options[], correct_index, explanation}]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.learn_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lessons_public_read" ON public.learn_lessons FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.learn_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.learn_courses(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.learn_lessons(id) ON DELETE CASCADE,
  progress NUMERIC DEFAULT 0, -- 0-100
  quiz_score NUMERIC,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id, lesson_id)
);

ALTER TABLE public.learn_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_progress" ON public.learn_progress FOR ALL USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.learn_certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.learn_courses(id) ON DELETE CASCADE NOT NULL,
  certificate_number TEXT NOT NULL UNIQUE,
  final_score NUMERIC NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.learn_certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_certificates" ON public.learn_certificates FOR ALL USING (user_id = auth.uid());
```

#### Migration 024: B2B API

```sql
-- 024_api.sql
-- B2B API Service: API-Keys, Usage-Tracking, Rate Limiting

CREATE TABLE IF NOT EXISTS public.api_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'startup', 'pro', 'enterprise')),
  monthly_limit INT DEFAULT 1000,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.api_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_api_clients" ON public.api_clients FOR ALL USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.api_clients(id) ON DELETE CASCADE NOT NULL,
  key_hash TEXT NOT NULL, -- hashed API key
  key_prefix TEXT NOT NULL, -- first 8 chars for identification
  name TEXT DEFAULT 'Default',
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_api_keys" ON public.api_keys
  FOR ALL USING (
    client_id IN (SELECT id FROM public.api_clients WHERE user_id = auth.uid())
  );

CREATE TABLE IF NOT EXISTS public.api_usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.api_clients(id) ON DELETE CASCADE NOT NULL,
  key_id UUID REFERENCES public.api_keys(id) ON DELETE SET NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INT,
  response_time_ms INT,
  called_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage summary per period (for billing)
CREATE TABLE IF NOT EXISTS public.api_usage_summary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.api_clients(id) ON DELETE CASCADE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_calls INT DEFAULT 0,
  billed BOOLEAN DEFAULT false,
  stripe_usage_record_id TEXT,
  UNIQUE(client_id, period_start)
);

ALTER TABLE public.api_usage_summary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_usage" ON public.api_usage_summary
  FOR ALL USING (
    client_id IN (SELECT id FROM public.api_clients WHERE user_id = auth.uid())
  );
```

#### Migration 025: AI CFO Brain

```sql
-- 025_ai_cfo.sql
-- AI Decision Engine: Events, Predictions, Actions, Feedback

-- Immutable event store for all financial events
CREATE TABLE IF NOT EXISTS public.financial_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  source TEXT NOT NULL, -- bank_sync, stripe, invoice, manual, api
  event_type TEXT NOT NULL, -- transaction, balance_update, invoice_paid, goal_reached
  amount NUMERIC,
  currency TEXT DEFAULT 'EUR',
  metadata JSONB DEFAULT '{}',
  occurred_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_financial_events_user ON public.financial_events(user_id, occurred_at);

ALTER TABLE public.financial_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_events" ON public.financial_events FOR ALL USING (user_id = auth.uid());

-- Cashflow predictions
CREATE TABLE IF NOT EXISTS public.cashflow_predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  horizon_days INT DEFAULT 90,
  forecast JSONB NOT NULL, -- [{day, projected_balance, confidence}]
  negative_balance_probability NUMERIC,
  model_version TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cashflow_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_predictions" ON public.cashflow_predictions FOR ALL USING (user_id = auth.uid());

-- Risk scores
CREATE TABLE IF NOT EXISTS public.risk_scores (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  score INT NOT NULL CHECK (score BETWEEN 0 AND 1000),
  default_probability NUMERIC,
  risk_band TEXT CHECK (risk_band IN ('prime', 'standard', 'subprime', 'high_risk')),
  factors JSONB DEFAULT '{}', -- breakdown of contributing factors
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.risk_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_risk" ON public.risk_scores FOR ALL USING (user_id = auth.uid());

-- AI-generated actions/recommendations
CREATE TABLE IF NOT EXISTS public.ai_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL, -- savings_tip, expense_alert, invest_suggestion, risk_warning
  title TEXT NOT NULL,
  description TEXT,
  confidence NUMERIC,
  payload JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ai_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_actions" ON public.ai_actions FOR ALL USING (user_id = auth.uid());

-- Feedback loop for model improvement
CREATE TABLE IF NOT EXISTS public.ai_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action_id UUID REFERENCES public.ai_actions(id) ON DELETE CASCADE NOT NULL,
  outcome TEXT, -- accepted, rejected, ignored
  financial_delta NUMERIC, -- measured impact
  measured_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ai_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_feedback" ON public.ai_feedback
  FOR ALL USING (
    action_id IN (SELECT id FROM public.ai_actions WHERE user_id = auth.uid())
  );

-- AI usage tracking (for metered billing)
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  service TEXT NOT NULL, -- finance_coach, biz_cfo, learn_tutor
  tokens_used INT DEFAULT 0,
  cost_cents NUMERIC DEFAULT 0,
  model TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_ai_usage" ON public.ai_usage FOR ALL USING (user_id = auth.uid());
```

### 5.2 Stripe-Produkt-Setup-Script

Dieses Script erstellt alle neuen Stripe-Produkte und Preise:

```typescript
// scripts/setup-stripe-fintech.ts
// Ausfuehren: npx tsx scripts/setup-stripe-fintech.ts

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

interface ProductSetup {
  name: string;
  description: string;
  prices: Array<{
    nickname: string;
    amount: number; // in cents
    interval?: 'month' | 'year';
    type?: 'recurring' | 'one_time' | 'metered';
  }>;
}

const PRODUCTS: ProductSetup[] = [
  // Finance Coach
  {
    name: 'Fintutto Finance Coach Premium',
    description: 'KI-gestuetzte Finanzberatung mit Multi-Bank-Sync und Forecasts',
    prices: [
      { nickname: 'Finance Coach Monthly', amount: 999, interval: 'month' },
      { nickname: 'Finance Coach Yearly', amount: 9590, interval: 'year' },
    ],
  },
  {
    name: 'Fintutto AI Forecast Addon',
    description: '90-Tage Cashflow-Prognose und KI-Optimierungsvorschlaege',
    prices: [
      { nickname: 'AI Forecast Monthly', amount: 499, interval: 'month' },
    ],
  },
  // Fintutto Biz
  {
    name: 'Fintutto Biz Pro',
    description: 'Freelancer Finance OS: Unbegrenzte Rechnungen, Banking, Steuer-Reports',
    prices: [
      { nickname: 'Biz Pro Monthly', amount: 1999, interval: 'month' },
      { nickname: 'Biz Pro Yearly', amount: 19190, interval: 'year' },
    ],
  },
  {
    name: 'Fintutto Biz AI CFO',
    description: 'KI-CFO: Cashflow-Prognose, Steueroptimierung, Wachstumsplanung',
    prices: [
      { nickname: 'Biz AI CFO Monthly', amount: 3999, interval: 'month' },
      { nickname: 'Biz AI CFO Yearly', amount: 38390, interval: 'year' },
    ],
  },
  // Finance Mentor / Learn
  {
    name: 'Fintutto Learn Premium',
    description: 'Alle Kurse, Lernpfade, Zertifikate und KI-Tutor',
    prices: [
      { nickname: 'Learn Premium Monthly', amount: 999, interval: 'month' },
      { nickname: 'Learn Premium Yearly', amount: 9590, interval: 'year' },
    ],
  },
  {
    name: 'Fintutto Learn Kursbundle',
    description: 'Einmaliger Zugang zu allen aktuellen Kursen',
    prices: [
      { nickname: 'Kursbundle Einmalig', amount: 2999, type: 'one_time' },
    ],
  },
  // B2B API
  {
    name: 'Fintutto API Startup',
    description: '50.000 API-Calls/Monat, Transactions, Kategorisierung, Forecasts',
    prices: [
      { nickname: 'API Startup Monthly', amount: 4999, interval: 'month' },
    ],
  },
  {
    name: 'Fintutto API Pro',
    description: '500.000 API-Calls/Monat mit Priority Support',
    prices: [
      { nickname: 'API Pro Monthly', amount: 19999, interval: 'month' },
    ],
  },
  {
    name: 'Fintutto API Usage (Metered)',
    description: 'Usage-basierte Abrechnung fuer API-Calls',
    prices: [
      { nickname: 'API Per-Call', amount: 1, type: 'metered', interval: 'month' }, // 0.01 EUR per call
    ],
  },
  // Universe Bundle
  {
    name: 'Fintutto Universe Bundle',
    description: 'Zugang zu ALLEN Fintutto-Apps und Features',
    prices: [
      { nickname: 'Universe Monthly', amount: 4999, interval: 'month' },
      { nickname: 'Universe Yearly', amount: 47990, interval: 'year' },
    ],
  },
];

async function setupProducts() {
  console.log('Setting up Stripe products for Fintutto FinTech Universe...\n');

  const results: Record<string, { productId: string; priceIds: string[] }> = {};

  for (const productSetup of PRODUCTS) {
    console.log(`Creating product: ${productSetup.name}`);

    const product = await stripe.products.create({
      name: productSetup.name,
      description: productSetup.description,
      metadata: { ecosystem: 'fintutto' },
    });

    const priceIds: string[] = [];

    for (const priceSetup of productSetup.prices) {
      const priceParams: Stripe.PriceCreateParams = {
        product: product.id,
        currency: 'eur',
        nickname: priceSetup.nickname,
        metadata: { ecosystem: 'fintutto' },
      };

      if (priceSetup.type === 'metered') {
        priceParams.recurring = {
          interval: priceSetup.interval || 'month',
          usage_type: 'metered',
        };
        priceParams.billing_scheme = 'per_unit';
        priceParams.unit_amount = priceSetup.amount;
      } else if (priceSetup.type === 'one_time') {
        priceParams.unit_amount = priceSetup.amount;
      } else {
        priceParams.unit_amount = priceSetup.amount;
        priceParams.recurring = {
          interval: priceSetup.interval || 'month',
        };
      }

      const price = await stripe.prices.create(priceParams);
      priceIds.push(price.id);
      console.log(`  - Price: ${priceSetup.nickname} = ${price.id}`);
    }

    results[product.name] = { productId: product.id, priceIds };
    console.log(`  Product ID: ${product.id}\n`);
  }

  console.log('\n=== ERGEBNIS ===');
  console.log('Folgende ENV-Variablen in .env.local eintragen:\n');

  // Output env vars
  const envMap: Record<string, string> = {};
  for (const [name, data] of Object.entries(results)) {
    const key = name.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
    envMap[`VITE_STRIPE_PRODUCT_${key}`] = data.productId;
    data.priceIds.forEach((id, i) => {
      envMap[`VITE_STRIPE_PRICE_${key}_${i}`] = id;
    });
  }

  for (const [key, value] of Object.entries(envMap)) {
    console.log(`${key}=${value}`);
  }
}

setupProducts().catch(console.error);
```

### 5.3 Erweitertes Shared Package: Entitlements

```typescript
// packages/shared/src/entitlements.ts
// Entitlement-Check fuer alle Apps im Oekosystem

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface Entitlement {
  feature_key: string;
  expires_at: string | null;
  source: string;
}

export async function hasEntitlement(
  supabase: SupabaseClient,
  userId: string,
  featureKey: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('entitlements')
    .select('id, expires_at')
    .eq('user_id', userId)
    .eq('feature_key', featureKey)
    .single();

  if (error || !data) return false;

  // Check expiry
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return false;
  }

  return true;
}

export async function getUserEntitlements(
  supabase: SupabaseClient,
  userId: string
): Promise<Entitlement[]> {
  const { data, error } = await supabase
    .from('entitlements')
    .select('feature_key, expires_at, source')
    .eq('user_id', userId);

  if (error || !data) return [];

  // Filter expired
  const now = new Date();
  return data.filter(
    (e) => !e.expires_at || new Date(e.expires_at) > now
  );
}

export async function grantEntitlement(
  supabase: SupabaseClient,
  userId: string,
  featureKey: string,
  source: string = 'stripe',
  expiresAt?: Date
): Promise<void> {
  await supabase.from('entitlements').upsert({
    user_id: userId,
    feature_key: featureKey,
    source,
    expires_at: expiresAt?.toISOString() || null,
  });
}

export async function revokeEntitlement(
  supabase: SupabaseClient,
  userId: string,
  featureKey: string
): Promise<void> {
  await supabase
    .from('entitlements')
    .delete()
    .eq('user_id', userId)
    .eq('feature_key', featureKey);
}

// Map Stripe product to entitlements
export const STRIPE_PRODUCT_ENTITLEMENTS: Record<string, string[]> = {
  // Finance Coach
  'fintutto_finance_coach_premium': [
    'finance_coach_basic',
    'finance_multi_bank',
    'finance_ai_insights',
  ],
  'fintutto_ai_forecast_addon': [
    'finance_forecast',
    'finance_ai_coach',
  ],
  // Biz
  'fintutto_biz_pro': [
    'biz_basic',
    'biz_unlimited_invoices',
    'biz_tax_reports',
  ],
  'fintutto_biz_ai_cfo': [
    'biz_basic',
    'biz_unlimited_invoices',
    'biz_tax_reports',
    'biz_ai_cfo',
    'biz_cashflow_forecast',
  ],
  // Learn
  'fintutto_learn_premium': [
    'learn_basic',
    'learn_premium_courses',
    'learn_certificates',
    'learn_ai_tutor',
  ],
  // API
  'fintutto_api_startup': ['api_basic', 'api_startup'],
  'fintutto_api_pro': ['api_basic', 'api_startup', 'api_pro'],
  // Universe Bundle = ALLES
  'fintutto_universe_bundle': [
    'finance_coach_basic', 'finance_multi_bank', 'finance_ai_insights',
    'finance_forecast', 'finance_ai_coach',
    'biz_basic', 'biz_unlimited_invoices', 'biz_tax_reports',
    'biz_ai_cfo', 'biz_cashflow_forecast',
    'learn_basic', 'learn_premium_courses', 'learn_certificates', 'learn_ai_tutor',
    'api_basic', 'api_startup',
  ],
};
```

### 5.4 Erweiterter Stripe Webhook (Entitlements)

Der bestehende Webhook in `/api/stripe-webhook.ts` muss erweitert werden:

```typescript
// Erweiterung fuer api/stripe-webhook.ts
// Neue Funktion: processEntitlements

import { STRIPE_PRODUCT_ENTITLEMENTS } from '../packages/shared/src/entitlements';

async function processEntitlements(
  userId: string,
  productName: string,
  action: 'grant' | 'revoke',
  periodEnd?: Date
) {
  const entitlementKeys = STRIPE_PRODUCT_ENTITLEMENTS[productName];
  if (!entitlementKeys) return;

  for (const featureKey of entitlementKeys) {
    if (action === 'grant') {
      await supabase.from('entitlements').upsert({
        user_id: userId,
        feature_key: featureKey,
        source: 'stripe',
        expires_at: periodEnd?.toISOString() || null,
      });
    } else {
      await supabase
        .from('entitlements')
        .delete()
        .eq('user_id', userId)
        .eq('feature_key', featureKey)
        .eq('source', 'stripe');
    }
  }
}
```

---

## 6. Priorisierte Roadmap

### Phase 1: Foundation + Finance Coach (Wochen 1-4)

```
Woche 1-2: Foundation
├── Entitlements-Tabelle + Feature Registry deployen
├── Stripe-Produkte erstellen (Script ausfuehren)
├── Webhook um Entitlements erweitern
├── @fintutto/shared um Entitlement-Checks erweitern
└── Bestehende Tier-Logik mit Entitlements verbinden

Woche 3-4: Finance Coach MVP
├── finance_accounts, finance_transactions, finance_budgets Tabellen
├── Bank-Sync nutzt bestehende banking_connections
├── Dashboard: Einnahmen/Ausgaben-Uebersicht mit Recharts
├── Automatische Kategorisierung (regelbasiert, dann KI)
├── Budget-Ziele setzen und tracken
└── Monatsreport (Freemium) + KI-Insights (Premium)
```

### Phase 2: Biz + Learn (Wochen 5-10)

```
Woche 5-7: Fintutto Biz MVP
├── biz_businesses, biz_invoices, biz_clients, biz_expenses Tabellen
├── Rechnungserstellung (PDF) - nutzt bestehende Formular-Logik
├── Einnahmen/Ausgaben-Tracking
├── Steuer-Uebersicht (nutzt Portal-Rechner)
├── Stripe Connect fuer Rechnungszahlungen (spaeter)
└── KI-Cashflow-Forecast (Premium)

Woche 8-10: Finance Mentor MVP
├── learn_courses, learn_lessons, learn_progress Tabellen
├── 5 Basis-Kurse erstellen (Budget, ETF, Steuern, Kredit, Notfall)
├── Quiz-Engine (basiert auf Checker-Fragebogen-Logik)
├── Fortschritts-Tracking
└── Zertifikate (PDF-Generierung)
```

### Phase 3: API + Polish (Wochen 11-16)

```
Woche 11-13: B2B API
├── api_clients, api_keys, api_usage Tabellen
├── API-Key-Verwaltung im Admin Hub
├── Vercel API-Routes fuer externe Nutzer
├── Rate Limiting + Usage Tracking
├── Stripe Metered Billing
└── API-Dokumentation

Woche 14-16: AI CFO Brain
├── financial_events, financial_state Tabellen
├── Nightly Feature-Berechnung (Supabase Edge Function + pg_cron)
├── Cashflow-Forecast (erst regelbasiert, dann ML)
├── Risk Scoring
├── Proaktive Empfehlungen
└── Feedback-Loop fuer Modell-Verbesserung
```

### Phase 4: Social + Scale (Wochen 17+)

```
├── Social Challenges als Gamification-Layer
├── Leaderboards
├── Community-Features
├── Embedded Finance Partnerschaften
└── Internationalisierung
```

---

## 7. Risiken & Empfehlungen

### 7.1 Technische Risiken

| Risiko | Schwere | Mitigation |
|--------|---------|------------|
| Supabase-Limits bei Skalierung | Mittel | Read Replicas, Connection Pooling, Edge Functions fuer Heavy Queries |
| KI-Kosten explodieren | Mittel | Usage-Capping pro Tier, Caching (ai_advice_cache existiert bereits), Model-Routing (guenstige Modelle fuer einfache Tasks) |
| Banking-API-Stabilitaet | Hoch | Fallback auf manuelle Eingabe, Retry-Logik, Multi-Provider-Strategie |
| Schema-Komplexitaet | Mittel | Modulare Migrationen (getrennt pro App), saubere RLS-Policies |

### 7.2 Regulatorische Risiken (EU/DACH)

| Bereich | Anforderung | Status |
|---------|-------------|--------|
| DSGVO | Datenschutz fuer Finanzdaten | RLS implementiert, Verschluesselung noetig |
| PSD2 | Open Banking Compliance | Via Bankin API abgedeckt |
| EU AI Act | Transparenz bei KI-Empfehlungen | "Insights, keine Finanzberatung" Disclaimer |
| GwG/AML | Anti-Geldwaesche | Erst relevant bei Zahlungsabwicklung (Phase 3+) |

### 7.3 Strategische Empfehlungen

1. **Nicht alles gleichzeitig starten.** Finance Coach + Biz sind die hoechsten ROI-Konzepte.
   Das bestehende Oekosystem hat hier bereits 70% der Infrastruktur.

2. **Entitlements-System ist der Schluessel.** Ohne dieses System kann kein modulares
   Monetarisierungsmodell funktionieren. ZUERST implementieren.

3. **Bestehende User-Basis nutzen.** Die aktiven Portal/Vermietify-Nutzer sind perfekte
   Early Adopters fuer Finance Coach und Biz.

4. **KI schrittweise einsetzen.** Start mit regelbasierten Insights, dann schrittweise
   ML/LLM einbauen. Spart Kosten und reduziert Risiko.

5. **Universe Bundle als Wachstumstreiber.** Ein 49.99 EUR "Alles-in-einem"-Abo ist
   fuer Power-User attraktiv und maximiert ARPU.

---

## Zusammenfassung

Das Fintutto-Oekosystem ist **optimal positioniert** fuer die FinTech-Erweiterung:

- **17 aktive Apps** mit bestehendem User-Stamm
- **Supabase + Stripe + Vercel** = exakt der Stack fuer FinTech-Skalierung
- **Banking-Integration** bereits in Vermietify implementiert
- **KI-Assistent** bereits produktiv
- **Credits- und Referral-System** bereits live

Die 5 FinTech-Konzepte (Finance Coach, Biz, Learn, API, Social) sind **alle verwertbar**,
mit klarer Priorisierung: **Biz > Finance Coach > Learn > API > Social**.

Geschaetztes Umsatzpotenzial (12-18 Monate nach Launch):
- Finance Coach: 10k User x 10 EUR = **100k EUR/Monat**
- Biz: 1k User x 25 EUR = **25k EUR/Monat**
- Learn: 500 User x 10 EUR + Bundles = **10k EUR/Monat**
- API: 10-50 B2B-Clients = **5-20k EUR/Monat**
- **Gesamt: 140-155k EUR/Monat moeglich**
