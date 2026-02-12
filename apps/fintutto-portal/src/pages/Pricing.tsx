import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Check, X, Sparkles, Zap, Building2, Rocket, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PlanFeature {
  name: string;
  free: boolean | string;
  starter: boolean | string;
  professional: boolean | string;
  enterprise: boolean | string;
}

const FEATURES: PlanFeature[] = [
  { name: 'Buchungen pro Monat', free: '50', starter: '500', professional: 'Unbegrenzt', enterprise: 'Unbegrenzt' },
  { name: 'Benutzer', free: '1', starter: '3', professional: '10', enterprise: 'Unbegrenzt' },
  { name: 'Unternehmen/Mandanten', free: '1', starter: '1', professional: '5', enterprise: 'Unbegrenzt' },
  { name: 'Rechnungen erstellen', free: true, starter: true, professional: true, enterprise: true },
  { name: 'Belege hochladen', free: true, starter: true, professional: true, enterprise: true },
  { name: 'Kontenrahmen (SKR03/04)', free: true, starter: true, professional: true, enterprise: true },
  { name: 'Kontakte verwalten', free: true, starter: true, professional: true, enterprise: true },
  { name: 'Bankkonten anbinden', free: false, starter: true, professional: true, enterprise: true },
  { name: 'Kontoauszüge importieren', free: false, starter: true, professional: true, enterprise: true },
  { name: 'Offene Posten', free: false, starter: true, professional: true, enterprise: true },
  { name: 'Mahnwesen', free: false, starter: true, professional: true, enterprise: true },
  { name: 'USt-Voranmeldung', free: false, starter: true, professional: true, enterprise: true },
  { name: 'ELSTER-Übertragung', free: false, starter: true, professional: true, enterprise: true },
  { name: 'BWA & Bilanz', free: false, starter: true, professional: true, enterprise: true },
  { name: 'GuV & Summen-/Saldenliste', free: false, starter: true, professional: true, enterprise: true },
  { name: 'DATEV-Export', free: false, starter: true, professional: true, enterprise: true },
  { name: 'Kassenbuch', free: false, starter: true, professional: true, enterprise: true },
  { name: 'Wiederkehrende Buchungen', free: false, starter: true, professional: true, enterprise: true },
  { name: 'Kostenstellen', free: false, starter: false, professional: true, enterprise: true },
  { name: 'Projektbuchhaltung', free: false, starter: false, professional: true, enterprise: true },
  { name: 'Multi-Währung', free: false, starter: false, professional: true, enterprise: true },
  { name: 'Cashflow-Analyse', free: false, starter: false, professional: true, enterprise: true },
  { name: 'Budgetierung', free: false, starter: false, professional: true, enterprise: true },
  { name: 'SEPA-Zahlungen', free: false, starter: false, professional: true, enterprise: true },
  { name: 'Stapelverarbeitung', free: false, starter: false, professional: true, enterprise: true },
  { name: 'Jahresabschluss-Assistent', free: false, starter: false, professional: true, enterprise: true },
  { name: 'API-Zugang', free: false, starter: false, professional: false, enterprise: true },
  { name: 'White-Label', free: false, starter: false, professional: false, enterprise: true },
  { name: 'Dedizierter Support', free: false, starter: false, professional: false, enterprise: true },
  { name: 'SLA-Garantie', free: false, starter: false, professional: false, enterprise: true },
];

interface Plan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  icon: React.ElementType;
  popular?: boolean;
  cta: string;
  stripePriceIdMonthly?: string;
  stripePriceIdYearly?: string;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Für Einsteiger und Privatpersonen',
    monthlyPrice: 0,
    yearlyPrice: 0,
    icon: Zap,
    cta: 'Kostenlos starten',
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'Für Freelancer und Kleinunternehmer',
    monthlyPrice: 19,
    yearlyPrice: 190,
    icon: Rocket,
    cta: 'Starter wählen',
    stripePriceIdMonthly: 'price_starter_monthly',
    stripePriceIdYearly: 'price_starter_yearly',
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Für wachsende Unternehmen',
    monthlyPrice: 49,
    yearlyPrice: 490,
    icon: Building2,
    popular: true,
    cta: 'Professional wählen',
    stripePriceIdMonthly: 'price_professional_monthly',
    stripePriceIdYearly: 'price_professional_yearly',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Für große Unternehmen und Konzerne',
    monthlyPrice: 199,
    yearlyPrice: 1990,
    icon: Sparkles,
    cta: 'Kontakt aufnehmen',
    stripePriceIdMonthly: 'price_enterprise_monthly',
    stripePriceIdYearly: 'price_enterprise_yearly',
  },
];

