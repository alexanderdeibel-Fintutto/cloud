import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatEuro } from "@/lib/utils";
import { X, Plus, Trash2, FileDown } from "lucide-react";
import { downloadInvoicePdf } from "@/lib/generateInvoicePdf";
import type { Business } from "@/hooks/useBusiness";

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
}

interface Client {
  id: string;
  name: string;
  email?: string;
  address?: Record<string, string>;
  tax_id?: string;
}

interface InvoiceFormProps {
  businessId: string;
  business?: Business | null;
  invoicePrefix: string;
  nextNumber: number;
  defaultTaxRate: number;
  onClose: () => void;
  onSaved: () => void;
}

export function InvoiceForm({
  businessId,
  invoicePrefix,
  nextNumber,
  defaultTaxRate,
  onClose,
  onSaved,
}: InvoiceFormProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, unit_price: 0 },
  ]);
  const [taxRate, setTaxRate] = useState(defaultTaxRate);
  const [dueInDays, setDueInDays] = useState(14);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const invoiceNumber = `${invoicePrefix}-${String(nextNumber).padStart(4, "0")}`;

  useEffect(() => {
    supabase
      .from("biz_clients")
      .select("id, name, email, address, tax_id")
      .eq("business_id", businessId)
      .order("name")
      .then(({ data }) => {
        if (data) setClients(data);
      });
  }, [businessId]);

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100;
  const total = subtotal + taxAmount;

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const buildPdfData = (issueDate: string, dueDate: string, status: string) => {
    const selectedClient = clients.find((c) => c.id === clientId);
    return {
      invoiceNumber,
      issueDate,
      dueDate,
      status,
      items: items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.quantity * item.unit_price,
      })),
      subtotal,
      taxRate,
      taxAmount,
      total,
      currency: "EUR",
      notes: notes || undefined,
      businessName: business?.name ?? "Mein Unternehmen",
      businessType: business?.business_type,
      businessAddress: business?.address as Record<string, string> | undefined,
      businessTaxId: business?.tax_id ?? undefined,
      businessVatId: business?.vat_id ?? undefined,
      clientName: selectedClient?.name ?? "",
      clientEmail: selectedClient?.email ?? undefined,
      clientAddress: selectedClient?.address as Record<string, string> | undefined,
      clientTaxId: selectedClient?.tax_id ?? undefined,
    };
  };

  const handlePreviewPdf = () => {
    if (!clientId) { setError("Bitte wählen Sie zuerst einen Kunden aus."); return; }
    const issueDate = new Date().toISOString().split("T")[0];
    const dueDate = new Date(Date.now() + dueInDays * 86400000).toISOString().split("T")[0];
    downloadInvoicePdf(buildPdfData(issueDate, dueDate, "draft"));
  };

  const handleSave = async (status: "draft" | "sent") => {
    if (!clientId) {
      setError("Bitte wählen Sie einen Kunden aus.");
      return;
    }
    if (items.some((item) => !item.description || item.unit_price <= 0)) {
      setError("Bitte füllen Sie alle Positionen aus.");
      return;
    }

    setSaving(true);
    setError(null);

    const issueDate = new Date().toISOString().split("T")[0];
    const dueDate = new Date(Date.now() + dueInDays * 86400000).toISOString().split("T")[0];

    const { error: insertError } = await supabase.from("biz_invoices").insert({
      business_id: businessId,
      client_id: clientId,
      invoice_number: invoiceNumber,
      status,
      items: items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.quantity * item.unit_price,
      })),
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total,
      issue_date: issueDate,
      due_date: dueDate,
    });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    // Rechnungsnummer hochzählen
    await supabase
      .from("biz_businesses")
      .update({ next_invoice_number: nextNumber + 1 })
      .eq("id", businessId);

    // PDF automatisch generieren und herunterladen
    downloadInvoicePdf(buildPdfData(issueDate, dueDate, status));

    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-white/10 bg-background p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Neue Rechnung</h2>
            <p className="text-sm text-muted-foreground">Nr. {invoiceNumber}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Client Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Kunde</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Kunde waehlen...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Line Items */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Positionen</label>
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <input
                  type="text"
                  placeholder="Beschreibung"
                  value={item.description}
                  onChange={(e) => updateItem(idx, "description", e.target.value)}
                  className="flex-1 h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="number"
                  placeholder="Anz."
                  value={item.quantity}
                  min={1}
                  onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))}
                  className="w-20 h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="number"
                  placeholder="Preis"
                  value={item.unit_price || ""}
                  min={0}
                  step={0.01}
                  onChange={(e) => updateItem(idx, "unit_price", Number(e.target.value))}
                  className="w-28 h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={() => removeItem(idx)}
                  className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              onClick={addItem}
              className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
            >
              <Plus className="h-4 w-4" /> Position hinzufuegen
            </button>
          </div>

          {/* Tax & Payment Terms */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">USt-Satz (%)</label>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Zahlungsziel (Tage)</label>
              <input
                type="number"
                value={dueInDays}
                onChange={(e) => setDueInDays(Number(e.target.value))}
                className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Totals */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Netto</span>
              <span className="text-white">{formatEuro(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">USt ({taxRate}%)</span>
              <span className="text-white">{formatEuro(taxAmount)}</span>
            </div>
            <div className="border-t border-white/10 pt-2 flex justify-between">
              <span className="font-medium text-white">Gesamt</span>
              <span className="font-bold text-white text-lg">{formatEuro(total)}</span>
            </div>
          </div>

          {/* Notizen */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Anmerkungen (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="z.B. Vielen Dank für Ihren Auftrag!"
              rows={2}
              className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Aktionen */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handlePreviewPdf}
              disabled={!clientId || items.every((i) => !i.description)}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-indigo-500/30 bg-indigo-500/10 px-4 py-2.5 text-sm font-medium text-indigo-400 hover:bg-indigo-500/20 disabled:opacity-40 transition-colors"
            >
              <FileDown className="h-4 w-4" />
              PDF-Vorschau herunterladen
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => handleSave("draft")}
                disabled={saving}
                className="flex-1 rounded-md border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-50"
              >
                Als Entwurf speichern
              </button>
              <button
                onClick={() => handleSave("sent")}
                disabled={saving}
                className="flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? "Wird gespeichert..." : "Speichern & PDF"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
