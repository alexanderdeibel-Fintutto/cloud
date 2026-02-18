
-- Referral tracking table
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_email TEXT,
  referred_user_id UUID,
  target_app_id TEXT NOT NULL,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  converted_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT referrals_status_check CHECK (status IN ('pending', 'clicked', 'registered', 'subscribed'))
);

-- Referral rewards / savings tracking
CREATE TABLE public.referral_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL DEFAULT 'discount',
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  description TEXT,
  is_redeemed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  redeemed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE UNIQUE INDEX idx_referrals_code ON public.referrals(referral_code);
CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referred ON public.referrals(referred_user_id);
CREATE INDEX idx_referral_rewards_user ON public.referral_rewards(user_id);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view their own referrals (sent or received)
CREATE POLICY "Users can view own referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

CREATE POLICY "Users can create referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Users can update own referrals"
  ON public.referrals FOR UPDATE
  USING (auth.uid() = referrer_id);

-- RLS: Users can view their own rewards
CREATE POLICY "Users can view own rewards"
  ON public.referral_rewards FOR SELECT
  USING (auth.uid() = user_id);

-- Service role will insert rewards, but allow user insert for self
CREATE POLICY "Users can insert own rewards"
  ON public.referral_rewards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to generate a unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code(p_user_id UUID, p_app_id TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
BEGIN
  -- Create a deterministic but short code from user_id + app_id
  v_code := 'FT-' || upper(substr(md5(p_user_id::text || p_app_id), 1, 6));
  RETURN v_code;
END;
$$;
