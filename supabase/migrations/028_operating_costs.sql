-- Migration: Betriebskosten-Tabellen für Vermietify
-- Ersetzt die Mock-Daten in der Betriebskosten-Detailseite

-- Tabelle: utility_costs (Kostenarten pro Gebäude und Jahr)
CREATE TABLE IF NOT EXISTS public.utility_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  building_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  billing_year INTEGER NOT NULL,
  cost_type TEXT NOT NULL,
  amount BIGINT NOT NULL DEFAULT 0, -- in Cent
  distribution_key TEXT NOT NULL DEFAULT 'area' CHECK (distribution_key IN ('area', 'persons', 'units', 'consumption')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabelle: operating_cost_billings (Abrechnungen pro Gebäude und Jahr)
CREATE TABLE IF NOT EXISTS public.operating_cost_billings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  building_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  billing_year INTEGER NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_costs BIGINT NOT NULL DEFAULT 0, -- in Cent
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'calculated', 'sent', 'completed')),
  unit_count INTEGER NOT NULL DEFAULT 0,
  total_payments_due BIGINT NOT NULL DEFAULT 0,
  total_credits BIGINT NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(building_id, billing_year)
);

-- Tabelle: tenant_billing_results (Einzelabrechnungen pro Mieter)
CREATE TABLE IF NOT EXISTS public.tenant_billing_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  billing_id UUID NOT NULL REFERENCES public.operating_cost_billings(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  tenant_name TEXT NOT NULL,
  unit_name TEXT NOT NULL,
  area_sqm NUMERIC(8,2) NOT NULL DEFAULT 0,
  persons_count INTEGER NOT NULL DEFAULT 1,
  prepaid_amount BIGINT NOT NULL DEFAULT 0, -- in Cent
  calculated_costs BIGINT NOT NULL DEFAULT 0, -- in Cent
  result_amount BIGINT NOT NULL DEFAULT 0, -- positiv = Guthaben, negativ = Nachzahlung
  is_sent BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS aktivieren
ALTER TABLE public.utility_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operating_cost_billings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_billing_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users see own utility_costs"
  ON public.utility_costs FOR ALL
  USING (
    building_id IN (
      SELECT id FROM public.properties
      WHERE landlord_id = auth.uid()
    )
  );

CREATE POLICY "Users see own operating_cost_billings"
  ON public.operating_cost_billings FOR ALL
  USING (
    building_id IN (
      SELECT id FROM public.properties
      WHERE landlord_id = auth.uid()
    )
  );

CREATE POLICY "Users see own tenant_billing_results"
  ON public.tenant_billing_results FOR ALL
  USING (
    billing_id IN (
      SELECT ocb.id FROM public.operating_cost_billings ocb
      JOIN public.properties p ON p.id = ocb.building_id
      WHERE p.landlord_id = auth.uid()
    )
  );

-- Indizes
CREATE INDEX IF NOT EXISTS idx_utility_costs_building ON public.utility_costs(building_id, billing_year);
CREATE INDEX IF NOT EXISTS idx_operating_cost_billings_building ON public.operating_cost_billings(building_id);
CREATE INDEX IF NOT EXISTS idx_tenant_billing_results_billing ON public.tenant_billing_results(billing_id);

-- Trigger: updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_utility_costs_updated_at
  BEFORE UPDATE ON public.utility_costs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_operating_cost_billings_updated_at
  BEFORE UPDATE ON public.operating_cost_billings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
