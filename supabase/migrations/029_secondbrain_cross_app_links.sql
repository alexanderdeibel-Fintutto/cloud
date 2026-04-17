-- ============================================================
-- Migration 029: SecondBrain Cross-App Integration
-- Zweck: sb_documents als zentralen Dokumenten-Hub verknüpfen
--        mit allen Entitäten des Fintutto-Ökosystems
-- Stand: 2026-04-17
-- Idempotent: Kann mehrfach ausgeführt werden (IF NOT EXISTS + DROP IF EXISTS)
-- ============================================================

-- ── 1. ERWEITERUNG sb_documents ────────────────────────────────────────────
-- Direkte Verknüpfungsfelder + file_url für direkten Dateizugriff

ALTER TABLE public.sb_documents
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS document_type TEXT DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS file_url TEXT;

-- Indexes für neue Spalten
CREATE INDEX IF NOT EXISTS idx_sb_documents_org
  ON public.sb_documents(organization_id);

CREATE INDEX IF NOT EXISTS idx_sb_documents_doc_type
  ON public.sb_documents(document_type);

-- ── 2. n:m VERKNÜPFUNGSTABELLE ─────────────────────────────────────────────
-- Ein Dokument kann mehreren Entitäten zugeordnet werden

CREATE TABLE IF NOT EXISTS public.sb_document_entity_links (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID        NOT NULL REFERENCES public.sb_documents(id) ON DELETE CASCADE,
  entity_type TEXT        NOT NULL CHECK (entity_type IN (
    'building', 'unit', 'tenant', 'lease',
    'business', 'expense', 'invoice', 'meter'
  )),
  entity_id   UUID        NOT NULL,
  linked_at   TIMESTAMPTZ DEFAULT now(),
  linked_by   UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  notes       TEXT,
  UNIQUE(document_id, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_sb_entity_links_document
  ON public.sb_document_entity_links(document_id);

CREATE INDEX IF NOT EXISTS idx_sb_entity_links_entity
  ON public.sb_document_entity_links(entity_type, entity_id);

ALTER TABLE public.sb_document_entity_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own document entity links"
  ON public.sb_document_entity_links;
CREATE POLICY "Users can manage own document entity links"
  ON public.sb_document_entity_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.sb_documents
      WHERE id = document_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Deny anonymous access to sb_document_entity_links"
  ON public.sb_document_entity_links;
CREATE POLICY "Deny anonymous access to sb_document_entity_links"
  ON public.sb_document_entity_links
  FOR ALL TO anon USING (false);

-- ── 3. KI-VORSCHLÄGE FÜR AUTOMATISCHE ZUORDNUNG ────────────────────────────

CREATE TABLE IF NOT EXISTS public.sb_document_suggestions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID        NOT NULL REFERENCES public.sb_documents(id) ON DELETE CASCADE,
  entity_type TEXT        NOT NULL CHECK (entity_type IN (
    'building', 'unit', 'tenant', 'lease',
    'business', 'expense', 'invoice', 'meter'
  )),
  entity_id   UUID        NOT NULL,
  confidence  REAL        NOT NULL DEFAULT 0.0 CHECK (confidence BETWEEN 0.0 AND 1.0),
  reason      TEXT,
  status      TEXT        DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sb_suggestions_document
  ON public.sb_document_suggestions(document_id, status);

ALTER TABLE public.sb_document_suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own document suggestions"
  ON public.sb_document_suggestions;
CREATE POLICY "Users can manage own document suggestions"
  ON public.sb_document_suggestions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.sb_documents
      WHERE id = document_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Deny anonymous access to sb_document_suggestions"
  ON public.sb_document_suggestions;
CREATE POLICY "Deny anonymous access to sb_document_suggestions"
  ON public.sb_document_suggestions
  FOR ALL TO anon USING (false);

-- ── 4. VIEWS FÜR CROSS-APP ZUGRIFF ─────────────────────────────────────────

-- View: Alle Dokumente eines Gebäudes (für Vermietify)
CREATE OR REPLACE VIEW public.v_building_documents
  WITH (security_invoker = true) AS
SELECT
  d.id,
  d.user_id,
  d.title,
  d.file_name,
  d.file_type,
  d.file_size,
  d.document_type,
  d.category,
  d.tags,
  d.ocr_status,
  d.summary,
  d.is_favorite,
  d.created_at,
  d.storage_path,
  d.file_url,
  l.entity_id AS building_id,
  l.notes     AS link_notes
FROM public.sb_documents d
JOIN public.sb_document_entity_links l
  ON l.document_id = d.id AND l.entity_type = 'building';

-- View: Alle Dokumente einer Firma (für Financial Compass)
CREATE OR REPLACE VIEW public.v_business_documents
  WITH (security_invoker = true) AS
SELECT
  d.id,
  d.user_id,
  d.title,
  d.file_name,
  d.file_type,
  d.file_size,
  d.document_type,
  d.category,
  d.tags,
  d.ocr_status,
  d.summary,
  d.is_favorite,
  d.created_at,
  d.storage_path,
  d.file_url,
  l.entity_id AS business_id,
  l.notes     AS link_notes
FROM public.sb_documents d
JOIN public.sb_document_entity_links l
  ON l.document_id = d.id AND l.entity_type = 'business';

-- View: Alle Dokumente eines Mieters (für Vermietify)
CREATE OR REPLACE VIEW public.v_tenant_documents
  WITH (security_invoker = true) AS
SELECT
  d.id,
  d.user_id,
  d.title,
  d.file_name,
  d.file_type,
  d.file_size,
  d.document_type,
  d.category,
  d.tags,
  d.ocr_status,
  d.summary,
  d.is_favorite,
  d.created_at,
  d.storage_path,
  d.file_url,
  l.entity_id AS tenant_id,
  l.notes     AS link_notes
FROM public.sb_documents d
JOIN public.sb_document_entity_links l
  ON l.document_id = d.id AND l.entity_type = 'tenant';

-- View: Alle Dokumente eines Zählers (für Ablesung)
CREATE OR REPLACE VIEW public.v_meter_documents
  WITH (security_invoker = true) AS
SELECT
  d.id,
  d.user_id,
  d.title,
  d.file_name,
  d.file_type,
  d.file_size,
  d.document_type,
  d.category,
  d.tags,
  d.ocr_status,
  d.summary,
  d.is_favorite,
  d.created_at,
  d.storage_path,
  d.file_url,
  l.entity_id AS meter_id,
  l.notes     AS link_notes
FROM public.sb_documents d
JOIN public.sb_document_entity_links l
  ON l.document_id = d.id AND l.entity_type = 'meter';

-- ── 5. RPC: Dokumente für eine Entität abrufen ──────────────────────────────

CREATE OR REPLACE FUNCTION public.get_documents_for_entity(
  p_entity_type TEXT,
  p_entity_id   UUID
)
RETURNS TABLE (
  id           UUID,
  title        TEXT,
  file_name    TEXT,
  file_type    TEXT,
  file_size    BIGINT,
  document_type TEXT,
  category     TEXT,
  tags         TEXT[],
  ocr_status   TEXT,
  summary      TEXT,
  is_favorite  BOOLEAN,
  created_at   TIMESTAMPTZ,
  storage_path TEXT,
  file_url     TEXT,
  link_notes   TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.title,
    d.file_name,
    d.file_type,
    d.file_size,
    d.document_type,
    d.category,
    d.tags,
    d.ocr_status,
    d.summary,
    d.is_favorite,
    d.created_at,
    d.storage_path,
    d.file_url,
    l.notes AS link_notes
  FROM public.sb_documents d
  JOIN public.sb_document_entity_links l
    ON l.document_id = d.id
   AND l.entity_type = p_entity_type
   AND l.entity_id   = p_entity_id
  WHERE d.user_id = auth.uid()
  ORDER BY d.created_at DESC;
END;
$$;

-- ── 6. RPC: Alle Entitäten eines Dokuments abrufen ──────────────────────────

CREATE OR REPLACE FUNCTION public.get_entity_links_for_document(
  p_document_id UUID
)
RETURNS TABLE (
  entity_type TEXT,
  entity_id   UUID,
  linked_at   TIMESTAMPTZ,
  notes       TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Sicherheitsprüfung: Dokument gehört dem Nutzer
  IF NOT EXISTS (
    SELECT 1 FROM public.sb_documents
    WHERE id = p_document_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT
    l.entity_type,
    l.entity_id,
    l.linked_at,
    l.notes
  FROM public.sb_document_entity_links l
  WHERE l.document_id = p_document_id
  ORDER BY l.linked_at DESC;
END;
$$;

-- ── 7. RPC: Dokument mit Entität verknüpfen ─────────────────────────────────

CREATE OR REPLACE FUNCTION public.link_document_to_entity(
  p_document_id UUID,
  p_entity_type TEXT,
  p_entity_id   UUID,
  p_notes       TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_link_id UUID;
BEGIN
  -- Sicherheitsprüfung: Dokument gehört dem Nutzer
  IF NOT EXISTS (
    SELECT 1 FROM public.sb_documents
    WHERE id = p_document_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied: document does not belong to current user';
  END IF;

  INSERT INTO public.sb_document_entity_links
    (document_id, entity_type, entity_id, linked_by, notes)
  VALUES
    (p_document_id, p_entity_type, p_entity_id, auth.uid(), p_notes)
  ON CONFLICT (document_id, entity_type, entity_id)
  DO UPDATE SET notes = EXCLUDED.notes, linked_at = now()
  RETURNING id INTO v_link_id;

  RETURN v_link_id;
END;
$$;

-- ── 8. RPC: Verknüpfung entfernen ───────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.unlink_document_from_entity(
  p_document_id UUID,
  p_entity_type TEXT,
  p_entity_id   UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Sicherheitsprüfung
  IF NOT EXISTS (
    SELECT 1 FROM public.sb_documents
    WHERE id = p_document_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  DELETE FROM public.sb_document_entity_links
  WHERE document_id = p_document_id
    AND entity_type = p_entity_type
    AND entity_id   = p_entity_id;

  RETURN FOUND;
END;
$$;

-- ── 9. STORAGE BUCKET (falls noch nicht vorhanden) ──────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'secondbrain-docs',
  'secondbrain-docs',
  false,
  52428800, -- 50 MB
  ARRAY[
    'application/pdf',
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'text/plain', 'text/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DROP POLICY IF EXISTS "SecondBrain: Users can upload own documents"
  ON storage.objects;
CREATE POLICY "SecondBrain: Users can upload own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'secondbrain-docs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "SecondBrain: Users can view own documents"
  ON storage.objects;
CREATE POLICY "SecondBrain: Users can view own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'secondbrain-docs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "SecondBrain: Users can delete own documents"
  ON storage.objects;
CREATE POLICY "SecondBrain: Users can delete own documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'secondbrain-docs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "SecondBrain: Users can update own documents"
  ON storage.objects;
CREATE POLICY "SecondBrain: Users can update own documents"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'secondbrain-docs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
