-- SecondBrain Power-Upgrade: Companies, Document Types, Deadlines, Notes, Workflows, App-Links
-- Migration 002

-- ============================================================
-- COMPANIES (Firmen)
-- ============================================================
CREATE TABLE IF NOT EXISTS sb_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  short_name TEXT, -- Kurzname für Tags/Labels
  tax_id TEXT, -- Steuernummer
  description TEXT,
  color TEXT DEFAULT '#3b82f6',
  icon TEXT DEFAULT 'building',
  is_default BOOLEAN DEFAULT false, -- Privat/Standard-Firma
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sb_companies_user_id ON sb_companies(user_id);

-- ============================================================
-- ADD COLUMNS TO sb_documents
-- ============================================================
ALTER TABLE sb_documents ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES sb_companies(id) ON DELETE SET NULL;
ALTER TABLE sb_documents ADD COLUMN IF NOT EXISTS document_type TEXT DEFAULT 'other';
  -- rechnung, brief, beleg, vertrag, bescheid, mahnung, quittung, angebot, kündigung, sonstiges
ALTER TABLE sb_documents ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'));
ALTER TABLE sb_documents ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'inbox' CHECK (status IN ('inbox', 'processing', 'reviewed', 'action_required', 'done', 'archived'));
ALTER TABLE sb_documents ADD COLUMN IF NOT EXISTS sender TEXT; -- Absender
ALTER TABLE sb_documents ADD COLUMN IF NOT EXISTS receiver TEXT; -- Empfänger
ALTER TABLE sb_documents ADD COLUMN IF NOT EXISTS document_date DATE; -- Datum des Dokuments selbst
ALTER TABLE sb_documents ADD COLUMN IF NOT EXISTS amount DECIMAL(12,2); -- Betrag bei Rechnungen/Belegen
ALTER TABLE sb_documents ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR';
ALTER TABLE sb_documents ADD COLUMN IF NOT EXISTS reference_number TEXT; -- Rechnungsnummer, Aktenzeichen etc.
ALTER TABLE sb_documents ADD COLUMN IF NOT EXISTS notes TEXT; -- Bearbeitbare Notizen / Quick-Finder
ALTER TABLE sb_documents ADD COLUMN IF NOT EXISTS workflow_status TEXT DEFAULT 'none';
  -- none, pending_review, pending_response, pending_payment, forwarded, completed

CREATE INDEX IF NOT EXISTS idx_sb_documents_company ON sb_documents(company_id) WHERE company_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sb_documents_type ON sb_documents(user_id, document_type);
CREATE INDEX IF NOT EXISTS idx_sb_documents_status ON sb_documents(user_id, status);
CREATE INDEX IF NOT EXISTS idx_sb_documents_priority ON sb_documents(user_id, priority) WHERE priority IN ('high', 'urgent');

