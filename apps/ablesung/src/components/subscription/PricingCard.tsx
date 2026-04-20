import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PricingPlan, formatPrice } from '@/lib/stripe';
import { cn } from '@/lib/utils';

interface PricingCardProps {
  plan: PricingPlan;
  isYearly: boolean;
  currentPlan: string;
  isLoading: boolean;
  onSelect: (priceId: string) => void;
}

export function PricingCard({ plan, isYearly, currentPlan, isLoading, onSelect }: PricingCardProps) {
  const price = isYearly ? plan.priceYearly : plan.priceMonthly;
  const priceId = isYearly ? plan.priceIdYearly : plan.priceIdMonthly;
  const isCurrentPlan = currentPlan === plan.id || currentPlan === plan.name.toLowerCase();
  const isFree = price === 0;
  
  const handleClick = () => {
    if (priceId && !isCurrentPlan && !isFree) {
      onSelect(priceId);
    }
  };

  const getButtonText = () => {
    if (isCurrentPlan) return 'Aktueller Plan';
    if (isFree) return 'Kostenlos';
    return 'Plan wählen';
  };

  return (
    <Card className={cn(
      'relative flex flex-col transition-all duration-200',
      plan.highlighted && 'border-primary shadow-lg scale-105',
      isCurrentPlan && 'ring-2 ring-primary'
    )}>
      {plan.highlighted && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
          Beliebt
        </Badge>
      )}
      {isCurrentPlan && (
        <Badge variant="secondary" className="absolute -top-3 right-4">
          Dein Plan
        </Badge>
      )}
      
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1">
        <div className="text-center mb-6">
          <span className="text-4xl font-bold">{formatPrice(price)}</span>
          <span className="text-muted-foreground">
            {isFree ? '' : isYearly ? '/Jahr' : '/Monat'}
          </span>
          {isYearly && !isFree && (
            <p className="text-sm text-muted-foreground mt-1">
              {formatPrice(price / 12)}/Monat bei jährlicher Zahlung
            </p>
          )}
        </div>
        
        <ul className="space-y-3">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      
      <CardFooter>
        <Button
          className="w-full"
          variant={plan.highlighted ? 'default' : 'outline'}
          disabled={isCurrentPlan || isFree || isLoading || !priceId}
          onClick={handleClick}
        >
          {getButtonText()}
        </Button>
      </CardFooter>
    </Card>
  );
}
