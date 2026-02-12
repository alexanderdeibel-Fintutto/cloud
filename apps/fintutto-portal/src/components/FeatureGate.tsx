import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Sparkles, Zap, Building2, Crown } from 'lucide-react';

interface FeatureGateProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
  requiredTier?: 'starter' | 'professional' | 'enterprise';
}

const TIER_INFO = {
  starter: { name: 'Starter', icon: Zap, color: 'text-blue-500', price: '19€/Monat' },
  professional: { name: 'Professional', icon: Building2, color: 'text-purple-500', price: '49€/Monat' },
  enterprise: { name: 'Enterprise', icon: Crown, color: 'text-orange-500', price: '199€/Monat' },
};

export function FeatureGate({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
  requiredTier,
}: FeatureGateProps) {
  const navigate = useNavigate();
  const { canAccess, isLoading, subscription, isTrial, daysLeftInTrial } = useSubscription();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const hasAccess = canAccess(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  const tierInfo = requiredTier ? TIER_INFO[requiredTier] : TIER_INFO.starter;
  const TierIcon = tierInfo.icon;

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>

        <h3 className="text-lg font-semibold mb-2">Funktion nicht verfügbar</h3>

        <p className="text-muted-foreground mb-4 max-w-md">
          Diese Funktion ist in Ihrem aktuellen Plan nicht enthalten.
          {isTrial && daysLeftInTrial > 0 && (
            <span className="block mt-1 text-sm">
              Ihre Testphase endet in {daysLeftInTrial} Tagen.
            </span>
          )}
        </p>

        <div className="flex items-center gap-2 mb-6">
          <Badge variant="outline" className={tierInfo.color}>
            <TierIcon className="h-3 w-3 mr-1" />
            Ab {tierInfo.name}
          </Badge>
          <span className="text-sm text-muted-foreground">{tierInfo.price}</span>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => navigate('/pricing')}>
            <Sparkles className="h-4 w-4 mr-2" />
            Pläne vergleichen
          </Button>
          <Button variant="outline" onClick={() => navigate('/tools')}>
            Verfügbare Tools
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Hook for conditional rendering
export function useFeatureAccess(feature: string) {
  const { canAccess, isLoading, subscription, isTrial, daysLeftInTrial } = useSubscription();

  return {
    hasAccess: canAccess(feature),
    isLoading,
    subscription,
    isTrial,
    daysLeftInTrial,
  };
}

// Higher-order component version
export function withFeatureGate<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  feature: string,
  requiredTier?: 'starter' | 'professional' | 'enterprise'
) {
  return function FeatureGatedComponent(props: P) {
    return (
      <FeatureGate feature={feature} requiredTier={requiredTier}>
        <WrappedComponent {...props} />
      </FeatureGate>
    );
  };
}

export default FeatureGate;
