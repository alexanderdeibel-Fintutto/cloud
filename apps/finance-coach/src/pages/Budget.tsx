import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppLayout } from "@/components/AppLayout";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Info, Loader2 } from "lucide-react";
import { formatEuro } from "@fintutto/shared";
import { useFinanceData, computeBudgetSpent, type FinanceBudget } from "@/hooks/useFinanceData";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const CATEGORY_OPTIONS = [
  "Wohnen", "Lebensmittel", "Mobilitaet", "Abos",
  "Freizeit", "Gesundheit", "Kleidung", "Bildung", "Sonstiges",
];

interface BudgetForm {
  category: string;
  monthly_limit: string;
  alert_threshold: string;
}

const EMPTY_FORM: BudgetForm = { category: "", monthly_limit: "", alert_threshold: "80" };

export default function Budget() {
  const { user } = useAuth();
  const { budgets, transactions, loading, usingMock, refresh } = useFinanceData();
  const budgetItems = computeBudgetSpent(budgets, transactions);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<FinanceBudget | null>(null);
  const [deletingBudget, setDeletingBudget] = useState<FinanceBudget | null>(null);
  const [form, setForm] = useState<BudgetForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const totalBudget = budgetItems.reduce((sum, b) => sum + b.budget, 0);
  const totalSpent = budgetItems.reduce((sum, b) => sum + b.spent, 0);
  const remaining = totalBudget - totalSpent;

  const currentMonth = new Date().toLocaleDateString("de-DE", { month: "long", year: "numeric" });

  const usedCategories = budgets.map((b) => b.category);
  const availableCategories = editingBudget
    ? CATEGORY_OPTIONS
    : CATEGORY_OPTIONS.filter((c) => !usedCategories.includes(c));

  function openCreate() {
    setEditingBudget(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEdit(budget: FinanceBudget) {
    setEditingBudget(budget);
    setForm({
      category: budget.category,
      monthly_limit: budget.monthly_limit.toString(),
      alert_threshold: (budget.alert_threshold * 100).toString(),
    });
    setDialogOpen(true);
  }

  function openDelete(budget: FinanceBudget) {
    setDeletingBudget(budget);
    setDeleteDialogOpen(true);
  }

  async function handleSave() {
    if (!user || !form.category || !form.monthly_limit) return;
    setSaving(true);

    const row = {
      user_id: user.id,
      category: form.category,
      monthly_limit: parseFloat(form.monthly_limit),
      alert_threshold: parseFloat(form.alert_threshold) / 100,
    };

    if (editingBudget) {
      await supabase.from("finance_budgets").update(row).eq("id", editingBudget.id);
    } else {
      await supabase.from("finance_budgets").insert(row);
    }

    setSaving(false);
    setDialogOpen(false);
    refresh();
  }

  async function handleDelete() {
    if (!deletingBudget) return;
    setSaving(true);
    await supabase.from("finance_budgets").delete().eq("id", deletingBudget.id);
    setSaving(false);
    setDeleteDialogOpen(false);
    setDeletingBudget(null);
    refresh();
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Budget</h1>
            <p className="text-muted-foreground mt-1">{currentMonth}</p>
          </div>
          <Button onClick={openCreate} disabled={!user}>
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
            const sourceBudget = budgets.find((b) => b.category === category.label);

            return (
              <Card key={category.label}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${category.color}`} />
                      <h3 className="font-semibold">{category.label}</h3>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8"
                        onClick={() => sourceBudget && openEdit(sourceBudget)}
                        disabled={!sourceBudget || usingMock}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                        onClick={() => sourceBudget && openDelete(sourceBudget)}
                        disabled={!sourceBudget || usingMock}
                      >
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

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBudget ? "Kategorie bearbeiten" : "Neue Budget-Kategorie"}</DialogTitle>
            <DialogDescription>
              {editingBudget ? "Aendere das monatliche Budget fuer diese Kategorie." : "Erstelle eine neue Budget-Kategorie mit monatlichem Limit."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="category">Kategorie</Label>
              {editingBudget ? (
                <Input id="category" value={form.category} disabled />
              ) : (
                <select
                  id="category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="">Kategorie waehlen...</option>
                  {availableCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="limit">Monatliches Limit (EUR)</Label>
              <Input
                id="limit"
                type="number"
                min="0"
                step="10"
                placeholder="z.B. 500"
                value={form.monthly_limit}
                onChange={(e) => setForm({ ...form, monthly_limit: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="threshold">Warnung bei (% des Limits)</Label>
              <Input
                id="threshold"
                type="number"
                min="50"
                max="100"
                step="5"
                value={form.alert_threshold}
                onChange={(e) => setForm({ ...form, alert_threshold: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleSave} disabled={saving || !form.category || !form.monthly_limit}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingBudget ? "Speichern" : "Erstellen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kategorie loeschen</DialogTitle>
            <DialogDescription>
              Moechtest du die Budget-Kategorie &ldquo;{deletingBudget?.category}&rdquo; wirklich loeschen? Diese Aktion kann nicht rueckgaengig gemacht werden.
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
