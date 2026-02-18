-- Migration 005: Meter & Maintenance Tables
-- Zähler, Ablesungen, Mängelmeldungen und Aufgaben
-- Verbindet Zähler-App, Mieter-App und Hausmeister-App

-- Zähler
CREATE TABLE IF NOT EXISTS public.meters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
    meter_number TEXT NOT NULL,
    meter_type TEXT NOT NULL
        CHECK (meter_type IN ('electricity', 'gas', 'water_cold', 'water_hot', 'heating', 'other')),
    location TEXT,
    installation_date DATE,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Zählerstandablesungen
CREATE TABLE IF NOT EXISTS public.meter_readings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    meter_id UUID NOT NULL REFERENCES public.meters(id) ON DELETE CASCADE,
    reading_value NUMERIC(12,3) NOT NULL,
    reading_date DATE NOT NULL,
    read_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    image_url TEXT,
    source TEXT DEFAULT 'manual'
        CHECK (source IN ('manual', 'ocr', 'import', 'smart_meter')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mängelmeldungen / Wartungsanfragen
CREATE TABLE IF NOT EXISTS public.maintenance_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
    reported_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'other'
        CHECK (category IN ('plumbing', 'electrical', 'heating', 'structural', 'appliance', 'pest', 'cleaning', 'other')),
    priority TEXT DEFAULT 'normal'
        CHECK (priority IN ('low', 'normal', 'high', 'emergency')),
    status TEXT DEFAULT 'open'
        CHECK (status IN ('open', 'in_progress', 'waiting', 'resolved', 'closed')),
    image_urls TEXT[],
    resolved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aufgaben (Hausmeister + allgemein)
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    maintenance_request_id UUID REFERENCES public.maintenance_requests(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    priority TEXT DEFAULT 'normal'
        CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status TEXT DEFAULT 'todo'
        CHECK (status IN ('todo', 'in_progress', 'done', 'cancelled')),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indizes
CREATE INDEX IF NOT EXISTS idx_meters_unit ON public.meters(unit_id);
CREATE INDEX IF NOT EXISTS idx_meters_type ON public.meters(meter_type);
CREATE INDEX IF NOT EXISTS idx_meter_readings_meter ON public.meter_readings(meter_id);
CREATE INDEX IF NOT EXISTS idx_meter_readings_date ON public.meter_readings(reading_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_property ON public.maintenance_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON public.maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_assigned ON public.maintenance_requests(assigned_to);
CREATE INDEX IF NOT EXISTS idx_maintenance_reported ON public.maintenance_requests(reported_by);
CREATE INDEX IF NOT EXISTS idx_tasks_property ON public.tasks(property_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);

-- Trigger
CREATE TRIGGER update_meters_updated_at
    BEFORE UPDATE ON public.meters
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_maintenance_updated_at
    BEFORE UPDATE ON public.maintenance_requests
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
