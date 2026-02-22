import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Umbrella, Info, CheckCircle2 } from 'lucide-react'

export default function RiesterRechnerPage() {
  const [bruttoeinkommen, setBruttoeinkommen] = useState(55000)
  const [eigenbeitrag, setEigenbeitrag] = useState(1600)
  const [familienstand, setFamilienstand] = useState<'ledig' | 'verheiratet'>('ledig')
  const [kinder, setKinder] = useState(1)
  const [kindergeburtJahre, setKindergeburtJahre] = useState<number[]>([2020])
  const [grenzsteuersatz, setGrenzsteuersatz] = useState(35)

  const ergebnis = useMemo(() => {
    // Grundzulage: 175 €/Person
    const grundzulage = familienstand === 'verheiratet' ? 350 : 175

    // Kinderzulage: 300 € für ab 2008 geborene, 185 € für davor
    let kinderzulage = 0
    for (let i = 0; i < kinder; i++) {
      const jahr = kindergeburtJahre[i] || 2020
      kinderzulage += jahr >= 2008 ? 300 : 185
    }

    const gesamtZulage = grundzulage + kinderzulage

    // Mindesteigenbeitrag: 4% des Vorjahresbrutto - Zulagen, mind. 60 €
    const mindestbeitrag = Math.max(60, Math.round(bruttoeinkommen * 0.04 - gesamtZulage))

    // Sonderausgabenabzug: max 2.100 €
    const maxSonderausgaben = 2100
    const gesamtBeitrag = eigenbeitrag + gesamtZulage
    const sonderausgabenAbzug = Math.min(gesamtBeitrag, maxSonderausgaben)

    // Steuerersparnis
    const steuerersparnis = Math.round(sonderausgabenAbzug * (grenzsteuersatz / 100))

    // Günstigerprüfung: entweder Zulagen ODER Sonderausgabenabzug (Finanzamt wählt das Bessere)
    const nettoVorteilZulagen = gesamtZulage
    const nettoVorteilSonderausgaben = steuerersparnis - gesamtZulage // Abzug minus bereits erhaltene Zulagen
    const guenstigereVariante = nettoVorteilSonderausgaben > 0 ? 'sonderausgaben' : 'zulagen'
    const tatsaechlicherVorteil = guenstigereVariante === 'sonderausgaben' ? steuerersparnis : nettoVorteilZulagen

    // Zulagenquote
    const zulagenquote = eigenbeitrag > 0 ? ((gesamtZulage / eigenbeitrag) * 100).toFixed(1) : '0.0'

    return {
      grundzulage, kinderzulage, gesamtZulage, mindestbeitrag,
      sonderausgabenAbzug, steuerersparnis, gesamtBeitrag,
      guenstigereVariante, tatsaechlicherVorteil, zulagenquote,
    }
  }, [bruttoeinkommen, eigenbeitrag, familienstand, kinder, kindergeburtJahre, grenzsteuersatz])

  const chartData = useMemo(() => {
    const beitraege = [800, 1200, 1600, 2100]
    return beitraege.map(b => {
      const zulagen = ergebnis.gesamtZulage
      const gesamt = b + zulagen
      const abzug = Math.min(gesamt, 2100)
      const ersparnis = Math.round(abzug * (grenzsteuersatz / 100))
      return {
        name: `${b} €`,
        Eigenbeitrag: b,
        Zulagen: zulagen,
        Steuerersparnis: ersparnis,
      }
    })
  }, [ergebnis.gesamtZulage, grenzsteuersatz])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Umbrella className="h-6 w-6 text-amber-500" />
          Riester-Rechner
        </h1>
        <p className="text-muted-foreground mt-1">
          Zulagen, Sonderausgabenabzug und Günstigerprüfung berechnen
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Eingaben */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Persönliche Daten</CardTitle>
              <CardDescription>Basis für Zulagenberechnung und Mindesteigenbeitrag</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Bruttojahreseinkommen (Vorjahr) (€)</label>
                <input type="number" value={bruttoeinkommen} onChange={e => setBruttoeinkommen(Number(e.target.value))} min={0} step={5000} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
                <input type="range" min={0} max={200000} step={5000} value={bruttoeinkommen} onChange={e => setBruttoeinkommen(Number(e.target.value))} className="w-full mt-2 accent-primary" />
              </div>

              <div>
                <label className="text-sm font-medium">Familienstand</label>
                <div className="flex gap-2 mt-1.5">
                  {(['ledig', 'verheiratet'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setFamilienstand(s)}
                      className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium border transition-colors ${
                        familienstand === s ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 border-border'
                      }`}
                    >
                      {s === 'ledig' ? 'Ledig' : 'Verheiratet'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Anzahl kindergeldberechtigter Kinder</label>
                <input type="number" value={kinder} onChange={e => {
                  const n = Math.max(0, Math.min(6, Number(e.target.value)))
                  setKinder(n)
                  setKindergeburtJahre(prev => {
                    const arr = [...prev]
                    while (arr.length < n) arr.push(2020)
                    return arr.slice(0, n)
                  })
                }} min={0} max={6} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
              </div>

              {kinder > 0 && (
                <div className="space-y-2">
                  {Array.from({ length: kinder }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground w-20">Kind {i + 1}</span>
                      <input
                        type="number"
                        value={kindergeburtJahre[i] || 2020}
                        onChange={e => {
                          const arr = [...kindergeburtJahre]
                          arr[i] = Number(e.target.value)
                          setKindergeburtJahre(arr)
                        }}
                        min={1990}
                        max={2026}
                        className="w-24 rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
                      />
                      <span className="text-xs text-muted-foreground">
                        → {(kindergeburtJahre[i] || 2020) >= 2008 ? '300 €' : '185 €'} Zulage
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Geplanter Eigenbeitrag/Jahr (€)</label>
                <input type="number" value={eigenbeitrag} onChange={e => setEigenbeitrag(Number(e.target.value))} min={0} max={2100} step={100} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
                <input type="range" min={0} max={2100} step={50} value={eigenbeitrag} onChange={e => setEigenbeitrag(Number(e.target.value))} className="w-full mt-2 accent-primary" />
                <p className="text-xs text-muted-foreground mt-1">
                  Mindesteigenbeitrag für volle Zulage: <strong>{ergebnis.mindestbeitrag.toLocaleString('de-DE')} €</strong>
                  {eigenbeitrag < ergebnis.mindestbeitrag && <span className="text-amber-600"> (nicht erreicht!)</span>}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Persönlicher Grenzsteuersatz (%)</label>
                <input type="number" value={grenzsteuersatz} onChange={e => setGrenzsteuersatz(Number(e.target.value))} min={0} max={45} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ergebnis */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Zulagen & Steuerersparnis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Grundzulage</span>
                <span className="font-medium text-green-600">{ergebnis.grundzulage} €</span>
              </div>
              {ergebnis.kinderzulage > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Kinderzulage ({kinder}×)</span>
                  <span className="font-medium text-green-600">{ergebnis.kinderzulage} €</span>
                </div>
              )}
              <div className="flex justify-between text-sm border-t pt-2 font-medium">
                <span>Gesamtzulagen</span>
                <span className="text-green-600">{ergebnis.gesamtZulage} €</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Zulagenquote</span>
                <span className="font-medium">{ergebnis.zulagenquote}%</span>
              </div>

              <div className="border-t pt-3 mt-2 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Eigenbeitrag + Zulagen</span>
                  <span className="font-medium">{ergebnis.gesamtBeitrag.toLocaleString('de-DE')} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Sonderausgabenabzug (max. 2.100 €)</span>
                  <span className="font-medium">{ergebnis.sonderausgabenAbzug.toLocaleString('de-DE')} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Steuerersparnis ({grenzsteuersatz}%)</span>
                  <span className="font-medium text-blue-600">{ergebnis.steuerersparnis.toLocaleString('de-DE')} €</span>
                </div>
              </div>

              <div className={`rounded-xl p-4 mt-2 ${
                ergebnis.guenstigereVariante === 'sonderausgaben'
                  ? 'bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900'
                  : 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900'
              }`}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">
                      Günstigerprüfung: {ergebnis.guenstigereVariante === 'sonderausgaben' ? 'Sonderausgabenabzug' : 'Zulagenförderung'} vorteilhafter
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      {ergebnis.tatsaechlicherVorteil.toLocaleString('de-DE')} € Vorteil
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Beitragsvergleich</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}€`} />
                    <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} €`} />
                    <Legend />
                    <Bar dataKey="Eigenbeitrag" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="Zulagen" fill="#22c55e" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="Steuerersparnis" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-3">
            <div className="flex gap-2">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <div className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                <p><strong>Günstigerprüfung:</strong> Das Finanzamt prüft automatisch, ob Zulagen oder Sonderausgabenabzug günstiger ist.</p>
                <p>Zulagen werden auf den Sonderausgabenabzug angerechnet – doppelte Förderung ist nicht möglich.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
