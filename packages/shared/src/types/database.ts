// =====================================================
// Shared cross-app types for the Fintutto ecosystem
// Based on the REAL vermietify_final Supabase schema
// =====================================================
//
// Note: Each app has its own auto-generated Supabase types.
// This file provides SHARED convenience types used across
// multiple apps (portal, admin-hub, ablesung, mieter, etc.)
// =====================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ===========================================
// Organization (multi-tenancy root)
// ===========================================

export interface Organization {
  id: string
  name: string
  slug: string | null
  logo_url: string | null
  created_at: string
  updated_at: string
}

// ===========================================
// Profile (auth user → organization mapping)
// ===========================================

export interface Profile {
  id: string
  user_id: string
  organization_id: string | null
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  onboarding_completed: boolean | null
  created_at: string
  updated_at: string
}

// ===========================================
// Building (= Immobilie / Gebäude)
// ===========================================

export type BuildingType = 'apartment' | 'house' | 'commercial' | 'mixed'

export interface Building {
  id: string
  organization_id: string
  name: string
  address: string
  postal_code: string
  city: string
  building_type: BuildingType
  total_area: number | null
  year_built: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface BuildingInsert extends Omit<Building, 'id' | 'created_at' | 'updated_at'> {
  id?: string
  created_at?: string
  updated_at?: string
}

// ===========================================
// Unit (= Einheit / Wohnung)
// ===========================================

export type UnitStatus = 'vacant' | 'rented' | 'renovating'

export interface Unit {
  id: string
  building_id: string
  unit_number: string
  floor: number | null
  area: number
  rooms: number
  rent_amount: number
  utility_advance: number | null
  status: UnitStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export interface UnitInsert extends Omit<Unit, 'id' | 'created_at' | 'updated_at'> {
  id?: string
  created_at?: string
  updated_at?: string
}

// ===========================================
// Tenant (= Mieter)
// ===========================================

export interface Tenant {
  id: string
  organization_id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  postal_code: string | null
  birth_date: string | null
  household_size: number | null
  previous_landlord: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface TenantInsert extends Omit<Tenant, 'id' | 'created_at' | 'updated_at'> {
  id?: string
  created_at?: string
  updated_at?: string
}

// ===========================================
// Lease (= Mietvertrag)
// ===========================================

export interface Lease {
  id: string
  unit_id: string
  tenant_id: string
  start_date: string
  end_date: string | null
  rent_amount: number
  utility_advance: number | null
  deposit_amount: number | null
  deposit_paid: boolean | null
  payment_day: number | null
  is_active: boolean | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface LeaseInsert extends Omit<Lease, 'id' | 'created_at' | 'updated_at'> {
  id?: string
  created_at?: string
  updated_at?: string
}

// ===========================================
// Transaction (= Zahlung / Buchung)
// ===========================================

export type TransactionType = 'rent' | 'deposit' | 'utility' | 'repair' | 'insurance' | 'tax' | 'other_income' | 'other_expense'

export interface Transaction {
  id: string
  organization_id: string
  lease_id: string | null
  building_id: string | null
  amount: number
  transaction_date: string
  transaction_type: TransactionType
  is_income: boolean
  description: string | null
  created_at: string
  updated_at: string
}

// ===========================================
// Meter (= Zähler)
// ===========================================

export type MeterType = 'electricity' | 'gas' | 'water' | 'heating'

export interface Meter {
  id: string
  unit_id: string
  meter_number: string
  meter_type: MeterType
  installation_date: string | null
  reading_interval_months: number
  notes: string | null
  created_at: string
  updated_at: string
}

// ===========================================
// Meter Reading (= Zählerstand)
// ===========================================

export interface MeterReading {
  id: string
  meter_id: string
  reading_value: number
  reading_date: string
  recorded_by: string | null
  notes: string | null
  created_at: string
}

// ===========================================
// Task (= Aufgabe)
// ===========================================

export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent'
export type TaskStatus = 'open' | 'in_progress' | 'completed' | 'cancelled'
export type TaskCategory = 'water_damage' | 'heating' | 'electrical' | 'other'

export interface Task {
  id: string
  organization_id: string
  building_id: string | null
  unit_id: string | null
  title: string
  description: string | null
  priority: TaskPriority | null
  category: TaskCategory | null
  status: TaskStatus | null
  created_by: string | null
  assigned_to: string | null
  due_date: string | null
  created_at: string
  updated_at: string
}

// ===========================================
// Document (= Dokument)
// ===========================================

export interface Document {
  id: string
  organization_id: string
  building_id: string | null
  unit_id: string | null
  tenant_id: string | null
  name: string
  file_path: string
  file_type: string | null
  file_size: number | null
  category: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// ===========================================
// Portal-specific: Users, Checker, Referrals
// ===========================================

export interface PortalUser {
  id: string
  email: string
  name: string | null
  tier: 'free' | 'basic' | 'premium' | 'professional'
  checks_used: number
  checks_limit: number
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at: string
  updated_at: string
}

export interface CheckerSession {
  id: string
  user_id: string | null
  checker_type: string
  session_data: Json
  result: Json | null
  status: 'in_progress' | 'completed' | 'expired'
  created_at: string
  completed_at: string | null
}

export interface CheckerResult {
  id: string
  session_id: string
  user_id: string | null
  checker_type: string
  input_data: Json
  result_data: Json
  recommendation: string
  form_redirect_url: string | null
  created_at: string
}

// ===========================================
// Operating Costs (= Betriebskosten)
// ===========================================

export type OperatingCostStatus = 'draft' | 'calculated' | 'sent' | 'completed'
export type DistributionKey = 'area' | 'units' | 'persons' | 'consumption'

export interface OperatingCostStatement {
  id: string
  building_id: string
  period_start: string
  period_end: string
  status: OperatingCostStatus
  total_costs: number
  created_at: string
  updated_at: string
}

// ===========================================
// Dashboard / Statistics (cross-app)
// ===========================================

export interface DashboardStats {
  total_buildings: number
  total_units: number
  occupied_units: number
  vacant_units: number
  total_tenants: number
  total_monthly_rent: number
  overdue_payments: number
  open_tasks: number
}

export interface OccupancyStats {
  total: number
  occupied: number
  vacant: number
  maintenance: number
  occupancy_rate: number
}

// ===========================================
// Joined / Nested types (for Supabase queries)
// ===========================================

export interface BuildingWithUnits extends Building {
  units: Unit[]
}

export interface UnitWithTenant extends Unit {
  tenant?: Partial<Tenant>
  building?: Partial<Building>
}

export interface TenantWithLeases extends Tenant {
  leases: Lease[]
  current_unit?: Partial<Unit>
}

export interface LeaseWithDetails extends Lease {
  tenant?: Partial<Tenant>
  unit?: Partial<Unit> & {
    building?: Partial<Building>
  }
}

export interface MeterWithReadings extends Meter {
  readings: MeterReading[]
  unit?: Partial<Unit>
}

// ===========================================
// Form types (used by multiple apps)
// ===========================================

export interface BuildingFormData {
  name: string
  street: string
  zip: string
  city: string
  country?: string
  building_type?: BuildingType
  total_area?: number
  year_built?: number
  notes?: string
}

export interface TenantFormData {
  first_name: string
  last_name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  birth_date?: string
  household_size?: number
  previous_landlord?: string
  notes?: string
}

export interface LeaseFormData {
  unit_id: string
  tenant_id: string
  start_date: string
  end_date?: string
  rent_amount: number
  utility_advance?: number
  deposit_amount?: number
  deposit_paid?: boolean
  payment_day?: number
}

// ===========================================
// Ecosystem Apps (cross-promotion)
// ===========================================

export interface EcosystemApp {
  id: string
  name: string
  slug: string
  description: string | null
  icon_url: string | null
  app_url: string
  is_active: boolean
  sort_order: number
  features: Json | null
  pricing: Json | null
}
