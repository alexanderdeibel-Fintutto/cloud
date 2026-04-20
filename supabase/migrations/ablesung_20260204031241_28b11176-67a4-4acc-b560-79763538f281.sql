-- Drop and recreate SELECT policy to allow viewing newly created organization
DROP POLICY IF EXISTS "Users can view own organization" ON public.organizations;

CREATE POLICY "Users can view own organization"
ON public.organizations
FOR SELECT
TO authenticated
USING (
  id = get_user_org_id(auth.uid()) 
  OR id IN (
    SELECT o.id FROM public.organizations o 
    WHERE NOT EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.organization_id IS NOT NULL AND p.id = auth.uid()
    )
    -- Allow seeing recently created orgs when user has no org yet (for the INSERT...SELECT flow)
  )
);