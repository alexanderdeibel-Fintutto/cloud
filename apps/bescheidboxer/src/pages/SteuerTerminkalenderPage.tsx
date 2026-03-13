import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { CalendarDays, Info, AlertTriangle, CheckCircle2 } from 'lucide-react'

interface Termin {
  datum: string
  titel: string
  beschreibung: string
  kategorie: 'est' | 'ust' | 'gst' | 'fristen' | 'sonstig'
  wichtig?: boolean
}

const TERMINE_2025: Termin[] = [
  // Q1
  { datum: '10.01.2025', titel: 'USt-VA + LSt Dezember', beschreibung: 'Umsatzsteuer-Voranmeldung und Lohnsteuer-Anmeldung fuer Dezember 2024', kategorie: 'ust' },
  { datum: '15.01.2025', titel: 'Grundsteuer Q1', beschreibung: 'Grundsteuer 1. Quartal faellig', kategorie: 'gst' },
  { datum: '15.01.2025', titel: 'Gewerbesteuer-VZ', beschreibung: 'Gewerbesteuer-Vorauszahlung Q1', kategorie: 'gst' },
  { datum: '10.02.2025', titel: 'USt-VA + LSt Januar', beschreibung: 'Umsatzsteuer-Voranmeldung und Lohnsteuer-Anmeldung fuer Januar', kategorie: 'ust' },
  { datum: '28.02.2025', titel: 'Lohnsteuerbescheinigung', beschreibung: 'Arbeitgeber muessen elektronische LStB fuer 2024 uebermitteln', kategorie: 'fristen', wichtig: true },
  { datum: '10.03.2025', titel: 'USt-VA + LSt Februar', beschreibung: 'Umsatzsteuer-Voranmeldung und Lohnsteuer-Anmeldung fuer Februar', kategorie: 'ust' },
  { datum: '10.03.2025', titel: 'ESt-VZ Q1', beschreibung: 'Einkommensteuer-Vorauszahlung 1. Quartal', kategorie: 'est', wichtig: true },
  { datum: '10.03.2025', titel: 'KSt-VZ Q1', beschreibung: 'Koerperschaftsteuer-Vorauszahlung 1. Quartal', kategorie: 'est' },

  // Q2
  { datum: '10.04.2025', titel: 'USt-VA + LSt Maerz', beschreibung: 'Umsatzsteuer-Voranmeldung und Lohnsteuer-Anmeldung fuer Maerz', kategorie: 'ust' },
  { datum: '15.04.2025', titel: 'Grundsteuer Q2', beschreibung: 'Grundsteuer 2. Quartal faellig', kategorie: 'gst' },
  { datum: '10.05.2025', titel: 'USt-VA + LSt April', beschreibung: 'Umsatzsteuer-Voranmeldung und Lohnsteuer-Anmeldung fuer April', kategorie: 'ust' },
  { datum: '15.05.2025', titel: 'Gewerbesteuer-VZ Q2', beschreibung: 'Gewerbesteuer-Vorauszahlung Q2', kategorie: 'gst' },
  { datum: '10.06.2025', titel: 'USt-VA + LSt Mai', beschreibung: 'Umsatzsteuer-Voranmeldung und Lohnsteuer-Anmeldung fuer Mai', kategorie: 'ust' },
  { datum: '10.06.2025', titel: 'ESt-VZ Q2', beschreibung: 'Einkommensteuer-Vorauszahlung 2. Quartal', kategorie: 'est', wichtig: true },

  // Q3
  { datum: '10.07.2025', titel: 'USt-VA + LSt Juni', beschreibung: 'Umsatzsteuer-Voranmeldung und Lohnsteuer-Anmeldung fuer Juni', kategorie: 'ust' },
  { datum: '15.07.2025', titel: 'Grundsteuer Q3', beschreibung: 'Grundsteuer 3. Quartal faellig', kategorie: 'gst' },
  { datum: '31.07.2025', titel: 'ESt-Erklaerung 2024 (ohne Berater)', beschreibung: 'Abgabefrist Einkommensteuererklaerung 2024 ohne Steuerberater', kategorie: 'est', wichtig: true },
  { datum: '10.08.2025', titel: 'USt-VA + LSt Juli', beschreibung: 'Umsatzsteuer-Voranmeldung und Lohnsteuer-Anmeldung fuer Juli', kategorie: 'ust' },
  { datum: '15.08.2025', titel: 'Gewerbesteuer-VZ Q3', beschreibung: 'Gewerbesteuer-Vorauszahlung Q3', kategorie: 'gst' },
  { datum: '10.09.2025', titel: 'USt-VA + LSt August', beschreibung: 'Umsatzsteuer-Voranmeldung und Lohnsteuer-Anmeldung fuer August', kategorie: 'ust' },
  { datum: '10.09.2025', titel: 'ESt-VZ Q3', beschreibung: 'Einkommensteuer-Vorauszahlung 3. Quartal', kategorie: 'est', wichtig: true },

  // Q4
  { datum: '10.10.2025', titel: 'USt-VA + LSt September', beschreibung: 'Umsatzsteuer-Voranmeldung und Lohnsteuer-Anmeldung fuer September', kategorie: 'ust' },
  { datum: '15.10.2025', titel: 'Grundsteuer Q4', beschreibung: 'Grundsteuer 4. Quartal faellig', kategorie: 'gst' },
  { datum: '10.11.2025', titel: 'USt-VA + LSt Oktober', beschreibung: 'Umsatzsteuer-Voranmeldung und Lohnsteuer-Anmeldung fuer Oktober', kategorie: 'ust' },
  { datum: '15.11.2025', titel: 'Gewerbesteuer-VZ Q4', beschreibung: 'Gewerbesteuer-Vorauszahlung Q4', kategorie: 'gst' },
  { datum: '10.12.2025', titel: 'USt-VA + LSt November', beschreibung: 'Umsatzsteuer-Voranmeldung und Lohnsteuer-Anmeldung fuer November', kategorie: 'ust' },
  { datum: '10.12.2025', titel: 'ESt-VZ Q4', beschreibung: 'Einkommensteuer-Vorauszahlung 4. Quartal', kategorie: 'est', wichtig: true },
  { datum: '15.12.2025', titel: 'Verlustbescheinigung beantragen', beschreibung: 'Frist: Antrag auf Verlustbescheinigung bei der Bank (Kapitalertraege)', kategorie: 'fristen', wichtig: true },
  { datum: '31.12.2025', titel: 'Freistellungsauftraege pruefen', beschreibung: 'Freistellungsauftraege fuer 2026 anpassen', kategorie: 'sonstig' },
  { datum: '31.12.2025', titel: 'Handwerkerrechnungen bezahlen', beschreibung: 'Zahlungseingang im laufenden Jahr fuer § 35a EStG', kategorie: 'sonstig' },

  // 2026 Fristen
  { datum: '28.02.2026', titel: 'ESt-Erklaerung 2024 (mit Berater)', beschreibung: 'Verlaengerte Abgabefrist bei Steuerberatung (bis 30.04.2026 Sonderfristen moeglich)', kategorie: 'est', wichtig: true },
  { datum: '31.07.2026', titel: 'ESt-Erklaerung 2025 (ohne Berater)', beschreibung: 'Regulaere Abgabefrist Einkommensteuererklaerung 2025', kategorie: 'est', wichtig: true },
]

