-- Fix onboarding_progress table: add missing boolean columns
-- The OnboardingWizardPage expects these specific columns

-- Create table if not exists
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_completed boolean DEFAULT false,
  first_building_created boolean DEFAULT false,
  first_unit_created boolean DEFAULT false,
  first_tenant_created boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Add missing columns if table already exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'onboarding_progress' AND column_name = 'profile_completed') THEN
    ALTER TABLE public.onboarding_progress ADD COLUMN profile_completed boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'onboarding_progress' AND column_name = 'first_building_created') THEN
    ALTER TABLE public.onboarding_progress ADD COLUMN first_building_created boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'onboarding_progress' AND column_name = 'first_unit_created') THEN
    ALTER TABLE public.onboarding_progress ADD COLUMN first_unit_created boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'onboarding_progress' AND column_name = 'first_tenant_created') THEN
    ALTER TABLE public.onboarding_progress ADD COLUMN first_tenant_created boolean DEFAULT false;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own onboarding_progress" ON public.onboarding_progress;
DROP POLICY IF EXISTS "Users can insert own onboarding_progress" ON public.onboarding_progress;
DROP POLICY IF EXISTS "Users can update own onboarding_progress" ON public.onboarding_progress;

CREATE POLICY "Users can view own onboarding_progress"
  ON public.onboarding_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding_progress"
  ON public.onboarding_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding_progress"
  ON public.onboarding_progress FOR UPDATE
  USING (auth.uid() = user_id);
