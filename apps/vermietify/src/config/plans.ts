// Vermietify Plans Configuration
// Stripe Price IDs are configured via environment variables (VITE_STRIPE_PRICE_VERMIETIFY_*)
// Run scripts/create-stripe-products.sh to create products in Stripe and get the IDs

export interface Plan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  priceIdMonthly: string;
  priceIdYearly: string;
  productId: string;
  features: string[];
  limits: {
    properties: number;
    units: number;
  };
  portalCredits: number; // -1 = unlimited
  popular?: boolean;
}

function getEnv(key: string, fallback: string = ''): string {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || fallback
  }
  return fallback
}

export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Fuer den Einstieg',
    priceMonthly: 0,
    priceYearly: 0,
    priceIdMonthly: '',
    priceIdYearly: '',
    productId: getEnv('VITE_STRIPE_PRODUCT_VERMIETIFY_STARTER'),
    features: [
      '1 Immobilie',
      '5 Einheiten',
      'Basis-Dashboards',
      'E-Mail-Support',
      '3 Portal-Credits/Monat',
    ],
    limits: {
      properties: 1,
      units: 5,
    },
    portalCredits: 3,
  },
  {
    id: 'basic',
    name: 'Basic',
    description: 'Perfekt fuer kleine Vermieter',
    priceMonthly: 9.99,
    priceYearly: 95.90,
    priceIdMonthly: getEnv('VITE_STRIPE_PRICE_VERMIETIFY_BASIC_MONTHLY'),
    priceIdYearly: getEnv('VITE_STRIPE_PRICE_VERMIETIFY_BASIC_YEARLY'),
    productId: getEnv('VITE_STRIPE_PRODUCT_VERMIETIFY_BASIC'),
    features: [
      '3 Immobilien',
      '25 Einheiten',
      'Alle Dashboards',
      'Dokumentenverwaltung',
      'E-Mail-Support',
      '10 Portal-Credits/Monat',
    ],
    limits: {
      properties: 3,
      units: 25,
    },
    portalCredits: 10,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Fuer professionelle Vermieter',
    priceMonthly: 24.99,
    priceYearly: 239.90,
    priceIdMonthly: getEnv('VITE_STRIPE_PRICE_VERMIETIFY_PRO_MONTHLY'),
    priceIdYearly: getEnv('VITE_STRIPE_PRICE_VERMIETIFY_PRO_YEARLY'),
    productId: getEnv('VITE_STRIPE_PRODUCT_VERMIETIFY_PRO'),
    features: [
      '10 Immobilien',
      '100 Einheiten',
      'Alle Dashboards',
      'Dokumentenverwaltung',
      'Nebenkostenabrechnung',
      'Prioritaets-Support',
      '30 Portal-Credits/Monat',
    ],
    limits: {
      properties: 10,
      units: 100,
    },
    portalCredits: 30,
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Fuer grosse Portfolios',
    priceMonthly: 49.99,
    priceYearly: 479.90,
    priceIdMonthly: getEnv('VITE_STRIPE_PRICE_VERMIETIFY_ENTERPRISE_MONTHLY'),
    priceIdYearly: getEnv('VITE_STRIPE_PRICE_VERMIETIFY_ENTERPRISE_YEARLY'),
    productId: getEnv('VITE_STRIPE_PRODUCT_VERMIETIFY_ENTERPRISE'),
    features: [
      'Unbegrenzte Immobilien',
      'Unbegrenzte Einheiten',
      'Alle Features',
      'API-Zugang',
      'Dedizierter Support',
      'Custom Branding',
      'Unbegrenzte Portal-Credits',
    ],
    limits: {
      properties: Infinity,
      units: Infinity,
    },
    portalCredits: -1,
  },
];

export const getPlanById = (planId: string): Plan | undefined => {
  return PLANS.find((plan) => plan.id === planId);
};

export const getPlanByProductId = (productId: string): Plan | undefined => {
  return PLANS.find((plan) => plan.productId === productId);
};

export const getPlanByPriceId = (priceId: string): Plan | undefined => {
  return PLANS.find((plan) => plan.priceIdMonthly === priceId || plan.priceIdYearly === priceId);
};