const KATEGORIE_FARBEN: Record<string, { bg: string; text: string; label: string }> = {
  est: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', label: 'ESt/KSt' },
  ust: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'USt/LSt' },
  gst: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', label: 'GewSt/GrSt' },
  fristen: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Fristen' },
  sonstig: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Sonstig' },
}

export default function SteuerTerminkalenderPage() {
  const [filterKategorie, setFilterKategorie] = useState<string>('alle')
  const [nurWichtig, setNurWichtig] = useState(false)

  const gefiltert = TERMINE_2025
    .filter(t => filterKategorie === 'alle' || t.kategorie === filterKategorie)
    .filter(t => !nurWichtig || t.wichtig)

  // Aktuelles Datum simulieren
  const heute = new Date()
  const parseDate = (d: string) => {
    const [tag, monat, jahr] = d.split('.').map(Number)
    return new Date(jahr, monat - 1, tag)
  }

  const naechsterTermin = TERMINE_2025
    .filter(t => parseDate(t.datum) >= heute)
    .sort((a, b) => parseDate(a.datum).getTime() - parseDate(b.datum).getTime())[0]

  const vergangene = TERMINE_2025.filter(t => parseDate(t.datum) < heute).length
  const kommende = TERMINE_2025.length - vergangene

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-primary" />
          Steuer-Terminkalender 2025/26
        </h1>
        <p className="text-muted-foreground mt-1">
          Alle wichtigen Steuertermine im Ueberblick
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-blue-800 dark:text-blue-200">
              <p><strong>Abgabefristen:</strong> Fallen auf Wochenende/Feiertag → naechster Werktag. <strong>Dauerfristverlaengerung</strong> (USt-VA) = +1 Monat gegen 1/11 Sondervorauszahlung.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Naechster Termin */}
      {naechsterTermin && (
        <Card className="border-orange-300 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-orange-800 dark:text-orange-300">Naechster Termin: {naechsterTermin.datum}</p>
                <p className="text-lg font-bold text-orange-900 dark:text-orange-200">{naechsterTermin.titel}</p>
                <p className="text-xs text-orange-700 dark:text-orange-400">{naechsterTermin.beschreibung}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{TERMINE_2025.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Termine gesamt</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-green-600">{vergangene}</p>
            <p className="text-xs text-muted-foreground mt-1">Erledigt</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-orange-600">{kommende}</p>
            <p className="text-xs text-muted-foreground mt-1">Kommende</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2 mb-3">
            <button onClick={() => setFilterKategorie('alle')} className={`rounded-md px-3 py-1.5 text-xs ${filterKategorie === 'alle' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              Alle
            </button>
            {Object.entries(KATEGORIE_FARBEN).map(([key, val]) => (
              <button key={key} onClick={() => setFilterKategorie(key)} className={`rounded-md px-3 py-1.5 text-xs ${filterKategorie === key ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {val.label}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={nurWichtig} onChange={e => setNurWichtig(e.target.checked)} className="accent-primary" />
            Nur wichtige Termine anzeigen
          </label>
        </CardContent>
      </Card>

      {/* Terminliste */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Termine ({gefiltert.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {gefiltert.map((t, i) => {
              const vergangen = parseDate(t.datum) < heute
              const farbe = KATEGORIE_FARBEN[t.kategorie]
              return (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${vergangen ? 'opacity-50' : ''} ${t.wichtig ? 'border-l-4 border-orange-500' : ''} hover:bg-muted/50`}>
                  {vergangen ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  ) : (
                    <CalendarDays className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{t.datum}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${farbe.bg} ${farbe.text}`}>{farbe.label}</span>
                      {t.wichtig && <span className="text-xs px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">Wichtig</span>}
                    </div>
                    <p className="text-sm font-medium mt-0.5">{t.titel}</p>
                    <p className="text-xs text-muted-foreground">{t.beschreibung}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Wichtige Fristen-Regeln</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 text-sm">
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium">Steuererklaerungsfristen</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>Ohne Berater: 31. Juli des Folgejahres</li>
                <li>Mit Berater: 28./29. Februar des uebernachsten Jahres</li>
                <li>Freiwillig: 4 Jahre rueckwirkend</li>
              </ul>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium">Verspaetungszuschlag</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>0,25% der festgesetzten Steuer pro Monat</li>
                <li>Mindestens 25 EUR pro Monat</li>
                <li>Ab dem 15. Monat nach Ablauf des VZ</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
