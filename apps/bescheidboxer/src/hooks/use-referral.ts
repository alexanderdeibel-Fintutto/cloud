import { useState, useCallback, useEffect } from 'react'
import type { Referral, ReferralStats, ReferralUser } from '../types/referral'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../integrations/supabase/client'

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
  const { profile, user } = useAuth()
  const [referrals, setReferrals] = useState<Referral[]>(MOCK_REFERRALS)
  const [loading, setLoading] = useState(false)

  const referralUser: ReferralUser = {
    referralCode: profile?.referralCode || 'BX4F7K2M',
    referralCredits: profile?.referralCredits ?? 3,
    referredBy: null,
  }

  // Fetch real referrals from Supabase when user is authenticated
  useEffect(() => {
    if (!user?.id) return

    const fetchReferrals = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('referrals')
          .select('*')
          .eq('referrer_id', user.id)
          .order('created_at', { ascending: false })

        if (!error && data && data.length > 0) {
          setReferrals(
            data.map((r: Record<string, unknown>) => ({
              id: r.id as string,
              referrerId: r.referrer_id as string,
              referredEmail: r.referred_email as string,
              referredUserId: (r.referred_user_id as string) || null,
              status: r.status as Referral['status'],
              referralCode: referralUser.referralCode,
              rewardClaimed: (r.reward_claimed as boolean) || false,
              createdAt: r.created_at as string,
              convertedAt: (r.converted_at as string) || null,
            }))
          )
        }
        // If no data or error, keep mock data as fallback
      } catch {
        // Keep mock data on error
      } finally {
        setLoading(false)
      }
    }

    fetchReferrals()
  }, [user?.id, referralUser.referralCode])

  const stats: ReferralStats = {
    totalInvites: referrals.length,
    registered: referrals.filter(r => r.status === 'registered' || r.status === 'converted').length,
    converted: referrals.filter(r => r.status === 'converted').length,
    creditsEarned: referralUser.referralCredits,
    pendingInvites: referrals.filter(r => r.status === 'pending').length,
  }

  const inviteByEmail = useCallback(async (email: string) => {
    // Try to create referral in Supabase
    if (user?.id) {
      try {
        const { data, error } = await supabase
          .from('referrals')
          .insert({
            referrer_id: user.id,
            referred_email: email,
            status: 'pending',
          })
          .select()
          .single()

        if (!error && data) {
          const newReferral: Referral = {
            id: data.id,
            referrerId: data.referrer_id,
            referredEmail: data.referred_email,
            referredUserId: null,
            status: 'pending',
            referralCode: referralUser.referralCode,
            rewardClaimed: false,
            createdAt: data.created_at,
            convertedAt: null,
          }
          setReferrals(prev => [newReferral, ...prev])
          return newReferral
        }
      } catch {
        // Fall through to local-only creation
      }
    }

    // Fallback: create locally only
    const newReferral: Referral = {
      id: `r${Date.now()}`,
      referrerId: user?.id || 'user1',
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
  }, [user?.id, referralUser.referralCode])

  const getReferralLink = useCallback(() => {
    return `https://portal.fintutto.cloud/apps/bescheidboxer/register?ref=${referralUser.referralCode}`
  }, [referralUser.referralCode])

  return {
    referralUser,
    referrals,
    stats,
    loading,
    inviteByEmail,
    getReferralLink,
  }
}
