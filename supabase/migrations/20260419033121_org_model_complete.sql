-- ============================================================
-- Migration: Vollständiges Organisations-Modell
-- Datum: 2026-04-19
-- Ziel:  Hausverwaltungen können als Organisation mehrere
--        Mitarbeiter haben, die gemeinsam auf Objekte, Einheiten
--        und Mieter zugreifen. Jeder Nutzer kann Mitglied einer
--        oder mehrerer Organisationen sein.
-- ============================================================

-- ============ TABELLE: organizations ============

CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    -- Typ der Organisation
    type TEXT NOT NULL DEFAULT 'property_management'
        CHECK (type IN ('property_management', 'tax_advisor', 'caretaker', 'personal')),
    -- Logo-URL (optional)
    logo_url TEXT,
    -- Kontaktdaten
    email TEXT,
    phone TEXT,
    address TEXT,
    -- Abonnement-Stufe (für zukünftige Monetarisierung)
    plan TEXT NOT NULL DEFAULT 'free'
        CHECK (plan IN ('free', 'starter', 'professional', 'enterprise')),
    -- Eigentümer der Organisation
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organizations_owner ON public.organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);

-- ============ TABELLE: organization_members ============

CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    -- Rolle in der Organisation
    role TEXT NOT NULL DEFAULT 'member'
        CHECK (role IN ('owner', 'admin', 'manager', 'member', 'viewer')),
    -- Einladungs-Status
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('invited', 'active', 'suspended')),
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Jeder Nutzer kann nur einmal Mitglied einer Organisation sein
    UNIQUE(organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_org ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.organization_members(user_id);

-- ============ TABELLE: organization_invitations ============

CREATE TABLE IF NOT EXISTS public.organization_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member'
        CHECK (role IN ('admin', 'manager', 'member', 'viewer')),
    token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    invited_by UUID NOT NULL REFERENCES auth.users(id),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, email)
);

CREATE INDEX IF NOT EXISTS idx_org_invitations_token ON public.organization_invitations(token);
CREATE INDEX IF NOT EXISTS idx_org_invitations_email ON public.organization_invitations(email);

-- ============ TRIGGER: updated_at ============

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============ HILFSFUNKTIONEN ============

-- Gibt die Rolle eines Nutzers in einer Organisation zurück
CREATE OR REPLACE FUNCTION public.get_org_role(p_organization_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.organization_members
  WHERE organization_id = p_organization_id
    AND user_id = auth.uid()
    AND status = 'active';
$$;

-- Prüft ob der Nutzer Admin oder Owner einer Organisation ist
CREATE OR REPLACE FUNCTION public.is_org_admin(p_organization_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = p_organization_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
      AND status = 'active'
  );
$$;

-- Aktualisierte is_org_member Funktion (nutzt organization_members statt profiles)
CREATE OR REPLACE FUNCTION public.is_org_member(p_organization_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = p_organization_id
      AND user_id = auth.uid()
      AND status = 'active'
  )
  OR
  -- Fallback: profiles.organization_id (Legacy-Kompatibilität)
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND organization_id = p_organization_id
  );
$$;

-- ============ BACKFILL: Bestehende Nutzer in organizations migrieren ============
-- Nutzer mit organization_id in profiles bekommen eine organizations-Zeile

INSERT INTO public.organizations (id, name, type, owner_id, created_at)
SELECT DISTINCT
    pr.organization_id,
    COALESCE(pr.full_name || '''s Organisation', 'Organisation'),
    'property_management',
    pr.id,
    NOW()
FROM public.profiles pr
WHERE pr.organization_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.organizations WHERE id = pr.organization_id
  )
ON CONFLICT (id) DO NOTHING;

-- Mitgliedschaften für bestehende Nutzer anlegen
INSERT INTO public.organization_members (organization_id, user_id, role, status)
SELECT
    pr.organization_id,
    pr.id,
    'owner',
    'active'
FROM public.profiles pr
WHERE pr.organization_id IS NOT NULL
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- ============ RLS: organizations ============

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orgs_member_select" ON public.organizations;
CREATE POLICY "orgs_member_select"
  ON public.organizations FOR SELECT TO authenticated
  USING (
    public.is_org_member(id)
    OR owner_id = auth.uid()
    OR public.is_superadmin()
  );

DROP POLICY IF EXISTS "orgs_owner_all" ON public.organizations;
CREATE POLICY "orgs_owner_all"
  ON public.organizations FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR public.is_superadmin());

DROP POLICY IF EXISTS "orgs_insert" ON public.organizations;
CREATE POLICY "orgs_insert"
  ON public.organizations FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "orgs_deny_anon" ON public.organizations;
CREATE POLICY "orgs_deny_anon"
  ON public.organizations FOR ALL TO anon
  USING (false);

-- ============ RLS: organization_members ============

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org_members_select" ON public.organization_members;
CREATE POLICY "org_members_select"
  ON public.organization_members FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_org_member(organization_id)
    OR public.is_superadmin()
  );

DROP POLICY IF EXISTS "org_members_admin_all" ON public.organization_members;
CREATE POLICY "org_members_admin_all"
  ON public.organization_members FOR ALL TO authenticated
  USING (
    public.is_org_admin(organization_id)
    OR public.is_superadmin()
  );

DROP POLICY IF EXISTS "org_members_deny_anon" ON public.organization_members;
CREATE POLICY "org_members_deny_anon"
  ON public.organization_members FOR ALL TO anon
  USING (false);

-- ============ RLS: organization_invitations ============

ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org_invitations_admin_all" ON public.organization_invitations;
CREATE POLICY "org_invitations_admin_all"
  ON public.organization_invitations FOR ALL TO authenticated
  USING (
    public.is_org_admin(organization_id)
    OR public.is_superadmin()
  );

-- Eingeladene können ihre Einladung per Token sehen (für Einladungs-Seite)
DROP POLICY IF EXISTS "org_invitations_token_select" ON public.organization_invitations;
CREATE POLICY "org_invitations_token_select"
  ON public.organization_invitations FOR SELECT TO authenticated
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "org_invitations_deny_anon" ON public.organization_invitations;
CREATE POLICY "org_invitations_deny_anon"
  ON public.organization_invitations FOR ALL TO anon
  USING (false);
