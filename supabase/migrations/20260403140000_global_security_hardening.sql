-- =====================================================================================
-- GLOBAL SECURITY HARDENING MIGRATION (TRANSLATOR & PORTAL)
-- Fixes for permissive policies, missing RLS, and user_metadata usage
-- =====================================================================================

-- 1. ENABLE RLS ON ALL REMAINING TABLES
-- -------------------------------------------------------------------------------------
-- Translator tables
ALTER TABLE IF EXISTS public.gt_stripe_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.fw_email_templates ENABLE ROW LEVEL SECURITY;

-- Portal tables
ALTER TABLE IF EXISTS public.amt_ai_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ft_kdu_tabellen ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.feature_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.api_usage_logs ENABLE ROW LEVEL SECURITY;

-- Add basic policies for these tables
CREATE POLICY "Service role can manage stripe events" ON public.gt_stripe_events FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Public can read email templates" ON public.fw_email_templates FOR SELECT USING (true);
CREATE POLICY "Service role can manage email templates" ON public.fw_email_templates FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage ai cache" ON public.amt_ai_cache FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Public can read kdu tabellen" ON public.ft_kdu_tabellen FOR SELECT USING (true);
CREATE POLICY "Public can read feature registry" ON public.feature_registry FOR SELECT USING (true);
CREATE POLICY "Service role can manage api logs" ON public.api_usage_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 2. FIX PERMISSIVE INSERT POLICIES (WITH CHECK true)
-- -------------------------------------------------------------------------------------
-- Many tables had "Public insert" policies that allowed anyone to insert data.
-- We restrict these to authenticated users or service_role where appropriate.

-- Contact Requests (should be allowed for anon, but maybe rate limited in app)
-- Keeping this as is, as it's a public contact form.

-- Audit Log (should only be written by service_role or functions)
DROP POLICY IF EXISTS "System insert audit" ON public.ag_audit_log;
CREATE POLICY "System insert audit" ON public.ag_audit_log FOR INSERT TO service_role WITH CHECK (true);

-- Notifications (should only be written by service_role or functions)
DROP POLICY IF EXISTS "System insert notifications" ON public.fw_notifications;
CREATE POLICY "System insert notifications" ON public.fw_notifications FOR INSERT TO service_role WITH CHECK (true);

-- Onboarding Email Log
DROP POLICY IF EXISTS "onboarding_email_insert_service" ON public.onboarding_email_log;
CREATE POLICY "onboarding_email_insert_service" ON public.onboarding_email_log FOR INSERT TO service_role WITH CHECK (true);

-- 3. FIX USER_METADATA IN POLICIES
-- -------------------------------------------------------------------------------------
-- The agent report correctly identified that team_phrases and conversation_logs 
-- use auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'.
-- While this works, it's safer to use a dedicated role table or the existing 
-- auth.jwt() ->> 'role' (app_role) claim.

-- Fix team_phrases
DROP POLICY IF EXISTS "team_phrases_admin_update" ON public.team_phrases;
CREATE POLICY "team_phrases_admin_update" ON public.team_phrases FOR UPDATE TO authenticated
USING (
  (auth.jwt() ->> 'role' = 'admin') OR 
  EXISTS (SELECT 1 FROM public.gt_users WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "team_phrases_admin_delete" ON public.team_phrases;
CREATE POLICY "team_phrases_admin_delete" ON public.team_phrases FOR DELETE TO authenticated
USING (
  (auth.jwt() ->> 'role' = 'admin') OR 
  EXISTS (SELECT 1 FROM public.gt_users WHERE id = auth.uid() AND role = 'admin')
);

-- Fix conversation_logs
DROP POLICY IF EXISTS "conv_logs_admin_read" ON public.conversation_logs;
CREATE POLICY "conv_logs_admin_read" ON public.conversation_logs FOR SELECT TO authenticated
USING (
  team_id IS NOT NULL AND
  (
    (auth.jwt() ->> 'role' = 'admin') OR 
    EXISTS (SELECT 1 FROM public.gt_users WHERE id = auth.uid() AND role = 'admin')
  )
);

-- 4. FIX SECURITY DEFINER FUNCTIONS WITHOUT SEARCH_PATH
-- -------------------------------------------------------------------------------------
-- We alter the most critical functions to include SET search_path = public

ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.ag_check_permission(UUID, UUID, TEXT) SET search_path = public;
ALTER FUNCTION public.fw_check_permission(UUID, UUID, TEXT) SET search_path = public;
ALTER FUNCTION public.fw_generate_invite_code() SET search_path = public;
ALTER FUNCTION public.accept_museum_invite(TEXT, UUID) SET search_path = public;

