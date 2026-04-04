import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserCredit {
  id: string;
  user_id: string | null;
  credit_type: string | null;
  amount: number | null;
  expires_at: string | null;
  created_at: string | null;
}

export interface UserPurchase {
  id: string;
  user_id: string | null;
  product_type: string | null;
  product_id: string | null;
  amount_cents: number | null;
  currency: string | null;
  stripe_payment_id: string | null;
  status: string | null;
  created_at: string | null;
}

export function useUserCredits() {
  return useQuery({
    queryKey: ['user-credits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as UserCredit[];
    },
  });
}

export function useUserPurchases() {
  return useQuery({
    queryKey: ['user-purchases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_purchases')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as UserPurchase[];
    },
  });
}

export function useFinanceStats() {
  const { data: credits } = useUserCredits();
  const { data: purchases } = useUserPurchases();

  return {
    totalCredits: credits?.length || 0,
    totalCreditAmount: credits?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0,
    totalPurchases: purchases?.length || 0,
    totalRevenue: purchases?.reduce((sum, p) => sum + (p.amount_cents || 0), 0) / 100 || 0,
    purchasesByType: purchases?.reduce((acc, p) => {
      const type = p.product_type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {},
    purchasesByStatus: purchases?.reduce((acc, p) => {
      const status = p.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {},
  };
}
