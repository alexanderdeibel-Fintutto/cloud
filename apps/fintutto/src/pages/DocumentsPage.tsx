import { EmptyState } from '@fintutto/ui'
import { FileText } from 'lucide-react'

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dokumente</h1>
      <EmptyState
        icon={<FileText className="h-8 w-8" />}
        title="Noch keine Dokumente"
        description="Lade Mietverträge, Bescheide und andere Dokumente hoch."
      />
    </div>
  )
}
