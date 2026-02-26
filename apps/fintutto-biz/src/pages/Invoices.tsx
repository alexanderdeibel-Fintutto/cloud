import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/hooks/useBusiness";
import { formatEuro, formatDateDE } from "@/lib/utils";
import { InvoiceForm } from "@/components/invoices/InvoiceForm";
import {
  Plus,
  Search,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  status: string;
  subtotal: number;
  tax_amount: number;
  total: number;
  issue_date: string;
  due_date: string;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: "Entwurf", color: "bg-gray-500/10 text-gray-400 border-gray-500/20", icon: <FileText className="h-3 w-3" /> },
  sent: { label: "Gesendet", color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: <Clock className="h-3 w-3" /> },
  paid: { label: "Bezahlt", color: "bg-green-500/10 text-green-400 border-green-500/20", icon: <CheckCircle className="h-3 w-3" /> },
  overdue: { label: "Ueberfaellig", color: "bg-red-500/10 text-red-400 border-red-500/20", icon: <AlertTriangle className="h-3 w-3" /> },
  cancelled: { label: "Storniert", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", icon: <XCircle className="h-3 w-3" /> },
};

export default function Invoices() {
  const { business } = useBusiness();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!business) return;
    fetchInvoices();
  }, [business]);

  // Check URL params for ?neu=1
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("neu") === "1") {
      setShowForm(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const fetchInvoices = async () => {
    if (!business) return;

    const { data } = await supabase
      .from("biz_invoices")
      .select("id, invoice_number, status, subtotal, tax_amount, total, issue_date, due_date, created_at, client_id")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false });

    if (data) {
      // Fetch client names
      const clientIds = [...new Set(data.map((inv) => inv.client_id).filter(Boolean))];
      let clientMap: Record<string, string> = {};

      if (clientIds.length > 0) {
        const { data: clients } = await supabase
          .from("biz_clients")
          .select("id, name")
          .in("id", clientIds);
        if (clients) {
          clientMap = Object.fromEntries(clients.map((c) => [c.id, c.name]));
        }
      }

      setInvoices(
        data.map((inv) => ({
          ...inv,
          client_name: clientMap[inv.client_id] || "Unbekannt",
        }))
      );
    }
    setLoading(false);
  };

  const filtered = invoices.filter((inv) => {
    if (filterStatus !== "all" && inv.status !== filterStatus) return false;
    if (search && !inv.invoice_number.toLowerCase().includes(search.toLowerCase()) &&
        !inv.client_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <MainLayout title="Rechnungen">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechnungen durchsuchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-md border border-white/10 bg-white/5 pl-10 pr-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Neue Rechnung
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all", label: "Alle" },
            { key: "draft", label: "Entwuerfe" },
            { key: "sent", label: "Gesendet" },
            { key: "paid", label: "Bezahlt" },
            { key: "overdue", label: "Ueberfaellig" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filterStatus === f.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Invoice List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-white">Keine Rechnungen gefunden</p>
            <p className="text-sm text-muted-foreground mt-1">
              Erstellen Sie Ihre erste Rechnung
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Nr.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Kunde</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Datum</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Betrag</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => {
                  const status = STATUS_CONFIG[inv.status] || STATUS_CONFIG.draft;
                  return (
                    <tr key={inv.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono text-white">{inv.invoice_number}</td>
                      <td className="px-4 py-3 text-sm text-white">{inv.client_name}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${status.color}`}>
                          {status.icon}
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{formatDateDE(inv.issue_date)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-white text-right">{formatEuro(inv.total)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Form Dialog */}
      {showForm && (
        <InvoiceForm
          businessId={business?.id || ""}
          invoicePrefix={business?.invoice_prefix || "RE"}
          nextNumber={business?.next_invoice_number || 1}
          defaultTaxRate={business?.default_tax_rate || 19}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            fetchInvoices();
          }}
        />
      )}
    </MainLayout>
  );
}
