-- ============================================================
-- FINTUTTO DOMAIN MANAGEMENT
-- Supabase Migration for Admin Hub
-- ============================================================

-- Status-Enums
CREATE TYPE domain_health AS ENUM ('healthy', 'warning', 'critical', 'unknown');
CREATE TYPE check_status AS ENUM ('online', 'offline', 'redirect', 'error', 'pending');
CREATE TYPE page_workflow AS ENUM ('nicht_begonnen', 'in_bearbeitung', 'geprueft', 'fertig');

-- ============================================================
-- 1. DOMAINS - Alle Fintutto-Seiten
-- ============================================================
CREATE TABLE public.domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'app',
  repo_name TEXT,
  deploy_url TEXT,

  -- Health
  health domain_health DEFAULT 'unknown',
  last_check_at TIMESTAMPTZ,
  http_code INTEGER,
  response_time_ms INTEGER,
  has_ssl BOOLEAN DEFAULT false,
  ssl_expires_at TIMESTAMPTZ,

  -- SEO Basics
  page_title TEXT,
  meta_description TEXT,
  has_ga BOOLEAN DEFAULT false,
  has_gtm BOOLEAN DEFAULT false,
  has_impressum BOOLEAN DEFAULT false,
  has_datenschutz BOOLEAN DEFAULT false,

  -- Counts (auto-updated via trigger)
  total_pages INTEGER DEFAULT 0,
  pages_online INTEGER DEFAULT 0,
  pages_offline INTEGER DEFAULT 0,
  pages_checked INTEGER DEFAULT 0,
  pages_fertig INTEGER DEFAULT 0,

  -- Workflow
  setup_complete BOOLEAN DEFAULT false,
  notes TEXT,
  priority INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. PAGES - Alle Unterseiten pro Domain
-- ============================================================
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID NOT NULL REFERENCES public.domains(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  path TEXT NOT NULL,

  -- Status
  status check_status DEFAULT 'pending',
  http_code INTEGER,
  redirect_url TEXT,
  response_time_ms INTEGER,
  last_check_at TIMESTAMPTZ,

  -- SEO
  page_title TEXT,
  meta_description TEXT,
  h1 TEXT,
  has_canonical BOOLEAN DEFAULT false,
  has_og_tags BOOLEAN DEFAULT false,
  word_count INTEGER DEFAULT 0,

  -- Workflow (Checkboxen!)
  workflow page_workflow DEFAULT 'nicht_begonnen',
  checked_links BOOLEAN DEFAULT false,
  checked_seo BOOLEAN DEFAULT false,
  checked_content BOOLEAN DEFAULT false,
  checked_design BOOLEAN DEFAULT false,
  checked_mobile BOOLEAN DEFAULT false,
  checked_legal BOOLEAN DEFAULT false,

  -- Internal links on this page
  internal_links_count INTEGER DEFAULT 0,
  external_links_count INTEGER DEFAULT 0,
  broken_links_count INTEGER DEFAULT 0,

  notes TEXT,
  depth INTEGER DEFAULT 0,
  discovered_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(domain_id, path)
);

-- ============================================================
-- 3. LINKS - Jeder einzelne Link auf jeder Seite
-- ============================================================
CREATE TABLE public.page_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  domain_id UUID NOT NULL REFERENCES public.domains(id) ON DELETE CASCADE,

  url TEXT NOT NULL,
  anchor_text TEXT,
  link_type TEXT DEFAULT 'internal', -- internal, external, mailto, tel, anchor

  -- Status
  status check_status DEFAULT 'pending',
  http_code INTEGER,
  redirect_url TEXT,
  last_check_at TIMESTAMPTZ,

  -- Workflow Checkbox
  is_checked BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  needs_fix BOOLEAN DEFAULT false,
  fix_note TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 4. CHECK HISTORY - Protokoll aller Prüfungen
-- ============================================================
CREATE TABLE public.check_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID REFERENCES public.domains(id) ON DELETE CASCADE,
  page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
  link_id UUID REFERENCES public.page_links(id) ON DELETE CASCADE,

  check_type TEXT NOT NULL, -- 'domain', 'page', 'link'
  status check_status NOT NULL,
  http_code INTEGER,
  response_time_ms INTEGER,
  error_message TEXT,

  checked_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 5. CRAWL JOBS - Crawl-Aufträge
