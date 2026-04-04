import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Partner {
  id: string;
  name: string;
  company_name: string;
  contact_email: string;
  contact_first_name: string | null;
  contact_last_name: string | null;
  contact_phone: string | null;
  partner_type: string;
  contract_type: string;
  billing_model: string;
  status: string | null;
  slug: string;
  referral_code: string | null;
  referral_commission_percent: number | null;
  referral_commission_duration_months: number | null;
  referral_cookie_days: number | null;
  enabled_apps: string[] | null;
  enabled_features: Record<string, unknown> | null;
  stripe_account_id: string | null;
  stripe_payout_enabled: boolean | null;
  onboarding_completed: boolean | null;
  onboarding_step: number | null;
  created_at: string | null;
  activated_at: string | null;
  verified_at: string | null;
  suspended_at: string | null;
  churned_at: string | null;
  website: string | null;
  tags: string[] | null;
}

export interface AffiliateTracking {
  id: string;
  click_id: string;
  partner_id: string;
  referral_code: string;
  status: string | null;
  visited_at: string | null;
  registered_at: string | null;
  first_payment_at: string | null;
  first_payment_amount: number | null;
  total_payments: number | null;
  total_commissions: number | null;
  landing_page: string | null;
  country: string | null;
  city: string | null;
  device_type: string | null;
  browser: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
}

export interface AffiliatePerformance {
  partner_id: string | null;
  partner_name: string | null;
  referral_code: string | null;
  total_clicks: number | null;
  total_signups: number | null;
  total_conversions: number | null;
  total_revenue: number | null;
  total_commissions: number | null;
  conversion_rate: number | null;
  signup_rate: number | null;
}

export function usePartners() {
  return useQuery({
    queryKey: ['partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Partner[];
    },
  });
}

export function useAffiliateTracking() {
  return useQuery({
    queryKey: ['affiliate-tracking'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('affiliate_tracking')
        .select('*')
        .order('visited_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      return data as AffiliateTracking[];
    },
  });
}

export function useAffiliatePerformance() {
  return useQuery({
    queryKey: ['affiliate-performance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_affiliate_performance')
        .select('*');

      if (error) throw error;
      return data as AffiliatePerformance[];
    },
  });
}

export function usePartnerCommissions() {
  return useQuery({
    queryKey: ['partner-commissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partner_commissions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
  });
}

export function usePartnerPayouts() {
  return useQuery({
    queryKey: ['partner-payouts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partner_payouts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
  });
}

export function useUpdatePartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Partner> & { id: string }) => {
      const { data, error } = await supabase
        .from('partners')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
    },
  });
}

export function usePartnerStats() {
  const { data: partners } = usePartners();
  const { data: performance } = useAffiliatePerformance();

  return {
    totalPartners: partners?.length || 0,
    activePartners: partners?.filter(p => p.status === 'active').length || 0,
    pendingPartners: partners?.filter(p => p.status === 'pending').length || 0,
    suspendedPartners: partners?.filter(p => p.status === 'suspended').length || 0,
    totalClicks: performance?.reduce((sum, p) => sum + (p.total_clicks || 0), 0) || 0,
    totalConversions: performance?.reduce((sum, p) => sum + (p.total_conversions || 0), 0) || 0,
    totalRevenue: performance?.reduce((sum, p) => sum + (p.total_revenue || 0), 0) || 0,
    totalCommissions: performance?.reduce((sum, p) => sum + (p.total_commissions || 0), 0) || 0,
  };
}
