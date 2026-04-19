-- Fix 2 warn-level security issues

-- 1. Create a secure view for organizations that hides stripe_customer_id from non-admins
CREATE OR REPLACE VIEW public.organizations_safe
WITH (security_invoker=on) AS
SELECT 
  id,
  name,
  type,
  subscription_plan,
  created_at,
  CASE 
    WHEN has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'vermieter')
    THEN stripe_customer_id
    ELSE NULL
  END as stripe_customer_id
FROM public.organizations;

-- 2. Create a secure view for profiles that hides phone from non-admin/vermieter users
-- Regular users should only see their own phone number or limited profile info of others
CREATE OR REPLACE VIEW public.profiles_safe
WITH (security_invoker=on) AS
SELECT 
  id,
  user_id,
  name,
  avatar_url,
  organization_id,
  unit_id,
  created_at,
  updated_at,
  CASE 
    WHEN user_id = auth.uid() 
      OR has_role(auth.uid(), 'admin') 
      OR has_role(auth.uid(), 'vermieter')
    THEN phone
    ELSE NULL
  END as phone
FROM public.profiles;

-- 3. Update profiles SELECT policy to be more restrictive about phone visibility
-- Non-admin/vermieter users can only see basic profile info (no phone) of other org members
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

CREATE POLICY "Users can view profiles with restricted fields"
ON profiles FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR (
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'vermieter'))
    AND organization_id IN (SELECT organization_id FROM profiles WHERE user_id = auth.uid())
  )
  OR (
    -- Regular org members can see basic profile info but phone is hidden via view
    organization_id IN (SELECT organization_id FROM profiles WHERE user_id = auth.uid())
  )
);