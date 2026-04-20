-- Fix 1 & 2: Update profiles SELECT policy to restrict access
-- Only allow users to view their own profile, or admin/vermieter can view all org profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR (
    (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'vermieter'::app_role))
    AND organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  )
);

-- Fix 3: Ensure leases table policies explicitly require authentication
-- Current policies already use TO authenticated, but let's verify by recreating them
DROP POLICY IF EXISTS "Tenants can view own lease" ON public.leases;
DROP POLICY IF EXISTS "Vermieter can manage leases" ON public.leases;

-- Tenants can only view their own lease
CREATE POLICY "Tenants can view own lease"
ON public.leases
FOR SELECT
TO authenticated
USING (tenant_id = auth.uid());

-- Vermieter/admin can manage leases for their organization's buildings
CREATE POLICY "Vermieter can manage leases"
ON public.leases
FOR ALL
TO authenticated
USING (
  (EXISTS (
    SELECT 1
    FROM units u
    JOIN buildings b ON u.building_id = b.id
    WHERE u.id = leases.unit_id
    AND b.organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  ))
  AND (has_role(auth.uid(), 'vermieter'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);