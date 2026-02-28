import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Coins, Info } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function DividendenRechnerPage() {
  const [bruttoDividende, setBruttoDividende] = useState(10000)
  const [teilEinkuenfte, setTeilEinkuenfte] = useState(false)
  const [zvE, setZvE] = useState(50000)
  const [kirchensteuer, setKirchensteuer] = useState(false)
  const [freistellungsauftrag, setFreistellungsauftrag] = useState(1000)
  const [splitting, setSplitting] = useState(false)
  const [guenstigerpruefung, setGuenstigerpruefung] = useState(false)

  const ergebnis = useMemo(() => {
    const sparerpauschbetrag = splitting ? 2000 : 1000
    const genutzterFSA = Math.min(freistellungsauftrag, sparerpauschbetrag, bruttoDividende)
    const steuerpflichtig = Math.max(bruttoDividende - genutzterFSA, 0)

    // Abgeltungsteuer (Standard)
    const abgst = Math.round(steuerpflichtig * 0.25)

    // Bei KiSt: reduzierter AbgSt-Satz (25% / (1 + 0.09))
    const abgstMitKist = kirchensteuer ? Math.round(steuerpflichtig * 25 / (100 + 9)) : abgst
    const soliMitKist = Math.round(abgstMitKist * 0.055)
    const kistEffektiv = kirchensteuer ? Math.round(abgstMitKist * 0.09) : 0
    const steuerAbgst = abgstMitKist + soliMitKist + kistEffektiv

    // Guenstigerpruefung (tarifliche ESt)
    const calcESt = (z: number) => {
      if (z <= 12084) return 0
      if (z <= 17005) { const y = (z - 12084) / 10000; return Math.round((922.98 * y + 1400) * y) }
      if (z <= 66760) { const y = (z - 17005) / 10000; return Math.round((181.19 * y + 2397) * y + 1025.38) }
      if (z <= 277825) return Math.round(0.42 * z - 10394.14)
      return Math.round(0.45 * z - 18730.89)
    }

    const estOhne = calcESt(splitting ? Math.round(zvE / 2) : zvE) * (splitting ? 2 : 1)
    const estMit = calcESt(splitting ? Math.round((zvE + steuerpflichtig) / 2) : zvE + steuerpflichtig) * (splitting ? 2 : 1)
    const mehrESt = estMit - estOhne
    const soliTarif = mehrESt > (splitting ? 36260 : 18130) ? Math.round(mehrESt * 0.055) : 0
    const kistTarif = kirchensteuer ? Math.round(mehrESt * 0.09) : 0
    const steuerTarif = mehrESt + soliTarif + kistTarif

    const guenstigerAbgst = steuerAbgst <= steuerTarif
    const optimaleSteuer = guenstigerpruefung ? Math.min(steuerAbgst, steuerTarif) : steuerAbgst
    const lohntSichGP = steuerTarif < steuerAbgst

    // Teileinkünfteverfahren (nur bei wesentlicher Beteiligung ≥1%)
    const teilEinkuenfteBetrag = Math.round(steuerpflichtig * 0.6) // 60% steuerpflichtig
    const estTeil = calcESt(splitting ? Math.round((zvE + teilEinkuenfteBetrag) / 2) : zvE + teilEinkuenfteBetrag) * (splitting ? 2 : 1) - estOhne
    const soliTeil = estTeil > (splitting ? 36260 : 18130) ? Math.round(estTeil * 0.055) : 0
    const kistTeil = kirchensteuer ? Math.round(estTeil * 0.09) : 0
    const steuerTeil = estTeil + soliTeil + kistTeil

    const nettoDividende = bruttoDividende - optimaleSteuer

    // Chart
    const chartData = [
      { name: 'Abgeltungsteuer', steuer: steuerAbgst, netto: bruttoDividende - steuerAbgst },
      { name: 'Tarifliche ESt', steuer: steuerTarif, netto: bruttoDividende - steuerTarif },
      { name: 'Teileinkuenfte (60%)', steuer: steuerTeil, netto: bruttoDividende - steuerTeil },
    ]

    return {
      genutzterFSA, steuerpflichtig,
      steuerAbgst, steuerTarif, steuerTeil,
      guenstigerAbgst, lohntSichGP,
      optimaleSteuer, nettoDividende,
      chartData,
    }
  }, [bruttoDividende, teilEinkuenfte, zvE, kirchensteuer, freistellungsauftrag, splitting, guenstigerpruefung])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Coins className="h-6 w-6 text-primary" />
          Dividenden-Rechner
        </h1>
        <p className="text-muted-foreground mt-1">
          Besteuerung von Kapitalertraegen & Ausschuettungen
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Abgeltungsteuer:</strong> 25% + Soli + KiSt auf Kapitalertraege. Sparerpauschbetrag 1.000/2.000 EUR.</p>
              <p><strong>Guenstigerpruefung (§ 32d Abs. 6):</strong> Tarifliche ESt, wenn persoenlicher Steuersatz unter 25% liegt.</p>
              <p><strong>Teileinkuenfteverfahren (§ 32d Abs. 2):</strong> 60% steuerpflichtig, aber WK absetzbar. Nur bei Beteiligung ≥ 1%.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Eingaben</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Brutto-Dividende: {bruttoDividende.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={100000} step={500} value={bruttoDividende} onChange={e => setBruttoDividende(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Freistellungsauftrag: {freistellungsauftrag.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={splitting ? 2000 : 1000} step={100} value={freistellungsauftrag} onChange={e => setFreistellungsauftrag(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Uebrige Einkuenfte (zvE): {zvE.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={200000} step={1000} value={zvE} onChange={e => setZvE(+e.target.value)} className="w-full accent-primary" />
              <p className="text-xs text-muted-foreground mt-1">Fuer Guenstigerpruefung und Teileinkuenfte relevant</p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={splitting} onChange={e => setSplitting(e.target.checked)} className="accent-primary" />
                Zusammenveranlagung
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={kirchensteuer} onChange={e => setKirchensteuer(e.target.checked)} className="accent-primary" />
                Kirchensteuer (9%)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={guenstigerpruefung} onChange={e => setGuenstigerpruefung(e.target.checked)} className="accent-primary" />
                Guenstigerpruefung (Anlage KAP)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={teilEinkuenfte} onChange={e => setTeilEinkuenfte(e.target.checked)} className="accent-primary" />
                Teileinkuenfteverfahren (Beteiligung ≥ 1%)
              </label>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader><CardTitle className="text-lg">Ergebnis</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 mb-6">
              <div className="rounded-lg bg-primary/10 p-4 text-center">
                <p className="text-2xl font-bold text-primary">{ergebnis.nettoDividende.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Netto-Dividende</p>
              </div>
              <div className="rounded-lg bg-red-100 dark:bg-red-900/30 p-4 text-center">
                <p className="text-2xl font-bold text-red-700 dark:text-red-400">{ergebnis.optimaleSteuer.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Steuer</p>
              </div>
            </div>

            {ergebnis.lohntSichGP && (
              <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-3 mb-4 text-center">
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  Guenstigerpruefung lohnt sich! Ersparnis: {(ergebnis.steuerAbgst - ergebnis.steuerTarif).toLocaleString('de-DE')} EUR
                </p>
              </div>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Brutto-Dividende</span>
                <span className="font-medium">{bruttoDividende.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Sparerpauschbetrag</span>
                <span className="font-medium text-green-600">-{ergebnis.genutzterFSA.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Steuerpflichtig</span>
                <span className="font-medium">{ergebnis.steuerpflichtig.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Abgeltungsteuer (25% + Soli)</span>
                <span className="font-medium">{ergebnis.steuerAbgst.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Tarifliche ESt</span>
                <span className="font-medium">{ergebnis.steuerTarif.toLocaleString('de-DE')} EUR</span>
              </div>
              {teilEinkuenfte && (
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Teileinkuenfte (60%)</span>
                  <span className="font-medium">{ergebnis.steuerTeil.toLocaleString('de-DE')} EUR</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Besteuerungsvergleich</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ergebnis.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR`} />
                <Legend />
                <Bar dataKey="netto" name="Netto" fill="#22c55e" stackId="a" />
                <Bar dataKey="steuer" name="Steuer" fill="#ef4444" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
