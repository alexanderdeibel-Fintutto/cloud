-- Migration: Steuer-Felder für Anlage V (Vermietung & Verpachtung)
-- Datum: 2026-04-20
-- Zweck: Fehlende Felder für vollständige Steuererklärung nach § 21 EStG

-- ─── 1. buildings: AfA-relevante Felder ─────────────────────────────────────
ALTER TABLE public.buildings
  ADD COLUMN IF NOT EXISTS afa_rate          NUMERIC(5,4) DEFAULT 0.02,
  ADD COLUMN IF NOT EXISTS afa_basis         NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS land_value        NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS building_value    NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS afa_start_year    INTEGER,
  ADD COLUMN IF NOT EXISTS afa_method        TEXT DEFAULT 'linear' CHECK (afa_method IN ('linear', 'degressive')),
  ADD COLUMN IF NOT EXISTS tax_number        TEXT,
  ADD COLUMN IF NOT EXISTS elster_id         TEXT;

COMMENT ON COLUMN public.buildings.afa_rate IS 'AfA-Satz (Standard 2% für Gebäude nach 1925, 2,5% für ältere)';
COMMENT ON COLUMN public.buildings.afa_basis IS 'AfA-Bemessungsgrundlage (Gebäudewert ohne Grundstück)';
COMMENT ON COLUMN public.buildings.land_value IS 'Grundstückswert (nicht abschreibbar)';
COMMENT ON COLUMN public.buildings.building_value IS 'Gebäudewert (abschreibbar)';
COMMENT ON COLUMN public.buildings.afa_start_year IS 'Jahr der ersten AfA-Nutzung';
COMMENT ON COLUMN public.buildings.tax_number IS 'Steuernummer des Objekts beim Finanzamt';

-- ─── 2. financial_transactions: Steuer-Kategorisierung ──────────────────────
ALTER TABLE public.financial_transactions
  ADD COLUMN IF NOT EXISTS tax_category      TEXT,
  ADD COLUMN IF NOT EXISTS anlage_v_zeile    INTEGER,
  ADD COLUMN IF NOT EXISTS is_tax_deductible BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS vat_rate          NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS vat_amount        NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS net_amount        NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS receipt_number    TEXT,
  ADD COLUMN IF NOT EXISTS document_id       UUID REFERENCES public.documents(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.financial_transactions.tax_category IS 'Anlage V Kategorie: Anlage_V_Zeile_47_Erhaltungsaufwand etc.';
COMMENT ON COLUMN public.financial_transactions.anlage_v_zeile IS 'Anlage V Zeilennummer (7-52)';
COMMENT ON COLUMN public.financial_transactions.is_tax_deductible IS 'Steuerlich absetzbar';
COMMENT ON COLUMN public.financial_transactions.vat_rate IS 'Mehrwertsteuersatz in Prozent';
COMMENT ON COLUMN public.financial_transactions.vat_amount IS 'Mehrwertsteuerbetrag';
COMMENT ON COLUMN public.financial_transactions.net_amount IS 'Nettobetrag (ohne MwSt)';

-- ─── 3. bank_transactions: Steuer-Kategorisierung ───────────────────────────
ALTER TABLE public.bank_transactions
  ADD COLUMN IF NOT EXISTS tax_category      TEXT,
  ADD COLUMN IF NOT EXISTS anlage_v_zeile    INTEGER,
  ADD COLUMN IF NOT EXISTS is_tax_deductible BOOLEAN,
  ADD COLUMN IF NOT EXISTS matched_building_id UUID REFERENCES public.buildings(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS matched_unit_id   UUID REFERENCES public.units(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.bank_transactions.tax_category IS 'Steuer-Kategorie nach Anlage V';
COMMENT ON COLUMN public.bank_transactions.anlage_v_zeile IS 'Anlage V Zeilennummer';
COMMENT ON COLUMN public.bank_transactions.is_tax_deductible IS 'Steuerlich absetzbar';
COMMENT ON COLUMN public.bank_transactions.matched_building_id IS 'Zugeordnetes Gebäude';
COMMENT ON COLUMN public.bank_transactions.matched_unit_id IS 'Zugeordnete Einheit';

-- ─── 4. tax_declarations: Enum-Typen anlegen ────────────────────────────────
DO $$
BEGIN
  -- tax_form_type Enum
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tax_form_type') THEN
    CREATE TYPE public.tax_form_type AS ENUM (
      'anlage_v',
      'anlage_n',
      'anlage_s',
      'anlage_g',
      'einkommensteuererklarung'
    );
  ELSE
    -- Fehlende Werte hinzufügen
    BEGIN
      ALTER TYPE public.tax_form_type ADD VALUE IF NOT EXISTS 'anlage_v';
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER TYPE public.tax_form_type ADD VALUE IF NOT EXISTS 'anlage_n';
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;

  -- tax_declaration_status Enum
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tax_declaration_status') THEN
    CREATE TYPE public.tax_declaration_status AS ENUM (
      'draft',
      'in_review',
      'submitted',
      'accepted',
      'rejected'
    );
  ELSE
    BEGIN
      ALTER TYPE public.tax_declaration_status ADD VALUE IF NOT EXISTS 'draft';
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END$$;

-- ─── 5. tax_declarations: form_type und status Spalten auf Enum umstellen ────
-- Prüfen ob Spalten bereits den richtigen Typ haben
DO $$
BEGIN
  -- Wenn form_type TEXT ist, auf Enum umstellen
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'tax_declarations' 
    AND column_name = 'form_type' AND data_type = 'text'
  ) THEN
    ALTER TABLE public.tax_declarations 
      ALTER COLUMN form_type TYPE public.tax_form_type 
      USING form_type::public.tax_form_type;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'tax_declarations' 
    AND column_name = 'status' AND data_type = 'text'
  ) THEN
    ALTER TABLE public.tax_declarations 
      ALTER COLUMN status TYPE public.tax_declaration_status 
      USING status::public.tax_declaration_status;
  END IF;
END$$;

-- ─── 6. tax_documents: RLS-Policy für INSERT ─────────────────────────────────
DO $$
BEGIN
  -- Prüfe ob Policy bereits existiert
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tax_documents' AND policyname = 'tax_documents_insert_own'
  ) THEN
    CREATE POLICY tax_documents_insert_own ON public.tax_documents
      FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tax_documents' AND policyname = 'tax_documents_select_own'
  ) THEN
    CREATE POLICY tax_documents_select_own ON public.tax_documents
      FOR SELECT USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tax_documents' AND policyname = 'tax_documents_update_own'
  ) THEN
    CREATE POLICY tax_documents_update_own ON public.tax_documents
      FOR UPDATE USING (user_id = auth.uid());
  END IF;
