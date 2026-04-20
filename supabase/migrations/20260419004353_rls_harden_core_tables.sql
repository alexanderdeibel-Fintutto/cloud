-- Migration: RLS-Härtung für Kern-Tabellen (004-006)
-- Macht alle Policies aus 007_rls_policies.sql idempotent (DROP IF EXISTS)
-- und ergänzt Anon-Deny-Policies für alle 13 sensitiven Tabellen.
-- Gemäß Supabase-Best-Practices: jede Policy mit DROP IF EXISTS absichern.

-- ============ PROFILES ============
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_superadmin());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "profiles_deny_anon" ON public.profiles;
CREATE POLICY "profiles_deny_anon"
  ON public.profiles FOR ALL TO anon
  USING (false);

-- ============ PROPERTIES ============
DROP POLICY IF EXISTS "properties_owner_all" ON public.properties;
CREATE POLICY "properties_owner_all"
  ON public.properties FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.is_superadmin());

DROP POLICY IF EXISTS "properties_tenant_select" ON public.properties;
CREATE POLICY "properties_tenant_select"
  ON public.properties FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT p.id FROM public.properties p
      JOIN public.units u ON u.property_id = p.id
      JOIN public.tenants t ON t.unit_id = u.id
      WHERE t.user_id = auth.uid() AND t.is_active = true
    )
  );

DROP POLICY IF EXISTS "properties_caretaker_select" ON public.properties;
CREATE POLICY "properties_caretaker_select"
  ON public.properties FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT property_id FROM public.maintenance_requests
      WHERE assigned_to = auth.uid()
    )
  );

DROP POLICY IF EXISTS "properties_deny_anon" ON public.properties;
CREATE POLICY "properties_deny_anon"
  ON public.properties FOR ALL TO anon
  USING (false);

-- ============ UNITS ============
DROP POLICY IF EXISTS "units_owner_all" ON public.units;
CREATE POLICY "units_owner_all"
  ON public.units FOR ALL TO authenticated
  USING (
    property_id IN (SELECT id FROM public.properties WHERE user_id = auth.uid())
    OR public.is_superadmin()
  );

DROP POLICY IF EXISTS "units_tenant_select" ON public.units;
CREATE POLICY "units_tenant_select"
  ON public.units FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT unit_id FROM public.tenants
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

DROP POLICY IF EXISTS "units_deny_anon" ON public.units;
CREATE POLICY "units_deny_anon"
  ON public.units FOR ALL TO anon
  USING (false);

-- ============ TENANTS ============
DROP POLICY IF EXISTS "tenants_landlord_all" ON public.tenants;
CREATE POLICY "tenants_landlord_all"
  ON public.tenants FOR ALL TO authenticated
  USING (
    unit_id IN (
      SELECT u.id FROM public.units u
      JOIN public.properties p ON p.id = u.property_id
      WHERE p.user_id = auth.uid()
    )
    OR public.is_superadmin()
  );

DROP POLICY IF EXISTS "tenants_self_select" ON public.tenants;
CREATE POLICY "tenants_self_select"
  ON public.tenants FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "tenants_deny_anon" ON public.tenants;
CREATE POLICY "tenants_deny_anon"
  ON public.tenants FOR ALL TO anon
  USING (false);

-- ============ RENTAL CONTRACTS ============
DROP POLICY IF EXISTS "contracts_landlord_all" ON public.rental_contracts;
CREATE POLICY "contracts_landlord_all"
  ON public.rental_contracts FOR ALL TO authenticated
  USING (
    unit_id IN (
      SELECT u.id FROM public.units u
      JOIN public.properties p ON p.id = u.property_id
      WHERE p.user_id = auth.uid()
    )
    OR public.is_superadmin()
  );

