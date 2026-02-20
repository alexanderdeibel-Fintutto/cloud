import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Home, Plus, Trash2, Info, CheckCircle2 } from 'lucide-react'

interface Position {
  id: number
  beschreibung: string
  betrag: number
  typ: 'haushaltnah' | 'handwerker' | 'minijob'
}

const TYP_CONFIG = {
  haushaltnah: {
    label: 'Haushaltsnahe Dienstleistung',
    shortLabel: 'Dienstleistung',
    paragraph: '§ 35a Abs. 2 S. 1 EStG',
    maxAbzug: 4000,
    prozent: 20,
    beispiele: 'Reinigung, Gartenpflege, Pflege, Betreuung, Winterdienst',
  },
  handwerker: {
    label: 'Handwerkerleistungen',
    shortLabel: 'Handwerker',
    paragraph: '§ 35a Abs. 3 EStG',
    maxAbzug: 1200,
    prozent: 20,
    beispiele: 'Renovierung, Reparatur, Modernisierung (nur Lohnkosten)',
  },
  minijob: {
    label: 'Minijob im Haushalt',
    shortLabel: 'Minijob',
    paragraph: '§ 35a Abs. 1 EStG',
    maxAbzug: 510,
    prozent: 20,
    beispiele: 'Haushaltshilfe auf 538€-Basis',
  },
}

const DEMO_POSITIONEN: Position[] = [
  { id: 1, beschreibung: 'Treppenhausreinigung', betrag: 1200, typ: 'haushaltnah' },
  { id: 2, beschreibung: 'Gartenpflege-Service', betrag: 2400, typ: 'haushaltnah' },
  { id: 3, beschreibung: 'Badezimmer-Sanierung (Lohnanteil)', betrag: 4500, typ: 'handwerker' },
  { id: 4, beschreibung: 'Malerarbeiten Wohnung', betrag: 1800, typ: 'handwerker' },
  { id: 5, beschreibung: 'Haushaltshilfe (Minijob)', betrag: 2550, typ: 'minijob' },
]

let nextId = 100

export default function HaushaltsnaheRechnerPage() {
  const [positionen, setPositionen] = useState<Position[]>(DEMO_POSITIONEN)
  const [neueTyp, setNeueTyp] = useState<Position['typ']>('haushaltnah')
  const [neueBeschreibung, setNeueBeschreibung] = useState('')
  const [neuerBetrag, setNeuerBetrag] = useState(0)
  const [showAdd, setShowAdd] = useState(false)

  const ergebnis = useMemo(() => {
    const gruppen = {
      haushaltnah: { summe: 0, abzug: 0 },
      handwerker: { summe: 0, abzug: 0 },
      minijob: { summe: 0, abzug: 0 },
    }

    for (const p of positionen) {
      gruppen[p.typ].summe += p.betrag
    }

    for (const typ of Object.keys(gruppen) as Position['typ'][]) {
      const config = TYP_CONFIG[typ]
      const raw = gruppen[typ].summe * (config.prozent / 100)
      gruppen[typ].abzug = Math.min(raw, config.maxAbzug)
    }

    const gesamtAbzug = gruppen.haushaltnah.abzug + gruppen.handwerker.abzug + gruppen.minijob.abzug
    return { gruppen, gesamtAbzug }
  }, [positionen])

  const handleAdd = () => {
    if (!neueBeschreibung || neuerBetrag <= 0) return
    setPositionen(prev => [...prev, { id: nextId++, beschreibung: neueBeschreibung, betrag: neuerBetrag, typ: neueTyp }])
    setNeueBeschreibung('')
    setNeuerBetrag(0)
    setShowAdd(false)
  }

  const handleDelete = (id: number) => {
    setPositionen(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Home className="h-6 w-6 text-teal-500" />
            Haushaltsnahe Dienste & Handwerker
          </h1>
          <p className="text-muted-foreground mt-1">
            Steuerermäßigung nach § 35a EStG berechnen
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Position
        </button>
      </div>

      {/* Ergebnis-Karten */}
      <div className="grid sm:grid-cols-3 gap-4">
        {(Object.keys(TYP_CONFIG) as Position['typ'][]).map(typ => {
          const config = TYP_CONFIG[typ]
          const data = ergebnis.gruppen[typ]
          const auslastung = (data.abzug / config.maxAbzug) * 100

          return (
            <Card key={typ}>
              <CardContent className="pt-6 space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">{config.shortLabel}</p>
                  <p className="text-2xl font-bold text-teal-600">{data.abzug.toLocaleString('de-DE')} €</p>
                  <p className="text-xs text-muted-foreground">
                    von max. {config.maxAbzug.toLocaleString('de-DE')} € · Kosten: {data.summe.toLocaleString('de-DE')} €
                  </p>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-teal-500 transition-all"
                    style={{ width: `${Math.min(100, auslastung)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{config.paragraph}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Gesamt */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-teal-500" />
              <div>
                <p className="text-sm text-muted-foreground">Gesamte Steuerermäßigung § 35a EStG</p>
                <p className="text-3xl font-bold text-teal-600">{ergebnis.gesamtAbzug.toLocaleString('de-DE')} €</p>
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>Maximal möglich: {(4000 + 1200 + 510).toLocaleString('de-DE')} €</p>
              <p className="font-medium">Direkte Steuerersparnis (kein Abzug vom Einkommen)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hinzufügen */}
      {showAdd && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Neue Position</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium">Typ</label>
                <select
                  value={neueTyp}
                  onChange={e => setNeueTyp(e.target.value as Position['typ'])}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  {(Object.keys(TYP_CONFIG) as Position['typ'][]).map(t => (
                    <option key={t} value={t}>{TYP_CONFIG[t].label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium">Beschreibung</label>
                <input
                  value={neueBeschreibung}
                  onChange={e => setNeueBeschreibung(e.target.value)}
                  placeholder="z.B. Gartenpflege"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Betrag (€)</label>
                <input
                  type="number"
                  value={neuerBetrag || ''}
                  onChange={e => setNeuerBetrag(Number(e.target.value))}
                  min={0}
                  placeholder="0"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
            <button
              onClick={handleAdd}
              disabled={!neueBeschreibung || neuerBetrag <= 0}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Hinzufügen
            </button>
          </CardContent>
        </Card>
      )}

      {/* Positionen */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Erfasste Positionen</CardTitle>
          <CardDescription>{positionen.length} Positionen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {positionen.map(p => {
              const config = TYP_CONFIG[p.typ]
              return (
                <div key={p.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{p.beschreibung}</p>
                    <p className="text-xs text-muted-foreground">{config.shortLabel} · {config.paragraph}</p>
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap">{p.betrag.toLocaleString('de-DE')} €</span>
                  <span className="text-xs text-teal-600 font-medium whitespace-nowrap">
                    → {Math.round(p.betrag * (config.prozent / 100)).toLocaleString('de-DE')} €
                  </span>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Hinweis */}
      <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-3">
        <div className="flex gap-2">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
            <p><strong>Wichtig:</strong> Bei Handwerkerleistungen ist nur der Lohnanteil (inkl. Fahrtkosten und Maschinenkosten) absetzbar, nicht das Material.</p>
            <p>Beispiele: {Object.values(TYP_CONFIG).map(c => c.beispiele).join(' · ')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
