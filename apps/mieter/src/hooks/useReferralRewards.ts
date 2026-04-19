import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ReferralReward {
  id: string;
  referredUserId: string;
  rewardType: string;
  rewardAmount: number;
  status: string;
  grantedAt: string | null;
  createdAt: string;
}

export interface ReferralRewardsData {
  rewards: ReferralReward[];
  totalSuccessful: number;
  totalCreditsEarned: number;
}

export function useReferralRewards() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["referral-rewards", user?.id],
    queryFn: async (): Promise<ReferralRewardsData> => {
      if (!user) return { rewards: [], totalSuccessful: 0, totalCreditsEarned: 0 };

      const { data, error } = await supabase
        .from("referral_rewards")
        .select("*")
        .eq("referrer_user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const rewards: ReferralReward[] = (data || []).map((r: any) => ({
        id: r.id,
        referredUserId: r.referred_user_id,
        rewardType: r.reward_type,
        rewardAmount: r.reward_amount,
        status: r.status,
        grantedAt: r.granted_at,
        createdAt: r.created_at,
      }));

      const granted = rewards.filter(r => r.status === "granted");

      return {
        rewards,
        totalSuccessful: granted.length,
        totalCreditsEarned: granted.reduce((sum, r) => sum + r.rewardAmount, 0),
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
  });
}
