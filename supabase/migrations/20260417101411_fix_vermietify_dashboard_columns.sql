-- ============================================================
-- Fix: Vermietify Dashboard - fehlende Spalten und Tabellen
-- Datum: 2026-04-17
-- ============================================================

-- 1. units: rent_amount als Alias für target_rent (generated column)
ALTER TABLE units
  ADD COLUMN IF NOT EXISTS rent_amount integer GENERATED ALWAYS AS (target_rent) STORED;

-- 2. tasks: is_completed als computed column (status = 'done' oder 'completed')
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS is_completed boolean GENERATED ALWAYS AS (status IN ('done', 'completed')) STORED;

-- 3. leases VIEW neu erstellen mit Alias-Spalten
--    (leases ist eine View auf lease_contracts)
CREATE OR REPLACE VIEW leases AS
  SELECT
    id,
    org_id,
    building_id,
    unit_id,
    tenant_id,
    contract_number,
    contract_date,
    start_date,
    end_date,
    is_indefinite,
    notice_period_months,
    notice_period_landlord_months,
    earliest_termination_date,
    termination_date,
    termination_received_date,
    termination_by,
    termination_reason,
    termination_document_id,
    move_out_date,
    base_rent,
    utility_prepayment,
    heating_prepayment,
    other_costs,
    total_rent,
    rent_adjustment_type,
    rent_adjustment_index,
    rent_adjustment_details,
    last_rent_adjustment_date,
    deposit_amount,
    deposit_type,
    deposit_paid,
    deposit_account_number,
    deposit_returned,
    deposit_returned_date,
    deposit_returned_amount,
    payment_due_day,
    payment_method,
    pets_allowed,
    subletting_allowed,
    smoking_allowed,
    special_agreements,
    contract_document_id,
    status,
    created_at,
    updated_at,
    number_of_persons,
    -- Alias-Spalten für Dashboard-Kompatibilität
    base_rent AS rent_amount,
    utility_prepayment AS utility_advance,
    (status = 'active') AS is_active
  FROM lease_contracts;

-- 4. bank_transactions: amount_cents als Alias für amount * 100
ALTER TABLE bank_transactions
  ADD COLUMN IF NOT EXISTS amount_cents integer GENERATED ALWAYS AS (ROUND(amount * 100)::integer) STORED;

-- 5. calculator_apps Tabelle erstellen
CREATE TABLE IF NOT EXISTS calculator_apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text,
  category text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE calculator_apps ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'calculator_apps' AND policyname = 'calculator_apps_select_all') THEN
    CREATE POLICY "calculator_apps_select_all" ON calculator_apps FOR SELECT USING (true);
  END IF;
END $$;

INSERT INTO calculator_apps (name, description, icon, category, sort_order, is_active)
VALUES
  ('Mietpreisrechner', 'Berechnen Sie den optimalen Mietpreis', 'calculator', 'miet', 1, true),
  ('Renditerechner', 'Berechnen Sie die Rendite Ihrer Immobilie', 'trending-up', 'finanz', 2, true),
  ('Nebenkostenrechner', 'Berechnen Sie die Nebenkosten', 'receipt', 'kosten', 3, true),
  ('AfA-Rechner', 'Abschreibung für Abnutzung berechnen', 'percent', 'steuer', 4, true)
ON CONFLICT DO NOTHING;

-- 5. ecosystem_apps Tabelle erstellen
CREATE TABLE IF NOT EXISTS ecosystem_apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text,
  url text,
  category text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ecosystem_apps ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ecosystem_apps' AND policyname = 'ecosystem_apps_select_all') THEN
    CREATE POLICY "ecosystem_apps_select_all" ON ecosystem_apps FOR SELECT USING (true);
  END IF;
END $$;

INSERT INTO ecosystem_apps (name, description, icon, url, category, sort_order, is_active)
VALUES
  ('Vermietify', 'Immobilienverwaltung für Vermieter', 'home', 'https://vermietify.fintutto.cloud', 'immobilien', 1, true),
  ('Ablesung', 'Zählerverwaltung und Ablesungen', 'gauge', 'https://ablesung.fintutto.cloud', 'zaehler', 2, true),
  ('Financial Compass', 'Finanzplanung und Budgetverwaltung', 'compass', 'https://financial-compass.fintutto.cloud', 'finanzen', 3, true)
ON CONFLICT DO NOTHING;
