-- ============================================================
-- Migration: Mandantenfähigkeit — organization_id in 004-006 Tabellen
-- Datum: 2026-04-19
-- Problem: Tabellen aus 004-006 sind an user_id gebunden.
--          Hausverwaltungen mit mehreren Mitarbeitern können nicht
--          gemeinsam auf denselben Datenbestand zugreifen.
-- Lösung:  organization_id Spalte hinzufügen. Nutzer, die zur selben
--          Organisation gehören, können gemeinsam auf Daten zugreifen.
--          Die neueren Vermietify-Fusion-Tabellen nutzen dieses Modell
--          bereits (20260419100001_vermietify_fusion_part2_core_tables.sql).
-- ============================================================

-- ============ HILFSFUNKTION: Organisations-Mitgliedschaft prüfen ============
-- Prüft ob der aktuelle Nutzer Mitglied einer Organisation ist
CREATE OR REPLACE FUNCTION public.is_org_member(p_organization_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND organization_id = p_organization_id
  );
$$;

-- ============ SCHEMA: organization_id Spalten hinzufügen ============

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS organization_id UUID;

ALTER TABLE public.units
  ADD COLUMN IF NOT EXISTS organization_id UUID;

ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS organization_id UUID;

ALTER TABLE public.rental_contracts
  ADD COLUMN IF NOT EXISTS organization_id UUID;

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS organization_id UUID;

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS organization_id UUID;

ALTER TABLE public.meters
  ADD COLUMN IF NOT EXISTS organization_id UUID;

ALTER TABLE public.meter_readings
  ADD COLUMN IF NOT EXISTS organization_id UUID;

ALTER TABLE public.maintenance_requests
  ADD COLUMN IF NOT EXISTS organization_id UUID;

ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS organization_id UUID;

ALTER TABLE public.tax_notices
  ADD COLUMN IF NOT EXISTS organization_id UUID;

-- ============ BACKFILL: organization_id aus profiles ableiten ============
-- Nutzer, die bereits einer Organisation angehören, bekommen ihre
-- organization_id in alle ihre Datensätze eingetragen.

UPDATE public.properties prop
SET organization_id = pr.organization_id
FROM public.profiles pr
WHERE pr.id = prop.user_id
  AND pr.organization_id IS NOT NULL
  AND prop.organization_id IS NULL;

UPDATE public.units u
SET organization_id = prop.organization_id
FROM public.properties prop
WHERE prop.id = u.property_id
  AND prop.organization_id IS NOT NULL
  AND u.organization_id IS NULL;

UPDATE public.tenants t
SET organization_id = prop.organization_id
FROM public.properties prop
WHERE prop.id = (
  SELECT property_id FROM public.units WHERE id = t.unit_id LIMIT 1
)
  AND prop.organization_id IS NOT NULL
  AND t.organization_id IS NULL;

UPDATE public.rental_contracts rc
SET organization_id = u.organization_id
FROM public.units u
WHERE u.id = rc.unit_id
  AND u.organization_id IS NOT NULL
  AND rc.organization_id IS NULL;

UPDATE public.payments pay
SET organization_id = rc.organization_id
FROM public.rental_contracts rc
WHERE rc.id = pay.contract_id
  AND rc.organization_id IS NOT NULL
  AND pay.organization_id IS NULL;

UPDATE public.documents d
SET organization_id = prop.organization_id
FROM public.properties prop
WHERE prop.id = d.property_id
  AND prop.organization_id IS NOT NULL
  AND d.organization_id IS NULL;

UPDATE public.meters m
SET organization_id = u.organization_id
FROM public.units u
WHERE u.id = m.unit_id
  AND u.organization_id IS NOT NULL
  AND m.organization_id IS NULL;

UPDATE public.meter_readings mr
SET organization_id = m.organization_id
FROM public.meters m
WHERE m.id = mr.meter_id
  AND m.organization_id IS NOT NULL
  AND mr.organization_id IS NULL;

UPDATE public.maintenance_requests maint
SET organization_id = prop.organization_id
FROM public.properties prop
WHERE prop.id = maint.property_id
  AND prop.organization_id IS NOT NULL
  AND maint.organization_id IS NULL;

UPDATE public.tasks t
SET organization_id = prop.organization_id
FROM public.properties prop
WHERE prop.id = t.property_id
  AND prop.organization_id IS NOT NULL
  AND t.organization_id IS NULL;

UPDATE public.tax_notices tn
SET organization_id = pr.organization_id
FROM public.profiles pr
WHERE pr.id = tn.user_id
  AND pr.organization_id IS NOT NULL
  AND tn.organization_id IS NULL;

-- ============ INDIZES für organization_id ============

