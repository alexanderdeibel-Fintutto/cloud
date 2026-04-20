import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Plus, LayoutGrid, Receipt, Building2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SearchBar from '@/components/search/SearchBar'
import DocumentGrid from '@/components/documents/DocumentGrid'
import DocumentViewer from '@/components/documents/DocumentViewer'
import { useDocuments, useToggleFavorite, useDeleteDocument } from '@/hooks/useDocuments'
import type { Document } from '@/components/documents/DocumentCard'

// App-Badge für externe Dokumente
function AppBadge({ sourceApp }: { sourceApp?: string | null }) {
  if (!sourceApp || sourceApp === 'secondbrain') return null
  if (sourceApp === 'financial-compass') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-emerald-100 text-emerald-700 font-medium">
        <Receipt className="h-3 w-3" />FC
      </span>
    )
  }
  if (sourceApp === 'vermietify') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-700 font-medium">
        <Building2 className="h-3 w-3" />VM
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600 font-medium">
      {sourceApp}
    </span>
  )
}

export default function DocumentsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [showExternalDocs, setShowExternalDocs] = useState(false)

  const { data: documents = [], isLoading } = useDocuments({
    search: search || undefined,
    showExternalDocs,
  })
  const toggleFavorite = useToggleFavorite()
  const deleteDocument = useDeleteDocument()

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
  if (activeFilters.includes('Financial Compass')) {
    filteredDocs = filteredDocs.filter((d) => d.source_app === 'financial-compass')
  }
  if (activeFilters.includes('Vermietify')) {
    filteredDocs = filteredDocs.filter((d) => d.source_app === 'vermietify')
  }

  // Zähler pro App
  const fcCount = showExternalDocs
    ? documents.filter(d => d.source_app === 'financial-compass').length
    : 0
  const vmCount = showExternalDocs
    ? documents.filter(d => d.source_app === 'vermietify').length
    : 0

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
            {filteredDocs.length} {filteredDocs.length === 1 ? 'Dokument' : 'Dokumente'}
            {showExternalDocs && (fcCount > 0 || vmCount > 0) && (
              <span className="ml-2 text-xs text-gray-400">
                inkl. {fcCount > 0 ? `${fcCount} FC` : ''}{fcCount > 0 && vmCount > 0 ? ', ' : ''}{vmCount > 0 ? `${vmCount} VM` : ''}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Toggle: Externe Dokumente anzeigen */}
          <button
            onClick={() => setShowExternalDocs(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showExternalDocs
                ? 'bg-purple-100 border-purple-300 text-purple-700'
                : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
            title="Dokumente aus Financial Compass und Vermietify einblenden"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            {showExternalDocs ? 'Alle Apps aktiv' : 'Alle Apps'}
          </button>
          <Button onClick={() => navigate('/upload')}>
            <Plus className="w-4 h-4 mr-2" />
            Hochladen
          </Button>
        </div>
      </div>

      {/* App-Filter (nur wenn externe Docs aktiv) */}
      {showExternalDocs && (fcCount > 0 || vmCount > 0) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400">App-Filter:</span>
          {fcCount > 0 && (
            <button
              onClick={() => toggleFilter('Financial Compass')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                activeFilters.includes('Financial Compass')
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-emerald-200'
              }`}
            >
              <Receipt className="h-3 w-3" />
              Financial Compass ({fcCount})
              {activeFilters.includes('Financial Compass') && <X className="h-3 w-3 ml-0.5" />}
            </button>
          )}
          {vmCount > 0 && (
            <button
              onClick={() => toggleFilter('Vermietify')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                activeFilters.includes('Vermietify')
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-blue-200'
              }`}
            >
              <Building2 className="h-3 w-3" />
              Vermietify ({vmCount})
              {activeFilters.includes('Vermietify') && <X className="h-3 w-3 ml-0.5" />}
            </button>
          )}
        </div>
      )}

      {/* Search */}
      <SearchBar
        value={search}
        onChange={setSearch}
        activeFilters={activeFilters.filter(f => !['Financial Compass', 'Vermietify'].includes(f))}
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
          onView={setSelectedDoc}
          onFavorite={(doc) => toggleFavorite.mutate(doc)}
          onDelete={(doc) => deleteDocument.mutate(doc)}
          emptyMessage={search ? 'Keine Ergebnisse für deine Suche' : 'Noch keine Dokumente hochgeladen'}
          renderBadge={(doc) => <AppBadge sourceApp={doc.source_app} />}
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
