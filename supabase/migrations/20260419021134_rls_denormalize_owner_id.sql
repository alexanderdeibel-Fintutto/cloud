-- ============================================================
-- Migration: Denormalisierung — owner_id in Kind-Tabellen
-- Datum: 2026-04-19
-- Problem: RLS-Policies für units, meters, rental_contracts und
--          payments erfordern tiefe Joins (units -> properties ->
--          user_id), was bei großen Datenmengen zu Table Scans führt.
-- Lösung:  Spalte owner_id (= properties.user_id) direkt in die
--          Kind-Tabellen eintragen. Trigger hält owner_id aktuell.
--          RLS-Policies werden auf einfache owner_id = auth.uid()
--          Checks vereinfacht.
-- ============================================================

-- ============ SCHEMA: owner_id Spalten hinzufügen ============

ALTER TABLE public.units
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.meters
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.rental_contracts
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.maintenance_requests
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============ BACKFILL: Bestehende Daten befüllen ============

-- units: owner_id aus properties ableiten
UPDATE public.units u
SET owner_id = p.user_id
FROM public.properties p
WHERE p.id = u.property_id
  AND u.owner_id IS NULL;

-- meters: owner_id über units -> properties ableiten
UPDATE public.meters m
SET owner_id = p.user_id
FROM public.units u
JOIN public.properties p ON p.id = u.property_id
WHERE u.id = m.unit_id
  AND m.owner_id IS NULL;

-- rental_contracts: owner_id über units -> properties ableiten
UPDATE public.rental_contracts rc
SET owner_id = p.user_id
FROM public.units u
JOIN public.properties p ON p.id = u.property_id
WHERE u.id = rc.unit_id
  AND rc.owner_id IS NULL;

-- payments: owner_id über rental_contracts -> units -> properties ableiten
UPDATE public.payments pay
SET owner_id = p.user_id
FROM public.rental_contracts rc
JOIN public.units u ON u.id = rc.unit_id
JOIN public.properties p ON p.id = u.property_id
WHERE rc.id = pay.contract_id
  AND pay.owner_id IS NULL;

-- documents: owner_id = user_id (bereits direkt vorhanden)
UPDATE public.documents
SET owner_id = user_id
WHERE owner_id IS NULL;

-- maintenance_requests: owner_id über properties ableiten
UPDATE public.maintenance_requests mr
SET owner_id = p.user_id
FROM public.properties p
WHERE p.id = mr.property_id
  AND mr.owner_id IS NULL;

-- tasks: owner_id über properties ableiten
UPDATE public.tasks t
SET owner_id = p.user_id
FROM public.properties p
WHERE p.id = t.property_id
  AND t.owner_id IS NULL;

-- ============ INDIZES für owner_id ============

CREATE INDEX IF NOT EXISTS idx_units_owner ON public.units(owner_id);
CREATE INDEX IF NOT EXISTS idx_meters_owner ON public.meters(owner_id);
CREATE INDEX IF NOT EXISTS idx_contracts_owner ON public.rental_contracts(owner_id);
CREATE INDEX IF NOT EXISTS idx_payments_owner ON public.payments(owner_id);
CREATE INDEX IF NOT EXISTS idx_documents_owner ON public.documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_owner ON public.maintenance_requests(owner_id);
CREATE INDEX IF NOT EXISTS idx_tasks_owner ON public.tasks(owner_id);

-- ============ TRIGGER: owner_id automatisch setzen ============