DROP POLICY IF EXISTS "contracts_tenant_select" ON public.rental_contracts;
CREATE POLICY "contracts_tenant_select"
  ON public.rental_contracts FOR SELECT TO authenticated
  USING (
    tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "contracts_deny_anon" ON public.rental_contracts;
CREATE POLICY "contracts_deny_anon"
  ON public.rental_contracts FOR ALL TO anon
  USING (false);

-- ============ PAYMENTS ============
DROP POLICY IF EXISTS "payments_landlord_all" ON public.payments;
CREATE POLICY "payments_landlord_all"
  ON public.payments FOR ALL TO authenticated
  USING (
    contract_id IN (
      SELECT rc.id FROM public.rental_contracts rc
      JOIN public.units u ON u.id = rc.unit_id
      JOIN public.properties p ON p.id = u.property_id
      WHERE p.user_id = auth.uid()
    )
    OR public.is_superadmin()
  );

DROP POLICY IF EXISTS "payments_tenant_select" ON public.payments;
CREATE POLICY "payments_tenant_select"
  ON public.payments FOR SELECT TO authenticated
  USING (
    tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "payments_deny_anon" ON public.payments;
CREATE POLICY "payments_deny_anon"
  ON public.payments FOR ALL TO anon
  USING (false);

-- ============ DOCUMENTS ============
DROP POLICY IF EXISTS "documents_owner_all" ON public.documents;
CREATE POLICY "documents_owner_all"
  ON public.documents FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.is_superadmin());

DROP POLICY IF EXISTS "documents_tenant_select" ON public.documents;
CREATE POLICY "documents_tenant_select"
  ON public.documents FOR SELECT TO authenticated
  USING (
    tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid())
    OR unit_id IN (
      SELECT unit_id FROM public.tenants
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

DROP POLICY IF EXISTS "documents_deny_anon" ON public.documents;
CREATE POLICY "documents_deny_anon"
  ON public.documents FOR ALL TO anon
  USING (false);

-- ============ METERS ============
DROP POLICY IF EXISTS "meters_owner_all" ON public.meters;
CREATE POLICY "meters_owner_all"
  ON public.meters FOR ALL TO authenticated
  USING (
    unit_id IN (
      SELECT u.id FROM public.units u
      JOIN public.properties p ON p.id = u.property_id
      WHERE p.user_id = auth.uid()
    )
    OR public.is_superadmin()
  );

DROP POLICY IF EXISTS "meters_tenant_select" ON public.meters;
CREATE POLICY "meters_tenant_select"
  ON public.meters FOR SELECT TO authenticated
  USING (
    unit_id IN (
      SELECT unit_id FROM public.tenants
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

DROP POLICY IF EXISTS "meters_deny_anon" ON public.meters;
CREATE POLICY "meters_deny_anon"
  ON public.meters FOR ALL TO anon
  USING (false);

-- ============ METER READINGS ============
DROP POLICY IF EXISTS "readings_owner_all" ON public.meter_readings;
CREATE POLICY "readings_owner_all"
  ON public.meter_readings FOR ALL TO authenticated
  USING (
    meter_id IN (
      SELECT m.id FROM public.meters m
      JOIN public.units u ON u.id = m.unit_id
      JOIN public.properties p ON p.id = u.property_id
      WHERE p.user_id = auth.uid()
    )
    OR public.is_superadmin()
  );

DROP POLICY IF EXISTS "readings_tenant_select" ON public.meter_readings;
CREATE POLICY "readings_tenant_select"
  ON public.meter_readings FOR SELECT TO authenticated
  USING (
    meter_id IN (
      SELECT m.id FROM public.meters m
      WHERE m.unit_id IN (
        SELECT unit_id FROM public.tenants
        WHERE user_id = auth.uid() AND is_active = true
      )
    )
  );

DROP POLICY IF EXISTS "readings_tenant_insert" ON public.meter_readings;
CREATE POLICY "readings_tenant_insert"
  ON public.meter_readings FOR INSERT TO authenticated
  WITH CHECK (
    read_by = auth.uid() AND
    meter_id IN (
      SELECT m.id FROM public.meters m
      WHERE m.unit_id IN (
        SELECT unit_id FROM public.tenants
        WHERE user_id = auth.uid() AND is_active = true
      )
    )
  );

DROP POLICY IF EXISTS "readings_deny_anon" ON public.meter_readings;
CREATE POLICY "readings_deny_anon"
  ON public.meter_readings FOR ALL TO anon
  USING (false);

-- ============ MAINTENANCE REQUESTS ============
DROP POLICY IF EXISTS "maintenance_owner_all" ON public.maintenance_requests;
CREATE POLICY "maintenance_owner_all"
  ON public.maintenance_requests FOR ALL TO authenticated
  USING (
    property_id IN (SELECT id FROM public.properties WHERE user_id = auth.uid())
    OR public.is_superadmin()
  );

DROP POLICY IF EXISTS "maintenance_reporter_select" ON public.maintenance_requests;
CREATE POLICY "maintenance_reporter_select"
  ON public.maintenance_requests FOR SELECT TO authenticated
  USING (reported_by = auth.uid());

DROP POLICY IF EXISTS "maintenance_reporter_insert" ON public.maintenance_requests;
CREATE POLICY "maintenance_reporter_insert"
  ON public.maintenance_requests FOR INSERT TO authenticated
  WITH CHECK (reported_by = auth.uid());

DROP POLICY IF EXISTS "maintenance_caretaker_select" ON public.maintenance_requests;
CREATE POLICY "maintenance_caretaker_select"
  ON public.maintenance_requests FOR SELECT TO authenticated
  USING (assigned_to = auth.uid());

DROP POLICY IF EXISTS "maintenance_caretaker_update" ON public.maintenance_requests;
CREATE POLICY "maintenance_caretaker_update"
  ON public.maintenance_requests FOR UPDATE TO authenticated
  USING (assigned_to = auth.uid());

DROP POLICY IF EXISTS "maintenance_deny_anon" ON public.maintenance_requests;
CREATE POLICY "maintenance_deny_anon"
  ON public.maintenance_requests FOR ALL TO anon
  USING (false);

-- ============ TASKS ============
DROP POLICY IF EXISTS "tasks_owner_all" ON public.tasks;
CREATE POLICY "tasks_owner_all"
  ON public.tasks FOR ALL TO authenticated
  USING (
    property_id IN (SELECT id FROM public.properties WHERE user_id = auth.uid())
    OR public.is_superadmin()
  );

DROP POLICY IF EXISTS "tasks_assignee_select" ON public.tasks;
CREATE POLICY "tasks_assignee_select"
  ON public.tasks FOR SELECT TO authenticated
  USING (assigned_to = auth.uid());

DROP POLICY IF EXISTS "tasks_assignee_update" ON public.tasks;
CREATE POLICY "tasks_assignee_update"
  ON public.tasks FOR UPDATE TO authenticated
  USING (assigned_to = auth.uid());

DROP POLICY IF EXISTS "tasks_deny_anon" ON public.tasks;
CREATE POLICY "tasks_deny_anon"
  ON public.tasks FOR ALL TO anon
  USING (false);

-- ============ TAX NOTICES ============
DROP POLICY IF EXISTS "tax_notices_owner_all" ON public.tax_notices;
CREATE POLICY "tax_notices_owner_all"
  ON public.tax_notices FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.is_superadmin());

DROP POLICY IF EXISTS "tax_notices_deny_anon" ON public.tax_notices;
CREATE POLICY "tax_notices_deny_anon"
  ON public.tax_notices FOR ALL TO anon
  USING (false);

-- ============ TAX NOTICE CHECKS ============
DROP POLICY IF EXISTS "tax_checks_owner_select" ON public.tax_notice_checks;
CREATE POLICY "tax_checks_owner_select"
  ON public.tax_notice_checks FOR SELECT TO authenticated
  USING (
    tax_notice_id IN (SELECT id FROM public.tax_notices WHERE user_id = auth.uid())
    OR public.is_superadmin()
  );

DROP POLICY IF EXISTS "tax_checks_owner_insert" ON public.tax_notice_checks;
CREATE POLICY "tax_checks_owner_insert"
  ON public.tax_notice_checks FOR INSERT TO authenticated
  WITH CHECK (
    tax_notice_id IN (SELECT id FROM public.tax_notices WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "tax_checks_owner_update" ON public.tax_notice_checks;
CREATE POLICY "tax_checks_owner_update"
  ON public.tax_notice_checks FOR UPDATE TO authenticated
  USING (
    tax_notice_id IN (SELECT id FROM public.tax_notices WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "tax_checks_deny_anon" ON public.tax_notice_checks;
CREATE POLICY "tax_checks_deny_anon"
  ON public.tax_notice_checks FOR ALL TO anon
  USING (false);
