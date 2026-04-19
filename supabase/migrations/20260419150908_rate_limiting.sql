-- ============================================================
-- Migration: Rate-Limiting für Edge Functions
-- Erstellt: 2026-04-19
-- Zweck: API-Nutzung pro Nutzer/Tier begrenzen um Kosten zu kontrollieren
-- ============================================================

-- ── 1. API-Nutzungs-Tabelle ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS api_usage_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  function_name TEXT NOT NULL,
  called_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  tokens_used   INTEGER DEFAULT 0,
  cost_usd      NUMERIC(10, 6) DEFAULT 0,
  cached        BOOLEAN DEFAULT false
);

-- Indizes für schnelle Abfragen
CREATE INDEX IF NOT EXISTS idx_api_usage_user_month
  ON api_usage_log (user_id, function_name, called_at);

CREATE INDEX IF NOT EXISTS idx_api_usage_called_at
  ON api_usage_log (called_at);

-- RLS aktivieren
ALTER TABLE api_usage_log ENABLE ROW LEVEL SECURITY;

-- Nutzer sehen nur ihre eigenen Einträge
DROP POLICY IF EXISTS "api_usage_own_select" ON api_usage_log;
CREATE POLICY "api_usage_own_select"
  ON api_usage_log FOR SELECT
  USING (user_id = auth.uid());

-- Nur Service Role darf schreiben (Edge Functions nutzen Service Role Key)
DROP POLICY IF EXISTS "api_usage_service_insert" ON api_usage_log;
CREATE POLICY "api_usage_service_insert"
  ON api_usage_log FOR INSERT
  WITH CHECK (is_superadmin() OR auth.role() = 'service_role');

-- Superadmin sieht alle
DROP POLICY IF EXISTS "api_usage_superadmin_all" ON api_usage_log;
CREATE POLICY "api_usage_superadmin_all"
  ON api_usage_log FOR ALL
  USING (is_superadmin());

-- Anon blockieren
DROP POLICY IF EXISTS "api_usage_anon_deny" ON api_usage_log;
CREATE POLICY "api_usage_anon_deny"
  ON api_usage_log FOR ALL
  TO anon
  USING (false);

-- ── 2. OCR-Cache-Tabelle ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ocr_cache (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_hash    TEXT NOT NULL,
  function_name TEXT NOT NULL,
  result        JSONB NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at    TIMESTAMPTZ NOT NULL,
  hit_count     INTEGER DEFAULT 0,
  UNIQUE (image_hash, function_name)
);

CREATE INDEX IF NOT EXISTS idx_ocr_cache_hash_fn
  ON ocr_cache (image_hash, function_name);

CREATE INDEX IF NOT EXISTS idx_ocr_cache_expires
  ON ocr_cache (expires_at);

-- RLS: Nur Service Role liest/schreibt (kein direkter Nutzer-Zugriff)
ALTER TABLE ocr_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ocr_cache_service_all" ON ocr_cache;
CREATE POLICY "ocr_cache_service_all"
  ON ocr_cache FOR ALL
  USING (auth.role() = 'service_role' OR is_superadmin());

DROP POLICY IF EXISTS "ocr_cache_anon_deny" ON ocr_cache;
CREATE POLICY "ocr_cache_anon_deny"
  ON ocr_cache FOR ALL TO anon
  USING (false);

