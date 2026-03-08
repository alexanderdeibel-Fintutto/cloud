import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, GraduationCap, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const PLANS = [
  {
    name: "Free",
    price: "0",
    period: "fuer immer",
    features: [
      "2 kostenlose Grundlagen-Kurse",
      "Erste Lektionen aller Kurse",
      "Lern-Dashboard",
      "Community-Zugang",
    ],
    cta: "Kostenlos starten",
    highlight: false,
  },
  {
    name: "Premium",
    price: "4,99",
    period: "/Monat",
    features: [
      "Alle Kurse freigeschaltet",
      "Zertifikate nach Abschluss",
      "KI-Tutor fuer Fragen",
      "Offline-Modus",
      "20 KI-Nachrichten/Monat",
      "Bevorzugter Support",
    ],
    cta: "Premium starten",
    highlight: true,
    badge: "Beliebt",
  },
  {
    name: "Kursbundle",
    price: "29,99",
    period: "einmalig",
    features: [
      "Alle Kurse dauerhaft freigeschaltet",
      "Alle Zertifikate",
      "Lebenslanger Zugang",
      "Zukuenftige Kurse inklusive",
    ],
    cta: "Bundle kaufen",
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-20 max-w-5xl">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 mb-6">
            <GraduationCap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Finance Mentor</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Finanzwissen aufbauen
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Kurse zu Budgetierung, Investieren, Steuern und Vorsorge - mit Zertifikaten.
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
                  <span className="text-4xl font-black">{plan.price}\u20ac</span>
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

                <Button className="w-full" variant={plan.highlight ? "default" : "outline"}>
                  {plan.cta}
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
