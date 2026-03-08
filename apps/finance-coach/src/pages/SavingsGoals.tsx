import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppLayout } from "@/components/AppLayout";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Plus, Target, Info, Loader2, Edit2, Trash2 } from "lucide-react";
import { formatEuro } from "@fintutto/shared";
import { useFinanceData, type FinanceGoal } from "@/hooks/useFinanceData";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const GOAL_COLORS: Record<string, string> = {
  notfall: "from-emerald-500 to-green-600",
  urlaub: "from-blue-500 to-cyan-600",
  auto: "from-amber-500 to-orange-600",
  bildung: "from-purple-500 to-indigo-600",
  wohnung: "from-rose-500 to-pink-600",
  hochzeit: "from-pink-500 to-fuchsia-600",
  technik: "from-slate-500 to-gray-600",
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

interface GoalForm {
  title: string;
  target_amount: string;
  current_amount: string;
  deadline: string;
}

const EMPTY_FORM: GoalForm = { title: "", target_amount: "", current_amount: "0", deadline: "" };

export default function SavingsGoals() {
  const { user } = useAuth();
  const { goals, loading, usingMock, refresh } = useFinanceData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinanceGoal | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<FinanceGoal | null>(null);
  const [depositGoal, setDepositGoal] = useState<FinanceGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [form, setForm] = useState<GoalForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const displayGoals = goals.map((g) => ({
    id: g.id,
    name: g.title,
    target: Number(g.target_amount),
    saved: Number(g.current_amount),
    color: getGoalColor(g.title),
    deadline: formatDeadline(g.deadline, g.status),
    raw: g,
  }));

  const totalSaved = displayGoals.reduce((sum, g) => sum + g.saved, 0);
  const totalTarget = displayGoals.reduce((sum, g) => sum + g.target, 0);

  function openCreate() {
    setEditingGoal(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEdit(goal: FinanceGoal) {
    setEditingGoal(goal);
    setForm({
      title: goal.title,
      target_amount: goal.target_amount.toString(),
      current_amount: goal.current_amount.toString(),
      deadline: goal.deadline?.split("T")[0] || "",
    });
    setDialogOpen(true);
  }

  function openDeposit(goal: FinanceGoal) {
    setDepositGoal(goal);
    setDepositAmount("");
    setDepositDialogOpen(true);
  }

  function openDelete(goal: FinanceGoal) {
    setDeletingGoal(goal);
    setDeleteDialogOpen(true);
  }

  async function handleSave() {
    if (!user || !form.title || !form.target_amount) return;
    setSaving(true);

    const row = {
      user_id: user.id,
      title: form.title,
      target_amount: parseFloat(form.target_amount),
      current_amount: parseFloat(form.current_amount) || 0,
      deadline: form.deadline || null,
      status: "active" as const,
    };

    if (editingGoal) {
      await supabase.from("finance_goals").update(row).eq("id", editingGoal.id);
    } else {
      await supabase.from("finance_goals").insert(row);
    }

    setSaving(false);
    setDialogOpen(false);
    refresh();
  }

  async function handleDeposit() {
    if (!depositGoal || !depositAmount) return;
    setSaving(true);

    const newAmount = Number(depositGoal.current_amount) + parseFloat(depositAmount);
    const isAchieved = newAmount >= Number(depositGoal.target_amount);

    await supabase.from("finance_goals").update({
      current_amount: newAmount,
      status: isAchieved ? "achieved" : "active",
    }).eq("id", depositGoal.id);

    setSaving(false);
    setDepositDialogOpen(false);
    setDepositGoal(null);
    refresh();
  }

  async function handleDelete() {
    if (!deletingGoal) return;
    setSaving(true);
    await supabase.from("finance_goals").delete().eq("id", deletingGoal.id);
    setSaving(false);
    setDeleteDialogOpen(false);
    setDeletingGoal(null);
    refresh();
  }

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
          <Button onClick={openCreate} disabled={!user}>
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
                        <div className="flex items-center gap-1">
                          {isComplete && (
                            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold">
                              Erreicht!
                            </span>
                          )}
                          {!usingMock && (
                            <>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(goal.raw)}>
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => openDelete(goal.raw)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
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
                      <Button
                        variant="outline" size="sm" className="flex-1"
                        onClick={() => openDeposit(goal.raw)}
                        disabled={usingMock}
                      >
                        Einzahlen
                      </Button>
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => openEdit(goal.raw)}
                        disabled={usingMock}
                      >
                        Bearbeiten
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Create / Edit Goal Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGoal ? "Sparziel bearbeiten" : "Neues Sparziel"}</DialogTitle>
            <DialogDescription>
              {editingGoal ? "Aendere die Details deines Sparziels." : "Definiere ein neues Sparziel mit Zielbetrag und Deadline."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="goal-title">Bezeichnung</Label>
              <Input
                id="goal-title"
                placeholder="z.B. Notfallfonds, Urlaub 2026"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goal-target">Zielbetrag (EUR)</Label>
                <Input
                  id="goal-target"
                  type="number"
                  min="0"
                  step="100"
                  placeholder="5000"
                  value={form.target_amount}
                  onChange={(e) => setForm({ ...form, target_amount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-current">Bereits gespart (EUR)</Label>
                <Input
                  id="goal-current"
                  type="number"
                  min="0"
                  step="50"
                  value={form.current_amount}
                  onChange={(e) => setForm({ ...form, current_amount: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-deadline">Zieldatum (optional)</Label>
              <Input
                id="goal-deadline"
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleSave} disabled={saving || !form.title || !form.target_amount}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingGoal ? "Speichern" : "Erstellen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deposit Dialog */}
      <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Einzahlung auf &ldquo;{depositGoal?.title}&rdquo;</DialogTitle>
            <DialogDescription>
              Aktuell: {formatEuro(Number(depositGoal?.current_amount || 0))} von {formatEuro(Number(depositGoal?.target_amount || 0))}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="deposit-amount">Betrag (EUR)</Label>
              <Input
                id="deposit-amount"
                type="number"
                min="1"
                step="10"
                placeholder="z.B. 100"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDepositDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleDeposit} disabled={saving || !depositAmount || parseFloat(depositAmount) <= 0}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Einzahlen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sparziel loeschen</DialogTitle>
            <DialogDescription>
              Moechtest du das Sparziel &ldquo;{deletingGoal?.title}&rdquo; wirklich loeschen?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Abbrechen</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Loeschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
