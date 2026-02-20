import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { CalendarCheck, Plus, Clock, MapPin, User, Trash2, Video, Phone } from 'lucide-react'

interface Termin {
  id: number
  titel: string
  datum: string
  uhrzeit: string
  dauer: number
  ort: string
  typ: 'praesentiert' | 'video' | 'telefon'
  kontakt: string
  notizen: string
  status: 'anstehend' | 'abgeschlossen' | 'abgesagt'
}

const DEMO_TERMINE: Termin[] = [
  { id: 1, titel: 'Beratungsgespräch Steuererklärung 2025', datum: '2026-03-05', uhrzeit: '10:00', dauer: 60, ort: 'Kanzlei Müller & Partner, Hauptstr. 12', typ: 'praesentiert', kontakt: 'StB Thomas Müller', notizen: 'Unterlagen mitbringen: Lohnsteuerbescheinigung, Spendennachweise', status: 'anstehend' },
  { id: 2, titel: 'Finanzamt-Termin Grundsteuer', datum: '2026-03-12', uhrzeit: '14:30', dauer: 30, ort: 'Finanzamt München II', typ: 'praesentiert', kontakt: 'Sachbearbeiter Hr. Weber', notizen: 'Aktenzeichen: 123/456/78901', status: 'anstehend' },
  { id: 3, titel: 'Jahresabschluss-Besprechung', datum: '2026-03-18', uhrzeit: '09:00', dauer: 90, ort: 'Online (Zoom)', typ: 'video', kontakt: 'StBin Dr. Schneider', notizen: 'BWA und Summen-/Saldenliste vorbereiten', status: 'anstehend' },
  { id: 4, titel: 'Rückfrage USt-Voranmeldung', datum: '2026-02-15', uhrzeit: '11:00', dauer: 15, ort: 'Telefon', typ: 'telefon', kontakt: 'Finanzamt – Frau Becker', notizen: 'Differenz Q4 klären', status: 'abgeschlossen' },
  { id: 5, titel: 'Betriebsprüfung Vorbesprechung', datum: '2026-04-02', uhrzeit: '10:00', dauer: 120, ort: 'Kanzlei Müller & Partner', typ: 'praesentiert', kontakt: 'StB Thomas Müller', notizen: 'Prüfungszeitraum 2022-2024', status: 'anstehend' },
  { id: 6, titel: 'Einspruch-Termin Grunderwerbsteuer', datum: '2026-01-20', uhrzeit: '15:00', dauer: 45, ort: 'Finanzamt Berlin-Mitte', typ: 'praesentiert', kontakt: 'RA Dr. Hoffmann', notizen: 'Kaufvertrag und Gutachten mitnehmen', status: 'abgesagt' },
]

const TYP_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  praesentiert: { label: 'Vor Ort', icon: MapPin, color: 'text-blue-600' },
  video: { label: 'Video', icon: Video, color: 'text-purple-600' },
  telefon: { label: 'Telefon', icon: Phone, color: 'text-green-600' },
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  anstehend: { label: 'Anstehend', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
  abgeschlossen: { label: 'Erledigt', bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' },
  abgesagt: { label: 'Abgesagt', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' },
}

export default function SteuerTerminPage() {
  const [termine, setTermine] = useState<Termin[]>(DEMO_TERMINE)
  const [filter, setFilter] = useState<string>('alle')
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const filtered = termine
    .filter(t => filter === 'alle' || t.status === filter)
    .sort((a, b) => a.datum.localeCompare(b.datum))

  const anstehend = termine.filter(t => t.status === 'anstehend').length
  const naechster = termine
    .filter(t => t.status === 'anstehend')
    .sort((a, b) => a.datum.localeCompare(b.datum))[0]

  const handleDelete = (id: number) => {
    setTermine(prev => prev.filter(t => t.id !== id))
  }

  const handleStatusChange = (id: number, status: Termin['status']) => {
    setTermine(prev => prev.map(t => t.id === id ? { ...t, status } : t))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarCheck className="h-6 w-6 text-blue-500" />
            Steuer-Termine
          </h1>
          <p className="text-muted-foreground mt-1">
            Beratungstermine, Finanzamt-Besuche und Fristen verwalten
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Neuer Termin
        </button>
      </div>

      {/* KPIs */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Anstehende Termine</p>
            <p className="text-3xl font-bold text-blue-600">{anstehend}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Nächster Termin</p>
            <p className="text-lg font-bold">
              {naechster ? new Date(naechster.datum).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
            </p>
            {naechster && <p className="text-xs text-muted-foreground mt-0.5">{naechster.titel}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Gesamt</p>
            <p className="text-3xl font-bold">{termine.length}</p>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Neuer Termin (Demo)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              In der Vollversion können Sie hier neue Termine anlegen, Erinnerungen setzen und
              Kalender-Synchronisation (iCal/Google) nutzen.
            </p>
            <a
              href="https://portal.fintutto.cloud/termine"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm text-primary hover:underline"
            >
              Zum Portal →
            </a>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['alle', 'anstehend', 'abgeschlossen', 'abgesagt'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
              filter === f ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 border-border hover:bg-muted'
            }`}
          >
            {f === 'alle' ? 'Alle' : STATUS_CONFIG[f]?.label || f}
          </button>
        ))}
      </div>

      {/* Termin-Liste */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-sm text-muted-foreground">
              Keine Termine mit diesem Filter gefunden.
            </CardContent>
          </Card>
        ) : (
          filtered.map(t => {
            const typConfig = TYP_CONFIG[t.typ]
            const statusConfig = STATUS_CONFIG[t.status]
            const TypIcon = typConfig.icon
            const isExpanded = expandedId === t.id

            return (
              <Card key={t.id} className="overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : t.id)}
                  className="w-full text-left"
                >
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`mt-0.5 rounded-lg p-2 bg-muted/50`}>
                          <TypIcon className={`h-4 w-4 ${typConfig.color}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-sm">{t.titel}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                              {statusConfig.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(t.datum).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: 'short' })} · {t.uhrzeit} Uhr · {t.dauer} min
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {t.kontakt}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{typConfig.label}</span>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t space-y-3">
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          <span>{t.ort}</span>
                        </div>
                        {t.notizen && (
                          <div className="rounded-lg bg-muted/50 p-3 text-sm">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Notizen</p>
                            {t.notizen}
                          </div>
                        )}
                        <div className="flex gap-2 flex-wrap">
                          {t.status === 'anstehend' && (
                            <button
                              onClick={e => { e.stopPropagation(); handleStatusChange(t.id, 'abgeschlossen') }}
                              className="rounded-lg bg-green-600 px-3 py-1.5 text-xs text-white hover:bg-green-700 transition-colors"
                            >
                              Als erledigt markieren
                            </button>
                          )}
                          {t.status === 'anstehend' && (
                            <button
                              onClick={e => { e.stopPropagation(); handleStatusChange(t.id, 'abgesagt') }}
                              className="rounded-lg bg-muted px-3 py-1.5 text-xs hover:bg-muted/80 transition-colors"
                            >
                              Absagen
                            </button>
                          )}
                          <button
                            onClick={e => { e.stopPropagation(); handleDelete(t.id) }}
                            className="rounded-lg bg-red-100 dark:bg-red-900/30 px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            Löschen
                          </button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </button>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
