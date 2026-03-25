/**
 * @fintutto/shared — DocumentUploadDialog
 *
 * Universeller Dokument-Upload-Dialog mit KI-OCR-Analyse.
 * Funktioniert für Vermietify (Immobilien-Kontext) und
 * Financial Compass (Buchhaltungs-Kontext).
 *
 * Features:
 * - Drag & Drop + Klick-Upload
 * - Automatische KI-OCR-Analyse nach Upload
 * - Kontextabhängige Zuordnungsfelder
 * - Bulk-Upload-Modus (mehrere Dateien)
 */

import { useState, useCallback, useRef } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Building,
  Calendar,
  User,
  Euro,
  ArrowRight,
  ArrowLeft,
  X,
  Files,
} from "lucide-react";
import { useDocuments, DOCUMENT_TYPES, DocumentType } from "../../hooks/useDocuments";

// ─── Typen ───────────────────────────────────────────────────────────────────

interface ContextOption {
  id: string;
  label: string;
}

export interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supabase: SupabaseClient;
  organizationId?: string;
  businessId?: string;
  /** Kontextabhängige Zuordnungsoptionen */
  contextOptions?: {
    buildings?: ContextOption[];
    units?: ContextOption[];
    tenants?: ContextOption[];
    clients?: ContextOption[];
    expenseCategories?: ContextOption[];
  };
  mode?: "real_estate" | "business" | "all";
  /** Callback nach erfolgreichem Upload */
  onSuccess?: (documentId: string) => void;
}

type UploadStep = "upload" | "analyzing" | "review" | "saving";

interface AnalysisResult {
  detected_type: DocumentType;
  confidence: number;
  date: string | null;
  sender: string | null;
  recipient: string | null;
  amount: number | null;
  net_amount: number | null;
  tax_amount: number | null;
  invoice_number: string | null;
  description: string;
  category: string;
}

// ─── Hilfsfunktionen ─────────────────────────────────────────────────────────

function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(cents / 100);
}

// ─── Komponente ──────────────────────────────────────────────────────────────

