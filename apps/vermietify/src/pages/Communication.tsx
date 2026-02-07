import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Mail } from 'lucide-react'

export function Communication() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kommunikation</h1>
          <p className="text-muted-foreground">
            E-Mails und Briefe an Mieter versenden
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Neue Nachricht
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Mail className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Keine Nachrichten vorhanden</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Starten Sie Ihre erste Kommunikation.
          </p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nachricht erstellen
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
