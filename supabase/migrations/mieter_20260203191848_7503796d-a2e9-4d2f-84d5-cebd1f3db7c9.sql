-- Add storage policies allowing admin/vermieter to view images from org members

-- Allow admin/vermieter to view issue images from organization members
CREATE POLICY "Org admins can view member issue images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'issue-images'
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'vermieter'::app_role))
  AND (storage.foldername(name))[1] IN (
    SELECT user_id::text FROM profiles
    WHERE organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  )
);

-- Allow admin/vermieter to view meter images from organization members
CREATE POLICY "Org admins can view member meter images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'meter-images'
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'vermieter'::app_role))
  AND (storage.foldername(name))[1] IN (
    SELECT user_id::text FROM profiles
    WHERE organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  )
);