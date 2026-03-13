import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { TrendingUp, Info } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts'

function calcESt(zvE: number): number {
  if (zvE <= 12084) return 0
  if (zvE <= 17005) { const y = (zvE - 12084) / 10000; return Math.round((922.98 * y + 1400) * y) }
  if (zvE <= 66760) { const z = (zvE - 17005) / 10000; return Math.round((181.19 * z + 2397) * z + 1025.38) }
  if (zvE <= 277825) return Math.round(0.42 * zvE - 10394.14)
  return Math.round(0.45 * zvE - 18730.89)
}

function calcGrenzsteuersatz(zvE: number): number {
  if (zvE <= 12084) return 0
  if (zvE <= 17005) { const y = (zvE - 12084) / 10000; return Math.round((2 * 922.98 * y + 1400) * 100) / 10000 }
  if (zvE <= 66760) { const z = (zvE - 17005) / 10000; return Math.round((2 * 181.19 * z + 2397) * 100) / 10000 }
  if (zvE <= 277825) return 42
  return 45
}

export default function EinkommensteuerTarifPage() {
  const [markierung, setMarkierung] = useState(50000)
  const [splitting, setSplitting] = useState(false)

  const ergebnis = useMemo(() => {
    const zvE = splitting ? Math.round(markierung / 2) : markierung
    const est = calcESt(zvE) * (splitting ? 2 : 1)
    const grenz = calcGrenzsteuersatz(zvE)
    const durchschnitt = zvE > 0 ? Math.round(est / markierung * 10000) / 100 : 0

    // Tarifzonen
    const zonen = [
      { zone: 'Grundfreibetrag', von: 0, bis: 12084, satz: '0%' },
      { zone: 'Zone 1 (progressiv)', von: 12085, bis: 17005, satz: '14% – 24%' },
      { zone: 'Zone 2 (progressiv)', von: 17006, bis: 66760, satz: '24% – 42%' },
      { zone: 'Zone 3 (proportional)', von: 66761, bis: 277825, satz: '42%' },
      { zone: 'Reichensteuer', von: 277826, bis: 999999, satz: '45%' },
    ]

    // Chart-Daten: Tarif-Kurve
    const chartData: { zvE: number; est: number; grenz: number; durchschnitt: number }[] = []
    for (let z = 0; z <= 300000; z += 2500) {
      const e = calcESt(z)
      const g = calcGrenzsteuersatz(z)
      const d = z > 0 ? Math.round(e / z * 10000) / 100 : 0
      chartData.push({ zvE: z, est: e, grenz: g, durchschnitt: d })
    }

    return { est, grenz, durchschnitt, zonen, chartData }
  }, [markierung, splitting])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Einkommensteuer-Tarif 2025
        </h1>
        <p className="text-muted-foreground mt-1">
          § 32a EStG – Tarifzonen, Grenz- & Durchschnittssteuersatz
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Grundfreibetrag 2025:</strong> <strong>12.084 EUR</strong> – bis hier 0% Steuer.</p>
              <p><strong>Eingangssteuersatz:</strong> <strong>14%</strong> ab dem ersten Euro über dem Grundfreibetrag.</p>
              <p><strong>Spitzensteuersatz:</strong> <strong>42%</strong> ab 66.761 EUR. <strong>Reichensteuer 45%</strong> ab 277.826 EUR.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-primary">{ergebnis.est.toLocaleString('de-DE')} EUR</p>
            <p className="text-sm text-muted-foreground mt-1">Einkommensteuer</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-red-600">{ergebnis.grenz.toFixed(1)}%</p>
            <p className="text-sm text-muted-foreground mt-1">Grenzsteuersatz</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-orange-600">{ergebnis.durchschnitt.toFixed(1)}%</p>
            <p className="text-sm text-muted-foreground mt-1">Durchschnittssteuersatz</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Steuersatzkurven</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium">zvE: {markierung.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={300000} step={1000} value={markierung} onChange={e => setMarkierung(+e.target.value)} className="w-full accent-primary" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={splitting} onChange={e => setSplitting(e.target.checked)} className="accent-primary" />
              Splitting
            </label>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ergebnis.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="zvE" tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} domain={[0, 50]} />
                <Tooltip
                  formatter={(v: number, name: string) => [
                    name === 'est' ? `${v.toLocaleString('de-DE')} EUR` : `${v.toFixed(1)}%`,
                    name === 'grenz' ? 'Grenzsteuersatz' : name === 'durchschnitt' ? 'Durchschnittssteuersatz' : 'ESt'
                  ]}
                  labelFormatter={v => `zvE: ${Number(v).toLocaleString('de-DE')} EUR`}
                />
                <Legend />
                <ReferenceLine x={markierung} stroke="#7c3aed" strokeDasharray="5 5" />
                <Area type="monotone" dataKey="grenz" name="Grenzsteuersatz" fill="#ef444433" stroke="#ef4444" />
                <Area type="monotone" dataKey="durchschnitt" name="Durchschnittssteuersatz" fill="#f59e0b33" stroke="#f59e0b" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Tarifzonen 2025</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4">Zone</th>
                  <th className="py-2 pr-4 text-right">Von</th>
                  <th className="py-2 pr-4 text-right">Bis</th>
                  <th className="py-2 text-right">Steuersatz</th>
                </tr>
              </thead>
              <tbody>
                {ergebnis.zonen.map((z, i) => {
                  const inZone = markierung >= z.von && markierung <= z.bis
                  return (
                    <tr key={i} className={`border-b ${inZone ? 'bg-primary/5 font-medium' : ''}`}>
                      <td className="py-1.5 pr-4">{z.zone}</td>
                      <td className="py-1.5 pr-4 text-right">{z.von.toLocaleString('de-DE')} EUR</td>
                      <td className="py-1.5 pr-4 text-right">{z.bis.toLocaleString('de-DE')} EUR</td>
                      <td className="py-1.5 text-right">{z.satz}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
