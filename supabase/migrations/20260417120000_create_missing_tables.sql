-- Migration: Fehlende Tabellen für Vermietify erstellen
-- Erstellt: 2026-04-17

-- ============================================================
-- 1. organizations Tabelle
-- ============================================================
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  tax_number TEXT,
  vat_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'organizations' AND policyname = 'Users can view their organization') THEN
    CREATE POLICY "Users can view their organization"
      ON public.organizations FOR SELECT
      USING (
        id IN (
          SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'organizations' AND policyname = 'Admins can update their organization') THEN
    CREATE POLICY "Admins can update their organization"
      ON public.organizations FOR UPDATE
      USING (
        id IN (
          SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
      );
  END IF;
END $$;

-- Für bestehende Nutzer: Organisation aus profiles.organization_id erstellen falls noch nicht vorhanden
INSERT INTO public.organizations (id, name, created_at, updated_at)
SELECT DISTINCT p.organization_id, 'Meine Organisation', now(), now()
FROM public.profiles p
WHERE p.organization_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.organizations o WHERE o.id = p.organization_id)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. calendar_events Tabelle
-- ============================================================
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'other',
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  all_day BOOLEAN NOT NULL DEFAULT false,
  location TEXT,
  related_type TEXT,
  related_id UUID,
  recurrence_rule JSONB,
  reminder_minutes INTEGER[],
  color TEXT,
  is_auto_generated BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'calendar_events' AND policyname = 'Users can manage calendar events') THEN
    CREATE POLICY "Users can manage calendar events"
      ON public.calendar_events FOR ALL
      USING (
        organization_id IN (
          SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
      );
  END IF;
END $$;

-- ============================================================
-- 3. calendar_ical_tokens Tabelle
-- ============================================================
CREATE TABLE IF NOT EXISTS public.calendar_ical_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  name TEXT NOT NULL DEFAULT 'iCal Feed',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.calendar_ical_tokens ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'calendar_ical_tokens' AND policyname = 'Users can manage their ical tokens') THEN
    CREATE POLICY "Users can manage their ical tokens"
      ON public.calendar_ical_tokens FOR ALL
      USING (user_id = auth.uid());
  END IF;
END $$;

-- ============================================================
-- 4. finapi_connections Tabelle
-- ============================================================
CREATE TABLE IF NOT EXISTS public.finapi_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  finapi_user_id TEXT,
  bank_id TEXT NOT NULL DEFAULT '',
  bank_name TEXT NOT NULL DEFAULT '',
  bank_logo_url TEXT,
  bank_bic TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'connected', 'error', 'update_required', 'disconnected')),
  last_sync_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.finapi_connections ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'finapi_connections' AND policyname = 'Users can manage finapi connections') THEN
    CREATE POLICY "Users can manage finapi connections"
      ON public.finapi_connections FOR ALL
      USING (
        organization_id IN (
          SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
      );
  END IF;
END $$;

-- ============================================================
-- 5. transaction_rules Tabelle
-- ============================================================
CREATE TABLE IF NOT EXISTS public.transaction_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  conditions JSONB NOT NULL DEFAULT '[]',
  action_type TEXT NOT NULL CHECK (action_type IN ('assign_tenant', 'book_as', 'ignore')),
  action_config JSONB NOT NULL DEFAULT '{}',
  priority INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  match_count INTEGER NOT NULL DEFAULT 0,
  last_match_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transaction_rules ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transaction_rules' AND policyname = 'Users can manage transaction rules') THEN
    CREATE POLICY "Users can manage transaction rules"
      ON public.transaction_rules FOR ALL
      USING (
        organization_id IN (
          SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
      );
  END IF;
END $$;

-- ============================================================
-- 6. organization_id zu utility_costs hinzufügen
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'utility_costs' AND column_name = 'organization_id' AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.utility_costs ADD COLUMN organization_id UUID;
    -- organization_id aus buildings.organization_id befüllen
    UPDATE public.utility_costs uc
    SET organization_id = b.organization_id
    FROM public.buildings b
    WHERE uc.building_id = b.id;
  END IF;
END $$;

-- ============================================================
-- 7. organization_id zu finapi_connections in bank_accounts hinzufügen
--    (bank_accounts hat connection_id -> finapi_connections.id)
-- ============================================================
-- Sicherstellen dass bank_accounts.connection_id auf finapi_connections zeigt
-- (bereits korrekt durch FK)
