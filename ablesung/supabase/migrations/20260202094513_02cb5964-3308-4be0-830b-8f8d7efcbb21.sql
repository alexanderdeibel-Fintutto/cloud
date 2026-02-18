-- FIX: Meter photo storage RLS policies too restrictive
-- Align storage access with meter_readings table RLS policies

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own meter photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own meter photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own meter photos" ON storage.objects;

-- Allow viewing based on meter access (matches meter_readings RLS)
CREATE POLICY "Users can view accessible meter photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'meter-photos' 
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.meter_readings mr
      WHERE mr.image_url = storage.objects.name
      AND public.user_can_access_meter(mr.meter_id)
    )
  );

-- Allow uploads for authenticated users
CREATE POLICY "Users can upload meter photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'meter-photos'
    AND auth.uid() IS NOT NULL
  );

-- Allow deletion by uploader or admin/vermieter
CREATE POLICY "Authorized users can delete meter photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'meter-photos'
    AND auth.uid() IS NOT NULL
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'vermieter'::public.app_role)
    )
  );