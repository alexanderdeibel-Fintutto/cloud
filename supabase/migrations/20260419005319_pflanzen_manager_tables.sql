-- ============================================================
-- Migration: pflanzen_manager_tables
-- Erstellt alle Tabellen für den Pflanzen-Manager
-- Ersetzt localStorage durch cloud-basierte Datenspeicherung
-- ============================================================

-- 1. Apartments (Wohnungen/Standorte)
CREATE TABLE IF NOT EXISTS public.pm_apartments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  address       TEXT NOT NULL DEFAULT '',
  core_address_id UUID REFERENCES public.core_addresses(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Rooms (Zimmer in Wohnungen)
CREATE TABLE IF NOT EXISTS public.pm_rooms (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id     UUID NOT NULL REFERENCES public.pm_apartments(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  light_level      TEXT NOT NULL DEFAULT 'medium' CHECK (light_level IN ('low','medium','bright','direct')),
  window_direction TEXT NOT NULL DEFAULT 'none' CHECK (window_direction IN ('north','east','south','west','none')),
  notes            TEXT NOT NULL DEFAULT '',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Plant Species (Pflanzenarten - gemeinsame Daten, nicht user-spezifisch)
CREATE TABLE IF NOT EXISTS public.pm_plant_species (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  common_name                TEXT NOT NULL,
  botanical_name             TEXT NOT NULL,
  family                     TEXT NOT NULL DEFAULT '',
  description                TEXT NOT NULL DEFAULT '',
  image_url                  TEXT,
  origin                     TEXT NOT NULL DEFAULT '',
  difficulty                 TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','hard')),
  light                      TEXT NOT NULL DEFAULT 'medium' CHECK (light IN ('low','medium','bright','direct')),
  water_frequency_days       INTEGER NOT NULL DEFAULT 7,
  water_amount               TEXT NOT NULL DEFAULT 'moderate' CHECK (water_amount IN ('little','moderate','much')),
  humidity                   TEXT NOT NULL DEFAULT 'medium' CHECK (humidity IN ('low','medium','high')),
  temperature_min            INTEGER NOT NULL DEFAULT 15,
  temperature_max            INTEGER NOT NULL DEFAULT 28,
  fertilize_frequency_days   INTEGER NOT NULL DEFAULT 30,
  fertilize_months           INTEGER[] NOT NULL DEFAULT '{3,4,5,6,7,8,9}',
  toxic_pets                 BOOLEAN NOT NULL DEFAULT false,
  toxic_children             BOOLEAN NOT NULL DEFAULT false,
  max_height_cm              INTEGER NOT NULL DEFAULT 100,
  growth_speed               TEXT NOT NULL DEFAULT 'medium' CHECK (growth_speed IN ('slow','medium','fast')),
  repot_frequency_years      INTEGER NOT NULL DEFAULT 2,
  care_tips                  TEXT[] NOT NULL DEFAULT '{}',
  tags                       TEXT[] NOT NULL DEFAULT '{}',
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. User Plants (Eigene Pflanzen des Nutzers)
CREATE TABLE IF NOT EXISTS public.pm_user_plants (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  species_id                  UUID REFERENCES public.pm_plant_species(id) ON DELETE SET NULL,
  room_id                     UUID REFERENCES public.pm_rooms(id) ON DELETE SET NULL,
  nickname                    TEXT NOT NULL DEFAULT '',
  acquired_date               DATE,
  last_watered                TIMESTAMPTZ,
  last_fertilized             TIMESTAMPTZ,
  last_repotted               TIMESTAMPTZ,
  water_frequency_override    INTEGER,
  fertilize_frequency_override INTEGER,
  notes                       TEXT NOT NULL DEFAULT '',
  image_url                   TEXT,
  health_status               TEXT NOT NULL DEFAULT 'good' CHECK (health_status IN ('thriving','good','fair','poor')),
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Care Events (Pflegeprotokoll)
CREATE TABLE IF NOT EXISTS public.pm_care_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id     UUID NOT NULL REFERENCES public.pm_user_plants(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN ('water','fertilize','repot','prune','mist','rotate')),
  performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes        TEXT NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Vacation Plans (Urlaubsplanung)
CREATE TABLE IF NOT EXISTS public.pm_vacation_plans (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date   DATE NOT NULL,
  notes      TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Vacation Helpers (Urlaubshelfer)
CREATE TABLE IF NOT EXISTS public.pm_vacation_helpers (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vacation_plan_id UUID NOT NULL REFERENCES public.pm_vacation_plans(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  email            TEXT NOT NULL,
  invited_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted         BOOLEAN,
  calendar_exported BOOLEAN NOT NULL DEFAULT false
);

-- 8. Vacation Tasks (Aufgaben während Urlaub)
CREATE TABLE IF NOT EXISTS public.pm_vacation_tasks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vacation_plan_id UUID NOT NULL REFERENCES public.pm_vacation_plans(id) ON DELETE CASCADE,
  plant_id         UUID REFERENCES public.pm_user_plants(id) ON DELETE SET NULL,
  helper_id        UUID REFERENCES public.pm_vacation_helpers(id) ON DELETE SET NULL,
  task_date        DATE NOT NULL,
  task_type        TEXT NOT NULL CHECK (task_type IN ('water','fertilize','mist')),
  instructions     TEXT NOT NULL DEFAULT '',
  completed        BOOLEAN NOT NULL DEFAULT false
);

-- 9. Shopping Items (Einkaufsliste)
CREATE TABLE IF NOT EXISTS public.pm_shopping_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  category     TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('soil','fertilizer','pot','tool','pesticide','other')),
  for_plant_id UUID REFERENCES public.pm_user_plants(id) ON DELETE SET NULL,
  quantity     INTEGER NOT NULL DEFAULT 1,
  purchased    BOOLEAN NOT NULL DEFAULT false,
  affiliate_links JSONB NOT NULL DEFAULT '[]',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- RLS aktivieren
-- ============================================================
ALTER TABLE public.pm_apartments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pm_rooms            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pm_plant_species    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pm_user_plants      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pm_care_events      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pm_vacation_plans   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pm_vacation_helpers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pm_vacation_tasks   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pm_shopping_items   ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies
-- ============================================================

-- pm_apartments
DROP POLICY IF EXISTS "Users manage own apartments" ON public.pm_apartments;
CREATE POLICY "Users manage own apartments"
  ON public.pm_apartments FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Deny anon pm_apartments" ON public.pm_apartments;
CREATE POLICY "Deny anon pm_apartments"
  ON public.pm_apartments FOR ALL TO anon USING (false);

-- pm_rooms (via apartment ownership)
DROP POLICY IF EXISTS "Users manage own rooms" ON public.pm_rooms;
CREATE POLICY "Users manage own rooms"
  ON public.pm_rooms FOR ALL TO authenticated
  USING (
    apartment_id IN (
      SELECT id FROM public.pm_apartments WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    apartment_id IN (
      SELECT id FROM public.pm_apartments WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Deny anon pm_rooms" ON public.pm_rooms;
CREATE POLICY "Deny anon pm_rooms"
  ON public.pm_rooms FOR ALL TO anon USING (false);

-- pm_plant_species (öffentlich lesbar, nur admins schreiben)
DROP POLICY IF EXISTS "Anyone can read species" ON public.pm_plant_species;
CREATE POLICY "Anyone can read species"
  ON public.pm_plant_species FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Deny anon pm_plant_species" ON public.pm_plant_species;
CREATE POLICY "Deny anon pm_plant_species"
  ON public.pm_plant_species FOR ALL TO anon USING (false);

-- pm_user_plants
DROP POLICY IF EXISTS "Users manage own plants" ON public.pm_user_plants;
CREATE POLICY "Users manage own plants"
  ON public.pm_user_plants FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Deny anon pm_user_plants" ON public.pm_user_plants;
CREATE POLICY "Deny anon pm_user_plants"
  ON public.pm_user_plants FOR ALL TO anon USING (false);

-- pm_care_events
DROP POLICY IF EXISTS "Users manage own care events" ON public.pm_care_events;
CREATE POLICY "Users manage own care events"
  ON public.pm_care_events FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Deny anon pm_care_events" ON public.pm_care_events;
CREATE POLICY "Deny anon pm_care_events"
  ON public.pm_care_events FOR ALL TO anon USING (false);

-- pm_vacation_plans
DROP POLICY IF EXISTS "Users manage own vacation plans" ON public.pm_vacation_plans;
CREATE POLICY "Users manage own vacation plans"
  ON public.pm_vacation_plans FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Deny anon pm_vacation_plans" ON public.pm_vacation_plans;
CREATE POLICY "Deny anon pm_vacation_plans"
  ON public.pm_vacation_plans FOR ALL TO anon USING (false);

-- pm_vacation_helpers (via vacation plan ownership)
DROP POLICY IF EXISTS "Users manage own vacation helpers" ON public.pm_vacation_helpers;
CREATE POLICY "Users manage own vacation helpers"
  ON public.pm_vacation_helpers FOR ALL TO authenticated
  USING (
    vacation_plan_id IN (
      SELECT id FROM public.pm_vacation_plans WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    vacation_plan_id IN (
      SELECT id FROM public.pm_vacation_plans WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Deny anon pm_vacation_helpers" ON public.pm_vacation_helpers;
CREATE POLICY "Deny anon pm_vacation_helpers"
  ON public.pm_vacation_helpers FOR ALL TO anon USING (false);

-- pm_vacation_tasks (via vacation plan ownership)
DROP POLICY IF EXISTS "Users manage own vacation tasks" ON public.pm_vacation_tasks;
CREATE POLICY "Users manage own vacation tasks"
  ON public.pm_vacation_tasks FOR ALL TO authenticated
  USING (
    vacation_plan_id IN (
      SELECT id FROM public.pm_vacation_plans WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    vacation_plan_id IN (
      SELECT id FROM public.pm_vacation_plans WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Deny anon pm_vacation_tasks" ON public.pm_vacation_tasks;
CREATE POLICY "Deny anon pm_vacation_tasks"
  ON public.pm_vacation_tasks FOR ALL TO anon USING (false);

-- pm_shopping_items
DROP POLICY IF EXISTS "Users manage own shopping items" ON public.pm_shopping_items;
CREATE POLICY "Users manage own shopping items"
  ON public.pm_shopping_items FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Deny anon pm_shopping_items" ON public.pm_shopping_items;
CREATE POLICY "Deny anon pm_shopping_items"
  ON public.pm_shopping_items FOR ALL TO anon USING (false);

-- ============================================================
-- updated_at Trigger für alle Tabellen
-- ============================================================
DROP TRIGGER IF EXISTS trg_pm_apartments_updated_at ON public.pm_apartments;
CREATE TRIGGER trg_pm_apartments_updated_at
  BEFORE UPDATE ON public.pm_apartments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_pm_rooms_updated_at ON public.pm_rooms;
CREATE TRIGGER trg_pm_rooms_updated_at
  BEFORE UPDATE ON public.pm_rooms
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_pm_plant_species_updated_at ON public.pm_plant_species;
CREATE TRIGGER trg_pm_plant_species_updated_at
  BEFORE UPDATE ON public.pm_plant_species
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_pm_user_plants_updated_at ON public.pm_user_plants;
CREATE TRIGGER trg_pm_user_plants_updated_at
  BEFORE UPDATE ON public.pm_user_plants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_pm_vacation_plans_updated_at ON public.pm_vacation_plans;
CREATE TRIGGER trg_pm_vacation_plans_updated_at
  BEFORE UPDATE ON public.pm_vacation_plans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_pm_shopping_items_updated_at ON public.pm_shopping_items;
CREATE TRIGGER trg_pm_shopping_items_updated_at
  BEFORE UPDATE ON public.pm_shopping_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- SSOT-View: Pflanzen mit Zimmer- und Wohnungsdaten
-- ============================================================
CREATE OR REPLACE VIEW public.v_pm_plants_full
  WITH (security_invoker = true) AS
SELECT
  p.id,
  p.user_id,
  p.nickname,
  p.health_status,
  p.last_watered,
  p.last_fertilized,
  p.last_repotted,
  p.notes,
  p.image_url,
  p.acquired_date,
  p.created_at,
  p.updated_at,
  -- Species
  s.common_name    AS species_name,
  s.botanical_name,
  s.water_frequency_days,
  s.fertilize_frequency_days,
  s.difficulty,
  s.light,
  -- Room
  r.id             AS room_id,
  r.name           AS room_name,
  r.light_level,
  -- Apartment
  a.id             AS apartment_id,
  a.name           AS apartment_name,
  a.core_address_id
FROM public.pm_user_plants p
LEFT JOIN public.pm_plant_species s ON s.id = p.species_id
LEFT JOIN public.pm_rooms r ON r.id = p.room_id
LEFT JOIN public.pm_apartments a ON a.id = r.apartment_id;
