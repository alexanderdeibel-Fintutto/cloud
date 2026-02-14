import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useCheckAllDomains() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("check-domains", {
        body: {},
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["domains"] });
      qc.invalidateQueries({ queryKey: ["domain-stats"] });
    },
  });
}

export function useCheckDomain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (domainId: string) => {
      const { data, error } = await supabase.functions.invoke("check-domains", {
        body: { domainId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["domains"] });
      qc.invalidateQueries({ queryKey: ["domain-stats"] });
    },
  });
}

export function useCrawlDomain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ domainId, maxDepth = 2 }: { domainId: string; maxDepth?: number }) => {
      const { data, error } = await supabase.functions.invoke("crawl-domain", {
        body: { domainId, maxDepth },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["domains"] });
      qc.invalidateQueries({ queryKey: ["pages"] });
      qc.invalidateQueries({ queryKey: ["domain-stats"] });
    },
  });
}
