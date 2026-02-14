import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Gauge } from 'lucide-react'

export function Meters() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Zähler</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Zählerstände für Strom, Gas, Wasser
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Neuer Zähler
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Gauge className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Keine Zähler vorhanden</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Fügen Sie Ihren ersten Zähler hinzu.
          </p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Zähler hinzufügen
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
