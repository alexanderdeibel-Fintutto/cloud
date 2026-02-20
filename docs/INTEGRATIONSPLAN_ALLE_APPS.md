# Fintutto: Cross-App-Integrationsplan

*Stand: 14.02.2026 - Vollständige Analyse & Umsetzungsstrategie*

---

## Diagnose: Warum Daten nicht app-übergreifend sichtbar sind

### Die 3 Kernprobleme

```
┌──────────────────────────────────────────────────────────────────────────┐
│  PROBLEM 1: FEHLENDE DATENBANK-TABELLEN                                │
│                                                                          │
│  Die Supabase-Datenbank enthält NUR:                                    │
│  ✅ users, checker_sessions, checker_results, ai_advice_cache           │
│  ✅ referral_codes, referrals, referral_rewards                         │
│                                                                          │
│  Es FEHLEN komplett:                                                     │
│  ❌ properties (Gebäude/Immobilien)                                     │
│  ❌ units (Wohnungen/Einheiten)                                         │
│  ❌ tenants (Mieter)                                                    │
│  ❌ rental_contracts (Mietverträge)                                     │
│  ❌ payments (Zahlungen)                                                │
│  ❌ documents (Dokumente)                                               │
│  ❌ profiles (erweiterte Benutzerprofile)                               │
│  ❌ meters / meter_readings (Zähler/Ablesungen)                        │
│  ❌ maintenance_requests (Mängelmeldungen)                              │
│  ❌ tasks (Aufgaben für Hausmeister)                                    │
│  ❌ tax_notices / bescheide (Steuerbescheide für BescheidBoxer)        │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│  PROBLEM 2: KEIN DATENZUGRIFF IM CODE                                   │
│                                                                          │
│  Vermietify-Komponenten sind reine UI-Stubs:                            │
│  - Properties.tsx → zeigt "Keine Immobilien" (kein Supabase-Query)     │
│  - Dashboard.tsx → zeigt "0" überall (hardcoded)                       │
│  - Meters.tsx → nur UI, kein fetch                                     │
│  - Tenants.tsx → nur UI, kein fetch                                    │
│                                                                          │
│  TypeScript-Typen existieren (types.ts, 355 Zeilen),                   │
│  aber KEINE einzige Supabase-Query ist implementiert.                   │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│  PROBLEM 3: ISOLIERTE LOVABLE-APPS                                      │
│                                                                          │
│  Jede App ist eine eigenständige Lovable-Instanz:                       │
│  - vermieter-freude (Vermietify)     → eigenes Lovable-Projekt         │
│  - leserally-all (Zähler/Ablesung)   → eigenes Lovable-Projekt         │
│  - wohn-held (Mieter)                → eigenes Lovable-Projekt         │
│  - fintu-hausmeister-app             → eigenes Lovable-Projekt         │
│  - fintutto-admin-hub                → eigenes Lovable-Projekt         │
│  - bescheidboxer                     → eigenes Lovable-Projekt         │
│                                                                          │
│  Jede hat möglicherweise eine EIGENE Supabase-Konfiguration.           │
│  Es gibt keine garantierte gemeinsame Datenbank.                        │
└──────────────────────────────────────────────────────────────────────────┘
```

### Was passiert, wenn du ein Gebäude in Vermietify erstellst?

```
1. Du füllst das Formular in Properties.tsx aus
2. Der Submit-Button hat KEINEN Handler → nichts passiert
3. Selbst wenn ein Handler existierte:
   → supabase.from('properties') schlägt fehl
   → Die Tabelle existiert nicht in der DB
4. Andere Apps können nichts sehen, weil:
   → Sie sind separate Lovable-Instanzen
   → Sie haben keinen Code, der properties abfragt
   → Die Tabelle existiert sowieso nicht
```

### Warum der Admin-Hub keine echten Daten zeigt

Der Admin-Hub (`fintutto-admin-hub`) ist ein Lovable-Projekt mit UI-Mockups. Er:
- hat keine Verbindung zu einer befüllten Datenbank
- zeigt Platzhalter-Daten oder leere Listen
- hat keine implementierten Supabase-Queries für properties/tenants/payments
- kann keine Daten anzeigen, die nirgendwo existieren

---

## Lösung: Unified Data Layer

