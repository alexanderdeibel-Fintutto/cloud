import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp,
  Plus,
  Euro,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useLeaseAmendments } from "@/hooks/useLeaseAmendments";
import { LeaseAmendmentDialog } from "./LeaseAmendmentDialog";
import { LeaseAmendmentTimeline } from "./LeaseAmendmentTimeline";

interface CurrentLeaseValues {
  base_rent: number;
  utility_prepayment: number;
  heating_prepayment: number;
  other_costs: number;
}

interface LeaseAmendmentsTabProps {
  leaseId: string;
  currentValues: CurrentLeaseValues;
  tenantName?: string;
}

export function LeaseAmendmentsTab({
  leaseId,
  currentValues,
  tenantName,
}: LeaseAmendmentsTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { useAmendmentsByLease, useAmendmentSummary } = useLeaseAmendments();

  const { data: amendments, isLoading } = useAmendmentsByLease(leaseId);
  const { data: summary } = useAmendmentSummary(
    leaseId,
    currentValues.base_rent,
    currentValues.utility_prepayment,
    currentValues.heating_prepayment
  );

  const pendingCount = amendments?.filter((a) => a.status === "pending").length || 0;
  const announcedCount = amendments?.filter((a) => a.status === "announced").length || 0;
  const activeCount = amendments?.filter((a) => a.status === "active").length || 0;

  return (
    <div className="space-y-6">
      {/* Aktuelle Mietübersicht */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Euro className="h-4 w-4" />
                Aktuelle Miete
              </CardTitle>
              <CardDescription>
                Basierend auf dem Mietvertrag und allen aktiven Änderungen
              </CardDescription>
            </div>
            <Button onClick={() => setDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Änderung anlegen
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Kaltmiete</p>
              <p className="text-xl font-bold">
                {(summary?.currentBaseRent ?? currentValues.base_rent).toFixed(2)} €
              </p>
              {summary && summary.totalRentChange !== 0 && (
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    summary.totalRentChange > 0
                      ? "text-orange-600 border-orange-200"
                      : "text-green-600 border-green-200"
                  }`}
                >
                  {summary.totalRentChange > 0 ? "+" : ""}
                  {summary.totalRentChange.toFixed(2)} € seit Vertragsbeginn
                </Badge>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Nebenkosten</p>
              <p className="text-xl font-bold">
                {(summary?.currentUtility ?? currentValues.utility_prepayment).toFixed(2)} €
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Heizkosten</p>
              <p className="text-xl font-bold">
                {(summary?.currentHeating ?? currentValues.heating_prepayment).toFixed(2)} €
              </p>
            </div>

            <div className="space-y-1 border-l pl-4">
              <p className="text-xs text-muted-foreground">Warmmiete gesamt</p>
              <p className="text-xl font-bold text-primary">
                {(
                  (summary?.currentBaseRent ?? currentValues.base_rent) +
                  (summary?.currentUtility ?? currentValues.utility_prepayment) +
                  (summary?.currentHeating ?? currentValues.heating_prepayment)
                ).toFixed(2)}{" "}
                €
              </p>
            </div>
          </div>

          {/* Nächste geplante Änderung */}
          {summary?.nextPlannedAmendment && (
            <>
              <Separator className="my-4" />
              <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <Clock className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800">
                    Geplante Änderung ab{" "}
                    {format(
                      new Date(summary.nextPlannedAmendment.effective_date),
                      "dd.MM.yyyy",
                      { locale: de }
                    )}
                  </p>
                  <p className="text-xs text-yellow-700">
                    Status: {summary.nextPlannedAmendment.status === "pending" ? "Geplant" : "Angekündigt"}
                    {summary.nextPlannedAmendment.new_base_rent !== null &&
                      ` · Neue Kaltmiete: ${summary.nextPlannedAmendment.new_base_rent.toFixed(2)} €`}
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Statistik-Badges */}
      {amendments && amendments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            {activeCount} aktiv
          </Badge>
          {announcedCount > 0 && (
            <Badge variant="outline" className="gap-1">
              <AlertCircle className="h-3 w-3 text-blue-500" />
              {announcedCount} angekündigt
            </Badge>
          )}
          {pendingCount > 0 && (
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3 text-yellow-500" />
              {pendingCount} geplant
            </Badge>
          )}
          {summary?.lastAmendmentDate && (
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Letzte Änderung:{" "}
              {format(new Date(summary.lastAmendmentDate), "dd.MM.yyyy", { locale: de })}
            </Badge>
          )}
        </div>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Verlauf der Vertragsänderungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LeaseAmendmentTimeline amendments={amendments || []} isLoading={isLoading} />
        </CardContent>
      </Card>

      {/* Dialog */}
      <LeaseAmendmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        leaseId={leaseId}
        currentValues={{
          base_rent: summary?.currentBaseRent ?? currentValues.base_rent,
          utility_prepayment: summary?.currentUtility ?? currentValues.utility_prepayment,
          heating_prepayment: summary?.currentHeating ?? currentValues.heating_prepayment,
          other_costs: currentValues.other_costs,
        }}
        tenantName={tenantName}
      />
    </div>
  );
}
