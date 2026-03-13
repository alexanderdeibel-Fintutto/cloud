import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Utensils, Info, Plus, Trash2 } from 'lucide-react'
import { Button } from '../components/ui/button'

interface Reise {
  id: number
  bezeichnung: string
  tage: number
  uebernachtungen: number
  fruehstueck: number
  inland: boolean
  land: string
}

const PAUSCHALEN_AUSLAND: Record<string, { tag: number; anreisetag: number }> = {
  'Oesterreich': { tag: 36, anreisetag: 24 },
  'Schweiz': { tag: 64, anreisetag: 43 },
  'Frankreich': { tag: 53, anreisetag: 36 },
  'Italien': { tag: 34, anreisetag: 23 },
  'Spanien': { tag: 34, anreisetag: 23 },
  'USA': { tag: 59, anreisetag: 40 },
  'Grossbritannien': { tag: 52, anreisetag: 35 },
  'Niederlande': { tag: 47, anreisetag: 32 },
  'Belgien': { tag: 47, anreisetag: 32 },
  'Polen': { tag: 25, anreisetag: 17 },
}

let reiseCounter = 3

export default function VerpflegungsmehraufwandPage() {
  const [reisen, setReisen] = useState<Reise[]>([
    { id: 1, bezeichnung: 'Kundentermin Muenchen', tage: 1, uebernachtungen: 0, fruehstueck: 0, inland: true, land: 'Deutschland' },
    { id: 2, bezeichnung: 'Messe Frankfurt', tage: 3, uebernachtungen: 2, fruehstueck: 2, inland: true, land: 'Deutschland' },
  ])
  const [grenzsteuersatz, setGrenzsteuersatz] = useState(42)

  const addReise = () => {
    reiseCounter++
    setReisen(prev => [...prev, {
      id: reiseCounter,
      bezeichnung: `Reise ${reiseCounter}`,
      tage: 1,
      uebernachtungen: 0,
      fruehstueck: 0,
      inland: true,
      land: 'Deutschland',
    }])
  }

  const removeReise = (id: number) => {
    setReisen(prev => prev.filter(r => r.id !== id))
  }

  const updateReise = (id: number, field: keyof Reise, value: string | number | boolean) => {
    setReisen(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
  }

  const ergebnis = useMemo(() => {
    let gesamtVMA = 0
    let gesamtKuerzung = 0

    const details = reisen.map(reise => {
      let tagessatz: number
      let anreisesatz: number

      if (reise.inland) {
        tagessatz = 28 // Ganzer Tag (ab 24h Abwesenheit)
        anreisesatz = 14 // An-/Abreisetag oder 8-24h
      } else {
        const land = PAUSCHALEN_AUSLAND[reise.land]
        tagessatz = land ? land.tag : 28
        anreisesatz = land ? land.anreisetag : 14
      }

      let vma: number
      if (reise.tage === 1 && reise.uebernachtungen === 0) {
        // Eintaegige Reise: 14 EUR (mind. 8h Abwesenheit)
        vma = anreisesatz
      } else {
        // Mehrtaegig: An-/Abreisetag je 14 EUR + Zwischentage je 28 EUR
        const zwischentage = Math.max(reise.tage - 2, 0)
        vma = 2 * anreisesatz + zwischentage * tagessatz
      }

      // Kuerzung fuer Mahlzeiten
      const fruehstueckKuerzung = reise.fruehstueck * Math.round(tagessatz * 0.20)
      const kuerzung = Math.min(fruehstueckKuerzung, vma)

      const nettoVMA = vma - kuerzung
      gesamtVMA += nettoVMA
      gesamtKuerzung += kuerzung

      return {
        ...reise,
        tagessatz,
        anreisesatz,
        bruttoVMA: vma,
        kuerzung,
        nettoVMA,
      }
    })

    const steuerersparnis = Math.round(gesamtVMA * grenzsteuersatz / 100)

    // Monatsverteilung fuer Chart
    const monate = ['Jan', 'Feb', 'Mrz', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
    const chartData = monate.map((name, i) => ({
      name,
      vma: i < reisen.length ? details[i]?.nettoVMA || 0 : 0,
    }))

    return { details, gesamtVMA, gesamtKuerzung, steuerersparnis, chartData }
  }, [reisen, grenzsteuersatz])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Utensils className="h-6 w-6 text-primary" />
          Verpflegungsmehraufwand
        </h1>
        <p className="text-muted-foreground mt-1">
          Dienstreise-Pauschalen berechnen – § 9 Abs. 4a EStG
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Inland:</strong> Ab 8h Abwesenheit: <strong>14 EUR</strong>. Ab 24h: <strong>28 EUR/Tag</strong>. An-/Abreisetag bei Uebernachtung: je <strong>14 EUR</strong>.</p>
              <p><strong>Kuerzung:</strong> Bei gestelltem Fruehstueck 20%, Mittag-/Abendessen je 40% des Tagessatzes.</p>
              <p><strong>Ausland:</strong> Laenderspezifische Pauschalen (BMF-Schreiben).</p>
              <p><strong>3-Monats-Regel:</strong> Gleiche Taetigkeitsstaette max. 3 Monate absetzbar.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reisen */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Dienstreisen</CardTitle>
            <Button size="sm" variant="outline" onClick={addReise} className="gap-1">
              <Plus className="h-3 w-3" />
              Reise
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {reisen.map((reise) => (
            <div key={reise.id} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <input
                  value={reise.bezeichnung}
                  onChange={e => updateReise(reise.id, 'bezeichnung', e.target.value)}
                  className="font-medium bg-transparent border-none outline-none text-sm flex-1"
                />
                {reisen.length > 1 && (
                  <Button size="icon" variant="ghost" onClick={() => removeReise(reise.id)} className="h-7 w-7 text-muted-foreground">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="text-xs text-muted-foreground">Reisetage</label>
                  <input type="number" min={1} max={30} value={reise.tage} onChange={e => updateReise(reise.id, 'tage', +e.target.value)} className="w-full rounded border px-2 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Uebernachtungen</label>
                  <input type="number" min={0} max={29} value={reise.uebernachtungen} onChange={e => updateReise(reise.id, 'uebernachtungen', +e.target.value)} className="w-full rounded border px-2 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Fruehstueck gestellt</label>
                  <input type="number" min={0} max={30} value={reise.fruehstueck} onChange={e => updateReise(reise.id, 'fruehstueck', +e.target.value)} className="w-full rounded border px-2 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Land</label>
                  <select value={reise.inland ? 'Deutschland' : reise.land} onChange={e => {
                    const val = e.target.value
                    if (val === 'Deutschland') {
                      updateReise(reise.id, 'inland', true)
                      updateReise(reise.id, 'land', 'Deutschland')
                    } else {
                      updateReise(reise.id, 'inland', false)
                      updateReise(reise.id, 'land', val)
                    }
                  }} className="w-full rounded border px-2 py-1.5 text-sm bg-background">
                    <option>Deutschland</option>
                    {Object.keys(PAUSCHALEN_AUSLAND).map(l => (
                      <option key={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Grenzsteuersatz */}
      <Card>
        <CardContent className="pt-6">
          <div>
            <label className="text-sm font-medium">Grenzsteuersatz: {grenzsteuersatz}%</label>
            <input type="range" min={14} max={45} value={grenzsteuersatz} onChange={e => setGrenzsteuersatz(+e.target.value)} className="w-full accent-primary" />
          </div>
        </CardContent>
      </Card>

      {/* Ergebnis */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="text-lg">Ergebnis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3 mb-6">
            <div className="rounded-lg bg-primary/10 p-4 text-center">
              <p className="text-2xl font-bold text-primary">{ergebnis.gesamtVMA.toLocaleString('de-DE')} EUR</p>
              <p className="text-xs text-muted-foreground mt-1">Absetzbarer VMA gesamt</p>
            </div>
            <div className="rounded-lg bg-red-100 dark:bg-red-900/30 p-4 text-center">
              <p className="text-2xl font-bold text-red-700 dark:text-red-400">{ergebnis.gesamtKuerzung.toLocaleString('de-DE')} EUR</p>
              <p className="text-xs text-muted-foreground mt-1">Kuerzung (Mahlzeiten)</p>
            </div>
            <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-4 text-center">
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{ergebnis.steuerersparnis.toLocaleString('de-DE')} EUR</p>
              <p className="text-xs text-muted-foreground mt-1">Steuerersparnis</p>
            </div>
          </div>

          {/* Detail-Tabelle */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4">Reise</th>
                  <th className="py-2 pr-4 text-center">Tage</th>
                  <th className="py-2 pr-4 text-right">Brutto</th>
                  <th className="py-2 pr-4 text-right">Kuerzung</th>
                  <th className="py-2 text-right">Absetzbar</th>
                </tr>
              </thead>
              <tbody>
                {ergebnis.details.map(d => (
                  <tr key={d.id} className="border-b">
                    <td className="py-1.5 pr-4">{d.bezeichnung}</td>
                    <td className="py-1.5 pr-4 text-center">{d.tage}</td>
                    <td className="py-1.5 pr-4 text-right">{d.bruttoVMA.toLocaleString('de-DE')} EUR</td>
                    <td className="py-1.5 pr-4 text-right text-red-600">-{d.kuerzung.toLocaleString('de-DE')} EUR</td>
                    <td className="py-1.5 text-right font-medium">{d.nettoVMA.toLocaleString('de-DE')} EUR</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-bold">
                  <td className="py-2 pr-4">Gesamt</td>
                  <td className="py-2 pr-4 text-center">{reisen.reduce((s, r) => s + r.tage, 0)}</td>
                  <td className="py-2 pr-4 text-right">{ergebnis.details.reduce((s, d) => s + d.bruttoVMA, 0).toLocaleString('de-DE')} EUR</td>
                  <td className="py-2 pr-4 text-right text-red-600">-{ergebnis.gesamtKuerzung.toLocaleString('de-DE')} EUR</td>
                  <td className="py-2 text-right text-primary">{ergebnis.gesamtVMA.toLocaleString('de-DE')} EUR</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Inlands-Pauschalen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-3 text-sm">
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-lg font-bold">14 EUR</p>
              <p className="text-xs text-muted-foreground">Ab 8h Abwesenheit / An-/Abreisetag</p>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-lg font-bold">28 EUR</p>
              <p className="text-xs text-muted-foreground">Ab 24h Abwesenheit (voller Tag)</p>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-lg font-bold">-20%/-40%</p>
              <p className="text-xs text-muted-foreground">Kuerzung Fruehstueck/Mittag-Abend</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
