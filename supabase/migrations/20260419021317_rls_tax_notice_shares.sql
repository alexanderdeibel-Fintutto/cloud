-- ============================================================
-- Migration: BescheidBoxer — Freigabe-System (tax_notice_shares)
-- Datum: 2026-04-19
-- Problem: Nutzer können Steuerbescheide nicht mit Steuerberatern
--          oder Familienmitgliedern teilen. RLS erlaubt nur dem
--          Eigentümer Zugriff.
-- Lösung:  Neue Tabelle tax_notice_shares für Freigaben.
--          Freigegebene Nutzer erhalten lesenden Zugriff auf
--          tax_notices und tax_notice_checks.
-- ============================================================

-- ============ TABELLE: tax_notice_shares ============

CREATE TABLE IF NOT EXISTS public.tax_notice_shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    -- Der Steuerbescheid, der freigegeben wird
    tax_notice_id UUID NOT NULL REFERENCES public.tax_notices(id) ON DELETE CASCADE,
    -- Der Eigentümer, der die Freigabe erteilt
    shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    -- Der Nutzer, dem Zugriff gewährt wird (NULL = Link-Freigabe via Token)
    shared_with UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    -- Optionaler Einladungs-Token für E-Mail-Einladungen (noch nicht registrierte Nutzer)
    invite_token TEXT UNIQUE,
    -- E-Mail-Adresse des Eingeladenen (für noch nicht registrierte Nutzer)
    invite_email TEXT,
    -- Berechtigungsstufe: 'view' (nur lesen) oder 'comment' (lesen + kommentieren)
    permission TEXT NOT NULL DEFAULT 'view'
        CHECK (permission IN ('view', 'comment')),
    -- Ablaufdatum der Freigabe (NULL = unbegrenzt)
    expires_at TIMESTAMPTZ,
    -- Wann die Freigabe erstellt wurde
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Wann der Eingeladene die Freigabe angenommen hat
    accepted_at TIMESTAMPTZ,
    -- Constraint: Entweder shared_with ODER invite_email muss gesetzt sein
    CONSTRAINT shares_target_check CHECK (
        shared_with IS NOT NULL OR invite_email IS NOT NULL
    )
);

-- Indizes
CREATE INDEX IF NOT EXISTS idx_tax_shares_notice ON public.tax_notice_shares(tax_notice_id);
CREATE INDEX IF NOT EXISTS idx_tax_shares_shared_by ON public.tax_notice_shares(shared_by);
CREATE INDEX IF NOT EXISTS idx_tax_shares_shared_with ON public.tax_notice_shares(shared_with);
CREATE INDEX IF NOT EXISTS idx_tax_shares_token ON public.tax_notice_shares(invite_token)
  WHERE invite_token IS NOT NULL;

-- ============ HILFSFUNKTION: Freigabe prüfen ============

CREATE OR REPLACE FUNCTION public.has_tax_notice_share(p_tax_notice_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tax_notice_shares
    WHERE tax_notice_id = p_tax_notice_id
      AND shared_with = auth.uid()
      AND (expires_at IS NULL OR expires_at > NOW())
  );
$$;

-- ============ RLS: tax_notice_shares ============

ALTER TABLE public.tax_notice_shares ENABLE ROW LEVEL SECURITY;

-- Eigentümer kann Freigaben verwalten
DROP POLICY IF EXISTS "shares_owner_all" ON public.tax_notice_shares;
CREATE POLICY "shares_owner_all"
  ON public.tax_notice_shares FOR ALL TO authenticated
  USING (shared_by = auth.uid() OR public.is_superadmin());

-- Freigegebener Nutzer kann seine Freigaben sehen
DROP POLICY IF EXISTS "shares_recipient_select" ON public.tax_notice_shares;
CREATE POLICY "shares_recipient_select"
  ON public.tax_notice_shares FOR SELECT TO authenticated
  USING (shared_with = auth.uid());

