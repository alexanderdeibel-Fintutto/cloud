/**
 * Database types matching the real Supabase SQL schema (Migrations 004-008)
 * These types map 1:1 to the PostgreSQL tables.
 */

// ============ PROFILES (004) ============
export type UserRole = 'vermieter' | 'mieter' | 'hausmeister' | 'admin'

export interface DbProfile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  company_name: string | null
  phone: string | null
  street: string | null
  postal_code: string | null
  city: string | null
  country: string
  role: UserRole
  subscription_tier: string
  subscription_status: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

// ============ PROPERTIES (004) ============
export type PropertyType = 'apartment_building' | 'single_family' | 'commercial' | 'mixed'

export interface DbProperty {
  id: string
  user_id: string
  name: string
  street: string
  house_number: string
  postal_code: string
  city: string
  country: string
  property_type: PropertyType
  year_built: number | null
  living_space: number | null
  land_area: number | null
  number_of_units: number
  purchase_price: number | null
  purchase_date: string | null
  notes: string | null
  image_urls: string[] | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// ============ UNITS (004) ============
export type UnitType = 'apartment' | 'commercial' | 'parking' | 'storage' | 'other'

export interface DbUnit {
  id: string
  property_id: string
  name: string
  floor: number | null
  rooms: number | null
  living_space: number
  unit_type: UnitType
  is_rented: boolean
  current_rent: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

// ============ TENANTS (004) ============
export interface DbTenant {
  id: string
  user_id: string | null
  unit_id: string | null
  landlord_id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  move_in_date: string
  move_out_date: string | null
  deposit_amount: number | null
  deposit_paid: boolean
  is_active: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

// ============ RENTAL CONTRACTS (004) ============
export type ContractType = 'unlimited' | 'limited' | 'sublease'

export interface DbRentalContract {
  id: string
  unit_id: string
  tenant_id: string
  start_date: string
  end_date: string | null
  base_rent: number
  utility_advance: number
  total_rent: number
  payment_day: number
  contract_type: ContractType
  notes: string | null
  created_at: string
  updated_at: string
}

// ============ PAYMENTS (004) ============
export type PaymentType = 'rent' | 'deposit' | 'utility' | 'other'
export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'partial'

export interface DbPayment {
  id: string
  contract_id: string
  tenant_id: string
  amount: number
  due_date: string
  paid_date: string | null
  payment_type: PaymentType
  status: PaymentStatus
  notes: string | null
  created_at: string
}

// ============ DOCUMENTS (004) ============
export type DocumentCategory = 'contract' | 'invoice' | 'protocol' | 'notice' | 'certificate' | 'tax' | 'insurance' | 'other'

export interface DbDocument {
  id: string
  user_id: string
  property_id: string | null
  unit_id: string | null
  tenant_id: string | null
  name: string
  file_path: string
  file_type: string
  file_size: number
  category: DocumentCategory
  notes: string | null
  created_at: string
}

// ============ METERS (005) ============
export type MeterType = 'electricity' | 'gas' | 'water_cold' | 'water_hot' | 'heating' | 'other'

export interface DbMeter {
  id: string
  unit_id: string
  meter_number: string
  meter_type: MeterType
  location: string | null
  installation_date: string | null
  is_active: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

// ============ METER READINGS (005) ============
export type ReadingSource = 'manual' | 'ocr' | 'import' | 'smart_meter'

export interface DbMeterReading {
  id: string
  meter_id: string
  reading_value: number
  reading_date: string
  read_by: string | null
  image_url: string | null
  source: ReadingSource
  notes: string | null
  created_at: string
}

// ============ MAINTENANCE REQUESTS (005) ============
export type MaintenanceCategory = 'plumbing' | 'electrical' | 'heating' | 'structural' | 'appliance' | 'pest' | 'cleaning' | 'other'
export type MaintenancePriority = 'low' | 'normal' | 'high' | 'emergency'
export type MaintenanceStatus = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed'

export interface DbMaintenanceRequest {
  id: string
  property_id: string
  unit_id: string | null
  reported_by: string
  assigned_to: string | null
  title: string
  description: string | null
  category: MaintenanceCategory
  priority: MaintenancePriority
  status: MaintenanceStatus
  image_urls: string[] | null
  resolved_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// ============ TASKS (005) ============
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent'
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled'

export interface DbTask {
  id: string
  property_id: string
  maintenance_request_id: string | null
  created_by: string
  assigned_to: string | null
  title: string
  description: string | null
  due_date: string | null
  priority: TaskPriority
  status: TaskStatus
  completed_at: string | null
  created_at: string
  updated_at: string
}

// ============ TAX NOTICES (006) - BescheidBoxer ============
export type TaxNoticeType = 'grundsteuer' | 'einkommensteuer' | 'gewerbesteuer' | 'umsatzsteuer' | 'erbschaftsteuer' | 'schenkungsteuer' | 'grunderwerbsteuer' | 'other'
export type TaxNoticeStatus = 'received' | 'checking' | 'accepted' | 'objection_filed' | 'resolved'

export interface DbTaxNotice {
  id: string
  user_id: string
  property_id: string | null
  notice_type: TaxNoticeType
  tax_year: number
  received_date: string
  deadline_date: string | null
  amount_assessed: number | null
  amount_expected: number | null
  deviation_amount: number | null
  status: TaxNoticeStatus
  objection_deadline: string | null
  ai_analysis: Record<string, unknown> | null
  document_ids: string[] | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface DbTaxNoticeCheck {
  id: string
  tax_notice_id: string
  check_type: string
  input_data: Record<string, unknown>
  result_data: Record<string, unknown>
  recommendation: string | null
  has_issues: boolean
  created_at: string
}

// ============ LABEL MAPPINGS ============
export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  apartment_building: 'Mehrfamilienhaus',
  single_family: 'Einfamilienhaus',
  commercial: 'Gewerbe',
  mixed: 'Gemischt',
}

export const UNIT_TYPE_LABELS: Record<UnitType, string> = {
  apartment: 'Wohnung',
  commercial: 'Gewerbe',
  parking: 'Stellplatz',
  storage: 'Lager',
  other: 'Sonstige',
}

export const METER_TYPE_LABELS: Record<MeterType, string> = {
  electricity: 'Strom',
  gas: 'Gas',
  water_cold: 'Kaltwasser',
  water_hot: 'Warmwasser',
  heating: 'Heizung',
  other: 'Sonstige',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Ausstehend',
  paid: 'Bezahlt',
  overdue: 'Ueberfaellig',
  partial: 'Teilweise',
}

export const MAINTENANCE_STATUS_LABELS: Record<MaintenanceStatus, string> = {
  open: 'Offen',
  in_progress: 'In Bearbeitung',
  waiting: 'Wartend',
  resolved: 'Geloest',
  closed: 'Geschlossen',
}

export const TAX_NOTICE_TYPE_LABELS: Record<TaxNoticeType, string> = {
  grundsteuer: 'Grundsteuer',
  einkommensteuer: 'Einkommensteuer',
  gewerbesteuer: 'Gewerbesteuer',
  umsatzsteuer: 'Umsatzsteuer',
  erbschaftsteuer: 'Erbschaftsteuer',
  schenkungsteuer: 'Schenkungsteuer',
  grunderwerbsteuer: 'Grunderwerbsteuer',
  other: 'Sonstige',
}
