-- Migration 004: Core Property Tables
-- Erstellt die fehlenden Tabellen für die Cross-App-Integration
-- Alle Apps (Vermietify, Zähler, Mieter, Hausmeister, Admin, Portal, BescheidBoxer)
-- teilen diese Tabellen über eine gemeinsame Supabase-Instanz.

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
    purchase_price BIGINT,
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
    current_rent BIGINT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mieter
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
    landlord_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    move_in_date DATE NOT NULL,
    move_out_date DATE,
    deposit_amount BIGINT,
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
    base_rent BIGINT NOT NULL,
    utility_advance BIGINT DEFAULT 0,
    total_rent BIGINT NOT NULL,
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
    amount BIGINT NOT NULL,
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
CREATE INDEX IF NOT EXISTS idx_properties_user ON public.properties(user_id);
CREATE INDEX IF NOT EXISTS idx_units_property ON public.units(property_id);
CREATE INDEX IF NOT EXISTS idx_tenants_unit ON public.tenants(unit_id);
CREATE INDEX IF NOT EXISTS idx_tenants_landlord ON public.tenants(landlord_id);
CREATE INDEX IF NOT EXISTS idx_tenants_user ON public.tenants(user_id);
CREATE INDEX IF NOT EXISTS idx_contracts_unit ON public.rental_contracts(unit_id);
CREATE INDEX IF NOT EXISTS idx_contracts_tenant ON public.rental_contracts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_contract ON public.payments(contract_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_documents_user ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_property ON public.documents(property_id);

-- updated_at Trigger
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
