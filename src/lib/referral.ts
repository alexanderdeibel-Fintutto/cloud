// Referral System for Fintutto Ecosystem
// Tracks invitations, signups, and savings across all apps

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

// Build a referral link for a specific app
export function buildReferralLink(baseUrl: string, referralCode: string): string {
  const url = new URL(baseUrl)
  url.searchParams.set('ref', referralCode)
  return url.toString()
}

