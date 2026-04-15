-- Migration: Verknüpfung zwischen Financial Kompass (biz_*) und Gebäuden (buildings)
-- Zweck: Ausgaben und Rechnungen können optional einem Gebäude zugeordnet werden
-- Dies ermöglicht gebäudebezogene Finanzauswertungen im Financial Kompass

-- 1. building_id zu biz_expenses hinzufügen (optional, nullable)
ALTER TABLE public.biz_expenses
  ADD COLUMN IF NOT EXISTS building_id uuid REFERENCES public.buildings(id) ON DELETE SET NULL;

-- 2. building_id zu biz_invoices hinzufügen (optional, nullable)
ALTER TABLE public.biz_invoices
  ADD COLUMN IF NOT EXISTS building_id uuid REFERENCES public.buildings(id) ON DELETE SET NULL;

-- 3. Index für Performance
CREATE INDEX IF NOT EXISTS idx_biz_expenses_building_id ON public.biz_expenses(building_id);
CREATE INDEX IF NOT EXISTS idx_biz_invoices_building_id ON public.biz_invoices(building_id);

-- 4. View: Finanzübersicht pro Gebäude (für Financial Kompass Dashboard)
CREATE OR REPLACE VIEW public.v_building_financials
  WITH (security_invoker = true) AS
SELECT
  b.id AS building_id,
  b.name AS building_name,
  b.address,
  b.city,
  b.organization_id,
  COALESCE(SUM(CASE WHEN e.id IS NOT NULL THEN e.amount ELSE 0 END), 0) AS total_expenses,
  COALESCE(SUM(CASE WHEN i.id IS NOT NULL AND i.status = 'paid' THEN i.total ELSE 0 END), 0) AS total_revenue,
  COUNT(DISTINCT e.id) AS expense_count,
  COUNT(DISTINCT i.id) AS invoice_count
FROM public.buildings b
LEFT JOIN public.biz_expenses e ON e.building_id = b.id
LEFT JOIN public.biz_invoices i ON i.building_id = b.id
GROUP BY b.id, b.name, b.address, b.city, b.organization_id;

-- 5. RLS-Policy für die neue View (Anon-Deny)
DROP POLICY IF EXISTS "Deny anonymous access to v_building_financials" ON public.v_building_financials;
