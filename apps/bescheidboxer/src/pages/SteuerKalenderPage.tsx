import { useMemo } from 'react'
import {
  CalendarDays,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Euro,
  FileText,
  ShieldAlert,
  BookOpen,
} from 'lucide-react'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'

interface SteuerTermin {
  id: string
  monat: number
  tag: number
  titel: string
  beschreibung: string
  kategorie: 'abgabe' | 'zahlung' | 'frist' | 'info'
  wichtig: boolean
}

const STEUER_TERMINE_2026: SteuerTermin[] = [
  { id: 't01', monat: 1, tag: 10, titel: 'Lohnsteueranmeldung Dezember', beschreibung: 'Monatliche Lohnsteueranmeldung fuer Dezember 2025', kategorie: 'abgabe', wichtig: false },
  { id: 't02', monat: 2, tag: 10, titel: 'Lohnsteueranmeldung Januar', beschreibung: 'Monatliche Lohnsteueranmeldung fuer Januar 2026', kategorie: 'abgabe', wichtig: false },
  { id: 't03', monat: 2, tag: 10, titel: 'USt-Voranmeldung Januar', beschreibung: 'Umsatzsteuer-Voranmeldung fuer Januar 2026', kategorie: 'abgabe', wichtig: false },
  { id: 't04', monat: 2, tag: 28, titel: 'Grundsteuer 1. Rate', beschreibung: 'Erste Vierteljahresrate Grundsteuer', kategorie: 'zahlung', wichtig: true },
  { id: 't05', monat: 3, tag: 10, titel: 'USt-Voranmeldung Februar', beschreibung: 'Umsatzsteuer-Voranmeldung fuer Februar 2026', kategorie: 'abgabe', wichtig: false },
  { id: 't06', monat: 3, tag: 10, titel: 'GewSt-Vorauszahlung Q1', beschreibung: 'Gewerbesteuer-Vorauszahlung 1. Quartal', kategorie: 'zahlung', wichtig: true },
  { id: 't07', monat: 3, tag: 10, titel: 'ESt-Vorauszahlung Q1', beschreibung: 'Einkommensteuer-Vorauszahlung 1. Quartal', kategorie: 'zahlung', wichtig: true },
  { id: 't08', monat: 5, tag: 15, titel: 'Grundsteuer 2. Rate', beschreibung: 'Zweite Vierteljahresrate Grundsteuer', kategorie: 'zahlung', wichtig: true },
  { id: 't09', monat: 6, tag: 10, titel: 'ESt-Vorauszahlung Q2', beschreibung: 'Einkommensteuer-Vorauszahlung 2. Quartal', kategorie: 'zahlung', wichtig: true },
  { id: 't10', monat: 6, tag: 10, titel: 'GewSt-Vorauszahlung Q2', beschreibung: 'Gewerbesteuer-Vorauszahlung 2. Quartal', kategorie: 'zahlung', wichtig: true },
  { id: 't11', monat: 7, tag: 31, titel: 'Steuererklaerung 2025 (ohne Berater)', beschreibung: 'Abgabefrist fuer Steuererklaerung 2025 ohne Steuerberater', kategorie: 'frist', wichtig: true },
  { id: 't12', monat: 8, tag: 15, titel: 'Grundsteuer 3. Rate', beschreibung: 'Dritte Vierteljahresrate Grundsteuer', kategorie: 'zahlung', wichtig: true },
  { id: 't13', monat: 9, tag: 10, titel: 'ESt-Vorauszahlung Q3', beschreibung: 'Einkommensteuer-Vorauszahlung 3. Quartal', kategorie: 'zahlung', wichtig: true },
  { id: 't14', monat: 9, tag: 10, titel: 'GewSt-Vorauszahlung Q3', beschreibung: 'Gewerbesteuer-Vorauszahlung 3. Quartal', kategorie: 'zahlung', wichtig: true },
  { id: 't15', monat: 11, tag: 15, titel: 'Grundsteuer 4. Rate', beschreibung: 'Vierte Vierteljahresrate Grundsteuer', kategorie: 'zahlung', wichtig: true },
  { id: 't16', monat: 12, tag: 10, titel: 'ESt-Vorauszahlung Q4', beschreibung: 'Einkommensteuer-Vorauszahlung 4. Quartal', kategorie: 'zahlung', wichtig: true },
  { id: 't17', monat: 12, tag: 10, titel: 'GewSt-Vorauszahlung Q4', beschreibung: 'Gewerbesteuer-Vorauszahlung 4. Quartal', kategorie: 'zahlung', wichtig: true },
]

