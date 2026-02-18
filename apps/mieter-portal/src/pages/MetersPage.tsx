import { useState, useEffect } from 'react'
import { useAuth, getSupabase } from '@fintutto/core'
import {
  Button, Card, CardContent, Input, Label, Badge, Skeleton, EmptyState,
} from '@fintutto/ui'
import { Gauge, Plus, Search, Zap, Droplets, Flame, Thermometer, X } from 'lucide-react'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface MeterReading {
  id: string
  reading_value: number
  reading_date: string
}

interface TenantMeter {
  id: string
  meter_number: string
  meter_type: string
  status: string | null
  location: string | null
  latestReading: MeterReading | null
  unitNumber: string
  buildingName: string
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

function AddReadingForm({ meter, onClose }: { meter: TenantMeter; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [value, setValue] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const addReading = useMutation({
    mutationFn: async (data: { meter_id: string; reading_value: number; reading_date: string }) => {
      const supabase = getSupabase()
      const { error } = await supabase
        .from('meter_readings')
        .insert({
          meter_id: data.meter_id,
          reading_value: data.reading_value,
          reading_date: data.reading_date,
        })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-meters'] })
    },
  })

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
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [readingFor, setReadingFor] = useState<string | null>(null)

  const { data: meters, isLoading } = useQuery({
    queryKey: ['tenant-meters', user?.id],
    queryFn: async (): Promise<TenantMeter[]> => {
      if (!user) return []
      const supabase = getSupabase()

      // Finde die Unit des Mieters ueber den Mietvertrag
      const { data: leases } = await supabase
        .from('leases')
        .select('unit_id')
        .eq('tenant_id', user.id)
        .eq('status', 'active')

      const unitIds = (leases ?? []).map((l) => l.unit_id)
      if (unitIds.length === 0) return []

      // Lade Zaehler der Einheit
      const { data: metersData } = await supabase
        .from('meters')
        .select(`
          id,
          meter_number,
          meter_type,
          status,
          location,
          unit_id,
          units (
            unit_number,
            buildings (
              name
            )
          )
        `)
        .in('unit_id', unitIds)
        .order('meter_type')

      if (!metersData) return []

      // Lade die letzte Ablesung fuer jeden Zaehler
      const result: TenantMeter[] = []
      for (const meter of metersData) {
        const { data: readings } = await supabase
          .from('meter_readings')
          .select('id, reading_value, reading_date')
          .eq('meter_id', meter.id)
          .order('reading_date', { ascending: false })
          .limit(1)

        const unit = meter.units as any
        const building = unit?.buildings as any

        result.push({
          id: meter.id,
          meter_number: meter.meter_number,
          meter_type: meter.meter_type,
          status: meter.status,
          location: meter.location,
          latestReading: readings?.[0] ?? null,
          unitNumber: unit?.unit_number ?? '',
          buildingName: building?.name ?? '',
        })
      }

      return result
    },
    enabled: !!user,
  })

  const filtered = (meters ?? []).filter((m) =>
    !search ||
    m.meter_number.toLowerCase().includes(search.toLowerCase()) ||
    m.meter_type.toLowerCase().includes(search.toLowerCase()) ||
    m.buildingName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Meine Zaehler</h1>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Suche nach Zaehlernummer oder Typ..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Gauge className="h-8 w-8" />}
          title={search ? 'Keine Ergebnisse' : 'Noch keine Zaehler'}
          description="Fuer Ihre Wohnung sind noch keine Zaehler hinterlegt."
        />
      ) : (
        <div className="space-y-3">
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
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{meter.meter_number}</span>
                        <Badge variant="secondary">{typeConf.label}</Badge>
                        <Badge variant={statusConf.variant as 'default'}>{statusConf.label}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-3 mt-1 text-xs text-muted-foreground">
                        <span>{meter.buildingName} - Einheit {meter.unitNumber}</span>
                        {meter.location && <span>Standort: {meter.location}</span>}
                        {meter.latestReading && (
                          <span>
                            Letzter Stand: {meter.latestReading.reading_value} ({new Date(meter.latestReading.reading_date).toLocaleDateString('de-DE')})
                          </span>
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
