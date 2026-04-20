import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ReferralCode {
  id: string;
  user_id: string;
  app_id: string;
  code: string;
  stripe_coupon_id: string | null;
  stripe_promotion_code_id: string | null;
  discount_percent: number;
  uses_count: number;
  is_active: boolean;
  created_at: string;
}

interface ReferralStats {
  codes: ReferralCode[];
  stats: {
    total_clicks: number;
    total_converted: number;
    total_saved: number;
  };
  conversions: unknown[];
}

export function useReferralStats() {
  return useQuery({
    queryKey: ["referral-stats"],
    queryFn: async (): Promise<ReferralStats> => {
      const { data, error } = await supabase.functions.invoke("referral", {
        body: { action: "get_stats" },
      });
      if (error) throw error;
      return data as ReferralStats;
    },
  });
}

export function useGetOrCreateReferralCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (appId: string): Promise<ReferralCode> => {
      const { data, error } = await supabase.functions.invoke("referral", {
        body: { action: "get_or_create_code", app_id: appId },
      });
      if (error) throw error;
      return data.code as ReferralCode;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referral-stats"] });
    },
  });
}

export function buildReferralLink(code: string, appUrl?: string): string {
  const base = appUrl || window.location.origin;
  return `${base}?ref=${code}`;
}
