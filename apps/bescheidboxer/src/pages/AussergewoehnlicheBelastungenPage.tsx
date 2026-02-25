import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { HeartCrack, Info, Plus, Trash2 } from 'lucide-react'

interface Position {
  id: number
  bezeichnung: string
  betrag: number
  kategorie: 'krankheit' | 'behinderung' | 'pflege' | 'bestattung' | 'sonstiges'
}

type Familienstand = 'ledig_ohne' | 'ledig_1_2' | 'ledig_3plus' | 'verheiratet_ohne' | 'verheiratet_1_2' | 'verheiratet_3plus'

const FAMILIENSTAND_OPTIONS: { value: Familienstand; label: string }[] = [
  { value: 'ledig_ohne', label: 'Ledig, keine Kinder' },
  { value: 'ledig_1_2', label: 'Ledig, 1–2 Kinder' },
  { value: 'ledig_3plus', label: 'Ledig, 3+ Kinder' },
  { value: 'verheiratet_ohne', label: 'Verheiratet, keine Kinder' },
  { value: 'verheiratet_1_2', label: 'Verheiratet, 1–2 Kinder' },
  { value: 'verheiratet_3plus', label: 'Verheiratet, 3+ Kinder' },
]

// BFH-Stufenmethode seit 2017: zumutbare Belastung wird stufenweise berechnet
function calcZumutbareBelastung(gesamtEinkuenfte: number, familienstand: Familienstand): number {
  // Prozentsätze je Stufe und Familienstand
  const saetze: Record<Familienstand, [number, number, number]> = {
    ledig_ohne:         [5, 6, 7],
    ledig_1_2:          [2, 3, 4],
    ledig_3plus:        [1, 1, 2],
    verheiratet_ohne:   [4, 5, 6],
    verheiratet_1_2:    [2, 3, 4],
    verheiratet_3plus:  [1, 1, 2],
  }

  const [s1, s2, s3] = saetze[familienstand]

  // Stufe 1: bis 15.340 €
  // Stufe 2: 15.340 – 51.130 €
  // Stufe 3: über 51.130 €
  let zb = 0
  const stufe1 = Math.min(gesamtEinkuenfte, 15340)
  zb += stufe1 * s1 / 100

  if (gesamtEinkuenfte > 15340) {
    const stufe2 = Math.min(gesamtEinkuenfte - 15340, 51130 - 15340)
    zb += stufe2 * s2 / 100
  }

  if (gesamtEinkuenfte > 51130) {
    const stufe3 = gesamtEinkuenfte - 51130
    zb += stufe3 * s3 / 100
  }

  return Math.round(zb)
}

