
-- Referral Rewards System
-- Tracks successful referrals (abo purchases) and rewards

CREATE TABLE public.referral_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_user_id UUID NOT NULL, -- the user who invited
  referred_user_id UUID NOT NULL, -- the user who was invited
  referral_code TEXT NOT NULL,
  reward_type TEXT NOT NULL DEFAULT 'credits', -- 'credits', 'pro_trial'
  reward_amount INTEGER NOT NULL DEFAULT 2, -- credits amount or days
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'granted', 'expired'
  granted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(referred_user_id) -- each referred user can only count once
);

-- Track which referral code was used during registration
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by TEXT;

ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

-- Referrers can view their own rewards
CREATE POLICY "Users can view own referral rewards"
  ON public.referral_rewards FOR SELECT
  TO authenticated
  USING (referrer_user_id = auth.uid() OR referred_user_id = auth.uid());

-- Only service role inserts (via edge function)
REVOKE ALL ON public.referral_rewards FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.referral_rewards FROM authenticated;
