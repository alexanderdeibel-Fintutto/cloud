import { FileText, Image, File, MoreVertical, Star, Trash2, FolderOpen, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
}

export default function DocumentCard({ document: doc, onView, onFavorite, onDelete }: DocumentCardProps) {
  const Icon = fileTypeIcons[doc.file_type] || File
  const colorClass = fileTypeColors[doc.file_type] || fileTypeColors.other

  return (
    <div className="doc-card group cursor-pointer" onClick={() => onView(doc)}>
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
              <DropdownMenuItem>
                <FolderOpen className="w-4 h-4 mr-2" /> Zu Sammlung
              </DropdownMenuItem>
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
    </div>
  )
}
