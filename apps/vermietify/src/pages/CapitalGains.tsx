import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  TrendingUp, Calculator, CheckCircle2, AlertTriangle, Clock,
  Euro, Building2, Calendar, Info, ShieldCheck
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { berechneCapitalGains, type CapitalGainsResult, type PropertySale } from '@/lib/capitalGains'
import { COUNTRY_LABELS, type Country } from '@/lib/tax'

export function CapitalGains() {
  const [country, setCountry] = useState<Country>('DE')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [purchaseNK, setPurchaseNK] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [saleNK, setSaleNK] = useState('')
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0])
  const [totalAfa, setTotalAfa] = useState('')
  const [taxableIncome, setTaxableIncome] = useState('50000')
  const [selfUsed, setSelfUsed] = useState(false)
  const [result, setResult] = useState<CapitalGainsResult | null>(null)

  const berechnen = () => {
    const sale: PropertySale = {
      id: '1',
      propertyName: 'Immobilie',
      purchaseDate,
      purchasePrice: parseFloat(purchasePrice) || 0,
      purchaseIncidentalCosts: parseFloat(purchaseNK) || 0,
      improvements: [],
      saleDate,
      salePrice: parseFloat(salePrice) || 0,
      saleIncidentalCosts: parseFloat(saleNK) || 0,
      totalAfa: parseFloat(totalAfa) || 0,
      country,
      selfUsed,
      selfUsedYears: selfUsed ? 3 : 0,
    }
    setResult(berechneCapitalGains(sale, parseFloat(taxableIncome) || 50000))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Capital Gains</h1>
        <p className="text-muted-foreground">
          Veräußerungsgewinn & Spekulationssteuer berechnen
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5" />
                Kauf
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
                <Label>Kaufpreis *</Label>
                <div className="relative mt-1">
                  <Input type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} placeholder="z.B. 300000" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
                </div>
              </div>
              <div>
                <Label>Kaufnebenkosten (Steuer, Notar, Makler)</Label>
                <div className="relative mt-1">
                  <Input type="number" value={purchaseNK} onChange={(e) => setPurchaseNK(e.target.value)} placeholder="z.B. 30000" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
                </div>
              </div>
              <div>
                <Label>Kaufdatum *</Label>
                <Input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} className="mt-1" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer pt-2">
                <input type="checkbox" checked={selfUsed} onChange={(e) => setSelfUsed(e.target.checked)} className="h-4 w-4 rounded border-input" />
                <div>
                  <span className="text-sm font-medium">Eigennutzung (letzte 3 Jahre)</span>
                  <p className="text-xs text-muted-foreground">Steuerbefreiung bei Eigennutzung</p>
                </div>
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5" />
                Verkauf
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Verkaufspreis *</Label>
                <div className="relative mt-1">
                  <Input type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="z.B. 450000" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
                </div>
              </div>
              <div>
                <Label>Verkaufsnebenkosten (Makler, Notar)</Label>
                <div className="relative mt-1">
                  <Input type="number" value={saleNK} onChange={(e) => setSaleNK(e.target.value)} placeholder="z.B. 15000" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
                </div>
              </div>
              <div>
                <Label>Verkaufsdatum</Label>
                <Input type="date" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Bisherige AfA (gesamte Abschreibung)</Label>
                <div className="relative mt-1">
                  <Input type="number" value={totalAfa} onChange={(e) => setTotalAfa(e.target.value)} placeholder="z.B. 42000" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
                </div>
              </div>
              <div>
                <Label>Zu versteuerndes Einkommen (ohne Immobilie)</Label>
                <div className="relative mt-1">
                  <Input type="number" value={taxableIncome} onChange={(e) => setTaxableIncome(e.target.value)} placeholder="50000" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={berechnen} className="w-full" disabled={!purchasePrice || !purchaseDate || !salePrice}>
            <Calculator className="h-4 w-4 mr-2" />
            Berechnen
          </Button>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {result ? (
            <>
              {/* Tax Status */}
              <Card className={!result.steuerpflichtig ? 'border-green-200 bg-green-50' : result.veraeusserungsgewinn < 0 ? 'border-blue-200' : 'border-red-200'}>
                <CardContent className="py-6 text-center">
                  {!result.steuerpflichtig ? (
                    <>
                      <ShieldCheck className="h-10 w-10 text-green-600 mx-auto mb-3" />
                      <h3 className="font-bold text-lg text-green-700">Steuerfrei!</h3>
                      <p className="text-sm text-green-600 mt-1">{result.steuerfreiGrund}</p>
                    </>
                  ) : result.veraeusserungsgewinn <= 0 ? (
                    <>
                      <Info className="h-10 w-10 text-blue-600 mx-auto mb-3" />
                      <h3 className="font-bold text-lg">Kein Gewinn</h3>
                      <p className="text-sm text-muted-foreground mt-1">Kein steuerpflichtiger Veräußerungsgewinn</p>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-3" />
                      <h3 className="font-bold text-lg text-red-600">Steuerpflichtig</h3>
                      <p className="text-3xl font-bold text-red-600 mt-2">
                        ca. {formatCurrency(result.geschaetztesteuer)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Geschätzte Steuer ({result.grenzsteuersatz}% Grenzsteuersatz)
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Berechnung</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Anschaffungskosten</span>
                    <span>{formatCurrency(result.anschaffungskosten)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">+ Herstellungskosten</span>
                    <span>{formatCurrency(result.herstellungskosten)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">- Abschreibungen (AfA)</span>
                    <span>-{formatCurrency(result.abschreibungenGesamt)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span>Bereinigte Basis</span>
                    <span>{formatCurrency(result.bereinigteBasis)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Verkaufserlös (netto)</span>
                    <span>{formatCurrency(result.verkaufserloesNetto)}</span>
                  </div>
                  <div className={`border-t pt-2 flex justify-between font-bold ${
                    result.veraeusserungsgewinn > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <span>Veräußerungsgewinn</span>
                    <span>{formatCurrency(result.veraeusserungsgewinn)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="h-4 w-4" />
                    Spekulationsfrist (DE)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Haltedauer</span>
                    <span className="font-medium">{result.haltedauerJahre} Jahre, {result.haltedauer % 12} Monate</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fristende</span>
                    <span>{result.spekulationsfristEnde}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className={`font-medium flex items-center gap-1 ${
                      result.spekulationsfristAbgelaufen ? 'text-green-600' : 'text-orange-500'
                    }`}>
                      {result.spekulationsfristAbgelaufen ? (
                        <><CheckCircle2 className="h-3.5 w-3.5" /> Abgelaufen</>
                      ) : (
                        <><Clock className="h-3.5 w-3.5" /> Noch {result.verbleibendeMonateBisFristende} Mon.</>
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="bg-muted/30">
              <CardContent className="py-12 text-center">
                <Euro className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">Gib Kauf- und Verkaufsdaten ein</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