END$$;

-- ─── 7. Anlage V Kategorie-Mapping Tabelle ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.anlage_v_categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type TEXT NOT NULL,
  zeile           INTEGER NOT NULL,
  label           TEXT NOT NULL,
  description     TEXT,
  is_income       BOOLEAN NOT NULL DEFAULT FALSE,
  is_deductible   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Daten einfügen (idempotent)
INSERT INTO public.anlage_v_categories (transaction_type, zeile, label, description, is_income, is_deductible)
VALUES
  ('rent',            7,  'Mieteinnahmen (Kaltmiete)',                    '§ 21 EStG Einnahmen aus V&V',                    TRUE,  FALSE),
  ('utility_income',  8,  'Umlagen / Nebenkosten (Einnahmen)',             'Betriebskostenvorauszahlungen Mieter',            TRUE,  FALSE),
  ('other_income',    9,  'Sonstige Einnahmen',                            'Sonstige Einnahmen aus V&V',                     TRUE,  FALSE),
  ('depreciation',   33,  'AfA (Absetzung für Abnutzung)',                 '§ 7 EStG, 2% p.a. für Gebäude nach 1925',        FALSE, TRUE),
  ('loan_interest',  39,  'Schuldzinsen und Geldbeschaffungskosten',       'Hypothekenzinsen, Bearbeitungsgebühren',          FALSE, TRUE),
  ('repair',         47,  'Erhaltungsaufwand',                             'Reparaturen, Instandhaltung, Renovierung',        FALSE, TRUE),
  ('management',     48,  'Verwaltungskosten',                             'Hausverwaltung, Steuerberater, Rechtsanwalt',     FALSE, TRUE),
  ('insurance',      49,  'Versicherungsbeiträge',                         'Gebäude-, Haftpflicht-, Mietausfallversicherung', FALSE, TRUE),
  ('utility',        50,  'Betriebskosten',                                'Strom, Wasser, Heizung, Müll, Hausmeister',      FALSE, TRUE),
  ('tax',            51,  'Grundsteuer',                                   'Grundsteuer A und B',                            FALSE, TRUE),
  ('other_expense',  52,  'Sonstige Werbungskosten',                       'Fahrtkosten, Büromaterial, Telefon etc.',         FALSE, TRUE)
ON CONFLICT DO NOTHING;

-- RLS für anlage_v_categories (öffentlich lesbar, nur Admin schreibt)
ALTER TABLE public.anlage_v_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS anlage_v_categories_select_all ON public.anlage_v_categories
  FOR SELECT USING (TRUE);

-- ─── 8. View: Anlage V Zusammenfassung pro Gebäude und Jahr ──────────────────
CREATE OR REPLACE VIEW public.v_anlage_v_summary AS
SELECT
  ft.building_id,
  b.name AS building_name,
  b.street || ' ' || b.house_number || ', ' || b.postal_code || ' ' || b.city AS address,
  EXTRACT(YEAR FROM ft.booking_date) AS tax_year,
  ft.transaction_type,
  avc.zeile AS anlage_v_zeile,
  avc.label AS anlage_v_label,
  avc.is_income,
  SUM(ABS(ft.amount)) AS total_amount,
  COUNT(*) AS transaction_count
FROM public.financial_transactions ft
LEFT JOIN public.buildings b ON b.id = ft.building_id
LEFT JOIN public.anlage_v_categories avc ON avc.transaction_type = ft.transaction_type::text
WHERE ft.building_id IS NOT NULL
GROUP BY
  ft.building_id, b.name, b.street, b.house_number, b.postal_code, b.city,
  EXTRACT(YEAR FROM ft.booking_date),
  ft.transaction_type, avc.zeile, avc.label, avc.is_income
ORDER BY tax_year DESC, avc.zeile ASC;

COMMENT ON VIEW public.v_anlage_v_summary IS 'Anlage V Zusammenfassung: Einnahmen und Werbungskosten pro Gebäude und Steuerjahr';
