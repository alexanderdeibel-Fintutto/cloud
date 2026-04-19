-- Fix: Add missing RLS policies for units table
-- This allows landlords/admins to view and manage units in their organization

-- Allow organization members (including landlords) to view units in their buildings
CREATE POLICY "Org members can view building units" ON public.units
  FOR SELECT USING (
    building_id IN (
      SELECT b.id FROM public.buildings b
      WHERE b.organization_id IN (
        SELECT organization_id FROM public.profiles 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Allow vermieter/admins to manage (insert, update, delete) units in their organization
CREATE POLICY "Vermieter can manage units" ON public.units
  FOR ALL USING (
    building_id IN (
      SELECT b.id FROM public.buildings b
      WHERE b.organization_id IN (
        SELECT organization_id FROM public.profiles 
        WHERE user_id = auth.uid()
      )
    )
    AND (has_role(auth.uid(), 'vermieter'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  );