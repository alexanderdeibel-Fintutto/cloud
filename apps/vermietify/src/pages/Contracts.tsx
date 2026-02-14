import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FileText } from 'lucide-react'

export function Contracts() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mietverträge</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Mietverträge
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Neuer Vertrag
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Keine Verträge vorhanden</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Erstellen Sie Ihren ersten Mietvertrag.
          </p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Vertrag erstellen
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
