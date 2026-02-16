import { EmptyState } from '@fintutto/ui'
import { FileBox } from 'lucide-react'

export default function BescheidePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Bescheide</h1>
      <EmptyState
        icon={<FileBox className="h-8 w-8" />}
        title="Noch keine Bescheide"
        description="Lade Steuerbescheide hoch und lasse sie automatisch prüfen."
      />
    </div>
  )
}
