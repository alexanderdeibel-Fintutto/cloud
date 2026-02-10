import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import useDocumentTitle from '@/hooks/useDocumentTitle'
import Breadcrumbs from '@/components/Breadcrumbs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ShieldAlert,
  Plus,
  Trash2,
  Clock,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Euro,
  ChevronRight,
  ChevronDown,
  TrendingDown,
  Scale,
  MessageSquare,
  FileText,
  Info,
  Ban,
  Timer,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Sanktion {
  id: string
  grund:
    | 'termin_versaeumt'
    | 'massnahme_abgebrochen'
    | 'mitwirkung_verweigert'
    | 'arbeit_abgelehnt'
    | 'eingliederung_verstoss'
    | 'sonstiges'
  bescheidDatum: string
  startDatum: string
  endeDatum: string
  kuerzungProzent: number
  kuerzungBetrag: number
  status: 'aktiv' | 'widerspruch_eingereicht' | 'aufgehoben' | 'abgelaufen' | 'reduziert'
  aktenzeichen?: string
  notizen: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'bescheidboxer_sanktionen'

const GRUND_LABELS: Record<Sanktion['grund'], string> = {
  termin_versaeumt: 'Termin versaeumt',
  massnahme_abgebrochen: 'Massnahme abgebrochen',
  mitwirkung_verweigert: 'Mitwirkung verweigert',
  arbeit_abgelehnt: 'Arbeit abgelehnt',
  eingliederung_verstoss: 'Eingliederungsvereinbarung-Verstoss',
  sonstiges: 'Sonstiges',
}

const GRUND_OPTIONS: Sanktion['grund'][] = [
  'termin_versaeumt',
  'massnahme_abgebrochen',
  'mitwirkung_verweigert',
  'arbeit_abgelehnt',
  'eingliederung_verstoss',
  'sonstiges',
]

const STATUS_LABELS: Record<Sanktion['status'], string> = {
  aktiv: 'Aktiv',
  widerspruch_eingereicht: 'Widerspruch eingereicht',
  aufgehoben: 'Aufgehoben',
  abgelaufen: 'Abgelaufen',
  reduziert: 'Reduziert',
}

const STATUS_OPTIONS: Sanktion['status'][] = [
  'aktiv',
  'widerspruch_eingereicht',
  'aufgehoben',
  'abgelaufen',
  'reduziert',
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadSanktionen(): Sanktion[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Sanktion[]
  } catch {
    return []
  }
}

function saveSanktionen(entries: Sanktion[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr)
  d.setMonth(d.getMonth() + months)
  return d.toISOString().split('T')[0]
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function daysBetween(from: string, to: string): number {
  const a = new Date(from)
  const b = new Date(to)
  a.setHours(0, 0, 0, 0)
  b.setHours(0, 0, 0, 0)
  return Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

function daysUntil(dateStr: string): number {
  return daysBetween(todayISO(), dateStr)
}

function progressPercent(startDatum: string, endeDatum: string): number {
  const total = daysBetween(startDatum, endeDatum)
  if (total <= 0) return 100
  const elapsed = daysBetween(startDatum, todayISO())
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)))
}

function statusBadgeClasses(status: Sanktion['status']): string {
  switch (status) {
    case 'aktiv':
      return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
    case 'widerspruch_eingereicht':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
    case 'aufgehoben':
      return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
    case 'abgelaufen':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300'
    case 'reduziert':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
  }
}

function grundBadgeClasses(grund: Sanktion['grund']): string {
  switch (grund) {
    case 'termin_versaeumt':
      return 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800'
    case 'massnahme_abgebrochen':
      return 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
    case 'mitwirkung_verweigert':
      return 'bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800'
    case 'arbeit_abgelehnt':
      return 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
    case 'eingliederung_verstoss':
      return 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800'
    case 'sonstiges':
      return 'bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800'
  }
}

