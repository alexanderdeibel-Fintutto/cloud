import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Baby, Info } from 'lucide-react'

export default function ElterngeldRechnerPage() {
  const [nettoMonat, setNettoMonat] = useState(2800)
  const [variante, setVariante] = useState<'basis' | 'plus' | 'kombi'>('basis')
  const [partnerMonate, setPartnerMonate] = useState(2)
  const [teilzeit, setTeilzeit] = useState(false)
  const [teilzeitStunden, setTeilzeitStunden] = useState(20)
  const [teilzeitNetto, setTeilzeitNetto] = useState(1200)

  const ergebnis = useMemo(() => {
    // Elterngeld Basis: 65% des Nettoeinkommens (1.000-1.200 €), max 1.800 €, min 300 €
    let ersatzrate = 0.65
    if (nettoMonat < 1000) {
      // Geringverdiener-Zuschlag: +0,1% pro 2€ unter 1.000€
      ersatzrate = Math.min(1.0, 0.65 + ((1000 - nettoMonat) / 2) * 0.001)
    } else if (nettoMonat > 1200) {
      // Ab 1.200 €: schrittweise Absenkung auf 65%
      ersatzrate = 0.65
    }

    const basisBetrag = Math.max(300, Math.min(1800, Math.round(nettoMonat * ersatzrate)))

    // ElterngeldPlus: 50% des Basiselterngelds, doppelte Bezugsdauer
    const plusBetrag = Math.max(150, Math.min(900, Math.round(basisBetrag * 0.5)))

    // Teilzeit-Elterngeld: Differenzmethode
    let teilzeitBetrag = basisBetrag
    if (teilzeit) {
      const differenz = Math.max(0, nettoMonat - teilzeitNetto)
      teilzeitBetrag = Math.max(300, Math.min(1800, Math.round(differenz * ersatzrate)))
    }

    // Monate
    const eigeneMonateBasis = 12 - partnerMonate
    const eigeneMonatePlus = (12 - partnerMonate) * 2
    const partnerMonatePlus = partnerMonate * 2
    const bonusMonate = partnerMonate >= 2 ? 4 : 0 // Partnerschaftsbonus

    // Gesamtbeträge
    const gesamtBasis = basisBetrag * eigeneMonateBasis + basisBetrag * partnerMonate
    const gesamtPlus = plusBetrag * eigeneMonatePlus + plusBetrag * partnerMonatePlus
    const gesamtKombi = basisBetrag * eigeneMonateBasis + plusBetrag * partnerMonatePlus + (bonusMonate > 0 ? plusBetrag * bonusMonate : 0)

    return {
      ersatzrate: (ersatzrate * 100).toFixed(1),
      basisBetrag, plusBetrag, teilzeitBetrag,
      eigeneMonateBasis, eigeneMonatePlus, partnerMonatePlus,
      bonusMonate,
      gesamtBasis, gesamtPlus, gesamtKombi,
    }
  }, [nettoMonat, partnerMonate, teilzeit, teilzeitNetto])

  const chartData = useMemo(() => {
    return [
      { name: 'Basiselterngeld', Betrag: ergebnis.basisBetrag, Monate: ergebnis.eigeneMonateBasis + partnerMonate, Gesamt: ergebnis.gesamtBasis },
      { name: 'ElterngeldPlus', Betrag: ergebnis.plusBetrag, Monate: ergebnis.eigeneMonatePlus + ergebnis.partnerMonatePlus, Gesamt: ergebnis.gesamtPlus },
      { name: 'Kombination', Betrag: ergebnis.basisBetrag, Monate: ergebnis.eigeneMonateBasis + ergebnis.partnerMonatePlus + ergebnis.bonusMonate, Gesamt: ergebnis.gesamtKombi },
    ]
  }, [ergebnis, partnerMonate])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Baby className="h-6 w-6 text-pink-500" />
          Elterngeld-Rechner
        </h1>
        <p className="text-muted-foreground mt-1">
          Basiselterngeld, ElterngeldPlus und Partnerschaftsbonus berechnen
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Eingaben */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Einkommensdaten</CardTitle>
              <CardDescription>Nettoeinkommen vor Geburt (Durchschnitt 12 Monate)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nettoeinkommen/Monat (€)</label>
                <input type="number" value={nettoMonat} onChange={e => setNettoMonat(Number(e.target.value))} min={0} max={5000} step={100} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
                <input type="range" min={0} max={5000} step={100} value={nettoMonat} onChange={e => setNettoMonat(Number(e.target.value))} className="w-full mt-2 accent-primary" />
                <p className="text-xs text-muted-foreground mt-1">Ersatzrate: {ergebnis.ersatzrate}%</p>
              </div>

              <div>
                <label className="text-sm font-medium">Partnermonate</label>
                <select value={partnerMonate} onChange={e => setPartnerMonate(Number(e.target.value))} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm">
                  {[0, 1, 2, 3, 4, 5, 6].map(m => (
                    <option key={m} value={m}>{m} Monate {m >= 2 ? '(Partnerschaftsbonus möglich)' : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Elterngeld-Variante</label>
                <div className="flex gap-2 mt-1.5">
                  {([
                    { value: 'basis', label: 'Basis' },
                    { value: 'plus', label: 'Plus' },
                    { value: 'kombi', label: 'Kombination' },
                  ] as const).map(v => (
                    <button
                      key={v.value}
                      onClick={() => setVariante(v.value)}
                      className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium border transition-colors ${
                        variante === v.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 border-border'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" id="teilzeit" checked={teilzeit} onChange={e => setTeilzeit(e.target.checked)} className="rounded border-border" />
                <label htmlFor="teilzeit" className="text-sm">Teilzeit während Elternzeit (max. 32h/Woche)</label>
              </div>

              {teilzeit && (
                <div className="grid grid-cols-2 gap-3 pl-7">
                  <div>
                    <label className="text-xs font-medium">Stunden/Woche</label>
                    <input type="number" value={teilzeitStunden} onChange={e => setTeilzeitStunden(Number(e.target.value))} min={0} max={32} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Teilzeit-Netto (€)</label>
                    <input type="number" value={teilzeitNetto} onChange={e => setTeilzeitNetto(Number(e.target.value))} min={0} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ergebnis */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ergebnis: {variante === 'basis' ? 'Basiselterngeld' : variante === 'plus' ? 'ElterngeldPlus' : 'Kombination'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {variante === 'basis' && (
                <div className="space-y-3">
                  <div className="rounded-xl bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-900 p-4">
                    <p className="text-sm text-pink-600 dark:text-pink-400">Basiselterngeld/Monat</p>
                    <p className="text-3xl font-bold text-pink-700 dark:text-pink-300">{ergebnis.basisBetrag.toLocaleString('de-DE')} €</p>
                    <p className="text-xs text-pink-500 mt-1">{teilzeit ? `Bei Teilzeit: ${ergebnis.teilzeitBetrag.toLocaleString('de-DE')} €` : `${ergebnis.ersatzrate}% von ${nettoMonat.toLocaleString('de-DE')} €`}</p>
                  </div>
                  <div className="flex justify-between text-sm"><span>Eigene Monate</span><span className="font-medium">{ergebnis.eigeneMonateBasis}</span></div>
                  <div className="flex justify-between text-sm"><span>Partnermonate</span><span className="font-medium">{partnerMonate}</span></div>
                  <div className="flex justify-between text-sm border-t pt-2 font-bold"><span>Gesamtbetrag</span><span className="text-pink-600">{ergebnis.gesamtBasis.toLocaleString('de-DE')} €</span></div>
                </div>
              )}

              {variante === 'plus' && (
                <div className="space-y-3">
                  <div className="rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 p-4">
                    <p className="text-sm text-purple-600 dark:text-purple-400">ElterngeldPlus/Monat</p>
                    <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{ergebnis.plusBetrag.toLocaleString('de-DE')} €</p>
                    <p className="text-xs text-purple-500 mt-1">50% des Basiselterngelds, doppelte Bezugsdauer</p>
                  </div>
                  <div className="flex justify-between text-sm"><span>Eigene Monate</span><span className="font-medium">{ergebnis.eigeneMonatePlus}</span></div>
                  <div className="flex justify-between text-sm"><span>Partnermonate</span><span className="font-medium">{ergebnis.partnerMonatePlus}</span></div>
                  <div className="flex justify-between text-sm border-t pt-2 font-bold"><span>Gesamtbetrag</span><span className="text-purple-600">{ergebnis.gesamtPlus.toLocaleString('de-DE')} €</span></div>
                </div>
              )}

              {variante === 'kombi' && (
                <div className="space-y-3">
                  <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 p-4">
                    <p className="text-sm text-indigo-600 dark:text-indigo-400">Kombination Basis + Plus</p>
                    <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">{ergebnis.gesamtKombi.toLocaleString('de-DE')} €</p>
                    <p className="text-xs text-indigo-500 mt-1">{ergebnis.eigeneMonateBasis}× Basis + {ergebnis.partnerMonatePlus}× Plus{ergebnis.bonusMonate > 0 ? ` + ${ergebnis.bonusMonate}× Bonus` : ''}</p>
                  </div>
                  <div className="flex justify-between text-sm"><span>Basis-Monate (eigene)</span><span className="font-medium">{ergebnis.eigeneMonateBasis} × {ergebnis.basisBetrag.toLocaleString('de-DE')} €</span></div>
                  <div className="flex justify-between text-sm"><span>Plus-Monate (Partner)</span><span className="font-medium">{ergebnis.partnerMonatePlus} × {ergebnis.plusBetrag.toLocaleString('de-DE')} €</span></div>
                  {ergebnis.bonusMonate > 0 && (
                    <div className="flex justify-between text-sm"><span>Partnerschaftsbonus</span><span className="font-medium text-green-600">{ergebnis.bonusMonate} × {ergebnis.plusBetrag.toLocaleString('de-DE')} €</span></div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Variantenvergleich (Gesamtbetrag)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} €`} />
                    <Legend />
                    <Bar dataKey="Gesamt" fill="#ec4899" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-3">
            <div className="flex gap-2">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <div className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                <p><strong>Basiselterngeld:</strong> 65-100% des Nettos, 300-1.800 €/Monat, max. 12+2 Monate.</p>
                <p><strong>ElterngeldPlus:</strong> 50% des Basisbetrags, doppelte Dauer. Ideal bei Teilzeit.</p>
                <p><strong>Partnerschaftsbonus:</strong> 4 zusätzliche Plus-Monate wenn beide 24-32h/Woche arbeiten.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
