-- ============================================================
-- Migration: add_updated_at_remaining_tables
-- Zweck:     Nachtrags-Migration für 3 Entitäts-Tabellen, die
--            in der vorherigen Migration (20260418202022) noch
--            nicht berücksichtigt wurden.
--
-- Tabellen:
--   1. ag_rooms              (AI Guide – Räume/Venues)
--   2. sb_document_entity_links (SecondBrain SSOT – Verknüpfungen)
--   3. sc_guest_feedback     (Service Counter – Gäste-Feedback)
--
-- Begründung:
--   ag_rooms:              Offline-Sync + Cache-Invalidierung
--   sb_document_entity_links: SSOT-Konsistenz + Realtime-Updates
--   sc_guest_feedback:     DSGVO-Compliance (Recht auf Berichtigung)
--
-- Idempotent: Ja – ADD COLUMN IF NOT EXISTS + DROP TRIGGER IF EXISTS
-- Voraussetzung: set_updated_at() Funktion aus Migration 20260418202022
-- ============================================================

-- Sicherheitshalber: Trigger-Funktion erneut sicherstellen (idempotent)
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

-- ── 1. AI Guide: ag_rooms ─────────────────────────────────────
-- Räume in Museen/Venues mit Name, Beschreibung, Grundriss-Koordinaten.
-- Risiko: Offline-Sync und Cache-Invalidierung ohne updated_at nicht möglich.
ALTER TABLE public.ag_rooms
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_ag_rooms_updated_at ON public.ag_rooms;
CREATE TRIGGER trg_ag_rooms_updated_at
  BEFORE UPDATE ON public.ag_rooms
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 2. SecondBrain SSOT: sb_document_entity_links ─────────────
-- Verknüpfung von Dokumenten mit Entitäten aus anderen Apps.
-- Risiko: SSOT-Konsistenz und Realtime-Updates ohne updated_at nicht möglich.
-- Hinweis: Diese Tabelle wird von v_building_documents, v_business_documents,
--          v_contacts_unified und v_tenant_documents referenziert.
ALTER TABLE public.sb_document_entity_links
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_sb_document_entity_links_updated_at ON public.sb_document_entity_links;
CREATE TRIGGER trg_sb_document_entity_links_updated_at
  BEFORE UPDATE ON public.sb_document_entity_links
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 3. Service Counter: sc_guest_feedback ─────────────────────
-- Gäste-Feedback mit Rating und Kommentar.
-- Risiko: DSGVO-Compliance – Recht auf Berichtigung ohne updated_at
--         nicht nachvollziehbar. Auch Moderation und Analytics betroffen.
ALTER TABLE public.sc_guest_feedback
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_sc_guest_feedback_updated_at ON public.sc_guest_feedback;
CREATE TRIGGER trg_sc_guest_feedback_updated_at
  BEFORE UPDATE ON public.sc_guest_feedback
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── ABSCHLUSS ────────────────────────────────────────────────
-- Nach dieser Migration haben alle identifizierten Entitäts-Tabellen
-- (37 + 3 = 40 Tabellen) ein updated_at-Feld mit automatischem Trigger.
-- Die verbleibenden 148 Tabellen ohne updated_at sind bewusst ausgeschlossen
-- (Log/Event/Junction/Config-Tabellen – architektonisch korrekt).
