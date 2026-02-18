import { useState, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  ShieldAlert,
  CreditCard,
  FileText,
  CheckCircle2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { cn, formatDate } from '../lib/utils'
import { useBescheidContext } from '../contexts/BescheidContext'
import type { Frist } from '../types/bescheid'

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const MONTHS = [
  'Januar', 'Februar', 'Maerz', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

const FRIST_TYP_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  einspruch: { icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/40' },
  zahlung: { icon: CreditCard, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/40' },
  nachreichung: { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/40' },
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1 // Convert Sunday=0 to Monday-based
}

export default function KalenderPage() {
  const { fristen, toggleFrist } = useBescheidContext()
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(viewYear - 1)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(viewYear + 1)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  const goToToday = () => {
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
  }

  // Map fristen to dates
  const fristenByDate = useMemo(() => {
    const map: Record<string, Frist[]> = {}
    for (const f of fristen) {
      const dateKey = f.fristdatum.split('T')[0]
      if (!map[dateKey]) map[dateKey] = []
      map[dateKey].push(f)
    }
    return map
  }, [fristen])

  // Calendar grid
  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth)
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7

  const cells: { day: number; dateKey: string; isCurrentMonth: boolean; isToday: boolean }[] = []
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - firstDay + 1
    const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth

    let dateKey = ''
    if (isCurrentMonth) {
      const d = new Date(viewYear, viewMonth, dayNum)
      dateKey = d.toISOString().split('T')[0]
    }

    const isToday = isCurrentMonth &&
      dayNum === today.getDate() &&
      viewMonth === today.getMonth() &&
      viewYear === today.getFullYear()

    cells.push({ day: isCurrentMonth ? dayNum : 0, dateKey, isCurrentMonth, isToday })
  }

  const selectedFristen = selectedDate ? (fristenByDate[selectedDate] || []) : []

  // Count for current month
  const monthFristen = fristen.filter(f => {
    const d = new Date(f.fristdatum)
    return d.getFullYear() === viewYear && d.getMonth() === viewMonth
  })
  const offeneMonat = monthFristen.filter(f => !f.erledigt).length
  const erledigteMonat = monthFristen.filter(f => f.erledigt).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Steuer-Kalender</h1>
        <p className="text-muted-foreground mt-1">
          Alle Fristen und Termine auf einen Blick
        </p>
      </div>

      {/* Month summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-bold">{monthFristen.length}</p>
            <p className="text-xs text-muted-foreground">Fristen gesamt</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-bold text-amber-600">{offeneMonat}</p>
            <p className="text-xs text-muted-foreground">Offen</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-bold text-green-600">{erledigteMonat}</p>
            <p className="text-xs text-muted-foreground">Erledigt</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-bold text-red-600">
              {monthFristen.filter(f => !f.erledigt && new Date(f.fristdatum) < today).length}
            </p>
            <p className="text-xs text-muted-foreground">Ueberfaellig</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={prevMonth} aria-label="Vorheriger Monat">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-lg min-w-[180px] text-center">
                {MONTHS[viewMonth]} {viewYear}
              </CardTitle>
              <Button variant="outline" size="icon" onClick={nextMonth} aria-label="Naechster Monat">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={goToToday}>
              Heute
            </Button>
          </CardHeader>
          <CardContent>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-1">
              {WEEKDAYS.map(d => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {d}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
              {cells.map((cell, i) => {
                const hasFristen = cell.dateKey && fristenByDate[cell.dateKey]
                const fristCount = hasFristen ? fristenByDate[cell.dateKey].length : 0
                const hasOverdue = hasFristen && fristenByDate[cell.dateKey].some(f => !f.erledigt && new Date(f.fristdatum) < today)
                const allDone = hasFristen && fristenByDate[cell.dateKey].every(f => f.erledigt)
                const isSelected = cell.dateKey === selectedDate

                return (
                  <button
                    key={i}
                    onClick={() => cell.isCurrentMonth && setSelectedDate(cell.dateKey === selectedDate ? null : cell.dateKey)}
                    disabled={!cell.isCurrentMonth}
                    className={cn(
                      'relative min-h-[60px] sm:min-h-[72px] p-1 text-left transition-colors bg-card',
                      !cell.isCurrentMonth && 'bg-muted/30 text-muted-foreground/30',
                      cell.isCurrentMonth && 'hover:bg-accent/50 cursor-pointer',
                      isSelected && 'ring-2 ring-primary ring-inset',
                    )}
                  >
                    <span className={cn(
                      'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                      cell.isToday && 'bg-primary text-primary-foreground',
                    )}>
                      {cell.day > 0 ? cell.day : ''}
                    </span>

                    {fristCount > 0 && (
                      <div className="mt-0.5 space-y-0.5">
                        {fristenByDate[cell.dateKey].slice(0, 2).map(f => {
                          const config = FRIST_TYP_CONFIG[f.typ] || FRIST_TYP_CONFIG.nachreichung
                          return (
                            <div
                              key={f.id}
                              className={cn(
                                'text-[9px] sm:text-[10px] truncate rounded px-1 py-0.5 leading-tight',
                                f.erledigt ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 line-through' : config.bg,
                              )}
                            >
                              {f.bescheidTitel}
                            </div>
                          )
                        })}
                        {fristCount > 2 && (
                          <div className="text-[9px] text-muted-foreground px-1">
                            +{fristCount - 2} mehr
                          </div>
                        )}
                      </div>
                    )}

                    {/* Dot indicators */}
                    {fristCount > 0 && (
                      <div className="absolute bottom-1 right-1 flex gap-0.5">
                        {hasOverdue && !allDone && <span className="h-1.5 w-1.5 rounded-full bg-red-500" />}
                        {!allDone && !hasOverdue && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
                        {allDone && <span className="h-1.5 w-1.5 rounded-full bg-green-500" />}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Ueberfaellig
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Offen
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" /> Erledigt
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar: selected date details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {selectedDate ? formatDate(selectedDate) : 'Datum auswaehlen'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedDate ? (
              <p className="text-sm text-muted-foreground">
                Klicken Sie auf einen Tag im Kalender, um die Fristen fuer diesen Tag zu sehen.
              </p>
            ) : selectedFristen.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Keine Fristen an diesem Tag</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedFristen.map(frist => {
                  const config = FRIST_TYP_CONFIG[frist.typ] || FRIST_TYP_CONFIG.nachreichung
                  const Icon = config.icon
                  const isOverdue = !frist.erledigt && new Date(frist.fristdatum) < today

                  return (
                    <div
                      key={frist.id}
                      className={cn(
                        'rounded-lg border p-3 transition-colors',
                        frist.erledigt && 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20',
                        isOverdue && 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/20',
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn('rounded-full p-1.5 mt-0.5', config.bg)}>
                          <Icon className={cn('h-3.5 w-3.5', config.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn('text-sm font-medium truncate', frist.erledigt && 'line-through text-muted-foreground')}>
                            {frist.bescheidTitel}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-[10px] capitalize">
                              {frist.typ}
                            </Badge>
                            {isOverdue && (
                              <Badge variant="destructive" className="text-[10px]">
                                Ueberfaellig
                              </Badge>
                            )}
                            {frist.erledigt && (
                              <Badge variant="success" className="text-[10px]">
                                Erledigt
                              </Badge>
                            )}
                          </div>
                          {frist.notiz && (
                            <p className="text-xs text-muted-foreground mt-1">{frist.notiz}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 h-8 w-8"
                          onClick={() => toggleFrist(frist.id)}
                          aria-label={frist.erledigt ? 'Als offen markieren' : 'Als erledigt markieren'}
                        >
                          <CheckCircle2 className={cn(
                            'h-4 w-4',
                            frist.erledigt ? 'text-green-600' : 'text-muted-foreground'
                          )} />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
