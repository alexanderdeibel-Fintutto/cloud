import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/AppLayout";
import { Progress } from "@/components/ui/progress";
import { Plus, Target, Plane, Car, GraduationCap, Home } from "lucide-react";
import { formatEuro } from "@fintutto/shared";

const MOCK_GOALS = [
  {
    id: "1",
    name: "Notgroschen",
    target: 5000,
    saved: 3400,
    icon: Target,
    color: "from-emerald-500 to-green-600",
    monthly: 200,
    deadline: "Sep 2026",
  },
  {
    id: "2",
    name: "Urlaub Kroatien",
    target: 2000,
    saved: 800,
    icon: Plane,
    color: "from-blue-500 to-cyan-600",
    monthly: 150,
    deadline: "Jul 2026",
  },
  {
    id: "3",
    name: "Neues Auto",
    target: 15000,
    saved: 4200,
    icon: Car,
    color: "from-amber-500 to-orange-600",
    monthly: 300,
    deadline: "Dez 2027",
  },
  {
    id: "4",
    name: "Weiterbildung",
    target: 1500,
    saved: 1500,
    icon: GraduationCap,
    color: "from-purple-500 to-indigo-600",
    monthly: 0,
    deadline: "Erreicht!",
  },
];

export default function SavingsGoals() {
  const totalSaved = MOCK_GOALS.reduce((sum, g) => sum + g.saved, 0);
  const totalTarget = MOCK_GOALS.reduce((sum, g) => sum + g.target, 0);

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

        <div className="grid md:grid-cols-2 gap-6">
          {MOCK_GOALS.map((goal) => {
            const percent = Math.min((goal.saved / goal.target) * 100, 100);
            const isComplete = goal.saved >= goal.target;

            return (
              <Card key={goal.id} className={isComplete ? "border-primary/30" : ""}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${goal.color} flex items-center justify-center shadow-lg shrink-0`}>
                      <goal.icon className="h-6 w-6 text-white" />
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
                      {!isComplete && goal.monthly > 0 && (
                        <span>{formatEuro(goal.monthly)}/Monat Sparrate</span>
                      )}
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