export function DocumentUploadDialog({
  open,
  onOpenChange,
  supabase,
  organizationId,
  businessId,
  contextOptions = {},
  mode = "all",
  onSuccess,
}: DocumentUploadDialogProps) {
  const [step, setStep] = useState<UploadStep>("upload");
  const [files, setFiles] = useState<File[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Analysis results per file
  const [analysisResults, setAnalysisResults] = useState<(AnalysisResult | null)[]>([]);

  // Form state
  const [title, setTitle] = useState("");
  const [documentType, setDocumentType] = useState<DocumentType>("other");
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [notes, setNotes] = useState("");

  const { uploadDocument, bulkUpload, categories } = useDocuments({
    supabase,
    organizationId,
    businessId,
    mode,
  });

  const currentFile = files[currentFileIndex];
  const currentAnalysis = analysisResults[currentFileIndex];

  // ── Drag & Drop ──

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (f) => f.type === "application/pdf" || f.type.startsWith("image/")
    );
    if (droppedFiles.length > 0) {
      handleFilesSelected(droppedFiles);
    }
  }, []);

  const handleFilesSelected = async (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setIsBulkMode(selectedFiles.length > 1);
    setCurrentFileIndex(0);

    if (selectedFiles.length === 1) {
      // Einzelner Upload: direkt analysieren
      setStep("analyzing");
      await analyzeFile(selectedFiles[0], 0);
    } else {
      // Bulk: direkt in Review-Modus
      setStep("review");
    }
  };

  const analyzeFile = async (file: File, index: number) => {
    try {
      // Datei hochladen
      const fileExt = file.name.split(".").pop();
      const filePath = `temp/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const { error: storageError } = await supabase.storage
        .from("documents")
        .upload(filePath, file, { upsert: false });

      if (storageError) throw storageError;

      const { data: urlData } = supabase.storage.from("documents").getPublicUrl(filePath);

      // KI-Analyse
      const { data, error } = await supabase.functions.invoke("analyze-document", {
        body: { fileUrl: urlData.publicUrl, mode },
      });

      if (!error && data?.success) {
        const result = data.data as AnalysisResult;
        setAnalysisResults((prev) => {
          const next = [...prev];
          next[index] = result;
          return next;
        });

        // Formular vorausfüllen
        if (index === 0) {
          if (result.sender) setTitle(result.sender);
          if (result.detected_type) setDocumentType(result.detected_type);
        }
      }

      // Temp-Datei löschen
      await supabase.storage.from("documents").remove([filePath]);
    } catch {
      // Analyse-Fehler sind nicht kritisch
      setAnalysisResults((prev) => {
        const next = [...prev];
        next[index] = null;
        return next;
      });
    }

    setStep("review");
  };

  // ── Speichern ──

  const handleSave = async () => {
    if (!currentFile) return;
    setStep("saving");

    try {
      const doc = await uploadDocument.mutateAsync({
        file: currentFile,
        title: title || currentFile.name.replace(/\.[^/.]+$/, ""),
        documentType,
        buildingId: selectedBuildingId || undefined,
        tenantId: selectedTenantId || undefined,
        notes: notes || undefined,
        autoAnalyze: false, // Analyse wurde bereits durchgeführt
      });

      onSuccess?.(doc.id);

      if (currentFileIndex < files.length - 1) {
        // Nächste Datei
        setCurrentFileIndex((i) => i + 1);
        resetForm();
        setStep("upload");
      } else {
        // Alle Dateien fertig
        handleClose();
      }
    } catch {
      setStep("review");
    }
  };

  // Bulk-Upload (alle auf einmal, ohne Review)
  const handleBulkSave = async () => {
    setStep("saving");
    await bulkUpload.mutateAsync({
      files,
      defaultType: documentType,
      autoAnalyze: true,
    });
    handleClose();
  };

  const resetForm = () => {
    setTitle("");
    setDocumentType("other");
    setSelectedBuildingId("");
    setSelectedTenantId("");
    setSelectedClientId("");
    setSelectedCategory("");
    setNotes("");
  };

  const handleClose = () => {
    setFiles([]);
    setAnalysisResults([]);
    setCurrentFileIndex(0);
    setStep("upload");
    setIsBulkMode(false);
    resetForm();
    onOpenChange(false);
  };

  if (!open) return null;

  // ── Render ──

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-semibold">Dokument hochladen</h2>
            {isBulkMode && (
              <p className="text-sm text-gray-500">
                {currentFileIndex + 1} von {files.length} Dateien
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Step 1: Upload */}
          {step === "upload" && (
            <div className="space-y-4">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all",
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const selected = Array.from(e.target.files || []);
                    if (selected.length > 0) handleFilesSelected(selected);
                  }}
                />
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium text-gray-700">
                  Dateien hier ablegen oder klicken
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  PDF, JPG, PNG – bis zu 20 MB pro Datei
                </p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-purple-600 font-medium">
                    KI erkennt Typ, Betrag und Datum automatisch
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Files className="h-5 w-5 text-gray-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Bulk-Upload</p>
                  <p className="text-xs text-gray-500">
                    Lade mehrere Dateien gleichzeitig hoch – die KI ordnet alles automatisch zu
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Analyzing */}
          {step === "analyzing" && (
            <div className="py-12 text-center space-y-4">
              <div className="relative">
                <div className="h-16 w-16 mx-auto rounded-full bg-purple-100 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-purple-600 animate-pulse" />
                </div>
              </div>
              <div>
                <p className="text-lg font-medium">KI analysiert dein Dokument...</p>
                <p className="text-sm text-gray-500 mt-1">
                  Typ, Betrag, Datum und Absender werden erkannt
                </p>
              </div>
              {currentFile && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <FileText className="h-4 w-4" />
                  <span>{currentFile.name}</span>
                  <span>({formatFileSize(currentFile.size)})</span>
                </div>
              )}
              <Loader2 className="h-6 w-6 mx-auto animate-spin text-purple-500" />
            </div>
          )}

          {/* Step 3: Review */}
          {step === "review" && currentFile && (
            <div className="space-y-6">
              {/* Datei-Info */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FileText className="h-8 w-8 text-blue-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{currentFile.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(currentFile.size)}</p>
                </div>
                {currentAnalysis && (
                  <div className="ml-auto flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <CheckCircle className="h-3 w-3" />
                    <span>{Math.round(currentAnalysis.confidence * 100)}% Konfidenz</span>
                  </div>
                )}
              </div>

              {/* KI-Ergebnis */}
              {currentAnalysis ? (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">KI-Erkennung</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {currentAnalysis.sender && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{currentAnalysis.sender}</span>
                      </div>
                    )}
                    {currentAnalysis.date && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{currentAnalysis.date}</span>
                      </div>
                    )}
                    {currentAnalysis.amount !== null && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Euro className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">
                          {formatCurrency(Math.round(currentAnalysis.amount * 100))}
                        </span>
                      </div>
                    )}
                    {currentAnalysis.invoice_number && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span>Nr. {currentAnalysis.invoice_number}</span>
                      </div>
                    )}
                  </div>
                  {currentAnalysis.description && (
                    <p className="text-xs text-purple-700 italic">{currentAnalysis.description}</p>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border rounded-lg text-center text-sm text-gray-500">
                  <AlertCircle className="h-6 w-6 mx-auto mb-2 opacity-50" />
                  Keine automatische Erkennung – bitte manuell ausfüllen
                </div>
              )}

              {/* Formular */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={currentFile.name.replace(/\.[^/.]+$/, "")}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
                    <select
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.entries(DOCUMENT_TYPES).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Keine Kategorie</option>
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Kontextabhängige Zuordnung */}
                {contextOptions.buildings && contextOptions.buildings.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Building className="inline h-4 w-4 mr-1" />
                      Gebäude
                    </label>
                    <select
                      value={selectedBuildingId}
                      onChange={(e) => setSelectedBuildingId(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Kein Gebäude</option>
                      {contextOptions.buildings.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {contextOptions.tenants && contextOptions.tenants.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <User className="inline h-4 w-4 mr-1" />
                      Mieter
                    </label>
                    <select
                      value={selectedTenantId}
                      onChange={(e) => setSelectedTenantId(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Kein Mieter</option>
                      {contextOptions.tenants.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {contextOptions.clients && contextOptions.clients.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <User className="inline h-4 w-4 mr-1" />
                      Kunde / Lieferant
                    </label>
                    <select
                      value={selectedClientId}
                      onChange={(e) => setSelectedClientId(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Kein Kunde</option>
                      {contextOptions.clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Zusätzliche Notizen..."
                    rows={2}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>

              {/* Aktionen */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    setFiles([]);
                    setAnalysisResults([]);
                    setStep("upload");
                    resetForm();
                  }}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Zurück
                </button>

                <div className="flex gap-3">
                  {isBulkMode && (
                    <button
                      onClick={handleBulkSave}
                      className="flex items-center gap-2 px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Files className="h-4 w-4" />
                      Alle {files.length} speichern
                    </button>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={uploadDocument.isPending}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {uploadDocument.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    {isBulkMode && currentFileIndex < files.length - 1
                      ? "Speichern & Weiter"
                      : "Speichern"}
                    {isBulkMode && <ArrowRight className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Saving */}
          {step === "saving" && (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="h-16 w-16 mx-auto animate-spin text-blue-500" />
              <p className="text-lg font-medium">Dokument wird gespeichert...</p>
              {isBulkMode && (
                <p className="text-sm text-gray-500">
                  {currentFileIndex + 1} von {files.length} Dateien
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
