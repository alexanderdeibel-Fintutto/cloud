import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/AppLayout";
import { EntitlementGate } from "@/components/EntitlementGate";
import {
  Brain, TrendingUp, TrendingDown, AlertTriangle,
  Lightbulb, ArrowRight, Sparkles, Shield
} from "lucide-react";

const INSIGHTS = [
  {
    id: "1",
    type: "warning" as const,
    title: "Lebensmittel-Ausgaben steigen",
    description: "Du gibst 14% mehr fuer Lebensmittel aus als im Vormonat. Das sind ca. 47 EUR mehr. Tipp: Plane einen Meal-Prep Tag pro Woche ein.",
    icon: AlertTriangle,
    iconColor: "text-amber-400",
    bgColor: "bg-amber-500/10",
    free: true,
  },
  {
    id: "2",
    type: "tip" as const,
    title: "Abo-Optimierung moeglich",
    description: "Du zahlst fuer 3 Streaming-Dienste (39,97 EUR/Monat). Netflix wird seit 2 Monaten nicht genutzt. Kuendigung spart 12,99 EUR/Monat.",
    icon: Lightbulb,
    iconColor: "text-blue-400",
    bgColor: "bg-blue-500/10",
    free: true,
  },
  {
    id: "3",
    type: "positive" as const,
    title: "Sparquote ueberdurchschnittlich",
    description: "Deine Sparquote liegt bei 33% - deutlich ueber dem Durchschnitt von 11%. Weiter so!",
    icon: TrendingUp,
    iconColor: "text-green-400",
    bgColor: "bg-green-500/10",
    free: true,
  },
  {
    id: "4",
    type: "forecast" as const,
    title: "Cashflow-Prognose April",
    description: "Basierend auf deinen Mustern: Erwartete Einnahmen 3.200 EUR, Ausgaben ca. 2.300 EUR. Versicherungsbeitraege (Quartal) erhoehen die Ausgaben um ca. 180 EUR.",
    icon: Brain,
    iconColor: "text-purple-400",
    bgColor: "bg-purple-500/10",
    free: false,
  },
  {
    id: "5",
    type: "investment" as const,
    title: "Tagesgeld-Empfehlung",
    description: "Dein Notgroschen waechst gut. Bei 3.400 EUR auf dem Girokonto lohnt sich ein Tagesgeldkonto: Aktuell bis 3,5% Zinsen moeglich = ca. 119 EUR/Jahr extra.",
    icon: Sparkles,
    iconColor: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    free: false,
  },
  {
    id: "6",
    type: "tax" as const,
    title: "Steuerspar-Potenzial",
    description: "Du koenntest deine Mobilitaetskosten (Pendlerpauschale) und Homeoffice-Tage steuerlich geltend machen. Geschaetzte Erstattung: 340 EUR.",
    icon: Shield,
    iconColor: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    free: false,
  },
];

function InsightCard({ insight }: { insight: typeof INSIGHTS[number] }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex gap-4">
          <div className={`h-10 w-10 rounded-xl ${insight.bgColor} flex items-center justify-center shrink-0`}>
            <insight.icon className={`h-5 w-5 ${insight.iconColor}`} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">{insight.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{insight.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Insights() {
  const freeInsights = INSIGHTS.filter((i) => i.free);
  const premiumInsights = INSIGHTS.filter((i) => !i.free);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            KI-Insights
          </h1>
          <p className="text-muted-foreground mt-1">
            Personalisierte Finanz-Tipps basierend auf deinen Daten
          </p>
        </div>

        {/* Free Insights */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Aktuelle Empfehlungen</h2>
          {freeInsights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>

        {/* Premium Insights - gated */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            Premium Insights
            <Sparkles className="h-4 w-4 text-primary" />
          </h2>
          <EntitlementGate featureKey="finance_ai_insights">
            {premiumInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </EntitlementGate>
        </div>
      </div>
    </AppLayout>
  );
}
