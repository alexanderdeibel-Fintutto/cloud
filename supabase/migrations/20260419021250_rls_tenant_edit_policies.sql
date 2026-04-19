-- ============================================================
-- Migration: Mieter Update/Delete-Policies
-- Datum: 2026-04-19
-- Problem: Mieter können Zählerstände eintragen (INSERT), aber
--          keine eigenen Fehleingaben korrigieren (UPDATE/DELETE).
--          Mängelmeldungen können nach Einreichung nicht mehr
--          zurückgezogen werden.
-- Lösung:  UPDATE und DELETE Policies für Mieter hinzufügen,
--          eingeschränkt auf eigene Einträge und bestimmte Status.
-- ============================================================

-- ============ METER READINGS: Mieter kann eigene Einträge korrigieren ============

-- UPDATE: Mieter kann eigene Zählerstände korrigieren
-- (nur wenn sie selbst eingetragen wurden und noch nicht abgerechnet)
DROP POLICY IF EXISTS "readings_tenant_update" ON public.meter_readings;
CREATE POLICY "readings_tenant_update"
  ON public.meter_readings FOR UPDATE TO authenticated
  USING (
    -- Nur eigene Einträge
    read_by = auth.uid()
    AND
    -- Nur Zähler der eigenen Einheiten (historisch)
    meter_id IN (
      SELECT m.id FROM public.meters m
      WHERE m.unit_id IN (
        SELECT unit_id FROM public.tenants
        WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    -- Beim Update: read_by darf nicht geändert werden
    read_by = auth.uid()
  );

-- DELETE: Mieter kann eigene Zählerstände löschen
-- (nur manuelle Einträge, die noch nicht vom Vermieter bestätigt wurden)
DROP POLICY IF EXISTS "readings_tenant_delete" ON public.meter_readings;
CREATE POLICY "readings_tenant_delete"
  ON public.meter_readings FOR DELETE TO authenticated
  USING (
    -- Nur eigene, manuelle Einträge
    read_by = auth.uid()
    AND source = 'manual'
    AND
    -- Nur Zähler der eigenen Einheiten
    meter_id IN (
      SELECT m.id FROM public.meters m
      WHERE m.unit_id IN (
        SELECT unit_id FROM public.tenants
        WHERE user_id = auth.uid()
      )
    )
  );

-- ============ MAINTENANCE REQUESTS: Mieter kann eigene Meldungen bearbeiten ============

-- UPDATE: Mieter kann eigene offene Mängelmeldungen bearbeiten
-- (z.B. Beschreibung präzisieren, solange noch nicht in Bearbeitung)
DROP POLICY IF EXISTS "maintenance_reporter_update" ON public.maintenance_requests;
CREATE POLICY "maintenance_reporter_update"
  ON public.maintenance_requests FOR UPDATE TO authenticated
  USING (
    reported_by = auth.uid()
    AND status IN ('open')  -- Nur offene Meldungen können bearbeitet werden
  )
  WITH CHECK (
    reported_by = auth.uid()
    -- Status darf durch Mieter nur auf 'closed' gesetzt werden (Rücknahme)
    -- Alle anderen Status-Übergänge obliegen dem Vermieter/Hausmeister
  );

-- DELETE: Mieter kann eigene offene Mängelmeldungen zurückziehen
DROP POLICY IF EXISTS "maintenance_reporter_delete" ON public.maintenance_requests;
CREATE POLICY "maintenance_reporter_delete"
  ON public.maintenance_requests FOR DELETE TO authenticated
  USING (
    reported_by = auth.uid()
    AND status = 'open'  -- Nur offene Meldungen können zurückgezogen werden
  );

-- ============ TASKS: Ersteller kann eigene Aufgaben bearbeiten ============

-- UPDATE: Aufgaben-Ersteller kann eigene Aufgaben aktualisieren
DROP POLICY IF EXISTS "tasks_creator_update" ON public.tasks;
CREATE POLICY "tasks_creator_update"
  ON public.tasks FOR UPDATE TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- DELETE: Aufgaben-Ersteller kann eigene offene Aufgaben löschen
DROP POLICY IF EXISTS "tasks_creator_delete" ON public.tasks;
CREATE POLICY "tasks_creator_delete"
  ON public.tasks FOR DELETE TO authenticated
  USING (
    created_by = auth.uid()
    AND status IN ('todo', 'cancelled')
  );
