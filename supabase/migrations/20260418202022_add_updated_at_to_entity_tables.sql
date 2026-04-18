-- ============================================================
-- Migration: add_updated_at_to_entity_tables
-- Zweck:     Fügt updated_at + automatischen Trigger zu allen
--            Entitäts-Tabellen hinzu, die dieses Feld noch
--            nicht besitzen.
-- Tabellen:  37 Entitäts-Tabellen (klassifiziert aus 208
--            Tabellen ohne updated_at, Log/Event/Junction
--            ausgeschlossen)
-- Idempotent: Ja – ADD COLUMN IF NOT EXISTS + CREATE OR REPLACE
-- ============================================================

-- ─── TRIGGER-FUNKTION (einmalig, shared) ─────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ─── HILFSMAKRO: Spalte + Trigger idempotent hinzufügen ──────
-- Wir nutzen DO-Blöcke pro Tabelle für maximale Idempotenz.

-- ── 1. AI Guide: ag_ai_chats ─────────────────────────────────
ALTER TABLE public.ag_ai_chats
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_ag_ai_chats_updated_at ON public.ag_ai_chats;
CREATE TRIGGER trg_ag_ai_chats_updated_at
  BEFORE UPDATE ON public.ag_ai_chats
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 2. AI Guide: ag_ai_tour_suggestions ──────────────────────
ALTER TABLE public.ag_ai_tour_suggestions
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_ag_ai_tour_suggestions_updated_at ON public.ag_ai_tour_suggestions;
CREATE TRIGGER trg_ag_ai_tour_suggestions_updated_at
  BEFORE UPDATE ON public.ag_ai_tour_suggestions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 3. AI Guide: ag_artwork_media ────────────────────────────
ALTER TABLE public.ag_artwork_media
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_ag_artwork_media_updated_at ON public.ag_artwork_media;
CREATE TRIGGER trg_ag_artwork_media_updated_at
  BEFORE UPDATE ON public.ag_artwork_media
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 4. AI Guide: ag_badges ───────────────────────────────────
ALTER TABLE public.ag_badges
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_ag_badges_updated_at ON public.ag_badges;
CREATE TRIGGER trg_ag_badges_updated_at
  BEFORE UPDATE ON public.ag_badges
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 5. AI Guide: ag_categories ───────────────────────────────
ALTER TABLE public.ag_categories
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_ag_categories_updated_at ON public.ag_categories;
CREATE TRIGGER trg_ag_categories_updated_at
  BEFORE UPDATE ON public.ag_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 6. AI Guide: ag_content_versions ─────────────────────────
ALTER TABLE public.ag_content_versions
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_ag_content_versions_updated_at ON public.ag_content_versions;
CREATE TRIGGER trg_ag_content_versions_updated_at
  BEFORE UPDATE ON public.ag_content_versions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 7. AI Guide: ag_favorites ────────────────────────────────
ALTER TABLE public.ag_favorites
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_ag_favorites_updated_at ON public.ag_favorites;
CREATE TRIGGER trg_ag_favorites_updated_at
  BEFORE UPDATE ON public.ag_favorites
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 8. AI Guide: ag_floors ───────────────────────────────────
ALTER TABLE public.ag_floors
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_ag_floors_updated_at ON public.ag_floors;
CREATE TRIGGER trg_ag_floors_updated_at
  BEFORE UPDATE ON public.ag_floors
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 9. AI Guide: ag_hunt_items ───────────────────────────────
ALTER TABLE public.ag_hunt_items
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_ag_hunt_items_updated_at ON public.ag_hunt_items;
CREATE TRIGGER trg_ag_hunt_items_updated_at
  BEFORE UPDATE ON public.ag_hunt_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 10. Bescheidboxer: bescheid_dokumente ────────────────────
ALTER TABLE public.bescheid_dokumente
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_bescheid_dokumente_updated_at ON public.bescheid_dokumente;
CREATE TRIGGER trg_bescheid_dokumente_updated_at
  BEFORE UPDATE ON public.bescheid_dokumente
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 11. Financial Compass: biz_businesses ────────────────────
ALTER TABLE public.biz_businesses
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_biz_businesses_updated_at ON public.biz_businesses;
CREATE TRIGGER trg_biz_businesses_updated_at
  BEFORE UPDATE ON public.biz_businesses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 12. Financial Compass: biz_cashflow_forecasts ────────────