const Pricing = () => {
  const { toast } = useToast();
  const [isYearly, setIsYearly] = useState(true);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // Mock: current subscription - would come from subscription context
  const currentPlan = 'starter';

  const handleSelectPlan = async (plan: Plan) => {
    if (plan.id === 'free') {
      toast({ title: 'Free Plan', description: 'Sie nutzen bereits den kostenlosen Plan.' });
      return;
    }

    if (plan.id === 'enterprise') {
      window.location.href = 'mailto:enterprise@fintutto.de?subject=Enterprise%20Anfrage';
      return;
    }

    setIsLoading(plan.id);

    try {
      // In production, this would call Stripe Checkout
      const priceId = isYearly ? plan.stripePriceIdYearly : plan.stripePriceIdMonthly;

      // Mock Stripe checkout - in production use actual Stripe integration
      // const response = await fetch('/api/create-checkout-session', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ priceId }),
      // });
      // const { url } = await response.json();
      // window.location.href = url;

      toast({
        title: 'Stripe Checkout',
        description: `Weiterleitung zu Stripe für ${plan.name} Plan (${isYearly ? 'jährlich' : 'monatlich'})...`,
      });

      // Simulate redirect delay
      setTimeout(() => {
        setIsLoading(null);
        toast({
          title: 'Demo-Modus',
          description: 'Stripe Integration wird in Produktion aktiviert.',
        });
      }, 2000);

    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Fehler',
        description: 'Checkout konnte nicht gestartet werden.',
        variant: 'destructive',
      });
      setIsLoading(null);
    }
  };

  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === 'string') {
      return <span className="text-sm font-medium">{value}</span>;
    }
    return value ? (
      <Check className="h-5 w-5 text-green-500" />
    ) : (
      <X className="h-5 w-5 text-muted-foreground/30" />
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Einfache, transparente Preise</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Wählen Sie den passenden Plan für Ihr Unternehmen. Jederzeit kündbar.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4">
          <span className={!isYearly ? 'font-medium' : 'text-muted-foreground'}>Monatlich</span>
          <Switch checked={isYearly} onCheckedChange={setIsYearly} />
          <span className={isYearly ? 'font-medium' : 'text-muted-foreground'}>
            Jährlich
            <Badge variant="secondary" className="ml-2">2 Monate gratis</Badge>
          </span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {PLANS.map(plan => {
          const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
          const monthlyEquivalent = isYearly ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice;
          const isCurrentPlan = plan.id === currentPlan;

          return (
            <Card
              key={plan.id}
              className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Beliebt
                </Badge>
              )}
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <plan.icon className="h-6 w-6 text-primary" />
                  <CardTitle>{plan.name}</CardTitle>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-4xl font-bold">€{monthlyEquivalent}</span>
                  <span className="text-muted-foreground">/Monat</span>
                  {isYearly && plan.yearlyPrice > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      €{price} jährlich abgerechnet
                    </p>
                  )}
                </div>

                <ul className="space-y-2 text-sm">
                  {FEATURES.slice(0, 8).map(feature => {
                    const value = feature[plan.id as keyof PlanFeature];
                    if (value === false) return null;
                    return (
                      <li key={feature.name} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 shrink-0" />
                        <span>
                          {feature.name}
                          {typeof value === 'string' && value !== 'true' && (
                            <span className="text-muted-foreground ml-1">({value})</span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                  disabled={isCurrentPlan || isLoading === plan.id}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {isLoading === plan.id ? (
                    <>
                      <CreditCard className="h-4 w-4 mr-2 animate-pulse" />
                      Wird geladen...
                    </>
                  ) : isCurrentPlan ? (
                    'Aktueller Plan'
                  ) : (
                    plan.cta
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Alle Funktionen im Vergleich</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Funktion</th>
                  {PLANS.map(plan => (
                    <th key={plan.id} className="text-center py-3 px-4">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((feature, idx) => (
                  <tr key={feature.name} className={idx % 2 === 0 ? 'bg-muted/50' : ''}>
                    <td className="py-3 px-4 text-sm">{feature.name}</td>
                    {PLANS.map(plan => (
                      <td key={plan.id} className="text-center py-3 px-4">
                        {renderFeatureValue(feature[plan.id as keyof PlanFeature])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Häufige Fragen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium">Kann ich jederzeit wechseln?</h4>
            <p className="text-sm text-muted-foreground">
              Ja, Sie können jederzeit upgraden oder downgraden. Bei Upgrades wird anteilig abgerechnet.
            </p>
          </div>
          <div>
            <h4 className="font-medium">Gibt es eine Testphase?</h4>
            <p className="text-sm text-muted-foreground">
              Ja, alle neuen Accounts starten mit einer 30-tägigen Testphase aller Professional-Funktionen.
            </p>
          </div>
          <div>
            <h4 className="font-medium">Welche Zahlungsmethoden werden akzeptiert?</h4>
            <p className="text-sm text-muted-foreground">
              Wir akzeptieren alle gängigen Kreditkarten, SEPA-Lastschrift und Überweisung (für jährliche Pläne).
            </p>
          </div>
          <div>
            <h4 className="font-medium">Sind meine Daten sicher?</h4>
            <p className="text-sm text-muted-foreground">
              Alle Daten werden verschlüsselt übertragen und auf Servern in Deutschland gespeichert (DSGVO-konform).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Pricing;
