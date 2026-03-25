import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/AppLayout";
import { Plus, Edit2, Trash2, Info } from "lucide-react";
import { formatEuro } from "@fintutto/shared";
import { useFinanceData, computeBudgetSpent } from "@/hooks/useFinanceData";

export default function Budget() {
  const { budgets, transactions, loading, usingMock } = useFinanceData();
  const budgetItems = computeBudgetSpent(budgets, transactions);

  const totalBudget = budgetItems.reduce((sum, b) => sum + b.budget, 0);
  const totalSpent = budgetItems.reduce((sum, b) => sum + b.spent, 0);
  const remaining = totalBudget - totalSpent;

  const currentMonth = new Date().toLocaleDateString("de-DE", { month: "long", year: "numeric" });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Budget</h1>
            <p className="text-muted-foreground mt-1">{currentMonth}</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Kategorie
          </Button>
        </div>

        {usingMock && !loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-2.5">
            <Info className="h-4 w-4 shrink-0" />
            <span>Beispieldaten - erstelle Budget-Kategorien, um loszulegen.</span>
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Gesamt-Budget</p>
              <p className="text-2xl font-bold">{formatEuro(totalBudget)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Ausgegeben</p>
              <p className="text-2xl font-bold text-red-400">{formatEuro(totalSpent)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Verbleibend</p>
              <p className={`text-2xl font-bold ${remaining >= 0 ? "text-green-400" : "text-red-400"}`}>
                {formatEuro(remaining)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Budget Categories */}
        <div className="grid md:grid-cols-2 gap-4">
          {budgetItems.map((category) => {
            const percent = category.budget > 0 ? Math.min((category.spent / category.budget) * 100, 100) : 0;
            const isOver = category.spent > category.budget;

            return (
              <Card key={category.label}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${category.color}`} />
                      <h3 className="font-semibold">{category.label}</h3>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm mb-2">
                    <span className={isOver ? "text-red-400 font-medium" : "text-muted-foreground"}>
                      {formatEuro(category.spent)} ausgegeben
                    </span>
                    <span className="text-muted-foreground">von {formatEuro(category.budget)}</span>
                  </div>

                  <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isOver ? "bg-red-500" : category.color}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <p className="text-xs text-muted-foreground mt-2">
                    {isOver
                      ? `${formatEuro(category.spent - category.budget)} ueber Budget`
                      : `${formatEuro(category.budget - category.spent)} verbleibend`
                    }
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
