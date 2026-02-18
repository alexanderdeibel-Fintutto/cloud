-- Fix: Block unauthenticated access to profiles table (contains email addresses)
-- The existing policies check auth.uid() IS NOT NULL but we need an explicit deny for anon role

-- Create a restrictive policy that blocks unauthenticated SELECT on profiles
CREATE POLICY "Block unauthenticated access to profiles"
ON public.profiles
AS RESTRICTIVE
FOR SELECT
TO anon
USING (false);

-- Fix: Block unauthenticated access to leases table (contains financial data)
-- Create a restrictive policy that blocks unauthenticated SELECT on leases
CREATE POLICY "Block unauthenticated access to leases"
ON public.leases
AS RESTRICTIVE
FOR SELECT
TO anon
USING (false);

-- Also block INSERT, UPDATE, DELETE for anon role on these tables
CREATE POLICY "Block unauthenticated insert on profiles"
ON public.profiles
AS RESTRICTIVE
FOR INSERT
TO anon
WITH CHECK (false);

CREATE POLICY "Block unauthenticated update on profiles"
ON public.profiles
AS RESTRICTIVE
FOR UPDATE
TO anon
USING (false);

CREATE POLICY "Block unauthenticated insert on leases"
ON public.leases
AS RESTRICTIVE
FOR INSERT
TO anon
WITH CHECK (false);

CREATE POLICY "Block unauthenticated update on leases"
ON public.leases
AS RESTRICTIVE
FOR UPDATE
TO anon
USING (false);

CREATE POLICY "Block unauthenticated delete on leases"
ON public.leases
AS RESTRICTIVE
FOR DELETE
TO anon
USING (false);