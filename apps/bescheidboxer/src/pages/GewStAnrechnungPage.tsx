import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Factory, Info } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

function calcESt(zvE: number): number {
  if (zvE <= 12084) return 0
  if (zvE <= 17005) { const y = (zvE - 12084) / 10000; return Math.round((922.98 * y + 1400) * y) }
  if (zvE <= 66760) { const z = (zvE - 17005) / 10000; return Math.round((181.19 * z + 2397) * z + 1025.38) }
  if (zvE <= 277825) return Math.round(0.42 * zvE - 10394.14)
  return Math.round(0.45 * zvE - 18730.89)
}

export default function GewStAnrechnungPage() {
  const [gewerbeertrag, setGewerbeertrag] = useState(100000)
  const [hebesatz, setHebesatz] = useState(400)
  const [zvE, setZvE] = useState(80000)
  const [splitting, setSplitting] = useState(false)

  const ergebnis = useMemo(() => {
    // Gewerbesteuer
    const freibetrag = 24500
    const steuerpflichtig = Math.max(gewerbeertrag - freibetrag, 0)
    const messbetrag = Math.round(steuerpflichtig * 0.035 * 100) / 100
    const gewSt = Math.round(messbetrag * hebesatz / 100 * 100) / 100

    // ESt
    const est = calcESt(splitting ? Math.round(zvE / 2) : zvE) * (splitting ? 2 : 1)

    // Anrechnung § 35 EStG: Faktor 4 × Messbetrag, max. ESt auf gewerbl. Einkünfte
    const anrechnungMax = Math.round(messbetrag * 4 * 100) / 100
    const anteilGewerbe = zvE > 0 ? Math.min(gewerbeertrag / zvE, 1) : 0
    const estAufGewerbe = Math.round(est * anteilGewerbe)
    const tatsAnrechnung = Math.round(Math.min(anrechnungMax, estAufGewerbe) * 100) / 100

    const estNachAnrechnung = Math.max(est - tatsAnrechnung, 0)
    const gesamtbelastung = gewSt + estNachAnrechnung
    const belastungOhneAnrechnung = gewSt + est
    const ersparnis = belastungOhneAnrechnung - gesamtbelastung

    // Hebesatz-Vergleich
    const chartData = [350, 400, 450, 500].map(hs => {
      const gst = Math.round(messbetrag * hs / 100 * 100) / 100
      const anr = Math.round(Math.min(messbetrag * 4, estAufGewerbe) * 100) / 100
      const estN = Math.max(est - anr, 0)
      return { hebesatz: `${hs}%`, gewSt: gst, estNach: estN, gesamt: gst + estN }
    })

    // Neutraler Hebesatz (wo GewSt ≈ Anrechnung)
    const neutralerHS = Math.round(4 * 100) // 400%

    return {
      freibetrag, steuerpflichtig, messbetrag, gewSt,
      est, anrechnungMax, tatsAnrechnung, estNachAnrechnung,
      gesamtbelastung, ersparnis, neutralerHS,
      chartData,
    }
  }, [gewerbeertrag, hebesatz, zvE, splitting])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Factory className="h-6 w-6 text-primary" />
          Gewerbesteuer-Anrechnung
        </h1>
        <p className="text-muted-foreground mt-1">
          § 35 EStG – Steuerermäßigung bei Einkünften aus Gewerbebetrieb
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Anrechnungsfaktor:</strong> <strong>4,0 × Messbetrag</strong> auf die ESt anrechenbar (§ 35 EStG).</p>
              <p><strong>Neutraler Hebesatz:</strong> Bei <strong>400%</strong> wird die GewSt vollständig durch die ESt-Ermäßigung kompensiert.</p>
              <p><strong>Über 400%:</strong> Zusätzliche Belastung. <strong>Unter 400%:</strong> Doppelentlastung möglich.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Eingaben</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Gewerbeertrag: {gewerbeertrag.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={500000} step={5000} value={gewerbeertrag} onChange={e => setGewerbeertrag(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Hebesatz: {hebesatz}%</label>
              <input type="range" min={200} max={900} step={10} value={hebesatz} onChange={e => setHebesatz(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Gesamt-zvE: {zvE.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={300000} step={1000} value={zvE} onChange={e => setZvE(+e.target.value)} className="w-full accent-primary" />
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
            <div className="grid gap-3 sm:grid-cols-2 mb-6">
              <div className="rounded-lg bg-primary/10 p-4 text-center">
                <p className="text-2xl font-bold text-primary">{ergebnis.gesamtbelastung.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Gesamtbelastung</p>
              </div>
              <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-4 text-center">
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{ergebnis.tatsAnrechnung.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">ESt-Anrechnung § 35</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Gewerbeertrag</span>
                <span className="font-medium">{gewerbeertrag.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Freibetrag</span>
                <span className="font-medium text-green-600">-{ergebnis.freibetrag.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Steuermessbetrag (3,5%)</span>
                <span className="font-medium">{ergebnis.messbetrag.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Gewerbesteuer ({hebesatz}%)</span>
                <span className="font-medium text-red-600">{ergebnis.gewSt.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">ESt (vor Anrechnung)</span>
                <span className="font-medium">{ergebnis.est.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Max. Anrechnung (4 × MB)</span>
                <span className="font-medium">{ergebnis.anrechnungMax.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Tatsächliche Anrechnung</span>
                <span className="font-medium text-green-600">-{ergebnis.tatsAnrechnung.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">ESt nach Anrechnung</span>
                <span className="font-medium">{ergebnis.estNachAnrechnung.toLocaleString('de-DE')} EUR</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Hebesatz-Vergleich</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ergebnis.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hebesatz" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR`} />
                <Legend />
                <Bar dataKey="gewSt" name="Gewerbesteuer" fill="#ef4444" stackId="a" />
                <Bar dataKey="estNach" name="ESt nach § 35" fill="#7c3aed" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
