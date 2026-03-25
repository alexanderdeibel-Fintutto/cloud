-- 027_biz_multi_company.sql
-- Erweiterung fintutto-biz: Multi-Company Support + Zeiterfassung
-- Stand: 25.03.2026

-- ============================================================
-- 1. MULTI-COMPANY: biz_user_businesses
-- Erlaubt einem User, mehrere Businesses zu verwalten
-- (z.B. Freelance-EinzelU + GmbH 1 + GmbH 2)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.biz_user_businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES public.biz_businesses(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, business_id)
);

CREATE INDEX idx_biz_user_businesses_user ON public.biz_user_businesses(user_id);
CREATE INDEX idx_biz_user_businesses_business ON public.biz_user_businesses(business_id);
ALTER TABLE public.biz_user_businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_user_businesses" ON public.biz_user_businesses
  FOR ALL USING (user_id = auth.uid());

-- Bestehende Businesses migrieren: Owner-Eintrag in biz_user_businesses anlegen
INSERT INTO public.biz_user_businesses (user_id, business_id, role)
SELECT owner_id, id, 'owner'
FROM public.biz_businesses
ON CONFLICT (user_id, business_id) DO NOTHING;

-- ============================================================
-- 2. ZEITERFASSUNG: biz_time_entries
-- Für Freelancer: Stunden erfassen und direkt in Rechnung übernehmen
-- ============================================================
CREATE TABLE IF NOT EXISTS public.biz_time_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.biz_businesses(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.biz_clients(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  hours NUMERIC(10,2) NOT NULL CHECK (hours > 0),
  hourly_rate NUMERIC(10,2) NOT NULL CHECK (hourly_rate >= 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  billed BOOLEAN DEFAULT false,
  invoice_id UUID REFERENCES public.biz_invoices(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_biz_time_entries_business ON public.biz_time_entries(business_id, date);
CREATE INDEX idx_biz_time_entries_unbilled ON public.biz_time_entries(business_id, billed) WHERE billed = false;
ALTER TABLE public.biz_time_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_time_entries" ON public.biz_time_entries
  FOR ALL USING (
    business_id IN (
      SELECT ub.business_id FROM public.biz_user_businesses ub
      WHERE ub.user_id = auth.uid()
    )
  );

-- ============================================================
-- 3. WIEDERKEHRENDE RECHNUNGEN: Erweiterung biz_invoices
-- ============================================================
ALTER TABLE public.biz_invoices
  ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS recurring_interval TEXT CHECK (recurring_interval IN ('monthly', 'quarterly', 'yearly')),
  ADD COLUMN IF NOT EXISTS recurring_next_date DATE,
  ADD COLUMN IF NOT EXISTS recurring_parent_id UUID REFERENCES public.biz_invoices(id) ON DELETE SET NULL;

-- ============================================================
-- 4. RPC: Alle Businesses eines Users abrufen (inkl. Rolle)
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_businesses()
RETURNS TABLE (
  business_id UUID,
  business_name TEXT,
  business_type TEXT,
  role TEXT,
  is_active BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    b.id AS business_id,
    b.name AS business_name,
    b.business_type,
    ub.role,
    ub.is_active
  FROM public.biz_user_businesses ub
  JOIN public.biz_businesses b ON b.id = ub.business_id
  WHERE ub.user_id = auth.uid()
  ORDER BY b.created_at ASC;
$$;
