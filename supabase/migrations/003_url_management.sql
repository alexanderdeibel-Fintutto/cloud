-- URL Management Tables for Fintutto Ecosystem
-- Tracks all domains, their pages/sub-links, and check history

-- Domain status enum
CREATE TYPE domain_status AS ENUM ('active', 'inactive', 'error', 'pending');

-- Link check status enum
CREATE TYPE link_status AS ENUM ('online', 'offline', 'redirect', 'error', 'pending', 'timeout');

-- ============================================================
-- DOMAINS: Top-level sites in the ecosystem
-- ============================================================
CREATE TABLE IF NOT EXISTS public.domains (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    url TEXT NOT NULL UNIQUE,
    label TEXT,                              -- z.B. "BescheidBoxer", "Fintutto Portal"
    category TEXT,                           -- z.B. "checker", "portal", "landing", "formular"
    status domain_status DEFAULT 'pending',
    http_code INTEGER,
    has_ssl BOOLEAN DEFAULT false,
    has_ga BOOLEAN DEFAULT false,
    has_gtm BOOLEAN DEFAULT false,
    page_title TEXT,
    meta_description TEXT,
    redirect_url TEXT,
    last_checked_at TIMESTAMPTZ,
    total_pages INTEGER DEFAULT 0,
    pages_online INTEGER DEFAULT 0,
    pages_offline INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view domains" ON public.domains
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage domains" ON public.domains
    FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- PAGES: Individual pages/sub-links per domain
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    domain_id UUID REFERENCES public.domains(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    path TEXT,                               -- z.B. "/impressum", "/datenschutz"
    status link_status DEFAULT 'pending',
    http_code INTEGER,
    page_title TEXT,
    meta_description TEXT,
    h1_text TEXT,
    redirect_url TEXT,
    has_ga BOOLEAN DEFAULT false,
    has_gtm BOOLEAN DEFAULT false,
    has_canonical BOOLEAN DEFAULT false,
    has_og_tags BOOLEAN DEFAULT false,
    has_impressum_link BOOLEAN DEFAULT false,
    has_datenschutz_link BOOLEAN DEFAULT false,
    word_count INTEGER,
    depth INTEGER DEFAULT 0,                 -- Crawl-Tiefe (0 = Startseite)
    discovered_by TEXT,                      -- 'manual', 'crawler', 'sitemap'
    last_checked_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(domain_id, path)
);

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view pages" ON public.pages
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage pages" ON public.pages
    FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- LINK CHECKS: History of individual URL checks
-- ============================================================
CREATE TABLE IF NOT EXISTS public.link_checks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
    domain_id UUID REFERENCES public.domains(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    status link_status NOT NULL,
    http_code INTEGER,
    response_time_ms INTEGER,
    redirect_url TEXT,
    error_message TEXT,
    checked_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.link_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view link_checks" ON public.link_checks
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage link_checks" ON public.link_checks
    FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- CRAWL JOBS: Track crawl sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.crawl_jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    domain_id UUID REFERENCES public.domains(id) ON DELETE CASCADE,
    started_by UUID REFERENCES public.users(id),
    status TEXT DEFAULT 'running',           -- 'running', 'completed', 'failed', 'cancelled'
    pages_found INTEGER DEFAULT 0,
    pages_checked INTEGER DEFAULT 0,
    pages_online INTEGER DEFAULT 0,
    pages_offline INTEGER DEFAULT 0,
    max_depth INTEGER DEFAULT 3,
    error_message TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

ALTER TABLE public.crawl_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view crawl_jobs" ON public.crawl_jobs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage crawl_jobs" ON public.crawl_jobs
    FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_pages_domain_id ON public.pages(domain_id);
CREATE INDEX IF NOT EXISTS idx_pages_status ON public.pages(status);
CREATE INDEX IF NOT EXISTS idx_pages_url ON public.pages(url);
CREATE INDEX IF NOT EXISTS idx_link_checks_page_id ON public.link_checks(page_id);
CREATE INDEX IF NOT EXISTS idx_link_checks_domain_id ON public.link_checks(domain_id);
CREATE INDEX IF NOT EXISTS idx_link_checks_checked_at ON public.link_checks(checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_domains_status ON public.domains(status);
CREATE INDEX IF NOT EXISTS idx_domains_category ON public.domains(category);
CREATE INDEX IF NOT EXISTS idx_crawl_jobs_domain_id ON public.crawl_jobs(domain_id);

-- ============================================================
-- TRIGGERS
-- ============================================================
CREATE TRIGGER update_domains_updated_at
    BEFORE UPDATE ON public.domains
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_pages_updated_at
    BEFORE UPDATE ON public.pages
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- FUNCTION: Update domain stats after page checks
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_domain_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.domains SET
        total_pages = (SELECT COUNT(*) FROM public.pages WHERE domain_id = NEW.domain_id),
        pages_online = (SELECT COUNT(*) FROM public.pages WHERE domain_id = NEW.domain_id AND status = 'online'),
        pages_offline = (SELECT COUNT(*) FROM public.pages WHERE domain_id = NEW.domain_id AND status IN ('offline', 'error', 'timeout'))
    WHERE id = NEW.domain_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_domain_stats_on_page_change
    AFTER INSERT OR UPDATE OF status ON public.pages
    FOR EACH ROW EXECUTE FUNCTION public.update_domain_stats();