### Architektur-Überblick

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     EINE Supabase-Instanz für ALLE Apps                │
│                  (aaefocdqgdgexkcrjhks.supabase.co)                    │
│                                                                         │
│  ┌─────────────┐                                                        │
│  │  Auth Layer  │  Ein Account → Zugang zu allen Apps                   │
│  │  (auth.users)│  SSO via Supabase Auth + persistierte Session         │
│  └──────┬──────┘                                                        │
│         │                                                               │
│  ┌──────▼──────────────────────────────────────────────────────────┐   │
│  │  Shared Schema (public.*)                                        │   │
│  │                                                                   │   │
│  │  profiles ──┐                                                     │   │
│  │             ├── properties ──── units ──── meters                 │   │
│  │             │        │           │          │                     │   │
│  │             │        │           ├── tenants │                    │   │
│  │             │        │           │     │     │                    │   │
│  │             │        │           │  contracts│                    │   │
│  │             │        │           │     │     │                    │   │
│  │             │        │           │  payments │                    │   │
│  │             │        │           │           │                    │   │
│  │             │        ├── documents    meter_readings              │   │
│  │             │        │                                            │   │
│  │             │        ├── maintenance_requests                     │   │
│  │             │        │                                            │   │
│  │             │        ├── tasks (Hausmeister)                      │   │
│  │             │        │                                            │   │
│  │             │        └── tax_notices (BescheidBoxer)              │   │
│  │             │                                                     │   │
│  │             ├── checker_sessions / checker_results                │   │
│  │             ├── referral_codes / referrals / referral_rewards     │   │
│  │             └── users (Tier, Credits)                             │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  RLS (Row Level Security)                                         │   │
│  │                                                                   │   │
│  │  Vermieter:   sieht eigene Properties + zugehörige Daten        │   │
│  │  Mieter:      sieht eigene Unit + Vertrag + Zähler              │   │
│  │  Hausmeister: sieht zugewiesene Tasks + Property-Kontext         │   │
│  │  Admin:       sieht ALLES (Service Role oder admin-Flag)         │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  App-Zugriff (gleiche Supabase URL + Anon Key)                    │   │
│  │                                                                   │   │
│  │  Vermietify ─── Portal ─── Zähler ─── Mieter                    │   │
│  │       │                       │          │                        │   │
│  │   Hausmeister ─── Admin-Hub ─── BescheidBoxer ─── Fintutto      │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Datenbank-Fundament

### Migration 004: Core Property Tables

```sql
-- supabase/migrations/004_create_property_tables.sql

-- Erweiterte Benutzerprofile
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    company_name TEXT,
    phone TEXT,
    street TEXT,
    postal_code TEXT,
    city TEXT,
    country TEXT DEFAULT 'Deutschland',
    role TEXT DEFAULT 'vermieter' CHECK (role IN ('vermieter', 'mieter', 'hausmeister', 'admin')),
    subscription_tier TEXT DEFAULT 'free',
    subscription_status TEXT DEFAULT 'active',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gebäude/Immobilien
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    street TEXT NOT NULL,
    house_number TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT DEFAULT 'Deutschland',
    property_type TEXT DEFAULT 'apartment_building'
        CHECK (property_type IN ('apartment_building', 'single_family', 'commercial', 'mixed')),
    year_built INTEGER,
    living_space NUMERIC(10,2),
    land_area NUMERIC(10,2),
    number_of_units INTEGER DEFAULT 1,
    purchase_price BIGINT,  -- in Cent
    purchase_date DATE,
    notes TEXT,
    image_urls TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wohnungen/Einheiten
CREATE TABLE IF NOT EXISTS public.units (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    floor INTEGER,
    rooms NUMERIC(3,1),
    living_space NUMERIC(10,2) NOT NULL,
    unit_type TEXT DEFAULT 'apartment'
        CHECK (unit_type IN ('apartment', 'commercial', 'parking', 'storage', 'other')),
    is_rented BOOLEAN DEFAULT false,
    current_rent BIGINT,  -- in Cent
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mieter
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- optional: Mieter-Account-Verknüpfung
    unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
    landlord_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,  -- Vermieter, der den Mieter angelegt hat
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    move_in_date DATE NOT NULL,
    move_out_date DATE,
    deposit_amount BIGINT,  -- in Cent
    deposit_paid BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mietverträge
CREATE TABLE IF NOT EXISTS public.rental_contracts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    base_rent BIGINT NOT NULL,  -- Kaltmiete in Cent
    utility_advance BIGINT DEFAULT 0,  -- NK-Vorauszahlung in Cent
    total_rent BIGINT NOT NULL,  -- Warmmiete in Cent
    payment_day INTEGER DEFAULT 1 CHECK (payment_day BETWEEN 1 AND 31),
    contract_type TEXT DEFAULT 'unlimited'
        CHECK (contract_type IN ('unlimited', 'limited', 'sublease')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Zahlungen
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contract_id UUID NOT NULL REFERENCES public.rental_contracts(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    amount BIGINT NOT NULL,  -- in Cent
    due_date DATE NOT NULL,
    paid_date DATE,
    payment_type TEXT DEFAULT 'rent'
        CHECK (payment_type IN ('rent', 'deposit', 'utility', 'other')),
    status TEXT DEFAULT 'pending'
        CHECK (status IN ('pending', 'paid', 'overdue', 'partial')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dokumente
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT DEFAULT 0,
    category TEXT DEFAULT 'other'
        CHECK (category IN ('contract', 'invoice', 'protocol', 'notice', 'certificate', 'tax', 'insurance', 'other')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indizes
CREATE INDEX idx_properties_user ON public.properties(user_id);
CREATE INDEX idx_units_property ON public.units(property_id);
CREATE INDEX idx_tenants_unit ON public.tenants(unit_id);
CREATE INDEX idx_tenants_landlord ON public.tenants(landlord_id);
CREATE INDEX idx_contracts_unit ON public.rental_contracts(unit_id);
CREATE INDEX idx_contracts_tenant ON public.rental_contracts(tenant_id);
CREATE INDEX idx_payments_contract ON public.payments(contract_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_documents_user ON public.documents(user_id);
CREATE INDEX idx_documents_property ON public.documents(property_id);

-- updated_at Trigger für alle relevanten Tabellen
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON public.properties
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_units_updated_at
    BEFORE UPDATE ON public.units
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_tenants_updated_at
    BEFORE UPDATE ON public.tenants
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_contracts_updated_at
    BEFORE UPDATE ON public.rental_contracts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
```

