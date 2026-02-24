
-- Fix RLS policy: Change from RESTRICTIVE to PERMISSIVE
-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can create readings for accessible meters" ON public.meter_readings;

-- Create as PERMISSIVE policy (default)
CREATE POLICY "Users can create readings for accessible meters" 
ON public.meter_readings 
FOR INSERT 
TO authenticated
WITH CHECK (user_can_access_meter(meter_id));
