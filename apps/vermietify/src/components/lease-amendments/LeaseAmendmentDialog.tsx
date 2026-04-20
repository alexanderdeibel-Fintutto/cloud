import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp,
  AlertCircle,
  Calendar,
  Euro,
  Info,
  ArrowRight,
} from "lucide-react";
import { format, addMonths } from "date-fns";
import { de } from "date-fns/locale";
import {
  useLeaseAmendments,
  type AmendmentType,
  type LeaseAmendmentFormData,
  AMENDMENT_TYPE_LABELS,
  LEGAL_BASIS_OPTIONS,
} from "@/hooks/useLeaseAmendments";

interface CurrentLeaseValues {
  base_rent: number;
  utility_prepayment: number;
  heating_prepayment: number;
  other_costs: number;
}

interface LeaseAmendmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leaseId: string;
  currentValues: CurrentLeaseValues;
  tenantName?: string;
}

const AMENDMENT_TYPES: { value: AmendmentType; description: string }[] = [
  {
    value: "rent_increase",
    description: "Erhöhung der Kaltmiete nach § 558 BGB oder Modernisierung",
  },
  {
    value: "utility_adjustment",
    description: "Anpassung der Betriebs- oder Heizkostenvorauszahlung",
  },
  {
    value: "contract_extension",
    description: "Verlängerung eines befristeten Mietvertrags",
  },
  {
    value: "special_agreement",
    description: "Sondervereinbarung oder Zusatzklausel",
  },
  { value: "other", description: "Sonstige Vertragsänderung" },
];

