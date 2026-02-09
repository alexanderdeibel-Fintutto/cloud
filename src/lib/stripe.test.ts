import { describe, it, expect } from 'vitest'
import { PRICING_TIERS, getTierByChecks } from './stripe'

describe('PRICING_TIERS', () => {
  it('has correct number of tiers', () => {
    expect(PRICING_TIERS).toHaveLength(3)
  })

  it('free tier has correct limits', () => {
    const freeTier = PRICING_TIERS.find(t => t.id === 'free')
    expect(freeTier).toBeDefined()
    expect(freeTier?.checksPerMonth).toBe(1)
    expect(freeTier?.monthlyPrice).toBe(0)
  })

  it('basic tier has correct pricing', () => {
    const basicTier = PRICING_TIERS.find(t => t.id === 'basic')
    expect(basicTier).toBeDefined()
    expect(basicTier?.checksPerMonth).toBe(3)
    expect(basicTier?.monthlyPrice).toBe(0.99)
  })

  it('premium tier has unlimited checks', () => {
    const premiumTier = PRICING_TIERS.find(t => t.id === 'premium')
    expect(premiumTier).toBeDefined()
    expect(premiumTier?.checksPerMonth).toBe('unlimited')
    expect(premiumTier?.features).toContain('PDF-Export')
  })
})

describe('getTierByChecks', () => {
  // The function returns the tier where checksUsed < checksPerMonth
  // free: 1 check, basic: 3 checks, premium: unlimited

  it('returns free tier for 0 checks', () => {
    const tier = getTierByChecks(0)
    expect(tier.id).toBe('free')
  })

  it('returns basic tier when free limit exceeded', () => {
    // 1 check used means free tier (1 check limit) is exceeded
    const tier = getTierByChecks(1)
    expect(tier.id).toBe('basic')
  })

  it('returns basic tier for 2 checks', () => {
    const tier = getTierByChecks(2)
    expect(tier.id).toBe('basic')
  })

  it('returns premium tier when basic limit exceeded', () => {
    // 3 checks used means basic tier (3 check limit) is exceeded
    const tier = getTierByChecks(3)
    expect(tier.id).toBe('premium')
  })

  it('returns premium tier for more than 3 checks', () => {
    const tier = getTierByChecks(4)
    expect(tier.id).toBe('premium')
  })

  it('returns premium tier for high check counts', () => {
    const tier = getTierByChecks(100)
    expect(tier.id).toBe('premium')
  })
})
