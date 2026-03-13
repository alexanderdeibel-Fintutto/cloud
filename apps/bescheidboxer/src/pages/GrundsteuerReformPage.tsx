import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Building, Info } from 'lucide-react'

const BUNDESLAENDER = [
  { name: 'Baden-Württemberg', modell: 'Bodenwertmodell', hebesatz: 400 },
  { name: 'Bayern', modell: 'Flächenmodell', hebesatz: 380 },
  { name: 'Berlin', modell: 'Bundesmodell', hebesatz: 470 },
  { name: 'Brandenburg', modell: 'Bundesmodell', hebesatz: 450 },
  { name: 'Bremen', modell: 'Bundesmodell', hebesatz: 695 },
  { name: 'Hamburg', modell: 'Wohnlagenmodell', hebesatz: 540 },
  { name: 'Hessen', modell: 'Flächen-Faktor-Modell', hebesatz: 500 },
  { name: 'Mecklenburg-Vorp.', modell: 'Bundesmodell', hebesatz: 400 },
  { name: 'Niedersachsen', modell: 'Flächen-Lage-Modell', hebesatz: 450 },
  { name: 'NRW', modell: 'Bundesmodell', hebesatz: 550 },
  { name: 'Rheinland-Pfalz', modell: 'Bundesmodell', hebesatz: 465 },
  { name: 'Saarland', modell: 'Bundesmodell', hebesatz: 440 },
  { name: 'Sachsen', modell: 'Bundesmodell', hebesatz: 530 },
  { name: 'Sachsen-Anhalt', modell: 'Bundesmodell', hebesatz: 410 },
  { name: 'Schleswig-Holstein', modell: 'Bundesmodell', hebesatz: 380 },
  { name: 'Thüringen', modell: 'Bundesmodell', hebesatz: 420 },
]

