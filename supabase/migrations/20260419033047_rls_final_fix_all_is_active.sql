-- ============================================================
-- Migration: Finale Korrektur aller is_active-Policies
-- Datum: 2026-04-19
-- Problem: Die Migrationen 007_rls_policies.sql und
--          20260419004353_rls_harden_core_tables.sql enthalten
--          noch is_active = true Bedingungen in 6 Policies.
--          Die Fix-Migration 20260419021107 hat neue Policies
--          erstellt, aber die alten (gleicher Name) wurden durch
--          DROP POLICY IF EXISTS + CREATE POLICY überschrieben.
--          Da die harden-Migration NACH 007 läuft und die gleichen
--          Policy-Namen verwendet, sind die is_active-Policies
--          aus harden noch aktiv.
-- Lösung:  Alle 6 betroffenen Policies final und idempotent
--          überschreiben — ohne is_active-Bedingung.
--          Gleichzeitig: owner_id-basierte Policies aktivieren
--          (aus Migration 20260419021134_rls_denormalize_owner_id)
-- ============================================================

-- ============ 1. PROPERTIES: Mieter-Lesezugriff ohne is_active ============

DROP POLICY IF EXISTS "properties_tenant_select" ON public.properties;
CREATE POLICY "properties_tenant_select"
  ON public.properties FOR SELECT TO authenticated
  USING (
    -- Vermieter/Eigentümer
    user_id = auth.uid()
    OR
    -- Alle Mieter, die jemals eine Einheit in diesem Objekt hatten
    -- (historischer Zugriff — kein is_active-Filter)
    id IN (
      SELECT p.id FROM public.properties p
      JOIN public.units u ON u.property_id = p.id
      JOIN public.tenants t ON t.unit_id = u.id
      WHERE t.user_id = auth.uid()
    )
    OR
    public.is_superadmin()
  );

-- ============ 2. UNITS: Mieter-Lesezugriff ohne is_active ============

DROP POLICY IF EXISTS "units_tenant_select" ON public.units;
CREATE POLICY "units_tenant_select"
  ON public.units FOR SELECT TO authenticated
  USING (
    -- Über owner_id (schnell, falls Spalte befüllt)
    owner_id = auth.uid()
    OR
    -- Über tenants-Tabelle (historisch, kein is_active-Filter)
    id IN (
      SELECT unit_id FROM public.tenants
      WHERE user_id = auth.uid()
    )
    OR
    public.is_superadmin()
  );

-- ============ 3. DOCUMENTS: Mieter-Lesezugriff ohne is_active ============

DROP POLICY IF EXISTS "documents_tenant_select" ON public.documents;
CREATE POLICY "documents_tenant_select"
  ON public.documents FOR SELECT TO authenticated
  USING (
    -- Eigentümer
    owner_id = auth.uid()
    OR
    -- Mieter: Dokumente für ihre Einheit (historisch)
    property_id IN (
      SELECT p.id FROM public.properties p
      JOIN public.units u ON u.property_id = p.id
      JOIN public.tenants t ON t.unit_id = u.id
      WHERE t.user_id = auth.uid()
    )
    OR
    public.is_superadmin()
  );

-- ============ 4. METERS: Mieter-Lesezugriff ohne is_active ============

DROP POLICY IF EXISTS "meters_tenant_select" ON public.meters;
CREATE POLICY "meters_tenant_select"
  ON public.meters FOR SELECT TO authenticated
  USING (
    -- Eigentümer
    owner_id = auth.uid()
    OR
    -- Mieter: Zähler in ihrer Einheit (historisch, kein is_active-Filter)
    unit_id IN (
      SELECT unit_id FROM public.tenants
      WHERE user_id = auth.uid()
    )
    OR
    public.is_superadmin()
  );

-- ============ 5. METER READINGS: Mieter-Lesezugriff ohne is_active ============

DROP POLICY IF EXISTS "readings_tenant_select" ON public.meter_readings;
CREATE POLICY "readings_tenant_select"
  ON public.meter_readings FOR SELECT TO authenticated
  USING (
    -- Eigentümer
    owner_id = auth.uid()
    OR
    -- Mieter: Ablesungen für ihre Zähler (historisch)
    meter_id IN (
      SELECT m.id FROM public.meters m
      JOIN public.tenants t ON t.unit_id = m.unit_id
      WHERE t.user_id = auth.uid()
    )
    OR
    public.is_superadmin()
  );

