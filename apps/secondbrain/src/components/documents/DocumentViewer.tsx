import { useState } from 'react'
import { X, Download, Star, Tag, Clock, FileText, Brain, FolderOpen, RefreshCw, Plus, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { type Document, type CollectionInfo } from './DocumentCard'
import { formatRelativeTime, formatFileSize } from '@/lib/utils'
import { supabase } from '@/integrations/supabase'
import { toast } from 'sonner'

interface DocumentViewerProps {
  document: Document
  onClose: () => void
  onFavorite: (doc: Document) => void
  onAddToCollection?: (doc: Document, collectionId: string) => void
  collections?: CollectionInfo[]
}

export default function DocumentViewer({
  document: doc,
  onClose,
  onFavorite,
  onAddToCollection,
  collections = [],
}: DocumentViewerProps) {
  const [newTag, setNewTag] = useState('')
  const [tags, setTags] = useState<string[]>(doc.tags)
  const [isRetryingOcr, setIsRetryingOcr] = useState(false)

  const handleDownload = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('secondbrain-docs')
        .download(doc.storage_path)

      if (error) throw error

      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = doc.title + '.' + doc.storage_path.split('.').pop()
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download error:', err)
      toast.error('Download fehlgeschlagen')
    }
  }

  const handleAddTag = async () => {
    const tag = newTag.trim()
    if (!tag || tags.includes(tag)) return

    const updatedTags = [...tags, tag]
    setTags(updatedTags)
    setNewTag('')

    const { error } = await supabase
      .from('sb_documents')
      .update({ tags: updatedTags })
      .eq('id', doc.id)

    if (error) {
      toast.error('Fehler beim Speichern')
      setTags(tags)
    }
  }

  const handleRemoveTag = async (tagToRemove: string) => {
    const updatedTags = tags.filter((t) => t !== tagToRemove)
    setTags(updatedTags)

    const { error } = await supabase
      .from('sb_documents')
      .update({ tags: updatedTags })
      .eq('id', doc.id)

    if (error) {
      toast.error('Fehler beim Speichern')
      setTags(tags)
    }
  }

  const handleRetryOcr = async () => {
    setIsRetryingOcr(true)
    try {
      await supabase.functions.invoke('secondbrain-ocr', {
        body: {
          documentId: doc.id,
          storagePath: doc.storage_path,
          fileType: doc.file_type,
          mimeType: '',
        },
      })
      toast.success('OCR-Verarbeitung neu gestartet')
    } catch {
      toast.error('Fehler beim Neustarten')
    } finally {
      setIsRetryingOcr(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative ml-auto w-full max-w-2xl bg-card border-l border-border h-full overflow-y-auto animate-slide-in-left">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-md border-b border-border p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold truncate pr-4">{doc.title}</h2>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => onFavorite(doc)}>
                <Star className={`w-4 h-4 ${doc.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleDownload}>
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              {doc.file_type.toUpperCase()} — {formatFileSize(doc.file_size)}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {formatRelativeTime(doc.created_at)}
            </div>
          </div>

          {/* Collection assignment */}
          {collections.length > 0 && onAddToCollection && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5" /> Zu Sammlung hinzufügen
              </p>
              <div className="flex flex-wrap gap-2">
                {collections.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => onAddToCollection(doc, col.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border hover:border-primary/30 hover:bg-accent text-xs transition-colors"
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                    {col.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags - editable */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Tags
            </p>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive/20 transition-colors group/tag"
                  onClick={() => handleRemoveTag(tag)}
                >
                  {tag}
                  <X className="w-3 h-3 ml-1 opacity-0 group-hover/tag:opacity-100" />
                </Badge>
              ))}
              {tags.length === 0 && (
                <span className="text-xs text-muted-foreground">Keine Tags</span>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Neuen Tag hinzufügen..."
                className="h-8 text-xs"
              />
              <Button variant="outline" size="sm" className="h-8 shrink-0" onClick={handleAddTag} disabled={!newTag.trim()}>
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Tabs */}
          <Tabs defaultValue="summary">
            <TabsList className="w-full">
              <TabsTrigger value="summary" className="flex-1">KI-Zusammenfassung</TabsTrigger>
              <TabsTrigger value="text" className="flex-1">Erkannter Text</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="mt-4">
              {doc.summary ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium text-primary">KI-generierte Zusammenfassung</span>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/90">{doc.summary}</p>
                </div>
              ) : doc.ocr_status === 'failed' ? (
                <div className="text-center py-8">
                  <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">
                    OCR-Verarbeitung fehlgeschlagen
                  </p>
                  <Button variant="outline" size="sm" onClick={handleRetryOcr} disabled={isRetryingOcr}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${isRetryingOcr ? 'animate-spin' : ''}`} />
                    Erneut versuchen
                  </Button>
                </div>
              ) : doc.ocr_status === 'processing' || doc.ocr_status === 'pending' ? (
                <div className="text-center py-8">
                  <Brain className="w-8 h-8 text-primary mx-auto mb-2 animate-pulse" />
                  <p className="text-sm text-muted-foreground">
                    {doc.ocr_status === 'processing' ? 'Zusammenfassung wird generiert...' : 'Wartet auf Verarbeitung...'}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Keine Zusammenfassung verfügbar</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="text" className="mt-4">
              {doc.ocr_text ? (
                <pre className="text-sm whitespace-pre-wrap font-mono bg-muted/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  {doc.ocr_text}
                </pre>
              ) : doc.ocr_status === 'failed' ? (
                <div className="text-center py-8">
                  <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">Texterkennung fehlgeschlagen</p>
                  <Button variant="outline" size="sm" onClick={handleRetryOcr} disabled={isRetryingOcr}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${isRetryingOcr ? 'animate-spin' : ''}`} />
                    Erneut versuchen
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    {doc.ocr_status === 'processing' ? 'OCR-Erkennung läuft...' : doc.ocr_status === 'pending' ? 'Wartet auf Verarbeitung...' : 'Kein Text erkannt'}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
