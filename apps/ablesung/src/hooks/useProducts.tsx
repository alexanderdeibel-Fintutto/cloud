import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  app_id: string;
  name: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number;
  stripe_price_id_monthly: string | null;
  stripe_price_id_yearly: string | null;
  features: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function useProducts(appId?: string) {
  return useQuery({
    queryKey: ['products', appId],
    queryFn: async (): Promise<Product[]> => {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (appId) {
        query = query.eq('app_id', appId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(p => ({
        ...p,
        features: Array.isArray(p.features) ? p.features : [],
      })) as Product[];
    },
    staleTime: 5 * 60 * 1000, // 5 Minuten Cache
  });
}

export function useProductsByApp() {
  const { data: products, ...rest } = useProducts();

  const productsByApp = (products || []).reduce((acc, product) => {
    if (!acc[product.app_id]) {
      acc[product.app_id] = [];
    }
    acc[product.app_id].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  return { productsByApp, products, ...rest };
}
