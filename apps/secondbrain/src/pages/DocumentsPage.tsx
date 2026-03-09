import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Grid3X3, List, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import SearchBar from '@/components/search/SearchBar'
import DocumentGrid from '@/components/documents/DocumentGrid'
import DocumentViewer from '@/components/documents/DocumentViewer'
import { useDocuments, useToggleFavorite, useDeleteDocument } from '@/hooks/useDocuments'
import { useLogActivity } from '@/hooks/useActivityLog'
import type { Document } from '@/components/documents/DocumentCard'

export default function DocumentsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const { data: documents = [], isLoading } = useDocuments({ search: search || undefined })
  const toggleFavorite = useToggleFavorite()
  const deleteDocument = useDeleteDocument()
  const logActivity = useLogActivity()

  const handleView = (doc: Document) => {
    setSelectedDoc(doc)
    logActivity.mutate({
      action: 'view',
      entity_type: 'document',
      entity_id: doc.id,
      metadata: { title: doc.title },
    })
  }

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    )
  }

  // Apply local filters
  let filteredDocs = documents
  if (activeFilters.includes('PDF')) filteredDocs = filteredDocs.filter((d) => d.file_type === 'pdf')
  if (activeFilters.includes('Bilder')) filteredDocs = filteredDocs.filter((d) => d.file_type === 'image')
  if (activeFilters.includes('Text')) filteredDocs = filteredDocs.filter((d) => d.file_type === 'text')
  if (activeFilters.includes('Favoriten')) filteredDocs = filteredDocs.filter((d) => d.is_favorite)

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
        <Button onClick={() => navigate('/upload')}>
          <Plus className="w-4 h-4 mr-2" />
          Hochladen
        </Button>
      </div>

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
          emptyMessage={search ? 'Keine Ergebnisse für deine Suche' : 'Noch keine Dokumente hochgeladen'}
        />
      )}

      {/* Viewer */}
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