-- ============================================================
-- DEADLINES (Fristen)
-- ============================================================
CREATE TABLE IF NOT EXISTS sb_deadlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES sb_documents(id) ON DELETE CASCADE,
  title TEXT NOT NULL, -- z.B. "Widerspruchsfrist Bescheid"
  description TEXT,
  deadline_date DATE NOT NULL,
  reminder_date DATE, -- Erinnerung X Tage vorher
  deadline_type TEXT DEFAULT 'general', -- widerspruch, zahlung, kündigung, frist, termin, general
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  priority TEXT DEFAULT 'high' CHECK (priority IN ('normal', 'high', 'urgent')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sb_deadlines_user_id ON sb_deadlines(user_id);
CREATE INDEX IF NOT EXISTS idx_sb_deadlines_date ON sb_deadlines(user_id, deadline_date) WHERE is_completed = false;
CREATE INDEX IF NOT EXISTS idx_sb_deadlines_document ON sb_deadlines(document_id);

-- ============================================================
-- DOCUMENT LINKS (Cross-App Routing / Weiterleitungen)
-- ============================================================
CREATE TABLE IF NOT EXISTS sb_document_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES sb_documents(id) ON DELETE CASCADE,
  target_app TEXT NOT NULL, -- fintutto-portal, financial-compass, bescheidboxer, etc.
  target_category TEXT, -- Kategorie in der Ziel-App
  link_type TEXT DEFAULT 'reference', -- reference, forwarded, synced
  metadata JSONB DEFAULT '{}', -- App-spezifische Daten
  linked_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sb_document_links_user ON sb_document_links(user_id);
CREATE INDEX IF NOT EXISTS idx_sb_document_links_doc ON sb_document_links(document_id);

-- ============================================================
-- WORKFLOW TEMPLATES
-- ============================================================
CREATE TABLE IF NOT EXISTS sb_workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL = system template
  name TEXT NOT NULL,
  description TEXT,
  document_type TEXT, -- Für welchen Dokumenttyp
  steps JSONB NOT NULL DEFAULT '[]',
  -- Array of: { step: 1, action: "review|categorize|forward|respond|archive", label: "...", target_app?: "..." }
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE sb_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE sb_deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE sb_document_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE sb_workflow_templates ENABLE ROW LEVEL SECURITY;

-- Companies
CREATE POLICY "Users can view own companies" ON sb_companies
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own companies" ON sb_companies
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own companies" ON sb_companies
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own companies" ON sb_companies
  FOR DELETE USING (auth.uid() = user_id);

-- Deadlines
CREATE POLICY "Users can view own deadlines" ON sb_deadlines
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own deadlines" ON sb_deadlines
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own deadlines" ON sb_deadlines
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own deadlines" ON sb_deadlines
  FOR DELETE USING (auth.uid() = user_id);

-- Document Links
CREATE POLICY "Users can view own document links" ON sb_document_links
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own document links" ON sb_document_links
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own document links" ON sb_document_links
  FOR DELETE USING (auth.uid() = user_id);

-- Workflow Templates (own + system)
CREATE POLICY "Users can view own and system workflows" ON sb_workflow_templates
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can insert own workflows" ON sb_workflow_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workflows" ON sb_workflow_templates
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workflows" ON sb_workflow_templates
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGERS
-- ============================================================
CREATE TRIGGER sb_companies_updated_at
  BEFORE UPDATE ON sb_companies
  FOR EACH ROW EXECUTE FUNCTION sb_update_updated_at();

CREATE TRIGGER sb_deadlines_updated_at
  BEFORE UPDATE ON sb_deadlines
  FOR EACH ROW EXECUTE FUNCTION sb_update_updated_at();

-- ============================================================
-- SEED: Default Document Types (German)
-- ============================================================
-- These are used as constants in the app, not stored in DB.
-- Document types: rechnung, brief, beleg, vertrag, bescheid, mahnung,
--   quittung, angebot, kündigung, kontoauszug, steuerbescheid,
--   versicherung, lohnabrechnung, mietvertrag, other

-- ============================================================
-- SEED: Default Workflow Templates
-- ============================================================
INSERT INTO sb_workflow_templates (user_id, name, description, document_type, steps) VALUES
(NULL, 'Rechnung bearbeiten', 'Standard-Workflow für eingehende Rechnungen', 'rechnung',
  '[{"step":1,"action":"review","label":"Rechnung prüfen"},{"step":2,"action":"categorize","label":"Firma & Projekt zuordnen"},{"step":3,"action":"forward","label":"An Financial Compass weiterleiten","target_app":"financial-compass"},{"step":4,"action":"archive","label":"Archivieren"}]'::jsonb),
(NULL, 'Brief beantworten', 'Standard-Workflow für eingehende Briefe', 'brief',
  '[{"step":1,"action":"review","label":"Brief lesen & analysieren"},{"step":2,"action":"respond","label":"Antwort verfassen"},{"step":3,"action":"archive","label":"Archivieren"}]'::jsonb),
(NULL, 'Bescheid prüfen', 'Workflow für Behörden-Bescheide mit Fristüberwachung', 'bescheid',
  '[{"step":1,"action":"review","label":"Bescheid analysieren"},{"step":2,"action":"categorize","label":"Fristen ermitteln & eintragen"},{"step":3,"action":"respond","label":"Widerspruch prüfen"},{"step":4,"action":"archive","label":"Archivieren"}]'::jsonb),
(NULL, 'Vertrag ablegen', 'Standard-Workflow für Verträge', 'vertrag',
  '[{"step":1,"action":"review","label":"Vertrag prüfen"},{"step":2,"action":"categorize","label":"Laufzeit & Kündigungsfrist eintragen"},{"step":3,"action":"archive","label":"Archivieren"}]'::jsonb),
(NULL, 'Beleg erfassen', 'Schnell-Workflow für Belege und Quittungen', 'beleg',
  '[{"step":1,"action":"categorize","label":"Betrag & Kategorie zuordnen"},{"step":2,"action":"forward","label":"An FinTutto weiterleiten","target_app":"fintutto-portal"},{"step":3,"action":"archive","label":"Archivieren"}]'::jsonb)
ON CONFLICT DO NOTHING;
