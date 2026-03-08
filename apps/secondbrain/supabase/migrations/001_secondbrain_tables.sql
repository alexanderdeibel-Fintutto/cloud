-- SecondBrain: Intelligentes Wissensmanagement
-- Migration: Create core tables for document management, chat, and collections

-- ============================================================
-- DOCUMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS sb_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'other', -- pdf, image, text, audio, video, other
  file_size BIGINT NOT NULL DEFAULT 0,
  mime_type TEXT,
  storage_path TEXT NOT NULL,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT false,

  -- OCR & AI
  ocr_status TEXT DEFAULT 'pending' CHECK (ocr_status IN ('pending', 'processing', 'completed', 'failed')),
  ocr_text TEXT,
  ocr_confidence REAL,
  summary TEXT,
  ai_metadata JSONB DEFAULT '{}',

  -- Embeddings (for vector search with pgvector)
  -- embedding vector(1536), -- uncomment when pgvector is enabled

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_sb_documents_user_id ON sb_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_sb_documents_file_type ON sb_documents(user_id, file_type);
CREATE INDEX IF NOT EXISTS idx_sb_documents_favorite ON sb_documents(user_id, is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_sb_documents_ocr_status ON sb_documents(ocr_status) WHERE ocr_status IN ('pending', 'processing');
CREATE INDEX IF NOT EXISTS idx_sb_documents_created_at ON sb_documents(user_id, created_at DESC);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_sb_documents_fts ON sb_documents
  USING gin(to_tsvector('german', coalesce(title, '') || ' ' || coalesce(ocr_text, '') || ' ' || coalesce(summary, '')));

-- ============================================================
-- COLLECTIONS (Sammlungen)
-- ============================================================
CREATE TABLE IF NOT EXISTS sb_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT 'folder',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sb_collections_user_id ON sb_collections(user_id);

-- Many-to-many: Documents <-> Collections
CREATE TABLE IF NOT EXISTS sb_document_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES sb_documents(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES sb_collections(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(document_id, collection_id)
);

-- ============================================================
-- CHAT
-- ============================================================
CREATE TABLE IF NOT EXISTS sb_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sb_chat_sessions_user_id ON sb_chat_sessions(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS sb_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sb_chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sb_chat_messages_session_id ON sb_chat_messages(session_id, created_at);

-- ============================================================
-- ACTIVITY LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS sb_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- upload, view, search, chat, favorite, delete
  entity_type TEXT, -- document, collection, chat
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sb_activity_log_user_id ON sb_activity_log(user_id, created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE sb_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE sb_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE sb_document_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE sb_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sb_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sb_activity_log ENABLE ROW LEVEL SECURITY;

-- Documents: users can only access their own
CREATE POLICY "Users can view own documents" ON sb_documents
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own documents" ON sb_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own documents" ON sb_documents
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents" ON sb_documents
  FOR DELETE USING (auth.uid() = user_id);

-- Collections: users can only access their own
CREATE POLICY "Users can view own collections" ON sb_collections
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own collections" ON sb_collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own collections" ON sb_collections
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own collections" ON sb_collections
  FOR DELETE USING (auth.uid() = user_id);

-- Document-Collections: via document ownership
CREATE POLICY "Users can manage own document-collections" ON sb_document_collections
  FOR ALL USING (
    EXISTS (SELECT 1 FROM sb_documents WHERE id = document_id AND user_id = auth.uid())
  );

-- Chat sessions: users can only access their own
CREATE POLICY "Users can view own chat sessions" ON sb_chat_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat sessions" ON sb_chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own chat sessions" ON sb_chat_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Chat messages: via session ownership
CREATE POLICY "Users can manage own chat messages" ON sb_chat_messages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM sb_chat_sessions WHERE id = session_id AND user_id = auth.uid())
  );

-- Activity log: users can only view their own
CREATE POLICY "Users can view own activity" ON sb_activity_log
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activity" ON sb_activity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION sb_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sb_documents_updated_at
  BEFORE UPDATE ON sb_documents
  FOR EACH ROW EXECUTE FUNCTION sb_update_updated_at();

CREATE TRIGGER sb_collections_updated_at
  BEFORE UPDATE ON sb_collections
  FOR EACH ROW EXECUTE FUNCTION sb_update_updated_at();

CREATE TRIGGER sb_chat_sessions_updated_at
  BEFORE UPDATE ON sb_chat_sessions
  FOR EACH ROW EXECUTE FUNCTION sb_update_updated_at();

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
-- Run in Supabase Dashboard or via API:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('secondbrain-docs', 'secondbrain-docs', false);
-- CREATE POLICY "Users can upload own documents" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'secondbrain-docs' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can view own documents" ON storage.objects
--   FOR SELECT USING (bucket_id = 'secondbrain-docs' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can delete own documents" ON storage.objects
--   FOR DELETE USING (bucket_id = 'secondbrain-docs' AND auth.uid()::text = (storage.foldername(name))[1]);
