/**
 * BulkUpload — Massenimport von Immobilien-Dokumenten
 *
 * Unterstützt:
 * - Drag & Drop (mehrere Dateien gleichzeitig)
 * - KI-OCR (Mietverträge, Protokolle, Rechnungen, Energieausweise)
 * - E-Mail-Eingang (Dokumente per Mail weiterleiten)
 * - Kamera-Upload (mobile, z.B. Übergabeprotokoll fotografieren)
 */
import { useState, useCallback, useRef } from "react";
import {
  Upload, FileText, X, CheckCircle2, AlertCircle, Loader2,
  Mail, Inbox, Camera, Sparkles, ChevronRight,
  ArrowRight, Building2, Info, Home, FileSignature
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";

interface UploadItem {
  id: string;
  file: File;
  type: "contract" | "protocol" | "invoice" | "energy_certificate" | "tax_notice" | "letter" | "other";
  status: "pending" | "uploading" | "analyzing" | "done" | "error";
  progress: number;
  error?: string;
  result?: {
    document_type?: string;
    amount?: number;
    date?: string;
    description?: string;
    confidence?: number;
  };
}

const ACCEPTED_TYPES = ".pdf,.jpg,.jpeg,.png,.webp,.heic,.tiff";
const MAX_SIZE_MB = 20;
const MAX_FILES = 50;

const TYPE_LABELS: Record<UploadItem["type"], string> = {
  contract: "Mietvertrag",
  protocol: "Übergabeprotokoll",
  invoice: "Rechnung",
  energy_certificate: "Energieausweis",
  tax_notice: "Steuerbescheid",
  letter: "Brief / Schreiben",
  other: "Sonstiges",
};

function getFileType(file: File): UploadItem["type"] {
  const name = file.name.toLowerCase();
  if (name.includes("vertrag") || name.includes("mietvertrag")) return "contract";
  if (name.includes("protokoll") || name.includes("uebergabe") || name.includes("übergabe")) return "protocol";
  if (name.includes("rechnung") || name.includes("invoice")) return "invoice";
  if (name.includes("energie") || name.includes("energy")) return "energy_certificate";
  if (name.includes("bescheid") || name.includes("steuer")) return "tax_notice";
  return "other";
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = () => reject(new Error("Datei konnte nicht gelesen werden"));
    reader.readAsDataURL(file);
  });
}

