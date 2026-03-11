-- SecondBrain: Storage Bucket Setup
-- Migration 003: Create storage bucket and policies for document uploads
--
-- NOTE: This migration must be run in the Supabase Dashboard SQL Editor
-- or via supabase CLI. Storage bucket creation requires admin privileges.

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'secondbrain-docs',
  'secondbrain-docs',
  false,
  52428800, -- 50 MB
  ARRAY[
    'application/pdf',
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'text/plain', 'text/markdown', 'text/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STORAGE POLICIES
-- ============================================================

-- Users can upload files to their own folder (user_id as folder name)
CREATE POLICY "Users can upload own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'secondbrain-docs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can view/download their own files
CREATE POLICY "Users can view own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'secondbrain-docs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update their own files
CREATE POLICY "Users can update own documents"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'secondbrain-docs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own files
CREATE POLICY "Users can delete own documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'secondbrain-docs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
