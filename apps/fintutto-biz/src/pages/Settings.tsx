import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBusiness } from "@/hooks/useBusiness";
import { Loader2, Save } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const { business, refetch } = useBusiness();
  const [name, setName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [vatId, setVatId] = useState("");
  const [invoicePrefix, setInvoicePrefix] = useState("");
  const [paymentTerms, setPaymentTerms] = useState(14);
  const [defaultTaxRate, setDefaultTaxRate] = useState(19);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (business) {
      setName(business.name || "");
      setTaxId(business.tax_id || "");
      setVatId(business.vat_id || "");
      setInvoicePrefix(business.invoice_prefix || "RE");
      setPaymentTerms(business.default_payment_terms || 14);
      setDefaultTaxRate(business.default_tax_rate || 19);
    }
  }, [business]);

  const handleSave = async () => {
    if (!business) return;
    setSaving(true);
    setSaved(false);

    await supabase
      .from("biz_businesses")
      .update({
        name,
        tax_id: taxId || null,
        vat_id: vatId || null,
        invoice_prefix: invoicePrefix,
        default_payment_terms: paymentTerms,
        default_tax_rate: defaultTaxRate,
      })
      .eq("id", business.id);

    await refetch();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <MainLayout title="Einstellungen">
      <div className="max-w-2xl space-y-6">
        {/* Account */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Konto</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground">E-Mail</label>
              <p className="text-sm text-white">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Business Settings */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Geschaeftsdaten</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Geschaeftsname</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Steuernummer</label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="12/345/67890"
                  className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">USt-IdNr.</label>
                <input
                  type="text"
                  value={vatId}
                  onChange={(e) => setVatId(e.target.value)}
                  placeholder="DE123456789"
                  className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Settings */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Rechnungseinstellungen</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Rechnungs-Praefix</label>
                <input
                  type="text"
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value)}
                  className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Zahlungsziel (Tage)</label>
                <input
                  type="number"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(Number(e.target.value))}
                  className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">USt-Satz (%)</label>
                <input
                  type="number"
                  value={defaultTaxRate}
                  onChange={(e) => setDefaultTaxRate(Number(e.target.value))}
                  className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saved ? "Gespeichert!" : "Speichern"}
        </button>
      </div>
    </MainLayout>
  );
}
