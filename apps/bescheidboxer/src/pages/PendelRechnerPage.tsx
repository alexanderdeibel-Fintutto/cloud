import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Car, Calculator, TrendingDown, Info } from 'lucide-react'

export default function PendelRechnerPage() {
  const [entfernung, setEntfernung] = useState(35)
  const [arbeitstage, setArbeitstage] = useState(220)
  const [verkehrsmittel, setVerkehrsmittel] = useState<'auto' | 'oepnv' | 'fahrrad'>('auto')
  const [oepnvKosten, setOepnvKosten] = useState(49)
  const [steuersatz, setSteuersatz] = useState(35)
  const [firmenwagen, setFirmenwagen] = useState(false)

  const result = useMemo(() => {
    if (firmenwagen) {
      return { pauschale: 0, steuerErsparnis: 0, proTag: 0, methode: 'Firmenwagen - kein Abzug', hinweis: 'Bei Firmenwagennutzung entfällt die Entfernungspauschale.' }
    }

    let pauschale = 0
    let methode = ''

    if (verkehrsmittel === 'oepnv') {
      const jahresTicket = oepnvKosten * 12
      const entfPauschale = berechneEntfernungspauschale(entfernung, arbeitstage)
      pauschale = Math.max(jahresTicket, entfPauschale)
      methode = pauschale === jahresTicket ? 'Tatsächliche ÖPNV-Kosten (günstiger)' : 'Entfernungspauschale (günstiger)'
    } else if (verkehrsmittel === 'fahrrad') {
      pauschale = berechneEntfernungspauschale(entfernung, arbeitstage)
      methode = 'Entfernungspauschale (auch für Fahrrad)'
    } else {
      pauschale = berechneEntfernungspauschale(entfernung, arbeitstage)
      methode = 'Entfernungspauschale'
    }

    const steuerErsparnis = Math.round(pauschale * (steuersatz / 100))
    const proTag = Math.round((pauschale / arbeitstage) * 100) / 100

    return { pauschale, steuerErsparnis, proTag, methode, hinweis: '' }
  }, [entfernung, arbeitstage, verkehrsmittel, oepnvKosten, steuersatz, firmenwagen])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pendlerpauschale-Rechner</h1>
        <p className="text-muted-foreground mt-1">
          Berechnen Sie Ihre Entfernungspauschale und die resultierende Steuerersparnis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Car className="h-5 w-5" /> Pendeldaten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Einfache Entfernung (km)</label>
                  <input type="number" value={entfernung} onChange={e => setEntfernung(Number(e.target.value))} min={1} max={500} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  <p className="text-xs text-muted-foreground mt-1">Kürzeste Straßenverbindung Wohnung ↔ Arbeit</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Arbeitstage pro Jahr</label>
                  <input type="number" value={arbeitstage} onChange={e => setArbeitstage(Number(e.target.value))} min={1} max={365} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  <p className="text-xs text-muted-foreground mt-1">Abzgl. Urlaub, Krankheit, Homeoffice</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Verkehrsmittel</label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {([
                    { key: 'auto', label: 'Auto', desc: 'PKW / Motorrad' },
                    { key: 'oepnv', label: 'ÖPNV', desc: 'Bus, Bahn, etc.' },
                    { key: 'fahrrad', label: 'Fahrrad', desc: 'Rad / E-Bike' },
                  ] as const).map(v => (
                    <button key={v.key} onClick={() => setVerkehrsmittel(v.key)} className={`p-3 rounded-md border-2 text-left text-sm transition-colors ${verkehrsmittel === v.key ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                      <p className="font-medium">{v.label}</p>
                      <p className="text-xs text-muted-foreground">{v.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {verkehrsmittel === 'oepnv' && (
                <div>
                  <label className="text-sm font-medium">Monatliche ÖPNV-Kosten (€)</label>
                  <input type="number" value={oepnvKosten} onChange={e => setOepnvKosten(Number(e.target.value))} min={0} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  <p className="text-xs text-muted-foreground mt-1">z.B. Deutschlandticket 49 €, Monatsticket</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <label className="text-sm font-medium">Persönlicher Steuersatz (%)</label>
                  <input type="number" value={steuersatz} onChange={e => setSteuersatz(Number(e.target.value))} min={0} max={45} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={firmenwagen} onChange={e => setFirmenwagen(e.target.checked)} className="rounded" />
                    Firmenwagen vorhanden
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Aufschlüsselung */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Berechnung im Detail</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                {entfernung <= 20 ? (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{entfernung} km × 0,30 €/km × {arbeitstage} Tage</span>
                    <span className="font-medium">{(entfernung * 0.30 * arbeitstage).toLocaleString('de-DE', { maximumFractionDigits: 2 })} €</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Erste 20 km: 20 × 0,30 € × {arbeitstage} Tage</span>
                      <span>{(20 * 0.30 * arbeitstage).toLocaleString('de-DE', { maximumFractionDigits: 2 })} €</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ab 21. km: {entfernung - 20} × 0,38 € × {arbeitstage} Tage</span>
                      <span>{((entfernung - 20) * 0.38 * arbeitstage).toLocaleString('de-DE', { maximumFractionDigits: 2 })} €</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between border-t pt-2 font-medium">
                  <span>Entfernungspauschale gesamt</span>
                  <span>{result.pauschale.toLocaleString('de-DE', { maximumFractionDigits: 2 })} €</span>
                </div>
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Steuerersparnis (bei {steuersatz}%)</span>
                  <span>{result.steuerErsparnis.toLocaleString('de-DE')} €</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">{result.methode}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-2 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Ergebnis</CardTitle>
              <CardDescription>Jährliche Entfernungspauschale</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-3">
                <p className="text-sm text-muted-foreground">Absetzbar als Werbungskosten</p>
                <p className="text-4xl font-bold text-primary mt-1">{result.pauschale.toLocaleString('de-DE')} €</p>
                <p className="text-sm text-muted-foreground mt-2">Pro Arbeitstag: {result.proTag.toLocaleString('de-DE')} €</p>
              </div>
              <div className="border-t pt-3">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Ihre Steuerersparnis</p>
                    <p className="text-2xl font-bold text-green-600">{result.steuerErsparnis.toLocaleString('de-DE')} €</p>
                  </div>
                </div>
              </div>
              {result.hinweis && (
                <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">{result.hinweis}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Erste 20 km: <strong>0,30 €/km</strong></p>
                  <p>Ab 21. km: <strong>0,38 €/km</strong></p>
                  <p>Max. 4.500 €/Jahr (ohne eigenen PKW)</p>
                  <p>Arbeitnehmer-Pauschbetrag: 1.230 € (Werbungskosten werden erst ab diesem Betrag wirksam)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function berechneEntfernungspauschale(km: number, tage: number): number {
  if (km <= 20) return km * 0.30 * tage
  return (20 * 0.30 + (km - 20) * 0.38) * tage
}
