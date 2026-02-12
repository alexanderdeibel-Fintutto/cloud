// Einheitliches Referral-System fuer alle Fintutto Apps
// Template basierend auf Financial Compass Implementierung
// Belohnung: 1 Monat gratis / 30 Credits fuer BEIDE Seiten

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface Referral {
  id: string
  referred_email: string
  app_id: string
  status: string
  reward_applied_referrer: boolean
  reward_applied_referred: boolean
  created_at: string
  converted_at: string | null
}

interface ReferralStats {
  total_sent: number
  total_converted: number
  total_rewards: number
  savings_eur: number
}

interface ReferralReward {
  app_id: string
  reward_type: string
  reward_value: number
  reward_description: string
  referrer_gets: string
  referred_gets: string
}

export function useReferrals(appId: string = 'ecosystem') {
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [stats, setStats] = useState<ReferralStats>({
    total_sent: 0,
    total_converted: 0,
    total_rewards: 0,
    savings_eur: 0,
  })
  const [reward, setReward] = useState<ReferralReward | null>(null)
  const [loading, setLoading] = useState(true)

  const generateCode = useCallback((userId: string) => {
    const base = userId.replace(/-/g, '').substring(0, 8).toUpperCase()
    return `FT-${base}`
  }, [])

  const ensureReferralCode = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('users')
      .select('referral_code')
      .eq('id', user.id)
      .single()

    if (profile?.referral_code) {
      setReferralCode(profile.referral_code)
    } else {
      const code = generateCode(user.id)
      await supabase
        .from('users')
        .update({ referral_code: code })
        .eq('id', user.id)
      setReferralCode(code)
    }
  }, [generateCode])

  const fetchReferrals = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const refs = (data || []) as Referral[]
      setReferrals(refs)

      const converted = refs.filter((r) => r.status === 'converted').length
      const rewards = refs.filter((r) => r.reward_applied_referrer).length
      const rewardValue = reward?.reward_value || 9.99

      setStats({
        total_sent: refs.length,
        total_converted: converted,
        total_rewards: rewards,
        savings_eur: rewards * rewardValue,
      })
    } catch (err) {
      console.error('Error fetching referrals:', err)
    } finally {
      setLoading(false)
    }
  }, [reward])

  const fetchRewardConfig = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('referral_rewards')
        .select('*')
        .eq('app_id', appId)
        .eq('is_active', true)
        .single()

      if (data) {
        setReward(data as ReferralReward)
      }
    } catch (err) {
      console.error('Error fetching reward config:', err)
    }
  }, [appId])

  useEffect(() => {
    fetchRewardConfig()
    ensureReferralCode()
    fetchReferrals()
  }, [ensureReferralCode, fetchReferrals, fetchRewardConfig])

  const createReferral = async (email: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !referralCode) return

    try {
      const { error } = await supabase.from('referrals').insert({
        referrer_user_id: user.id,
        referred_email: email.toLowerCase(),
        referral_code: `${referralCode}-${Date.now().toString(36)}`,
        app_id: appId,
        status: 'pending',
        reward_amount: reward?.reward_value || 0,
      })

      if (error) throw error
      await fetchReferrals()
      return true
    } catch (err) {
      console.error('Error creating referral:', err)
      return false
    }
  }

  const getReferralLink = (baseUrl: string) => {
    if (!referralCode) return ''
    return `${baseUrl}?ref=${referralCode}`
  }

  const copyReferralLink = async (baseUrl: string) => {
    const link = getReferralLink(baseUrl)
    if (link) {
      await navigator.clipboard.writeText(link)
      return true
    }
    return false
  }

  return {
    referralCode,
    referrals,
    stats,
    reward,
    loading,
    createReferral,
    getReferralLink,
    copyReferralLink,
    fetchReferrals,
  }
}
