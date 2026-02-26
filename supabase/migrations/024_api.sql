-- 024_api.sql
-- B2B API Service: API-Keys, Usage-Tracking, Rate Limiting

CREATE TABLE IF NOT EXISTS public.api_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'startup', 'pro', 'enterprise')),
  monthly_limit INT DEFAULT 1000,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_clients_user ON public.api_clients(user_id);
ALTER TABLE public.api_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_api_clients" ON public.api_clients FOR ALL USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.api_clients(id) ON DELETE CASCADE NOT NULL,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL, -- first 8 chars for identification (e.g. "ft_live_")
  name TEXT DEFAULT 'Default',
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_api_keys" ON public.api_keys
  FOR ALL USING (
    client_id IN (SELECT id FROM public.api_clients WHERE user_id = auth.uid())
  );

CREATE TABLE IF NOT EXISTS public.api_usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.api_clients(id) ON DELETE CASCADE NOT NULL,
  key_id UUID REFERENCES public.api_keys(id) ON DELETE SET NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL DEFAULT 'GET',
  status_code INT,
  response_time_ms INT,
  called_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partitioned index for fast queries on recent data
CREATE INDEX idx_api_usage_client_date ON public.api_usage_logs(client_id, called_at DESC);

-- Usage summary per billing period
CREATE TABLE IF NOT EXISTS public.api_usage_summary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.api_clients(id) ON DELETE CASCADE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_calls INT DEFAULT 0,
  billed BOOLEAN DEFAULT false,
  stripe_usage_record_id TEXT,
  UNIQUE(client_id, period_start)
);

ALTER TABLE public.api_usage_summary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_usage" ON public.api_usage_summary
  FOR ALL USING (
    client_id IN (SELECT id FROM public.api_clients WHERE user_id = auth.uid())
  );
