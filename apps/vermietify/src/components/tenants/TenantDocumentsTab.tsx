/**
 * TenantDocumentsTab.tsx — Vermietify
 *
 * Vollständige Neuimplementierung: Zeigt Mieter-Dokumente aus zwei Quellen:
 * 1. Vermietify-eigene Dokumente (Tabelle `documents` mit tenant_id)
 * 2. SecondBrain-Dokumente (via RPC `get_documents_for_entity`)
 *
 * Ersetzt die bisherige Mock-Implementierung vollständig.
 */

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared";
import {
  FolderOpen,
  FileText,
  Download,
  Eye,
  Trash2,
  Filter,
  Calendar,
  Brain,
  ExternalLink,
  Plus,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

// ── Typen ────────────────────────────────────────────────────────────────────

interface VermietifyDocument {
  id: string;
  title: string;
  document_type: string;
  file_url: string | null;
  file_size: number | null;
  created_at: string;
  description: string | null;
}

interface SbDocument {
  id: string;
  title: string;
  file_name: string;
  file_type: string;
  file_size: number;
  document_type: string | null;
  ocr_status: string;
  summary: string | null;
  created_at: string;
}

interface TenantDocumentsTabProps {
  tenantId: string;
  /** Legacy-Prop: wird ignoriert, Daten werden direkt aus Supabase geladen */
  documents?: any[];
}

// ── Hilfsfunktionen ──────────────────────────────────────────────────────────

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  contract: "Vertrag",
  protocol: "Protokoll",
  invoice: "Rechnung",
  correspondence: "Korrespondenz",
  other: "Sonstiges",
};

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const SB_URL = "https://secondbrain.fintutto.cloud";

// ── Haupt-Komponente ─────────────────────────────────────────────────────────

