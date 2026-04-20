-- Migration: SecondBrain OCR Usage Tracking
-- Zweck: Monatliches Seiten-Kontingent pro Nutzer verfolgen (für Pro-Tier-Gating)
-- Datum: 2026-04-19
-- ============================================================

-- ── Tabelle: sb_ocr_usage ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sb_ocr_usage (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id  UUID REFERENCES sb_documents(id) ON DELETE SET NULL,
  pages_used   INT NOT NULL DEFAULT 1 CHECK (pages_used > 0),
  month        TEXT NOT NULL,  -- Format: 'YYYY-MM' z.B. '2026-04'
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Index für schnelle Monats-Abfragen pro Nutzer
CREATE INDEX IF NOT EXISTS idx_sb_ocr_usage_user_month
  ON sb_ocr_usage(user_id, month);

-- Index für Dokument-Referenz
CREATE INDEX IF NOT EXISTS idx_sb_ocr_usage_document
  ON sb_ocr_usage(document_id) WHERE document_id IS NOT NULL;

-- ── View: Verbrauch pro Nutzer/Monat ──────────────────────────────────────
CREATE OR REPLACE VIEW sb_ocr_usage_summary AS
SELECT
  user_id,
  month,
  SUM(pages_used)::INT AS total_pages_used,
  COUNT(*)::INT         AS documents_processed
FROM sb_ocr_usage
GROUP BY user_id, month;

-- ── RLS aktivieren ────────────────────────────────────────────────────────
ALTER TABLE sb_ocr_usage ENABLE ROW LEVEL SECURITY;

-- Nutzer sehen nur eigene OCR-Nutzung
CREATE POLICY "sb_ocr_usage_select_own"
  ON sb_ocr_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Nur Service Role (Edge Function) darf Einträge erstellen
-- (kein auth.uid()-Check nötig, da Service Role RLS umgeht)
CREATE POLICY "sb_ocr_usage_insert_service"
  ON sb_ocr_usage FOR INSERT
  WITH CHECK (true);

-- Keine UPDATE/DELETE für Nutzer (unveränderliche Nutzungshistorie)

-- ── Hilfsfunktion: Aktuellen Monatsverbrauch abrufen ──────────────────────
CREATE OR REPLACE FUNCTION get_ocr_pages_used(p_user_id UUID, p_month TEXT)
RETURNS INT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(SUM(pages_used), 0)::INT
  FROM sb_ocr_usage
  WHERE user_id = p_user_id
    AND month = p_month;
$$;

-- ── Kommentar ─────────────────────────────────────────────────────────────
COMMENT ON TABLE sb_ocr_usage IS
  'Verfolgt OCR-Seitenverbrauch pro Nutzer und Monat für SecondBrain Pro Tier-Gating.';
COMMENT ON COLUMN sb_ocr_usage.month IS
  'Monat im Format YYYY-MM (z.B. 2026-04). Wird von der Edge Function gesetzt.';
COMMENT ON COLUMN sb_ocr_usage.pages_used IS
  'Anzahl verarbeiteter Seiten. Bei PDFs > 4MB: Anzahl der tatsächlich verarbeiteten (gekürzten) Seiten.';
