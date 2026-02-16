import { useState } from 'react'
import {
  Button, Card, CardContent, Input, Label, Badge, Skeleton, EmptyState, Separator,
} from '@fintutto/ui'
import { Gauge, Plus, Search, Zap, Droplets, Flame, Thermometer, X } from 'lucide-react'
import { useMetersList, useAddReading, type MeterWithUnit } from '@/hooks/useMeters'
import { toast } from 'sonner'

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
  const [readingFor, setReadingFor] = useState<string | null>(null)
  const { data: meters, isLoading } = useMetersList()

  const filtered = (meters ?? []).filter((m) =>
    !search ||
    m.meter_number.toLowerCase().includes(search.toLowerCase()) ||
    m.meter_type.toLowerCase().includes(search.toLowerCase()) ||
    m.unit?.building?.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Zähler</h1>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Suche nach Zählernummer, Typ oder Gebäude..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Gauge className="h-8 w-8" />}
          title={search ? 'Keine Ergebnisse' : 'Noch keine Zähler'}
          description="Zähler werden pro Einheit angelegt. Erstelle zuerst eine Immobilie mit Einheiten."
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
                        {meter.unit && (
                          <span>{meter.unit.building?.name} – Einheit {meter.unit.unit_number}</span>
                        )}
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