export function TenantDocumentsTab({ tenantId }: TenantDocumentsTabProps) {
  // Vermietify-Dokumente
  const [vmDocs, setVmDocs] = useState<VermietifyDocument[]>([]);
  const [vmLoading, setVmLoading] = useState(true);

  // SecondBrain-Dokumente
  const [sbDocs, setSbDocs] = useState<SbDocument[]>([]);
  const [sbLoading, setSbLoading] = useState(true);

  // Filter
  const [source, setSource] = useState<"all" | "vermietify" | "secondbrain">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // ── Daten laden ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!tenantId) return;
    loadVermietifyDocs();
    loadSecondBrainDocs();
  }, [tenantId]);

  async function loadVermietifyDocs() {
    setVmLoading(true);
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("id, title, document_type, file_url, file_size, created_at, description")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      if (!error && data) setVmDocs(data as VermietifyDocument[]);
    } catch {
      setVmDocs([]);
    } finally {
      setVmLoading(false);
    }
  }

  async function loadSecondBrainDocs() {
    setSbLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_documents_for_entity", {
        p_entity_type: "tenant",
        p_entity_id: tenantId,
      });
      if (!error && data) setSbDocs((data as SbDocument[]) ?? []);
    } catch {
      setSbDocs([]);
    } finally {
      setSbLoading(false);
    }
  }

  async function handleDeleteVmDoc(docId: string) {
    const { error } = await supabase.from("documents").delete().eq("id", docId);
    if (!error) setVmDocs((prev) => prev.filter((d) => d.id !== docId));
  }

  // ── Gefilterte Daten ───────────────────────────────────────────────────────

  const filteredVmDocs = vmDocs.filter(
    (d) => typeFilter === "all" || d.document_type === typeFilter
  );

  const isLoading = vmLoading || sbLoading;
  const uploadLink = `${SB_URL}/upload?context=tenant&id=${tenantId}`;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Filter- und Aktions-Leiste */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Quellen-Filter */}
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              {(
                [
                  { key: "all", label: `Alle (${vmDocs.length + sbDocs.length})` },
                  { key: "vermietify", label: `Vermietify (${vmDocs.length})` },
                  { key: "secondbrain", label: `SecondBrain (${sbDocs.length})` },
                ] as const
              ).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSource(key)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    source === key
                      ? "bg-white shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Typ-Filter (nur für Vermietify-Dokumente) */}
            {(source === "all" || source === "vermietify") && (
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="text-xs border rounded-md px-2 py-1.5 bg-background"
                >
                  <option value="all">Alle Typen</option>
                  {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="ml-auto flex items-center gap-2">
              {/* Aktualisieren */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  loadVermietifyDocs();
                  loadSecondBrainDocs();
                }}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>

              {/* In SecondBrain hochladen */}
              <a
                href={uploadLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs border border-indigo-300 text-indigo-600 rounded-md px-3 py-1.5 hover:bg-indigo-50 transition-colors"
              >
                <Brain className="h-3.5 w-3.5" />
                In SecondBrain hochladen
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vermietify-Dokumente */}
      {(source === "all" || source === "vermietify") && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderOpen className="h-4 w-4" />
              Vermietify-Dokumente
              {vmLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
              {!vmLoading && (
                <Badge variant="secondary" className="text-xs">
                  {filteredVmDocs.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {vmLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredVmDocs.length === 0 ? (
              <EmptyState
                icon={FolderOpen}
                title="Keine Dokumente vorhanden"
                description="Laden Sie Dokumente wie Mietverträge oder Protokolle in SecondBrain hoch und verknüpfen Sie sie mit diesem Mieter."
                action={
                  <a
                    href={uploadLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-indigo-600 border border-indigo-300 rounded-md px-3 py-2 hover:bg-indigo-50 transition-colors"
                  >
                    <Brain className="h-4 w-4" />
                    In SecondBrain hochladen
                  </a>
                }
              />
            ) : (
              <div className="space-y-2">
                {filteredVmDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-9 w-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-xs">
                          {DOCUMENT_TYPE_LABELS[doc.document_type] || doc.document_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(doc.created_at), "dd.MM.yyyy", { locale: de })}
                        </span>
                        {doc.file_size && (
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(doc.file_size)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {doc.file_url && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => window.open(doc.file_url!, "_blank")}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            asChild
                          >
                            <a href={doc.file_url} download>
                              <Download className="h-3.5 w-3.5" />
                            </a>
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteVmDoc(doc.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* SecondBrain-Dokumente */}
      {(source === "all" || source === "secondbrain") && (
        <Card className="border-indigo-100">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="h-4 w-4 text-indigo-500" />
              <span className="text-indigo-900">SecondBrain-Dokumente</span>
              {sbLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />}
              {!sbLoading && (
                <Badge className="text-xs bg-indigo-500 text-white">
                  {sbDocs.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sbLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
              </div>
            ) : sbDocs.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-indigo-200 rounded-lg bg-indigo-50/30">
                <Brain className="h-8 w-8 mx-auto mb-3 text-indigo-300" />
                <p className="text-sm text-muted-foreground mb-1">
                  Noch keine SecondBrain-Dokumente verknüpft
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Scanne Post, lade Dokumente hoch und ordne sie diesem Mieter zu.
                </p>
                <a
                  href={uploadLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-indigo-600 border border-indigo-300 rounded-md px-3 py-2 hover:bg-indigo-100 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Jetzt in SecondBrain hochladen
                </a>
              </div>
            ) : (
              <div className="space-y-2">
                {sbDocs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() =>
                      window.open(`${SB_URL}/dokumente?view=${doc.id}`, "_blank")
                    }
                    className="flex items-center gap-3 p-3 border border-indigo-100 rounded-lg hover:border-indigo-300 hover:bg-indigo-50/50 cursor-pointer transition-all"
                  >
                    <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4 text-indigo-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {doc.document_type && (
                          <Badge variant="outline" className="text-xs border-indigo-200 text-indigo-600">
                            {doc.document_type}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(doc.file_size)} ·{" "}
                          {format(new Date(doc.created_at), "dd.MM.yyyy", { locale: de })}
                        </span>
                        {doc.ocr_status === "completed" && (
                          <Badge className="text-xs bg-green-100 text-green-700">
                            OCR ✓
                          </Badge>
                        )}
                      </div>
                      {doc.summary && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1 italic">
                          {doc.summary}
                        </p>
                      )}
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
                  </div>
                ))}

                {/* Alle in SecondBrain anzeigen */}
                <a
                  href={`${SB_URL}/dokumente?filter=tenant:${tenantId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 text-xs text-indigo-600 border border-indigo-200 rounded-lg py-2.5 hover:bg-indigo-50 transition-colors mt-1"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Alle Dokumente in SecondBrain öffnen
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
