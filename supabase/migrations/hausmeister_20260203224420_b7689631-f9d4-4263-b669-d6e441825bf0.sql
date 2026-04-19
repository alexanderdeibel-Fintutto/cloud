-- Create a secure view that excludes sensitive Stripe identifiers
-- With security_invoker=on, the view inherits RLS from the base table
CREATE VIEW public.user_subscriptions_safe
WITH (security_invoker=on) AS
SELECT 
  id,
  user_id,
  app_id,
  plan_id,
  status,
  current_period_start,
  current_period_end,
  cancel_at_period_end,
  created_at,
  updated_at
FROM public.user_subscriptions;
-- Note: stripe_customer_id and stripe_subscription_id are intentionally excluded

-- Grant SELECT on the view to authenticated users
GRANT SELECT ON public.user_subscriptions_safe TO authenticated;

-- The existing RLS policy "Users can view own subscriptions" on user_subscriptions
-- will be inherited by the view, so users can only see their own records
-- The base table retains full columns for edge functions (using service role)