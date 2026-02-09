-- Migration: Create email-attachments storage bucket and RLS policies
-- Run this in Supabase SQL Editor AFTER creating the bucket in the Dashboard:
--   Storage > New Bucket > Name: "email-attachments" > Private (not public)

-- Storage RLS: Users can upload to their own folder (user_id/*)
CREATE POLICY "Users can upload own attachments"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'email-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage RLS: Users can read/download their own attachments
CREATE POLICY "Users can read own attachments"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'email-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage RLS: Service role can upload (for webhook processing)
-- Note: Service role bypasses RLS by default, so this is not strictly needed.
-- Included for documentation purposes.

-- Add missing index on received_at for sorting performance
CREATE INDEX IF NOT EXISTS idx_inbound_emails_received_at
  ON public.inbound_emails(received_at DESC);

-- Enable Realtime on inbound_emails and booking_questions
ALTER PUBLICATION supabase_realtime ADD TABLE public.inbound_emails;
ALTER PUBLICATION supabase_realtime ADD TABLE public.booking_questions;
