import { useNavigate } from "react-router-dom";
import { FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { type Document } from "@/hooks/useDocuments";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface DocumentListProps {
  documents: Document[];
  isLoading: boolean;
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  pending: {
    label: "Ausstehend",
    icon: Clock,
    className: "border-warning/50 text-warning",
  },
  processed: {
    label: "Verarbeitet",
    icon: CheckCircle,
    className: "border-success/50 text-success",
  },
  needs_review: {
    label: "Prüfung nötig",
    icon: AlertCircle,
    className: "border-destructive/50 text-destructive",
  },
  booked: {
    label: "Gebucht",
    icon: CheckCircle,
    className: "border-primary/50 text-primary",
  },
};

export function DocumentList({ documents, isLoading }: DocumentListProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">
          Noch keine Belege empfangen
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Sende PDFs an deine Eingangs-E-Mail-Adresse
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => {
        const config = statusConfig[doc.status] || statusConfig.pending;
        const StatusIcon = config.icon;

        return (
          <Card key={doc.id} className="card-interactive cursor-pointer" onClick={() => navigate(`/belege/${doc.id}`)}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-sm font-medium truncate">
                      {doc.vendor_name || doc.file_name}
                    </h3>
                    <Badge variant="outline" className={`text-[10px] h-5 shrink-0 ${config.className}`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {config.label}
                    </Badge>
                  </div>

                  {doc.subject && (
                    <p className="text-xs text-muted-foreground truncate mb-1">
                      {doc.subject}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {doc.amount && (
                      <span className="font-semibold text-foreground">
                        {new Intl.NumberFormat("de-DE", {
                          style: "currency",
                          currency: "EUR",
                        }).format(doc.amount)}
                      </span>
                    )}
                    {doc.invoice_date && (
                      <span>
                        {format(new Date(doc.invoice_date), "dd.MM.yyyy", { locale: de })}
                      </span>
                    )}
                    <span className="truncate">{doc.sender_email}</span>
                  </div>

                  {doc.invoice_number && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Rechnungs-Nr: {doc.invoice_number}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
