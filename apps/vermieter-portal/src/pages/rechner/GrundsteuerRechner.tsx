import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Calculator, ArrowLeft, Info } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { formatCurrency } from '../../lib/utils'
import { useDocumentTitle, useMetaTags, useJsonLd, useKeyboardNav, useUnsavedChanges, ShareResultButton, CrossAppRecommendations } from '@fintutto/shared'
import { toast } from 'sonner'

export default function GrundsteuerRechner() {
  useDocumentTitle('Grundsteuer-Rechner', 'Fintutto Vermieter')
  useMetaTags({
    title: 'Grundsteuer-Rechner – Vermieter Portal',
    description: 'Berechne die neue Grundsteuer nach dem Bundesmodell',
    path: '/rechner/grundsteuer',
    baseUrl: 'https://vermieter.fintutto.cloud',
  })
  useJsonLd({
    type: 'WebApplication',
    name: 'Grundsteuer-Rechner',
    description: 'Berechne die neue Grundsteuer nach dem Bundesmodell',
    url: 'https://vermieter.fintutto.cloud/rechner/grundsteuer',
    offers: { price: '0', priceCurrency: 'EUR' },
  })
  const navigate = useNavigate()
  const location = useLocation()
  useKeyboardNav({ onEscape: () => navigate('/rechner') })
  const { setDirty } = useUnsavedChanges()
  const [grundstueckswert, setGrundstueckswert] = useState<string>('')
  const [gebaeudewert, setGebaeudewert] = useState<string>('')
  const [hebesatz, setHebesatz] = useState<string>('400')
  const [result, setResult] = useState<any>(null)

  const berechnen = () => {
    const gw = parseFloat(grundstueckswert) || 0
    const gbw = parseFloat(gebaeudewert) || 0
    const hs = parseFloat(hebesatz) || 400

    // Vereinfachtes Bundesmodell
    const grundsteuerwert = gw + gbw
    const steuermesszahl = 0.00031 // 0,031% für Wohngrundstücke
    const grundsteuermessbetrag = grundsteuerwert * steuermesszahl
    const grundsteuerJahr = grundsteuermessbetrag * (hs / 100)
    const grundsteuerMonat = grundsteuerJahr / 12

    setDirty()
    setResult({
      grundsteuerwert,
      steuermesszahl: steuermesszahl * 100,
      grundsteuermessbetrag,
      hebesatz: hs,
      grundsteuerJahr,
      grundsteuerMonat,
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
              <h1 className="text-2xl md:text-3xl font-bold text-white">Grundsteuer-Rechner</h1>
              <p className="text-white/80">Berechne die neue Grundsteuer (Bundesmodell)</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container">
          <div className="grid lg:grid-cols-[1fr_400px] gap-8">
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Eingaben</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Grundstückswert</label>
                      <div className="relative">
                        <input type="number" value={grundstueckswert} onChange={(e) => setGrundstueckswert(e.target.value)} placeholder="100000" className="w-full px-4 py-3 rounded-lg border border-input bg-background" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Gebäudewert</label>
                      <div className="relative">
                        <input type="number" value={gebaeudewert} onChange={(e) => setGebaeudewert(e.target.value)} placeholder="200000" className="w-full px-4 py-3 rounded-lg border border-input bg-background" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Hebesatz der Gemeinde</label>
                    <div className="relative">
                      <input type="number" value={hebesatz} onChange={(e) => setHebesatz(e.target.value)} placeholder="400" className="w-full px-4 py-3 rounded-lg border border-input bg-background" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Durchschnitt: 400-500%</p>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button onClick={berechnen} disabled={!grundstueckswert && !gebaeudewert} className="flex-1 gradient-vermieter text-white">Berechnen</Button>
                    <Button variant="outline" onClick={() => { setGrundstueckswert(''); setGebaeudewert(''); setResult(null); toast('Eingaben zurückgesetzt') }}>Zurücksetzen</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      Die neue Grundsteuer gilt ab 2025. Die Berechnung basiert auf dem Bundesmodell.
                      Einige Bundesländer haben eigene Modelle.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {result ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Grundsteuer</CardTitle>
                      <ShareResultButton title="Grundsteuer-Rechner Ergebnis" url="/rechner/grundsteuer" text={formatCurrency(result.grundsteuerJahr)} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground mb-1">Pro Jahr</p>
                      <p className="text-4xl font-bold gradient-text-vermieter">{formatCurrency(result.grundsteuerJahr)}</p>
                      <p className="text-sm text-muted-foreground mt-2">= {formatCurrency(result.grundsteuerMonat)} / Monat</p>
                    </div>
                    <div className="space-y-2 text-sm border-t pt-4">
                      <div className="flex justify-between"><span>Grundsteuerwert</span><span>{formatCurrency(result.grundsteuerwert)}</span></div>
                      <div className="flex justify-between"><span>× Steuermesszahl</span><span>{result.steuermesszahl.toFixed(3)}%</span></div>
                      <div className="flex justify-between"><span>= Messbetrag</span><span>{formatCurrency(result.grundsteuermessbetrag)}</span></div>
                      <div className="flex justify-between"><span>× Hebesatz</span><span>{result.hebesatz}%</span></div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-muted/30">
                  <CardContent className="py-12 text-center">
                    <Calculator className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">Gib die Werte ein</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      <CrossAppRecommendations currentPath={location.pathname} currentAppSlug="vermieter-portal" />
    </div>
  )
}
