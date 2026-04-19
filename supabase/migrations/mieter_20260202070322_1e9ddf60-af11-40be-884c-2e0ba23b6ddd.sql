-- ═══════════════════════════════════════════════════════════════════
-- SECURE ROLE MANAGEMENT (Required for proper access control)
-- ═══════════════════════════════════════════════════════════════════

-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'vermieter', 'mieter', 'hausmeister', 'user');

-- Create secure user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles (only admins can manage roles)
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ═══════════════════════════════════════════════════════════════════
-- ORGANIZATIONS
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (length(name) BETWEEN 2 AND 200),
  type TEXT CHECK (type IN ('vermieter', 'hausverwaltung', 'makler')),
  stripe_customer_id TEXT,
  subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'basic', 'pro', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════
-- USER PROFILES (extends existing profiles table concept)
-- ═══════════════════════════════════════════════════════════════════

-- Add organization reference to existing profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id),
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- ═══════════════════════════════════════════════════════════════════
-- BUILDINGS
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE public.buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(name) BETWEEN 2 AND 200),
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'DE',
  total_units INTEGER DEFAULT 0 CHECK (total_units >= 0),
  total_area DECIMAL(10,2) CHECK (total_area >= 0),
  year_built INTEGER CHECK (year_built >= 1800 AND year_built <= 2100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════
-- RENTAL UNITS (new structure, keeping existing units table)
-- ═══════════════════════════════════════════════════════════════════

-- Add building reference to existing units table
ALTER TABLE public.units
  ADD COLUMN IF NOT EXISTS building_id UUID REFERENCES public.buildings(id),
  ADD COLUMN IF NOT EXISTS unit_number TEXT,
  ADD COLUMN IF NOT EXISTS floor INTEGER,
  ADD COLUMN IF NOT EXISTS area DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS rooms DECIMAL(3,1),
  ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'apartment' CHECK (type IN ('apartment', 'commercial', 'parking')),
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'available' CHECK (status IN ('rented', 'available', 'maintenance'));

-- ═══════════════════════════════════════════════════════════════════
-- LEASES (Mietverträge)
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE public.leases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  rent_amount DECIMAL(10,2) NOT NULL CHECK (rent_amount >= 0),
  utilities_advance DECIMAL(10,2) DEFAULT 0 CHECK (utilities_advance >= 0),
  deposit_amount DECIMAL(10,2) CHECK (deposit_amount >= 0),
  payment_day INTEGER DEFAULT 1 CHECK (payment_day BETWEEN 1 AND 28),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'terminated', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_lease_dates CHECK (end_date IS NULL OR end_date > start_date)
);

ALTER TABLE public.leases ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════
-- METERS (Zähler)
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE public.meters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE,
  meter_number TEXT NOT NULL CHECK (length(meter_number) BETWEEN 1 AND 50),
  meter_type TEXT NOT NULL CHECK (meter_type IN ('electricity', 'gas', 'water_cold', 'water_hot', 'heating')),
  installation_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.meters ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════
-- ENHANCED METER READINGS (add to existing table)
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE public.meter_readings
  ADD COLUMN IF NOT EXISTS meter_id UUID REFERENCES public.meters(id),
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'ocr', 'api')),
  ADD COLUMN IF NOT EXISTS confidence DECIMAL(3,2) CHECK (confidence BETWEEN 0 AND 1),
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- ═══════════════════════════════════════════════════════════════════
-- OPERATING COSTS (Betriebskosten)
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE public.operating_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES public.buildings(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'calculated', 'sent')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_period CHECK (period_end > period_start)
);

