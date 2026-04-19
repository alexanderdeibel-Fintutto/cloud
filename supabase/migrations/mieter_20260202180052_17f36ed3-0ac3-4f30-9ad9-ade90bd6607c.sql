-- Fix anonymous access vulnerability for profiles, messages, and user_roles tables
-- These tables use RESTRICTIVE policies but need explicit authentication requirements

-- 1. Fix profiles table - require authentication for all SELECT operations
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 2. Fix messages table - require authentication for all SELECT operations  
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;

CREATE POLICY "Users can view own messages"
ON public.messages
FOR SELECT
TO authenticated
USING ((sender_id = auth.uid()) OR (recipient_id = auth.uid()));

-- 3. Fix user_roles table - require authentication for all SELECT operations
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());