import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { HeartPulse, Plus, Trash2, Info, CheckCircle2 } from 'lucide-react'

interface Spende {
  id: number
  empfaenger: string
  betrag: number
  typ: 'geld' | 'sach' | 'aufwand'
  zweck: 'gemeinnuetzig' | 'partei' | 'stiftung' | 'kirche'
  datum: string
}

const DEMO_SPENDEN: Spende[] = [
  { id: 1, empfaenger: 'Deutsches Rotes Kreuz', betrag: 500, typ: 'geld', zweck: 'gemeinnuetzig', datum: '2025-03-15' },
  { id: 2, empfaenger: 'Ärzte ohne Grenzen', betrag: 300, typ: 'geld', zweck: 'gemeinnuetzig', datum: '2025-06-20' },
  { id: 3, empfaenger: 'Partei XY', betrag: 600, typ: 'geld', zweck: 'partei', datum: '2025-09-10' },
  { id: 4, empfaenger: 'Kirchengemeinde St. Peter', betrag: 200, typ: 'geld', zweck: 'kirche', datum: '2025-12-24' },
  { id: 5, empfaenger: 'Bürgerstiftung Hamburg', betrag: 1000, typ: 'geld', zweck: 'stiftung', datum: '2025-11-01' },
  { id: 6, empfaenger: 'Kleiderspende Caritas (Zeitwert)', betrag: 150, typ: 'sach', zweck: 'gemeinnuetzig', datum: '2025-04-05' },
]

