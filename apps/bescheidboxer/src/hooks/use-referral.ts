import { useState, useCallback } from 'react'
import type { Referral, ReferralStats, ReferralUser } from '../types/referral'

const MOCK_REFERRAL_USER: ReferralUser = {
  referralCode: 'BX4F7K2M',
  referralCredits: 3,
  referredBy: null,
}

const MOCK_REFERRALS: Referral[] = [
  {
    id: 'r1',
    referrerId: 'user1',
    referredEmail: 'anna.mueller@example.com',
    referredUserId: 'user2',
    status: 'converted',
    referralCode: 'BX4F7K2M',
    rewardClaimed: true,
    createdAt: '2025-06-15T10:00:00Z',
    convertedAt: '2025-06-20T14:30:00Z',
  },
  {
    id: 'r2',
    referrerId: 'user1',
    referredEmail: 'thomas.schmidt@example.com',
    referredUserId: 'user3',
    status: 'registered',
    referralCode: 'BX4F7K2M',
    rewardClaimed: true,
    createdAt: '2025-07-01T09:00:00Z',
    convertedAt: '2025-07-05T11:00:00Z',
  },
  {
    id: 'r3',
    referrerId: 'user1',
    referredEmail: 'lisa.weber@example.com',
    referredUserId: null,
    status: 'pending',
    referralCode: 'BX4F7K2M',
    rewardClaimed: false,
    createdAt: '2025-08-10T16:00:00Z',
    convertedAt: null,
  },
  {
    id: 'r4',
    referrerId: 'user1',
    referredEmail: 'markus.bauer@example.com',
    referredUserId: 'user5',
    status: 'registered',
    referralCode: 'BX4F7K2M',
    rewardClaimed: true,
    createdAt: '2025-09-01T12:00:00Z',
    convertedAt: '2025-09-03T08:00:00Z',
  },
  {
    id: 'r5',
    referrerId: 'user1',
    referredEmail: 'julia.hoffmann@example.com',
    referredUserId: null,
    status: 'pending',
    referralCode: 'BX4F7K2M',
    rewardClaimed: false,
    createdAt: '2025-10-15T10:00:00Z',
    convertedAt: null,
  },
]

export function useReferral() {
  const [referralUser] = useState<ReferralUser>(MOCK_REFERRAL_USER)
  const [referrals, setReferrals] = useState<Referral[]>(MOCK_REFERRALS)

  const stats: ReferralStats = {
    totalInvites: referrals.length,
    registered: referrals.filter(r => r.status === 'registered' || r.status === 'converted').length,
    converted: referrals.filter(r => r.status === 'converted').length,
    creditsEarned: referralUser.referralCredits,
    pendingInvites: referrals.filter(r => r.status === 'pending').length,
  }

  const inviteByEmail = useCallback((email: string) => {
    const newReferral: Referral = {
      id: `r${Date.now()}`,
      referrerId: 'user1',
      referredEmail: email,
      referredUserId: null,
      status: 'pending',
      referralCode: referralUser.referralCode,
      rewardClaimed: false,
      createdAt: new Date().toISOString(),
      convertedAt: null,
    }
    setReferrals(prev => [newReferral, ...prev])
    return newReferral
  }, [referralUser.referralCode])

  const getReferralLink = useCallback(() => {
    return `https://bescheidboxer.fintutto.de/ref/${referralUser.referralCode}`
  }, [referralUser.referralCode])

  return {
    referralUser,
    referrals,
    stats,
    inviteByEmail,
    getReferralLink,
  }
}
