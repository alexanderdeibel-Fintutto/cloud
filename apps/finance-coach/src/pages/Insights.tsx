import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AppLayout } from "@/components/AppLayout";
import { EntitlementGate } from "@/components/EntitlementGate";
import {
  Brain, TrendingUp, AlertTriangle,
  Lightbulb, Sparkles, Shield, Info, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { LucideIcon } from "lucide-react";

interface Insight {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  free: boolean;
  is_read: boolean;
}

const TYPE_CONFIG: Record<string, { icon: LucideIcon; iconColor: string; bgColor: string; free: boolean }> = {
  spending_alert: { icon: AlertTriangle, iconColor: "text-amber-400", bgColor: "bg-amber-500/10", free: true },
  savings_tip: { icon: Lightbulb, iconColor: "text-blue-400", bgColor: "bg-blue-500/10", free: true },
  optimization: { icon: TrendingUp, iconColor: "text-green-400", bgColor: "bg-green-500/10", free: true },
  forecast_warning: { icon: Brain, iconColor: "text-purple-400", bgColor: "bg-purple-500/10", free: false },
  investment: { icon: Sparkles, iconColor: "text-emerald-400", bgColor: "bg-emerald-500/10", free: false },
  tax: { icon: Shield, iconColor: "text-cyan-400", bgColor: "bg-cyan-500/10", free: false },
};

const MOCK_INSIGHTS: Insight[] = [
  {
    id: "m1", type: "spending_alert", title: "Lebensmittel-Ausgaben steigen",
    description: "Du gibst 14% mehr fuer Lebensmittel aus als im Vormonat. Das sind ca. 47 EUR mehr. Tipp: Plane einen Meal-Prep Tag pro Woche ein.",
    ...TYPE_CONFIG.spending_alert, is_read: false,
  },
  {
    id: "m2", type: "savings_tip", title: "Abo-Optimierung moeglich",
    description: "Du zahlst fuer 3 Streaming-Dienste (39,97 EUR/Monat). Netflix wird seit 2 Monaten nicht genutzt. Kuendigung spart 12,99 EUR/Monat.",
    ...TYPE_CONFIG.savings_tip, is_read: false,
  },
  {
    id: "m3", type: "optimization", title: "Sparquote ueberdurchschnittlich",
    description: "Deine Sparquote liegt bei 33% - deutlich ueber dem Durchschnitt von 11%. Weiter so!",
    ...TYPE_CONFIG.optimization, is_read: true,
  },
  {
    id: "m4", type: "forecast_warning", title: "Cashflow-Prognose April",
    description: "Basierend auf deinen Mustern: Erwartete Einnahmen 3.200 EUR, Ausgaben ca. 2.300 EUR. Versicherungsbeitraege (Quartal) erhoehen die Ausgaben um ca. 180 EUR.",
    ...TYPE_CONFIG.forecast_warning, is_read: false,
  },
  {
    id: "m5", type: "investment", title: "Tagesgeld-Empfehlung",
    description: "Dein Notgroschen waechst gut. Bei 3.400 EUR auf dem Girokonto lohnt sich ein Tagesgeldkonto: Aktuell bis 3,5% Zinsen moeglich = ca. 119 EUR/Jahr extra.",
    ...TYPE_CONFIG.investment, is_read: false,
  },
  {
    id: "m6", type: "tax", title: "Steuerspar-Potenzial",
    description: "Du koenntest deine Mobilitaetskosten (Pendlerpauschale) und Homeoffice-Tage steuerlich geltend machen. Geschaetzte Erstattung: 340 EUR.",
    ...TYPE_CONFIG.tax, is_read: false,
  },
];

function useInsights() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<Insight[]>(MOCK_INSIGHTS);
  const [usingMock, setUsingMock] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetch() {
      const { data, error } = await supabase
        .from("finance_ai_insights")
        .select("id, insight_type, title, body, is_read, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error && data && data.length > 0) {
        const mapped: Insight[] = data.map((d) => {
          const cfg = TYPE_CONFIG[d.insight_type] || TYPE_CONFIG.optimization;
          return {
            id: d.id,
            type: d.insight_type,
            title: d.title,
            description: d.body,
            ...cfg,
            is_read: d.is_read,
          };
        });
        setInsights(mapped);
        setUsingMock(false);
      }
    }

    fetch();
  }, [user]);

  const markRead = async (insightId: string) => {
    if (usingMock) {
      setInsights((prev) => prev.map((i) => i.id === insightId ? { ...i, is_read: true } : i));
      return;
    }
    await supabase.from("finance_ai_insights").update({ is_read: true }).eq("id", insightId);
    setInsights((prev) => prev.map((i) => i.id === insightId ? { ...i, is_read: true } : i));
  };

  return { insights, usingMock, markRead };
}

function InsightCard({ insight, onMarkRead }: { insight: Insight; onMarkRead: (id: string) => void }) {
  return (
    <Card className={insight.is_read ? "opacity-60" : ""}>
      <CardContent className="p-5">
        <div className="flex gap-4">
          <div className={`h-10 w-10 rounded-xl ${insight.bgColor} flex items-center justify-center shrink-0`}>
            <insight.icon className={`h-5 w-5 ${insight.iconColor}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold mb-1">{insight.title}</h3>
              {!insight.is_read && (
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs shrink-0" onClick={() => onMarkRead(insight.id)}>
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Gelesen
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{insight.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Insights() {
  const { insights, usingMock, markRead } = useInsights();
  const freeInsights = insights.filter((i) => i.free);
  const premiumInsights = insights.filter((i) => !i.free);
  const unreadCount = insights.filter((i) => !i.is_read).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            KI-Insights
            {unreadCount > 0 && (
              <span className="text-sm bg-primary/20 text-primary px-2.5 py-0.5 rounded-full font-semibold">
                {unreadCount} neu
              </span>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            Personalisierte Finanz-Tipps basierend auf deinen Daten
          </p>
        </div>

        {usingMock && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-2.5">
            <Info className="h-4 w-4 shrink-0" />
            <span>Beispiel-Insights - mit echten Transaktionen werden personalisierte KI-Tipps generiert.</span>
          </div>
        )}

        {/* Free Insights */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Aktuelle Empfehlungen</h2>
          {freeInsights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} onMarkRead={markRead} />
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
              <InsightCard key={insight.id} insight={insight} onMarkRead={markRead} />
            ))}
          </EntitlementGate>
        </div>
      </div>
    </AppLayout>
  );
}
