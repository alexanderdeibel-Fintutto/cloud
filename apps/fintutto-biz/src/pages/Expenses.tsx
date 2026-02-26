import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/hooks/useBusiness";
import { formatEuro, formatDateDE } from "@/lib/utils";
import { Plus, Receipt, Search } from "lucide-react";

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  expense_date: string;
  created_at: string;
}

const CATEGORIES = [
  "Material",
  "Buero",
  "Reise",
  "Software",
  "Telefon",
  "Versicherung",
  "Fortbildung",
  "Sonstiges",
];

const CATEGORY_COLORS: Record<string, string> = {
  Material: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Buero: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Reise: "bg-green-500/10 text-green-400 border-green-500/20",
  Software: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  Telefon: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Versicherung: "bg-red-500/10 text-red-400 border-red-500/20",
  Fortbildung: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  Sonstiges: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

export default function Expenses() {
  const { business } = useBusiness();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  // Form state
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Sonstiges");
  const [description, setDescription] = useState("");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!business) return;
    fetchExpenses();
  }, [business]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("neu") === "1") {
      setShowForm(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const fetchExpenses = async () => {
    if (!business) return;

    const { data } = await supabase
      .from("biz_expenses")
      .select("*")
      .eq("business_id", business.id)
      .order("expense_date", { ascending: false });

    if (data) setExpenses(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!business || !amount || !description) return;

    setSaving(true);
    const { error } = await supabase.from("biz_expenses").insert({
      business_id: business.id,
      amount: Number(amount),
      category,
      description,
      expense_date: expenseDate,
    });

    if (!error) {
      setAmount("");
      setDescription("");
      setCategory("Sonstiges");
      setShowForm(false);
      fetchExpenses();
    }
    setSaving(false);
  };

  const filtered = expenses.filter((e) => {
    if (search && !e.description.toLowerCase().includes(search.toLowerCase()) &&
        !e.category.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalExpenses = filtered.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <MainLayout title="Ausgaben">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Ausgaben durchsuchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-md border border-white/10 bg-white/5 pl-10 pr-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Gesamt: <span className="font-semibold text-white">{formatEuro(totalExpenses)}</span>
            </span>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Ausgabe erfassen
            </button>
          </div>
        </div>

        {/* Expense List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-white">Keine Ausgaben erfasst</p>
            <p className="text-sm text-muted-foreground mt-1">
              Erfassen Sie Ihre erste Geschaeftsausgabe
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/[0.07] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                    <Receipt className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{expense.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.Sonstiges}`}>
                        {expense.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDateDE(expense.expense_date)}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="font-semibold text-white">{formatEuro(expense.amount)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expense Form Dialog */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-background p-6">
            <h2 className="text-xl font-bold text-white mb-4">Ausgabe erfassen</h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Betrag (EUR)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Kategorie</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Beschreibung</label>
                <input
                  type="text"
                  placeholder="z.B. Adobe Creative Cloud"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Datum</label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-md border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !amount || !description}
                  className="flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  Speichern
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
