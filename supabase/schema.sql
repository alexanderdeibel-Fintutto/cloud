-- Fintutto Mieter-Checker Database Schema
-- Supabase Project: aaefocdqgdgexkcrjhks

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User tiers enum
CREATE TYPE user_tier AS ENUM ('free', 'basic', 'premium', 'professional');

-- Checker session status enum
CREATE TYPE checker_status AS ENUM ('in_progress', 'completed', 'expired');

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT,
    tier user_tier DEFAULT 'free',
    checks_used INTEGER DEFAULT 0,
    checks_limit INTEGER DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Checker sessions table
CREATE TABLE IF NOT EXISTS public.checker_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    checker_type TEXT NOT NULL,
    session_data JSONB DEFAULT '{}',
    result JSONB,
    status checker_status DEFAULT 'in_progress',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.checker_sessions ENABLE ROW LEVEL SECURITY;

-- Sessions policies
CREATE POLICY "Users can view own sessions" ON public.checker_sessions
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can create sessions" ON public.checker_sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own sessions" ON public.checker_sessions
    FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

-- Checker results table
CREATE TABLE IF NOT EXISTS public.checker_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES public.checker_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    checker_type TEXT NOT NULL,
    input_data JSONB NOT NULL,
    result_data JSONB NOT NULL,
    recommendation TEXT NOT NULL,
    form_redirect_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.checker_results ENABLE ROW LEVEL SECURITY;

-- Results policies
CREATE POLICY "Users can view own results" ON public.checker_results
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can create results" ON public.checker_results
    FOR INSERT WITH CHECK (true);

-- AI advice cache table
CREATE TABLE IF NOT EXISTS public.ai_advice_cache (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    field_key TEXT NOT NULL,
    checker_type TEXT NOT NULL,
    context_hash TEXT NOT NULL,
    advice TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- Index for cache lookups
CREATE INDEX IF NOT EXISTS idx_ai_advice_lookup
    ON public.ai_advice_cache(field_key, checker_type, context_hash);

-- Enable RLS
ALTER TABLE public.ai_advice_cache ENABLE ROW LEVEL SECURITY;

-- Cache policies (read-only for everyone)
CREATE POLICY "Anyone can read cache" ON public.ai_advice_cache
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert cache" ON public.ai_advice_cache
    FOR INSERT WITH CHECK (true);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, tier, checks_used, checks_limit)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'name',
        'free',
        0,
        3
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Function to clean expired cache entries
CREATE OR REPLACE FUNCTION public.clean_expired_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM public.ai_advice_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.checker_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_checker_type ON public.checker_sessions(checker_type);
CREATE INDEX IF NOT EXISTS idx_results_user_id ON public.checker_results(user_id);
CREATE INDEX IF NOT EXISTS idx_results_checker_type ON public.checker_results(checker_type);
