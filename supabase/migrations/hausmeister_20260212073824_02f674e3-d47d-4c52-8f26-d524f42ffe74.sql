
-- Referral Codes: Each user gets a unique code per app
CREATE TABLE public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  app_id TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  stripe_coupon_id TEXT,
  stripe_promotion_code_id TEXT,
  discount_percent INTEGER DEFAULT 20,
  uses_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup by code
CREATE INDEX idx_referral_codes_code ON public.referral_codes (code);
CREATE INDEX idx_referral_codes_user_app ON public.referral_codes (user_id, app_id);

-- Referral Conversions: Track who signed up via referral
CREATE TABLE public.referral_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id UUID NOT NULL REFERENCES public.referral_codes(id),
  referred_user_id UUID,
  referred_email TEXT,
  app_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'clicked',
  amount_saved DECIMAL(10,2) DEFAULT 0,
  stripe_subscription_id TEXT,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_referral_conversions_code ON public.referral_conversions (referral_code_id);
CREATE INDEX idx_referral_conversions_user ON public.referral_conversions (referred_user_id);

-- Enable RLS
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_conversions ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view and manage their own referral codes
CREATE POLICY "Users can view own referral codes"
  ON public.referral_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own referral codes"
  ON public.referral_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own referral codes"
  ON public.referral_codes FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS: Users can view conversions on their codes
CREATE POLICY "Users can view own referral conversions"
  ON public.referral_conversions FOR SELECT
  USING (referral_code_id IN (
    SELECT id FROM public.referral_codes WHERE user_id = auth.uid()
  ));

-- Public insert for conversion tracking (when new user signs up via referral link)
CREATE POLICY "Anyone can create conversion tracking"
  ON public.referral_conversions FOR INSERT
  WITH CHECK (true);

-- Trigger to update uses_count
CREATE OR REPLACE FUNCTION public.increment_referral_uses()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.referral_codes
  SET uses_count = uses_count + 1, updated_at = now()
  WHERE id = NEW.referral_code_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_referral_conversion_insert
  AFTER INSERT ON public.referral_conversions
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_referral_uses();
