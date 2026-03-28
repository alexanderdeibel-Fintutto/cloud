import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/shared/DataTable";
import { LoadingState, EmptyState } from "@/components/shared";
import { useOperatingCosts, BillingStatus } from "@/hooks/useOperatingCosts";
import { formatCurrency, cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  FileText, Send, Building, Euro, FileUp, Download,
  CheckCircle, Clock, TrendingUp, TrendingDown,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
} from "recharts";
import jsPDF from "jspdf";

const STATUS_CONFIG: Record<BillingStatus, { label: string; icon: any; color: string }> = {
  draft: { label: "Entwurf", icon: Clock, color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  calculated: { label: "Berechnet", icon: CheckCircle, color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  sent: { label: "Versendet", icon: Send, color: "bg-primary/10 text-primary border-primary/20" },
  completed: { label: "Abgeschlossen", icon: CheckCircle, color: "bg-green-500/10 text-green-600 border-green-500/20" },
};

const CHART_COLORS = [
  "hsl(var(--primary))", "#8884d8", "#82ca9d", "#ffc658",
  "#ff7300", "#0088fe", "#00C49F", "#FFBB28",
];

const DISTRIBUTION_KEY_LABELS: Record<string, string> = {
  area: "nach Fläche (m²)",
  persons: "nach Personen",
  units: "nach Einheiten",
  consumption: "nach Verbrauch",
};

export default function OperatingCostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { useBillingsList } = useOperatingCosts();
  const { data: billings, isLoading: billingsLoading } = useBillingsList();

  const billing = useMemo(() => {
    if (!billings || !id) return null;
    return billings.find((b) => b.id === id);
  }, [billings, id]);

  const [buildingId, billingYear] = useMemo(() => {
    if (!id) return [null, null];
    const parts = id.split("-");
    const year = parts[parts.length - 1];
    const bId = parts.slice(0, parts.length - 1).join("-");
    return [bId, parseInt(year)];
  }, [id]);

  const { data: utilityCosts, isLoading: costsLoading } = useQuery({
    queryKey: ["utility_costs", buildingId, billingYear],
    queryFn: async () => {
      if (!buildingId || !billingYear) return [];
      const { data, error } = await supabase
        .from("utility_costs")
        .select("*")
        .eq("building_id", buildingId)
        .eq("billing_year", billingYear)
        .order("cost_type");
      if (error) throw error;
      return data || [];
    },
    enabled: !!buildingId && !!billingYear,
  });

  const { data: tenantResults, isLoading: tenantsLoading } = useQuery({
    queryKey: ["tenant_billing_results", id],
    queryFn: async () => {
      if (!buildingId || !billingYear) return [];
      const { data: billingRow } = await supabase
        .from("operating_cost_billings")
        .select("id")
        .eq("building_id", buildingId)
        .eq("billing_year", billingYear)
        .single();
      if (!billingRow) return [];
      const { data, error } = await supabase
        .from("tenant_billing_results")
        .select("*, tenants(first_name, last_name, email), units(name, area_sqm)")
        .eq("billing_id", billingRow.id)
        .order("tenant_name");
      if (error) throw error;
      return data || [];
    },
    enabled: !!buildingId && !!billingYear,
  });

  const costTypes = utilityCosts || [];
  const tenantList = tenantResults || [];

  const totalCosts = costTypes.reduce((sum: number, c: any) => sum + Number(c.amount || 0), 0);
  const totalPrepaid = tenantList.reduce((sum: number, t: any) => sum + Number(t.prepaid_amount || 0), 0);
  const totalCredits = tenantList.filter((t: any) => Number(t.result_amount) > 0).reduce((sum: number, t: any) => sum + Number(t.result_amount), 0);
  const totalPaymentsDue = tenantList.filter((t: any) => Number(t.result_amount) < 0).reduce((sum: number, t: any) => sum + Math.abs(Number(t.result_amount)), 0);

  const chartData = costTypes.map((c: any) => ({ name: c.cost_type, value: Number(c.amount) / 100 }));

  const handleExportGesamtPDF = () => {
    const doc = new jsPDF();
    const buildingName = billing?.buildings?.name || "Gebäude";
    const year = billingYear || new Date().getFullYear();
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Betriebskostenabrechnung", 15, 15);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`${buildingName} | Abrechnungsjahr ${year}`, 15, 25);
    doc.setTextColor(0, 0, 0);
    let y = 50;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Kostenübersicht", 15, y);
    y += 8;
    doc.setFillColor(240, 240, 240);
    doc.rect(15, y, 180, 8, "F");
    doc.setFontSize(9);
    doc.text("Kostenart", 18, y + 5.5);
    doc.text("Betrag (€)", 130, y + 5.5);
    doc.text("Verteilerschlüssel", 155, y + 5.5);
    y += 10;
    doc.setFont("helvetica", "normal");
    costTypes.forEach((c: any) => {
      doc.text(c.cost_type || "", 18, y + 4);
      doc.text(formatCurrency(Number(c.amount) / 100), 130, y + 4);
      doc.text(DISTRIBUTION_KEY_LABELS[c.distribution_key] || "", 155, y + 4);
      y += 8;
      if (y > 260) { doc.addPage(); y = 20; }
    });
    doc.setDrawColor(37, 99, 235);
    doc.line(15, y, 195, y);
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Gesamtkosten:", 15, y + 4);
    doc.text(formatCurrency(totalCosts / 100), 130, y + 4);
    doc.save(`Betriebskosten_${buildingName.replace(/[^a-zA-Z0-9]/g, "_")}_${year}.pdf`);
    toast({ title: "PDF erstellt", description: "Gesamtabrechnung wurde heruntergeladen." });
  };

  const handleExportTenantPDF = (tenant: any) => {
    const doc = new jsPDF();
    const buildingName = billing?.buildings?.name || "Gebäude";
    const year = billingYear || new Date().getFullYear();
    const result = Number(tenant.result_amount);
    const isCredit = result > 0;
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Betriebskostenabrechnung", 15, 14);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`${buildingName} | ${tenant.unit_name} | ${year}`, 15, 25);
    doc.setTextColor(0, 0, 0);
    let y = 50;
    doc.setFontSize(10);
    doc.text(tenant.tenant_name, 15, y);
    doc.text(tenant.unit_name, 15, y + 7);
    y += 25;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Betriebskostenabrechnung ${year}`, 15, y);
    y += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Sehr geehrte/r ${tenant.tenant_name},`, 15, y);
    y += 15;
    doc.setFillColor(240, 240, 240);
    doc.rect(15, y, 180, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Position", 18, y + 5.5);
    doc.text("Betrag", 170, y + 5.5);
    y += 10;
    doc.setFont("helvetica", "normal");
    doc.text("Ihr Kostenanteil", 18, y + 4);
    doc.text(formatCurrency(Number(tenant.calculated_costs) / 100), 170, y + 4);
    y += 8;
    doc.text("Ihre Vorauszahlungen", 18, y + 4);
    doc.text(`- ${formatCurrency(Number(tenant.prepaid_amount) / 100)}`, 170, y + 4);
    y += 8;
    doc.setDrawColor(37, 99, 235);
    doc.line(15, y, 195, y);
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    if (isCredit) {
      doc.setTextColor(22, 163, 74);
      doc.text("Ihr Guthaben:", 18, y + 5);
      doc.text(`+ ${formatCurrency(Math.abs(result) / 100)}`, 170, y + 5);
    } else {
      doc.setTextColor(220, 38, 38);
      doc.text("Ihre Nachzahlung:", 18, y + 5);
      doc.text(formatCurrency(Math.abs(result) / 100), 170, y + 5);
    }
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text(`Erstellt am ${format(new Date(), "dd.MM.yyyy", { locale: de })}`, 15, 290);
    doc.save(`BK_${tenant.tenant_name.replace(/[^a-zA-Z0-9]/g, "_")}_${year}.pdf`);
    toast({ title: "PDF erstellt", description: `Einzelabrechnung für ${tenant.tenant_name} heruntergeladen.` });
  };

  const costColumns: ColumnDef<any>[] = [
    { accessorKey: "cost_type", header: "Kostenart", cell: ({ row }) => <span className="font-medium">{row.original.cost_type}</span> },
    { accessorKey: "amount", header: "Gesamtbetrag", cell: ({ row }) => formatCurrency(Number(row.original.amount) / 100) },
    { accessorKey: "distribution_key", header: "Verteilerschlüssel", cell: ({ row }) => <Badge variant="outline">{DISTRIBUTION_KEY_LABELS[row.original.distribution_key] || row.original.distribution_key}</Badge> },
  ];

  const tenantColumns: ColumnDef<any>[] = [
    { accessorKey: "tenant_name", header: "Mieter", cell: ({ row }) => <span className="font-medium">{row.original.tenant_name}</span> },
    { accessorKey: "unit_name", header: "Einheit", cell: ({ row }) => <span>{row.original.unit_name}{row.original.area_sqm ? <span className="text-sm text-muted-foreground ml-2">({row.original.area_sqm} m²)</span> : null}</span> },
    { accessorKey: "prepaid_amount", header: "Vorauszahlungen", cell: ({ row }) => formatCurrency(Number(row.original.prepaid_amount) / 100) },
    { accessorKey: "calculated_costs", header: "Anteil Kosten", cell: ({ row }) => formatCurrency(Number(row.original.calculated_costs) / 100) },
    { accessorKey: "result_amount", header: "Ergebnis", cell: ({ row }) => { const r = Number(row.original.result_amount); const isC = r > 0; return <span className={cn("font-semibold flex items-center gap-1", isC ? "text-green-600" : "text-destructive")}>{isC ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}{isC ? "+" : ""}{formatCurrency(r / 100)}<span className="text-xs ml-1">{isC ? "(Guthaben)" : "(Nachzahlung)"}</span></span>; } },
    { id: "pdf", header: "PDF", cell: ({ row }) => <Button variant="ghost" size="sm" onClick={() => handleExportTenantPDF(row.original)}><Download className="h-4 w-4" /></Button> },
  ];

  if (billingsLoading || costsLoading || tenantsLoading) {
    return <MainLayout title="Betriebskostenabrechnung" breadcrumbs={[{ label: "Betriebskosten", href: "/betriebskosten" }, { label: "Details" }]}><LoadingState rows={8} /></MainLayout>;
  }

  const status: BillingStatus = billing?.status || "draft";
  const statusConfig = STATUS_CONFIG[status];
  const StatusIcon = statusConfig.icon;

  return (
    <MainLayout title="Betriebskostenabrechnung" breadcrumbs={[{ label: "Betriebskosten", href: "/betriebskosten" }, { label: billing?.buildings?.name || "Details" }]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Badge className={cn("gap-1.5 px-3 py-1", statusConfig.color)}>
              <StatusIcon className="h-3.5 w-3.5" />
              {statusConfig.label}
            </Badge>
            <span className="text-muted-foreground text-sm">Abrechnungsjahr {billingYear}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportGesamtPDF} className="gap-2">
              <Download className="h-4 w-4" />Gesamtabrechnung PDF
            </Button>
            <Button size="sm" className="gap-2">
              <Send className="h-4 w-4" />An alle Mieter senden
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><Building className="h-5 w-5 text-primary" /></div><div><p className="text-sm text-muted-foreground">Gebäude</p><p className="font-semibold">{billing?.buildings?.name || "—"}</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-blue-500/10"><Euro className="h-5 w-5 text-blue-500" /></div><div><p className="text-sm text-muted-foreground">Gesamtkosten</p><p className="font-semibold">{formatCurrency(totalCosts / 100)}</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-green-500/10"><TrendingUp className="h-5 w-5 text-green-500" /></div><div><p className="text-sm text-muted-foreground">Guthaben gesamt</p><p className="font-semibold text-green-600">{formatCurrency(totalCredits / 100)}</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-destructive/10"><TrendingDown className="h-5 w-5 text-destructive" /></div><div><p className="text-sm text-muted-foreground">Nachzahlungen</p><p className="font-semibold text-destructive">{formatCurrency(totalPaymentsDue / 100)}</p></div></div></CardContent></Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Kostenarten</CardTitle></CardHeader>
            <CardContent>
              {costTypes.length === 0 ? <EmptyState title="Keine Kostendaten" description="Noch keine Betriebskosten erfasst." /> : <DataTable columns={costColumns} data={costTypes} />}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Kostenverteilung</CardTitle></CardHeader>
            <CardContent>
              {chartData.length === 0 ? <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">Keine Daten</div> : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value">
                      {chartData.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Ergebnisse pro Mieter</CardTitle></CardHeader>
          <CardContent>
            {tenantList.length === 0 ? <EmptyState title="Keine Mieter-Abrechnungen" description="Noch keine Mieter-Ergebnisse berechnet." /> : (
              <>
                <DataTable columns={tenantColumns} data={tenantList} />
                <Separator className="my-4" />
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 bg-muted rounded-lg"><p className="text-sm text-muted-foreground">Gesamte Vorauszahlungen</p><p className="font-bold text-lg">{formatCurrency(totalPrepaid / 100)}</p></div>
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg"><p className="text-sm text-green-600">Gesamte Guthaben</p><p className="font-bold text-lg text-green-600">{formatCurrency(totalCredits / 100)}</p></div>
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg"><p className="text-sm text-destructive">Gesamte Nachzahlungen</p><p className="font-bold text-lg text-destructive">{formatCurrency(totalPaymentsDue / 100)}</p></div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Dokumente</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">Generierte Dokumente</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3"><FileText className="h-5 w-5 text-primary" /><div><p className="font-medium">Gesamtabrechnung</p><p className="text-sm text-muted-foreground">BK-Abrechnung_{billingYear}.pdf</p></div></div>
                    <Button variant="ghost" size="sm" onClick={handleExportGesamtPDF}><Download className="h-4 w-4" /></Button>
                  </div>
                  {tenantList.slice(0, 5).map((t: any) => (
                    <div key={t.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3"><FileText className="h-5 w-5 text-muted-foreground" /><div><p className="font-medium">Einzelabrechnung {t.tenant_name}</p><p className="text-sm text-muted-foreground">{t.unit_name}</p></div></div>
                      <Button variant="ghost" size="sm" onClick={() => handleExportTenantPDF(t)}><Download className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  {tenantList.length > 5 && <p className="text-sm text-muted-foreground pl-3">+ {tenantList.length - 5} weitere</p>}
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">Belege & Nachweise</h4>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <FileUp className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">Belege hier hochladen</p>
                  <Button variant="outline" size="sm">Dateien auswählen</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
