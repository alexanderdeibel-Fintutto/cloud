-- ============================================================
-- Migration: RLS Fix — Mieter-Historien-Zugriff
-- Datum: 2026-04-19
-- Problem: Mieter verlieren nach Auszug sofort Zugriff auf
--          historische Daten (Zählerstände, Dokumente, Zahlungen).
--          Dies ist rechtlich problematisch (Nebenkostenabrechnung).
-- Lösung:  is_active-Bedingung aus Lese-Policies entfernen.
--          Mieter sehen weiterhin NUR ihre eigenen Daten (via
--          tenant_id / unit_id Verknüpfung), aber auch nach Auszug.
-- ============================================================

-- ============ METER READINGS: Mieter-Lesezugriff ============
-- Vorher: WHERE user_id = auth.uid() AND is_active = true
-- Nachher: WHERE user_id = auth.uid() (kein is_active-Filter)
DROP POLICY IF EXISTS "readings_tenant_select" ON public.meter_readings;
CREATE POLICY "readings_tenant_select"
  ON public.meter_readings FOR SELECT TO authenticated
  USING (
    meter_id IN (
      SELECT m.id FROM public.meters m
      WHERE m.unit_id IN (
        -- Historischer Zugriff: alle Einheiten, in denen der Nutzer
        -- jemals Mieter war (unabhängig von is_active)
        SELECT unit_id FROM public.tenants
        WHERE user_id = auth.uid()
      )
    )
  );

-- ============ METERS: Mieter-Lesezugriff ============
DROP POLICY IF EXISTS "meters_tenant_select" ON public.meters;
CREATE POLICY "meters_tenant_select"
  ON public.meters FOR SELECT TO authenticated
  USING (
    unit_id IN (
      SELECT unit_id FROM public.tenants
      WHERE user_id = auth.uid()
    )
  );

-- ============ DOCUMENTS: Mieter-Lesezugriff ============
DROP POLICY IF EXISTS "documents_tenant_select" ON public.documents;
CREATE POLICY "documents_tenant_select"
  ON public.documents FOR SELECT TO authenticated
  USING (
    -- Dokumente, die direkt dem Mieter zugeordnet sind
    tenant_id IN (
      SELECT id FROM public.tenants WHERE user_id = auth.uid()
    )
    OR
    -- Dokumente der Einheit, in der der Mieter (auch ehemalig) wohnte
    unit_id IN (
      SELECT unit_id FROM public.tenants
      WHERE user_id = auth.uid()
    )
  );

-- ============ PAYMENTS: Mieter-Lesezugriff ============
DROP POLICY IF EXISTS "payments_tenant_select" ON public.payments;
CREATE POLICY "payments_tenant_select"
  ON public.payments FOR SELECT TO authenticated
  USING (
    -- Alle Zahlungen, die dem Mieter zugeordnet sind (auch historisch)
    tenant_id IN (
      SELECT id FROM public.tenants WHERE user_id = auth.uid()
    )
  );

-- ============ RENTAL CONTRACTS: Mieter-Lesezugriff ============
DROP POLICY IF EXISTS "contracts_tenant_select" ON public.rental_contracts;
CREATE POLICY "contracts_tenant_select"
  ON public.rental_contracts FOR SELECT TO authenticated
  USING (
    -- Alle Mietverträge, in denen der Nutzer Mieter war
    tenant_id IN (
      SELECT id FROM public.tenants WHERE user_id = auth.uid()
    )
  );
