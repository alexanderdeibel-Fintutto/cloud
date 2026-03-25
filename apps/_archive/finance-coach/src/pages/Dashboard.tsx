import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLayout } from "@/components/AppLayout";
import { Progress } from "@/components/ui/progress";
import {
  Wallet, TrendingUp, TrendingDown, PiggyBank,
  ArrowUpRight, ArrowDownRight, Brain, ExternalLink, Info
} from "lucide-react";
import { formatEuro, getUpgradeSuggestions } from "@fintutto/shared";
import { useEntitlements } from "@/hooks/useEntitlements";
import { useFinanceData, computeBudgetSpent } from "@/hooks/useFinanceData";
import { Button } from "@/components/ui/button";

const MOCK_AI_INSIGHT = {
  title: "Spar-Tipp",
  text: "Du gibst 14% mehr fuer Lebensmittel aus als im Vormonat. Versuch diese Woche einen Meal-Prep Tag einzubauen - das spart durchschnittlich 35 EUR/Woche.",
};

function CrossAppSuggestions() {
  const { entitlements } = useEntitlements();
  const userKeys = entitlements.map((e) => e.feature_key);
  const suggestions = getUpgradeSuggestions("finance-coach", userKeys, 2);

  if (suggestions.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Fintutto Oekosystem</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 gap-3">
          {suggestions.map((s) => (
            <div key={s.entitlementKey} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/30">
              <span className="text-2xl">{s.appIcon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{s.app}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{s.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-primary font-medium">{s.price}</span>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" asChild>
                    <a href={s.upgradeUrl} target="_blank" rel="noopener noreferrer">
                      Ansehen <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { transactions, budgets, stats, usingMock, loading } = useFinanceData();
  const budgetItems = computeBudgetSpent(budgets, transactions);

  // Format transaction for display
  const displayTransactions = transactions.slice(0, 5).map((tx) => ({
    id: tx.id,
    label: tx.description || tx.merchant || tx.category || "Transaktion",
    amount: tx.direction === "inflow" ? tx.amount : -tx.amount,
    type: tx.direction === "inflow" ? ("income" as const) : ("expense" as const),
    date: new Date(tx.occurred_at).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }),
    category: tx.category || "Sonstiges",
  }));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Dein Finanzueberblick auf einen Blick</p>
        </div>

        {usingMock && !loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-2.5">
            <Info className="h-4 w-4 shrink-0" />
            <span>Demodaten - fuege Transaktionen hinzu, um echte Auswertungen zu sehen.</span>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Kontostand", value: stats.balance, icon: Wallet, color: "text-blue-400" },
            { label: "Einnahmen", value: stats.income, icon: TrendingUp, color: "text-green-400" },
            { label: "Ausgaben", value: stats.expenses, icon: TrendingDown, color: "text-red-400" },
            { label: "Gespart", value: stats.savings, icon: PiggyBank, color: "text-emerald-400" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold">{formatEuro(stat.value)}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sparziel Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-primary" />
                Sparziel-Fortschritt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fortschritt</span>
                  <span className="font-semibold">{stats.savingsGoalPercent}%</span>
                </div>
                <Progress value={stats.savingsGoalPercent} />
                <p className="text-xs text-muted-foreground">
                  {formatEuro(stats.savings)} gespart diesen Monat
                </p>
              </div>
            </CardContent>
          </Card>

          {/* AI Insight */}
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                {MOCK_AI_INSIGHT.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {MOCK_AI_INSIGHT.text}
              </p>
            </CardContent>
          </Card>

          {/* Budget Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Budget-Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {budgetItems.map((cat) => (
                  <div key={cat.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span>{cat.label}</span>
                      <span className="text-muted-foreground">{formatEuro(cat.spent)} / {formatEuro(cat.budget)}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${cat.color}`}
                        style={{ width: `${Math.min((cat.spent / cat.budget) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cross-App Suggestions */}
        <CrossAppSuggestions />

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Letzte Transaktionen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {displayTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                      tx.type === "income" ? "bg-green-500/15" : "bg-red-500/15"
                    }`}>
                      {tx.type === "income"
                        ? <ArrowUpRight className="h-4 w-4 text-green-400" />
                        : <ArrowDownRight className="h-4 w-4 text-red-400" />
                      }
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tx.label}</p>
                      <p className="text-xs text-muted-foreground">{tx.category} &middot; {tx.date}</p>
                    </div>
                  </div>
                  <span className={`font-semibold text-sm ${
                    tx.type === "income" ? "text-green-400" : "text-red-400"
                  }`}>
                    {tx.type === "income" ? "+" : ""}{formatEuro(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
