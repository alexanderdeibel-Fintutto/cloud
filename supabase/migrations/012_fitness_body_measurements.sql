-- Migration 012: Dedicated body measurements table
-- Fixes: body measurements were incorrectly stored in fitness_daily_progress

-- Create dedicated body measurements table
CREATE TABLE IF NOT EXISTS fitness_body_measurements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight_kg NUMERIC(5,1),
  body_fat_percent NUMERIC(4,1),
  chest_cm NUMERIC(5,1),
  waist_cm NUMERIC(5,1),
  hips_cm NUMERIC(5,1),
  biceps_cm NUMERIC(5,1),
  thigh_cm NUMERIC(5,1),
  calf_cm NUMERIC(5,1),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE fitness_body_measurements ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own body measurements"
  ON fitness_body_measurements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own body measurements"
  ON fitness_body_measurements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own body measurements"
  ON fitness_body_measurements FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own body measurements"
  ON fitness_body_measurements FOR DELETE
  USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_fitness_body_measurements_user_date
  ON fitness_body_measurements(user_id, date);

-- Migrate existing body measurement data from fitness_daily_progress
INSERT INTO fitness_body_measurements (id, user_id, date, weight_kg, body_fat_percent, chest_cm, waist_cm, hips_cm, biceps_cm, thigh_cm, calf_cm, notes, created_at)
SELECT id, user_id, date, weight_kg, body_fat_percent, chest_cm, waist_cm, hips_cm, biceps_cm, thigh_cm, calf_cm, notes, created_at
FROM fitness_daily_progress
WHERE weight_kg IS NOT NULL
   OR body_fat_percent IS NOT NULL
   OR chest_cm IS NOT NULL
   OR waist_cm IS NOT NULL
   OR hips_cm IS NOT NULL
   OR biceps_cm IS NOT NULL
   OR thigh_cm IS NOT NULL
   OR calf_cm IS NOT NULL
ON CONFLICT (user_id, date) DO NOTHING;
