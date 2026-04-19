-- Drop the view as it cannot properly inherit RLS protection
-- The application uses edge functions (service role) to access subscription data
-- Direct table access is already protected by RLS on user_subscriptions
DROP VIEW IF EXISTS public.user_subscriptions_safe;