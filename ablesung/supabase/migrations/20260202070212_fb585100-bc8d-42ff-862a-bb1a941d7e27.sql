-- Drop existing tables (cascade will handle dependencies)
DROP TABLE IF EXISTS public.meter_readings CASCADE;
DROP TABLE IF EXISTS public.meters CASCADE;
DROP TABLE IF EXISTS public.units CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.user_owns_unit(uuid);
DROP FUNCTION IF EXISTS public.user_owns_meter(uuid);

-- ═══════════════════════════════════════════════════════════════════
-- ENUMS
-- ═══════════════════════════════════════════════════════════════════
DROP TYPE IF EXISTS public.meter_type;
CREATE TYPE public.app_role AS ENUM ('admin', 'vermieter', 'mieter', 'hausmeister');
CREATE TYPE public.org_type AS ENUM ('vermieter', 'hausverwaltung', 'makler');
CREATE TYPE public.unit_type AS ENUM ('apartment', 'commercial', 'parking');
CREATE TYPE public.unit_status AS ENUM ('rented', 'available', 'maintenance');
CREATE TYPE public.lease_status AS ENUM ('active', 'terminated', 'pending');
CREATE TYPE public.meter_type AS ENUM ('electricity', 'gas', 'water_cold', 'water_hot', 'heating');
CREATE TYPE public.reading_source AS ENUM ('manual', 'ocr', 'api');
CREATE TYPE public.cost_status AS ENUM ('draft', 'calculated', 'sent');
CREATE TYPE public.allocation_key AS ENUM ('area', 'units', 'persons', 'consumption');
CREATE TYPE public.task_category AS ENUM ('repair', 'maintenance', 'inspection');
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE public.task_status AS ENUM ('open', 'in_progress', 'completed');

-- ═══════════════════════════════════════════════════════════════════
-- ORGANISATIONEN & BENUTZER
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type org_type,
  stripe_customer_id TEXT,
  subscription_plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Separate user_roles table for security (prevents privilege escalation)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'mieter',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- ═══════════════════════════════════════════════════════════════════
-- IMMOBILIEN
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE public.buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'DE',
  total_units INTEGER DEFAULT 0,
  total_area DECIMAL(10,2),
  year_built INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES public.buildings(id) ON DELETE CASCADE NOT NULL,
  unit_number TEXT NOT NULL,
  floor INTEGER,
  area DECIMAL(10,2),
  rooms DECIMAL(3,1),
  type unit_type DEFAULT 'apartment',
  status unit_status DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════
-- MIETVERTRAEGE
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE public.leases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  rent_amount DECIMAL(10,2) NOT NULL,
  utilities_advance DECIMAL(10,2) DEFAULT 0,
  deposit_amount DECIMAL(10,2),
  payment_day INTEGER DEFAULT 1,
  status lease_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════
-- ZAEHLER & ABLESUNGEN
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE public.meters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE NOT NULL,
  meter_number TEXT NOT NULL,
  meter_type meter_type NOT NULL,
  installation_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.meter_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meter_id UUID REFERENCES public.meters(id) ON DELETE CASCADE NOT NULL,
  reading_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reading_value DECIMAL(12,3) NOT NULL,
  submitted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  source reading_source DEFAULT 'manual',
  confidence DECIMAL(3,2),
  image_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════
-- BETRIEBSKOSTEN
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE public.operating_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES public.buildings(id) ON DELETE CASCADE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status cost_status DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.operating_cost_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operating_cost_id UUID REFERENCES public.operating_costs(id) ON DELETE CASCADE NOT NULL,
  cost_type TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  allocation_key allocation_key DEFAULT 'area',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════
