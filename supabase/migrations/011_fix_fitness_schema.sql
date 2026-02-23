-- ============================================
-- Migration 011: Fix FitTutto Schema Mismatches
-- Body-Tracking columns + Meal entry columns
-- ============================================

-- === 1. fitness_daily_progress: Add missing body measurement columns ===
-- The code writes body measurements (chest, waist, etc.) to this table,
-- but the original schema only had weight_kg and aggregated stats.

ALTER TABLE fitness_daily_progress
  ADD COLUMN IF NOT EXISTS body_fat_percent NUMERIC(4,1),
  ADD COLUMN IF NOT EXISTS chest_cm NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS waist_cm NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS hips_cm NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS biceps_cm NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS thigh_cm NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS calf_cm NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- === 2. fitness_meal_entries: Add individual meal columns ===
-- The original schema used a JSONB `foods` column and total_* aggregates.
-- The new code expects individual meal entries with name + macro columns.
-- Old columns are kept for backward compatibility.

ALTER TABLE fitness_meal_entries
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS calories INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS protein_g NUMERIC(6,1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS carbs_g NUMERIC(6,1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fat_g NUMERIC(6,1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fiber_g NUMERIC(6,1);

-- Index for faster meal lookups by date
CREATE INDEX IF NOT EXISTS idx_fitness_meal_entries_date
  ON fitness_meal_entries (user_id, date);

-- Index for faster body measurement lookups
CREATE INDEX IF NOT EXISTS idx_fitness_daily_progress_date
  ON fitness_daily_progress (user_id, date);
