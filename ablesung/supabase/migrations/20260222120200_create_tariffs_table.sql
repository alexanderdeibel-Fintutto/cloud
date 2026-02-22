-- Create tariffs table (migrating from localStorage to Supabase)
-- Stores energy tariff information for cost comparison

CREATE TABLE public.tariffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  meter_type meter_type NOT NULL,
  price_per_unit DECIMAL(10,4) NOT NULL DEFAULT 0,
  base_price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_ht_nt BOOLEAN DEFAULT false,
  ht_price DECIMAL(10,4),
  nt_price DECIMAL(10,4),
  valid_from DATE NOT NULL,
  valid_to DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tariffs_org ON public.tariffs(organization_id);
CREATE INDEX idx_tariffs_meter_type ON public.tariffs(meter_type);
CREATE INDEX idx_tariffs_active ON public.tariffs(is_active) WHERE is_active;

-- Trigger
CREATE TRIGGER update_tariffs_updated_at
  BEFORE UPDATE ON public.tariffs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.tariffs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tariffs in own org" ON public.tariffs
  FOR SELECT USING (organization_id = public.get_user_org_id(auth.uid()));

CREATE POLICY "Vermieter/Admin can manage tariffs" ON public.tariffs
  FOR ALL USING (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vermieter'))
  );
