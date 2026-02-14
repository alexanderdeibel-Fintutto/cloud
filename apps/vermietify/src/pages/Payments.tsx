import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, CreditCard } from 'lucide-react'

export function Payments() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Zahlungen</h1>
          <p className="text-muted-foreground">
            Überwachen Sie Mieteingänge und Ausgaben
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Zahlung erfassen
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Keine Zahlungen vorhanden</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Erfassen Sie Ihre erste Zahlung.
          </p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Zahlung hinzufügen
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
