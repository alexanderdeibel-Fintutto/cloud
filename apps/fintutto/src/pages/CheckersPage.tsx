import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@fintutto/ui'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const checkers = [
  { id: 'mietpreisbremse', name: 'Mietpreisbremse', description: 'Verstoß gegen Mietpreisbremse prüfen' },
  { id: 'mieterhoehung', name: 'Mieterhöhung', description: 'Rechtmäßigkeit einer Mieterhöhung prüfen' },
  { id: 'nebenkosten', name: 'Nebenkosten', description: 'Nebenkostenabrechnung prüfen' },
  { id: 'betriebskosten', name: 'Betriebskosten', description: 'Betriebskostenabrechnung analysieren' },
  { id: 'kuendigung', name: 'Kündigung', description: 'Rechtmäßigkeit einer Kündigung prüfen' },
  { id: 'kaution', name: 'Kaution', description: 'Kautionsansprüche prüfen' },
  { id: 'mietminderung', name: 'Mietminderung', description: 'Anspruch auf Mietminderung prüfen' },
  { id: 'eigenbedarf', name: 'Eigenbedarf', description: 'Eigenbedarfskündigung prüfen' },
  { id: 'modernisierung', name: 'Modernisierung', description: 'Modernisierungsmaßnahmen prüfen' },
  { id: 'schoenheitsreparaturen', name: 'Schönheitsreparaturen', description: 'Pflicht zu Schönheitsreparaturen prüfen' },
]

export default function CheckersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Checker</h1>
        <p className="text-muted-foreground">10 Checker für Mieter und Vermieter</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {checkers.map((checker) => (
          <Link key={checker.id} to={`/checkers/${checker.id}`}>
            <Card className="group cursor-pointer transition-shadow hover:shadow-md h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  {checker.name}
                </CardTitle>
                <CardDescription>{checker.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="inline-flex items-center gap-1 text-sm text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Prüfen <ArrowRight className="h-3 w-3" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
