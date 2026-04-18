-- Migration: Superadmin-Funktion und zentraler Admin-Bypass
-- Erstellt eine einheitliche is_superadmin()-Funktion die in allen RLS-Policies
-- verwendet werden kann, um Superadmin-Zugriff auf alle Tabellen zu ermöglichen.

-- ============ SUPERADMIN-FUNKTION ============

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND (
        role = 'superadmin'
        OR email IN (
          'alexander@fintutto.world',
          'alexander@fintutto.de',
          'admin@fintutto.de'
        )
      )
  );
$$;

-- Öffentlich aufrufbar (wird intern von RLS-Policies verwendet)
GRANT EXECUTE ON FUNCTION public.is_superadmin() TO authenticated;

-- ============ SUPERADMIN-POLICIES FÜR KERN-TABELLEN ============

-- profiles: Superadmin kann alle Profile lesen
DROP POLICY IF EXISTS "profiles_superadmin_select" ON public.profiles;
CREATE POLICY "profiles_superadmin_select"
  ON public.profiles FOR SELECT
  USING (public.is_superadmin());

-- profiles: Superadmin kann alle Profile aktualisieren
DROP POLICY IF EXISTS "profiles_superadmin_update" ON public.profiles;
CREATE POLICY "profiles_superadmin_update"
  ON public.profiles FOR UPDATE
  USING (public.is_superadmin());

-- organizations: Superadmin kann alle Organisationen lesen
DROP POLICY IF EXISTS "organizations_superadmin_select" ON public.organizations;
CREATE POLICY "organizations_superadmin_select"
  ON public.organizations FOR SELECT
  USING (public.is_superadmin());

-- subscriptions: Superadmin kann alle Abonnements lesen
DROP POLICY IF EXISTS "subscriptions_superadmin_select" ON public.subscriptions;
CREATE POLICY "subscriptions_superadmin_select"
  ON public.subscriptions FOR SELECT
  USING (public.is_superadmin());

-- api_status_log: Superadmin kann alle Logs lesen
DROP POLICY IF EXISTS "api_status_log_superadmin_select" ON public.api_status_log;
CREATE POLICY "api_status_log_superadmin_select"
  ON public.api_status_log FOR SELECT
  USING (public.is_superadmin());

-- admin_logs: Superadmin kann alle Admin-Logs lesen
DROP POLICY IF EXISTS "admin_logs_superadmin_select" ON public.admin_logs;
CREATE POLICY "admin_logs_superadmin_select"
  ON public.admin_logs FOR SELECT
  USING (public.is_superadmin());

-- apps_registry: Superadmin kann alle Apps verwalten
DROP POLICY IF EXISTS "apps_registry_superadmin_all" ON public.apps_registry;
CREATE POLICY "apps_registry_superadmin_all"
  ON public.apps_registry FOR ALL
  USING (public.is_superadmin());

-- ============ SUPERADMIN-ROLLE IN PROFILES ============

-- Rolle 'superadmin' zu den erlaubten Rollen hinzufügen (falls Constraint existiert)
DO $$
BEGIN
  -- Prüfen ob eine CHECK-Constraint auf role existiert und sie erweitern
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'role'
  ) THEN
    -- Superadmin-Rolle für alexander@fintutto.world setzen
    UPDATE public.profiles
    SET role = 'superadmin'
    WHERE email IN (
      'alexander@fintutto.world',
      'alexander@fintutto.de',
      'admin@fintutto.de'
    )
    AND (role IS NULL OR role != 'superadmin');
  END IF;
END $$;
