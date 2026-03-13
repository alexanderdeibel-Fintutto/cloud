import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Landmark, Info } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const STEUERSAETZE: Record<string, number> = {
  'Baden-Wuerttemberg': 5.0,
  'Bayern': 3.5,
  'Berlin': 6.0,
  'Brandenburg': 6.5,
  'Bremen': 5.0,
  'Hamburg': 5.5,
  'Hessen': 6.0,
  'Mecklenburg-Vorpommern': 6.0,
  'Niedersachsen': 5.0,
  'Nordrhein-Westfalen': 6.5,
  'Rheinland-Pfalz': 5.0,
  'Saarland': 6.5,
  'Sachsen': 5.5,
  'Sachsen-Anhalt': 5.0,
  'Schleswig-Holstein': 6.5,
  'Thueringen': 5.0,
}

const LAENDER = Object.keys(STEUERSAETZE).sort()

export default function GrunderwerbsteuerRechnerPage() {
  const [kaufpreis, setKaufpreis] = useState(350000)
  const [bundesland, setBundesland] = useState('Bayern')
  const [grundstuecksanteil, setGrundstuecksanteil] = useState(100)
  const [maklerProzent, setMaklerProzent] = useState(3.57)
  const [notarProzent] = useState(1.5)
  const [grundbuchProzent] = useState(0.5)

  const ergebnis = useMemo(() => {
    const satz = STEUERSAETZE[bundesland] || 5
    const bemessungsgrundlage = Math.round(kaufpreis * grundstuecksanteil / 100)
    const grunderwerbsteuer = Math.round(bemessungsgrundlage * satz / 100)
    const maklerkosten = Math.round(kaufpreis * maklerProzent / 100)
    const notarkosten = Math.round(kaufpreis * notarProzent / 100)
    const grundbuch = Math.round(kaufpreis * grundbuchProzent / 100)
    const nebenkosten = grunderwerbsteuer + maklerkosten + notarkosten + grundbuch
    const gesamt = kaufpreis + nebenkosten
    const nebenkostenProzent = kaufpreis > 0 ? (nebenkosten / kaufpreis) * 100 : 0

    return { satz, bemessungsgrundlage, grunderwerbsteuer, maklerkosten, notarkosten, grundbuch, nebenkosten, gesamt, nebenkostenProzent }
  }, [kaufpreis, bundesland, grundstuecksanteil, maklerProzent, notarProzent, grundbuchProzent])

  const chartData = LAENDER.map(land => ({
    name: land.length > 12 ? land.slice(0, 12) + '.' : land,
    satz: STEUERSAETZE[land],
    steuer: Math.round(kaufpreis * STEUERSAETZE[land] / 100),
    fill: land === bundesland ? '#7c3aed' : '#d4d4d8',
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Landmark className="h-6 w-6 text-primary" />
          Grunderwerbsteuer-Rechner
        </h1>
        <p className="text-muted-foreground mt-1">
          Kaufnebenkosten berechnen – Grunderwerbsteuer nach Bundesland
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Grunderwerbsteuer (GrEStG):</strong> Faellig bei jedem Immobilienkauf. Der Steuersatz variiert je nach Bundesland zwischen 3,5% (Bayern) und 6,5% (z.B. NRW, Brandenburg).</p>
              <p><strong>Bemessungsgrundlage:</strong> In der Regel der Kaufpreis. Bei Erbbaurecht oder Erbschaft kann abweichend berechnet werden.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Eingaben</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Kaufpreis: {kaufpreis.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={50000} max={2000000} step={10000} value={kaufpreis} onChange={e => setKaufpreis(+e.target.value)} className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-muted-foreground"><span>50.000 EUR</span><span>2.000.000 EUR</span></div>
            </div>

            <div>
              <label className="text-sm font-medium">Bundesland</label>
              <select value={bundesland} onChange={e => setBundesland(e.target.value)} className="w-full mt-1 rounded-md border px-3 py-2 text-sm bg-background">
                {LAENDER.map(l => (
                  <option key={l} value={l}>{l} ({STEUERSAETZE[l]}%)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Grundstuecksanteil: {grundstuecksanteil}%</label>
              <input type="range" min={0} max={100} value={grundstuecksanteil} onChange={e => setGrundstuecksanteil(+e.target.value)} className="w-full accent-primary" />
              <p className="text-xs text-muted-foreground">Bei Eigentumswohnungen ggf. anteiliger Grundstuecksanteil</p>
            </div>

            <div>
              <label className="text-sm font-medium">Maklerprovision: {maklerProzent.toFixed(2)}%</label>
              <input type="range" min={0} max={7.14} step={0.01} value={maklerProzent} onChange={e => setMaklerProzent(+e.target.value)} className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-muted-foreground"><span>0% (privat)</span><span>7,14% (Kaeufer allein)</span></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">Kaufnebenkosten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 mb-6">
              <div className="rounded-lg bg-primary/10 p-4 text-center">
                <p className="text-2xl font-bold text-primary">{ergebnis.grunderwerbsteuer.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Grunderwerbsteuer ({ergebnis.satz}%)</p>
              </div>
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-2xl font-bold">{ergebnis.nebenkosten.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Nebenkosten gesamt ({ergebnis.nebenkostenProzent.toFixed(1)}%)</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Kaufpreis</span>
                <span className="font-medium">{kaufpreis.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Grunderwerbsteuer ({ergebnis.satz}%)</span>
                <span className="font-medium text-primary">{ergebnis.grunderwerbsteuer.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Notar ({notarProzent}%)</span>
                <span className="font-medium">{ergebnis.notarkosten.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Grundbuch ({grundbuchProzent}%)</span>
                <span className="font-medium">{ergebnis.grundbuch.toLocaleString('de-DE')} EUR</span>
              </div>
              {ergebnis.maklerkosten > 0 && (
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Makler ({maklerProzent.toFixed(2)}%)</span>
                  <span className="font-medium">{ergebnis.maklerkosten.toLocaleString('de-DE')} EUR</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 font-bold">
                <span>Gesamtkosten</span>
                <span className="text-primary">{ergebnis.gesamt.toLocaleString('de-DE')} EUR</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Grunderwerbsteuer nach Bundesland</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-45} textAnchor="end" interval={0} />
                <YAxis tickFormatter={v => `${v.toLocaleString('de-DE')} EUR`} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR`} />
                <Bar dataKey="steuer" name="Grunderwerbsteuer" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <rect key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Steuersaetze im Ueberblick</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4">Bundesland</th>
                  <th className="py-2 pr-4 text-right">Steuersatz</th>
                  <th className="py-2 text-right">Bei {kaufpreis.toLocaleString('de-DE')} EUR</th>
                </tr>
              </thead>
              <tbody>
                {LAENDER.map(land => (
                  <tr key={land} className={`border-b ${land === bundesland ? 'bg-primary/5 font-medium' : ''}`}>
                    <td className="py-1.5 pr-4">{land}</td>
                    <td className="py-1.5 pr-4 text-right">{STEUERSAETZE[land].toFixed(1)}%</td>
                    <td className="py-1.5 text-right">{Math.round(kaufpreis * STEUERSAETZE[land] / 100).toLocaleString('de-DE')} EUR</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
