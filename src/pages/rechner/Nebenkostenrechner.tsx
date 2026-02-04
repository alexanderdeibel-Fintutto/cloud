import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Calculator, Info, Home } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

interface Betriebskostenart {
  id: string
  name: string
  typischProQm: number // € pro m² pro Jahr
  beschreibung: string
}

const BETRIEBSKOSTENARTEN: Betriebskostenart[] = [
  { id: 'grundsteuer', name: 'Grundsteuer', typischProQm: 0.20, beschreibung: 'Kommunale Steuer auf Grundbesitz' },
  { id: 'wasser', name: 'Wasser & Abwasser', typischProQm: 0.35, beschreibung: 'Kaltwasser, Entwässerung' },
  { id: 'heizung', name: 'Heizung & Warmwasser', typischProQm: 1.20, beschreibung: 'Brennstoff, Wartung, Betriebsstrom' },
  { id: 'aufzug', name: 'Aufzug', typischProQm: 0.15, beschreibung: 'Betrieb, Wartung, TÜV' },
  { id: 'strassenreinigung', name: 'Straßenreinigung', typischProQm: 0.05, beschreibung: 'Kommunale Gebühren' },
  { id: 'muellabfuhr', name: 'Müllabfuhr', typischProQm: 0.25, beschreibung: 'Entsorgungsgebühren' },
  { id: 'hausreinigung', name: 'Hausreinigung', typischProQm: 0.20, beschreibung: 'Treppenhaus, Flure' },
  { id: 'gartenpflege', name: 'Gartenpflege', typischProQm: 0.10, beschreibung: 'Grünanlagen, Rasen' },
  { id: 'beleuchtung', name: 'Allgemeinstrom', typischProQm: 0.05, beschreibung: 'Treppenhaus, Außenbeleuchtung' },
  { id: 'schornsteinfeger', name: 'Schornsteinfeger', typischProQm: 0.05, beschreibung: 'Kehr- und Prüfgebühren' },
  { id: 'versicherung', name: 'Versicherungen', typischProQm: 0.20, beschreibung: 'Gebäude, Haftpflicht, etc.' },
  { id: 'hauswart', name: 'Hauswart', typischProQm: 0.30, beschreibung: 'Hausmeisterdienste' },
  { id: 'kabel', name: 'Kabelanschluss', typischProQm: 0.15, beschreibung: 'Antenne, Kabel-TV' },
  { id: 'sonstige', name: 'Sonstige', typischProQm: 0.10, beschreibung: 'Weitere umlagefähige Kosten' },
]

export default function NebenkostenRechnerPage() {
  const [wohnflaeche, setWohnflaeche] = React.useState<number | null>(null)
  const [selectedKosten, setSelectedKosten] = React.useState<string[]>([
    'grundsteuer', 'wasser', 'heizung', 'muellabfuhr', 'hausreinigung',
    'beleuchtung', 'versicherung'
  ])

  const toggleKostenart = (id: string) => {
    setSelectedKosten(prev =>
      prev.includes(id)
        ? prev.filter(k => k !== id)
        : [...prev, id]
    )
  }

  // Berechnung
  const berechnung = React.useMemo(() => {
    if (!wohnflaeche) return null

    const details = BETRIEBSKOSTENARTEN
      .filter(k => selectedKosten.includes(k.id))
      .map(k => ({
        ...k,
        jahresbetrag: k.typischProQm * wohnflaeche,
        monatsbetrag: (k.typischProQm * wohnflaeche) / 12
      }))

    const jahresGesamt = details.reduce((sum, k) => sum + k.jahresbetrag, 0)
    const monatsGesamt = jahresGesamt / 12
    const proQmJahr = wohnflaeche > 0 ? jahresGesamt / wohnflaeche : 0

    return {
      details,
      jahresGesamt,
      monatsGesamt,
      proQmJahr
    }
  }, [wohnflaeche, selectedKosten])

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Zurück zur Übersicht
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calculator className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Nebenkostenrechner</h1>
              <p className="text-muted-foreground">
                Schätzen Sie die monatliche Nebenkostenvorauszahlung
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Eingabe */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Wohnungsdaten</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-w-xs">
                  <Label htmlFor="wohnflaeche">Wohnfläche (m²)</Label>
                  <div className="relative mt-1">
                    <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="wohnflaeche"
                      type="number"
                      min="10"
                      max="500"
                      value={wohnflaeche || ''}
                      onChange={(e) => setWohnflaeche(parseFloat(e.target.value) || null)}
                      placeholder="z.B. 65"
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Betriebskostenarten</CardTitle>
                <CardDescription>
                  Wählen Sie die anfallenden Kostenarten aus
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {BETRIEBSKOSTENARTEN.map((kostenart) => (
                    <div
                      key={kostenart.id}
                      className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedKosten.includes(kostenart.id)
                          ? 'bg-primary/5 border-primary/30'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => toggleKostenart(kostenart.id)}
                    >
                      <Checkbox
                        checked={selectedKosten.includes(kostenart.id)}
                        onCheckedChange={() => toggleKostenart(kostenart.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{kostenart.name}</span>
                          <Badge variant="outline" className="text-xs">
                            ~{kostenart.typischProQm.toFixed(2)} €/m²
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {kostenart.beschreibung}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ergebnis */}
          <div>
            {berechnung ? (
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-lg">Geschätzte Nebenkosten</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-sm text-muted-foreground">Monatliche Vorauszahlung</p>
                    <p className="text-3xl font-bold text-primary">
                      {formatCurrency(berechnung.monatsGesamt)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      ({formatCurrency(berechnung.proQmJahr)}/m² p.a.)
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Jahresbetrag:</span>
                    <span className="font-medium">{formatCurrency(berechnung.jahresGesamt)}</span>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Aufschlüsselung:</p>
                    {berechnung.details.map((k) => (
                      <div key={k.id} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{k.name}:</span>
                        <span>{formatCurrency(k.monatsbetrag)}/Monat</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground py-8">
                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Geben Sie die Wohnfläche ein</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="mt-6 bg-yellow-50 border-yellow-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-2 text-sm text-yellow-800">
                  <Info className="h-4 w-4 mt-0.5" />
                  <div>
                    <p className="font-medium">Hinweis</p>
                    <p className="text-yellow-600">
                      Dies ist eine Schätzung basierend auf Durchschnittswerten.
                      Die tatsächlichen Kosten können je nach Region, Gebäude und
                      Verbrauch erheblich abweichen.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
