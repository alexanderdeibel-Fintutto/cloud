export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  priceId: string;
  priceIdYearly: string;
  features: string[];
  highlighted?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Für den Einstieg',
    monthlyPrice: 0,
    yearlyPrice: 0,
    priceId: '',
    features: [
      'Bis zu 3 Gebäude',
      'Basis-Aufgabenverwaltung',
      'E-Mail-Support',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'Für kleine Teams',
    monthlyPrice: 9.99,
    yearlyPrice: 95.90,
    priceId: 'price_1St3Eg52lqSgjCze5l6pqANG',
    priceIdYearly: 'price_1T3lo152lqSgjCzeqQ5ZnvXc',
    features: [
      'Bis zu 10 Gebäude',
      'Erweiterte Aufgabenverwaltung',
      'Kalender-Integration',
      'Nachrichten-System',
      'E-Mail-Support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Für wachsende Unternehmen',
    monthlyPrice: 24.99,
    yearlyPrice: 239.90,
    priceId: 'price_1St3FA52lqSgjCzeE8lXHzKH',
    priceIdYearly: 'price_1T3lzT52lqSgjCzeKj0jGwTv',
    features: [
      'Unbegrenzte Gebäude',
      'Alle Starter-Features',
      'Dokumenten-Management',
      'Berichterstellung',
      'API-Zugang',
      'Prioritäts-Support',
    ],
    highlighted: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Für große Hausverwaltungen',
    monthlyPrice: 49.99,
    yearlyPrice: 479.90,
    priceId: 'price_1T0nb452lqSgjCzeKfvkna7n',
    priceIdYearly: 'price_1T0nb552lqSgjCzelBBrkq6c',
    features: [
      'Unbegrenzte Gebäude',
      'Alle Pro-Features',
      'API-Zugang',
      'Dedizierter Support',
      'Custom Branding',
    ],
  },
];

// Price ID to plan mapping for check-subscription function
export const PRICE_TO_PLAN: Record<string, string> = {
  'price_1St3Eg52lqSgjCze5l6pqANG': 'starter',
  'price_1St3FA52lqSgjCzeE8lXHzKH': 'pro',
  'price_1T0nb452lqSgjCzeKfvkna7n': 'enterprise',
  'price_1T0nb552lqSgjCzelBBrkq6c': 'enterprise',
};

export const formatPrice = (price: number): string => {
  if (price === 0) return 'Kostenlos';
  return `${price.toFixed(2).replace('.', ',')} €/Monat`;
};
