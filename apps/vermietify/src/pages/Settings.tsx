import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/useAuth'

export function Settings() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Einstellungen</h1>
        <p className="text-muted-foreground">
          Verwalten Sie Ihre Kontoeinstellungen
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
          <CardDescription>Ihre persönlichen Daten</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">Vorname</Label>
              <Input id="firstName" placeholder="Vorname" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nachname</Label>
              <Input id="lastName" placeholder="Nachname" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input id="email" type="email" value={user?.email || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input id="phone" placeholder="Telefonnummer" />
            </div>
          </div>
          <Button>Speichern</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Firma</CardTitle>
          <CardDescription>Geschäftliche Informationen für Dokumente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="companyName">Firmenname</Label>
              <Input id="companyName" placeholder="Firmenname (optional)" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxId">Steuernummer</Label>
              <Input id="taxId" placeholder="Steuernummer" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="street">Straße + Nr.</Label>
              <Input id="street" placeholder="Straße und Hausnummer" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">PLZ + Stadt</Label>
              <Input id="city" placeholder="PLZ und Stadt" />
            </div>
          </div>
          <Button>Speichern</Button>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Abonnement</CardTitle>
          <CardDescription>Ihr aktueller Plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Free Plan</p>
              <p className="text-sm text-muted-foreground">Bis zu 3 Immobilien</p>
            </div>
            <Button variant="outline">Upgrade</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
