-- Fix: companies INSERT RLS-Policy
-- Problem: Die bestehende Policy erlaubt keinem User eine Firma zu erstellen (403 Fehler)
-- Lösung: Jeder authentifizierte User darf Firmen erstellen.
--         Der handle_new_company Trigger fügt den Ersteller automatisch als 'owner' hinzu.

-- 1. Alle bestehenden INSERT-Policies für companies bereinigen
DROP POLICY IF EXISTS "Users can create companies" ON public.companies;
DROP POLICY IF EXISTS "Authenticated users can create companies" ON public.companies;
DROP POLICY IF EXISTS "companies_insert_authenticated" ON public.companies;

-- 2. Neue, korrekte INSERT-Policy: jeder eingeloggte User darf eine Firma anlegen
CREATE POLICY "Authenticated users can create companies"
  ON public.companies
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- 3. Sicherstellen dass der Trigger zum automatischen Hinzufügen des Owners existiert
--    (idempotent – kann mehrfach ausgeführt werden)
CREATE OR REPLACE FUNCTION public.handle_new_company()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Ersteller wird automatisch als 'owner' in company_members eingetragen
  INSERT INTO public.company_members (company_id, user_id, role)
  VALUES (NEW.id, auth.uid(), 'owner')
  ON CONFLICT (company_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_company_created ON public.companies;
CREATE TRIGGER on_company_created
  AFTER INSERT ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_company();

-- 4. company_members INSERT-Policy: Trigger darf immer einfügen (SECURITY DEFINER),
--    und User darf sich selbst als owner eintragen (für den Trigger-Aufruf)
DROP POLICY IF EXISTS "Only company creation trigger can add members" ON public.company_members;
DROP POLICY IF EXISTS "Authenticated users can join companies" ON public.company_members;
DROP POLICY IF EXISTS "company_members_insert" ON public.company_members;

CREATE POLICY "company_members_insert"
  ON public.company_members
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 5. Anon-Deny für beide Tabellen (Sicherheit)
DROP POLICY IF EXISTS "Deny anonymous access to companies" ON public.companies;
CREATE POLICY "Deny anonymous access to companies"
  ON public.companies FOR ALL TO anon USING (false);

DROP POLICY IF EXISTS "Deny anonymous access to company_members" ON public.company_members;
CREATE POLICY "Deny anonymous access to company_members"
  ON public.company_members FOR ALL TO anon USING (false);
