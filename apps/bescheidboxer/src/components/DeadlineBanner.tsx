import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Clock, X, ArrowRight } from 'lucide-react'
import { Button } from './ui/button'
import { daysUntil } from '../lib/utils'
import { useBescheidContext } from '../contexts/BescheidContext'

export default function DeadlineBanner() {
  const { fristen } = useBescheidContext()
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const urgentFristen = fristen
    .filter(f => !f.erledigt && !dismissed.has(f.id))
    .filter(f => {
      const days = daysUntil(f.fristdatum)
      return days <= 7
    })
    .sort((a, b) => daysUntil(a.fristdatum) - daysUntil(b.fristdatum))

  if (urgentFristen.length === 0) return null

  const mostUrgent = urgentFristen[0]
  const days = daysUntil(mostUrgent.fristdatum)
  const isOverdue = days < 0

  return (
    <div
      className={`rounded-lg px-4 py-3 flex items-center gap-3 mb-6 animate-in slide-in-from-top-2 ${
        isOverdue
          ? 'bg-red-50 border border-red-200 dark:bg-red-950/30 dark:border-red-800'
          : 'bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800'
      }`}
      role="alert"
    >
      <div className={`shrink-0 rounded-full p-1.5 ${
        isOverdue ? 'bg-red-100 dark:bg-red-900/50' : 'bg-amber-100 dark:bg-amber-900/50'
      }`}>
        {isOverdue ? (
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
        ) : (
          <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${
          isOverdue ? 'text-red-800 dark:text-red-300' : 'text-amber-800 dark:text-amber-300'
        }`}>
          {isOverdue
            ? `Frist ueberschritten: ${mostUrgent.bescheidTitel}`
            : days === 0
              ? `Frist laeuft heute ab: ${mostUrgent.bescheidTitel}`
              : `Frist in ${days} ${days === 1 ? 'Tag' : 'Tagen'}: ${mostUrgent.bescheidTitel}`
          }
          {urgentFristen.length > 1 && (
            <span className="text-muted-foreground ml-1">
              (+{urgentFristen.length - 1} weitere)
            </span>
          )}
        </p>
      </div>

      <Link to="/fristen">
        <Button
          variant="ghost"
          size="sm"
          className={`gap-1 shrink-0 ${
            isOverdue ? 'text-red-700 hover:text-red-800 dark:text-red-400' : 'text-amber-700 hover:text-amber-800 dark:text-amber-400'
          }`}
        >
          Anzeigen <ArrowRight className="h-3 w-3" />
        </Button>
      </Link>

      <button
        onClick={() => setDismissed(prev => new Set([...prev, mostUrgent.id]))}
        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Benachrichtigung schliessen"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
