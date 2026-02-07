import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Users, Search } from 'lucide-react'

export function Tenants() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mieter</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Mieter und Mietverhältnisse
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Neuer Mieter
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Mieter suchen..." className="pl-10" />
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Keine Mieter vorhanden</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Fügen Sie Ihren ersten Mieter hinzu.
          </p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Mieter hinzufügen
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
