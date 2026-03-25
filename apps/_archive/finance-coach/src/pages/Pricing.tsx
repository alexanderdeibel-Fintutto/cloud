import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { createCheckoutSession } from "@fintutto/shared";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "0",
    period: "fuer immer",
    productKey: "",
    stripePriceId: "",
    features: [
      "Kontostand-Dashboard",
      "3 Budget-Kategorien",
      "1 Sparziel",
      "3 Basis-Insights/Monat",
    ],
    cta: "Kostenlos starten",
    highlight: false,
  },
  {
    id: "premium",
    name: "Premium",
    price: "4,99",
    period: "/Monat",
    productKey: "fintutto_finance_coach_premium",
    stripePriceId: import.meta.env.VITE_STRIPE_PRICE_FINANCE_COACH_PREMIUM || "",
    features: [
      "Alles aus Free",
      "Unbegrenzte Budget-Kategorien",
      "Unbegrenzte Sparziele",
      "Multi-Bank-Anbindung",
      "KI-Insights (unbegrenzt)",
      "Cashflow-Prognose",
      "30 KI-Nachrichten/Monat",
    ],
    cta: "Premium starten",
    highlight: true,
    badge: "Beliebt",
  },
  {
    id: "forecast",
    name: "AI Forecast",
    price: "+2,99",
    period: "/Monat Add-on",
    productKey: "fintutto_ai_forecast_addon",
    stripePriceId: import.meta.env.VITE_STRIPE_PRICE_AI_FORECAST_ADDON || "",
    features: [
      "Alles aus Premium",
      "KI-Cashflow-Prognose",
      "Steuer-Spar-Analyse",
      "Investment-Empfehlungen",
      "Persoenlicher KI-Coach",
      "Unbegrenzt KI-Nachrichten",
    ],
    cta: "Add-on aktivieren",
    highlight: false,
  },
];

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (plan: typeof PLANS[number]) => {
    if (!plan.stripePriceId) {
      // Free plan - just redirect to register or dashboard
      if (user) {
        navigate("/dashboard");
      } else {
        navigate("/register");
      }
      return;
    }

    if (!user) {
      navigate("/register");
      return;
    }

    setLoadingPlan(plan.id);
    try {
      const url = await createCheckoutSession({
        priceId: plan.stripePriceId,
        userId: user.id,
        userEmail: user.email || "",
        tierId: plan.id,
        productKey: plan.productKey,
        successUrl: `${window.location.origin}/dashboard?upgraded=true`,
        cancelUrl: `${window.location.origin}/preise`,
      });
      window.location.href = url;
    } catch (err) {
      console.error("Checkout error:", err);
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-20 max-w-5xl">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Finance Coach</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Dein KI-Finanzcoach
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Budgetplanung, Sparziele und personalisierte KI-Insights fuer bessere Finanzentscheidungen.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <Card key={plan.name} className={plan.highlight ? "border-primary/50 relative" : ""}>
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    {plan.badge}
                  </span>
                </div>
              )}
              <CardContent className="p-7">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black">{plan.price}{"\u20ac"}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>

                <div className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full"
                  variant={plan.highlight ? "default" : "outline"}
                  disabled={loadingPlan === plan.id}
                  onClick={() => handleSubscribe(plan)}
                >
                  {loadingPlan === plan.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Weiterleitung...
                    </>
                  ) : (
                    plan.cta
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button variant="link" asChild>
            <Link to="/login">Bereits registriert? Einloggen</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
