import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Euro, ArrowLeft } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { formatCurrency } from '../../lib/utils'
import { useDocumentTitle, useMetaTags, useJsonLd, useKeyboardNav, useUnsavedChanges, ShareResultButton, CrossAppRecommendations } from '@fintutto/shared'
import { toast } from 'sonner'

const bundeslaender = [
  { name: 'Baden-Württemberg', grunderwerbsteuer: 5.0 },
  { name: 'Bayern', grunderwerbsteuer: 3.5 },
  { name: 'Berlin', grunderwerbsteuer: 6.0 },
  { name: 'Brandenburg', grunderwerbsteuer: 6.5 },
  { name: 'Bremen', grunderwerbsteuer: 5.0 },
  { name: 'Hamburg', grunderwerbsteuer: 5.5 },
  { name: 'Hessen', grunderwerbsteuer: 6.0 },
  { name: 'Mecklenburg-Vorpommern', grunderwerbsteuer: 6.0 },
  { name: 'Niedersachsen', grunderwerbsteuer: 5.0 },
  { name: 'Nordrhein-Westfalen', grunderwerbsteuer: 6.5 },
  { name: 'Rheinland-Pfalz', grunderwerbsteuer: 5.0 },
  { name: 'Saarland', grunderwerbsteuer: 6.5 },
  { name: 'Sachsen', grunderwerbsteuer: 5.5 },
  { name: 'Sachsen-Anhalt', grunderwerbsteuer: 5.0 },
  { name: 'Schleswig-Holstein', grunderwerbsteuer: 6.5 },
  { name: 'Thüringen', grunderwerbsteuer: 5.0 },
]

export default function KaufnebenkostenRechner() {
  useDocumentTitle('Kaufnebenkosten-Rechner', 'Fintutto Vermieter')
  useMetaTags({
    title: 'Kaufnebenkosten-Rechner – Vermieter Portal',
    description: 'Berechne alle Nebenkosten beim Immobilienkauf',
    path: '/rechner/kaufnebenkosten',
    baseUrl: 'https://vermieter.fintutto.cloud',
  })
  useJsonLd({
    type: 'WebApplication',
    name: 'Kaufnebenkosten-Rechner',
    description: 'Berechne alle Nebenkosten beim Immobilienkauf',
    url: 'https://vermieter.fintutto.cloud/rechner/kaufnebenkosten',
    offers: { price: '0', priceCurrency: 'EUR' },
  })
  const navigate = useNavigate()
  const location = useLocation()
  useKeyboardNav({ onEscape: () => navigate('/rechner') })
  const { setDirty } = useUnsavedChanges()
  const [kaufpreis, setKaufpreis] = useState<string>('')
  const [bundesland, setBundesland] = useState<string>('Bayern')
  const [makler, setMakler] = useState<string>('3.57')
  const [result, setResult] = useState<any>(null)

  const berechnen = () => {
    const kp = parseFloat(kaufpreis) || 0
    const land = bundeslaender.find(b => b.name === bundesland)
    const grunderwerbsteuer = land ? land.grunderwerbsteuer : 5.0
    const maklerProzent = parseFloat(makler) || 0

    const grunderwerbsteuerBetrag = kp * (grunderwerbsteuer / 100)
    const notarBetrag = kp * 0.015
    const grundbuchBetrag = kp * 0.005
    const maklerBetrag = kp * (maklerProzent / 100)

    const gesamtNebenkosten = grunderwerbsteuerBetrag + notarBetrag + grundbuchBetrag + maklerBetrag
    const gesamtkosten = kp + gesamtNebenkosten
    const prozentVomKaufpreis = (gesamtNebenkosten / kp) * 100

    setDirty()
    setResult({
      kaufpreis: kp,
      grunderwerbsteuer: { prozent: grunderwerbsteuer, betrag: grunderwerbsteuerBetrag },
      notar: { prozent: 1.5, betrag: notarBetrag },
      grundbuch: { prozent: 0.5, betrag: grundbuchBetrag },
      makler: { prozent: maklerProzent, betrag: maklerBetrag },
      gesamtNebenkosten,
      gesamtkosten,
      prozentVomKaufpreis,
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
              <Euro className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Kaufnebenkosten-Rechner</h1>
              <p className="text-white/80">Alle Nebenkosten beim Immobilienkauf im Überblick</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container">
          <div className="grid lg:grid-cols-[1fr_400px] gap-8">
            <Card>
              <CardHeader><CardTitle>Eingaben</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Kaufpreis *</label>
                  <div className="relative">
                    <input type="number" value={kaufpreis} onChange={(e) => setKaufpreis(e.target.value)} placeholder="z.B. 400000" className="w-full px-4 py-3 rounded-lg border border-input bg-background" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Bundesland</label>
                    <select value={bundesland} onChange={(e) => setBundesland(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-input bg-background">
                      {bundeslaender.map((land) => (
                        <option key={land.name} value={land.name}>{land.name} ({land.grunderwerbsteuer}%)</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Maklerprovision</label>
                    <div className="relative">
                      <input type="number" value={makler} onChange={(e) => setMakler(e.target.value)} step="0.01" className="w-full px-4 py-3 rounded-lg border border-input bg-background" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button onClick={berechnen} disabled={!kaufpreis} className="flex-1 gradient-vermieter text-white">Berechnen</Button>
                  <Button variant="outline" onClick={() => { setKaufpreis(''); setResult(null); toast('Eingaben zurückgesetzt') }}>Zurücksetzen</Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {result ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Kostenübersicht</CardTitle>
                      <ShareResultButton title="Kaufnebenkosten-Rechner Ergebnis" url="/rechner/kaufnebenkosten" text={formatCurrency(result.gesamtNebenkosten)} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span>Kaufpreis</span>
                      <span className="font-semibold">{formatCurrency(result.kaufpreis)}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span>Grunderwerbsteuer ({result.grunderwerbsteuer.prozent}%)</span>
                      <span>{formatCurrency(result.grunderwerbsteuer.betrag)}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span>Notar ({result.notar.prozent}%)</span>
                      <span>{formatCurrency(result.notar.betrag)}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span>Grundbuch ({result.grundbuch.prozent}%)</span>
                      <span>{formatCurrency(result.grundbuch.betrag)}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span>Makler ({result.makler.prozent}%)</span>
                      <span>{formatCurrency(result.makler.betrag)}</span>
                    </div>
                    <div className="flex justify-between py-3 border-t-2 border-primary">
                      <span className="font-semibold">Nebenkosten gesamt</span>
                      <span className="font-bold text-primary">{formatCurrency(result.gesamtNebenkosten)}</span>
                    </div>
                    <div className="flex justify-between py-3 bg-muted rounded-lg px-4">
                      <span className="font-semibold">Gesamtkosten</span>
                      <span className="font-bold text-xl">{formatCurrency(result.gesamtkosten)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Nebenkosten: {result.prozentVomKaufpreis.toFixed(1)}% vom Kaufpreis
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-muted/30">
                  <CardContent className="py-12 text-center">
                    <Euro className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">Gib den Kaufpreis ein</p>
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