-- Funktion: owner_id beim INSERT aus der übergeordneten Tabelle ableiten
CREATE OR REPLACE FUNCTION public.set_unit_owner_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  SELECT user_id INTO NEW.owner_id
  FROM public.properties
  WHERE id = NEW.property_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_meter_owner_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  SELECT p.user_id INTO NEW.owner_id
  FROM public.units u
  JOIN public.properties p ON p.id = u.property_id
  WHERE u.id = NEW.unit_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_contract_owner_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  SELECT p.user_id INTO NEW.owner_id
  FROM public.units u
  JOIN public.properties p ON p.id = u.property_id
  WHERE u.id = NEW.unit_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_payment_owner_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  SELECT p.user_id INTO NEW.owner_id
  FROM public.rental_contracts rc
  JOIN public.units u ON u.id = rc.unit_id
  JOIN public.properties p ON p.id = u.property_id
  WHERE rc.id = NEW.contract_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_maintenance_owner_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  SELECT user_id INTO NEW.owner_id
  FROM public.properties
  WHERE id = NEW.property_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_task_owner_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  SELECT user_id INTO NEW.owner_id
  FROM public.properties
  WHERE id = NEW.property_id;
  RETURN NEW;
END;
$$;

-- Trigger registrieren (DROP IF EXISTS für Idempotenz)
DROP TRIGGER IF EXISTS trg_units_set_owner ON public.units;
CREATE TRIGGER trg_units_set_owner
  BEFORE INSERT ON public.units
  FOR EACH ROW EXECUTE FUNCTION public.set_unit_owner_id();

DROP TRIGGER IF EXISTS trg_meters_set_owner ON public.meters;
CREATE TRIGGER trg_meters_set_owner
  BEFORE INSERT ON public.meters
  FOR EACH ROW EXECUTE FUNCTION public.set_meter_owner_id();

DROP TRIGGER IF EXISTS trg_contracts_set_owner ON public.rental_contracts;
CREATE TRIGGER trg_contracts_set_owner
  BEFORE INSERT ON public.rental_contracts
  FOR EACH ROW EXECUTE FUNCTION public.set_contract_owner_id();

DROP TRIGGER IF EXISTS trg_payments_set_owner ON public.payments;
CREATE TRIGGER trg_payments_set_owner
  BEFORE INSERT ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.set_payment_owner_id();

DROP TRIGGER IF EXISTS trg_maintenance_set_owner ON public.maintenance_requests;
CREATE TRIGGER trg_maintenance_set_owner
  BEFORE INSERT ON public.maintenance_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_maintenance_owner_id();

DROP TRIGGER IF EXISTS trg_tasks_set_owner ON public.tasks;
CREATE TRIGGER trg_tasks_set_owner
  BEFORE INSERT ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_task_owner_id();

-- ============ RLS POLICIES: Vereinfacht auf owner_id ============

-- UNITS
DROP POLICY IF EXISTS "units_owner_all" ON public.units;
CREATE POLICY "units_owner_all"
  ON public.units FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR public.is_superadmin());

-- METERS
DROP POLICY IF EXISTS "meters_owner_all" ON public.meters;
CREATE POLICY "meters_owner_all"
  ON public.meters FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR public.is_superadmin());

-- RENTAL CONTRACTS
DROP POLICY IF EXISTS "contracts_landlord_all" ON public.rental_contracts;
CREATE POLICY "contracts_landlord_all"
  ON public.rental_contracts FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR public.is_superadmin());

-- PAYMENTS
DROP POLICY IF EXISTS "payments_landlord_all" ON public.payments;
CREATE POLICY "payments_landlord_all"
  ON public.payments FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR public.is_superadmin());

-- DOCUMENTS
DROP POLICY IF EXISTS "documents_owner_all" ON public.documents;
CREATE POLICY "documents_owner_all"
  ON public.documents FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR public.is_superadmin());

-- MAINTENANCE REQUESTS
DROP POLICY IF EXISTS "maintenance_owner_all" ON public.maintenance_requests;
CREATE POLICY "maintenance_owner_all"
  ON public.maintenance_requests FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR public.is_superadmin());

-- TASKS
DROP POLICY IF EXISTS "tasks_owner_all" ON public.tasks;
CREATE POLICY "tasks_owner_all"
  ON public.tasks FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR public.is_superadmin());
