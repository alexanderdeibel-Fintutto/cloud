import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Zap, Info } from 'lucide-react'

function calcESt(zvE: number): number {
  if (zvE <= 12084) return 0
  if (zvE <= 17005) { const y = (zvE - 12084) / 10000; return Math.round((922.98 * y + 1400) * y) }
  if (zvE <= 66760) { const z = (zvE - 17005) / 10000; return Math.round((181.19 * z + 2397) * z + 1025.38) }
  if (zvE <= 277825) return Math.round(0.42 * zvE - 10394.14)
  return Math.round(0.45 * zvE - 18730.89)
}

type Profil = 'angestellt' | 'selbstaendig' | 'rentner' | 'vermieter'

const PROFILE: { id: Profil; label: string; beschreibung: string }[] = [
  { id: 'angestellt', label: 'Angestellt', beschreibung: 'Einkünfte aus nichtselbständiger Arbeit' },
  { id: 'selbstaendig', label: 'Selbständig', beschreibung: 'Gewerbebetrieb oder freiberuflich' },
  { id: 'rentner', label: 'Rentner/in', beschreibung: 'Altersrente, Pension' },
  { id: 'vermieter', label: 'Vermieter/in', beschreibung: 'Einkünfte aus V+V' },
]

export default function SteuerschaetzungPage() {
  const [profil, setProfil] = useState<Profil>('angestellt')
  const [bruttoeinkommen, setBruttoeinkommen] = useState(50000)
  const [splitting, setSplitting] = useState(false)
  const [kirchensteuer, setKirchensteuer] = useState(false)
  const [kinder, setKinder] = useState(0)

  const ergebnis = useMemo(() => {
    // Vereinfachte Schätzung je nach Profil
    let werbungskosten = 0
    let sonderausgaben = 0
    let vorsorge = 0

    switch (profil) {
      case 'angestellt':
        werbungskosten = Math.max(1230, Math.round(bruttoeinkommen * 0.05)) // Mind. Pauschbetrag
        sonderausgaben = 36 // Sonderausgabenpauschbetrag
        vorsorge = Math.round(bruttoeinkommen * 0.10) // ~10% SV-Beiträge als Vorsorge
        break
      case 'selbstaendig':
        werbungskosten = Math.round(bruttoeinkommen * 0.25) // ~25% Betriebsausgaben
        sonderausgaben = 5000
        vorsorge = Math.round(bruttoeinkommen * 0.15)
        break
      case 'rentner':
        werbungskosten = 102 // Werbungskostenpauschbetrag
        sonderausgaben = 36
        vorsorge = Math.round(bruttoeinkommen * 0.12)
        // Besteuerungsanteil ~83% für Neurentner 2025
        break
      case 'vermieter':
        werbungskosten = Math.round(bruttoeinkommen * 0.30) // ~30% AfA, Zinsen, etc.
        sonderausgaben = 36
        vorsorge = 0
        break
    }

    const steuerpflichtigesEinkommen = profil === 'rentner'
      ? Math.round(bruttoeinkommen * 0.83) // Besteuerungsanteil
      : bruttoeinkommen

    const zvE = Math.max(steuerpflichtigesEinkommen - werbungskosten - sonderausgaben - vorsorge, 0)

    const zvESplit = splitting ? Math.round(zvE / 2) : zvE
    let est = calcESt(zvESplit)
    if (splitting) est *= 2

    const soli = est > (splitting ? 36260 : 18130) ? Math.round(est * 0.055) : 0
    const kist = kirchensteuer ? Math.round(est * 0.09) : 0
    const steuerGesamt = est + soli + kist

    // Kindergeld (Vergleich: Freibetrag nicht modelliert, vereinfacht)
    const kindergeld = kinder * 250 * 12

    const nettoEinkommen = bruttoeinkommen - steuerGesamt
    const steuerquote = bruttoeinkommen > 0 ? Math.round(steuerGesamt / bruttoeinkommen * 10000) / 100 : 0
    const nettoMonatlich = Math.round(nettoEinkommen / 12)

    return {
      werbungskosten, sonderausgaben, vorsorge, zvE,
      est, soli, kist, steuerGesamt,
      kindergeld, nettoEinkommen, steuerquote, nettoMonatlich,
    }
  }, [profil, bruttoeinkommen, splitting, kirchensteuer, kinder])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          Schnelle Steuerschätzung
        </h1>
        <p className="text-muted-foreground mt-1">
          Grobe Steuerberechnung in 30 Sekunden
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-blue-800 dark:text-blue-200">
              <p><strong>Schnellschätzung:</strong> Wählen Sie Ihr Profil und Bruttoeinkommen – die App schätzt typische Abzüge automatisch. Für eine genaue Berechnung nutzen Sie den Steuerschuld-Rechner.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <p className="text-sm font-medium mb-3">Ihr Profil</p>
        <div className="grid gap-2 sm:grid-cols-4">
          {PROFILE.map(p => (
            <button
              key={p.id}
              onClick={() => setProfil(p.id)}
              className={`rounded-lg p-3 text-left text-sm transition-colors ${profil === p.id ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-accent'}`}
            >
              <p className="font-medium">{p.label}</p>
              <p className={`text-xs mt-0.5 ${profil === p.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{p.beschreibung}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Eingaben</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                {profil === 'rentner' ? 'Jahresbruttorente' : profil === 'vermieter' ? 'Mieteinnahmen/Jahr' : 'Bruttoeinkommen/Jahr'}: {bruttoeinkommen.toLocaleString('de-DE')} EUR
              </label>
              <input type="range" min={10000} max={200000} step={1000} value={bruttoeinkommen} onChange={e => setBruttoeinkommen(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Kinder: {kinder}</label>
              <input type="range" min={0} max={5} value={kinder} onChange={e => setKinder(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={splitting} onChange={e => setSplitting(e.target.checked)} className="accent-primary" />
                Zusammenveranlagung (verheiratet)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={kirchensteuer} onChange={e => setKirchensteuer(e.target.checked)} className="accent-primary" />
                Kirchensteuer (9%)
              </label>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader><CardTitle className="text-lg">Geschätzte Steuerlast</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 mb-6">
              <div className="rounded-lg bg-red-100 dark:bg-red-900/30 p-4 text-center">
                <p className="text-2xl font-bold text-red-700 dark:text-red-400">{ergebnis.steuerGesamt.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Steuer/Jahr (~{ergebnis.steuerquote}%)</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-4 text-center">
                <p className="text-2xl font-bold text-primary">{ergebnis.nettoMonatlich.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Netto/Monat (geschätzt)</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Bruttoeinkommen</span>
                <span className="font-medium">{bruttoeinkommen.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Werbungskosten (geschätzt)</span>
                <span className="font-medium text-green-600">-{ergebnis.werbungskosten.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Vorsorge (geschätzt)</span>
                <span className="font-medium text-green-600">-{ergebnis.vorsorge.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Sonderausgaben</span>
                <span className="font-medium text-green-600">-{ergebnis.sonderausgaben.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">zvE (geschätzt)</span>
                <span className="font-medium">{ergebnis.zvE.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Einkommensteuer</span>
                <span className="font-medium">{ergebnis.est.toLocaleString('de-DE')} EUR</span>
              </div>
              {ergebnis.soli > 0 && (
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Solidaritätszuschlag</span>
                  <span className="font-medium">{ergebnis.soli.toLocaleString('de-DE')} EUR</span>
                </div>
              )}
              {ergebnis.kist > 0 && (
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Kirchensteuer</span>
                  <span className="font-medium">{ergebnis.kist.toLocaleString('de-DE')} EUR</span>
                </div>
              )}
              {ergebnis.kindergeld > 0 && (
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">Kindergeld/Jahr</span>
                  <span className="font-medium text-green-600">+{ergebnis.kindergeld.toLocaleString('de-DE')} EUR</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Hinweise zur Schätzung</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 text-sm">
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium">Was ist enthalten?</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>- ESt-Tarif 2025 (§ 32a)</li>
                <li>- Typische Pauschbeträge</li>
                <li>- Solidaritätszuschlag</li>
                <li>- Kirchensteuer (optional)</li>
                <li>- Splitting (optional)</li>
              </ul>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium">Was fehlt?</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>- Individuelle Werbungskosten</li>
                <li>- Außergewöhnliche Belastungen</li>
                <li>- Haushaltsnahe Dienste (§ 35a)</li>
                <li>- Steuerermäßigungen</li>
                <li>- Sozialversicherungsbeiträge</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
