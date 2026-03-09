import { useState, useEffect } from 'react'
import { Search, FileText, Clock, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import SearchBar from '@/components/search/SearchBar'
import DocumentGrid from '@/components/documents/DocumentGrid'
import DocumentViewer from '@/components/documents/DocumentViewer'
import { useSearch } from '@/hooks/useSearch'
import { useToggleFavorite, useDeleteDocument } from '@/hooks/useDocuments'
import { useCollections, useAddDocumentToCollection } from '@/hooks/useCollections'
import type { Document } from '@/components/documents/DocumentCard'
import { toast } from 'sonner'

const RECENT_SEARCHES_KEY = 'sb-recent-searches'

function getRecentSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]')
  } catch {
    return []
  }
}

function addRecentSearch(query: string) {
  const recent = getRecentSearches().filter((s) => s !== query)
  recent.unshift(query)
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, 8)))
}

function clearRecentSearches() {
  localStorage.removeItem(RECENT_SEARCHES_KEY)
}

export default function SearchPage() {
  const { query, setQuery, results, isLoading, activeFilters, toggleFilter } = useSearch()
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [recentSearches, setRecentSearches] = useState<string[]>(getRecentSearches())
  const toggleFavorite = useToggleFavorite()
  const deleteDocument = useDeleteDocument()
  const { data: collections = [] } = useCollections()
  const addToCollection = useAddDocumentToCollection()

  const collectionInfos = collections.map((c) => ({ id: c.id, name: c.name, color: c.color }))

  // Save searches when results come in
  useEffect(() => {
    if (query.trim() && results.length > 0) {
      addRecentSearch(query.trim())
      setRecentSearches(getRecentSearches())
    }
  }, [results])

  const handleAddToCollection = (doc: Document, collectionId: string) => {
    addToCollection.mutate(
      { documentId: doc.id, collectionId },
      {
        onSuccess: () => toast.success('Zu Sammlung hinzugefügt'),
        onError: () => toast.error('Bereits in dieser Sammlung'),
      }
    )
  }

  const handleClearRecent = () => {
    clearRecentSearches()
    setRecentSearches([])
  }

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
            {isLoading ? 'Suche...' : `${results.length} Ergebnis${results.length !== 1 ? 'se' : ''} für "${query}"`}
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
              onAddToCollection={handleAddToCollection}
              collections={collectionInfos}
              emptyMessage="Keine Ergebnisse gefunden"
            />
          )}
        </>
      ) : (
        <div className="space-y-8">
          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Letzte Suchen
                </p>
                <Button variant="ghost" size="sm" onClick={handleClearRecent} className="text-xs h-7">
                  Löschen
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => setQuery(search)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-accent hover:border-primary/30 text-sm transition-colors"
                  >
                    <Search className="w-3 h-3 text-muted-foreground" />
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground mb-1">
              Gib einen Suchbegriff ein, um deine Dokumente zu durchsuchen
            </p>
            <p className="text-xs text-muted-foreground">
              Tipp: Drücke <kbd className="px-1.5 py-0.5 rounded border bg-muted text-[10px] font-mono">/</kbd> um von überall zu suchen
            </p>
          </div>
        </div>
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
