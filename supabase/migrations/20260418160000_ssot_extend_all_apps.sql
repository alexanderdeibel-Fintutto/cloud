-- ============================================================
-- SSOT Phase 4: core_contact_id in alle weiteren App-Tabellen
-- Timestamp: 20260418160000
-- Idempotent: alle Statements mit IF NOT EXISTS / DO $$ guards
-- Korrigiert: tatsächliche Tabellennamen in der Live-DB
-- ============================================================

-- 1. gt_leads (GuideTranslator / AMS) → core_contact_id
-- Hinweis: Im Portal-Repo heißt die Leads-Tabelle gt_leads
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'gt_leads') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'gt_leads' AND column_name = 'core_contact_id'
    ) THEN
      ALTER TABLE public.gt_leads ADD COLUMN core_contact_id uuid REFERENCES public.core_contacts(id) ON DELETE SET NULL;
      CREATE INDEX IF NOT EXISTS idx_gt_leads_core_contact_id ON public.gt_leads(core_contact_id);
      COMMENT ON COLUMN public.gt_leads.core_contact_id IS 'SSOT: Verknüpfung zum zentralen Kontakt in core_contacts';
    END IF;
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

-- 3. biz_businesses → core_address_id (Unternehmensadresse zentral)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'biz_businesses' AND column_name = 'core_address_id'
  ) THEN
    ALTER TABLE public.biz_businesses ADD COLUMN core_address_id uuid REFERENCES public.core_addresses(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_biz_businesses_core_address_id ON public.biz_businesses(core_address_id);
    COMMENT ON COLUMN public.biz_businesses.core_address_id IS 'SSOT: Verknüpfung zur zentralen Adresse in core_addresses';
  END IF;
END $$;

-- 4. View: v_gt_leads_with_contact (AMS Dashboard)
-- Nur erstellen wenn gt_leads existiert
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'gt_leads') THEN
    EXECUTE $view$
      CREATE OR REPLACE VIEW public.v_gt_leads_with_contact AS
      SELECT
        l.*,
        cc.contact_type,
        cc.company_name AS cc_company_name,
        cc.first_name   AS cc_first_name,
        cc.last_name    AS cc_last_name,
        (
          SELECT ca.street || ', ' || ca.postal_code || ' ' || ca.city
          FROM public.core_contact_addresses cca
          JOIN public.core_addresses ca ON ca.id = cca.address_id
          WHERE cca.contact_id = cc.id AND cca.is_primary = true
          LIMIT 1
        ) AS primary_address
      FROM public.gt_leads l
      LEFT JOIN public.core_contacts cc ON cc.id = l.core_contact_id
    $view$;
    COMMENT ON VIEW public.v_gt_leads_with_contact IS 'SSOT: Leads mit zentralen Kontaktdaten aus core_contacts';
  END IF;
END $$;

-- 5. View: v_organizations_with_address (Organisations-Übersicht)
-- Hinweis: organizations hat bereits street, city, postal_code - wir prefixen core_address-Spalten
CREATE OR REPLACE VIEW public.v_organizations_with_address AS
SELECT
  o.id,
  o.name,
  o.address,
  o.city,
  o.postal_code,
  o.phone,
  o.email,
  o.logo_url,
  o.tax_number,
  o.vat_number,
  o.core_address_id,
  o.created_at,
  o.updated_at,
  -- Core-Address-Daten (bevorzugt wenn vorhanden)
  COALESCE(ca.street, o.address)      AS ca_street,
  COALESCE(ca.postal_code, o.postal_code) AS ca_postal_code,
  COALESCE(ca.city, o.city)           AS ca_city,
  ca.country                          AS ca_country,
  ca.formatted                        AS formatted_address,
  ca.latitude,
  ca.longitude
FROM public.organizations o
LEFT JOIN public.core_addresses ca ON ca.id = o.core_address_id;

COMMENT ON VIEW public.v_organizations_with_address IS 'SSOT: Organisationen mit zentralen Adressdaten aus core_addresses';

-- 6. Funktion: sync_gt_lead_to_core_contact
-- Wird aufgerufen wenn ein Lead in einen Nutzer konvertiert wird
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'gt_leads') THEN
    EXECUTE $func$
      CREATE OR REPLACE FUNCTION public.sync_gt_lead_to_core_contact(p_lead_id uuid)
      RETURNS uuid
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $inner$
      DECLARE
        v_lead record;
        v_contact_id uuid;
      BEGIN
        SELECT * INTO v_lead FROM public.gt_leads WHERE id = p_lead_id;
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
            owner_id
          ) VALUES (
            CASE WHEN v_lead.company IS NOT NULL THEN 'company' ELSE 'person' END,
            split_part(v_lead.name, ' ', 1),
            CASE WHEN position(' ' IN v_lead.name) > 0
              THEN substring(v_lead.name FROM position(' ' IN v_lead.name) + 1)
              ELSE NULL END,
            v_lead.email,
            v_lead.phone,
            v_lead.company,
            COALESCE(v_lead.created_by, auth.uid())
          )
          RETURNING id INTO v_contact_id;
        END IF;

        -- Lead mit core_contact verknüpfen
        UPDATE public.gt_leads SET core_contact_id = v_contact_id WHERE id = p_lead_id;

        RETURN v_contact_id;
      END;
      $inner$
    $func$;
    COMMENT ON FUNCTION public.sync_gt_lead_to_core_contact IS 'Synchronisiert einen GT-Lead in die core_contacts Tabelle';
  END IF;
END $$;

-- 7. SecondBrain entity_type: 'lead' und 'organization' erlauben
-- (Idempotent: Constraint wird neu gesetzt)
ALTER TABLE public.sb_document_entity_links
  DROP CONSTRAINT IF EXISTS sb_document_entity_links_entity_type_check;

ALTER TABLE public.sb_document_entity_links
  ADD CONSTRAINT sb_document_entity_links_entity_type_check
  CHECK (entity_type IN (
    'building', 'unit', 'tenant', 'meter', 'lease',
    'expense', 'invoice', 'client', 'business',
    'core_contact', 'core_address',
    'lead', 'organization', 'bescheid'
  ));

COMMENT ON CONSTRAINT sb_document_entity_links_entity_type_check
  ON public.sb_document_entity_links IS 'SSOT: Erlaubte Entity-Typen für Dokumentverknüpfungen';
