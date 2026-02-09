-- Migration 005: Extend shared Supabase for all three apps
-- Project: aaefocdqgdgexkcrjhks (single shared DB)
-- Apps: vermietify (already done), fintu-hausmeister-app, fintutto-your-financial-compass

-- ============================================================
-- PART 1: Extend existing email_inboxes for hausmeister + mieter
-- ============================================================

ALTER TABLE public.email_inboxes ADD COLUMN IF NOT EXISTS company_id UUID;
ALTER TABLE public.email_inboxes ADD COLUMN IF NOT EXISTS email_address TEXT;
ALTER TABLE public.email_inboxes ADD COLUMN IF NOT EXISTS email_prefix TEXT;
ALTER TABLE public.email_inboxes ADD COLUMN IF NOT EXISTS inbox_address TEXT;
ALTER TABLE public.email_inboxes ADD COLUMN IF NOT EXISTS allowed_senders TEXT[] DEFAULT '{}';

-- Extend verified_senders for hausmeister
ALTER TABLE public.verified_senders ADD COLUMN IF NOT EXISTS company_id UUID;
ALTER TABLE public.verified_senders ADD COLUMN IF NOT EXISTS added_by UUID;
ALTER TABLE public.verified_senders ADD COLUMN IF NOT EXISTS verification_token TEXT;

-- ============================================================
-- PART 2: New tables for fintu-hausmeister-app
-- ============================================================

CREATE TABLE IF NOT EXISTS public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID,
  building_id UUID,
  task_id UUID,
  sender_email TEXT NOT NULL DEFAULT '',
  subject TEXT,
  file_url TEXT NOT NULL DEFAULT '',
  file_name TEXT NOT NULL DEFAULT '',
  file_size_bytes INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  document_type TEXT DEFAULT 'unknown',
  extracted_data JSONB DEFAULT '{}'::jsonb,
  amount NUMERIC,
  vendor_name TEXT,
  invoice_date DATE,
  invoice_number TEXT,
  notes TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.document_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  company_id UUID,
  question TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'assignment',
  suggested_answer TEXT,
  answer TEXT,
  answered_by UUID,
  answered_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- PART 3: New table for fintutto-your-financial-compass
-- ============================================================

CREATE TABLE IF NOT EXISTS public.email_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID,
  inbox_id UUID,
  sender_email TEXT NOT NULL DEFAULT '',
  subject TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending',
  file_name TEXT,
  file_url TEXT,
  vendor TEXT,
  amount NUMERIC,
  tax_amount NUMERIC,
  date TEXT,
  category TEXT,
  description TEXT,
  confidence NUMERIC,
  question_text TEXT,
  receipt_id UUID,
  transaction_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- PART 4: RLS on new tables
-- ============================================================

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_receipts ENABLE ROW LEVEL SECURITY;

-- Documents: allow authenticated users
CREATE POLICY "Authenticated users can view documents"
  ON public.documents FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert documents"
  ON public.documents FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update documents"
  ON public.documents FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Document questions: allow authenticated users
CREATE POLICY "Authenticated users can view document questions"
  ON public.document_questions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update document questions"
  ON public.document_questions FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert document questions"
  ON public.document_questions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Email receipts: allow authenticated users
CREATE POLICY "Authenticated users can view email receipts"
  ON public.email_receipts FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert email receipts"
  ON public.email_receipts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update email receipts"
  ON public.email_receipts FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete email receipts"
  ON public.email_receipts FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- PART 5: Realtime for all new tables
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.document_questions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.email_receipts;
