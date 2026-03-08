import DocumentCard, { type Document } from './DocumentCard'

interface DocumentGridProps {
  documents: Document[]
  onView: (doc: Document) => void
  onFavorite: (doc: Document) => void
  onDelete: (doc: Document) => void
  emptyMessage?: string
}

export default function DocumentGrid({
  documents,
  onView,
  onFavorite,
  onDelete,
  emptyMessage = 'Keine Dokumente gefunden',
}: DocumentGridProps) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          document={doc}
          onView={onView}
          onFavorite={onFavorite}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
