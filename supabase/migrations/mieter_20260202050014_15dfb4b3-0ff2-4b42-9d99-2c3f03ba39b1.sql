-- Create units table (apartments/properties)
CREATE TABLE public.units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  address TEXT NOT NULL,
  rent_cold DECIMAL(10,2) NOT NULL DEFAULT 0,
  rent_utilities DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table (tenant profiles)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT profiles_user_id_key UNIQUE (user_id)
);

-- Create issues table (damage reports)
CREATE TABLE public.issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  priority TEXT NOT NULL DEFAULT 'mittel',
  status TEXT NOT NULL DEFAULT 'offen',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meter_readings table
CREATE TABLE public.meter_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meter_type TEXT NOT NULL,
  value DECIMAL(12,2) NOT NULL,
  previous_value DECIMAL(12,2),
  image_url TEXT,
  reading_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  type TEXT NOT NULL DEFAULT 'miete',
  status TEXT NOT NULL DEFAULT 'bezahlt',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meter_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's unit_id
CREATE OR REPLACE FUNCTION public.get_user_unit_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT unit_id FROM public.profiles WHERE user_id = auth.uid()
$$;

-- Profiles RLS Policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

-- Units RLS Policies (users can view their assigned unit)
CREATE POLICY "Users can view their unit" ON public.units
  FOR SELECT USING (
    id = public.get_user_unit_id()
  );

-- Issues RLS Policies
CREATE POLICY "Users can view own issues" ON public.issues
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create issues" ON public.issues
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own issues" ON public.issues
  FOR UPDATE USING (user_id = auth.uid());

-- Meter Readings RLS Policies
CREATE POLICY "Users can view own meter readings" ON public.meter_readings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create meter readings" ON public.meter_readings
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Messages RLS Policies
CREATE POLICY "Users can view own messages" ON public.messages
  FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can mark messages as read" ON public.messages
  FOR UPDATE USING (recipient_id = auth.uid());

-- Payments RLS Policies
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (user_id = auth.uid());

-- Create function to handle profile creation on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'Mieter'));
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public) VALUES ('issue-images', 'issue-images', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('meter-images', 'meter-images', false);

-- Storage policies for issue-images
CREATE POLICY "Users can upload issue images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'issue-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own issue images" ON storage.objects
  FOR SELECT USING (bucket_id = 'issue-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for meter-images
CREATE POLICY "Users can upload meter images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'meter-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own meter images" ON storage.objects
  FOR SELECT USING (bucket_id = 'meter-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;