-- ============ 6. METER READINGS INSERT: Mieter-Insert ohne is_active ============

DROP POLICY IF EXISTS "readings_tenant_insert" ON public.meter_readings;
CREATE POLICY "readings_tenant_insert"
  ON public.meter_readings FOR INSERT TO authenticated
  WITH CHECK (
    -- Mieter kann Ablesungen für aktive Mietverhältnisse eintragen
    -- (hier ist is_active = true korrekt — nur aktive Mieter dürfen neue Werte eintragen)
    meter_id IN (
      SELECT m.id FROM public.meters m
      JOIN public.tenants t ON t.unit_id = m.unit_id
      WHERE t.user_id = auth.uid()
        AND t.is_active = true  -- INSERT: nur aktive Mieter dürfen neue Werte eintragen
    )
  );

-- ============ BONUS: owner_id-basierte Policies für Performance ============
-- Ergänzend zu den bestehenden user_id-Policies:
-- Wenn owner_id befüllt ist, wird die schnelle Direktabfrage bevorzugt.

-- UNITS: Eigentümer-Zugriff via owner_id
DROP POLICY IF EXISTS "units_owner_all" ON public.units;
CREATE POLICY "units_owner_all"
  ON public.units FOR ALL TO authenticated
  USING (
    owner_id = auth.uid()
    OR
    -- Fallback auf property-Join solange owner_id noch nicht befüllt ist
    property_id IN (
      SELECT id FROM public.properties WHERE user_id = auth.uid()
    )
    OR
    public.is_superadmin()
  );

-- METERS: Eigentümer-Zugriff via owner_id
DROP POLICY IF EXISTS "meters_owner_all" ON public.meters;
CREATE POLICY "meters_owner_all"
  ON public.meters FOR ALL TO authenticated
  USING (
    owner_id = auth.uid()
    OR
    unit_id IN (
      SELECT u.id FROM public.units u
      JOIN public.properties p ON p.id = u.property_id
      WHERE p.user_id = auth.uid()
    )
    OR
    public.is_superadmin()
  );

-- METER READINGS: Eigentümer-Zugriff via owner_id
DROP POLICY IF EXISTS "readings_owner_all" ON public.meter_readings;
CREATE POLICY "readings_owner_all"
  ON public.meter_readings FOR ALL TO authenticated
  USING (
    owner_id = auth.uid()
    OR
    meter_id IN (
      SELECT m.id FROM public.meters m
      JOIN public.units u ON u.id = m.unit_id
      JOIN public.properties p ON p.id = u.property_id
      WHERE p.user_id = auth.uid()
    )
    OR
    public.is_superadmin()
  );

-- DOCUMENTS: Eigentümer-Zugriff via owner_id
DROP POLICY IF EXISTS "documents_owner_all" ON public.documents;
CREATE POLICY "documents_owner_all"
  ON public.documents FOR ALL TO authenticated
  USING (
    owner_id = auth.uid()
    OR
    property_id IN (
      SELECT id FROM public.properties WHERE user_id = auth.uid()
    )
    OR
    public.is_superadmin()
  );

-- MAINTENANCE REQUESTS: Eigentümer-Zugriff via owner_id
DROP POLICY IF EXISTS "maintenance_owner_all" ON public.maintenance_requests;
CREATE POLICY "maintenance_owner_all"
  ON public.maintenance_requests FOR ALL TO authenticated
  USING (
    owner_id = auth.uid()
    OR
    property_id IN (
      SELECT id FROM public.properties WHERE user_id = auth.uid()
    )
    OR
    public.is_superadmin()
  );

-- TASKS: Eigentümer-Zugriff via owner_id
DROP POLICY IF EXISTS "tasks_owner_all" ON public.tasks;
CREATE POLICY "tasks_owner_all"
  ON public.tasks FOR ALL TO authenticated
  USING (
    owner_id = auth.uid()
    OR
    property_id IN (
      SELECT id FROM public.properties WHERE user_id = auth.uid()
    )
    OR
    public.is_superadmin()
  );
