import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabase, useAuth } from '@fintutto/core'
import {
  Button, Card, CardContent, Input, Label, Badge, Skeleton, EmptyState,
} from '@fintutto/ui'
import { Gauge, Plus, Search, Zap, Droplets, Flame, Thermometer, X } from 'lucide-react'
import { toast } from 'sonner'
import { useSearchParams } from 'react-router-dom'

interface MeterWithUnit {
  id: string
  meter_number: string
  meter_type: string
  reading_interval_months: number
  unit_id: string
  unit?: {
    id: string
    unit_number: string
    building_id: string
    building?: { id: string; name: string; address: string; city: string }
  }
  latestReading?: {
    id: string
    reading_value: number
    reading_date: string
    recorded_by: string | null
  } | null
  status: 'ok' | 'due' | 'overdue'
}

const meterTypeConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  electricity: { label: 'Strom', icon: <Zap className="h-4 w-4" />, color: 'text-yellow-600' },
  gas: { label: 'Gas', icon: <Flame className="h-4 w-4" />, color: 'text-orange-600' },
  water: { label: 'Wasser', icon: <Droplets className="h-4 w-4" />, color: 'text-blue-600' },
  heating: { label: 'Heizung', icon: <Thermometer className="h-4 w-4" />, color: 'text-red-600' },
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' }> = {
  ok: { label: 'OK', variant: 'success' },
  due: { label: 'Faellig', variant: 'warning' },
  overdue: { label: 'Ueberfaellig', variant: 'destructive' },
}

function useCaretakerMeters(buildingFilter?: string) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['caretaker-meters', user?.id, buildingFilter],
    queryFn: async () => {
      const supabase = getSupabase()

      // Erstmal Gebaeude finden, die dem Hausmeister zugewiesen sind
      const { data: taskBuildings } = await supabase
        .from('tasks')
        .select('building_id')
        .eq('assigned_to', user!.id)
        .not('building_id', 'is', null)

      const assignedBuildingIds = [...new Set(
        (taskBuildings ?? [])
          .map((t: { building_id: string | null }) => t.building_id)
          .filter(Boolean)
      )] as string[]

      // Wenn Gebaeude-Filter gesetzt, nur dieses Gebaeude
      const targetBuildingIds = buildingFilter
        ? assignedBuildingIds.filter((id) => id === buildingFilter)
        : assignedBuildingIds

      if (targetBuildingIds.length === 0) return []

      // Einheiten in diesen Gebaeuden
      const { data: units } = await supabase
        .from('units')
        .select('id, building_id')
        .in('building_id', targetBuildingIds)

      const unitIds = (units ?? []).map((u: { id: string }) => u.id)
      if (unitIds.length === 0) return []

      // Zaehler laden
      const { data: meters, error } = await supabase
        .from('meters')
        .select(`
          *,
          unit:units(
            id, unit_number, building_id,
            building:buildings(id, name, address, city)
          )
        `)
        .in('unit_id', unitIds)
        .order('meter_number')

      if (error) throw error
      if (!meters || meters.length === 0) return []

      // Letzte Ablesung fuer jeden Zaehler
      const meterIds = meters.map((m: { id: string }) => m.id)
      const { data: readings } = await supabase
        .from('meter_readings')
        .select('*')
        .in('meter_id', meterIds)
        .order('reading_date', { ascending: false })

      // Status berechnen
      const now = new Date()
      return meters.map((meter: Record<string, unknown>): MeterWithUnit => {
        const meterReadings = (readings ?? []).filter(
          (r: { meter_id: string }) => r.meter_id === meter.id
        )
        const latestReading = meterReadings[0] ?? null
        const intervalMonths = (meter.reading_interval_months as number) ?? 12

        let status: 'ok' | 'due' | 'overdue' = 'ok'
        if (latestReading) {
          const lastDate = new Date(latestReading.reading_date)
          const monthsSince = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
          if (monthsSince >= intervalMonths) status = 'overdue'
          else if (monthsSince >= intervalMonths - 1) status = 'due'
        } else {
          status = 'overdue'
        }

        return {
          id: meter.id as string,
          meter_number: meter.meter_number as string,
          meter_type: meter.meter_type as string,
          reading_interval_months: intervalMonths,
          unit_id: meter.unit_id as string,
          unit: meter.unit as MeterWithUnit['unit'],
          latestReading,
          status,
        }
      })
    },
    enabled: !!user?.id,
  })
}

