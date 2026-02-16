import { EmptyState } from '@fintutto/ui'
import { ClipboardList } from 'lucide-react'

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Aufgaben</h1>
      <EmptyState
        icon={<ClipboardList className="h-8 w-8" />}
        title="Noch keine Aufgaben"
        description="Erstelle Aufgaben für dich, Hausmeister oder andere Beteiligte."
      />
    </div>
  )
}