export default function GrundsteuerReformPage() {
  const [bundeslandIdx, setBundeslandIdx] = useState(0)
  const [grundstueckswert, setGrundstueckswert] = useState(250000)
  const [wohnflaeche, setWohnflaeche] = useState(120)
  const [grundstuecksflaeche, setGrundstuecksflaeche] = useState(500)
  const [hebesatz, setHebesatz] = useState(BUNDESLAENDER[0].hebesatz)
  const [istWohnung, setIstWohnung] = useState(true)

  const bundesland = BUNDESLAENDER[bundeslandIdx]

  const ergebnis = useMemo(() => {
    // Bundesmodell (vereinfacht)
    // Grundsteuerwert × Steuermesszahl × Hebesatz
    const steuermesszahl = istWohnung ? 0.00031 : 0.00034
    const messbetrag = Math.round(grundstueckswert * steuermesszahl * 100) / 100
    const grundsteuerJahr = Math.round(messbetrag * hebesatz / 100 * 100) / 100
    const grundsteuerMonat = Math.round(grundsteuerJahr / 12 * 100) / 100
    const grundsteuerQuartal = Math.round(grundsteuerJahr / 4 * 100) / 100

    // Bayern: Flächenmodell (vereinfacht)
    const bayernWohnflaecheWert = wohnflaeche * 0.50 // 0,50 EUR/qm Wohnfläche
    const bayernGrundflaecheWert = grundstuecksflaeche * 0.04 // 0,04 EUR/qm Grundstück
    const bayernMessbetrag = bayernWohnflaecheWert + bayernGrundflaecheWert
    const bayernSteuer = Math.round(bayernMessbetrag * hebesatz / 100 * 100) / 100

    // Vergleich Bundesländer
    const vergleich = BUNDESLAENDER.map(bl => {
      const mb = Math.round(grundstueckswert * steuermesszahl * 100) / 100
      return {
        name: bl.name,
        modell: bl.modell,
        steuer: Math.round(mb * bl.hebesatz / 100 * 100) / 100,
        hebesatz: bl.hebesatz,
      }
    }).sort((a, b) => a.steuer - b.steuer)

    return {
      steuermesszahl, messbetrag,
      grundsteuerJahr, grundsteuerMonat, grundsteuerQuartal,
      bayernSteuer, bayernMessbetrag,
      vergleich,
    }
  }, [grundstueckswert, wohnflaeche, grundstuecksflaeche, hebesatz, istWohnung])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Building className="h-6 w-6 text-primary" />
          Grundsteuer-Reform 2025
        </h1>
        <p className="text-muted-foreground mt-1">
          Neue Grundsteuer ab 01.01.2025 – Modellvergleich
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Reform:</strong> Neue Grundsteuer gilt ab 01.01.2025. BVerfG hatte die alte Bewertung für verfassungswidrig erklärt.</p>
              <p><strong>Bundesmodell:</strong> Grundsteuerwert × Steuermesszahl (0,031%/0,034%) × Hebesatz.</p>
              <p><strong>Ländermodelle:</strong> Bayern (Fläche), BW (Bodenwert), Hamburg (Wohnlage), Hessen (Flächen-Faktor), Niedersachsen (Flächen-Lage).</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Eingaben</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Bundesland</p>
              <select
                value={bundeslandIdx}
                onChange={e => { setBundeslandIdx(+e.target.value); setHebesatz(BUNDESLAENDER[+e.target.value].hebesatz) }}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {BUNDESLAENDER.map((bl, i) => (
                  <option key={i} value={i}>{bl.name} ({bl.modell})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Grundsteuerwert: {grundstueckswert.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={50000} max={1000000} step={5000} value={grundstueckswert} onChange={e => setGrundstueckswert(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Wohnfläche: {wohnflaeche} m²</label>
              <input type="range" min={30} max={300} step={5} value={wohnflaeche} onChange={e => setWohnflaeche(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Grundstücksfläche: {grundstuecksflaeche} m²</label>
              <input type="range" min={100} max={2000} step={50} value={grundstuecksflaeche} onChange={e => setGrundstuecksflaeche(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Hebesatz: {hebesatz}%</label>
              <input type="range" min={200} max={900} step={10} value={hebesatz} onChange={e => setHebesatz(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIstWohnung(true)} className={`rounded-md px-4 py-2 text-sm ${istWohnung ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                Wohngrundstück
              </button>
              <button onClick={() => setIstWohnung(false)} className={`rounded-md px-4 py-2 text-sm ${!istWohnung ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                Geschäftsgrundstück
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader><CardTitle className="text-lg">Ergebnis – {bundesland.name}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3 mb-6">
              <div className="rounded-lg bg-primary/10 p-4 text-center">
                <p className="text-2xl font-bold text-primary">{ergebnis.grundsteuerJahr.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Grundsteuer/Jahr</p>
              </div>
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-2xl font-bold">{ergebnis.grundsteuerQuartal.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Pro Quartal</p>
              </div>
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-2xl font-bold">{ergebnis.grundsteuerMonat.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Pro Monat</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Modell</span>
                <span className="font-medium">{bundesland.modell}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Grundsteuerwert</span>
                <span className="font-medium">{grundstueckswert.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Steuermesszahl</span>
                <span className="font-medium">{(ergebnis.steuermesszahl * 100).toFixed(3)}%</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Steuermessbetrag</span>
                <span className="font-medium">{ergebnis.messbetrag.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Hebesatz</span>
                <span className="font-medium">{hebesatz}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Bundesländer-Vergleich (Bundesmodell)</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4">Bundesland</th>
                  <th className="py-2 pr-4">Modell</th>
                  <th className="py-2 pr-4 text-right">Hebesatz</th>
                  <th className="py-2 text-right">Grundsteuer/Jahr</th>
                </tr>
              </thead>
              <tbody>
                {ergebnis.vergleich.map((v, i) => (
                  <tr key={i} className={`border-b ${v.name === bundesland.name ? 'bg-primary/5 font-medium' : ''}`}>
                    <td className="py-1.5 pr-4">{v.name}</td>
                    <td className="py-1.5 pr-4 text-xs text-muted-foreground">{v.modell}</td>
                    <td className="py-1.5 pr-4 text-right">{v.hebesatz}%</td>
                    <td className="py-1.5 text-right">{v.steuer.toLocaleString('de-DE')} EUR</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Hinweis: Vereinfachte Berechnung nach Bundesmodell. Landesmodelle weichen ab.</p>
        </CardContent>
      </Card>
    </div>
  )
}
