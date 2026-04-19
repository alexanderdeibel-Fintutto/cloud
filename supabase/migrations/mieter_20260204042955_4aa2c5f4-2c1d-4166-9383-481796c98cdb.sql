-- Fix 1: Restrict profiles table SELECT to prevent phone number exposure to other tenants
-- Regular users can only see their own profile, admins/vermieter can see org profiles

DROP POLICY IF EXISTS "Admins can view org profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Users can only view their own profile directly
CREATE POLICY "Users can view own profile only"
ON public.profiles FOR SELECT
USING (user_id = auth.uid());

-- Admins and vermieter should use the profiles_safe view for org member lookup
-- This ensures phone numbers are not exposed

-- Fix 2: Restrict organizations table SELECT to prevent stripe_customer_id exposure
-- Only admins should see sensitive billing data

DROP POLICY IF EXISTS "Users can view own organization" ON public.organizations;
DROP POLICY IF EXISTS "Users can view their organization basics" ON public.organizations;

-- Regular users cannot SELECT directly from organizations table - they must use organizations_safe view
CREATE POLICY "Only admins can view full organization data"
ON public.organizations FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create a policy for the safe view to work with security_invoker
-- The organizations_safe view already excludes stripe_customer_id for non-admins

-- Ensure both safe views have proper security_invoker setting
DROP VIEW IF EXISTS public.organizations_safe;
CREATE VIEW public.organizations_safe 
WITH (security_invoker = on) AS
SELECT 
  id,
  name,
  type,
  subscription_plan,
  created_at,
  CASE 
    WHEN has_role(auth.uid(), 'admin'::app_role) THEN stripe_customer_id
    ELSE NULL
  END as stripe_customer_id
FROM public.organizations
WHERE id IN (
  SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
);

-- Ensure profiles_safe view exists with security_invoker and hides phone from non-privileged users  
DROP VIEW IF EXISTS public.profiles_safe;
CREATE VIEW public.profiles_safe
WITH (security_invoker = on) AS
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
      OR has_role(auth.uid(), 'admin'::app_role) 
      OR has_role(auth.uid(), 'vermieter'::app_role) 
    THEN phone
    ELSE NULL
  END as phone
FROM public.profiles
WHERE 
  user_id = auth.uid()
  OR (
    (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'vermieter'::app_role))
    AND organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid())
  );