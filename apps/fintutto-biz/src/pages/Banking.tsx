import { useState, useEffect, useRef } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useBusinesses } from "@/hooks/useBusinesses";
import { useBizBanking, BankTransaction } from "@/hooks/useBizBanking";
import { supabase } from "@/integrations/supabase/client";
import {
  CreditCard,
  RefreshCw,
  Plus,
  Upload,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  X,
  Wallet,
  Link2,
} from "lucide-react";

function formatEuro(cents: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(
    cents / 100
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
}

// ── Neues Konto Dialog ────────────────────────────────────────────────────────
function NewAccountDialog({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (params: {
    accountName: string;
    iban: string;
    accountType: string;
    balanceCents: number;
  }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [iban, setIban] = useState("");
  const [type, setType] = useState("checking");
  const [balance, setBalance] = useState("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !iban) return;
    setLoading(true);
    setError(null);
    try {
      await onCreate({
        accountName: name,
        iban: iban.replace(/\s/g, "").toUpperCase(),
        accountType: type,
        balanceCents: Math.round(parseFloat(balance.replace(",", ".")) * 100) || 0,
      });
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Fehler beim Anlegen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-xl border border-white/10 bg-zinc-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Konto hinzufügen</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        {error && (
          <div className="mb-3 rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-xs text-red-400">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Kontoname *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Geschäftskonto Sparkasse"
              required
              autoFocus
              className="mt-1 h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-muted-foreground"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">IBAN *</label>
            <input
              type="text"
              value={iban}
              onChange={(e) => setIban(e.target.value)}
              placeholder="DE12 3456 7890 1234 5678 90"
              required
              className="mt-1 h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-muted-foreground font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Kontotyp</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-1 h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white"
              >
                <option value="checking">Girokonto</option>
                <option value="savings">Sparkonto</option>
                <option value="business">Geschäftskonto</option>
                <option value="credit">Kreditkarte</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Kontostand (€)</label>
              <input
                type="text"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="0,00"
                className="mt-1 h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-white/10 py-2.5 text-sm text-muted-foreground hover:bg-white/5"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Wird angelegt..." : "Konto anlegen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── CSV Import Dialog ─────────────────────────────────────────────────────────
function CsvImportDialog({
  accounts,
  onClose,
  onImport,
}: {
  accounts: Array<{ id: string; account_name: string; iban: string }>;
  onClose: () => void;
  onImport: (file: File, accountId: string) => Promise<{ imported: number; skipped: number }>;
}) {
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = async () => {
    if (!file || !accountId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await onImport(file, accountId);
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Import fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-zinc-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Kontoauszug importieren</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {result ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-center">
              <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="text-white font-medium">{result.imported} Transaktionen importiert</p>
              {result.skipped > 0 && (
                <p className="text-xs text-muted-foreground mt-1">{result.skipped} Zeilen übersprungen</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-full rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground"
            >
              Fertig
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-muted-foreground mb-1 font-medium">CSV-Format:</p>
              <code className="text-xs text-green-400 font-mono">
                Datum;Betrag;Auftraggeber;Verwendungszweck
              </code>
              <p className="text-xs text-muted-foreground mt-1">
                Datum: DD.MM.YYYY · Betrag: -1234,56 (negativ = Ausgabe)
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Konto</label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="mt-1 h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.account_name} ({a.iban.slice(-4)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">CSV-Datei</label>
              <div
                onClick={() => fileRef.current?.click()}
                className="mt-1 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/20 bg-white/5 p-6 cursor-pointer hover:border-primary/50 hover:bg-white/10 transition-colors"
              >
                <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                {file ? (
                  <p className="text-sm text-white">{file.name}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">CSV-Datei auswählen</p>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-xs text-red-400">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-md border border-white/10 py-2.5 text-sm text-muted-foreground hover:bg-white/5"
              >
                Abbrechen
              </button>
              <button
                onClick={handleImport}
                disabled={!file || !accountId || loading}
                className="flex-1 rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? "Importiere..." : "Importieren"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Match Dialog ──────────────────────────────────────────────────────────────
function MatchExpenseDialog({
  transaction,
  businessId,
  onClose,
  onMatch,
}: {
  transaction: BankTransaction;
  businessId: string;
  onClose: () => void;
  onMatch: (transactionId: string, expenseId: string) => Promise<void>;
}) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase
      .from("biz_expenses")
      .select("id, description, amount, date")
      .eq("business_id", businessId)
      .is("bank_transaction_id", null)
      .order("date", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) setExpenses(data as Expense[]);
      });
  }, [businessId]);

  const handleMatch = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await onMatch(transaction.id, selected);
      // Ausgabe mit Transaktions-ID verknüpfen
      await supabase
        .from("biz_expenses")
        .update({ bank_transaction_id: transaction.id })
        .eq("id", selected);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-zinc-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Ausgabe zuordnen</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 rounded-lg border border-white/10 bg-white/5 p-3">
          <p className="text-xs text-muted-foreground">Transaktion</p>
          <p className="text-sm text-white font-medium">
            {transaction.counterpart_name ?? transaction.booking_text ?? "–"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDate(transaction.booking_date)} · {formatEuro(transaction.amount_cents)}
          </p>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {expenses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Keine offenen Ausgaben gefunden
            </p>
          ) : (
            expenses.map((exp) => (
              <button
                key={exp.id}
                onClick={() => setSelected(exp.id)}
                className={`w-full flex items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors ${
                  selected === exp.id
                    ? "border-primary/50 bg-primary/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <span className="text-sm text-white">{exp.description}</span>
                <span className="text-xs text-muted-foreground">
                  {new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(
                    exp.amount
                  )}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-md border border-white/10 py-2.5 text-sm text-muted-foreground hover:bg-white/5"
          >
            Abbrechen
          </button>
          <button
            onClick={handleMatch}
            disabled={!selected || loading}
            className="flex-1 rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Zuordnen..." : "Zuordnen"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Hauptseite ────────────────────────────────────────────────────────────────
export default function Banking() {
  const { activeBusiness: business } = useBusinesses();
  const {
    accounts,
    loading,
    totalBalance,
    fetchAccounts,
    fetchTransactions,
    importCsv,
    matchToExpense,
    ignoreTransaction,
    createManualAccount,
  } = useBizBanking(business?.id);

  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [matchFilter, setMatchFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showNewAccount, setShowNewAccount] = useState(false);
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [matchTx, setMatchTx] = useState<BankTransaction | null>(null);

  const loadTransactions = async () => {
    setTxLoading(true);
    try {
      const data = await fetchTransactions({
        accountId: selectedAccount === "all" ? undefined : selectedAccount,
        matchStatus: matchFilter === "all" ? undefined : matchFilter,
        search: search || undefined,
        limit: 200,
      });
      setTransactions(data);
    } finally {
      setTxLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) loadTransactions();
  }, [loading, selectedAccount, matchFilter, search]);

  const unmatchedCount = transactions.filter((t) => t.match_status === "unmatched").length;
  const incomeThisMonth = transactions
    .filter((t) => t.amount_cents > 0 && t.booking_date >= new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0])
    .reduce((s, t) => s + t.amount_cents, 0);
  const expensesThisMonth = transactions
    .filter((t) => t.amount_cents < 0 && t.booking_date >= new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0])
    .reduce((s, t) => s + Math.abs(t.amount_cents), 0);

  return (
    <MainLayout title="Banking">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Banking</h1>
            <p className="text-sm text-muted-foreground">Konten & Transaktionen</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCsvImport(true)}
              disabled={accounts.length === 0}
              className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10 disabled:opacity-40"
            >
              <Upload className="h-4 w-4" />
              CSV-Import
            </button>
            <button
              onClick={() => { fetchAccounts(); loadTransactions(); }}
              className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowNewAccount(true)}
              className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Konto hinzufügen
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Gesamtsaldo", value: formatEuro(totalBalance), icon: Wallet, color: "text-white" },
            { label: "Einnahmen (Monat)", value: formatEuro(incomeThisMonth), icon: ArrowUpRight, color: "text-green-400" },
            { label: "Ausgaben (Monat)", value: formatEuro(expensesThisMonth), icon: ArrowDownRight, color: "text-red-400" },
            { label: "Nicht zugeordnet", value: String(unmatchedCount), icon: AlertCircle, color: unmatchedCount > 0 ? "text-yellow-400" : "text-green-400" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Konten */}
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/20 bg-white/5 p-8 text-center">
            <CreditCard className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-white font-medium mb-1">Noch kein Konto verknüpft</p>
            <p className="text-sm text-muted-foreground mb-4">
              Fügen Sie ein Konto manuell hinzu oder importieren Sie einen Kontoauszug.
            </p>
            <button
              onClick={() => setShowNewAccount(true)}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              <Plus className="h-4 w-4" />
              Konto hinzufügen
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((acc) => (
              <button
                key={acc.id}
                onClick={() => setSelectedAccount(acc.id === selectedAccount ? "all" : acc.id)}
                className={`rounded-xl border p-4 text-left transition-all ${
                  selectedAccount === acc.id
                    ? "border-primary/50 bg-primary/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <span className="text-xs text-muted-foreground capitalize">{acc.account_type}</span>
                </div>
                <p className="text-sm font-medium text-white mb-1">{acc.account_name}</p>
                <p className="text-xs text-muted-foreground font-mono mb-3">
                  {acc.iban.replace(/(.{4})/g, "$1 ").trim()}
                </p>
                <p className={`text-lg font-bold ${acc.balance_cents >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {formatEuro(acc.balance_cents)}
                </p>
                {acc.balance_date && (
                  <p className="text-xs text-muted-foreground mt-1">Stand: {formatDate(acc.balance_date)}</p>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Transaktionen */}
        {accounts.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Transaktionen durchsuchen..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 w-full rounded-md border border-white/10 bg-white/5 pl-10 pr-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-2">
                {[
                  { key: "all", label: "Alle" },
                  { key: "unmatched", label: "Nicht zugeordnet" },
                  { key: "matched", label: "Zugeordnet" },
                  { key: "ignored", label: "Ignoriert" },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setMatchFilter(f.key)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      matchFilter === f.key
                        ? "bg-primary text-primary-foreground"
                        : "bg-white/5 text-muted-foreground hover:bg-white/10"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {txLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
                <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Keine Transaktionen gefunden</p>
                <button
                  onClick={() => setShowCsvImport(true)}
                  className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Upload className="h-3 w-3" />
                  Kontoauszug importieren
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Datum</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Auftraggeber</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">Verwendungszweck</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Betrag</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Aktion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(tx.booking_date)}
                        </td>
                        <td className="px-4 py-3 text-sm text-white max-w-[160px] truncate">
                          {tx.counterpart_name ?? "–"}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell max-w-[200px] truncate">
                          {tx.purpose ?? tx.booking_text ?? "–"}
                        </td>
                        <td className="px-4 py-3">
                          {tx.match_status === "matched" ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-xs text-green-400">
                              <CheckCircle className="h-3 w-3" /> Zugeordnet
                            </span>
                          ) : tx.match_status === "ignored" ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-gray-500/20 bg-gray-500/10 px-2 py-0.5 text-xs text-gray-400">
                              Ignoriert
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2 py-0.5 text-xs text-yellow-400">
                              <AlertCircle className="h-3 w-3" /> Offen
                            </span>
                          )}
                        </td>
                        <td className={`px-4 py-3 text-sm font-medium text-right whitespace-nowrap ${tx.amount_cents >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {formatEuro(tx.amount_cents)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {tx.match_status === "unmatched" && (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setMatchTx(tx)}
                                title="Ausgabe zuordnen"
                                className="rounded p-1 text-muted-foreground hover:text-primary hover:bg-primary/10"
                              >
                                <Link2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={async () => {
                                  await ignoreTransaction(tx.id);
                                  loadTransactions();
                                }}
                                title="Ignorieren"
                                className="rounded p-1 text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dialoge */}
      {showNewAccount && (
        <NewAccountDialog
          onClose={() => setShowNewAccount(false)}
          onCreate={async (params) => {
            await createManualAccount(params);
            setShowNewAccount(false);
          }}
        />
      )}
      {showCsvImport && (
        <CsvImportDialog
          accounts={accounts}
          onClose={() => { setShowCsvImport(false); loadTransactions(); }}
          onImport={importCsv}
        />
      )}
      {matchTx && business && (
        <MatchExpenseDialog
          transaction={matchTx}
          businessId={business.id}
          onClose={() => { setMatchTx(null); loadTransactions(); }}
          onMatch={matchToExpense}
        />
      )}
    </MainLayout>
  );
}