CREATE INDEX IF NOT EXISTS idx_properties_org ON public.properties(organization_id);
CREATE INDEX IF NOT EXISTS idx_units_org ON public.units(organization_id);
CREATE INDEX IF NOT EXISTS idx_tenants_org ON public.tenants(organization_id);
CREATE INDEX IF NOT EXISTS idx_contracts_org ON public.rental_contracts(organization_id);
CREATE INDEX IF NOT EXISTS idx_payments_org ON public.payments(organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_org ON public.documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_meters_org ON public.meters(organization_id);
CREATE INDEX IF NOT EXISTS idx_meter_readings_org ON public.meter_readings(organization_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_org ON public.maintenance_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_org ON public.tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_tax_notices_org ON public.tax_notices(organization_id);

-- ============ TRIGGER: organization_id automatisch setzen ============

-- Funktion: organization_id beim INSERT aus properties ableiten
CREATE OR REPLACE FUNCTION public.set_property_org_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- organization_id aus dem Profil des Eigentümers ableiten
  SELECT organization_id INTO NEW.organization_id
  FROM public.profiles
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_properties_set_org ON public.properties;
CREATE TRIGGER trg_properties_set_org
  BEFORE INSERT ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.set_property_org_id();

-- ============ RLS POLICIES: Organisations-Zugriff ============
-- Ergänzend zu den bestehenden owner_id-Policies:
-- Mitglieder derselben Organisation können ebenfalls zugreifen.

-- PROPERTIES: Organisations-Mitglieder können lesen
DROP POLICY IF EXISTS "properties_org_member_select" ON public.properties;
CREATE POLICY "properties_org_member_select"
  ON public.properties FOR SELECT TO authenticated
  USING (
    organization_id IS NOT NULL
    AND public.is_org_member(organization_id)
  );

-- UNITS: Organisations-Mitglieder können lesen und schreiben
DROP POLICY IF EXISTS "units_org_member_all" ON public.units;
CREATE POLICY "units_org_member_all"
  ON public.units FOR ALL TO authenticated
  USING (
    organization_id IS NOT NULL
    AND public.is_org_member(organization_id)
  );

-- TENANTS: Organisations-Mitglieder können lesen und schreiben
DROP POLICY IF EXISTS "tenants_org_member_all" ON public.tenants;
CREATE POLICY "tenants_org_member_all"
  ON public.tenants FOR ALL TO authenticated
  USING (
    organization_id IS NOT NULL
    AND public.is_org_member(organization_id)
  );

-- RENTAL CONTRACTS: Organisations-Mitglieder können lesen und schreiben
DROP POLICY IF EXISTS "contracts_org_member_all" ON public.rental_contracts;
CREATE POLICY "contracts_org_member_all"
  ON public.rental_contracts FOR ALL TO authenticated
  USING (
    organization_id IS NOT NULL
    AND public.is_org_member(organization_id)
  );

-- PAYMENTS: Organisations-Mitglieder können lesen und schreiben
DROP POLICY IF EXISTS "payments_org_member_all" ON public.payments;
CREATE POLICY "payments_org_member_all"
  ON public.payments FOR ALL TO authenticated
  USING (
    organization_id IS NOT NULL
    AND public.is_org_member(organization_id)
  );

-- DOCUMENTS: Organisations-Mitglieder können lesen
DROP POLICY IF EXISTS "documents_org_member_select" ON public.documents;
CREATE POLICY "documents_org_member_select"
  ON public.documents FOR SELECT TO authenticated
  USING (
    organization_id IS NOT NULL
    AND public.is_org_member(organization_id)
  );

-- METERS: Organisations-Mitglieder können lesen und schreiben
DROP POLICY IF EXISTS "meters_org_member_all" ON public.meters;
CREATE POLICY "meters_org_member_all"
  ON public.meters FOR ALL TO authenticated
  USING (
    organization_id IS NOT NULL
    AND public.is_org_member(organization_id)
  );

-- METER READINGS: Organisations-Mitglieder können lesen und schreiben
DROP POLICY IF EXISTS "readings_org_member_all" ON public.meter_readings;
CREATE POLICY "readings_org_member_all"
  ON public.meter_readings FOR ALL TO authenticated
  USING (
    organization_id IS NOT NULL
    AND public.is_org_member(organization_id)
  );

-- MAINTENANCE REQUESTS: Organisations-Mitglieder können lesen und schreiben
DROP POLICY IF EXISTS "maintenance_org_member_all" ON public.maintenance_requests;
CREATE POLICY "maintenance_org_member_all"
  ON public.maintenance_requests FOR ALL TO authenticated
  USING (
    organization_id IS NOT NULL
    AND public.is_org_member(organization_id)
  );

-- TASKS: Organisations-Mitglieder können lesen und schreiben
DROP POLICY IF EXISTS "tasks_org_member_all" ON public.tasks;
CREATE POLICY "tasks_org_member_all"
  ON public.tasks FOR ALL TO authenticated
  USING (
    organization_id IS NOT NULL
    AND public.is_org_member(organization_id)
  );

-- TAX NOTICES: Organisations-Mitglieder können lesen
DROP POLICY IF EXISTS "tax_notices_org_member_select" ON public.tax_notices;
CREATE POLICY "tax_notices_org_member_select"
  ON public.tax_notices FOR SELECT TO authenticated
  USING (
    organization_id IS NOT NULL
    AND public.is_org_member(organization_id)
  );
