-- Add UPDATE policy for user_subscriptions (users can only update their own, but typically only via webhook)
-- This is a restrictive policy since most updates should come via service role from webhooks

-- Note: We don't allow users to directly modify subscriptions - 
-- they should use the Stripe Customer Portal instead.
-- However, we need policies to prevent unauthorized access.

-- For now, no UPDATE or DELETE policies for regular users
-- as all subscription management goes through Stripe webhooks with service role