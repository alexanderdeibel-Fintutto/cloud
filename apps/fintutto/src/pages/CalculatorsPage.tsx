import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@fintutto/ui'
import { Calculator, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const calculators = [
  { id: 'kaution', name: 'Kautions-Rechner', description: 'Maximale Kaution nach BGB berechnen' },
  { id: 'mieterhoehung', name: 'Mieterhöhungs-Rechner', description: 'Zulässige Mieterhöhung prüfen' },
  { id: 'kaufnebenkosten', name: 'Kaufnebenkosten-Rechner', description: 'Alle Kaufnebenkosten im Überblick' },
  { id: 'eigenkapital', name: 'Eigenkapital-Rechner', description: 'Eigenkapitalbedarf ermitteln' },
  { id: 'grundsteuer', name: 'Grundsteuer-Rechner', description: 'Grundsteuer nach Bundesland berechnen' },
  { id: 'rendite', name: 'Rendite-Rechner', description: 'Brutto-/Netto-Rendite berechnen' },
  { id: 'nebenkosten', name: 'Nebenkosten-Rechner', description: 'Nebenkosten-Vorauszahlung kalkulieren' },
]

export default function CalculatorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Rechner</h1>
        <p className="text-muted-foreground">7 Rechner für Vermieter und Immobilienbesitzer</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {calculators.map((calc) => (
          <Link key={calc.id} to={`/calculators/${calc.id}`}>
            <Card className="group cursor-pointer transition-shadow hover:shadow-md h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calculator className="h-4 w-4 text-primary" />
                  {calc.name}
                </CardTitle>
                <CardDescription>{calc.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="inline-flex items-center gap-1 text-sm text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Starten <ArrowRight className="h-3 w-3" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