### Migration 005: Meter & Maintenance Tables

```sql
-- supabase/migrations/005_create_meter_and_maintenance_tables.sql

-- Zähler
CREATE TABLE IF NOT EXISTS public.meters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
    meter_number TEXT NOT NULL,
    meter_type TEXT NOT NULL
        CHECK (meter_type IN ('electricity', 'gas', 'water_cold', 'water_hot', 'heating', 'other')),
    location TEXT,
    installation_date DATE,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Zählerstandablesungen
CREATE TABLE IF NOT EXISTS public.meter_readings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    meter_id UUID NOT NULL REFERENCES public.meters(id) ON DELETE CASCADE,
    reading_value NUMERIC(12,3) NOT NULL,
    reading_date DATE NOT NULL,
    read_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    image_url TEXT,  -- Foto der Ablesung
    source TEXT DEFAULT 'manual'
        CHECK (source IN ('manual', 'ocr', 'import', 'smart_meter')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mängelmeldungen / Wartungsanfragen
CREATE TABLE IF NOT EXISTS public.maintenance_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
    reported_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- Hausmeister
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'other'
        CHECK (category IN ('plumbing', 'electrical', 'heating', 'structural', 'appliance', 'pest', 'cleaning', 'other')),
    priority TEXT DEFAULT 'normal'
        CHECK (priority IN ('low', 'normal', 'high', 'emergency')),
    status TEXT DEFAULT 'open'
        CHECK (status IN ('open', 'in_progress', 'waiting', 'resolved', 'closed')),
    image_urls TEXT[],
    resolved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aufgaben (Hausmeister + allgemein)
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    maintenance_request_id UUID REFERENCES public.maintenance_requests(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    priority TEXT DEFAULT 'normal'
        CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status TEXT DEFAULT 'todo'
        CHECK (status IN ('todo', 'in_progress', 'done', 'cancelled')),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indizes
CREATE INDEX idx_meters_unit ON public.meters(unit_id);
CREATE INDEX idx_meter_readings_meter ON public.meter_readings(meter_id);
CREATE INDEX idx_meter_readings_date ON public.meter_readings(reading_date);
CREATE INDEX idx_maintenance_property ON public.maintenance_requests(property_id);
CREATE INDEX idx_maintenance_status ON public.maintenance_requests(status);
CREATE INDEX idx_maintenance_assigned ON public.maintenance_requests(assigned_to);
CREATE INDEX idx_tasks_property ON public.tasks(property_id);
CREATE INDEX idx_tasks_assigned ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_status ON public.tasks(status);

-- Trigger
CREATE TRIGGER update_meters_updated_at
    BEFORE UPDATE ON public.meters
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_maintenance_updated_at
    BEFORE UPDATE ON public.maintenance_requests
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
```

### Migration 006: BescheidBoxer Tables

