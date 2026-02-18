import { useQuery } from '@tanstack/react-query'
import { getSupabase, useAuth } from '@fintutto/core'
import { Card, CardContent, Badge, Skeleton, EmptyState } from '@fintutto/ui'
import {
  Building2,
  Gauge,
  AlertTriangle,
  ArrowRight,
  MapPin,
  Home,
  ClipboardList,
} from 'lucide-react'
import { Link } from 'react-router-dom'

interface BuildingRound {
  id: string
  name: string
  address: string
  postal_code: string
  city: string
  building_type: string
  openTasksCount: number
  dueMetersCount: number
  totalUnits: number
}

function useCaretakerBuildings() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['caretaker-rounds', user?.id],
    queryFn: async () => {
      const supabase = getSupabase()
      const userId = user!.id

      // Gebaeude finden, die diesem Hausmeister ueber Tasks zugewiesen sind
      const { data: taskBuildings } = await supabase
        .from('tasks')
        .select('building_id')
        .eq('assigned_to', userId)
        .not('building_id', 'is', null)

      const buildingIds = [...new Set(
        (taskBuildings ?? [])
          .map((t: { building_id: string | null }) => t.building_id)
          .filter(Boolean)
      )] as string[]

      if (buildingIds.length === 0) return []

      // Gebaeude-Details laden
      const { data: buildings, error } = await supabase
        .from('buildings')
        .select('*')
        .in('id', buildingIds)
        .order('name')

      if (error) throw error
      if (!buildings || buildings.length === 0) return []

      // Offene Tasks pro Gebaeude
      const { data: openTasks } = await supabase
        .from('tasks')
        .select('building_id, id')
        .eq('assigned_to', userId)
        .in('status', ['open', 'in_progress'])
        .in('building_id', buildingIds)

      // Einheiten pro Gebaeude
      const { data: units } = await supabase
        .from('units')
        .select('id, building_id')
        .in('building_id', buildingIds)

      // Zaehler pro Gebaeude (ueber Einheiten)
      const unitIds = (units ?? []).map((u: { id: string }) => u.id)
      let dueMetersMap = new Map<string, number>()

      if (unitIds.length > 0) {
        const { data: meters } = await supabase
          .from('meters')
          .select('id, reading_interval_months, unit_id')
          .in('unit_id', unitIds)

        if (meters && meters.length > 0) {
          const meterIds = meters.map((m: { id: string }) => m.id)
          const { data: readings } = await supabase
            .from('meter_readings')
            .select('meter_id, reading_date')
            .in('meter_id', meterIds)
            .order('reading_date', { ascending: false })

          const latestByMeter = new Map<string, string>()
          for (const r of readings ?? []) {
            if (!latestByMeter.has(r.meter_id)) {
              latestByMeter.set(r.meter_id, r.reading_date)
            }
          }

          const now = new Date()
          // Einheit-ID zu Gebaeude-ID Mapping
          const unitToBuildingMap = new Map<string, string>()
          for (const u of units ?? []) {
            unitToBuildingMap.set(u.id, u.building_id)
          }

          for (const meter of meters) {
            const lastDate = latestByMeter.get(meter.id)
            const interval = (meter.reading_interval_months as number) ?? 12
            let isDue = false

            if (!lastDate) {
              isDue = true
            } else {
              const monthsSince = (now.getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
              if (monthsSince >= interval - 1) isDue = true
            }

            if (isDue) {
              const bId = unitToBuildingMap.get(meter.unit_id)
              if (bId) {
                dueMetersMap.set(bId, (dueMetersMap.get(bId) ?? 0) + 1)
              }
            }
          }
        }
      }

      // Zusammenbauen
      const tasksCountMap = new Map<string, number>()
      for (const t of openTasks ?? []) {
        if (t.building_id) {
          tasksCountMap.set(t.building_id, (tasksCountMap.get(t.building_id) ?? 0) + 1)
        }
      }

      const unitsCountMap = new Map<string, number>()
      for (const u of units ?? []) {
        unitsCountMap.set(u.building_id, (unitsCountMap.get(u.building_id) ?? 0) + 1)
      }

      return buildings.map((b: Record<string, unknown>): BuildingRound => ({
        id: b.id as string,
        name: b.name as string,
        address: b.address as string,
        postal_code: b.postal_code as string,
        city: b.city as string,
        building_type: b.building_type as string,
        openTasksCount: tasksCountMap.get(b.id as string) ?? 0,
        dueMetersCount: dueMetersMap.get(b.id as string) ?? 0,
        totalUnits: unitsCountMap.get(b.id as string) ?? 0,
      }))
    },
    enabled: !!user?.id,
  })
}

const typeLabels: Record<string, string> = {
  apartment: 'MFH',
  house: 'EFH',
  commercial: 'Gewerbe',
  mixed: 'Gemischt',
}

export default function RoundsPage() {
  const { data: buildings, isLoading } = useCaretakerBuildings()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Rundgaenge</h1>
        <p className="text-muted-foreground">Gebaeude-Kontrolle und Schnellzugriff</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-lg" />)}
        </div>
      ) : !buildings || buildings.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-8 w-8" />}
          title="Keine Gebaeude zugewiesen"
          description="Dir wurden noch keine Gebaeude ueber Auftraege zugewiesen."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {buildings.map((building) => (
            <Card key={building.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Header */}
                <div className="p-4 pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-orange-500" />
                      <h3 className="font-semibold">{building.name}</h3>
                    </div>
                    <Badge variant="secondary">{typeLabels[building.building_type] ?? building.building_type}</Badge>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{building.address}, {building.postal_code} {building.city}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Home className="h-3 w-3" />
                    <span>{building.totalUnits} Einheiten</span>
                  </div>
                </div>

                {/* Status-Badges */}
                <div className="flex gap-2 px-4 pb-3">
                  {building.openTasksCount > 0 && (
                    <Badge variant="warning" className="text-xs">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      {building.openTasksCount} offene Auftraege
                    </Badge>
                  )}
                  {building.dueMetersCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      <Gauge className="mr-1 h-3 w-3" />
                      {building.dueMetersCount} faellige Zaehler
                    </Badge>
                  )}
                  {building.openTasksCount === 0 && building.dueMetersCount === 0 && (
                    <Badge variant="success" className="text-xs">
                      Alles erledigt
                    </Badge>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="border-t bg-muted/30 p-3 flex gap-2">
                  <Link
                    to={`/meters?building=${building.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-background border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                  >
                    <Gauge className="h-3.5 w-3.5 text-orange-500" />
                    Zaehler ablesen
                  </Link>
                  <Link
                    to={`/tasks?building=${building.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-background border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                  >
                    <ClipboardList className="h-3.5 w-3.5 text-orange-500" />
                    Auftraege
                  </Link>
                  <Link
                    to={`/buildings/${building.id}`}
                    className="flex items-center justify-center rounded-md bg-background border px-2.5 py-2 text-sm transition-colors hover:bg-accent"
                  >
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
