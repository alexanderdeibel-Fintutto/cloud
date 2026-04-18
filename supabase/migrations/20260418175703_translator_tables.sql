-- ============================================================
-- Migration: Translator – Echtzeit-Übersetzungs-Sessions
--            Live-Sessions, Übersetzungen, Verlauf
-- ============================================================

-- ── tr_sessions ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tr_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_code    TEXT NOT NULL UNIQUE,
  speaker_name    TEXT,
  source_language TEXT NOT NULL DEFAULT 'de',
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
    'active','ended','expired'
  )),
  listener_count  INTEGER NOT NULL DEFAULT 0,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at        TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tr_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own tr_sessions" ON public.tr_sessions;
CREATE POLICY "Users manage own tr_sessions"
  ON public.tr_sessions FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can read active sessions by code" ON public.tr_sessions;
CREATE POLICY "Anyone can read active sessions by code"
  ON public.tr_sessions FOR SELECT TO authenticated
  USING (status = 'active');

DROP POLICY IF EXISTS "Deny anonymous access to tr_sessions" ON public.tr_sessions;
CREATE POLICY "Deny anonymous access to tr_sessions"
  ON public.tr_sessions FOR ALL TO anon USING (false);

-- ── tr_translations ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tr_translations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID REFERENCES public.tr_sessions(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  source_text     TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  source_lang     TEXT NOT NULL,
  target_lang     TEXT NOT NULL,
  provider        TEXT DEFAULT 'openai',
  latency_ms      INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tr_translations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own tr_translations" ON public.tr_translations;
CREATE POLICY "Users manage own tr_translations"
  ON public.tr_translations FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Deny anonymous access to tr_translations" ON public.tr_translations;
CREATE POLICY "Deny anonymous access to tr_translations"
  ON public.tr_translations FOR ALL TO anon USING (false);

-- ── tr_session_stats View ─────────────────────────────────────
CREATE OR REPLACE VIEW public.v_tr_session_stats
  WITH (security_invoker = true) AS
SELECT
  date_trunc('day', s.created_at) AS day,
  COUNT(DISTINCT s.id)            AS sessions,
  COUNT(t.id)                     AS translations,
  AVG(t.latency_ms)               AS avg_latency_ms
FROM public.tr_sessions s
LEFT JOIN public.tr_translations t ON t.session_id = s.id
GROUP BY 1
ORDER BY 1 DESC;
