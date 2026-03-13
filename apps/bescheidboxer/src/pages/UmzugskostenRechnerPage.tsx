import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Truck, Info, Plus, Trash2 } from 'lucide-react'

interface Position {
  id: number
  bezeichnung: string
  betrag: number
  kategorie: 'transport' | 'reise' | 'makler' | 'sonstiges'
}

// Umzugskostenpauschale 2025 (geschätzt, da jährlich angepasst)
const PAUSCHALE_SINGLE = 964
const PAUSCHALE_VERHEIRATET = 1928
const PAUSCHALE_PRO_PERSON = 643

export default function UmzugskostenRechnerPage() {
  const [methode, setMethode] = useState<'pauschale' | 'einzelnachweis'>('pauschale')
  const [verheiratet, setVerheiratet] = useState(false)
  const [weiterePersonen, setWeiterePersonen] = useState(1)
  const [grenzsteuersatz, setGrenzsteuersatz] = useState(42)
  const [beruflichVeranlasst, setBeruflichVeranlasst] = useState(true)
  const [positionen, setPositionen] = useState<Position[]>([
    { id: 1, bezeichnung: 'Umzugsunternehmen', betrag: 2800, kategorie: 'transport' },
    { id: 2, bezeichnung: 'Doppelte Miete (1 Monat)', betrag: 950, kategorie: 'sonstiges' },
    { id: 3, bezeichnung: 'Maklerprovision', betrag: 1500, kategorie: 'makler' },
    { id: 4, bezeichnung: 'Fahrtkosten Wohnungssuche', betrag: 280, kategorie: 'reise' },
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
    if (methode === 'pauschale') {
      const basis = verheiratet ? PAUSCHALE_VERHEIRATET : PAUSCHALE_SINGLE
      const zuschlag = weiterePersonen * PAUSCHALE_PRO_PERSON
      const gesamt = basis + zuschlag
      const ersparnis = Math.round(gesamt * grenzsteuersatz / 100)
      return {
        abzug: gesamt,
        ersparnis,
        details: [
          { label: verheiratet ? 'Grundpauschale (verheiratet)' : 'Grundpauschale (ledig)', wert: basis },
          ...(weiterePersonen > 0 ? [{ label: `${weiterePersonen} weitere Person(en) × ${PAUSCHALE_PRO_PERSON} €`, wert: zuschlag }] : []),
          { label: 'Gesamt-Pauschale', wert: gesamt },
        ],
      }
    }

    // Einzelnachweis
    const summeTransport = positionen.filter(p => p.kategorie === 'transport').reduce((s, p) => s + p.betrag, 0)
    const summeReise = positionen.filter(p => p.kategorie === 'reise').reduce((s, p) => s + p.betrag, 0)
    const summeMakler = positionen.filter(p => p.kategorie === 'makler').reduce((s, p) => s + p.betrag, 0)
    const summeSonstiges = positionen.filter(p => p.kategorie === 'sonstiges').reduce((s, p) => s + p.betrag, 0)
    const gesamt = summeTransport + summeReise + summeMakler + summeSonstiges
    const ersparnis = Math.round(gesamt * grenzsteuersatz / 100)

    return {
      abzug: gesamt,
      ersparnis,
      details: [
        { label: 'Transport & Spedition', wert: summeTransport },
        { label: 'Reisekosten', wert: summeReise },
        { label: 'Maklerkosten', wert: summeMakler },
        { label: 'Sonstige Kosten', wert: summeSonstiges },
        { label: 'Gesamt', wert: gesamt },
      ],
    }
  }, [methode, verheiratet, weiterePersonen, grenzsteuersatz, positionen])

  // Vergleich Pauschale vs. Einzelnachweis
  const pauschaleVergleich = useMemo(() => {
    const basis = verheiratet ? PAUSCHALE_VERHEIRATET : PAUSCHALE_SINGLE
    return basis + weiterePersonen * PAUSCHALE_PRO_PERSON
  }, [verheiratet, weiterePersonen])

  const einzelnachweisVergleich = useMemo(() => {
    return positionen.reduce((s, p) => s + p.betrag, 0)
  }, [positionen])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Truck className="h-6 w-6 text-primary" />
          Umzugskosten-Rechner
        </h1>
        <p className="text-muted-foreground mt-1">
          Berufsbedingte Umzugskosten steuerlich absetzen – Pauschale oder Einzelnachweis
        </p>
      </div>

      {!beruflichVeranlasst && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
          <CardContent className="pt-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Hinweis:</strong> Nur beruflich veranlasste Umzüge sind als Werbungskosten absetzbar. Private Umzüge können ggf. unter haushaltsnahe Dienstleistungen (§ 35a) geltend gemacht werden.
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Beruflich veranlasst</strong> ist ein Umzug, wenn sich die Fahrzeit zur Arbeit um mind. 1 Stunde verkürzt, ein Arbeitsplatzwechsel vorliegt oder der Arbeitgeber den Umzug verlangt.</p>
              <p><strong>Pauschale 2025:</strong> Ledig {PAUSCHALE_SINGLE} € / Verheiratet {PAUSCHALE_VERHEIRATET} € + {PAUSCHALE_PRO_PERSON} € pro weitere Person (Kinder, Angehörige).</p>
              <p><strong>Einzelnachweis:</strong> Tatsächliche Kosten (Spedition, doppelte Miete, Makler, Reisekosten) mit Belegen.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Eingaben */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Grunddaten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="beruf" checked={beruflichVeranlasst} onChange={e => setBeruflichVeranlasst(e.target.checked)} className="rounded" />
                <label htmlFor="beruf" className="text-sm">Beruflich veranlasster Umzug</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="verh" checked={verheiratet} onChange={e => setVerheiratet(e.target.checked)} className="rounded" />
                <label htmlFor="verh" className="text-sm">Verheiratet / Lebenspartnerschaft</label>
              </div>
              <div>
                <label className="text-sm font-medium">Weitere Personen im Haushalt: {weiterePersonen}</label>
                <input type="range" min={0} max={6} value={weiterePersonen} onChange={e => setWeiterePersonen(+e.target.value)} className="w-full accent-primary" />
              </div>
              <div>
                <label className="text-sm font-medium">Grenzsteuersatz: {grenzsteuersatz} %</label>
                <input type="range" min={14} max={45} value={grenzsteuersatz} onChange={e => setGrenzsteuersatz(+e.target.value)} className="w-full accent-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Methode</CardTitle>
              <CardDescription>Pauschale oder Einzelnachweis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {([
                { value: 'pauschale' as const, label: 'Pauschale', desc: 'Einfach, ohne Belege' },
                { value: 'einzelnachweis' as const, label: 'Einzelnachweis', desc: 'Tatsächliche Kosten mit Belegen' },
              ]).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setMethode(opt.value)}
                  className={`w-full text-left rounded-lg border-2 p-3 transition-colors ${
                    methode === opt.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                  }`}
                >
                  <p className="font-medium text-sm">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Einzelnachweis-Positionen oder Ergebnis */}
        {methode === 'einzelnachweis' ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Kostenpositionen</CardTitle>
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
                    <option value="transport">Transport</option>
                    <option value="reise">Reise</option>
                    <option value="makler">Makler</option>
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
        ) : (
          <div />
        )}
      </div>

      {/* Ergebnis */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="text-lg">
            Ergebnis: {methode === 'pauschale' ? 'Umzugskostenpauschale' : 'Einzelnachweis'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 mb-6">
            <div className="rounded-lg bg-primary/10 p-4 text-center">
              <p className="text-2xl font-bold text-primary">{ergebnis.abzug.toLocaleString('de-DE')} €</p>
              <p className="text-xs text-muted-foreground mt-1">Absetzbar als Werbungskosten</p>
            </div>
            <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-4 text-center">
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{ergebnis.ersparnis.toLocaleString('de-DE')} €</p>
              <p className="text-xs text-muted-foreground mt-1">Steuerersparnis (bei {grenzsteuersatz} %)</p>
            </div>
          </div>

          <div className="space-y-2">
            {ergebnis.details.map((d, i) => (
              <div key={i} className="flex justify-between text-sm py-1 border-b border-border/40 last:border-0">
                <span className="text-muted-foreground">{d.label}</span>
                <span className="font-medium">{d.wert.toLocaleString('de-DE')} €</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vergleich */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vergleich: Pauschale vs. Einzelnachweis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: 'Pauschale', abzug: pauschaleVergleich },
              { label: 'Einzelnachweis', abzug: einzelnachweisVergleich },
            ].map((v, i) => {
              const max = Math.max(pauschaleVergleich, einzelnachweisVergleich)
              const isBest = v.abzug === max
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className={isBest ? 'font-semibold text-primary' : ''}>{v.label} {isBest && '← empfohlen'}</span>
                    <span className="font-medium">{v.abzug.toLocaleString('de-DE')} € → Ersparnis {Math.round(v.abzug * grenzsteuersatz / 100).toLocaleString('de-DE')} €</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isBest ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                      style={{ width: `${max > 0 ? (v.abzug / max) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Checkliste */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Checkliste: Beruflich veranlasster Umzug</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              'Arbeitsplatzwechsel / Versetzung',
              'Fahrzeitverkürzung ≥ 1 Stunde',
              'Dienstwohnung bezogen/geräumt',
              'Erste Berufstätigkeit nach Studium',
              'Rückkehr aus dem Ausland',
              'Arbeitgeber verlangt Umzug',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                {item}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Mindestens einer dieser Gründe muss vorliegen, damit der Umzug als beruflich veranlasst gilt.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
