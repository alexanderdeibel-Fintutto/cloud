-- Fix 1: Replace weak storage policy with company-scoped access
DROP POLICY IF EXISTS "Users can view their company documents" ON storage.objects;

CREATE POLICY "Users can view their company documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] IN (
      SELECT company_id::text 
      FROM public.user_company_assignments 
      WHERE user_id = auth.uid()
    )
  );