-- Add UPDATE policy for user_subscriptions table
-- This allows users to update their own subscription records
-- The check-subscription edge function uses service role which bypasses RLS,
-- but this policy provides defense in depth and proper RLS coverage

CREATE POLICY "Users can update own subscription"
ON public.user_subscriptions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);