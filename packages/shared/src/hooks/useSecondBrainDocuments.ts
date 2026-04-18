/**
 * useSecondBrainDocuments
 *
 * Shared Hook: Lädt alle SecondBrain-Dokumente, die mit einer bestimmten
 * Entität im Fintutto-Ökosystem verknüpft sind.
 *
 * Verwendungsbeispiele:
 *   // In Vermietify (Gebäude-Details):
 *   const { documents } = useSecondBrainDocuments('building', buildingId);
 *
 *   // In Financial Compass (Firmen-Details):
 *   const { documents } = useSecondBrainDocuments('business', businessId);
 *
 *   // In Vermietify (Mieter-Details):
 *   const { documents } = useSecondBrainDocuments('tenant', tenantId);
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';

// ── Typen ────────────────────────────────────────────────────────────────────

export type SbEntityType =
  | 'building'
  | 'unit'
  | 'tenant'
  | 'lease'
  | 'business'
  | 'expense'
  | 'invoice'
  | 'meter'
  // SSOT: Neue Entitätstypen
  | 'core_contact'
  | 'bescheid'
  | 'lead'
  | 'organization'
  | 'finance_account'
  | 'plant';

export interface SbDocument {
  id: string;
  title: string;
  file_name: string;
  file_type: string;
  file_size: number;
  document_type: string | null;
  category: string | null;
  tags: string[];
  ocr_status: 'pending' | 'processing' | 'completed' | 'failed';
  summary: string | null;
  is_favorite: boolean;
  created_at: string;
  storage_path: string;
  file_url: string | null;
  link_notes?: string | null;
}

export interface SbDocumentEntityLink {
  id: string;
  document_id: string;
  entity_type: SbEntityType;
  entity_id: string;
  linked_at: string;
  notes?: string | null;
}

export interface SbDocumentSuggestion {
  id: string;
  document_id: string;
  entity_type: SbEntityType;
  entity_id: string;
  confidence: number;
  reason?: string | null;
  status: 'pending' | 'accepted' | 'rejected';
}

// ── Supabase-Client (wird aus der App-Konfiguration übernommen) ──────────────

function getSupabaseClient() {
  const url = (typeof window !== 'undefined' && (window as any).__SUPABASE_URL__)
    || import.meta?.env?.VITE_SUPABASE_URL
    || 'https://aaefocqdgdgexkcrjhks.supabase.co';
  const key = (typeof window !== 'undefined' && (window as any).__SUPABASE_ANON_KEY__)
    || import.meta?.env?.VITE_SUPABASE_ANON_KEY
    || '';
  return createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } });
}

// ── Hook: Dokumente für eine Entität laden ────────────────────────────────────

export function useSecondBrainDocuments(
  entityType: SbEntityType,
  entityId: string | undefined | null
) {
  const supabase = getSupabaseClient();

  const {
    data: documents = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<SbDocument[]>({
    queryKey: ['sb-documents', entityType, entityId],
    queryFn: async () => {
      if (!entityId) return [];
      const { data, error } = await supabase.rpc('get_documents_for_entity', {
        p_entity_type: entityType,
        p_entity_id: entityId,
      });
      if (error) throw error;
      return (data as SbDocument[]) ?? [];
    },
    enabled: !!entityId,
    staleTime: 1000 * 60 * 2, // 2 Minuten Cache
  });

  return { documents, isLoading, isError, error, refetch };
}

// ── Hook: Alle Entitäts-Verknüpfungen eines Dokuments laden ──────────────────

export function useDocumentEntityLinks(documentId: string | undefined | null) {
  const supabase = getSupabaseClient();

  return useQuery<SbDocumentEntityLink[]>({
    queryKey: ['sb-entity-links', documentId],
    queryFn: async () => {
      if (!documentId) return [];
      const { data, error } = await supabase.rpc('get_entity_links_for_document', {
        p_document_id: documentId,
      });
      if (error) throw error;
      return (data as SbDocumentEntityLink[]) ?? [];
    },
    enabled: !!documentId,
  });
}

// ── Hook: Dokument mit Entität verknüpfen ─────────────────────────────────────

export function useLinkDocumentToEntity() {
  const supabase = getSupabaseClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      documentId,
      entityType,
      entityId,
      notes,
    }: {
      documentId: string;
      entityType: SbEntityType;
      entityId: string;
      notes?: string;
    }) => {
      const { error } = await supabase
        .from('sb_document_entity_links')
        .upsert({
          document_id: documentId,
          entity_type: entityType,
          entity_id: entityId,
          notes: notes ?? null,
        });
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['sb-documents', variables.entityType, variables.entityId],
      });
      queryClient.invalidateQueries({
        queryKey: ['sb-entity-links', variables.documentId],
      });
    },
  });
}

// ── Hook: Verknüpfung entfernen ───────────────────────────────────────────────

export function useUnlinkDocumentFromEntity() {
  const supabase = getSupabaseClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      documentId,
      entityType,
      entityId,
    }: {
      documentId: string;
      entityType: SbEntityType;
      entityId: string;
    }) => {
      const { error } = await supabase
        .from('sb_document_entity_links')
        .delete()
        .eq('document_id', documentId)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['sb-documents', variables.entityType, variables.entityId],
      });
      queryClient.invalidateQueries({
        queryKey: ['sb-entity-links', variables.documentId],
      });
    },
  });
}

// ── Hook: KI-Vorschläge für ein Dokument laden ────────────────────────────────

export function useDocumentSuggestions(documentId: string | undefined | null) {
  const supabase = getSupabaseClient();

  return useQuery<SbDocumentSuggestion[]>({
    queryKey: ['sb-suggestions', documentId],
    queryFn: async () => {
      if (!documentId) return [];
      const { data, error } = await supabase
        .from('sb_document_suggestions')
        .select('*')
        .eq('document_id', documentId)
        .eq('status', 'pending')
        .order('confidence', { ascending: false });
      if (error) throw error;
      return (data as SbDocumentSuggestion[]) ?? [];
    },
    enabled: !!documentId,
  });
}

// ── Hook: KI-Vorschlag akzeptieren oder ablehnen ──────────────────────────────

export function useResolveSuggestion() {
  const supabase = getSupabaseClient();
  const queryClient = useQueryClient();
  const linkDocument = useLinkDocumentToEntity();

  return useMutation({
    mutationFn: async ({
      suggestion,
      action,
    }: {
      suggestion: SbDocumentSuggestion;
      action: 'accepted' | 'rejected';
    }) => {
      // Status des Vorschlags aktualisieren
      const { error } = await supabase
        .from('sb_document_suggestions')
        .update({ status: action })
        .eq('id', suggestion.id);
      if (error) throw error;

      // Bei Akzeptanz: Verknüpfung anlegen
      if (action === 'accepted') {
        await linkDocument.mutateAsync({
          documentId: suggestion.document_id,
          entityType: suggestion.entity_type as SbEntityType,
          entityId: suggestion.entity_id,
          notes: `KI-Vorschlag akzeptiert (${Math.round(suggestion.confidence * 100)}% Konfidenz)`,
        });
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['sb-suggestions', variables.suggestion.document_id],
      });
    },
  });
}