function useAddReading() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (data: { meter_id: string; reading_value: number; reading_date: string }) => {
      const { data: reading, error } = await getSupabase()
        .from('meter_readings')
        .insert({
          meter_id: data.meter_id,
          reading_value: data.reading_value,
          reading_date: data.reading_date,
          recorded_by: user?.id ?? null,
        })
        .select()
        .single()

      if (error) throw error
      return reading
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caretaker-meters'] })
      queryClient.invalidateQueries({ queryKey: ['caretaker-dashboard'] })
    },
  })
}

function AddReadingForm({ meter, onClose }: { meter: MeterWithUnit; onClose: () => void }) {
  const addReading = useAddReading()
  const [value, setValue] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await addReading.mutateAsync({
        meter_id: meter.id,
        reading_value: parseFloat(value),
        reading_date: date,
      })
      toast.success('Ablesung gespeichert')
      onClose()
    } catch {
      toast.error('Fehler beim Speichern')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 mt-3 pt-3 border-t">
      <div className="space-y-1 flex-1">
        <Label className="text-xs">Wert</Label>
        <Input
          type="number"
          step="0.01"
          placeholder="12345.67"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Datum</Label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      <Button size="sm" type="submit" disabled={addReading.isPending}>
        {addReading.isPending ? '...' : 'Speichern'}
      </Button>
      <Button size="sm" variant="ghost" type="button" onClick={onClose}>
        <X className="h-3.5 w-3.5" />
      </Button>
    </form>
  )
}

export default function MetersPage() {
  const [searchParams] = useSearchParams()
  const buildingFilter = searchParams.get('building') ?? undefined
  const [search, setSearch] = useState('')
  const [readingFor, setReadingFor] = useState<string | null>(null)
  const { data: meters, isLoading } = useCaretakerMeters(buildingFilter)

  const filtered = (meters ?? []).filter((m) =>
    !search ||
    m.meter_number.toLowerCase().includes(search.toLowerCase()) ||
    m.meter_type.toLowerCase().includes(search.toLowerCase()) ||
    m.unit?.building?.name?.toLowerCase().includes(search.toLowerCase())
  )

  // Sortierung: ueberfaellige und faellige zuerst
  const sorted = [...filtered].sort((a, b) => {
    const priority: Record<string, number> = { overdue: 0, due: 1, ok: 2 }
    return (priority[a.status] ?? 2) - (priority[b.status] ?? 2)
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Zaehler</h1>
          <p className="text-muted-foreground">Zaehlerablesungen erfassen und verwalten</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Suche nach Zaehlernummer, Typ oder Gebaeude..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={<Gauge className="h-8 w-8" />}
          title={search ? 'Keine Ergebnisse' : 'Keine Zaehler gefunden'}
          description={search ? 'Versuche einen anderen Suchbegriff.' : 'In den zugewiesenen Gebaeuden wurden noch keine Zaehler angelegt.'}
        />
      ) : (
        <div className="space-y-3">
          {sorted.map((meter) => {
            const typeConf = meterTypeConfig[meter.meter_type] ?? meterTypeConfig.electricity
            const statusConf = statusConfig[meter.status]

            return (
              <Card key={meter.id} className={meter.status === 'overdue' ? 'border-destructive/50' : meter.status === 'due' ? 'border-warning/50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`rounded-lg bg-muted p-2.5 ${typeConf.color}`}>
                      {typeConf.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{meter.meter_number}</span>
                        <Badge variant="secondary">{typeConf.label}</Badge>
                        <Badge variant={statusConf.variant as 'default'}>{statusConf.label}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-3 mt-1 text-xs text-muted-foreground">
                        {meter.unit && (
                          <span>{meter.unit.building?.name} - Einheit {meter.unit.unit_number}</span>
                        )}
                        {meter.latestReading && (
                          <span>
                            Letzter Stand: {meter.latestReading.reading_value} ({new Date(meter.latestReading.reading_date).toLocaleDateString('de-DE')})
                          </span>
                        )}
                        {!meter.latestReading && (
                          <span className="text-destructive">Noch keine Ablesung</span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={meter.status === 'ok' ? 'outline' : 'default'}
                      onClick={() => setReadingFor(readingFor === meter.id ? null : meter.id)}
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      Ablesung
                    </Button>
                  </div>

                  {readingFor === meter.id && (
                    <AddReadingForm meter={meter} onClose={() => setReadingFor(null)} />
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {sorted.length > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          {sorted.length} Zaehler insgesamt
          {sorted.filter((m) => m.status !== 'ok').length > 0 && (
            <> | <span className="text-destructive">{sorted.filter((m) => m.status !== 'ok').length} faellig</span></>
          )}
        </p>
      )}
    </div>
  )
}
