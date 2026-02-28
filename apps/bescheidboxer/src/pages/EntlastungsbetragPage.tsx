import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { UserCheck, Info } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

function calcESt(zvE: number): number {
  if (zvE <= 12084) return 0
  if (zvE <= 17005) { const y = (zvE - 12084) / 10000; return Math.round((922.98 * y + 1400) * y) }
  if (zvE <= 66760) { const z = (zvE - 17005) / 10000; return Math.round((181.19 * z + 2397) * z + 1025.38) }
  if (zvE <= 277825) return Math.round(0.42 * zvE - 10394.14)
  return Math.round(0.45 * zvE - 18730.89)
}

export default function EntlastungsbetragPage() {
  const [einkuenfte, setEinkuenfte] = useState(40000)
  const [kinderAnzahl, setKinderAnzahl] = useState(1)
  const [kirchensteuer, setKirchensteuer] = useState(false)

  const ergebnis = useMemo(() => {
    // Entlastungsbetrag für Alleinerziehende § 24b EStG
    // 2025: 4.260 EUR + 240 EUR je weiteres Kind
    const grundbetrag = 4260
    const zuschlagProKind = 240
    const entlastungsbetrag = grundbetrag + Math.max(kinderAnzahl - 1, 0) * zuschlagProKind

    // Ohne Entlastungsbetrag (Steuerklasse I)
    const zvEOhne = Math.max(einkuenfte, 0)
    const estOhne = calcESt(zvEOhne)
    const soliOhne = estOhne > 18130 ? Math.round(estOhne * 0.055) : 0
    const kistOhne = kirchensteuer ? Math.round(estOhne * 0.09) : 0
    const gesamtOhne = estOhne + soliOhne + kistOhne

    // Mit Entlastungsbetrag (Steuerklasse II)
    const zvEMit = Math.max(einkuenfte - entlastungsbetrag, 0)
    const estMit = calcESt(zvEMit)
    const soliMit = estMit > 18130 ? Math.round(estMit * 0.055) : 0
    const kistMit = kirchensteuer ? Math.round(estMit * 0.09) : 0
    const gesamtMit = estMit + soliMit + kistMit

    const ersparnis = gesamtOhne - gesamtMit
    const ersparnisMonatlich = Math.round(ersparnis / 12)

    // Chart: Vergleich nach Kinderzahl
    const chartData = Array.from({ length: 4 }, (_, i) => {
      const kinder = i + 1
      const eb = grundbetrag + Math.max(kinder - 1, 0) * zuschlagProKind
      const zvE2 = Math.max(einkuenfte - eb, 0)
      const est2 = calcESt(zvE2)
      const soli2 = est2 > 18130 ? Math.round(est2 * 0.055) : 0
      const kist2 = kirchensteuer ? Math.round(est2 * 0.09) : 0
      return {
        name: `${kinder} Kind${kinder > 1 ? 'er' : ''}`,
        ohneEB: gesamtOhne,
        mitEB: est2 + soli2 + kist2,
        ersparnis: gesamtOhne - (est2 + soli2 + kist2),
      }
    })

    return {
      entlastungsbetrag,
      zvEOhne, zvEMit,
      estOhne, estMit,
      gesamtOhne, gesamtMit,
      ersparnis, ersparnisMonatlich,
      chartData,
    }
  }, [einkuenfte, kinderAnzahl, kirchensteuer])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-primary" />
          Entlastungsbetrag Alleinerziehende
        </h1>
        <p className="text-muted-foreground mt-1">
          Steuerklasse II – § 24b EStG
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Grundbetrag 2025:</strong> <strong>4.260 EUR</strong> für das erste Kind, <strong>+240 EUR</strong> je weiteres Kind.</p>
              <p><strong>Voraussetzungen:</strong> Alleinstehend, mindestens ein Kind im Haushalt mit Kindergeldanspruch.</p>
              <p><strong>Steuerklasse II:</strong> Automatische Berücksichtigung bei der Lohnsteuer. Sonst über die Steuererklärung.</p>
              <p><strong>Keine Haushaltsgemeinschaft:</strong> Keine andere volljährige Person im Haushalt (Ausnahme: volljährige Kinder mit Kindergeldanspruch).</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Eingaben</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Bruttoeinkünfte: {einkuenfte.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={12000} max={100000} step={1000} value={einkuenfte} onChange={e => setEinkuenfte(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Anzahl Kinder: {kinderAnzahl}</label>
              <input type="range" min={1} max={6} value={kinderAnzahl} onChange={e => setKinderAnzahl(+e.target.value)} className="w-full accent-primary" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={kirchensteuer} onChange={e => setKirchensteuer(e.target.checked)} className="accent-primary" />
              Kirchensteuer (9%)
            </label>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader><CardTitle className="text-lg">Ergebnis</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 mb-6">
              <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-4 text-center">
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{ergebnis.ersparnis.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Steuerersparnis/Jahr</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-4 text-center">
                <p className="text-2xl font-bold text-primary">{ergebnis.ersparnisMonatlich.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Mehr Netto/Monat</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Entlastungsbetrag</span>
                <span className="font-medium text-green-600">{ergebnis.entlastungsbetrag.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">zvE ohne Entlastungsbetrag</span>
                <span className="font-medium">{ergebnis.zvEOhne.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">zvE mit Entlastungsbetrag</span>
                <span className="font-medium">{ergebnis.zvEMit.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">ESt (Steuerklasse I)</span>
                <span className="font-medium">{ergebnis.gesamtOhne.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">ESt (Steuerklasse II)</span>
                <span className="font-medium">{ergebnis.gesamtMit.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Ersparnis</span>
                <span className="font-medium text-green-600">{ergebnis.ersparnis.toLocaleString('de-DE')} EUR</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Ersparnis nach Kinderzahl</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ergebnis.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR`} />
                <Legend />
                <Bar dataKey="ohneEB" name="Ohne Entlastung" fill="#ef4444" />
                <Bar dataKey="mitEB" name="Mit Entlastung" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Voraussetzungen & Praxis</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 text-sm">
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium">Anspruchsvoraussetzungen</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>- Alleinstehend (nicht verheiratet)</li>
                <li>- Kind im Haushalt gemeldet</li>
                <li>- Kindergeldanspruch für das Kind</li>
                <li>- Keine Haushaltsgemeinschaft mit Dritten</li>
                <li>- Nicht: WG mit Partner/in</li>
              </ul>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium">Praktische Tipps</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>- Steuerklasse II beim Finanzamt beantragen</li>
                <li>- Wirkt sich sofort auf Lohnsteuer aus</li>
                <li>- Bei Änderung (Heirat/Zusammenzug) melden</li>
                <li>- Rückwirkend über Steuererklärung möglich</li>
                <li>- Anlage Kind + Anlage Sonderausgaben</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
