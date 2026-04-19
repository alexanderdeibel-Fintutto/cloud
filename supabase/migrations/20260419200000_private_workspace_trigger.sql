-- Migration: Automatischer Private Workspace beim ersten Login (Ich-AG-Konzept)
-- Jeder neue User bekommt automatisch einen persönlichen Workspace (Private Organization)
-- ohne dass er je nach "Organisation" gefragt wird.

-- 1. organizations.type Spalte hinzufügen
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'private'
  CHECK (type IN ('private', 'company', 'association'));

-- 2. handle_new_user Trigger erweitern: Profile + Private Workspace anlegen
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id UUID;
  existing_org_id UUID;
BEGIN
  -- 2a. Profil anlegen (idempotent)
  INSERT INTO public.profiles (
    id, email, full_name, first_name, last_name,
    role, status, onboarding_completed, app_source,
    first_seen_at, last_active_at, created_at, updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'viewer', 'active', false,
    COALESCE(NEW.raw_user_meta_data->>'app_source', 'unknown'),
    NOW(), NOW(), NOW(), NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  -- 2b. Prüfen ob bereits eine organization_id gesetzt ist
  SELECT organization_id INTO existing_org_id
  FROM public.profiles WHERE id = NEW.id;

  -- 2c. Private Workspace anlegen wenn noch keine org_id vorhanden
  IF existing_org_id IS NULL THEN
    INSERT INTO public.organizations (name, type, app_source, created_at, updated_at)
    VALUES (
      'Mein Bereich',
      'private',
      COALESCE(NEW.raw_user_meta_data->>'app_source', 'unknown'),
      NOW(),
      NOW()
    )
    RETURNING id INTO new_org_id;

    UPDATE public.profiles
    SET organization_id = new_org_id
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

-- 3. Trigger neu erstellen
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Bestehende User ohne organization_id nachrüsten (Einmal-Migration)
DO $$
DECLARE
  p RECORD;
  new_org_id UUID;
BEGIN
  FOR p IN
    SELECT id, email FROM public.profiles WHERE organization_id IS NULL
  LOOP
    -- Prüfen ob bereits eine private org für diesen User existiert
    SELECT id INTO new_org_id
    FROM public.organizations
    WHERE type = 'private'
    LIMIT 1;

    -- Neue private org anlegen
    INSERT INTO public.organizations (name, type, app_source, created_at, updated_at)
    VALUES ('Mein Bereich', 'private', 'migration', NOW(), NOW())
    RETURNING id INTO new_org_id;

    UPDATE public.profiles
    SET organization_id = new_org_id
    WHERE id = p.id;

    RAISE NOTICE 'Private workspace created for user %', p.email;
  END LOOP;
END;
$$;
