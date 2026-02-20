import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PiggyBank, Info, ArrowLeft, Calculator, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

interface KautionResult {
  maxKaution: number
  rateProMonat: number
  raten: number
  isValid: boolean
  hinweise: string[]
}

export default function KautionsRechner() {
  const [kaltmiete, setKaltmiete] = useState<string>('')
  const [aktuelleKaution, setAktuelleKaution] = useState<string>('')
  const [result, setResult] = useState<KautionResult | null>(null)

  const berechneKaution = () => {
    const miete = parseFloat(kaltmiete) || 0
    const kaution = parseFloat(aktuelleKaution) || 0

    const maxKaution = miete * 3
    const rateProMonat = miete
    const raten = 3

    const hinweise: string[] = []
    let isValid = true

    if (kaution > maxKaution) {
      isValid = false
      hinweise.push(`Die Kaution von ${formatCurrency(kaution)} überschreitet das Maximum von ${formatCurrency(maxKaution)}.`)
      hinweise.push(`Sie können ${formatCurrency(kaution - maxKaution)} zurückfordern.`)
    } else if (kaution > 0) {
      hinweise.push(`Die Kaution von ${formatCurrency(kaution)} ist im zulässigen Rahmen.`)
    }

    hinweise.push(`Der Mieter kann die Kaution in bis zu 3 Raten zu je ${formatCurrency(rateProMonat)} zahlen.`)
    hinweise.push('Die erste Rate ist zu Beginn des Mietverhältnisses fällig.')

    setResult({
      maxKaution,
      rateProMonat,
      raten,
      isValid,
      hinweise,
    })
  }

  const reset = () => {
    setKaltmiete('')
    setAktuelleKaution('')
    setResult(null)
  }

  return (
    <div>
      {/* Hero */}
      <section className="gradient-vermieter py-12">
        <div className="container">
          <Link
            to="/rechner"
            className="inline-flex items-center gap-1 text-white/80 hover:text-white mb-4 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Alle Rechner
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
              <PiggyBank className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Kautions-Rechner</h1>
              <p className="text-white/80">Berechne die maximale Kaution nach §551 BGB</p>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="py-8">
        <div className="container">
          <div className="grid lg:grid-cols-[1fr_400px] gap-8">
            {/* Input */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Eingaben
                  </CardTitle>
                  <CardDescription>
                    Gib die Nettokaltmiete ein, um die maximale Kaution zu berechnen.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Nettokaltmiete (monatlich) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={kaltmiete}
                        onChange={(e) => setKaltmiete(e.target.value)}
                        placeholder="z.B. 800"
                        className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        €
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ohne Nebenkosten und Heizkosten
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Aktuelle Kaution (optional)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={aktuelleKaution}
                        onChange={(e) => setAktuelleKaution(e.target.value)}
                        placeholder="z.B. 2400"
                        className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        €
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Zum Prüfen, ob die Kaution zulässig ist
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={berechneKaution}
                      disabled={!kaltmiete}
                      className="flex-1 gradient-vermieter text-white"
                    >
                      Berechnen
                    </Button>
                    <Button variant="outline" onClick={reset}>
                      Zurücksetzen
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Info Box */}
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-2">§551 BGB - Begrenzung der Mietsicherheit</h3>
                      <p className="text-sm text-muted-foreground">
                        Die Kaution darf maximal 3 Nettokaltmieten betragen. Der Mieter hat das Recht,
                        die Kaution in 3 gleichen monatlichen Raten zu zahlen. Die erste Rate ist zu
                        Beginn des Mietverhältnisses fällig.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Result */}
            <div className="space-y-6">
              {result ? (
                <>
                  <Card className={result.isValid ? 'border-success/30' : 'border-destructive/30'}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {result.isValid ? (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                        )}
                        Ergebnis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground mb-1">Maximale Kaution</p>
                        <p className="text-4xl font-bold gradient-text-vermieter">
                          {formatCurrency(result.maxKaution)}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          = 3 × {formatCurrency(parseFloat(kaltmiete) || 0)} Kaltmiete
                        </p>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-semibold mb-2">Ratenzahlung möglich</h4>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="bg-muted rounded-lg p-3">
                            <p className="text-lg font-semibold">{formatCurrency(result.rateProMonat)}</p>
                            <p className="text-xs text-muted-foreground">1. Rate (sofort)</p>
                          </div>
                          <div className="bg-muted rounded-lg p-3">
                            <p className="text-lg font-semibold">{formatCurrency(result.rateProMonat)}</p>
                            <p className="text-xs text-muted-foreground">2. Rate</p>
                          </div>
                          <div className="bg-muted rounded-lg p-3">
                            <p className="text-lg font-semibold">{formatCurrency(result.rateProMonat)}</p>
                            <p className="text-xs text-muted-foreground">3. Rate</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Hinweise</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.hinweise.map((hinweis, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                            {hinweis}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="bg-muted/30">
                  <CardContent className="py-12 text-center">
                    <PiggyBank className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Gib die Nettokaltmiete ein und klicke auf "Berechnen"
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