export default function BulkUpload() {
  const { user } = useAuth();
  const [items, setItems] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: File[]) => {
    const valid = files
      .filter(f => f.size <= MAX_SIZE_MB * 1024 * 1024)
      .slice(0, MAX_FILES - items.length);
    const oversized = files.filter(f => f.size > MAX_SIZE_MB * 1024 * 1024);
    if (oversized.length > 0) toast.error(`${oversized.length} Datei(en) zu groß (max. ${MAX_SIZE_MB} MB)`);
    setItems(prev => [...prev, ...valid.map(f => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file: f,
      type: getFileType(f),
      status: "pending" as const,
      progress: 0,
    }))]);
  }, [items.length]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  }, [addFiles]);

  const removeItem = useCallback((id: string) => setItems(prev => prev.filter(i => i.id !== id)), []);
  const changeType = useCallback((id: string, type: UploadItem["type"]) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, type } : i)), []);

  const processAll = useCallback(async () => {
    if (!user) { toast.error("Bitte einloggen"); return; }
    const pending = items.filter(i => i.status === "pending");
    if (!pending.length) return;
    setIsProcessing(true);

    for (const item of pending) {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: "uploading", progress: 20 } : i));
      try {
        const path = `documents/${user.id}/${Date.now()}_${item.file.name}`;
        const { error: storageErr } = await supabase.storage.from("documents").upload(path, item.file);
        if (storageErr) throw new Error(storageErr.message);

        const { data: { publicUrl } } = supabase.storage.from("documents").getPublicUrl(path);

        setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: "analyzing", progress: 60 } : i));

        // KI-Analyse für Bilder und PDFs
        let result: UploadItem["result"] = { document_type: TYPE_LABELS[item.type] };
        if (item.file.type.startsWith("image/") || item.file.type === "application/pdf") {
          try {
            const base64 = await fileToBase64(item.file);
            const { data: analyzed } = await supabase.functions.invoke("analyze-receipt", {
              body: { image: base64, mediaType: item.file.type, context: "real_estate_document" },
            });
            if (analyzed && !analyzed.fallback) {
              result = {
                document_type: TYPE_LABELS[item.type],
                amount: analyzed.grossAmount,
                date: analyzed.date,
                description: analyzed.vendor || item.file.name,
                confidence: analyzed.confidence,
              };
            }
          } catch { /* KI-Fehler ignorieren, Datei trotzdem speichern */ }
        }

        // In documents-Tabelle speichern
        await supabase.from("documents").insert({
          user_id: user.id,
          file_name: item.file.name,
          file_url: publicUrl,
          file_type: item.file.type,
          document_type: item.type,
          amount: result.amount || null,
          date: result.date || new Date().toISOString().split("T")[0],
          description: result.description || item.file.name,
        });

        setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: "done", progress: 100, result } : i));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Fehler beim Verarbeiten";
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: "error", progress: 0, error: msg } : i));
      }
    }

    setIsProcessing(false);
    toast.success(`${pending.length} Dokument(e) erfolgreich hochgeladen`);
  }, [items, user]);

  const pendingCount = items.filter(i => i.status === "pending").length;
  const doneCount = items.filter(i => i.status === "done").length;
  const errorCount = items.filter(i => i.status === "error").length;
  const emailInbox = user ? `dokumente+${user.id.slice(0, 8)}@vermietify.app` : null;

  return (
    <MainLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Upload className="h-6 w-6 text-primary" />
            Dokumente hochladen
          </h1>
          <p className="text-muted-foreground mt-1">
            Mietverträge, Protokolle, Rechnungen und mehr — KI erkennt den Dokumenttyp automatisch
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" /> Dateien hochladen
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> Per E-Mail
            </TabsTrigger>
            <TabsTrigger value="camera" className="flex items-center gap-2">
              <Camera className="h-4 w-4" /> Kamera
            </TabsTrigger>
          </TabsList>

          {/* Tab: Dateien */}
          <TabsContent value="upload" className="space-y-4 mt-4">
            <div
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer select-none ${
                isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/40"
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" multiple accept={ACCEPTED_TYPES}
                onChange={e => { if (e.target.files) { addFiles(Array.from(e.target.files)); e.target.value = ""; } }}
                className="hidden" />
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 transition-colors ${isDragging ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                <Upload className="h-8 w-8" />
              </div>
              <p className="text-lg font-semibold mb-1">{isDragging ? "Jetzt loslassen!" : "Dokumente hier ablegen"}</p>
              <p className="text-muted-foreground text-sm">PDF, JPG, PNG, HEIC bis {MAX_SIZE_MB} MB</p>
              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><FileSignature className="h-3.5 w-3.5" /> Mietverträge</span>
                <span className="flex items-center gap-1"><Home className="h-3.5 w-3.5" /> Protokolle</span>
                <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> Rechnungen</span>
                <span className="flex items-center gap-1"><Sparkles className="h-3.5 w-3.5 text-primary" /> KI-Analyse</span>
              </div>
            </div>

            {items.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span>{items.length} Datei{items.length !== 1 ? "en" : ""}</span>
                    {doneCount > 0 && <><span>·</span><span className="text-green-600 font-medium">{doneCount} fertig</span></>}
                    {errorCount > 0 && <><span>·</span><span className="text-destructive font-medium">{errorCount} Fehler</span></>}
                  </div>
                  <button onClick={() => setItems([])} className="text-muted-foreground hover:text-foreground text-xs" disabled={isProcessing}>
                    Alle entfernen
                  </button>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {items.map(item => (
                    <div key={item.id} className={`rounded-xl border p-3 flex items-center gap-3 transition-colors ${
                      item.status === "done" ? "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20" :
                      item.status === "error" ? "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20" : "border-border bg-card"
                    }`}>
                      <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-medium truncate">{item.file.name}</p>
                          <select value={item.type} onChange={e => changeType(item.id, e.target.value as UploadItem["type"])}
                            disabled={item.status !== "pending"} className="text-xs border rounded px-1 py-0.5 bg-background shrink-0">
                            {(Object.keys(TYPE_LABELS) as UploadItem["type"][]).map(t => (
                              <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatSize(item.file.size)}</span>
                          {item.status === "uploading" && <span className="text-primary flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Hochladen...</span>}
                          {item.status === "analyzing" && <span className="text-primary flex items-center gap-1"><Sparkles className="h-3 w-3 animate-spin" /> KI analysiert...</span>}
                          {item.status === "done" && item.result && (
                            <span className="text-green-700 dark:text-green-400">
                              {item.result.document_type}
                              {item.result.amount && ` · ${new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(item.result.amount)}`}
                            </span>
                          )}
                          {item.status === "error" && <span className="text-destructive">{item.error}</span>}
                        </div>
                        {(item.status === "uploading" || item.status === "analyzing") && <Progress value={item.progress} className="h-1 mt-1.5" />}
                      </div>
                      <div className="shrink-0">
                        {item.status === "done" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                        {item.status === "error" && <AlertCircle className="h-5 w-5 text-destructive" />}
                        {(item.status === "uploading" || item.status === "analyzing") && <Loader2 className="h-5 w-5 text-primary animate-spin" />}
                        {item.status === "pending" && (
                          <button onClick={() => removeItem(item.id)} className="p-1 hover:bg-accent rounded-md transition-colors">
                            <X className="h-4 w-4 text-muted-foreground" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {pendingCount > 0 && (
                  <Button onClick={processAll} disabled={isProcessing} className="w-full h-11 text-base font-semibold" size="lg">
                    {isProcessing
                      ? <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Wird verarbeitet...</>
                      : <><Sparkles className="h-5 w-5 mr-2" /> {pendingCount} Dokument{pendingCount !== 1 ? "e" : ""} hochladen & analysieren</>
                    }
                  </Button>
                )}

                {doneCount > 0 && pendingCount === 0 && !isProcessing && (
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setItems([])} className="flex-1">Weitere Dateien</Button>
                    <Button asChild className="flex-1">
                      <a href="/documents">Zu den Dokumenten <ArrowRight className="h-4 w-4 ml-2" /></a>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Tab: E-Mail */}
          <TabsContent value="email" className="mt-4">
            <div className="rounded-2xl border bg-card p-6 space-y-5">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 shrink-0">
                  <Inbox className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">E-Mail-Eingang für Dokumente</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Leite Mietverträge, Rechnungen und Schreiben direkt per E-Mail weiter.
                  </p>
                </div>
              </div>
              {emailInbox ? (
                <div className="space-y-3">
                  <div className="bg-muted rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-1">Deine persönliche Dokument-E-Mail-Adresse:</p>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono text-primary flex-1">{emailInbox}</code>
                      <button onClick={() => { navigator.clipboard.writeText(emailInbox); toast.success("Kopiert!"); }}
                        className="text-xs border rounded px-2 py-1 hover:bg-accent transition-colors">Kopieren</button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2"><ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" /><span>Leite Schreiben von Mietern, Behörden oder Handwerkern weiter</span></div>
                    <div className="flex items-start gap-2"><ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" /><span>PDF-Anhänge werden automatisch erkannt und kategorisiert</span></div>
                    <div className="flex items-start gap-2"><ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" /><span>Dokumente erscheinen innerhalb von Minuten in deiner Dokumenten-Liste</span></div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Bitte einloggen.</p>
              )}
            </div>
          </TabsContent>

          {/* Tab: Kamera */}
          <TabsContent value="camera" className="mt-4">
            <div className="rounded-2xl border bg-card p-6 space-y-5">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 shrink-0">
                  <Camera className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Dokument fotografieren</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Fotografiere Übergabeprotokolle, Zählerstände oder Schäden direkt mit der Kamera.
                  </p>
                </div>
              </div>
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" multiple
                onChange={e => { if (e.target.files) { addFiles(Array.from(e.target.files)); setActiveTab("upload"); e.target.value = ""; } }}
                className="hidden" />
              <Button onClick={() => cameraInputRef.current?.click()} className="w-full h-12 text-base">
                <Camera className="h-5 w-5 mr-2" /> Kamera öffnen
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* KI-Tipps */}
        <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground space-y-2">
          <p className="font-medium text-foreground flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-primary" /> KI erkennt automatisch:</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
            <span>✓ Mietvertrag vs. Protokoll vs. Rechnung</span>
            <span>✓ Datum und Betrag</span>
            <span>✓ Immobilien-Zuordnung (wenn im Dateinamen)</span>
            <span>✓ Mieter-Name aus Vertrag</span>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
