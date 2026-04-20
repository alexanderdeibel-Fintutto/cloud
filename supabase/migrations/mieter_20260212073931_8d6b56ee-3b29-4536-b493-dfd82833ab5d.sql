
-- Credits System für Fintutto Ökosystem

-- 1. User Credits Balance
CREATE TABLE public.user_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  balance INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 2. Credit Transactions (Audit Log)
CREATE TABLE public.credit_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL, -- positive = earned, negative = spent
  balance_after INTEGER NOT NULL,
  transaction_type TEXT NOT NULL, -- 'purchase', 'subscription_grant', 'tool_usage', 'refund', 'bonus'
  tool_type TEXT, -- 'checker', 'formular', 'rechner'
  tool_id TEXT, -- e.g. 'mietpreisbremse', 'maengelanzeige'
  stripe_payment_id TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Tool Access Log (which tools were used)
CREATE TABLE public.tool_usage_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tool_type TEXT NOT NULL, -- 'checker', 'formular', 'rechner'
  tool_id TEXT NOT NULL, -- e.g. 'mietpreisbremse'
  credits_cost INTEGER NOT NULL DEFAULT 1,
  access_method TEXT NOT NULL DEFAULT 'credit', -- 'credit', 'subscription', 'free'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_usage_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies: user_credits
CREATE POLICY "Users can view own credits"
  ON public.user_credits FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own credits"
  ON public.user_credits FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own credits"
  ON public.user_credits FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies: credit_transactions
CREATE POLICY "Users can view own transactions"
  ON public.credit_transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own transactions"
  ON public.credit_transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies: tool_usage_log
CREATE POLICY "Users can view own tool usage"
  ON public.tool_usage_log FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can log own tool usage"
  ON public.tool_usage_log FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Update trigger for user_credits
CREATE OR REPLACE FUNCTION public.update_user_credits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_credits_updated_at();

-- Revoke anon access
REVOKE ALL ON public.user_credits FROM anon;
REVOKE ALL ON public.credit_transactions FROM anon;
REVOKE ALL ON public.tool_usage_log FROM anon;
