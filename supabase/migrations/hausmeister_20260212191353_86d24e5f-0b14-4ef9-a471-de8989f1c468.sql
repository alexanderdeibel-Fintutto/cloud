
-- Block anonymous access on companies
CREATE POLICY "Block anonymous access"
ON public.companies
FOR SELECT
TO anon
USING (false);

-- Block anonymous access on units
CREATE POLICY "Block anonymous access"
ON public.units
FOR SELECT
TO anon
USING (false);

-- Block anonymous access on user_subscriptions
CREATE POLICY "Block anonymous access"
ON public.user_subscriptions
FOR SELECT
TO anon
USING (false);
