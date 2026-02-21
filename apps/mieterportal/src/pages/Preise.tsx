import { useState } from "react";
import { Check, Zap, Shield, Crown } from "lucide-react";
import { PLANS_LIST, type Plan } from "../lib/credits";
import { createCheckoutSession } from "../lib/stripe";
import { supabase } from "../lib/supabase";

const PLAN_ICONS: Record<string, React.ElementType> = {
  free: Zap,
  mieter_checker_basis: Shield,
  mieter_checker_premium: Crown,
};

export default function Preise() {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formatPrice = (cents: number): string => {
    return (cents / 100).toFixed(2).replace(".", ",") + " \u20AC";
  };

  const handleSubscribe = async (plan: Plan) => {
    if (plan.id === "free") return;

    const priceId =
      billingInterval === "monthly"
        ? plan.stripePriceIdMonthly
        : plan.stripePriceIdYearly;

    if (!priceId) {
      setError("Dieser Plan ist noch nicht verfuegbar.");
      return;
    }

    setLoadingPlan(plan.id);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const url = await createCheckoutSession(
        priceId,
        user?.id || "",
        user?.email || "",
        plan.id
      );

      if (url) {
        window.location.href = url;
      } else {
        throw new Error("Keine Checkout-URL erhalten");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err instanceof Error ? err.message : "Fehler beim Starten der Zahlung.");
      setLoadingPlan(null);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Mieter-Checker Preise
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Pruefe deine Rechte als Mieter mit unseren 10 Mietrecht-Checkern.
            Starte kostenlos und upgrade bei Bedarf.
          </p>

          {/* Billing Toggle */}
          <div className="mt-6 flex justify-center items-center gap-3">
            <button
              onClick={() => setBillingInterval("monthly")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                billingInterval === "monthly"
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Monatlich
            </button>
            <button
              onClick={() => setBillingInterval("yearly")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                billingInterval === "yearly"
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Jaehrlich
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                -16%
              </span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
            {error}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS_LIST.map((plan) => {
            const Icon = PLAN_ICONS[plan.id] || Zap;
            const highlighted = plan.highlight;

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-xl border-2 p-6 flex flex-col ${
                  highlighted
                    ? "border-emerald-500 shadow-lg"
                    : "border-gray-200"
                }`}
              >
                {highlighted && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-emerald-500 text-white text-sm font-medium px-3 py-1 rounded-full">
                      Empfohlen
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-50 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-gray-500 text-sm mt-1">{plan.description}</p>
                </div>

                <div className="text-center mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price === 0
                      ? "0 \u20AC"
                      : formatPrice(
                          billingInterval === "monthly" ? plan.price : plan.yearlyPrice
                        )}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-500 ml-1">
                      /{billingInterval === "monthly" ? "Monat" : "Jahr"}
                    </span>
                  )}
                </div>

                <div className="text-center mb-6 p-3 bg-gray-50 rounded-lg">
                  <span className="text-lg font-semibold text-emerald-600">
                    {plan.monthlyCredits}
                  </span>
                  <span className="text-gray-600 ml-1">
                    {plan.monthlyCredits === 1 ? "Credit" : "Credits"}/Monat
                  </span>
                </div>

                <ul className="space-y-3 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={plan.id === "free" || loadingPlan === plan.id}
                  className={`mt-6 w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    plan.id === "free"
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : highlighted
                      ? "bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                      : "bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                  }`}
                >
                  {plan.id === "free"
                    ? "Aktueller Plan"
                    : loadingPlan === plan.id
                    ? "Wird geladen..."
                    : "Jetzt starten"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
