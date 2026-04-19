import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2, ArrowLeft, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { PRICING_PLANS, formatPrice } from '@/config/pricing';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getStoredReferralCode, clearStoredReferralCode } from '@/hooks/useReferralCapture';

export default function PricingPage() {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const { plan: currentPlan, isLoading: subscriptionLoading } = useSubscription();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const referralCode = getStoredReferralCode();

  const handleSelectPlan = async (planId: string, priceId: string) => {
    if (!user || !session) {
      navigate('/login');
      return;
    }

    if (planId === 'free' || planId === currentPlan) {
      return;
    }

    // For downgrade, open customer portal
    const currentPlanIndex = PRICING_PLANS.findIndex(p => p.id === currentPlan);
    const selectedPlanIndex = PRICING_PLANS.findIndex(p => p.id === planId);

    if (selectedPlanIndex < currentPlanIndex && currentPlan !== 'free') {
      handleManageSubscription();
      return;
    }

    try {
      setLoadingPlanId(planId);

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceId,
          referralCode: referralCode || undefined,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      if (data.url) {
        // Clear referral code after successful checkout redirect
        clearStoredReferralCode();
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Fehler beim Starten des Checkouts');
    } finally {
      setLoadingPlanId(null);
    }
  };

  const handleManageSubscription = async () => {
    if (!session) return;

    try {
      setLoadingPlanId('manage');

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast.error('Fehler beim Öffnen des Kundenportals');
    } finally {
      setLoadingPlanId(null);
    }
  };

  const getButtonText = (planId: string) => {
    if (planId === currentPlan) return 'Aktueller Plan';
    if (!user) return 'Registrieren';
    if (planId === 'free') return 'Aktueller Plan';
    
    const currentPlanIndex = PRICING_PLANS.findIndex(p => p.id === currentPlan);
    const selectedPlanIndex = PRICING_PLANS.findIndex(p => p.id === planId);
    
    if (selectedPlanIndex < currentPlanIndex) return 'Downgrade';
    return 'Upgrade';
  };

  const isButtonDisabled = (planId: string) => {
    return planId === currentPlan || (planId === 'free' && currentPlan === 'free');
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center gap-3 px-4 py-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="touch-target"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold text-lg">Preise</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-8 max-w-4xl mx-auto">
        {/* Referral Banner */}
        {referralCode && (
          <div className="mb-6 p-4 rounded-lg border border-primary/30 bg-primary/5 flex items-center gap-3">
            <Gift className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-medium">Einladungsrabatt aktiv!</p>
              <p className="text-xs text-muted-foreground">
                Dein erster Monat ist kostenlos – der Rabatt wird automatisch beim Checkout angewendet.
              </p>
            </div>
          </div>
        )}

        {/* Title Section */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Wählen Sie Ihren Plan</h2>
          <p className="text-muted-foreground">
            Starten Sie kostenlos und upgraden Sie bei Bedarf
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {PRICING_PLANS.map((plan) => {
            const isCurrentPlan = plan.id === currentPlan;
            const isLoading = loadingPlanId === plan.id;

            return (
              <Card 
                key={plan.id}
                className={cn(
                  'relative flex flex-col',
                  plan.highlighted && 'border-primary shadow-lg',
                  isCurrentPlan && 'border-green-500'
                )}
              >
                {plan.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Beliebt
                  </Badge>
                )}
                {isCurrentPlan && (
                  <Badge variant="outline" className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white border-green-500">
                    Ihr Plan
                  </Badge>
                )}

                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="mb-4">
                    <span className="text-3xl font-bold">
                      {formatPrice(plan.monthlyPrice)}
                    </span>
                  </div>

                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? 'default' : 'outline'}
                    disabled={isButtonDisabled(plan.id) || subscriptionLoading || isLoading}
                    onClick={() => handleSelectPlan(plan.id, plan.priceId)}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      getButtonText(plan.id)
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Manage Subscription Button */}
        {user && currentPlan !== 'free' && (
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              onClick={handleManageSubscription}
              disabled={loadingPlanId === 'manage'}
            >
              {loadingPlanId === 'manage' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Abonnement verwalten
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
