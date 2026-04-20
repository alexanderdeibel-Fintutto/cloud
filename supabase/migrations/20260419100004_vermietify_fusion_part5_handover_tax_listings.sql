-- ============================================================
-- VERMIETIFY FUSION: Part 5 – Übergabe, Steuer, Inserate, Workflows
-- Datum: 2026-04-19
-- ============================================================

-- HANDOVER_PROTOCOLS (Übergabeprotokolle)
CREATE TABLE IF NOT EXISTS public.handover_protocols (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    lease_id UUID REFERENCES public.leases(id) ON DELETE SET NULL,
    handover_type public.handover_type NOT NULL,
    handover_date DATE NOT NULL,
    status public.handover_status NOT NULL DEFAULT 'planned',
    notes TEXT,
    meter_readings_recorded BOOLEAN NOT NULL DEFAULT false,
    keys_handed_over BOOLEAN NOT NULL DEFAULT false,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.handover_protocols ENABLE ROW LEVEL SECURITY;

-- HANDOVER_ROOMS
CREATE TABLE IF NOT EXISTS public.handover_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protocol_id UUID NOT NULL REFERENCES public.handover_protocols(id) ON DELETE CASCADE,
    room_name TEXT NOT NULL,
    condition TEXT NOT NULL DEFAULT 'good' CHECK (condition IN ('good', 'acceptable', 'poor')),
    notes TEXT,
    photos TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.handover_rooms ENABLE ROW LEVEL SECURITY;

-- HANDOVER_DEFECTS
CREATE TABLE IF NOT EXISTS public.handover_defects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protocol_id UUID NOT NULL REFERENCES public.handover_protocols(id) ON DELETE CASCADE,
    room_id UUID REFERENCES public.handover_rooms(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    severity public.defect_severity NOT NULL DEFAULT 'light',
    photos TEXT[] NOT NULL DEFAULT '{}',
    estimated_cost_cents INTEGER,
    is_tenant_responsible BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.handover_defects ENABLE ROW LEVEL SECURITY;

-- HANDOVER_KEYS
CREATE TABLE IF NOT EXISTS public.handover_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protocol_id UUID NOT NULL REFERENCES public.handover_protocols(id) ON DELETE CASCADE,
    key_type public.key_type NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.handover_keys ENABLE ROW LEVEL SECURITY;

-- HANDOVER_SIGNATURES
CREATE TABLE IF NOT EXISTS public.handover_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protocol_id UUID NOT NULL REFERENCES public.handover_protocols(id) ON DELETE CASCADE,
    signer_type public.signer_type NOT NULL,
    signer_name TEXT NOT NULL,
    signature_data TEXT,
    signed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.handover_signatures ENABLE ROW LEVEL SECURITY;

-- ESIGNATURE_ORDERS (Digitale Unterschriften)
CREATE TABLE IF NOT EXISTS public.esignature_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    message TEXT,
    status public.esignature_status NOT NULL DEFAULT 'draft',
    provider TEXT NOT NULL DEFAULT 'docusign',
    provider_envelope_id TEXT,
    expires_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.esignature_orders ENABLE ROW LEVEL SECURITY;

-- ESIGNATURE_EVENTS
CREATE TABLE IF NOT EXISTS public.esignature_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.esignature_orders(id) ON DELETE CASCADE,
    signer_name TEXT NOT NULL,
    signer_email TEXT NOT NULL,
    signer_type public.signer_type NOT NULL,
    status public.esignature_status NOT NULL DEFAULT 'sent',
    signed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.esignature_orders ENABLE ROW LEVEL SECURITY;

-- ELSTER_SETTINGS
CREATE TABLE IF NOT EXISTS public.elster_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE,
    tax_number TEXT,
    tax_office TEXT,
    elster_certificate_path TEXT,
    elster_certificate_password_encrypted TEXT,
    is_configured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.elster_settings ENABLE ROW LEVEL SECURITY;

-- ELSTER_SUBMISSIONS
CREATE TABLE IF NOT EXISTS public.elster_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    form_type public.elster_form_type NOT NULL,
    tax_year INTEGER NOT NULL,
    status public.elster_status NOT NULL DEFAULT 'draft',
    form_data JSONB NOT NULL DEFAULT '{}',
    submitted_at TIMESTAMPTZ,
    acknowledgment_id TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.elster_submissions ENABLE ROW LEVEL SECURITY;

-- ELSTER_NOTICES (Steuerbescheide)
CREATE TABLE IF NOT EXISTS public.elster_notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES public.elster_submissions(id) ON DELETE SET NULL,
    tax_year INTEGER NOT NULL,
    notice_date DATE NOT NULL,
    assessment_amount_cents INTEGER,
    document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.elster_notices ENABLE ROW LEVEL SECURITY;

-- ELSTER_CERTIFICATES
CREATE TABLE IF NOT EXISTS public.elster_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    certificate_name TEXT NOT NULL,
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.elster_certificates ENABLE ROW LEVEL SECURITY;

-- LISTINGS (Inserate)
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    cold_rent_cents INTEGER NOT NULL,
    warm_rent_cents INTEGER,
    deposit_cents INTEGER,
    available_from DATE,
    status public.listing_status NOT NULL DEFAULT 'draft',
    photos TEXT[] NOT NULL DEFAULT '{}',
    virtual_tour_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- LISTING_PORTALS
CREATE TABLE IF NOT EXISTS public.listing_portals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    portal_type public.portal_type NOT NULL,
    portal_listing_id TEXT,
    status public.portal_status NOT NULL DEFAULT 'pending',
    published_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.listing_portals ENABLE ROW LEVEL SECURITY;

-- LISTING_SETTINGS
CREATE TABLE IF NOT EXISTS public.listing_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE,
    immoscout_api_key_encrypted TEXT,
    immowelt_api_key_encrypted TEXT,
    ebay_api_key_encrypted TEXT,
    auto_publish BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.listing_settings ENABLE ROW LEVEL SECURITY;

-- LISTING_INQUIRIES
CREATE TABLE IF NOT EXISTS public.listing_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    applicant_name TEXT NOT NULL,
    applicant_email TEXT NOT NULL,
    applicant_phone TEXT,
    message TEXT,
    status public.inquiry_status NOT NULL DEFAULT 'new',
    viewing_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.listing_inquiries ENABLE ROW LEVEL SECURITY;

-- RENTAL_OFFERS
CREATE TABLE IF NOT EXISTS public.rental_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_id UUID NOT NULL REFERENCES public.listing_inquiries(id) ON DELETE CASCADE,
    unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
    cold_rent_cents INTEGER NOT NULL,
    deposit_cents INTEGER NOT NULL,
    start_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.rental_offers ENABLE ROW LEVEL SECURITY;

-- WORKFLOWS
CREATE TABLE IF NOT EXISTS public.workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    trigger_type public.workflow_trigger_type NOT NULL,
    trigger_config JSONB NOT NULL DEFAULT '{}',
    actions JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

-- WORKFLOW_EXECUTIONS
CREATE TABLE IF NOT EXISTS public.workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
    trigger_entity_id UUID,
    status public.workflow_execution_status NOT NULL DEFAULT 'running',
    result JSONB DEFAULT '{}',
    error_message TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;

-- AUDIT_LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON public.audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);

-- GDPR_REQUESTS (DSGVO-Anfragen)
CREATE TABLE IF NOT EXISTS public.gdpr_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    requester_email TEXT NOT NULL,
    request_type TEXT NOT NULL CHECK (request_type IN ('access', 'deletion', 'correction', 'portability')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
    notes TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gdpr_requests ENABLE ROW LEVEL SECURITY;

-- CONSENT_RECORDS
CREATE TABLE IF NOT EXISTS public.consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    consent_type TEXT NOT NULL,
    is_granted BOOLEAN NOT NULL DEFAULT false,
    granted_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;

-- ENERGY_CERTIFICATES (Energieausweise)
CREATE TABLE IF NOT EXISTS public.energy_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
    certificate_type TEXT NOT NULL CHECK (certificate_type IN ('consumption', 'demand')),
    energy_class TEXT NOT NULL,
    valid_until DATE NOT NULL,
    primary_energy_demand DECIMAL(10,2),
    final_energy_demand DECIMAL(10,2),
    heating_type TEXT,
    document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.energy_certificates ENABLE ROW LEVEL SECURITY;

-- CO2_CALCULATIONS
CREATE TABLE IF NOT EXISTS public.co2_calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    co2_emissions_kg DECIMAL(12,2),
    heating_costs_cents INTEGER,
    co2_levy_cents INTEGER,
    landlord_share_percent DECIMAL(5,2),
    tenant_share_percent DECIMAL(5,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(building_id, year)
);
ALTER TABLE public.co2_calculations ENABLE ROW LEVEL SECURITY;

-- FAQ_ARTICLES
CREATE TABLE IF NOT EXISTS public.faq_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    is_public BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.faq_articles ENABLE ROW LEVEL SECURITY;

-- ECOSYSTEM_REFERRALS
CREATE TABLE IF NOT EXISTS public.ecosystem_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    referred_email TEXT NOT NULL,
    app_slug TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'registered', 'converted')),
    reward_granted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ecosystem_referrals ENABLE ROW LEVEL SECURITY;

-- KDU_RATES (Kosten der Unterkunft – Jobcenter-Tabellen)
CREATE TABLE IF NOT EXISTS public.kdu_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city TEXT NOT NULL,
    postal_code TEXT,
    household_size INTEGER NOT NULL,
    max_rent_cents INTEGER NOT NULL,
    max_warm_rent_cents INTEGER,
    valid_from DATE NOT NULL,
    valid_until DATE,
    source TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(city, household_size, valid_from)
);
ALTER TABLE public.kdu_rates ENABLE ROW LEVEL SECURITY;

-- TERMINATIONS (Kündigungen)
CREATE TABLE IF NOT EXISTS public.terminations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lease_id UUID NOT NULL REFERENCES public.leases(id) ON DELETE CASCADE,
    termination_type TEXT NOT NULL CHECK (termination_type IN ('tenant', 'landlord', 'mutual')),
    notice_date DATE NOT NULL,
    termination_date DATE NOT NULL,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'withdrawn', 'completed')),
    document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.terminations ENABLE ROW LEVEL SECURITY;