export default function AussergewoehnlicheBelastungenPage() {
  const [gesamtEinkuenfte, setGesamtEinkuenfte] = useState(60000)
  const [familienstand, setFamilienstand] = useState<Familienstand>('verheiratet_1_2')
  const [grenzsteuersatz, setGrenzsteuersatz] = useState(42)
  const [positionen, setPositionen] = useState<Position[]>([
    { id: 1, bezeichnung: 'Zahnersatz (Eigenanteil)', betrag: 3200, kategorie: 'krankheit' },
    { id: 2, bezeichnung: 'Brille', betrag: 450, kategorie: 'krankheit' },
    { id: 3, bezeichnung: 'Heilpraktiker', betrag: 800, kategorie: 'krankheit' },
  ])

  const addPosition = () => {
    setPositionen(prev => [...prev, { id: Date.now(), bezeichnung: '', betrag: 0, kategorie: 'krankheit' }])
  }

  const removePosition = (id: number) => {
    setPositionen(prev => prev.filter(p => p.id !== id))
  }

  const ergebnis = useMemo(() => {
    const summe = positionen.reduce((s, p) => s + p.betrag, 0)
    const zumutbar = calcZumutbareBelastung(gesamtEinkuenfte, familienstand)
    const abzugsfaehig = Math.max(0, summe - zumutbar)
    const ersparnis = Math.round(abzugsfaehig * grenzsteuersatz / 100)

    // Stufenberechnung für Anzeige
    const saetze: Record<Familienstand, [number, number, number]> = {
      ledig_ohne:         [5, 6, 7],
      ledig_1_2:          [2, 3, 4],
      ledig_3plus:        [1, 1, 2],
      verheiratet_ohne:   [4, 5, 6],
      verheiratet_1_2:    [2, 3, 4],
      verheiratet_3plus:  [1, 1, 2],
    }
    const [s1, s2, s3] = saetze[familienstand]

    const stufen = [
      { label: `Stufe 1: bis 15.340 € (${s1}%)`, betrag: Math.round(Math.min(gesamtEinkuenfte, 15340) * s1 / 100) },
      { label: `Stufe 2: 15.340–51.130 € (${s2}%)`, betrag: gesamtEinkuenfte > 15340 ? Math.round(Math.min(gesamtEinkuenfte - 15340, 35790) * s2 / 100) : 0 },
      { label: `Stufe 3: ab 51.130 € (${s3}%)`, betrag: gesamtEinkuenfte > 51130 ? Math.round((gesamtEinkuenfte - 51130) * s3 / 100) : 0 },
    ]

    const kategorien = [
      { label: 'Krankheit', summe: positionen.filter(p => p.kategorie === 'krankheit').reduce((s, p) => s + p.betrag, 0) },
      { label: 'Behinderung', summe: positionen.filter(p => p.kategorie === 'behinderung').reduce((s, p) => s + p.betrag, 0) },
      { label: 'Pflege', summe: positionen.filter(p => p.kategorie === 'pflege').reduce((s, p) => s + p.betrag, 0) },
      { label: 'Bestattung', summe: positionen.filter(p => p.kategorie === 'bestattung').reduce((s, p) => s + p.betrag, 0) },
      { label: 'Sonstiges', summe: positionen.filter(p => p.kategorie === 'sonstiges').reduce((s, p) => s + p.betrag, 0) },
    ].filter(k => k.summe > 0)

    return { summe, zumutbar, abzugsfaehig, ersparnis, stufen, kategorien }
  }, [positionen, gesamtEinkuenfte, familienstand, grenzsteuersatz])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <HeartCrack className="h-6 w-6 text-primary" />
          Außergewöhnliche Belastungen
        </h1>
        <p className="text-muted-foreground mt-1">
          § 33 EStG – Krankheit, Pflege, Bestattung und andere unvermeidbare Kosten absetzen
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>§ 33 EStG:</strong> Aufwendungen, die zwangsläufig und außergewöhnlich sind, können die Einkommensteuer mindern – abzüglich der zumutbaren Belastung.</p>
              <p><strong>BFH-Stufenmethode (seit 2017):</strong> Die zumutbare Belastung wird nicht mehr einheitlich, sondern stufenweise berechnet – das ist meist günstiger.</p>
              <p><strong>Beispiele:</strong> Krankheitskosten (Eigenanteile, Brillen, Zahnersatz), Bestattungskosten, Pflegekosten, Scheidungskosten.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Eingaben</CardTitle>
            <CardDescription>Einkommen und Familienstand</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Gesamtbetrag der Einkünfte: {gesamtEinkuenfte.toLocaleString('de-DE')} €</label>
              <input type="range" min={10000} max={200000} step={1000} value={gesamtEinkuenfte} onChange={e => setGesamtEinkuenfte(+e.target.value)} className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-muted-foreground"><span>10.000 €</span><span>200.000 €</span></div>
            </div>
            <div>
              <label className="text-sm font-medium">Familienstand</label>
              <select value={familienstand} onChange={e => setFamilienstand(e.target.value as Familienstand)} className="w-full mt-1 rounded-md border px-3 py-2 text-sm bg-background">
                {FAMILIENSTAND_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Grenzsteuersatz: {grenzsteuersatz} %</label>
              <input type="range" min={14} max={45} value={grenzsteuersatz} onChange={e => setGrenzsteuersatz(+e.target.value)} className="w-full accent-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Aufwendungen</CardTitle>
              <button onClick={addPosition} className="flex items-center gap-1 text-xs text-primary hover:underline">
                <Plus className="h-3 w-3" /> Position
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {positionen.map(pos => (
              <div key={pos.id} className="flex items-center gap-2 rounded-lg border p-2">
                <input
                  type="text"
                  value={pos.bezeichnung}
                  onChange={e => setPositionen(prev => prev.map(p => p.id === pos.id ? { ...p, bezeichnung: e.target.value } : p))}
                  placeholder="Bezeichnung"
                  className="flex-1 text-sm bg-transparent outline-none"
                />
                <select
                  value={pos.kategorie}
                  onChange={e => setPositionen(prev => prev.map(p => p.id === pos.id ? { ...p, kategorie: e.target.value as Position['kategorie'] } : p))}
                  className="text-xs rounded border px-2 py-1 bg-background"
                >
                  <option value="krankheit">Krankheit</option>
                  <option value="behinderung">Behinderung</option>
                  <option value="pflege">Pflege</option>
                  <option value="bestattung">Bestattung</option>
                  <option value="sonstiges">Sonstiges</option>
                </select>
                <input
                  type="number"
                  value={pos.betrag}
                  onChange={e => setPositionen(prev => prev.map(p => p.id === pos.id ? { ...p, betrag: +e.target.value } : p))}
                  className="w-24 rounded border px-2 py-1 text-sm text-right"
                />
                <span className="text-xs text-muted-foreground">€</span>
                <button onClick={() => removePosition(pos.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Ergebnis */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="text-lg">Ergebnis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4 mb-6">
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-xl font-bold">{ergebnis.summe.toLocaleString('de-DE')} €</p>
              <p className="text-xs text-muted-foreground">Aufwendungen gesamt</p>
            </div>
            <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 p-3 text-center">
              <p className="text-xl font-bold text-amber-700 dark:text-amber-400">−{ergebnis.zumutbar.toLocaleString('de-DE')} €</p>
              <p className="text-xs text-muted-foreground">Zumutbare Belastung</p>
            </div>
            <div className="rounded-lg bg-primary/10 p-3 text-center">
              <p className="text-xl font-bold text-primary">{ergebnis.abzugsfaehig.toLocaleString('de-DE')} €</p>
              <p className="text-xs text-muted-foreground">Abzugsfähig</p>
            </div>
            <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-3 text-center">
              <p className="text-xl font-bold text-green-700 dark:text-green-400">{ergebnis.ersparnis.toLocaleString('de-DE')} €</p>
              <p className="text-xs text-muted-foreground">Steuerersparnis</p>
            </div>
          </div>

          {/* Stufenberechnung */}
          <div className="space-y-2 mb-4">
            <p className="text-sm font-medium">Zumutbare Belastung (Stufenmethode)</p>
            {ergebnis.stufen.map((s, i) => (
              <div key={i} className="flex justify-between text-sm py-1 border-b border-border/40">
                <span className="text-muted-foreground">{s.label}</span>
                <span className="font-medium">{s.betrag.toLocaleString('de-DE')} €</span>
              </div>
            ))}
            <div className="flex justify-between text-sm py-1 font-medium">
              <span>Zumutbare Belastung gesamt</span>
              <span className="text-amber-600">{ergebnis.zumutbar.toLocaleString('de-DE')} €</span>
            </div>
          </div>

          {/* Kategorie */}
          {ergebnis.kategorien.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Nach Kategorie</p>
              {ergebnis.kategorien.map((k, i) => (
                <div key={i} className="flex justify-between text-sm py-1 border-b border-border/40">
                  <span className="text-muted-foreground">{k.label}</span>
                  <span className="font-medium">{k.summe.toLocaleString('de-DE')} €</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hinweis: Progressionsvorbehalt-Tabelle */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Zumutbare Belastung – Prozentsätze</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4">Einkünfte</th>
                  <th className="py-2 pr-4">Ledig, o. Kinder</th>
                  <th className="py-2 pr-4">Verh., o. Kinder</th>
                  <th className="py-2 pr-4">1–2 Kinder</th>
                  <th className="py-2">3+ Kinder</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 pr-4">bis 15.340 €</td>
                  <td className="py-2 pr-4">5 %</td>
                  <td className="py-2 pr-4">4 %</td>
                  <td className="py-2 pr-4">2 %</td>
                  <td className="py-2">1 %</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4">15.340–51.130 €</td>
                  <td className="py-2 pr-4">6 %</td>
                  <td className="py-2 pr-4">5 %</td>
                  <td className="py-2 pr-4">3 %</td>
                  <td className="py-2">1 %</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">ab 51.130 €</td>
                  <td className="py-2 pr-4">7 %</td>
                  <td className="py-2 pr-4">6 %</td>
                  <td className="py-2 pr-4">4 %</td>
                  <td className="py-2">2 %</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
