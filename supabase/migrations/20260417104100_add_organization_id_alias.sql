-- ============================================================
-- Fix: organization_id Alias für alle Tabellen mit org_id
-- Datum: 2026-04-17
-- Beschreibung: Fügt organization_id als generierte Spalte
--               (GENERATED ALWAYS AS org_id STORED) zu allen
--               relevanten Tabellen hinzu, damit der Code der
--               organization_id verwendet funktioniert.
-- ============================================================

-- Kern-Tabellen die Vermietify direkt nutzt
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS organization_id uuid GENERATED ALWAYS AS (org_id) STORED;
ALTER TABLE units ADD COLUMN IF NOT EXISTS organization_id uuid GENERATED ALWAYS AS (org_id) STORED;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS organization_id uuid GENERATED ALWAYS AS (org_id) STORED;
ALTER TABLE lease_contracts ADD COLUMN IF NOT EXISTS organization_id uuid GENERATED ALWAYS AS (org_id) STORED;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS organization_id uuid GENERATED ALWAYS AS (org_id) STORED;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS organization_id uuid GENERATED ALWAYS AS (org_id) STORED;
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS organization_id uuid GENERATED ALWAYS AS (org_id) STORED;
ALTER TABLE cost_types ADD COLUMN IF NOT EXISTS organization_id uuid GENERATED ALWAYS AS (org_id) STORED;
ALTER TABLE maintenance_tasks ADD COLUMN IF NOT EXISTS organization_id uuid GENERATED ALWAYS AS (org_id) STORED;
ALTER TABLE inspection_protocols ADD COLUMN IF NOT EXISTS organization_id uuid GENERATED ALWAYS AS (org_id) STORED;
ALTER TABLE meters ADD COLUMN IF NOT EXISTS organization_id uuid GENERATED ALWAYS AS (org_id) STORED;
ALTER TABLE operating_cost_statements ADD COLUMN IF NOT EXISTS organization_id uuid GENERATED ALWAYS AS (org_id) STORED;
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS organization_id uuid GENERATED ALWAYS AS (org_id) STORED;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS organization_id uuid GENERATED ALWAYS AS (org_id) STORED;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS organization_id uuid GENERATED ALWAYS AS (org_id) STORED;
ALTER TABLE roles ADD COLUMN IF NOT EXISTS organization_id uuid GENERATED ALWAYS AS (org_id) STORED;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id uuid GENERATED ALWAYS AS (org_id) STORED;
ALTER TABLE org_memberships ADD COLUMN IF NOT EXISTS organization_id uuid GENERATED ALWAYS AS (org_id) STORED;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS organization_id uuid GENERATED ALWAYS AS (org_id) STORED;
ALTER TABLE generated_documents ADD COLUMN IF NOT EXISTS organization_id uuid GENERATED ALWAYS AS (org_id) STORED;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS organization_id uuid GENERATED ALWAYS AS (org_id) STORED;
