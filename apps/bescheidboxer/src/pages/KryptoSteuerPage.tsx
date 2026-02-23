import { useState, useMemo } from 'react'
import { Card, CardContent } from '../components/ui/card'
import { Bitcoin, AlertTriangle, CheckCircle2, Info, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'

interface KryptoPosition {
  id: number
  coin: string
  kaufdatum: string
  verkaufdatum: string
  kaufpreis: number
  verkaufspreis: number
  menge: number
  haltefrist: boolean
  gewinnVerlust: number
}

const DEMO_POSITIONEN: KryptoPosition[] = [
  { id: 1, coin: 'Bitcoin (BTC)', kaufdatum: '2024-01-15', verkaufdatum: '2025-06-20', kaufpreis: 38500, verkaufspreis: 72000, menge: 0.5, haltefrist: true, gewinnVerlust: 16750 },
  { id: 2, coin: 'Ethereum (ETH)', kaufdatum: '2025-03-01', verkaufdatum: '2025-09-15', kaufpreis: 3200, verkaufspreis: 4100, menge: 5, haltefrist: false, gewinnVerlust: 4500 },
  { id: 3, coin: 'Solana (SOL)', kaufdatum: '2025-01-10', verkaufdatum: '2025-04-20', kaufpreis: 95, verkaufspreis: 68, menge: 50, haltefrist: false, gewinnVerlust: -1350 },
  { id: 4, coin: 'Cardano (ADA)', kaufdatum: '2024-06-01', verkaufdatum: '2025-08-10', kaufpreis: 0.45, verkaufspreis: 0.82, menge: 10000, haltefrist: true, gewinnVerlust: 3700 },
  { id: 5, coin: 'Polkadot (DOT)', kaufdatum: '2025-05-15', verkaufdatum: '2025-11-01', kaufpreis: 7.50, verkaufspreis: 12.30, menge: 200, haltefrist: false, gewinnVerlust: 960 },
  { id: 6, coin: 'Bitcoin (BTC)', kaufdatum: '2025-07-01', verkaufdatum: '2025-10-15', kaufpreis: 62000, verkaufspreis: 58000, menge: 0.2, haltefrist: false, gewinnVerlust: -800 },
]

export default function KryptoSteuerPage() {
  const [positionen, setPositionen] = useState<KryptoPosition[]>(DEMO_POSITIONEN)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [filterTyp, setFilterTyp] = useState<string>('alle')
  const [freigrenze] = useState(1000)

  const stats = useMemo(() => {
    const steuerpflichtig = positionen.filter(p => !p.haltefrist)
    const steuerfrei = positionen.filter(p => p.haltefrist)

    const gewinneSteuerpflichtig = steuerpflichtig.filter(p => p.gewinnVerlust > 0).reduce((s, p) => s + p.gewinnVerlust, 0)
    const verlusteSteuerpflichtig = steuerpflichtig.filter(p => p.gewinnVerlust < 0).reduce((s, p) => s + Math.abs(p.gewinnVerlust), 0)
    const saldoSteuerpflichtig = gewinneSteuerpflichtig - verlusteSteuerpflichtig
    const steuerfreieGewinne = steuerfrei.filter(p => p.gewinnVerlust > 0).reduce((s, p) => s + p.gewinnVerlust, 0)

    // Freigrenze: wenn Saldo > 1.000 € → komplett steuerpflichtig, sonst steuerfrei
    const ueberFreigrenze = saldoSteuerpflichtig > freigrenze
    const zuVersteuern = ueberFreigrenze ? saldoSteuerpflichtig : 0
    const geschaetzteSteuern = Math.round(zuVersteuern * 0.42)

    return {
      gewinneSteuerpflichtig, verlusteSteuerpflichtig, saldoSteuerpflichtig,
      steuerfreieGewinne, ueberFreigrenze, zuVersteuern, geschaetzteSteuern,
      anzahlSteuerpflichtig: steuerpflichtig.length, anzahlSteuerfrei: steuerfrei.length,
    }
  }, [positionen, freigrenze])

  const filtered = positionen.filter(p => {
    if (filterTyp === 'steuerpflichtig') return !p.haltefrist
    if (filterTyp === 'steuerfrei') return p.haltefrist
    if (filterTyp === 'gewinn') return p.gewinnVerlust > 0
    if (filterTyp === 'verlust') return p.gewinnVerlust < 0
    return true
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Bitcoin className="h-6 w-6 text-orange-500" />
          Krypto-Steuer
        </h1>
        <p className="text-muted-foreground mt-1">
          Kryptowährungen: Haltefrist, Freigrenze und Gewinn-/Verlustverrechnung
        </p>
      </div>

      {/* KPIs */}
      <div className="grid sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Steuerpflichtige Gewinne</p>
            <p className="text-2xl font-bold text-amber-600">{stats.gewinneSteuerpflichtig.toLocaleString('de-DE')} €</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stats.anzahlSteuerpflichtig} Positionen (&lt;1 Jahr)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Verluste (verrechenbar)</p>
            <p className="text-2xl font-bold text-red-600">-{stats.verlusteSteuerpflichtig.toLocaleString('de-DE')} €</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Steuerfreie Gewinne</p>
            <p className="text-2xl font-bold text-green-600">{stats.steuerfreieGewinne.toLocaleString('de-DE')} €</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stats.anzahlSteuerfrei} Positionen (&gt;1 Jahr)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Geschätzte Steuern</p>
            <p className="text-2xl font-bold">{stats.geschaetzteSteuern.toLocaleString('de-DE')} €</p>
            <p className="text-xs text-muted-foreground mt-0.5">bei 42% Grenzsteuersatz</p>
          </CardContent>
        </Card>
      </div>

      {/* Freigrenze */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {stats.ueberFreigrenze
                ? <AlertTriangle className="h-6 w-6 text-amber-500" />
                : <CheckCircle2 className="h-6 w-6 text-green-500" />
              }
              <div>
                <p className="font-medium text-sm">
                  Freigrenze {freigrenze.toLocaleString('de-DE')} € (§ 23 Abs. 3 S. 5 EStG)
                </p>
                <p className="text-xs text-muted-foreground">
                  Saldo steuerpflichtiger Gewinne/Verluste: {stats.saldoSteuerpflichtig.toLocaleString('de-DE')} €
                </p>
              </div>
            </div>
            <div className="text-right">
              {stats.ueberFreigrenze ? (
                <span className="text-sm font-medium text-amber-600">Freigrenze überschritten – komplett steuerpflichtig</span>
              ) : (
                <span className="text-sm font-medium text-green-600">Unter Freigrenze – steuerfrei</span>
              )}
            </div>
          </div>
          <div className="h-2.5 rounded-full bg-muted mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${stats.ueberFreigrenze ? 'bg-amber-500' : 'bg-green-500'}`}
              style={{ width: `${Math.min(100, (stats.saldoSteuerpflichtig / freigrenze) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0 €</span>
            <span>{freigrenze.toLocaleString('de-DE')} € Freigrenze</span>
          </div>
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: 'alle', label: `Alle (${positionen.length})` },
          { value: 'steuerpflichtig', label: `Steuerpflichtig (${stats.anzahlSteuerpflichtig})` },
          { value: 'steuerfrei', label: `Steuerfrei (${stats.anzahlSteuerfrei})` },
          { value: 'gewinn', label: 'Gewinne' },
          { value: 'verlust', label: 'Verluste' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilterTyp(f.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
              filterTyp === f.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 border-border hover:bg-muted'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Positionen */}
      <div className="space-y-3">
        {filtered.map(p => {
          const isExpanded = expandedId === p.id
          return (
            <Card key={p.id}>
              <button onClick={() => setExpandedId(isExpanded ? null : p.id)} className="w-full text-left">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`rounded-lg p-2 ${p.haltefrist ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                        <Bitcoin className={`h-4 w-4 ${p.haltefrist ? 'text-green-600' : 'text-amber-600'}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{p.coin}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            p.haltefrist ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                          }`}>
                            {p.haltefrist ? 'Steuerfrei (>1J)' : 'Steuerpflichtig (<1J)'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{p.menge} Stück · {p.kaufdatum} → {p.verkaufdatum}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-medium ${p.gewinnVerlust >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {p.gewinnVerlust >= 0 ? '+' : ''}{p.gewinnVerlust.toLocaleString('de-DE')} €
                      </span>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1.5">
                          <div className="flex justify-between"><span className="text-muted-foreground">Kaufpreis/Stück</span><span className="font-medium">{p.kaufpreis.toLocaleString('de-DE')} €</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Verkaufspreis/Stück</span><span className="font-medium">{p.verkaufspreis.toLocaleString('de-DE')} €</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Menge</span><span className="font-medium">{p.menge}</span></div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between"><span className="text-muted-foreground">Investition</span><span className="font-medium">{(p.kaufpreis * p.menge).toLocaleString('de-DE')} €</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Erlös</span><span className="font-medium">{(p.verkaufspreis * p.menge).toLocaleString('de-DE')} €</span></div>
                          <div className="flex justify-between border-t pt-1"><span className="font-medium">Gewinn/Verlust</span><span className={`font-bold ${p.gewinnVerlust >= 0 ? 'text-green-600' : 'text-red-600'}`}>{p.gewinnVerlust >= 0 ? '+' : ''}{p.gewinnVerlust.toLocaleString('de-DE')} €</span></div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={e => { e.stopPropagation(); setPositionen(prev => prev.filter(x => x.id !== p.id)) }} className="flex items-center gap-1 rounded-lg bg-red-100 dark:bg-red-900/30 px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                          <Trash2 className="h-3 w-3" />Entfernen
                        </button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </button>
            </Card>
          )
        })}
      </div>

      {/* Hinweise */}
      <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-3">
        <div className="flex gap-2">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
            <p><strong>Haltefrist:</strong> Kryptowährungen sind nach 1 Jahr Haltedauer steuerfrei (§ 23 Abs. 1 S. 1 Nr. 2 EStG).</p>
            <p><strong>Freigrenze:</strong> Gewinne bis 1.000 €/Jahr sind steuerfrei. Bei Überschreitung ist der gesamte Betrag steuerpflichtig (keine Freibeträge!).</p>
            <p><strong>FiFo-Prinzip:</strong> Bei Teilverkäufen gilt „First in, first out" zur Bestimmung der Haltefrist.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
