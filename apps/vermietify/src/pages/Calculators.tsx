import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calculator, TrendingUp, Percent, Home, Receipt, Euro } from 'lucide-react'
import { Link } from 'react-router-dom'

const calculators = [
  {
    name: 'Renditerechner',
    description: 'Berechnen Sie die Rendite Ihrer Immobilie',
    icon: TrendingUp,
    href: '/calculators/rendite',
  },
  {
    name: 'Mieterhöhung',
    description: 'Berechnen Sie zulässige Mieterhöhungen',
    icon: Percent,
    href: '/calculators/mieterhoehung',
  },
  {
    name: 'Kaufnebenkosten',
    description: 'Berechnen Sie Nebenkosten beim Immobilienkauf',
    icon: Home,
    href: '/calculators/kaufnebenkosten',
  },
  {
    name: 'Nebenkostenrechner',
    description: 'Berechnen Sie die Nebenkosten für Ihre Mieter',
    icon: Receipt,
    href: '/calculators/nebenkosten',
  },
  {
    name: 'AfA-Rechner',
    description: 'Berechnen Sie die Abschreibung Ihrer Immobilie',
    icon: Euro,
    href: '/calculators/afa',
  },
]

export function Calculators() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Rechner</h1>
        <p className="text-muted-foreground">
          Nützliche Berechnungstools für Vermieter
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {calculators.map((calc) => (
          <Link key={calc.name} to={calc.href}>
            <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <calc.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{calc.name}</CardTitle>
                    <CardDescription>{calc.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
