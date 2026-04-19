import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AppRegistryItem, Product } from "@/types/apps";

export function useAppsRegistry() {
  return useQuery({
    queryKey: ["apps-registry"],
    queryFn: async (): Promise<AppRegistryItem[]> => {
      const { data, error } = await supabase
        .from("apps_registry")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as AppRegistryItem[];
    },
  });
}

export function useProducts(appId?: string) {
  return useQuery({
    queryKey: ["products", appId],
    queryFn: async (): Promise<Product[]> => {
      let query = supabase
        .from("products")
        .select("*")
        .eq("is_active", true);

      if (appId) {
        query = query.eq("app_id", appId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data as unknown[]).map((item: unknown) => {
        const product = item as Record<string, unknown>;
        return {
          ...product,
          features: Array.isArray(product.features) ? product.features : [],
        } as Product;
      });
    },
  });
}
