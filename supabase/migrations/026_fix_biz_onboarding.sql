-- 026_fix_biz_onboarding.sql
-- Fix: Users could not create a business because public.users has RLS
-- enabled with no INSERT policy. The handle_new_user trigger uses
-- SECURITY DEFINER so it bypasses RLS, but client-side inserts fail.
--
-- Solution:
-- 1. Add INSERT policy on public.users so authenticated users can create their own row
-- 2. Add a SECURITY DEFINER RPC function for reliable business creation
--    that ensures the public.users row exists before inserting into biz_businesses

-- Allow authenticated users to insert their own row into public.users
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RPC function: create a business for the current user
-- Uses SECURITY DEFINER to bypass RLS, ensuring the public.users FK target exists
CREATE OR REPLACE FUNCTION public.create_biz_business(
  p_name TEXT,
  p_business_type TEXT DEFAULT 'freelancer',
  p_tax_id TEXT DEFAULT NULL,
  p_vat_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_business RECORD;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Nicht authentifiziert');
  END IF;

  -- Get email from auth.users
  SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;

  -- Ensure public.users row exists (FK target for biz_businesses)
  INSERT INTO public.users (id, email, name, tier, checks_used, checks_limit)
  VALUES (v_user_id, COALESCE(v_user_email, ''), '', 'free', 0, 3)
  ON CONFLICT (id) DO NOTHING;

  -- Check if business already exists
  IF EXISTS (SELECT 1 FROM public.biz_businesses WHERE owner_id = v_user_id) THEN
    SELECT * INTO v_business FROM public.biz_businesses WHERE owner_id = v_user_id LIMIT 1;
    RETURN to_jsonb(v_business);
  END IF;

  -- Create the business
  INSERT INTO public.biz_businesses (owner_id, name, business_type, tax_id, vat_id)
  VALUES (v_user_id, p_name, p_business_type, p_tax_id, p_vat_id)
  RETURNING * INTO v_business;

  RETURN to_jsonb(v_business);
END;
$$;
