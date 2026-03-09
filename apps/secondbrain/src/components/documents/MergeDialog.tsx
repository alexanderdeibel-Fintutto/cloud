import { useState } from 'react'
import { Merge, Check, Trash2, FileText, AlertTriangle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatFileSize, formatRelativeTime } from '@/lib/utils'
import { supabase } from '@/integrations/supabase'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Document } from './DocumentCard'

interface MergeDialogProps {
  duplicateGroups: Document[][]
  open: boolean
  onClose: () => void
}

export default function MergeDialog({ duplicateGroups, open, onClose }: MergeDialogProps) {
  const [currentGroupIdx, setCurrentGroupIdx] = useState(0)
  const [primaryId, setPrimaryId] = useState<string | null>(null)
  const [merging, setMerging] = useState(false)
  const queryClient = useQueryClient()

  const group = duplicateGroups[currentGroupIdx]
  if (!group) return null

  // Auto-select the primary as the largest or most recent one
  const effectivePrimary = primaryId && group.find(d => d.id === primaryId)
    ? primaryId
    : group.reduce((best, doc) => {
        const bestDoc = group.find(d => d.id === best)!
        // Prefer the one with more data (tags, summary, notes)
        const score = (d: Document) =>
          d.tags.length + (d.summary ? 2 : 0) + (d.notes ? 2 : 0) + (d.ocr_text ? 1 : 0) + (d.amount ? 1 : 0)
        return score(doc) > score(bestDoc) ? doc.id : best
      }, group[0].id)

  const handleMerge = async () => {
    const primary = group.find(d => d.id === effectivePrimary)
    const others = group.filter(d => d.id !== effectivePrimary)
    if (!primary || others.length === 0) return

    setMerging(true)
    try {
      // Combine tags (deduplicated)
      const allTags = [...new Set([...primary.tags, ...others.flatMap(d => d.tags)])]

      // Combine notes
      const allNotes = [primary.notes, ...others.map(d => d.notes)].filter(Boolean).join('\n---\n')

      // Keep the best summary
      const bestSummary = primary.summary || others.find(d => d.summary)?.summary || null

      // Keep the best OCR text (longest)
      const bestOcr = [primary.ocr_text, ...others.map(d => d.ocr_text)]
        .filter(Boolean)
        .sort((a, b) => (b?.length || 0) - (a?.length || 0))[0] || null

      // Update primary document with merged data
      await supabase
        .from('sb_documents')
        .update({
          tags: allTags,
          notes: allNotes || null,
          summary: bestSummary,
          ocr_text: bestOcr,
        })
        .eq('id', primary.id)

      // Delete duplicate documents (storage + DB)
      for (const doc of others) {
        await supabase.storage.from('secondbrain-docs').remove([doc.storage_path])
        await supabase.from('sb_documents').delete().eq('id', doc.id)
      }

      toast.success(`${others.length} Duplikat${others.length > 1 ? 'e' : ''} zusammengeführt`)

      // Move to next group or close
      if (currentGroupIdx < duplicateGroups.length - 1) {
        setCurrentGroupIdx(prev => prev + 1)
        setPrimaryId(null)
      } else {
        onClose()
      }

      queryClient.invalidateQueries({ queryKey: ['documents'] })
    } catch {
      toast.error('Fehler beim Zusammenführen')
    } finally {
      setMerging(false)
    }
  }

  const handleSkip = () => {
    if (currentGroupIdx < duplicateGroups.length - 1) {
      setCurrentGroupIdx(prev => prev + 1)
      setPrimaryId(null)
    } else {
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Merge className="w-5 h-5 text-primary" />
            Duplikate zusammenführen
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Gruppe {currentGroupIdx + 1} von {duplicateGroups.length}</span>
            <span>{group.length} Versionen von &ldquo;{group[0].title}&rdquo;</span>
          </div>

          {/* Info */}
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <AlertTriangle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Wähle das Hauptdokument aus. Tags, Notizen und OCR-Text werden zusammengeführt, die anderen Versionen gelöscht.
            </p>
          </div>

          {/* Document options */}
          <div className="space-y-2">
            {group.map(doc => {
              const isSelected = doc.id === effectivePrimary
              return (
                <button
                  key={doc.id}
                  onClick={() => setPrimaryId(doc.id)}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      {isSelected ? (
                        <Check className="w-4 h-4 text-primary" />
                      ) : (
                        <FileText className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                        <span>{formatFileSize(doc.file_size)}</span>
                        <span>{formatRelativeTime(doc.created_at)}</span>
                        {doc.ocr_status === 'completed' && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0 text-green-500 border-green-500/30">OCR</Badge>
                        )}
                      </div>
                      {doc.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {doc.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-[9px] px-1 py-0">{tag}</Badge>
                          ))}
                        </div>
                      )}
                      {doc.summary && (
                        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">{doc.summary}</p>
                      )}
                    </div>
                    {!isSelected && (
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0 mt-1" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              Überspringen
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onClose}>
                Abbrechen
              </Button>
              <Button size="sm" onClick={handleMerge} disabled={merging}>
                <Merge className="w-4 h-4 mr-1.5" />
                {merging ? 'Wird zusammengeführt...' : 'Zusammenführen'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
