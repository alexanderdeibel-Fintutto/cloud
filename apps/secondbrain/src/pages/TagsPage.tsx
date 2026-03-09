import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Tag, Edit3, Trash2, Merge, Hash, FileText, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useDocuments } from '@/hooks/useDocuments'
import { supabase } from '@/integrations/supabase'
import { useQueryClient } from '@tanstack/react-query'
import { DOCUMENT_TYPES } from '@/hooks/useWorkflows'
import { toast } from 'sonner'

interface TagInfo {
  name: string
  count: number
  documentIds: string[]
}

export default function TagsPage() {
  const { data: documents = [] } = useDocuments()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [renameDialog, setRenameDialog] = useState<TagInfo | null>(null)
  const [mergeDialog, setMergeDialog] = useState<TagInfo | null>(null)
  const [newName, setNewName] = useState('')
  const [mergeTarget, setMergeTarget] = useState('')
  const [processing, setProcessing] = useState(false)

  // Build tag index
  const tags = useMemo(() => {
    const map = new Map<string, TagInfo>()
    for (const doc of documents) {
      for (const tag of doc.tags) {
        const existing = map.get(tag)
        if (existing) {
          existing.count++
          existing.documentIds.push(doc.id)
        } else {
          map.set(tag, { name: tag, count: 1, documentIds: [doc.id] })
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count)
  }, [documents])

  const filteredTags = useMemo(() => {
    if (!search) return tags
    const q = search.toLowerCase()
    return tags.filter(t => t.name.toLowerCase().includes(q))
  }, [tags, search])

  const totalTags = tags.length
  const totalUsages = tags.reduce((sum, t) => sum + t.count, 0)

  const handleRename = async () => {
    if (!renameDialog || !newName.trim() || newName.trim() === renameDialog.name) return
    setProcessing(true)
    try {
      const trimmed = newName.trim()
      for (const docId of renameDialog.documentIds) {
        const doc = documents.find(d => d.id === docId)
        if (!doc) continue
        const updatedTags = doc.tags.map(t => t === renameDialog.name ? trimmed : t)
        // Deduplicate in case the new name already exists
        const unique = [...new Set(updatedTags)]
        await supabase.from('sb_documents').update({ tags: unique }).eq('id', docId)
      }
      toast.success(`Tag "${renameDialog.name}" → "${trimmed}" umbenannt`)
      setRenameDialog(null)
      setNewName('')
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    } catch {
      toast.error('Fehler beim Umbenennen')
    } finally {
      setProcessing(false)
    }
  }

  const handleMerge = async () => {
    if (!mergeDialog || !mergeTarget) return
    setProcessing(true)
    try {
      for (const docId of mergeDialog.documentIds) {
        const doc = documents.find(d => d.id === docId)
        if (!doc) continue
        const updatedTags = doc.tags.filter(t => t !== mergeDialog.name)
        if (!updatedTags.includes(mergeTarget)) {
          updatedTags.push(mergeTarget)
        }
        await supabase.from('sb_documents').update({ tags: updatedTags }).eq('id', docId)
      }
      toast.success(`Tag "${mergeDialog.name}" in "${mergeTarget}" zusammengeführt`)
      setMergeDialog(null)
      setMergeTarget('')
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    } catch {
      toast.error('Fehler beim Zusammenführen')
    } finally {
      setProcessing(false)
    }
  }

  const handleDelete = async (tag: TagInfo) => {
    setProcessing(true)
    try {
      for (const docId of tag.documentIds) {
        const doc = documents.find(d => d.id === docId)
        if (!doc) continue
        const updatedTags = doc.tags.filter(t => t !== tag.name)
        await supabase.from('sb_documents').update({ tags: updatedTags }).eq('id', docId)
      }
      toast.success(`Tag "${tag.name}" von ${tag.count} Dokumenten entfernt`)
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    } catch {
      toast.error('Fehler beim Löschen')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Tag className="w-6 h-6 text-primary" />
            Tags verwalten
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalTags} Tags in {totalUsages} Zuordnungen
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Tags durchsuchen..."
          className="pl-9"
        />
      </div>

      {/* Tag cloud visualization */}
      {tags.length > 0 && !search && (
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground mb-3">Tag-Wolke</p>
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 30).map(tag => {
                const size = Math.max(12, Math.min(24, 12 + tag.count * 2))
                const opacity = Math.max(0.4, Math.min(1, 0.3 + tag.count * 0.1))
                return (
                  <Link
                    key={tag.name}
                    to={`/suche?q=${encodeURIComponent(tag.name)}`}
                    className="hover:text-primary transition-colors"
                    style={{ fontSize: `${size}px`, opacity }}
                  >
                    <span className="font-medium">#{tag.name}</span>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tag list */}
      {filteredTags.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Hash className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-1">
              {search ? 'Keine Tags gefunden' : 'Noch keine Tags'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {search ? 'Versuche einen anderen Suchbegriff.' : 'Tags werden automatisch beim Kategorisieren von Dokumenten erstellt.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-1">
          {filteredTags.map(tag => {
            // Show sample document types for this tag
            const sampleDocs = tag.documentIds
              .slice(0, 3)
              .map(id => documents.find(d => d.id === id))
              .filter(Boolean)

            return (
              <div
                key={tag.name}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/20 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Hash className="w-4 h-4 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{tag.name}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {tag.count} Dokument{tag.count !== 1 ? 'e' : ''}
                    </Badge>
                  </div>
                  {sampleDocs.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-1">
                      {sampleDocs.map(doc => {
                        const typeInfo = DOCUMENT_TYPES[doc!.document_type || 'other']
                        return (
                          <Link
                            key={doc!.id}
                            to={`/dokumente/${doc!.id}`}
                            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                            onClick={e => e.stopPropagation()}
                          >
                            <FileText className="w-2.5 h-2.5" />
                            <span className="truncate max-w-[120px]">{doc!.title}</span>
                            {typeInfo && (
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: typeInfo.color }} />
                            )}
                          </Link>
                        )
                      })}
                      {tag.count > 3 && (
                        <span className="text-[10px] text-muted-foreground">+{tag.count - 3}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    title="Umbenennen"
                    onClick={() => { setRenameDialog(tag); setNewName(tag.name) }}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    title="In anderen Tag zusammenführen"
                    onClick={() => { setMergeDialog(tag); setMergeTarget('') }}
                  >
                    <Merge className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    title="Tag löschen"
                    onClick={() => handleDelete(tag)}
                    disabled={processing}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Rename Dialog */}
      <Dialog open={!!renameDialog} onOpenChange={v => { if (!v) setRenameDialog(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              Tag umbenennen
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                Wird in {renameDialog?.count} Dokument{(renameDialog?.count || 0) !== 1 ? 'en' : ''} umbenannt
              </p>
              <Input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Neuer Tag-Name..."
                onKeyDown={e => e.key === 'Enter' && handleRename()}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setRenameDialog(null)}>Abbrechen</Button>
              <Button size="sm" onClick={handleRename} disabled={processing || !newName.trim() || newName.trim() === renameDialog?.name}>
                {processing ? 'Wird umbenannt...' : 'Umbenennen'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Merge Dialog */}
      <Dialog open={!!mergeDialog} onOpenChange={v => { if (!v) setMergeDialog(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Merge className="w-4 h-4" />
              Tag zusammenführen
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              &ldquo;{mergeDialog?.name}&rdquo; wird durch den gewählten Tag ersetzt ({mergeDialog?.count} Dokumente)
            </p>
            <Separator />
            <p className="text-xs font-medium">Ziel-Tag wählen:</p>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
              {tags
                .filter(t => t.name !== mergeDialog?.name)
                .map(t => (
                  <button
                    key={t.name}
                    onClick={() => setMergeTarget(t.name)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      mergeTarget === t.name
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80 text-foreground'
                    }`}
                  >
                    #{t.name}
                    <span className="ml-1 opacity-60">{t.count}</span>
                  </button>
                ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setMergeDialog(null)}>Abbrechen</Button>
              <Button size="sm" onClick={handleMerge} disabled={processing || !mergeTarget}>
                {processing ? 'Wird zusammengeführt...' : 'Zusammenführen'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
