export interface BizPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  priceIdMonthly: string;
  priceIdYearly: string;
  productKey: string; // maps to STRIPE_PRODUCT_ENTITLEMENTS
  features: string[];
  limits: { invoicesPerMonth: number };
  popular?: boolean;
}

function getEnv(key: string, fallback: string = ""): string {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env[key] || fallback;
  }
  return fallback;
}

export const BIZ_PLANS: BizPlan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Zum Ausprobieren",
    priceMonthly: 0,
    priceYearly: 0,
    priceIdMonthly: "",
    priceIdYearly: "",
    productKey: "",
    features: [
      "3 Rechnungen pro Monat",
      "Basis-Dashboard",
      "Ausgaben erfassen",
      "1 Kunde",
    ],
    limits: { invoicesPerMonth: 3 },
  },
  {
    id: "pro",
    name: "Pro",
    description: "Fuer aktive Freelancer",
    priceMonthly: 19.99,
    priceYearly: 191.90,
    priceIdMonthly: getEnv("VITE_STRIPE_PRICE_BIZ_PRO_MONTHLY"),
    priceIdYearly: getEnv("VITE_STRIPE_PRICE_BIZ_PRO_YEARLY"),
    productKey: "fintutto_biz_pro",
    features: [
      "Unbegrenzte Rechnungen",
      "Unbegrenzte Kunden",
      "Steuer-Reports (EUeR)",
      "PDF-Export",
      "Banking-Sync",
      "Ausgaben-Kategorien",
    ],
    limits: { invoicesPerMonth: -1 },
    popular: true,
  },
  {
    id: "ai_cfo",
    name: "AI CFO",
    description: "KI-gestuetzte Finanzsteuerung",
    priceMonthly: 39.99,
    priceYearly: 383.90,
    priceIdMonthly: getEnv("VITE_STRIPE_PRICE_BIZ_AI_CFO_MONTHLY"),
    priceIdYearly: getEnv("VITE_STRIPE_PRICE_BIZ_AI_CFO_YEARLY"),
    productKey: "fintutto_biz_ai_cfo",
    features: [
      "Alles aus Pro",
      "KI-Cashflow-Prognose (90 Tage)",
      "Steueroptimierungs-Tipps",
      "Automatische Kategorisierung",
      "Wachstumsplanung",
      "Priority Support",
    ],
    limits: { invoicesPerMonth: -1 },
  },
];

export const getBizPlanById = (id: string) => BIZ_PLANS.find((p) => p.id === id);
