import { useState, useEffect } from "react";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AddressAutocomplete } from "@/components/address/AddressAutocomplete";
import { IconBadge } from "@/components/ui/IconBadge";
import { 
  Building2, 
  Plus, 
  Loader2, 
  ChevronRight,
  MapPin,
  Calendar,
  Home
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Building {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  year_built: number | null;
  total_units: number | null;
  created_at: string | null;
}

interface AddressDetails {
  valid: boolean;
  formattedAddress: string;
  street: string;
  streetNumber: string;
  city: string;
  postalCode: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
}

export function BuildingManagement() {
  const { user } = useAuth();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    yearBuilt: "",
    totalUnits: "",
  });
  const [selectedAddress, setSelectedAddress] = useState<AddressDetails | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      const { data, error } = await supabase
        .from("buildings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBuildings(data || []);
    } catch (error) {
      console.error("Error fetching buildings:", error);
      toast.error("Fehler beim Laden der Gebäude");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Bitte geben Sie einen Gebäudenamen ein";
    }

    if (!selectedAddress) {
      errors.address = "Bitte wählen Sie eine gültige Adresse aus der Liste";
    }

    if (formData.yearBuilt && (isNaN(Number(formData.yearBuilt)) || Number(formData.yearBuilt) < 1800 || Number(formData.yearBuilt) > new Date().getFullYear())) {
      errors.yearBuilt = "Bitte geben Sie ein gültiges Baujahr ein";
    }

    if (formData.totalUnits && (isNaN(Number(formData.totalUnits)) || Number(formData.totalUnits) < 1)) {
      errors.totalUnits = "Bitte geben Sie eine gültige Anzahl ein";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Bitte korrigieren Sie die markierten Felder");
      return;
    }

    if (!selectedAddress) {
      toast.error("Adresse muss über Google Maps verifiziert werden");
      return;
    }

    setIsSaving(true);

    try {
      // Get user's organization_id from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("user_id", user?.id)
        .single();

      const buildingData = {
        name: formData.name.trim(),
        address: `${selectedAddress.street} ${selectedAddress.streetNumber}`.trim(),
        city: selectedAddress.city,
        postal_code: selectedAddress.postalCode,
        country: selectedAddress.countryCode,
        year_built: formData.yearBuilt ? Number(formData.yearBuilt) : null,
        total_units: formData.totalUnits ? Number(formData.totalUnits) : null,
        organization_id: profile?.organization_id || null,
      };

      const { error } = await supabase
        .from("buildings")
        .insert(buildingData);

      if (error) throw error;

      toast.success("Gebäude erfolgreich angelegt");
      setIsDialogOpen(false);
      resetForm();
      fetchBuildings();
    } catch (error: any) {
      console.error("Error creating building:", error);
      toast.error(error.message || "Fehler beim Anlegen des Gebäudes");
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", yearBuilt: "", totalUnits: "" });
    setSelectedAddress(null);
    setFormErrors({});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Gebäudeverwaltung
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Gebäude anlegen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Neues Gebäude anlegen
              </DialogTitle>
              <DialogDescription>
                Die Adresse wird über Google Maps verifiziert. Nur reale Gebäude können angelegt werden.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              {/* Building Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Gebäudename <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="z.B. Haupthaus, Gartenhaus..."
                  className={formErrors.name ? "border-destructive" : ""}
                />
                {formErrors.name && (
                  <p className="text-sm text-destructive">{formErrors.name}</p>
                )}
              </div>

              {/* Address Autocomplete */}
              <AddressAutocomplete
                onAddressSelect={setSelectedAddress}
                required
                error={formErrors.address}
                label="Straße und Hausnummer"
                placeholder="z.B. Musterstraße 123"
              />

              {/* Year Built */}
              <div className="space-y-2">
                <Label htmlFor="yearBuilt">Baujahr</Label>
                <Input
                  id="yearBuilt"
                  type="number"
                  value={formData.yearBuilt}
                  onChange={(e) => setFormData({ ...formData, yearBuilt: e.target.value })}
                  placeholder="z.B. 1990"
                  min={1800}
                  max={new Date().getFullYear()}
                  className={formErrors.yearBuilt ? "border-destructive" : ""}
                />
                {formErrors.yearBuilt && (
                  <p className="text-sm text-destructive">{formErrors.yearBuilt}</p>
                )}
              </div>

              {/* Total Units */}
              <div className="space-y-2">
                <Label htmlFor="totalUnits">Anzahl Wohneinheiten</Label>
                <Input
                  id="totalUnits"
                  type="number"
                  value={formData.totalUnits}
                  onChange={(e) => setFormData({ ...formData, totalUnits: e.target.value })}
                  placeholder="z.B. 12"
                  min={1}
                  className={formErrors.totalUnits ? "border-destructive" : ""}
                />
                {formErrors.totalUnits && (
                  <p className="text-sm text-destructive">{formErrors.totalUnits}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Abbrechen
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving || !selectedAddress}
                  className="flex-1"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Speichern...
                    </>
                  ) : (
                    "Gebäude anlegen"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Buildings List */}
      {buildings.length === 0 ? (
        <AnimatedCard>
          <CardContent className="py-8 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              Noch keine Gebäude angelegt
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Klicken Sie auf "Gebäude anlegen" um zu beginnen
            </p>
          </CardContent>
        </AnimatedCard>
      ) : (
        <AnimatedCard>
          <div className="divide-y divide-border/50">
            {buildings.map((building) => (
              <CardContent
                key={building.id}
                className="p-4 flex items-center gap-4 cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{building.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">
                      {building.address}, {building.postal_code} {building.city}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    {building.year_built && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {building.year_built}
                      </span>
                    )}
                    {building.total_units && (
                      <span className="flex items-center gap-1">
                        <Home className="h-3 w-3" />
                        {building.total_units} Einheiten
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              </CardContent>
            ))}
          </div>
        </AnimatedCard>
      )}
    </div>
  );
}