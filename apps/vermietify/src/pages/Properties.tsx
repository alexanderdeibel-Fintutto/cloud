import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Building2, Search, Loader2, MapPin, Home, Trash2 } from 'lucide-react'
import { useProperties, useCreateProperty, useDeleteProperty } from '@/hooks/useProperties'
import { toast } from 'sonner'

export function Properties() {
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    name: '',
    property_type: 'apartment_building',
    street: '',
    house_number: '',
    postal_code: '',
    city: '',
  })

  const { data: properties, isLoading } = useProperties()
  const createProperty = useCreateProperty()
  const deleteProperty = useDeleteProperty()

  const filtered = (properties || []).filter((p) =>
    `${p.name} ${p.street} ${p.city}`.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.street || !form.house_number || !form.postal_code || !form.city) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus.')
      return
    }
    try {
      await createProperty.mutateAsync(form)
      toast.success('Immobilie erfolgreich angelegt!')
      setShowForm(false)
      setForm({ name: '', property_type: 'apartment_building', street: '', house_number: '', postal_code: '', city: '' })
    } catch (err: any) {
      toast.error(err.message || 'Fehler beim Anlegen der Immobilie.')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Immobilie "${name}" wirklich löschen?`)) return
    try {
      await deleteProperty.mutateAsync(id)
      toast.success('Immobilie gelöscht.')
    } catch (err: any) {
      toast.error(err.message || 'Fehler beim Löschen.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Immobilien</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Immobilien und Einheiten
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Neue Immobilie
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Neue Immobilie hinzufügen</CardTitle>
            <CardDescription>Geben Sie die Daten Ihrer Immobilie ein</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Bezeichnung *</Label>
                <Input id="name" placeholder="z.B. Musterstraße 1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Objekttyp</Label>
                <select id="type" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.property_type} onChange={(e) => setForm({ ...form, property_type: e.target.value })}>
                  <option value="apartment_building">Mehrfamilienhaus</option>
                  <option value="single_family">Einfamilienhaus</option>
                  <option value="commercial">Gewerbeimmobilie</option>
                  <option value="mixed">Gemischt</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="street">Straße *</Label>
                <Input id="street" placeholder="Straße" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="houseNumber">Hausnummer *</Label>
                <Input id="houseNumber" placeholder="Nr." value={form.house_number} onChange={(e) => setForm({ ...form, house_number: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">PLZ *</Label>
                <Input id="postalCode" placeholder="PLZ" value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Stadt *</Label>
                <Input id="city" placeholder="Stadt" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Abbrechen
                </Button>
                <Button type="submit" disabled={createProperty.isPending}>
                  {createProperty.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Speichern
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Immobilien suchen..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Keine Immobilien vorhanden</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Fügen Sie Ihre erste Immobilie hinzu, um zu starten.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Immobilie hinzufügen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((property) => (
            <Card key={property.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{property.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {property.street} {property.house_number}, {property.postal_code} {property.city}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(property.id, property.name)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Home className="h-4 w-4" />
                    {(property as any).units?.length || 0} Einheiten
                  </div>
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {property.property_type === 'apartment_building' ? 'MFH' :
                     property.property_type === 'single_family' ? 'EFH' :
                     property.property_type === 'commercial' ? 'Gewerbe' : 'Gemischt'}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
