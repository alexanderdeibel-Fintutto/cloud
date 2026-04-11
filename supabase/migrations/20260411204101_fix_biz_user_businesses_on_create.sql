-- 20260411204101_fix_biz_user_businesses_on_create.sql
-- Fix: create_biz_business RPC did not insert into biz_user_businesses.
-- After migration 027 (multi-company), get_user_businesses() reads from
-- biz_user_businesses. Users who created a business via the RPC after 027
-- was deployed had a biz_businesses row but no biz_user_businesses row,
-- causing get_user_businesses() to return an empty list → no data shown.
--
-- Solution:
-- 1. Update create_biz_business to also insert into biz_user_businesses
-- 2. Backfill missing biz_user_businesses rows for existing owners

-- ============================================================
-- 1. BACKFILL: Ensure every business owner has a biz_user_businesses row
-- ============================================================
INSERT INTO public.biz_user_businesses (user_id, business_id, role)
SELECT b.owner_id, b.id, 'owner'
FROM public.biz_businesses b
WHERE NOT EXISTS (
  SELECT 1 FROM public.biz_user_businesses ub
  WHERE ub.user_id = b.owner_id AND ub.business_id = b.id
)
ON CONFLICT (user_id, business_id) DO NOTHING;

-- ============================================================
-- 2. UPDATE create_biz_business RPC to also create biz_user_businesses row
-- ============================================================
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
    -- Ensure biz_user_businesses row exists (backfill for pre-027 businesses)
    INSERT INTO public.biz_user_businesses (user_id, business_id, role)
    VALUES (v_user_id, v_business.id, 'owner')
    ON CONFLICT (user_id, business_id) DO NOTHING;
    RETURN to_jsonb(v_business);
  END IF;

  -- Create the business
  INSERT INTO public.biz_businesses (owner_id, name, business_type, tax_id, vat_id)
  VALUES (v_user_id, p_name, p_business_type, p_tax_id, p_vat_id)
  RETURNING * INTO v_business;

  -- Always create biz_user_businesses entry for the owner
  INSERT INTO public.biz_user_businesses (user_id, business_id, role)
  VALUES (v_user_id, v_business.id, 'owner')
  ON CONFLICT (user_id, business_id) DO NOTHING;

  RETURN to_jsonb(v_business);
END;
$$;
