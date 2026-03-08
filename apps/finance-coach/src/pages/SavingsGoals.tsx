import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/AppLayout";
import { Progress } from "@/components/ui/progress";
import { Plus, Target, Info } from "lucide-react";
import { formatEuro } from "@fintutto/shared";
import { useFinanceData } from "@/hooks/useFinanceData";

const GOAL_COLORS: Record<string, string> = {
  notfall: "from-emerald-500 to-green-600",
  urlaub: "from-blue-500 to-cyan-600",
  auto: "from-amber-500 to-orange-600",
  bildung: "from-purple-500 to-indigo-600",
  wohnung: "from-rose-500 to-pink-600",
};

function getGoalColor(title: string): string {
  const lower = title.toLowerCase();
  for (const [key, color] of Object.entries(GOAL_COLORS)) {
    if (lower.includes(key)) return color;
  }
  return "from-gray-500 to-slate-600";
}

function formatDeadline(deadline: string | null, status: string): string {
  if (status === "achieved") return "Erreicht!";
  if (!deadline) return "Kein Datum";
  return new Date(deadline).toLocaleDateString("de-DE", { month: "short", year: "numeric" });
}

export default function SavingsGoals() {
  const { goals, loading, usingMock } = useFinanceData();

  const displayGoals = goals.map((g) => ({
    id: g.id,
    name: g.title,
    target: Number(g.target_amount),
    saved: Number(g.current_amount),
    color: getGoalColor(g.title),
    deadline: formatDeadline(g.deadline, g.status),
  }));

  const totalSaved = displayGoals.reduce((sum, g) => sum + g.saved, 0);
  const totalTarget = displayGoals.reduce((sum, g) => sum + g.target, 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Sparziele</h1>
            <p className="text-muted-foreground mt-1">
              {formatEuro(totalSaved)} von {formatEuro(totalTarget)} insgesamt gespart
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Neues Ziel
          </Button>
        </div>

        {usingMock && !loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-2.5">
            <Info className="h-4 w-4 shrink-0" />
            <span>Beispieldaten - erstelle dein erstes Sparziel, um loszulegen.</span>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {displayGoals.map((goal) => {
            const percent = Math.min((goal.saved / goal.target) * 100, 100);
            const isComplete = goal.saved >= goal.target;

            return (
              <Card key={goal.id} className={isComplete ? "border-primary/30" : ""}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${goal.color} flex items-center justify-center shadow-lg shrink-0`}>
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg">{goal.name}</h3>
                        {isComplete && (
                          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold">
                            Erreicht!
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">Ziel: {goal.deadline}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">{formatEuro(goal.saved)}</span>
                      <span className="text-muted-foreground">{formatEuro(goal.target)}</span>
                    </div>
                    <Progress value={percent} />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{Math.round(percent)}% erreicht</span>
                    </div>
                  </div>

                  {!isComplete && (
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">Einzahlen</Button>
                      <Button variant="ghost" size="sm">Bearbeiten</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
