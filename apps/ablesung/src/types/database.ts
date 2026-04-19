// ═══════════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════════
export type AppRole = 'admin' | 'vermieter' | 'mieter' | 'hausmeister';
export type OrgType = 'vermieter' | 'hausverwaltung' | 'makler';
export type UnitType = 'apartment' | 'commercial' | 'parking';
export type UnitStatus = 'rented' | 'available' | 'maintenance';
export type LeaseStatus = 'active' | 'terminated' | 'pending';
export type MeterType =
  // Basis
  | 'electricity'
  | 'gas'
  | 'water_cold'
  | 'water_hot'
  | 'heating'
  // Solar/PV
  | 'pv_feed_in'
  | 'pv_self_consumption'
  | 'pv_production'
  // Spezial-Strom
  | 'electricity_ht'
  | 'electricity_nt'
  | 'electricity_common'
  | 'heat_pump'
  | 'ev_charging'
  // Erweiterte Wärme/Kälte
  | 'district_heating'
  | 'cooling'
  // Brennstoffe
  | 'oil'
  | 'pellets'
  | 'lpg';
export type ReadingSource = 'manual' | 'ocr' | 'api';
export type CostStatus = 'draft' | 'calculated' | 'sent';
export type AllocationKey = 'area' | 'units' | 'persons' | 'consumption';
export type TaskCategory = 'repair' | 'maintenance' | 'inspection';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'open' | 'in_progress' | 'completed';
export type ContractStatus = 'active' | 'cancelled' | 'expired' | 'pending';
export type ProviderType = 'electricity' | 'gas' | 'water' | 'heating' | 'district_heating' | 'oil';
export type ReadingStatus = 'current' | 'due' | 'overdue';

// ═══════════════════════════════════════════════════════════════════
// CORE ENTITIES
// ═══════════════════════════════════════════════════════════════════
export interface Organization {
  id: string;
  name: string;
  type: OrgType | null;
  stripe_customer_id: string | null;
  subscription_plan: string;
  created_at: string;
}

