-- Create energy_contracts table (migrating from localStorage to Supabase)
-- Stores energy provider contracts with cancellation tracking

CREATE TYPE public.contract_status AS ENUM ('active', 'cancelled', 'expired', 'pending');
CREATE TYPE public.provider_type AS ENUM ('electricity', 'gas', 'water', 'heating', 'district_heating', 'oil');

CREATE TABLE public.energy_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  building_id UUID REFERENCES public.buildings(id) ON DELETE SET NULL,
  provider_name TEXT NOT NULL,
  provider_type provider_type NOT NULL,
  contract_number TEXT,
  tariff_name TEXT,
  price_per_unit DECIMAL(10,4),
  base_fee_monthly DECIMAL(10,2),
  contract_start DATE NOT NULL,
  contract_end DATE,
  cancellation_period_days INTEGER DEFAULT 30,
  cancellation_deadline DATE,
  auto_renewal_months INTEGER DEFAULT 12,
  notes TEXT,
  status contract_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.contract_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES public.energy_contracts(id) ON DELETE CASCADE NOT NULL,
  reminder_date DATE NOT NULL,
  reminder_type TEXT NOT NULL DEFAULT 'cancellation_deadline',
  is_dismissed BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT reminder_type_check CHECK (reminder_type IN ('cancellation_deadline', 'contract_end', 'price_check', 'meter_reading'))
);

-- Indexes
CREATE INDEX idx_energy_contracts_org ON public.energy_contracts(organization_id);
CREATE INDEX idx_energy_contracts_building ON public.energy_contracts(building_id);
CREATE INDEX idx_energy_contracts_status ON public.energy_contracts(status);
CREATE INDEX idx_contract_reminders_contract ON public.contract_reminders(contract_id);
CREATE INDEX idx_contract_reminders_date ON public.contract_reminders(reminder_date) WHERE NOT is_dismissed;

-- Triggers
CREATE TRIGGER update_energy_contracts_updated_at
  BEFORE UPDATE ON public.energy_contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.energy_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_reminders ENABLE ROW LEVEL SECURITY;

-- Contracts: org members can view, vermieter/admin can manage
CREATE POLICY "Users can view contracts in own org" ON public.energy_contracts
  FOR SELECT USING (organization_id = public.get_user_org_id(auth.uid()));

CREATE POLICY "Vermieter/Admin can manage contracts" ON public.energy_contracts
  FOR ALL USING (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vermieter'))
  );

-- Reminders: accessible via contract
CREATE POLICY "Users can view contract reminders" ON public.contract_reminders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.energy_contracts ec
      WHERE ec.id = contract_id AND ec.organization_id = public.get_user_org_id(auth.uid())
    )
  );

CREATE POLICY "Vermieter/Admin can manage reminders" ON public.contract_reminders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.energy_contracts ec
      WHERE ec.id = contract_id
      AND ec.organization_id = public.get_user_org_id(auth.uid())
      AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vermieter'))
    )
  );
