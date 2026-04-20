import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Save,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  Building,
  Calendar,
  Hash,
  User,
  StickyNote,
  Loader2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useDocument, useUpdateDocument } from "@/hooks/useDocument";
import { useBuildings } from "@/hooks/useBuildings";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const statusConfig: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  pending: { label: "Ausstehend", icon: Clock, className: "border-warning/50 text-warning" },
  processed: { label: "Verarbeitet", icon: CheckCircle, className: "border-success/50 text-success" },
  needs_review: { label: "Prüfung nötig", icon: AlertCircle, className: "border-destructive/50 text-destructive" },
  booked: { label: "Gebucht", icon: CheckCircle, className: "border-primary/50 text-primary" },
};

const documentTypes = [
  { value: "invoice", label: "Rechnung" },
  { value: "receipt", label: "Quittung" },
  { value: "contract", label: "Vertrag" },
  { value: "offer", label: "Angebot" },
  { value: "unknown", label: "Unbekannt" },
];

export default function DocumentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: document, isLoading } = useDocument(id);
  const updateDocument = useUpdateDocument();
  const { data: buildings = [] } = useBuildings();
  const [isEditing, setIsEditing] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [formData, setFormData] = useState({
    vendor_name: "",
    amount: "",
    invoice_date: "",
    invoice_number: "",
    notes: "",
    status: "",
    document_type: "",
    building_id: "",
  });

  useEffect(() => {
    if (document) {
      setFormData({
        vendor_name: document.vendor_name || "",
        amount: document.amount?.toString() || "",
        invoice_date: document.invoice_date || "",
        invoice_number: document.invoice_number || "",
        notes: document.notes || "",
        status: document.status,
        document_type: document.document_type || "unknown",
        building_id: document.building_id || "",
      });
    }
  }, [document]);

  const handleSave = () => {
    if (!id) return;
    updateDocument.mutate(
      {
        id,
        updates: {
          vendor_name: formData.vendor_name || null,
          amount: formData.amount ? parseFloat(formData.amount) : null,
          invoice_date: formData.invoice_date || null,
          invoice_number: formData.invoice_number || null,
          notes: formData.notes || null,
          status: formData.status,
          document_type: formData.document_type,
          building_id: formData.building_id || null,
        },
      },
      {
        onSuccess: () => setIsEditing(false),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Beleg nicht gefunden</p>
        <Button variant="outline" onClick={() => navigate("/belege")}>
          Zurück zu Belege
        </Button>
      </div>
    );
  }

  const config = statusConfig[document.status] || statusConfig.pending;
  const StatusIcon = config.icon;

  const isPdf = document.file_name?.toLowerCase().endsWith(".pdf");

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b">
        <div className="flex items-center gap-3 px-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="touch-target"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">
              {document.vendor_name || document.file_name}
            </h1>
            <p className="text-sm text-muted-foreground truncate">
              {document.subject || document.file_name}
            </p>
          </div>
          <Badge variant="outline" className={cn("text-xs shrink-0", config.className)}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4 pb-8">
        {/* PDF Preview / File Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Dokument
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isPdf && showPdfPreview ? (
              <div className="rounded-lg overflow-hidden border bg-muted/30">
                <iframe
                  src={document.file_url}
                  className="w-full h-[400px]"
                  title="PDF Vorschau"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-accent/30 rounded-lg">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{document.file_name}</p>
                  {document.file_size_bytes && (
                    <p className="text-xs text-muted-foreground">
                      {(document.file_size_bytes / 1024).toFixed(0)} KB
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {isPdf && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setShowPdfPreview(!showPdfPreview)}
                >
                  <Eye className="h-4 w-4 mr-1.5" />
                  {showPdfPreview ? "Vorschau ausblenden" : "Vorschau anzeigen"}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => window.open(document.file_url, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-1.5" />
                Öffnen
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Document Details */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Belegdaten</CardTitle>
              {!isEditing ? (
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                  Bearbeiten
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      if (document) {
                        setFormData({
                          vendor_name: document.vendor_name || "",
                          amount: document.amount?.toString() || "",
                          invoice_date: document.invoice_date || "",
                          invoice_number: document.invoice_number || "",
                          notes: document.notes || "",
                          status: document.status,
                          document_type: document.document_type || "unknown",
                          building_id: document.building_id || "",
                        });
                      }
                    }}
                  >
                    Abbrechen
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={updateDocument.isPending}
                  >
                    {updateDocument.isPending ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-1" />
                    )}
                    Speichern
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData((p) => ({ ...p, status: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Ausstehend</SelectItem>
                      <SelectItem value="processed">Verarbeitet</SelectItem>
                      <SelectItem value="needs_review">Prüfung nötig</SelectItem>
                      <SelectItem value="booked">Gebucht</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Dokumenttyp</Label>
                  <Select
                    value={formData.document_type}
                    onValueChange={(v) => setFormData((p) => ({ ...p, document_type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Gebäude</Label>
                  <Select
                    value={formData.building_id}
                    onValueChange={(v) => setFormData((p) => ({ ...p, building_id: v === "__none__" ? "" : v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kein Gebäude zugeordnet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Kein Gebäude</SelectItem>
                      {buildings.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Kreditor / Lieferant</Label>
                  <Input
                    value={formData.vendor_name}
                    onChange={(e) => setFormData((p) => ({ ...p, vendor_name: e.target.value }))}
                    placeholder="z.B. Stadtwerke Berlin"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Betrag (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData((p) => ({ ...p, amount: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Rechnungsdatum</Label>
                    <Input
                      type="date"
                      value={formData.invoice_date}
                      onChange={(e) => setFormData((p) => ({ ...p, invoice_date: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Rechnungsnummer</Label>
                  <Input
                    value={formData.invoice_number}
                    onChange={(e) => setFormData((p) => ({ ...p, invoice_number: e.target.value }))}
                    placeholder="z.B. RE-2026-001"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Notizen</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="Zusätzliche Anmerkungen..."
                    className="min-h-[80px]"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <DetailRow
                  icon={User}
                  label="Kreditor"
                  value={document.vendor_name}
                />
                <DetailRow
                  icon={Hash}
                  label="Rechnungsnummer"
                  value={document.invoice_number}
                />
                <DetailRow
                  icon={Calendar}
                  label="Rechnungsdatum"
                  value={
                    document.invoice_date
                      ? format(new Date(document.invoice_date), "dd. MMMM yyyy", { locale: de })
                      : null
                  }
                />
                <DetailRow
                  icon={FileText}
                  label="Betrag"
                  value={
                    document.amount != null
                      ? new Intl.NumberFormat("de-DE", {
                          style: "currency",
                          currency: "EUR",
                        }).format(document.amount)
                      : null
                  }
                  highlight
                />
                <DetailRow
                  icon={FileText}
                  label="Dokumenttyp"
                  value={
                    documentTypes.find((t) => t.value === document.document_type)?.label ||
                    document.document_type
                  }
                />
                <DetailRow
                  icon={Building}
                  label="Gebäude"
                  value={buildings.find((b) => b.id === document.building_id)?.name}
                />

                <Separator />

                <DetailRow
                  icon={Building}
                  label="Absender"
                  value={document.sender_email}
                />
                {document.notes && (
                  <>
                    <Separator />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <StickyNote className="h-3.5 w-3.5" />
                        Notizen
                      </div>
                      <p className="text-sm">{document.notes}</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Metadaten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Empfangen</span>
                <span>
                  {format(new Date(document.created_at), "dd.MM.yyyy HH:mm", { locale: de })}
                </span>
              </div>
              {document.processed_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Verarbeitet</span>
                  <span>
                    {format(new Date(document.processed_at), "dd.MM.yyyy HH:mm", { locale: de })}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dateigröße</span>
                <span>
                  {document.file_size_bytes
                    ? `${(document.file_size_bytes / 1024).toFixed(0)} KB`
                    : "–"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <span
        className={cn(
          "text-sm text-right max-w-[60%] truncate",
          highlight && "font-semibold",
          !value && "text-muted-foreground italic"
        )}
      >
        {value || "–"}
      </span>
    </div>
  );
}
