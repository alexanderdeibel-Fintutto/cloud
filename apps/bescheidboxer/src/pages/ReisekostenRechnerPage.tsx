import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Plane, Info, Plus, Trash2 } from 'lucide-react'

interface Reise {
  id: number
  ziel: string
  tageAbwesend: number
  anreisetag: boolean
  abreisetag: boolean
  uebernachtungKosten: number
  fahrtkosten: number
  fahrtArt: 'pkw' | 'bahn' | 'flug'
  kmEinfach: number
}

const VPMA_GANZTAG = 28 // >24h Abwesenheit
const VPMA_ANTAG = 14 // 8-24h oder An-/Abreisetag
const KM_SATZ = 0.30

export default function ReisekostenRechnerPage() {
  const [reisen, setReisen] = useState<Reise[]>([
    { id: 1, ziel: 'München – Kundentermin', tageAbwesend: 3, anreisetag: true, abreisetag: true, uebernachtungKosten: 240, fahrtkosten: 0, fahrtArt: 'bahn', kmEinfach: 350 },
    { id: 2, ziel: 'Hamburg – Messe', tageAbwesend: 2, anreisetag: true, abreisetag: true, uebernachtungKosten: 180, fahrtkosten: 0, fahrtArt: 'pkw', kmEinfach: 480 },
    { id: 3, ziel: 'Berlin – Schulung', tageAbwesend: 1, anreisetag: true, abreisetag: true, uebernachtungKosten: 0, fahrtkosten: 89, fahrtArt: 'bahn', kmEinfach: 600 },
  ])
  const [grenzsteuersatz, setGrenzsteuersatz] = useState(42)

  const addReise = () => {
    setReisen(prev => [...prev, {
      id: Date.now(),
      ziel: '',
      tageAbwesend: 1,
      anreisetag: true,
      abreisetag: true,
      uebernachtungKosten: 0,
      fahrtkosten: 0,
      fahrtArt: 'pkw',
      kmEinfach: 0,
    }])
  }

  const removeReise = (id: number) => {
    setReisen(prev => prev.filter(r => r.id !== id))
  }

  const updateReise = (id: number, updates: Partial<Reise>) => {
    setReisen(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r))
  }

  const berechnung = useMemo(() => {
    let gesamtVPMA = 0
    let gesamtUebernachtung = 0
    let gesamtFahrt = 0

    const details = reisen.map(r => {
      // Verpflegungsmehraufwand
      let vpma = 0
      const ganztage = Math.max(0, r.tageAbwesend - (r.anreisetag ? 1 : 0) - (r.abreisetag ? 1 : 0))
      vpma += ganztage * VPMA_GANZTAG
      if (r.anreisetag) vpma += VPMA_ANTAG
      if (r.abreisetag) vpma += VPMA_ANTAG
      // Einzeltag (8-24h) → 14€
      if (r.tageAbwesend === 1 && !r.anreisetag && !r.abreisetag) {
        vpma = VPMA_ANTAG
      }

      // Fahrtkosten
      let fahrt = r.fahrtkosten
      if (r.fahrtArt === 'pkw') {
        fahrt = r.kmEinfach * 2 * KM_SATZ // Hin und zurück
      }

      gesamtVPMA += vpma
      gesamtUebernachtung += r.uebernachtungKosten
      gesamtFahrt += fahrt

      return { ...r, vpma, fahrt }
    })

    const gesamt = gesamtVPMA + gesamtUebernachtung + gesamtFahrt
    const ersparnis = Math.round(gesamt * grenzsteuersatz / 100)

    return { details, gesamtVPMA, gesamtUebernachtung, gesamtFahrt, gesamt, ersparnis }
  }, [reisen, grenzsteuersatz])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Plane className="h-6 w-6 text-primary" />
          Reisekosten-Rechner
        </h1>
        <p className="text-muted-foreground mt-1">
          Dienstreisen steuerlich absetzen – Verpflegung, Übernachtung, Fahrtkosten
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Verpflegungsmehraufwand (Inland):</strong> Ab 8h Abwesenheit: 14 €/Tag. Ab 24h: 28 €/Tag. An-/Abreisetag: 14 €.</p>
              <p><strong>Fahrtkosten:</strong> PKW: 0,30 €/km (Hin- und Rückfahrt). Bahn/Flug: tatsächliche Kosten.</p>
              <p><strong>Übernachtung:</strong> Tatsächliche Kosten (nur Übernachtung, kein Frühstück). Pauschale: 20 €/Nacht (nur Arbeitgeber).</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reisen */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Dienstreisen ({reisen.length})</CardTitle>
            <button onClick={addReise} className="flex items-center gap-1 text-xs text-primary hover:underline">
              <Plus className="h-3 w-3" /> Reise hinzufügen
            </button>
          </div>
          <CardDescription>Erfassen Sie Ihre beruflich veranlassten Reisen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {reisen.map(r => (
            <div key={r.id} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={r.ziel}
                  onChange={e => updateReise(r.id, { ziel: e.target.value })}
                  placeholder="Reiseziel / Anlass"
                  className="flex-1 text-sm font-medium bg-transparent outline-none border-b border-transparent focus:border-primary"
                />
                <button onClick={() => removeReise(r.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Tage abwesend</label>
                  <input type="number" min={1} max={30} value={r.tageAbwesend} onChange={e => updateReise(r.id, { tageAbwesend: +e.target.value })} className="w-full mt-0.5 rounded border px-2 py-1 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Verkehrsmittel</label>
                  <select value={r.fahrtArt} onChange={e => updateReise(r.id, { fahrtArt: e.target.value as Reise['fahrtArt'] })} className="w-full mt-0.5 rounded border px-2 py-1 text-sm bg-background">
                    <option value="pkw">PKW (0,30 €/km)</option>
                    <option value="bahn">Bahn</option>
                    <option value="flug">Flug</option>
                  </select>
                </div>
                {r.fahrtArt === 'pkw' ? (
                  <div>
                    <label className="text-xs text-muted-foreground">km einfach</label>
                    <input type="number" min={0} value={r.kmEinfach} onChange={e => updateReise(r.id, { kmEinfach: +e.target.value })} className="w-full mt-0.5 rounded border px-2 py-1 text-sm" />
                  </div>
                ) : (
                  <div>
                    <label className="text-xs text-muted-foreground">Ticketkosten (€)</label>
                    <input type="number" min={0} value={r.fahrtkosten} onChange={e => updateReise(r.id, { fahrtkosten: +e.target.value })} className="w-full mt-0.5 rounded border px-2 py-1 text-sm" />
                  </div>
                )}
                <div>
                  <label className="text-xs text-muted-foreground">Übernachtung (€)</label>
                  <input type="number" min={0} value={r.uebernachtungKosten} onChange={e => updateReise(r.id, { uebernachtungKosten: +e.target.value })} className="w-full mt-0.5 rounded border px-2 py-1 text-sm" />
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 text-xs">
                  <input type="checkbox" checked={r.anreisetag} onChange={e => updateReise(r.id, { anreisetag: e.target.checked })} className="rounded" />
                  Anreisetag (14 €)
                </label>
                <label className="flex items-center gap-1.5 text-xs">
                  <input type="checkbox" checked={r.abreisetag} onChange={e => updateReise(r.id, { abreisetag: e.target.checked })} className="rounded" />
                  Abreisetag (14 €)
                </label>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Grenzsteuersatz */}
      <Card>
        <CardContent className="pt-4">
          <label className="text-sm font-medium">Grenzsteuersatz: {grenzsteuersatz} %</label>
          <input type="range" min={14} max={45} value={grenzsteuersatz} onChange={e => setGrenzsteuersatz(+e.target.value)} className="w-full accent-primary" />
        </CardContent>
      </Card>

      {/* Ergebnis */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="text-lg">Gesamtübersicht Reisekosten</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4 mb-6">
            <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-3 text-center">
              <p className="text-lg font-bold text-blue-700 dark:text-blue-400">{berechnung.gesamtVPMA.toLocaleString('de-DE')} €</p>
              <p className="text-xs text-muted-foreground mt-0.5">Verpflegung</p>
            </div>
            <div className="rounded-lg bg-purple-100 dark:bg-purple-900/30 p-3 text-center">
              <p className="text-lg font-bold text-purple-700 dark:text-purple-400">{berechnung.gesamtUebernachtung.toLocaleString('de-DE')} €</p>
              <p className="text-xs text-muted-foreground mt-0.5">Übernachtung</p>
            </div>
            <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 p-3 text-center">
              <p className="text-lg font-bold text-amber-700 dark:text-amber-400">{berechnung.gesamtFahrt.toLocaleString('de-DE')} €</p>
              <p className="text-xs text-muted-foreground mt-0.5">Fahrtkosten</p>
            </div>
            <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-3 text-center">
              <p className="text-lg font-bold text-green-700 dark:text-green-400">{berechnung.ersparnis.toLocaleString('de-DE')} €</p>
              <p className="text-xs text-muted-foreground mt-0.5">Steuerersparnis</p>
            </div>
          </div>

          {/* Einzelaufstellung */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-3">Reise</th>
                  <th className="py-2 pr-3 text-right">Verpflegung</th>
                  <th className="py-2 pr-3 text-right">Übernachtung</th>
                  <th className="py-2 pr-3 text-right">Fahrt</th>
                  <th className="py-2 text-right">Summe</th>
                </tr>
              </thead>
              <tbody>
                {berechnung.details.map(d => (
                  <tr key={d.id} className="border-b">
                    <td className="py-2 pr-3">{d.ziel || '(ohne Bezeichnung)'}</td>
                    <td className="py-2 pr-3 text-right">{d.vpma.toLocaleString('de-DE')} €</td>
                    <td className="py-2 pr-3 text-right">{d.uebernachtungKosten.toLocaleString('de-DE')} €</td>
                    <td className="py-2 pr-3 text-right">{d.fahrt.toLocaleString('de-DE')} €</td>
                    <td className="py-2 text-right font-medium">{(d.vpma + d.uebernachtungKosten + d.fahrt).toLocaleString('de-DE')} €</td>
                  </tr>
                ))}
                <tr className="font-semibold">
                  <td className="py-2 pr-3">Gesamt</td>
                  <td className="py-2 pr-3 text-right">{berechnung.gesamtVPMA.toLocaleString('de-DE')} €</td>
                  <td className="py-2 pr-3 text-right">{berechnung.gesamtUebernachtung.toLocaleString('de-DE')} €</td>
                  <td className="py-2 pr-3 text-right">{berechnung.gesamtFahrt.toLocaleString('de-DE')} €</td>
                  <td className="py-2 text-right text-primary">{berechnung.gesamt.toLocaleString('de-DE')} €</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
