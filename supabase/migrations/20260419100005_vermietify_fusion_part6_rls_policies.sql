-- ============================================================
-- VERMIETIFY FUSION: Part 6 – RLS Policies
-- Sicherheitsregeln für alle neuen Tabellen
-- Datum: 2026-04-19
-- ============================================================

-- Hilfsfunktion: Gibt die organization_id des aktuellen Nutzers zurück
CREATE OR REPLACE FUNCTION get_user_organization_id(p_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT organization_id
  FROM public.profiles
  WHERE id = p_user_id
  LIMIT 1;
$$;

-- ---- BUILDINGS ----
DROP POLICY IF EXISTS "Users can view buildings in their org" ON public.buildings;
CREATE POLICY "Users can view buildings in their org"
  ON public.buildings FOR SELECT
  USING (organization_id = get_user_organization_id(auth.uid()));

DROP POLICY IF EXISTS "Users can manage buildings in their org" ON public.buildings;
CREATE POLICY "Users can manage buildings in their org"
  ON public.buildings FOR ALL
  USING (organization_id = get_user_organization_id(auth.uid()));

-- ---- LEASES ----
DROP POLICY IF EXISTS "Users can view leases in their org" ON public.leases;
CREATE POLICY "Users can view leases in their org"
  ON public.leases FOR SELECT
  USING (unit_id IN (
    SELECT u.id FROM public.units u
    JOIN public.buildings b ON u.building_id = b.id
    WHERE b.organization_id = get_user_organization_id(auth.uid())
  ));

DROP POLICY IF EXISTS "Users can manage leases in their org" ON public.leases;
CREATE POLICY "Users can manage leases in their org"
  ON public.leases FOR ALL
  USING (unit_id IN (
    SELECT u.id FROM public.units u
    JOIN public.buildings b ON u.building_id = b.id
    WHERE b.organization_id = get_user_organization_id(auth.uid())
  ));

-- ---- TRANSACTIONS ----
DROP POLICY IF EXISTS "Users can view transactions in their org" ON public.transactions;
CREATE POLICY "Users can view transactions in their org"
  ON public.transactions FOR SELECT
  USING (organization_id = get_user_organization_id(auth.uid()));

DROP POLICY IF EXISTS "Users can manage transactions in their org" ON public.transactions;
CREATE POLICY "Users can manage transactions in their org"
  ON public.transactions FOR ALL
  USING (organization_id = get_user_organization_id(auth.uid()));

-- ---- BANK_TRANSACTIONS ----
DROP POLICY IF EXISTS "Users can view bank transactions in their org" ON public.bank_transactions;
CREATE POLICY "Users can view bank transactions in their org"
  ON public.bank_transactions FOR SELECT
  USING (organization_id = get_user_organization_id(auth.uid()));

DROP POLICY IF EXISTS "Users can manage bank transactions in their org" ON public.bank_transactions;
CREATE POLICY "Users can manage bank transactions in their org"
  ON public.bank_transactions FOR ALL
  USING (organization_id = get_user_organization_id(auth.uid()));

-- ---- MESSAGES ----
DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;
CREATE POLICY "Users can view their messages"
  ON public.messages FOR SELECT
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

-- ---- NOTIFICATIONS ----
DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;
CREATE POLICY "Users can view their notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;
CREATE POLICY "Users can update their notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

-- ---- ONBOARDING_PROGRESS ----
DROP POLICY IF EXISTS "Users can manage their onboarding" ON public.onboarding_progress;
CREATE POLICY "Users can manage their onboarding"
  ON public.onboarding_progress FOR ALL
  USING (user_id = auth.uid());

-- ---- HANDOVER_PROTOCOLS ----
DROP POLICY IF EXISTS "Users can view handovers in their org" ON public.handover_protocols;
CREATE POLICY "Users can view handovers in their org"
  ON public.handover_protocols FOR SELECT
  USING (unit_id IN (
    SELECT u.id FROM public.units u
    JOIN public.buildings b ON u.building_id = b.id
    WHERE b.organization_id = get_user_organization_id(auth.uid())
  ));

DROP POLICY IF EXISTS "Users can manage handovers in their org" ON public.handover_protocols;
CREATE POLICY "Users can manage handovers in their org"
  ON public.handover_protocols FOR ALL
  USING (unit_id IN (
    SELECT u.id FROM public.units u
    JOIN public.buildings b ON u.building_id = b.id
    WHERE b.organization_id = get_user_organization_id(auth.uid())
  ));

-- ---- ELSTER_SUBMISSIONS ----
DROP POLICY IF EXISTS "Users can view elster in their org" ON public.elster_submissions;
CREATE POLICY "Users can view elster in their org"
  ON public.elster_submissions FOR SELECT
  USING (organization_id = get_user_organization_id(auth.uid()));

DROP POLICY IF EXISTS "Users can manage elster in their org" ON public.elster_submissions;
CREATE POLICY "Users can manage elster in their org"
  ON public.elster_submissions FOR ALL
  USING (organization_id = get_user_organization_id(auth.uid()));

-- ---- LISTINGS ----
DROP POLICY IF EXISTS "Users can view listings in their org" ON public.listings;
CREATE POLICY "Users can view listings in their org"
  ON public.listings FOR SELECT
  USING (organization_id = get_user_organization_id(auth.uid()));

DROP POLICY IF EXISTS "Users can manage listings in their org" ON public.listings;
CREATE POLICY "Users can manage listings in their org"
  ON public.listings FOR ALL
  USING (organization_id = get_user_organization_id(auth.uid()));

-- ---- WORKFLOWS ----
DROP POLICY IF EXISTS "Users can view workflows in their org" ON public.workflows;
CREATE POLICY "Users can view workflows in their org"
  ON public.workflows FOR SELECT
  USING (organization_id = get_user_organization_id(auth.uid()));

DROP POLICY IF EXISTS "Users can manage workflows in their org" ON public.workflows;
CREATE POLICY "Users can manage workflows in their org"
  ON public.workflows FOR ALL
  USING (organization_id = get_user_organization_id(auth.uid()));

-- ---- AUDIT_LOGS ----
DROP POLICY IF EXISTS "Users can view audit logs in their org" ON public.audit_logs;
CREATE POLICY "Users can view audit logs in their org"
  ON public.audit_logs FOR SELECT
  USING (organization_id = get_user_organization_id(auth.uid()));

-- ---- ORG_MEMBERSHIPS ----
DROP POLICY IF EXISTS "Users can view their memberships" ON public.org_memberships;
CREATE POLICY "Users can view their memberships"
  ON public.org_memberships FOR SELECT
  USING (user_id = auth.uid() OR organization_id = get_user_organization_id(auth.uid()));

-- ---- OPERATING_COST_STATEMENTS ----
DROP POLICY IF EXISTS "Users can view operating costs in their org" ON public.operating_cost_statements;
CREATE POLICY "Users can view operating costs in their org"
  ON public.operating_cost_statements FOR SELECT
  USING (building_id IN (
    SELECT id FROM public.buildings
    WHERE organization_id = get_user_organization_id(auth.uid())
  ));

DROP POLICY IF EXISTS "Users can manage operating costs in their org" ON public.operating_cost_statements;
CREATE POLICY "Users can manage operating costs in their org"
  ON public.operating_cost_statements FOR ALL
  USING (building_id IN (
    SELECT id FROM public.buildings
    WHERE organization_id = get_user_organization_id(auth.uid())
  ));

-- ---- VPI_INDEX (öffentlich lesbar) ----
DROP POLICY IF EXISTS "VPI index is publicly readable" ON public.vpi_index;
CREATE POLICY "VPI index is publicly readable"
  ON public.vpi_index FOR SELECT
  USING (true);

-- ---- FAQ_ARTICLES ----
DROP POLICY IF EXISTS "Public FAQ articles are readable" ON public.faq_articles;
CREATE POLICY "Public FAQ articles are readable"
  ON public.faq_articles FOR SELECT
  USING (is_public = true OR organization_id = get_user_organization_id(auth.uid()));

-- ---- ECOSYSTEM_REFERRALS ----
DROP POLICY IF EXISTS "Users can view their referrals" ON public.ecosystem_referrals;
CREATE POLICY "Users can view their referrals"
  ON public.ecosystem_referrals FOR SELECT
  USING (referrer_user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create referrals" ON public.ecosystem_referrals;
CREATE POLICY "Users can create referrals"
  ON public.ecosystem_referrals FOR INSERT
  WITH CHECK (referrer_user_id = auth.uid());

-- ---- GDPR_REQUESTS ----
DROP POLICY IF EXISTS "Users can view gdpr requests in their org" ON public.gdpr_requests;
CREATE POLICY "Users can view gdpr requests in their org"
  ON public.gdpr_requests FOR SELECT
  USING (organization_id = get_user_organization_id(auth.uid()));

-- ---- CONSENT_RECORDS ----
DROP POLICY IF EXISTS "Users can view their consent records" ON public.consent_records;
CREATE POLICY "Users can view their consent records"
  ON public.consent_records FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage their consent records" ON public.consent_records;
CREATE POLICY "Users can manage their consent records"
  ON public.consent_records FOR ALL
  USING (user_id = auth.uid());
