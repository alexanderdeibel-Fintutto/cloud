import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Monitor, Info, Home } from 'lucide-react'

type Modell = 'pauschale' | 'anteilig' | 'voll'

export default function ArbeitszimmerRechnerPage() {
  const [modell, setModell] = useState<Modell>('pauschale')
  const [homeOfficeTage, setHomeOfficeTage] = useState(120)
  const [wohnflaecheQm, setWohnflaecheQm] = useState(85)
  const [arbeitszimmerQm, setArbeitszimmerQm] = useState(14)
  const [mieteKalt, setMieteKalt] = useState(900)
  const [nebenkosten, setNebenkosten] = useState(250)
  const [strom, setStrom] = useState(80)
  const [internet, setInternet] = useState(40)
  const [moebel, setMoebel] = useState(0)
  const [grenzsteuersatz, setGrenzsteuersatz] = useState(42)

  const ergebnis = useMemo(() => {
    if (modell === 'pauschale') {
      // Homeoffice-Pauschale: 6 €/Tag, max 1.260 €/Jahr (210 Tage)
      const tage = Math.min(homeOfficeTage, 210)
      const abzug = tage * 6
      const maxAbzug = Math.min(abzug, 1260)
      return {
        label: 'Homeoffice-Pauschale',
        abzug: maxAbzug,
        tage,
        details: [
          { label: 'Homeoffice-Tage (max. 210)', wert: tage },
          { label: '× 6 €/Tag', wert: tage * 6 },
          { label: 'Max. 1.260 €/Jahr', wert: maxAbzug },
        ],
        ersparnis: Math.round(maxAbzug * grenzsteuersatz / 100),
      }
    }

    // Tatsächliche Kosten – anteilig oder voll
    const anteil = arbeitszimmerQm / wohnflaecheQm
    const jahresmiete = mieteKalt * 12
    const jahresNK = nebenkosten * 12
    const jahresStrom = strom * 12
    const jahresInternet = internet * 12
    const gesamtkosten = jahresmiete + jahresNK + jahresStrom + jahresInternet + moebel

    const anteilig = Math.round(gesamtkosten * anteil)

    if (modell === 'anteilig') {
      // Beschränkt abzugsfähig: max 1.260 €
      const abzug = Math.min(anteilig, 1260)
      return {
        label: 'Beschränkt abzugsfähig (max. 1.260 €)',
        abzug,
        tage: homeOfficeTage,
        details: [
          { label: `Fläche: ${arbeitszimmerQm}/${wohnflaecheQm} m² = ${(anteil * 100).toFixed(1)}%`, wert: 0 },
          { label: 'Jahresmiete (kalt)', wert: jahresmiete },
          { label: 'Nebenkosten/Jahr', wert: jahresNK },
          { label: 'Strom/Jahr', wert: jahresStrom },
          { label: 'Internet/Jahr', wert: jahresInternet },
          { label: 'Möbel & Ausstattung', wert: moebel },
          { label: 'Gesamt', wert: gesamtkosten },
          { label: `Anteilig (${(anteil * 100).toFixed(1)}%)`, wert: anteilig },
          { label: 'Abzugsfähig (max. 1.260 €)', wert: abzug },
        ],
        ersparnis: Math.round(abzug * grenzsteuersatz / 100),
      }
    }

    // Voll abzugsfähig (Mittelpunkt der Tätigkeit)
    return {
      label: 'Voll abzugsfähig (Mittelpunkt)',
      abzug: anteilig,
      tage: homeOfficeTage,
      details: [
        { label: `Fläche: ${arbeitszimmerQm}/${wohnflaecheQm} m² = ${(anteil * 100).toFixed(1)}%`, wert: 0 },
        { label: 'Jahresmiete (kalt)', wert: jahresmiete },
        { label: 'Nebenkosten/Jahr', wert: jahresNK },
        { label: 'Strom/Jahr', wert: jahresStrom },
        { label: 'Internet/Jahr', wert: jahresInternet },
        { label: 'Möbel & Ausstattung', wert: moebel },
        { label: 'Gesamt', wert: gesamtkosten },
        { label: `Anteilig (${(anteil * 100).toFixed(1)}%)`, wert: anteilig },
      ],
      ersparnis: Math.round(anteilig * grenzsteuersatz / 100),
    }
  }, [modell, homeOfficeTage, wohnflaecheQm, arbeitszimmerQm, mieteKalt, nebenkosten, strom, internet, moebel, grenzsteuersatz])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Monitor className="h-6 w-6 text-primary" />
          Arbeitszimmer-Rechner
        </h1>
        <p className="text-muted-foreground mt-1">
          Homeoffice-Pauschale oder häusliches Arbeitszimmer – was bringt mehr?
        </p>
      </div>

      {/* Info-Box */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Homeoffice-Pauschale (seit 2023):</strong> 6 €/Tag, max. 1.260 €/Jahr (210 Tage). Kein separates Zimmer nötig.</p>
              <p><strong>Häusliches Arbeitszimmer:</strong> Separater, abgeschlossener Raum. Beschränkt (max. 1.260 €) oder voll abzugsfähig, wenn Mittelpunkt der Tätigkeit.</p>
              <p><strong>Hinweis:</strong> Die Homeoffice-Pauschale wird ab 2023 in die Werbungskostenpauschale (1.230 €) eingerechnet.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Modell-Wahl */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Abzugsmodell wählen</CardTitle>
            <CardDescription>Welche Methode möchten Sie berechnen?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {([
              { value: 'pauschale' as Modell, label: 'Homeoffice-Pauschale', desc: '6 €/Tag, max. 1.260 €, kein Zimmer nötig' },
              { value: 'anteilig' as Modell, label: 'Arbeitszimmer (beschränkt)', desc: 'Tatsächliche Kosten, max. 1.260 €' },
              { value: 'voll' as Modell, label: 'Arbeitszimmer (voll)', desc: 'Mittelpunkt der Tätigkeit, unbegrenzt' },
            ]).map(opt => (
              <button
                key={opt.value}
                onClick={() => setModell(opt.value)}
                className={`w-full text-left rounded-lg border-2 p-4 transition-colors ${
                  modell === opt.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <p className="font-medium">{opt.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Parameter */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Parameter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Homeoffice-Tage/Jahr: {homeOfficeTage}</label>
              <input type="range" min={1} max={250} value={homeOfficeTage} onChange={e => setHomeOfficeTage(+e.target.value)} className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-muted-foreground"><span>1</span><span>250</span></div>
            </div>

            {modell !== 'pauschale' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Wohnfläche (m²)</label>
                    <input type="number" value={wohnflaecheQm} onChange={e => setWohnflaecheQm(+e.target.value)} className="w-full mt-1 rounded-md border px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Arbeitszimmer (m²)</label>
                    <input type="number" value={arbeitszimmerQm} onChange={e => setArbeitszimmerQm(+e.target.value)} className="w-full mt-1 rounded-md border px-3 py-2 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Kaltmiete/Monat (€)</label>
                    <input type="number" value={mieteKalt} onChange={e => setMieteKalt(+e.target.value)} className="w-full mt-1 rounded-md border px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Nebenkosten/Monat (€)</label>
                    <input type="number" value={nebenkosten} onChange={e => setNebenkosten(+e.target.value)} className="w-full mt-1 rounded-md border px-3 py-2 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Strom/Monat (€)</label>
                    <input type="number" value={strom} onChange={e => setStrom(+e.target.value)} className="w-full mt-1 rounded-md border px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Internet/Monat (€)</label>
                    <input type="number" value={internet} onChange={e => setInternet(+e.target.value)} className="w-full mt-1 rounded-md border px-3 py-2 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Möbel & Ausstattung/Jahr (€)</label>
                  <input type="number" value={moebel} onChange={e => setMoebel(+e.target.value)} className="w-full mt-1 rounded-md border px-3 py-2 text-sm" />
                </div>
              </>
            )}

            <div>
              <label className="text-sm font-medium">Grenzsteuersatz: {grenzsteuersatz} %</label>
              <input type="range" min={14} max={45} value={grenzsteuersatz} onChange={e => setGrenzsteuersatz(+e.target.value)} className="w-full accent-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ergebnis */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Home className="h-5 w-5 text-primary" />
            {ergebnis.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <div className="rounded-lg bg-primary/10 p-4 text-center">
              <p className="text-2xl font-bold text-primary">{ergebnis.abzug.toLocaleString('de-DE')} €</p>
              <p className="text-xs text-muted-foreground mt-1">Steuerabzug</p>
            </div>
            <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-4 text-center">
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{ergebnis.ersparnis.toLocaleString('de-DE')} €</p>
              <p className="text-xs text-muted-foreground mt-1">Steuerersparnis</p>
            </div>
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-2xl font-bold">{ergebnis.tage}</p>
              <p className="text-xs text-muted-foreground mt-1">Tage berücksichtigt</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Berechnung im Detail</p>
            {ergebnis.details.map((d, i) => (
              <div key={i} className="flex justify-between text-sm py-1 border-b border-border/40 last:border-0">
                <span className="text-muted-foreground">{d.label}</span>
                {d.wert > 0 && <span className="font-medium">{d.wert.toLocaleString('de-DE')} €</span>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vergleich */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Schnellvergleich: Pauschale vs. Arbeitszimmer</CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const pauschaleAbzug = Math.min(Math.min(homeOfficeTage, 210) * 6, 1260)
            const anteil = arbeitszimmerQm / wohnflaecheQm
            const tatsaechlich = Math.round((mieteKalt + nebenkosten + strom + internet) * 12 * anteil + moebel * anteil)
            const arbeitszimmerBeschraenkt = Math.min(tatsaechlich, 1260)

            const varianten = [
              { label: 'Homeoffice-Pauschale', abzug: pauschaleAbzug, ersparnis: Math.round(pauschaleAbzug * grenzsteuersatz / 100) },
              { label: 'Arbeitszimmer (beschränkt)', abzug: arbeitszimmerBeschraenkt, ersparnis: Math.round(arbeitszimmerBeschraenkt * grenzsteuersatz / 100) },
              { label: 'Arbeitszimmer (voll)', abzug: tatsaechlich, ersparnis: Math.round(tatsaechlich * grenzsteuersatz / 100) },
            ]

            const maxAbzug = Math.max(...varianten.map(v => v.abzug))

            return (
              <div className="space-y-3">
                {varianten.map((v, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className={v.abzug === maxAbzug ? 'font-semibold text-primary' : ''}>{v.label}</span>
                      <span className="font-medium">{v.abzug.toLocaleString('de-DE')} € → Ersparnis {v.ersparnis.toLocaleString('de-DE')} €</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${v.abzug === maxAbzug ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                        style={{ width: `${maxAbzug > 0 ? (v.abzug / maxAbzug) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground mt-2">
                  * &quot;Arbeitszimmer (voll)&quot; ist nur möglich, wenn der Raum den Mittelpunkt der beruflichen Tätigkeit darstellt.
                </p>
              </div>
            )
          })()}
        </CardContent>
      </Card>
    </div>
  )
}
