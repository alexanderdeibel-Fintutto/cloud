import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Building } from "@/types";

export function useBuildings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["buildings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("buildings")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as Building[];
    },
    enabled: !!user,
  });
}
