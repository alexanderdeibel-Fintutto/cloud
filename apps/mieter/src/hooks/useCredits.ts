import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "./useSubscription";
import { toast } from "sonner";

interface UserCredits {
  balance: number;
  totalEarned: number;
  totalSpent: number;
}

interface CreditTransaction {
  id: string;
  amount: number;
  balanceAfter: number;
  transactionType: string;
  toolType: string | null;
  toolId: string | null;
  description: string | null;
  createdAt: string;
}

export function useCredits() {
  const { user } = useAuth();
  const { isPro } = useSubscription();
  const queryClient = useQueryClient();

  const { data: credits, isLoading } = useQuery({
    queryKey: ["user-credits", user?.id],
    queryFn: async (): Promise<UserCredits> => {
      if (!user) return { balance: 0, totalEarned: 0, totalSpent: 0 };

      const { data, error } = await supabase
        .from("user_credits")
        .select("balance, total_earned, total_spent")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Initialize credits for new user
        const { data: newCredits, error: insertError } = await supabase
          .from("user_credits")
          .insert({ user_id: user.id, balance: 3, total_earned: 3 }) // 3 free starter credits
          .select("balance, total_earned, total_spent")
          .single();

        if (insertError) throw insertError;
        return {
          balance: newCredits.balance,
          totalEarned: newCredits.total_earned,
          totalSpent: newCredits.total_spent,
        };
      }

      return {
        balance: data.balance,
        totalEarned: data.total_earned,
        totalSpent: data.total_spent,
      };
    },
    enabled: !!user,
    staleTime: 1000 * 30,
  });

  const { data: transactions } = useQuery({
    queryKey: ["credit-transactions", user?.id],
    queryFn: async (): Promise<CreditTransaction[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("credit_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      return (data || []).map((t: any) => ({
        id: t.id,
        amount: t.amount,
        balanceAfter: t.balance_after,
        transactionType: t.transaction_type,
        toolType: t.tool_type,
        toolId: t.tool_id,
        description: t.description,
        createdAt: t.created_at,
      }));
    },
    enabled: !!user,
    staleTime: 1000 * 60,
  });

  const useToolMutation = useMutation({
    mutationFn: async ({ toolType, toolId, creditsCost }: { toolType: string; toolId: string; creditsCost: number }) => {
      if (!user) throw new Error("Nicht eingeloggt");

      // Pro users have unlimited access
      if (isPro) {
        await supabase.from("tool_usage_log").insert({
          user_id: user.id,
          tool_type: toolType,
          tool_id: toolId,
          credits_cost: 0,
          access_method: "subscription",
        });
        return { success: true, newBalance: credits?.balance ?? 0 };
      }

      const currentBalance = credits?.balance ?? 0;
      if (currentBalance < creditsCost) {
        throw new Error("Nicht genügend Credits");
      }

      const newBalance = currentBalance - creditsCost;

      // Deduct credits
      const { error: updateError } = await supabase
        .from("user_credits")
        .update({
          balance: newBalance,
          total_spent: (credits?.totalSpent ?? 0) + creditsCost,
        })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      // Log transaction
      await supabase.from("credit_transactions").insert({
        user_id: user.id,
        amount: -creditsCost,
        balance_after: newBalance,
        transaction_type: "tool_usage",
        tool_type: toolType,
        tool_id: toolId,
        description: `${toolType}: ${toolId}`,
      });

      // Log usage
      await supabase.from("tool_usage_log").insert({
        user_id: user.id,
        tool_type: toolType,
        tool_id: toolId,
        credits_cost: creditsCost,
        access_method: "credit",
      });

      return { success: true, newBalance };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-credits"] });
      queryClient.invalidateQueries({ queryKey: ["credit-transactions"] });
    },
    onError: (error) => {
      toast.error(error.message === "Nicht genügend Credits"
        ? "Sie haben nicht genügend Credits. Bitte laden Sie Credits auf oder upgraden Sie auf Pro."
        : "Fehler beim Verwenden des Tools.");
    },
  });

  const canUseTool = (creditsCost: number): boolean => {
    if (isPro) return true;
    return (credits?.balance ?? 0) >= creditsCost;
  };

  return {
    credits: credits ?? { balance: 0, totalEarned: 0, totalSpent: 0 },
    transactions: transactions ?? [],
    isLoading,
    canUseTool,
    useTool: useToolMutation.mutateAsync,
    isUsingTool: useToolMutation.isPending,
    isPro,
  };
}
