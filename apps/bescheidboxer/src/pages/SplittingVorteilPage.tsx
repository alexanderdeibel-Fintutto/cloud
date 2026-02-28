import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { UsersRound, Info } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

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

export default function SplittingVorteilPage() {
  const [einkommenA, setEinkommenA] = useState(60000)
  const [einkommenB, setEinkommenB] = useState(25000)
  const [kirchensteuerA, setKirchensteuerA] = useState(false)
  const [kirchensteuerB, setKirchensteuerB] = useState(false)

  const ergebnis = useMemo(() => {
    // Einzelveranlagung
    const estA = calcESt(einkommenA)
    const estB = calcESt(einkommenB)
    const einzelGesamt = estA + estB

    // Zusammenveranlagung (Splitting)
    const gemeinsamZvE = einkommenA + einkommenB
    const splittingZvE = Math.round(gemeinsamZvE / 2)
    const estSplitting = calcESt(splittingZvE) * 2

    // Splitting-Vorteil
    const vorteil = einzelGesamt - estSplitting

    // Soli
    const soliEinzelA = estA > 18130 ? Math.round(estA * 0.055) : 0
    const soliEinzelB = estB > 18130 ? Math.round(estB * 0.055) : 0
    const soliEinzel = soliEinzelA + soliEinzelB
    const soliSplitting = estSplitting > 36260 ? Math.round(estSplitting * 0.055) : 0

    // KiSt
    const kistEinzelA = kirchensteuerA ? Math.round(estA * 0.09) : 0
    const kistEinzelB = kirchensteuerB ? Math.round(estB * 0.09) : 0
    const kistEinzel = kistEinzelA + kistEinzelB
    const kistSplitting = (kirchensteuerA || kirchensteuerB) ? Math.round(estSplitting * 0.09 * ((kirchensteuerA ? 1 : 0) + (kirchensteuerB ? 1 : 0)) / 2) : 0

    const gesamtEinzel = einzelGesamt + soliEinzel + kistEinzel
    const gesamtSplitting = estSplitting + soliSplitting + kistSplitting
    const gesamtVorteil = gesamtEinzel - gesamtSplitting

    // Grenzsteuersätze
    const grenzA = einkommenA > 277825 ? 45 : einkommenA > 66760 ? 42 : einkommenA > 17005 ? 30 : einkommenA > 12084 ? 14 : 0
    const grenzB = einkommenB > 277825 ? 45 : einkommenB > 66760 ? 42 : einkommenB > 17005 ? 30 : einkommenB > 12084 ? 14 : 0
    const grenzSplitting = splittingZvE > 277825 ? 45 : splittingZvE > 66760 ? 42 : splittingZvE > 17005 ? 30 : splittingZvE > 12084 ? 14 : 0

    // Chart: Vorteil bei verschiedenen Einkommensverhältnissen
    const chartData = Array.from({ length: 11 }, (_, i) => {
      const anteilB = i * 10
      const gesamt = einkommenA + einkommenB
      const eA = Math.round(gesamt * (100 - anteilB) / 100)
      const eB = gesamt - eA
      const estEinz = calcESt(eA) + calcESt(eB)
      const estSpl = calcESt(Math.round(gesamt / 2)) * 2
      return {
        verteilung: `${100 - anteilB}/${anteilB}`,
        einzelveranlagung: estEinz,
        splitting: estSpl,
        vorteil: estEinz - estSpl,
      }
    })

    return {
      estA, estB, einzelGesamt,
      splittingZvE, estSplitting, vorteil,
      soliEinzel, soliSplitting,
      kistEinzel, kistSplitting,
      gesamtEinzel, gesamtSplitting, gesamtVorteil,
      grenzA, grenzB, grenzSplitting,
      gemeinsamZvE,
      chartData,
    }
  }, [einkommenA, einkommenB, kirchensteuerA, kirchensteuerB])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <UsersRound className="h-6 w-6 text-primary" />
          Splitting-Vorteil
        </h1>
        <p className="text-muted-foreground mt-1">
          Ehegattensplitting – § 32a Abs. 5 EStG
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Splittingverfahren:</strong> Gemeinsames Einkommen wird halbiert, Tarif angewendet und verdoppelt.</p>
              <p><strong>Vorteil:</strong> Je <strong>groesser der Einkommensunterschied</strong>, desto groesser der Splitting-Vorteil.</p>
              <p><strong>Kein Vorteil:</strong> Bei gleich hohen Einkommen beider Partner (50/50).</p>
              <p><strong>Max. Vorteil 2025:</strong> Ca. 20.600 EUR (wenn ein Partner 0 EUR verdient).</p>
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
              <label className="text-sm font-medium">Partner A – zvE: {einkommenA.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={300000} step={1000} value={einkommenA} onChange={e => setEinkommenA(+e.target.value)} className="w-full accent-primary" />
              <p className="text-xs text-muted-foreground">Grenzsteuersatz: {ergebnis.grenzA}%</p>
            </div>
            <div>
              <label className="text-sm font-medium">Partner B – zvE: {einkommenB.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={300000} step={1000} value={einkommenB} onChange={e => setEinkommenB(+e.target.value)} className="w-full accent-primary" />
              <p className="text-xs text-muted-foreground">Grenzsteuersatz: {ergebnis.grenzB}%</p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={kirchensteuerA} onChange={e => setKirchensteuerA(e.target.checked)} className="accent-primary" />
                Partner A: Kirchensteuer
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={kirchensteuerB} onChange={e => setKirchensteuerB(e.target.checked)} className="accent-primary" />
                Partner B: Kirchensteuer
              </label>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">Ergebnis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-4 text-center mb-6">
              <p className="text-3xl font-bold text-green-700 dark:text-green-400">{ergebnis.gesamtVorteil.toLocaleString('de-DE')} EUR</p>
              <p className="text-sm text-muted-foreground mt-1">Splitting-Vorteil/Jahr</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 pr-4"></th>
                    <th className="py-2 pr-4 text-right">Einzelveranlagung</th>
                    <th className="py-2 text-right">Zusammenveranlagung</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-1.5 pr-4 text-muted-foreground">zvE gesamt</td>
                    <td className="py-1.5 pr-4 text-right">{ergebnis.gemeinsamZvE.toLocaleString('de-DE')} EUR</td>
                    <td className="py-1.5 text-right">{ergebnis.gemeinsamZvE.toLocaleString('de-DE')} EUR</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1.5 pr-4 text-muted-foreground">Tarif angewendet auf</td>
                    <td className="py-1.5 pr-4 text-right">{einkommenA.toLocaleString('de-DE')} / {einkommenB.toLocaleString('de-DE')}</td>
                    <td className="py-1.5 text-right">{ergebnis.splittingZvE.toLocaleString('de-DE')} × 2</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1.5 pr-4 text-muted-foreground">ESt</td>
                    <td className="py-1.5 pr-4 text-right">{ergebnis.einzelGesamt.toLocaleString('de-DE')} EUR</td>
                    <td className="py-1.5 text-right">{ergebnis.estSplitting.toLocaleString('de-DE')} EUR</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1.5 pr-4 text-muted-foreground">Soli</td>
                    <td className="py-1.5 pr-4 text-right">{ergebnis.soliEinzel.toLocaleString('de-DE')} EUR</td>
                    <td className="py-1.5 text-right">{ergebnis.soliSplitting.toLocaleString('de-DE')} EUR</td>
                  </tr>
                  {(ergebnis.kistEinzel > 0 || ergebnis.kistSplitting > 0) && (
                    <tr className="border-b">
                      <td className="py-1.5 pr-4 text-muted-foreground">KiSt</td>
                      <td className="py-1.5 pr-4 text-right">{ergebnis.kistEinzel.toLocaleString('de-DE')} EUR</td>
                      <td className="py-1.5 text-right">{ergebnis.kistSplitting.toLocaleString('de-DE')} EUR</td>
                    </tr>
                  )}
                  <tr className="border-t-2 font-bold">
                    <td className="py-2 pr-4">Gesamt</td>
                    <td className="py-2 pr-4 text-right text-red-600">{ergebnis.gesamtEinzel.toLocaleString('de-DE')} EUR</td>
                    <td className="py-2 text-right text-green-600">{ergebnis.gesamtSplitting.toLocaleString('de-DE')} EUR</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Splitting-Vorteil nach Einkommensverteilung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ergebnis.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="verteilung" tick={{ fontSize: 10 }} label={{ value: 'Verteilung A/B', position: 'bottom', fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR`} />
                <Legend />
                <Bar dataKey="einzelveranlagung" name="Einzelveranlagung" fill="#ef4444" />
                <Bar dataKey="splitting" name="Splitting" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Bei Gesamteinkommen {ergebnis.gemeinsamZvE.toLocaleString('de-DE')} EUR
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
