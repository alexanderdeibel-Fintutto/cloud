import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  TrendingUp,
  TrendingDown,
  MoreVertical,
  CheckCircle,
  Clock,
  Bell,
  XCircle,
  Trash2,
  Mail,
  ChevronDown,
  ChevronUp,
  Euro,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import {
  useLeaseAmendments,
  type LeaseAmendment,
  type AmendmentStatus,
  AMENDMENT_TYPE_LABELS,
  AMENDMENT_STATUS_LABELS,
} from "@/hooks/useLeaseAmendments";

// ─── Status-Konfiguration ────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  AmendmentStatus,
  { icon: React.ElementType; color: string; bgColor: string; badgeClass: string }
> = {
  pending: {
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 border-yellow-200",
    badgeClass: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  announced: {
    icon: Bell,
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
  },
  active: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50 border-green-200",
    badgeClass: "bg-green-100 text-green-800 border-green-200",
  },
  cancelled: {
    icon: XCircle,
    color: "text-gray-400",
    bgColor: "bg-gray-50 border-gray-200",
    badgeClass: "bg-gray-100 text-gray-500 border-gray-200",
  },
};

// ─── Einzelne Timeline-Karte ─────────────────────────────────────────────────

function AmendmentCard({ amendment }: { amendment: LeaseAmendment }) {
  const [expanded, setExpanded] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { updateAmendmentStatus, markAnnouncementSent, deleteAmendment } =
    useLeaseAmendments();

  const config = STATUS_CONFIG[amendment.status];
  const StatusIcon = config.icon;

  const isActive = amendment.status === "active";
  const isPending = amendment.status === "pending";
  const isAnnounced = amendment.status === "announced";
  const isCancelled = amendment.status === "cancelled";

  // Differenzen berechnen
  const rentDiff =
    amendment.new_base_rent !== null && amendment.old_base_rent !== null
      ? amendment.new_base_rent - amendment.old_base_rent
      : null;
  const utilityDiff =
    amendment.new_utility_prepayment !== null &&
    amendment.old_utility_prepayment !== null
      ? amendment.new_utility_prepayment - amendment.old_utility_prepayment
      : null;
  const heatingDiff =
    amendment.new_heating_prepayment !== null &&
    amendment.old_heating_prepayment !== null
      ? amendment.new_heating_prepayment - amendment.old_heating_prepayment
      : null;

  const totalOld =
    (amendment.old_base_rent || 0) +
    (amendment.old_utility_prepayment || 0) +
    (amendment.old_heating_prepayment || 0);
  const totalNew =
    (amendment.new_base_rent ?? amendment.old_base_rent ?? 0) +
    (amendment.new_utility_prepayment ?? amendment.old_utility_prepayment ?? 0) +
    (amendment.new_heating_prepayment ?? amendment.old_heating_prepayment ?? 0);
  const totalDiff = totalNew - totalOld;

  const hasAmountChanges = rentDiff !== null || utilityDiff !== null || heatingDiff !== null;

  return (
    <>
      <div className={`relative border rounded-lg p-4 ${config.bgColor} ${isCancelled ? "opacity-60" : ""}`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className={`mt-0.5 ${config.color}`}>
              <StatusIcon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-semibold text-sm">
                  {AMENDMENT_TYPE_LABELS[amendment.amendment_type]}
                </span>
                <Badge
                  variant="outline"
                  className={`text-xs ${config.badgeClass}`}
                >
                  {AMENDMENT_STATUS_LABELS[amendment.status]}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span>
                  Gültig ab:{" "}
                  <strong className="text-foreground">
                    {format(new Date(amendment.effective_date), "dd.MM.yyyy", { locale: de })}
                  </strong>
                </span>
                {amendment.announcement_date && (
                  <span>
                    Angekündigt:{" "}
                    {format(new Date(amendment.announcement_date), "dd.MM.yyyy", { locale: de })}
                  </span>
                )}
              </div>

              {/* Betragsänderung kompakt */}
              {hasAmountChanges && totalDiff !== 0 && (
                <div className="flex items-center gap-2 mt-2">
                  {totalDiff > 0 ? (
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-500" />
                  )}
                  <span
                    className={`text-sm font-bold ${
                      totalDiff > 0 ? "text-orange-600" : "text-green-600"
                    }`}
                  >
                    {totalDiff > 0 ? "+" : ""}
                    {totalDiff.toFixed(2)} € Warmmiete
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({totalOld.toFixed(2)} → {totalNew.toFixed(2)} €)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Aktionen */}
          <div className="flex items-center gap-1">
            {hasAmountChanges && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            )}

            {!isCancelled && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isPending && (
                    <DropdownMenuItem
                      onClick={() =>
                        markAnnouncementSent.mutate(amendment.id)
                      }
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Als angekündigt markieren
                    </DropdownMenuItem>
                  )}
                  {(isPending || isAnnounced) && (
                    <DropdownMenuItem
                      onClick={() =>
                        updateAmendmentStatus.mutate({
                          id: amendment.id,
                          status: "active",
                        })
                      }
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Als aktiv markieren
                    </DropdownMenuItem>
                  )}
                  {!isActive && (
                    <DropdownMenuItem
                      onClick={() =>
                        updateAmendmentStatus.mutate({
                          id: amendment.id,
                          status: "cancelled",
                        })
                      }
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Zurückziehen
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Löschen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Detailansicht */}
        {expanded && hasAmountChanges && (
          <div className="mt-4 pt-4 border-t border-current/10">
            <div className="grid grid-cols-3 gap-3">
              {rentDiff !== null && (
                <div className="text-center p-2 bg-white/60 rounded">
                  <p className="text-xs text-muted-foreground mb-1">Kaltmiete</p>
                  <p className="text-xs">{amendment.old_base_rent?.toFixed(2)} €</p>
                  <p className="text-xs font-bold">
                    → {amendment.new_base_rent?.toFixed(2)} €
                  </p>
                  <p
                    className={`text-xs font-semibold ${
                      rentDiff > 0 ? "text-orange-600" : "text-green-600"
                    }`}
                  >
                    {rentDiff > 0 ? "+" : ""}
                    {rentDiff.toFixed(2)} €
                  </p>
                </div>
              )}
              {utilityDiff !== null && (
                <div className="text-center p-2 bg-white/60 rounded">
                  <p className="text-xs text-muted-foreground mb-1">Nebenkosten</p>
                  <p className="text-xs">{amendment.old_utility_prepayment?.toFixed(2)} €</p>
                  <p className="text-xs font-bold">
                    → {amendment.new_utility_prepayment?.toFixed(2)} €
                  </p>
                  <p
                    className={`text-xs font-semibold ${
                      utilityDiff > 0 ? "text-orange-600" : "text-green-600"
                    }`}
                  >
                    {utilityDiff > 0 ? "+" : ""}
                    {utilityDiff.toFixed(2)} €
                  </p>
                </div>
              )}
              {heatingDiff !== null && (
                <div className="text-center p-2 bg-white/60 rounded">
                  <p className="text-xs text-muted-foreground mb-1">Heizkosten</p>
                  <p className="text-xs">{amendment.old_heating_prepayment?.toFixed(2)} €</p>
                  <p className="text-xs font-bold">
                    → {amendment.new_heating_prepayment?.toFixed(2)} €
                  </p>
                  <p
                    className={`text-xs font-semibold ${
                      heatingDiff > 0 ? "text-orange-600" : "text-green-600"
                    }`}
                  >
                    {heatingDiff > 0 ? "+" : ""}
                    {heatingDiff.toFixed(2)} €
                  </p>
                </div>
              )}
            </div>

            {amendment.legal_basis && (
              <p className="text-xs text-muted-foreground mt-3">
                <strong>Rechtsgrundlage:</strong> {amendment.legal_basis}
              </p>
            )}
            {amendment.notes && (
              <p className="text-xs text-muted-foreground mt-1">
                <strong>Notiz:</strong> {amendment.notes}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Löschen-Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Vertragsänderung löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Die Vertragsänderung
              und alle damit verbundenen Sollstellungs-Aktualisierungen werden entfernt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                deleteAmendment.mutate(amendment.id);
                setDeleteDialogOpen(false);
              }}
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Timeline-Hauptkomponente ────────────────────────────────────────────────

interface LeaseAmendmentTimelineProps {
  amendments: LeaseAmendment[];
  isLoading?: boolean;
}

export function LeaseAmendmentTimeline({
  amendments,
  isLoading,
}: LeaseAmendmentTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (amendments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Euro className="h-8 w-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">Noch keine Vertragsänderungen vorhanden.</p>
        <p className="text-xs mt-1">
          Klicken Sie auf „Änderung anlegen" um eine Mieterhöhung oder
          Vorauszahlungsanpassung zu erfassen.
        </p>
      </div>
    );
  }

  // Sortieren: zukünftige zuerst, dann nach Datum absteigend
  const sorted = [...amendments].sort((a, b) => {
    const now = new Date().toISOString().split("T")[0];
    const aFuture = a.effective_date > now;
    const bFuture = b.effective_date > now;
    if (aFuture && !bFuture) return -1;
    if (!aFuture && bFuture) return 1;
    return b.effective_date.localeCompare(a.effective_date);
  });

  return (
    <div className="space-y-3">
      {sorted.map((amendment) => (
        <AmendmentCard key={amendment.id} amendment={amendment} />
      ))}
    </div>
  );
}
