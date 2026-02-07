import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Building2, Search } from 'lucide-react'

export function Properties() {
  const [showForm, setShowForm] = useState(false)

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
            <form className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Bezeichnung</Label>
                <Input id="name" placeholder="z.B. Musterstraße 1" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Objekttyp</Label>
                <Input id="type" placeholder="z.B. Mehrfamilienhaus" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="street">Straße</Label>
                <Input id="street" placeholder="Straße" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="houseNumber">Hausnummer</Label>
                <Input id="houseNumber" placeholder="Nr." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">PLZ</Label>
                <Input id="postalCode" placeholder="PLZ" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Stadt</Label>
                <Input id="city" placeholder="Stadt" />
              </div>
              <div className="col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Abbrechen
                </Button>
                <Button type="submit">Speichern</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Immobilien suchen..." className="pl-10" />
        </div>
      </div>

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
    </div>
  )
}
