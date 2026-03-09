import { useState } from 'react'
import { FolderOpen, Plus, Trash2, Edit3, MoreVertical, ArrowLeft, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import DocumentGrid from '@/components/documents/DocumentGrid'
import DocumentViewer from '@/components/documents/DocumentViewer'
import { useCollections, useCreateCollection, useDeleteCollection, useUpdateCollection, useRemoveDocumentFromCollection, type Collection } from '@/hooks/useCollections'
import { useToggleFavorite, useDeleteDocument } from '@/hooks/useDocuments'
import { useCollectionDocuments } from '@/hooks/useCollections'
import type { Document } from '@/components/documents/DocumentCard'
import { toast } from 'sonner'

const colorOptions = [
  { label: 'Blau', value: '#3b82f6', tw: 'bg-blue-500' },
  { label: 'Grün', value: '#22c55e', tw: 'bg-green-500' },
  { label: 'Orange', value: '#f97316', tw: 'bg-orange-500' },
  { label: 'Lila', value: '#a855f7', tw: 'bg-purple-500' },
  { label: 'Rot', value: '#ef4444', tw: 'bg-red-500' },
  { label: 'Indigo', value: '#6366f1', tw: 'bg-indigo-500' },
]

export default function CollectionsPage() {
  const { data: collections = [], isLoading } = useCollections()
  const createCollection = useCreateCollection()
  const deleteCollection = useDeleteCollection()
  const updateCollection = useUpdateCollection()
  const toggleFavorite = useToggleFavorite()
  const deleteDocument = useDeleteDocument()
  const removeFromCollection = useRemoveDocumentFromCollection()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#6366f1')
  const [activeCollection, setActiveCollection] = useState<Collection | null>(null)
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)

  const { data: collectionDocs = [] } = useCollectionDocuments(activeCollection?.id || null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    try {
      if (editId) {
        await updateCollection.mutateAsync({ id: editId, name: name.trim(), description: description.trim() || undefined, color })
        toast.success('Sammlung aktualisiert')
      } else {
        await createCollection.mutateAsync({ name: name.trim(), description: description.trim() || undefined, color })
        toast.success('Sammlung erstellt')
      }
      resetForm()
    } catch {
      toast.error('Fehler beim Speichern')
    }
  }

  const handleEdit = (col: Collection) => {
    setEditId(col.id)
    setName(col.name)
    setDescription(col.description || '')
    setColor(col.color)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteCollection.mutateAsync(id)
      if (activeCollection?.id === id) setActiveCollection(null)
      toast.success('Sammlung gelöscht')
    } catch {
      toast.error('Fehler beim Löschen')
    }
  }

  const handleRemoveDoc = (doc: Document) => {
    if (!activeCollection) return
    removeFromCollection.mutate(
      { documentId: doc.id, collectionId: activeCollection.id },
      { onSuccess: () => toast.success('Aus Sammlung entfernt') }
    )
  }

  const resetForm = () => {
    setDialogOpen(false)
    setEditId(null)
    setName('')
    setDescription('')
    setColor('#6366f1')
  }

  // Collection detail view
  if (activeCollection) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setActiveCollection(null)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: activeCollection.color + '1a', color: activeCollection.color }}
          >
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{activeCollection.name}</h1>
            {activeCollection.description && (
              <p className="text-sm text-muted-foreground">{activeCollection.description}</p>
            )}
          </div>
        </div>

        <DocumentGrid
          documents={collectionDocs}
          onView={setSelectedDoc}
          onFavorite={(doc) => toggleFavorite.mutate(doc)}
          onDelete={handleRemoveDoc}
          emptyMessage="Keine Dokumente in dieser Sammlung. Weise Dokumente über die Dokumente-Seite zu."
        />

        {selectedDoc && (
          <DocumentViewer
            document={selectedDoc}
            onClose={() => setSelectedDoc(null)}
            onFavorite={(doc) => toggleFavorite.mutate(doc)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-primary" />
            Sammlungen
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organisiere deine Dokumente in Sammlungen
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); else setDialogOpen(true) }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Neue Sammlung
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editId ? 'Sammlung bearbeiten' : 'Neue Sammlung erstellen'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="z.B. Mietvertrag & Wohnung"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-medium">Beschreibung (optional)</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Wofür ist diese Sammlung?"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Farbe</label>
                <div className="flex gap-2">
                  {colorOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setColor(opt.value)}
                      className={`w-8 h-8 rounded-full ${opt.tw} transition-all ${color === opt.value ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'opacity-60 hover:opacity-100'}`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>Abbrechen</Button>
                <Button type="submit" disabled={createCollection.isPending || updateCollection.isPending}>
                  {editId ? 'Speichern' : 'Erstellen'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-5">
                <div className="w-12 h-12 rounded-xl bg-muted mb-3" />
                <div className="h-4 w-32 bg-muted rounded mb-2" />
                <div className="h-3 w-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : collections.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-1">Keine Sammlungen</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Erstelle deine erste Sammlung, um Dokumente zu organisieren.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Erste Sammlung erstellen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((col) => (
            <Card
              key={col.id}
              className="cursor-pointer hover:border-primary/30 hover:shadow-md transition-all hover:-translate-y-0.5 group"
              onClick={() => setActiveCollection(col)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: col.color + '1a', color: col.color }}
                  >
                    <FolderOpen className="w-6 h-6" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(col) }}>
                        <Edit3 className="w-4 h-4 mr-2" /> Bearbeiten
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(col.id) }}>
                        <Trash2 className="w-4 h-4 mr-2" /> Löschen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <h3 className="font-semibold">{col.name}</h3>
                {col.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{col.description}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  {col.document_count} {col.document_count === 1 ? 'Dokument' : 'Dokumente'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
