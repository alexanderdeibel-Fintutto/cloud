-- ============================================================
-- Vermietify Fusion: Finale Migration (bereits in Produktion ausgeführt)
-- Datum: 2026-04-19
-- Status: APPLIED
-- 
-- Diese Migration wurde direkt via Supabase Management API ausgeführt.
-- Sie erstellt 14 neue Tabellen aus vermietify_final:
--   letters, e_signatures, email_threads, financial_transactions,
--   handover_protocols, insurance_policies, maintenance_requests,
--   organization_members, property_listings, tax_declarations,
--   utility_bills, whatsapp_messages, workflows, workflow_steps
--
-- HINWEIS: Alle ENUM-Werte wurden an die echten Produktionswerte angepasst:
--   letter_status: pending (nicht draft)
--   signatur_level: EES (nicht simple)
--   handover_status: planned (nicht draft)
--   defect_severity: light (nicht minor)
--   app_role: vermieter (nicht member)
--   versandart: STANDARD (nicht post)
-- ============================================================

-- letters
CREATE TABLE IF NOT EXISTS letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  building_id UUID REFERENCES buildings(id) ON DELETE SET NULL,
  unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  body TEXT,
  letter_type TEXT DEFAULT 'general',
  status letter_status DEFAULT 'pending',
  versandart versandart DEFAULT 'STANDARD',
  sent_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE letters ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS org_access_letters ON letters
  USING (organization_id = get_user_organization_id(auth.uid()));
CREATE INDEX IF NOT EXISTS idx_letters_org ON letters(organization_id);

-- e_signatures
CREATE TABLE IF NOT EXISTS e_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  signer_id UUID REFERENCES auth.users(id),
  signer_type signer_type DEFAULT 'tenant',
  signer_name TEXT,
  signer_email TEXT,
  status esignature_status DEFAULT 'pending',
  signatur_level signatur_level DEFAULT 'EES',
  signed_at TIMESTAMPTZ,
  ip_address TEXT,
  signature_data TEXT,
  token TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE e_signatures ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS org_access_e_signatures ON e_signatures
  USING (organization_id = get_user_organization_id(auth.uid()));
CREATE INDEX IF NOT EXISTS idx_e_signatures_document ON e_signatures(document_id);

-- email_threads
CREATE TABLE IF NOT EXISTS email_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  participants JSONB DEFAULT '[]',
  building_id UUID REFERENCES buildings(id) ON DELETE SET NULL,
  unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,
  is_read BOOLEAN DEFAULT FALSE,
  labels TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE email_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS org_access_email_threads ON email_threads
  USING (organization_id = get_user_organization_id(auth.uid()));
CREATE INDEX IF NOT EXISTS idx_email_threads_org ON email_threads(organization_id);

-- financial_transactions
CREATE TABLE IF NOT EXISTS financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  building_id UUID REFERENCES buildings(id) ON DELETE SET NULL,
  unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  transaction_type transaction_type NOT NULL,
  description TEXT,
  reference_number TEXT,
  booking_date DATE,
  value_date DATE,
  counterparty_name TEXT,
  counterparty_iban TEXT,
  is_reconciled BOOLEAN DEFAULT FALSE,
  reconciled_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS org_access_financial_transactions ON financial_transactions
  USING (organization_id = get_user_organization_id(auth.uid()));
CREATE INDEX IF NOT EXISTS idx_financial_transactions_org ON financial_transactions(organization_id);

-- handover_protocols
CREATE TABLE IF NOT EXISTS handover_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
  handover_type handover_type NOT NULL,
  handover_date DATE NOT NULL,
  status handover_status DEFAULT 'planned',
  tenant_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  tenant_name TEXT,
  landlord_name TEXT,
  rooms JSONB DEFAULT '[]',
  meter_readings JSONB DEFAULT '[]',
  keys_handed_over JSONB DEFAULT '[]',
  defects JSONB DEFAULT '[]',
  notes TEXT,
  signed_by_tenant BOOLEAN DEFAULT FALSE,
  signed_by_landlord BOOLEAN DEFAULT FALSE,
  tenant_signature TEXT,
  landlord_signature TEXT,
  signed_at TIMESTAMPTZ,
  pdf_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE handover_protocols ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS org_access_handover_protocols ON handover_protocols
  USING (organization_id = get_user_organization_id(auth.uid()));
CREATE INDEX IF NOT EXISTS idx_handover_protocols_unit ON handover_protocols(unit_id);

-- insurance_policies
CREATE TABLE IF NOT EXISTS insurance_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  building_id UUID REFERENCES buildings(id) ON DELETE SET NULL,
  policy_number TEXT,
  insurer_name TEXT NOT NULL,
  insurance_type TEXT NOT NULL,
  coverage_amount NUMERIC(12,2),
  annual_premium NUMERIC(10,2),
  start_date DATE,
  end_date DATE,
  auto_renew BOOLEAN DEFAULT TRUE,
  renewal_notice_days INTEGER DEFAULT 30,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE insurance_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS org_access_insurance_policies ON insurance_policies
  USING (organization_id = get_user_organization_id(auth.uid()));
