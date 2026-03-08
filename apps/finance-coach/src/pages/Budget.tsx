import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppLayout } from "@/components/AppLayout";
import { Progress } from "@/components/ui/progress";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { formatEuro } from "@fintutto/shared";

interface BudgetCategory {
  id: string;
  name: string;
  budget: number;
  spent: number;
  color: string;
}

const INITIAL_BUDGETS: BudgetCategory[] = [
  { id: "1", name: "Wohnen", budget: 900, spent: 850, color: "bg-blue-500" },
  { id: "2", name: "Lebensmittel", budget: 400, spent: 340, color: "bg-green-500" },
  { id: "3", name: "Mobilitaet", budget: 200, spent: 180, color: "bg-amber-500" },
  { id: "4", name: "Abos & Streaming", budget: 50, spent: 39.97, color: "bg-purple-500" },
  { id: "5", name: "Freizeit", budget: 150, spent: 87, color: "bg-pink-500" },
  { id: "6", name: "Kleidung", budget: 100, spent: 0, color: "bg-cyan-500" },
  { id: "7", name: "Gesundheit", budget: 80, spent: 45, color: "bg-red-500" },
  { id: "8", name: "Sparen", budget: 500, spent: 500, color: "bg-emerald-500" },
];

export default function Budget() {
  const [budgets] = useState<BudgetCategory[]>(INITIAL_BUDGETS);

  const totalBudget = budgets.reduce((sum, b) => sum + b.budget, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const remaining = totalBudget - totalSpent;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Budget</h1>
            <p className="text-muted-foreground mt-1">Maerz 2026</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Kategorie
          </Button>
        </div>

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
          {budgets.map((category) => {
            const percent = Math.min((category.spent / category.budget) * 100, 100);
            const isOver = category.spent > category.budget;

            return (
              <Card key={category.id}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${category.color}`} />
                      <h3 className="font-semibold">{category.name}</h3>
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
