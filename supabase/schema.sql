-- Pflanzen-Manager Database Schema
-- Extends the existing Fintutto Supabase project

-- ============================================
-- PLANT SPECIES (Master catalog)
-- ============================================
CREATE TABLE IF NOT EXISTS public.plant_species (
    id TEXT PRIMARY KEY,
    common_name TEXT NOT NULL,
    botanical_name TEXT NOT NULL,
    family TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    origin TEXT,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
    light TEXT CHECK (light IN ('low', 'medium', 'bright', 'direct')) DEFAULT 'medium',
    water_frequency_days INTEGER DEFAULT 7,
    water_amount TEXT CHECK (water_amount IN ('little', 'moderate', 'much')) DEFAULT 'moderate',
    humidity TEXT CHECK (humidity IN ('low', 'medium', 'high')) DEFAULT 'medium',
    temperature_min INTEGER DEFAULT 15,
    temperature_max INTEGER DEFAULT 25,
    fertilize_frequency_days INTEGER DEFAULT 14,
    fertilize_months INTEGER[] DEFAULT '{3,4,5,6,7,8,9}',
    toxic_pets BOOLEAN DEFAULT false,
    toxic_children BOOLEAN DEFAULT false,
    max_height_cm INTEGER DEFAULT 100,
    growth_speed TEXT CHECK (growth_speed IN ('slow', 'medium', 'fast')) DEFAULT 'medium',
    repot_frequency_years INTEGER DEFAULT 2,
    care_tips TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.plant_species ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read plant species" ON public.plant_species
    FOR SELECT USING (true);

-- ============================================
-- APARTMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.pm_apartments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    address TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pm_apartments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own apartments" ON public.pm_apartments
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- ROOMS
-- ============================================
CREATE TABLE IF NOT EXISTS public.pm_rooms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    apartment_id UUID REFERENCES public.pm_apartments(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    light_level TEXT CHECK (light_level IN ('low', 'medium', 'bright', 'direct')) DEFAULT 'medium',
    window_direction TEXT CHECK (window_direction IN ('north', 'east', 'south', 'west', 'none')) DEFAULT 'none',
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pm_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage rooms in own apartments" ON public.pm_rooms
    FOR ALL USING (
        apartment_id IN (SELECT id FROM public.pm_apartments WHERE user_id = auth.uid())
    );

-- ============================================
-- USER PLANTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.pm_user_plants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    species_id TEXT REFERENCES public.plant_species(id),
    room_id UUID REFERENCES public.pm_rooms(id) ON DELETE SET NULL,
    nickname TEXT NOT NULL,
    acquired_date DATE DEFAULT CURRENT_DATE,
    last_watered TIMESTAMPTZ,
    last_fertilized TIMESTAMPTZ,
    last_repotted TIMESTAMPTZ,
    water_frequency_override INTEGER,
    fertilize_frequency_override INTEGER,
    notes TEXT DEFAULT '',
    image_url TEXT,
    health_status TEXT CHECK (health_status IN ('thriving', 'good', 'fair', 'poor')) DEFAULT 'good',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pm_user_plants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own plants" ON public.pm_user_plants
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- CARE EVENTS (History log)
-- ============================================
CREATE TABLE IF NOT EXISTS public.pm_care_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    plant_id UUID REFERENCES public.pm_user_plants(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('water', 'fertilize', 'repot', 'prune', 'mist', 'rotate')) NOT NULL,
    performed_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pm_care_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage care events for own plants" ON public.pm_care_events
    FOR ALL USING (
        plant_id IN (SELECT id FROM public.pm_user_plants WHERE user_id = auth.uid())
    );

-- ============================================
-- VACATION PLANS
-- ============================================
CREATE TABLE IF NOT EXISTS public.pm_vacation_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pm_vacation_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own vacation plans" ON public.pm_vacation_plans
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- VACATION HELPERS
-- ============================================
CREATE TABLE IF NOT EXISTS public.pm_vacation_helpers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    vacation_plan_id UUID REFERENCES public.pm_vacation_plans(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    accepted BOOLEAN,
    calendar_exported BOOLEAN DEFAULT false
);

ALTER TABLE public.pm_vacation_helpers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage helpers for own plans" ON public.pm_vacation_helpers
    FOR ALL USING (
        vacation_plan_id IN (SELECT id FROM public.pm_vacation_plans WHERE user_id = auth.uid())
    );

-- ============================================
-- VACATION TASKS
-- ============================================
CREATE TABLE IF NOT EXISTS public.pm_vacation_tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    vacation_plan_id UUID REFERENCES public.pm_vacation_plans(id) ON DELETE CASCADE NOT NULL,
    plant_id UUID REFERENCES public.pm_user_plants(id) ON DELETE CASCADE NOT NULL,
    helper_id UUID REFERENCES public.pm_vacation_helpers(id) ON DELETE SET NULL,
    task_date DATE NOT NULL,
    task_type TEXT CHECK (task_type IN ('water', 'fertilize', 'mist')) NOT NULL,
    instructions TEXT DEFAULT '',
    completed BOOLEAN DEFAULT false
);

ALTER TABLE public.pm_vacation_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage tasks for own plans" ON public.pm_vacation_tasks
    FOR ALL USING (
        vacation_plan_id IN (SELECT id FROM public.pm_vacation_plans WHERE user_id = auth.uid())
    );

-- ============================================
-- SHOPPING ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS public.pm_shopping_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT CHECK (category IN ('soil', 'fertilizer', 'pot', 'tool', 'pesticide', 'other')) DEFAULT 'other',
    for_plant_id UUID REFERENCES public.pm_user_plants(id) ON DELETE SET NULL,
    quantity INTEGER DEFAULT 1,
    purchased BOOLEAN DEFAULT false,
    affiliate_links JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pm_shopping_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own shopping items" ON public.pm_shopping_items
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_pm_apartments_user ON public.pm_apartments(user_id);
CREATE INDEX IF NOT EXISTS idx_pm_rooms_apartment ON public.pm_rooms(apartment_id);
CREATE INDEX IF NOT EXISTS idx_pm_plants_user ON public.pm_user_plants(user_id);
CREATE INDEX IF NOT EXISTS idx_pm_plants_room ON public.pm_user_plants(room_id);
CREATE INDEX IF NOT EXISTS idx_pm_plants_species ON public.pm_user_plants(species_id);
CREATE INDEX IF NOT EXISTS idx_pm_care_events_plant ON public.pm_care_events(plant_id);
CREATE INDEX IF NOT EXISTS idx_pm_care_events_type ON public.pm_care_events(type);
CREATE INDEX IF NOT EXISTS idx_pm_vacation_plans_user ON public.pm_vacation_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_pm_vacation_tasks_plan ON public.pm_vacation_tasks(vacation_plan_id);
CREATE INDEX IF NOT EXISTS idx_pm_vacation_tasks_date ON public.pm_vacation_tasks(task_date);
CREATE INDEX IF NOT EXISTS idx_pm_shopping_user ON public.pm_shopping_items(user_id);
CREATE INDEX IF NOT EXISTS idx_plant_species_name ON public.plant_species(common_name);
CREATE INDEX IF NOT EXISTS idx_plant_species_botanical ON public.plant_species(botanical_name);