const ZWECK_CONFIG: Record<string, { label: string; color: string }> = {
  gemeinnuetzig: { label: 'Gemeinnützig', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  partei: { label: 'Partei', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  stiftung: { label: 'Stiftung', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  kirche: { label: 'Kirche', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
}

let nextId = 100

export default function SpendenRechnerPage() {
  const [spenden, setSpenden] = useState<Spende[]>(DEMO_SPENDEN)
  const [gesamteinkommen, setGesamteinkommen] = useState(72000)
  const [showAdd, setShowAdd] = useState(false)
  const [neuEmpf, setNeuEmpf] = useState('')
  const [neuBetrag, setNeuBetrag] = useState(0)
  const [neuZweck, setNeuZweck] = useState<Spende['zweck']>('gemeinnuetzig')

  const ergebnis = useMemo(() => {
    // Gemeinnützige Spenden: max 20% des Gesamtbetrags der Einkünfte
    const gemeinnuetzig = spenden.filter(s => s.zweck === 'gemeinnuetzig' || s.zweck === 'kirche').reduce((s, x) => s + x.betrag, 0)
    const maxGemeinnuetzig = gesamteinkommen * 0.20
    const absetzbarGemeinnuetzig = Math.min(gemeinnuetzig, maxGemeinnuetzig)

    // Parteispenden: 50% Ermäßigung bis 1.650 € (Einzelveranlagung)
    const partei = spenden.filter(s => s.zweck === 'partei').reduce((s, x) => s + x.betrag, 0)
    const parteiErmaessigung = Math.min(partei * 0.5, 825) // 50% bis 1.650 €, max 825 €
    const parteiSonderausgabe = Math.min(Math.max(0, partei - 1650), 1650) // Darüber hinaus als Sonderausgabe

    // Stiftungsspenden: zusätzlich 1 Mio. € Sonderpauschale (alle 10 Jahre)
    const stiftung = spenden.filter(s => s.zweck === 'stiftung').reduce((s, x) => s + x.betrag, 0)
    const stiftungAbsetzbar = Math.min(stiftung, 1000000)

    const gesamtSpenden = spenden.reduce((s, x) => s + x.betrag, 0)
    const gesamtAbzug = absetzbarGemeinnuetzig + stiftungAbsetzbar
    const steuerersparnis = Math.round((gesamtAbzug + parteiSonderausgabe) * 0.42 + parteiErmaessigung)

    return {
      gemeinnuetzig, maxGemeinnuetzig, absetzbarGemeinnuetzig,
      partei, parteiErmaessigung, parteiSonderausgabe,
      stiftung, stiftungAbsetzbar,
      gesamtSpenden, gesamtAbzug, steuerersparnis,
    }
  }, [spenden, gesamteinkommen])

  const handleAdd = () => {
    if (!neuEmpf || neuBetrag <= 0) return
    setSpenden(prev => [...prev, { id: nextId++, empfaenger: neuEmpf, betrag: neuBetrag, typ: 'geld', zweck: neuZweck, datum: '2025-01-01' }])
    setNeuEmpf('')
    setNeuBetrag(0)
    setShowAdd(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <HeartPulse className="h-6 w-6 text-pink-500" />
            Spenden-Rechner
          </h1>
          <p className="text-muted-foreground mt-1">
            Steuerliche Absetzbarkeit von Spenden und Parteibeiträgen berechnen
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Spende
        </button>
      </div>

      {/* KPIs */}
      <div className="grid sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Gespendet</p>
            <p className="text-2xl font-bold">{ergebnis.gesamtSpenden.toLocaleString('de-DE')} €</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Absetzbar (Sonderausgabe)</p>
            <p className="text-2xl font-bold text-teal-600">{ergebnis.gesamtAbzug.toLocaleString('de-DE')} €</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Partei-Ermäßigung (§ 34g)</p>
            <p className="text-2xl font-bold text-blue-600">{ergebnis.parteiErmaessigung.toLocaleString('de-DE')} €</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <p className="text-sm text-muted-foreground">Steuerersparnis (ca.)</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{ergebnis.steuerersparnis.toLocaleString('de-DE')} €</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Spendenliste */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Ihr Gesamtbetrag der Einkünfte</CardTitle>
            </CardHeader>
            <CardContent>
              <input
                type="number"
                value={gesamteinkommen}
                onChange={e => setGesamteinkommen(Number(e.target.value))}
                min={0}
                step={5000}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Gemeinnützige Spenden sind bis 20% absetzbar = max. {(gesamteinkommen * 0.2).toLocaleString('de-DE')} €
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Erfasste Spenden ({spenden.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {spenden.map(s => (
                  <div key={s.id} className="flex items-center gap-2 rounded-lg border border-border p-2.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{s.empfaenger}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${ZWECK_CONFIG[s.zweck].color}`}>
                          {ZWECK_CONFIG[s.zweck].label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{new Date(s.datum).toLocaleDateString('de-DE')} · {s.typ === 'sach' ? 'Sachspende' : 'Geldspende'}</p>
                    </div>
                    <span className="font-medium text-sm">{s.betrag.toLocaleString('de-DE')} €</span>
                    <button onClick={() => setSpenden(prev => prev.filter(x => x.id !== s.id))} className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30">
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Berechnung */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Steuerliche Berechnung</CardTitle>
              <CardDescription>Aufschlüsselung nach Spendenart</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Gemeinnützige & Kirchliche Spenden</h3>
                <div className="flex justify-between text-sm">
                  <span>Spendensumme</span>
                  <span className="font-medium">{ergebnis.gemeinnuetzig.toLocaleString('de-DE')} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Max. absetzbar (20% von {gesamteinkommen.toLocaleString('de-DE')} €)</span>
                  <span className="font-medium">{Math.round(ergebnis.maxGemeinnuetzig).toLocaleString('de-DE')} €</span>
                </div>
                <div className="flex justify-between text-sm font-medium border-t pt-1">
                  <span>Sonderausgabenabzug</span>
                  <span className="text-teal-600">{ergebnis.absetzbarGemeinnuetzig.toLocaleString('de-DE')} €</span>
                </div>
              </div>

              {ergebnis.partei > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Parteispenden</h3>
                  <div className="flex justify-between text-sm">
                    <span>Spendensumme</span>
                    <span className="font-medium">{ergebnis.partei.toLocaleString('de-DE')} €</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Ermäßigung § 34g (50% bis 1.650 €)</span>
                    <span className="font-medium text-blue-600">{ergebnis.parteiErmaessigung.toLocaleString('de-DE')} €</span>
                  </div>
                  {ergebnis.parteiSonderausgabe > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Zusätzlich als Sonderausgabe</span>
                      <span className="font-medium">{ergebnis.parteiSonderausgabe.toLocaleString('de-DE')} €</span>
                    </div>
                  )}
                </div>
              )}

              {ergebnis.stiftung > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Stiftungsspenden</h3>
                  <div className="flex justify-between text-sm">
                    <span>Spendensumme</span>
                    <span className="font-medium">{ergebnis.stiftung.toLocaleString('de-DE')} €</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Absetzbar (Sonderpauschale 1 Mio. €)</span>
                    <span className="font-medium text-purple-600">{ergebnis.stiftungAbsetzbar.toLocaleString('de-DE')} €</span>
                  </div>
                </div>
              )}

              <div className="rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 p-4 mt-2">
                <p className="text-sm text-green-600 dark:text-green-400">Geschätzte Gesamtersparnis (42% Grenzsteuersatz)</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">{ergebnis.steuerersparnis.toLocaleString('de-DE')} €</p>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-3">
            <div className="flex gap-2">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <div className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                <p><strong>Nachweis:</strong> Bis 300 € genügt ein Kontoauszug. Darüber ist eine Zuwendungsbestätigung erforderlich.</p>
                <p>Nicht ausgeschöpfte Spenden können unbegrenzt in Folgejahre vorgetragen werden (Spendenvortrag).</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAdd && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Neue Spende</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium">Empfänger</label>
                <input value={neuEmpf} onChange={e => setNeuEmpf(e.target.value)} placeholder="z.B. DRK" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium">Zweck</label>
                <select value={neuZweck} onChange={e => setNeuZweck(e.target.value as Spende['zweck'])} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  {Object.entries(ZWECK_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium">Betrag (€)</label>
                <input type="number" value={neuBetrag || ''} onChange={e => setNeuBetrag(Number(e.target.value))} min={0} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              </div>
            </div>
            <button onClick={handleAdd} disabled={!neuEmpf || neuBetrag <= 0} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
              Hinzufügen
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
