import { useState } from 'react'
import { Card, CardContent } from '../components/ui/card'
import { Shield, Clock, CheckCircle2, XCircle, AlertTriangle, FileText, ChevronDown, ChevronRight, Calendar, Send, Eye, MessageSquare } from 'lucide-react'

interface WiderspruchCase {
  id: string
  bescheidTyp: string
  aktenzeichen: string
  finanzamt: string
  eingereichtAm: string
  status: 'eingereicht' | 'in_bearbeitung' | 'beschieden' | 'zurueckgezogen'
  ergebnis?: 'stattgegeben' | 'teilweise' | 'abgelehnt'
  betrag: number
  beantragteBetrag?: number
  timeline: TimelineEvent[]
}

interface TimelineEvent {
  id: string
  datum: string
  typ: 'einreichung' | 'bestaetigung' | 'rueckfrage' | 'stellungnahme' | 'bescheid' | 'info'
  titel: string
  beschreibung: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  eingereicht: { label: 'Eingereicht', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: Send },
  in_bearbeitung: { label: 'In Bearbeitung', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: Clock },
  beschieden: { label: 'Beschieden', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle2 },
  zurueckgezogen: { label: 'Zurückgezogen', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300', icon: XCircle },
}

const ERGEBNIS_CONFIG: Record<string, { label: string; color: string }> = {
  stattgegeben: { label: 'Stattgegeben', color: 'text-green-600' },
  teilweise: { label: 'Teilweise stattgegeben', color: 'text-yellow-600' },
  abgelehnt: { label: 'Abgelehnt', color: 'text-red-600' },
}

const TIMELINE_ICONS: Record<string, React.ElementType> = {
  einreichung: Send,
  bestaetigung: CheckCircle2,
  rueckfrage: MessageSquare,
  stellungnahme: FileText,
  bescheid: Shield,
  info: Eye,
}

const DEMO_CASES: WiderspruchCase[] = [
  {
    id: 'w-001',
    bescheidTyp: 'Einkommensteuer 2024',
    aktenzeichen: 'AZ 123/456/78901',
    finanzamt: 'Finanzamt Köln-Mitte',
    eingereichtAm: '2025-09-15',
    status: 'in_bearbeitung',
    betrag: 4850,
    beantragteBetrag: 1200,
    timeline: [
      { id: 't1', datum: '2025-09-15', typ: 'einreichung', titel: 'Einspruch eingereicht', beschreibung: 'Einspruch per ELSTER übermittelt. Begründung: Fehlerhafte Berücksichtigung der Werbungskosten.' },
      { id: 't2', datum: '2025-09-22', typ: 'bestaetigung', titel: 'Eingangsbestätigung', beschreibung: 'Finanzamt Köln-Mitte bestätigt den Eingang des Einspruchs.' },
      { id: 't3', datum: '2025-11-03', typ: 'rueckfrage', titel: 'Rückfrage Finanzamt', beschreibung: 'Bitte um Nachreichung der Belege für Fahrtkosten und Arbeitsmittel.' },
      { id: 't4', datum: '2025-11-10', typ: 'stellungnahme', titel: 'Belege eingereicht', beschreibung: '12 Belege per Post nachgereicht. Einschreiben-Rückschein erhalten.' },
      { id: 't5', datum: '2026-01-15', typ: 'info', titel: 'Bearbeitungshinweis', beschreibung: 'Finanzamt teilt mit, dass die Bearbeitung voraussichtlich bis Ende Q1/2026 dauert.' },
    ],
  },
  {
    id: 'w-002',
    bescheidTyp: 'Grundsteuer 2025',
    aktenzeichen: 'AZ 987/654/32100',
    finanzamt: 'Finanzamt Düsseldorf-Nord',
    eingereichtAm: '2025-06-01',
    status: 'beschieden',
    ergebnis: 'stattgegeben',
    betrag: 890,
    beantragteBetrag: 340,
    timeline: [
      { id: 't1', datum: '2025-06-01', typ: 'einreichung', titel: 'Einspruch eingereicht', beschreibung: 'Widerspruch gegen Grundsteuerwertbescheid. Bodenrichtwert fehlerhaft angesetzt.' },
      { id: 't2', datum: '2025-06-08', typ: 'bestaetigung', titel: 'Eingangsbestätigung', beschreibung: 'Eingang bestätigt. Ruhen des Verfahrens gemäß BFH angeboten.' },
      { id: 't3', datum: '2025-08-20', typ: 'stellungnahme', titel: 'Gutachten vorgelegt', beschreibung: 'Unabhängiges Gutachten zum Bodenwert eingereicht.' },
      { id: 't4', datum: '2025-10-15', typ: 'bescheid', titel: 'Abhilfebescheid', beschreibung: 'Finanzamt gibt dem Einspruch statt. Neuer Grundsteuerwertbescheid wird erlassen. Erstattung: 550 €.' },
    ],
  },
  {
    id: 'w-003',
    bescheidTyp: 'Gewerbesteuer 2024',
    aktenzeichen: 'AZ 555/111/22233',
    finanzamt: 'Finanzamt Essen-Süd',
    eingereichtAm: '2025-12-01',
    status: 'eingereicht',
    betrag: 12400,
    beantragteBetrag: 3200,
    timeline: [
      { id: 't1', datum: '2025-12-01', typ: 'einreichung', titel: 'Einspruch eingereicht', beschreibung: 'Gewerbesteuer-Messbetrag zu hoch angesetzt. Hinzurechnungen nach § 8 GewStG fehlerhaft.' },
      { id: 't2', datum: '2025-12-10', typ: 'bestaetigung', titel: 'Eingangsbestätigung', beschreibung: 'Finanzamt bestätigt Eingang und Aussetzung der Vollziehung gewährt.' },
    ],
  },
  {
    id: 'w-004',
    bescheidTyp: 'Umsatzsteuer 2023',
    aktenzeichen: 'AZ 777/888/99900',
    finanzamt: 'Finanzamt Bonn-Innenstadt',
    eingereichtAm: '2025-03-15',
    status: 'beschieden',
    ergebnis: 'abgelehnt',
    betrag: 6700,
    beantragteBetrag: 2100,
    timeline: [
      { id: 't1', datum: '2025-03-15', typ: 'einreichung', titel: 'Einspruch eingereicht', beschreibung: 'Vorsteuerabzug wurde teilweise nicht anerkannt.' },
      { id: 't2', datum: '2025-03-22', typ: 'bestaetigung', titel: 'Eingangsbestätigung', beschreibung: 'Eingang bestätigt.' },
      { id: 't3', datum: '2025-05-10', typ: 'rueckfrage', titel: 'Rückfrage Finanzamt', beschreibung: 'Anforderung der Originalrechnungen mit ausgewiesener Umsatzsteuer.' },
      { id: 't4', datum: '2025-05-20', typ: 'stellungnahme', titel: 'Belege nachgereicht', beschreibung: 'Rechnungskopien eingereicht.' },
      { id: 't5', datum: '2025-07-30', typ: 'bescheid', titel: 'Einspruchsentscheidung', beschreibung: 'Einspruch wird als unbegründet zurückgewiesen. Klagefrist: 1 Monat.' },
    ],
  },
]

export default function WiderspruchTrackerPage() {
  const [expandedCase, setExpandedCase] = useState<string | null>('w-001')
  const [filterStatus, setFilterStatus] = useState<string>('alle')

  const filteredCases = filterStatus === 'alle'
    ? DEMO_CASES
    : DEMO_CASES.filter(c => c.status === filterStatus)

  const stats = {
    gesamt: DEMO_CASES.length,
    offen: DEMO_CASES.filter(c => c.status === 'eingereicht' || c.status === 'in_bearbeitung').length,
    erfolg: DEMO_CASES.filter(c => c.ergebnis === 'stattgegeben' || c.ergebnis === 'teilweise').length,
    gesamtErsparnis: DEMO_CASES
      .filter(c => c.ergebnis === 'stattgegeben' || c.ergebnis === 'teilweise')
      .reduce((sum, c) => sum + (c.beantragteBetrag || 0), 0),
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Widerspruch-Tracker</h1>
        <p className="text-muted-foreground mt-1">
          Verfolgen Sie den Status Ihrer Einsprüche und Widersprüche in Echtzeit
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Gesamt</p>
            <p className="text-2xl font-bold mt-1">{stats.gesamt}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Offen</p>
            <p className="text-2xl font-bold mt-1 text-yellow-600">{stats.offen}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Erfolgreich</p>
            <p className="text-2xl font-bold mt-1 text-green-600">{stats.erfolg}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Ersparnis</p>
            <p className="text-2xl font-bold mt-1 text-primary">
              {stats.gesamtErsparnis.toLocaleString('de-DE')} €
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'alle', label: 'Alle' },
          { key: 'eingereicht', label: 'Eingereicht' },
          { key: 'in_bearbeitung', label: 'In Bearbeitung' },
          { key: 'beschieden', label: 'Beschieden' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilterStatus(f.key)}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
              filterStatus === f.key
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-muted-foreground border-border hover:border-primary/50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Cases */}
      <div className="space-y-4">
        {filteredCases.map(wCase => {
          const isExpanded = expandedCase === wCase.id
          const statusConf = STATUS_CONFIG[wCase.status]
          const StatusIcon = statusConf.icon

          return (
            <Card key={wCase.id}>
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedCase(isExpanded ? null : wCase.id)}
              >
                <div className={`p-2 rounded-lg ${statusConf.color}`}>
                  <StatusIcon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium">{wCase.bescheidTyp}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusConf.color}`}>
                      {statusConf.label}
                    </span>
                    {wCase.ergebnis && (
                      <span className={`text-xs font-medium ${ERGEBNIS_CONFIG[wCase.ergebnis].color}`}>
                        {ERGEBNIS_CONFIG[wCase.ergebnis].label}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span>{wCase.aktenzeichen}</span>
                    <span>{wCase.finanzamt}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium">{wCase.betrag.toLocaleString('de-DE')} €</p>
                  {wCase.beantragteBetrag && (
                    <p className="text-xs text-muted-foreground">
                      Streitwert: {wCase.beantragteBetrag.toLocaleString('de-DE')} €
                    </p>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                )}
              </div>

              {isExpanded && (
                <div className="border-t px-4 pb-4 pt-2">
                  <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Eingereicht am {new Date(wCase.eingereichtAm).toLocaleDateString('de-DE')}
                  </div>

                  {/* Timeline */}
                  <div className="relative pl-8 space-y-0">
                    {wCase.timeline.map((event, idx) => {
                      const Icon = TIMELINE_ICONS[event.typ] || Eye
                      const isLast = idx === wCase.timeline.length - 1
                      return (
                        <div key={event.id} className="relative pb-6">
                          {/* Vertical line */}
                          {!isLast && (
                            <div className="absolute left-[-20px] top-8 bottom-0 w-px bg-border" />
                          )}
                          {/* Icon */}
                          <div className="absolute left-[-28px] top-1 w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                            <Icon className="h-3 w-3 text-primary" />
                          </div>
                          {/* Content */}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{event.titel}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(event.datum).toLocaleDateString('de-DE')}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{event.beschreibung}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {wCase.status !== 'beschieden' && wCase.status !== 'zurueckgezogen' && (
                    <div className="mt-2 p-3 rounded-lg bg-muted/50 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                      <p className="text-sm text-muted-foreground">
                        Widerspruch ist noch in Bearbeitung. Bei Rückfragen des Finanzamts werden Sie benachrichtigt.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
