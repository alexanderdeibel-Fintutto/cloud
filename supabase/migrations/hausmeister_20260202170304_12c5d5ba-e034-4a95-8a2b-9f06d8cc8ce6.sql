-- Fix RLS policies for user_subscriptions table
-- Subscriptions should only be modified by service role (edge functions/webhooks)
-- Users should only be able to READ their own subscriptions

-- Drop the existing INSERT policy that allows users to create subscriptions
-- This is a security risk as users could create fake premium subscriptions
DROP POLICY IF EXISTS "Users can create own subscription" ON public.user_subscriptions;

-- Keep the SELECT policy - users can view their own subscriptions
-- (Already exists: "Users can view own subscriptions")

-- Add a comment to document the security design
COMMENT ON TABLE public.user_subscriptions IS 'Subscription data managed by edge functions only. Users can read but not write. Service role bypasses RLS for webhook/edge function writes.';