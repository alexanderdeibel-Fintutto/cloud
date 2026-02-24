-- Expand meter_type ENUM to support all 18 meter types used in the application
-- Current: electricity, gas, water_cold, water_hot, heating
-- Adding: pv_feed_in, pv_self_consumption, pv_production, electricity_ht,
--         electricity_nt, electricity_common, heat_pump, ev_charging,
--         district_heating, cooling, oil, pellets, lpg

ALTER TYPE public.meter_type ADD VALUE IF NOT EXISTS 'pv_feed_in';
ALTER TYPE public.meter_type ADD VALUE IF NOT EXISTS 'pv_self_consumption';
ALTER TYPE public.meter_type ADD VALUE IF NOT EXISTS 'pv_production';
ALTER TYPE public.meter_type ADD VALUE IF NOT EXISTS 'electricity_ht';
ALTER TYPE public.meter_type ADD VALUE IF NOT EXISTS 'electricity_nt';
ALTER TYPE public.meter_type ADD VALUE IF NOT EXISTS 'electricity_common';
ALTER TYPE public.meter_type ADD VALUE IF NOT EXISTS 'heat_pump';
ALTER TYPE public.meter_type ADD VALUE IF NOT EXISTS 'ev_charging';
ALTER TYPE public.meter_type ADD VALUE IF NOT EXISTS 'district_heating';
ALTER TYPE public.meter_type ADD VALUE IF NOT EXISTS 'cooling';
ALTER TYPE public.meter_type ADD VALUE IF NOT EXISTS 'oil';
ALTER TYPE public.meter_type ADD VALUE IF NOT EXISTS 'pellets';
ALTER TYPE public.meter_type ADD VALUE IF NOT EXISTS 'lpg';

-- Add reading_interval_days column to meters (referenced in TypeScript types but missing from DB)
ALTER TABLE public.meters
ADD COLUMN IF NOT EXISTS reading_interval_days INTEGER DEFAULT 30;

COMMENT ON COLUMN public.meters.reading_interval_days IS 'Interval in days between expected meter readings (default: 30)';
