import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabase, useAuth } from '@fintutto/core'
import {
  Button, Card, CardHeader, CardTitle, CardContent, Input, Label, Badge, Skeleton,
} from '@fintutto/ui'
import { Gauge, CheckCircle2, Zap, Droplets, Flame, Thermometer } from 'lucide-react'
import { toast } from 'sonner'

interface MeterOption {
  id: string
  meter_number: string
  meter_type: string
  unit_number?: string
  building_name?: string
  latestValue?: number | null
  latestDate?: string | null
}

const meterTypeConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  electricity: { label: 'Strom', icon: <Zap className="h-4 w-4" />, color: 'text-yellow-600' },
  gas: { label: 'Gas', icon: <Flame className="h-4 w-4" />, color: 'text-orange-600' },
  water: { label: 'Wasser', icon: <Droplets className="h-4 w-4" />, color: 'text-blue-600' },
  heating: { label: 'Heizung', icon: <Thermometer className="h-4 w-4" />, color: 'text-red-600' },
}

function useMeterOptions() {
  return useQuery({
    queryKey: ['zaehler-capture-options'],
    queryFn: async (): Promise<MeterOption[]> => {
      const { data: meters, error } = await getSupabase()
        .from('meters')
        .select(`
          id, meter_number, meter_type,
          unit:units(unit_number, building:buildings(name))
        `)
        .order('meter_number')

      if (error) throw error
      if (!meters || meters.length === 0) return []

      // Letzte Ablesungen laden
      const meterIds = meters.map((m: { id: string }) => m.id)
      const { data: readings } = await getSupabase()
        .from('meter_readings')
        .select('meter_id, reading_value, reading_date')
        .in('meter_id', meterIds)
        .order('reading_date', { ascending: false })

      const latestByMeter = new Map<string, { reading_value: number; reading_date: string }>()
      for (const r of (readings ?? []) as Array<{ meter_id: string; reading_value: number; reading_date: string }>) {
        if (!latestByMeter.has(r.meter_id)) {
          latestByMeter.set(r.meter_id, r)
        }
      }

      return meters.map((m: Record<string, unknown>) => {
        const unit = m.unit as { unit_number: string; building: { name: string } | null } | null
        const latest = latestByMeter.get(m.id as string)
        return {
          id: m.id as string,
          meter_number: m.meter_number as string,
          meter_type: m.meter_type as string,
          unit_number: unit?.unit_number,
          building_name: unit?.building?.name,
          latestValue: latest?.reading_value ?? null,
          latestDate: latest?.reading_date ?? null,
        }
      })
    },
  })
}

function useSubmitReading() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (data: { meter_id: string; reading_value: number; reading_date: string; notes?: string }) => {
      const { data: reading, error } = await getSupabase()
        .from('meter_readings')
        .insert({
          meter_id: data.meter_id,
          reading_value: data.reading_value,
          reading_date: data.reading_date,
          recorded_by: user?.id ?? null,
          notes: data.notes ?? null,
        })
        .select()
        .single()

      if (error) throw error
      return reading
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zaehler-meters'] })
      queryClient.invalidateQueries({ queryKey: ['zaehler-dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['zaehler-history'] })
      queryClient.invalidateQueries({ queryKey: ['zaehler-capture-options'] })
    },
  })
}

