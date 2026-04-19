import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useReferralCode() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["referral-code", user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Check for existing code
      const { data: existing } = await supabase
        .from("referral_codes")
        .select("code")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing?.code) return existing.code;

      // Generate new code via DB function
      const { data: newCode } = await supabase.rpc("generate_referral_code");
      if (!newCode) return null;

      // Insert the new code
      const { data: inserted, error } = await supabase
        .from("referral_codes")
        .insert({ user_id: user.id, code: newCode })
        .select("code")
        .single();

      if (error) {
        console.error("Failed to create referral code:", error);
        return null;
      }

      return inserted.code;
    },
    enabled: !!user,
    staleTime: Infinity,
  });
}
