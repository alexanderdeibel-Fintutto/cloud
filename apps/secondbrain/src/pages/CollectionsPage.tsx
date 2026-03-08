import { FolderOpen, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const defaultCollections = [
  { name: 'Mietvertrag & Wohnung', count: 0, color: 'bg-blue-500/10 text-blue-500' },
  { name: 'Finanzen & Steuern', count: 0, color: 'bg-green-500/10 text-green-500' },
  { name: 'Versicherungen', count: 0, color: 'bg-orange-500/10 text-orange-500' },
  { name: 'Arbeit & Karriere', count: 0, color: 'bg-purple-500/10 text-purple-500' },
  { name: 'Gesundheit', count: 0, color: 'bg-red-500/10 text-red-500' },
  { name: 'Sonstiges', count: 0, color: 'bg-muted text-muted-foreground' },
]

export default function CollectionsPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-primary" />
            Sammlungen
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organisiere deine Dokumente in Sammlungen
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Neue Sammlung
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {defaultCollections.map((col) => (
          <Card key={col.name} className="cursor-pointer hover:border-primary/30 hover:shadow-md transition-all hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className={`w-12 h-12 rounded-xl ${col.color} flex items-center justify-center mb-3`}>
                <FolderOpen className="w-6 h-6" />
              </div>
              <h3 className="font-semibold">{col.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {col.count} {col.count === 1 ? 'Dokument' : 'Dokumente'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
