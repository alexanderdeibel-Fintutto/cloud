import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLayout } from "@/components/AppLayout";
import { Progress } from "@/components/ui/progress";
import {
  Wallet, TrendingUp, TrendingDown, PiggyBank,
  ArrowUpRight, ArrowDownRight, Brain
} from "lucide-react";
import { formatEuro } from "@fintutto/shared";

const MOCK_STATS = {
  balance: 4823.50,
  income: 3200,
  expenses: 2147.30,
  savings: 1052.70,
  savingsGoalPercent: 68,
};

const MOCK_TRANSACTIONS = [
  { id: 1, label: "Gehalt", amount: 3200, type: "income" as const, date: "01.03.2026", category: "Gehalt" },
  { id: 2, label: "Miete", amount: -850, type: "expense" as const, date: "01.03.2026", category: "Wohnen" },
  { id: 3, label: "REWE Einkauf", amount: -67.40, type: "expense" as const, date: "02.03.2026", category: "Lebensmittel" },
  { id: 4, label: "Spotify", amount: -9.99, type: "expense" as const, date: "03.03.2026", category: "Abos" },
  { id: 5, label: "Tankstelle", amount: -58.20, type: "expense" as const, date: "04.03.2026", category: "Mobilitaet" },
];

const MOCK_AI_INSIGHT = {
  title: "Spar-Tipp",
  text: "Du gibst 14% mehr fuer Lebensmittel aus als im Vormonat. Versuch diese Woche einen Meal-Prep Tag einzubauen - das spart durchschnittlich 35 EUR/Woche.",
};

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Dein Finanzueberblick auf einen Blick</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Kontostand", value: MOCK_STATS.balance, icon: Wallet, color: "text-blue-400", trend: "+2.3%" },
            { label: "Einnahmen", value: MOCK_STATS.income, icon: TrendingUp, color: "text-green-400", trend: "+3.200" },
            { label: "Ausgaben", value: MOCK_STATS.expenses, icon: TrendingDown, color: "text-red-400", trend: "-2.147" },
            { label: "Gespart", value: MOCK_STATS.savings, icon: PiggyBank, color: "text-emerald-400", trend: "+1.053" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold">{formatEuro(stat.value)}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.trend} diesen Monat</div>
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
                Sparziel Maerz
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fortschritt</span>
                  <span className="font-semibold">{MOCK_STATS.savingsGoalPercent}%</span>
                </div>
                <Progress value={MOCK_STATS.savingsGoalPercent} />
                <p className="text-xs text-muted-foreground">
                  {formatEuro(MOCK_STATS.savings)} von {formatEuro(1500)} gespart
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
                {[
                  { label: "Wohnen", spent: 850, budget: 900, color: "bg-blue-500" },
                  { label: "Lebensmittel", spent: 340, budget: 400, color: "bg-green-500" },
                  { label: "Mobilitaet", spent: 180, budget: 200, color: "bg-amber-500" },
                ].map((cat) => (
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

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Letzte Transaktionen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {MOCK_TRANSACTIONS.map((tx) => (
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
