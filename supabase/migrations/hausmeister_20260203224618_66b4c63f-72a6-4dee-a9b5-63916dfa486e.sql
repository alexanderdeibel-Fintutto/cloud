-- Revoke public/anonymous access to the view
REVOKE ALL ON public.user_subscriptions_safe FROM anon;
REVOKE ALL ON public.user_subscriptions_safe FROM public;

-- Ensure only authenticated users can access the view
GRANT SELECT ON public.user_subscriptions_safe TO authenticated;