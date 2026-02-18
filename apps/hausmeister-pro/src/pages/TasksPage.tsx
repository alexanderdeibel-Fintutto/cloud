import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabase, useAuth } from '@fintutto/core'
import {
  Button, Card, CardContent, Input, Badge, Skeleton, EmptyState,
} from '@fintutto/ui'
import { ClipboardList, Check, Search, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

interface TaskWithBuilding {
  id: string
  title: string
  description: string | null
  priority: string
  status: string
  category: string | null
  due_date: string | null
  building_id: string | null
  unit_id: string | null
  assigned_to: string | null
  created_at: string
  buildings?: { id: string; name: string } | null
  units?: { id: string; unit_number: string } | null
}

const priorityConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'warning' | 'destructive' }> = {
  low: { label: 'Niedrig', variant: 'secondary' },
  normal: { label: 'Normal', variant: 'default' },
  high: { label: 'Hoch', variant: 'warning' },
  urgent: { label: 'Dringend', variant: 'destructive' },
}

const statusLabels: Record<string, string> = {
  open: 'Offen',
  in_progress: 'In Bearbeitung',
  completed: 'Erledigt',
}

function useCaretakerTasks(filter: 'open' | 'in_progress' | 'completed' | 'all') {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['caretaker-tasks', user?.id, filter],
    queryFn: async () => {
      let query = getSupabase()
        .from('tasks')
        .select('*, buildings(id, name), units(id, unit_number)')
        .eq('assigned_to', user!.id)
        .order('created_at', { ascending: false })

      if (filter === 'open') {
        query = query.in('status', ['open', 'in_progress'])
      } else if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query
      if (error) throw error
      return (data ?? []) as TaskWithBuilding[]
    },
    enabled: !!user?.id,
  })
}

function useUpdateTaskStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updateData: Record<string, unknown> = { status }
      if (status === 'completed') {
        updateData.is_completed = true
      }

      const { data, error } = await getSupabase()
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caretaker-tasks'] })
      queryClient.invalidateQueries({ queryKey: ['caretaker-dashboard'] })
    },
  })
}

export default function TasksPage() {
  const [filter, setFilter] = useState<'open' | 'in_progress' | 'completed' | 'all'>('open')
  const [search, setSearch] = useState('')
  const { data: tasks, isLoading } = useCaretakerTasks(filter)
  const updateStatus = useUpdateTaskStatus()

  const filtered = (tasks ?? []).filter((t) =>
    !search ||
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.buildings?.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  )

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateStatus.mutateAsync({ id, status: newStatus })
      toast.success(
        newStatus === 'completed' ? 'Auftrag erledigt' :
        newStatus === 'in_progress' ? 'Auftrag wird bearbeitet' : 'Status aktualisiert'
      )
    } catch {
      toast.error('Fehler beim Aktualisieren')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Meine Auftraege</h1>
      </div>

      {/* Suche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Suche nach Auftrag oder Gebaeude..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {(['open', 'in_progress', 'completed', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === f ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {f === 'open' ? 'Offen' : f === 'in_progress' ? 'In Bearbeitung' : f === 'completed' ? 'Erledigt' : 'Alle'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-8 w-8" />}
          title={search ? 'Keine Ergebnisse' : filter === 'completed' ? 'Keine erledigten Auftraege' : 'Keine offenen Auftraege'}
          description={search ? 'Versuche einen anderen Suchbegriff.' : 'Aktuell gibt es keine Auftraege mit diesem Status.'}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => {
            const pConf = priorityConfig[task.priority ?? 'normal']
            const isCompleted = task.status === 'completed'
            const isInProgress = task.status === 'in_progress'

            return (
              <Card key={task.id} className={isCompleted ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Status-Checkbox */}
                    <button
                      onClick={() => !isCompleted && handleStatusChange(task.id, 'completed')}
                      className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 flex-shrink-0 transition-colors ${
                        isCompleted
                          ? 'border-primary bg-primary text-white'
                          : 'border-muted-foreground/30 hover:border-primary'
                      }`}
                    >
                      {isCompleted && <Check className="h-3.5 w-3.5" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-medium text-sm ${isCompleted ? 'line-through' : ''}`}>
                          {task.title}
                        </span>
                        <Badge variant={pConf.variant as 'default'} className="text-[10px] px-1.5 py-0">
                          {pConf.label}
                        </Badge>
                        {isInProgress && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            <AlertTriangle className="mr-1 h-2.5 w-2.5" />
                            In Bearbeitung
                          </Badge>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                      )}

                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        {task.buildings && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Building2Icon />
                            {task.buildings.name}
                          </span>
                        )}
                        {task.units && (
                          <span className="text-xs text-muted-foreground">
                            Einheit {task.units.unit_number}
                          </span>
                        )}
                        {task.due_date && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(task.due_date).toLocaleDateString('de-DE')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Aktions-Buttons */}
                    {!isCompleted && (
                      <div className="flex gap-1 flex-shrink-0">
                        {!isInProgress && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(task.id, 'in_progress')}
                            className="text-xs"
                          >
                            Starten
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleStatusChange(task.id, 'completed')}
                          className="text-xs"
                        >
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Erledigt
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          {filtered.length} Auftrag{filtered.length !== 1 ? 'e' : ''} angezeigt
        </p>
      )}
    </div>
  )
}

function Building2Icon() {
  return (
    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  )
}