ALTER TABLE public.biz_cashflow_forecasts
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_biz_cashflow_forecasts_updated_at ON public.biz_cashflow_forecasts;
CREATE TRIGGER trg_biz_cashflow_forecasts_updated_at
  BEFORE UPDATE ON public.biz_cashflow_forecasts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 13. Financial Compass: biz_clients ───────────────────────
ALTER TABLE public.biz_clients
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_biz_clients_updated_at ON public.biz_clients;
CREATE TRIGGER trg_biz_clients_updated_at
  BEFORE UPDATE ON public.biz_clients
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 14. Financial Compass: biz_expenses ──────────────────────
ALTER TABLE public.biz_expenses
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_biz_expenses_updated_at ON public.biz_expenses;
CREATE TRIGGER trg_biz_expenses_updated_at
  BEFORE UPDATE ON public.biz_expenses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 15. Financial Compass: biz_invoices ──────────────────────
ALTER TABLE public.biz_invoices
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_biz_invoices_updated_at ON public.biz_invoices;
CREATE TRIGGER trg_biz_invoices_updated_at
  BEFORE UPDATE ON public.biz_invoices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 16. Financial Compass: biz_tax_reports ───────────────────
ALTER TABLE public.biz_tax_reports
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_biz_tax_reports_updated_at ON public.biz_tax_reports;
CREATE TRIGGER trg_biz_tax_reports_updated_at
  BEFORE UPDATE ON public.biz_tax_reports
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 17. Financial Compass: biz_time_entries ──────────────────
ALTER TABLE public.biz_time_entries
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_biz_time_entries_updated_at ON public.biz_time_entries;
CREATE TRIGGER trg_biz_time_entries_updated_at
  BEFORE UPDATE ON public.biz_time_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 18. City Guide: cg_partner_lead_notes ────────────────────
ALTER TABLE public.cg_partner_lead_notes
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_cg_partner_lead_notes_updated_at ON public.cg_partner_lead_notes;
CREATE TRIGGER trg_cg_partner_lead_notes_updated_at
  BEFORE UPDATE ON public.cg_partner_lead_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 19. SSOT Core: core_contact_addresses ────────────────────
ALTER TABLE public.core_contact_addresses
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_core_contact_addresses_updated_at ON public.core_contact_addresses;
CREATE TRIGGER trg_core_contact_addresses_updated_at
  BEFORE UPDATE ON public.core_contact_addresses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 20. Finance Coach: finance_ai_insights ───────────────────
ALTER TABLE public.finance_ai_insights
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_finance_ai_insights_updated_at ON public.finance_ai_insights;
CREATE TRIGGER trg_finance_ai_insights_updated_at
  BEFORE UPDATE ON public.finance_ai_insights
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 21. Finance Coach: finance_transactions ──────────────────
ALTER TABLE public.finance_transactions
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_finance_transactions_updated_at ON public.finance_transactions;
CREATE TRIGGER trg_finance_transactions_updated_at
  BEFORE UPDATE ON public.finance_transactions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 22. Bescheidboxer: fristen ───────────────────────────────
ALTER TABLE public.fristen
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_fristen_updated_at ON public.fristen;
CREATE TRIGGER trg_fristen_updated_at
  BEFORE UPDATE ON public.fristen
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 23. AMS: gt_calculations ─────────────────────────────────
ALTER TABLE public.gt_calculations
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_gt_calculations_updated_at ON public.gt_calculations;
CREATE TRIGGER trg_gt_calculations_updated_at
  BEFORE UPDATE ON public.gt_calculations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 24. AMS: gt_contact_requests ─────────────────────────────
ALTER TABLE public.gt_contact_requests
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_gt_contact_requests_updated_at ON public.gt_contact_requests;
CREATE TRIGGER trg_gt_contact_requests_updated_at
  BEFORE UPDATE ON public.gt_contact_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 25. AMS: gt_lead_notes ───────────────────────────────────