const MONATE = [
  'Januar', 'Februar', 'Maerz', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

const KATEGORIE_CONFIG = {
  abgabe: { icon: FileText, farbe: 'text-fintutto-blue-500', bg: 'bg-fintutto-blue-100 dark:bg-fintutto-blue-900/40', label: 'Abgabe' },
  zahlung: { icon: Euro, farbe: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/40', label: 'Zahlung' },
  frist: { icon: ShieldAlert, farbe: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/40', label: 'Frist' },
  info: { icon: BookOpen, farbe: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800/40', label: 'Info' },
}

export default function SteuerKalenderPage() {
  const now = new Date()
  const currentMonth = now.getMonth() + 1 // 1-based
  const currentDay = now.getDate()

  // Group by month
  const grouped = useMemo(() => {
    const byMonth: Record<number, SteuerTermin[]> = {}
    STEUER_TERMINE_2026.forEach(t => {
      if (!byMonth[t.monat]) byMonth[t.monat] = []
      byMonth[t.monat].push(t)
    })
    return byMonth
  }, [])

  // Stats
  const vergangen = STEUER_TERMINE_2026.filter(t =>
    t.monat < currentMonth || (t.monat === currentMonth && t.tag < currentDay)
  ).length
  const kommend = STEUER_TERMINE_2026.length - vergangen
  const naechster = STEUER_TERMINE_2026.find(t =>
    t.monat > currentMonth || (t.monat === currentMonth && t.tag >= currentDay)
  )
  const zahlungen = STEUER_TERMINE_2026.filter(t => t.kategorie === 'zahlung').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <CalendarDays className="h-8 w-8" />
          Steuerkalender 2026
        </h1>
        <p className="text-muted-foreground mt-1">
          Alle wichtigen Steuertermine und Fristen im Ueberblick
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold">{STEUER_TERMINE_2026.length}</p>
            <p className="text-xs text-muted-foreground">Termine gesamt</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{vergangen}</p>
            <p className="text-xs text-muted-foreground">Vergangen</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{kommend}</p>
            <p className="text-xs text-muted-foreground">Kommend</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{zahlungen}</p>
            <p className="text-xs text-muted-foreground">Zahlungstermine</p>
          </CardContent>
        </Card>
      </div>

      {/* Naechster Termin */}
      {naechster && (
        <Card className="border-l-4 border-l-primary">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-primary/10 p-3">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Naechster Termin</p>
                <p className="font-semibold text-lg">{naechster.titel}</p>
                <p className="text-sm text-muted-foreground">{naechster.beschreibung}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">
                  {naechster.tag}. {MONATE[naechster.monat - 1]}
                </p>
                <Badge variant="outline" className="text-xs">
                  {KATEGORIE_CONFIG[naechster.kategorie].label}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kalender nach Monat */}
      <div className="space-y-6">
        {Object.entries(grouped)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([monat, termine]) => {
            const monatNum = parseInt(monat)
            const istVergangen = monatNum < currentMonth
            const istAktuell = monatNum === currentMonth

            return (
              <div key={monat}>
                <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
                  istAktuell ? 'text-primary' : istVergangen ? 'text-muted-foreground' : ''
                }`}>
                  {istAktuell && <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
                  {MONATE[monatNum - 1]} 2026
                  <Badge variant="secondary" className="text-[10px]">{termine.length}</Badge>
                  {istVergangen && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 ml-1" />
                  )}
                </h3>

                <div className="space-y-2">
                  {termine.map(termin => {
                    const cfg = KATEGORIE_CONFIG[termin.kategorie]
                    const Icon = cfg.icon
                    const istVergangenTermin = monatNum < currentMonth ||
                      (monatNum === currentMonth && termin.tag < currentDay)

                    return (
                      <div
                        key={termin.id}
                        className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                          istVergangenTermin
                            ? 'border-border/40 opacity-60'
                            : 'border-border hover:border-primary/30'
                        }`}
                      >
                        <div className="text-center w-12 shrink-0">
                          <p className={`text-lg font-bold ${istVergangenTermin ? 'text-muted-foreground' : ''}`}>
                            {termin.tag}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {MONATE[monatNum - 1].slice(0, 3)}
                          </p>
                        </div>

                        <div className={`rounded-lg ${cfg.bg} p-2 shrink-0`}>
                          <Icon className={`h-4 w-4 ${cfg.farbe}`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-medium ${istVergangenTermin ? 'line-through text-muted-foreground' : ''}`}>
                              {termin.titel}
                            </p>
                            {termin.wichtig && !istVergangenTermin && (
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {termin.beschreibung}
                          </p>
                        </div>

                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {cfg.label}
                        </Badge>

                        {istVergangenTermin && (
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}