```sql
-- supabase/migrations/006_create_bescheidboxer_tables.sql

-- Steuerbescheide (BescheidBoxer)
CREATE TABLE IF NOT EXISTS public.tax_notices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    notice_type TEXT NOT NULL
        CHECK (notice_type IN (
            'grundsteuer', 'einkommensteuer', 'gewerbesteuer',
            'umsatzsteuer', 'erbschaftsteuer', 'schenkungsteuer',
            'grunderwerbsteuer', 'other'
        )),
    tax_year INTEGER NOT NULL,
    received_date DATE NOT NULL,
    deadline_date DATE,          -- Einspruchsfrist
    amount_assessed BIGINT,      -- Festgesetzter Betrag in Cent
    amount_expected BIGINT,      -- Erwarteter Betrag in Cent
    deviation_amount BIGINT,     -- Abweichung in Cent
    status TEXT DEFAULT 'received'
        CHECK (status IN ('received', 'checking', 'accepted', 'objection_filed', 'resolved')),
    objection_deadline DATE,     -- Einspruchsfrist
    ai_analysis JSONB,           -- KI-Analyse-Ergebnis
    document_ids UUID[],         -- Verknüpfte Dokumente
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bescheid-Prüfungsergebnisse
CREATE TABLE IF NOT EXISTS public.tax_notice_checks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tax_notice_id UUID NOT NULL REFERENCES public.tax_notices(id) ON DELETE CASCADE,
    check_type TEXT NOT NULL,    -- z.B. 'grundsteuer_berechnung', 'frist_pruefung'
    input_data JSONB NOT NULL,
    result_data JSONB NOT NULL,
    recommendation TEXT,
    has_issues BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indizes
CREATE INDEX idx_tax_notices_user ON public.tax_notices(user_id);
CREATE INDEX idx_tax_notices_property ON public.tax_notices(property_id);
CREATE INDEX idx_tax_notices_type ON public.tax_notices(notice_type);
CREATE INDEX idx_tax_notices_status ON public.tax_notices(status);
CREATE INDEX idx_tax_notice_checks_notice ON public.tax_notice_checks(tax_notice_id);

-- Trigger
CREATE TRIGGER update_tax_notices_updated_at
    BEFORE UPDATE ON public.tax_notices
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
```

### Migration 007: RLS Policies

```sql
-- supabase/migrations/007_rls_policies.sql

-- ============ PROFILES ============
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ============ PROPERTIES ============
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can CRUD own properties"
    ON public.properties FOR ALL USING (auth.uid() = user_id);
-- Mieter sehen die Property ihrer Unit
CREATE POLICY "Tenants can view assigned property"
    ON public.properties FOR SELECT
    USING (
        id IN (
            SELECT p.id FROM properties p
            JOIN units u ON u.property_id = p.id
            JOIN tenants t ON t.unit_id = u.id
            WHERE t.user_id = auth.uid() AND t.is_active = true
        )
    );
-- Hausmeister sehen zugewiesene Properties
CREATE POLICY "Caretakers can view assigned properties"
    ON public.properties FOR SELECT
    USING (
        id IN (
            SELECT DISTINCT property_id FROM tasks
            WHERE assigned_to = auth.uid()
        )
    );

-- ============ UNITS ============
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can CRUD units of own properties"
    ON public.units FOR ALL
    USING (
        property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
    );
CREATE POLICY "Tenants can view own unit"
    ON public.units FOR SELECT
    USING (
        id IN (SELECT unit_id FROM tenants WHERE user_id = auth.uid() AND is_active = true)
    );

-- ============ TENANTS ============
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Landlords can CRUD own tenants"
    ON public.tenants FOR ALL USING (landlord_id = auth.uid());
CREATE POLICY "Tenants can view own record"
    ON public.tenants FOR SELECT USING (user_id = auth.uid());

-- ============ RENTAL CONTRACTS ============
ALTER TABLE public.rental_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Landlords can CRUD contracts for own units"
    ON public.rental_contracts FOR ALL
    USING (
        unit_id IN (
            SELECT u.id FROM units u
            JOIN properties p ON p.id = u.property_id
            WHERE p.user_id = auth.uid()
        )
    );
CREATE POLICY "Tenants can view own contracts"
    ON public.rental_contracts FOR SELECT
    USING (
        tenant_id IN (SELECT id FROM tenants WHERE user_id = auth.uid())
    );

-- ============ PAYMENTS ============
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Landlords can manage payments"
    ON public.payments FOR ALL
    USING (
        contract_id IN (
            SELECT rc.id FROM rental_contracts rc
            JOIN units u ON u.id = rc.unit_id
            JOIN properties p ON p.id = u.property_id
            WHERE p.user_id = auth.uid()
        )
    );
CREATE POLICY "Tenants can view own payments"
    ON public.payments FOR SELECT
    USING (
        tenant_id IN (SELECT id FROM tenants WHERE user_id = auth.uid())
    );

-- ============ METERS ============
ALTER TABLE public.meters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage meters"
    ON public.meters FOR ALL
    USING (
        unit_id IN (
            SELECT u.id FROM units u
            JOIN properties p ON p.id = u.property_id
            WHERE p.user_id = auth.uid()
        )
    );
CREATE POLICY "Tenants can view meters in own unit"
    ON public.meters FOR SELECT
    USING (
        unit_id IN (SELECT unit_id FROM tenants WHERE user_id = auth.uid() AND is_active = true)
    );

-- ============ METER READINGS ============
ALTER TABLE public.meter_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage readings"
    ON public.meter_readings FOR ALL
    USING (
        meter_id IN (
            SELECT m.id FROM meters m
            JOIN units u ON u.id = m.unit_id
            JOIN properties p ON p.id = u.property_id
            WHERE p.user_id = auth.uid()
        )
    );
CREATE POLICY "Tenants can read and create readings for own meters"
    ON public.meter_readings FOR SELECT
    USING (
        meter_id IN (
            SELECT m.id FROM meters m
            WHERE m.unit_id IN (
                SELECT unit_id FROM tenants WHERE user_id = auth.uid() AND is_active = true
            )
        )
    );
CREATE POLICY "Tenants can submit readings"
    ON public.meter_readings FOR INSERT
    WITH CHECK (
        read_by = auth.uid() AND
        meter_id IN (
            SELECT m.id FROM meters m
            WHERE m.unit_id IN (
                SELECT unit_id FROM tenants WHERE user_id = auth.uid() AND is_active = true
            )
        )
    );

-- ============ MAINTENANCE REQUESTS ============
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage requests for own properties"
    ON public.maintenance_requests FOR ALL
    USING (
        property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
    );
CREATE POLICY "Tenants can create and view own requests"
    ON public.maintenance_requests FOR SELECT
    USING (reported_by = auth.uid());
CREATE POLICY "Tenants can create requests"
    ON public.maintenance_requests FOR INSERT
    WITH CHECK (reported_by = auth.uid());
CREATE POLICY "Caretakers can view and update assigned requests"
    ON public.maintenance_requests FOR SELECT
    USING (assigned_to = auth.uid());
CREATE POLICY "Caretakers can update assigned requests"
    ON public.maintenance_requests FOR UPDATE
    USING (assigned_to = auth.uid());

-- ============ TASKS ============
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage tasks for own properties"
    ON public.tasks FOR ALL
    USING (
        property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
    );
CREATE POLICY "Assigned users can view and update tasks"
    ON public.tasks FOR SELECT USING (assigned_to = auth.uid());
CREATE POLICY "Assigned users can update tasks"
    ON public.tasks FOR UPDATE USING (assigned_to = auth.uid());

-- ============ DOCUMENTS ============
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own documents"
    ON public.documents FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Tenants can view shared documents"
    ON public.documents FOR SELECT
    USING (
        tenant_id IN (SELECT id FROM tenants WHERE user_id = auth.uid())
        OR unit_id IN (SELECT unit_id FROM tenants WHERE user_id = auth.uid() AND is_active = true)
    );

-- ============ TAX NOTICES (BescheidBoxer) ============
ALTER TABLE public.tax_notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tax notices"
    ON public.tax_notices FOR ALL USING (user_id = auth.uid());

ALTER TABLE public.tax_notice_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view checks for own notices"
    ON public.tax_notice_checks FOR SELECT
    USING (
        tax_notice_id IN (SELECT id FROM tax_notices WHERE user_id = auth.uid())
    );
CREATE POLICY "Users can create checks for own notices"
    ON public.tax_notice_checks FOR INSERT
    WITH CHECK (
        tax_notice_id IN (SELECT id FROM tax_notices WHERE user_id = auth.uid())
    );
```

