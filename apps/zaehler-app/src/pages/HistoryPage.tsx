import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getSupabase } from '@fintutto/core'
import {
  Card, CardHeader, CardTitle, CardContent, Input, Badge, Skeleton, EmptyState, Separator,
} from '@fintutto/ui'
import {
  History, Search, Zap, Droplets, Flame, Thermometer, TrendingUp, Calendar,
} from 'lucide-react'

interface ReadingWithMeter {
  id: string
  meter_id: string
  reading_value: number
  reading_date: string
  notes: string | null
  recorded_by: string | null
  created_at: string
  meter_number: string
  meter_type: string
  building_name: string | null
  unit_number: string | null
}

const meterTypeConfig: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  electricity: { label: 'Strom', icon: <Zap className="h-4 w-4" />, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950' },
  gas: { label: 'Gas', icon: <Flame className="h-4 w-4" />, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950' },
  water: { label: 'Wasser', icon: <Droplets className="h-4 w-4" />, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950' },
  heating: { label: 'Heizung', icon: <Thermometer className="h-4 w-4" />, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950' },
}

function useReadingHistory() {
  return useQuery({
    queryKey: ['zaehler-history'],
    queryFn: async (): Promise<ReadingWithMeter[]> => {
      const { data, error } = await getSupabase()
        .from('meter_readings')
        .select(`
          id, meter_id, reading_value, reading_date, notes, recorded_by, created_at,
          meter:meters(
            meter_number, meter_type,
            unit:units(
              unit_number,
              building:buildings(name)
            )
          )
        `)
        .order('reading_date', { ascending: false })
        .limit(100)

      if (error) throw error

      return (data ?? []).map((r: Record<string, unknown>) => {
        const meter = r.meter as {
          meter_number: string
          meter_type: string
          unit?: { unit_number: string; building?: { name: string } | null } | null
        } | null

        return {
          id: r.id as string,
          meter_id: r.meter_id as string,
          reading_value: r.reading_value as number,
          reading_date: r.reading_date as string,
          notes: r.notes as string | null,
          recorded_by: r.recorded_by as string | null,
          created_at: r.created_at as string,
          meter_number: meter?.meter_number ?? 'Unbekannt',
          meter_type: meter?.meter_type ?? 'electricity',
          building_name: meter?.unit?.building?.name ?? null,
          unit_number: meter?.unit?.unit_number ?? null,
        }
      })
    },
  })
}

function groupByMonth(readings: ReadingWithMeter[]): Map<string, ReadingWithMeter[]> {
  const grouped = new Map<string, ReadingWithMeter[]>()
  for (const reading of readings) {
    const date = new Date(reading.reading_date)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const existing = grouped.get(key) ?? []
    existing.push(reading)
    grouped.set(key, existing)
  }
  return grouped
}

function formatMonthKey(key: string): string {
  const [year, month] = key.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
}

export default function HistoryPage() {
  const [search, setSearch] = useState('')
  const { data: readings, isLoading } = useReadingHistory()

  const filtered = (readings ?? []).filter((r) =>
    !search ||
    r.meter_number.toLowerCase().includes(search.toLowerCase()) ||
    r.meter_type.toLowerCase().includes(search.toLowerCase()) ||
    r.building_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.reading_value.toString().includes(search)
  )

  const grouped = groupByMonth(filtered)

  // Verbrauchsberechnung (pro Zähler, Differenz zwischen aufeinanderfolgenden Ablesungen)
  const consumptionByMeter = new Map<string, { current: number; previous: number; type: string; number: string }>()
  const allReadings = readings ?? []
  const byMeter = new Map<string, ReadingWithMeter[]>()
  for (const r of allReadings) {
    const existing = byMeter.get(r.meter_id) ?? []
    existing.push(r)
    byMeter.set(r.meter_id, existing)
  }
  for (const [meterId, meterReadings] of byMeter) {
    if (meterReadings.length >= 2) {
      const sorted = [...meterReadings].sort((a, b) =>
        new Date(b.reading_date).getTime() - new Date(a.reading_date).getTime()
      )
      consumptionByMeter.set(meterId, {
        current: sorted[0].reading_value,
        previous: sorted[1].reading_value,
        type: sorted[0].meter_type,
        number: sorted[0].meter_number,
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Verlauf</h1>
        <p className="text-muted-foreground">Alle Ablesungen chronologisch sortiert</p>
      </div>

      {/* Suche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Suche nach Zähler, Typ oder Wert..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Verbrauchstrend-Übersicht (Chart Placeholder) */}
      {consumptionByMeter.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Verbrauchstrend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from(consumptionByMeter.entries()).map(([meterId, data]) => {
                const typeConf = meterTypeConfig[data.type] ?? meterTypeConfig.electricity
                const consumption = data.current - data.previous

                return (
                  <div key={meterId} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div className={`rounded p-1.5 ${typeConf.bg}`}>
                        <span className={typeConf.color}>{typeConf.icon}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">{data.number}</span>
                        <p className="text-xs text-muted-foreground">{typeConf.label}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${consumption >= 0 ? 'text-foreground' : 'text-destructive'}`}>
                        {consumption >= 0 ? '+' : ''}{consumption.toLocaleString('de-DE', { maximumFractionDigits: 2 })}
                      </span>
                      <p className="text-xs text-muted-foreground">seit letzter Ablesung</p>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 rounded-lg border-2 border-dashed border-muted p-6 text-center">
              <TrendingUp className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Detaillierte Verbrauchsdiagramme werden in einem zukünftigen Update verfügbar sein.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ablesungsliste nach Monat */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<History className="h-8 w-8" />}
          title={search ? 'Keine Ergebnisse' : 'Noch keine Ablesungen'}
          description={
            search
              ? 'Versuche andere Suchbegriffe.'
              : 'Erfasse deine erste Ablesung über die Erfassen-Seite.'
          }
        />
      ) : (
        <div className="space-y-6">
          {Array.from(grouped.entries()).map(([monthKey, monthReadings]) => (
            <div key={monthKey}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {formatMonthKey(monthKey)}
                </h2>
                <Badge variant="secondary" className="text-xs">{monthReadings.length}</Badge>
              </div>
              <div className="space-y-2">
                {monthReadings.map((reading) => {
                  const typeConf = meterTypeConfig[reading.meter_type] ?? meterTypeConfig.electricity

                  return (
                    <Card key={reading.id}>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className={`rounded p-1.5 ${typeConf.bg} flex-shrink-0`}>
                            <span className={typeConf.color}>{typeConf.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{reading.meter_number}</span>
                              <Badge variant="secondary" className="text-xs">{typeConf.label}</Badge>
                            </div>
                            <div className="flex flex-wrap gap-x-2 text-xs text-muted-foreground">
                              <span>{new Date(reading.reading_date).toLocaleDateString('de-DE')}</span>
                              {reading.building_name && (
                                <>
                                  <span>·</span>
                                  <span>{reading.building_name}</span>
                                </>
                              )}
                              {reading.unit_number && (
                                <span>/ {reading.unit_number}</span>
                              )}
                            </div>
                            {reading.notes && (
                              <p className="text-xs text-muted-foreground mt-0.5 italic">{reading.notes}</p>
                            )}
                          </div>
                          <span className="text-sm font-bold tabular-nums flex-shrink-0">
                            {reading.reading_value.toLocaleString('de-DE')}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
