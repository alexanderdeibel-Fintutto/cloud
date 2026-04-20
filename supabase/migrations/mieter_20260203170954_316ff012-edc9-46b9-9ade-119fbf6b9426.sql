-- Fix 1: Prevent users from self-verifying meter readings
-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Users can create meter readings" ON public.meter_readings;

-- Create new INSERT policy that prevents setting is_verified=true
CREATE POLICY "Users can create meter readings" 
ON public.meter_readings
FOR INSERT 
TO authenticated
WITH CHECK (
  user_id = auth.uid() 
  AND (is_verified IS NULL OR is_verified = false)
);

-- Add UPDATE policy for landlords/admins to verify readings
CREATE POLICY "Vermieter can verify meter readings"
ON public.meter_readings
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'vermieter'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'vermieter'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Fix 2: Create a view for organizations that hides sensitive Stripe data from non-admins
-- First, update the RLS policy to restrict stripe_customer_id access
DROP POLICY IF EXISTS "Users can view own organization" ON public.organizations;

-- Create restrictive policy - users can see org but sensitive fields handled via view
CREATE POLICY "Users can view own organization" 
ON public.organizations
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT organization_id 
    FROM profiles 
    WHERE user_id = auth.uid()
  )
);

-- Create a security definer function to get org details with conditional stripe data
CREATE OR REPLACE FUNCTION public.get_organization_details(org_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  type text,
  subscription_plan text,
  stripe_customer_id text,
  created_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.name,
    o.type,
    o.subscription_plan,
    CASE 
      WHEN has_role(auth.uid(), 'admin'::app_role) 
        OR has_role(auth.uid(), 'vermieter'::app_role)
      THEN o.stripe_customer_id
      ELSE NULL
    END as stripe_customer_id,
    o.created_at
  FROM organizations o
  WHERE o.id = org_id
    AND o.id IN (
      SELECT organization_id 
      FROM profiles 
      WHERE user_id = auth.uid()
    );
END;
$$;