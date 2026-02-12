-- Function to assign admin and vermieter roles when a user creates/joins an organization
CREATE OR REPLACE FUNCTION public.assign_org_creator_roles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only run when organization_id changes from NULL to a value
  IF OLD.organization_id IS NULL AND NEW.organization_id IS NOT NULL THEN
    -- Add admin role if not exists
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Add vermieter role if not exists
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'vermieter')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_profile_org_assigned ON public.profiles;
CREATE TRIGGER on_profile_org_assigned
  AFTER UPDATE OF organization_id ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_org_creator_roles();