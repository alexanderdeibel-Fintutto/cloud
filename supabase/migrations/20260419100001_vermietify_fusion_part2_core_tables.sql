-- ============================================================
-- VERMIETIFY FUSION: Part 2 – Kern-Tabellen
-- buildings, leases, rent_adjustments, org_memberships, user_roles
-- Datum: 2026-04-19
-- ============================================================

-- BUILDINGS (Kern-Tabelle – ersetzt/ergänzt properties für Vermietify)
CREATE TABLE IF NOT EXISTS public.buildings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    building_type public.building_type NOT NULL DEFAULT 'apartment',
    year_built INTEGER,
    total_area DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_buildings_org ON public.buildings(organization_id);

-- Spalte building_id zu units hinzufügen (falls noch nicht vorhanden)
ALTER TABLE public.units ADD COLUMN IF NOT EXISTS building_id UUID REFERENCES public.buildings(id) ON DELETE CASCADE;
ALTER TABLE public.units ADD COLUMN IF NOT EXISTS unit_number TEXT;
ALTER TABLE public.units ADD COLUMN IF NOT EXISTS status public.unit_status DEFAULT 'vacant';
ALTER TABLE public.units ADD COLUMN IF NOT EXISTS cold_rent_cents INTEGER DEFAULT 0;
ALTER TABLE public.units ADD COLUMN IF NOT EXISTS warm_rent_cents INTEGER DEFAULT 0;
ALTER TABLE public.units ADD COLUMN IF NOT EXISTS deposit_cents INTEGER DEFAULT 0;

-- ORG_MEMBERSHIPS
CREATE TABLE IF NOT EXISTS public.org_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.app_role NOT NULL DEFAULT 'member',
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMPTZ DEFAULT now(),
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(organization_id, user_id)
);
ALTER TABLE public.org_memberships ENABLE ROW LEVEL SECURITY;

-- USER_ROLES
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    role public.app_role NOT NULL DEFAULT 'member',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, organization_id)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- LEASES (Mietverträge – vollständig aus vermietify_final)
CREATE TABLE IF NOT EXISTS public.leases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    is_unlimited BOOLEAN NOT NULL DEFAULT true,
    cold_rent_cents INTEGER NOT NULL DEFAULT 0,
    warm_rent_cents INTEGER NOT NULL DEFAULT 0,
    deposit_cents INTEGER NOT NULL DEFAULT 0,
    deposit_paid BOOLEAN NOT NULL DEFAULT false,
    deposit_paid_date DATE,
    payment_day INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.leases ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_leases_unit ON public.leases(unit_id);
CREATE INDEX IF NOT EXISTS idx_leases_tenant ON public.leases(tenant_id);

-- LEASE_RENT_SETTINGS
CREATE TABLE IF NOT EXISTS public.lease_rent_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lease_id UUID NOT NULL REFERENCES public.leases(id) ON DELETE CASCADE,
    adjustment_type public.rent_adjustment_type NOT NULL DEFAULT 'index',
    base_index DECIMAL(10,4),
    current_index DECIMAL(10,4),
    staffel_steps JSONB DEFAULT '[]',
    notice_months INTEGER NOT NULL DEFAULT 3,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(lease_id)
);
ALTER TABLE public.lease_rent_settings ENABLE ROW LEVEL SECURITY;

-- RENT_ADJUSTMENTS
CREATE TABLE IF NOT EXISTS public.rent_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lease_id UUID NOT NULL REFERENCES public.leases(id) ON DELETE CASCADE,
    adjustment_type public.rent_adjustment_type NOT NULL,
    old_rent_cents INTEGER NOT NULL,
    new_rent_cents INTEGER NOT NULL,
    effective_date DATE NOT NULL,
    notice_date DATE,
    status public.rent_adjustment_status NOT NULL DEFAULT 'pending',
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.rent_adjustments ENABLE ROW LEVEL SECURITY;

-- BUILDING_CARETAKERS
CREATE TABLE IF NOT EXISTS public.building_caretakers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(building_id, user_id)
);
ALTER TABLE public.building_caretakers ENABLE ROW LEVEL SECURITY;

-- ONBOARDING_PROGRESS
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    step TEXT NOT NULL DEFAULT 'organization',
    completed_steps TEXT[] NOT NULL DEFAULT '{}',
    skipped BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

-- PORTAL_CONNECTIONS (Verknüpfung zwischen Apps)
CREATE TABLE IF NOT EXISTS public.portal_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_app TEXT NOT NULL,
    target_app TEXT NOT NULL,
    source_entity_id UUID NOT NULL,
    target_entity_id UUID NOT NULL,
    connection_type TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.portal_connections ENABLE ROW LEVEL SECURITY;

-- HAUSMEISTER_SYNC_MAP
CREATE TABLE IF NOT EXISTS public.hausmeister_sync_map (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vermietify_building_id UUID REFERENCES public.buildings(id) ON DELETE CASCADE,
    hausmeister_building_id UUID,
    sync_enabled BOOLEAN NOT NULL DEFAULT true,
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hausmeister_sync_map ENABLE ROW LEVEL SECURITY;
