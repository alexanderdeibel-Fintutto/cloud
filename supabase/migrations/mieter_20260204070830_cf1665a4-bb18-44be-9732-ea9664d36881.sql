-- Fix 1: Ensure profiles table denies anonymous access and only allows authenticated users
-- The current policy uses RESTRICTIVE but doesn't explicitly require authentication

-- First, let's ensure the grants are correct - revoke any anon access
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.profiles_safe FROM anon;
REVOKE ALL ON public.leases FROM anon;

-- Grant only to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles_safe TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leases TO authenticated;

-- Fix 2: Update leases policies to be more restrictive and clear
-- Drop existing policies and recreate with better structure
DROP POLICY IF EXISTS "Tenants can view own lease" ON public.leases;
DROP POLICY IF EXISTS "Vermieter can manage leases" ON public.leases;

-- Tenants can only view their own lease
CREATE POLICY "Tenants can view own lease"
ON public.leases FOR SELECT
TO authenticated
USING (tenant_id = auth.uid());

-- Vermieter/Admins can manage leases for units in their org buildings
CREATE POLICY "Vermieter can manage leases"
ON public.leases FOR ALL
TO authenticated
USING (
  (has_role(auth.uid(), 'vermieter'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  AND EXISTS (
    SELECT 1
    FROM units u
    JOIN buildings b ON u.building_id = b.id
    WHERE u.id = leases.unit_id
    AND b.organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  )
);

-- Fix 3: Update profiles policies to be explicit about authentication
DROP POLICY IF EXISTS "Users can view own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Users can only view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can create their own profile
CREATE POLICY "Users can create own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid());