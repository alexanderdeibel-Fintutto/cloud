import { AlertCircle, CheckCircle2, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RentDemandsList } from "./RentDemandsList";
import { useRentDemands } from "@/hooks/useRentDemands";

interface TenantRentDemandsProps {
  tenantId: string;
  tenantName?: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function TenantRentDemands({ tenantId, tenantName }: TenantRentDemandsProps) {
  const { useRentDemandsList } = useRentDemands();
  const { data: demands, isLoading } = useRentDemandsList({ tenantId });

  const overdueCount = (demands ?? []).filter((d) => d.overdue_days > 0).length;
  const totalOpen = (demands ?? []).reduce((s, d) => s + Number(d.open_amount), 0);
  const hasIssues = overdueCount > 0 || totalOpen > 0;

  return (
    <Card className={overdueCount > 0 ? "border-destructive/40" : undefined}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            Offene Forderungen
            {tenantName && (
              <span className="text-muted-foreground font-normal">· {tenantName}</span>
            )}
          </CardTitle>

          {isLoading ? (
            <Skeleton className="h-6 w-20" />
          ) : hasIssues ? (
            <div className="flex items-center gap-2">
              {overdueCount > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {overdueCount} überfällig
                </Badge>
              )}
              <span className="text-sm font-semibold text-muted-foreground">
                {formatCurrency(totalOpen)} offen
              </span>
            </div>
          ) : (
            <Badge variant="outline" className="gap-1 text-green-600 border-green-400">
              <CheckCircle2 className="h-3 w-3" />
              Alles bezahlt
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <RentDemandsList tenantId={tenantId} compact />
      </CardContent>
    </Card>
  );
}
