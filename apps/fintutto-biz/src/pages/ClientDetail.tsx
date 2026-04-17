/**
 * ClientDetail.tsx — Fintutto-Biz
 *
 * Kunden-Detailansicht mit vollständiger SecondBrain-Integration.
 * Zeigt Kunden-Stammdaten, verknüpfte Rechnungen, Ausgaben und
 * alle SecondBrain-Dokumente, die diesem Kunden zugeordnet sind.
 */

import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { useBusinesses } from "@/hooks/useBusinesses";
import {
  ArrowLeft,
  User,
  Mail,
  Building2,
  MapPin,
  Receipt,
  FileText,
  Brain,
  ExternalLink,
  Plus,
  Loader2,
  Calendar,
  Hash,
  Trash2,
  Edit,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

// ── Typen ────────────────────────────────────────────────────────────────────

interface Client {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  address: Record<string, string> | null;
  vat_id: string | null;
  created_at: string;
  business_id: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  status: string;
  total_amount: number;
  due_date: string | null;
  created_at: string;
}

interface SbDocument {
  id: string;
  title: string;
  file_name: string;
  file_type: string;
  file_size: number;
  document_type: string | null;
  ocr_status: string;
  summary: string | null;
  created_at: string;
}

// ── Hilfsfunktionen ──────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: "Entwurf", color: "bg-gray-100 text-gray-700" },
  sent: { label: "Versendet", color: "bg-blue-100 text-blue-700" },
  paid: { label: "Bezahlt", color: "bg-green-100 text-green-700" },
  overdue: { label: "Überfällig", color: "bg-red-100 text-red-700" },
  cancelled: { label: "Storniert", color: "bg-gray-100 text-gray-500" },
};

// ── SecondBrain-Panel (eigenständig, ohne @fintutto/shared) ──────────────────

