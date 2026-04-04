import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  app_id: string | null;
  tier: string | null;
  features: Record<string, unknown> | null;
  created_at: string | null;
}

export interface Price {
  id: string;
  product_id: string;
  active: boolean;
  currency: string | null;
  unit_amount: number | null;
  recurring_interval: string | null;
  nickname: string | null;
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stripe_products')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as Product[];
    },
  });
}

export function usePrices() {
  return useQuery({
    queryKey: ['prices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stripe_prices')
        .select('*')
        .eq('active', true);

      if (error) throw error;
      return data as Price[];
    },
  });
}

export function useProductsWithPrices() {
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: prices, isLoading: pricesLoading } = usePrices();

  const productsWithPrices = products?.map(product => {
    const productPrices = prices?.filter(p => p.product_id === product.id) || [];
    const mainPrice = productPrices.find(p => p.recurring_interval === 'month') || productPrices[0];
    
    return {
      ...product,
      prices: productPrices,
      mainPrice,
    };
  });

  return {
    data: productsWithPrices,
    isLoading: productsLoading || pricesLoading,
  };
}
