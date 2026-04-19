-- Add building_id column to meters table
ALTER TABLE public.meters ADD COLUMN building_id uuid REFERENCES public.buildings(id) ON DELETE CASCADE;

-- Make unit_id nullable (meters can now be attached to buildings directly)
ALTER TABLE public.meters ALTER COLUMN unit_id DROP NOT NULL;

-- Create index for building_id
CREATE INDEX idx_meters_building_id ON public.meters(building_id);

-- Update the user_can_access_meter function to work with building_id as well
CREATE OR REPLACE FUNCTION public.user_can_access_meter(_meter_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    -- Access via unit
    SELECT 1 FROM public.meters m
    WHERE m.id = _meter_id AND m.unit_id IS NOT NULL AND public.user_can_access_unit(m.unit_id)
  ) OR EXISTS (
    -- Access via building directly
    SELECT 1 FROM public.meters m
    WHERE m.id = _meter_id AND m.building_id IS NOT NULL AND public.user_can_access_building(m.building_id)
  )
$function$;

-- Update RLS policy for meters to allow managing meters attached to buildings
DROP POLICY IF EXISTS "Vermieter/Admin can manage meters" ON public.meters;
CREATE POLICY "Vermieter/Admin can manage meters" ON public.meters
FOR ALL USING (
  (
    (unit_id IS NOT NULL AND user_can_access_unit(unit_id)) OR
    (building_id IS NOT NULL AND user_can_access_building(building_id))
  ) AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'vermieter'::app_role))
);