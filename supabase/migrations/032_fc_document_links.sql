-- ============================================================
-- Migration 032: Financial Compass ↔ SecondBrain Verknüpfungen
-- Zweck: entity_type 'transaction' und 'invoice' in sb_document_entity_links
--        + fc_booking_suggestions für automatische Buchungsvorschläge
-- Stand: 2026-04-20
-- Idempotent: Kann mehrfach ausgeführt werden
-- ============================================================

-- ── 1. entity_type CHECK-Constraint um 'transaction' und 'invoice' erweitern ──
-- Die bestehende sb_document_entity_links Tabelle (Migration 029) hat einen
-- CHECK-Constraint der nur bestimmte entity_types erlaubt.
-- Wir erweitern ihn um FC-spezifische Typen.

ALTER TABLE public.sb_document_entity_links
  DROP CONSTRAINT IF EXISTS sb_document_entity_links_entity_type_check;

ALTER TABLE public.sb_document_entity_links
  ADD CONSTRAINT sb_document_entity_links_entity_type_check
  CHECK (entity_type IN (
    -- Vermietify
    'building', 'unit', 'tenant', 'lease',
    -- Financial Compass
    'business', 'expense', 'invoice', 'meter',
    'transaction',
    -- Vermietify erweitert
    'property', 'maintenance_request'
  ));

-- ── 2. fc_booking_suggestions: KI-Buchungsvorschläge aus OCR ─────────────────
-- Wird befüllt von der Edge Function 'fc-suggest-booking'
-- Nutzer kann Vorschlag bestätigen (→ Buchung anlegen) oder ablehnen

CREATE TABLE IF NOT EXISTS public.fc_booking_suggestions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id     UUID        NOT NULL REFERENCES public.sb_documents(id) ON DELETE CASCADE,
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- KI-extrahierte Felder
  vendor          TEXT,                    -- Lieferant/Kreditor
  amount_gross    NUMERIC(15,2),           -- Bruttobetrag
  amount_net      NUMERIC(15,2),           -- Nettobetrag
  vat_rate        NUMERIC(5,2),            -- MwSt-Satz (z.B. 19.0)
  vat_amount      NUMERIC(15,2),           -- MwSt-Betrag
  document_date   DATE,                    -- Belegdatum
  account_number  TEXT,                    -- SKR03/SKR04 Konto (z.B. "4920")
  account_name    TEXT,                    -- Kontobezeichnung
  booking_type    TEXT DEFAULT 'expense'   -- 'expense' | 'income'
    CHECK (booking_type IN ('expense', 'income', 'transfer')),

  -- Metadaten
  confidence      REAL        DEFAULT 0.0 CHECK (confidence BETWEEN 0.0 AND 1.0),
  raw_suggestion  JSONB       DEFAULT '{}', -- Vollständige KI-Antwort
  status          TEXT        DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected', 'applied')),
  applied_transaction_id UUID,             -- NULL bis Vorschlag bestätigt wurde

  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fc_booking_suggestions_document
  ON public.fc_booking_suggestions(document_id);

CREATE INDEX IF NOT EXISTS idx_fc_booking_suggestions_user_status
  ON public.fc_booking_suggestions(user_id, status);

ALTER TABLE public.fc_booking_suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own booking suggestions"
  ON public.fc_booking_suggestions;
CREATE POLICY "Users can manage own booking suggestions"
  ON public.fc_booking_suggestions
  FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Deny anon access to fc_booking_suggestions"
  ON public.fc_booking_suggestions;
CREATE POLICY "Deny anon access to fc_booking_suggestions"
  ON public.fc_booking_suggestions
  FOR ALL TO anon USING (false);

-- ── 3. user_settings: FC-Belege in SecondBrain anzeigen (Optional) ────────────
-- Nutzer-Einstellung: Sollen FC-Belege in SecondBrain sichtbar sein?

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS sb_show_fc_documents BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS sb_show_vm_documents BOOLEAN DEFAULT false;

-- ── 4. Löschen-Schutz: FC-Belege nur aus FC löschbar ─────────────────────────
-- RLS-Policy: source_app-Check verhindert Löschen aus SecondBrain

DROP POLICY IF EXISTS "SecondBrain: Users can delete own documents"
  ON public.sb_documents;

CREATE POLICY "SecondBrain: Users can delete own documents"
  ON public.sb_documents
  FOR DELETE USING (
    user_id = auth.uid()
    AND (source_app IS NULL OR source_app = 'secondbrain')
  );

-- FC-Belege können nur von FC gelöscht werden (source_app-Check)
DROP POLICY IF EXISTS "FC: Users can delete own fc documents"
  ON public.sb_documents;

CREATE POLICY "FC: Users can delete own fc documents"
  ON public.sb_documents
  FOR DELETE USING (
    user_id = auth.uid()
    AND source_app = 'financial-compass'
  );

-- Vermietify-Belege können nur von Vermietify gelöscht werden
DROP POLICY IF EXISTS "VM: Users can delete own vm documents"
  ON public.sb_documents;

CREATE POLICY "VM: Users can delete own vm documents"
  ON public.sb_documents
  FOR DELETE USING (
    user_id = auth.uid()
    AND source_app = 'vermietify'
  );

-- ── 5. View: Alle Dokumente eines Nutzers mit App-Kontext ─────────────────────

CREATE OR REPLACE VIEW public.v_user_documents AS
SELECT
  d.id,
  d.user_id,
  d.title,
  d.file_name,
  d.file_type,
  d.file_size,
  d.mime_type,
  d.storage_path,
  d.file_url,
  d.ocr_status,
  d.ocr_text,
  d.summary,
  d.tags,
  d.is_favorite,
  d.category,
  d.source_app,
  d.document_type,
  d.created_at,
  d.updated_at,
  -- Verknüpfte Entitäten (aggregiert)
  COALESCE(
    (SELECT jsonb_agg(jsonb_build_object(
      'entity_type', l.entity_type,
      'entity_id', l.entity_id,
      'notes', l.notes
    ))
    FROM public.sb_document_entity_links l
    WHERE l.document_id = d.id),
    '[]'::jsonb
  ) AS linked_entities,
  -- Offene Buchungsvorschläge
  (SELECT COUNT(*) FROM public.fc_booking_suggestions s
   WHERE s.document_id = d.id AND s.status = 'pending') AS pending_suggestions
FROM public.sb_documents d;

-- ── 6. RPC: Buchungsvorschlag annehmen ────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.accept_booking_suggestion(
  p_suggestion_id UUID,
  p_transaction_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.fc_booking_suggestions
  SET
    status = 'applied',
    applied_transaction_id = p_transaction_id,
    updated_at = now()
  WHERE id = p_suggestion_id
    AND user_id = auth.uid()
    AND status = 'pending';

  RETURN FOUND;
END;
$$;

-- ── 7. Trigger: updated_at für fc_booking_suggestions ────────────────────────

CREATE OR REPLACE FUNCTION public.update_fc_booking_suggestions_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_fc_booking_suggestions_updated_at
  ON public.fc_booking_suggestions;

CREATE TRIGGER trg_fc_booking_suggestions_updated_at
  BEFORE UPDATE ON public.fc_booking_suggestions
  FOR EACH ROW EXECUTE FUNCTION public.update_fc_booking_suggestions_updated_at();
