import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getSupabase, useAuth } from '@fintutto/core'
import { Card, CardContent, Input, Badge, Skeleton, EmptyState, Separator } from '@fintutto/ui'
import { Building2, Search, MapPin, Home, ChevronDown, ChevronUp } from 'lucide-react'
import { useParams } from 'react-router-dom'

interface UnitInfo {
  id: string
  unit_number: string
  floor: number | null
  rooms: number | null
  area: number | null
  status: string
  rent_amount: number | null
}

interface BuildingWithUnits {
  id: string
  name: string
  address: string
  postal_code: string
  city: string
  building_type: string
  total_area: number | null
  year_built: number | null
  units: UnitInfo[]
}

function useAssignedBuildings() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['caretaker-buildings', user?.id],
    queryFn: async () => {
      const supabase = getSupabase()
      const userId = user!.id

      // Gebaeude finden, die diesem Hausmeister zugewiesen sind
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

      // Gebaeude laden
      const { data: buildings, error } = await supabase
        .from('buildings')
        .select('*')
        .in('id', buildingIds)
        .order('name')

      if (error) throw error
      if (!buildings || buildings.length === 0) return []

      // Einheiten laden
      const { data: units } = await supabase
        .from('units')
        .select('id, unit_number, floor, rooms, area, status, rent_amount, building_id')
        .in('building_id', buildingIds)
        .order('unit_number', { ascending: true })

      const unitsByBuilding = new Map<string, UnitInfo[]>()
      for (const u of units ?? []) {
        const bId = (u as Record<string, unknown>).building_id as string
        if (!unitsByBuilding.has(bId)) {
          unitsByBuilding.set(bId, [])
        }
        unitsByBuilding.get(bId)!.push({
          id: u.id,
          unit_number: u.unit_number,
          floor: u.floor,
          rooms: u.rooms,
          area: u.area,
          status: u.status,
          rent_amount: u.rent_amount,
        })
      }

      return buildings.map((b: Record<string, unknown>): BuildingWithUnits => ({
        id: b.id as string,
        name: b.name as string,
        address: b.address as string,
        postal_code: b.postal_code as string,
        city: b.city as string,
        building_type: b.building_type as string,
        total_area: b.total_area as number | null,
        year_built: b.year_built as number | null,
        units: unitsByBuilding.get(b.id as string) ?? [],
      }))
    },
    enabled: !!user?.id,
  })
}

const typeLabels: Record<string, string> = {
  apartment: 'Mehrfamilienhaus',
  house: 'Einfamilienhaus',
  commercial: 'Gewerbe',
  mixed: 'Gemischt',
}

const statusLabels: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'secondary' }> = {
  rented: { label: 'Vermietet', variant: 'success' },
  vacant: { label: 'Leerstand', variant: 'warning' },
  reserved: { label: 'Reserviert', variant: 'secondary' },
  maintenance: { label: 'Instandhaltung', variant: 'default' },
}

function BuildingCard({ building }: { building: BuildingWithUnits }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card>
      <CardContent className="p-4">
        {/* Gebaeude-Info */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-orange-500" />
            <h3 className="font-semibold">{building.name}</h3>
          </div>
          <Badge variant="secondary">{typeLabels[building.building_type] ?? building.building_type}</Badge>
        </div>

        <div className="flex items-center gap-1 mt-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{building.address}, {building.postal_code} {building.city}</span>
        </div>

        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Home className="h-3 w-3" />
            {building.units.length} Einheiten
          </span>
          {building.total_area && <span>{building.total_area} m²</span>}
          {building.year_built && <span>Bj. {building.year_built}</span>}
        </div>

        {/* Einheiten aufklappen */}
        {building.units.length > 0 && (
          <>
            <Separator className="my-3" />
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-sm text-primary hover:underline w-full justify-center"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Einheiten ausblenden
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  {building.units.length} Einheiten anzeigen
                </>
              )}
            </button>

            {expanded && (
              <div className="mt-3 space-y-2">
                {building.units.map((unit) => {
                  const statusConf = statusLabels[unit.status] ?? statusLabels.vacant
                  return (
                    <div key={unit.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">Einheit {unit.unit_number}</span>
                        {unit.floor !== null && (
                          <span className="text-xs text-muted-foreground">{unit.floor}. OG</span>
                        )}
                        {unit.rooms !== null && (
                          <span className="text-xs text-muted-foreground">{unit.rooms} Zimmer</span>
                        )}
                        {unit.area !== null && (
                          <span className="text-xs text-muted-foreground">{unit.area} m²</span>
                        )}
                      </div>
                      <Badge variant={statusConf.variant as 'default'} className="text-[10px]">
                        {statusConf.label}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default function BuildingsPage() {
  const [search, setSearch] = useState('')
  const { data: buildings, isLoading } = useAssignedBuildings()

  const filtered = (buildings ?? []).filter((b) =>
    !search ||
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.address.toLowerCase().includes(search.toLowerCase()) ||
    b.city.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gebaeude</h1>
        <p className="text-muted-foreground">Zugewiesene Gebaeude und Einheiten (nur Ansicht)</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Suche nach Name, Adresse oder Stadt..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-8 w-8" />}
          title={search ? 'Keine Ergebnisse' : 'Keine zugewiesenen Gebaeude'}
          description={search ? 'Versuche einen anderen Suchbegriff.' : 'Dir wurden noch keine Gebaeude ueber Auftraege zugewiesen.'}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((building) => (
            <BuildingCard key={building.id} building={building} />
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          {filtered.length} Gebaeude{filtered.length !== 1 ? '' : ''} zugewiesen
        </p>
      )}
    </div>
  )
}
