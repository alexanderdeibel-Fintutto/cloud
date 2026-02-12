import { useState, useEffect, useCallback, createContext, useContext } from 'react';

export type SubscriptionPlan = 'free' | 'starter' | 'professional' | 'enterprise';
export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired';

export interface Subscription {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface UsageQuota {
  bookingsUsed: number;
  bookingsLimit: number;
  usersUsed: number;
  usersLimit: number;
  companiesUsed: number;
  companiesLimit: number;
}

export interface SubscriptionContextType {
  subscription: Subscription | null;
  usage: UsageQuota | null;
  isLoading: boolean;
  isPro: boolean;
  isEnterprise: boolean;
  isTrial: boolean;
  daysLeftInTrial: number;
  canAccess: (feature: string) => boolean;
  checkQuota: (type: 'bookings' | 'users' | 'companies') => { allowed: boolean; remaining: number };
  refreshSubscription: () => Promise<void>;
}

// Feature access matrix
const FEATURE_ACCESS: Record<string, SubscriptionPlan[]> = {
  // Free features
  'invoices': ['free', 'starter', 'professional', 'enterprise'],
  'receipts': ['free', 'starter', 'professional', 'enterprise'],
  'contacts': ['free', 'starter', 'professional', 'enterprise'],
  'chart-of-accounts': ['free', 'starter', 'professional', 'enterprise'],
  'journal-basic': ['free', 'starter', 'professional', 'enterprise'],

  // Starter features
  'bank-import': ['starter', 'professional', 'enterprise'],
  'bank-reconciliation': ['starter', 'professional', 'enterprise'],
  'vat-helper': ['starter', 'professional', 'enterprise'],
  'elster': ['starter', 'professional', 'enterprise'],
  'open-items': ['starter', 'professional', 'enterprise'],
  'dunning': ['starter', 'professional', 'enterprise'],
  'recurring-bookings': ['starter', 'professional', 'enterprise'],
  'reports-basic': ['starter', 'professional', 'enterprise'],
  'bwa': ['starter', 'professional', 'enterprise'],
  'balance-sheet': ['starter', 'professional', 'enterprise'],
  'profit-loss': ['starter', 'professional', 'enterprise'],
  'trial-balance': ['starter', 'professional', 'enterprise'],
  'cash-book': ['starter', 'professional', 'enterprise'],
  'datev-export': ['starter', 'professional', 'enterprise'],
  'import-wizard': ['starter', 'professional', 'enterprise'],
  'period-closing': ['starter', 'professional', 'enterprise'],

  // Professional features
  'cost-centers': ['professional', 'enterprise'],
  'projects': ['professional', 'enterprise'],
  'multi-currency': ['professional', 'enterprise'],
  'cash-flow': ['professional', 'enterprise'],
  'budgeting': ['professional', 'enterprise'],
  'sepa-payments': ['professional', 'enterprise'],
  'online-payments': ['professional', 'enterprise'],
  'batch-operations': ['professional', 'enterprise'],
  'scheduler': ['professional', 'enterprise'],
  'year-end-closing': ['professional', 'enterprise'],
  'audit-trail': ['professional', 'enterprise'],
  'multi-company': ['professional', 'enterprise'],

  // Enterprise features
  'api-access': ['enterprise'],
  'white-label': ['enterprise'],
  'sso': ['enterprise'],
  'dedicated-support': ['enterprise'],
  'sla': ['enterprise'],
  'unlimited-users': ['enterprise'],
};

// Plan limits
const PLAN_LIMITS: Record<SubscriptionPlan, { bookings: number; users: number; companies: number }> = {
  free: { bookings: 50, users: 1, companies: 1 },
  starter: { bookings: 500, users: 3, companies: 1 },
  professional: { bookings: Infinity, users: 10, companies: 5 },
  enterprise: { bookings: Infinity, users: Infinity, companies: Infinity },
};

const STORAGE_KEY = 'fintutto_subscription';
const USAGE_KEY = 'fintutto_usage';

export function useSubscription(): SubscriptionContextType {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<UsageQuota | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load subscription from localStorage (mock) or API in production
  useEffect(() => {
    const loadSubscription = async () => {
      try {
        // In production, fetch from Supabase/API
        // const { data } = await supabase.from('subscriptions').select('*').single();

        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          setSubscription({
            ...data,
            currentPeriodStart: new Date(data.currentPeriodStart),
            currentPeriodEnd: new Date(data.currentPeriodEnd),
          });
        } else {
          // Default: Trial subscription
          const trialEnd = new Date();
          trialEnd.setDate(trialEnd.getDate() + 30);

          const defaultSub: Subscription = {
            id: 'sub_trial',
            plan: 'starter',
            status: 'trial',
            currentPeriodStart: new Date(),
            currentPeriodEnd: trialEnd,
            cancelAtPeriodEnd: false,
          };
          setSubscription(defaultSub);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSub));
        }

        // Load usage
        const usageStored = localStorage.getItem(USAGE_KEY);
        if (usageStored) {
          setUsage(JSON.parse(usageStored));
        } else {
          const defaultUsage: UsageQuota = {
            bookingsUsed: 0,
            bookingsLimit: 500,
            usersUsed: 1,
            usersLimit: 3,
            companiesUsed: 1,
            companiesLimit: 1,
          };
          setUsage(defaultUsage);
          localStorage.setItem(USAGE_KEY, JSON.stringify(defaultUsage));
        }
      } catch (error) {
        console.error('Error loading subscription:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSubscription();
  }, []);

  const refreshSubscription = useCallback(async () => {
    setIsLoading(true);
    // In production, re-fetch from API
    // For now, just reload from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      setSubscription({
        ...data,
        currentPeriodStart: new Date(data.currentPeriodStart),
        currentPeriodEnd: new Date(data.currentPeriodEnd),
      });
    }
    setIsLoading(false);
  }, []);

  const isPro = subscription?.plan === 'professional' || subscription?.plan === 'enterprise';
  const isEnterprise = subscription?.plan === 'enterprise';
  const isTrial = subscription?.status === 'trial';

  const daysLeftInTrial = subscription?.status === 'trial'
    ? Math.max(0, Math.ceil((subscription.currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const canAccess = useCallback((feature: string): boolean => {
    if (!subscription) return false;

    // Trial gets access to all starter features
    if (subscription.status === 'trial') {
      const trialFeatures = [...FEATURE_ACCESS['invoices'] || [], 'starter'];
      const allowedPlans = FEATURE_ACCESS[feature];
      if (!allowedPlans) return true; // Unknown features are allowed
      return allowedPlans.some(p => p === 'free' || p === 'starter');
    }

    // Check if feature exists in access matrix
    const allowedPlans = FEATURE_ACCESS[feature];
    if (!allowedPlans) return true; // Unknown features are allowed by default

    return allowedPlans.includes(subscription.plan);
  }, [subscription]);

  const checkQuota = useCallback((type: 'bookings' | 'users' | 'companies'): { allowed: boolean; remaining: number } => {
    if (!subscription || !usage) return { allowed: false, remaining: 0 };

    const limits = PLAN_LIMITS[subscription.plan];
    let used: number;
    let limit: number;

    switch (type) {
      case 'bookings':
        used = usage.bookingsUsed;
        limit = limits.bookings;
        break;
      case 'users':
        used = usage.usersUsed;
        limit = limits.users;
        break;
      case 'companies':
        used = usage.companiesUsed;
        limit = limits.companies;
        break;
    }

    const remaining = limit === Infinity ? Infinity : limit - used;
    return {
      allowed: remaining > 0,
      remaining: remaining === Infinity ? Infinity : Math.max(0, remaining),
    };
  }, [subscription, usage]);

  return {
    subscription,
    usage,
    isLoading,
    isPro,
    isEnterprise,
    isTrial,
    daysLeftInTrial,
    canAccess,
    checkQuota,
    refreshSubscription,
  };
}

// React Context for subscription
const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export const SubscriptionProvider = SubscriptionContext.Provider;

export function useSubscriptionContext(): SubscriptionContextType {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscriptionContext must be used within SubscriptionProvider');
  }
  return context;
}

// Higher-order component for feature gating
export function withFeatureAccess<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  feature: string,
  fallback?: React.ReactNode
) {
  return function FeatureGatedComponent(props: P) {
    const { canAccess, isLoading } = useSubscription();

    if (isLoading) {
      return <div className="animate-pulse">Loading...</div>;
    }

    if (!canAccess(feature)) {
      return fallback || <UpgradePrompt feature={feature} />;
    }

    return <WrappedComponent {...props} />;
  };
}

// Upgrade prompt component
function UpgradePrompt({ feature }: { feature: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        <span className="text-2xl">🔒</span>
      </div>
      <h3 className="text-lg font-semibold mb-2">Funktion nicht verfügbar</h3>
      <p className="text-muted-foreground mb-4">
        Diese Funktion ist in Ihrem aktuellen Plan nicht enthalten.
      </p>
      <a href="/pricing" className="text-primary hover:underline">
        Plan upgraden →
      </a>
    </div>
  );
}
