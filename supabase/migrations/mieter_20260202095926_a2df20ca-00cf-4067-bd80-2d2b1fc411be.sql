-- User Subscriptions table for Stripe integration
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  app_id TEXT NOT NULL DEFAULT 'mieter',
  plan_id TEXT NOT NULL DEFAULT 'free',
  status TEXT DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint: Ein User kann pro App nur eine Subscription haben
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_app_subscription 
ON public.user_subscriptions(user_id, app_id);

-- RLS aktivieren
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: User sieht nur eigene Subscriptions
CREATE POLICY "Users can view own subscriptions" 
ON public.user_subscriptions
FOR SELECT USING (auth.uid() = user_id);

-- Policy: User kann eigene Subscription erstellen (für Free-Tier)
CREATE POLICY "Users can create own subscription" 
ON public.user_subscriptions
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION public.update_user_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_user_subscriptions_updated_at();