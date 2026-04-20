-- Migration: financial_transactions tenant_id FK-Fix
-- Datum: 2026-04-20
-- Problem: tenant_id in financial_transactions referenziert user_profiles(id),
--          aber Vermietify-Mieter liegen in der tenants-Tabelle.
-- Lösung: Neue Spalte vermietify_tenant_id → tenants(id) hinzufügen,
--         alte tenant_id Spalte bleibt für Rückwärtskompatibilität erhalten.

-- 1. Neue Spalte für Vermietify-Mieter-Referenz
ALTER TABLE public.financial_transactions
  ADD COLUMN IF NOT EXISTS vermietify_tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL;

-- 2. Index für Performance
CREATE INDEX IF NOT EXISTS idx_financial_transactions_vermietify_tenant
  ON public.financial_transactions(vermietify_tenant_id)
  WHERE vermietify_tenant_id IS NOT NULL;

-- 3. RLS-Policy: Zugriff auf Transaktionen mit Mieter-Verknüpfung
DROP POLICY IF EXISTS "Users can view transactions for their tenants" ON public.financial_transactions;
CREATE POLICY "Users can view transactions for their tenants"
  ON public.financial_transactions
  FOR SELECT
  TO authenticated
  USING (
    -- Eigene Transaktionen
    user_id = auth.uid()
    OR
    -- Transaktionen die dem eigenen Gebäude gehören
    building_id IN (
      SELECT id FROM public.buildings WHERE org_id IN (
        SELECT organization_id FROM public.org_memberships WHERE user_id = auth.uid()
      )
    )
  );

-- 4. Kommentar für Dokumentation
COMMENT ON COLUMN public.financial_transactions.vermietify_tenant_id IS
  'Referenz auf tenants.id (Vermietify-Mieter). Nicht zu verwechseln mit tenant_id (→ user_profiles).';

COMMENT ON COLUMN public.financial_transactions.tenant_id IS
  'VERALTET: Referenziert user_profiles(id) – nur für interne Nutzer. Für Vermietify-Mieter stattdessen vermietify_tenant_id verwenden.';

-- 5. bank_transactions: Sicherstellen dass matched_tenant_id → tenants(id) korrekt ist
-- (bereits korrekt laut Schema, nur dokumentieren)
COMMENT ON COLUMN public.bank_transactions.matched_tenant_id IS
  'Referenz auf tenants.id (Vermietify-Mieter) – korrekte Spalte für Mieter-Zuordnung bei Banktransaktionen.';