-- ── 3. ElevenLabs-Audio-Cache-Tabelle ───────────────────────────────────
CREATE TABLE IF NOT EXISTS tts_cache (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text_hash     TEXT NOT NULL UNIQUE,
  text_preview  TEXT,                    -- Erste 100 Zeichen für Debugging
  storage_path  TEXT NOT NULL,           -- Pfad in Supabase Storage
  voice_id      TEXT NOT NULL DEFAULT 'default',
  duration_sec  NUMERIC(6,2),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at    TIMESTAMPTZ,             -- NULL = permanent (Onboarding-Texte)
  hit_count     INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_tts_cache_hash
  ON tts_cache (text_hash);

ALTER TABLE tts_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tts_cache_service_all" ON tts_cache;
CREATE POLICY "tts_cache_service_all"
  ON tts_cache FOR ALL
  USING (auth.role() = 'service_role' OR is_superadmin());

-- Alle eingeloggten Nutzer dürfen lesen (für Audio-Playback)
DROP POLICY IF EXISTS "tts_cache_auth_select" ON tts_cache;
CREATE POLICY "tts_cache_auth_select"
  ON tts_cache FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "tts_cache_anon_deny" ON tts_cache;
CREATE POLICY "tts_cache_anon_deny"
  ON tts_cache FOR ALL TO anon
  USING (false);

-- ── 4. Tier-Limits-Tabelle ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS api_tier_limits (
  tier          TEXT PRIMARY KEY,        -- 'free', 'starter', 'pro', 'superadmin'
  function_name TEXT NOT NULL,
  monthly_limit INTEGER NOT NULL,        -- -1 = unbegrenzt
  PRIMARY KEY (tier, function_name)
);

-- Primärschlüssel-Konflikt beheben
ALTER TABLE api_tier_limits DROP CONSTRAINT IF EXISTS api_tier_limits_pkey;
ALTER TABLE api_tier_limits ADD PRIMARY KEY (tier, function_name);

-- Standard-Limits eintragen
INSERT INTO api_tier_limits (tier, function_name, monthly_limit) VALUES
  -- Free: Keine KI-Calls
  ('free', 'ocr-meter',          0),
  ('free', 'ocr-meter-number',   0),
  ('free', 'ocr-invoice',        0),
  ('free', 'amt-scan',           0),
  ('free', 'analyze-receipt',    0),
  ('free', 'secondbrain-chat',   5),
  ('free', 'ai-chat',            5),
  -- Starter: Begrenzte Calls
  ('starter', 'ocr-meter',       20),
  ('starter', 'ocr-meter-number',20),
  ('starter', 'ocr-invoice',     10),
  ('starter', 'amt-scan',        10),
  ('starter', 'analyze-receipt', 10),
  ('starter', 'secondbrain-chat',50),
  ('starter', 'ai-chat',         50),
  -- Pro: Unbegrenzt
  ('pro', 'ocr-meter',           -1),
  ('pro', 'ocr-meter-number',    -1),
  ('pro', 'ocr-invoice',         -1),
  ('pro', 'amt-scan',            -1),
  ('pro', 'analyze-receipt',     -1),
  ('pro', 'secondbrain-chat',    -1),
  ('pro', 'ai-chat',             -1),
  -- Superadmin: Unbegrenzt
  ('superadmin', 'ocr-meter',          -1),
  ('superadmin', 'ocr-meter-number',   -1),
  ('superadmin', 'ocr-invoice',        -1),
  ('superadmin', 'amt-scan',           -1),
  ('superadmin', 'analyze-receipt',    -1),
  ('superadmin', 'secondbrain-chat',   -1),
  ('superadmin', 'ai-chat',            -1)
ON CONFLICT (tier, function_name) DO UPDATE
  SET monthly_limit = EXCLUDED.monthly_limit;

-- RLS für Tier-Limits (öffentlich lesbar, nur Service schreibt)
ALTER TABLE api_tier_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tier_limits_public_select" ON api_tier_limits;
CREATE POLICY "tier_limits_public_select"
  ON api_tier_limits FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "tier_limits_service_write" ON api_tier_limits;
CREATE POLICY "tier_limits_service_write"
  ON api_tier_limits FOR ALL
  USING (auth.role() = 'service_role' OR is_superadmin());

-- ── 5. check_rate_limit() Funktion ──────────────────────────────────────
-- Prüft ob ein Nutzer das Rate-Limit für eine Funktion erreicht hat
-- Gibt zurück: { allowed: boolean, used: int, limit: int, tier: text }
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id     UUID,
  p_function    TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier        TEXT;
  v_limit       INTEGER;
  v_used        INTEGER;
  v_month_start TIMESTAMPTZ;
BEGIN
  v_month_start := date_trunc('month', now());

  -- Tier des Nutzers ermitteln
  SELECT COALESCE(
    (SELECT 'superadmin' WHERE is_superadmin()),
    (SELECT raw_user_meta_data->>'subscription_tier'
     FROM auth.users WHERE id = p_user_id),
    'free'
  ) INTO v_tier;

  -- Limit für diesen Tier und diese Funktion
  SELECT monthly_limit INTO v_limit
  FROM api_tier_limits
  WHERE tier = v_tier AND function_name = p_function;

  -- Kein Eintrag = unbegrenzt
  IF v_limit IS NULL THEN
    RETURN jsonb_build_object('allowed', true, 'used', 0, 'limit', -1, 'tier', v_tier);
  END IF;

  -- Unbegrenzt
  IF v_limit = -1 THEN
    RETURN jsonb_build_object('allowed', true, 'used', 0, 'limit', -1, 'tier', v_tier);
  END IF;

  -- Nutzung diesen Monat zählen (gecachte Calls nicht zählen)
  SELECT COUNT(*) INTO v_used
  FROM api_usage_log
  WHERE user_id = p_user_id
    AND function_name = p_function
    AND called_at >= v_month_start
    AND cached = false;

  RETURN jsonb_build_object(
    'allowed', v_used < v_limit,
    'used',    v_used,
    'limit',   v_limit,
    'tier',    v_tier
  );
END;
$$;

-- ── 6. Cleanup-Job: Abgelaufene Cache-Einträge entfernen ─────────────────
-- Wird täglich via pg_cron ausgeführt (falls pg_cron aktiviert)
-- Alternativ: Manuell oder via Edge Function Cron-Job
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM ocr_cache WHERE expires_at < now();
  DELETE FROM tts_cache WHERE expires_at IS NOT NULL AND expires_at < now();
  -- API-Logs älter als 13 Monate löschen (1 Monat Puffer für Jahresberichte)
  DELETE FROM api_usage_log WHERE called_at < now() - INTERVAL '13 months';
END;
$$;

-- ── 7. AMS Dashboard View: API-Kosten-Übersicht ──────────────────────────
CREATE OR REPLACE VIEW api_cost_monthly AS
SELECT
  date_trunc('month', called_at)::DATE AS month,
  function_name,
  COUNT(*) FILTER (WHERE cached = false) AS real_calls,
  COUNT(*) FILTER (WHERE cached = true)  AS cached_calls,
  COUNT(*)                               AS total_calls,
  SUM(cost_usd) FILTER (WHERE cached = false) AS total_cost_usd,
  ROUND(
    COUNT(*) FILTER (WHERE cached = true)::NUMERIC /
    NULLIF(COUNT(*), 0) * 100, 1
  ) AS cache_hit_rate_pct
FROM api_usage_log
GROUP BY 1, 2
ORDER BY 1 DESC, 3 DESC;

-- Superadmin-Only RLS für die View
ALTER VIEW api_cost_monthly OWNER TO postgres;
