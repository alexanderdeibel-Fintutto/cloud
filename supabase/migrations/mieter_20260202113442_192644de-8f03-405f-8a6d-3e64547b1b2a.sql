-- Fix documents RLS: Remove organization-wide access, only allow owner + admins
-- Drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;

-- Create new restrictive policy: only owner or admins can view
CREATE POLICY "Users can view own documents"
ON public.documents
FOR SELECT
USING (
  (user_id = auth.uid()) 
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'vermieter'::app_role)
);