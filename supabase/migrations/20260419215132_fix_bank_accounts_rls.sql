-- ============================================================
-- Fix: RLS-Policies für bank_accounts
-- bank_accounts verwendet user_id (nicht organization_id)
-- Alle CRUD-Operationen für den eigenen User erlauben
-- ============================================================

-- SELECT: eigene Konten lesen
DROP POLICY IF EXISTS "bank_accounts_select_own" ON public.bank_accounts;
CREATE POLICY "bank_accounts_select_own"
  ON public.bank_accounts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- INSERT: eigene Konten anlegen
DROP POLICY IF EXISTS "bank_accounts_insert_own" ON public.bank_accounts;
CREATE POLICY "bank_accounts_insert_own"
  ON public.bank_accounts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- UPDATE: eigene Konten bearbeiten
DROP POLICY IF EXISTS "bank_accounts_update_own" ON public.bank_accounts;
CREATE POLICY "bank_accounts_update_own"
  ON public.bank_accounts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- DELETE: eigene Konten löschen
DROP POLICY IF EXISTS "bank_accounts_delete_own" ON public.bank_accounts;
CREATE POLICY "bank_accounts_delete_own"
  ON public.bank_accounts FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Sicherstellen dass RLS aktiviert ist
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
