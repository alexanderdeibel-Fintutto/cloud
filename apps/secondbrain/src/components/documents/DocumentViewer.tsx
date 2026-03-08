import { X, Download, Star, Tag, Clock, FileText, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { type Document } from './DocumentCard'
import { formatRelativeTime, formatFileSize } from '@/lib/utils'
import { supabase } from '@/integrations/supabase'
import { toast } from 'sonner'

interface DocumentViewerProps {
  document: Document
  onClose: () => void
  onFavorite: (doc: Document) => void
}

export default function DocumentViewer({ document: doc, onClose, onFavorite }: DocumentViewerProps) {
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

          {/* Tags */}
          {doc.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              {doc.tags.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          )}

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
              ) : (
                <div className="text-center py-8">
                  <Brain className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Zusammenfassung wird generiert...
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="text" className="mt-4">
              {doc.ocr_text ? (
                <pre className="text-sm whitespace-pre-wrap font-mono bg-muted/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  {doc.ocr_text}
                </pre>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    {doc.ocr_status === 'processing' ? 'OCR-Erkennung läuft...' : 'Kein Text erkannt'}
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
