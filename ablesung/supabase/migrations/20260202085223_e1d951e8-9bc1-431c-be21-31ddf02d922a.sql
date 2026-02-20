-- ============================================
-- FIX 1: Profiles table - Add explicit auth.uid() IS NOT NULL checks
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles in own org" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Recreate with explicit authentication check
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() IS NOT NULL AND id = auth.uid());

CREATE POLICY "Users can view profiles in own org" ON public.profiles
  FOR SELECT USING (auth.uid() IS NOT NULL AND organization_id = get_user_org_id(auth.uid()));

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() IS NOT NULL AND id = auth.uid());

-- ============================================
-- FIX 2: Leases table - Restrict financial data to tenant + admins only
-- ============================================

-- Drop existing SELECT policies that expose financial data
DROP POLICY IF EXISTS "Users can view own leases" ON public.leases;
DROP POLICY IF EXISTS "Org members can view unit leases" ON public.leases;
DROP POLICY IF EXISTS "Vermieter/Admin can manage leases" ON public.leases;

-- Tenants can only view their OWN lease (not other tenants)
CREATE POLICY "Tenants can view own lease" ON public.leases
  FOR SELECT USING (auth.uid() IS NOT NULL AND tenant_id = auth.uid());

-- Vermieter/Admin can view all leases for units they manage
CREATE POLICY "Vermieter/Admin can view leases" ON public.leases
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND user_can_access_unit(unit_id) 
    AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'vermieter'::app_role))
  );

-- Vermieter/Admin can manage (INSERT/UPDATE/DELETE) leases
CREATE POLICY "Vermieter/Admin can manage leases" ON public.leases
  FOR ALL USING (
    auth.uid() IS NOT NULL 
    AND user_can_access_unit(unit_id) 
    AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'vermieter'::app_role))
  );

-- ============================================
-- FIX 3: Documents storage - Create bucket with proper RLS if not exists
-- ============================================

-- Create documents bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if any
DROP POLICY IF EXISTS "Users can view accessible documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;

-- Storage policy: Users can view documents they have access to via RLS
CREATE POLICY "Authenticated users can view documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' 
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.file_url LIKE '%' || storage.objects.name
      AND (
        d.user_id = auth.uid()
        OR d.organization_id = get_user_org_id(auth.uid())
        OR (d.building_id IS NOT NULL AND user_can_access_building(d.building_id))
        OR (d.unit_id IS NOT NULL AND user_can_access_unit(d.unit_id))
      )
    )
  );

-- Storage policy: Users can upload documents
CREATE POLICY "Authenticated users can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents'
    AND auth.uid() IS NOT NULL
  );

-- Storage policy: Users can delete their own documents
CREATE POLICY "Users can delete own documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents'
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.file_url LIKE '%' || storage.objects.name
      AND d.user_id = auth.uid()
    )
  );