import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/DataTable";
import { usePayments } from "@/hooks/usePayments";
import { formatCurrency } from "@/lib/utils";
import { Check, Calendar, Download, FileCode } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { RecordPaymentDialog } from "./RecordPaymentDialog";
import { LoadingState } from "@/components/shared";
import { generateSepaPain001, downloadSepaXml, SepaTransaction } from "@/lib/sepaExport";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function PaymentDueTab() {
  const { useDuePayments, recordPayment } = usePayments();
  const { data: duePayments, isLoading } = useDuePayments();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  const [selectedLease, setSelectedLease] = useState<any>(null);
  const { toast } = useToast();
  const { profile } = useAuth();

  // Lade Organisations-Bankdaten für SEPA-Export
  const { data: orgData } = useQuery({
    queryKey: ["organization_bank", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return null;
      const { data } = await supabase
        .from("organizations")
        .select("name, bank_iban, bank_bic")
        .eq("id", profile.organization_id)
        .single();
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  const handleSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(duePayments?.map((p: any) => p.id) || []);
    } else {
      setSelectedIds([]);
    }
  };

  const handleMarkAsPaid = (lease: any) => {
    setSelectedLease(lease);
    setRecordDialogOpen(true);
  };

  const handleBulkMarkAsPaid = async () => {
    for (const id of selectedIds) {
      const lease = duePayments?.find((p: any) => p.id === id);
      if (lease) {
        await recordPayment.mutateAsync({
          leaseId: lease.id,
          amount: lease.totalDue,
          transactionDate: new Date().toISOString().split("T")[0],
          paymentMethod: "transfer",
          transactionType: "rent",
        });
      }
    }
    setSelectedIds([]);
  };

  const handleSepaExport = () => {
    const selected = selectedIds.length > 0
      ? duePayments?.filter((p: any) => selectedIds.includes(p.id))
      : duePayments;

    if (!selected || selected.length === 0) {
      toast({ title: "Keine Zahlungen", description: "Keine Zahlungen für den Export vorhanden.", variant: "destructive" });
      return;
    }

    // Prüfen ob Vermieter-IBAN vorhanden
    const creditorIban = orgData?.bank_iban || "";
    const creditorBic = orgData?.bank_bic || "";
    const creditorName = orgData?.name || "Vermieter";

    if (!creditorIban) {
      toast({
        title: "IBAN fehlt",
        description: "Bitte hinterlege deine IBAN in den Organisationseinstellungen.",
        variant: "destructive",
      });
      return;
    }

    const transactions: SepaTransaction[] = selected.map((p: any) => ({
      id: p.id,
      tenantName: `${p.tenants?.first_name || ""} ${p.tenants?.last_name || ""}`.trim(),
      tenantIban: p.tenants?.iban || "",
      tenantBic: p.tenants?.bic,
      amount: p.totalDue,
      dueDate: p.dueDate instanceof Date ? p.dueDate.toISOString() : p.dueDate,
      reference: `Miete ${p.units?.unit_number || ""} ${format(
        p.dueDate instanceof Date ? p.dueDate : new Date(p.dueDate),
        "MM/yyyy",
        { locale: de }
      )}`,
    }));

    // Mieter ohne IBAN filtern
    const withIban = transactions.filter((t) => t.tenantIban);
    const withoutIban = transactions.filter((t) => !t.tenantIban);

    if (withoutIban.length > 0) {
      toast({
        title: `${withoutIban.length} Mieter ohne IBAN`,
        description: `${withoutIban.map((t) => t.tenantName).join(", ")} werden übersprungen.`,
      });
    }

    if (withIban.length === 0) {
      toast({ title: "Keine IBANs", description: "Kein Mieter hat eine IBAN hinterlegt.", variant: "destructive" });
      return;
    }

    const xml = generateSepaPain001(withIban, {
      creditorName,
      creditorIban,
      creditorBic,
      executionDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    });

    const filename = `SEPA_Miete_${format(new Date(), "yyyy-MM-dd")}.xml`;
    downloadSepaXml(xml, filename);

    toast({
      title: "SEPA-Datei erstellt",
      description: `${withIban.length} Zahlungen als ${filename} exportiert.`,
    });
  };

  const columns: ColumnDef<any>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={selectedIds.length === duePayments?.length && duePayments?.length > 0}
          onCheckedChange={(checked) => handleSelectAll(!!checked)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedIds.includes(row.original.id)}
          onCheckedChange={(checked) => handleSelect(row.original.id, !!checked)}
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "tenant",
      header: "Mieter",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">
            {row.original.tenants?.first_name} {row.original.tenants?.last_name}
          </p>
          <p className="text-sm text-muted-foreground">{row.original.tenants?.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "unit",
      header: "Einheit",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.units?.unit_number}</p>
          <p className="text-sm text-muted-foreground">
            {row.original.units?.buildings?.name}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "totalDue",
      header: "Betrag",
      cell: ({ row }) => (
        <span className="font-semibold">
          {formatCurrency(row.original.totalDue / 100)}
        </span>
      ),
    },
    {
      accessorKey: "dueDate",
      header: "Fällig am",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {format(row.original.dueDate, "dd.MM.yyyy", { locale: de })}
        </div>
      ),
    },
    {
      accessorKey: "daysRemaining",
      header: "Tage übrig",
      cell: ({ row }) => (
        <Badge variant={row.original.daysRemaining <= 3 ? "destructive" : "secondary"}>
          {row.original.daysRemaining} Tage
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Aktionen",
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleMarkAsPaid(row.original)}
        >
          <Check className="h-4 w-4 mr-1" />
          Als bezahlt
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return <LoadingState rows={5} />;
  }

  return (
    <div className="space-y-4">
      {selectedIds.length > 0 && (
        <Card>
          <CardContent className="py-3 flex items-center justify-between gap-3 flex-wrap">
            <span className="text-sm font-medium">
              {selectedIds.length} Zahlung(en) ausgewählt
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSepaExport}
                className="gap-2"
              >
                <FileCode className="h-4 w-4" />
                SEPA-XML exportieren
              </Button>
              <Button
                onClick={handleBulkMarkAsPaid}
                disabled={recordPayment.isPending}
                size="sm"
                className="gap-2"
              >
                <Check className="h-4 w-4" />
                Alle als bezahlt markieren
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Fällige Zahlungen diesen Monat</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSepaExport}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Alle als SEPA exportieren
          </Button>
        </CardHeader>
        <CardContent>
          {!duePayments || duePayments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Keine fälligen Zahlungen in diesem Monat
            </p>
          ) : (
            <DataTable columns={columns} data={duePayments} />
          )}
        </CardContent>
      </Card>

      <RecordPaymentDialog
        open={recordDialogOpen}
        onOpenChange={setRecordDialogOpen}
        preselectedLease={selectedLease}
      />
    </div>
  );
}
