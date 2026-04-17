-- ============================================================
-- Migration 030: SecondBrain Email Source Tracking
-- Fügt E-Mail-Herkunfts-Metadaten zu sb_documents hinzu
-- Ermöglicht den Posteingangsscanner
-- ============================================================

-- E-Mail-Quell-Metadaten zu sb_documents hinzufügen
ALTER TABLE public.sb_documents
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'upload'
    CHECK (source IN ('upload', 'email', 'scan', 'api', 'web')),
  ADD COLUMN IF NOT EXISTS email_message_id TEXT,          -- Gmail Message-ID (verhindert Duplikate)
  ADD COLUMN IF NOT EXISTS email_thread_id TEXT,           -- Gmail Thread-ID
  ADD COLUMN IF NOT EXISTS email_from TEXT,                -- Absender
  ADD COLUMN IF NOT EXISTS email_subject TEXT,             -- Betreff
  ADD COLUMN IF NOT EXISTS email_date TIMESTAMPTZ,         -- Empfangsdatum
  ADD COLUMN IF NOT EXISTS email_labels TEXT[] DEFAULT '{}'; -- Gmail-Labels

-- Index für schnelle Duplikat-Prüfung
CREATE INDEX IF NOT EXISTS idx_sb_documents_email_message_id
  ON public.sb_documents(email_message_id)
  WHERE email_message_id IS NOT NULL;

-- Index für E-Mail-Quell-Filter
CREATE INDEX IF NOT EXISTS idx_sb_documents_source
  ON public.sb_documents(user_id, source);

-- Tabelle für verarbeitete E-Mails (verhindert Doppelverarbeitung)
CREATE TABLE IF NOT EXISTS public.sb_email_scan_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gmail_message_id TEXT NOT NULL,
  gmail_thread_id TEXT,
  subject TEXT,
  sender TEXT,
  received_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ DEFAULT now(),
  documents_created INTEGER DEFAULT 0,
  status TEXT DEFAULT 'processed' CHECK (status IN ('processed', 'skipped', 'error')),
  error_message TEXT,
  UNIQUE(user_id, gmail_message_id)
);

CREATE INDEX IF NOT EXISTS idx_sb_email_scan_log_user
  ON public.sb_email_scan_log(user_id, processed_at DESC);

CREATE INDEX IF NOT EXISTS idx_sb_email_scan_log_message
  ON public.sb_email_scan_log(gmail_message_id);

-- RLS für email_scan_log
ALTER TABLE public.sb_email_scan_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own email scan log" ON public.sb_email_scan_log;
CREATE POLICY "Users can view own email scan log"
  ON public.sb_email_scan_log FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own email scan log" ON public.sb_email_scan_log;
CREATE POLICY "Users can insert own email scan log"
  ON public.sb_email_scan_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage email scan log" ON public.sb_email_scan_log;
CREATE POLICY "Service role can manage email scan log"
  ON public.sb_email_scan_log FOR ALL
  USING (auth.role() = 'service_role');

-- Bestätigung
SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'sb_documents'
  AND column_name IN ('source', 'email_message_id', 'email_from', 'email_subject', 'email_date')
ORDER BY column_name;
