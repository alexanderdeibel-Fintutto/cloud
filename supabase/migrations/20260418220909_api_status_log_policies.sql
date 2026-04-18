-- Migration: api_status_log RLS-Policies verbessern
-- Ermöglicht authentifizierten Nutzern das Lesen des API-Status-Logs
-- und Superadmins das vollständige Verwalten aller Einträge.

-- ============ api_status_log POLICIES ============

-- RLS aktivieren (falls noch nicht aktiv)
ALTER TABLE public.api_status_log ENABLE ROW LEVEL SECURITY;

-- Alle authentifizierten Nutzer können den API-Status lesen (read-only)
DROP POLICY IF EXISTS "api_status_log_authenticated_select" ON public.api_status_log;
CREATE POLICY "api_status_log_authenticated_select"
  ON public.api_status_log FOR SELECT
  TO authenticated
  USING (true);

-- Superadmin kann Einträge einfügen (für den wöchentlichen Cron-Job)
DROP POLICY IF EXISTS "api_status_log_superadmin_insert" ON public.api_status_log;
CREATE POLICY "api_status_log_superadmin_insert"
  ON public.api_status_log FOR INSERT
  TO authenticated
  WITH CHECK (public.is_superadmin());

-- Superadmin kann Einträge aktualisieren
DROP POLICY IF EXISTS "api_status_log_superadmin_update" ON public.api_status_log;
CREATE POLICY "api_status_log_superadmin_update"
  ON public.api_status_log FOR UPDATE
  TO authenticated
  USING (public.is_superadmin());

-- Superadmin kann Einträge löschen (Cleanup alter Logs)
DROP POLICY IF EXISTS "api_status_log_superadmin_delete" ON public.api_status_log;
CREATE POLICY "api_status_log_superadmin_delete"
  ON public.api_status_log FOR DELETE
  TO authenticated
  USING (public.is_superadmin());

-- Anon-Zugriff explizit blockieren
DROP POLICY IF EXISTS "api_status_log_deny_anon" ON public.api_status_log;
CREATE POLICY "api_status_log_deny_anon"
  ON public.api_status_log FOR ALL
  TO anon
  USING (false);

-- ============ admin_logs POLICIES ============

ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Authentifizierte Nutzer können ihre eigenen Logs lesen
DROP POLICY IF EXISTS "admin_logs_own_select" ON public.admin_logs;
CREATE POLICY "admin_logs_own_select"
  ON public.admin_logs FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_superadmin()
  );

-- Authentifizierte Nutzer können Logs einfügen
DROP POLICY IF EXISTS "admin_logs_authenticated_insert" ON public.admin_logs;
CREATE POLICY "admin_logs_authenticated_insert"
  ON public.admin_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_superadmin());

-- Anon-Zugriff blockieren
DROP POLICY IF EXISTS "admin_logs_deny_anon" ON public.admin_logs;
CREATE POLICY "admin_logs_deny_anon"
  ON public.admin_logs FOR ALL
  TO anon
  USING (false);

-- ============ apps_registry POLICIES ============

ALTER TABLE public.apps_registry ENABLE ROW LEVEL SECURITY;

-- Alle authentifizierten Nutzer können die App-Registry lesen
DROP POLICY IF EXISTS "apps_registry_authenticated_select" ON public.apps_registry;
CREATE POLICY "apps_registry_authenticated_select"
  ON public.apps_registry FOR SELECT
  TO authenticated
  USING (true);

-- Anon kann öffentliche Apps lesen
DROP POLICY IF EXISTS "apps_registry_anon_select_public" ON public.apps_registry;
CREATE POLICY "apps_registry_anon_select_public"
  ON public.apps_registry FOR SELECT
  TO anon
  USING (is_public = true);