### Migration 008: Profile Trigger erweitern

```sql
-- supabase/migrations/008_extend_user_trigger.sql

-- Erweitere den User-Trigger, um auch ein Profil zu erstellen
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Existierenden users-Eintrag erstellen
    INSERT INTO public.users (id, email, name, tier, checks_used, checks_limit)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'name',
        'free',
        0,
        3
    );

    -- Profil erstellen
    INSERT INTO public.profiles (id, email, first_name, last_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        COALESCE(NEW.raw_user_meta_data->>'role', 'vermieter')
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Phase 2: Supabase-Konfiguration vereinheitlichen

### Alle Apps auf EINE Supabase-Instanz

Jede App muss die GLEICHEN Supabase-Credentials verwenden:

```env
# .env für ALLE Apps (Vercel Environment Variables)
VITE_SUPABASE_URL=https://aaefocdqgdgexkcrjhks.supabase.co
VITE_SUPABASE_ANON_KEY=<der-gleiche-anon-key>
```

### Prüfliste für jedes Lovable-Projekt

| App | Repo | Supabase-URL prüfen | Anon-Key prüfen | Tabellen nutzen |
|-----|------|---------------------|-----------------|-----------------|
| Vermietify | `vermieter-freude` | | | properties, units, tenants, contracts, payments, meters |
| Zähler | `leserally-all` (ablesung) | | | meters, meter_readings, units, properties |
| Mieter | `wohn-held` (mieter) | | | tenants, units, maintenance_requests, meter_readings, documents |
| Hausmeister | `fintu-hausmeister-app` | | | tasks, maintenance_requests, properties |
| Admin-Hub | `fintutto-admin-hub` | | | ALLE Tabellen (admin read) |
| BescheidBoxer | `bescheidboxer` | | | tax_notices, tax_notice_checks, properties, documents |
| Portal | `portal` | | | checker_*, rechner, users, properties (Kontext) |
| Fintutto | `fintutto-your-financial-compass` | | | profiles, documents, payments (Buchhaltung) |

**Aktion**: In jedem Lovable-Projekt unter Settings → Supabase die gleiche Instanz verbinden.

---

## Phase 3: App-spezifische Daten-Integration

### 3.1 Vermietify (vermieter-freude) - Haupt-Datenquelle

Vermietify ist die zentrale App, in der Vermieter Gebäude, Einheiten und Mieter anlegen.

**Benötigte Queries (React Query / TanStack)**:

```typescript
// hooks/useProperties.ts
export function useProperties() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['properties', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          units (
            *,
            tenants (*),
            meters (*)
          )
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

// hooks/useCreateProperty.ts
export function useCreateProperty() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (property: PropertyInsert) => {
      const { data, error } = await supabase
        .from('properties')
        .insert({ ...property, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}
```

### 3.2 Zähler/Ablesung (leserally-all)

Liest Gebäude und Einheiten des eingeloggten Vermieters. Zeigt nur die Zähler-relevanten Daten.

```typescript
// Die gleiche Supabase-Instanz, gleicher User
// → sieht automatisch die gleichen Properties via RLS
const { data: properties } = await supabase
  .from('properties')
  .select(`
    id, name, street, house_number, city,
    units (
      id, name, floor,
      meters (
        id, meter_number, meter_type,
        meter_readings (reading_value, reading_date)
      )
    )
  `)
  .eq('user_id', user.id);
```

### 3.3 Mieter (wohn-held)

Mieter loggt sich ein → `tenants.user_id` wird gematcht → sieht nur eigene Unit, Zähler, Dokumente.

```typescript
// Mieter-Dashboard: eigene Wohnung laden
const { data: myUnit } = await supabase
  .from('tenants')
  .select(`
    *,
    unit:units (
      *,
      property:properties (name, street, house_number, city),
      meters (id, meter_number, meter_type)
    ),
    contracts:rental_contracts (*)
  `)
  .eq('user_id', user.id)
  .eq('is_active', true)
  .single();
```

### 3.4 Hausmeister (fintu-hausmeister-app)

Hausmeister sieht nur zugewiesene Tasks und die zugehörigen Property-Informationen.

```typescript
// Hausmeister-Dashboard: zugewiesene Aufgaben
const { data: myTasks } = await supabase
  .from('tasks')
  .select(`
    *,
    property:properties (name, street, house_number, city),
    maintenance_request:maintenance_requests (title, description, category, priority)
  `)
  .eq('assigned_to', user.id)
  .in('status', ['todo', 'in_progress'])
  .order('due_date', { ascending: true });
```

### 3.5 Admin-Hub (fintutto-admin-hub)

Der Admin braucht Zugriff auf ALLE Daten. Optionen:

**Option A**: Supabase Service Role (Server-Side)
```typescript
// API-Route (nicht im Frontend!)
const adminClient = createClient(url, SERVICE_ROLE_KEY);
const { data: allProperties } = await adminClient.from('properties').select('*');
```

**Option B**: Admin-Flag in profiles + RLS-Policy
```sql
CREATE POLICY "Admins can read everything"
    ON public.properties FOR SELECT
    USING (
        auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
    );
```

### 3.6 BescheidBoxer (bescheidboxer) - NEU

BescheidBoxer prüft Steuerbescheide. Integration mit Properties ermöglicht automatischen Kontext.

```typescript
// Beim Erstellen eines Bescheids: Property-Auswahl anbieten
const { data: properties } = await supabase
  .from('properties')
  .select('id, name, street, house_number, city')
  .eq('user_id', user.id);

// Bescheid erstellen mit Property-Verknüpfung
const { data: notice } = await supabase
  .from('tax_notices')
  .insert({
    user_id: user.id,
    property_id: selectedPropertyId,  // optional
    notice_type: 'grundsteuer',
    tax_year: 2025,
    received_date: '2026-02-10',
    amount_assessed: 125000,  // 1.250,00 EUR in Cent
  })
  .select()
  .single();
```

### 3.7 Portal (fintutto-portal)

Portal-Rechner können mit echten Property-Daten arbeiten:

```typescript
// Kautionsrechner: Mieter aus Vermietify laden
const { data: contracts } = await supabase
  .from('rental_contracts')
  .select('base_rent, tenant:tenants(first_name, last_name)')
  .eq('unit_id', selectedUnitId);

// → Kaution berechnen: max. 3x Kaltmiete (§551 BGB)
const maxDeposit = contract.base_rent * 3;
```

---

## Phase 4: Shared Code Package

### @fintutto/shared erweitern

```
packages/shared/src/
├── index.ts          (bestehend, Konstanten + Formatter)
├── types/
│   ├── database.ts   (NEU: generierte Supabase-Typen für ALLE Tabellen)
│   ├── property.ts   (NEU: Property, Unit, Tenant Interfaces)
│   ├── meter.ts      (NEU: Meter, MeterReading Interfaces)
│   ├── task.ts       (NEU: Task, MaintenanceRequest Interfaces)
│   └── tax.ts        (NEU: TaxNotice, TaxNoticeCheck Interfaces)
├── hooks/
│   ├── useProperties.ts   (NEU: shared React Query hooks)
│   ├── useUnits.ts
│   ├── useTenants.ts
│   ├── useMeters.ts
│   └── useAuth.ts         (NEU: vereinheitlichter Auth-Hook)
├── supabase/
│   └── client.ts          (NEU: shared Supabase Client-Factory)
└── utils/
    ├── currency.ts        (formatEuro, centToEuro, euroToCent)
    ├── dates.ts           (formatDateDE, parseGermanDate)
    └── legal.ts           (§-Referenzen, Fristen-Berechnung)
```

---

## Phase 5: Mieter-Vermieter-Verknüpfung

### Wie ein Mieter einer Wohnung zugeordnet wird

```
1. Vermieter erstellt Property + Unit in Vermietify
2. Vermieter erstellt Mieter-Eintrag mit Email-Adresse
3. System sendet Einladungs-Email an Mieter
4. Mieter registriert sich in der Mieter-App (wohn-held)
5. Bei Registrierung: tenants.user_id = auth.uid() setzen
6. RLS greift: Mieter sieht nur seine eigene Unit + Property
```

```sql
-- Funktion: Mieter-Account mit Tenant-Eintrag verknüpfen
CREATE OR REPLACE FUNCTION public.link_tenant_account(p_tenant_email TEXT)
RETURNS void AS $$
BEGIN
    UPDATE public.tenants
    SET user_id = auth.uid()
    WHERE email = p_tenant_email
      AND user_id IS NULL
      AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Hausmeister-Zuordnung

```
1. Vermieter erstellt Hausmeister-Profil in Vermietify
2. Hausmeister wird Properties zugewiesen (z.B. via Junction-Table oder tasks)
3. Hausmeister registriert sich in HausmeisterPro
4. Sieht nur zugewiesene Tasks für seine Properties
```

---

## Phase 6: Datenfluss zwischen Apps

### Übersicht: Wer schreibt, wer liest

```
┌───────────────────────────────────────────────────────────────────────────┐
│                     DATENFLUSS-MATRIX                                    │
│                                                                           │
│  Tabelle             │ Schreiben                │ Lesen                   │
│  ────────────────────┼──────────────────────────┼──────────────────────── │
│  properties          │ Vermietify               │ ALLE Apps               │
│  units               │ Vermietify               │ ALLE Apps               │
│  tenants             │ Vermietify               │ Vermietify, Mieter      │
│  rental_contracts    │ Vermietify               │ Vermietify, Mieter,     │
│                      │                          │ Portal (Rechner)        │
│  payments            │ Vermietify               │ Vermietify, Mieter,     │
│                      │                          │ Admin, Fintutto         │
│  meters              │ Vermietify, Zähler       │ Vermietify, Zähler,     │
│                      │                          │ Mieter                  │
│  meter_readings      │ Zähler, Mieter           │ Vermietify, Zähler,     │
│                      │                          │ Mieter                  │
│  maintenance_requests│ Mieter                   │ Vermietify, Hausmeister │
│  tasks               │ Vermietify               │ Hausmeister, Vermietify │
│  documents           │ Vermietify, Portal       │ ALLE relevanten Apps    │
│  tax_notices         │ BescheidBoxer            │ BescheidBoxer, Admin,   │
│                      │                          │ Fintutto                │
│  checker_sessions    │ Portal, Mieter           │ Portal, Mieter, Admin   │
│  users               │ Auth-Trigger             │ ALLE Apps               │
│  profiles            │ Jede App (eigenes Profil)│ ALLE Apps               │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 7: BescheidBoxer-Integration im Detail

### Was BescheidBoxer kann

BescheidBoxer prüft Steuerbescheide auf Fehler und berechnet, ob ein Einspruch sinnvoll ist.

### Integration mit dem Ökosystem

```
┌─────────────────────────────────────────────────────────────────────┐
│  BescheidBoxer-Workflow                                             │
│                                                                      │
│  1. Nutzer lädt Steuerbescheid hoch (PDF)                           │
│     → documents-Tabelle (category: 'tax')                           │
│     → Verknüpfung mit property_id (wenn Grundsteuer)                │
│                                                                      │
│  2. KI analysiert den Bescheid                                       │
│     → tax_notices.ai_analysis (JSONB)                               │
│     → Abweichung berechnen (assessed vs. expected)                  │
│                                                                      │
│  3. Ergebnis + Empfehlung                                            │
│     → tax_notice_checks-Tabelle                                     │
│     → Einspruchsfrist berechnen                                      │
│     → Formular für Einspruch generieren (→ Portal Formulare)        │
│                                                                      │
│  4. Cross-App-Daten                                                  │
│     → Property-Daten aus Vermietify für Grundsteuer-Kontext         │
│     → Dokument im Document-Hub sichtbar (Fintutto, Admin)           │
│     → Frist im Kalender (Vermietify, Fintutto)                      │
│     → Steuerberater-Export (Fintutto Buchhaltung)                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Umsetzungsreihenfolge

### Schritt 1: Datenbank erstellen (KRITISCH)
- [ ] Migration 004-008 in Supabase ausführen
- [ ] Prüfen, dass alle Tabellen korrekt angelegt sind
- [ ] Testen: manuell einen Property-Eintrag via Supabase Dashboard erstellen

### Schritt 2: Supabase in allen Apps vereinheitlichen
- [ ] Alle Lovable-Projekte auf gleiche Supabase-Instanz konfigurieren
- [ ] VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY in Vercel für jedes Projekt setzen
- [ ] Testen: `supabase.auth.getUser()` in jeder App verifizieren

### Schritt 3: Vermietify Daten-Layer implementieren
- [ ] useProperties Hook (CRUD)
- [ ] useUnits Hook (CRUD)
- [ ] useTenants Hook (CRUD)
- [ ] useContracts Hook (CRUD)
- [ ] usePayments Hook (CRUD)
- [ ] Dashboard mit echten Daten befüllen
- [ ] Testen: Gebäude anlegen → Unit anlegen → Mieter zuordnen

### Schritt 4: Zähler-App verbinden
- [ ] Gleiche Supabase-Instanz verwenden
- [ ] Properties/Units des Users laden
- [ ] Meter CRUD implementieren
- [ ] Meter Readings CRUD implementieren
- [ ] Testen: Gebäude aus Vermietify in Zähler-App sichtbar

### Schritt 5: Mieter-App verbinden
- [ ] Tenant-Account-Verknüpfung implementieren
- [ ] Eigene Unit/Property/Zähler laden
- [ ] Mängelmeldung erstellen
- [ ] Zählerstand ablesen
- [ ] Testen: Mieter sieht nur eigene Wohnung

### Schritt 6: Hausmeister-App verbinden
- [ ] Tasks laden (assigned_to = user)
- [ ] Maintenance Requests sehen
- [ ] Status-Updates senden
- [ ] Testen: Hausmeister sieht nur zugewiesene Aufgaben

### Schritt 7: Admin-Hub mit echten Daten
- [ ] Admin-RLS oder Service-Role einrichten
- [ ] Dashboard-KPIs aus echten Daten berechnen
- [ ] User-Management mit profiles-Tabelle
- [ ] Property-Übersicht aller User
- [ ] Testen: Admin sieht alle Daten, nicht nur eigene

### Schritt 8: BescheidBoxer integrieren
- [ ] tax_notices CRUD implementieren
- [ ] Property-Verknüpfung beim Bescheid-Upload
- [ ] Dokument-Upload in documents-Tabelle
- [ ] Frist-Berechnung implementieren
- [ ] Testen: Bescheid mit Grundsteuer → Property-Kontext automatisch

### Schritt 9: Portal-Rechner mit echten Daten
- [ ] Property-Auswahl in Rechnern anbieten
- [ ] Vertragsdaten in Kautionsrechner vorladen
- [ ] Checker-Ergebnisse in Mieter-App sichtbar machen
- [ ] Testen: Rechner mit vorausgefüllten Gebäudedaten

### Schritt 10: Shared Code Package
- [ ] TypeScript-Typen aus Supabase generieren
- [ ] Shared Hooks extrahieren
- [ ] In allen Apps importieren
- [ ] Testen: Typ-Änderung in shared → alle Apps konsistent

---

## Zusammenfassung

| Problem | Ursache | Lösung |
|---------|---------|--------|
| Gebäude nicht in anderen Apps sichtbar | `properties`-Tabelle existiert nicht | Migration 004 ausführen |
| Admin-Hub zeigt keine echten Daten | Keine Daten in DB, nur UI-Stubs | DB befüllen + Queries implementieren |
| Apps sind isoliert | Separate Lovable-Instanzen ohne shared DB | Alle auf gleiche Supabase-Instanz |
| Kein Datenzugriff im Code | UI-Stubs ohne Supabase-Queries | React Query Hooks implementieren |
| Mieter sieht keine Wohnung | Keine Tenant-Account-Verknüpfung | `tenants.user_id` + Einladungsflow |
| Hausmeister ohne Aufgaben | Keine Tasks-Tabelle | Migration 005 + Task-Zuweisung |
| BescheidBoxer nicht verbunden | Neues Projekt, 4 Commits | Migration 006 + Property-Verknüpfung |
| Checker-Daten isoliert | Nur in Portal gespeichert | Shared `checker_results` + RLS |

*Erstellt: 14.02.2026*
*Grundlage: Vollständige Code-Analyse aller 8 Repositories*
