import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Button, Card, CardContent, Input, Label, Badge, Skeleton, EmptyState,
  Separator,
} from '@fintutto/ui'
import { Building2, Plus, Search, MapPin, Home, Trash2, X } from 'lucide-react'
import { useBuildingsList, useCreateBuilding, useDeleteBuilding } from '@/hooks/useBuildings'
import type { BuildingFormData } from '@fintutto/shared'
import { toast } from 'sonner'

function CreateBuildingForm({ onClose }: { onClose: () => void }) {
  const createBuilding = useCreateBuilding()
  const [formData, setFormData] = useState<BuildingFormData>({
    name: '',
    street: '',
    zip: '',
    city: '',
    building_type: 'apartment',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createBuilding.mutateAsync(formData)
      toast.success('Immobilie erfolgreich erstellt')
      onClose()
    } catch {
      toast.error('Fehler beim Erstellen der Immobilie')
    }
  }

  return (
    <Card className="border-primary">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Neue Immobilie</h3>
            <button type="button" onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Bezeichnung</Label>
              <Input
                id="name"
                placeholder="z.B. Musterstraße 10"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="building_type">Typ</Label>
              <select
                id="building_type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.building_type}
                onChange={(e) => setFormData((p) => ({ ...p, building_type: e.target.value as BuildingFormData['building_type'] }))}
              >
                <option value="apartment">Mehrfamilienhaus</option>
                <option value="house">Einfamilienhaus</option>
                <option value="commercial">Gewerbe</option>
                <option value="mixed">Gemischt</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="street">Straße & Nr.</Label>
              <Input
                id="street"
                placeholder="Musterstraße 10"
                value={formData.street}
                onChange={(e) => setFormData((p) => ({ ...p, street: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">PLZ</Label>
              <Input
                id="zip"
                placeholder="10115"
                value={formData.zip}
                onChange={(e) => setFormData((p) => ({ ...p, zip: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Stadt</Label>
              <Input
                id="city"
                placeholder="Berlin"
                value={formData.city}
                onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={createBuilding.isPending}>
              {createBuilding.isPending ? 'Wird erstellt...' : 'Erstellen'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

const typeLabels: Record<string, string> = {
  apartment: 'MFH',
  house: 'EFH',
  commercial: 'Gewerbe',
  mixed: 'Gemischt',
}

export default function PropertiesPage() {
  const [showCreate, setShowCreate] = useState(false)
  const [search, setSearch] = useState('')
  const { data, isLoading } = useBuildingsList()
  const deleteBuilding = useDeleteBuilding()

  const buildings = (data?.buildings ?? []).filter((b) =>
    !search || b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.city.toLowerCase().includes(search.toLowerCase()) ||
    b.address.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" wirklich löschen? Alle zugehörigen Einheiten werden ebenfalls gelöscht.`)) return
    try {
      await deleteBuilding.mutateAsync(id)
      toast.success('Immobilie gelöscht')
    } catch {
      toast.error('Fehler beim Löschen')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Immobilien</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Immobilie hinzufügen
        </Button>
      </div>

      {showCreate && <CreateBuildingForm onClose={() => setShowCreate(false)} />}

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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 rounded-lg" />)}
        </div>
      ) : buildings.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-8 w-8" />}
          title={search ? 'Keine Ergebnisse' : 'Noch keine Immobilien'}
          description={search ? 'Versuche einen anderen Suchbegriff.' : 'Füge deine erste Immobilie hinzu, um zu starten.'}
          action={!search ? (
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Erste Immobilie anlegen
            </Button>
          ) : undefined}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {buildings.map((building) => (
            <Link key={building.id} to={`/properties/${building.id}`}>
              <Card className="group cursor-pointer transition-shadow hover:shadow-md h-full">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold truncate">{building.name}</h3>
                    </div>
                    <Badge variant="secondary">
                      {typeLabels[building.building_type] ?? building.building_type}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{building.address}, {building.postal_code} {building.city}</span>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Home className="h-3.5 w-3.5" />
                      <span>{building.total_area ? `${building.total_area} m²` : '–'}</span>
                    </div>
                    {building.year_built && (
                      <span className="text-xs text-muted-foreground">Bj. {building.year_built}</span>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        handleDelete(building.id, building.name)
                      }}
                      className="p-1 rounded text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {data && data.total > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          {data.total} Immobilie{data.total !== 1 ? 'n' : ''} insgesamt
        </p>
      )}
    </div>
  )
}
