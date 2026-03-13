import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Globe, Info, Search } from 'lucide-react'

interface DBA {
  land: string
  code: string
  methode: 'Freistellung' | 'Anrechnung' | 'Freistellung/Anrechnung'
  dividenden: number // Quellensteuer-Höchstsatz %
  zinsen: number
  lizenzen: number
  hinweis: string
}

const DBA_DATEN: DBA[] = [
  { land: 'USA', code: 'US', methode: 'Freistellung/Anrechnung', dividenden: 15, zinsen: 0, lizenzen: 0, hinweis: 'Dividenden: 5% bei >10% Beteiligung. Progressionsvorbehalt beachten.' },
  { land: 'Vereinigtes Königreich', code: 'GB', methode: 'Freistellung', dividenden: 15, zinsen: 0, lizenzen: 0, hinweis: 'Post-Brexit: DBA bleibt in Kraft. Dividenden: 5% bei >10% Beteiligung.' },
  { land: 'Frankreich', code: 'FR', methode: 'Freistellung/Anrechnung', dividenden: 15, zinsen: 0, lizenzen: 0, hinweis: 'Grenzgängerregelung für Elsass, Lothringen, Baden-Württemberg, Rheinland-Pfalz, Saarland.' },
  { land: 'Schweiz', code: 'CH', methode: 'Freistellung/Anrechnung', dividenden: 15, zinsen: 0, lizenzen: 0, hinweis: 'Grenzgängerregelung (60-Tage-Regel). Quellensteuer auf Dividenden max. 15%.' },
  { land: 'Österreich', code: 'AT', methode: 'Freistellung', dividenden: 15, zinsen: 0, lizenzen: 0, hinweis: 'Standard-DBA. Grenzgänger: Besteuerung im Ansässigkeitsstaat.' },
  { land: 'Niederlande', code: 'NL', methode: 'Freistellung', dividenden: 15, zinsen: 0, lizenzen: 0, hinweis: 'Dividenden: 5% bei >25% Beteiligung.' },
  { land: 'Italien', code: 'IT', methode: 'Freistellung/Anrechnung', dividenden: 15, zinsen: 10, lizenzen: 0, hinweis: 'Zinsen: 10% Quellensteuer. Besondere Regelung für Grenzgänger.' },
  { land: 'Spanien', code: 'ES', methode: 'Freistellung/Anrechnung', dividenden: 15, zinsen: 10, lizenzen: 5, hinweis: 'Dividenden: 5% bei >25% Beteiligung. Zinsen & Lizenzen: reduzierte Sätze.' },
  { land: 'Luxemburg', code: 'LU', methode: 'Freistellung', dividenden: 15, zinsen: 0, lizenzen: 0, hinweis: 'Grenzgängerregelung (19-Tage-Regel). Wichtig für Arbeitnehmer im Grenzgebiet.' },
  { land: 'Belgien', code: 'BE', methode: 'Freistellung', dividenden: 15, zinsen: 15, lizenzen: 0, hinweis: 'Neues DBA seit 2004. Zinsen: 15% Quellensteuer.' },
  { land: 'Polen', code: 'PL', methode: 'Freistellung/Anrechnung', dividenden: 15, zinsen: 5, lizenzen: 5, hinweis: 'Dividenden: 5% bei >10% Beteiligung.' },
  { land: 'Tschechien', code: 'CZ', methode: 'Freistellung', dividenden: 15, zinsen: 0, lizenzen: 5, hinweis: 'Dividenden: 5% bei >25% Beteiligung.' },
  { land: 'China', code: 'CN', methode: 'Anrechnung', dividenden: 10, zinsen: 10, lizenzen: 10, hinweis: 'Anrechnungsmethode. Alle Kapitalerträge: 10% Quellensteuer.' },
  { land: 'Japan', code: 'JP', methode: 'Freistellung/Anrechnung', dividenden: 15, zinsen: 10, lizenzen: 0, hinweis: 'Dividenden: 5% bei >25% Beteiligung.' },
  { land: 'Kanada', code: 'CA', methode: 'Freistellung/Anrechnung', dividenden: 15, zinsen: 10, lizenzen: 10, hinweis: 'Dividenden: 5% bei >10% Beteiligung.' },
  { land: 'Australien', code: 'AU', methode: 'Freistellung/Anrechnung', dividenden: 15, zinsen: 10, lizenzen: 10, hinweis: 'Dividenden: 5% bei >10% Beteiligung.' },
  { land: 'Türkei', code: 'TR', methode: 'Freistellung/Anrechnung', dividenden: 15, zinsen: 15, lizenzen: 10, hinweis: 'Höhere Quellensteuersätze als bei vielen anderen DBA.' },
  { land: 'Indien', code: 'IN', methode: 'Anrechnung', dividenden: 10, zinsen: 10, lizenzen: 10, hinweis: 'Anrechnungsmethode. Alle Kapitalerträge: 10% Quellensteuer.' },
]

