import { useAuth, useAppConfig } from '@fintutto/core'
import { Button, Card, CardHeader, CardTitle, CardContent, Separator, Badge } from '@fintutto/ui'

export default function SettingsPage() {
  const { profile, signOut } = useAuth()
  const config = useAppConfig()

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Einstellungen</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Name</span>
            <span className="text-sm font-medium">{profile?.name ?? 'Nicht angegeben'}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">E-Mail</span>
            <span className="text-sm font-medium">{profile?.email}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Rolle</span>
            <Badge>{profile?.role ?? config.defaultRole}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">App-Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">App</span>
            <span className="text-sm font-medium">{config.displayName}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Version</span>
            <span className="text-sm font-medium">{config.version}</span>
          </div>
        </CardContent>
      </Card>

      <Button variant="destructive" onClick={signOut} className="w-full">
        Abmelden
      </Button>
    </div>
  )
}
