import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Gauge, Loader2 } from 'lucide-react'
import { useMeters, useCreateMeter } from '@/hooks/useMeters'
import { useProperties } from '@/hooks/useProperties'
import { toast } from 'sonner'

const METER_TYPE_LABELS: Record<string, string> = {
  electricity: 'Strom',
  gas: 'Gas',
  water_cold: 'Kaltwasser',
  water_hot: 'Warmwasser',
  heating: 'Heizung',
  other: 'Sonstiges',
}

export function Meters() {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    unit_id: '',
    meter_number: '',
    meter_type: 'electricity',
    location: '',
  })

  const { data: meters, isLoading } = useMeters()
  const { data: properties } = useProperties()
  const createMeter = useCreateMeter()

  const allUnits = (properties || []).flatMap((p) =>
    ((p as any).units || []).map((u: any) => ({
      ...u,
      propertyName: p.name,
    }))
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.unit_id || !form.meter_number) {
      toast.error('Bitte Wohnung und Zählernummer angeben.')
      return
    }
    try {
      await createMeter.mutateAsync({
        unit_id: form.unit_id,
        meter_number: form.meter_number,
        meter_type: form.meter_type,
        location: form.location || null,
      })
      toast.success('Zähler erfolgreich angelegt!')
      setShowForm(false)
      setForm({ unit_id: '', meter_number: '', meter_type: 'electricity', location: '' })
    } catch (err: any) {
      toast.error(err.message || 'Fehler beim Anlegen.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Zähler</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Zählerstände für Strom, Gas, Wasser
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Neuer Zähler
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Wohnung *</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.unit_id} onChange={(e) => setForm({ ...form, unit_id: e.target.value })}>
                  <option value="">-- Wohnung wählen --</option>
                  {allUnits.map((u: any) => (
                    <option key={u.id} value={u.id}>{u.propertyName} - {u.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Zählernummer *</Label>
                <Input placeholder="z.B. E-12345" value={form.meter_number} onChange={(e) => setForm({ ...form, meter_number: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Zählerart</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.meter_type} onChange={(e) => setForm({ ...form, meter_type: e.target.value })}>
                  {Object.entries(METER_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Standort</Label>
                <Input placeholder="z.B. Keller" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
              <div className="col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Abbrechen</Button>
                <Button type="submit" disabled={createMeter.isPending}>
                  {createMeter.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Speichern
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !meters || meters.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Gauge className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Keine Zähler vorhanden</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Fügen Sie Ihren ersten Zähler hinzu.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Zähler hinzufügen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {meters.map((meter) => (
            <Card key={meter.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{meter.meter_number}</h3>
                    <p className="text-sm text-muted-foreground">
                      {METER_TYPE_LABELS[meter.meter_type] || meter.meter_type}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${meter.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {meter.is_active ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </div>
                {(meter as any).unit && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {(meter as any).unit.property?.name} - {(meter as any).unit.name}
                  </p>
                )}
                {(meter as any).meter_readings?.length > 0 && (
                  <p className="text-sm mt-2">
                    Letzter Stand: {(meter as any).meter_readings[0].reading_value}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