export interface Profile {
  id: string;
  organization_id: string | null;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

// ═══════════════════════════════════════════════════════════════════
// IMMOBILIEN
// ═══════════════════════════════════════════════════════════════════
export interface Building {
  id: string;
  organization_id: string;
  name: string;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string;
  total_units: number;
  total_area: number | null;
  year_built: number | null;
  created_at: string;
  updated_at: string;
}

export interface Unit {
  id: string;
  building_id: string;
  unit_number: string;
  floor: number | null;
  area: number | null;
  rooms: number | null;
  type: UnitType;
  status: UnitStatus;
  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════════════════════════════════
// MIETVERTRAEGE
// ═══════════════════════════════════════════════════════════════════
export interface Lease {
  id: string;
  unit_id: string;
  tenant_id: string | null;
  start_date: string;
  end_date: string | null;
  rent_amount: number;
  utilities_advance: number;
  deposit_amount: number | null;
  payment_day: number;
  status: LeaseStatus;
  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════════════════════════════════
// ZAEHLER & ABLESUNGEN
// ═══════════════════════════════════════════════════════════════════
export interface Meter {
  id: string;
  unit_id: string | null;
  building_id: string | null;
  meter_number: string;
  meter_type: MeterType;
  installation_date: string | null;
  replaced_by: string | null;
  reading_interval_days: number;
  created_at: string;
  updated_at: string;
}

export interface MeterReading {
  id: string;
  meter_id: string;
  reading_date: string;
  reading_value: number;
  submitted_by: string | null;
  source: ReadingSource;
  confidence: number | null;
  image_url: string | null;
  is_verified: boolean;
  created_at: string;
}

// ═══════════════════════════════════════════════════════════════════
// ENERGIEVERSORGER-VERTRÄGE
// ═══════════════════════════════════════════════════════════════════
export interface EnergyContract {
  id: string;
  organization_id: string;
  building_id: string | null;
  provider_name: string;
  provider_type: ProviderType;
  contract_number: string | null;
  tariff_name: string | null;
  price_per_unit: number | null;
  base_fee_monthly: number | null;
  contract_start: string;
  contract_end: string | null;
  cancellation_period_days: number;
  cancellation_deadline: string | null;
  auto_renewal_months: number;
  notes: string | null;
  status: ContractStatus;
  created_at: string;
  updated_at: string;
}

export interface ContractReminder {
  id: string;
  contract_id: string;
  reminder_date: string;
  reminder_type: 'cancellation_deadline' | 'contract_end' | 'price_check' | 'meter_reading';
  is_dismissed: boolean;
  sent_at: string | null;
  created_at: string;
}

// ═══════════════════════════════════════════════════════════════════
// PHOTOVOLTAIK
// ═══════════════════════════════════════════════════════════════════
export interface PVSystem {
  id: string;
  building_id: string;
  installed_power_kwp: number;
  installation_date: string | null;
  orientation: string | null;
  tilt_angle: number | null;
  inverter_model: string | null;
  battery_capacity_kwh: number | null;
  feed_in_tariff: number | null;
  feed_in_tariff_end: string | null;
  annual_degradation_percent: number;
  cost_total: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════════════════════════════════
// WETTERDATEN
// ═══════════════════════════════════════════════════════════════════
export interface WeatherData {
  id: string;
  building_id: string;
  date: string;
  temp_avg: number | null;
  temp_min: number | null;
  temp_max: number | null;
  sunshine_hours: number | null;
  precipitation_mm: number | null;
  heating_degree_days: number | null;
  solar_radiation_kwh: number | null;
  source: string;
}

// ═══════════════════════════════════════════════════════════════════
// BENCHMARK-DATEN
// ═══════════════════════════════════════════════════════════════════
export interface ConsumptionBenchmark {
  meter_type: MeterType;
  building_type: 'efh' | 'mfh_small' | 'mfh_large' | 'commercial';
  persons_range: string;
  annual_consumption_low: number;
  annual_consumption_medium: number;
  annual_consumption_high: number;
  unit: string;
  source: string;
  valid_year: number;
}

// ═══════════════════════════════════════════════════════════════════
// SPARPOTENZIAL-ANALYSEN
// ═══════════════════════════════════════════════════════════════════
export interface SavingsAnalysis {
  id: string;
  organization_id: string;
  building_id: string | null;
  meter_type: MeterType;
  analysis_date: string;
  current_annual_consumption: number;
  current_annual_cost: number;
  benchmark_consumption: number;
  potential_savings_kwh: number;
  potential_savings_euro: number;
  recommendations: SavingsRecommendation[];
  provider_alternatives: ProviderAlternative[];
}

export interface SavingsRecommendation {
  title: string;
  description: string;
  estimated_savings_euro: number;
  estimated_savings_kwh: number;
  investment_cost: number | null;
  payback_months: number | null;
  category: 'behavior' | 'investment' | 'tariff' | 'technology';
}

export interface ProviderAlternative {
  provider_name: string;
  tariff_name: string;
  price_per_unit: number;
  base_fee_monthly: number;
  annual_cost: number;
  savings_vs_current: number;
  is_green: boolean;
  switch_url: string | null;
}

// ═══════════════════════════════════════════════════════════════════
// BETRIEBSKOSTEN
// ═══════════════════════════════════════════════════════════════════
export interface OperatingCost {
  id: string;
  building_id: string;
  period_start: string;
  period_end: string;
  status: CostStatus;
  created_at: string;
  updated_at: string;
}

export interface OperatingCostItem {
  id: string;
  operating_cost_id: string;
  cost_type: string;
  amount: number;
  allocation_key: AllocationKey;
  created_at: string;
}

// ═══════════════════════════════════════════════════════════════════
// AUFGABEN & REPARATUREN
// ═══════════════════════════════════════════════════════════════════
export interface Task {
  id: string;
  unit_id: string | null;
  building_id: string | null;
  created_by: string | null;
  assigned_to: string | null;
  title: string;
  description: string | null;
  category: TaskCategory | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════════════════════════════════
// DOKUMENTE & NACHRICHTEN
// ═══════════════════════════════════════════════════════════════════
export interface Document {
  id: string;
  organization_id: string | null;
  user_id: string | null;
  building_id: string | null;
  unit_id: string | null;
  title: string;
  document_type: string | null;
  file_url: string | null;
  file_size: number | null;
  content_json: Record<string, unknown> | null;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string | null;
  recipient_id: string | null;
  subject: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
}

// ═══════════════════════════════════════════════════════════════════
// EXTENDED TYPES (with relations)
// ═══════════════════════════════════════════════════════════════════
export interface MeterWithReadings extends Meter {
  readings: MeterReading[];
  lastReading?: MeterReading;
  consumption?: number;
  readingStatus?: ReadingStatus;
}

export interface UnitWithMeters extends Unit {
  meters: MeterWithReadings[];
  building?: Building;
  activeLeases?: Lease[];
}

export interface BuildingWithUnits extends Building {
  units: UnitWithMeters[];
  meters?: MeterWithReadings[]; // Direct meters attached to building
}

export interface ProfileWithRoles extends Profile {
  roles: AppRole[];
  organization?: Organization;
}

export interface EnergyContractWithReminders extends EnergyContract {
  reminders: ContractReminder[];
  daysUntilDeadline: number | null;
  urgency: 'ok' | 'warning' | 'critical';
}

// ═══════════════════════════════════════════════════════════════════
// LABELS & UNITS
// ═══════════════════════════════════════════════════════════════════
export const METER_TYPE_LABELS: Record<MeterType, string> = {
  electricity: 'Strom (Bezug)',
  gas: 'Gas',
  water_cold: 'Kaltwasser',
  water_hot: 'Warmwasser',
  heating: 'Heizung',
  pv_feed_in: 'PV-Einspeisung',
  pv_self_consumption: 'PV-Eigenverbrauch',
  pv_production: 'PV-Gesamtproduktion',
  electricity_ht: 'Strom HT (Hochtarif)',
  electricity_nt: 'Strom NT (Niedertarif)',
  electricity_common: 'Allgemeinstrom',
  heat_pump: 'Wärmepumpe',
  ev_charging: 'E-Auto-Ladung',
  district_heating: 'Fernwärme',
  cooling: 'Kühlung',
  oil: 'Heizöl',
  pellets: 'Pellets',
  lpg: 'Flüssiggas',
};

export const METER_TYPE_UNITS: Record<MeterType, string> = {
  electricity: 'kWh',
  gas: 'm³',
  water_cold: 'm³',
  water_hot: 'm³',
  heating: 'kWh',
  pv_feed_in: 'kWh',
  pv_self_consumption: 'kWh',
  pv_production: 'kWh',
  electricity_ht: 'kWh',
  electricity_nt: 'kWh',
  electricity_common: 'kWh',
  heat_pump: 'kWh',
  ev_charging: 'kWh',
  district_heating: 'kWh',
  cooling: 'kWh',
  oil: 'Liter',
  pellets: 'kg',
  lpg: 'kg',
};

export const METER_TYPE_GROUPS: Record<string, { label: string; types: MeterType[] }> = {
  strom: {
    label: 'Strom',
    types: ['electricity', 'electricity_ht', 'electricity_nt', 'electricity_common', 'heat_pump', 'ev_charging'],
  },
  solar: {
    label: 'Solar / PV',
    types: ['pv_production', 'pv_feed_in', 'pv_self_consumption'],
  },
  gas_brennstoff: {
    label: 'Gas & Brennstoffe',
    types: ['gas', 'oil', 'pellets', 'lpg'],
  },
  wasser: {
    label: 'Wasser',
    types: ['water_cold', 'water_hot'],
  },
  waerme: {
    label: 'Wärme & Kälte',
    types: ['heating', 'district_heating', 'cooling'],
  },
};

export const METER_TYPE_PRICE_DEFAULTS: Partial<Record<MeterType, number>> = {
  electricity: 0.32,
  electricity_ht: 0.35,
  electricity_nt: 0.25,
  electricity_common: 0.32,
  gas: 0.12,
  water_cold: 4.50,
  water_hot: 8.00,
  heating: 0.10,
  district_heating: 0.10,
  heat_pump: 0.28,
  ev_charging: 0.32,
  oil: 1.10,
  pellets: 0.35,
  lpg: 0.80,
  pv_feed_in: 0.082,
};

export const UNIT_TYPE_LABELS: Record<UnitType, string> = {
  apartment: 'Wohnung',
  commercial: 'Gewerbe',
  parking: 'Stellplatz',
};

export const UNIT_STATUS_LABELS: Record<UnitStatus, string> = {
  rented: 'Vermietet',
  available: 'Verfügbar',
  maintenance: 'Wartung',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Niedrig',
  medium: 'Mittel',
  high: 'Hoch',
  urgent: 'Dringend',
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  open: 'Offen',
  in_progress: 'In Bearbeitung',
  completed: 'Abgeschlossen',
};

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: 'Administrator',
  vermieter: 'Vermieter',
  mieter: 'Mieter',
  hausmeister: 'Hausmeister',
};

// ═══════════════════════════════════════════════════════════════════
// BENCHMARK-DATEN (BDEW / co2online Referenzwerte 2024)
// ═══════════════════════════════════════════════════════════════════
export const CONSUMPTION_BENCHMARKS: ConsumptionBenchmark[] = [
  { meter_type: 'electricity', building_type: 'mfh_small', persons_range: '1', annual_consumption_low: 1300, annual_consumption_medium: 1800, annual_consumption_high: 2500, unit: 'kWh', source: 'BDEW 2024', valid_year: 2024 },
  { meter_type: 'electricity', building_type: 'mfh_small', persons_range: '2', annual_consumption_low: 2000, annual_consumption_medium: 2800, annual_consumption_high: 3800, unit: 'kWh', source: 'BDEW 2024', valid_year: 2024 },
  { meter_type: 'electricity', building_type: 'mfh_small', persons_range: '3-4', annual_consumption_low: 2800, annual_consumption_medium: 3700, annual_consumption_high: 5000, unit: 'kWh', source: 'BDEW 2024', valid_year: 2024 },
  { meter_type: 'electricity', building_type: 'efh', persons_range: '1', annual_consumption_low: 1500, annual_consumption_medium: 2400, annual_consumption_high: 3500, unit: 'kWh', source: 'BDEW 2024', valid_year: 2024 },
  { meter_type: 'electricity', building_type: 'efh', persons_range: '2', annual_consumption_low: 2400, annual_consumption_medium: 3400, annual_consumption_high: 4900, unit: 'kWh', source: 'BDEW 2024', valid_year: 2024 },
  { meter_type: 'electricity', building_type: 'efh', persons_range: '3-4', annual_consumption_low: 3200, annual_consumption_medium: 4500, annual_consumption_high: 6200, unit: 'kWh', source: 'BDEW 2024', valid_year: 2024 },
  { meter_type: 'gas', building_type: 'efh', persons_range: '1-2', annual_consumption_low: 10000, annual_consumption_medium: 16000, annual_consumption_high: 24000, unit: 'kWh', source: 'co2online 2024', valid_year: 2024 },
  { meter_type: 'gas', building_type: 'mfh_small', persons_range: '1-2', annual_consumption_low: 6000, annual_consumption_medium: 10000, annual_consumption_high: 16000, unit: 'kWh', source: 'co2online 2024', valid_year: 2024 },
  { meter_type: 'water_cold', building_type: 'mfh_small', persons_range: '1', annual_consumption_low: 30, annual_consumption_medium: 46, annual_consumption_high: 65, unit: 'm³', source: 'BDEW 2024', valid_year: 2024 },
  { meter_type: 'water_cold', building_type: 'mfh_small', persons_range: '2', annual_consumption_low: 55, annual_consumption_medium: 84, annual_consumption_high: 120, unit: 'm³', source: 'BDEW 2024', valid_year: 2024 },
  { meter_type: 'heating', building_type: 'efh', persons_range: '1-4', annual_consumption_low: 8000, annual_consumption_medium: 14000, annual_consumption_high: 22000, unit: 'kWh', source: 'co2online 2024', valid_year: 2024 },
  { meter_type: 'heating', building_type: 'mfh_small', persons_range: '1-4', annual_consumption_low: 5000, annual_consumption_medium: 9000, annual_consumption_high: 15000, unit: 'kWh', source: 'co2online 2024', valid_year: 2024 },
];

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/** Calculate reading status based on last reading date and interval */
export function getReadingStatus(lastReadingDate: string | undefined, intervalDays: number = 30): ReadingStatus {
  if (!lastReadingDate) return 'overdue';
  const lastDate = new Date(lastReadingDate);
  const now = new Date();
  const daysSinceReading = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSinceReading <= intervalDays) return 'current';
  if (daysSinceReading <= intervalDays * 1.5) return 'due';
  return 'overdue';
}

/** Calculate annual consumption from readings */
export function calculateAnnualConsumption(readings: MeterReading[]): number | null {
  if (readings.length < 2) return null;
  const sorted = [...readings].sort((a, b) => new Date(a.reading_date).getTime() - new Date(b.reading_date).getTime());
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const daysDiff = (new Date(last.reading_date).getTime() - new Date(first.reading_date).getTime()) / (1000 * 60 * 60 * 24);
  if (daysDiff < 30) return null;
  const totalConsumption = last.reading_value - first.reading_value;
  return Math.round((totalConsumption / daysDiff) * 365);
}

/** Calculate consumption cost based on meter type and contract prices */
export function calculateCost(consumption: number, meterType: MeterType, pricePerUnit?: number): number {
  const price = pricePerUnit ?? METER_TYPE_PRICE_DEFAULTS[meterType] ?? 0;
  return Math.round(consumption * price * 100) / 100;
}

/** Get efficiency grade (A-G) based on consumption vs benchmark */
export function getEfficiencyGrade(actualConsumption: number, benchmarkMedium: number): string {
  const ratio = actualConsumption / benchmarkMedium;
  if (ratio <= 0.5) return 'A+';
  if (ratio <= 0.7) return 'A';
  if (ratio <= 0.85) return 'B';
  if (ratio <= 1.0) return 'C';
  if (ratio <= 1.15) return 'D';
  if (ratio <= 1.3) return 'E';
  if (ratio <= 1.5) return 'F';
  return 'G';
}

/** Format number in German locale */
export function formatNumber(value: number, decimals: number = 0): string {
  return value.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/** Format currency in EUR */
export function formatEuro(value: number): string {
  return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}