-- Anon-Deny
DROP POLICY IF EXISTS "shares_deny_anon" ON public.tax_notice_shares;
CREATE POLICY "shares_deny_anon"
  ON public.tax_notice_shares FOR ALL TO anon
  USING (false);

-- ============ RLS: tax_notices — Freigabe-Zugriff ============

-- Freigegebene Nutzer können Steuerbescheide lesen
DROP POLICY IF EXISTS "tax_notices_shared_select" ON public.tax_notices;
CREATE POLICY "tax_notices_shared_select"
  ON public.tax_notices FOR SELECT TO authenticated
  USING (
    public.has_tax_notice_share(id)
  );

-- ============ RLS: tax_notice_checks — Freigabe-Zugriff ============

-- Freigegebene Nutzer können KI-Prüfergebnisse lesen
DROP POLICY IF EXISTS "tax_checks_shared_select" ON public.tax_notice_checks;
CREATE POLICY "tax_checks_shared_select"
  ON public.tax_notice_checks FOR SELECT TO authenticated
  USING (
    public.has_tax_notice_share(tax_notice_id)
  );

-- ============ KOMMENTARE-TABELLE für freigegebene Bescheide ============

CREATE TABLE IF NOT EXISTS public.tax_notice_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tax_notice_id UUID NOT NULL REFERENCES public.tax_notices(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    -- Optionale Verknüpfung mit einem Prüfergebnis
    check_id UUID REFERENCES public.tax_notice_checks(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tax_comments_notice ON public.tax_notice_comments(tax_notice_id);
CREATE INDEX IF NOT EXISTS idx_tax_comments_author ON public.tax_notice_comments(author_id);

CREATE TRIGGER update_tax_comments_updated_at
  BEFORE UPDATE ON public.tax_notice_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS für Kommentare
ALTER TABLE public.tax_notice_comments ENABLE ROW LEVEL SECURITY;

-- Eigentümer und freigegebene Nutzer mit 'comment'-Berechtigung können kommentieren
DROP POLICY IF EXISTS "tax_comments_select" ON public.tax_notice_comments;
CREATE POLICY "tax_comments_select"
  ON public.tax_notice_comments FOR SELECT TO authenticated
  USING (
    -- Eigentümer des Bescheids
    tax_notice_id IN (SELECT id FROM public.tax_notices WHERE user_id = auth.uid())
    OR
    -- Freigegebene Nutzer
    public.has_tax_notice_share(tax_notice_id)
    OR
    public.is_superadmin()
  );

DROP POLICY IF EXISTS "tax_comments_insert" ON public.tax_notice_comments;
CREATE POLICY "tax_comments_insert"
  ON public.tax_notice_comments FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND (
      -- Eigentümer des Bescheids
      tax_notice_id IN (SELECT id FROM public.tax_notices WHERE user_id = auth.uid())
      OR
      -- Freigegebene Nutzer mit 'comment'-Berechtigung
      EXISTS (
        SELECT 1 FROM public.tax_notice_shares
        WHERE tax_notice_id = tax_notice_comments.tax_notice_id
          AND shared_with = auth.uid()
          AND permission = 'comment'
          AND (expires_at IS NULL OR expires_at > NOW())
      )
    )
  );

DROP POLICY IF EXISTS "tax_comments_update" ON public.tax_notice_comments;
CREATE POLICY "tax_comments_update"
  ON public.tax_notice_comments FOR UPDATE TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "tax_comments_delete" ON public.tax_notice_comments;
CREATE POLICY "tax_comments_delete"
  ON public.tax_notice_comments FOR DELETE TO authenticated
  USING (
    author_id = auth.uid()
    OR
    -- Eigentümer kann alle Kommentare löschen
    tax_notice_id IN (SELECT id FROM public.tax_notices WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "tax_comments_deny_anon" ON public.tax_notice_comments;
CREATE POLICY "tax_comments_deny_anon"
  ON public.tax_notice_comments FOR ALL TO anon
  USING (false);
