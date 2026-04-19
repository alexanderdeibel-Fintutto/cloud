-- Fix messages table security: Ensure policies apply only to authenticated users
-- Drop existing SELECT policy and recreate with explicit authentication requirement
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can mark messages as read" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to org members" ON public.messages;

-- Recreate SELECT policy for authenticated users only
CREATE POLICY "Authenticated users can view own messages" 
ON public.messages 
FOR SELECT 
TO authenticated
USING ((sender_id = auth.uid()) OR (recipient_id = auth.uid()));

-- Recreate UPDATE policy for authenticated users only  
CREATE POLICY "Authenticated users can mark messages as read" 
ON public.messages 
FOR UPDATE 
TO authenticated
USING (recipient_id = auth.uid());

-- Recreate INSERT policy for authenticated users only
CREATE POLICY "Authenticated users can send messages to org members" 
ON public.messages 
FOR INSERT 
TO authenticated
WITH CHECK (
  (sender_id = auth.uid()) 
  AND (recipient_id IN (
    SELECT p.user_id
    FROM profiles p
    WHERE p.organization_id IN (
      SELECT profiles.organization_id
      FROM profiles
      WHERE profiles.user_id = auth.uid()
    )
  ))
);