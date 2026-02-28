import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Target, Info, CheckCircle2, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

function calcESt(zvE: number): number {
  if (zvE <= 12084) return 0
  if (zvE <= 17005) {
    const y = (zvE - 12084) / 10000
    return Math.round((922.98 * y + 1400) * y)
  }
  if (zvE <= 66760) {
    const z = (zvE - 17005) / 10000
    return Math.round((181.19 * z + 2397) * z + 1025.38)
  }
  if (zvE <= 277825) {
    return Math.round(0.42 * zvE - 10394.14)
  }
  return Math.round(0.45 * zvE - 18730.89)
}

interface Optimierung {
  id: string
  name: string
  beschreibung: string
  maxBetrag: number
  aktuellerBetrag: number
  kategorie: 'werbungskosten' | 'sonderausgaben' | 'vorsorge' | 'haushaltnah' | 'kinder'
}

const DEFAULT_OPTIMIERUNGEN: Optimierung[] = [
  { id: 'pendler', name: 'Entfernungspauschale', beschreibung: '0,30/0,38 EUR/km', maxBetrag: 6000, aktuellerBetrag: 0, kategorie: 'werbungskosten' },
  { id: 'homeoffice', name: 'Homeoffice-Pauschale', beschreibung: '6 EUR/Tag, max 1.260', maxBetrag: 1260, aktuellerBetrag: 0, kategorie: 'werbungskosten' },
  { id: 'arbeitsmittel', name: 'Arbeitsmittel', beschreibung: 'PC, Laptop, Buero', maxBetrag: 3000, aktuellerBetrag: 0, kategorie: 'werbungskosten' },
  { id: 'fortbildung', name: 'Fortbildungskosten', beschreibung: 'Kurse, Seminare, Buecher', maxBetrag: 5000, aktuellerBetrag: 0, kategorie: 'werbungskosten' },
  { id: 'ruerup', name: 'Rürup/Basisrente', beschreibung: 'Max 27.566 EUR (2025)', maxBetrag: 27566, aktuellerBetrag: 0, kategorie: 'vorsorge' },
  { id: 'riester', name: 'Riester-Rente', beschreibung: 'Max 2.100 EUR inkl. Zulagen', maxBetrag: 2100, aktuellerBetrag: 0, kategorie: 'vorsorge' },
  { id: 'spenden', name: 'Spenden', beschreibung: 'Max 20% der Einkuenfte', maxBetrag: 10000, aktuellerBetrag: 0, kategorie: 'sonderausgaben' },
  { id: 'kirchensteuer', name: 'Kirchensteuer', beschreibung: 'Voll absetzbar', maxBetrag: 5000, aktuellerBetrag: 0, kategorie: 'sonderausgaben' },
  { id: 'handwerker', name: 'Handwerkerleistungen', beschreibung: '20% direkt von Steuer, max 1.200', maxBetrag: 6000, aktuellerBetrag: 0, kategorie: 'haushaltnah' },
  { id: 'haushalt', name: 'Haushaltsnahe Dienste', beschreibung: '20% direkt, max 4.000', maxBetrag: 20000, aktuellerBetrag: 0, kategorie: 'haushaltnah' },
]

const KATEGORIE_LABELS: Record<string, string> = {
  werbungskosten: 'Werbungskosten',
  sonderausgaben: 'Sonderausgaben',
  vorsorge: 'Vorsorgeaufwendungen',
  haushaltnah: 'Haushaltsnahe Dienste',
  kinder: 'Kinder',
}

