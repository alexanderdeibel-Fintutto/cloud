import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { TrendingDown, Info, Plus, Trash2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface Ertrag {
  id: number
  bezeichnung: string
  betrag: number
  typ: 'zinsen' | 'dividenden' | 'veraeusserung'
}

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

const SPARER_PAUSCHBETRAG_EINZEL = 1000
const SPARER_PAUSCHBETRAG_ZUSAMMEN = 2000
const ABGELTUNGSTEUERSATZ = 0.25

export default function KapitalertraegePage() {
  const [zusammen, setZusammen] = useState(false)
  const [kirchensteuer, setKirchensteuer] = useState(true)
  const [kirchensteuersatz, setKirchensteuersatz] = useState(9)
  const [zvE, setZvE] = useState(45000)
  const [ertraege, setErtraege] = useState<Ertrag[]>([
    { id: 1, bezeichnung: 'Tagesgeld-Zinsen', betrag: 1200, typ: 'zinsen' },
    { id: 2, bezeichnung: 'Dividenden (ETF)', betrag: 2500, typ: 'dividenden' },
    { id: 3, bezeichnung: 'Aktienverkauf Gewinn', betrag: 3800, typ: 'veraeusserung' },
  ])

  const addErtrag = () => {
    setErtraege(prev => [...prev, { id: Date.now(), bezeichnung: '', betrag: 0, typ: 'zinsen' }])
  }

  const removeErtrag = (id: number) => {
    setErtraege(prev => prev.filter(e => e.id !== id))
  }

  const ergebnis = useMemo(() => {
    const bruttoErtraege = ertraege.reduce((s, e) => s + e.betrag, 0)
    const sparerPB = zusammen ? SPARER_PAUSCHBETRAG_ZUSAMMEN : SPARER_PAUSCHBETRAG_EINZEL
    const steuerpflichtig = Math.max(0, bruttoErtraege - sparerPB)

    // KiSt-Faktor: bei 9% KiSt → Faktor 1/(1+0.09×0.25) = ca. 0.978
    const kistFaktor = kirchensteuer ? 1 / (1 + kirchensteuersatz / 100 * ABGELTUNGSTEUERSATZ) : 1

    // Abgeltungsteuer
    const abgeltungsteuer = Math.round(steuerpflichtig * ABGELTUNGSTEUERSATZ * kistFaktor)
    const soliAbgelt = abgeltungsteuer > (zusammen ? 35086 : 17543) * ABGELTUNGSTEUERSATZ ? Math.round(abgeltungsteuer * 0.055) : 0
    const kistAbgelt = kirchensteuer ? Math.round(abgeltungsteuer * kirchensteuersatz / 100) : 0
    const gesamtAbgelt = abgeltungsteuer + soliAbgelt + kistAbgelt

    // Günstigerprüfung: ESt auf (zvE + Kapitalerträge) vs. Abgeltungsteuer
    const estOhne = zusammen ? 2 * calcESt(Math.floor(zvE / 2)) : calcESt(zvE)
    const estMit = zusammen ? 2 * calcESt(Math.floor((zvE + steuerpflichtig) / 2)) : calcESt(zvE + steuerpflichtig)
    const mehrsteuerTarif = estMit - estOhne
    const soliTarif = estMit > (zusammen ? 35086 : 17543) ? Math.round(estMit * 0.055) - (estOhne > (zusammen ? 35086 : 17543) ? Math.round(estOhne * 0.055) : 0) : 0
    const kistTarif = kirchensteuer ? Math.round(mehrsteuerTarif * kirchensteuersatz / 100) : 0
    const gesamtTarif = mehrsteuerTarif + soliTarif + kistTarif

    const guenstigerPruefung = gesamtTarif < gesamtAbgelt
    const vorteil = guenstigerPruefung ? gesamtAbgelt - gesamtTarif : 0

    const effektiverSatz = steuerpflichtig > 0 ? Math.round((guenstigerPruefung ? gesamtTarif : gesamtAbgelt) / steuerpflichtig * 10000) / 100 : 0

    // Aufschlüsselung nach Typ
    const zinsen = ertraege.filter(e => e.typ === 'zinsen').reduce((s, e) => s + e.betrag, 0)
    const dividenden = ertraege.filter(e => e.typ === 'dividenden').reduce((s, e) => s + e.betrag, 0)
    const veraeusserung = ertraege.filter(e => e.typ === 'veraeusserung').reduce((s, e) => s + e.betrag, 0)

    return {
      bruttoErtraege,
      sparerPB,
      steuerpflichtig,
      abgeltungsteuer,
      soliAbgelt,
      kistAbgelt,
      gesamtAbgelt,
      mehrsteuerTarif,
      gesamtTarif,
      guenstigerPruefung,
      vorteil,
      effektiverSatz,
      zinsen,
      dividenden,
      veraeusserung,
    }
  }, [ertraege, zusammen, kirchensteuer, kirchensteuersatz, zvE])

  const chartData = [
    { name: 'Abgeltungsteuer', steuer: ergebnis.gesamtAbgelt },
    { name: 'Tarif (Günstigerpr.)', steuer: ergebnis.gesamtTarif },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingDown className="h-6 w-6 text-primary" />
          Kapitalerträge-Rechner
        </h1>
        <p className="text-muted-foreground mt-1">
          Abgeltungsteuer, Sparerpauschbetrag und Günstigerprüfung (§ 32d EStG)
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Abgeltungsteuer:</strong> 25% auf Kapitalerträge + Soli + ggf. KiSt. Sparerpauschbetrag: {SPARER_PAUSCHBETRAG_EINZEL.toLocaleString('de-DE')} € (Einzel) / {SPARER_PAUSCHBETRAG_ZUSAMMEN.toLocaleString('de-DE')} € (Zusammen).</p>
              <p><strong>Günstigerprüfung (§ 32d Abs. 6):</strong> Wenn der persönliche Steuersatz unter 25% liegt, können Kapitalerträge zum niedrigeren Tarif besteuert werden.</p>
              <p><strong>Freistellungsauftrag:</strong> Bis zur Höhe des Sparerpauschbetrags wird keine Steuer einbehalten.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Kapitalerträge</CardTitle>
              <button onClick={addErtrag} className="flex items-center gap-1 text-xs text-primary hover:underline">
                <Plus className="h-3 w-3" /> Hinzufügen
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {ertraege.map(e => (
              <div key={e.id} className="flex items-center gap-2 rounded-lg border p-2">
                <input
                  type="text"
                  value={e.bezeichnung}
                  onChange={ev => setErtraege(prev => prev.map(x => x.id === e.id ? { ...x, bezeichnung: ev.target.value } : x))}
                  placeholder="Bezeichnung"
                  className="flex-1 text-sm bg-transparent outline-none"
                />
                <select
                  value={e.typ}
                  onChange={ev => setErtraege(prev => prev.map(x => x.id === e.id ? { ...x, typ: ev.target.value as Ertrag['typ'] } : x))}
                  className="text-xs rounded border px-2 py-1 bg-background"
                >
                  <option value="zinsen">Zinsen</option>
                  <option value="dividenden">Dividenden</option>
                  <option value="veraeusserung">Veräußerung</option>
                </select>
                <input
                  type="number"
                  value={e.betrag}
                  onChange={ev => setErtraege(prev => prev.map(x => x.id === e.id ? { ...x, betrag: +ev.target.value } : x))}
                  className="w-24 rounded border px-2 py-1 text-sm text-right"
                />
                <span className="text-xs text-muted-foreground">€</span>
                <button onClick={() => removeErtrag(e.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Einstellungen</CardTitle>
            <CardDescription>Für Günstigerprüfung: zvE ohne Kapitalerträge</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">zvE (ohne Kapitalerträge): {zvE.toLocaleString('de-DE')} €</label>
              <input type="range" min={0} max={200000} step={1000} value={zvE} onChange={e => setZvE(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={zusammen} onChange={e => setZusammen(e.target.checked)} className="rounded" />
                Zusammenveranlagung
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={kirchensteuer} onChange={e => setKirchensteuer(e.target.checked)} className="rounded" />
                Kirchensteuer
              </label>
            </div>
            {kirchensteuer && (
              <div className="flex gap-2">
                {[8, 9].map(s => (
                  <button key={s} onClick={() => setKirchensteuersatz(s)} className={`rounded-md px-3 py-1 text-xs ${kirchensteuersatz === s ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {s} %
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ergebnis */}
      <Card className={`border-2 ${ergebnis.guenstigerPruefung ? 'border-green-500/50' : 'border-primary/30'}`}>
        <CardHeader>
          <CardTitle className="text-lg">
            {ergebnis.guenstigerPruefung ? '✓ Günstigerprüfung vorteilhaft – Tarifbesteuerung günstiger' : 'Abgeltungsteuer günstiger'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4 mb-6">
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-xl font-bold">{ergebnis.bruttoErtraege.toLocaleString('de-DE')} €</p>
              <p className="text-xs text-muted-foreground">Brutto-Erträge</p>
            </div>
            <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-3 text-center">
              <p className="text-xl font-bold text-blue-700 dark:text-blue-400">−{ergebnis.sparerPB.toLocaleString('de-DE')} €</p>
              <p className="text-xs text-muted-foreground">Sparerpauschbetrag</p>
            </div>
            <div className="rounded-lg bg-primary/10 p-3 text-center">
              <p className="text-xl font-bold text-primary">{(ergebnis.guenstigerPruefung ? ergebnis.gesamtTarif : ergebnis.gesamtAbgelt).toLocaleString('de-DE')} €</p>
              <p className="text-xs text-muted-foreground">Steuer (optimal)</p>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-xl font-bold">{ergebnis.effektiverSatz} %</p>
              <p className="text-xs text-muted-foreground">Effektiver Satz</p>
            </div>
          </div>

          {ergebnis.guenstigerPruefung && ergebnis.vorteil > 0 && (
            <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-3 text-center mb-4">
              <p className="text-lg font-bold text-green-700 dark:text-green-400">Ersparnis: {ergebnis.vorteil.toLocaleString('de-DE')} €</p>
              <p className="text-xs text-muted-foreground">durch Günstigerprüfung gegenüber Abgeltungsteuer</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="font-medium">Abgeltungsteuer (25%)</p>
              <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">KapESt</span><span>{ergebnis.abgeltungsteuer.toLocaleString('de-DE')} €</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Soli</span><span>{ergebnis.soliAbgelt.toLocaleString('de-DE')} €</span></div>
              {kirchensteuer && <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">KiSt</span><span>{ergebnis.kistAbgelt.toLocaleString('de-DE')} €</span></div>}
              <div className="flex justify-between py-1 font-medium"><span>Gesamt</span><span>{ergebnis.gesamtAbgelt.toLocaleString('de-DE')} €</span></div>
            </div>
            <div className="space-y-2">
              <p className="font-medium">Tarifbesteuerung</p>
              <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Mehr-ESt</span><span>{ergebnis.mehrsteuerTarif.toLocaleString('de-DE')} €</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">+ Soli/KiSt</span><span>{(ergebnis.gesamtTarif - ergebnis.mehrsteuerTarif).toLocaleString('de-DE')} €</span></div>
              <div className="flex justify-between py-1 font-medium"><span>Gesamt</span><span>{ergebnis.gesamtTarif.toLocaleString('de-DE')} €</span></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vergleich: Abgeltung vs. Tarifbesteuerung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v.toLocaleString('de-DE')} €`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} €`} />
                <Legend />
                <Bar dataKey="steuer" name="Steuerbelastung" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Aufschlüsselung */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Erträge nach Art</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: 'Zinsen', betrag: ergebnis.zinsen, color: 'bg-blue-500' },
              { label: 'Dividenden', betrag: ergebnis.dividenden, color: 'bg-green-500' },
              { label: 'Veräußerungsgewinne', betrag: ergebnis.veraeusserung, color: 'bg-purple-500' },
            ].filter(x => x.betrag > 0).map((x, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{x.label}</span>
                  <span className="font-medium">{x.betrag.toLocaleString('de-DE')} €</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full ${x.color}`} style={{ width: `${ergebnis.bruttoErtraege > 0 ? (x.betrag / ergebnis.bruttoErtraege) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
