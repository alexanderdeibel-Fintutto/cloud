-- 021_finance_coach.sql
-- Finance Coach: Persoenliche Finanzverwaltung mit KI-Coaching
-- Baut auf bestehenden banking_connections + banking_transactions auf

CREATE TABLE IF NOT EXISTS public.finance_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL DEFAULT 'checking', -- checking, savings, credit, investment
  bank_name TEXT,
  iban TEXT,
  balance NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  is_synced BOOLEAN DEFAULT false,
  bankin_connection_id TEXT,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_finance_accounts_user ON public.finance_accounts(user_id);
ALTER TABLE public.finance_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_accounts" ON public.finance_accounts FOR ALL USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.finance_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES public.finance_accounts(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inflow', 'outflow')),
  category TEXT,
  merchant TEXT,
  description TEXT,
  recurring BOOLEAN DEFAULT false,
  occurred_at DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_finance_tx_user_date ON public.finance_transactions(user_id, occurred_at);
ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_transactions" ON public.finance_transactions FOR ALL USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.finance_budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  monthly_limit NUMERIC NOT NULL,
  alert_threshold NUMERIC DEFAULT 0.8,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category)
);

ALTER TABLE public.finance_budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_budgets" ON public.finance_budgets FOR ALL USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.finance_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC DEFAULT 0,
  deadline DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'achieved', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.finance_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_goals" ON public.finance_goals FOR ALL USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.finance_ai_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  insight_type TEXT NOT NULL, -- spending_alert, savings_tip, forecast_warning, optimization
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  confidence NUMERIC,
  action_payload JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_finance_insights_user ON public.finance_ai_insights(user_id, created_at DESC);
ALTER TABLE public.finance_ai_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_insights" ON public.finance_ai_insights FOR ALL USING (user_id = auth.uid());

-- Materialized financial state per user (recomputed periodically)
CREATE TABLE IF NOT EXISTS public.financial_state (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  income_mean NUMERIC DEFAULT 0,
  income_volatility NUMERIC DEFAULT 0,
  expense_mean NUMERIC DEFAULT 0,
  expense_volatility NUMERIC DEFAULT 0,
  burn_rate NUMERIC DEFAULT 0,
  runway_days NUMERIC DEFAULT 0,
  savings_rate NUMERIC DEFAULT 0,
  liquidity_ratio NUMERIC DEFAULT 0,
  recurring_ratio NUMERIC DEFAULT 0,
  debt_ratio NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.financial_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_state" ON public.financial_state FOR ALL USING (user_id = auth.uid());