export default function SteueroptimierungPage() {
  const [bruttogehalt, setBruttogehalt] = useState(55000)
  const [grenzsteuersatz, setGrenzsteuersatz] = useState(42)
  const [optimierungen, setOptimierungen] = useState(DEFAULT_OPTIMIERUNGEN)

  const updateBetrag = (id: string, betrag: number) => {
    setOptimierungen(prev => prev.map(o => o.id === id ? { ...o, aktuellerBetrag: Math.min(betrag, o.maxBetrag) } : o))
  }

  const ergebnis = useMemo(() => {
    const wk = optimierungen.filter(o => o.kategorie === 'werbungskosten').reduce((s, o) => s + o.aktuellerBetrag, 0)
    const sa = optimierungen.filter(o => o.kategorie === 'sonderausgaben').reduce((s, o) => s + o.aktuellerBetrag, 0)
    const vs = optimierungen.filter(o => o.kategorie === 'vorsorge').reduce((s, o) => s + o.aktuellerBetrag, 0)

    // Arbeitnehmer-Pauschbetrag: 1.230 EUR (automatisch bei WK < 1.230)
    const wkEffektiv = Math.max(wk, 1230)
    const wkVorteil = wk > 1230 ? wk - 1230 : 0

    // Haushaltsnahe: direkte Steuerermäßigung § 35a
    const handwerkerOpt = optimierungen.find(o => o.id === 'handwerker')
    const haushaltOpt = optimierungen.find(o => o.id === 'haushalt')
    const handwerkerErmaessigung = Math.min((handwerkerOpt?.aktuellerBetrag || 0) * 0.20, 1200)
    const haushaltErmaessigung = Math.min((haushaltOpt?.aktuellerBetrag || 0) * 0.20, 4000)
    const paragraf35a = Math.round(handwerkerErmaessigung + haushaltErmaessigung)

    // zvE Berechnung
    const zvEOhne = bruttogehalt - 1230
    const zvEMit = bruttogehalt - wkEffektiv - sa - vs

    const steuerOhne = calcESt(zvEOhne)
    const steuerMit = calcESt(zvEMit)
    const steuervorteilAbzug = steuerOhne - steuerMit
    const gesamtVorteil = steuervorteilAbzug + paragraf35a

    // Potential: was noch moeglich waere
    const gesamtAusgeschoepft = optimierungen.reduce((s, o) => s + o.aktuellerBetrag, 0)
    const gesamtMaximal = optimierungen.reduce((s, o) => s + o.maxBetrag, 0)
    const ausschoepfungsgrad = gesamtMaximal > 0 ? Math.round(gesamtAusgeschoepft / gesamtMaximal * 100) : 0

    // Chart
    const kategorien = Object.keys(KATEGORIE_LABELS)
    const chartData = kategorien.map(kat => {
      const aktuell = optimierungen.filter(o => o.kategorie === kat).reduce((s, o) => s + o.aktuellerBetrag, 0)
      const maximal = optimierungen.filter(o => o.kategorie === kat).reduce((s, o) => s + o.maxBetrag, 0)
      return {
        name: KATEGORIE_LABELS[kat],
        aktuell,
        potential: maximal - aktuell,
      }
    }).filter(d => d.aktuell > 0 || d.potential > 0)

    return {
      wkVorteil,
      steuervorteilAbzug,
      paragraf35a,
      gesamtVorteil,
      ausschoepfungsgrad,
      zvEOhne,
      zvEMit,
      steuerOhne,
      steuerMit,
      chartData,
    }
  }, [bruttogehalt, grenzsteuersatz, optimierungen])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Target className="h-6 w-6 text-primary" />
          Steueroptimierung
        </h1>
        <p className="text-muted-foreground mt-1">
          Alle Abzugsmoeglichkeiten auf einen Blick
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Werbungskosten:</strong> Ab 1.230 EUR (AN-Pauschbetrag) voll absetzbar. Jeder Euro darueber reduziert die Steuerlast.</p>
              <p><strong>§ 35a EStG:</strong> Handwerker (20%, max 1.200 EUR) + Haushaltshilfe (20%, max 4.000 EUR) direkt von der Steuer abziehen.</p>
              <p><strong>Tipp:</strong> Verschiebbare Ausgaben vor Jahresende taetigen, Belege sammeln!</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Bruttogehalt: {bruttogehalt.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={20000} max={150000} step={1000} value={bruttogehalt} onChange={e => setBruttogehalt(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Grenzsteuersatz: {grenzsteuersatz}%</label>
              <input type="range" min={14} max={45} value={grenzsteuersatz} onChange={e => setGrenzsteuersatz(+e.target.value)} className="w-full accent-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ergebnis oben */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Card className="border-primary/30">
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-primary">{ergebnis.gesamtVorteil.toLocaleString('de-DE')} EUR</p>
            <p className="text-xs text-muted-foreground mt-1">Gesamte Steuerersparnis</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">{ergebnis.steuervorteilAbzug.toLocaleString('de-DE')} EUR</p>
            <p className="text-xs text-muted-foreground mt-1">Durch Abzuege</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{ergebnis.paragraf35a.toLocaleString('de-DE')} EUR</p>
            <p className="text-xs text-muted-foreground mt-1">§ 35a Ermaessigung</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className={`text-2xl font-bold ${ergebnis.ausschoepfungsgrad > 50 ? 'text-green-600' : 'text-orange-600'}`}>{ergebnis.ausschoepfungsgrad}%</p>
            <p className="text-xs text-muted-foreground mt-1">Ausschoepfungsgrad</p>
          </CardContent>
        </Card>
      </div>

      {/* Optimierungen */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Abzugsmoeglichkeiten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(KATEGORIE_LABELS).map(([kat, label]) => {
            const items = optimierungen.filter(o => o.kategorie === kat)
            if (items.length === 0) return null
            return (
              <div key={kat}>
                <p className="text-sm font-medium text-muted-foreground mb-2">{label}</p>
                <div className="space-y-3">
                  {items.map(opt => (
                    <div key={opt.id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {opt.aktuellerBetrag > 0 ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-orange-400" />
                          )}
                          <span className="text-sm font-medium">{opt.name}</span>
                        </div>
                        <span className="text-sm font-bold">{opt.aktuellerBetrag.toLocaleString('de-DE')} EUR</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{opt.beschreibung}</p>
                      <input
                        type="range"
                        min={0}
                        max={opt.maxBetrag}
                        step={opt.maxBetrag > 5000 ? 100 : 50}
                        value={opt.aktuellerBetrag}
                        onChange={e => updateBetrag(opt.id, +e.target.value)}
                        className="w-full accent-primary"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0 EUR</span>
                        <span>max {opt.maxBetrag.toLocaleString('de-DE')} EUR</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {ergebnis.chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Nutzung nach Kategorie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ergebnis.chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `${v.toLocaleString('de-DE')} EUR`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={120} />
                  <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR`} />
                  <Legend />
                  <Bar dataKey="aktuell" name="Genutzt" fill="#22c55e" stackId="a" />
                  <Bar dataKey="potential" name="Ungenutztes Potential" fill="#e5e7eb" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Steuervergleich</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 text-sm">
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3">
              <p className="font-medium text-red-700 dark:text-red-400 mb-1">Ohne Optimierung</p>
              <p className="text-muted-foreground">zvE: {ergebnis.zvEOhne.toLocaleString('de-DE')} EUR</p>
              <p className="text-lg font-bold text-red-700 dark:text-red-400">{ergebnis.steuerOhne.toLocaleString('de-DE')} EUR ESt</p>
            </div>
            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-3">
              <p className="font-medium text-green-700 dark:text-green-400 mb-1">Mit Optimierung</p>
              <p className="text-muted-foreground">zvE: {ergebnis.zvEMit.toLocaleString('de-DE')} EUR</p>
              <p className="text-lg font-bold text-green-700 dark:text-green-400">{ergebnis.steuerMit.toLocaleString('de-DE')} EUR ESt</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
