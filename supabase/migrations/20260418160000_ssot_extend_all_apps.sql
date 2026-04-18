-- ============================================================
-- SSOT Phase 4: core_contact_id in alle weiteren App-Tabellen
-- Timestamp: 20260418160000
-- Idempotent: alle Statements mit IF NOT EXISTS / DO $$ guards
-- ============================================================

-- 1. leads (AMS) → core_contact_id
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'core_contact_id'
  ) THEN
    ALTER TABLE public.leads ADD COLUMN core_contact_id uuid REFERENCES public.core_contacts(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_leads_core_contact_id ON public.leads(core_contact_id);
    COMMENT ON COLUMN public.leads.core_contact_id IS 'SSOT: Verknüpfung zum zentralen Kontakt in core_contacts';
  END IF;
END $$;

-- 2. organizations → core_address_id (Firmenadresse zentral)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'organizations' AND column_name = 'core_address_id'
  ) THEN
    ALTER TABLE public.organizations ADD COLUMN core_address_id uuid REFERENCES public.core_addresses(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_organizations_core_address_id ON public.organizations(core_address_id);
    COMMENT ON COLUMN public.organizations.core_address_id IS 'SSOT: Verknüpfung zur zentralen Adresse in core_addresses';
  END IF;
END $$;

-- 3. pflanzen-manager: apartments → core_address_id (falls Tabelle existiert)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'apartments') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'apartments' AND column_name = 'core_address_id'
    ) THEN
      ALTER TABLE public.apartments ADD COLUMN core_address_id uuid REFERENCES public.core_addresses(id) ON DELETE SET NULL;
      COMMENT ON COLUMN public.apartments.core_address_id IS 'SSOT: Verknüpfung zur zentralen Adresse';
    END IF;
  END IF;
END $$;

-- 4. bescheidboxer / arbeitslos-portal: user_cases → core_contact_id (falls Tabelle existiert)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_cases') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'user_cases' AND column_name = 'core_contact_id'
    ) THEN
      ALTER TABLE public.user_cases ADD COLUMN core_contact_id uuid REFERENCES public.core_contacts(id) ON DELETE SET NULL;
      COMMENT ON COLUMN public.user_cases.core_contact_id IS 'SSOT: Mandant als zentraler Kontakt';
    END IF;
  END IF;
END $$;

-- 5. View: v_leads_with_contact (AMS Dashboard)
CREATE OR REPLACE VIEW public.v_leads_with_contact AS
SELECT
  l.*,
  cc.contact_type,
  cc.company_name,
  (
    SELECT ca.street || ', ' || ca.postal_code || ' ' || ca.city
    FROM public.core_contact_addresses cca
    JOIN public.core_addresses ca ON ca.id = cca.address_id
    WHERE cca.contact_id = cc.id AND cca.is_primary = true
    LIMIT 1
  ) AS primary_address
FROM public.leads l
LEFT JOIN public.core_contacts cc ON cc.id = l.core_contact_id;

-- 6. View: v_organizations_with_address (AMS Organisations-Übersicht)
CREATE OR REPLACE VIEW public.v_organizations_with_address AS
SELECT
  o.*,
  ca.street,
  ca.postal_code,
  ca.city,
  ca.country,
  ca.formatted AS formatted_address,
  ca.latitude,
  ca.longitude
FROM public.organizations o
LEFT JOIN public.core_addresses ca ON ca.id = o.core_address_id;

-- 7. Funktion: sync_lead_to_core_contact
-- Wird aufgerufen wenn ein Lead in einen Nutzer konvertiert wird
CREATE OR REPLACE FUNCTION public.sync_lead_to_core_contact(p_lead_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_lead public.leads%ROWTYPE;
  v_contact_id uuid;
BEGIN
  SELECT * INTO v_lead FROM public.leads WHERE id = p_lead_id;
  IF NOT FOUND THEN RETURN NULL; END IF;

  -- Prüfen ob bereits verknüpft
  IF v_lead.core_contact_id IS NOT NULL THEN
    RETURN v_lead.core_contact_id;
  END IF;

  -- Prüfen ob core_contact mit gleicher E-Mail existiert
  SELECT id INTO v_contact_id FROM public.core_contacts WHERE email = v_lead.email LIMIT 1;

  IF v_contact_id IS NULL THEN
    INSERT INTO public.core_contacts (
      contact_type, first_name, last_name, email, phone, company_name,
      source, tags
    ) VALUES (
      CASE WHEN v_lead.company IS NOT NULL THEN 'company' ELSE 'person' END,
      v_lead.first_name,
      v_lead.last_name,
      v_lead.email,
      v_lead.phone,
      v_lead.company,
      v_lead.source,
      v_lead.tags
    )
    RETURNING id INTO v_contact_id;
  END IF;

  -- Lead mit core_contact verknüpfen
  UPDATE public.leads SET core_contact_id = v_contact_id WHERE id = p_lead_id;

  RETURN v_contact_id;
END;
$$;

-- 8. RLS für neue Views
ALTER VIEW public.v_leads_with_contact OWNER TO postgres;
ALTER VIEW public.v_organizations_with_address OWNER TO postgres;

COMMENT ON VIEW public.v_leads_with_contact IS 'SSOT: Leads mit zentralen Kontaktdaten aus core_contacts';
COMMENT ON VIEW public.v_organizations_with_address IS 'SSOT: Organisationen mit zentralen Adressdaten aus core_addresses';
COMMENT ON FUNCTION public.sync_lead_to_core_contact IS 'Synchronisiert einen Lead in die core_contacts Tabelle und gibt die core_contact_id zurück';
