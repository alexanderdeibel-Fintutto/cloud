-- 022_biz.sql
-- Fintutto Biz: Freelancer & Kleinunternehmer Finance OS
-- Rechnungen, Ausgaben, Steuer-Reports, Cashflow-Forecasts

CREATE TABLE IF NOT EXISTS public.biz_businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  business_type TEXT DEFAULT 'freelancer', -- freelancer, einzelunternehmen, gbr, ug, gmbh
  tax_id TEXT,
  vat_id TEXT,
  address JSONB DEFAULT '{}',
  logo_url TEXT,
  default_payment_terms INT DEFAULT 14, -- Tage
  default_tax_rate NUMERIC DEFAULT 19.0,
  invoice_prefix TEXT DEFAULT 'INV',
  next_invoice_number INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_biz_owner ON public.biz_businesses(owner_id);
ALTER TABLE public.biz_businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_business" ON public.biz_businesses FOR ALL USING (owner_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.biz_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.biz_businesses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  tax_id TEXT,
  address JSONB DEFAULT '{}',
  notes TEXT,
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
  items JSONB DEFAULT '[]',
  notes TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_biz_invoices_business ON public.biz_invoices(business_id, status);
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
  vat_rate NUMERIC DEFAULT 19.0,
  vat_amount NUMERIC DEFAULT 0,
  occurred_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_biz_expenses_business ON public.biz_expenses(business_id, occurred_at);
ALTER TABLE public.biz_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_expenses" ON public.biz_expenses
  FOR ALL USING (
    business_id IN (SELECT id FROM public.biz_businesses WHERE owner_id = auth.uid())
  );

CREATE TABLE IF NOT EXISTS public.biz_tax_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.biz_businesses(id) ON DELETE CASCADE NOT NULL,
  report_type TEXT NOT NULL, -- monthly_vat, quarterly_vat, annual_income, eur (Einnahmen-Ueberschuss-Rechnung)
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
  forecast JSONB NOT NULL,
  horizon_days INT DEFAULT 90,
  confidence NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.biz_cashflow_forecasts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_forecasts" ON public.biz_cashflow_forecasts
  FOR ALL USING (
    business_id IN (SELECT id FROM public.biz_businesses WHERE owner_id = auth.uid())
  );
