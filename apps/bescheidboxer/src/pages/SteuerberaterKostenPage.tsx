import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Briefcase, Info } from 'lucide-react'

interface Position {
  id: string
  beschreibung: string
  betrag: number
  kategorie: 'wk' | 'ba' | 'sonderausgabe' | 'nicht'
}

const INITIAL: Position[] = [
  { id: '1', beschreibung: 'Steuererklärung (Anlage N)', betrag: 400, kategorie: 'wk' },
  { id: '2', beschreibung: 'Steuererklärung (Mantelbogen)', betrag: 200, kategorie: 'sonderausgabe' },
  { id: '3', beschreibung: 'Anlage V (Vermietung)', betrag: 300, kategorie: 'wk' },
  { id: '4', beschreibung: 'Anlage KAP', betrag: 150, kategorie: 'nicht' },
]

export default function SteuerberaterKostenPage() {
  const [positionen, setPositionen] = useState<Position[]>(INITIAL)
  const [grenzsteuersatz, setGrenzsteuersatz] = useState(35)

  const addPosition = () => {
    setPositionen(prev => [...prev, {
      id: Date.now().toString(),
      beschreibung: 'Neue Position',
      betrag: 100,
      kategorie: 'wk',
    }])
  }

  const removePosition = (id: string) => {
    setPositionen(prev => prev.filter(p => p.id !== id))
  }

  const updatePosition = (id: string, field: keyof Position, value: string | number) => {
    setPositionen(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  const ergebnis = useMemo(() => {
    const wkSumme = positionen.filter(p => p.kategorie === 'wk').reduce((s, p) => s + p.betrag, 0)
    const baSumme = positionen.filter(p => p.kategorie === 'ba').reduce((s, p) => s + p.betrag, 0)
    const saSumme = positionen.filter(p => p.kategorie === 'sonderausgabe').reduce((s, p) => s + p.betrag, 0)
    const nichtSumme = positionen.filter(p => p.kategorie === 'nicht').reduce((s, p) => s + p.betrag, 0)
    const gesamtKosten = positionen.reduce((s, p) => s + p.betrag, 0)
    const absetzbar = wkSumme + baSumme + saSumme

    const satz = grenzsteuersatz / 100
    const soliSatz = satz > 0 ? 0.055 : 0
    const gesamtSatz = satz * (1 + soliSatz)
    const steuerersparnis = Math.round(absetzbar * gesamtSatz)
    const effektivKosten = gesamtKosten - steuerersparnis

    return {
      wkSumme, baSumme, saSumme, nichtSumme,
      gesamtKosten, absetzbar, steuerersparnis, effektivKosten,
    }
  }, [positionen, grenzsteuersatz])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-primary" />
          Steuerberaterkosten
        </h1>
        <p className="text-muted-foreground mt-1">
          Steuerberatung als Werbungskosten / Betriebsausgaben
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Werbungskosten:</strong> Kosten für die Ermittlung von Einkünften (Anlage N, V, etc.).</p>
              <p><strong>Betriebsausgaben:</strong> Bei Selbständigen: Buchhaltung, Jahresabschluss, USt-Voranmeldungen.</p>
              <p><strong>Sonderausgaben:</strong> Kosten für Steuererklärung selbst (Mantelbogen, Software) – seit 2006 nicht mehr absetzbar, aber anteilig zuordnbar.</p>
              <p><strong>Nicht absetzbar:</strong> Rein private Steuerberatung (Anlage KAP bei Privatvermögen).</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Positionen</CardTitle>
              <button onClick={addPosition} className="rounded-md bg-primary px-3 py-1 text-xs text-primary-foreground">+ Hinzufügen</button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {positionen.map(pos => (
              <div key={pos.id} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={pos.beschreibung}
                    onChange={e => updatePosition(pos.id, 'beschreibung', e.target.value)}
                    className="flex-1 rounded-md border border-input bg-background px-2 py-1 text-sm"
                  />
                  <button onClick={() => removePosition(pos.id)} className="text-xs text-red-500 hover:text-red-700">×</button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={pos.betrag}
                    onChange={e => updatePosition(pos.id, 'betrag', +e.target.value)}
                    className="w-24 rounded-md border border-input bg-background px-2 py-1 text-sm text-right"
                  />
                  <span className="text-xs text-muted-foreground">EUR</span>
                  <select
                    value={pos.kategorie}
                    onChange={e => updatePosition(pos.id, 'kategorie', e.target.value)}
                    className="flex-1 rounded-md border border-input bg-background px-2 py-1 text-xs"
                  >
                    <option value="wk">Werbungskosten</option>
                    <option value="ba">Betriebsausgaben</option>
                    <option value="sonderausgabe">Sonderausgaben</option>
                    <option value="nicht">Nicht absetzbar</option>
                  </select>
                </div>
              </div>
            ))}
            <div className="pt-2">
              <label className="text-sm font-medium">Grenzsteuersatz: {grenzsteuersatz}%</label>
              <input type="range" min={0} max={45} step={1} value={grenzsteuersatz} onChange={e => setGrenzsteuersatz(+e.target.value)} className="w-full accent-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader><CardTitle className="text-lg">Ergebnis</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 mb-6">
              <div className="rounded-lg bg-red-100 dark:bg-red-900/30 p-4 text-center">
                <p className="text-2xl font-bold text-red-700 dark:text-red-400">{ergebnis.gesamtKosten.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Gesamtkosten</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-4 text-center">
                <p className="text-2xl font-bold text-primary">{ergebnis.effektivKosten.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Effektive Kosten</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Werbungskosten</span>
                <span className="font-medium">{ergebnis.wkSumme.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Betriebsausgaben</span>
                <span className="font-medium">{ergebnis.baSumme.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Sonderausgaben</span>
                <span className="font-medium">{ergebnis.saSumme.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Nicht absetzbar</span>
                <span className="font-medium text-red-600">{ergebnis.nichtSumme.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Absetzbar gesamt</span>
                <span className="font-medium">{ergebnis.absetzbar.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Steuerersparnis</span>
                <span className="font-medium text-green-600">-{ergebnis.steuerersparnis.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Effektive Kosten</span>
                <span className="font-medium text-primary">{ergebnis.effektivKosten.toLocaleString('de-DE')} EUR</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Zuordnung nach Anlagen</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 text-sm">
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium text-green-600">Absetzbar (typisch)</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>- Anlage N (Arbeitnehmer) → Werbungskosten</li>
                <li>- Anlage V (Vermietung) → Werbungskosten</li>
                <li>- Anlage S/G (Selbständig) → Betriebsausgaben</li>
                <li>- Anlage EÜR / Bilanz → Betriebsausgaben</li>
                <li>- USt-Voranmeldungen → Betriebsausgaben</li>
                <li>- Lohnbuchhaltung → Betriebsausgaben</li>
              </ul>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium text-red-600">Nicht absetzbar</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>- Mantelbogen (seit 2006)</li>
                <li>- Anlage KAP (Privatvermögen)</li>
                <li>- Anlage Kind (privat)</li>
                <li>- Erbschaftsteuererklärung</li>
                <li>- Rein private Steuerberatung</li>
                <li>- Steuersoftware (str.)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
