-- ============================================================
-- VERMIETIFY FUSION: Part 3 – Dokumente, Aufgaben, Finanzen
-- Datum: 2026-04-19
-- ============================================================

-- DOCUMENTS (Spalten erweitern, falls Tabelle schon existiert)
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS building_id UUID REFERENCES public.buildings(id) ON DELETE CASCADE;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS lease_id UUID REFERENCES public.leases(id) ON DELETE SET NULL;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS document_type public.document_type DEFAULT 'other';
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS file_size INTEGER;

-- DOCUMENT_OCR_RESULTS
CREATE TABLE IF NOT EXISTS public.document_ocr_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    extracted_text TEXT,
    confidence DECIMAL(5,4),
    metadata JSONB DEFAULT '{}',
    processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.document_ocr_results ENABLE ROW LEVEL SECURITY;

-- TASKS (Spalten erweitern)
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS building_id UUID REFERENCES public.buildings(id) ON DELETE CASCADE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS category public.task_category DEFAULT 'other';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS source public.task_source DEFAULT 'landlord';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS estimated_cost_cents INTEGER;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS actual_cost_cents INTEGER;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS contractor_name TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS contractor_phone TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- TASK_ACTIVITIES
CREATE TABLE IF NOT EXISTS public.task_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.task_activities ENABLE ROW LEVEL SECURITY;

-- TASK_COMMENTS
CREATE TABLE IF NOT EXISTS public.task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- TASK_ATTACHMENTS
CREATE TABLE IF NOT EXISTS public.task_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;

-- TRANSACTIONS (Finanztransaktionen)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    building_id UUID REFERENCES public.buildings(id) ON DELETE SET NULL,
    unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
    lease_id UUID REFERENCES public.leases(id) ON DELETE SET NULL,
    transaction_type public.transaction_type NOT NULL,
    amount_cents INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'EUR',
    transaction_date DATE NOT NULL,
    due_date DATE,
    description TEXT,
    reference TEXT,
    is_paid BOOLEAN NOT NULL DEFAULT false,
    paid_at TIMESTAMPTZ,
    bank_transaction_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_transactions_org ON public.transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_transactions_building ON public.transactions(building_id);

-- BANK_TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.bank_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    finapi_transaction_id TEXT,
    account_iban TEXT,
    amount_cents INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'EUR',
    booking_date DATE NOT NULL,
    value_date DATE,
    purpose TEXT,
    counterpart_name TEXT,
    counterpart_iban TEXT,
    counterpart_bic TEXT,
    category TEXT,
    is_matched BOOLEAN NOT NULL DEFAULT false,
    matched_transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_bank_transactions_org ON public.bank_transactions(organization_id);

-- TRANSACTION_RULES (Automatische Zuordnungsregeln)
CREATE TABLE IF NOT EXISTS public.transaction_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    match_field TEXT NOT NULL,
    match_value TEXT NOT NULL,
    transaction_type public.transaction_type,
    building_id UUID REFERENCES public.buildings(id) ON DELETE SET NULL,
    unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transaction_rules ENABLE ROW LEVEL SECURITY;

-- OPERATING_COST_ITEMS
CREATE TABLE IF NOT EXISTS public.operating_cost_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
    cost_type TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    period_year INTEGER NOT NULL,
    period_month INTEGER,
    description TEXT,
    receipt_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.operating_cost_items ENABLE ROW LEVEL SECURITY;

-- OPERATING_COST_STATEMENTS (Nebenkostenabrechnungen)
CREATE TABLE IF NOT EXISTS public.operating_cost_statements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
    period_year INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'finalized')),
    total_costs_cents INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.operating_cost_statements ENABLE ROW LEVEL SECURITY;

-- OPERATING_COST_TENANT_RESULTS
CREATE TABLE IF NOT EXISTS public.operating_cost_tenant_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    statement_id UUID NOT NULL REFERENCES public.operating_cost_statements(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
    total_share_cents INTEGER NOT NULL DEFAULT 0,
    prepayment_cents INTEGER NOT NULL DEFAULT 0,
    balance_cents INTEGER NOT NULL DEFAULT 0,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.operating_cost_tenant_results ENABLE ROW LEVEL SECURITY;

-- COST_TYPES
CREATE TABLE IF NOT EXISTS public.cost_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_apportionable BOOLEAN NOT NULL DEFAULT true,
    distribution_key TEXT NOT NULL DEFAULT 'area' CHECK (distribution_key IN ('area', 'persons', 'units', 'consumption', 'equal')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cost_types ENABLE ROW LEVEL SECURITY;

-- VPI_INDEX (Verbraucherpreisindex für Mietanpassungen)
CREATE TABLE IF NOT EXISTS public.vpi_index (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    index_value DECIMAL(10,4) NOT NULL,
    base_year INTEGER NOT NULL DEFAULT 2020,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(year, month, base_year)
);
ALTER TABLE public.vpi_index ENABLE ROW LEVEL SECURITY;
