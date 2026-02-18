-- Bescheidboxer Database Schema
-- Tables for managing tax assessments, deadlines, and objections

-- Bescheid status enum
CREATE TYPE bescheid_status AS ENUM ('neu', 'in_pruefung', 'geprueft', 'einspruch', 'erledigt');

-- Bescheid type enum
CREATE TYPE bescheid_typ AS ENUM ('einkommensteuer', 'gewerbesteuer', 'umsatzsteuer', 'koerperschaftsteuer', 'grundsteuer', 'sonstige');

-- Einspruch status enum
CREATE TYPE einspruch_status AS ENUM ('entwurf', 'eingereicht', 'in_bearbeitung', 'entschieden', 'zurueckgenommen');

-- Frist type enum
CREATE TYPE frist_typ AS ENUM ('einspruch', 'zahlung', 'nachreichung');

-- ============================================================
-- Bescheide (Tax Assessments) Table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bescheide (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    titel TEXT NOT NULL,
    typ bescheid_typ NOT NULL DEFAULT 'einkommensteuer',
    steuerjahr INTEGER NOT NULL,
    eingangsdatum DATE NOT NULL DEFAULT CURRENT_DATE,
    finanzamt TEXT NOT NULL,
    aktenzeichen TEXT,
    status bescheid_status NOT NULL DEFAULT 'neu',
    festgesetzte_steuer NUMERIC(12,2),
    erwartete_steuer NUMERIC(12,2),
    abweichung NUMERIC(12,2),
    abweichung_prozent NUMERIC(6,2),
    einspruchsfrist DATE,
    dokument_url TEXT,
    notizen TEXT,
    pruefungsergebnis JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.bescheide ENABLE ROW LEVEL SECURITY;

-- Bescheide policies
CREATE POLICY "Users can view own bescheide" ON public.bescheide
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bescheide" ON public.bescheide
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bescheide" ON public.bescheide
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bescheide" ON public.bescheide
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bescheide_user_id ON public.bescheide(user_id);
CREATE INDEX IF NOT EXISTS idx_bescheide_status ON public.bescheide(status);
CREATE INDEX IF NOT EXISTS idx_bescheide_steuerjahr ON public.bescheide(steuerjahr);
CREATE INDEX IF NOT EXISTS idx_bescheide_einspruchsfrist ON public.bescheide(einspruchsfrist);

-- Auto-update updated_at
CREATE TRIGGER update_bescheide_updated_at
    BEFORE UPDATE ON public.bescheide
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- Fristen (Deadlines) Table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.fristen (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    bescheid_id UUID REFERENCES public.bescheide(id) ON DELETE CASCADE NOT NULL,
    typ frist_typ NOT NULL DEFAULT 'einspruch',
    fristdatum DATE NOT NULL,
    erledigt BOOLEAN DEFAULT FALSE,
    notiz TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.fristen ENABLE ROW LEVEL SECURITY;

-- Fristen policies
CREATE POLICY "Users can view own fristen" ON public.fristen
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fristen" ON public.fristen
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fristen" ON public.fristen
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own fristen" ON public.fristen
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_fristen_user_id ON public.fristen(user_id);
CREATE INDEX IF NOT EXISTS idx_fristen_bescheid_id ON public.fristen(bescheid_id);
CREATE INDEX IF NOT EXISTS idx_fristen_fristdatum ON public.fristen(fristdatum);
CREATE INDEX IF NOT EXISTS idx_fristen_erledigt ON public.fristen(erledigt) WHERE NOT erledigt;

-- Auto-update updated_at
CREATE TRIGGER update_fristen_updated_at
    BEFORE UPDATE ON public.fristen
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- Einsprueche (Objections) Table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.einsprueche (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    bescheid_id UUID REFERENCES public.bescheide(id) ON DELETE CASCADE NOT NULL,
    status einspruch_status NOT NULL DEFAULT 'entwurf',
    begruendung TEXT NOT NULL,
    forderung NUMERIC(12,2),
    eingereicht_am DATE,
    frist DATE,
    antwort_erhalten DATE,
    ergebnis TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.einsprueche ENABLE ROW LEVEL SECURITY;

-- Einsprueche policies
CREATE POLICY "Users can view own einsprueche" ON public.einsprueche
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own einsprueche" ON public.einsprueche
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own einsprueche" ON public.einsprueche
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own einsprueche" ON public.einsprueche
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_einsprueche_user_id ON public.einsprueche(user_id);
CREATE INDEX IF NOT EXISTS idx_einsprueche_bescheid_id ON public.einsprueche(bescheid_id);
CREATE INDEX IF NOT EXISTS idx_einsprueche_status ON public.einsprueche(status);

-- Auto-update updated_at
CREATE TRIGGER update_einsprueche_updated_at
    BEFORE UPDATE ON public.einsprueche
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- Dokumente (Document uploads) Table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.dokumente (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    bescheid_id UUID REFERENCES public.bescheide(id) ON DELETE CASCADE,
    dateiname TEXT NOT NULL,
    dateityp TEXT NOT NULL,
    dateigroesse INTEGER,
    storage_path TEXT NOT NULL,
    ocr_text TEXT,
    ocr_status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.dokumente ENABLE ROW LEVEL SECURITY;

-- Dokumente policies
CREATE POLICY "Users can view own dokumente" ON public.dokumente
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dokumente" ON public.dokumente
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own dokumente" ON public.dokumente
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dokumente_user_id ON public.dokumente(user_id);
CREATE INDEX IF NOT EXISTS idx_dokumente_bescheid_id ON public.dokumente(bescheid_id);

-- ============================================================
-- Auto-create Frist when Bescheid is inserted
-- ============================================================
CREATE OR REPLACE FUNCTION public.auto_create_einspruchsfrist()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.einspruchsfrist IS NOT NULL THEN
        INSERT INTO public.fristen (user_id, bescheid_id, typ, fristdatum, notiz)
        VALUES (
            NEW.user_id,
            NEW.id,
            'einspruch',
            NEW.einspruchsfrist,
            'Automatisch erstellt: Einspruchsfrist fuer ' || NEW.titel
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_bescheid_created_create_frist
    AFTER INSERT ON public.bescheide
    FOR EACH ROW EXECUTE FUNCTION public.auto_create_einspruchsfrist();

-- ============================================================
-- Supabase Storage bucket for bescheid documents
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('bescheid-dokumente', 'bescheid-dokumente', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload own documents"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'bescheid-dokumente'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view own documents"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'bescheid-dokumente'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own documents"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'bescheid-dokumente'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
