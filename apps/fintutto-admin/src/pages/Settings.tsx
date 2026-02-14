import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'

export function Settings() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Einstellungen</h1>
        <p className="text-muted-foreground">Verwalten Sie Ihre Admin-Einstellungen</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
          <CardDescription>Ihre Kontoinformationen</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            <span className="text-muted-foreground">E-Mail:</span>{' '}
            <span className="font-medium">{user?.email}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
