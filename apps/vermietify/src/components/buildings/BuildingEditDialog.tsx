import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, Building2, Calculator, Receipt } from "lucide-react";
import { useBuildings } from "@/hooks/useBuildings";
import type { Database } from "@/integrations/supabase/types";

type BuildingRow = Database["public"]["Tables"]["buildings"]["Row"];

interface BuildingEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  building: BuildingRow;
}

export function BuildingEditDialog({ open, onOpenChange, building }: BuildingEditDialogProps) {
  const { updateBuilding } = useBuildings();

  const [form, setForm] = useState({
    // Stammdaten
    name: "",
    address: "",
    postal_code: "",
    city: "",
    building_type: "apartment",
    year_built: "",
    total_area: "",
    notes: "",
    // Kaufdaten
    purchase_price: "",
    purchase_date: "",
    land_value: "",
    building_value: "",
    // AfA-Felder (Anlage V, Zeile 33)
    afa_basis: "",
    afa_rate: "0.02",
    afa_start_year: "",
    afa_method: "linear" as "linear" | "degressive",
    // Steuer
    tax_number: "",
    elster_id: "",
  });

  // Berechneter AfA-Jahresbetrag
  const afaJahrlich = form.afa_basis && form.afa_rate
    ? (parseFloat(form.afa_basis) * parseFloat(form.afa_rate)).toFixed(2)
    : null;

  // Gebäudewert automatisch berechnen wenn Kaufpreis und Grundstückswert vorhanden
  const buildingValueCalc = form.purchase_price && form.land_value
    ? (parseFloat(form.purchase_price) - parseFloat(form.land_value)).toFixed(2)
    : null;

  useEffect(() => {
    if (building && open) {
      setForm({
        name: building.name || "",
        address: (building as any).address || (building as any).street || "",
        postal_code: (building as any).postal_code || (building as any).zip || "",
        city: building.city || "",
        building_type: building.building_type || "apartment",
        year_built: building.year_built?.toString() || "",
        total_area: building.total_area?.toString() || "",
        notes: building.notes || "",
        purchase_price: (building as any).purchase_price?.toString() || "",
        purchase_date: (building as any).purchase_date || "",
        land_value: (building as any).land_value?.toString() || "",
        building_value: (building as any).building_value?.toString() || "",
        afa_basis: (building as any).afa_basis?.toString() || "",
        afa_rate: (building as any).afa_rate?.toString() || "0.02",
        afa_start_year: (building as any).afa_start_year?.toString() || "",
        afa_method: (building as any).afa_method || "linear",
        tax_number: (building as any).tax_number || "",
        elster_id: (building as any).elster_id || "",
      });
    }
  }, [building, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBuilding.mutate(
      {
        id: building.id,
        data: {
          name: form.name,
          street: form.address,
          zip: form.postal_code,
          city: form.city,
          building_type: form.building_type as "apartment" | "commercial" | "house" | "mixed",
          year_built: form.year_built ? parseInt(form.year_built) : undefined,
          total_area: form.total_area ? parseFloat(form.total_area) : undefined,
          notes: form.notes || undefined,
          // Kaufdaten
          purchase_price: form.purchase_price ? parseFloat(form.purchase_price) : undefined,
          purchase_date: form.purchase_date || undefined,
          land_value: form.land_value ? parseFloat(form.land_value) : undefined,
          building_value: form.building_value
            ? parseFloat(form.building_value)
            : buildingValueCalc
            ? parseFloat(buildingValueCalc)
            : undefined,
          // AfA
          afa_basis: form.afa_basis ? parseFloat(form.afa_basis) : undefined,
          afa_rate: form.afa_rate ? parseFloat(form.afa_rate) : undefined,
          afa_start_year: form.afa_start_year ? parseInt(form.afa_start_year) : undefined,
          afa_method: form.afa_method,
          // Steuer
          tax_number: form.tax_number || undefined,
          elster_id: form.elster_id || undefined,
        },
      },
      {
        onSuccess: () => onOpenChange(false),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Gebäude bearbeiten
            </DialogTitle>
            <DialogDescription>
              Stammdaten, Kaufinformationen und Steuer-/AfA-Daten für die Anlage V
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="stammdaten" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="stammdaten">
                <Building2 className="h-4 w-4 mr-1" />
                Stammdaten
              </TabsTrigger>
              <TabsTrigger value="kauf">
                <Receipt className="h-4 w-4 mr-1" />
                Kauf &amp; Wert
              </TabsTrigger>
              <TabsTrigger value="steuer">
                <Calculator className="h-4 w-4 mr-1" />
                AfA &amp; Steuer
              </TabsTrigger>
            </TabsList>

            {/* ── Tab 1: Stammdaten ── */}
            <TabsContent value="stammdaten" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Straße &amp; Hausnummer *</Label>
                <Input
                  id="edit-address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-postal">PLZ *</Label>
                  <Input
                    id="edit-postal"
                    value={form.postal_code}
                    onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-city">Stadt *</Label>
                  <Input
                    id="edit-city"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Gebäudetyp</Label>
                <Select
                  value={form.building_type}
                  onValueChange={(value) => setForm({ ...form, building_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Mehrfamilienhaus</SelectItem>
                    <SelectItem value="house">Einfamilienhaus</SelectItem>
                    <SelectItem value="commercial">Gewerbe</SelectItem>
                    <SelectItem value="mixed">Gemischt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-year">Baujahr</Label>
                  <Input
                    id="edit-year"
                    type="number"
                    min="1800"
                    max="2030"
                    value={form.year_built}
                    onChange={(e) => setForm({ ...form, year_built: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-area">Gesamtfläche (m²)</Label>
                  <Input
                    id="edit-area"
                    type="number"
                    step="0.01"
                    value={form.total_area}
                    onChange={(e) => setForm({ ...form, total_area: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notizen</Label>
                <Textarea
                  id="edit-notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </TabsContent>

            {/* ── Tab 2: Kauf & Wert ── */}
            <TabsContent value="kauf" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchase-price">Kaufpreis (€)</Label>
                  <Input
                    id="purchase-price"
                    type="number"
                    step="0.01"
                    placeholder="z.B. 450000"
                    value={form.purchase_price}
                    onChange={(e) => setForm({ ...form, purchase_price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchase-date">Kaufdatum</Label>
                  <Input
                    id="purchase-date"
                    type="date"
                    value={form.purchase_date}
                    onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
                  />
                </div>
              </div>

              <Separator />
              <p className="text-sm text-muted-foreground">
                Für die AfA-Berechnung wird der Gebäudewert benötigt (Kaufpreis abzüglich Grundstückswert).
                Der Grundstückswert ist <strong>nicht abschreibbar</strong>.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="land-value">Grundstückswert (€)</Label>
                  <Input
                    id="land-value"
                    type="number"
                    step="0.01"
                    placeholder="z.B. 120000"
                    value={form.land_value}
                    onChange={(e) => setForm({ ...form, land_value: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Nicht abschreibbar</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="building-value">Gebäudewert (€)</Label>
                  <Input
                    id="building-value"
                    type="number"
                    step="0.01"
                    placeholder={buildingValueCalc ? `Berechnet: ${buildingValueCalc}` : "z.B. 330000"}
                    value={form.building_value}
                    onChange={(e) => setForm({ ...form, building_value: e.target.value })}
                  />
                  {buildingValueCalc && !form.building_value && (
                    <p className="text-xs text-primary">
                      Automatisch: {parseFloat(buildingValueCalc).toLocaleString("de-DE")} €
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* ── Tab 3: AfA & Steuer ── */}
            <TabsContent value="steuer" className="space-y-4 pt-4">
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p className="font-medium mb-1">Anlage V – Zeile 33: Absetzung für Abnutzung (AfA)</p>
                <p className="text-muted-foreground">
                  Standard: 2 % p.a. für Gebäude nach 1925 (§ 7 Abs. 4 EStG).
                  Ältere Gebäude: 2,5 %. Denkmalschutz: erhöhte Abschreibung möglich.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="afa-basis">AfA-Bemessungsgrundlage (€)</Label>
                  <Input
                    id="afa-basis"
                    type="number"
                    step="0.01"
                    placeholder={buildingValueCalc || "z.B. 330000"}
                    value={form.afa_basis}
                    onChange={(e) => setForm({ ...form, afa_basis: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Normalerweise = Gebäudewert (ohne Grundstück)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="afa-rate">AfA-Satz (%)</Label>
                  <Select
                    value={form.afa_rate}
                    onValueChange={(v) => setForm({ ...form, afa_rate: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.02">2,0 % (Gebäude nach 1925)</SelectItem>
                      <SelectItem value="0.025">2,5 % (Gebäude vor 1925)</SelectItem>
                      <SelectItem value="0.03">3,0 % (Denkmalschutz)</SelectItem>
                      <SelectItem value="0.04">4,0 % (Sonderabschreibung)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="afa-start">AfA-Beginn (Jahr)</Label>
                  <Input
                    id="afa-start"
                    type="number"
                    min="1950"
                    max="2030"
                    placeholder="z.B. 2020"
                    value={form.afa_start_year}
                    onChange={(e) => setForm({ ...form, afa_start_year: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="afa-method">AfA-Methode</Label>
                  <Select
                    value={form.afa_method}
                    onValueChange={(v) => setForm({ ...form, afa_method: v as "linear" | "degressive" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linear">Linear (Standard)</SelectItem>
                      <SelectItem value="degressive">Degressiv</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {afaJahrlich && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <p className="text-sm font-medium text-primary">
                    Jährliche AfA: {parseFloat(afaJahrlich).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Anlage V Zeile 33 – wird automatisch in der Steuererklärung eingetragen
                  </p>
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tax-number">Steuernummer (Finanzamt)</Label>
                  <Input
                    id="tax-number"
                    placeholder="z.B. 27/123/45678"
                    value={form.tax_number}
                    onChange={(e) => setForm({ ...form, tax_number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="elster-id">ELSTER-ID / Aktenzeichen</Label>
                  <Input
                    id="elster-id"
                    placeholder="Optional"
                    value={form.elster_id}
                    onChange={(e) => setForm({ ...form, elster_id: e.target.value })}
                  />
                </div>
              </div>

              <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">Anlage V – Relevante Zeilen für dieses Gebäude:</p>
                <p>Z. 7 – Mieteinnahmen (Kaltmiete)</p>
                <p>Z. 33 – AfA: {afaJahrlich ? `${parseFloat(afaJahrlich).toLocaleString("de-DE")} €/Jahr` : "Bitte AfA-Basis eingeben"}</p>
                <p>Z. 47 – Erhaltungsaufwand (Reparaturen)</p>
                <p>Z. 49 – Versicherungen</p>
                <p>Z. 50 – Betriebskosten</p>
                <p>Z. 51 – Grundsteuer</p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={updateBuilding.isPending}>
              {updateBuilding.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Speichern
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
