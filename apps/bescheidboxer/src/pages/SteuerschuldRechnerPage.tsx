import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Scale, Info } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

function calcESt(zvE: number): number {
  if (zvE <= 12084) return 0
  if (zvE <= 17005) { const y = (zvE - 12084) / 10000; return Math.round((922.98 * y + 1400) * y) }
  if (zvE <= 66760) { const z = (zvE - 17005) / 10000; return Math.round((181.19 * z + 2397) * z + 1025.38) }
  if (zvE <= 277825) return Math.round(0.42 * zvE - 10394.14)
  return Math.round(0.45 * zvE - 18730.89)
}

export default function SteuerschuldRechnerPage() {
  const [einkuenfteNS, setEinkuenfteNS] = useState(55000)
  const [einkuenfteKap, setEinkuenfteKap] = useState(2000)
  const [einkuenfteVuV, setEinkuenfteVuV] = useState(0)
  const [einkuenfteSE, setEinkuenfteSE] = useState(0)
  const [werbungskosten, setWerbungskosten] = useState(1800)
  const [sonderausgaben, setSonderausgaben] = useState(5000)
  const [agBelastungen, setAgBelastungen] = useState(0)
  const [splitting, setSplitting] = useState(false)
  const [kirchensteuer, setKirchensteuer] = useState(false)
  const [vorauszahlungen, setVorauszahlungen] = useState(0)
  const [lstEinbehalten, setLstEinbehalten] = useState(12000)

  const ergebnis = useMemo(() => {
    // Gesamtbetrag der Einkuenfte
    const gde = einkuenfteNS + einkuenfteVuV + einkuenfteSE
    const wk = Math.max(werbungskosten, 1230) // Mind. Pauschbetrag

    // Kapitalertraege separat (Abgeltungsteuer)
    const kapFrei = splitting ? 2000 : 1000
    const kapSteuerpflichtig = Math.max(einkuenfteKap - kapFrei, 0)
    const abgeltungsteuer = Math.round(kapSteuerpflichtig * 0.25)
    const soliKap = Math.round(abgeltungsteuer * 0.055)

    // zvE
    const einkommen = gde - wk
    const zvE = Math.max(einkommen - sonderausgaben - agBelastungen, 0)

    // ESt
    const zvESplit = splitting ? Math.round(zvE / 2) : zvE
    let est = calcESt(zvESplit)
    if (splitting) est *= 2

    // Soli
    const soliFrei = splitting ? 36260 : 18130
    const soli = est > soliFrei ? Math.round(est * 0.055) : 0

    // KiSt
    const kist = kirchensteuer ? Math.round(est * 0.09) : 0

    // Steuer gesamt (inkl. Abgeltungsteuer)
    const steuerGesamt = est + soli + kist + abgeltungsteuer + soliKap

    // Bereits bezahlt
    const bereitsGezahlt = lstEinbehalten + vorauszahlungen + abgeltungsteuer + soliKap
    const nachzahlung = steuerGesamt - bereitsGezahlt
    const erstattung = -nachzahlung

    // Durchschnittssteuersatz
    const durchschnitt = zvE > 0 ? Math.round(est / zvE * 10000) / 100 : 0
    // Grenzsteuersatz
    const grenz = zvE > 277825 ? 45 : zvE > 66760 ? 42 : zvE > 17005 ? (splitting ? 30 : 30) : zvE > 12084 ? 14 : 0

    const chartData = [
      { name: 'Einkuenfte', betrag: gde + einkuenfteKap },
      { name: 'Abzuege', betrag: -(wk + sonderausgaben + agBelastungen) },
      { name: 'zvE', betrag: zvE },
      { name: 'ESt', betrag: -est },
      { name: 'Soli+KiSt', betrag: -(soli + kist) },
      { name: 'AbgSt', betrag: -(abgeltungsteuer + soliKap) },
    ]

    return {
      gde, wk, kapSteuerpflichtig, abgeltungsteuer, soliKap,
      einkommen, zvE, est, soli, kist,
      steuerGesamt, bereitsGezahlt, nachzahlung, erstattung,
      durchschnitt, grenz, chartData,
    }
  }, [einkuenfteNS, einkuenfteKap, einkuenfteVuV, einkuenfteSE, werbungskosten, sonderausgaben, agBelastungen, splitting, kirchensteuer, vorauszahlungen, lstEinbehalten])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Scale className="h-6 w-6 text-primary" />
          Steuerschuld-Rechner
        </h1>
        <p className="text-muted-foreground mt-1">
          Gesamte Steuerlast mit allen Einkunftsarten berechnen
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-blue-800 dark:text-blue-200">
              <p>Berechnen Sie Ihre <strong>voraussichtliche Steuerschuld</strong> inklusive Nachzahlung/Erstattung. Kapitalertraege werden mit Abgeltungsteuer (25%) separat besteuert.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Einkuenfte</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nichtselbstaendige Arbeit: {einkuenfteNS.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={200000} step={1000} value={einkuenfteNS} onChange={e => setEinkuenfteNS(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Kapitalertraege: {einkuenfteKap.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={50000} step={500} value={einkuenfteKap} onChange={e => setEinkuenfteKap(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Vermietung & Verpachtung: {einkuenfteVuV.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={-20000} max={50000} step={500} value={einkuenfteVuV} onChange={e => setEinkuenfteVuV(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Sonstige Einkuenfte: {einkuenfteSE.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={30000} step={500} value={einkuenfteSE} onChange={e => setEinkuenfteSE(+e.target.value)} className="w-full accent-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Abzuege & Optionen</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Werbungskosten: {werbungskosten.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={20000} step={100} value={werbungskosten} onChange={e => setWerbungskosten(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Sonderausgaben: {sonderausgaben.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={30000} step={500} value={sonderausgaben} onChange={e => setSonderausgaben(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Ag. Belastungen: {agBelastungen.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={15000} step={500} value={agBelastungen} onChange={e => setAgBelastungen(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">LSt einbehalten: {lstEinbehalten.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={80000} step={500} value={lstEinbehalten} onChange={e => setLstEinbehalten(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">ESt-Vorauszahlungen: {vorauszahlungen.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={50000} step={500} value={vorauszahlungen} onChange={e => setVorauszahlungen(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={splitting} onChange={e => setSplitting(e.target.checked)} className="accent-primary" />
                Zusammenveranlagung (Splitting)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={kirchensteuer} onChange={e => setKirchensteuer(e.target.checked)} className="accent-primary" />
                Kirchensteuer (9%)
              </label>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/30">
        <CardHeader><CardTitle className="text-lg">Ergebnis</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3 mb-6">
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-2xl font-bold">{ergebnis.steuerGesamt.toLocaleString('de-DE')} EUR</p>
              <p className="text-xs text-muted-foreground mt-1">Steuer gesamt</p>
            </div>
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-2xl font-bold">{ergebnis.bereitsGezahlt.toLocaleString('de-DE')} EUR</p>
              <p className="text-xs text-muted-foreground mt-1">Bereits gezahlt</p>
            </div>
            <div className={`rounded-lg p-4 text-center ${ergebnis.nachzahlung > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
              <p className={`text-2xl font-bold ${ergebnis.nachzahlung > 0 ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}>
                {ergebnis.nachzahlung > 0 ? ergebnis.nachzahlung.toLocaleString('de-DE') : ergebnis.erstattung.toLocaleString('de-DE')} EUR
              </p>
              <p className="text-xs text-muted-foreground mt-1">{ergebnis.nachzahlung > 0 ? 'Nachzahlung' : 'Erstattung'}</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">zvE</span>
              <span className="font-medium">{ergebnis.zvE.toLocaleString('de-DE')} EUR</span>
            </div>
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">Einkommensteuer</span>
              <span className="font-medium">{ergebnis.est.toLocaleString('de-DE')} EUR</span>
            </div>
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">Solidaritaetszuschlag</span>
              <span className="font-medium">{ergebnis.soli.toLocaleString('de-DE')} EUR</span>
            </div>
            {ergebnis.kist > 0 && (
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Kirchensteuer</span>
                <span className="font-medium">{ergebnis.kist.toLocaleString('de-DE')} EUR</span>
              </div>
            )}
            {ergebnis.abgeltungsteuer > 0 && (
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Abgeltungsteuer (Kapital)</span>
                <span className="font-medium">{(ergebnis.abgeltungsteuer + ergebnis.soliKap).toLocaleString('de-DE')} EUR</span>
              </div>
            )}
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">Durchschnittssteuersatz</span>
              <span className="font-medium">{ergebnis.durchschnitt.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-muted-foreground">Grenzsteuersatz</span>
              <span className="font-medium">{ergebnis.grenz}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Steuerberechnung</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ergebnis.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR`} />
                <Legend />
                <Bar dataKey="betrag" name="Betrag" fill="#7c3aed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
