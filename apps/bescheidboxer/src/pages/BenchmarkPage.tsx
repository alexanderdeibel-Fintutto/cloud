import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { BarChart3, TrendingUp, TrendingDown, Minus, Info, ArrowRight } from 'lucide-react'

interface RegionBenchmark {
  bundesland: string
  kuerzel: string
  grundsteuerSchnitt: number
  einkommensteuerSchnitt: number
  gewerbesteuerSchnitt: number
  hebesatzSchnitt: number
  belastungIndex: number
}

const BENCHMARKS: RegionBenchmark[] = [
  { bundesland: 'Baden-Württemberg', kuerzel: 'BW', grundsteuerSchnitt: 420, einkommensteuerSchnitt: 8200, gewerbesteuerSchnitt: 3100, hebesatzSchnitt: 398, belastungIndex: 92 },
  { bundesland: 'Bayern', kuerzel: 'BY', grundsteuerSchnitt: 380, einkommensteuerSchnitt: 8900, gewerbesteuerSchnitt: 3400, hebesatzSchnitt: 394, belastungIndex: 88 },
  { bundesland: 'Berlin', kuerzel: 'BE', grundsteuerSchnitt: 520, einkommensteuerSchnitt: 6800, gewerbesteuerSchnitt: 2900, hebesatzSchnitt: 810, belastungIndex: 115 },
  { bundesland: 'Brandenburg', kuerzel: 'BB', grundsteuerSchnitt: 310, einkommensteuerSchnitt: 5200, gewerbesteuerSchnitt: 1800, hebesatzSchnitt: 410, belastungIndex: 78 },
  { bundesland: 'Bremen', kuerzel: 'HB', grundsteuerSchnitt: 480, einkommensteuerSchnitt: 6100, gewerbesteuerSchnitt: 2500, hebesatzSchnitt: 695, belastungIndex: 108 },
  { bundesland: 'Hamburg', kuerzel: 'HH', grundsteuerSchnitt: 550, einkommensteuerSchnitt: 9500, gewerbesteuerSchnitt: 4200, hebesatzSchnitt: 540, belastungIndex: 105 },
  { bundesland: 'Hessen', kuerzel: 'HE', grundsteuerSchnitt: 450, einkommensteuerSchnitt: 7800, gewerbesteuerSchnitt: 3200, hebesatzSchnitt: 481, belastungIndex: 98 },
  { bundesland: 'Mecklenburg-Vorpommern', kuerzel: 'MV', grundsteuerSchnitt: 280, einkommensteuerSchnitt: 4500, gewerbesteuerSchnitt: 1400, hebesatzSchnitt: 416, belastungIndex: 72 },
  { bundesland: 'Niedersachsen', kuerzel: 'NI', grundsteuerSchnitt: 370, einkommensteuerSchnitt: 6400, gewerbesteuerSchnitt: 2400, hebesatzSchnitt: 430, belastungIndex: 85 },
  { bundesland: 'Nordrhein-Westfalen', kuerzel: 'NW', grundsteuerSchnitt: 460, einkommensteuerSchnitt: 7200, gewerbesteuerSchnitt: 3000, hebesatzSchnitt: 569, belastungIndex: 100 },
  { bundesland: 'Rheinland-Pfalz', kuerzel: 'RP', grundsteuerSchnitt: 350, einkommensteuerSchnitt: 6000, gewerbesteuerSchnitt: 2200, hebesatzSchnitt: 433, belastungIndex: 82 },
  { bundesland: 'Saarland', kuerzel: 'SL', grundsteuerSchnitt: 340, einkommensteuerSchnitt: 5600, gewerbesteuerSchnitt: 2000, hebesatzSchnitt: 440, belastungIndex: 80 },
  { bundesland: 'Sachsen', kuerzel: 'SN', grundsteuerSchnitt: 320, einkommensteuerSchnitt: 5000, gewerbesteuerSchnitt: 1700, hebesatzSchnitt: 530, belastungIndex: 76 },
  { bundesland: 'Sachsen-Anhalt', kuerzel: 'ST', grundsteuerSchnitt: 290, einkommensteuerSchnitt: 4700, gewerbesteuerSchnitt: 1500, hebesatzSchnitt: 410, belastungIndex: 73 },
  { bundesland: 'Schleswig-Holstein', kuerzel: 'SH', grundsteuerSchnitt: 360, einkommensteuerSchnitt: 6200, gewerbesteuerSchnitt: 2300, hebesatzSchnitt: 350, belastungIndex: 83 },
  { bundesland: 'Thüringen', kuerzel: 'TH', grundsteuerSchnitt: 300, einkommensteuerSchnitt: 4800, gewerbesteuerSchnitt: 1600, hebesatzSchnitt: 415, belastungIndex: 75 },
]

