import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FolderOpen } from 'lucide-react'

export function Documents() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dokumente</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Dokumente und Dateien
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Dokument hochladen
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Keine Dokumente vorhanden</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Laden Sie Ihr erstes Dokument hoch.
          </p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Dokument hochladen
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
