import { useState } from 'react'
import { useAuth, getSupabase } from '@fintutto/core'
import {
  Button, Card, CardContent, Input, Label, Badge, Skeleton, EmptyState,
} from '@fintutto/ui'
import { AlertTriangle, Plus, X, Check, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface Defect {
  id: string
  title: string
  description: string | null
  priority: string
  status: string
  category: string | null
  created_at: string
}

const priorityConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'warning' | 'destructive' }> = {
  low: { label: 'Niedrig', variant: 'secondary' },
  normal: { label: 'Normal', variant: 'default' },
  high: { label: 'Hoch', variant: 'warning' },
  urgent: { label: 'Dringend', variant: 'destructive' },
}

const statusLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  open: { label: 'Offen', icon: <Clock className="h-3 w-3" /> },
  in_progress: { label: 'In Bearbeitung', icon: <Clock className="h-3 w-3" /> },
  completed: { label: 'Erledigt', icon: <Check className="h-3 w-3" /> },
}

const categoryOptions = [
  { value: 'water_damage', label: 'Wasserschaden' },
  { value: 'heating', label: 'Heizung' },
  { value: 'electrical', label: 'Elektrik' },
  { value: 'plumbing', label: 'Sanitaer' },
  { value: 'door_window', label: 'Tueren/Fenster' },
  { value: 'mold', label: 'Schimmel' },
  { value: 'pest', label: 'Schaedlingsbefall' },
  { value: 'noise', label: 'Laerm' },
  { value: 'other', label: 'Sonstiges' },
]

function CreateDefectForm({ onClose }: { onClose: () => void }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('normal')
  const [category, setCategory] = useState('other')

  const createDefect = useMutation({
    mutationFn: async (data: {
      title: string
      description: string
      priority: string
      category: string
    }) => {
      const supabase = getSupabase()

      // Finde die Unit des Mieters fuer die Zuordnung
      const { data: leases } = await supabase
        .from('leases')
        .select('unit_id, units(building_id)')
        .eq('tenant_id', user!.id)
        .eq('status', 'active')
        .limit(1)

      const lease = leases?.[0]
      const unit = lease?.units as any

      const { error } = await supabase
        .from('tasks')
        .insert({
          title: data.title,
          description: data.description,
          priority: data.priority,
          category: data.category,
          source: 'tenant',
          status: 'open',
          created_by: user!.id,
          unit_id: lease?.unit_id ?? null,
          building_id: unit?.building_id ?? null,
        })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-defects'] })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createDefect.mutateAsync({ title, description, priority, category })
      toast.success('Mangel wurde gemeldet')
      onClose()
    } catch {
      toast.error('Fehler beim Melden des Mangels')
    }
  }

  return (
    <Card className="border-primary">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Neuen Mangel melden</h3>
            <button type="button" onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="defect-title">Titel</Label>
            <Input
              id="defect-title"
              placeholder="z.B. Wasserhahn tropft in der Kueche"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="defect-description">Beschreibung</Label>
            <textarea
              id="defect-description"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Beschreiben Sie den Mangel moeglichst genau..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="defect-category">Kategorie</Label>
              <select
                id="defect-category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="defect-priority">Prioritaet</Label>
              <select
                id="defect-priority"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
            <Button type="submit" disabled={createDefect.isPending}>
              {createDefect.isPending ? 'Wird gemeldet...' : 'Mangel melden'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default function DefectsPage() {
  const { user } = useAuth()
  const [showCreate, setShowCreate] = useState(false)
  const [filter, setFilter] = useState<'all' | 'open' | 'completed'>('open')

  const { data: defects, isLoading } = useQuery({
    queryKey: ['tenant-defects', user?.id, filter],
    queryFn: async (): Promise<Defect[]> => {
      if (!user) return []
      const supabase = getSupabase()

      let query = supabase
        .from('tasks')
        .select('id, title, description, priority, status, category, created_at')
        .eq('created_by', user.id)
        .eq('source', 'tenant')
        .order('created_at', { ascending: false })

      if (filter === 'open') {
        query = query.in('status', ['open', 'in_progress'])
      } else if (filter === 'completed') {
        query = query.eq('status', 'completed')
      }

      const { data } = await query
      return data ?? []
    },
    enabled: !!user,
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Maengel melden</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Neuer Mangel
        </Button>
      </div>

      {showCreate && <CreateDefectForm onClose={() => setShowCreate(false)} />}

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
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
      ) : !defects || defects.length === 0 ? (
        <EmptyState
          icon={<AlertTriangle className="h-8 w-8" />}
          title={filter === 'completed' ? 'Keine erledigten Maengel' : 'Keine offenen Maengel'}
          description="Melden Sie einen Mangel in Ihrer Wohnung, damit sich der Vermieter darum kuemmern kann."
          action={
            filter !== 'completed' ? (
              <Button onClick={() => setShowCreate(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Mangel melden
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {defects.map((defect) => {
            const pConf = priorityConfig[defect.priority ?? 'normal']
            const sConf = statusLabels[defect.status] ?? statusLabels.open
            const isCompleted = defect.status === 'completed'

            return (
              <Card key={defect.id} className={isCompleted ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`rounded-lg p-2 mt-0.5 ${
                      isCompleted ? 'bg-emerald-50 dark:bg-emerald-950' : 'bg-red-50 dark:bg-red-950'
                    }`}>
                      {isCompleted ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-medium text-sm ${isCompleted ? 'line-through' : ''}`}>
                          {defect.title}
                        </span>
                        <Badge variant={pConf.variant as 'default'} className="text-[10px] px-1.5 py-0">
                          {pConf.label}
                        </Badge>
                      </div>
                      {defect.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {defect.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          {sConf.icon}
                          {sConf.label}
                        </span>
                        {defect.category && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {categoryOptions.find((c) => c.value === defect.category)?.label ?? defect.category}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(defect.created_at).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
