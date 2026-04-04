import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ToolRegistryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  long_description: string | null;
  category: string;
  tool_type: string;
  icon: string | null;
  color: string | null;
  is_active: boolean | null;
  is_premium: boolean | null;
  is_visible: boolean | null;
  tier: string | null;
  free_limit: number | null;
  premium_price_cents: number | null;
  premium_features: string[] | null;
  stripe_product_id: string | null;
  stripe_price_monthly: string | null;
  stripe_price_yearly: string | null;
  stripe_price_single: string | null;
  stripe_price_lifetime: string | null;
  target_apps: string[] | null;
  target_audience: string | null;
  sort_order: number | null;
  conversion_rate: number | null;
  total_calculations: number | null;
  total_leads: number | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
  seo_domain: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export function useToolsRegistry() {
  return useQuery({
    queryKey: ['tools-registry'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tools_registry')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data as ToolRegistryItem[];
    },
  });
}

export function useUpdateTool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ToolRegistryItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('tools_registry')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools-registry'] });
    },
  });
}

export function useToolStats() {
  const { data: tools } = useToolsRegistry();

  return {
    total: tools?.length || 0,
    active: tools?.filter(t => t.is_active).length || 0,
    premium: tools?.filter(t => t.is_premium).length || 0,
    totalCalculations: tools?.reduce((sum, t) => sum + (t.total_calculations || 0), 0) || 0,
    totalLeads: tools?.reduce((sum, t) => sum + (t.total_leads || 0), 0) || 0,
    avgConversion: tools?.length
      ? (tools.filter(t => t.conversion_rate != null).reduce((sum, t) => sum + (t.conversion_rate || 0), 0) / (tools.filter(t => t.conversion_rate != null).length || 1)).toFixed(1)
      : '0',
    byCategory: tools?.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {},
  };
}
