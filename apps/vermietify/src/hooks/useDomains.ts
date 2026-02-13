import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Domain {
  id: string;
  url: string;
  label: string;
  description: string | null;
  category: string;
  repo_name: string | null;
  deploy_url: string | null;
  health: "healthy" | "warning" | "critical" | "unknown";
  last_check_at: string | null;
  http_code: number | null;
  response_time_ms: number | null;
  has_ssl: boolean;
  ssl_expires_at: string | null;
  page_title: string | null;
  meta_description: string | null;
  has_ga: boolean;
  has_gtm: boolean;
  has_impressum: boolean;
  has_datenschutz: boolean;
  total_pages: number;
  pages_online: number;
  pages_offline: number;
  pages_checked: number;
  pages_fertig: number;
  setup_complete: boolean;
  notes: string | null;
  priority: number;
  created_at: string;
  updated_at: string;
}

export function useDomains() {
  return useQuery({
    queryKey: ["domains"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("domains")
        .select("*")
        .order("priority", { ascending: false })
        .order("label", { ascending: true });

      if (error) throw error;
      return data as Domain[];
    },
  });
}

export function useDomain(id: string | undefined) {
  return useQuery({
    queryKey: ["domains", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("domains")
        .select("*")
        .eq("id", id!)
        .single();

      if (error) throw error;
      return data as Domain;
    },
  });
}

export function useCreateDomain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (domain: Partial<Domain>) => {
      const { data, error } = await supabase
        .from("domains")
        .insert(domain)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["domains"] }),
  });
}

export function useUpdateDomain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Domain> }) => {
      const { data, error } = await supabase
        .from("domains")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["domains"] });
      qc.invalidateQueries({ queryKey: ["domains", id] });
    },
  });
}

export function useDeleteDomain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("domains").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["domains"] }),
  });
}

export function useDomainStats() {
  return useQuery({
    queryKey: ["domain-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("domains")
        .select("health, total_pages, pages_online, pages_offline, pages_checked, pages_fertig, setup_complete");

      if (error) throw error;

      const domains = data || [];
      return {
        total: domains.length,
        healthy: domains.filter((d) => d.health === "healthy").length,
        warning: domains.filter((d) => d.health === "warning").length,
        critical: domains.filter((d) => d.health === "critical").length,
        unknown: domains.filter((d) => d.health === "unknown").length,
        totalPages: domains.reduce((s, d) => s + (d.total_pages || 0), 0),
        pagesOnline: domains.reduce((s, d) => s + (d.pages_online || 0), 0),
        pagesOffline: domains.reduce((s, d) => s + (d.pages_offline || 0), 0),
        pagesChecked: domains.reduce((s, d) => s + (d.pages_checked || 0), 0),
        pagesFertig: domains.reduce((s, d) => s + (d.pages_fertig || 0), 0),
        setupComplete: domains.filter((d) => d.setup_complete).length,
      };
    },
  });
}