export function LeaseAmendmentDialog({
  open,
  onOpenChange,
  leaseId,
  currentValues,
  tenantName,
}: LeaseAmendmentDialogProps) {
  const { createAmendment } = useLeaseAmendments();

  const [amendmentType, setAmendmentType] = useState<AmendmentType>("rent_increase");
  const [effectiveDate, setEffectiveDate] = useState<string>(() => {
    // Standard: 3 Monate in der Zukunft (gesetzliche Ankündigungsfrist)
    return format(addMonths(new Date(), 3), "yyyy-MM-dd");
  });
  const [announcementDate, setAnnouncementDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [newBaseRent, setNewBaseRent] = useState<string>(
    currentValues.base_rent.toFixed(2)
  );
  const [newUtility, setNewUtility] = useState<string>(
    currentValues.utility_prepayment.toFixed(2)
  );
  const [newHeating, setNewHeating] = useState<string>(
    currentValues.heating_prepayment.toFixed(2)
  );
  const [legalBasis, setLegalBasis] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Werte zurücksetzen wenn Dialog geöffnet wird
  useEffect(() => {
    if (open) {
      setAmendmentType("rent_increase");
      setEffectiveDate(format(addMonths(new Date(), 3), "yyyy-MM-dd"));
      setAnnouncementDate(format(new Date(), "yyyy-MM-dd"));
      setNewBaseRent(currentValues.base_rent.toFixed(2));
      setNewUtility(currentValues.utility_prepayment.toFixed(2));
      setNewHeating(currentValues.heating_prepayment.toFixed(2));
      setLegalBasis("");
      setNotes("");
    }
  }, [open, currentValues]);

  // Berechnungen
  const parsedNewBaseRent = parseFloat(newBaseRent) || 0;
  const parsedNewUtility = parseFloat(newUtility) || 0;
  const parsedNewHeating = parseFloat(newHeating) || 0;

  const rentDiff = parsedNewBaseRent - currentValues.base_rent;
  const utilityDiff = parsedNewUtility - currentValues.utility_prepayment;
  const heatingDiff = parsedNewHeating - currentValues.heating_prepayment;
  const totalDiff = rentDiff + utilityDiff + heatingDiff;

  const oldTotal =
    currentValues.base_rent +
    currentValues.utility_prepayment +
    currentValues.heating_prepayment;
  const newTotal = parsedNewBaseRent + parsedNewUtility + parsedNewHeating;
  const percentChange = oldTotal > 0 ? (totalDiff / oldTotal) * 100 : 0;

  // Ankündigungsfrist prüfen (§ 558b BGB: mind. 3 Monate)
  const effectiveDateObj = new Date(effectiveDate);
  const announcementDateObj = new Date(announcementDate);
  const monthsDiff =
    (effectiveDateObj.getFullYear() - announcementDateObj.getFullYear()) * 12 +
    (effectiveDateObj.getMonth() - announcementDateObj.getMonth());
  const hasValidNoticePeriod = monthsDiff >= 3;

  const handleSubmit = async () => {
    const formData: LeaseAmendmentFormData = {
      amendment_type: amendmentType,
      effective_date: effectiveDate,
      announcement_date: announcementDate || null,
      legal_basis: legalBasis || null,
      notes: notes || null,
    };

    // Nur geänderte Werte übergeben
    if (amendmentType === "rent_increase" || amendmentType === "utility_adjustment") {
      if (parsedNewBaseRent !== currentValues.base_rent) {
        formData.new_base_rent = parsedNewBaseRent;
      }
      if (parsedNewUtility !== currentValues.utility_prepayment) {
        formData.new_utility_prepayment = parsedNewUtility;
      }
      if (parsedNewHeating !== currentValues.heating_prepayment) {
        formData.new_heating_prepayment = parsedNewHeating;
      }
    }

    await createAmendment.mutateAsync({
      leaseId,
      formData,
      currentValues,
    });

    onOpenChange(false);
  };

  const showRentFields =
    amendmentType === "rent_increase" || amendmentType === "utility_adjustment";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Vertragsänderung anlegen
          </DialogTitle>
          <DialogDescription>
            {tenantName ? `Mietvertrag: ${tenantName}` : "Neue Vertragsänderung"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Änderungstyp */}
          <div className="space-y-2">
            <Label>Art der Änderung *</Label>
            <div className="grid grid-cols-1 gap-2">
              {AMENDMENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setAmendmentType(type.value)}
                  className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${
                    amendmentType === type.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div
                    className={`w-4 h-4 mt-0.5 rounded-full border-2 flex-shrink-0 ${
                      amendmentType === type.value
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    }`}
                  />
                  <div>
                    <p className="font-medium text-sm">
                      {AMENDMENT_TYPE_LABELS[type.value]}
                    </p>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Beträge */}
          {showRentFields && (
            <div className="space-y-4">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Euro className="h-4 w-4" />
                Neue Beträge
              </h4>

              <div className="grid grid-cols-3 gap-4">
                {/* Kaltmiete */}
                <div className="space-y-2">
                  <Label>Kaltmiete (€/Monat)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newBaseRent}
                    onChange={(e) => setNewBaseRent(e.target.value)}
                  />
                  {rentDiff !== 0 && (
                    <p
                      className={`text-xs font-medium ${
                        rentDiff > 0 ? "text-orange-600" : "text-green-600"
                      }`}
                    >
                      {rentDiff > 0 ? "+" : ""}
                      {rentDiff.toFixed(2)} €
                    </p>
                  )}
                </div>

                {/* Nebenkosten */}
                <div className="space-y-2">
                  <Label>Nebenkosten (€/Monat)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newUtility}
                    onChange={(e) => setNewUtility(e.target.value)}
                  />
                  {utilityDiff !== 0 && (
                    <p
                      className={`text-xs font-medium ${
                        utilityDiff > 0 ? "text-orange-600" : "text-green-600"
                      }`}
                    >
                      {utilityDiff > 0 ? "+" : ""}
                      {utilityDiff.toFixed(2)} €
                    </p>
                  )}
                </div>

                {/* Heizkosten */}
                <div className="space-y-2">
                  <Label>Heizkosten (€/Monat)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newHeating}
                    onChange={(e) => setNewHeating(e.target.value)}
                  />
                  {heatingDiff !== 0 && (
                    <p
                      className={`text-xs font-medium ${
                        heatingDiff > 0 ? "text-orange-600" : "text-green-600"
                      }`}
                    >
                      {heatingDiff > 0 ? "+" : ""}
                      {heatingDiff.toFixed(2)} €
                    </p>
                  )}
                </div>
              </div>

              {/* Zusammenfassung */}
              {totalDiff !== 0 && (
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">{oldTotal.toFixed(2)} €</span>
                        <span className="mx-1 text-xs">Warmmiete bisher</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        <span className="font-bold text-base">{newTotal.toFixed(2)} €</span>
                        <span className="ml-1 text-xs text-muted-foreground">neu</span>
                      </div>
                    </div>
                    <Badge
                      variant={totalDiff > 0 ? "destructive" : "default"}
                      className={totalDiff <= 0 ? "bg-green-500" : ""}
                    >
                      {totalDiff > 0 ? "+" : ""}
                      {totalDiff.toFixed(2)} € ({percentChange.toFixed(1)} %)
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* Daten */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Ankündigungsdatum
              </Label>
              <Input
                type="date"
                value={announcementDate}
                onChange={(e) => setAnnouncementDate(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Datum des Ankündigungsschreibens
              </p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Gültig ab *
              </Label>
              <Input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                min={format(new Date(), "yyyy-MM-dd")}
              />
              {!hasValidNoticePeriod && amendmentType === "rent_increase" && (
                <p className="text-xs text-orange-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Weniger als 3 Monate Ankündigungsfrist (§ 558b BGB)
                </p>
              )}
              {hasValidNoticePeriod && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  {monthsDiff} Monate Frist — gesetzlich korrekt
                </p>
              )}
            </div>
          </div>

          {/* Rechtliche Grundlage */}
          {(amendmentType === "rent_increase") && (
            <div className="space-y-2">
              <Label>Rechtliche Grundlage</Label>
              <Select value={legalBasis} onValueChange={setLegalBasis}>
                <SelectTrigger>
                  <SelectValue placeholder="Bitte wählen..." />
                </SelectTrigger>
                <SelectContent>
                  {LEGAL_BASIS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Notizen */}
          <div className="space-y-2">
            <Label>Notizen / Begründung</Label>
            <Textarea
              placeholder="Optionale Begründung oder Hinweise zur Vertragsänderung..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Hinweis */}
          {amendmentType === "rent_increase" && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Wichtig:</strong> Die Mieterhöhung muss dem Mieter schriftlich angekündigt
                werden (§ 558a BGB). Die gesetzliche Ankündigungsfrist beträgt mindestens 3 Monate
                (§ 558b BGB). Die Änderung wird als „Geplant" gespeichert und kann nach dem
                Versand des Ankündigungsschreibens auf „Angekündigt" gesetzt werden.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createAmendment.isPending || !effectiveDate}
          >
            {createAmendment.isPending ? "Wird gespeichert..." : "Vertragsänderung speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
