-- Migration: vermieter_user_credits Tabelle
-- Speichert Credits und Plan-Informationen für Vermieter-Portal Nutzer.
-- Wird vom CreditsContext im vermieter-portal gelesen und aktualisiert.

CREATE TABLE IF NOT EXISTS public.vermieter_user_credits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan            TEXT NOT NULL DEFAULT 'free',
  credits_remaining    INTEGER NOT NULL DEFAULT 3,
  ai_messages_remaining INTEGER NOT NULL DEFAULT 0,
  period_start    TIMESTAMPTZ NOT NULL DEFAULT date_trunc('month', now()),
  period_end      TIMESTAMPTZ NOT NULL DEFAULT (date_trunc('month', now()) + INTERVAL '1 month' - INTERVAL '1 second'),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

COMMENT ON TABLE public.vermieter_user_credits IS
  'Credits und Plan-Informationen für Vermieter-Portal Nutzer. Wird monatlich zurückgesetzt.';

-- Index
CREATE INDEX IF NOT EXISTS idx_vuc_user_id ON public.vermieter_user_credits (user_id);

-- RLS
ALTER TABLE public.vermieter_user_credits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vuc_own_select" ON public.vermieter_user_credits;
CREATE POLICY "vuc_own_select"
  ON public.vermieter_user_credits FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_superadmin());

DROP POLICY IF EXISTS "vuc_own_insert" ON public.vermieter_user_credits;
CREATE POLICY "vuc_own_insert"
  ON public.vermieter_user_credits FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "vuc_own_update" ON public.vermieter_user_credits;
CREATE POLICY "vuc_own_update"
  ON public.vermieter_user_credits FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "vuc_superadmin_all" ON public.vermieter_user_credits;
CREATE POLICY "vuc_superadmin_all"
  ON public.vermieter_user_credits FOR ALL TO authenticated
  USING (public.is_superadmin());

DROP POLICY IF EXISTS "vuc_deny_anon" ON public.vermieter_user_credits;
CREATE POLICY "vuc_deny_anon"
  ON public.vermieter_user_credits FOR ALL TO anon
  USING (false);

-- Trigger: updated_at automatisch setzen
CREATE OR REPLACE FUNCTION public.update_vermieter_credits_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_vuc_updated_at ON public.vermieter_user_credits;
CREATE TRIGGER trg_vuc_updated_at
  BEFORE UPDATE ON public.vermieter_user_credits
  FOR EACH ROW EXECUTE FUNCTION public.update_vermieter_credits_updated_at();

-- Funktion: Credits für neuen Nutzer initialisieren (wird beim ersten Login aufgerufen)
CREATE OR REPLACE FUNCTION public.init_vermieter_credits(p_user_id UUID, p_plan TEXT DEFAULT 'free')
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
  v_credits INTEGER;
  v_ai_messages INTEGER;
BEGIN
  -- Credits je nach Plan
  v_credits := CASE p_plan
    WHEN 'free'       THEN 3
    WHEN 'starter'    THEN 15
    WHEN 'pro'        THEN 50
    WHEN 'business'   THEN -1  -- Unlimited
    ELSE 3
  END;
  v_ai_messages := CASE p_plan
    WHEN 'free'       THEN 0
    WHEN 'starter'    THEN 10
    WHEN 'pro'        THEN 50
    WHEN 'business'   THEN -1  -- Unlimited
    ELSE 0
  END;

  INSERT INTO public.vermieter_user_credits (
    user_id, plan, credits_remaining, ai_messages_remaining,
    period_start, period_end
  ) VALUES (
    p_user_id, p_plan, v_credits, v_ai_messages,
    date_trunc('month', now()),
    date_trunc('month', now()) + INTERVAL '1 month' - INTERVAL '1 second'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    plan = EXCLUDED.plan,
    updated_at = now()
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.init_vermieter_credits(UUID, TEXT) TO authenticated;
COMMENT ON FUNCTION public.init_vermieter_credits IS
  'Initialisiert Credits für einen neuen Vermieter-Portal Nutzer. Wird beim ersten Login aufgerufen.';
