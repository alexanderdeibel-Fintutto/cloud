import { useState } from 'react'
import { Search, FileText } from 'lucide-react'
import SearchBar from '@/components/search/SearchBar'
import DocumentGrid from '@/components/documents/DocumentGrid'
import DocumentViewer from '@/components/documents/DocumentViewer'
import { useSearch } from '@/hooks/useSearch'
import { useToggleFavorite, useDeleteDocument } from '@/hooks/useDocuments'
import type { Document } from '@/components/documents/DocumentCard'

export default function SearchPage() {
  const { query, setQuery, results, isLoading, activeFilters, toggleFilter } = useSearch()
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const toggleFavorite = useToggleFavorite()
  const deleteDocument = useDeleteDocument()

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Search className="w-6 h-6 text-primary" />
          Suche
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Durchsuche alle deine Dokumente — auch den per OCR erkannten Text
        </p>
      </div>

      {/* Search */}
      <SearchBar
        value={query}
        onChange={setQuery}
        activeFilters={activeFilters}
        onFilterToggle={toggleFilter}
        autoFocus
      />

      {/* Results */}
      {query.trim() ? (
        <>
          <p className="text-sm text-muted-foreground">
            {isLoading ? 'Suche...' : `${results.length} Ergebnis${results.length !== 1 ? 'se' : ''}`}
          </p>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <DocumentGrid
              documents={results}
              onView={setSelectedDoc}
              onFavorite={(doc) => toggleFavorite.mutate(doc)}
              onDelete={(doc) => deleteDocument.mutate(doc)}
              emptyMessage="Keine Ergebnisse gefunden"
            />
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground">
            Gib einen Suchbegriff ein, um deine Dokumente zu durchsuchen
          </p>
        </div>
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
