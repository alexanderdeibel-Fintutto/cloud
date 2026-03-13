import { useState } from 'react'
import { Card, CardContent } from '../components/ui/card'
import { Send, CheckCircle2, Clock, XCircle, AlertTriangle, ChevronDown, ChevronRight, RefreshCw, FileText, Calendar } from 'lucide-react'

interface ElsterUebermittlung {
  id: string
  typ: string
  zeitraum: string
  gesendetAm: string
  status: 'gesendet' | 'angenommen' | 'abgelehnt' | 'in_bearbeitung'
  transferticket?: string
  rueckmeldung?: string
  bescheidDatum?: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  gesendet: { label: 'Gesendet', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: Send },
  angenommen: { label: 'Angenommen', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle2 },
  abgelehnt: { label: 'Abgelehnt', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: XCircle },
  in_bearbeitung: { label: 'In Bearbeitung', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: Clock },
}

const DEMO_UEBERMITTLUNGEN: ElsterUebermittlung[] = [
  { id: 'e-1', typ: 'USt-Voranmeldung', zeitraum: 'Januar 2026', gesendetAm: '2026-02-09T14:23:00', status: 'angenommen', transferticket: 'ET2026020914230001', rueckmeldung: 'Erfolgreich übermittelt und verarbeitet.' },
  { id: 'e-2', typ: 'USt-Voranmeldung', zeitraum: 'Dezember 2025', gesendetAm: '2026-01-08T09:15:00', status: 'angenommen', transferticket: 'ET2026010809150001', rueckmeldung: 'Erfolgreich übermittelt und verarbeitet.' },
  { id: 'e-3', typ: 'Einkommensteuererklärung', zeitraum: '2024', gesendetAm: '2025-12-20T16:45:00', status: 'angenommen', transferticket: 'ET2025122016450001', rueckmeldung: 'Steuerbescheid wird erstellt.', bescheidDatum: '2026-02-15' },
  { id: 'e-4', typ: 'Lohnsteuer-Anmeldung', zeitraum: 'Januar 2026', gesendetAm: '2026-02-10T08:30:00', status: 'angenommen', transferticket: 'ET2026021008300001' },
  { id: 'e-5', typ: 'Gewerbesteuererklärung', zeitraum: '2024', gesendetAm: '2025-11-15T11:00:00', status: 'in_bearbeitung', transferticket: 'ET2025111511000001', rueckmeldung: 'Wird vom Finanzamt bearbeitet.' },
  { id: 'e-6', typ: 'USt-Voranmeldung', zeitraum: 'November 2025', gesendetAm: '2025-12-09T10:20:00', status: 'abgelehnt', transferticket: 'ET2025120910200001', rueckmeldung: 'Fehler: Ungültige Steuernummer. Bitte korrigieren und erneut senden.' },
  { id: 'e-7', typ: 'Feststellungserklärung Grundsteuer', zeitraum: '2022', gesendetAm: '2025-06-30T15:00:00', status: 'angenommen', transferticket: 'ET2025063015000001', rueckmeldung: 'Grundsteuerwertbescheid erlassen.', bescheidDatum: '2025-09-20' },
  { id: 'e-8', typ: 'USt-Voranmeldung', zeitraum: 'Februar 2026', gesendetAm: '2026-02-18T09:00:00', status: 'gesendet', transferticket: 'ET2026021809000001' },
]

export default function ELSTERStatusPage() {
  const [filterStatus, setFilterStatus] = useState<string>('alle')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = filterStatus === 'alle'
    ? DEMO_UEBERMITTLUNGEN
    : DEMO_UEBERMITTLUNGEN.filter(u => u.status === filterStatus)

  const stats = {
    gesamt: DEMO_UEBERMITTLUNGEN.length,
    angenommen: DEMO_UEBERMITTLUNGEN.filter(u => u.status === 'angenommen').length,
    offen: DEMO_UEBERMITTLUNGEN.filter(u => u.status === 'gesendet' || u.status === 'in_bearbeitung').length,
    abgelehnt: DEMO_UEBERMITTLUNGEN.filter(u => u.status === 'abgelehnt').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ELSTER-Status</h1>
          <p className="text-muted-foreground mt-1">
            Übermittlungsstatus Ihrer elektronischen Steuererklärungen
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
          <RefreshCw className="h-4 w-4" />
          Status aktualisieren
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Gesamt</p><p className="text-2xl font-bold mt-1">{stats.gesamt}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Angenommen</p><p className="text-2xl font-bold mt-1 text-green-600">{stats.angenommen}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Offen</p><p className="text-2xl font-bold mt-1 text-yellow-600">{stats.offen}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Abgelehnt</p><p className="text-2xl font-bold mt-1 text-red-600">{stats.abgelehnt}</p></CardContent></Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {[{ key: 'alle', label: 'Alle' }, { key: 'gesendet', label: 'Gesendet' }, { key: 'angenommen', label: 'Angenommen' }, { key: 'in_bearbeitung', label: 'In Bearbeitung' }, { key: 'abgelehnt', label: 'Abgelehnt' }].map(f => (
          <button key={f.key} onClick={() => setFilterStatus(f.key)} className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${filterStatus === f.key ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border hover:border-primary/50'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {filtered.map(uebermittlung => {
          const isExpanded = expandedId === uebermittlung.id
          const sConf = STATUS_CONFIG[uebermittlung.status]
          const SIcon = sConf.icon

          return (
            <Card key={uebermittlung.id} className={uebermittlung.status === 'abgelehnt' ? 'border-red-200 dark:border-red-900' : ''}>
              <div className="p-4 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setExpandedId(isExpanded ? null : uebermittlung.id)}>
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${sConf.color}`}>
                    <SIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-sm">{uebermittlung.typ}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${sConf.color}`}>{sConf.label}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{uebermittlung.zeitraum}</span>
                      <span>Gesendet: {new Date(uebermittlung.gesendetAm).toLocaleString('de-DE')}</span>
                    </div>
                  </div>
                  {uebermittlung.status === 'abgelehnt' && <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />}
                  {isExpanded ? <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" /> : <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t px-4 pb-4 pt-3 space-y-2 text-sm">
                  {uebermittlung.transferticket && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Transferticket:</span>
                      <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{uebermittlung.transferticket}</code>
                    </div>
                  )}
                  {uebermittlung.rueckmeldung && (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                        <FileText className="h-3 w-3" /> Rückmeldung
                      </p>
                      <p>{uebermittlung.rueckmeldung}</p>
                    </div>
                  )}
                  {uebermittlung.bescheidDatum && (
                    <p className="text-xs text-muted-foreground">
                      Bescheid erstellt am: {new Date(uebermittlung.bescheidDatum).toLocaleDateString('de-DE')}
                    </p>
                  )}
                  {uebermittlung.status === 'abgelehnt' && (
                    <button className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                      Korrigiert erneut senden
                    </button>
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
