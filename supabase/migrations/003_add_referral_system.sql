-- Migration: Add referral system tables
-- MVP Referral System for Bescheidboxer

-- Add referral_code column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.users(id);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS referral_credits INTEGER DEFAULT 0;

-- Create index for referral code lookups
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON public.users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON public.users(referred_by);

-- Referral status enum
DO $$ BEGIN
    CREATE TYPE referral_status AS ENUM ('pending', 'registered', 'converted');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Referrals tracking table
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    referrer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    referred_email TEXT NOT NULL,
    referred_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status referral_status DEFAULT 'pending',
    referral_code TEXT NOT NULL,
    reward_claimed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    converted_at TIMESTAMPTZ,
    UNIQUE(referrer_id, referred_email)
);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Referral policies
CREATE POLICY "Users can view own referrals" ON public.referrals
    FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "Users can create referrals" ON public.referrals
    FOR INSERT WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "System can update referrals" ON public.referrals
    FOR UPDATE USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

-- Indexes for referrals
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_email ON public.referrals(referred_email);
CREATE INDEX IF NOT EXISTS idx_referrals_referral_code ON public.referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);

-- Function to generate unique referral code for new users
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER AS $$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate a 8-char alphanumeric code
        new_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
        SELECT EXISTS(SELECT 1 FROM public.users WHERE referral_code = new_code) INTO code_exists;
        EXIT WHEN NOT code_exists;
    END LOOP;

    NEW.referral_code := new_code;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-generate referral code for new users
DROP TRIGGER IF EXISTS generate_user_referral_code ON public.users;
CREATE TRIGGER generate_user_referral_code
    BEFORE INSERT ON public.users
    FOR EACH ROW
    WHEN (NEW.referral_code IS NULL)
    EXECUTE FUNCTION public.generate_referral_code();

-- Function to process referral when a referred user signs up
CREATE OR REPLACE FUNCTION public.process_referral_signup()
RETURNS TRIGGER AS $$
DECLARE
    referrer_user_id UUID;
BEGIN
    -- Check if the new user was referred (referred_by is set)
    IF NEW.referred_by IS NOT NULL THEN
        -- Update the referral record
        UPDATE public.referrals
        SET status = 'registered',
            referred_user_id = NEW.id,
            converted_at = NOW()
        WHERE referrer_id = NEW.referred_by
          AND referred_email = NEW.email
          AND status = 'pending';

        -- Grant referral credit to the referrer
        UPDATE public.users
        SET referral_credits = referral_credits + 1
        WHERE id = NEW.referred_by;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for referral processing on user creation
DROP TRIGGER IF EXISTS on_referral_signup ON public.users;
CREATE TRIGGER on_referral_signup
    AFTER INSERT ON public.users
    FOR EACH ROW
    WHEN (NEW.referred_by IS NOT NULL)
    EXECUTE FUNCTION public.process_referral_signup();
