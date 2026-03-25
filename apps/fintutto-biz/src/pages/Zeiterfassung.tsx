import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/hooks/useBusiness";
import { formatEuro } from "@/lib/utils";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Clock, Plus, CheckCircle, Circle, Trash2 } from "lucide-react";

interface TimeEntry {
  id: string;
  client_id: string | null;
  description: string;
  hours: number;
  hourly_rate: number;
  date: string;
  billed: boolean;
  notes: string | null;
  client_name?: string;
}

interface Client {
  id: string;
  name: string;
}

export default function Zeiterfassung() {
  const { business } = useBusiness();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterBilled, setFilterBilled] = useState<"all" | "unbilled" | "billed">("all");

  // Formular-State
  const [form, setForm] = useState({
    client_id: "",
    description: "",
    hours: "",
    hourly_rate: "",
    date: format(new Date(), "yyyy-MM-dd"),
    notes: "",
  });

  useEffect(() => {
    if (!business) return;
    fetchData();
  }, [business]);

  const fetchData = async () => {
    if (!business) return;
    setLoading(true);

    const [{ data: entriesData }, { data: clientsData }] = await Promise.all([
      supabase
        .from("biz_time_entries")
        .select(`
          *,
          biz_clients(name)
        `)
        .eq("business_id", business.id)
        .order("date", { ascending: false }),
      supabase
        .from("biz_clients")
        .select("id, name")
        .eq("business_id", business.id)
        .order("name"),
    ]);

    if (entriesData) {
      setEntries(
        entriesData.map((e: any) => ({
          ...e,
          client_name: e.biz_clients?.name,
        }))
      );
    }
    if (clientsData) setClients(clientsData);
    setLoading(false);
  };

  const filtered = entries.filter((e) => {
    if (filterBilled === "unbilled") return !e.billed;
    if (filterBilled === "billed") return e.billed;
    return true;
  });

  const totalHours = filtered.reduce((sum, e) => sum + e.hours, 0);
  const totalValue = filtered.reduce((sum, e) => sum + e.hours * e.hourly_rate, 0);
  const unbilledValue = entries
    .filter((e) => !e.billed)
    .reduce((sum, e) => sum + e.hours * e.hourly_rate, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;

    const { error } = await supabase.from("biz_time_entries").insert({
      business_id: business.id,
      client_id: form.client_id || null,
      description: form.description,
      hours: parseFloat(form.hours),
      hourly_rate: parseFloat(form.hourly_rate),
      date: form.date,
      notes: form.notes || null,
    });

    if (!error) {
      setShowForm(false);
      setForm({
        client_id: "",
        description: "",
        hours: "",
        hourly_rate: "",
        date: format(new Date(), "yyyy-MM-dd"),
        notes: "",
      });
      fetchData();
    }
  };

  const toggleBilled = async (entry: TimeEntry) => {
    await supabase
      .from("biz_time_entries")
      .update({ billed: !entry.billed })
      .eq("id", entry.id);
    fetchData();
  };

  const deleteEntry = async (id: string) => {
    await supabase.from("biz_time_entries").delete().eq("id", id);
    fetchData();
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Zeiterfassung</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Stunden erfassen und direkt in Rechnungen übernehmen
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Zeit erfassen
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-muted-foreground">Stunden (gefiltert)</p>
            <p className="text-2xl font-bold text-white mt-1">{totalHours.toFixed(1)}h</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-muted-foreground">Wert (gefiltert)</p>
            <p className="text-2xl font-bold text-white mt-1">{formatEuro(totalValue)}</p>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <p className="text-xs text-amber-400">Noch nicht abgerechnet</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{formatEuro(unbilledValue)}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {[
            { key: "all" as const, label: "Alle" },
            { key: "unbilled" as const, label: "Nicht abgerechnet" },
            { key: "billed" as const, label: "Abgerechnet" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterBilled(f.key)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filterBilled === f.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Einträge */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <Clock className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-white font-medium">Keine Einträge</p>
            <p className="text-sm text-muted-foreground mt-1">Erfasse deine erste Arbeitszeit</p>
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Datum</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Beschreibung</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Kunde</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Stunden</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Wert</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Aktion</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry) => (
                  <tr key={entry.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {format(new Date(entry.date), "dd.MM.yyyy", { locale: de })}
                    </td>
                    <td className="px-4 py-3 text-sm text-white">{entry.description}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {entry.client_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-white text-right font-mono">
                      {entry.hours.toFixed(2)}h
                    </td>
                    <td className="px-4 py-3 text-sm text-white text-right font-medium">
                      {formatEuro(entry.hours * entry.hourly_rate)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleBilled(entry)}
                        title={entry.billed ? "Als nicht abgerechnet markieren" : "Als abgerechnet markieren"}
                      >
                        {entry.billed ? (
                          <CheckCircle className="h-5 w-5 text-green-400 mx-auto" />
                        ) : (
                          <Circle className="h-5 w-5 text-amber-400 mx-auto" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="text-muted-foreground hover:text-red-400 transition-colors"
                        title="Löschen"
                      >
                        <Trash2 className="h-4 w-4 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Formular-Dialog */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-zinc-900 p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-white mb-4">Zeit erfassen</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Datum</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                  className="mt-1 h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Beschreibung *</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="z.B. Konzept erstellt, Meeting, Entwicklung..."
                  required
                  className="mt-1 h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Kunde</label>
                <select
                  value={form.client_id}
                  onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                  className="mt-1 h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white"
                >
                  <option value="">Kein Kunde</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Stunden *</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0.25"
                    value={form.hours}
                    onChange={(e) => setForm({ ...form, hours: e.target.value })}
                    placeholder="1.5"
                    required
                    className="mt-1 h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Stundensatz (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.hourly_rate}
                    onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })}
                    placeholder="120"
                    required
                    className="mt-1 h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              {form.hours && form.hourly_rate && (
                <div className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Wert: </span>
                  <span className="font-semibold text-primary">
                    {formatEuro(parseFloat(form.hours || "0") * parseFloat(form.hourly_rate || "0"))}
                  </span>
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-muted-foreground">Notizen</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-muted-foreground resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-md border border-white/10 py-2.5 text-sm text-muted-foreground hover:bg-white/5"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
