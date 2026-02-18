import { useState, useMemo } from 'react'
import {
  Receipt,
  Euro,
  Zap,
  Droplets,
  Flame,
  Trash2,
  Building2,
  Calendar,
  CheckCircle2,
  Download,
  ChevronDown,
  ChevronUp,
  Calculator,
} from 'lucide-react'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { formatCurrency } from '../lib/utils'

interface Kostenposition {
  id: string
  bezeichnung: string
  icon: typeof Euro
  farbe: string
  bg: string
  gesamtkosten: number
  anteilMieter: number
  vorauszahlung: number
  nachzahlung: number
  schluessel: string
}

interface Abrechnung {
  id: string
  jahr: number
  immobilie: string
  einheit: string
  mieter: string
  zeitraum: string
  status: 'entwurf' | 'versendet' | 'akzeptiert' | 'widerspruch'
  positionen: Kostenposition[]
  gesamtVorauszahlung: number
  gesamtKosten: number
  ergebnis: number // positiv = Nachzahlung, negativ = Guthaben
}

const DEMO_ABRECHNUNGEN: Abrechnung[] = [
  {
    id: 'nk-1',
    jahr: 2025,
    immobilie: 'Musterhaus Berlin',
    einheit: 'Wohnung 3 OG links',
    mieter: 'Max Mustermann',
    zeitraum: '01.01.2025 - 31.12.2025',
    status: 'entwurf',
    gesamtVorauszahlung: 2400,
    gesamtKosten: 2680,
    ergebnis: 280,
    positionen: [
      { id: 'p1', bezeichnung: 'Heizkosten', icon: Flame, farbe: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/40', gesamtkosten: 4200, anteilMieter: 980, vorauszahlung: 900, nachzahlung: 80, schluessel: 'Verbrauch (70%) / Flaeche (30%)' },
      { id: 'p2', bezeichnung: 'Kaltwasser', icon: Droplets, farbe: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/40', gesamtkosten: 1800, anteilMieter: 420, vorauszahlung: 360, nachzahlung: 60, schluessel: 'Verbrauch nach Zaehler' },
      { id: 'p3', bezeichnung: 'Warmwasser', icon: Droplets, farbe: 'text-cyan-500', bg: 'bg-cyan-100 dark:bg-cyan-900/40', gesamtkosten: 2100, anteilMieter: 490, vorauszahlung: 480, nachzahlung: 10, schluessel: 'Verbrauch nach Zaehler' },
      { id: 'p4', bezeichnung: 'Allgemeinstrom', icon: Zap, farbe: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/40', gesamtkosten: 960, anteilMieter: 160, vorauszahlung: 150, nachzahlung: 10, schluessel: 'Wohnflaeche' },
      { id: 'p5', bezeichnung: 'Muellabfuhr', icon: Trash2, farbe: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/40', gesamtkosten: 1440, anteilMieter: 240, vorauszahlung: 200, nachzahlung: 40, schluessel: 'Personenzahl' },
      { id: 'p6', bezeichnung: 'Grundsteuer', icon: Building2, farbe: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/40', gesamtkosten: 2340, anteilMieter: 390, vorauszahlung: 310, nachzahlung: 80, schluessel: 'Wohnflaeche' },
    ],
  },
  {
    id: 'nk-2',
    jahr: 2024,
    immobilie: 'Musterhaus Berlin',
    einheit: 'Wohnung 3 OG links',
    mieter: 'Max Mustermann',
    zeitraum: '01.01.2024 - 31.12.2024',
    status: 'akzeptiert',
    gesamtVorauszahlung: 2400,
    gesamtKosten: 2310,
    ergebnis: -90,
    positionen: [
      { id: 'p1b', bezeichnung: 'Heizkosten', icon: Flame, farbe: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/40', gesamtkosten: 3800, anteilMieter: 890, vorauszahlung: 900, nachzahlung: -10, schluessel: 'Verbrauch (70%) / Flaeche (30%)' },
      { id: 'p2b', bezeichnung: 'Kaltwasser', icon: Droplets, farbe: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/40', gesamtkosten: 1700, anteilMieter: 400, vorauszahlung: 360, nachzahlung: 40, schluessel: 'Verbrauch nach Zaehler' },
      { id: 'p3b', bezeichnung: 'Warmwasser', icon: Droplets, farbe: 'text-cyan-500', bg: 'bg-cyan-100 dark:bg-cyan-900/40', gesamtkosten: 1900, anteilMieter: 440, vorauszahlung: 480, nachzahlung: -40, schluessel: 'Verbrauch nach Zaehler' },
      { id: 'p4b', bezeichnung: 'Allgemeinstrom', icon: Zap, farbe: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/40', gesamtkosten: 900, anteilMieter: 150, vorauszahlung: 150, nachzahlung: 0, schluessel: 'Wohnflaeche' },
      { id: 'p5b', bezeichnung: 'Muellabfuhr', icon: Trash2, farbe: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/40', gesamtkosten: 1380, anteilMieter: 230, vorauszahlung: 200, nachzahlung: 30, schluessel: 'Personenzahl' },
      { id: 'p6b', bezeichnung: 'Grundsteuer', icon: Building2, farbe: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/40', gesamtkosten: 1200, anteilMieter: 200, vorauszahlung: 310, nachzahlung: -110, schluessel: 'Wohnflaeche' },
    ],
  },
]

const STATUS_CONFIG = {
  entwurf: { label: 'Entwurf', color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800' },
  versendet: { label: 'Versendet', color: 'text-fintutto-blue-600 dark:text-fintutto-blue-400', bg: 'bg-fintutto-blue-100 dark:bg-fintutto-blue-900/30' },
  akzeptiert: { label: 'Akzeptiert', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
  widerspruch: { label: 'Widerspruch', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
}

export default function NebenkostenabrechnungPage() {
  const [selectedJahr, setSelectedJahr] = useState<string>('alle')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (selectedJahr === 'alle') return DEMO_ABRECHNUNGEN
    return DEMO_ABRECHNUNGEN.filter(a => a.jahr === parseInt(selectedJahr))
  }, [selectedJahr])

  const totalNachzahlung = DEMO_ABRECHNUNGEN.reduce((s, a) => s + Math.max(0, a.ergebnis), 0)
  const totalGuthaben = DEMO_ABRECHNUNGEN.reduce((s, a) => s + Math.abs(Math.min(0, a.ergebnis)), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Receipt className="h-8 w-8" />
            Nebenkostenabrechnung
          </h1>
          <p className="text-muted-foreground mt-1">
            Betriebskostenabrechnungen erstellen und verwalten
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedJahr} onValueChange={setSelectedJahr}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Jahr" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alle">Alle Jahre</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
            </SelectContent>
          </Select>
          <Button className="gap-2">
            <Calculator className="h-4 w-4" />
            Neue Abrechnung
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold">{DEMO_ABRECHNUNGEN.length}</p>
            <p className="text-xs text-muted-foreground">Abrechnungen</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(totalNachzahlung)}
            </p>
            <p className="text-xs text-muted-foreground">Nachzahlungen</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalGuthaben)}
            </p>
            <p className="text-xs text-muted-foreground">Guthaben</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold">
              {DEMO_ABRECHNUNGEN.filter(a => a.status === 'entwurf').length}
            </p>
            <p className="text-xs text-muted-foreground">Entwuerfe</p>
          </CardContent>
        </Card>
      </div>

      {/* Abrechnungen */}
      {filtered.map(abr => {
        const isExpanded = expandedId === abr.id
        const statusCfg = STATUS_CONFIG[abr.status]
        const isNachzahlung = abr.ergebnis > 0

        return (
          <Card key={abr.id} className="overflow-hidden">
            {/* Header */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : abr.id)}
              className="w-full text-left"
            >
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-muted p-3">
                      <Receipt className="h-6 w-6 text-fintutto-blue-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">NK-Abrechnung {abr.jahr}</h3>
                        <Badge className={`text-[10px] ${statusCfg.bg} ${statusCfg.color} border-0`}>
                          {statusCfg.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {abr.immobilie} &middot; {abr.einheit} &middot; {abr.mieter}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        <Calendar className="inline h-3 w-3 mr-1" />
                        {abr.zeitraum}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`text-lg font-bold ${isNachzahlung ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        {isNachzahlung ? '+' : ''}{formatCurrency(abr.ergebnis)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {isNachzahlung ? 'Nachzahlung' : 'Guthaben'}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardContent>
            </button>

            {/* Expanded Detail */}
            {isExpanded && (
              <div className="border-t border-border">
                {/* Zusammenfassung */}
                <div className="bg-muted/30 px-6 py-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Vorauszahlung</p>
                      <p className="text-lg font-bold">{formatCurrency(abr.gesamtVorauszahlung)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Tatsaechliche Kosten</p>
                      <p className="text-lg font-bold">{formatCurrency(abr.gesamtKosten)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Differenz</p>
                      <p className={`text-lg font-bold ${isNachzahlung ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        {isNachzahlung ? '+' : ''}{formatCurrency(abr.ergebnis)}
                      </p>
                    </div>
                  </div>
                  <Progress
                    value={(abr.gesamtVorauszahlung / abr.gesamtKosten) * 100}
                    className="h-2 mt-3"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1 text-center">
                    Vorauszahlung deckt {((abr.gesamtVorauszahlung / abr.gesamtKosten) * 100).toFixed(0)}% der Kosten
                  </p>
                </div>

                {/* Positionen */}
                <div className="px-6 py-4 space-y-3">
                  <h4 className="text-sm font-semibold">Kostenpositionen</h4>
                  {abr.positionen.map(pos => {
                    const Icon = pos.icon
                    const istNachzahlung = pos.nachzahlung > 0
                    return (
                      <div key={pos.id} className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
                        <div className={`rounded-lg ${pos.bg} p-2 shrink-0`}>
                          <Icon className={`h-4 w-4 ${pos.farbe}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{pos.bezeichnung}</p>
                            <p className={`text-sm font-bold ${istNachzahlung ? 'text-red-600 dark:text-red-400' : pos.nachzahlung < 0 ? 'text-green-600 dark:text-green-400' : ''}`}>
                              {istNachzahlung ? '+' : ''}{formatCurrency(pos.nachzahlung)}
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground mt-0.5">
                            <span>Gesamt: {formatCurrency(pos.gesamtkosten)} &middot; Anteil: {formatCurrency(pos.anteilMieter)} &middot; VZ: {formatCurrency(pos.vorauszahlung)}</span>
                            <span>{pos.schluessel}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Actions */}
                <div className="px-6 py-3 border-t border-border bg-muted/20 flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-3.5 w-3.5" />
                    PDF exportieren
                  </Button>
                  {abr.status === 'entwurf' && (
                    <Button size="sm" className="gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Abrechnung versenden
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}
