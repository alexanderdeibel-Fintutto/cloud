import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Table2, Info } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

function calcESt(zvE: number): number {
  if (zvE <= 12084) return 0
  if (zvE <= 17005) {
    const y = (zvE - 12084) / 10000
    return Math.round((922.98 * y + 1400) * y)
  }
  if (zvE <= 66760) {
    const z = (zvE - 17005) / 10000
    return Math.round((181.19 * z + 2397) * z + 1025.38)
  }
  if (zvE <= 277825) {
    return Math.round(0.42 * zvE - 10394.14)
  }
  return Math.round(0.45 * zvE - 18730.89)
}

function calcGrenzsteuersatz(zvE: number): number {
  if (zvE <= 12084) return 0
  if (zvE <= 17005) {
    const y = (zvE - 12084) / 10000
    return Math.round((2 * 922.98 * y + 1400) * 100) / 100
  }
  if (zvE <= 66760) {
    const z = (zvE - 17005) / 10000
    return Math.round((2 * 181.19 * z + 2397) * 100) / 100
  }
  if (zvE <= 277825) return 42
  return 45
}

export default function EinkommensteuerTabellenPage() {
  const [modus, setModus] = useState<'grundtabelle' | 'splittingtabelle'>('grundtabelle')
  const [vonZvE, setVonZvE] = useState(10000)
  const [bisZvE, setBisZvE] = useState(100000)
  const [schrittweite, setSchrittweite] = useState(5000)
  const [kirchensteuer, setKirchensteuer] = useState(false)
  const [kirchensteuersatz, setKirchensteuersatz] = useState(9)

  const ergebnis = useMemo(() => {
    const zeilen: Array<{
      zvE: number
      est: number
      soli: number
      kist: number
      gesamt: number
      durchschnitt: number
      grenz: number
    }> = []

    for (let z = vonZvE; z <= bisZvE; z += schrittweite) {
      const berechneZvE = modus === 'splittingtabelle' ? Math.round(z / 2) : z
      let est = calcESt(berechneZvE)
      if (modus === 'splittingtabelle') est *= 2

      // Soli
      const soliFrei = modus === 'splittingtabelle' ? 36260 : 18130
      let soli = 0
      if (est > soliFrei) {
        const ueber = est - soliFrei
        const soli20 = Math.round(ueber * 0.119)
        const soliVoll = Math.round(est * 0.055)
        soli = Math.min(soli20, soliVoll)
      }

      // Kirchensteuer
      const kist = kirchensteuer ? Math.round(est * kirchensteuersatz / 100) : 0

      const gesamt = est + soli + kist
      const durchschnitt = z > 0 ? Math.round(est / z * 10000) / 100 : 0
      const grenz = calcGrenzsteuersatz(berechneZvE)

      zeilen.push({ zvE: z, est, soli, kist, gesamt, durchschnitt, grenz })
    }

    // Chart data
    const chartData = Array.from({ length: 50 }, (_, i) => {
      const z = (i + 1) * 5000
      const bz = modus === 'splittingtabelle' ? Math.round(z / 2) : z
      let e = calcESt(bz)
      if (modus === 'splittingtabelle') e *= 2
      const d = z > 0 ? Math.round(e / z * 100) : 0
      const g = calcGrenzsteuersatz(bz)
      return { zvE: z, durchschnitt: d, grenz: g }
    })

    return { zeilen, chartData }
  }, [modus, vonZvE, bisZvE, schrittweite, kirchensteuer, kirchensteuersatz])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Table2 className="h-6 w-6 text-primary" />
          Einkommensteuer-Tabellen
        </h1>
        <p className="text-muted-foreground mt-1">
          Grund- & Splittingtabelle 2025 – § 32a EStG
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Grundtabelle:</strong> Fuer Einzelveranlagung (Ledige, Geschiedene, Getrenntlebende).</p>
              <p><strong>Splittingtabelle:</strong> Fuer Zusammenveranlagung (Ehepaare). zvE wird halbiert, ESt verdoppelt.</p>
              <p><strong>Tarif 2025:</strong> Grundfreibetrag 12.084 EUR | Eingangssteuersatz 14% | Spitzensteuersatz 42% (ab 66.761 EUR) | Reichensteuer 45% (ab 277.826 EUR).</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Einstellungen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            {(['grundtabelle', 'splittingtabelle'] as const).map(m => (
              <button key={m} onClick={() => setModus(m)} className={`rounded-md px-4 py-2 text-sm ${modus === m ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {m === 'grundtabelle' ? 'Grundtabelle' : 'Splittingtabelle'}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="text-sm font-medium">Von: {vonZvE.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={200000} step={5000} value={vonZvE} onChange={e => setVonZvE(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Bis: {bisZvE.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={20000} max={500000} step={5000} value={bisZvE} onChange={e => setBisZvE(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Schrittweite: {schrittweite.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={1000} max={10000} step={1000} value={schrittweite} onChange={e => setSchrittweite(+e.target.value)} className="w-full accent-primary" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={kirchensteuer} onChange={e => setKirchensteuer(e.target.checked)} className="accent-primary" />
              Kirchensteuer
            </label>
            {kirchensteuer && (
              <div className="flex gap-2">
                {([8, 9] as const).map(v => (
                  <button key={v} onClick={() => setKirchensteuersatz(v)} className={`rounded-md px-3 py-1 text-sm ${kirchensteuersatz === v ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {v}%
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {modus === 'grundtabelle' ? 'Grundtabelle' : 'Splittingtabelle'} 2025
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4 text-right">zvE</th>
                  <th className="py-2 pr-4 text-right">ESt</th>
                  <th className="py-2 pr-4 text-right">Soli</th>
                  {kirchensteuer && <th className="py-2 pr-4 text-right">KiSt</th>}
                  <th className="py-2 pr-4 text-right">Gesamt</th>
                  <th className="py-2 pr-4 text-right">Durchschn.</th>
                  <th className="py-2 text-right">Grenz</th>
                </tr>
              </thead>
              <tbody>
                {ergebnis.zeilen.map(z => (
                  <tr key={z.zvE} className="border-b hover:bg-muted/50">
                    <td className="py-1.5 pr-4 text-right font-medium">{z.zvE.toLocaleString('de-DE')}</td>
                    <td className="py-1.5 pr-4 text-right">{z.est.toLocaleString('de-DE')}</td>
                    <td className="py-1.5 pr-4 text-right">{z.soli.toLocaleString('de-DE')}</td>
                    {kirchensteuer && <td className="py-1.5 pr-4 text-right">{z.kist.toLocaleString('de-DE')}</td>}
                    <td className="py-1.5 pr-4 text-right font-bold">{z.gesamt.toLocaleString('de-DE')}</td>
                    <td className="py-1.5 pr-4 text-right text-muted-foreground">{z.durchschnitt.toFixed(1)}%</td>
                    <td className="py-1.5 text-right text-muted-foreground">{z.grenz.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Alle Betraege in EUR. Steuertarif 2025 (§ 32a EStG).</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Steuersatz-Verlauf</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ergebnis.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="zvE" tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} domain={[0, 50]} />
                <Tooltip
                  formatter={(v: number, name: string) => [`${v.toFixed(1)}%`, name === 'durchschnitt' ? 'Durchschnittssteuersatz' : 'Grenzsteuersatz']}
                  labelFormatter={v => `zvE: ${Number(v).toLocaleString('de-DE')} EUR`}
                />
                <Legend />
                <Area type="monotone" dataKey="grenz" name="Grenzsteuersatz" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
                <Area type="monotone" dataKey="durchschnitt" name="Durchschnittssteuersatz" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Grundfreibetrag 12.084 EUR | Spitzensteuersatz 42% ab 66.761 EUR | Reichensteuer 45% ab 277.826 EUR
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tarifzonen 2025</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm">
            <div className="rounded-lg bg-green-100 dark:bg-green-900/20 p-3 text-center">
              <p className="text-lg font-bold text-green-700 dark:text-green-400">0%</p>
              <p className="text-xs text-muted-foreground">Bis 12.084 EUR</p>
              <p className="text-xs text-muted-foreground">Grundfreibetrag</p>
            </div>
            <div className="rounded-lg bg-yellow-100 dark:bg-yellow-900/20 p-3 text-center">
              <p className="text-lg font-bold text-yellow-700 dark:text-yellow-400">14-24%</p>
              <p className="text-xs text-muted-foreground">12.085–17.005 EUR</p>
              <p className="text-xs text-muted-foreground">Progressionszone 1</p>
            </div>
            <div className="rounded-lg bg-orange-100 dark:bg-orange-900/20 p-3 text-center">
              <p className="text-lg font-bold text-orange-700 dark:text-orange-400">24-42%</p>
              <p className="text-xs text-muted-foreground">17.006–66.760 EUR</p>
              <p className="text-xs text-muted-foreground">Progressionszone 2</p>
            </div>
            <div className="rounded-lg bg-red-100 dark:bg-red-900/20 p-3 text-center">
              <p className="text-lg font-bold text-red-700 dark:text-red-400">42% / 45%</p>
              <p className="text-xs text-muted-foreground">Ab 66.761 / 277.826 EUR</p>
              <p className="text-xs text-muted-foreground">Spitzen-/Reichensteuer</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
