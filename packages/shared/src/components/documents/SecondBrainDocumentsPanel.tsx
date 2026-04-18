/**
 * SecondBrainDocumentsPanel
 *
 * Shared-Komponente: Zeigt alle SecondBrain-Dokumente an, die mit einer
 * bestimmten Entität verknüpft sind. Kann in Vermietify (Gebäude, Mieter),
 * Financial Compass (Firmen, Ausgaben) und anderen Apps eingebettet werden.
 *
 * Verwendung:
 *   <SecondBrainDocumentsPanel entityType="building" entityId={buildingId} />
 *   <SecondBrainDocumentsPanel entityType="business" entityId={businessId} />
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import { Brain, FileText, Image, File, ExternalLink, Plus } from 'lucide-react';

// ── Typen ────────────────────────────────────────────────────────────────────

export type SbEntityType =
  | 'building'
  | 'unit'
  | 'tenant'
  | 'lease'
  | 'business'
  | 'expense'
  | 'invoice'
  | 'meter';

export interface SbDocumentPreview {
  id: string;
  title: string;
  file_name: string;
  file_type: string;
  file_size: number;
  document_type: string | null;
  category: string | null;
  ocr_status: string;
  summary: string | null;
  is_favorite: boolean;
  created_at: string;
  storage_path: string;
  file_url: string | null;
}

export interface SecondBrainDocumentsPanelProps {
  entityType: SbEntityType;
  entityId: string | undefined | null;
  /** URL der SecondBrain-App für Deep-Links (default: https://secondbrain.fintutto.cloud) */
  secondBrainUrl?: string;
  /** Supabase URL (aus VITE_SUPABASE_URL) */
  supabaseUrl?: string;
  /** Supabase Anon Key (aus VITE_SUPABASE_ANON_KEY) */
  supabaseAnonKey?: string;
  /** Maximale Anzahl anzuzeigender Dokumente */
  maxItems?: number;
  /** Callback wenn ein Dokument angeklickt wird */
  onDocumentClick?: (doc: SbDocumentPreview) => void;
}

// ── Hilfsfunktionen ──────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Heute';
  if (diffDays === 1) return 'Gestern';
  if (diffDays < 7) return `vor ${diffDays} Tagen`;
  if (diffDays < 30) return `vor ${Math.floor(diffDays / 7)} Wochen`;
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const FILE_TYPE_ICONS: Record<string, typeof FileText> = {
  pdf: FileText,
  image: Image,
};

const FILE_TYPE_COLORS: Record<string, string> = {
  pdf: '#ef4444',
  image: '#3b82f6',
  text: '#22c55e',
  other: '#6b7280',
};

// ── Haupt-Komponente ─────────────────────────────────────────────────────────

export function SecondBrainDocumentsPanel({
  entityType,
  entityId,
  secondBrainUrl = 'https://secondbrain.fintutto.cloud',
  supabaseUrl,
  supabaseAnonKey,
  maxItems = 5,
  onDocumentClick,
}: SecondBrainDocumentsPanelProps) {
  const url = supabaseUrl
    || (typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_SUPABASE_URL : undefined)
    || 'https://aaefocdqgdgexkcrjhks.supabase.co';
  const key = supabaseAnonKey
    || (typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_SUPABASE_ANON_KEY : undefined)
    || '';

  const supabase = React.useMemo(
    () => createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } }),
    [url, key]
  );

  const { data: documents = [], isLoading } = useQuery<SbDocumentPreview[]>({
    queryKey: ['sb-documents-panel', entityType, entityId],
    queryFn: async () => {
      if (!entityId) return [];
      const { data, error } = await supabase.rpc('get_documents_for_entity', {
        p_entity_type: entityType,
        p_entity_id: entityId,
      });
      if (error) throw error;
      return (data as SbDocumentPreview[]) ?? [];
    },
    enabled: !!entityId,
    staleTime: 1000 * 60 * 2,
  });

  const uploadLink = `${secondBrainUrl}/upload?context=${entityType}&id=${entityId ?? ''}`;
  const allDocsLink = `${secondBrainUrl}/dokumente?filter=${entityType}:${entityId ?? ''}`;
  const displayedDocs = documents.slice(0, maxItems);

  return (
    <div style={{ fontFamily: 'inherit' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Brain style={{ width: '16px', height: '16px', color: '#6366f1' }} />
          <span style={{ fontSize: '14px', fontWeight: 600 }}>SecondBrain-Dokumente</span>
          {documents.length > 0 && (
            <span style={{
              fontSize: '11px',
              background: '#6366f1',
              color: 'white',
              borderRadius: '9999px',
              padding: '1px 7px',
            }}>
              {documents.length}
            </span>
          )}
        </div>
        <a
          href={uploadLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            color: '#6366f1',
            textDecoration: 'none',
            padding: '4px 10px',
            border: '1px solid #6366f1',
            borderRadius: '6px',
          }}
        >
          <Plus style={{ width: '12px', height: '12px' }} />
          Hochladen
        </a>
      </div>

      {/* Inhalt */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: '52px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.05)',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      ) : displayedDocs.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '24px',
          border: '1px dashed rgba(99, 102, 241, 0.3)',
          borderRadius: '10px',
          color: '#9ca3af',
        }}>
          <Brain style={{ width: '24px', height: '24px', margin: '0 auto 8px', opacity: 0.5 }} />
          <p style={{ fontSize: '13px', marginBottom: '8px' }}>Noch keine Dokumente verknüpft</p>
          <a
            href={uploadLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '12px', color: '#6366f1', textDecoration: 'none' }}
          >
            Jetzt in SecondBrain hochladen →
          </a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {displayedDocs.map((doc) => {
            const Icon = FILE_TYPE_ICONS[doc.file_type] || File;
            const color = FILE_TYPE_COLORS[doc.file_type] || FILE_TYPE_COLORS.other;
            return (
              <div
                key={doc.id}
                onClick={() => onDocumentClick ? onDocumentClick(doc) : window.open(`${secondBrainUrl}/dokumente?view=${doc.id}`, '_blank')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid rgba(0,0,0,0.08)',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(99, 102, 241, 0.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: `${color}18`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon style={{ width: '16px', height: '16px', color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginBottom: '2px',
                  }}>
                    {doc.title}
                  </p>
                  <p style={{ fontSize: '11px', color: '#9ca3af' }}>
                    {formatFileSize(doc.file_size)} · {formatRelativeTime(doc.created_at)}
                  </p>
                </div>
                <ExternalLink style={{ width: '14px', height: '14px', color: '#9ca3af', flexShrink: 0 }} />
              </div>
            );
          })}

          {/* "Alle anzeigen" Link */}
          {documents.length > maxItems && (
            <a
              href={allDocsLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                textAlign: 'center',
                fontSize: '12px',
                color: '#6366f1',
                textDecoration: 'none',
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                marginTop: '4px',
              }}
            >
              Alle {documents.length} Dokumente in SecondBrain anzeigen →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default SecondBrainDocumentsPanel;
