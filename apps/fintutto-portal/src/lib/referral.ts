// Referral System for Fintutto Ecosystem
// Tracks invitations, signups, and savings across all apps

export interface Referral {
  id: string
  referrerUserId: string
  referralCode: string
  referredEmail: string | null
  referredUserId: string | null
  appId: string
  status: 'pending' | 'signed_up' | 'subscribed'
  createdAt: string
  signedUpAt: string | null
  subscribedAt: string | null
}

export interface ReferralStats {
  totalInvitesSent: number
  totalSignups: number
  totalSubscribed: number
  totalSavingsEur: number
  activeReferralCode: string
  referralsByApp: Record<string, { sent: number; signups: number; subscribed: number }>
}

export interface ReferralReward {
  type: 'credits' | 'discount' | 'free_month'
  value: number
  description: string
}

// Referral rewards configuration
export const REFERRAL_REWARDS = {
  // Reward for the person who refers
  referrer: {
    onSignup: { type: 'credits' as const, value: 5, description: '+5 Bonus-Credits' },
    onSubscribe: { type: 'credits' as const, value: 15, description: '+15 Bonus-Credits + 1 Monat kostenlos' },
  },
  // Reward for the person who was referred
  referred: {
    onSignup: { type: 'credits' as const, value: 5, description: '+5 Start-Credits (statt 3)' },
    onSubscribe: { type: 'discount' as const, value: 20, description: '20% Rabatt auf den ersten Monat' },
  },
}

// Calculate total savings from referrals
export function calculateSavings(referrals: Referral[]): number {
  let savings = 0
  for (const r of referrals) {
    if (r.status === 'signed_up') {
      savings += 0.50 // €0.50 in credits per signup
    }
    if (r.status === 'subscribed') {
      savings += 5.00 // €5.00 equivalent (15 credits + free month)
    }
  }
  return savings
}

// Generate a unique referral code from user ID
export function generateReferralCode(userId: string): string {
  const hash = userId.slice(0, 8).toUpperCase()
  return `FT-${hash}`
}

// Build a referral link for a specific app
export function buildReferralLink(baseUrl: string, referralCode: string): string {
  const url = new URL(baseUrl)
  url.searchParams.set('ref', referralCode)
  return url.toString()
}

// Build a pre-filled registration link
export function buildPrefilledRegisterLink(
  registerUrl: string,
  referralCode: string,
  email?: string
): string {
  const url = new URL(registerUrl)
  url.searchParams.set('ref', referralCode)
  if (email) {
    url.searchParams.set('email', email)
  }
  return url.toString()
}