CREATE INDEX IF NOT EXISTS idx_insurance_policies_building ON insurance_policies(building_id);

-- maintenance_requests
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  building_id UUID REFERENCES buildings(id) ON DELETE SET NULL,
  unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  priority task_priority DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  severity defect_severity DEFAULT 'light',
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  scheduled_date DATE,
  completed_at TIMESTAMPTZ,
  assigned_to UUID REFERENCES auth.users(id),
  contractor_name TEXT,
  estimated_cost NUMERIC(10,2),
  actual_cost NUMERIC(10,2),
  photos TEXT[] DEFAULT '{}',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS org_access_maintenance_requests ON maintenance_requests
  USING (organization_id = get_user_organization_id(auth.uid()));
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_unit ON maintenance_requests(unit_id);

-- organization_members
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role DEFAULT 'vermieter',
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS org_access_organization_members ON organization_members
  USING (organization_id = get_user_organization_id(auth.uid()));
CREATE INDEX IF NOT EXISTS idx_organization_members_user ON organization_members(user_id);

-- property_listings
CREATE TABLE IF NOT EXISTS property_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
  building_id UUID REFERENCES buildings(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status listing_status DEFAULT 'draft',
  rent_amount NUMERIC(10,2),
  deposit_amount NUMERIC(10,2),
  available_from DATE,
  photos TEXT[] DEFAULT '{}',
  features JSONB DEFAULT '[]',
  published_at TIMESTAMPTZ,
  published_on TEXT[] DEFAULT '{}',
  external_ids JSONB DEFAULT '{}',
  views_count INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE property_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS org_access_property_listings ON property_listings
  USING (organization_id = get_user_organization_id(auth.uid()));
CREATE INDEX IF NOT EXISTS idx_property_listings_unit ON property_listings(unit_id);

-- tax_declarations
CREATE TABLE IF NOT EXISTS tax_declarations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  tax_year INTEGER NOT NULL,
  form_type elster_form_type DEFAULT 'anlage_v',
  status elster_status DEFAULT 'draft',
  building_ids UUID[] DEFAULT '{}',
  income_data JSONB DEFAULT '{}',
  expense_data JSONB DEFAULT '{}',
  depreciation_data JSONB DEFAULT '{}',
  total_income NUMERIC(12,2),
  total_expenses NUMERIC(12,2),
  taxable_income NUMERIC(12,2),
  submitted_at TIMESTAMPTZ,
  elster_reference TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE tax_declarations ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS org_access_tax_declarations ON tax_declarations
  USING (organization_id = get_user_organization_id(auth.uid()));
CREATE INDEX IF NOT EXISTS idx_tax_declarations_org ON tax_declarations(organization_id);

-- utility_bills
CREATE TABLE IF NOT EXISTS utility_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  status TEXT DEFAULT 'draft',
  total_costs NUMERIC(12,2),
  distribution_key TEXT DEFAULT 'living_space',
  unit_bills JSONB DEFAULT '[]',
  cost_breakdown JSONB DEFAULT '{}',
  finalized_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE utility_bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS org_access_utility_bills ON utility_bills
  USING (organization_id = get_user_organization_id(auth.uid()));
CREATE INDEX IF NOT EXISTS idx_utility_bills_building ON utility_bills(building_id);

-- whatsapp_messages
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  message_id TEXT UNIQUE,
  message_type TEXT DEFAULT 'text',
  content TEXT,
  media_url TEXT,
  status TEXT DEFAULT 'received',
  direction TEXT DEFAULT 'inbound',
  tenant_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  building_id UUID REFERENCES buildings(id) ON DELETE SET NULL,
  unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS org_access_whatsapp_messages ON whatsapp_messages
  USING (organization_id = get_user_organization_id(auth.uid()));
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_org ON whatsapp_messages(organization_id);

-- workflows
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type workflow_trigger_type NOT NULL,
  trigger_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  execution_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS org_access_workflows ON workflows
  USING (organization_id = get_user_organization_id(auth.uid()));
CREATE INDEX IF NOT EXISTS idx_workflows_org ON workflows(organization_id);

-- workflow_steps
CREATE TABLE IF NOT EXISTS workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  action_type workflow_action_type NOT NULL,
  action_config JSONB DEFAULT '{}',
  condition_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS org_access_workflow_steps ON workflow_steps
  USING (organization_id = get_user_organization_id(auth.uid()));
CREATE INDEX IF NOT EXISTS idx_workflow_steps_workflow ON workflow_steps(workflow_id);
