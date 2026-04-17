import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/hooks/useBusiness";
import { Plus, Users, Search, X, Mail, Building2, ChevronRight } from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  address: Record<string, string> | null;
  vat_id: string | null;
  created_at: string;
}

export default function Clients() {
  const { business } = useBusiness();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [vatId, setVatId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!business) return;
    fetchClients();
  }, [business]);

  const fetchClients = async () => {
    if (!business) return;

    const { data } = await supabase
      .from("biz_clients")
      .select("*")
      .eq("business_id", business.id)
      .order("name");

    if (data) setClients(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!business || !name) return;
    setSaving(true);

    const { error } = await supabase.from("biz_clients").insert({
      business_id: business.id,
      name,
      email: email || null,
      company: company || null,
      address: street || city || zip ? { street, city, zip } : null,
      vat_id: vatId || null,
    });

    if (!error) {
      resetForm();
      setShowForm(false);
      fetchClients();
    }
    setSaving(false);
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setCompany("");
    setStreet("");
    setCity("");
    setZip("");
    setVatId("");
  };

  const filtered = clients.filter((c) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return c.name.toLowerCase().includes(s) ||
      c.email?.toLowerCase().includes(s) ||
      c.company?.toLowerCase().includes(s);
  });

  return (
    <MainLayout title="Kunden">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Kunden durchsuchen..."
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
            Neuer Kunde
          </button>
        </div>

        {/* Client List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-white">Keine Kunden angelegt</p>
            <p className="text-sm text-muted-foreground mt-1">
              Legen Sie Ihren ersten Kunden an
            </p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((client) => (
              <Link
                key={client.id}
                to={`/kunden/${client.id}`}
                className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/[0.07] hover:border-primary/30 transition-colors block group"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{client.name}</p>
                    {client.company && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground truncate">{client.company}</p>
                      </div>
                    )}
                    {client.email && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground truncate">{client.email}</p>
                      </div>
                    )}
                    {client.vat_id && (
                      <p className="text-xs text-muted-foreground mt-1">
                        USt-IdNr: {client.vat_id}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-0.5" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Client Form Dialog */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-background p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Neuer Kunde</h2>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="text-muted-foreground hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Name *</label>
                <input
                  type="text"
                  placeholder="Max Mustermann"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">E-Mail</label>
                <input
                  type="email"
                  placeholder="max@beispiel.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Firma</label>
                <input
                  type="text"
                  placeholder="Firma GmbH"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Adresse</label>
                <input
                  type="text"
                  placeholder="Strasse und Hausnummer"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="PLZ"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className="h-10 w-24 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    placeholder="Stadt"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="h-10 flex-1 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">USt-IdNr.</label>
                <input
                  type="text"
                  placeholder="DE123456789"
                  value={vatId}
                  onChange={(e) => setVatId(e.target.value)}
                  className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowForm(false); resetForm(); }}
                  className="flex-1 rounded-md border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !name}
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
