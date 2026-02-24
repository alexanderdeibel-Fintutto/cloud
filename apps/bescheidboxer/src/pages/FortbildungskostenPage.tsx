import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { BookMarked, Info, Plus, Trash2 } from 'lucide-react'

interface Position {
  id: number
  bezeichnung: string
  betrag: number
  kategorie: 'kurs' | 'literatur' | 'arbeitsmittel' | 'fahrt' | 'uebernachtung' | 'verpflegung' | 'sonstiges'
}

type AusbildungsTyp = 'erstausbildung' | 'zweitausbildung'

const MAX_ERSTAUSBILDUNG = 6000

const KATEGORIE_LABELS: Record<string, string> = {
  kurs: 'Kurs-/Studiengebühren',
  literatur: 'Fachliteratur',
  arbeitsmittel: 'Arbeitsmittel',
  fahrt: 'Fahrtkosten',
  uebernachtung: 'Übernachtung',
  verpflegung: 'Verpflegung',
  sonstiges: 'Sonstiges',
}

export default function FortbildungskostenPage() {
  const [typ, setTyp] = useState<AusbildungsTyp>('zweitausbildung')
  const [grenzsteuersatz, setGrenzsteuersatz] = useState(42)
  const [positionen, setPositionen] = useState<Position[]>([
    { id: 1, bezeichnung: 'Weiterbildungskurs', betrag: 1800, kategorie: 'kurs' },
    { id: 2, bezeichnung: 'Fachbücher & E-Learning', betrag: 320, kategorie: 'literatur' },
    { id: 3, bezeichnung: 'Laptop (anteilig, beruflich)', betrag: 600, kategorie: 'arbeitsmittel' },
    { id: 4, bezeichnung: 'Fahrtkosten (120 km × 0,30€ × 10 Tage)', betrag: 360, kategorie: 'fahrt' },
    { id: 5, bezeichnung: 'Hotel (3 Nächte à 95€)', betrag: 285, kategorie: 'uebernachtung' },
    { id: 6, bezeichnung: 'Verpflegungsmehraufwand (3 Tage)', betrag: 84, kategorie: 'verpflegung' },
  ])

  const addPosition = () => {
    setPositionen(prev => [...prev, {
      id: Date.now(),
      bezeichnung: '',
      betrag: 0,
      kategorie: 'sonstiges',
    }])
  }

  const removePosition = (id: number) => {
    setPositionen(prev => prev.filter(p => p.id !== id))
  }

  const ergebnis = useMemo(() => {
    const gesamt = positionen.reduce((s, p) => s + p.betrag, 0)

    // Kategorien aufschlüsseln
    const byKat: Record<string, number> = {}
    positionen.forEach(p => {
      byKat[p.kategorie] = (byKat[p.kategorie] || 0) + p.betrag
    })

    let abzug: number
    let abzugsart: string

    if (typ === 'erstausbildung') {
      abzug = Math.min(gesamt, MAX_ERSTAUSBILDUNG)
      abzugsart = `Sonderausgaben (max. ${MAX_ERSTAUSBILDUNG.toLocaleString('de-DE')} €)`
    } else {
      abzug = gesamt
      abzugsart = 'Werbungskosten (unbegrenzt)'
    }

    const ersparnis = Math.round(abzug * grenzsteuersatz / 100)

    return { gesamt, abzug, abzugsart, ersparnis, byKat }
  }, [positionen, typ, grenzsteuersatz])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookMarked className="h-6 w-6 text-primary" />
          Fortbildungskosten-Rechner
        </h1>
        <p className="text-muted-foreground mt-1">
          Fort-/Weiterbildung und Studienkosten steuerlich absetzen
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Erstausbildung (Erststudium ohne vorherige Berufsausbildung):</strong> Max. 6.000 € als Sonderausgaben. Kein Verlustvortrag möglich.</p>
              <p><strong>Zweitausbildung / Fort- & Weiterbildung:</strong> Unbegrenzt als Werbungskosten absetzbar. Verlustvortrag möglich!</p>
              <p><strong>Duales Studium:</strong> Gilt als Zweitausbildung (Dienstverhältnis) → volle Werbungskosten.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Eingaben */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ausbildungstyp</CardTitle>
              <CardDescription>Entscheidend für die steuerliche Behandlung</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {([
                { value: 'zweitausbildung' as AusbildungsTyp, label: 'Zweitausbildung / Fortbildung', desc: 'Werbungskosten – unbegrenzt absetzbar' },
                { value: 'erstausbildung' as AusbildungsTyp, label: 'Erstausbildung', desc: 'Sonderausgaben – max. 6.000 €/Jahr' },
              ]).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setTyp(opt.value)}
                  className={`w-full text-left rounded-lg border-2 p-3 transition-colors ${
                    typ === opt.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                  }`}
                >
                  <p className="font-medium text-sm">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </button>
              ))}
              <div className="pt-2">
                <label className="text-sm font-medium">Grenzsteuersatz: {grenzsteuersatz} %</label>
                <input type="range" min={14} max={45} value={grenzsteuersatz} onChange={e => setGrenzsteuersatz(+e.target.value)} className="w-full accent-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Kostenpositionen</CardTitle>
                <button onClick={addPosition} className="flex items-center gap-1 text-xs text-primary hover:underline">
                  <Plus className="h-3 w-3" /> Position
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
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
                    className="text-xs rounded border px-1.5 py-1 bg-background"
                  >
                    {Object.entries(KATEGORIE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={pos.betrag}
                    onChange={e => setPositionen(prev => prev.map(p => p.id === pos.id ? { ...p, betrag: +e.target.value } : p))}
                    className="w-20 rounded border px-2 py-1 text-sm text-right"
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
        <div className="space-y-4">
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="text-lg">Ergebnis: {ergebnis.abzugsart}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-lg bg-primary/10 p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{ergebnis.abzug.toLocaleString('de-DE')} €</p>
                  <p className="text-xs text-muted-foreground mt-1">Steuerlich absetzbar</p>
                </div>
                <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-4 text-center">
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">{ergebnis.ersparnis.toLocaleString('de-DE')} €</p>
                  <p className="text-xs text-muted-foreground mt-1">Steuerersparnis</p>
                </div>
              </div>

              {typ === 'erstausbildung' && ergebnis.gesamt > MAX_ERSTAUSBILDUNG && (
                <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 p-3 mb-4 text-sm text-amber-800 dark:text-amber-200">
                  <strong>Hinweis:</strong> Ihre Kosten ({ergebnis.gesamt.toLocaleString('de-DE')} €) übersteigen den Höchstbetrag von {MAX_ERSTAUSBILDUNG.toLocaleString('de-DE')} €.
                  Es werden nur {MAX_ERSTAUSBILDUNG.toLocaleString('de-DE')} € anerkannt.
                </div>
              )}

              {/* Aufschlüsselung nach Kategorie */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Aufschlüsselung</p>
                {Object.entries(ergebnis.byKat).map(([k, v]) => (
                  <div key={k} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{KATEGORIE_LABELS[k] || k}</span>
                      <span className="font-medium">{v.toLocaleString('de-DE')} €</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${ergebnis.gesamt > 0 ? (v / ergebnis.gesamt) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
                <div className="flex justify-between text-sm pt-2 border-t font-semibold">
                  <span>Gesamt</span>
                  <span className="text-primary">{ergebnis.gesamt.toLocaleString('de-DE')} €</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Typische absetzbare Kosten */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Typische absetzbare Kosten</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  'Kurs- & Studiengebühren',
                  'Prüfungsgebühren',
                  'Fachbücher & Zeitschriften',
                  'Laptop, Software, Drucker',
                  'Schreibmaterial',
                  'Fahrtkosten zur Bildungsstätte',
                  'Übernachtung (bei Auswärtstätigkeit)',
                  'Verpflegungsmehraufwand',
                  'Arbeitszimmer (anteilig)',
                  'Zinsen für Bildungskredite',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
