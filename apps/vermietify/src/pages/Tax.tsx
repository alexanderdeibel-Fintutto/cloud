import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Receipt, TrendingDown, Lightbulb, Calculator, CheckCircle2,
  AlertTriangle, Info, Euro, Building2
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import {
  berechneSteuer, berechneAnlageV,
  type Country, type AnlageV, type TaxConfig, type TaxResult,
  COUNTRY_LABELS,
} from '@/lib/tax'

const defaultAnlageV: AnlageV = {
  mieteinnahmen: 0, nebenkostenVorauszahlungen: 0, sonstigeEinnahmen: 0,
  schuldzinsen: 0, abschreibung: 0, erhaltungsaufwand: 0,
  grundsteuer: 0, versicherungen: 0, hausverwaltung: 0,
  fahrtkosten: 0, sonstigeWerbungskosten: 0,
  umlagenVereinnahmt: 0, umlagenBezahlt: 0,
}

export default function Tax() {
  const [country, setCountry] = useState<Country>('DE')
  const [filingStatus, setFilingStatus] = useState<'single' | 'married_joint'>('single')
  const [taxableIncome, setTaxableIncome] = useState('')
  const [anlageV, setAnlageV] = useState<AnlageV>(defaultAnlageV)
  const [result, setResult] = useState<TaxResult | null>(null)

  const updateField = (field: keyof AnlageV, value: string) => {
    setAnlageV((prev) => ({ ...prev, [field]: parseFloat(value) || 0 }))
  }

  const berechnen = () => {
    const config: TaxConfig = {
      country,
      year: 2025,
      taxableIncome: parseFloat(taxableIncome) || 0,
      filingStatus,
    }
    setResult(berechneSteuer(config, anlageV))
  }

  const reset = () => {
    setAnlageV(defaultAnlageV)
    setTaxableIncome('')
    setResult(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Steuersystem</h1>
        <p className="text-muted-foreground">
          Anlage V - Einkünfte aus Vermietung und Verpachtung ({COUNTRY_LABELS[country]})
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        <div className="space-y-6">
          {/* Country & Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5" />
                Grunddaten
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
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFilingStatus('single')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filingStatus === 'single' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  Einzelveranlagung
                </button>
                <button
                  onClick={() => setFilingStatus('married_joint')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filingStatus === 'married_joint' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  Zusammenveranlagung
                </button>
              </div>
              <div>
                <Label>Zu versteuerndes Einkommen (ohne V+V)</Label>
                <div className="relative mt-1">
                  <Input
                    type="number"
                    value={taxableIncome}
                    onChange={(e) => setTaxableIncome(e.target.value)}
                    placeholder="z.B. 50000"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Einnahmen */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Euro className="h-5 w-5 text-green-600" />
                Einnahmen (Anlage V)
              </CardTitle>
              <CardDescription>Mieteinnahmen und sonstige Erträge</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {([
                { field: 'mieteinnahmen' as const, label: 'Kaltmiete (jährlich)', hint: 'Zeile 9' },
                { field: 'nebenkostenVorauszahlungen' as const, label: 'Nebenkosten-Vorauszahlungen', hint: 'Zeile 13' },
                { field: 'sonstigeEinnahmen' as const, label: 'Sonstige Einnahmen', hint: 'z.B. Garagen, Stellplätze' },
              ]).map(({ field, label, hint }) => (
                <div key={field}>
                  <Label className="flex items-center justify-between">
                    {label}
                    <span className="text-xs text-muted-foreground font-normal">{hint}</span>
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      type="number"
                      value={anlageV[field] || ''}
                      onChange={(e) => updateField(field, e.target.value)}
                      placeholder="0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Werbungskosten */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingDown className="h-5 w-5 text-red-600" />
                Werbungskosten
              </CardTitle>
              <CardDescription>Absetzbare Kosten für die Immobilie</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {([
                { field: 'schuldzinsen' as const, label: 'Schuldzinsen (Kreditzinsen)', hint: 'Zeile 37' },
                { field: 'abschreibung' as const, label: 'AfA (Abschreibung)', hint: 'Zeile 33' },
                { field: 'erhaltungsaufwand' as const, label: 'Erhaltungsaufwand', hint: 'Reparaturen, Instandhaltung' },
                { field: 'grundsteuer' as const, label: 'Grundsteuer', hint: 'Zeile 46' },
                { field: 'versicherungen' as const, label: 'Versicherungen', hint: 'Gebäude-, Haftpflicht-' },
                { field: 'hausverwaltung' as const, label: 'Hausverwaltung', hint: 'Verwaltungskosten' },
                { field: 'fahrtkosten' as const, label: 'Fahrtkosten zum Objekt', hint: '0,30€/km' },
                { field: 'sonstigeWerbungskosten' as const, label: 'Sonstige Werbungskosten', hint: 'Zeile 50' },
              ]).map(({ field, label, hint }) => (
                <div key={field}>
                  <Label className="flex items-center justify-between">
                    {label}
                    <span className="text-xs text-muted-foreground font-normal">{hint}</span>
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      type="number"
                      value={anlageV[field] || ''}
                      onChange={(e) => updateField(field, e.target.value)}
                      placeholder="0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button onClick={berechnen} className="flex-1" disabled={!taxableIncome}>
              <Calculator className="h-4 w-4 mr-2" />
              Steuer berechnen
            </Button>
            <Button variant="outline" onClick={reset}>Zurücksetzen</Button>
          </div>
        </div>

        {/* Results Sidebar */}
        <div className="space-y-6">
          {result ? (
            <>
              {/* Summary */}
              <Card className={result.einkuenfteVuV < 0 ? 'border-green-200' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Receipt className="h-5 w-5" />
                    Ergebnis Anlage V
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Einnahmen</span>
                      <span className="text-green-600 font-medium">{formatCurrency(result.einnahmenGesamt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Werbungskosten</span>
                      <span className="text-red-600 font-medium">-{formatCurrency(result.werbungskostenGesamt)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Einkünfte V+V</span>
                      <span className={result.einkuenfteVuV < 0 ? 'text-green-600' : ''}>
                        {formatCurrency(result.einkuenfteVuV)}
                      </span>
                    </div>
                    {result.einkuenfteVuV < 0 && (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Verlust wird mit anderen Einkünften verrechnet
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Tax Burden */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Steuerbelastung</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ESt ohne V+V</span>
                    <span>{formatCurrency(result.steuerOhneVuV)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ESt mit V+V</span>
                    <span>{formatCurrency(result.steuerMitVuV)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Steuer auf V+V</span>
                    <span className={result.steuerbelastungVuV < 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(result.steuerbelastungVuV)}
                    </span>
                  </div>
                  {result.country === 'DE' && (
                    <>
                      <div className="flex justify-between text-muted-foreground">
                        <span>+ Solidaritätszuschlag</span>
                        <span>{formatCurrency(result.solidaritaetszuschlag)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>+ Kirchensteuer (9%)</span>
                        <span>{formatCurrency(result.kirchensteuer)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-bold">
                        <span>Gesamtbelastung</span>
                        <span>{formatCurrency(result.gesamtbelastung)}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Tax Rates */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Steuersätze</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-primary">{result.grenzsteuersatz}%</p>
                      <p className="text-xs text-muted-foreground">Grenzsteuersatz</p>
                    </div>
                    <div className="bg-muted rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold">{result.effektiverSteuersatz}%</p>
                      <p className="text-xs text-muted-foreground">Effektiver Satz</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Optimization Tips */}
              {result.optimierungstipps.length > 0 && (
                <Card className="bg-amber-50 border-amber-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Lightbulb className="h-5 w-5 text-amber-600" />
                      Optimierungstipps
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {result.optimierungstipps.map((tipp, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                          <span>{tipp}</span>
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
                <Receipt className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">
                  Gib deine Daten ein und klicke auf "Steuer berechnen"
                </p>
              </CardContent>
            </Card>
          )}

          {/* Info */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Diese Berechnung dient der Orientierung und ersetzt keine Steuerberatung.
                  Die tatsächliche Steuerlast kann je nach individueller Situation abweichen.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
