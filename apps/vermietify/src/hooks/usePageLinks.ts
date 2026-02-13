import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PageLink {
  id: string;
  page_id: string;
  domain_id: string;
  url: string;
  anchor_text: string | null;
  link_type: string;
  status: "online" | "offline" | "redirect" | "error" | "pending";
  http_code: number | null;
  redirect_url: string | null;
  last_check_at: string | null;
  is_checked: boolean;
  is_approved: boolean;
  needs_fix: boolean;
  fix_note: string | null;
  created_at: string;
}

export function usePageLinks(pageId: string | undefined) {
  return useQuery({
    queryKey: ["page-links", pageId],
    enabled: !!pageId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_links")
        .select("*")
        .eq("page_id", pageId!)
        .order("link_type", { ascending: true })
        .order("url", { ascending: true });

      if (error) throw error;
      return data as PageLink[];
    },
  });
}

export function useDomainLinks(domainId: string | undefined) {
  return useQuery({
    queryKey: ["domain-links", domainId],
    enabled: !!domainId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_links")
        .select("*")
        .eq("domain_id", domainId!)
        .order("url", { ascending: true });

      if (error) throw error;
      return data as PageLink[];
    },
  });
}

export function useUpdateLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PageLink> }) => {
      const { data, error } = await supabase
        .from("page_links")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["page-links", data.page_id] });
      qc.invalidateQueries({ queryKey: ["domain-links", data.domain_id] });
      qc.invalidateQueries({ queryKey: ["pages"] });
    },
  });
}

export function useBulkUpdateLinks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      ids,
      updates,
    }: {
      ids: string[];
      updates: Partial<PageLink>;
    }) => {
      const { error } = await supabase
        .from("page_links")
        .update(updates)
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["page-links"] });
      qc.invalidateQueries({ queryKey: ["domain-links"] });
      qc.invalidateQueries({ queryKey: ["pages"] });
    },
  });
}

export function useBrokenLinks(domainId?: string) {
  return useQuery({
    queryKey: ["broken-links", domainId],
    queryFn: async () => {
      let query = supabase
        .from("page_links")
        .select("*, pages!inner(path, domain_id)")
        .in("status", ["offline", "error"]);

      if (domainId) {
        query = query.eq("domain_id", domainId);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data as (PageLink & { pages: { path: string; domain_id: string } })[];
    },
  });
}
