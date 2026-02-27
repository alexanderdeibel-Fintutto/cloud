import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Church, Info } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const KIRCHENSTEUER_SAETZE: Record<string, number> = {
  'Baden-Wuerttemberg': 8,
  'Bayern': 8,
  'Berlin': 9,
  'Brandenburg': 9,
  'Bremen': 9,
  'Hamburg': 9,
  'Hessen': 9,
  'Mecklenburg-Vorpommern': 9,
  'Niedersachsen': 9,
  'Nordrhein-Westfalen': 9,
  'Rheinland-Pfalz': 9,
  'Saarland': 9,
  'Sachsen': 9,
  'Sachsen-Anhalt': 9,
  'Schleswig-Holstein': 9,
  'Thueringen': 9,
}

function calcESt(zvE: number): number {
  if (zvE <= 11784) return 0
  if (zvE <= 17005) {
    const y = (zvE - 11784) / 10000
    return Math.round((922.98 * y + 1400) * y)
  }
  if (zvE <= 66760) {
    const z = (zvE - 17005) / 10000
    return Math.round((181.19 * z + 2397) * z + 1025.38)
  }
  if (zvE <= 277825) {
    return Math.round(0.42 * zvE - 10602.13)
  }
  return Math.round(0.45 * zvE - 18936.88)
}

