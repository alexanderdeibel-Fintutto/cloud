-- ============================================================
-- Migration: Bescheidboxer – Tabellen für Steuerbescheide,
--            Einsprüche, Fristen und Dokumente
-- ============================================================

-- ── bescheide ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bescheide (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titel                TEXT NOT NULL,
  typ                  TEXT NOT NULL CHECK (typ IN (
    'einkommensteuer','koerperschaftsteuer','gewerbesteuer',
    'umsatzsteuer','erbschaftsteuer','schenkungsteuer',
    'grundsteuer','kraftfahrzeugsteuer','sonstige'
  )),
  steuerjahr           INTEGER NOT NULL,
  eingangsdatum        DATE NOT NULL,
  finanzamt            TEXT NOT NULL,
  aktenzeichen         TEXT,
  status               TEXT NOT NULL DEFAULT 'neu' CHECK (status IN (
    'neu','in_pruefung','einspruch_eingereicht',
    'einspruch_bearbeitet','abgeschlossen','abgelaufen'
  )),
  festgesetzte_steuer  NUMERIC(12,2) NOT NULL DEFAULT 0,
  erwartete_steuer     NUMERIC(12,2),
  abweichung           NUMERIC(12,2) GENERATED ALWAYS AS (
    CASE WHEN erwartete_steuer IS NOT NULL
    THEN festgesetzte_steuer - erwartete_steuer
    ELSE NULL END
  ) STORED,
  abweichung_prozent   NUMERIC(6,2) GENERATED ALWAYS AS (
    CASE WHEN erwartete_steuer IS NOT NULL AND erwartete_steuer <> 0
    THEN ROUND(((festgesetzte_steuer - erwartete_steuer) / erwartete_steuer) * 100, 2)
    ELSE NULL END
  ) STORED,
  einspruchsfrist      DATE,
  dokument_url         TEXT,
  notizen              TEXT,
  pruefungsergebnis    JSONB,
  core_contact_id      UUID REFERENCES public.core_contacts(id) ON DELETE SET NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bescheide ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own bescheide" ON public.bescheide;
CREATE POLICY "Users manage own bescheide"
  ON public.bescheide FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Deny anonymous access to bescheide" ON public.bescheide;
CREATE POLICY "Deny anonymous access to bescheide"
  ON public.bescheide FOR ALL TO anon USING (false);

-- ── einsprueche ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.einsprueche (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bescheid_id       UUID NOT NULL REFERENCES public.bescheide(id) ON DELETE CASCADE,
  status            TEXT NOT NULL DEFAULT 'entwurf' CHECK (status IN (
    'entwurf','eingereicht','in_bearbeitung',
    'stattgegeben','abgelehnt','zurueckgenommen'
  )),
  begruendung       TEXT NOT NULL,
  forderung         NUMERIC(12,2) NOT NULL DEFAULT 0,
  eingereicht_am    DATE,
  frist             DATE,
  antwort_erhalten  DATE,
  ergebnis          TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.einsprueche ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own einsprueche" ON public.einsprueche;
CREATE POLICY "Users manage own einsprueche"
  ON public.einsprueche FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Deny anonymous access to einsprueche" ON public.einsprueche;
CREATE POLICY "Deny anonymous access to einsprueche"
  ON public.einsprueche FOR ALL TO anon USING (false);

-- ── fristen ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.fristen (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bescheid_id     UUID NOT NULL REFERENCES public.bescheide(id) ON DELETE CASCADE,
  typ             TEXT NOT NULL CHECK (typ IN ('einspruch','zahlung','nachreichung')),
  fristdatum      DATE NOT NULL,
  erledigt        BOOLEAN NOT NULL DEFAULT false,
  notiz           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fristen ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own fristen" ON public.fristen;
CREATE POLICY "Users manage own fristen"
  ON public.fristen FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Deny anonymous access to fristen" ON public.fristen;
CREATE POLICY "Deny anonymous access to fristen"
  ON public.fristen FOR ALL TO anon USING (false);

-- ── dokumente (Bescheidboxer-spezifisch) ──────────────────────
CREATE TABLE IF NOT EXISTS public.bescheid_dokumente (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bescheid_id  UUID NOT NULL REFERENCES public.bescheide(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  url          TEXT,
  groesse      INTEGER DEFAULT 0,
  format       TEXT DEFAULT 'pdf' CHECK (format IN ('pdf','jpg','png','unknown')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bescheid_dokumente ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own bescheid_dokumente" ON public.bescheid_dokumente;
CREATE POLICY "Users manage own bescheid_dokumente"
  ON public.bescheid_dokumente FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Deny anonymous access to bescheid_dokumente" ON public.bescheid_dokumente;
CREATE POLICY "Deny anonymous access to bescheid_dokumente"
  ON public.bescheid_dokumente FOR ALL TO anon USING (false);

-- ── updated_at Trigger ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS set_updated_at_bescheide ON public.bescheide;
CREATE TRIGGER set_updated_at_bescheide
  BEFORE UPDATE ON public.bescheide
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_einsprueche ON public.einsprueche;
CREATE TRIGGER set_updated_at_einsprueche
  BEFORE UPDATE ON public.einsprueche
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
