import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { useBusinesses } from "@/hooks/useBusinesses";
import { useBuildings } from "@/hooks/useBuildings";
import { formatEuro, formatDateDE } from "@/lib/utils";
import { Plus, Receipt, Search, Building2, Brain, FileText, ExternalLink, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  occurred_at: string;
  tax_deductible: boolean;
  vat_rate: number;
  vat_amount: number;
  building_id: string | null;
  created_at: string;
}

interface SbDocument {
  id: string;
  title: string;
  file_size: number;
  created_at: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── SecondBrain Beleg-Panel ───────────────────────────────────────────────────
function SecondBrainExpensePanel({ expenseId }: { expenseId: string }) {
  const [docs, setDocs] = useState<SbDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const SB_URL = "https://secondbrain.fintutto.cloud";
  const uploadLink = `${SB_URL}/upload?context=expense&id=${expenseId}`;
  const allDocsLink = `${SB_URL}/dokumente?filter=expense:${expenseId}`;

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { data } = await supabase.rpc("get_documents_for_entity", {
          p_entity_type: "expense",
          p_entity_id: expenseId,
        });
        setDocs((data as SbDocument[]) ?? []);
      } catch {
        setDocs([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [expenseId]);

  return (
    <div className="mt-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-indigo-400" />
          <span className="text-xs font-semibold text-indigo-300">Belege (SecondBrain)</span>
          {docs.length > 0 && (
            <span className="text-xs bg-indigo-500 text-white rounded-full px-1.5 py-0.5">
              {docs.length}
            </span>
          )}
        </div>
        <a
          href={uploadLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-indigo-400 border border-indigo-500/30 rounded px-2 py-0.5 hover:bg-indigo-500/10 transition-colors"
        >
          <Plus className="h-3 w-3" /> Beleg hinzufügen
        </a>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-3">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
        </div>
      ) : docs.length === 0 ? (
        <div className="text-center py-3 border border-dashed border-indigo-500/20 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Noch kein Beleg verknüpft</p>
          <a
            href={uploadLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-400 hover:underline"
          >
            Jetzt in SecondBrain hochladen →
          </a>
        </div>
      ) : (
        <div className="space-y-1.5">
          {docs.slice(0, 3).map((doc) => (
            <div
              key={doc.id}
              onClick={() => window.open(`${SB_URL}/dokumente?view=${doc.id}`, "_blank")}
              className="flex items-center gap-2 p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
            >
              <FileText className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{doc.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(doc.file_size)} ·{" "}
                  {format(new Date(doc.created_at), "dd.MM.yyyy", { locale: de })}
                </p>
              </div>
              <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            </div>
          ))}
          {docs.length > 3 && (
            <a
              href={allDocsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-xs text-indigo-400 border border-indigo-500/20 rounded py-1.5 hover:bg-indigo-500/5 transition-colors"
            >
              Alle {docs.length} Belege in SecondBrain →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ── Konstanten ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  "Material",
  "Büro",
  "Reise",
  "Software",
  "Telefon",
  "Versicherung",
  "Fortbildung",
  "Sonstiges",
];

const CATEGORY_COLORS: Record<string, string> = {
  Material: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Büro: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Buero: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Reise: "bg-green-500/10 text-green-400 border-green-500/20",
  Software: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  Telefon: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Versicherung: "bg-red-500/10 text-red-400 border-red-500/20",
  Fortbildung: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  Sonstiges: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

// ── Hauptseite ────────────────────────────────────────────────────────────────
export default function Expenses() {
  const { activeBusiness: business, loading: bizLoading } = useBusinesses();
  const { buildings } = useBuildings();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);

  // Form state
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Sonstiges");
  const [description, setDescription] = useState("");
  const [occurredAt, setOccurredAt] = useState(new Date().toISOString().split("T")[0]);
  const [vatRate, setVatRate] = useState(19);
  const [taxDeductible, setTaxDeductible] = useState(true);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (bizLoading) return;
    if (!business) { setLoading(false); return; }
    fetchExpenses();
  }, [business, bizLoading]);

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
      .order("occurred_at", { ascending: false });
    if (data) setExpenses(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!business || !amount || !description) return;
    setSaving(true);
    const numAmount = Number(amount);
    const vatAmount = Math.round(numAmount * (vatRate / (100 + vatRate)) * 100) / 100;

    const { error } = await supabase.from("biz_expenses").insert({
      business_id: business.id,
      amount: numAmount,
      category,
      description,
      occurred_at: occurredAt,
      vat_rate: vatRate,
      vat_amount: vatAmount,
      tax_deductible: taxDeductible,
      building_id: selectedBuildingId || null,
    });

    if (!error) {
      setAmount("");
      setDescription("");
      setCategory("Sonstiges");
      setVatRate(19);
      setTaxDeductible(true);
      setSelectedBuildingId("");
      setShowForm(false);
      fetchExpenses();
    }
    setSaving(false);
  };

  const getBuildingName = (buildingId: string | null) => {
    if (!buildingId) return null;
    return buildings.find((b) => b.id === buildingId)?.name || null;
  };

  const filtered = expenses.filter((e) => {
    if (
      search &&
      !e.description.toLowerCase().includes(search.toLowerCase()) &&
      !e.category.toLowerCase().includes(search.toLowerCase())
    )
      return false;
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
              Gesamt:{" "}
              <span className="font-semibold text-white">{formatEuro(totalExpenses)}</span>
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
              Erfassen Sie Ihre erste Geschäftsausgabe
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((expense) => (
              <div
                key={expense.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/[0.07] transition-colors"
              >
                {/* Hauptzeile – klickbar zum Aufklappen */}
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() =>
                    setSelectedExpenseId(
                      selectedExpenseId === expense.id ? null : expense.id
                    )
                  }
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                      <Receipt className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{expense.description}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                            CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.Sonstiges
                          }`}
                        >
                          {expense.category}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDateDE(expense.occurred_at)}
                        </span>
                        {expense.tax_deductible && (
                          <span className="text-xs text-green-400">absetzbar</span>
                        )}
                        {expense.building_id && getBuildingName(expense.building_id) && (
                          <span className="inline-flex items-center gap-1 text-xs text-blue-400">
                            <Building2 className="h-3 w-3" />
                            {getBuildingName(expense.building_id)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold text-white">{formatEuro(expense.amount)}</p>
                      {expense.vat_amount > 0 && (
                        <p className="text-xs text-muted-foreground">
                          davon {formatEuro(expense.vat_amount)} USt
                        </p>
                      )}
                    </div>
                    {/* Beleg-Indikator */}
                    <div title="Belege anzeigen">
                      <Brain
                        className={`h-4 w-4 transition-colors ${
                          selectedExpenseId === expense.id
                            ? "text-indigo-400"
                            : "text-muted-foreground/40 hover:text-indigo-400"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* SecondBrain Beleg-Panel (aufklappbar) */}
                {selectedExpenseId === expense.id && (
                  <SecondBrainExpensePanel expenseId={expense.id} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expense Form Dialog */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-background p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">Ausgabe erfassen</h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Betrag brutto (EUR)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Kategorie</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">USt-Satz (%)</label>
                  <select
                    value={vatRate}
                    onChange={(e) => setVatRate(Number(e.target.value))}
                    className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value={19}>19%</option>
                    <option value={7}>7%</option>
                    <option value={0}>0% (umsatzsteuerfrei)</option>
                  </select>
                </div>
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
                  value={occurredAt}
                  onChange={(e) => setOccurredAt(e.target.value)}
                  className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Gebäude-Zuordnung (optional) */}
              {buildings.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    Gebäude zuordnen (optional)
                  </label>
                  <select
                    value={selectedBuildingId}
                    onChange={(e) => setSelectedBuildingId(e.target.value)}
                    className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">— Kein Gebäude —</option>
                    {buildings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                        {b.city ? ` (${b.city})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={taxDeductible}
                  onChange={(e) => setTaxDeductible(e.target.checked)}
                  className="h-4 w-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary"
                />
                <span className="text-sm text-white">Steuerlich absetzbar</span>
              </label>

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
