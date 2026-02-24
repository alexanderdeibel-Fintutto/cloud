// Stripe Pricing Configuration
// Now driven by Supabase `products` table - this file only provides types and helpers

export type PlanId = string; // e.g. 'free', 'basic', 'pro', 'business' or product name

export interface PricingPlan {
  id: string;
  appId: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  priceIdMonthly: string | null;
  priceIdYearly: string | null;
  features: string[];
  highlighted?: boolean;
  sortOrder: number;
}

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
};

/** Convert a DB product row to a PricingPlan */
export const productToPricingPlan = (p: {
  id: string;
  app_id: string;
  name: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number;
  stripe_price_id_monthly: string | null;
  stripe_price_id_yearly: string | null;
  features: string[] | Record<string, unknown>;
  sort_order: number | null;
}): PricingPlan => ({
  id: p.id,
  appId: p.app_id,
  name: p.name,
  description: p.description || '',
  priceMonthly: p.price_monthly,
  priceYearly: p.price_yearly,
  priceIdMonthly: p.stripe_price_id_monthly,
  priceIdYearly: p.stripe_price_id_yearly,
  features: Array.isArray(p.features) ? p.features : [],
  highlighted: (p.sort_order ?? 0) === 2, // second paid tier is highlighted
  sortOrder: p.sort_order ?? 0,
});
