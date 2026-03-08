import { useState } from 'react'
import { Star } from 'lucide-react'
import DocumentGrid from '@/components/documents/DocumentGrid'
import DocumentViewer from '@/components/documents/DocumentViewer'
import { useDocuments, useToggleFavorite, useDeleteDocument } from '@/hooks/useDocuments'
import type { Document } from '@/components/documents/DocumentCard'

export default function FavoritesPage() {
  const { data: documents = [], isLoading } = useDocuments({ favorites: true })
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const toggleFavorite = useToggleFavorite()
  const deleteDocument = useDeleteDocument()

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-500" />
          Favoriten
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Deine markierten Dokumente
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <DocumentGrid
          documents={documents}
          onView={setSelectedDoc}
          onFavorite={(doc) => toggleFavorite.mutate(doc)}
          onDelete={(doc) => deleteDocument.mutate(doc)}
          emptyMessage="Noch keine Favoriten. Markiere Dokumente mit dem Stern-Symbol."
        />
      )}

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
