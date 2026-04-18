-- Migration: user_activity_log-Tabelle
-- Zentrales Aktivitäts-Log für alle Portal-Apps.
-- Wird vom AMS GrowthDashboard für den App-Aktivitäts-Tab verwendet.
-- Jede App schreibt bei relevanten Nutzeraktionen einen Eintrag.

-- ============ TABELLE ============

CREATE TABLE IF NOT EXISTS public.user_activity_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  app_id        TEXT NOT NULL,
  action        TEXT NOT NULL,
  entity_type   TEXT,
  entity_id     UUID,
  metadata      JSONB DEFAULT '{}',
  ip_hash       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.user_activity_log IS
  'Zentrales Aktivitäts-Log für alle Portal-Apps. Jede App schreibt bei relevanten Aktionen einen Eintrag.';

COMMENT ON COLUMN public.user_activity_log.app_id IS
  'App-Bezeichner: vermietify | ams | pflanzen-manager | secondbrain | finance-coach | finance-mentor | bescheidboxer | arbeitslos-portal | ablesung | translator | biz';

COMMENT ON COLUMN public.user_activity_log.action IS
  'Aktion: login | logout | create | update | delete | view | export | import | share';

COMMENT ON COLUMN public.user_activity_log.entity_type IS
  'Entitätstyp: property | tenant | document | contract | payment | meter | plant | transaction | bescheid | session';

COMMENT ON COLUMN public.user_activity_log.metadata IS
  'Zusätzliche Metadaten als JSON (z.B. {"duration_seconds": 120, "feature": "dashboard"})';

-- ============ INDIZES ============

CREATE INDEX IF NOT EXISTS idx_ual_user_id
  ON public.user_activity_log (user_id);

CREATE INDEX IF NOT EXISTS idx_ual_app_id
  ON public.user_activity_log (app_id);

CREATE INDEX IF NOT EXISTS idx_ual_created_at
  ON public.user_activity_log (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ual_app_created
  ON public.user_activity_log (app_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ual_action
  ON public.user_activity_log (action);

-- ============ RLS ============

ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

-- Nutzer können ihre eigenen Aktivitäten lesen
DROP POLICY IF EXISTS "ual_own_select" ON public.user_activity_log;
CREATE POLICY "ual_own_select"
  ON public.user_activity_log FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_superadmin());

-- Authentifizierte Nutzer können Aktivitäten einfügen (nur eigene)
DROP POLICY IF EXISTS "ual_own_insert" ON public.user_activity_log;
CREATE POLICY "ual_own_insert"
  ON public.user_activity_log FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_superadmin());

-- Superadmin kann alle Aktivitäten verwalten
DROP POLICY IF EXISTS "ual_superadmin_all" ON public.user_activity_log;
CREATE POLICY "ual_superadmin_all"
  ON public.user_activity_log FOR ALL
  TO authenticated
  USING (public.is_superadmin());

-- Anon-Zugriff blockieren
DROP POLICY IF EXISTS "ual_deny_anon" ON public.user_activity_log;
CREATE POLICY "ual_deny_anon"
  ON public.user_activity_log FOR ALL
  TO anon
  USING (false);

-- ============ AGGREGATIONS-VIEW FÜR AMS-DASHBOARD ============

CREATE OR REPLACE VIEW public.app_activity_monthly
  WITH (security_invoker = true)
AS
SELECT
  app_id,
  date_trunc('month', created_at) AS month,
  COUNT(DISTINCT user_id)          AS active_users,
  COUNT(*)                         AS total_actions,
  COUNT(*) FILTER (WHERE action = 'login') AS logins,
  COUNT(*) FILTER (WHERE action = 'create') AS creates,
  COUNT(*) FILTER (WHERE action = 'view') AS views
FROM public.user_activity_log
GROUP BY app_id, date_trunc('month', created_at)
ORDER BY month DESC, app_id;

COMMENT ON VIEW public.app_activity_monthly IS
  'Monatliche Aktivitätsaggregation pro App — wird vom AMS GrowthDashboard verwendet';

-- ============ HELPER-FUNKTION: AKTIVITÄT LOGGEN ============

CREATE OR REPLACE FUNCTION public.log_activity(
  p_app_id      TEXT,
  p_action      TEXT,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id   UUID DEFAULT NULL,
  p_metadata    JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.user_activity_log (
    user_id, app_id, action, entity_type, entity_id, metadata
  ) VALUES (
    auth.uid(), p_app_id, p_action, p_entity_type, p_entity_id, p_metadata
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_activity(TEXT, TEXT, TEXT, UUID, JSONB) TO authenticated;

COMMENT ON FUNCTION public.log_activity IS
  'Hilfsfunktion zum Loggen von Nutzeraktivitäten aus allen Apps. Verwendung: SELECT log_activity(''vermietify'', ''login'');';
