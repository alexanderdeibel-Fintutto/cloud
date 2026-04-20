import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Filter,
  RefreshCw,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  useRentDemands,
  useRentDemandsForTenant,
  formatRentDemandMonth,
  getRentDemandStatusLabel,
  type RentDemandWithDetails,
  type RentDemandFilters,
} from "@/hooks/useRentDemands";

// Re-export for convenience
export { useRentDemandsForTenant };

interface RentDemandsListProps {
  /** Wenn gesetzt, werden nur Forderungen dieses Mietvertrags angezeigt */
  leaseId?: string;
  /** Wenn gesetzt, werden nur Forderungen dieses Mieters angezeigt */
  tenantId?: string;
  /** Wenn gesetzt, werden nur Forderungen dieses Gebäudes angezeigt */
  buildingId?: string;
  /** Kompakte Ansicht ohne Filter-Bar (für Mieter-Profil) */
  compact?: boolean;
  /** Callback wenn eine Forderung ausgewählt wird */
  onSelectDemand?: (demand: RentDemandWithDetails) => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function StatusBadge({
  status,
  overduedays,
}: {
  status: string;
  overduedays: number;
}) {
  if (status === "open" && overduedays > 0) {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertCircle className="h-3 w-3" />
        {overduedays} Tage überfällig
      </Badge>
    );
  }
  if (status === "partial") {
    return (
      <Badge variant="outline" className="border-orange-400 text-orange-600 gap-1">
        <CreditCard className="h-3 w-3" />
        Teilbezahlt
      </Badge>
    );
  }
  if (status === "open") {
    return <Badge variant="secondary">Offen</Badge>;
  }
  if (status === "paid") {
    return (
      <Badge variant="default" className="bg-green-600 gap-1">
        <CheckCircle2 className="h-3 w-3" />
        Bezahlt
      </Badge>
    );
  }
  return <Badge variant="outline">{getRentDemandStatusLabel(status as any)}</Badge>;
}

