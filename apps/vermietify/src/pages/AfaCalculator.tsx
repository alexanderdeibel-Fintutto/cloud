import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calculator, Euro, Building2, Calendar, Info, CheckCircle2, TrendingDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { berechneAfa, type AfaInput, type AfaResult, type Country, COUNTRY_LABELS } from '@/lib/tax'

export function AfaCalculator() {
  const [country, setCountry] = useState<Country>('DE')
  const [anschaffungskosten, setAnschaffungskosten] = useState('')
  const [grundstuecksanteil, setGrundstuecksanteil] = useState('25')
  const [baujahr, setBaujahr] = useState('')
  const [kaufdatum, setKaufdatum] = useState('')
  const [denkmalschutz, setDenkmalschutz] = useState(false)
  const [sanierungsgebiet, setSanierungsgebiet] = useState(false)
  const [result, setResult] = useState<AfaResult | null>(null)

  const berechnen = () => {
    const input: AfaInput = {
      anschaffungskosten: parseFloat(anschaffungskosten) || 0,
      grundstuecksanteil: parseFloat(grundstuecksanteil) || 25,
      baujahr: parseInt(baujahr) || 2000,
      kaufdatum: kaufdatum || new Date().toISOString().split('T')[0],
      country,
      denkmalschutz,
      sanierungsgebiet,
    }
    setResult(berechneAfa(input))
  }

  const reset = () => {
    setAnschaffungskosten('')
    setGrundstuecksanteil('25')
    setBaujahr('')
    setKaufdatum('')
    setDenkmalschutz(false)
    setSanierungsgebiet(false)
    setResult(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AfA-Rechner</h1>
        <p className="text-muted-foreground">
          Abschreibung für Abnutzung - Gebäudeabschreibung berechnen
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        <div className="space-y-6">
          {/* Country */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5" />
                Land & Objektdaten
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {(['DE', 'AT', 'CH'] as Country[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCountry(c)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      country === c ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {COUNTRY_LABELS[c]}
                  </button>
                ))}
              </div>

              <div>
                <Label>Anschaffungskosten (inkl. Nebenkosten) *</Label>
                <div className="relative mt-1">
                  <Input
                    type="number"
                    value={anschaffungskosten}
                    onChange={(e) => setAnschaffungskosten(e.target.value)}
                    placeholder="z.B. 350000"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Kaufpreis + Grunderwerbsteuer + Notar + Makler</p>
              </div>

              <div>
                <Label>Grundstücksanteil (%)</Label>
                <div className="relative mt-1">
                  <Input
                    type="number"
                    value={grundstuecksanteil}
                    onChange={(e) => setGrundstuecksanteil(e.target.value)}
                    placeholder="25"
                    min="0"
                    max="100"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Nicht abschreibbar. Typisch: 20-30% (Wohnung) bis 40% (EFH)</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Baujahr *</Label>
                  <Input
                    type="number"
                    value={baujahr}
                    onChange={(e) => setBaujahr(e.target.value)}
                    placeholder="z.B. 1985"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Kaufdatum</Label>
                  <Input
                    type="date"
                    value={kaufdatum}
                    onChange={(e) => setKaufdatum(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={denkmalschutz}
                    onChange={(e) => setDenkmalschutz(e.target.checked)}
                    className="h-4 w-4 rounded border-input"
                  />
                  <div>
                    <span className="text-sm font-medium">Denkmalschutz</span>
                    <p className="text-xs text-muted-foreground">Erhöhte AfA nach § 7i EStG</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sanierungsgebiet}
                    onChange={(e) => setSanierungsgebiet(e.target.checked)}
                    className="h-4 w-4 rounded border-input"
                  />
                  <div>
                    <span className="text-sm font-medium">Sanierungsgebiet</span>
                    <p className="text-xs text-muted-foreground">Erhöhte AfA nach § 7h EStG</p>
                  </div>
                </label>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button onClick={berechnen} className="flex-1" disabled={!anschaffungskosten || !baujahr}>
              <Calculator className="h-4 w-4 mr-2" />
              AfA berechnen
            </Button>
            <Button variant="outline" onClick={reset}>Zurücksetzen</Button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {result ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingDown className="h-5 w-5" />
                    AfA-Ergebnis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">Jährliche Abschreibung</p>
                    <p className="text-3xl font-bold text-primary">{formatCurrency(result.jaehrlicheAfa)}</p>
                    <p className="text-sm text-muted-foreground">= {formatCurrency(result.monatlicheAfa)} / Monat</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted rounded-lg p-3 text-center">
                      <p className="text-lg font-bold">{result.afaSatz}%</p>
                      <p className="text-xs text-muted-foreground">AfA-Satz</p>
                    </div>
                    <div className="bg-muted rounded-lg p-3 text-center">
                      <p className="text-lg font-bold">{result.gesamtAfaDauer} J.</p>
                      <p className="text-xs text-muted-foreground">Gesamtdauer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bemessungsgrundlage</span>
                    <span className="font-medium">{formatCurrency(result.bemessungsgrundlage)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bisher abgeschrieben</span>
                    <span>{formatCurrency(result.bisherAbgeschrieben)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Restbuchwert</span>
                    <span className="font-medium">{formatCurrency(result.restbuchwert)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Restlaufzeit</span>
                    <span>{result.restlaufzeit} Jahre</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold text-green-600">
                    <span>Steuerersparnis/Jahr</span>
                    <span>ca. {formatCurrency(result.steuerersparnis)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">(bei 42% Grenzsteuersatz)</p>
                </CardContent>
              </Card>

              {result.hinweise.length > 0 && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Info className="h-4 w-4 text-blue-600" />
                      Hinweise
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.hinweise.map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="bg-muted/30">
              <CardContent className="py-12 text-center">
                <Euro className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">
                  Gib die Objektdaten ein, um die AfA zu berechnen
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <h4 className="font-semibold text-sm mb-2">AfA-Sätze im Überblick</h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>DE Standard (ab 1925)</span>
                  <span className="font-medium">2,0% / 50 Jahre</span>
                </div>
                <div className="flex justify-between">
                  <span>DE Neubau (ab 2023)</span>
                  <span className="font-medium text-green-600">3,0% / 33 Jahre</span>
                </div>
                <div className="flex justify-between">
                  <span>DE Altbau (vor 1925)</span>
                  <span className="font-medium">2,5% / 40 Jahre</span>
                </div>
                <div className="flex justify-between">
                  <span>DE Denkmalschutz</span>
                  <span className="font-medium text-green-600">9,0% / 12 Jahre</span>
                </div>
                <div className="flex justify-between">
                  <span>AT Standard</span>
                  <span className="font-medium">1,5% / 67 Jahre</span>
                </div>
                <div className="flex justify-between">
                  <span>CH Standard</span>
                  <span className="font-medium">2,0% / 50 Jahre</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
