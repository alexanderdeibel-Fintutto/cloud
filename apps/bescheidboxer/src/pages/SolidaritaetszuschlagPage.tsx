import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { HandCoins, Info } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function calcESt(zvE: number): number {
  if (zvE <= 0) return 0
  if (zvE <= 11784) return 0
  if (zvE <= 17005) {
    const y = (zvE - 11784) / 10000
    return Math.floor((922.98 * y + 1400) * y)
  }
  if (zvE <= 66760) {
    const z = (zvE - 17005) / 10000
    return Math.floor((181.19 * z + 2397) * z + 1025.38)
  }
  if (zvE <= 277825) {
    return Math.floor(0.42 * zvE - 10602.13)
  }
  return Math.floor(0.45 * zvE - 18936.88)
}

function calcSoli(est: number, zusammen: boolean): number {
  // Seit 2021: Freigrenze 17.543 € (Einzel) / 35.086 € (Zusammen)
  // Milderungszone: 11,9% Grenzbelastung
  const freigrenze = zusammen ? 35086 : 17543

  if (est <= freigrenze) return 0

  // Milderungszone: Soli = min(5,5% × ESt, 11,9% × (ESt - Freigrenze))
  const normalSoli = est * 0.055
  const milderungsSoli = (est - freigrenze) * 0.119

  return Math.round(Math.min(normalSoli, milderungsSoli) * 100) / 100
}

