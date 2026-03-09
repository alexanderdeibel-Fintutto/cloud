import { FileText, Image, File, MoreVertical, Star, Trash2, FolderOpen, Eye, AlertTriangle, Clock, Receipt } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DOCUMENT_TYPES } from '@/hooks/useWorkflows'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu'
import { formatRelativeTime, formatFileSize } from '@/lib/utils'

export interface Document {
  id: string
  title: string
  file_type: string
  file_size: number
  category: string | null
  tags: string[]
  ocr_status: 'pending' | 'processing' | 'completed' | 'failed'
  ocr_text: string | null
  summary: string | null
  is_favorite: boolean
  created_at: string
  updated_at: string
  storage_path: string
  // Power-Upgrade fields
  company_id?: string | null
  document_type?: string
  priority?: string
  status?: string
  sender?: string | null
  receiver?: string | null
  document_date?: string | null
  amount?: number | null
  currency?: string
  reference_number?: string | null
  notes?: string | null
  workflow_status?: string
  ai_metadata?: Record<string, unknown>
}

export interface CollectionInfo {
  id: string
  name: string
  color: string
}

const fileTypeIcons: Record<string, typeof FileText> = {
  pdf: FileText,
  image: Image,
  text: FileText,
}

const fileTypeColors: Record<string, string> = {
  pdf: 'bg-red-500/10 text-red-500',
  image: 'bg-blue-500/10 text-blue-500',
  text: 'bg-green-500/10 text-green-500',
  other: 'bg-muted text-muted-foreground',
}

interface DocumentCardProps {
  document: Document
  onView: (doc: Document) => void
  onFavorite: (doc: Document) => void
  onDelete: (doc: Document) => void
  onAddToCollection?: (doc: Document, collectionId: string) => void
  collections?: CollectionInfo[]
  selected?: boolean
  onSelect?: (doc: Document) => void
  selectionMode?: boolean
}

export default function DocumentCard({
  document: doc,
  onView,
  onFavorite,
  onDelete,
  onAddToCollection,
  collections = [],
  selected = false,
  onSelect,
  selectionMode = false,
}: DocumentCardProps) {
  const Icon = fileTypeIcons[doc.file_type] || File
  const colorClass = fileTypeColors[doc.file_type] || fileTypeColors.other
  const docTypeInfo = doc.document_type ? DOCUMENT_TYPES[doc.document_type] : null

  const handleClick = () => {
    if (selectionMode && onSelect) {
      onSelect(doc)
    } else {
      onView(doc)
    }
  }

  return (
    <div
      className={`doc-card group cursor-pointer relative overflow-hidden ${selected ? 'ring-2 ring-primary border-primary' : ''}`}
      onClick={handleClick}
    >
      {/* Colored top strip based on document type */}
      {docTypeInfo && (
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ backgroundColor: docTypeInfo.color }} />
      )}

      {/* Selection indicator */}
      {selectionMode && (
        <div className="absolute top-2.5 left-2.5 z-10">
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selected ? 'bg-primary border-primary text-white' : 'border-muted-foreground/40 bg-background'}`}>
            {selected && <svg className="w-3 h-3" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" fill="none" /></svg>}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => { e.stopPropagation(); onFavorite(doc) }}
          >
            <Star className={`w-3.5 h-3.5 ${doc.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                <MoreVertical className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(doc) }}>
                <Eye className="w-4 h-4 mr-2" /> Ansehen
              </DropdownMenuItem>
              {collections.length > 0 ? (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <FolderOpen className="w-4 h-4 mr-2" /> Zu Sammlung
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {collections.map((col) => (
                      <DropdownMenuItem
                        key={col.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          onAddToCollection?.(doc, col.id)
                        }}
                      >
                        <span className="w-3 h-3 rounded-full shrink-0 mr-2" style={{ backgroundColor: col.color }} />
                        {col.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              ) : (
                <DropdownMenuItem disabled>
                  <FolderOpen className="w-4 h-4 mr-2" /> Keine Sammlungen
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(doc) }}>
                <Trash2 className="w-4 h-4 mr-2" /> Löschen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-foreground truncate mb-1">{doc.title}</h3>

      {/* Summary */}
      {doc.summary && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{doc.summary}</p>
      )}

      {/* Tags */}
      {doc.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {doc.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
              {tag}
            </Badge>
          ))}
          {doc.tags.length > 3 && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              +{doc.tags.length - 3}
            </Badge>
          )}
        </div>
      )}

      {/* Document Type & Priority */}
      {(doc.document_type && doc.document_type !== 'other') || doc.priority === 'urgent' || doc.priority === 'high' ? (
        <div className="flex items-center gap-1.5 mb-2">
          {doc.document_type && doc.document_type !== 'other' && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
              {doc.document_type === 'rechnung' ? 'Rechnung' :
               doc.document_type === 'brief' ? 'Brief' :
               doc.document_type === 'bescheid' ? 'Bescheid' :
               doc.document_type === 'vertrag' ? 'Vertrag' :
               doc.document_type === 'mahnung' ? 'Mahnung' :
               doc.document_type === 'beleg' ? 'Beleg' :
               doc.document_type}
            </Badge>
          )}
          {doc.priority === 'urgent' && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
              <AlertTriangle className="w-2.5 h-2.5 mr-0.5" /> Dringend
            </Badge>
          )}
          {doc.priority === 'high' && (
            <Badge className="text-[10px] px-1.5 py-0 bg-orange-500 hover:bg-orange-600">
              Wichtig
            </Badge>
          )}
        </div>
      ) : null}

      {/* Status indicator */}
      {doc.status === 'action_required' && (
        <div className="flex items-center gap-1 text-[10px] text-destructive mb-2">
          <AlertTriangle className="w-3 h-3" /> Aktion erforderlich
        </div>
      )}
      {doc.status === 'inbox' && doc.ocr_status === 'completed' && (
        <div className="flex items-center gap-1 text-[10px] text-blue-500 mb-2">
          <Clock className="w-3 h-3" /> Im Eingang
        </div>
      )}

      {/* Amount */}
      {doc.amount && doc.amount > 0 && (
        <div className="flex items-center gap-1 mb-2">
          <Receipt className="w-3 h-3 text-green-500" />
          <span className="text-xs font-semibold text-green-600 dark:text-green-400">
            {new Intl.NumberFormat('de-DE', { style: 'currency', currency: doc.currency || 'EUR' }).format(doc.amount)}
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{formatFileSize(doc.file_size)}</span>
        <span>{formatRelativeTime(doc.created_at)}</span>
      </div>

      {/* OCR Status */}
      {doc.ocr_status === 'processing' && (
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-primary">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          OCR-Erkennung läuft...
        </div>
      )}
      {doc.ocr_status === 'failed' && (
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-destructive">
          <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
          OCR fehlgeschlagen
        </div>
      )}
    </div>
  )
}
