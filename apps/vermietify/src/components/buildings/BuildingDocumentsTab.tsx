/**
 * BuildingDocumentsTab
 *
 * Vollständig integrierter Dokumenten-Tab für die Gebäude-Detailansicht.
 * Zeigt Dokumente aus zwei Quellen:
 *
 *   1. Vermietify-Dokumente (documents-Tabelle, building_id-Filter)
 *      → Lokale Uploads mit KI-OCR, direkt in Vermietify verwaltet
 *
 *   2. SecondBrain-Dokumente (sb_documents via sb_document_entity_links)
 *      → Zentrale Dokumentenverwaltung mit KI-Chat, Collections etc.
 *
 * Beide Quellen werden in einer einheitlichen UI dargestellt.
 * Upload-Aktionen leiten in den jeweils passenden Flow weiter.
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared";
import { DocumentUploadDialog } from "@fintutto/shared";
import {
  Upload,
  FileText,
  Download,
  Eye,
  Trash2,
  Search,
  File,
  FileImage,
  Brain,
  ExternalLink,
  Plus,
  Loader2,
  Link2,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { toast } from "@/hooks/use-toast";

// ── Typen ────────────────────────────────────────────────────────────────────

interface BuildingDocumentsTabProps {
  buildingId: string;
}

interface VermietifyDocument {
  id: string;
  title: string;
  document_type: string;
  file_url: string;
  file_size: number | null;
  created_at: string;
  ocr_result?: {
    detected_type: string;
    confidence_score: number;
    raw_text?: string | null;
  } | null;
}

interface SbDocument {
  id: string;
  title: string;
  file_name: string;
  file_type: string;
  file_size: number;
  document_type: string | null;
  category: string | null;
  ocr_status: "pending" | "processing" | "completed" | "failed";
  summary: string | null;
  is_favorite: boolean;
  created_at: string;
  storage_path: string;
  file_url: string | null;
}

// ── Hilfsfunktionen ──────────────────────────────────────────────────────────

const SECONDBRAIN_URL = "https://secondbrain.fintutto.cloud";

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const DOC_TYPE_LABELS: Record<string, string> = {
  invoice: "Rechnung",
  tax_notice: "Steuerbescheid",
  contract: "Vertrag",
  letter: "Brief",
  receipt: "Beleg",
  energy_certificate: "Energieausweis",
  protocol: "Protokoll",
  other: "Sonstiges",
  unknown: "Unbekannt",
};

const DOC_TYPE_COLORS: Record<string, string> = {
  invoice: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  contract: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  tax_notice: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  protocol: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  energy_certificate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  receipt: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  other: "bg-muted text-muted-foreground",
  unknown: "bg-muted text-muted-foreground",
};

const OCR_STATUS_CONFIG = {
  pending: { icon: Clock, label: "Ausstehend", color: "text-muted-foreground" },
  processing: { icon: Loader2, label: "Wird analysiert", color: "text-primary animate-spin" },
  completed: { icon: CheckCircle2, label: "Analysiert", color: "text-green-500" },
  failed: { icon: AlertCircle, label: "Fehlgeschlagen", color: "text-destructive" },
};

function getFileIcon(fileType: string) {
  if (fileType === "pdf") return <FileText className="h-8 w-8 text-red-500" />;
  if (["jpg", "jpeg", "png", "gif", "webp", "image"].includes(fileType))
    return <FileImage className="h-8 w-8 text-blue-500" />;
  return <File className="h-8 w-8 text-muted-foreground" />;
}

// ── Sub-Komponente: Vermietify-Dokument-Karte ─────────────────────────────────

function VermietifyDocumentCard({
  doc,
  onDelete,
}: {
  doc: VermietifyDocument;
  onDelete: (id: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const typeLabel = DOC_TYPE_LABELS[doc.document_type] || doc.document_type;
  const typeColor = DOC_TYPE_COLORS[doc.document_type] || DOC_TYPE_COLORS.other;
  const ocrStatus = doc.ocr_result
    ? OCR_STATUS_CONFIG[doc.ocr_result.detected_type === "unknown" ? "completed" : "completed"]
    : OCR_STATUS_CONFIG.pending;

  return (
    <>
      <Card className="hover:shadow-md transition-all duration-200 group">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="shrink-0 mt-0.5">{getFileIcon("pdf")}</div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate text-sm leading-tight">{doc.title}</h4>
              <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
                <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${typeColor}`}>
                  {typeLabel}
                </Badge>
                {doc.file_size && (
                  <span className="text-[10px] text-muted-foreground">
                    {formatFileSize(doc.file_size)}
                  </span>
                )}
                {doc.ocr_result && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex items-center gap-0.5">
                          <Brain className="h-3 w-3 text-primary" />
                          <span className="text-[10px] text-primary">
                            {Math.round(doc.ocr_result.confidence_score * 100)}%
                          </span>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="text-xs">KI-Konfidenz: {Math.round(doc.ocr_result.confidence_score * 100)}%</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {formatDate(doc.created_at)}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-1 mt-3 pt-3 border-t opacity-0 group-hover:opacity-100 transition-opacity">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => window.open(doc.file_url, "_blank")}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Anzeigen</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    asChild
                  >
                    <a href={doc.file_url} download>
                      <Download className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Herunterladen</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Löschen</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dokument löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              „{doc.title}" wird unwiderruflich gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                onDelete(doc.id);
                setConfirmDelete(false);
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

// ── Sub-Komponente: SecondBrain-Dokument-Karte ────────────────────────────────

function SecondBrainDocumentCard({ doc }: { doc: SbDocument }) {
  const statusConfig = OCR_STATUS_CONFIG[doc.ocr_status] || OCR_STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;
  const sbDocUrl = `${SECONDBRAIN_URL}/dokumente?view=${doc.id}`;

  return (
    <Card className="hover:shadow-md transition-all duration-200 group border-primary/10 bg-primary/[0.02]">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5">{getFileIcon(doc.file_type)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1">
              <h4 className="font-medium truncate text-sm leading-tight flex-1">{doc.title}</h4>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 shrink-0">
                      <Brain className="h-3 w-3 text-primary" />
                      <span className="text-[10px] text-primary font-medium">SecondBrain</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Dieses Dokument wird in SecondBrain verwaltet</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
              {doc.category && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary">
                  {doc.category}
                </Badge>
              )}
              {doc.file_size && (
                <span className="text-[10px] text-muted-foreground">
                  {formatFileSize(doc.file_size)}
                </span>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center gap-0.5">
                      <StatusIcon className={`h-3 w-3 ${statusConfig.color}`} />
                      <span className="text-[10px] text-muted-foreground">{statusConfig.label}</span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">OCR-Status: {statusConfig.label}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {doc.summary && (
              <p className="text-[11px] text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                {doc.summary}
              </p>
            )}

            <p className="text-[10px] text-muted-foreground mt-1">
              {formatDate(doc.created_at)}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-1 mt-3 pt-3 border-t opacity-0 group-hover:opacity-100 transition-opacity">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => window.open(sbDocUrl, "_blank")}
                >
                  <Brain className="h-3.5 w-3.5 text-primary" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>In SecondBrain öffnen</TooltipContent>
            </Tooltip>
            {doc.file_url && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => window.open(doc.file_url!, "_blank")}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Datei anzeigen</TooltipContent>
              </Tooltip>
            )}
            {doc.file_url && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                    <a href={doc.file_url} download={doc.file_name}>
                      <Download className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Herunterladen</TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Haupt-Komponente ─────────────────────────────────────────────────────────

export function BuildingDocumentsTab({ buildingId }: BuildingDocumentsTabProps) {
  const { profile } = useAuth();
  const organizationId = profile?.organization_id;
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [activeSource, setActiveSource] = useState<"all" | "vermietify" | "secondbrain">("all");

  // ── Vermietify-Dokumente laden ────────────────────────────────────────────
  const {
    data: vermietifyDocs = [],
    isLoading: loadingVermietify,
  } = useQuery<VermietifyDocument[]>({
    queryKey: ["building-documents-vermietify", buildingId, organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const { data, error } = await supabase
        .from("documents")
        .select(`
          id, title, document_type, file_url, file_size, created_at,
          document_ocr_results (
            detected_type, confidence_score, raw_text
          )
        `)
        .eq("building_id", buildingId)
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((d: any) => ({
        ...d,
        ocr_result: d.document_ocr_results?.[0] ?? null,
      })) as VermietifyDocument[];
    },
    enabled: !!organizationId && !!buildingId,
  });

  // ── SecondBrain-Dokumente laden (via RPC) ─────────────────────────────────
  const {
    data: sbDocs = [],
    isLoading: loadingSb,
  } = useQuery<SbDocument[]>({
    queryKey: ["building-documents-secondbrain", buildingId],
    queryFn: async () => {
      if (!buildingId) return [];
      const { data, error } = await supabase.rpc("get_documents_for_entity", {
        p_entity_type: "building",
        p_entity_id: buildingId,
      });
      if (error) {
        // RPC noch nicht vorhanden → leeres Array zurückgeben
        console.warn("SecondBrain RPC nicht verfügbar:", error.message);
        return [];
      }
      return (data as SbDocument[]) ?? [];
    },
    enabled: !!buildingId,
    staleTime: 1000 * 60 * 2,
  });

  // ── Vermietify-Dokument löschen ───────────────────────────────────────────
  const deleteDocument = useMutation({
    mutationFn: async (documentId: string) => {
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", documentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["building-documents-vermietify", buildingId, organizationId],
      });
      toast({ title: "Dokument gelöscht" });
    },
    onError: (err: Error) => {
      toast({
        title: "Fehler beim Löschen",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  // ── Filterlogik ───────────────────────────────────────────────────────────
  const filteredVermietify = vermietifyDocs.filter((d) =>
    !searchQuery || d.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredSb = sbDocs.filter((d) =>
    !searchQuery ||
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.summary && d.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (d.category && d.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalCount = vermietifyDocs.length + sbDocs.length;
  const isLoading = loadingVermietify || loadingSb;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 sm:max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Dokumente durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* SecondBrain-Upload-Link */}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              window.open(
                `${SECONDBRAIN_URL}/upload?context=building&id=${buildingId}`,
                "_blank"
              )
            }
          >
            <Brain className="h-4 w-4 mr-2 text-primary" />
            In SecondBrain hochladen
          </Button>

          {/* Lokaler Upload (Vermietify) */}
          <Button size="sm" onClick={() => setUploadDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Lokal hochladen
          </Button>
        </div>
      </div>

      {/* Quellen-Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {(
          [
            { value: "all", label: `Alle (${totalCount})` },
            { value: "vermietify", label: `Vermietify (${vermietifyDocs.length})` },
            { value: "secondbrain", label: `SecondBrain (${sbDocs.length})` },
          ] as const
        ).map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveSource(tab.value)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              activeSource === tab.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:border-primary/50"
            }`}
          >
            {tab.value === "secondbrain" && (
              <Brain className="h-3 w-3 inline mr-1 -mt-0.5" />
            )}
            {tab.label}
          </button>
        ))}

        {/* Link: Alle Dokumente in SecondBrain */}
        <a
          href={`${SECONDBRAIN_URL}/dokumente?filter=building:${buildingId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-xs text-primary hover:underline flex items-center gap-1"
        >
          <ExternalLink className="h-3 w-3" />
          In SecondBrain verwalten
        </a>
      </div>

      {/* Inhalt */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-32 rounded-xl bg-muted/50 animate-pulse"
            />
          ))}
        </div>
      ) : totalCount === 0 ? (
        /* ── Leer-Zustand ── */
        <div className="rounded-xl border-2 border-dashed border-border p-10 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <FileText className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-base">Noch keine Dokumente</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              Lade Dokumente direkt in Vermietify hoch oder nutze SecondBrain
              für die zentrale Dokumentenverwaltung mit KI-Analyse.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Button size="sm" onClick={() => setUploadDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Lokal hochladen
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                window.open(
                  `${SECONDBRAIN_URL}/upload?context=building&id=${buildingId}`,
                  "_blank"
                )
              }
            >
              <Brain className="h-4 w-4 mr-2 text-primary" />
              In SecondBrain hochladen
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ── Vermietify-Dokumente ── */}
          {(activeSource === "all" || activeSource === "vermietify") &&
            filteredVermietify.length > 0 && (
              <div className="space-y-3">
                {activeSource === "all" && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Vermietify-Dokumente
                    </h3>
                    <Badge variant="secondary" className="text-[10px]">
                      {filteredVermietify.length}
                    </Badge>
                  </div>
                )}
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {filteredVermietify.map((doc) => (
                    <VermietifyDocumentCard
                      key={doc.id}
                      doc={doc}
                      onDelete={(id) => deleteDocument.mutate(id)}
                    />
                  ))}
                </div>
              </div>
            )}

          {/* ── SecondBrain-Dokumente ── */}
          {(activeSource === "all" || activeSource === "secondbrain") &&
            filteredSb.length > 0 && (
              <div className="space-y-3">
                {activeSource === "all" && (
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      SecondBrain-Dokumente
                    </h3>
                    <Badge
                      variant="secondary"
                      className="text-[10px] bg-primary/10 text-primary"
                    >
                      {filteredSb.length}
                    </Badge>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link2 className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs">
                            Diese Dokumente werden in SecondBrain verwaltet und
                            sind mit diesem Gebäude verknüpft. Klicke auf ein
                            Dokument, um es in SecondBrain zu öffnen.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {filteredSb.map((doc) => (
                    <SecondBrainDocumentCard key={doc.id} doc={doc} />
                  ))}
                </div>

                {/* Link zu SecondBrain */}
                <div className="flex justify-center pt-1">
                  <a
                    href={`${SECONDBRAIN_URL}/dokumente?filter=building:${buildingId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1.5 py-2"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Alle SecondBrain-Dokumente für dieses Gebäude anzeigen
                  </a>
                </div>
              </div>
            )}

          {/* ── Keine Suchergebnisse ── */}
          {searchQuery &&
            filteredVermietify.length === 0 &&
            filteredSb.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm">
                  Keine Dokumente für „{searchQuery}" gefunden.
                </p>
              </div>
            )}
        </div>
      )}

      {/* ── Upload-Dialog (Vermietify lokal) ── */}
      {organizationId && (
        <DocumentUploadDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          supabase={supabase as any}
          organizationId={organizationId}
          mode="real_estate"
          contextOptions={{
            buildings: [{ id: buildingId, label: "Dieses Gebäude" }],
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({
              queryKey: ["building-documents-vermietify", buildingId, organizationId],
            });
            toast({
              title: "Dokument hochgeladen",
              description: "Das Dokument wird jetzt mit KI analysiert.",
            });
          }}
        />
      )}
    </div>
  );
}
