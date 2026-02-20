import { describe, it, expect } from 'vitest'
import {
  hasPermission,
  canAddProperty,
  canAddUser,
  TENANT_PLANS,
  ROLE_PERMISSIONS,
  type Tenant,
  type TenantPlan,
} from './multiTenancy'

function makeTenant(plan: TenantPlan): Tenant {
  return {
    id: 'test-1',
    name: 'Test Corp',
    slug: 'test-corp',
    plan,
    ownerId: 'user-1',
    createdAt: '2025-01-01',
    settings: {
      country: 'DE',
      language: 'de',
      currency: 'EUR',
      timezone: 'Europe/Berlin',
      modules: ['properties', 'tenants'],
    },
    limits: TENANT_PLANS[plan].limits,
  }
}

describe('hasPermission', () => {
  it('owner has all permissions', () => {
    expect(hasPermission('owner', 'manage_properties')).toBe(true)
    expect(hasPermission('owner', 'manage_settings')).toBe(true)
    expect(hasPermission('owner', 'any_random_permission')).toBe(true)
  })

  it('admin has management permissions', () => {
    expect(hasPermission('admin', 'manage_properties')).toBe(true)
    expect(hasPermission('admin', 'manage_tenants')).toBe(true)
    expect(hasPermission('admin', 'invite_users')).toBe(true)
  })

  it('manager has limited management permissions', () => {
    expect(hasPermission('manager', 'manage_properties')).toBe(true)
    expect(hasPermission('manager', 'manage_settings')).toBe(false)
    expect(hasPermission('manager', 'invite_users')).toBe(false)
  })

  it('viewer can only view', () => {
    expect(hasPermission('viewer', 'view_properties')).toBe(true)
    expect(hasPermission('viewer', 'manage_properties')).toBe(false)
    expect(hasPermission('viewer', 'manage_settings')).toBe(false)
  })
})

describe('canAddProperty', () => {
  it('starter plan allows up to 5 properties', () => {
    const tenant = makeTenant('starter')
    expect(canAddProperty(tenant, 0)).toBe(true)
    expect(canAddProperty(tenant, 4)).toBe(true)
    expect(canAddProperty(tenant, 5)).toBe(false)
    expect(canAddProperty(tenant, 10)).toBe(false)
  })

  it('professional plan allows up to 25 properties', () => {
    const tenant = makeTenant('professional')
    expect(canAddProperty(tenant, 24)).toBe(true)
    expect(canAddProperty(tenant, 25)).toBe(false)
  })

  it('enterprise plan allows unlimited properties', () => {
    const tenant = makeTenant('enterprise')
    expect(canAddProperty(tenant, 1000)).toBe(true)
  })

  it('white_label plan allows unlimited properties', () => {
    const tenant = makeTenant('white_label')
    expect(canAddProperty(tenant, 5000)).toBe(true)
  })
})

describe('canAddUser', () => {
  it('starter plan allows up to 2 users', () => {
    const tenant = makeTenant('starter')
    expect(canAddUser(tenant, 0)).toBe(true)
    expect(canAddUser(tenant, 1)).toBe(true)
    expect(canAddUser(tenant, 2)).toBe(false)
  })

  it('enterprise plan allows unlimited users', () => {
    const tenant = makeTenant('enterprise')
    expect(canAddUser(tenant, 100)).toBe(true)
  })
})

describe('TENANT_PLANS', () => {
  it('has correct pricing tiers', () => {
    expect(TENANT_PLANS.starter.price).toBe(29)
    expect(TENANT_PLANS.professional.price).toBe(79)
    expect(TENANT_PLANS.enterprise.price).toBe(199)
    expect(TENANT_PLANS.white_label.price).toBe(499)
  })

  it('enterprise has unlimited properties', () => {
    expect(TENANT_PLANS.enterprise.limits.maxProperties).toBe(-1)
  })
})
