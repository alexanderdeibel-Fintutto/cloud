-- Units table (Wohnungen/Häuser)
CREATE TABLE public.units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Meters table (Zähler)
CREATE TYPE public.meter_type AS ENUM ('electricity', 'gas', 'cold_water', 'warm_water', 'heating');

CREATE TABLE public.meters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  meter_number TEXT NOT NULL,
  meter_type public.meter_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Meter readings table (Ablesungen)
CREATE TABLE public.meter_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meter_id UUID NOT NULL REFERENCES public.meters(id) ON DELETE CASCADE,
  reading_date DATE NOT NULL DEFAULT CURRENT_DATE,
  value NUMERIC NOT NULL,
  image_url TEXT,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'ocr')),
  confidence NUMERIC CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 100)),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meter_readings ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if user owns unit
CREATE OR REPLACE FUNCTION public.user_owns_unit(unit_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.units
    WHERE id = unit_id AND user_id = auth.uid()
  )
$$;

-- Helper function: Check if user owns meter (via unit)
CREATE OR REPLACE FUNCTION public.user_owns_meter(p_meter_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.meters m
    JOIN public.units u ON m.unit_id = u.id
    WHERE m.id = p_meter_id AND u.user_id = auth.uid()
  )
$$;

-- RLS Policies for units
CREATE POLICY "Users can view own units"
  ON public.units FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own units"
  ON public.units FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own units"
  ON public.units FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own units"
  ON public.units FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for meters
CREATE POLICY "Users can view meters of own units"
  ON public.meters FOR SELECT
  USING (public.user_owns_unit(unit_id));

CREATE POLICY "Users can create meters in own units"
  ON public.meters FOR INSERT
  WITH CHECK (public.user_owns_unit(unit_id));

CREATE POLICY "Users can update meters in own units"
  ON public.meters FOR UPDATE
  USING (public.user_owns_unit(unit_id));

CREATE POLICY "Users can delete meters in own units"
  ON public.meters FOR DELETE
  USING (public.user_owns_unit(unit_id));

-- RLS Policies for meter_readings
CREATE POLICY "Users can view readings of own meters"
  ON public.meter_readings FOR SELECT
  USING (public.user_owns_meter(meter_id));

CREATE POLICY "Users can create readings for own meters"
  ON public.meter_readings FOR INSERT
  WITH CHECK (public.user_owns_meter(meter_id));

CREATE POLICY "Users can update readings of own meters"
  ON public.meter_readings FOR UPDATE
  USING (public.user_owns_meter(meter_id));

CREATE POLICY "Users can delete readings of own meters"
  ON public.meter_readings FOR DELETE
  USING (public.user_owns_meter(meter_id));

-- Storage bucket for meter photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('meter-photos', 'meter-photos', false);

-- Storage RLS policies (users can only access their own photos via folder structure: user_id/filename)
CREATE POLICY "Users can view own meter photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'meter-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own meter photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'meter-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own meter photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'meter-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_units_updated_at
  BEFORE UPDATE ON public.units
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meters_updated_at
  BEFORE UPDATE ON public.meters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for better performance
CREATE INDEX idx_units_user_id ON public.units(user_id);
CREATE INDEX idx_meters_unit_id ON public.meters(unit_id);
CREATE INDEX idx_meter_readings_meter_id ON public.meter_readings(meter_id);
CREATE INDEX idx_meter_readings_reading_date ON public.meter_readings(reading_date DESC);