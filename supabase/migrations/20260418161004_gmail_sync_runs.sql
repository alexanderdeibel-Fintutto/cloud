-- ============================================================
-- Migration: gmail_sync_runs
-- Protokolliert jeden Gmail-Sync-Lauf (GitHub Actions + manuell)
-- Ermöglicht die AMS-Status-Seite für SecondBrain Gmail-Sync
-- ============================================================

-- Tabelle für Sync-Läufe
CREATE TABLE IF NOT EXISTS public.gmail_sync_runs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  triggered_by  TEXT NOT NULL DEFAULT 'cron'
                  CHECK (triggered_by IN ('cron', 'manual', 'webhook')),
  status        TEXT NOT NULL DEFAULT 'running'
                  CHECK (status IN ('running', 'success', 'error', 'skipped')),
  processed     INTEGER DEFAULT 0,
  skipped       INTEGER DEFAULT 0,
  errors        INTEGER DEFAULT 0,
  documents     TEXT[] DEFAULT '{}',
  error_message TEXT,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at   TIMESTAMPTZ,
  duration_ms   INTEGER GENERATED ALWAYS AS (
    CASE
      WHEN finished_at IS NOT NULL
      THEN EXTRACT(EPOCH FROM (finished_at - started_at))::INTEGER * 1000
    END
  ) STORED
);

-- Indizes
CREATE INDEX IF NOT EXISTS idx_gmail_sync_runs_user_started
  ON public.gmail_sync_runs(user_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_gmail_sync_runs_status
  ON public.gmail_sync_runs(status, started_at DESC);

-- RLS aktivieren
ALTER TABLE public.gmail_sync_runs ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view own sync runs" ON public.gmail_sync_runs;
CREATE POLICY "Users can view own sync runs"
  ON public.gmail_sync_runs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage sync runs" ON public.gmail_sync_runs;
CREATE POLICY "Service role can manage sync runs"
  ON public.gmail_sync_runs FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Deny anonymous access to gmail_sync_runs" ON public.gmail_sync_runs;
CREATE POLICY "Deny anonymous access to gmail_sync_runs"
  ON public.gmail_sync_runs FOR ALL TO anon USING (false);

-- View: Letzter Sync-Status pro User (security_invoker = true)
CREATE OR REPLACE VIEW public.gmail_sync_latest
  WITH (security_invoker = true) AS
  SELECT DISTINCT ON (user_id)
    user_id,
    id            AS run_id,
    triggered_by,
    status,
    processed,
    skipped,
    errors,
    started_at,
    finished_at,
    duration_ms
  FROM public.gmail_sync_runs
  ORDER BY user_id, started_at DESC;

-- Aggregat-View: Gesamt-Statistik pro User
CREATE OR REPLACE VIEW public.gmail_sync_stats
  WITH (security_invoker = true) AS
  SELECT
    user_id,
    COUNT(*)                                    AS total_runs,
    SUM(processed)                              AS total_processed,
    SUM(errors)                                 AS total_errors,
    MAX(started_at)                             AS last_sync_at,
    COUNT(*) FILTER (WHERE status = 'success')  AS successful_runs,
    COUNT(*) FILTER (WHERE status = 'error')    AS failed_runs
  FROM public.gmail_sync_runs
  GROUP BY user_id;
