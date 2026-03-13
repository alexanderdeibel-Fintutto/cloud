import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Zap, Plus, Play, Pause, Trash2, Clock, Bell, FileText, CheckCircle2, AlertTriangle, Mail } from 'lucide-react'

interface AutomatisierungsRegel {
  id: string
  name: string
  beschreibung: string
  trigger: string
  triggerTyp: 'frist' | 'status' | 'betrag' | 'zeitplan'
  aktionen: string[]
  aktiv: boolean
  letzteAusfuehrung?: string
  ausfuehrungenGesamt: number
}

const TRIGGER_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  frist: { label: 'Frist-basiert', icon: Clock, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
  status: { label: 'Status-Änderung', icon: CheckCircle2, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  betrag: { label: 'Betrags-Schwelle', icon: AlertTriangle, color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  zeitplan: { label: 'Zeitplan', icon: Clock, color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
}

const DEMO_REGELN: AutomatisierungsRegel[] = [
  {
    id: 'r-1',
    name: 'Frist-Erinnerung 14 Tage',
    beschreibung: 'Sendet eine Erinnerung 14 Tage vor Ablauf einer Einspruchsfrist',
    trigger: '14 Tage vor Fristablauf',
    triggerTyp: 'frist',
    aktionen: ['E-Mail-Benachrichtigung senden', 'Push-Notification erstellen', 'Kalender-Eintrag anlegen'],
    aktiv: true,
    letzteAusfuehrung: '2026-02-10',
    ausfuehrungenGesamt: 23,
  },
  {
    id: 'r-2',
    name: 'Frist-Erinnerung 3 Tage',
    beschreibung: 'Dringende Warnung 3 Tage vor Fristablauf',
    trigger: '3 Tage vor Fristablauf',
    triggerTyp: 'frist',
    aktionen: ['Dringliche E-Mail senden', 'SMS-Benachrichtigung', 'Dashboard-Banner anzeigen'],
    aktiv: true,
    letzteAusfuehrung: '2026-02-15',
    ausfuehrungenGesamt: 12,
  },
  {
    id: 'r-3',
    name: 'Abweichung über 500€',
    beschreibung: 'Markiert Bescheide automatisch zur Prüfung, wenn die Abweichung über 500€ liegt',
    trigger: 'Abweichung > 500 €',
    triggerTyp: 'betrag',
    aktionen: ['Bescheid als "prüfenswert" markieren', 'Einspruch-Entwurf erstellen'],
    aktiv: true,
    letzteAusfuehrung: '2026-02-08',
    ausfuehrungenGesamt: 8,
  },
  {
    id: 'r-4',
    name: 'Monats-Report',
    beschreibung: 'Erstellt jeden 1. des Monats einen automatischen Statusbericht',
    trigger: 'Jeden 1. des Monats um 8:00 Uhr',
    triggerTyp: 'zeitplan',
    aktionen: ['PDF-Bericht generieren', 'Per E-Mail versenden'],
    aktiv: true,
    letzteAusfuehrung: '2026-02-01',
    ausfuehrungenGesamt: 5,
  },
  {
    id: 'r-5',
    name: 'Bescheid-Archivierung',
    beschreibung: 'Archiviert abgeschlossene Bescheide nach 90 Tagen automatisch',
    trigger: 'Status "erledigt" seit 90 Tagen',
    triggerTyp: 'status',
    aktionen: ['In Archiv verschieben', 'Benachrichtigung erstellen'],
    aktiv: false,
    letzteAusfuehrung: '2026-01-15',
    ausfuehrungenGesamt: 14,
  },
  {
    id: 'r-6',
    name: 'Steuervorauszahlung Erinnerung',
    beschreibung: 'Erinnert 7 Tage vor ESt-Vorauszahlungstermin',
    trigger: '7 Tage vor Vorauszahlungstermin',
    triggerTyp: 'zeitplan',
    aktionen: ['E-Mail-Erinnerung senden', 'Betrag in Zahlungsübersicht hervorheben'],
    aktiv: true,
    letzteAusfuehrung: '2026-02-08',
    ausfuehrungenGesamt: 4,
  },
]

const AKTION_ICONS: Record<string, React.ElementType> = {
  'E-Mail': Mail,
  'PDF': FileText,
  'Benachrichtigung': Bell,
  'default': Zap,
}

function getAktionIcon(aktion: string): React.ElementType {
  for (const [key, icon] of Object.entries(AKTION_ICONS)) {
    if (key !== 'default' && aktion.includes(key)) return icon
  }
  return AKTION_ICONS.default
}

export default function AutomatisierungPage() {
  const [regeln, setRegeln] = useState(DEMO_REGELN)
  const [filterTyp, setFilterTyp] = useState<string>('alle')

  const filtered = filterTyp === 'alle' ? regeln : regeln.filter(r => r.triggerTyp === filterTyp)
  const aktiveRegeln = regeln.filter(r => r.aktiv).length
  const gesamtAusfuehrungen = regeln.reduce((s, r) => s + r.ausfuehrungenGesamt, 0)

  const toggleRegel = (id: string) => {
    setRegeln(prev => prev.map(r => r.id === id ? { ...r, aktiv: !r.aktiv } : r))
  }

  const deleteRegel = (id: string) => {
    setRegeln(prev => prev.filter(r => r.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Automatisierung</h1>
          <p className="text-muted-foreground mt-1">
            Automatische Regeln für Fristen, Benachrichtigungen und Workflows
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" />
          Neue Regel
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Regeln gesamt</p>
            <p className="text-2xl font-bold mt-1">{regeln.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Aktiv</p>
            <p className="text-2xl font-bold mt-1 text-green-600">{aktiveRegeln}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Ausführungen</p>
            <p className="text-2xl font-bold mt-1 text-primary">{gesamtAusfuehrungen}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'alle', label: 'Alle' },
          { key: 'frist', label: 'Frist-basiert' },
          { key: 'status', label: 'Status-Änderung' },
          { key: 'betrag', label: 'Betrags-Schwelle' },
          { key: 'zeitplan', label: 'Zeitplan' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilterTyp(f.key)}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
              filterTyp === f.key
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-muted-foreground border-border hover:border-primary/50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Regeln */}
      <div className="space-y-4">
        {filtered.map(regel => {
          const triggerConf = TRIGGER_CONFIG[regel.triggerTyp]
          const TriggerIcon = triggerConf.icon

          return (
            <Card key={regel.id} className={!regel.aktiv ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${triggerConf.color}`}>
                      <TriggerIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {regel.name}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${regel.aktiv ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400'}`}>
                          {regel.aktiv ? 'Aktiv' : 'Inaktiv'}
                        </span>
                      </CardTitle>
                      <CardDescription className="mt-1">{regel.beschreibung}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toggleRegel(regel.id)}
                      className="p-2 rounded-md hover:bg-muted transition-colors"
                      title={regel.aktiv ? 'Deaktivieren' : 'Aktivieren'}
                    >
                      {regel.aktiv ? <Pause className="h-4 w-4 text-yellow-600" /> : <Play className="h-4 w-4 text-green-600" />}
                    </button>
                    <button
                      onClick={() => deleteRegel(regel.id)}
                      className="p-2 rounded-md hover:bg-muted transition-colors"
                      title="Löschen"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Auslöser:</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${triggerConf.color}`}>
                      {regel.trigger}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1.5">Aktionen:</p>
                    <div className="flex flex-wrap gap-2">
                      {regel.aktionen.map((aktion, idx) => {
                        const Icon = getAktionIcon(aktion)
                        return (
                          <span key={idx} className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-muted">
                            <Icon className="h-3 w-3" />
                            {aktion}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 border-t">
                    <span>{regel.ausfuehrungenGesamt} Ausführungen</span>
                    {regel.letzteAusfuehrung && (
                      <span>Zuletzt: {new Date(regel.letzteAusfuehrung).toLocaleDateString('de-DE')}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
