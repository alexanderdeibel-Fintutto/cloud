import { Settings, User, Bell, Shield, Palette, Database, LogOut } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'

export default function SettingsPage() {
  const { user, signOut } = useAuth()

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Einstellungen
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Verwalte dein SecondBrain-Konto
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4" />
            Profil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">E-Mail</label>
            <p className="text-sm">{user?.email || 'Nicht angemeldet'}</p>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Konto</p>
              <p className="text-xs text-muted-foreground">Verwalte dein Konto und deine Daten</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              <LogOut className="w-4 h-4 mr-2" />
              Abmelden
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Benachrichtigungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Benachrichtigungseinstellungen werden bald verfügbar sein.
          </p>
        </CardContent>
      </Card>

      {/* Storage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="w-4 h-4" />
            Speicher
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Speichernutzung und Limits werden hier angezeigt.
          </p>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Gefahrenzone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Alle Daten löschen</p>
              <p className="text-xs text-muted-foreground">
                Alle Dokumente und Chats unwiderruflich löschen
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Daten löschen
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
