-- Migration: api_status_log Tabelle für API-Verfügbarkeits-Tracking
-- Erstellt: 2026-04-18
-- Zweck: Speichert die Ergebnisse der wöchentlichen und Live-API-Checks

CREATE TABLE IF NOT EXISTS public.api_status_log (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checked_at    timestamptz NOT NULL DEFAULT now(),
  results       jsonb NOT NULL DEFAULT '[]'::jsonb,
  overall_ok    boolean NOT NULL DEFAULT true,
  issues_count  integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Index für zeitbasierte Abfragen
CREATE INDEX IF NOT EXISTS api_status_log_checked_at_idx
  ON public.api_status_log (checked_at DESC);

-- RLS aktivieren
ALTER TABLE public.api_status_log ENABLE ROW LEVEL SECURITY;

-- Policy: Nur authentifizierte Nutzer können lesen
CREATE POLICY IF NOT EXISTS "authenticated_read_api_status_log"
  ON public.api_status_log
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Nur authentifizierte Nutzer können schreiben (für Live-Checks aus dem Browser)
CREATE POLICY IF NOT EXISTS "authenticated_insert_api_status_log"
  ON public.api_status_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Service Role kann alles (für wöchentlichen Cron-Job)
CREATE POLICY IF NOT EXISTS "service_role_all_api_status_log"
  ON public.api_status_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Kommentar
COMMENT ON TABLE public.api_status_log IS
  'Speichert die Ergebnisse der API-Verfügbarkeits-Checks (wöchentlich + Live)';