-- ============================================================
CREATE TABLE public.crawl_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID NOT NULL REFERENCES public.domains(id) ON DELETE CASCADE,

  status TEXT DEFAULT 'pending', -- pending, running, completed, failed
  max_depth INTEGER DEFAULT 3,
  pages_found INTEGER DEFAULT 0,
  links_found INTEGER DEFAULT 0,
  pages_checked INTEGER DEFAULT 0,

  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_pages_domain ON public.pages(domain_id);
CREATE INDEX idx_pages_status ON public.pages(status);
CREATE INDEX idx_pages_workflow ON public.pages(workflow);
CREATE INDEX idx_page_links_page ON public.page_links(page_id);
CREATE INDEX idx_page_links_domain ON public.page_links(domain_id);
CREATE INDEX idx_page_links_status ON public.page_links(status);
CREATE INDEX idx_page_links_needs_fix ON public.page_links(needs_fix) WHERE needs_fix = true;
CREATE INDEX idx_check_history_domain ON public.check_history(domain_id);
CREATE INDEX idx_check_history_checked_at ON public.check_history(checked_at);
CREATE INDEX idx_crawl_jobs_domain ON public.crawl_jobs(domain_id);

-- ============================================================
-- TRIGGER: Auto-update domain counts
-- ============================================================
CREATE OR REPLACE FUNCTION update_domain_counts()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.domains SET
    total_pages = (SELECT COUNT(*) FROM public.pages WHERE domain_id = COALESCE(NEW.domain_id, OLD.domain_id)),
    pages_online = (SELECT COUNT(*) FROM public.pages WHERE domain_id = COALESCE(NEW.domain_id, OLD.domain_id) AND status = 'online'),
    pages_offline = (SELECT COUNT(*) FROM public.pages WHERE domain_id = COALESCE(NEW.domain_id, OLD.domain_id) AND status IN ('offline', 'error')),
    pages_checked = (SELECT COUNT(*) FROM public.pages WHERE domain_id = COALESCE(NEW.domain_id, OLD.domain_id) AND last_check_at IS NOT NULL),
    pages_fertig = (SELECT COUNT(*) FROM public.pages WHERE domain_id = COALESCE(NEW.domain_id, OLD.domain_id) AND workflow = 'fertig'),
    updated_at = now()
  WHERE id = COALESCE(NEW.domain_id, OLD.domain_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_domain_counts
AFTER INSERT OR UPDATE OR DELETE ON public.pages
FOR EACH ROW EXECUTE FUNCTION update_domain_counts();

-- ============================================================
-- TRIGGER: Auto-update page link counts
-- ============================================================
CREATE OR REPLACE FUNCTION update_page_link_counts()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.pages SET
    internal_links_count = (SELECT COUNT(*) FROM public.page_links WHERE page_id = COALESCE(NEW.page_id, OLD.page_id) AND link_type = 'internal'),
    external_links_count = (SELECT COUNT(*) FROM public.page_links WHERE page_id = COALESCE(NEW.page_id, OLD.page_id) AND link_type = 'external'),
    broken_links_count = (SELECT COUNT(*) FROM public.page_links WHERE page_id = COALESCE(NEW.page_id, OLD.page_id) AND status IN ('offline', 'error')),
    updated_at = now()
  WHERE id = COALESCE(NEW.page_id, OLD.page_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_page_link_counts
AFTER INSERT OR UPDATE OR DELETE ON public.page_links
FOR EACH ROW EXECUTE FUNCTION update_page_link_counts();

-- ============================================================
-- RLS Policies
-- ============================================================
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crawl_jobs ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read/write everything (admin app)
CREATE POLICY "Admin full access domains" ON public.domains FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access pages" ON public.pages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access page_links" ON public.page_links FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access check_history" ON public.check_history FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access crawl_jobs" ON public.crawl_jobs FOR ALL USING (auth.role() = 'authenticated');
