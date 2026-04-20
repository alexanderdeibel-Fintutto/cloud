-- Add validation constraints for server-side input validation

-- Issues table constraints
ALTER TABLE public.issues ADD CONSTRAINT check_description_length 
  CHECK (length(description) BETWEEN 10 AND 2000);
ALTER TABLE public.issues ADD CONSTRAINT check_category_values 
  CHECK (category IN ('sanitaer', 'elektrik', 'heizung', 'fenster_tueren', 'wasserschaden', 'schimmel', 'sonstiges'));
ALTER TABLE public.issues ADD CONSTRAINT check_priority_values 
  CHECK (priority IN ('niedrig', 'mittel', 'hoch', 'notfall'));

-- Meter readings constraints
ALTER TABLE public.meter_readings ADD CONSTRAINT check_value_positive 
  CHECK (value >= 0 AND value < 999999999);
ALTER TABLE public.meter_readings ADD CONSTRAINT check_meter_type 
  CHECK (meter_type IN ('strom', 'gas', 'kaltwasser', 'warmwasser'));

-- Profiles constraint
ALTER TABLE public.profiles ADD CONSTRAINT check_name_length
  CHECK (length(name) BETWEEN 2 AND 100);

-- Messages constraint
ALTER TABLE public.messages ADD CONSTRAINT check_content_length
  CHECK (length(content) BETWEEN 1 AND 5000);