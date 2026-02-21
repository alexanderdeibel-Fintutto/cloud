import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Calculator, ArrowLeft, Info, TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { formatCurrency } from '../../lib/utils'
import PropertySelector from '../../components/shared/PropertySelector'
import LoginPrompt from '../../components/shared/LoginPrompt'
import { useDocumentTitle, useMetaTags, useJsonLd, useLocalStorage, useUnsavedChanges, useKeyboardNav, ShareResultButton } from '@fintutto/shared'
import { useTrackTool } from '@/hooks/useTrackTool'
import { toast } from 'sonner'

interface RenditeResult {
  bruttoRendite: number
  nettoRendite: number
  cashflowMonatlich: number
  cashflowJaehrlich: number
  eigenkapitalRendite: number
  faktorKaufpreis: number
}

export default function RenditeRechner() {
  useDocumentTitle('Rendite-Rechner', 'Fintutto Portal')
  useMetaTags({
    title: 'Rendite-Rechner – Immobilienrendite berechnen',
    description: 'Berechne Brutto- und Netto-Rendite, Cashflow und Eigenkapitalrendite deiner Immobilie. Kostenlos und sofort.',
    path: '/rechner/rendite',
  })
  useJsonLd({
    type: 'WebApplication',
    name: 'Rendite-Rechner',
    description: 'Berechne Brutto- und Netto-Rendite, Cashflow und Eigenkapitalrendite',
    url: 'https://portal.fintutto.cloud/rechner/rendite',
    offers: { price: '0', priceCurrency: 'EUR' },
  })
  useTrackTool('Rendite-Rechner')
  const navigate = useNavigate()
  useKeyboardNav({ onEscape: () => navigate('/rechner') })
  const { setDirty, reset: resetDirty } = useUnsavedChanges()
  const [searchParams] = useSearchParams()
  const defaultInputs = { kaufpreis: '', nebenkosten: '10', monatsmiete: '', nichtUmlagefaehig: '15', eigenkapital: '', zins: '3.5', tilgung: '2' }
  const [savedInputs, setSavedInputs, clearSaved] = useLocalStorage('fintutto_rendite_inputs', defaultInputs)
  const [kaufpreis, setKaufpreisRaw] = useState<string>(savedInputs.kaufpreis)
  const [nebenkosten, setNebenkostenRaw] = useState<string>(savedInputs.nebenkosten)
  const [monatsmiete, setMonatsmieteRaw] = useState<string>(savedInputs.monatsmiete)

  const persist = (field: string, value: string) => { setDirty(); setSavedInputs(prev => ({ ...prev, [field]: value })) }

  const setKaufpreis = (v: string) => { setKaufpreisRaw(v); persist('kaufpreis', v) }
  const setNebenkosten = (v: string) => { setNebenkostenRaw(v); persist('nebenkosten', v) }
  const setMonatsmiete = (v: string) => { setMonatsmieteRaw(v); persist('monatsmiete', v) }

  useEffect(() => {
    const rent = searchParams.get('rent')
    if (rent) setMonatsmiete(rent)
  }, [searchParams])
  const [nichtUmlagefaehig, setNichtUmlagefaehigRaw] = useState<string>(savedInputs.nichtUmlagefaehig)
  const [eigenkapital, setEigenkapitalRaw] = useState<string>(savedInputs.eigenkapital)
  const [zins, setZinsRaw] = useState<string>(savedInputs.zins)
  const [tilgung, setTilgungRaw] = useState<string>(savedInputs.tilgung)
  const [result, setResult] = useState<RenditeResult | null>(null)

  const setNichtUmlagefaehig = (v: string) => { setNichtUmlagefaehigRaw(v); persist('nichtUmlagefaehig', v) }
  const setEigenkapital = (v: string) => { setEigenkapitalRaw(v); persist('eigenkapital', v) }
  const setZins = (v: string) => { setZinsRaw(v); persist('zins', v) }
  const setTilgung = (v: string) => { setTilgungRaw(v); persist('tilgung', v) }

  const berechnen = () => {
    const kp = parseFloat(kaufpreis) || 0
    const nk = parseFloat(nebenkosten) || 0
    const miete = parseFloat(monatsmiete) || 0
    const nuKosten = parseFloat(nichtUmlagefaehig) || 0
    const ek = parseFloat(eigenkapital) || kp * 0.2
    const z = parseFloat(zins) || 0
    const t = parseFloat(tilgung) || 0

    const gesamtkosten = kp * (1 + nk / 100)
    const jahresmiete = miete * 12
    const bewirtschaftungskosten = jahresmiete * (nuKosten / 100)
    const nettoMieteinnahmen = jahresmiete - bewirtschaftungskosten

    const bruttoRendite = (jahresmiete / kp) * 100
    const nettoRendite = (nettoMieteinnahmen / gesamtkosten) * 100

    const fremdkapital = gesamtkosten - ek
    const annuitaet = fremdkapital * ((z + t) / 100)
    const cashflowJaehrlich = nettoMieteinnahmen - annuitaet
    const cashflowMonatlich = cashflowJaehrlich / 12

    const eigenkapitalRendite = ek > 0 ? (cashflowJaehrlich / ek) * 100 : 0
    const faktorKaufpreis = jahresmiete > 0 ? kp / jahresmiete : 0

    setResult({
      bruttoRendite,
      nettoRendite,
      cashflowMonatlich,
      cashflowJaehrlich,
      eigenkapitalRendite,
      faktorKaufpreis,
    })
    toast.success('Berechnung abgeschlossen')
  }

  return (
    <div>
      <section className="gradient-vermieter py-12">
        <div className="container">
          <Link to="/rechner" className="inline-flex items-center gap-1 text-white/80 hover:text-white mb-4 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Alle Rechner
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
              <Calculator className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Rendite-Rechner</h1>
              <p className="text-white/80">Berechne Brutto- und Netto-Rendite deiner Immobilie</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container">
          <div className="grid lg:grid-cols-[1fr_400px] gap-8">
            <div className="space-y-6">
              <LoginPrompt />
              <Card>
                <CardHeader>
                  <CardTitle>Immobilie & Kosten</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <PropertySelector
                    onSelect={({ rent }) => {
                      setMonatsmiete(rent.toString())
                      setResult(null)
                    }}
                    label="Miete aus Vermietify laden"
                  />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Kaufpreis *</label>
                      <div className="relative">
                        <input type="number" value={kaufpreis} onChange={(e) => setKaufpreis(e.target.value)} placeholder="z.B. 300000" className="w-full px-4 py-3 rounded-lg border border-input bg-background" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Kaufnebenkosten</label>
                      <div className="relative">
                        <input type="number" value={nebenkosten} onChange={(e) => setNebenkosten(e.target.value)} placeholder="10" className="w-full px-4 py-3 rounded-lg border border-input bg-background" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Monatsmiete (kalt) *</label>
                      <div className="relative">
                        <input type="number" value={monatsmiete} onChange={(e) => setMonatsmiete(e.target.value)} placeholder="z.B. 1200" className="w-full px-4 py-3 rounded-lg border border-input bg-background" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Nicht umlagefähige Kosten</label>
                      <div className="relative">
                        <input type="number" value={nichtUmlagefaehig} onChange={(e) => setNichtUmlagefaehig(e.target.value)} placeholder="15" className="w-full px-4 py-3 rounded-lg border border-input bg-background" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Finanzierung</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Eigenkapital</label>
                      <div className="relative">
                        <input type="number" value={eigenkapital} onChange={(e) => setEigenkapital(e.target.value)} placeholder="60000" className="w-full px-4 py-3 rounded-lg border border-input bg-background" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Zinssatz</label>
                      <div className="relative">
                        <input type="number" value={zins} onChange={(e) => setZins(e.target.value)} step="0.1" className="w-full px-4 py-3 rounded-lg border border-input bg-background" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Tilgung</label>
                      <div className="relative">
                        <input type="number" value={tilgung} onChange={(e) => setTilgung(e.target.value)} step="0.1" className="w-full px-4 py-3 rounded-lg border border-input bg-background" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button onClick={berechnen} disabled={!kaufpreis || !monatsmiete} className="flex-1 gradient-vermieter text-white">
                      Berechnen
                    </Button>
                    <Button variant="outline" onClick={() => { setKaufpreisRaw(''); setMonatsmieteRaw(''); setNebenkostenRaw('10'); setNichtUmlagefaehigRaw('15'); setEigenkapitalRaw(''); setZinsRaw('3.5'); setTilgungRaw('2'); setResult(null); clearSaved(); resetDirty(); toast('Eingaben zurückgesetzt') }}>
                      Zurücksetzen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {result ? (
                <>
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Rendite-Übersicht</CardTitle>
                        <ShareResultButton
                          title="Rendite-Rechner Ergebnis"
                          text={`Brutto-Rendite: ${result.bruttoRendite.toFixed(2)}%`}
                          url="/rechner/rendite"
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 rounded-lg bg-muted">
                          <p className="text-sm text-muted-foreground">Brutto-Rendite</p>
                          <p className="text-2xl font-bold text-primary">{result.bruttoRendite.toFixed(2)}%</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-muted">
                          <p className="text-sm text-muted-foreground">Netto-Rendite</p>
                          <p className="text-2xl font-bold text-primary">{result.nettoRendite.toFixed(2)}%</p>
                        </div>
                      </div>

                      <div className="text-center p-4 rounded-lg border-2 border-primary/30">
                        <p className="text-sm text-muted-foreground">EK-Rendite</p>
                        <p className={'text-3xl font-bold ' + (result.eigenkapitalRendite >= 0 ? 'text-success' : 'text-destructive')}>
                          {result.eigenkapitalRendite.toFixed(2)}%
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-t pt-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Cashflow/Monat</p>
                          <p className={'text-xl font-semibold flex items-center justify-center gap-1 ' + (result.cashflowMonatlich >= 0 ? 'text-success' : 'text-destructive')}>
                            {result.cashflowMonatlich >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                            {formatCurrency(result.cashflowMonatlich)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Kaufpreisfaktor</p>
                          <p className="text-xl font-semibold">{result.faktorKaufpreis.toFixed(1)}x</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/50">
                    <CardContent className="pt-6">
                      <div className="flex gap-3">
                        <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div className="text-sm text-muted-foreground">
                          <p className="mb-2"><strong>Kaufpreisfaktor unter 20:</strong> Gute Rendite</p>
                          <p className="mb-2"><strong>EK-Rendite über 5%:</strong> Attraktiv</p>
                          <p><strong>Positiver Cashflow:</strong> Selbsttragende Immobilie</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="bg-muted/30">
                  <CardContent className="py-12 text-center">
                    <Calculator className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">Gib Kaufpreis und Miete ein</p>
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
