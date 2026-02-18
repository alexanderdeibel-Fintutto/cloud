-- Fintutto Referral System
-- Tracks referral codes, invitations, signups, and rewards across all apps

-- Referral codes table (one per user)
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  CONSTRAINT referral_codes_user_unique UNIQUE (user_id)
);

-- Referral invitations tracking
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL REFERENCES public.referral_codes(code) ON DELETE CASCADE,
  referred_email TEXT,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  app_id TEXT NOT NULL, -- portal, vermietify, mieter, hausmeister, ablesung, bescheidboxer
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'signed_up', 'subscribed')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  signed_up_at TIMESTAMPTZ,
  subscribed_at TIMESTAMPTZ
);

-- Referral rewards tracking
CREATE TABLE IF NOT EXISTS public.referral_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('credits', 'discount', 'free_month')),
  reward_value INTEGER NOT NULL, -- credits amount, discount percentage, or months
  description TEXT NOT NULL,
  is_claimed BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  claimed_at TIMESTAMPTZ
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_referral_codes_user ON public.referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON public.referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_user ON public.referral_rewards(user_id);

-- RLS Policies
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

-- Users can read their own referral code
CREATE POLICY "Users can view own referral code"
  ON public.referral_codes FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own referral code
CREATE POLICY "Users can create own referral code"
  ON public.referral_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can see referrals they sent
CREATE POLICY "Users can view own referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);

-- Users can create referral invitations
CREATE POLICY "Users can create referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (auth.uid() = referrer_user_id);

-- Users can view their own rewards
CREATE POLICY "Users can view own rewards"
  ON public.referral_rewards FOR SELECT
  USING (auth.uid() = user_id);

-- Function to auto-generate referral code on user signup
CREATE OR REPLACE FUNCTION public.create_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.referral_codes (user_id, code)
  VALUES (NEW.id, 'FT-' || UPPER(SUBSTRING(NEW.id::TEXT, 1, 8)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: auto-create referral code when user signs up
DROP TRIGGER IF EXISTS on_user_created_referral ON auth.users;
CREATE TRIGGER on_user_created_referral
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_referral_code();

-- Function to process a referral signup (called when referred user signs up)
CREATE OR REPLACE FUNCTION public.process_referral_signup(
  p_referral_code TEXT,
  p_referred_user_id UUID,
  p_app_id TEXT
)
RETURNS UUID AS $$
DECLARE
  v_referral_id UUID;
  v_referrer_user_id UUID;
BEGIN
  -- Find the referrer
  SELECT user_id INTO v_referrer_user_id
  FROM public.referral_codes
  WHERE code = p_referral_code AND is_active = true;

  IF v_referrer_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Update or create referral record
  INSERT INTO public.referrals (referrer_user_id, referral_code, referred_user_id, app_id, status, signed_up_at)
  VALUES (v_referrer_user_id, p_referral_code, p_referred_user_id, p_app_id, 'signed_up', now())
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_referral_id;

  IF v_referral_id IS NOT NULL THEN
    -- Reward referrer: +5 credits
    INSERT INTO public.referral_rewards (user_id, referral_id, reward_type, reward_value, description)
    VALUES (v_referrer_user_id, v_referral_id, 'credits', 5, 'Referral-Bonus: Anmeldung');

    -- Reward referred user: +5 credits (bonus on top of free 3)
    INSERT INTO public.referral_rewards (user_id, referral_id, reward_type, reward_value, description)
    VALUES (p_referred_user_id, v_referral_id, 'credits', 5, 'Willkommens-Bonus: Einladung');
  END IF;

  RETURN v_referral_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
