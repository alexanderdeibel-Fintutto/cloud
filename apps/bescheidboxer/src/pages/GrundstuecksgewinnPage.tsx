import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Home, Info } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

function calcESt(zvE: number): number {
  if (zvE <= 12084) return 0
  if (zvE <= 17005) { const y = (zvE - 12084) / 10000; return Math.round((922.98 * y + 1400) * y) }
  if (zvE <= 66760) { const z = (zvE - 17005) / 10000; return Math.round((181.19 * z + 2397) * z + 1025.38) }
  if (zvE <= 277825) return Math.round(0.42 * zvE - 10394.14)
  return Math.round(0.45 * zvE - 18730.89)
}

export default function GrundstuecksgewinnPage() {
  const [kaufpreis, setKaufpreis] = useState(200000)
  const [verkaufspreis, setVerkaufspreis] = useState(350000)
  const [anschaffungsnebenkosten, setAnschaffungsnebenkosten] = useState(20000)
  const [verkaufsnebenkosten, setVerkaufsnebenkosten] = useState(15000)
  const [modernisierung, setModernisierung] = useState(30000)
  const [abschreibungen, setAbschreibungen] = useState(40000)
  const [haltedauer, setHaltedauer] = useState(5)
  const [zvE, setZvE] = useState(50000)
  const [splitting, setSplitting] = useState(false)

  const ergebnis = useMemo(() => {
    const steuerfrei = haltedauer >= 10
    const eigennutzung = false // Vereinfacht

    // Veräußerungsgewinn
    const anschaffungskosten = kaufpreis + anschaffungsnebenkosten + modernisierung - abschreibungen
    const gewinn = verkaufspreis - anschaffungskosten - verkaufsnebenkosten
    const steuerpflichtgerGewinn = steuerfrei ? 0 : Math.max(gewinn, 0)

    // Steuer auf Gewinn
    const zvEOhne = splitting ? Math.round(zvE / 2) : zvE
    const zvEMit = splitting ? Math.round((zvE + steuerpflichtgerGewinn) / 2) : zvE + steuerpflichtgerGewinn

    const estOhne = calcESt(zvEOhne) * (splitting ? 2 : 1)
    const estMit = calcESt(zvEMit) * (splitting ? 2 : 1)
    const mehrsteuer = estMit - estOhne

    const soliOhne = estOhne > (splitting ? 36260 : 18130) ? Math.round(estOhne * 0.055) : 0
    const soliMit = estMit > (splitting ? 36260 : 18130) ? Math.round(estMit * 0.055) : 0
    const mehrSoli = soliMit - soliOhne

    const steuerGesamt = mehrsteuer + mehrSoli
    const nettoGewinn = gewinn - steuerGesamt

    const grenzsteuersatz = zvEMit > 277825 ? 45 : zvEMit > 66760 ? 42 : zvEMit > 17005 ? 30 : zvEMit > 12084 ? 14 : 0
    const effektiverSatz = steuerpflichtgerGewinn > 0 ? Math.round(steuerGesamt / steuerpflichtgerGewinn * 10000) / 100 : 0

    // Haltefristen-Chart
    const chartData = [
      { name: 'Jahr 1-2', gewinn, steuer: steuerpflichtgerGewinn > 0 && haltedauer < 3 ? steuerGesamt : 0 },
      { name: 'Jahr 3-5', gewinn, steuer: steuerpflichtgerGewinn > 0 && haltedauer >= 3 && haltedauer < 6 ? steuerGesamt : 0 },
      { name: 'Jahr 6-9', gewinn, steuer: steuerpflichtgerGewinn > 0 && haltedauer >= 6 && haltedauer < 10 ? steuerGesamt : 0 },
      { name: 'Ab Jahr 10', gewinn, steuer: 0 },
    ]

    return {
      gewinn, steuerpflichtgerGewinn, anschaffungskosten,
      mehrsteuer, mehrSoli, steuerGesamt, nettoGewinn,
      steuerfrei, eigennutzung, grenzsteuersatz, effektiverSatz,
      chartData,
    }
  }, [kaufpreis, verkaufspreis, anschaffungsnebenkosten, verkaufsnebenkosten, modernisierung, abschreibungen, haltedauer, zvE, splitting])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Home className="h-6 w-6 text-primary" />
          Immobilienverkauf & Spekulationssteuer
        </h1>
        <p className="text-muted-foreground mt-1">
          Privates Veräußerungsgeschäft – § 23 EStG
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Spekulationsfrist:</strong> Immobilienverkauf innerhalb von <strong>10 Jahren</strong> nach Anschaffung ist steuerpflichtig.</p>
              <p><strong>Ausnahme:</strong> Eigennutzung im Veräußerungsjahr und den beiden Vorjahren (§ 23 Abs. 1 Nr. 1 S. 3).</p>
              <p><strong>Berechnung:</strong> Veräußerungsgewinn = Verkaufspreis − Anschaffungskosten − Veräußerungskosten.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Eingaben</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Kaufpreis: {kaufpreis.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={50000} max={1000000} step={5000} value={kaufpreis} onChange={e => setKaufpreis(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Verkaufspreis: {verkaufspreis.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={50000} max={1500000} step={5000} value={verkaufspreis} onChange={e => setVerkaufspreis(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Anschaffungsnebenkosten: {anschaffungsnebenkosten.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={100000} step={1000} value={anschaffungsnebenkosten} onChange={e => setAnschaffungsnebenkosten(+e.target.value)} className="w-full accent-primary" />
              <p className="text-xs text-muted-foreground mt-1">Grunderwerbsteuer, Notar, Makler, Grundbuch</p>
            </div>
            <div>
              <label className="text-sm font-medium">Verkaufsnebenkosten: {verkaufsnebenkosten.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={50000} step={1000} value={verkaufsnebenkosten} onChange={e => setVerkaufsnebenkosten(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Modernisierung (15%-Grenze): {modernisierung.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={200000} step={1000} value={modernisierung} onChange={e => setModernisierung(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Bisherige AfA: {abschreibungen.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={100000} step={1000} value={abschreibungen} onChange={e => setAbschreibungen(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Haltedauer: {haltedauer} Jahre</label>
              <input type="range" min={1} max={15} value={haltedauer} onChange={e => setHaltedauer(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Übriges zvE: {zvE.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={200000} step={1000} value={zvE} onChange={e => setZvE(+e.target.value)} className="w-full accent-primary" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={splitting} onChange={e => setSplitting(e.target.checked)} className="accent-primary" />
              Zusammenveranlagung
            </label>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader><CardTitle className="text-lg">Ergebnis</CardTitle></CardHeader>
          <CardContent>
            {ergebnis.steuerfrei ? (
              <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-4 text-center mb-6">
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">Steuerfrei!</p>
                <p className="text-sm text-muted-foreground mt-1">Spekulationsfrist von 10 Jahren abgelaufen</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 mb-6">
                <div className="rounded-lg bg-primary/10 p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{ergebnis.nettoGewinn.toLocaleString('de-DE')} EUR</p>
                  <p className="text-xs text-muted-foreground mt-1">Netto-Gewinn</p>
                </div>
                <div className="rounded-lg bg-red-100 dark:bg-red-900/30 p-4 text-center">
                  <p className="text-2xl font-bold text-red-700 dark:text-red-400">{ergebnis.steuerGesamt.toLocaleString('de-DE')} EUR</p>
                  <p className="text-xs text-muted-foreground mt-1">Steuer auf Gewinn</p>
                </div>
              </div>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Verkaufspreis</span>
                <span className="font-medium">{verkaufspreis.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Anschaffungskosten (bereinigt)</span>
                <span className="font-medium">{ergebnis.anschaffungskosten.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Verkaufsnebenkosten</span>
                <span className="font-medium">{verkaufsnebenkosten.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Veräußerungsgewinn</span>
                <span className={`font-medium ${ergebnis.gewinn >= 0 ? 'text-green-600' : 'text-red-600'}`}>{ergebnis.gewinn.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Steuerpflichtiger Gewinn</span>
                <span className="font-medium">{ergebnis.steuerpflichtgerGewinn.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Grenzsteuersatz</span>
                <span className="font-medium">{ergebnis.grenzsteuersatz}%</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Effektiver Steuersatz</span>
                <span className="font-medium">{ergebnis.effektiverSatz.toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Haltefrist-Auswirkung</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ergebnis.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR`} />
                <Legend />
                <Bar dataKey="gewinn" name="Gewinn" fill="#22c55e" />
                <Bar dataKey="steuer" name="Steuer" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Ab 10 Jahren Haltedauer: Veräußerungsgewinn komplett steuerfrei
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Wichtige Hinweise</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 text-sm">
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium">Spekulationsfrist</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>- 10 Jahre ab Anschaffung (Kaufvertrag)</li>
                <li>- Gilt pro Objekt einzeln</li>
                <li>- Erbschaft: Frist des Erblassers</li>
                <li>- Schenkung: Frist des Schenkers</li>
              </ul>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium">Eigennutzung (steuerfrei)</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>- Ausschließlich eigene Wohnzwecke</li>
                <li>- Im Veräußerungsjahr + 2 Vorjahre</li>
                <li>- Oder seit Anschaffung durchgehend</li>
                <li>- Auch bei Haltedauer unter 10 Jahren</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
