import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertCircle, Euro, TrendingDown, Users } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RentDemandsList } from "@/components/rent-demands/RentDemandsList";
import { useRentDemands } from "@/hooks/useRentDemands";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
  isLoading,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  variant?: "default" | "destructive" | "warning";
  isLoading?: boolean;
}) {
  const colorMap = {
    default: "text-primary",
    destructive: "text-destructive",
    warning: "text-orange-500",
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Icon className={`h-4 w-4 ${colorMap[variant]}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-7 w-24" />
        ) : (
          <>
            <p className={`text-2xl font-bold ${colorMap[variant]}`}>{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function RentDemandsPage() {
  const [searchParams] = useSearchParams();
  const leaseIdFromUrl = searchParams.get("lease") ?? undefined;

  const { useRentDemandSummary } = useRentDemands();
  const { data: summary, isLoading: summaryLoading } = useRentDemandSummary();

  return (
    <MainLayout
      title="Offene Forderungen"
      breadcrumbs={[{ label: "Finanzen", href: "/finances" }, { label: "Offene Forderungen" }]}
    >
      <div className="space-y-6">
        {/* KPI-Karten */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="Offene Forderungen"
            value={String(summary?.totalOpen ?? 0)}
            subtitle="Noch nicht bezahlte Sollstellungen"
            icon={Euro}
            isLoading={summaryLoading}
          />
          <SummaryCard
            title="Gesamtbetrag offen"
            value={formatCurrency(summary?.totalOpenAmount ?? 0)}
            subtitle="Summe aller offenen Beträge"
            icon={TrendingDown}
            isLoading={summaryLoading}
          />
          <SummaryCard
            title="Überfällig"
            value={String(summary?.overdueCount ?? 0)}
            subtitle="Forderungen nach Fälligkeitsdatum"
            icon={AlertCircle}
            variant={summary && summary.overdueCount > 0 ? "destructive" : "default"}
            isLoading={summaryLoading}
          />
          <SummaryCard
            title="Überfälliger Betrag"
            value={formatCurrency(summary?.totalOverdueAmount ?? 0)}
            subtitle="Summe überfälliger Forderungen"
            icon={Users}
            variant={summary && summary.totalOverdueAmount > 0 ? "destructive" : "default"}
            isLoading={summaryLoading}
          />
        </div>

        {/* Haupttabelle */}
        <Card>
          <CardHeader>
            <CardTitle>Alle offenen Forderungen</CardTitle>
          </CardHeader>
          <CardContent>
            <RentDemandsList leaseId={leaseIdFromUrl} />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
