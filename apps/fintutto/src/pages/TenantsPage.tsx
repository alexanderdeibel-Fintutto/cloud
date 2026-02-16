import { EmptyState } from '@fintutto/ui'
import { Users } from 'lucide-react'

export default function TenantsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mieter</h1>
      <EmptyState
        icon={<Users className="h-8 w-8" />}
        title="Noch keine Mieter"
        description="Mieter werden automatisch angelegt, wenn du Mietverträge erstellst."
      />
    </div>
  )
}