ALTER TABLE public.gt_lead_notes
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_gt_lead_notes_updated_at ON public.gt_lead_notes;
CREATE TRIGGER trg_gt_lead_notes_updated_at
  BEFORE UPDATE ON public.gt_lead_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 26. AMS: gt_org_invites ──────────────────────────────────
ALTER TABLE public.gt_org_invites
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_gt_org_invites_updated_at ON public.gt_org_invites;
CREATE TRIGGER trg_gt_org_invites_updated_at
  BEFORE UPDATE ON public.gt_org_invites
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 27. AMS: gt_organizations ────────────────────────────────
ALTER TABLE public.gt_organizations
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_gt_organizations_updated_at ON public.gt_organizations;
CREATE TRIGGER trg_gt_organizations_updated_at
  BEFORE UPDATE ON public.gt_organizations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 28. AMS: gt_session_managers ─────────────────────────────
ALTER TABLE public.gt_session_managers
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_gt_session_managers_updated_at ON public.gt_session_managers;
CREATE TRIGGER trg_gt_session_managers_updated_at
  BEFORE UPDATE ON public.gt_session_managers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 29. AMS: gt_session_participants ─────────────────────────
ALTER TABLE public.gt_session_participants
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_gt_session_participants_updated_at ON public.gt_session_participants;
CREATE TRIGGER trg_gt_session_participants_updated_at
  BEFORE UPDATE ON public.gt_session_participants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 30. Finance Mentor: learn_lessons ────────────────────────
ALTER TABLE public.learn_lessons
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_learn_lessons_updated_at ON public.learn_lessons;
CREATE TRIGGER trg_learn_lessons_updated_at
  BEFORE UPDATE ON public.learn_lessons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 31. Finance Mentor: learn_progress ───────────────────────
ALTER TABLE public.learn_progress
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_learn_progress_updated_at ON public.learn_progress;
CREATE TRIGGER trg_learn_progress_updated_at
  BEFORE UPDATE ON public.learn_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 32. Ablesung: meter_readings ─────────────────────────────
ALTER TABLE public.meter_readings
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_meter_readings_updated_at ON public.meter_readings;
CREATE TRIGGER trg_meter_readings_updated_at
  BEFORE UPDATE ON public.meter_readings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 33. SecondBrain: sb_chat_messages ────────────────────────
ALTER TABLE public.sb_chat_messages
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_sb_chat_messages_updated_at ON public.sb_chat_messages;
CREATE TRIGGER trg_sb_chat_messages_updated_at
  BEFORE UPDATE ON public.sb_chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 34. SecondBrain: sb_document_suggestions ─────────────────
ALTER TABLE public.sb_document_suggestions
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_sb_document_suggestions_updated_at ON public.sb_document_suggestions;
CREATE TRIGGER trg_sb_document_suggestions_updated_at
  BEFORE UPDATE ON public.sb_document_suggestions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 35. Plattform: stripe_payments ───────────────────────────
ALTER TABLE public.stripe_payments
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_stripe_payments_updated_at ON public.stripe_payments;
CREATE TRIGGER trg_stripe_payments_updated_at
  BEFORE UPDATE ON public.stripe_payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 36. Translator: tr_sessions ──────────────────────────────
ALTER TABLE public.tr_sessions
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_tr_sessions_updated_at ON public.tr_sessions;
CREATE TRIGGER trg_tr_sessions_updated_at
  BEFORE UPDATE ON public.tr_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 37. Translator: tr_translations ──────────────────────────
ALTER TABLE public.tr_translations
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_tr_translations_updated_at ON public.tr_translations;
CREATE TRIGGER trg_tr_translations_updated_at
  BEFORE UPDATE ON public.tr_translations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── ABSCHLUSS-KOMMENTAR ──────────────────────────────────────
-- 37 Tabellen erhalten updated_at + automatischen Trigger.
-- 171 Log/Event/Junction-Tabellen wurden bewusst ausgeschlossen.
-- Trigger-Funktion set_updated_at() ist SECURITY DEFINER mit
-- festem search_path = public (Supabase Best Practice).
