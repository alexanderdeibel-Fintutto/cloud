import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Target, Info, CheckCircle2, XCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface Posten {
  id: string
  name: string
  kategorie: string
  betrag: number
  maxBetrag: number
  aktiv: boolean
  info: string
}

const INITIAL_POSTEN: Posten[] = [
  { id: 'pendler', name: 'Entfernungspauschale', kategorie: 'Fahrtkosten', betrag: 1380, maxBetrag: 5000, aktiv: true, info: '30 km × 230 Tage × 0,30/0,38 EUR' },
  { id: 'homeoffice', name: 'Homeoffice-Pauschale', kategorie: 'Fahrtkosten', betrag: 720, maxBetrag: 1260, aktiv: true, info: '120 Tage × 6 EUR' },
  { id: 'arbeitsmittel', name: 'Arbeitsmittel', kategorie: 'Arbeitsmittel', betrag: 400, maxBetrag: 5000, aktiv: true, info: 'PC, Schreibtisch, Software, Fachliteratur' },
  { id: 'fortbildung', name: 'Fortbildungskosten', kategorie: 'Bildung', betrag: 500, maxBetrag: 10000, aktiv: false, info: 'Kurse, Seminare, Fachliteratur' },
  { id: 'telefon', name: 'Telefon/Internet', kategorie: 'Kommunikation', betrag: 240, maxBetrag: 600, aktiv: true, info: '20 EUR/Monat beruflicher Anteil' },
  { id: 'konto', name: 'Kontofuehrung', kategorie: 'Sonstiges', betrag: 16, maxBetrag: 16, aktiv: true, info: 'Pauschale ohne Nachweis' },
  { id: 'bewerbung', name: 'Bewerbungskosten', kategorie: 'Sonstiges', betrag: 0, maxBetrag: 2000, aktiv: false, info: 'Porto, Fotos, Fahrtkosten' },
  { id: 'umzug', name: 'Umzugskosten', kategorie: 'Umzug', betrag: 0, maxBetrag: 15000, aktiv: false, info: 'Beruflich veranlasster Umzug' },
  { id: 'doppelhaush', name: 'Doppelte Haushaltsfuehrung', kategorie: 'Wohnen', betrag: 0, maxBetrag: 12000, aktiv: false, info: 'Zweitwohnung max. 1.000 EUR/Monat' },
  { id: 'reisekosten', name: 'Reisekosten (Dienstreise)', kategorie: 'Reise', betrag: 300, maxBetrag: 5000, aktiv: true, info: 'Fahrt, Verpflegung, Uebernachtung' },
  { id: 'berufskleidung', name: 'Berufskleidung', kategorie: 'Sonstiges', betrag: 0, maxBetrag: 2000, aktiv: false, info: 'Nur typische Berufskleidung' },
  { id: 'gewerkschaft', name: 'Gewerkschaft/Berufsverband', kategorie: 'Mitgliedschaft', betrag: 180, maxBetrag: 1000, aktiv: true, info: 'Beitraege pro Jahr' },
]

