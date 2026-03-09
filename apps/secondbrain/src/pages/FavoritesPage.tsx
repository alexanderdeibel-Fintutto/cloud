import { useNavigate } from 'react-router-dom'
import { Star } from 'lucide-react'
import DocumentGrid from '@/components/documents/DocumentGrid'
import { useDocuments, useToggleFavorite, useDeleteDocument } from '@/hooks/useDocuments'
import { useCollections, useAddDocumentToCollection } from '@/hooks/useCollections'
import type { Document } from '@/components/documents/DocumentCard'
import { toast } from 'sonner'

export default function FavoritesPage() {
  const navigate = useNavigate()
  const { data: documents = [], isLoading } = useDocuments({ favorites: true })
  const { data: collections = [] } = useCollections()
  const addToCollection = useAddDocumentToCollection()
  const toggleFavorite = useToggleFavorite()
  const deleteDocument = useDeleteDocument()

  const collectionInfos = collections.map((c) => ({ id: c.id, name: c.name, color: c.color }))
  const handleAddToCollection = (doc: Document, collectionId: string) => {
    addToCollection.mutate(
      { documentId: doc.id, collectionId },
      {
        onSuccess: () => toast.success('Zu Sammlung hinzugefügt'),
        onError: () => toast.error('Bereits in dieser Sammlung'),
      }
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-500" />
          Favoriten
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {documents.length} markierte Dokument{documents.length !== 1 ? 'e' : ''}
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
          onView={(doc) => navigate(`/dokumente/${doc.id}`)}
          onFavorite={(doc) => toggleFavorite.mutate(doc)}
          onDelete={(doc) => deleteDocument.mutate(doc)}
          onAddToCollection={handleAddToCollection}
          collections={collectionInfos}
          emptyMessage="Noch keine Favoriten. Markiere Dokumente mit dem Stern-Symbol."
        />
      )}
    </div>
  )
}
