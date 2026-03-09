import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Plus, CheckSquare, X, FolderOpen, Trash2, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import SearchBar from '@/components/search/SearchBar'
import DocumentGrid from '@/components/documents/DocumentGrid'
import DocumentViewer from '@/components/documents/DocumentViewer'
import { useDocuments, useToggleFavorite, useDeleteDocument } from '@/hooks/useDocuments'
import { useCollections, useAddDocumentToCollection } from '@/hooks/useCollections'
import { useLogActivity } from '@/hooks/useActivityLog'
import type { Document } from '@/components/documents/DocumentCard'
import { toast } from 'sonner'

export default function DocumentsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const { data: documents = [], isLoading } = useDocuments({ search: search || undefined })
  const { data: collections = [] } = useCollections()
  const toggleFavorite = useToggleFavorite()
  const deleteDocument = useDeleteDocument()
  const addToCollection = useAddDocumentToCollection()
  const logActivity = useLogActivity()

  const collectionInfos = useMemo(
    () => collections.map((c) => ({ id: c.id, name: c.name, color: c.color })),
    [collections]
  )

  const handleView = (doc: Document) => {
    setSelectedDoc(doc)
    logActivity.mutate({
      action: 'view',
      entity_type: 'document',
      entity_id: doc.id,
      metadata: { title: doc.title },
    })
  }

  const handleAddToCollection = (doc: Document, collectionId: string) => {
    addToCollection.mutate(
      { documentId: doc.id, collectionId },
      {
        onSuccess: () => toast.success('Zu Sammlung hinzugefügt'),
        onError: () => toast.error('Bereits in dieser Sammlung'),
      }
    )
  }

  const handleSelect = (doc: Document) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(doc.id)) next.delete(doc.id)
      else next.add(doc.id)
      return next
    })
  }

  const handleBulkDelete = () => {
    const docs = documents.filter((d) => selectedIds.has(d.id))
    for (const doc of docs) {
      deleteDocument.mutate(doc)
    }
    toast.success(`${docs.length} Dokumente gelöscht`)
    setSelectedIds(new Set())
    setSelectionMode(false)
  }

  const handleBulkAddToCollection = (collectionId: string) => {
    for (const docId of selectedIds) {
      addToCollection.mutate({ documentId: docId, collectionId })
    }
    toast.success(`${selectedIds.size} Dokumente zugeordnet`)
    setSelectedIds(new Set())
    setSelectionMode(false)
  }

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    )
  }

  // Apply local filters including temporal
  const filteredDocs = useMemo(() => {
    let docs = documents
    if (activeFilters.includes('PDF')) docs = docs.filter((d) => d.file_type === 'pdf')
    if (activeFilters.includes('Bilder')) docs = docs.filter((d) => d.file_type === 'image')
    if (activeFilters.includes('Text')) docs = docs.filter((d) => d.file_type === 'text')
    if (activeFilters.includes('Favoriten')) docs = docs.filter((d) => d.is_favorite)
    if (activeFilters.includes('Heute')) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      docs = docs.filter((d) => new Date(d.created_at) >= today)
    }
    if (activeFilters.includes('Diese Woche')) {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      docs = docs.filter((d) => new Date(d.created_at) >= weekAgo)
    }
    return docs
  }, [documents, activeFilters])

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Dokumente
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {documents.length} {documents.length === 1 ? 'Dokument' : 'Dokumente'} in deinem SecondBrain
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={selectionMode ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectionMode(!selectionMode)
              setSelectedIds(new Set())
            }}
          >
            <CheckSquare className="w-4 h-4 mr-1.5" />
            Auswählen
          </Button>
          <Button onClick={() => navigate('/upload')}>
            <Plus className="w-4 h-4 mr-2" />
            Hochladen
          </Button>
        </div>
      </div>

      {/* Batch action bar */}
      {selectionMode && selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-primary/30 bg-primary/5 animate-fade-in-up">
          <Badge variant="default">{selectedIds.size} ausgewählt</Badge>
          <div className="flex items-center gap-2 ml-auto">
            {collections.map((col) => (
              <Button
                key={col.id}
                variant="outline"
                size="sm"
                onClick={() => handleBulkAddToCollection(col.id)}
              >
                <span className="w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: col.color }} />
                {col.name}
              </Button>
            ))}
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Löschen
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setSelectedIds(new Set()); setSelectionMode(false) }}>
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Search */}
      <SearchBar
        value={search}
        onChange={setSearch}
        activeFilters={activeFilters}
        onFilterToggle={toggleFilter}
      />

      {/* Documents Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <DocumentGrid
          documents={filteredDocs}
          onView={handleView}
          onFavorite={(doc) => toggleFavorite.mutate(doc)}
          onDelete={(doc) => deleteDocument.mutate(doc)}
          onAddToCollection={handleAddToCollection}
          collections={collectionInfos}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          selectionMode={selectionMode}
          emptyMessage={search ? 'Keine Ergebnisse für deine Suche' : 'Noch keine Dokumente hochgeladen'}
        />
      )}

      {/* Viewer */}
      {selectedDoc && (
        <DocumentViewer
          document={selectedDoc}
          onClose={() => setSelectedDoc(null)}
          onFavorite={(doc) => toggleFavorite.mutate(doc)}
          onAddToCollection={handleAddToCollection}
          collections={collectionInfos}
        />
      )}
    </div>
  )
}
