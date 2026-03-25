/**
 * @fintutto/shared — useDocuments
 *
 * Universeller Dokumenten-Hook für alle Fintutto-Apps.
 * Unterstützt Vermietify (organization_id) und Financial Compass (business_id).
 *
 * Features:
 * - Upload mit Fortschrittsanzeige (Supabase Storage)
 * - KI-OCR-Analyse via Supabase Edge Function "analyze-document"
 * - Bulk-Upload (mehrere Dateien gleichzeitig)
 * - Volltextsuche über OCR-Ergebnisse
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SupabaseClient } from "@supabase/supabase-js";

// ─── Dokument-Typen ──────────────────────────────────────────────────────────

export const DOCUMENT_TYPES = {
  // Allgemein
  invoice: "Rechnung",
  receipt: "Beleg / Quittung",
  contract: "Vertrag",
  letter: "Brief / Schreiben",
  other: "Sonstiges",
  unknown: "Unbekannt",
  // Immobilien (Vermietify)
  tax_notice: "Steuerbescheid",
  energy_certificate: "Energieausweis",
  protocol: "Übergabeprotokoll",
  // Buchhaltung (Financial Compass)
  expense_receipt: "Ausgabenbeleg",
  travel_expense: "Reisekostenbeleg",
  entertainment: "Bewirtungsbeleg",
  bank_statement: "Kontoauszug",
  tax_document: "Steuerdokument",
  payroll: "Lohnabrechnung",
} as const;

export type DocumentType = keyof typeof DOCUMENT_TYPES;

export const DOCUMENT_CATEGORIES_REAL_ESTATE = [
  { value: "rent_contract", label: "Mietvertrag" },
  { value: "handover_protocol", label: "Übergabeprotokoll" },
  { value: "invoice_repair", label: "Rechnung – Reparatur" },
  { value: "invoice_insurance", label: "Rechnung – Versicherung" },
  { value: "invoice_utilities", label: "Rechnung – Nebenkosten" },
  { value: "tax_document", label: "Steuerdokument" },
  { value: "correspondence", label: "Korrespondenz" },
  { value: "energy_certificate", label: "Energieausweis" },
  { value: "other", label: "Sonstiges" },
];

export const DOCUMENT_CATEGORIES_BUSINESS = [
  { value: "outgoing_invoice", label: "Ausgangsrechnung" },
  { value: "incoming_invoice", label: "Eingangsrechnung" },
  { value: "expense_receipt", label: "Ausgabenbeleg" },
  { value: "travel_expense", label: "Reisekostenbeleg" },
  { value: "entertainment", label: "Bewirtungsbeleg" },
  { value: "bank_statement", label: "Kontoauszug" },
  { value: "tax_document", label: "Steuerdokument" },
  { value: "contract", label: "Vertrag" },
  { value: "payroll", label: "Lohnabrechnung" },
  { value: "other", label: "Sonstiges" },
];

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface DocumentOCRResult {
  id: string;
  document_id: string;
  organization_id?: string;
  business_id?: string;
  detected_type: DocumentType;
  confidence_score: number;
  raw_text?: string;
  extracted_data: {
    date?: string | null;
    sender?: string | null;
    recipient?: string | null;
    amounts?: Array<{ value: number; currency?: string; label?: string }>;
    subject?: string | null;
    invoice_number?: string | null;
    tax_amount?: number | null;
    net_amount?: number | null;
    gross_amount?: number | null;
  };
  suggested_category?: string;
  user_feedback?: "correct" | "incorrect" | null;
  created_at: string;
}

export interface Document {
  id: string;
  organization_id?: string;
  business_id?: string;
  title: string;
  document_type: DocumentType;
  file_url: string;
  file_size: number | null;
  mime_type?: string | null;
  // Vermietify-Kontext
  building_id?: string | null;
  unit_id?: string | null;
  tenant_id?: string | null;
  lease_id?: string | null;
  // Financial Compass-Kontext
  expense_id?: string | null;
  invoice_id?: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joins
  buildings?: { id: string; name: string } | null;
  tenants?: { id: string; first_name: string; last_name: string } | null;
  ocr_result?: DocumentOCRResult | null;
}

export interface UploadProgress {
  fileName: string;
  progress: number; // 0-100
  status: "uploading" | "analyzing" | "done" | "error";
  error?: string;
  document?: Document;
}

// ─── Hook-Parameter ──────────────────────────────────────────────────────────

export interface UseDocumentsOptions {
  supabase: SupabaseClient;
  organizationId?: string;
  businessId?: string;
  /** Welche Kategorien sollen angezeigt werden? */
  mode?: "real_estate" | "business" | "all";
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useDocuments({
  supabase,
  organizationId,
  businessId,
  mode = "all",
}: UseDocumentsOptions) {
  const queryClient = useQueryClient();
  const contextId = organizationId || businessId;
  const contextField = organizationId ? "organization_id" : "business_id";

  const categories =
    mode === "real_estate"
      ? DOCUMENT_CATEGORIES_REAL_ESTATE
      : mode === "business"
      ? DOCUMENT_CATEGORIES_BUSINESS
      : [...DOCUMENT_CATEGORIES_REAL_ESTATE, ...DOCUMENT_CATEGORIES_BUSINESS];

  // ── Queries ──

  const { data: documents = [], isLoading: documentsLoading, error: documentsError } = useQuery({
    queryKey: ["documents", contextId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select(`
          *,
          buildings(id, name),
          tenants(id, first_name, last_name),
          ocr_result:document_ocr_results(*)
        `)
        .eq(contextField, contextId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Document[];
    },
    enabled: !!contextId,
  });

  // ── Upload (einzeln) ──

  const uploadDocument = useMutation({
    mutationFn: async ({
      file,
      title,
      documentType = "other",
      buildingId,
      unitId,
      tenantId,
      leaseId,
      expenseId,
      invoiceId,
      notes,
      autoAnalyze = true,
    }: {
      file: File;
      title: string;
      documentType?: DocumentType;
      buildingId?: string;
      unitId?: string;
      tenantId?: string;
      leaseId?: string;
      expenseId?: string;
      invoiceId?: string;
      notes?: string;
      autoAnalyze?: boolean;
    }) => {
      // 1. Datei in Supabase Storage hochladen
      const fileExt = file.name.split(".").pop();
      const filePath = `${contextId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error: storageError } = await supabase.storage
        .from("documents")
        .upload(filePath, file, { upsert: false });
      if (storageError) throw storageError;

      const { data: urlData } = supabase.storage.from("documents").getPublicUrl(filePath);

      // 2. Datensatz in DB anlegen
      const insertData: Record<string, unknown> = {
        [contextField]: contextId,
        title,
        document_type: documentType,
        file_url: urlData.publicUrl,
        file_size: file.size,
        mime_type: file.type,
        notes: notes || null,
      };
      if (buildingId) insertData.building_id = buildingId;
      if (unitId) insertData.unit_id = unitId;
      if (tenantId) insertData.tenant_id = tenantId;
      if (leaseId) insertData.lease_id = leaseId;
      if (expenseId) insertData.expense_id = expenseId;
      if (invoiceId) insertData.invoice_id = invoiceId;

      const { data: doc, error: dbError } = await supabase
        .from("documents")
        .insert(insertData)
        .select()
        .single();
      if (dbError) throw dbError;

      // 3. Optional: KI-Analyse starten
      if (autoAnalyze) {
        try {
          await supabase.functions.invoke("analyze-document", {
            body: { documentId: doc.id, fileUrl: urlData.publicUrl, [contextField]: contextId },
          });
        } catch {
          // Analyse-Fehler sind nicht kritisch
        }
      }

      return doc as Document;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", contextId] });
    },
  });

  // ── Bulk-Upload ──

  const bulkUpload = useMutation({
    mutationFn: async ({
      files,
      defaultType = "other",
      autoAnalyze = true,
    }: {
      files: File[];
      defaultType?: DocumentType;
      autoAnalyze?: boolean;
    }): Promise<{ succeeded: Document[]; failed: Array<{ file: File; error: string }> }> => {
      const succeeded: Document[] = [];
      const failed: Array<{ file: File; error: string }> = [];

      // Parallel in Batches von 3
      const batchSize = 3;
      for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        const results = await Promise.allSettled(
          batch.map((file) =>
            uploadDocument.mutateAsync({
              file,
              title: file.name.replace(/\.[^/.]+$/, ""),
              documentType: defaultType,
              autoAnalyze,
            })
          )
        );
        results.forEach((result, idx) => {
          if (result.status === "fulfilled") {
            succeeded.push(result.value);
          } else {
            failed.push({ file: batch[idx], error: result.reason?.message || "Unbekannter Fehler" });
          }
        });
      }

      return { succeeded, failed };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", contextId] });
    },
  });

  // ── KI-Analyse (manuell auslösen) ──

  const analyzeDocument = useMutation({
    mutationFn: async ({ documentId, fileUrl }: { documentId: string; fileUrl: string }) => {
      const { data, error } = await supabase.functions.invoke("analyze-document", {
        body: { documentId, fileUrl, [contextField]: contextId },
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.error || "Analyse fehlgeschlagen");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", contextId] });
    },
  });

  // ── OCR-Feedback ──

  const provideFeedback = useMutation({
    mutationFn: async ({ ocrId, feedback }: { ocrId: string; feedback: "correct" | "incorrect" }) => {
      const { error } = await supabase
        .from("document_ocr_results")
        .update({ user_feedback: feedback })
        .eq("id", ocrId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", contextId] });
    },
  });

  // ── Aktualisieren ──

  const updateDocument = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Omit<Document, "id" | "created_at" | "updated_at">>;
    }) => {
      const { data, error } = await supabase
        .from("documents")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Document;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", contextId] });
    },
  });

  // ── Löschen ──

  const deleteDocument = useMutation({
    mutationFn: async (id: string) => {
      const doc = documents.find((d) => d.id === id);
      if (doc?.file_url) {
        const path = doc.file_url.split("/documents/")[1];
        if (path) await supabase.storage.from("documents").remove([path]);
      }
      const { error } = await supabase.from("documents").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", contextId] });
    },
  });

  // ── Suche ──

  const searchDocuments = (searchTerm: string): Document[] => {
    if (!searchTerm.trim()) return documents;
    const term = searchTerm.toLowerCase();
    return documents.filter((doc) => {
      const matchesTitle = doc.title.toLowerCase().includes(term);
      const matchesOCR = doc.ocr_result?.raw_text?.toLowerCase().includes(term);
      const matchesSender = doc.ocr_result?.extracted_data?.sender?.toLowerCase().includes(term);
      const matchesRecipient = doc.ocr_result?.extracted_data?.recipient?.toLowerCase().includes(term);
      return matchesTitle || matchesOCR || matchesSender || matchesRecipient;
    });
  };

  // ── Stats ──

  const stats = {
    total: documents.length,
    processed: documents.filter((d) => d.ocr_result).length,
    unprocessed: documents.filter((d) => !d.ocr_result).length,
    byType: Object.entries(DOCUMENT_TYPES).map(([key, label]) => ({
      type: key as DocumentType,
      label,
      count: documents.filter((d) => d.ocr_result?.detected_type === key).length,
    })),
  };

  return {
    documents,
    documentsLoading,
    documentsError,
    stats,
    categories,
    uploadDocument,
    bulkUpload,
    analyzeDocument,
    provideFeedback,
    updateDocument,
    deleteDocument,
    searchDocuments,
  };
}