export default function KirchensteuerRechnerPage() {
  const [zvE, setZvE] = useState(55000)
  const [bundesland, setBundesland] = useState('Bayern')
  const [verheiratet, setVerheiratet] = useState(false)
  const [kappung, setKappung] = useState(true)
  const [zvEPartner, setZvEPartner] = useState(30000)
  const [partnerKirche, setPartnerKirche] = useState(true)

  const ergebnis = useMemo(() => {
    const satz = KIRCHENSTEUER_SAETZE[bundesland] || 9

    let est: number
    let kirchensteuer: number

    if (verheiratet) {
      const gesamtZvE = zvE + zvEPartner
      est = calcESt(gesamtZvE) // Splitting
      const estSplitting = calcESt(Math.round(gesamtZvE / 2)) * 2
      est = estSplitting

      if (partnerKirche) {
        kirchensteuer = Math.round(est * satz / 100)
      } else {
        // Nur ein Partner: halbe Kirchensteuer
        kirchensteuer = Math.round(est * satz / 200)
      }
    } else {
      est = calcESt(zvE)
      kirchensteuer = Math.round(est * satz / 100)
    }

    // Kappung: Kirchensteuer max 2,75% (BY) oder 3,5% des zvE
    const kappungsGrenze = bundesland === 'Bayern' || bundesland === 'Baden-Wuerttemberg'
      ? Math.round((verheiratet ? zvE + zvEPartner : zvE) * 0.0275)
      : Math.round((verheiratet ? zvE + zvEPartner : zvE) * 0.035)

    const mitKappung = kappung && kirchensteuer > kappungsGrenze
    const effektiveKirchensteuer = mitKappung ? kappungsGrenze : kirchensteuer
    const ersparnis = mitKappung ? kirchensteuer - kappungsGrenze : 0

    // Kirchensteuer als Sonderausgabe -> Steuerersparnis
    const grenzsteuersatz = zvE > 277825 ? 45 : zvE > 66760 ? 42 : 30
    const steuerersparnisKiSt = Math.round(effektiveKirchensteuer * grenzsteuersatz / 100)

    const monat = Math.round(effektiveKirchensteuer / 12)
    const nettoKirchensteuer = effektiveKirchensteuer - steuerersparnisKiSt

    return {
      satz,
      est,
      kirchensteuer,
      kappungsGrenze,
      mitKappung,
      effektiveKirchensteuer,
      ersparnis,
      steuerersparnisKiSt,
      nettoKirchensteuer,
      monat,
      grenzsteuersatz,
    }
  }, [zvE, bundesland, verheiratet, kappung, zvEPartner, partnerKirche])

  const chartData = [
    { name: '30k', est: calcESt(30000), kist: Math.round(calcESt(30000) * (KIRCHENSTEUER_SAETZE[bundesland] || 9) / 100) },
    { name: '50k', est: calcESt(50000), kist: Math.round(calcESt(50000) * (KIRCHENSTEUER_SAETZE[bundesland] || 9) / 100) },
    { name: '75k', est: calcESt(75000), kist: Math.round(calcESt(75000) * (KIRCHENSTEUER_SAETZE[bundesland] || 9) / 100) },
    { name: '100k', est: calcESt(100000), kist: Math.round(calcESt(100000) * (KIRCHENSTEUER_SAETZE[bundesland] || 9) / 100) },
    { name: '150k', est: calcESt(150000), kist: Math.round(calcESt(150000) * (KIRCHENSTEUER_SAETZE[bundesland] || 9) / 100) },
    { name: '200k', est: calcESt(200000), kist: Math.round(calcESt(200000) * (KIRCHENSTEUER_SAETZE[bundesland] || 9) / 100) },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Church className="h-6 w-6 text-primary" />
          Kirchensteuer-Rechner
        </h1>
        <p className="text-muted-foreground mt-1">
          Kirchensteuer berechnen – 8% (BY/BW) oder 9% der Einkommensteuer
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Kirchensteuer:</strong> 9% der ESt (8% in Bayern und Baden-Wuerttemberg). Wird als Zuschlag auf die Einkommensteuer erhoben.</p>
              <p><strong>Kappung:</strong> In vielen Bundeslaendern wird die Kirchensteuer auf 2,75-3,5% des zvE gekappt (relevant bei hohen Einkommen).</p>
              <p><strong>Sonderausgabenabzug:</strong> Gezahlte Kirchensteuer ist voll als Sonderausgabe absetzbar (§ 10 Abs. 1 Nr. 4 EStG).</p>
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
              <label className="text-sm font-medium">Zu versteuerndes Einkommen: {zvE.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={12000} max={300000} step={1000} value={zvE} onChange={e => setZvE(+e.target.value)} className="w-full accent-primary" />
            </div>

            <div>
              <label className="text-sm font-medium">Bundesland</label>
              <select value={bundesland} onChange={e => setBundesland(e.target.value)} className="w-full mt-1 rounded-md border px-3 py-2 text-sm bg-background">
                {Object.keys(KIRCHENSTEUER_SAETZE).sort().map(l => (
                  <option key={l} value={l}>{l} ({KIRCHENSTEUER_SAETZE[l]}%)</option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={verheiratet} onChange={e => setVerheiratet(e.target.checked)} className="rounded" />
              Verheiratet (Zusammenveranlagung)
            </label>

            {verheiratet && (
              <>
                <div>
                  <label className="text-sm font-medium">zvE Partner: {zvEPartner.toLocaleString('de-DE')} EUR</label>
                  <input type="range" min={0} max={200000} step={1000} value={zvEPartner} onChange={e => setZvEPartner(+e.target.value)} className="w-full accent-primary" />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={partnerKirche} onChange={e => setPartnerKirche(e.target.checked)} className="rounded" />
                  Partner ist auch Kirchenmitglied
                </label>
              </>
            )}

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={kappung} onChange={e => setKappung(e.target.checked)} className="rounded" />
              Kappung beruecksichtigen
            </label>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">Ergebnis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 mb-6">
              <div className="rounded-lg bg-primary/10 p-4 text-center">
                <p className="text-2xl font-bold text-primary">{ergebnis.effektiveKirchensteuer.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Kirchensteuer/Jahr</p>
              </div>
              <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-4 text-center">
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{ergebnis.nettoKirchensteuer.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Netto (nach SA-Abzug)</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Einkommensteuer</span>
                <span className="font-medium">{ergebnis.est.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Kirchensteuer ({ergebnis.satz}%)</span>
                <span className="font-medium">{ergebnis.kirchensteuer.toLocaleString('de-DE')} EUR</span>
              </div>
              {ergebnis.mitKappung && (
                <div className="flex justify-between py-1.5 border-b text-green-700 dark:text-green-400">
                  <span>Kappung (Grenze: {ergebnis.kappungsGrenze.toLocaleString('de-DE')} EUR)</span>
                  <span className="font-medium">-{ergebnis.ersparnis.toLocaleString('de-DE')} EUR</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Effektive Kirchensteuer</span>
                <span className="font-bold text-primary">{ergebnis.effektiveKirchensteuer.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">SA-Abzug (Grenzsteuersatz ~{ergebnis.grenzsteuersatz}%)</span>
                <span className="font-medium text-green-700 dark:text-green-400">-{ergebnis.steuerersparnisKiSt.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 font-bold">
                <span>Tatsaechliche Belastung</span>
                <span>{ergebnis.nettoKirchensteuer.toLocaleString('de-DE')} EUR ({ergebnis.monat.toLocaleString('de-DE')} EUR/M)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Kirchensteuer nach Einkommen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR`} />
                <Legend />
                <Bar dataKey="est" name="Einkommensteuer" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="kist" name="Kirchensteuer" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Kirchensteuer nach Bundesland</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4">Bundesland</th>
                  <th className="py-2 pr-4 text-right">Satz</th>
                  <th className="py-2 pr-4 text-right">Kappung</th>
                  <th className="py-2 text-right">Bei {zvE.toLocaleString('de-DE')} EUR zvE</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(KIRCHENSTEUER_SAETZE).sort().map(land => {
                  const satz = KIRCHENSTEUER_SAETZE[land]
                  const est = calcESt(zvE)
                  const kist = Math.round(est * satz / 100)
                  const kappungS = land === 'Bayern' || land === 'Baden-Wuerttemberg' ? '2,75%' : '3,5%'
                  return (
                    <tr key={land} className={`border-b ${land === bundesland ? 'bg-primary/5 font-medium' : ''}`}>
                      <td className="py-1.5 pr-4">{land}</td>
                      <td className="py-1.5 pr-4 text-right">{satz}%</td>
                      <td className="py-1.5 pr-4 text-right">{kappungS}</td>
                      <td className="py-1.5 text-right">{kist.toLocaleString('de-DE')} EUR</td>
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