function DemandRow({
  demand,
  onSelect,
}: {
  demand: RentDemandWithDetails;
  onSelect?: (d: RentDemandWithDetails) => void;
}) {
  const [open, setOpen] = useState(false);
  const isOverdue = demand.overdue_days > 0;

  return (
    <Collapsible open={open} onOpenChange={setOpen} asChild>
      <>
        <TableRow
          className={`cursor-pointer transition-colors ${
            isOverdue ? "bg-destructive/5 hover:bg-destructive/10" : "hover:bg-muted/50"
          }`}
          onClick={() => setOpen(!open)}
        >
          {/* Monat */}
          <TableCell className="font-medium">
            {formatRentDemandMonth(demand.charge_year, demand.charge_month)}
          </TableCell>

          {/* Mieter */}
          <TableCell>
            {demand.tenant ? (
              <div>
                <p className="font-medium">
                  {demand.tenant.first_name} {demand.tenant.last_name}
                </p>
                {demand.tenant.email && (
                  <p className="text-xs text-muted-foreground">{demand.tenant.email}</p>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </TableCell>

          {/* Einheit */}
          <TableCell>
            {demand.unit ? (
              <div>
                <p className="font-medium">{demand.unit.unit_number}</p>
                <p className="text-xs text-muted-foreground">
                  {demand.unit.building?.name}
                </p>
              </div>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </TableCell>

          {/* Fällig am */}
          <TableCell>
            <div className="flex items-center gap-1.5 text-sm">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              {format(new Date(demand.due_date), "dd.MM.yyyy", { locale: de })}
            </div>
          </TableCell>

          {/* Sollbetrag */}
          <TableCell className="text-right font-semibold">
            {formatCurrency(demand.total_amount)}
          </TableCell>

          {/* Gezahlt */}
          <TableCell className="text-right">
            {demand.paid_amount > 0 ? (
              <span className="text-green-600 font-medium">
                {formatCurrency(demand.paid_amount)}
              </span>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </TableCell>

          {/* Offen */}
          <TableCell className="text-right">
            <span className={`font-semibold ${isOverdue ? "text-destructive" : ""}`}>
              {formatCurrency(demand.open_amount)}
            </span>
          </TableCell>

          {/* Status */}
          <TableCell>
            <StatusBadge status={demand.status} overduedays={demand.overdue_days} />
          </TableCell>

          {/* Expand */}
          <TableCell>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
                />
              </Button>
            </CollapsibleTrigger>
          </TableCell>
        </TableRow>

        {/* Aufklappbare Detail-Zeile */}
        <CollapsibleContent asChild>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableCell colSpan={9} className="py-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm px-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Kaltmiete</p>
                  <p className="font-medium">{formatCurrency(demand.base_rent)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">NK-Vorauszahlung</p>
                  <p className="font-medium">{formatCurrency(demand.utility_prepayment)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">HK-Vorauszahlung</p>
                  <p className="font-medium">{formatCurrency(demand.heating_prepayment)}</p>
                </div>
                {demand.other_costs > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Sonstiges</p>
                    <p className="font-medium">{formatCurrency(demand.other_costs)}</p>
                  </div>
                )}
                {demand.difference_amount !== 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Differenz</p>
                    <p
                      className={`font-semibold ${
                        demand.difference_amount < 0 ? "text-destructive" : "text-green-600"
                      }`}
                    >
                      {formatCurrency(demand.difference_amount)}
                    </p>
                  </div>
                )}
                {demand.paid_date && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Zahlungsdatum</p>
                    <p className="font-medium">
                      {format(new Date(demand.paid_date), "dd.MM.yyyy", { locale: de })}
                    </p>
                  </div>
                )}
                {demand.notes && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground mb-0.5">Notiz</p>
                    <p className="text-muted-foreground">{demand.notes}</p>
                  </div>
                )}
              </div>
              {onSelect && (
                <div className="mt-3 px-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(demand);
                    }}
                  >
                    <CreditCard className="h-3.5 w-3.5 mr-1.5" />
                    Zahlung zuordnen
                  </Button>
                </div>
              )}
            </TableCell>
          </TableRow>
        </CollapsibleContent>
      </>
    </Collapsible>
  );
}

export function RentDemandsList({
  leaseId,
  tenantId,
  buildingId,
  compact = false,
  onSelectDemand,
}: RentDemandsListProps) {
  const { useRentDemandsList } = useRentDemands();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>(
    String(new Date().getFullYear())
  );

  const filters: RentDemandFilters = {
    leaseId,
    tenantId,
    buildingId,
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
    year: yearFilter !== "all" ? Number(yearFilter) : undefined,
  };

  const { data: demands, isLoading, refetch } = useRentDemandsList(filters);

  // Client-seitige Suche nach Mieter-Name
  const filtered = (demands ?? []).filter((d) => {
    if (!search) return true;
    const name = d.tenant
      ? `${d.tenant.first_name} ${d.tenant.last_name}`.toLowerCase()
      : "";
    const unit = d.unit ? d.unit.unit_number.toLowerCase() : "";
    const s = search.toLowerCase();
    return name.includes(s) || unit.includes(s);
  });

  // Überfällige Forderungen zählen
  const overdueCount = filtered.filter((d) => d.overdue_days > 0).length;
  const totalOpenAmount = filtered.reduce((s, d) => s + Number(d.open_amount), 0);

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 4 }, (_, i) => String(currentYear - i));

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter-Bar (nur im nicht-kompakten Modus) */}
      {!compact && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Mieter oder Einheit suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="open">Offen</SelectItem>
              <SelectItem value="partial">Teilbezahlt</SelectItem>
              <SelectItem value="paid">Bezahlt</SelectItem>
            </SelectContent>
          </Select>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Jahre</SelectItem>
              {yearOptions.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Zusammenfassung */}
      {filtered.length > 0 && (
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="text-muted-foreground">
            <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
            Forderungen
          </span>
          <span className="text-muted-foreground">
            Gesamt offen:{" "}
            <span className="font-semibold text-foreground">
              {formatCurrency(totalOpenAmount)}
            </span>
          </span>
          {overdueCount > 0 && (
            <span className="text-destructive font-medium flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              {overdueCount} überfällig
            </span>
          )}
        </div>
      )}

      {/* Tabelle */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-green-500/50" />
          <p className="font-medium">Keine offenen Forderungen</p>
          <p className="text-sm mt-1">Alle Zahlungen sind auf dem aktuellen Stand.</p>
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Monat</TableHead>
                <TableHead>Mieter</TableHead>
                <TableHead>Einheit</TableHead>
                <TableHead>Fällig am</TableHead>
                <TableHead className="text-right">Soll</TableHead>
                <TableHead className="text-right">Gezahlt</TableHead>
                <TableHead className="text-right">Offen</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((demand) => (
                <DemandRow
                  key={demand.id}
                  demand={demand}
                  onSelect={onSelectDemand}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
