// Multi-Tenancy System - Reseller / Partner Model
// Allows white-label deployment and partner management

export type TenantRole = 'owner' | 'admin' | 'manager' | 'viewer'
export type TenantPlan = 'starter' | 'professional' | 'enterprise' | 'white_label'

export interface Tenant {
  id: string
  name: string
  slug: string // URL-friendly identifier
  plan: TenantPlan
  ownerId: string
  createdAt: string
  settings: TenantSettings
  limits: TenantLimits
  branding?: TenantBranding
}

export interface TenantSettings {
  country: 'DE' | 'AT' | 'CH'
  language: 'de' | 'en'
  currency: 'EUR' | 'CHF'
  timezone: string
  modules: TenantModule[]
}

export type TenantModule =
  | 'properties'
  | 'tenants'
  | 'contracts'
  | 'payments'
  | 'meters'
  | 'documents'
  | 'communication'
  | 'calculators'
  | 'tax'
  | 'afa'

export interface TenantLimits {
  maxProperties: number     // -1 = unlimited
  maxUnits: number
  maxUsers: number
  maxStorageMB: number
  apiCallsPerMonth: number
}

export interface TenantBranding {
  logo?: string
  primaryColor: string
  companyName: string
  domain?: string // custom domain
  emailFrom?: string
}

export interface TenantMember {
  id: string
  tenantId: string
  userId: string
  email: string
  name: string
  role: TenantRole
  invitedAt: string
  joinedAt?: string
  isActive: boolean
}

export const TENANT_PLANS: Record<TenantPlan, {
  name: string
  price: number // monthly EUR
  limits: TenantLimits
  features: string[]
}> = {
  starter: {
    name: 'Starter',
    price: 29,
    limits: {
      maxProperties: 5,
      maxUnits: 20,
      maxUsers: 2,
      maxStorageMB: 500,
      apiCallsPerMonth: 1000,
    },
    features: [
      'Bis zu 5 Immobilien',
      'Bis zu 20 Einheiten',
      '2 Benutzer',
      'Standard-Module',
      'E-Mail Support',
    ],
  },
  professional: {
    name: 'Professional',
    price: 79,
    limits: {
      maxProperties: 25,
      maxUnits: 100,
      maxUsers: 10,
      maxStorageMB: 5000,
      apiCallsPerMonth: 10000,
    },
    features: [
      'Bis zu 25 Immobilien',
      'Bis zu 100 Einheiten',
      '10 Benutzer',
      'Alle Module inkl. Steuer & AfA',
      'Prioritäts-Support',
      'PDF-Export',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: 199,
    limits: {
      maxProperties: -1,
      maxUnits: -1,
      maxUsers: -1,
      maxStorageMB: 50000,
      apiCallsPerMonth: -1,
    },
    features: [
      'Unbegrenzte Immobilien',
      'Unbegrenzte Einheiten',
      'Unbegrenzte Benutzer',
      'Alle Module',
      'Dedizierter Support',
      'API-Zugang',
      'SSO/SAML',
    ],
  },
  white_label: {
    name: 'White Label',
    price: 499,
    limits: {
      maxProperties: -1,
      maxUnits: -1,
      maxUsers: -1,
      maxStorageMB: 100000,
      apiCallsPerMonth: -1,
    },
    features: [
      'Alles aus Enterprise',
      'Eigenes Branding',
      'Eigene Domain',
      'Eigenes E-Mail-Template',
      'Reseller-Dashboard',
      'Sub-Tenant Management',
      'Individuelle Anpassungen',
    ],
  },
}

export const ROLE_PERMISSIONS: Record<TenantRole, string[]> = {
  owner: ['*'], // All permissions
  admin: ['manage_properties', 'manage_tenants', 'manage_contracts', 'manage_payments', 'manage_documents', 'manage_settings', 'view_reports', 'invite_users'],
  manager: ['manage_properties', 'manage_tenants', 'manage_contracts', 'manage_payments', 'view_documents', 'view_reports'],
  viewer: ['view_properties', 'view_tenants', 'view_contracts', 'view_payments', 'view_documents'],
}

export function hasPermission(role: TenantRole, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role]
  return perms.includes('*') || perms.includes(permission)
}

export function canAddProperty(tenant: Tenant, currentCount: number): boolean {
  if (TENANT_PLANS[tenant.plan].limits.maxProperties === -1) return true
  return currentCount < TENANT_PLANS[tenant.plan].limits.maxProperties
}

export function canAddUser(tenant: Tenant, currentCount: number): boolean {
  if (TENANT_PLANS[tenant.plan].limits.maxUsers === -1) return true
  return currentCount < TENANT_PLANS[tenant.plan].limits.maxUsers
}
