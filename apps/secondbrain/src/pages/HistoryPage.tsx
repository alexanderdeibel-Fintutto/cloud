import { Clock, MessageSquare, FileText, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function HistoryPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="w-6 h-6 text-primary" />
            Verlauf
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Deine letzten Aktivitäten und Chat-Verläufe
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Trash2 className="w-4 h-4 mr-2" />
          Verlauf löschen
        </Button>
      </div>

      {/* Empty State */}
      <Card>
        <CardContent className="p-12 text-center">
          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-1">Kein Verlauf</h3>
          <p className="text-sm text-muted-foreground">
            Deine Aktivitäten werden hier angezeigt, sobald du Dokumente hochlädst oder den KI-Chat nutzt.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
