export type ReferralStatus = 'pending' | 'registered' | 'converted'

export interface Referral {
  id: string
  referrerId: string
  referredEmail: string
  referredUserId: string | null
  status: ReferralStatus
  referralCode: string
  rewardClaimed: boolean
  createdAt: string
  convertedAt: string | null
}

export interface ReferralStats {
  totalInvites: number
  registered: number
  converted: number
  creditsEarned: number
  pendingInvites: number
}

export interface ReferralUser {
  referralCode: string
  referralCredits: number
  referredBy: string | null
}

export const REFERRAL_STATUS_LABELS: Record<ReferralStatus, string> = {
  pending: 'Eingeladen',
  registered: 'Registriert',
  converted: 'Aktiver Nutzer',
}

export const REFERRAL_REWARDS = {
  perSignup: 1,
  perConversion: 2,
  description: '1 Credit pro Registrierung, 2 Credits bei Abo-Abschluss',
} as const
