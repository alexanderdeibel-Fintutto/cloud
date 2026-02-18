-- Migration 006: BescheidBoxer Tables
-- Steuerbescheid-Prüfung und -Verwaltung
-- Verknüpft mit properties (z.B. Grundsteuerbescheid für ein Gebäude)

-- Steuerbescheide
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
    deadline_date DATE,
    amount_assessed BIGINT,
    amount_expected BIGINT,
    deviation_amount BIGINT,
    status TEXT DEFAULT 'received'
        CHECK (status IN ('received', 'checking', 'accepted', 'objection_filed', 'resolved')),
    objection_deadline DATE,
    ai_analysis JSONB,
    document_ids UUID[],
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bescheid-Prüfungsergebnisse
CREATE TABLE IF NOT EXISTS public.tax_notice_checks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tax_notice_id UUID NOT NULL REFERENCES public.tax_notices(id) ON DELETE CASCADE,
    check_type TEXT NOT NULL,
    input_data JSONB NOT NULL,
    result_data JSONB NOT NULL,
    recommendation TEXT,
    has_issues BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indizes
CREATE INDEX IF NOT EXISTS idx_tax_notices_user ON public.tax_notices(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_notices_property ON public.tax_notices(property_id);
CREATE INDEX IF NOT EXISTS idx_tax_notices_type ON public.tax_notices(notice_type);
CREATE INDEX IF NOT EXISTS idx_tax_notices_status ON public.tax_notices(status);
CREATE INDEX IF NOT EXISTS idx_tax_notices_year ON public.tax_notices(tax_year);
CREATE INDEX IF NOT EXISTS idx_tax_notice_checks_notice ON public.tax_notice_checks(tax_notice_id);

-- Trigger
CREATE TRIGGER update_tax_notices_updated_at
    BEFORE UPDATE ON public.tax_notices
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