export default function DoppelbesteuerungsabkommenPage() {
  const [suchbegriff, setSuchbegriff] = useState('')
  const [ausgewaehltesLand, setAusgewaehltesLand] = useState<DBA | null>(null)
  const [auslandsEinkuenfte, setAuslandsEinkuenfte] = useState(50000)
  const [quellensteuerGezahlt, setQuellensteuerGezahlt] = useState(7500)

  const gefilterteLaender = useMemo(() => {
    if (!suchbegriff) return DBA_DATEN
    const s = suchbegriff.toLowerCase()
    return DBA_DATEN.filter(d => d.land.toLowerCase().includes(s) || d.code.toLowerCase().includes(s))
  }, [suchbegriff])

  const anrechnung = useMemo(() => {
    if (!ausgewaehltesLand) return null

    // Vereinfachte Anrechnungsberechnung
    const maxAnrechnung = Math.round(auslandsEinkuenfte * 0.42) // Annahme Spitzensteuersatz
    const tatsAnrechnung = Math.min(quellensteuerGezahlt, maxAnrechnung)
    const erstattungMoeglich = quellensteuerGezahlt > maxAnrechnung ? quellensteuerGezahlt - maxAnrechnung : 0

    return {
      maxAnrechnung,
      tatsAnrechnung,
      erstattungMoeglich,
      methode: ausgewaehltesLand.methode,
    }
  }, [ausgewaehltesLand, auslandsEinkuenfte, quellensteuerGezahlt])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Globe className="h-6 w-6 text-primary" />
          Doppelbesteuerungsabkommen (DBA)
        </h1>
        <p className="text-muted-foreground mt-1">
          Übersicht der DBA Deutschlands und Quellensteuer-Anrechnung
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Freistellungsmethode:</strong> Auslandseinkünfte sind in DE steuerfrei, unterliegen aber dem Progressionsvorbehalt.</p>
              <p><strong>Anrechnungsmethode:</strong> Ausländische Steuer wird auf die deutsche ESt angerechnet (§ 34c EStG).</p>
              <p>Deutschland hat mit über 90 Staaten DBA geschlossen. Hier die wichtigsten.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">Länderübersicht</CardTitle>
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={suchbegriff}
                onChange={e => setSuchbegriff(e.target.value)}
                placeholder="Land suchen..."
                className="w-full border rounded pl-8 pr-3 py-2 text-sm bg-background"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4">Land</th>
                  <th className="pb-2 pr-4">Methode</th>
                  <th className="pb-2 pr-4 text-center">Dividenden</th>
                  <th className="pb-2 pr-4 text-center">Zinsen</th>
                  <th className="pb-2 pr-4 text-center">Lizenzen</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {gefilterteLaender.map(d => (
                  <tr key={d.code} className={`border-b hover:bg-muted/50 cursor-pointer ${ausgewaehltesLand?.code === d.code ? 'bg-primary/5' : ''}`}
                    onClick={() => setAusgewaehltesLand(d)}>
                    <td className="py-2 pr-4 font-medium">{d.land}</td>
                    <td className="py-2 pr-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                        d.methode === 'Freistellung' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        d.methode === 'Anrechnung' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {d.methode}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-center">{d.dividenden}%</td>
                    <td className="py-2 pr-4 text-center">{d.zinsen}%</td>
                    <td className="py-2 pr-4 text-center">{d.lizenzen}%</td>
                    <td className="py-2 text-primary text-xs">Details</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {ausgewaehltesLand && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">DBA {ausgewaehltesLand.land} – Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <p>{ausgewaehltesLand.hinweis}</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Methode</span>
                  <span className="font-medium">{ausgewaehltesLand.methode}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Max. Quellensteuer Dividenden</span>
                  <span className="font-medium">{ausgewaehltesLand.dividenden}%</span>
                </div>
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Max. Quellensteuer Zinsen</span>
                  <span className="font-medium">{ausgewaehltesLand.zinsen}%</span>
                </div>
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Max. Quellensteuer Lizenzen</span>
                  <span className="font-medium">{ausgewaehltesLand.lizenzen}%</span>
                </div>
              </div>

              <div className="space-y-3 mt-4">
                <p className="text-sm font-medium">Anrechnungs-Simulation</p>
                <div>
                  <label className="text-sm text-muted-foreground">Auslandseinkünfte: {auslandsEinkuenfte.toLocaleString('de-DE')} EUR</label>
                  <input type="range" min={1000} max={200000} step={1000} value={auslandsEinkuenfte} onChange={e => setAuslandsEinkuenfte(+e.target.value)} className="w-full accent-primary" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Gezahlte Quellensteuer: {quellensteuerGezahlt.toLocaleString('de-DE')} EUR</label>
                  <input type="range" min={0} max={50000} step={500} value={quellensteuerGezahlt} onChange={e => setQuellensteuerGezahlt(+e.target.value)} className="w-full accent-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {anrechnung && (
            <Card className="border-primary/30">
              <CardHeader><CardTitle className="text-lg">Anrechnungsergebnis</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-3 text-center">
                    <p className="text-lg font-bold text-green-700 dark:text-green-400">{anrechnung.tatsAnrechnung.toLocaleString('de-DE')} EUR</p>
                    <p className="text-xs text-muted-foreground">Anrechenbare Quellensteuer</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3 text-center">
                    <p className="text-lg font-bold">{anrechnung.maxAnrechnung.toLocaleString('de-DE')} EUR</p>
                    <p className="text-xs text-muted-foreground">Max. Anrechnung (42% ESt)</p>
                  </div>
                </div>

                {anrechnung.erstattungMoeglich > 0 && (
                  <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-sm">
                    <p className="font-medium text-yellow-800 dark:text-yellow-300">
                      {anrechnung.erstattungMoeglich.toLocaleString('de-DE')} EUR Quellensteuer übersteigen die max. Anrechnung.
                      Prüfen Sie eine Erstattung im Quellenstaat!
                    </p>
                  </div>
                )}

                <div className="space-y-2 text-sm">
                  <p className="font-semibold text-muted-foreground uppercase text-xs tracking-wide">Berechnung</p>
                  <div className="flex justify-between py-1.5 border-b">
                    <span className="text-muted-foreground">Auslandseinkünfte</span>
                    <span className="font-medium">{auslandsEinkuenfte.toLocaleString('de-DE')} EUR</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b">
                    <span className="text-muted-foreground">Gezahlte Quellensteuer</span>
                    <span className="font-medium">{quellensteuerGezahlt.toLocaleString('de-DE')} EUR</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b">
                    <span className="text-muted-foreground">Deutsche ESt auf Auslandseink. (ca.)</span>
                    <span className="font-medium">{anrechnung.maxAnrechnung.toLocaleString('de-DE')} EUR</span>
                  </div>
                  <div className="flex justify-between py-2 font-semibold bg-green-100 dark:bg-green-900/30 rounded px-2">
                    <span>ESt-Minderung durch Anrechnung</span>
                    <span className="text-green-700 dark:text-green-400">{anrechnung.tatsAnrechnung.toLocaleString('de-DE')} EUR</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
