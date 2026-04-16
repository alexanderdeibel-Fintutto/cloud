-- Migration: first_name und last_name Spalten zur profiles-Tabelle hinzufügen
-- Hintergrund: Der Onboarding-Wizard speichert Vor- und Nachname getrennt.
-- Die Tabelle hatte bisher nur full_name. Beide Spalten werden ergänzt.
-- Bestehende full_name-Werte werden aufgeteilt (erster Teil = first_name, Rest = last_name).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name  text;

-- Bestehende full_name-Werte aufteilen
UPDATE public.profiles
SET
  first_name = split_part(full_name, ' ', 1),
  last_name  = CASE
                 WHEN position(' ' IN full_name) > 0
                 THEN substring(full_name FROM position(' ' IN full_name) + 1)
                 ELSE NULL
               END
WHERE full_name IS NOT NULL
  AND first_name IS NULL;

-- full_name automatisch aus first_name + last_name befüllen (Trigger)
CREATE OR REPLACE FUNCTION public.sync_full_name()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.first_name IS NOT NULL OR NEW.last_name IS NOT NULL THEN
    NEW.full_name := trim(coalesce(NEW.first_name, '') || ' ' || coalesce(NEW.last_name, ''));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_full_name ON public.profiles;
CREATE TRIGGER trg_sync_full_name
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_full_name();
