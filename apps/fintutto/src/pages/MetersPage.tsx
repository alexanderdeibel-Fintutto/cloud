import { EmptyState } from '@fintutto/ui'
import { Gauge } from 'lucide-react'

export default function MetersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Zähler</h1>
      <EmptyState
        icon={<Gauge className="h-8 w-8" />}
        title="Noch keine Zähler"
        description="Zähler werden pro Einheit angelegt. Erstelle zuerst eine Immobilie mit Einheiten."
      />
    </div>
  )
}
