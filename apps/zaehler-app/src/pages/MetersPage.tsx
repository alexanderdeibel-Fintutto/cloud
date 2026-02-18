import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabase, useAuth } from '@fintutto/core'
import {
  Button, Card, CardContent, Input, Label, Badge, Skeleton, EmptyState, Separator,
} from '@fintutto/ui'
import { Gauge, Plus, Search, Zap, Droplets, Flame, Thermometer, X, Filter } from 'lucide-react'
import { toast } from 'sonner'

const METERS_KEY = 'zaehler-meters'

interface MeterWithUnit {
  id: string
  meter_number: string
  meter_type: string
  reading_interval_months: number
  installation_date: string | null
  notes: string | null
  unit?: {
    id: string
    unit_number: string
    building_id: string
    building?: { id: string; name: string; address: string; city: string }
  }
  latestReading?: { reading_value: number; reading_date: string } | null
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
  due: { label: 'Fällig', variant: 'warning' },
  overdue: { label: 'Überfällig', variant: 'destructive' },
}

function useMetersList() {
  return useQuery({
    queryKey: [METERS_KEY, 'list'],
    queryFn: async () => {
      const { data: meters, error } = await getSupabase()
        .from('meters')
        .select(`
          *,
          unit:units(
            id, unit_number, building_id,
            building:buildings(id, name, address, city)
          )
        `)
        .order('meter_number')

      if (error) throw error
      if (!meters || meters.length === 0) return []

      // Letzte Ablesung für jeden Zähler
      const meterIds = meters.map((m: { id: string }) => m.id)
      const { data: readings } = await getSupabase()
        .from('meter_readings')
        .select('*')
        .in('meter_id', meterIds)
        .order('reading_date', { ascending: false })

      // Status berechnen
      const now = new Date()
      return meters.map((meter: Record<string, unknown>) => {
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

        return { ...meter, latestReading, status } as MeterWithUnit
      })
    },
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
      queryClient.invalidateQueries({ queryKey: [METERS_KEY] })
      queryClient.invalidateQueries({ queryKey: ['zaehler-dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['zaehler-history'] })
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
    <form onSubmit={handleSubmit} className="flex items-end gap-2 mt-2">
      <div className="space-y-1 flex-1">
        <Label className="text-xs">Wert</Label>
        <Input type="number" step="0.01" placeholder="12345.67" value={value} onChange={(e) => setValue(e.target.value)} required />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Datum</Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
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
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [readingFor, setReadingFor] = useState<string | null>(null)
  const { data: meters, isLoading } = useMetersList()

  const filtered = (meters ?? []).filter((m) => {
    // Textsuche
    const matchesSearch = !search ||
      m.meter_number.toLowerCase().includes(search.toLowerCase()) ||
      m.meter_type.toLowerCase().includes(search.toLowerCase()) ||
      m.unit?.building?.name?.toLowerCase().includes(search.toLowerCase())

    // Typfilter
    const matchesType = !typeFilter || m.meter_type === typeFilter

    // Statusfilter
    const matchesStatus = !statusFilter || m.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  const typeOptions = Object.entries(meterTypeConfig)
  const statusOptions = Object.entries(statusConfig)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Alle Zähler</h1>
      </div>

      {/* Suche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Suche nach Zählernummer, Typ oder Gebäude..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Filter className="h-3.5 w-3.5" />
          <span>Typ:</span>
        </div>
        <Button
          size="sm"
          variant={typeFilter === null ? 'default' : 'outline'}
          onClick={() => setTypeFilter(null)}
          className="h-7 text-xs"
        >
          Alle
        </Button>
        {typeOptions.map(([type, conf]) => (
          <Button
            key={type}
            size="sm"
            variant={typeFilter === type ? 'default' : 'outline'}
            onClick={() => setTypeFilter(typeFilter === type ? null : type)}
            className="h-7 text-xs"
          >
            {conf.label}
          </Button>
        ))}

        <Separator orientation="vertical" className="h-7 mx-1" />

        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>Status:</span>
        </div>
        <Button
          size="sm"
          variant={statusFilter === null ? 'default' : 'outline'}
          onClick={() => setStatusFilter(null)}
          className="h-7 text-xs"
        >
          Alle
        </Button>
        {statusOptions.map(([status, conf]) => (
          <Button
            key={status}
            size="sm"
            variant={statusFilter === status ? 'default' : 'outline'}
            onClick={() => setStatusFilter(statusFilter === status ? null : status)}
            className="h-7 text-xs"
          >
            {conf.label}
          </Button>
        ))}
      </div>

      {/* Zähler-Liste */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Gauge className="h-8 w-8" />}
          title={search || typeFilter || statusFilter ? 'Keine Ergebnisse' : 'Noch keine Zähler'}
          description={
            search || typeFilter || statusFilter
              ? 'Versuche andere Filterkriterien.'
              : 'Zähler werden pro Einheit angelegt. Erstelle zuerst eine Immobilie mit Einheiten.'
          }
        />
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{filtered.length} Zähler gefunden</p>
          {filtered.map((meter) => {
            const typeConf = meterTypeConfig[meter.meter_type] ?? meterTypeConfig.electricity
            const statusConf = statusConfig[meter.status ?? 'ok']

            return (
              <Card key={meter.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`rounded-lg bg-muted p-2.5 ${typeConf.color}`}>
                      {typeConf.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{meter.meter_number}</span>
                        <Badge variant="secondary">{typeConf.label}</Badge>
                        <Badge variant={statusConf.variant as 'default'}>{statusConf.label}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-3 mt-1 text-xs text-muted-foreground">
                        {meter.unit && (
                          <span>{meter.unit.building?.name} – Einheit {meter.unit.unit_number}</span>
                        )}
                        {meter.latestReading && (
                          <span>
                            Letzter Stand: {meter.latestReading.reading_value.toLocaleString('de-DE')} ({new Date(meter.latestReading.reading_date).toLocaleDateString('de-DE')})
                          </span>
                        )}
                        {!meter.latestReading && (
                          <span className="text-destructive">Noch keine Ablesung</span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
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
    </div>
  )
}
