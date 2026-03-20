import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Building2, Info } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

function calcESt(zvE: number): number {
  if (zvE <= 12084) return 0
  if (zvE <= 17005) { const y = (zvE - 12084) / 10000; return Math.round((922.98 * y + 1400) * y) }
  if (zvE <= 66760) { const z = (zvE - 17005) / 10000; return Math.round((181.19 * z + 2397) * z + 1025.38) }
  if (zvE <= 277825) return Math.round(0.42 * zvE - 10394.14)
  return Math.round(0.45 * zvE - 18730.89)
}

export default function UnternehmensformVergleichPage() {
  const [gewinn, setGewinn] = useState(100000)
  const [hebesatz, setHebesatz] = useState(400)
  const [gehaltGF, setGehaltGF] = useState(60000)
  const [ausschuettung, setAusschuettung] = useState(30000)
  const [kirchensteuer, setKirchensteuer] = useState(false)

  const ergebnis = useMemo(() => {
    // === Einzelunternehmen / Freiberufler ===
    const estEinzel = calcESt(gewinn)
    const soliEinzel = Math.round(estEinzel * 0.055)
    const kistEinzel = kirchensteuer ? Math.round(estEinzel * 0.09) : 0
    const gesamtEinzel = estEinzel + soliEinzel + kistEinzel
    const nettoEinzel = gewinn - gesamtEinzel

    // === Einzelunternehmen mit Gewerbesteuer ===
    const freibetragGew = 24500
    const steuerpflichtigGew = Math.max(gewinn - freibetragGew, 0)
    const messbetrag = Math.round(steuerpflichtigGew * 0.035)
    const gewSt = Math.round(messbetrag * hebesatz / 100)
    const anrechnung35 = Math.round(Math.min(messbetrag * 4, estEinzel))
    const estNachAnrechnung = Math.max(estEinzel - anrechnung35, 0)
    const soliGewerbe = Math.round(estNachAnrechnung * 0.055)
    const kistGewerbe = kirchensteuer ? Math.round(estNachAnrechnung * 0.09) : 0
    const gesamtGewerbe = estNachAnrechnung + soliGewerbe + kistGewerbe + gewSt
    const nettoGewerbe = gewinn - gesamtGewerbe

    // === GmbH ===
    // KSt 15% + Soli 5,5% auf KSt = 15,825%
    const gewinnGmbH = gewinn - gehaltGF
    const kst = Math.round(Math.max(gewinnGmbH, 0) * 0.15)
    const soliKst = Math.round(kst * 0.055)
    const gewStGmbH = Math.round(Math.max(gewinnGmbH - freibetragGew, 0) * 0.035 * hebesatz / 100)
    const steuerGmbH = kst + soliKst + gewStGmbH

    // Geschäftsführergehalt → ESt
    const estGF = calcESt(gehaltGF)
    const soliGF = Math.round(estGF * 0.055)
    const kistGF = kirchensteuer ? Math.round(estGF * 0.09) : 0

    // Ausschüttung → Abgeltungssteuer 25% + Soli
    const maxAussch = Math.max(gewinnGmbH - steuerGmbH, 0)
    const tatsAusschuettung = Math.min(ausschuettung, maxAussch)
    const abgeltung = Math.round(tatsAusschuettung * 0.25)
    const soliAbgeltung = Math.round(abgeltung * 0.055)

    const gesamtGmbH = steuerGmbH + estGF + soliGF + kistGF + abgeltung + soliAbgeltung
    const nettoGmbH = gewinn - gesamtGmbH

    // Chart: Gewinnvergleich
    const chartData = [50000, 100000, 150000, 200000, 300000].map(g => {
      const eE = calcESt(g)
      const sE = Math.round(eE * 0.055)
      const gGmbH = g - gehaltGF
      const kK = Math.round(Math.max(gGmbH, 0) * 0.15)
      const sK = Math.round(kK * 0.055)
      const gW = Math.round(Math.max(gGmbH - freibetragGew, 0) * 0.035 * hebesatz / 100)
      const eGF = calcESt(gehaltGF)
      const sGF = Math.round(eGF * 0.055)
      return {
        gewinn: `${(g / 1000).toFixed(0)}k`,
        einzelunternehmen: eE + sE,
        gmbh: kK + sK + gW + eGF + sGF,
      }
    })

    return {
      gesamtEinzel, nettoEinzel,
      gesamtGewerbe, nettoGewerbe, gewSt, anrechnung35,
      gesamtGmbH, nettoGmbH, steuerGmbH, estGF, tatsAusschuettung, abgeltung,
      chartData,
      belastungEinzel: gewinn > 0 ? Math.round(gesamtEinzel / gewinn * 1000) / 10 : 0,
      belastungGewerbe: gewinn > 0 ? Math.round(gesamtGewerbe / gewinn * 1000) / 10 : 0,
      belastungGmbH: gewinn > 0 ? Math.round(gesamtGmbH / gewinn * 1000) / 10 : 0,
    }
  }, [gewinn, hebesatz, gehaltGF, ausschuettung, kirchensteuer])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          Unternehmensform-Vergleich
        </h1>
        <p className="text-muted-foreground mt-1">
          Einzelunternehmen vs. Gewerbe vs. GmbH – steuerliche Gesamtbelastung
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Einzelunternehmen/Freiberufler:</strong> ESt + Soli, kein GewSt-Freibetrag nötig.</p>
              <p><strong>Gewerbe (Personen):</strong> ESt + GewSt, Anrechnung § 35 EStG (Faktor 4).</p>
              <p><strong>GmbH:</strong> KSt 15% + Soli + GewSt auf Gesellschaftsebene, GF-Gehalt + Ausschüttung privat.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Eingaben</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Gewinn vor Steuern: {gewinn.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={20000} max={500000} step={5000} value={gewinn} onChange={e => setGewinn(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">GewSt-Hebesatz: {hebesatz}%</label>
              <input type="range" min={200} max={900} step={10} value={hebesatz} onChange={e => setHebesatz(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">GF-Gehalt (GmbH): {gehaltGF.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={200000} step={5000} value={gehaltGF} onChange={e => setGehaltGF(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Ausschüttung (GmbH): {ausschuettung.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={200000} step={5000} value={ausschuettung} onChange={e => setAusschuettung(+e.target.value)} className="w-full accent-primary" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={kirchensteuer} onChange={e => setKirchensteuer(e.target.checked)} className="accent-primary" />
              Kirchensteuer (9%)
            </label>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader><CardTitle className="text-lg">Steuerbelastung</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3 mb-6">
              <div className="rounded-lg bg-purple-100 dark:bg-purple-900/30 p-3 text-center">
                <p className="text-lg font-bold text-purple-700 dark:text-purple-400">{ergebnis.belastungEinzel}%</p>
                <p className="text-[10px] text-muted-foreground mt-1">Freiberufler</p>
                <p className="text-xs font-semibold">{ergebnis.nettoEinzel.toLocaleString('de-DE')} netto</p>
              </div>
              <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-3 text-center">
                <p className="text-lg font-bold text-blue-700 dark:text-blue-400">{ergebnis.belastungGewerbe}%</p>
                <p className="text-[10px] text-muted-foreground mt-1">Gewerbe</p>
                <p className="text-xs font-semibold">{ergebnis.nettoGewerbe.toLocaleString('de-DE')} netto</p>
              </div>
              <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-3 text-center">
                <p className="text-lg font-bold text-green-700 dark:text-green-400">{ergebnis.belastungGmbH}%</p>
                <p className="text-[10px] text-muted-foreground mt-1">GmbH</p>
                <p className="text-xs font-semibold">{ergebnis.nettoGmbH.toLocaleString('de-DE')} netto</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <p className="font-semibold text-muted-foreground uppercase text-xs tracking-wide">Freiberufler / EU</p>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">ESt + Soli + KiSt</span>
                <span className="font-medium text-red-600">{ergebnis.gesamtEinzel.toLocaleString('de-DE')} EUR</span>
              </div>

              <p className="font-semibold text-muted-foreground uppercase text-xs tracking-wide mt-3">Gewerbe (§ 15)</p>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Gesamt (inkl. GewSt {ergebnis.gewSt.toLocaleString('de-DE')}, Anr. -{ergebnis.anrechnung35.toLocaleString('de-DE')})</span>
                <span className="font-medium text-red-600">{ergebnis.gesamtGewerbe.toLocaleString('de-DE')} EUR</span>
              </div>

              <p className="font-semibold text-muted-foreground uppercase text-xs tracking-wide mt-3">GmbH</p>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">KSt + GewSt (Gesellschaft)</span>
                <span className="font-medium">{ergebnis.steuerGmbH.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">ESt auf GF-Gehalt</span>
                <span className="font-medium">{ergebnis.estGF.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">AbgSt auf Ausschüttung ({ergebnis.tatsAusschuettung.toLocaleString('de-DE')})</span>
                <span className="font-medium">{ergebnis.abgeltung.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 font-semibold">
                <span>GmbH Gesamt</span>
                <span className="text-red-600">{ergebnis.gesamtGmbH.toLocaleString('de-DE')} EUR</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Gewinnvergleich nach Rechtsform</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ergebnis.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="gewinn" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR`} />
                <Legend />
                <Bar dataKey="einzelunternehmen" name="Einzelunternehmen" fill="#7c3aed" />
                <Bar dataKey="gmbh" name="GmbH" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
