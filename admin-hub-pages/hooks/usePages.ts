import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Page {
  id: string;
  domain_id: string;
  url: string;
  path: string;
  status: "online" | "offline" | "redirect" | "error" | "pending";
  http_code: number | null;
  redirect_url: string | null;
  response_time_ms: number | null;
  last_check_at: string | null;
  page_title: string | null;
  meta_description: string | null;
  h1: string | null;
  has_canonical: boolean;
  has_og_tags: boolean;
  word_count: number;
  workflow: "nicht_begonnen" | "in_bearbeitung" | "geprueft" | "fertig";
  checked_links: boolean;
  checked_seo: boolean;
  checked_content: boolean;
  checked_design: boolean;
  checked_mobile: boolean;
  checked_legal: boolean;
  internal_links_count: number;
  external_links_count: number;
  broken_links_count: number;
  notes: string | null;
  depth: number;
  discovered_at: string;
  updated_at: string;
}

export function usePages(domainId: string | undefined) {
  return useQuery({
    queryKey: ["pages", domainId],
    enabled: !!domainId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("domain_id", domainId!)
        .order("path", { ascending: true });

      if (error) throw error;
      return data as Page[];
    },
  });
}

export function useUpdatePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Page> }) => {
      const { data, error } = await supabase
        .from("pages")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["pages", data.domain_id] });
      qc.invalidateQueries({ queryKey: ["domains"] });
    },
  });
}

export function useBulkUpdatePages() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids, updates }: { ids: string[]; updates: Partial<Page> }) => {
      const { error } = await supabase
        .from("pages")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pages"] });
      qc.invalidateQueries({ queryKey: ["domains"] });
    },
  });
}

export function useDeletePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pages"] });
      qc.invalidateQueries({ queryKey: ["domains"] });
    },
  });
}
