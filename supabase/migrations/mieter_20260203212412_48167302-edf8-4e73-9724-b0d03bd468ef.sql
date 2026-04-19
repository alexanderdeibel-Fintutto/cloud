-- Fix: Restrict direct profiles table access to hide phone from non-owners/non-admins
-- Organization members should use profiles_safe view which masks sensitive fields

-- Drop the overly permissive policy that exposes phone to all org members
DROP POLICY IF EXISTS "Users can view profiles with restricted fields" ON public.profiles;

-- Create more restrictive policies:
-- 1. Users can always view their own full profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (user_id = auth.uid());

-- 2. Admins and vermieter can view full profiles in their organization
CREATE POLICY "Admins can view org profiles"
ON public.profiles
FOR SELECT
USING (
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'vermieter'::app_role))
  AND organization_id IN (
    SELECT organization_id FROM profiles WHERE user_id = auth.uid()
  )
);

-- Note: Regular organization members should use profiles_safe view
-- The profiles_safe view already masks phone for non-owners/non-admins