-- AUFGABEN & REPARATUREN
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE,
  building_id UUID REFERENCES public.buildings(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category task_category,
  priority task_priority DEFAULT 'medium',
  status task_status DEFAULT 'open',
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════
-- DOKUMENTE & NACHRICHTEN
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  building_id UUID REFERENCES public.buildings(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  document_type TEXT,
  file_url TEXT,
  file_size INTEGER,
  content_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  subject TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════
-- SECURITY DEFINER FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Get user's organization_id
CREATE OR REPLACE FUNCTION public.get_user_org_id(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.profiles WHERE id = _user_id
$$;

-- Check if user belongs to organization that owns the building
CREATE OR REPLACE FUNCTION public.user_can_access_building(_building_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.buildings b
    JOIN public.profiles p ON p.organization_id = b.organization_id
    WHERE b.id = _building_id AND p.id = auth.uid()
  )
$$;

-- Check if user can access unit (via org or as tenant)
CREATE OR REPLACE FUNCTION public.user_can_access_unit(_unit_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- User's org owns the building
    SELECT 1 FROM public.units u
    JOIN public.buildings b ON u.building_id = b.id
    JOIN public.profiles p ON p.organization_id = b.organization_id
    WHERE u.id = _unit_id AND p.id = auth.uid()
  ) OR EXISTS (
    -- User is tenant of the unit
    SELECT 1 FROM public.leases l
    WHERE l.unit_id = _unit_id AND l.tenant_id = auth.uid() AND l.status = 'active'
  )
$$;

-- Check if user can access meter
CREATE OR REPLACE FUNCTION public.user_can_access_meter(_meter_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.meters m
    WHERE m.id = _meter_id AND public.user_can_access_unit(m.unit_id)
  )
$$;

-- ═══════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meter_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operating_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operating_cost_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Organizations: Members can view their org
CREATE POLICY "Users can view own organization" ON public.organizations
  FOR SELECT USING (id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Admins can update own organization" ON public.organizations
  FOR UPDATE USING (id = public.get_user_org_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'));

-- Profiles: Users can manage own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can view profiles in own org" ON public.profiles
  FOR SELECT USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- User roles: Only viewable, no self-modification
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can manage roles in org" ON public.user_roles
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin') AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = user_id AND p.organization_id = public.get_user_org_id(auth.uid())
    )
  );

-- Buildings: Org members can view/manage
CREATE POLICY "Users can view buildings in own org" ON public.buildings
  FOR SELECT USING (public.user_can_access_building(id));
CREATE POLICY "Vermieter/Admin can manage buildings" ON public.buildings
  FOR ALL USING (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vermieter'))
  );

-- Units: Accessible by org or tenant
CREATE POLICY "Users can view accessible units" ON public.units
  FOR SELECT USING (public.user_can_access_unit(id));
CREATE POLICY "Vermieter/Admin can manage units" ON public.units
  FOR ALL USING (
    public.user_can_access_building(building_id) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vermieter'))
  );

-- Leases: Viewable by org or tenant
CREATE POLICY "Users can view own leases" ON public.leases
  FOR SELECT USING (tenant_id = auth.uid());
CREATE POLICY "Org members can view unit leases" ON public.leases
  FOR SELECT USING (public.user_can_access_unit(unit_id));
CREATE POLICY "Vermieter/Admin can manage leases" ON public.leases
  FOR ALL USING (
    public.user_can_access_unit(unit_id) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vermieter'))
  );

-- Meters: Accessible via unit
CREATE POLICY "Users can view accessible meters" ON public.meters
  FOR SELECT USING (public.user_can_access_meter(id));
CREATE POLICY "Vermieter/Admin can manage meters" ON public.meters
  FOR ALL USING (
    public.user_can_access_unit(unit_id) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vermieter'))
  );

-- Meter readings: Accessible via meter
CREATE POLICY "Users can view accessible readings" ON public.meter_readings
  FOR SELECT USING (public.user_can_access_meter(meter_id));
CREATE POLICY "Users can create readings for accessible meters" ON public.meter_readings
  FOR INSERT WITH CHECK (public.user_can_access_meter(meter_id));
CREATE POLICY "Vermieter/Admin can manage readings" ON public.meter_readings
  FOR ALL USING (
    public.user_can_access_meter(meter_id) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vermieter'))
  );

-- Operating costs: Org access via building
CREATE POLICY "Users can view operating costs" ON public.operating_costs
  FOR SELECT USING (public.user_can_access_building(building_id));
CREATE POLICY "Vermieter/Admin can manage operating costs" ON public.operating_costs
  FOR ALL USING (
    public.user_can_access_building(building_id) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vermieter'))
  );

-- Operating cost items: Via parent
CREATE POLICY "Users can view cost items" ON public.operating_cost_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.operating_costs oc WHERE oc.id = operating_cost_id AND public.user_can_access_building(oc.building_id))
  );
CREATE POLICY "Vermieter/Admin can manage cost items" ON public.operating_cost_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.operating_costs oc 
      WHERE oc.id = operating_cost_id 
      AND public.user_can_access_building(oc.building_id)
      AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vermieter'))
    )
  );

-- Tasks: Accessible by involved parties
CREATE POLICY "Users can view assigned tasks" ON public.tasks
  FOR SELECT USING (created_by = auth.uid() OR assigned_to = auth.uid());
CREATE POLICY "Users can view building/unit tasks" ON public.tasks
  FOR SELECT USING (
    (building_id IS NOT NULL AND public.user_can_access_building(building_id)) OR
    (unit_id IS NOT NULL AND public.user_can_access_unit(unit_id))
  );
CREATE POLICY "Users can create tasks" ON public.tasks
  FOR INSERT WITH CHECK (
    (building_id IS NOT NULL AND public.user_can_access_building(building_id)) OR
    (unit_id IS NOT NULL AND public.user_can_access_unit(unit_id))
  );
CREATE POLICY "Task assignees can update" ON public.tasks
  FOR UPDATE USING (assigned_to = auth.uid() OR created_by = auth.uid());

-- Documents: Org/user access
CREATE POLICY "Users can view own documents" ON public.documents
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can view org documents" ON public.documents
  FOR SELECT USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Users can view building documents" ON public.documents
  FOR SELECT USING (building_id IS NOT NULL AND public.user_can_access_building(building_id));
CREATE POLICY "Users can view unit documents" ON public.documents
  FOR SELECT USING (unit_id IS NOT NULL AND public.user_can_access_unit(unit_id));
CREATE POLICY "Users can create documents" ON public.documents
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Messages: Sender/recipient access
CREATE POLICY "Users can view own messages" ON public.messages
  FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());
CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Recipients can update read status" ON public.messages
  FOR UPDATE USING (recipient_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════════
-- TRIGGERS
-- ═══════════════════════════════════════════════════════════════════

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_buildings_updated_at BEFORE UPDATE ON public.buildings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON public.units FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leases_updated_at BEFORE UPDATE ON public.leases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_meters_updated_at BEFORE UPDATE ON public.meters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_operating_costs_updated_at BEFORE UPDATE ON public.operating_costs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  
  -- Assign default role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'mieter');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();