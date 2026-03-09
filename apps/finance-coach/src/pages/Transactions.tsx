import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppLayout } from "@/components/AppLayout";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowDownLeft, ArrowUpRight, Plus, Search, Download,
  Info, Loader2, Filter,
} from "lucide-react";
import { formatEuro } from "@fintutto/shared";
import { useFinanceData, type FinanceTransaction } from "@/hooks/useFinanceData";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const CATEGORIES = [
  "Gehalt", "Wohnen", "Lebensmittel", "Mobilitaet", "Abos",
  "Freizeit", "Gesundheit", "Kleidung", "Bildung", "Sonstiges",
];

interface TxForm {
  amount: string;
  direction: "inflow" | "outflow";
  category: string;
  merchant: string;
  description: string;
  occurred_at: string;
}

const EMPTY_FORM: TxForm = {
  amount: "", direction: "outflow", category: "",
  merchant: "", description: "",
  occurred_at: new Date().toISOString().split("T")[0],
};

function exportCSV(transactions: FinanceTransaction[]) {
  const header = "Datum;Typ;Kategorie;Haendler;Beschreibung;Betrag\n";
  const rows = transactions.map((t) =>
    [
      t.occurred_at,
      t.direction === "inflow" ? "Einnahme" : "Ausgabe",
      t.category || "",
      t.merchant || "",
      t.description || "",
      t.amount.toFixed(2).replace(".", ","),
    ].join(";")
  ).join("\n");

  const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `transaktionen_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Transactions() {
  const { user } = useAuth();
  const { transactions, loading, usingMock, refresh } = useFinanceData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<TxForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterDir, setFilterDir] = useState<"all" | "inflow" | "outflow">("all");

  const filtered = useMemo(() => {
    let list = transactions;
    if (filterDir !== "all") list = list.filter((t) => t.direction === filterDir);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((t) =>
        (t.merchant?.toLowerCase().includes(q)) ||
        (t.description?.toLowerCase().includes(q)) ||
        (t.category?.toLowerCase().includes(q))
      );
    }
    return list;
  }, [transactions, filterDir, search]);

  const totalInflow = filtered.filter((t) => t.direction === "inflow").reduce((s, t) => s + Number(t.amount), 0);
  const totalOutflow = filtered.filter((t) => t.direction === "outflow").reduce((s, t) => s + Number(t.amount), 0);

  function openCreate() {
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!user || !form.amount) return;
    setSaving(true);

    await supabase.from("finance_transactions").insert({
      user_id: user.id,
      amount: parseFloat(form.amount),
      direction: form.direction,
      category: form.category || null,
      merchant: form.merchant || null,
      description: form.description || null,
      occurred_at: form.occurred_at,
    });

    setSaving(false);
    setDialogOpen(false);
    refresh();
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Transaktionen</h1>
            <p className="text-muted-foreground mt-1">{filtered.length} Transaktionen</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => exportCSV(filtered)} disabled={filtered.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button onClick={openCreate} disabled={!user}>
              <Plus className="h-4 w-4 mr-2" />
              Transaktion
            </Button>
          </div>
        </div>

        {usingMock && !loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-2.5">
            <Info className="h-4 w-4 shrink-0" />
            <span>Beispieldaten - erstelle Transaktionen, um loszulegen.</span>
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-5 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Einnahmen</p>
              <p className="text-2xl font-bold text-green-400">{formatEuro(totalInflow)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Ausgaben</p>
              <p className="text-2xl font-bold text-red-400">{formatEuro(totalOutflow)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Suche nach Haendler, Beschreibung..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex border border-input rounded-md overflow-hidden">
            {[
              { key: "all" as const, label: "Alle" },
              { key: "inflow" as const, label: "Einnahmen" },
              { key: "outflow" as const, label: "Ausgaben" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterDir(f.key)}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  filterDir === f.key
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent text-muted-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        <Card>
          <CardContent className="p-0 divide-y divide-border/50">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                Keine Transaktionen gefunden.
              </div>
            ) : (
              filtered.map((tx) => (
                <div key={tx.id} className="flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                    tx.direction === "inflow" ? "bg-green-500/10" : "bg-red-500/10"
                  }`}>
                    {tx.direction === "inflow"
                      ? <ArrowDownLeft className="h-5 w-5 text-green-400" />
                      : <ArrowUpRight className="h-5 w-5 text-red-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {tx.merchant || tx.description || "Transaktion"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tx.category && <span className="mr-2">{tx.category}</span>}
                      {new Date(tx.occurred_at).toLocaleDateString("de-DE", {
                        day: "2-digit", month: "short",
                      })}
                    </p>
                  </div>
                  <p className={`font-semibold tabular-nums ${
                    tx.direction === "inflow" ? "text-green-400" : "text-red-400"
                  }`}>
                    {tx.direction === "inflow" ? "+" : "-"}{formatEuro(Number(tx.amount))}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Transaction Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neue Transaktion</DialogTitle>
            <DialogDescription>Erfasse eine neue Einnahme oder Ausgabe.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Direction Toggle */}
            <div className="flex border border-input rounded-md overflow-hidden">
              <button
                onClick={() => setForm({ ...form, direction: "outflow" })}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  form.direction === "outflow" ? "bg-red-500/15 text-red-400" : "text-muted-foreground hover:bg-accent"
                }`}
              >
                Ausgabe
              </button>
              <button
                onClick={() => setForm({ ...form, direction: "inflow" })}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  form.direction === "inflow" ? "bg-green-500/15 text-green-400" : "text-muted-foreground hover:bg-accent"
                }`}
              >
                Einnahme
              </button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tx-amount">Betrag (EUR)</Label>
              <Input
                id="tx-amount" type="number" min="0.01" step="0.01"
                placeholder="z.B. 42.50"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tx-cat">Kategorie</Label>
                <select
                  id="tx-cat"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="">Waehlen...</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tx-date">Datum</Label>
                <Input
                  id="tx-date" type="date"
                  value={form.occurred_at}
                  onChange={(e) => setForm({ ...form, occurred_at: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tx-merchant">Haendler / Quelle</Label>
              <Input
                id="tx-merchant"
                placeholder="z.B. REWE, Arbeitgeber"
                value={form.merchant}
                onChange={(e) => setForm({ ...form, merchant: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tx-desc">Beschreibung (optional)</Label>
              <Input
                id="tx-desc"
                placeholder="z.B. Wocheneinkauf"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleSave} disabled={saving || !form.amount}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