export default function SolidaritaetszuschlagPage() {
  const [zvE, setZvE] = useState(90000)
  const [zusammen, setZusammen] = useState(false)
  const [kinder, setKinder] = useState(0)

  const ergebnis = useMemo(() => {
    // ESt berechnen
    let est: number
    if (zusammen) {
      est = 2 * calcESt(Math.floor(zvE / 2))
    } else {
      est = calcESt(zvE)
    }

    // Kinderfreibetrag-Effekt auf Soli (Soli-Bemessungsgrundlage berücksichtigt Kinderfreibeträge immer)
    const kinderfreibetragGesamt = kinder * (6612 + 2928) // KFB + BEA pro Kind
    const zvESoli = Math.max(0, zvE - kinderfreibetragGesamt)
    let estSoli: number
    if (zusammen) {
      estSoli = 2 * calcESt(Math.floor(zvESoli / 2))
    } else {
      estSoli = calcESt(zvESoli)
    }

    const soli = calcSoli(estSoli, zusammen)
    const freigrenze = zusammen ? 35086 : 17543
    const maxSoli = estSoli * 0.055
    const inMilderung = soli < maxSoli && soli > 0

    return {
      est,
      estSoli,
      soli,
      freigrenze,
      maxSoli: Math.round(maxSoli * 100) / 100,
      inMilderung,
      effektiverSatz: estSoli > 0 ? Math.round(soli / estSoli * 10000) / 100 : 0,
    }
  }, [zvE, zusammen, kinder])

  // Chart: Soli-Verlauf über verschiedene Einkommen
  const chartData = useMemo(() => {
    const data = []
    for (let eink = 10000; eink <= 250000; eink += 2500) {
      const kfb = kinder * (6612 + 2928)
      const zvESoli = Math.max(0, eink - kfb)
      let estSoli: number
      if (zusammen) {
        estSoli = 2 * calcESt(Math.floor(zvESoli / 2))
      } else {
        estSoli = calcESt(zvESoli)
      }
      const soli = calcSoli(estSoli, zusammen)
      data.push({
        einkommen: eink,
        soli: Math.round(soli),
        est: Math.round(estSoli),
      })
    }
    return data
  }, [zusammen, kinder])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <HandCoins className="h-6 w-6 text-primary" />
          Solidaritätszuschlag-Rechner
        </h1>
        <p className="text-muted-foreground mt-1">
          Soli berechnen mit Freigrenze und Milderungszone seit 2021
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Seit 2021:</strong> ~90% der Steuerzahler zahlen keinen Soli mehr. Freigrenze: 17.543 € ESt (Einzel) / 35.086 € (Zusammenveranlagung).</p>
              <p><strong>Milderungszone:</strong> Oberhalb der Freigrenze steigt der Soli schrittweise auf max. 5,5% der ESt (Grenzbelastung 11,9%).</p>
              <p><strong>Kinderfreibetrag:</strong> Für den Soli werden Kinderfreibeträge immer berücksichtigt, unabhängig von der Günstigerprüfung (Kindergeld vs. Freibetrag).</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Eingaben</CardTitle>
            <CardDescription>Einkommen und Familienstand</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Zu versteuerndes Einkommen: {zvE.toLocaleString('de-DE')} €</label>
              <input type="range" min={10000} max={300000} step={1000} value={zvE} onChange={e => setZvE(+e.target.value)} className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-muted-foreground"><span>10.000 €</span><span>300.000 €</span></div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="zusammen" checked={zusammen} onChange={e => setZusammen(e.target.checked)} className="rounded" />
              <label htmlFor="zusammen" className="text-sm">Zusammenveranlagung</label>
            </div>
            <div>
              <label className="text-sm font-medium">Kinder: {kinder}</label>
              <input type="range" min={0} max={6} value={kinder} onChange={e => setKinder(+e.target.value)} className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-muted-foreground"><span>0</span><span>6</span></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">Ergebnis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-lg bg-primary/10 p-3 text-center">
                <p className="text-xl font-bold text-primary">{ergebnis.soli.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</p>
                <p className="text-xs text-muted-foreground mt-0.5">Solidaritätszuschlag</p>
              </div>
              <div className="rounded-lg bg-muted p-3 text-center">
                <p className="text-xl font-bold">{ergebnis.effektiverSatz} %</p>
                <p className="text-xs text-muted-foreground mt-0.5">Effektiver Soli-Satz</p>
              </div>
            </div>

            {ergebnis.soli === 0 ? (
              <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-4 text-center">
                <p className="text-lg font-bold text-green-700 dark:text-green-400">Kein Soli fällig!</p>
                <p className="text-xs text-muted-foreground mt-1">ESt-Bemessungsgrundlage ({ergebnis.estSoli.toLocaleString('de-DE')} €) liegt unter der Freigrenze ({ergebnis.freigrenze.toLocaleString('de-DE')} €)</p>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">ESt (gesamt)</span><span>{ergebnis.est.toLocaleString('de-DE')} €</span></div>
                <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">ESt Soli-Bemessung</span><span>{ergebnis.estSoli.toLocaleString('de-DE')} €</span></div>
                <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Freigrenze</span><span>{ergebnis.freigrenze.toLocaleString('de-DE')} €</span></div>
                <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Voller Soli (5,5%)</span><span>{ergebnis.maxSoli.toLocaleString('de-DE')} €</span></div>
                {ergebnis.inMilderung && (
                  <div className="flex justify-between py-1 border-b text-amber-600">
                    <span>In Milderungszone</span><span>11,9% Grenzbelastung</span>
                  </div>
                )}
                <div className="flex justify-between py-1 font-medium"><span>Soli zu zahlen</span><span className="text-primary">{ergebnis.soli.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span></div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Soli-Verlauf nach Einkommen</CardTitle>
          <CardDescription>Freigrenze und Milderungszone visualisiert</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="einkommen" tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v.toLocaleString('de-DE')} €`} />
                <Tooltip
                  formatter={(v: number, name: string) => [`${v.toLocaleString('de-DE')} €`, name === 'soli' ? 'Soli' : 'ESt']}
                  labelFormatter={v => `Einkommen: ${Number(v).toLocaleString('de-DE')} €`}
                />
                <Area type="monotone" dataKey="soli" name="Soli" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Stufen-Tabelle */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Soli-Stufen im Überblick</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4">ESt-Bereich</th>
                  <th className="py-2 pr-4">Soli-Satz</th>
                  <th className="py-2">Beschreibung</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 pr-4">0 – {(zusammen ? 35086 : 17543).toLocaleString('de-DE')} €</td>
                  <td className="py-2 pr-4 text-green-600 font-medium">0 %</td>
                  <td className="py-2 text-muted-foreground">Freigrenze – kein Soli</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4">{(zusammen ? 35086 : 17543).toLocaleString('de-DE')} – ~{(zusammen ? 105000 : 52500).toLocaleString('de-DE')} €</td>
                  <td className="py-2 pr-4 text-amber-600 font-medium">0 – 5,5 %</td>
                  <td className="py-2 text-muted-foreground">Milderungszone (11,9% Grenzbelastung)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">ab ~{(zusammen ? 105000 : 52500).toLocaleString('de-DE')} €</td>
                  <td className="py-2 pr-4 text-red-600 font-medium">5,5 %</td>
                  <td className="py-2 text-muted-foreground">Voller Solidaritätszuschlag</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
