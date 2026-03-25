/**
 * @fintutto/shared — DocumentList
 *
 * Universelle Dokumentenliste mit Suche, Filter und OCR-Vorschau.
 * Funktioniert für Vermietify und Financial Compass.
 */

import { useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  FileText,
  Search,
  Upload,
  Trash2,
  Eye,
  Download,
  Euro,
  Calendar,
  User,
  Sparkles,
  Filter,
  Building,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useDocuments, DOCUMENT_TYPES, Document, DocumentType } from "../../hooks/useDocuments";
import { DocumentUploadDialog } from "./DocumentUploadDialog";

interface ContextOption {
  id: string;
  label: string;
}

interface DocumentListProps {
  supabase: SupabaseClient;
  organizationId?: string;
  businessId?: string;
  mode?: "real_estate" | "business" | "all";
  contextOptions?: {
    buildings?: ContextOption[];
    units?: ContextOption[];
    tenants?: ContextOption[];
    clients?: ContextOption[];
  };
  title?: string;
}

function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

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

const TYPE_COLORS: Record<string, string> = {
  invoice: "bg-green-100 text-green-700",
  expense_receipt: "bg-orange-100 text-orange-700",
  contract: "bg-purple-100 text-purple-700",
  tax_notice: "bg-blue-100 text-blue-700",
  tax_document: "bg-blue-100 text-blue-700",
  protocol: "bg-cyan-100 text-cyan-700",
  energy_certificate: "bg-yellow-100 text-yellow-700",
  letter: "bg-gray-100 text-gray-700",
  receipt: "bg-emerald-100 text-emerald-700",
  other: "bg-gray-100 text-gray-600",
  unknown: "bg-gray-50 text-gray-400",
};

export function DocumentList({
  supabase,
  organizationId,
  businessId,
  mode = "all",
  contextOptions = {},
  title = "Dokumente",
}: DocumentListProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<DocumentType | "">("");
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { documents, documentsLoading, stats, deleteDocument, searchDocuments } = useDocuments({
    supabase,
    organizationId,
    businessId,
    mode,
  });

  const filtered = searchDocuments(searchTerm).filter(
    (d) => !filterType || d.document_type === filterType
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-gray-500">
            {stats.total} Dokumente · {stats.processed} analysiert
          </p>
        </div>
        <button
          onClick={() => setUploadOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Upload className="h-4 w-4" />
          Hochladen
        </button>
      </div>

      {/* Stats-Chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterType("")}
          className={cn(
            "px-3 py-1 rounded-full text-xs font-medium transition-colors",
            !filterType ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          Alle ({stats.total})
        </button>
        {stats.byType
          .filter((t) => t.count > 0)
          .map((t) => (
            <button
              key={t.type}
              onClick={() => setFilterType(t.type === filterType ? "" : t.type)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                filterType === t.type
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {t.label} ({t.count})
            </button>
          ))}
      </div>

      {/* Suche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Suche in Titeln, OCR-Text, Absender..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tabelle */}
      {documentsLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">
            {searchTerm ? "Keine Dokumente gefunden" : "Noch keine Dokumente"}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setUploadOpen(true)}
              className="mt-3 text-sm text-blue-600 hover:underline"
            >
              Erstes Dokument hochladen
            </button>
          )}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Dokument</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Typ</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">KI-Erkennung</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Datum</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-blue-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium truncate max-w-xs">{doc.title}</p>
                        {doc.file_size && (
                          <p className="text-xs text-gray-400">{formatFileSize(doc.file_size)}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        TYPE_COLORS[doc.document_type] || TYPE_COLORS.other
                      )}
                    >
                      {DOCUMENT_TYPES[doc.document_type as DocumentType] || doc.document_type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {doc.ocr_result ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          <span>{Math.round(doc.ocr_result.confidence_score * 100)}% Konfidenz</span>
                        </div>
                        {doc.ocr_result.extracted_data?.sender && (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {doc.ocr_result.extracted_data.sender}
                          </p>
                        )}
                        {doc.ocr_result.extracted_data?.amounts?.[0] && (
                          <p className="text-xs text-gray-700 font-medium flex items-center gap-1">
                            <Euro className="h-3 w-3" />
                            {new Intl.NumberFormat("de-DE", {
                              style: "currency",
                              currency: "EUR",
                            }).format(doc.ocr_result.extracted_data.amounts[0].value)}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <AlertCircle className="h-3 w-3" />
                        <span>Nicht analysiert</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {formatDate(doc.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-gray-400 hover:text-blue-600 rounded transition-colors"
                        title="Öffnen"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                      <a
                        href={doc.file_url}
                        download
                        className="p-1.5 text-gray-400 hover:text-green-600 rounded transition-colors"
                        title="Herunterladen"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      {deleteConfirm === doc.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              deleteDocument.mutate(doc.id);
                              setDeleteConfirm(null);
                            }}
                            className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Löschen
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
                          >
                            Abbrechen
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(doc.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors"
                          title="Löschen"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Dialog */}
      <DocumentUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        supabase={supabase}
        organizationId={organizationId}
        businessId={businessId}
        contextOptions={contextOptions}
        mode={mode}
      />
    </div>
  );
}