type Steuerart = 'grundsteuer' | 'einkommensteuer' | 'gewerbesteuer'

const STEUERART_CONFIG: Record<Steuerart, { label: string; key: keyof RegionBenchmark }> = {
  grundsteuer: { label: 'Grundsteuer', key: 'grundsteuerSchnitt' },
  einkommensteuer: { label: 'Einkommensteuer', key: 'einkommensteuerSchnitt' },
  gewerbesteuer: { label: 'Gewerbesteuer', key: 'gewerbesteuerSchnitt' },
}

export default function BenchmarkPage() {
  const [meinBundesland, setMeinBundesland] = useState('NW')
  const [steuerart, setSteuerart] = useState<Steuerart>('grundsteuer')
  const [meineGrundsteuer, setMeineGrundsteuer] = useState(490)
  const [meineESt, setMeineESt] = useState(7500)
  const [meineGewSt, setMeineGewSt] = useState(3100)
  const [sortBy, setSortBy] = useState<'name' | 'betrag' | 'index'>('betrag')

  const meinWert = steuerart === 'grundsteuer' ? meineGrundsteuer
    : steuerart === 'einkommensteuer' ? meineESt : meineGewSt

  const meinLand = BENCHMARKS.find(b => b.kuerzel === meinBundesland)

  const sorted = useMemo(() => {
    const key = STEUERART_CONFIG[steuerart].key
    return [...BENCHMARKS].sort((a, b) => {
      if (sortBy === 'name') return a.bundesland.localeCompare(b.bundesland)
      if (sortBy === 'index') return b.belastungIndex - a.belastungIndex
      return (b[key] as number) - (a[key] as number)
    })
  }, [steuerart, sortBy])

  const bundesschnitt = useMemo(() => {
    const key = STEUERART_CONFIG[steuerart].key
    return Math.round(BENCHMARKS.reduce((s, b) => s + (b[key] as number), 0) / BENCHMARKS.length)
  }, [steuerart])

  const maxWert = useMemo(() => {
    const key = STEUERART_CONFIG[steuerart].key
    return Math.max(...BENCHMARKS.map(b => b[key] as number), meinWert)
  }, [steuerart, meinWert])

  const abweichung = meinLand
    ? meinWert - (meinLand[STEUERART_CONFIG[steuerart].key] as number)
    : 0
  const abweichungProzent = meinLand
    ? (abweichung / (meinLand[STEUERART_CONFIG[steuerart].key] as number)) * 100
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Steuer-Benchmark</h1>
        <p className="text-muted-foreground mt-1">
          Vergleichen Sie Ihre Steuerbelastung mit regionalen Durchschnittswerten
        </p>
      </div>

      {/* Eingaben */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ihre Daten</CardTitle>
          <CardDescription>Geben Sie Ihre jährlichen Steuerbeträge ein</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Bundesland</label>
              <select
                value={meinBundesland}
                onChange={e => setMeinBundesland(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {BENCHMARKS.sort((a, b) => a.bundesland.localeCompare(b.bundesland)).map(b => (
                  <option key={b.kuerzel} value={b.kuerzel}>{b.bundesland}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Grundsteuer/Jahr (€)</label>
              <input
                type="number"
                value={meineGrundsteuer}
                onChange={e => setMeineGrundsteuer(Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Einkommensteuer/Jahr (€)</label>
              <input
                type="number"
                value={meineESt}
                onChange={e => setMeineESt(Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Gewerbesteuer/Jahr (€)</label>
              <input
                type="number"
                value={meineGewSt}
                onChange={e => setMeineGewSt(Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vergleichskarten */}
      {meinLand && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['grundsteuer', 'einkommensteuer', 'gewerbesteuer'] as Steuerart[]).map(art => {
            const conf = STEUERART_CONFIG[art]
            const mein = art === 'grundsteuer' ? meineGrundsteuer : art === 'einkommensteuer' ? meineESt : meineGewSt
            const schnitt = meinLand[conf.key] as number
            const diff = mein - schnitt
            const diffP = (diff / schnitt) * 100

            return (
              <Card
                key={art}
                className={`cursor-pointer transition-colors ${steuerart === art ? 'border-primary border-2' : 'hover:border-primary/50'}`}
                onClick={() => setSteuerart(art)}
              >
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">{conf.label}</p>
                  <div className="flex items-end gap-3 mt-2">
                    <p className="text-2xl font-bold">{mein.toLocaleString('de-DE')} €</p>
                    <div className={`flex items-center gap-1 text-sm ${diff > 0 ? 'text-red-600' : diff < 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {diff > 0 ? <TrendingUp className="h-4 w-4" /> : diff < 0 ? <TrendingDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                      {diff > 0 ? '+' : ''}{diffP.toFixed(1)}%
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ø {meinLand.bundesland}: {schnitt.toLocaleString('de-DE')} €
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Ranking */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Bundesländer-Ranking: {STEUERART_CONFIG[steuerart].label}
            </CardTitle>
            <div className="flex gap-2">
              {([
                { key: 'betrag', label: 'Nach Betrag' },
                { key: 'index', label: 'Nach Index' },
                { key: 'name', label: 'A-Z' },
              ] as const).map(s => (
                <button
                  key={s.key}
                  onClick={() => setSortBy(s.key)}
                  className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                    sortBy === s.key ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary/50'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sorted.map((b, idx) => {
              const wert = b[STEUERART_CONFIG[steuerart].key] as number
              const barWidth = (wert / maxWert) * 100
              const isMein = b.kuerzel === meinBundesland

              return (
                <div key={b.kuerzel} className={`flex items-center gap-3 ${isMein ? 'bg-primary/5 -mx-2 px-2 py-1 rounded-lg' : ''}`}>
                  <span className="text-xs text-muted-foreground w-6 text-right shrink-0">
                    {idx + 1}.
                  </span>
                  <span className={`text-sm w-12 shrink-0 font-mono ${isMein ? 'font-bold text-primary' : ''}`}>
                    {b.kuerzel}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-6 bg-muted/50 rounded-md overflow-hidden">
                        <div
                          className={`h-full rounded-md transition-all ${isMein ? 'bg-primary' : 'bg-primary/30'}`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <span className={`text-sm w-20 text-right shrink-0 ${isMein ? 'font-bold' : ''}`}>
                    {wert.toLocaleString('de-DE')} €
                  </span>
                  <span className="text-xs text-muted-foreground w-12 text-right shrink-0">
                    {b.belastungIndex}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Legende */}
          <div className="mt-4 pt-4 border-t flex items-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary" />
              <span>Ihr Bundesland</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary/30" />
              <span>Andere Bundesländer</span>
            </div>
            <div className="flex items-center gap-1 ml-auto">
              <span>Bundesschnitt:</span>
              <span className="font-medium text-foreground">{bundesschnitt.toLocaleString('de-DE')} €</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info/Vergleich eigener Wert */}
      {meinLand && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium">
                  Ihre {STEUERART_CONFIG[steuerart].label}: {meinWert.toLocaleString('de-DE')} €
                  <ArrowRight className="inline h-4 w-4 mx-2" />
                  Ø {meinLand.bundesland}: {(meinLand[STEUERART_CONFIG[steuerart].key] as number).toLocaleString('de-DE')} €
                </p>
                <p className="text-muted-foreground mt-1">
                  {abweichung > 0
                    ? `Sie zahlen ${abweichung.toLocaleString('de-DE')} € (${abweichungProzent.toFixed(1)}%) mehr als der Durchschnitt in ${meinLand.bundesland}.`
                    : abweichung < 0
                    ? `Sie zahlen ${Math.abs(abweichung).toLocaleString('de-DE')} € (${Math.abs(abweichungProzent).toFixed(1)}%) weniger als der Durchschnitt in ${meinLand.bundesland}.`
                    : `Ihr Betrag entspricht exakt dem Durchschnitt in ${meinLand.bundesland}.`
                  }
                  {' '}Der Belastungsindex für {meinLand.bundesland} beträgt {meinLand.belastungIndex} (Bundesschnitt: 100).
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Die Daten basieren auf Durchschnittswerten und dienen nur der Orientierung.
                  Individuelle Abweichungen sind je nach Kommune und persönlicher Situation möglich.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
