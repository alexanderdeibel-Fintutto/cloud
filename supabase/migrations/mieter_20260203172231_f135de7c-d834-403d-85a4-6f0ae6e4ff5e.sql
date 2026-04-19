-- Fix 1: INPUT_VALIDATION - Add server-side constraints
-- Issues table constraints
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'issues_description_min_length') THEN
    ALTER TABLE public.issues ADD CONSTRAINT issues_description_min_length CHECK (length(description) >= 10);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'issues_description_max_length') THEN
    ALTER TABLE public.issues ADD CONSTRAINT issues_description_max_length CHECK (length(description) <= 2000);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'issues_valid_category') THEN
    ALTER TABLE public.issues ADD CONSTRAINT issues_valid_category CHECK (category IN ('sanitaer', 'elektrik', 'heizung', 'fenster_tueren', 'wasserschaden', 'schimmel', 'sonstiges'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'issues_valid_priority') THEN
    ALTER TABLE public.issues ADD CONSTRAINT issues_valid_priority CHECK (priority IN ('niedrig', 'mittel', 'hoch', 'notfall'));
  END IF;
END $$;

-- Meter readings constraints
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'meter_readings_value_range') THEN
    ALTER TABLE public.meter_readings ADD CONSTRAINT meter_readings_value_range CHECK (value >= 0 AND value <= 9999999999);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'meter_readings_valid_type') THEN
    ALTER TABLE public.meter_readings ADD CONSTRAINT meter_readings_valid_type CHECK (meter_type IN ('strom', 'gas', 'kaltwasser', 'warmwasser'));
  END IF;
END $$;

-- Documents constraints
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'documents_title_length') THEN
    ALTER TABLE public.documents ADD CONSTRAINT documents_title_length CHECK (length(title) BETWEEN 1 AND 200);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'documents_valid_type') THEN
    ALTER TABLE public.documents ADD CONSTRAINT documents_valid_type CHECK (
      document_type IS NULL OR 
      document_type IN ('mietbescheinigung', 'nebenkostenabrechnung', 'wohnungsgeberbestaetigung', 'mietvertrag')
    );
  END IF;
END $$;

-- Fix 2: CLIENT_SIDE_AUTH - Update documents INSERT policy to validate organization_id
DROP POLICY IF EXISTS "Users can create documents" ON public.documents;

CREATE POLICY "Users can create documents"
ON public.documents
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND (
    organization_id IS NULL 
    OR organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  )
);