export default function CapturePage() {
  const { data: meters, isLoading } = useMeterOptions()
  const submitReading = useSubmitReading()

  const [selectedMeterId, setSelectedMeterId] = useState('')
  const [readingValue, setReadingValue] = useState('')
  const [readingDate, setReadingDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const selectedMeter = meters?.find((m) => m.id === selectedMeterId)
  const typeConf = selectedMeter ? (meterTypeConfig[selectedMeter.meter_type] ?? meterTypeConfig.electricity) : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedMeterId || !readingValue) {
      toast.error('Bitte Zähler und Wert eingeben')
      return
    }

    const numValue = parseFloat(readingValue)
    if (isNaN(numValue) || numValue < 0) {
      toast.error('Bitte einen gültigen Zählerstand eingeben')
      return
    }

    // Warnung wenn Wert kleiner als letzter Stand
    if (selectedMeter?.latestValue !== null && selectedMeter?.latestValue !== undefined && numValue < selectedMeter.latestValue) {
      const confirmed = window.confirm(
        `Der eingegebene Wert (${numValue}) ist kleiner als der letzte Stand (${selectedMeter.latestValue}). Trotzdem speichern?`
      )
      if (!confirmed) return
    }

    try {
      await submitReading.mutateAsync({
        meter_id: selectedMeterId,
        reading_value: numValue,
        reading_date: readingDate,
        notes: notes || undefined,
      })
      toast.success('Ablesung erfolgreich gespeichert!')
      setSubmitted(true)

      // Formular zurücksetzen nach kurzer Pause
      setTimeout(() => {
        setSelectedMeterId('')
        setReadingValue('')
        setReadingDate(new Date().toISOString().split('T')[0])
        setNotes('')
        setSubmitted(false)
      }, 2000)
    } catch {
      toast.error('Fehler beim Speichern der Ablesung')
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="rounded-full bg-emerald-50 p-4 dark:bg-emerald-950">
          <CheckCircle2 className="h-12 w-12 text-emerald-600" />
        </div>
        <h2 className="mt-4 text-xl font-bold">Ablesung gespeichert!</h2>
        <p className="mt-2 text-muted-foreground">
          Der Zählerstand wurde erfolgreich erfasst.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Ablesung erfassen</h1>
        <p className="text-muted-foreground">Wähle einen Zähler und gib den aktuellen Stand ein.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Zähler auswählen */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Zähler auswählen
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <div className="space-y-3">
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={selectedMeterId}
                  onChange={(e) => setSelectedMeterId(e.target.value)}
                  required
                >
                  <option value="">Zähler wählen...</option>
                  {meters?.map((meter) => {
                    const conf = meterTypeConfig[meter.meter_type] ?? meterTypeConfig.electricity
                    return (
                      <option key={meter.id} value={meter.id}>
                        {meter.meter_number} ({conf.label})
                        {meter.building_name ? ` – ${meter.building_name}` : ''}
                        {meter.unit_number ? ` / ${meter.unit_number}` : ''}
                      </option>
                    )
                  })}
                </select>

                {/* Ausgewählter Zähler Info */}
                {selectedMeter && typeConf && (
                  <div className="rounded-lg border bg-muted/50 p-3">
                    <div className="flex items-center gap-2">
                      <span className={typeConf.color}>{typeConf.icon}</span>
                      <span className="font-medium text-sm">{selectedMeter.meter_number}</span>
                      <Badge variant="secondary">{typeConf.label}</Badge>
                    </div>
                    {selectedMeter.building_name && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedMeter.building_name}
                        {selectedMeter.unit_number ? ` – Einheit ${selectedMeter.unit_number}` : ''}
                      </p>
                    )}
                    {selectedMeter.latestValue !== null && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Letzter Stand: <span className="font-medium">{selectedMeter.latestValue?.toLocaleString('de-DE')}</span>
                        {selectedMeter.latestDate && (
                          <> ({new Date(selectedMeter.latestDate).toLocaleDateString('de-DE')})</>
                        )}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Zählerstand eingeben */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Zählerstand</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Großes Zahleneingabefeld */}
            <div className="space-y-2">
              <Label htmlFor="reading-value" className="text-sm">
                Aktueller Zählerstand
              </Label>
              <Input
                id="reading-value"
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                placeholder="0"
                value={readingValue}
                onChange={(e) => setReadingValue(e.target.value)}
                className="text-center text-3xl font-bold h-16 tracking-wider"
                required
                autoFocus
              />
              {selectedMeter?.latestValue !== null && selectedMeter?.latestValue !== undefined && readingValue && (
                <p className="text-xs text-center text-muted-foreground">
                  Verbrauch: <span className="font-medium">
                    {(parseFloat(readingValue) - selectedMeter.latestValue).toLocaleString('de-DE', { maximumFractionDigits: 2 })}
                  </span> seit letzter Ablesung
                </p>
              )}
            </div>

            {/* Datum */}
            <div className="space-y-2">
              <Label htmlFor="reading-date" className="text-sm">Ablesedatum</Label>
              <Input
                id="reading-date"
                type="date"
                value={readingDate}
                onChange={(e) => setReadingDate(e.target.value)}
                required
              />
            </div>

            {/* Notizen */}
            <div className="space-y-2">
              <Label htmlFor="reading-notes" className="text-sm">Notizen (optional)</Label>
              <Input
                id="reading-notes"
                placeholder="z.B. Zwischenablesung, Zählertausch..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full h-12 text-base font-semibold"
          disabled={submitReading.isPending || !selectedMeterId || !readingValue}
        >
          {submitReading.isPending ? 'Wird gespeichert...' : 'Ablesung speichern'}
        </Button>
      </form>
    </div>
  )
}
