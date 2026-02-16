import { Button, EmptyState } from '@fintutto/ui'
import { Building2, Plus } from 'lucide-react'

export default function PropertiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Immobilien</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Immobilie hinzufügen
        </Button>
      </div>
      <EmptyState
        icon={<Building2 className="h-8 w-8" />}
        title="Noch keine Immobilien"
        description="Füge deine erste Immobilie hinzu, um mit der Verwaltung zu beginnen."
        action={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Erste Immobilie anlegen
          </Button>
        }
      />
    </div>
  )
}