/** Auto-expire sanctions that have passed their end date */
function autoExpire(entries: Sanktion[]): Sanktion[] {
  const today = todayISO()
  let changed = false
  const updated = entries.map((s) => {
    if ((s.status === 'aktiv' || s.status === 'widerspruch_eingereicht') && s.endeDatum < today) {
      changed = true
      return { ...s, status: 'abgelaufen' as const }
    }
    return s
  })
  if (changed) saveSanktionen(updated)
  return changed ? updated : entries
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SanktionsTracker() {
  useDocumentTitle('Sanktions-Tracker - BescheidBoxer')

  const [sanktionen, setSanktionen] = useState<Sanktion[]>(() => autoExpire(loadSanktionen()))
  const [showForm, setShowForm] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [statusDropdownId, setStatusDropdownId] = useState<string | null>(null)

  // Form state
  const [formGrund, setFormGrund] = useState<Sanktion['grund']>('termin_versaeumt')
  const [formBescheidDatum, setFormBescheidDatum] = useState('')
  const [formStartDatum, setFormStartDatum] = useState('')
  const [formKuerzungProzent, setFormKuerzungProzent] = useState<10 | 30>(10)
  const [formRegelsatz, setFormRegelsatz] = useState('563')
  const [formAktenzeichen, setFormAktenzeichen] = useState('')
  const [formNotizen, setFormNotizen] = useState('')

  // Auto-expire check on interval
  useEffect(() => {
    const interval = setInterval(() => {
      setSanktionen((prev) => autoExpire(prev))
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Persist helper
  function persist(updated: Sanktion[]) {
    setSanktionen(updated)
    saveSanktionen(updated)
  }

  // Form helpers
  function resetForm() {
    setFormGrund('termin_versaeumt')
    setFormBescheidDatum('')
    setFormStartDatum('')
    setFormKuerzungProzent(10)
    setFormRegelsatz('563')
    setFormAktenzeichen('')
    setFormNotizen('')
  }

  function handleSave() {
    if (!formBescheidDatum || !formStartDatum) return
    const regelsatz = parseFloat(formRegelsatz) || 563
    const betrag = Math.round((regelsatz * formKuerzungProzent) / 100 * 100) / 100

    const entry: Sanktion = {
      id: generateId(),
      grund: formGrund,
      bescheidDatum: formBescheidDatum,
      startDatum: formStartDatum,
      endeDatum: addMonths(formStartDatum, 3),
      kuerzungProzent: formKuerzungProzent,
      kuerzungBetrag: betrag,
      status: 'aktiv',
      aktenzeichen: formAktenzeichen.trim() || undefined,
      notizen: formNotizen.trim(),
    }

    persist(autoExpire([...sanktionen, entry]))
    resetForm()
    setShowForm(false)
  }

  function handleDelete(id: string) {
    persist(sanktionen.filter((s) => s.id !== id))
    setDeleteConfirmId(null)
  }

  function handleStatusChange(id: string, newStatus: Sanktion['status']) {
    persist(sanktionen.map((s) => (s.id === id ? { ...s, status: newStatus } : s)))
    setStatusDropdownId(null)
  }

  // ---------------------------------------------------------------------------
  // Computed
  // ---------------------------------------------------------------------------

  const computed = useMemo(() => {
    const aktive = sanktionen.filter((s) => s.status === 'aktiv' || s.status === 'widerspruch_eingereicht')
    const aktivCount = aktive.length
    const totalMonthlyLoss = aktive.reduce((sum, s) => sum + s.kuerzungBetrag, 0)

    // Next ending sanction
    const activeSorted = [...aktive].sort(
      (a, b) => new Date(a.endeDatum).getTime() - new Date(b.endeDatum).getTime()
    )
    const nextEnding = activeSorted[0]
    const daysToNextEnd = nextEnding ? daysUntil(nextEnding.endeDatum) : null

    return { aktivCount, totalMonthlyLoss, daysToNextEnd }
  }, [sanktionen])

  // Sort: active first (by endeDatum asc), then inactive by endeDatum desc
  const sorted = useMemo(() => {
    return [...sanktionen].sort((a, b) => {
      const aActive = a.status === 'aktiv' || a.status === 'widerspruch_eingereicht'
      const bActive = b.status === 'aktiv' || b.status === 'widerspruch_eingereicht'
      if (aActive && !bActive) return -1
      if (!aActive && bActive) return 1
      if (aActive && bActive) {
        return new Date(a.endeDatum).getTime() - new Date(b.endeDatum).getTime()
      }
      return new Date(b.endeDatum).getTime() - new Date(a.endeDatum).getTime()
    })
  }, [sanktionen])

  // Timeline data
  const timelineEntries = useMemo(() => {
    return [...sanktionen]
      .sort((a, b) => new Date(a.startDatum).getTime() - new Date(b.startDatum).getTime())
  }, [sanktionen])

  // Calculated form preview
  const previewBetrag = useMemo(() => {
    const regelsatz = parseFloat(formRegelsatz) || 563
    return Math.round((regelsatz * formKuerzungProzent) / 100 * 100) / 100
  }, [formRegelsatz, formKuerzungProzent])

  const inputClasses =
    'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'

  return (
    <div className="min-h-screen bg-background">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <Breadcrumbs
            items={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Sanktions-Tracker' },
            ]}
            className="mb-4"
          />
          <div className="flex items-center gap-3 mb-1">
            <ShieldAlert className="h-6 w-6 text-red-500" />
            <h1 className="text-2xl font-bold tracking-tight">Sanktions-Tracker</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Behalte den Ueberblick ueber deine Sanktionen und wehr dich gegen unrechtmaessige Kuerzungen
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* ---------------------------------------------------------------- */}
        {/* Summary Cards                                                    */}
        {/* ---------------------------------------------------------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{computed.aktivCount}</p>
              <p className="text-xs text-muted-foreground">Aktive Sanktionen</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Euro className="h-5 w-5 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {computed.totalMonthlyLoss.toFixed(2).replace('.', ',')} &euro;
              </p>
              <p className="text-xs text-muted-foreground">Monatlicher Verlust</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Timer className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {computed.daysToNextEnd !== null ? `${computed.daysToNextEnd} Tage` : '--'}
              </p>
              <p className="text-xs text-muted-foreground">Bis naechste Sanktion endet</p>
            </CardContent>
          </Card>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Add Button                                                       */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => setShowForm(!showForm)}
            className="gap-2"
            variant={showForm ? 'outline' : 'default'}
          >
            <Plus className="h-4 w-4" />
            {showForm ? 'Formular schliessen' : 'Neue Sanktion erfassen'}
          </Button>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Add Form                                                         */}
        {/* ---------------------------------------------------------------- */}
        {showForm && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-red-500" />
                Neue Sanktion erfassen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Grund */}
                <div>
                  <Label className="block mb-1">Sanktionsgrund *</Label>
                  <select
                    value={formGrund}
                    onChange={(e) => {
                      const val = e.target.value as Sanktion['grund']
                      setFormGrund(val)
                      if (val === 'termin_versaeumt') {
                        setFormKuerzungProzent(10)
                      } else {
                        setFormKuerzungProzent(30)
                      }
                    }}
                    className={inputClasses}
                  >
                    {GRUND_OPTIONS.map((g) => (
                      <option key={g} value={g}>
                        {GRUND_LABELS[g]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bescheid-Datum */}
                <div>
                  <Label className="block mb-1">
                    <Calendar className="inline h-3.5 w-3.5 mr-1" />
                    Bescheid-Datum *
                  </Label>
                  <Input
                    type="date"
                    value={formBescheidDatum}
                    onChange={(e) => setFormBescheidDatum(e.target.value)}
                    max={todayISO()}
                  />
                </div>

                {/* Start-Datum */}
                <div>
                  <Label className="block mb-1">
                    <Calendar className="inline h-3.5 w-3.5 mr-1" />
                    Start-Datum (Beginn der Kuerzung) *
                  </Label>
                  <Input
                    type="date"
                    value={formStartDatum}
                    onChange={(e) => setFormStartDatum(e.target.value)}
                  />
                </div>

                {/* Kuerzung Prozent */}
                <div>
                  <Label className="block mb-1">Kuerzung</Label>
                  <div className="flex gap-4 mt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="kuerzung"
                        checked={formKuerzungProzent === 10}
                        onChange={() => setFormKuerzungProzent(10)}
                        className="accent-primary"
                      />
                      <span className="text-sm">10% (Termin versaeumt)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="kuerzung"
                        checked={formKuerzungProzent === 30}
                        onChange={() => setFormKuerzungProzent(30)}
                        className="accent-primary"
                      />
                      <span className="text-sm">30% (Pflichtverletzung)</span>
                    </label>
                  </div>
                </div>

                {/* Regelsatz */}
                <div>
                  <Label className="block mb-1">
                    <Euro className="inline h-3.5 w-3.5 mr-1" />
                    Regelsatz (EUR/Monat)
                  </Label>
                  <Input
                    type="number"
                    value={formRegelsatz}
                    onChange={(e) => setFormRegelsatz(e.target.value)}
                    min="0"
                    step="1"
                    placeholder="563"
                  />
                </div>

                {/* Aktenzeichen */}
                <div>
                  <Label className="block mb-1">
                    Aktenzeichen <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <Input
                    type="text"
                    value={formAktenzeichen}
                    onChange={(e) => setFormAktenzeichen(e.target.value)}
                    placeholder="z.B. S-1234/26"
                  />
                </div>
              </div>

              {/* Notizen */}
              <div>
                <Label className="block mb-1">
                  Notizen <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <textarea
                  value={formNotizen}
                  onChange={(e) => setFormNotizen(e.target.value)}
                  rows={3}
                  placeholder="Zusaetzliche Notizen zur Sanktion..."
                  className={`${inputClasses} resize-y`}
                />
              </div>

              {/* Preview */}
              {formStartDatum && (
                <div className="flex flex-wrap items-center gap-4 text-sm bg-muted/50 rounded-lg px-3 py-2">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Ende: <span className="font-medium text-foreground">{formatDate(addMonths(formStartDatum, 3))}</span>
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Euro className="h-4 w-4" />
                    Kuerzung: <span className="font-medium text-red-600 dark:text-red-400">
                      {previewBetrag.toFixed(2).replace('.', ',')} &euro;/Monat
                    </span>
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleSave}
                  disabled={!formBescheidDatum || !formStartDatum}
                  className="gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Sanktion speichern
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm()
                    setShowForm(false)
                  }}
                >
                  Abbrechen
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Sanctions List                                                   */}
        {/* ---------------------------------------------------------------- */}
        {sorted.length > 0 ? (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">
              Deine Sanktionen ({sanktionen.length})
            </h2>

            {sorted.map((s) => {
              const days = daysUntil(s.endeDatum)
              const progress = progressPercent(s.startDatum, s.endeDatum)
              const isActive = s.status === 'aktiv' || s.status === 'widerspruch_eingereicht'
              const showStatusDropdown = statusDropdownId === s.id
              const showDeleteConfirm = deleteConfirmId === s.id

              return (
                <Card
                  key={s.id}
                  className={
                    isActive
                      ? 'border-red-200 dark:border-red-800'
                      : s.status === 'aufgehoben'
                        ? 'border-green-200 dark:border-green-800'
                        : ''
                  }
                >
                  <CardContent className="p-4">
                    {/* Badges row */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span
                        className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${statusBadgeClasses(s.status)}`}
                      >
                        {STATUS_LABELS[s.status]}
                      </span>
                      <span
                        className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${grundBadgeClasses(s.grund)}`}
                      >
                        {GRUND_LABELS[s.grund]}
                      </span>
                      <Badge
                        variant="destructive"
                        className="text-xs"
                      >
                        -{s.kuerzungProzent}%
                      </Badge>
                    </div>

                    {/* Amount & dates */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mb-3">
                      <span className="flex items-center gap-1 font-semibold text-red-600 dark:text-red-400">
                        <TrendingDown className="h-3.5 w-3.5" />
                        -{s.kuerzungBetrag.toFixed(2).replace('.', ',')} &euro;/Monat
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(s.startDatum)} - {formatDate(s.endeDatum)}
                      </span>
                      {s.aktenzeichen && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <FileText className="h-3.5 w-3.5" />
                          Az: {s.aktenzeichen}
                        </span>
                      )}
                    </div>

                    {/* Countdown */}
                    {isActive && (
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        {days > 0 ? (
                          <span>
                            Noch <span className="font-semibold text-amber-600 dark:text-amber-400">{days} Tage</span> bis zum Ende
                          </span>
                        ) : days === 0 ? (
                          <span className="font-semibold text-green-600 dark:text-green-400">Endet heute!</span>
                        ) : (
                          <span className="font-semibold text-green-600 dark:text-green-400">Abgelaufen</span>
                        )}
                      </div>
                    )}

                    {/* Progress bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{formatDate(s.startDatum)}</span>
                        <span>{progress}% vergangen</span>
                        <span>{formatDate(s.endeDatum)}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            s.status === 'aufgehoben'
                              ? 'bg-green-500'
                              : s.status === 'abgelaufen'
                                ? 'bg-gray-400 dark:bg-gray-600'
                                : s.status === 'reduziert'
                                  ? 'bg-blue-500'
                                  : progress >= 75
                                    ? 'bg-amber-500'
                                    : 'bg-red-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Notizen */}
                    {s.notizen && (
                      <div className="rounded-lg bg-muted/50 p-2 text-xs text-muted-foreground mb-3 whitespace-pre-wrap">
                        {s.notizen}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                      {/* Status change */}
                      <div className="relative">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-xs"
                          onClick={() => setStatusDropdownId(showStatusDropdown ? null : s.id)}
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                          Status aendern
                        </Button>
                        {showStatusDropdown && (
                          <div className="absolute left-0 top-full mt-1 z-10 rounded-lg border bg-card shadow-lg py-1 min-w-[220px]">
                            {STATUS_OPTIONS.map((st) => (
                              <button
                                key={st}
                                onClick={() => handleStatusChange(s.id, st)}
                                className={`w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors ${
                                  s.status === st ? 'font-semibold text-primary' : ''
                                }`}
                              >
                                {STATUS_LABELS[st]}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Delete */}
                      {!showDeleteConfirm ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                          onClick={() => setDeleteConfirmId(s.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Loeschen
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-red-600 font-medium">Wirklich loeschen?</span>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => handleDelete(s.id)}
                          >
                            Ja
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => setDeleteConfirmId(null)}
                          >
                            Nein
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <ShieldAlert className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Keine Sanktionen erfasst</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Trage deine Sanktionen ein, um den Ueberblick zu behalten und dich gezielt zu wehren.
              Hoffentlich bleibt diese Liste fuer immer leer!
            </p>
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Sanktion erfassen
            </Button>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Timeline View                                                    */}
        {/* ---------------------------------------------------------------- */}
        {timelineEntries.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Zeitverlauf
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative pl-6 space-y-4">
                {/* Vertical line */}
                <div className="absolute left-2.5 top-1 bottom-1 w-0.5 bg-border" />

                {timelineEntries.map((s) => {
                  const isActive = s.status === 'aktiv' || s.status === 'widerspruch_eingereicht'
                  return (
                    <div key={s.id} className="relative">
                      {/* Dot */}
                      <div
                        className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 ${
                          isActive
                            ? 'bg-red-500 border-red-300 dark:border-red-700'
                            : s.status === 'aufgehoben'
                              ? 'bg-green-500 border-green-300 dark:border-green-700'
                              : 'bg-gray-400 border-gray-300 dark:border-gray-600'
                        }`}
                      />
                      <div className="text-sm">
                        <span className="font-medium">{formatDate(s.startDatum)}</span>
                        <span className="text-muted-foreground"> - </span>
                        <span className="font-medium">{formatDate(s.endeDatum)}</span>
                        <span className="text-muted-foreground ml-2">|</span>
                        <span className={`ml-2 ${isActive ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-muted-foreground'}`}>
                          {GRUND_LABELS[s.grund]}
                        </span>
                        <span className="text-muted-foreground ml-1">
                          (-{s.kuerzungBetrag.toFixed(2).replace('.', ',')} &euro;)
                        </span>
                        <span
                          className={`ml-2 inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${statusBadgeClasses(s.status)}`}
                        >
                          {STATUS_LABELS[s.status]}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Legal Info Section                                               */}
        {/* ---------------------------------------------------------------- */}
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Scale className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              Rechtliche Hinweise zu Sanktionen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sanktionshoehe */}
              <div className="space-y-2 text-sm">
                <h3 className="font-semibold flex items-center gap-1 text-amber-900 dark:text-amber-200">
                  <Ban className="h-4 w-4" />
                  Sanktionshoehe nach &sect; 31a SGB II
                </h3>
                <ul className="list-disc list-inside space-y-1 text-amber-800 dark:text-amber-300">
                  <li>
                    <strong>10% Kuerzung</strong> bei Meldeversaeumnis (Termin beim Jobcenter versaeumt)
                    nach &sect; 32 SGB II
                  </li>
                  <li>
                    <strong>30% Kuerzung</strong> bei Pflichtverletzung (Arbeit abgelehnt, Massnahme
                    abgebrochen, Mitwirkung verweigert) nach &sect; 31 SGB II
                  </li>
                  <li>
                    Sanktionsdauer: <strong>3 Monate</strong> (seit BVerfG-Urteil 2019 maximal 30% Kuerzung)
                  </li>
                </ul>
              </div>

              {/* Haertefall */}
              <div className="space-y-2 text-sm">
                <h3 className="font-semibold flex items-center gap-1 text-amber-900 dark:text-amber-200">
                  <AlertTriangle className="h-4 w-4" />
                  Haertefallregelung
                </h3>
                <ul className="list-disc list-inside space-y-1 text-amber-800 dark:text-amber-300">
                  <li>
                    Bei <strong>aussergewoehnlicher Haerte</strong> kann die Sanktion auf Antrag
                    reduziert oder aufgehoben werden (&sect; 31a Abs. 3 SGB II)
                  </li>
                  <li>
                    Kinder im Haushalt, Schwangerschaft oder Behinderung koennen als Haertefall gelten
                  </li>
                  <li>
                    Recht auf <strong>Sachleistungen</strong> (Lebensmittelgutscheine): Bei Kuerzungen
                    koennen ergaenzende Sachleistungen beantragt werden (&sect; 31a Abs. 3 SGB II)
                  </li>
                </ul>
              </div>
            </div>

            {/* Widerspruchsfrist */}
            <div className="rounded-lg bg-amber-100/70 dark:bg-amber-900/30 p-3 text-sm">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-amber-700 dark:text-amber-400 mt-0.5 shrink-0" />
                <div className="space-y-1 text-amber-800 dark:text-amber-300">
                  <p className="font-semibold">Widerspruchsfrist beachten!</p>
                  <p>
                    Gegen einen Sanktionsbescheid kannst du innerhalb von <strong>einem Monat</strong> nach
                    Zustellung Widerspruch einlegen. Der Widerspruch muss schriftlich beim Jobcenter
                    eingehen. Ein Widerspruch hat <strong>keine aufschiebende Wirkung</strong> -- die
                    Kuerzung gilt ab sofort, aber du kannst einen Eilantrag beim Sozialgericht stellen.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ---------------------------------------------------------------- */}
        {/* Action Links                                                     */}
        {/* ---------------------------------------------------------------- */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Werkzeuge gegen Sanktionen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link to="/rechner/sanktion">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Euro className="h-4 w-4 text-red-500" />
                  Sanktions-Rechner
                  <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
                </Button>
              </Link>
              <Link to="/widerspruch-vorlagen">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  Widerspruch-Vorlagen
                  <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
                </Button>
              </Link>
              <Link to="/chat">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <MessageSquare className="h-4 w-4 text-green-500" />
                  KI-Berater fragen
                  <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