function SecondBrainPanel({ clientId }: { clientId: string }) {
  const [docs, setDocs] = useState<SbDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const SB_URL = "https://secondbrain.fintutto.cloud";
  const uploadLink = `${SB_URL}/upload?context=business&id=${clientId}`;
  const allDocsLink = `${SB_URL}/dokumente?filter=business:${clientId}`;

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { data } = await supabase.rpc("get_documents_for_entity", {
          p_entity_type: "business",
          p_entity_id: clientId,
        });
        setDocs((data as SbDocument[]) ?? []);
      } catch {
        setDocs([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [clientId]);

  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-indigo-500" />
          <span className="text-sm font-semibold text-indigo-900">
            SecondBrain-Dokumente
          </span>
          {docs.length > 0 && (
            <span className="text-xs bg-indigo-500 text-white rounded-full px-2 py-0.5">
              {docs.length}
            </span>
          )}
        </div>
        <a
          href={uploadLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-indigo-600 border border-indigo-300 rounded-md px-2 py-1 hover:bg-indigo-100 transition-colors"
        >
          <Plus className="h-3 w-3" />
          Hochladen
        </a>
      </div>

      {/* Inhalt */}
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
        </div>
      ) : docs.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-indigo-200 rounded-lg">
          <Brain className="h-6 w-6 mx-auto mb-2 text-indigo-300" />
          <p className="text-sm text-muted-foreground mb-2">
            Noch keine Dokumente verknüpft
          </p>
          <a
            href={uploadLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-600 hover:underline"
          >
            Jetzt in SecondBrain hochladen →
          </a>
        </div>
      ) : (
        <div className="space-y-2">
          {docs.slice(0, 5).map((doc) => (
            <div
              key={doc.id}
              onClick={() =>
                window.open(`${SB_URL}/dokumente?view=${doc.id}`, "_blank")
              }
              className="flex items-center gap-3 p-2.5 rounded-lg border border-white bg-white hover:border-indigo-200 hover:shadow-sm cursor-pointer transition-all"
            >
              <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <FileText className="h-4 w-4 text-indigo-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(doc.file_size)} ·{" "}
                  {format(new Date(doc.created_at), "dd.MM.yyyy", {
                    locale: de,
                  })}
                </p>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            </div>
          ))}

          {docs.length > 5 && (
            <a
              href={allDocsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-xs text-indigo-600 border border-indigo-200 rounded-lg py-2 hover:bg-indigo-50 transition-colors"
            >
              Alle {docs.length} Dokumente in SecondBrain →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ── Haupt-Komponente ─────────────────────────────────────────────────────────

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeBusiness: business } = useBusinesses();
  const [client, setClient] = useState<Client | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "invoices" | "documents">(
    "overview"
  );

  useEffect(() => {
    if (!id || !business) return;
    loadData();
  }, [id, business]);

  async function loadData() {
    setLoading(true);
    const [clientRes, invoicesRes] = await Promise.all([
      supabase
        .from("biz_clients")
        .select("*")
        .eq("id", id!)
        .eq("business_id", business!.id)
        .single(),
      supabase
        .from("biz_invoices")
        .select("id, invoice_number, status, total_amount, due_date, created_at")
        .eq("client_id", id!)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    if (clientRes.data) setClient(clientRes.data as Client);
    if (invoicesRes.data) setInvoices(invoicesRes.data as Invoice[]);
    setLoading(false);
  }

  if (loading) {
    return (
      <MainLayout
        title="Kunde"
        breadcrumbs={[{ label: "Kunden", href: "/kunden" }, { label: "Details" }]}
      >
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  if (!client) {
    return (
      <MainLayout
        title="Kunde nicht gefunden"
        breadcrumbs={[{ label: "Kunden", href: "/kunden" }, { label: "Nicht gefunden" }]}
      >
        <div className="text-center py-20">
          <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Kunde wurde nicht gefunden.</p>
          <button
            onClick={() => navigate("/kunden")}
            className="mt-4 text-sm text-primary hover:underline"
          >
            Zurück zur Kundenliste
          </button>
        </div>
      </MainLayout>
    );
  }

  const totalRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + (i.total_amount || 0), 0);

  const openInvoices = invoices.filter(
    (i) => i.status === "sent" || i.status === "overdue"
  ).length;

  return (
    <MainLayout
      title={client.company || client.name}
      breadcrumbs={[
        { label: "Kunden", href: "/kunden" },
        { label: client.company || client.name },
      ]}
    >
      <div className="space-y-6 max-w-4xl">
        {/* Zurück-Link */}
        <Link
          to="/kunden"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Kundenliste
        </Link>

        {/* Kunden-Header-Card */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold">{client.name}</h1>
              {client.company && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>{client.company}</span>
                </div>
              )}
              <div className="flex flex-wrap gap-4 mt-3">
                {client.email && (
                  <a
                    href={`mailto:${client.email}`}
                    className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {client.email}
                  </a>
                )}
                {client.address && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>
                      {client.address.street}
                      {client.address.zip && `, ${client.address.zip}`}
                      {client.address.city && ` ${client.address.city}`}
                    </span>
                  </div>
                )}
                {client.vat_id && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Hash className="h-3.5 w-3.5" />
                    <span>USt-IdNr.: {client.vat_id}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              Seit {format(new Date(client.created_at), "MMMM yyyy", { locale: de })}
            </div>
          </div>

          {/* KPI-Zeile */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalRevenue)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Umsatz (bezahlt)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{invoices.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Rechnungen gesamt</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${openInvoices > 0 ? "text-orange-500" : "text-muted-foreground"}`}>
                {openInvoices}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Offen / Überfällig</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b flex gap-0">
          {(
            [
              { key: "overview", label: "Übersicht", icon: User },
              { key: "invoices", label: "Rechnungen", icon: Receipt },
              { key: "documents", label: "Dokumente", icon: Brain },
            ] as const
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab: Übersicht */}
        {activeTab === "overview" && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Kontaktdaten */}
            <div className="rounded-xl border bg-card p-5">
              <h3 className="font-semibold mb-4">Kontaktdaten</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="text-sm font-medium">{client.name}</p>
                </div>
                {client.company && (
                  <div>
                    <p className="text-xs text-muted-foreground">Firma</p>
                    <p className="text-sm font-medium">{client.company}</p>
                  </div>
                )}
                {client.email && (
                  <div>
                    <p className="text-xs text-muted-foreground">E-Mail</p>
                    <a
                      href={`mailto:${client.email}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {client.email}
                    </a>
                  </div>
                )}
                {client.address && (
                  <div>
                    <p className="text-xs text-muted-foreground">Adresse</p>
                    <p className="text-sm">
                      {client.address.street && `${client.address.street}, `}
                      {client.address.zip && `${client.address.zip} `}
                      {client.address.city}
                    </p>
                  </div>
                )}
                {client.vat_id && (
                  <div>
                    <p className="text-xs text-muted-foreground">USt-IdNr.</p>
                    <p className="text-sm font-mono">{client.vat_id}</p>
                  </div>
                )}
              </div>
            </div>

            {/* SecondBrain-Panel */}
            <div>
              <SecondBrainPanel clientId={client.id} />
            </div>
          </div>
        )}

        {/* Tab: Rechnungen */}
        {activeTab === "invoices" && (
          <div className="rounded-xl border bg-card overflow-hidden">
            {invoices.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">Noch keine Rechnungen vorhanden.</p>
                <Link
                  to="/rechnungen"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <Plus className="h-4 w-4" />
                  Erste Rechnung erstellen
                </Link>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Rechnungsnr.</th>
                    <th className="text-left px-4 py-3 font-medium">Datum</th>
                    <th className="text-left px-4 py-3 font-medium">Fällig</th>
                    <th className="text-right px-4 py-3 font-medium">Betrag</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {invoices.map((inv) => {
                    const status = STATUS_CONFIG[inv.status] ?? {
                      label: inv.status,
                      color: "bg-gray-100 text-gray-700",
                    };
                    return (
                      <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs">
                          {inv.invoice_number}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {format(new Date(inv.created_at), "dd.MM.yyyy", {
                            locale: de,
                          })}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {inv.due_date
                            ? format(new Date(inv.due_date), "dd.MM.yyyy", {
                                locale: de,
                              })
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrency(inv.total_amount)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}
                          >
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab: Dokumente */}
        {activeTab === "documents" && (
          <div className="space-y-4">
            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="h-5 w-5 text-indigo-500" />
                <h3 className="font-semibold">SecondBrain — Dokumente für diesen Kunden</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Alle Dokumente, die in SecondBrain mit diesem Kunden verknüpft wurden —
                Angebote, Verträge, Korrespondenz, Belege und mehr.
              </p>
              <SecondBrainPanel clientId={client.id} />
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
