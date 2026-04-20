-- Fix: Remove UPDATE policy from user_subscriptions table
-- Users should not be able to modify subscription records directly
-- Only the check-subscription edge function (using service role key) should update these records

-- Drop the existing UPDATE policy that allows users to modify their own subscriptions
DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.user_subscriptions;

-- Note: INSERT policy remains so users can have initial records created
-- Note: SELECT policy remains so users can view their subscription status
-- All subscription updates should now only happen via the check-subscription edge function with service role key