-- Fix cross-organization document access vulnerability
-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;

-- Create a new secure policy that restricts vermieter/admin to their own organization
CREATE POLICY "Users can view own documents"
ON public.documents
FOR SELECT
USING (
  user_id = auth.uid()
  OR (
    (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'vermieter'::app_role))
    AND organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  )
);