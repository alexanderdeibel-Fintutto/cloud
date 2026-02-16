-- Migration: Add monetization tables
-- Affiliate tracking, newsletter subscribers, one-time purchases

-- ============================================
-- 1. Newsletter Subscribers
-- ============================================
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    segment TEXT DEFAULT 'general', -- mieter, vermieter, kombi, general
    source TEXT, -- footer, checker-hub, rechner-hub, formulare-hub, exit-popup
    confirmed BOOLEAN DEFAULT FALSE,
    confirm_token UUID DEFAULT uuid_generate_v4(),
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    unsubscribed_at TIMESTAMPTZ,
    active BOOLEAN DEFAULT TRUE
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (insert), but only service role can read all
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own subscription" ON public.newsletter_subscribers
    FOR SELECT USING (email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can update own subscription" ON public.newsletter_subscribers
    FOR UPDATE USING (email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON public.newsletter_subscribers(active) WHERE active = TRUE;

-- ============================================
-- 2. Affiliate Click Tracking
-- ============================================
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    session_id TEXT, -- anonymous session tracking
    partner_id TEXT NOT NULL, -- arag, kautionsfrei, interhyp etc.
    partner_category TEXT NOT NULL, -- rechtsschutz, kaution, finanzierung etc.
    source_checker TEXT, -- mietpreisbremse, kaution etc.
    source_page TEXT, -- result, hub, sidebar
    clicked_at TIMESTAMPTZ DEFAULT NOW(),
    converted BOOLEAN DEFAULT FALSE,
    converted_at TIMESTAMPTZ,
    revenue DECIMAL(10,2) DEFAULT 0
);

ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- Anyone can log clicks
CREATE POLICY "Anyone can log clicks" ON public.affiliate_clicks
    FOR INSERT WITH CHECK (true);

-- Users can view own clicks
CREATE POLICY "Users can view own clicks" ON public.affiliate_clicks
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE INDEX IF NOT EXISTS idx_affiliate_partner ON public.affiliate_clicks(partner_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_source ON public.affiliate_clicks(source_checker);
CREATE INDEX IF NOT EXISTS idx_affiliate_date ON public.affiliate_clicks(clicked_at);

-- ============================================
-- 3. One-Time Purchases
-- ============================================
CREATE TYPE purchase_product AS ENUM (
    'single_pdf_export',
    'full_checker_analysis',
    'ai_legal_report',
    'vermieter_complete_pack',
    'annual_nebenkosten_report'
);

CREATE TABLE IF NOT EXISTS public.one_time_purchases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    product_type purchase_product NOT NULL,
    stripe_payment_intent_id TEXT,
    stripe_checkout_session_id TEXT,
    amount INTEGER NOT NULL, -- in cents
    currency TEXT DEFAULT 'eur',
    status TEXT DEFAULT 'pending', -- pending, completed, refunded
    metadata JSONB DEFAULT '{}', -- checker_type, result_id etc.
    purchased_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

ALTER TABLE public.one_time_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases" ON public.one_time_purchases
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create purchases" ON public.one_time_purchases
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Service can update purchases" ON public.one_time_purchases
    FOR UPDATE USING (true);

CREATE INDEX IF NOT EXISTS idx_purchases_user ON public.one_time_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_stripe ON public.one_time_purchases(stripe_checkout_session_id);

-- ============================================
-- 4. Lead Requests (für Anwalts-/Makler-Vermittlung)
-- ============================================
CREATE TABLE IF NOT EXISTS public.lead_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    lead_type TEXT NOT NULL, -- anwalt, makler, handwerker, finanzberater
    name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    plz TEXT,
    bundesland TEXT,
    checker_type TEXT, -- welcher Checker das Lead ausgelöst hat
    checker_result_id UUID REFERENCES public.checker_results(id) ON DELETE SET NULL,
    context JSONB DEFAULT '{}', -- zusätzliche Informationen
    partner_id TEXT, -- an welchen Partner vermittelt
    status TEXT DEFAULT 'pending', -- pending, sent, contacted, converted
    revenue DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    converted_at TIMESTAMPTZ
);

ALTER TABLE public.lead_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own leads" ON public.lead_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create leads" ON public.lead_requests
    FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_leads_type ON public.lead_requests(lead_type);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.lead_requests(status);
CREATE INDEX IF NOT EXISTS idx_leads_plz ON public.lead_requests(plz);

-- ============================================
-- 5. Monetization Events (unified analytics)
-- ============================================
CREATE TABLE IF NOT EXISTS public.monetization_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_type TEXT NOT NULL, -- subscription, one_time, affiliate_click, affiliate_conversion, lead_created, lead_converted
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    source TEXT, -- checker, rechner, formulare, hub, newsletter
    source_detail TEXT, -- specific checker/rechner name
    revenue DECIMAL(10,2) DEFAULT 0,
    currency TEXT DEFAULT 'eur',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.monetization_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service can manage events" ON public.monetization_events
    FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_monevents_type ON public.monetization_events(event_type);
CREATE INDEX IF NOT EXISTS idx_monevents_date ON public.monetization_events(created_at);
CREATE INDEX IF NOT EXISTS idx_monevents_user ON public.monetization_events(user_id);
