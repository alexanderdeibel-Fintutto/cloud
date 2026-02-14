// Re-export shared database types
// All Fintutto apps use the same Supabase schema
export type { Database, Json } from '../../../../packages/shared/src/types/database'
export type {
  Property,
  PropertyInsert,
  Unit,
  UnitInsert,
  Tenant,
  TenantInsert,
  RentalContract,
  Payment,
  Document,
  Meter,
  MeterReading,
  MaintenanceRequest,
  Task,
  TaxNotice,
  Profile,
  PropertyWithUnits,
  UnitWithDetails,
  TenantWithUnit,
} from '../../../../packages/shared/src/types/database'
