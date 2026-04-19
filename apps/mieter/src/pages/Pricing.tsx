import { useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription, PLANS, PlanId } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const PLAN_FEATURES: Record<PlanId, string[]> = {
  free: [
    "Dashboard-Übersicht",
    "1 Mängelmeldung/Monat",
    "Basis-Zählerablesung",
  ],
  basic: [
    "Alles aus Free",
    "Unbegrenzte Mängelmeldungen",
    "Dokumenten-Verwaltung",
    "E-Mail Support",
  ],
  pro: [
    "Alles aus Basic",
    "Prioritäts-Support",
    "Finanz-Übersicht",
    "Chat mit Hausverwaltung",
    "Automatische Erinnerungen",
  ],
};

export default function Pricing() {
  const { user, session } = useAuth();
  const { plan: currentPlan, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);

  const handleSelectPlan = async (planId: PlanId) => {
    if (!user || !session) {
      navigate("/registrieren");
      return;
    }

    if (planId === "free" || planId === currentPlan) {
      return;
    }

    // For downgrade or manage subscription
    if (currentPlan !== "free" && PLAN_ORDER.indexOf(planId) < PLAN_ORDER.indexOf(currentPlan as PlanId)) {
      await handleManageSubscription();
      return;
    }

    const priceId = isYearly 
      ? PLANS[planId].price_id_yearly 
      : PLANS[planId].price_id_monthly;

    if (!priceId) {
      toast.error("Dieser Plan ist derzeit nicht verfügbar");
      return;
    }

    setLoadingPlan(planId);
    
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Fehler beim Starten des Checkouts";
      toast.error(message);
      if (import.meta.env.DEV) {
        console.error("Checkout error:", err);
      }
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    if (!session) return;

    try {
      const { data, error } = await supabase.functions.invoke("customer-portal", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Fehler beim Öffnen des Kundenportals";
      toast.error(message);
    }
  };

  const PLAN_ORDER: PlanId[] = ["free", "basic", "pro"];

  const getButtonProps = (planId: PlanId) => {
    if (!user) {
      return { text: "Registrieren", variant: "default" as const, disabled: false };
    }
    if (planId === currentPlan) {
      return { text: "Aktueller Plan", variant: "outline" as const, disabled: true };
    }
    if (planId === "free") {
      return { text: "Kostenlos", variant: "outline" as const, disabled: true };
    }
    if (currentPlan !== "free" && PLAN_ORDER.indexOf(planId) < PLAN_ORDER.indexOf(currentPlan as PlanId)) {
      return { text: "Downgrade", variant: "outline" as const, disabled: false };
    }
    return { text: "Upgrade", variant: "default" as const, disabled: false };
  };

  return (
    <MobileLayout showNav={false}>
      {/* Header */}
      <div className="gradient-primary px-4 pt-12 pb-8">
        <h1 className="text-2xl font-bold text-white">Wählen Sie Ihren Plan</h1>
        <p className="text-white/80 mt-1">Flexibel upgraden oder downgraden</p>
      </div>

      <div className="px-4 -mt-4 space-y-6 pb-8">
        {/* Billing Toggle */}
        <Card className="shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-4">
              <Label htmlFor="billing" className={!isYearly ? "font-semibold" : "text-muted-foreground"}>
                Monatlich
              </Label>
              <Switch
                id="billing"
                checked={isYearly}
                onCheckedChange={setIsYearly}
              />
              <Label htmlFor="billing" className={isYearly ? "font-semibold" : "text-muted-foreground"}>
                Jährlich
                <span className="ml-1 text-xs text-green-600 font-medium">-20%</span>
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Cards */}
        <div className="space-y-4">
          {PLAN_ORDER.map((planId) => {
            const plan = PLANS[planId];
            const features = PLAN_FEATURES[planId];
            const { text, variant, disabled } = getButtonProps(planId);
            const isCurrentPlan = planId === currentPlan;
            const price = isYearly ? plan.price_yearly / 12 : plan.price_monthly;
            const isLoading = loadingPlan === planId;

            return (
              <Card 
                key={planId} 
                className={`shadow-lg transition-all ${
                  isCurrentPlan 
                    ? "ring-2 ring-primary border-primary" 
                    : planId === "pro" 
                      ? "ring-1 ring-yellow-400/50" 
                      : ""
                }`}
              >
                {planId === "pro" && (
                  <div className="bg-yellow-400 text-yellow-900 text-xs font-semibold px-3 py-1 text-center">
                    <Sparkles className="inline h-3 w-3 mr-1" />
                    BELIEBT
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    {isCurrentPlan && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                        Ihr Plan
                      </span>
                    )}
                  </div>
                  <CardDescription>
                    <span className="text-3xl font-bold text-foreground">
                      {price.toFixed(2).replace(".", ",")} €
                    </span>
                    <span className="text-muted-foreground">/Monat</span>
                    {isYearly && planId !== "free" && (
                      <span className="block text-xs text-green-600 mt-1">
                        Spare {((plan.price_monthly * 12 - plan.price_yearly) / (plan.price_monthly * 12) * 100).toFixed(0)}% jährlich
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={variant}
                    className="w-full"
                    disabled={disabled || isLoading || subLoading}
                    onClick={() => handleSelectPlan(planId)}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Wird geladen...
                      </>
                    ) : (
                      text
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Manage Subscription Link */}
        {user && currentPlan !== "free" && (
          <div className="text-center">
            <Button variant="link" onClick={handleManageSubscription}>
              Abo verwalten oder kündigen
            </Button>
          </div>
        )}

        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="w-full" 
          onClick={() => navigate(-1)}
        >
          Zurück
        </Button>
      </div>
    </MobileLayout>
  );
}
