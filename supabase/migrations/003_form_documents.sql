-- Form Documents and Versioning System
-- Migration: 003_form_documents.sql

-- Form Drafts Table (for auto-save functionality)
CREATE TABLE IF NOT EXISTS form_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_template_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}',
  last_modified TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_auto_save BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Form Documents Table (finalized documents)
CREATE TABLE IF NOT EXISTS form_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_template_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  current_data JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'finalized')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Form Versions Table (printed/sent/signed versions)
CREATE TABLE IF NOT EXISTS form_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_document_id UUID NOT NULL REFERENCES form_documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  data JSONB NOT NULL,
  pdf_url TEXT,
  pdf_data BYTEA,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'printed', 'sent', 'signed')),
  sent_to TEXT,
  sent_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  signature_data TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(form_document_id, version_number)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_form_drafts_user_id ON form_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_form_drafts_template_id ON form_drafts(form_template_id);
CREATE INDEX IF NOT EXISTS idx_form_documents_user_id ON form_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_form_documents_template_id ON form_documents(form_template_id);
CREATE INDEX IF NOT EXISTS idx_form_versions_document_id ON form_versions(form_document_id);

-- RLS Policies
ALTER TABLE form_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_versions ENABLE ROW LEVEL SECURITY;

-- Form Drafts: Users can only see their own drafts
CREATE POLICY "Users can view own drafts"
  ON form_drafts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own drafts"
  ON form_drafts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own drafts"
  ON form_drafts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own drafts"
  ON form_drafts FOR DELETE
  USING (auth.uid() = user_id);

-- Form Documents: Users can only see their own documents
CREATE POLICY "Users can view own documents"
  ON form_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
  ON form_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON form_documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
  ON form_documents FOR DELETE
  USING (auth.uid() = user_id);

-- Form Versions: Users can only see versions of their own documents
CREATE POLICY "Users can view own versions"
  ON form_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM form_documents
      WHERE form_documents.id = form_versions.form_document_id
      AND form_documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert versions for own documents"
  ON form_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM form_documents
      WHERE form_documents.id = form_versions.form_document_id
      AND form_documents.user_id = auth.uid()
    )
  );

-- Trigger to update updated_at on form_documents
CREATE OR REPLACE FUNCTION update_form_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER form_documents_updated_at
  BEFORE UPDATE ON form_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_form_documents_updated_at();
