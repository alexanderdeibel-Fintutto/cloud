-- ============================================================
-- Migration: Finance Coach – Persönliche Finanzverwaltung
--            Konten, Transaktionen, Budgets, Sparziele, KI-Insights
-- ============================================================

-- ── finance_accounts ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.finance_accounts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_name  TEXT NOT NULL,
  account_type  TEXT NOT NULL DEFAULT 'checking' CHECK (account_type IN (
    'checking','savings','credit','investment','cash','other'
  )),
  bank_name     TEXT,
  balance       NUMERIC(14,2) NOT NULL DEFAULT 0,
  currency      TEXT NOT NULL DEFAULT 'EUR',
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.finance_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own finance_accounts" ON public.finance_accounts;
CREATE POLICY "Users manage own finance_accounts"
  ON public.finance_accounts FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Deny anonymous access to finance_accounts" ON public.finance_accounts;
CREATE POLICY "Deny anonymous access to finance_accounts"
  ON public.finance_accounts FOR ALL TO anon USING (false);

-- ── finance_transactions ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.finance_transactions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id   UUID REFERENCES public.finance_accounts(id) ON DELETE SET NULL,
  amount       NUMERIC(14,2) NOT NULL,
  direction    TEXT NOT NULL CHECK (direction IN ('inflow','outflow')),
  category     TEXT,
  merchant     TEXT,
  description  TEXT,
  occurred_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own finance_transactions" ON public.finance_transactions;
CREATE POLICY "Users manage own finance_transactions"
  ON public.finance_transactions FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Deny anonymous access to finance_transactions" ON public.finance_transactions;
CREATE POLICY "Deny anonymous access to finance_transactions"
  ON public.finance_transactions FOR ALL TO anon USING (false);

-- ── finance_budgets ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.finance_budgets (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category         TEXT NOT NULL,
  monthly_limit    NUMERIC(14,2) NOT NULL,
  alert_threshold  NUMERIC(5,2) NOT NULL DEFAULT 80,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.finance_budgets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own finance_budgets" ON public.finance_budgets;
CREATE POLICY "Users manage own finance_budgets"
  ON public.finance_budgets FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Deny anonymous access to finance_budgets" ON public.finance_budgets;
CREATE POLICY "Deny anonymous access to finance_budgets"
  ON public.finance_budgets FOR ALL TO anon USING (false);

-- ── finance_goals ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.finance_goals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  target_amount   NUMERIC(14,2) NOT NULL,
  current_amount  NUMERIC(14,2) NOT NULL DEFAULT 0,
  deadline        DATE,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
    'active','completed','paused','cancelled'
  )),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.finance_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own finance_goals" ON public.finance_goals;
CREATE POLICY "Users manage own finance_goals"
  ON public.finance_goals FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Deny anonymous access to finance_goals" ON public.finance_goals;
CREATE POLICY "Deny anonymous access to finance_goals"
  ON public.finance_goals FOR ALL TO anon USING (false);

-- ── finance_ai_insights ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.finance_ai_insights (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('tip','warning','opportunity','summary')),
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  category    TEXT,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.finance_ai_insights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own finance_ai_insights" ON public.finance_ai_insights;
CREATE POLICY "Users manage own finance_ai_insights"
  ON public.finance_ai_insights FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Deny anonymous access to finance_ai_insights" ON public.finance_ai_insights;
CREATE POLICY "Deny anonymous access to finance_ai_insights"
  ON public.finance_ai_insights FOR ALL TO anon USING (false);

-- ── updated_at Trigger ────────────────────────────────────────
DROP TRIGGER IF EXISTS set_updated_at_finance_accounts ON public.finance_accounts;
CREATE TRIGGER set_updated_at_finance_accounts
  BEFORE UPDATE ON public.finance_accounts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_finance_budgets ON public.finance_budgets;
CREATE TRIGGER set_updated_at_finance_budgets
  BEFORE UPDATE ON public.finance_budgets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_finance_goals ON public.finance_goals;
CREATE TRIGGER set_updated_at_finance_goals
  BEFORE UPDATE ON public.finance_goals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
