import { useState } from 'react'
import {
  Button, Card, CardContent, Input, Label, Badge, Skeleton, EmptyState,
} from '@fintutto/ui'
import { ClipboardList, Plus, Check, Trash2, X } from 'lucide-react'
import { useTasksList, useCreateTask, useCompleteTask, useDeleteTask, type TaskWithRelations } from '@/hooks/useTasks'
import { toast } from 'sonner'

const priorityConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'warning' | 'destructive' }> = {
  low: { label: 'Niedrig', variant: 'secondary' },
  normal: { label: 'Normal', variant: 'default' },
  high: { label: 'Hoch', variant: 'warning' },
  urgent: { label: 'Dringend', variant: 'destructive' },
}

function QuickCreateTask({ onClose }: { onClose: () => void }) {
  const createTask = useCreateTask()
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('normal')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createTask.mutateAsync({ title, priority: priority as 'normal' })
      toast.success('Aufgabe erstellt')
      onClose()
    } catch {
      toast.error('Fehler beim Erstellen')
    }
  }

  return (
    <Card className="border-primary">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Neue Aufgabe</h3>
            <button type="button" onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-2">
              <Label>Titel</Label>
              <Input placeholder="Was muss erledigt werden?" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Priorität</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Niedrig</option>
                <option value="normal">Normal</option>
                <option value="high">Hoch</option>
                <option value="urgent">Dringend</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>Abbrechen</Button>
            <Button type="submit" disabled={createTask.isPending}>
              {createTask.isPending ? 'Wird erstellt...' : 'Erstellen'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default function TasksPage() {
  const [showCreate, setShowCreate] = useState(false)
  const [filter, setFilter] = useState<'all' | 'open' | 'completed'>('open')
  const { data: tasks, isLoading } = useTasksList(
    filter === 'all' ? undefined : { status: filter === 'open' ? ['open', 'in_progress'] : 'completed' as any }
  )
  const completeTask = useCompleteTask()
  const deleteTask = useDeleteTask()

  const handleComplete = async (id: string) => {
    try {
      await completeTask.mutateAsync(id)
      toast.success('Aufgabe erledigt')
    } catch {
      toast.error('Fehler')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteTask.mutateAsync(id)
      toast.success('Aufgabe gelöscht')
    } catch {
      toast.error('Fehler')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Aufgaben</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Neue Aufgabe
        </Button>
      </div>

      {showCreate && <QuickCreateTask onClose={() => setShowCreate(false)} />}

      {/* Filter Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {(['open', 'completed', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === f ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {f === 'open' ? 'Offen' : f === 'completed' ? 'Erledigt' : 'Alle'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </div>
      ) : !tasks || tasks.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-8 w-8" />}
          title={filter === 'completed' ? 'Keine erledigten Aufgaben' : 'Keine offenen Aufgaben'}
          description="Erstelle eine neue Aufgabe um loszulegen."
          action={filter !== 'completed' ? <Button onClick={() => setShowCreate(true)}><Plus className="mr-2 h-4 w-4" />Neue Aufgabe</Button> : undefined}
        />
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => {
            const pConf = priorityConfig[task.priority ?? 'normal']
            const isCompleted = task.status === 'completed'
            return (
              <Card key={task.id} className={isCompleted ? 'opacity-60' : ''}>
                <CardContent className="flex items-center gap-3 p-3">
                  <button
                    onClick={() => !isCompleted && handleComplete(task.id)}
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 flex-shrink-0 transition-colors ${
                      isCompleted ? 'border-primary bg-primary text-white' : 'border-muted-foreground/30 hover:border-primary'
                    }`}
                  >
                    {isCompleted && <Check className="h-3.5 w-3.5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-medium ${isCompleted ? 'line-through' : ''}`}>{task.title}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant={pConf.variant as 'default'} className="text-[10px] px-1.5 py-0">{pConf.label}</Badge>
                      {task.buildings && <span className="text-xs text-muted-foreground">{task.buildings.name}</span>}
                      {task.due_date && (
                        <span className="text-xs text-muted-foreground">
                          Fällig: {new Date(task.due_date).toLocaleDateString('de-DE')}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-1 text-muted-foreground hover:text-destructive flex-shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
