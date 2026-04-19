import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CrossSellTrigger } from "@/types/apps";

export function useCrossSellTriggers(sourceAppId: string = "hausmeisterpro") {
  return useQuery({
    queryKey: ["cross-sell-triggers", sourceAppId],
    queryFn: async (): Promise<CrossSellTrigger[]> => {
      const { data, error } = await supabase
        .from("ai_cross_sell_triggers")
        .select("*")
        .eq("source_app_id", sourceAppId)
        .eq("is_active", true)
        .order("priority", { ascending: false });

      if (error) throw error;
      return (data as unknown[]).map((item: unknown) => {
        const trigger = item as Record<string, unknown>;
        return {
          ...trigger,
          trigger_condition: typeof trigger.trigger_condition === 'object' 
            ? trigger.trigger_condition 
            : {},
        } as CrossSellTrigger;
      });
    },
  });
}
