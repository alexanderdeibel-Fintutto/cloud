import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useCallback } from 'react';

const CURRENT_APP_ID = 'zaehler';

export interface Referral {
  id: string;
  referrer_id: string;
  referred_email: string | null;
  referred_user_id: string | null;
  target_app_id: string;
  referral_code: string;
  status: 'pending' | 'clicked' | 'registered' | 'subscribed';
  created_at: string;
  converted_at: string | null;
}

export interface ReferralReward {
  id: string;
  user_id: string;
  referral_id: string;
  reward_type: string;
  amount: number;
  currency: string;
  description: string | null;
  is_redeemed: boolean;
  created_at: string;
  redeemed_at: string | null;
}

export interface ReferralStats {
  totalReferrals: number;
  convertedReferrals: number;
  totalSaved: number;
  currency: string;
}

export function useReferrals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's referrals
  const { data: referrals, isLoading: referralsLoading } = useQuery({
    queryKey: ['referrals', user?.id],
    queryFn: async (): Promise<Referral[]> => {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Referral[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch user's rewards
  const { data: rewards, isLoading: rewardsLoading } = useQuery({
    queryKey: ['referral-rewards', user?.id],
    queryFn: async (): Promise<ReferralReward[]> => {
      const { data, error } = await supabase
        .from('referral_rewards')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as ReferralReward[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Calculate stats
  const stats: ReferralStats = {
    totalReferrals: referrals?.length || 0,
    convertedReferrals: referrals?.filter(r => r.status === 'subscribed').length || 0,
    totalSaved: (rewards || []).reduce((sum, r) => sum + Number(r.amount), 0),
    currency: 'EUR',
  };

  // Generate referral code for an app
  const generateReferralCode = useCallback((targetAppId: string): string => {
    if (!user) return '';
    // Deterministic code based on user ID + app
    const hash = Array.from(user.id + targetAppId)
      .reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0);
    return `FT-${Math.abs(hash).toString(36).toUpperCase().slice(0, 6)}`;
  }, [user]);

  // Create or get referral for a target app
  const createReferral = useMutation({
    mutationFn: async (targetAppId: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const code = generateReferralCode(targetAppId);
      
      // Check if already exists
      const { data: existing } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .eq('target_app_id', targetAppId)
        .eq('referral_code', code)
        .maybeSingle();

      if (existing) return existing as Referral;

      const { data, error } = await supabase
        .from('referrals')
        .insert({
          referrer_id: user.id,
          target_app_id: targetAppId,
          referral_code: code,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data as Referral;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals', user?.id] });
    },
  });

  // Build referral URL for an app
  const getReferralUrl = useCallback((targetAppId: string, baseUrl: string): string => {
    const code = generateReferralCode(targetAppId);
    return `${baseUrl}?ref=${code}`;
  }, [generateReferralCode]);

  // Get referrals for a specific app
  const getReferralsForApp = useCallback((targetAppId: string): Referral[] => {
    return (referrals || []).filter(r => r.target_app_id === targetAppId);
  }, [referrals]);

  return {
    referrals: referrals || [],
    rewards: rewards || [],
    stats,
    isLoading: referralsLoading || rewardsLoading,
    generateReferralCode,
    createReferral,
    getReferralUrl,
    getReferralsForApp,
  };
}
