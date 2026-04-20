
-- Create companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Create user_company_assignments table
CREATE TABLE public.user_company_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, company_id)
);
ALTER TABLE public.user_company_assignments ENABLE ROW LEVEL SECURITY;

-- Create buildings table
CREATE TABLE public.buildings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  year_built INTEGER,
  total_area NUMERIC,
  units_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;

-- Create units table
CREATE TABLE public.units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  unit_number TEXT NOT NULL,
  floor INTEGER,
  area NUMERIC,
  tenant_name TEXT,
  tenant_phone TEXT,
  tenant_email TEXT,
  status TEXT NOT NULL DEFAULT 'vacant' CHECK (status IN ('occupied', 'vacant', 'maintenance'))
);
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  building_id UUID REFERENCES public.buildings(id) ON DELETE SET NULL,
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed')),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reported_by_name TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create task_notes table
CREATE TABLE public.task_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.task_notes ENABLE ROW LEVEL SECURITY;

-- Create task_photos table
CREATE TABLE public.task_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'documentation' CHECK (type IN ('reporter', 'documentation')),
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.task_photos ENABLE ROW LEVEL SECURITY;

-- Create time_entries table
CREATE TABLE public.time_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Create trigger for tasks updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ========== RLS POLICIES ==========

-- Helper: Users can access data from their assigned companies
-- user_company_assignments policies
CREATE POLICY "Users can view own company assignments"
  ON public.user_company_assignments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- companies policies
CREATE POLICY "Users can view their companies"
  ON public.companies FOR SELECT
  TO authenticated
  USING (
    id IN (SELECT company_id FROM public.user_company_assignments WHERE user_id = auth.uid())
  );

-- buildings policies
CREATE POLICY "Users can view buildings of their companies"
  ON public.buildings FOR SELECT
  TO authenticated
  USING (
    company_id IN (SELECT company_id FROM public.user_company_assignments WHERE user_id = auth.uid())
  );

-- units policies
CREATE POLICY "Users can view units of their buildings"
  ON public.units FOR SELECT
  TO authenticated
  USING (
    building_id IN (
      SELECT b.id FROM public.buildings b
      JOIN public.user_company_assignments uca ON uca.company_id = b.company_id
      WHERE uca.user_id = auth.uid()
    )
  );

-- tasks policies (full CRUD for company members)
CREATE POLICY "Users can view tasks of their companies"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (
    company_id IN (SELECT company_id FROM public.user_company_assignments WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create tasks in their companies"
  ON public.tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by AND
    company_id IN (SELECT company_id FROM public.user_company_assignments WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update tasks of their companies"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (
    company_id IN (SELECT company_id FROM public.user_company_assignments WHERE user_id = auth.uid())
  );

-- task_notes policies
CREATE POLICY "Users can view notes of their tasks"
  ON public.task_notes FOR SELECT
  TO authenticated
  USING (
    task_id IN (
      SELECT t.id FROM public.tasks t
      JOIN public.user_company_assignments uca ON uca.company_id = t.company_id
      WHERE uca.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create notes on their tasks"
  ON public.task_notes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    task_id IN (
      SELECT t.id FROM public.tasks t
      JOIN public.user_company_assignments uca ON uca.company_id = t.company_id
      WHERE uca.user_id = auth.uid()
    )
  );

-- task_photos policies
CREATE POLICY "Users can view photos of their tasks"
  ON public.task_photos FOR SELECT
  TO authenticated
  USING (
    task_id IN (
      SELECT t.id FROM public.tasks t
      JOIN public.user_company_assignments uca ON uca.company_id = t.company_id
      WHERE uca.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload photos to their tasks"
  ON public.task_photos FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = uploaded_by AND
    task_id IN (
      SELECT t.id FROM public.tasks t
      JOIN public.user_company_assignments uca ON uca.company_id = t.company_id
      WHERE uca.user_id = auth.uid()
    )
  );

-- time_entries policies
CREATE POLICY "Users can view time entries of their tasks"
  ON public.time_entries FOR SELECT
  TO authenticated
  USING (
    task_id IN (
      SELECT t.id FROM public.tasks t
      JOIN public.user_company_assignments uca ON uca.company_id = t.company_id
      WHERE uca.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own time entries"
  ON public.time_entries FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    task_id IN (
      SELECT t.id FROM public.tasks t
      JOIN public.user_company_assignments uca ON uca.company_id = t.company_id
      WHERE uca.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own time entries"
  ON public.time_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
