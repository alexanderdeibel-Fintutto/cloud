import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { BIZ_PLANS, type BizPlan } from "@/config/plans";
import { createCheckoutSession } from "@fintutto/shared";
import { formatEuro } from "@/lib/utils";
import {
  Briefcase,
  Check,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectPlan = async (plan: BizPlan) => {
    if (!user) {
      navigate("/register");
      return;
    }

    if (plan.id === "starter") return;

    await createCheckout(plan);
  };

  const createCheckout = async (plan: BizPlan) => {
    if (!user) return;

    setCheckoutLoading(plan.id);
    setError(null);

    try {
      const priceId = billingPeriod === "monthly" ? plan.priceIdMonthly : plan.priceIdYearly;
      if (!priceId) {
        setError("Dieser Plan ist noch nicht verfuegbar.");
        setCheckoutLoading(null);
        return;
      }

      const url = await createCheckoutSession({
        priceId,
        userId: user.id,
        userEmail: user.email || "",
        tierId: plan.id,
        productKey: plan.productKey,
        successUrl: `${window.location.origin}/payment-success`,
        cancelUrl: `${window.location.origin}/preise`,
      });
      window.location.href = url;
    } catch (err) {
      console.error("Checkout error:", err);
      setError("Checkout konnte nicht gestartet werden.");
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <Briefcase className="h-8 w-8 text-primary" />
            <span className="text-lg font-bold text-white">Fintutto Biz</span>
          </div>
          {!user && (
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-white"
              >
                Anmelden
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Registrieren
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-4">Waehlen Sie Ihren Plan</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Starten Sie kostenlos und upgraden Sie, wenn Ihr Geschaeft waechst.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-1">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                billingPeriod === "monthly"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              Monatlich
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                billingPeriod === "yearly"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              Jaehrlich
              <span className="ml-1 text-xs text-green-400">-20%</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="max-w-4xl mx-auto mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {BIZ_PLANS.map((plan) => {
            const price = billingPeriod === "monthly" ? plan.priceMonthly : plan.priceYearly / 12;
            const isPopular = plan.popular;
            const isFree = plan.priceMonthly === 0;

            return (
              <div
                key={plan.id}
                className={`relative rounded-xl border p-6 ${
                  isPopular
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-white/10 bg-white/5"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      <Sparkles className="h-3 w-3" />
                      Beliebt
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                </div>

                <div className="mb-6">
                  {isFree ? (
                    <p className="text-3xl font-bold text-white">Kostenlos</p>
                  ) : (
                    <div>
                      <span className="text-3xl font-bold text-white">
                        {formatEuro(Math.round(price * 100) / 100)}
                      </span>
                      <span className="text-sm text-muted-foreground">/Monat</span>
                      {billingPeriod === "yearly" && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatEuro(plan.priceYearly)}/Jahr
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={checkoutLoading === plan.id || isFree}
                  className={`w-full rounded-md px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                    isPopular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : isFree
                        ? "border border-white/10 bg-white/5 text-muted-foreground cursor-default"
                        : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  {checkoutLoading === plan.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  ) : isFree ? (
                    "Aktueller Plan"
                  ) : (
                    "Jetzt upgraden"
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Haeufige Fragen</h2>
          <div className="space-y-6">
            <FaqItem
              question="Kann ich meinen Plan jederzeit aendern?"
              answer="Ja, Sie koennen jederzeit upgraden. Bei einem Upgrade wird der neue Preis anteilig berechnet."
            />
            <FaqItem
              question="Wie funktioniert die Abrechnung?"
              answer="Die Abrechnung erfolgt monatlich oder jaehrlich im Voraus. Bei jaehrlicher Zahlung sparen Sie 20%."
            />
            <FaqItem
              question="Was passiert wenn ich kuendige?"
              answer="Ihr Zugang bleibt bis zum Ende der bezahlten Periode aktiv. Ihre Daten werden nicht geloescht."
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <h3 className="font-semibold text-white mb-2">{question}</h3>
      <p className="text-sm text-muted-foreground">{answer}</p>
    </div>
  );
}
