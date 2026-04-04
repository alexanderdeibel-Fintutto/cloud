import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  totalUsers: number;
  activeSubscriptions: number;
  mrr: number;
  arr: number;
  churnRate: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      // Fetch total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch active subscriptions with MRR calculation
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('status', 'active');

      // Fetch prices for MRR calculation
      const { data: prices } = await supabase
        .from('stripe_prices')
        .select('*');

      // Calculate MRR from active subscriptions
      let mrr = 0;
      if (subscriptions && prices) {
        subscriptions.forEach(sub => {
          const price = prices.find(p => p.id === sub.stripe_price_id);
          if (price?.unit_amount) {
            const monthlyAmount = price.recurring_interval === 'year' 
              ? price.unit_amount / 12 
              : price.unit_amount;
            mrr += monthlyAmount / 100; // Convert cents to euros
          }
        });
      }

      // Fetch cancelled subscriptions for churn rate
      const { count: cancelledCount } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .not('cancelled_at', 'is', null);

      const totalSubs = subscriptions?.length || 1;
      const churnRate = ((cancelledCount || 0) / (totalSubs + (cancelledCount || 0))) * 100;

      return {
        totalUsers: totalUsers || 0,
        activeSubscriptions: subscriptions?.length || 0,
        mrr: Math.round(mrr * 100) / 100,
        arr: Math.round(mrr * 12 * 100) / 100,
        churnRate: Math.round(churnRate * 10) / 10,
      };
    },
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const { data } = await supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      return data || [];
    },
  });
}

export function useErrorStats() {
  return useQuery({
    queryKey: ['error-stats'],
    queryFn: async () => {
      const { data } = await supabase
        .from('error_logs')
        .select('*')
        .order('occurred_at', { ascending: false })
        .limit(50);

      return data || [];
    },
  });
}
