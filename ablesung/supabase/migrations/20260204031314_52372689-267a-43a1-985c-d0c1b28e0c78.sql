-- Revert to simple, secure SELECT policy  
DROP POLICY IF EXISTS "Users can view own organization" ON public.organizations;

CREATE POLICY "Users can view own organization"
ON public.organizations
FOR SELECT
TO authenticated
USING (id = get_user_org_id(auth.uid()));