ALTER TABLE public.operating_costs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.operating_cost_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operating_cost_id UUID REFERENCES public.operating_costs(id) ON DELETE CASCADE,
  cost_type TEXT NOT NULL CHECK (length(cost_type) BETWEEN 1 AND 100),
  amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
  allocation_key TEXT DEFAULT 'area' CHECK (allocation_key IN ('area', 'units', 'persons', 'consumption')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.operating_cost_items ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════
-- TASKS (Aufgaben & Reparaturen)
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL CHECK (length(title) BETWEEN 2 AND 200),
  description TEXT CHECK (length(description) <= 5000),
  category TEXT CHECK (category IN ('repair', 'maintenance', 'inspection')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed')),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════
-- DOCUMENTS
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
  document_type TEXT,
  file_url TEXT,
  file_size INTEGER CHECK (file_size >= 0),
  content_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════
-- ENHANCED MESSAGES (add subject to existing table)
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS subject TEXT CHECK (length(subject) <= 200);

-- ═══════════════════════════════════════════════════════════════════
-- RLS POLICIES FOR NEW TABLES
-- ═══════════════════════════════════════════════════════════════════

-- Organizations: members can view their org
CREATE POLICY "Users can view own organization" ON public.organizations
  FOR SELECT USING (
    id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage organizations" ON public.organizations
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Buildings: org members can view, admins/vermieter can manage
CREATE POLICY "Org members can view buildings" ON public.buildings
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Vermieter can manage buildings" ON public.buildings
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid())
    AND (public.has_role(auth.uid(), 'vermieter') OR public.has_role(auth.uid(), 'admin'))
  );

-- Leases: tenants can view their own, vermieter can manage
CREATE POLICY "Tenants can view own lease" ON public.leases
  FOR SELECT USING (tenant_id = auth.uid());

CREATE POLICY "Vermieter can manage leases" ON public.leases
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.units u
      JOIN public.buildings b ON u.building_id = b.id
      WHERE u.id = leases.unit_id
      AND b.organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid())
    )
    AND (public.has_role(auth.uid(), 'vermieter') OR public.has_role(auth.uid(), 'admin'))
  );

-- Meters: unit tenants and org members can view
CREATE POLICY "Users can view meters for their units" ON public.meters
  FOR SELECT USING (
    unit_id IN (SELECT unit_id FROM public.leases WHERE tenant_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.units u
      JOIN public.buildings b ON u.building_id = b.id
      WHERE u.id = meters.unit_id
      AND b.organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Vermieter can manage meters" ON public.meters
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.units u
      JOIN public.buildings b ON u.building_id = b.id
      WHERE u.id = meters.unit_id
      AND b.organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid())
    )
    AND (public.has_role(auth.uid(), 'vermieter') OR public.has_role(auth.uid(), 'admin'))
  );

-- Operating costs: org members can view, vermieter can manage
CREATE POLICY "Org members can view operating costs" ON public.operating_costs
  FOR SELECT USING (
    building_id IN (
      SELECT b.id FROM public.buildings b
      WHERE b.organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Vermieter can manage operating costs" ON public.operating_costs
  FOR ALL USING (
    building_id IN (
      SELECT b.id FROM public.buildings b
      WHERE b.organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid())
    )
    AND (public.has_role(auth.uid(), 'vermieter') OR public.has_role(auth.uid(), 'admin'))
  );

-- Operating cost items: same as operating costs
CREATE POLICY "Org members can view cost items" ON public.operating_cost_items
  FOR SELECT USING (
    operating_cost_id IN (
      SELECT oc.id FROM public.operating_costs oc
      JOIN public.buildings b ON oc.building_id = b.id
      WHERE b.organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Vermieter can manage cost items" ON public.operating_cost_items
  FOR ALL USING (
    operating_cost_id IN (
      SELECT oc.id FROM public.operating_costs oc
      JOIN public.buildings b ON oc.building_id = b.id
      WHERE b.organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid())
    )
    AND (public.has_role(auth.uid(), 'vermieter') OR public.has_role(auth.uid(), 'admin'))
  );

-- Tasks: assignee can view/update, creator and vermieter can manage
CREATE POLICY "Users can view assigned tasks" ON public.tasks
  FOR SELECT USING (
    created_by = auth.uid() OR assigned_to = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.units u
      JOIN public.buildings b ON u.building_id = b.id
      WHERE u.id = tasks.unit_id
      AND b.organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can create tasks" ON public.tasks
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update assigned tasks" ON public.tasks
  FOR UPDATE USING (
    created_by = auth.uid() OR assigned_to = auth.uid()
    OR (public.has_role(auth.uid(), 'vermieter') OR public.has_role(auth.uid(), 'admin'))
  );

-- Documents: owner and org members can view
CREATE POLICY "Users can view own documents" ON public.documents
  FOR SELECT USING (
    user_id = auth.uid()
    OR organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create documents" ON public.documents
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage own documents" ON public.documents
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own documents" ON public.documents
  FOR DELETE USING (user_id = auth.uid());