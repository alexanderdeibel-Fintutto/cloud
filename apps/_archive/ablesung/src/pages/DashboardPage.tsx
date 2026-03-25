import { Link } from 'react-router-dom'
import { ScanLine, FileText, Zap, Flame, Droplets, ThermometerSun, TrendingDown, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

const stats = [
  { label: 'Gescannte Rechnungen', value: '0', icon: ScanLine, color: 'text-primary' },
  { label: 'Erkannte Versorger', value: '0', icon: BarChart3, color: 'text-blue-500' },
  { label: 'Gesamtkosten 2025', value: formatCurrency(0), icon: TrendingDown, color: 'text-orange-500' },
  { label: 'Einsparpotential', value: formatCurrency(0), icon: Zap, color: 'text-green-500' },
]

const energyTypes = [
  { name: 'Strom', icon: Zap, color: 'bg-yellow-100 text-yellow-700', href: '/rechnungen?type=strom' },
  { name: 'Gas', icon: Flame, color: 'bg-orange-100 text-orange-700', href: '/rechnungen?type=gas' },
  { name: 'Wasser', icon: Droplets, color: 'bg-blue-100 text-blue-700', href: '/rechnungen?type=wasser' },
  { name: 'Fernwärme', icon: ThermometerSun, color: 'bg-red-100 text-red-700', href: '/rechnungen?type=fernwaerme' },
]

export default function DashboardPage() {
  return (
    <div>
      {/* Hero */}
      <section className="gradient-energy py-12">
        <div className="container">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Ablesung Dashboard
          </h1>
          <p className="text-white/80 max-w-2xl">
            Versorger-Rechnungen scannen, Verbrauch analysieren und Einsparpotentiale entdecken.
          </p>
          <div className="mt-6">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
              <Link to="/ocr">
                <ScanLine className="h-5 w-5 mr-2" />
                Rechnung scannen
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-8">
        <div className="container">
          <h2 className="text-xl font-bold mb-6">Schnellzugriff</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {energyTypes.map((type) => (
              <Link key={type.name} to={type.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6 text-center">
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${type.color} mb-3`}>
                      <type.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold">{type.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">Rechnungen anzeigen</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-8">
        <div className="container">
          <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScanLine className="h-5 w-5 text-primary" />
                Rechnungs-OCR
              </CardTitle>
              <CardDescription>
                Lade deine Versorger-Rechnung als Bild oder PDF hoch. Unsere OCR-Technologie erkennt
                automatisch Versorger, Verbrauch, Kosten und Zählerstände.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">1</div>
                  <div>
                    <h4 className="font-medium text-sm">Hochladen</h4>
                    <p className="text-xs text-muted-foreground">Bild oder PDF der Rechnung hochladen</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">2</div>
                  <div>
                    <h4 className="font-medium text-sm">Erkennen</h4>
                    <p className="text-xs text-muted-foreground">OCR liest Daten automatisch aus</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">3</div>
                  <div>
                    <h4 className="font-medium text-sm">Analysieren</h4>
                    <p className="text-xs text-muted-foreground">Verbrauch vergleichen & sparen</p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Button asChild>
                  <Link to="/ocr">Jetzt erste Rechnung scannen</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
