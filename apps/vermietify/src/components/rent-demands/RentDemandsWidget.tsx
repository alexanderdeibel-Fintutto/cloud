import { useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight, Clock, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRentDemands, formatRentDemandMonth } from "@/hooks/useRentDemands";

interface RentDemandsWidgetProps {
  buildingId?: string;
  /** Maximale Anzahl anzuzeigender Einträge (default: 5) */
  maxItems?: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function RentDemandsWidget({
  buildingId,
  maxItems = 5,
}: RentDemandsWidgetProps) {
  const navigate = useNavigate();
  const { useRentDemandsList, useRentDemandSummary } = useRentDemands();

  const { data: demands, isLoading: demandsLoading } = useRentDemandsList({
    buildingId,
    overdueOnly: false,
  });
  const { data: summary, isLoading: summaryLoading } = useRentDemandSummary(buildingId);

  const isLoading = demandsLoading || summaryLoading;

  // Sortierung: Überfällige zuerst, dann nach Fälligkeitsdatum
  const sortedDemands = [...(demands ?? [])].sort((a, b) => {
    if (a.overdue_days > 0 && b.overdue_days === 0) return -1;
    if (a.overdue_days === 0 && b.overdue_days > 0) return 1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  const visibleDemands = sortedDemands.slice(0, maxItems);
  const remainingCount = Math.max(0, (demands?.length ?? 0) - maxItems);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Offene Forderungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const hasOverdue = (summary?.overdueCount ?? 0) > 0;

  return (
    <Card className={hasOverdue ? "border-destructive/50" : undefined}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            {hasOverdue ? (
              <AlertCircle className="h-5 w-5 text-destructive" />
            ) : (
              <Clock className="h-5 w-5 text-muted-foreground" />
            )}
            Offene Forderungen
            {(demands?.length ?? 0) > 0 && (
              <Badge variant={hasOverdue ? "destructive" : "secondary"} className="ml-1">
                {demands?.length}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/rent/demands")}
            className="text-xs"
          >
            Alle anzeigen
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>

        {/* Zusammenfassung */}
        {summary && (demands?.length ?? 0) > 0 && (
          <div className="flex gap-4 mt-2 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <TrendingDown className="h-3.5 w-3.5" />
              <span>Gesamt offen:</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(summary.totalOpenAmount)}
              </span>
            </div>
            {summary.overdueCount > 0 && (
              <div className="flex items-center gap-1 text-destructive">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Überfällig:</span>
                <span className="font-semibold">
                  {formatCurrency(summary.totalOverdueAmount)}
                </span>
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-2">
        {visibleDemands.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Keine offenen Forderungen
          </p>
        ) : (
          <>
            {visibleDemands.map((demand) => {
              const isOverdue = demand.overdue_days > 0;
              const isPartial = demand.status === "partial";

              return (
                <div
                  key={demand.id}
                  className={`flex items-center justify-between rounded-lg border p-3 text-sm transition-colors hover:bg-muted/50 cursor-pointer ${
                    isOverdue ? "border-destructive/30 bg-destructive/5" : "border-border"
                  }`}
                  onClick={() => navigate(`/rent/demands?lease=${demand.lease_id}`)}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">
                        {demand.tenant
                          ? `${demand.tenant.first_name} ${demand.tenant.last_name}`
                          : "—"}
                      </span>
                      {isOverdue && (
                        <Badge variant="destructive" className="text-xs shrink-0">
                          {demand.overdue_days} Tage überfällig
                        </Badge>
                      )}
                      {isPartial && !isOverdue && (
                        <Badge variant="outline" className="text-xs shrink-0 border-orange-400 text-orange-600">
                          Teilbezahlt
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {demand.unit
                        ? `${demand.unit.building?.name ?? ""} · ${demand.unit.unit_number}`
                        : "—"}
                      {" · "}
                      {formatRentDemandMonth(demand.charge_year, demand.charge_month)}
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-3">
                    <div className={`font-semibold ${isOverdue ? "text-destructive" : ""}`}>
                      {formatCurrency(demand.open_amount)}
                    </div>
                    {isPartial && (
                      <div className="text-xs text-muted-foreground">
                        von {formatCurrency(demand.total_amount)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {remainingCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={() => navigate("/rent/demands")}
              >
                + {remainingCount} weitere Forderungen anzeigen
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
