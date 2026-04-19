import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PricingCard } from '@/components/subscription/PricingCard';
import { PricingToggle } from '@/components/subscription/PricingToggle';
import { useSubscription } from '@/hooks/useSubscription';
import { useProducts } from '@/hooks/useProducts';
import { productToPricingPlan } from '@/lib/stripe';
import { useAuth } from '@/hooks/useAuth';

const CURRENT_APP_ID = 'zaehler';

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { plan, isActive, isLoading: subLoading, openCheckout, openPortal, checkSubscription } = useSubscription();
  const { data: products, isLoading: productsLoading } = useProducts(CURRENT_APP_ID);
  const [isYearly, setIsYearly] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const isLoading = subLoading || productsLoading;

  const pricingPlans = (products || []).map(productToPricingPlan);

  const handleSelectPlan = async (priceId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setIsCheckingOut(true);
    await openCheckout(priceId);
    setIsCheckingOut(false);
  };

  const handleManageSubscription = async () => {
    await openPortal();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück
          </Button>
          {isActive && plan !== 'free' && (
            <Button variant="outline" size="sm" onClick={handleManageSubscription}>
              <Settings className="w-4 h-4 mr-2" />
              Abo verwalten
            </Button>
          )}
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Wählen Sie Ihren Plan</h1>
          <p className="text-muted-foreground">
            Alle Funktionen, die Sie für eine effiziente Immobilienverwaltung brauchen
          </p>
        </div>

        <div className="mb-10">
          <PricingToggle isYearly={isYearly} onToggle={setIsYearly} />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className={`grid grid-cols-1 md:grid-cols-2 ${pricingPlans.length >= 3 ? 'lg:grid-cols-3' : ''} ${pricingPlans.length >= 4 ? 'lg:grid-cols-4' : ''} gap-6 mb-12`}>
              {pricingPlans.map((pricingPlan) => (
                <PricingCard
                  key={pricingPlan.id}
                  plan={pricingPlan}
                  isYearly={isYearly}
                  currentPlan={plan}
                  isLoading={isCheckingOut}
                  onSelect={handleSelectPlan}
                />
              ))}
            </div>

            <div className="text-center">
              <Button variant="ghost" size="sm" onClick={checkSubscription}>
                Status aktualisieren
              </Button>
            </div>
          </>
        )}

        <div className="mt-16 text-center text-sm text-muted-foreground">
          <p>Alle Preise verstehen sich inkl. MwSt. Sie können jederzeit kündigen.</p>
        </div>
      </main>
    </div>
  );
}
