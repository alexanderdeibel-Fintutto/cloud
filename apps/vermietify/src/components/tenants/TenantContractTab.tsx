import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared";
import {
  FileText,
  Calendar,
  Euro,
  Shield,
  CheckCircle,
  XCircle,
  TrendingUp,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import { LeaseAmendmentsTab } from "@/components/lease-amendments/LeaseAmendmentsTab";

interface TenantContractTabProps {
  tenant: any;
}

export function TenantContractTab({ tenant }: TenantContractTabProps) {
  const activeLease = tenant.activeLease;

  if (!activeLease) {
    return (
      <Card>
        <CardContent className="py-8">
          <EmptyState
            icon={FileText}
            title="Kein aktiver Mietvertrag"
            description="Dieser Mieter hat derzeit keinen aktiven Mietvertrag."
          />
        </CardContent>
      </Card>
    );
  }

  const unit = activeLease.units;
  const building = unit?.buildings;

  // Aktuelle Mietwerte aus dem Vertrag (in Euro, nicht Cents)
  // Die leases-View gibt Werte in Euro zurück (lease_contracts in Euro)
  const currentValues = {
    base_rent: activeLease.rent_amount
      ? activeLease.rent_amount > 1000
        ? activeLease.rent_amount / 100  // Cents → Euro
        : activeLease.rent_amount         // bereits Euro
      : 0,
    utility_prepayment: activeLease.utility_advance
      ? activeLease.utility_advance > 500
        ? activeLease.utility_advance / 100
        : activeLease.utility_advance
      : 0,
    heating_prepayment: activeLease.heating_advance
      ? activeLease.heating_advance > 500
        ? activeLease.heating_advance / 100
        : activeLease.heating_advance
      : 0,
    other_costs: 0,
  };

  const tenantName = `${tenant.first_name} ${tenant.last_name}`;

  return (
    <div className="space-y-6">
      {/* Mietvertrag-Übersicht */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Mietvertrag
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Aktiv
              </Badge>
              {activeLease.id && (
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/contracts/${activeLease.id}`}>
                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                    Details
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mietobjekt */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Mietobjekt</p>
            <p className="font-semibold">
              {unit?.unit_number} • {building?.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {building?.address}, {building?.postal_code} {building?.city}
            </p>
          </div>

          {/* Eckdaten */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Mietbeginn
              </div>
              <p className="font-medium">
                {format(new Date(activeLease.start_date), "dd.MM.yyyy", { locale: de })}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Mietende
              </div>
              <p className="font-medium">
                {activeLease.end_date
                  ? format(new Date(activeLease.end_date), "dd.MM.yyyy", { locale: de })
                  : "Unbefristet"}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Euro className="h-4 w-4" />
                Kaltmiete
              </div>
              <p className="font-medium">{formatCurrency(currentValues.base_rent)}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Euro className="h-4 w-4" />
                Nebenkosten
              </div>
              <p className="font-medium">
                {formatCurrency(currentValues.utility_prepayment)}
              </p>
            </div>
          </div>

          {/* Kaution */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Kaution</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(
                        activeLease.deposit_amount
                          ? activeLease.deposit_amount > 10000
                            ? activeLease.deposit_amount / 100
                            : activeLease.deposit_amount
                          : 0
                      )}
                    </p>
                  </div>
                </div>
                <Badge variant={activeLease.deposit_paid ? "default" : "destructive"}>
                  {activeLease.deposit_paid ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Gezahlt
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      Ausstehend
                    </>
                  )}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {activeLease.notes && (
            <div>
              <h4 className="font-medium mb-2">Sondervereinbarungen</h4>
              <p className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
                {activeLease.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vertragsänderungen / Mieterhöhungen */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold">Vertragsänderungen & Mieterhöhungen</h3>
        </div>
        <LeaseAmendmentsTab
          leaseId={activeLease.id}
          currentValues={currentValues}
          tenantName={tenantName}
        />
      </div>
    </div>
  );
}