export default function WerbungskostenOptimiererPage() {
  const [posten, setPosten] = useState<Posten[]>(INITIAL_POSTEN)
  const [grenzsteuersatz, setGrenzsteuersatz] = useState(35)

  const togglePosten = (id: string) => {
    setPosten(prev => prev.map(p => p.id === id ? { ...p, aktiv: !p.aktiv } : p))
  }

  const updateBetrag = (id: string, betrag: number) => {
    setPosten(prev => prev.map(p => p.id === id ? { ...p, betrag } : p))
  }

  const ergebnis = useMemo(() => {
    const pauschbetrag = 1230
    const aktivePosten = posten.filter(p => p.aktiv)
    const gesamtWK = aktivePosten.reduce((s, p) => s + p.betrag, 0)
    const ueberPauschbetrag = gesamtWK > pauschbetrag
    const effektiverAbzug = Math.max(gesamtWK, pauschbetrag)
    const mehrAbzug = Math.max(gesamtWK - pauschbetrag, 0)
    const steuerersparnis = Math.round(mehrAbzug * grenzsteuersatz / 100)

    // Pro Kategorie
    const kategorien = new Map<string, number>()
    aktivePosten.forEach(p => {
      kategorien.set(p.kategorie, (kategorien.get(p.kategorie) || 0) + p.betrag)
    })

    const chartData = Array.from(kategorien.entries())
      .map(([name, betrag]) => ({ name, betrag }))
      .sort((a, b) => b.betrag - a.betrag)

    // Inaktive Posten mit Potenzial
    const inaktivePosten = posten.filter(p => !p.aktiv)
    const potenzial = inaktivePosten.reduce((s, p) => s + p.maxBetrag, 0)

    return {
      gesamtWK,
      pauschbetrag,
      ueberPauschbetrag,
      effektiverAbzug,
      mehrAbzug,
      steuerersparnis,
      chartData,
      aktiveAnzahl: aktivePosten.length,
      potenzial,
    }
  }, [posten, grenzsteuersatz])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Target className="h-6 w-6 text-primary" />
          Werbungskosten-Optimierer
        </h1>
        <p className="text-muted-foreground mt-1">
          Alle Abzugsmoeglichkeiten fuer Arbeitnehmer – § 9 EStG
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Arbeitnehmer-Pauschbetrag:</strong> <strong>1.230 EUR</strong> werden automatisch beruecksichtigt. Erst bei hoeheren Werbungskosten lohnt sich der Einzelnachweis.</p>
              <p><strong>Tipp:</strong> Aktivieren Sie alle zutreffenden Posten und passen Sie die Betraege an. Jeder Euro ueber 1.230 EUR spart Steuern!</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <label className="text-sm font-medium">Grenzsteuersatz: {grenzsteuersatz}%</label>
          <input type="range" min={14} max={45} value={grenzsteuersatz} onChange={e => setGrenzsteuersatz(+e.target.value)} className="w-full accent-primary" />
        </CardContent>
      </Card>

      {/* Ergebnis-Banner */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Card className="border-primary/30">
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-primary">{ergebnis.gesamtWK.toLocaleString('de-DE')} EUR</p>
            <p className="text-xs text-muted-foreground mt-1">Werbungskosten</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{ergebnis.pauschbetrag.toLocaleString('de-DE')} EUR</p>
            <p className="text-xs text-muted-foreground mt-1">Pauschbetrag</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className={`text-2xl font-bold ${ergebnis.ueberPauschbetrag ? 'text-green-600' : 'text-muted-foreground'}`}>
              {ergebnis.mehrAbzug.toLocaleString('de-DE')} EUR
            </p>
            <p className="text-xs text-muted-foreground mt-1">Mehr-Abzug</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-950/30">
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">{ergebnis.steuerersparnis.toLocaleString('de-DE')} EUR</p>
            <p className="text-xs text-muted-foreground mt-1">Steuerersparnis</p>
          </CardContent>
        </Card>
      </div>

      {!ergebnis.ueberPauschbetrag && (
        <Card className="border-orange-300 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/30">
          <CardContent className="pt-4">
            <p className="text-sm text-orange-800 dark:text-orange-300">
              Ihre Werbungskosten liegen <strong>unter dem Pauschbetrag</strong> von 1.230 EUR. Der Pauschbetrag wird automatisch beruecksichtigt – kein Einzelnachweis noetig.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Posten */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Werbungskosten-Positionen ({ergebnis.aktiveAnzahl} aktiv)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {posten.map(p => (
            <div key={p.id} className={`rounded-lg border p-3 ${p.aktiv ? '' : 'opacity-50'}`}>
              <div className="flex items-center gap-3">
                <button onClick={() => togglePosten(p.id)}>
                  {p.aktiv ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{p.name}</p>
                    <span className="text-xs text-muted-foreground">{p.kategorie}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{p.info}</p>
                  {p.aktiv && (
                    <div className="mt-2">
                      <input type="range" min={0} max={p.maxBetrag} step={10} value={p.betrag} onChange={e => updateBetrag(p.id, +e.target.value)} className="w-full accent-primary" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{p.betrag.toLocaleString('de-DE')} EUR</span>
                        <span>max. {p.maxBetrag.toLocaleString('de-DE')} EUR</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {ergebnis.chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Werbungskosten nach Kategorie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ergebnis.chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `${v} EUR`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} />
                  <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR`} />
                  <Legend />
                  <Bar dataKey="betrag" name="Betrag" fill="#7c3aed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
