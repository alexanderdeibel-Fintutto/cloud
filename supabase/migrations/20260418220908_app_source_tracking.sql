-- Migration: app_source-Tracking für Nutzer und Organisationen
-- Ermöglicht das Nachverfolgen welche App einen Nutzer registriert hat.
-- Wird vom AMS GrowthDashboard für den App-Aktivitäts-Tab verwendet.

-- ============ PROFILES: app_source SPALTE ============

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS app_source TEXT DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS app_source_version TEXT,
  ADD COLUMN IF NOT EXISTS first_seen_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT now();

-- Kommentar zur Dokumentation
COMMENT ON COLUMN public.profiles.app_source IS
  'Die App über die sich der Nutzer registriert hat (z.B. vermietify, ams, pflanzen-manager, secondbrain, finance-coach, finance-mentor, bescheidboxer, arbeitslos-portal, ablesung, translator, biz)';

COMMENT ON COLUMN public.profiles.last_active_at IS
  'Letzter Login oder aktive Nutzung — wird bei jedem Auth-Event aktualisiert';

-- ============ ORGANIZATIONS: app_source SPALTE ============

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS app_source TEXT DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS created_via TEXT;

COMMENT ON COLUMN public.organizations.app_source IS
  'Die App über die die Organisation angelegt wurde';

-- ============ SUBSCRIPTIONS: app_source SPALTE ============

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS app_source TEXT DEFAULT 'unknown';

COMMENT ON COLUMN public.subscriptions.app_source IS
  'Die App über die das Abonnement abgeschlossen wurde';

-- ============ INDEX FÜR PERFORMANCE ============

CREATE INDEX IF NOT EXISTS idx_profiles_app_source
  ON public.profiles (app_source);

CREATE INDEX IF NOT EXISTS idx_profiles_last_active_at
  ON public.profiles (last_active_at DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_created_at
  ON public.profiles (created_at DESC);

-- ============ TRIGGER: last_active_at AUTOMATISCH AKTUALISIEREN ============

CREATE OR REPLACE FUNCTION public.update_last_active_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.last_active_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_last_active ON public.profiles;
CREATE TRIGGER trg_profiles_last_active
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_last_active_at();

-- ============ BEKANNTE APP-QUELLEN SETZEN ============
-- Bestehende Nutzer erhalten 'legacy' als app_source

UPDATE public.profiles
SET app_source = 'legacy'
WHERE app_source = 'unknown' OR app_source IS NULL;
