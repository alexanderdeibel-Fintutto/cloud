-- ================================================
-- Migration: Add missing columns to tenants table
-- 
-- These columns are referenced in the frontend code
-- but do not exist in the production database.
-- The address/city/postal_code/birth_date columns
-- will be handled by frontend code mapping to the
-- existing correspondence_* and date_of_birth columns.
-- ================================================

ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS household_size INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS income_cents INTEGER,
  ADD COLUMN IF NOT EXISTS is_social_benefits BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS previous_landlord TEXT,
  ADD COLUMN IF NOT EXISTS schufa_status TEXT;
