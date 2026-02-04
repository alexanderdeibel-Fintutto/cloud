import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Shield, Info, Euro } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils'

export default function KautionsRechnerPage() {
  const [kaltmiete, setKaltmiete] = React.useState<number | null>(null)
  const [gezahlteKaution, setGezahlteKaution] = React.useState<number | null>(null)
  const [mietdauerJahre, setMietdauerJahre] = React.useState<number>(1)
  const [zinssatz, setZinssatz] = React.useState<number>(0.5)

  // Berechnungen
  const maxKaution = kaltmiete ? kaltmiete * 3 : 0
  const einzelrate = kaltmiete ? kaltmiete : 0

  // Zinsberechnung (vereinfacht)
  const berechneZinsen = () => {
    if (!gezahlteKaution || mietdauerJahre <= 0) return 0
    // Einfache Zinsberechnung (ohne Zinseszins, wie oft bei Kautionskonten)
    return gezahlteKaution * (zinssatz / 100) * mietdauerJahre
  }

  const zinsen = berechneZinsen()
  const rueckzahlung = (gezahlteKaution || 0) + zinsen

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
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Kautionsrechner</h1>
              <p className="text-muted-foreground">
                Maximale Kaution und Rückzahlung mit Zinsen berechnen
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Eingabe */}
          <div className="space-y-6">
            {/* Maximale Kaution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Maximale Kaution berechnen</CardTitle>
                <CardDescription>
                  Nach § 551 BGB darf die Kaution maximal 3 Kaltmieten betragen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="kaltmiete">Monatliche Kaltmiete (€)</Label>
                  <div className="relative mt-1">
                    <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="kaltmiete"
                      type="number"
                      min="0"
                      step="0.01"
                      value={kaltmiete || ''}
                      onChange={(e) => setKaltmiete(parseFloat(e.target.value) || null)}
                      placeholder="z.B. 750"
                      className="pl-10"
                    />
                  </div>
                </div>

                {kaltmiete && (
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Maximale Kaution</p>
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(maxKaution)}
                        </p>
                        <p className="text-xs text-muted-foreground">= 3 × Kaltmiete</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Ratenzahlung möglich</p>
                        <p className="text-lg font-medium">3 × {formatCurrency(einzelrate)}</p>
                        <p className="text-xs text-muted-foreground">
                          1. Rate bei Einzug
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rückzahlung mit Zinsen */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rückzahlung berechnen</CardTitle>
                <CardDescription>
                  Kaution inkl. Zinsen bei Auszug
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="gezahlteKaution">Gezahlte Kaution (€)</Label>
                  <div className="relative mt-1">
                    <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="gezahlteKaution"
                      type="number"
                      min="0"
                      step="0.01"
                      value={gezahlteKaution || ''}
                      onChange={(e) => setGezahlteKaution(parseFloat(e.target.value) || null)}
                      placeholder="z.B. 2250"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mietdauer">Mietdauer (Jahre)</Label>
                    <Input
                      id="mietdauer"
                      type="number"
                      min="1"
                      max="50"
                      value={mietdauerJahre}
                      onChange={(e) => setMietdauerJahre(parseInt(e.target.value) || 1)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zinssatz">Zinssatz p.a. (%)</Label>
                    <Input
                      id="zinssatz"
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={zinssatz}
                      onChange={(e) => setZinssatz(parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                </div>

                {gezahlteKaution && (
                  <div className="space-y-3">
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Eingezahlte Kaution:</span>
                      <span>{formatCurrency(gezahlteKaution)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Zinsen ({mietdauerJahre} Jahre à {zinssatz}%):
                      </span>
                      <span className="text-green-600">+ {formatCurrency(zinsen)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Rückzahlung gesamt:</span>
                      <span className="text-xl font-bold text-primary">
                        {formatCurrency(rueckzahlung)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Infos */}
          <div className="space-y-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Gesetzliche Regelungen (§ 551 BGB)</p>
                    <ul className="list-disc list-inside text-blue-600 mt-2 space-y-2">
                      <li>
                        <strong>Maximalhöhe:</strong> Die Kaution darf höchstens das Dreifache
                        der monatlichen Miete (ohne Betriebskosten) betragen.
                      </li>
                      <li>
                        <strong>Ratenzahlung:</strong> Der Mieter darf die Kaution in drei
                        gleichen Monatsraten zahlen. Die erste Rate ist zu Beginn des
                        Mietverhältnisses fällig.
                      </li>
                      <li>
                        <strong>Anlage:</strong> Die Kaution muss getrennt vom Vermögen des
                        Vermieters angelegt werden (Mietkautionskonto).
                      </li>
                      <li>
                        <strong>Verzinsung:</strong> Die Zinsen stehen dem Mieter zu und
                        erhöhen die Kaution.
                      </li>
                      <li>
                        <strong>Rückzahlung:</strong> Nach Beendigung des Mietverhältnisses
                        mit angemessener Prüffrist (ca. 3-6 Monate).
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Kautionsarten</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium">Barkaution / Überweisung</p>
                    <p className="text-sm text-muted-foreground">
                      Klassische Variante: Überweisung auf ein separates Mietkautionskonto.
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="font-medium">Sparbuch</p>
                    <p className="text-sm text-muted-foreground">
                      Der Mieter eröffnet ein Sparbuch und verpfändet es an den Vermieter.
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="font-medium">Bankbürgschaft</p>
                    <p className="text-sm text-muted-foreground">
                      Eine Bank bürgt für den Mieter. Oft mit jährlichen Gebühren verbunden.
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="font-medium">Kautionsversicherung</p>
                    <p className="text-sm text-muted-foreground">
                      Monatliche Prämie statt Einmalzahlung. Befreit Liquidität, aber
                      kein Vermögensaufbau.
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
