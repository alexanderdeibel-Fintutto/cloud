import { useState, useEffect } from 'react'
import {
  CheckCircle2,
  Circle,
  FileText,
  Upload,
  Search,
  ShieldAlert,
  Clock,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Trophy,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'

interface ChecklistItem {
  id: string
  title: string
  description: string
}

interface ChecklistCategory {
  id: string
  title: string
  icon: React.ElementType
  items: ChecklistItem[]
}

const CHECKLISTE: ChecklistCategory[] = [
  {
    id: 'vorbereitung',
    title: 'Vorbereitung',
    icon: FileText,
    items: [
      { id: 'v1', title: 'Steuerbescheid erhalten', description: 'Steuerbescheid vom Finanzamt per Post oder ELSTER erhalten' },
      { id: 'v2', title: 'Bescheid digitalisieren', description: 'Bescheid als PDF scannen oder fotografieren' },
      { id: 'v3', title: 'Einspruchsfrist notieren', description: 'Die 4-Wochen-Frist ab Zugang im Kalender eintragen' },
      { id: 'v4', title: 'Steuererklaerung bereithalten', description: 'Kopie der eingereichten Steuererklaerung zum Vergleich' },
    ],
  },
  {
    id: 'upload',
    title: 'Bescheid hochladen',
    icon: Upload,
    items: [
      { id: 'u1', title: 'Im Steuer-Bescheidprüfer hochladen', description: 'PDF oder Foto des Bescheids in der App hochladen' },
      { id: 'u2', title: 'Grunddaten pruefen', description: 'Steuerart, Steuerjahr, Finanzamt und Aktenzeichen kontrollieren' },
      { id: 'u3', title: 'Betraege erfassen', description: 'Festgesetzte und erwartete Steuer korrekt eingeben' },
    ],
  },
  {
    id: 'analyse',
    title: 'Analyse & Pruefung',
    icon: Search,
    items: [
      { id: 'a1', title: 'KI-Analyse starten', description: 'Bescheid automatisch auf Fehler und Abweichungen pruefen lassen' },
      { id: 'a2', title: 'Abweichungen pruefen', description: 'Alle gefundenen Abweichungen einzeln durchgehen und bewerten' },
      { id: 'a3', title: 'Empfehlung beachten', description: 'KI-Empfehlung (Akzeptieren/Pruefen/Einspruch) beruecksichtigen' },
      { id: 'a4', title: 'Belege zusammenstellen', description: 'Alle relevanten Belege und Nachweise fuer strittige Punkte sammeln' },
    ],
  },
  {
    id: 'einspruch',
    title: 'Einspruch (falls noetig)',
    icon: ShieldAlert,
    items: [
      { id: 'e1', title: 'Einspruch formulieren', description: 'Begruendung mit konkreten Abweichungen und Paragraphen verfassen' },
      { id: 'e2', title: 'Einspruch einreichen', description: 'Einspruch fristgerecht beim Finanzamt einreichen' },
      { id: 'e3', title: 'Eingangsbestaetigung', description: 'Eingangsbestaetigung vom Finanzamt erhalten und ablegen' },
    ],
  },
  {
    id: 'fristen',
    title: 'Fristen & Nachverfolgung',
    icon: Clock,
    items: [
      { id: 'f1', title: 'Fristen in App eintragen', description: 'Alle relevanten Fristen in der Fristen-Verwaltung erfassen' },
      { id: 'f2', title: 'Erinnerungen aktivieren', description: 'E-Mail- oder Push-Benachrichtigungen fuer Fristen einschalten' },
      { id: 'f3', title: 'Bescheid-Status pflegen', description: 'Status des Bescheids regelmaessig aktualisieren' },
      { id: 'f4', title: 'Ergebnis dokumentieren', description: 'Endgueltiges Ergebnis (Aenderung/Ablehnung) festhalten' },
    ],
  },
]

const STORAGE_KEY = 'bescheidboxer-checkliste'

export default function ChecklistePage() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? new Set(JSON.parse(stored)) : new Set()
    } catch {
      return new Set()
    }
  })
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(CHECKLISTE.map(c => c.id))
  )

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...checkedItems]))
  }, [checkedItems])

  const toggleItem = (id: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const resetAll = () => {
    setCheckedItems(new Set())
  }

  const totalItems = CHECKLISTE.reduce((sum, cat) => sum + cat.items.length, 0)
  const completedItems = checkedItems.size
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  const categoryProgress = (category: ChecklistCategory) => {
    const done = category.items.filter(item => checkedItems.has(item.id)).length
    return { done, total: category.items.length }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Steuer-Checkliste</h1>
          <p className="text-muted-foreground mt-1">
            Schritt fuer Schritt durch die Bescheidpruefung
          </p>
        </div>
        {completedItems > 0 && (
          <Button variant="outline" size="sm" onClick={resetAll} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Zuruecksetzen
          </Button>
        )}
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Gesamtfortschritt</span>
                <span className="text-sm font-bold">{completedItems} / {totalItems}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    progressPercent === 100
                      ? 'bg-green-500'
                      : progressPercent >= 50
                        ? 'bg-fintutto-blue-500'
                        : 'bg-amber-500'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <div className={`text-2xl font-bold ${
              progressPercent === 100
                ? 'text-green-600 dark:text-green-400'
                : 'text-foreground'
            }`}>
              {progressPercent}%
            </div>
          </div>

          {progressPercent === 100 && (
            <div className="mt-4 flex items-center gap-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-3">
              <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                Alle Schritte abgeschlossen! Ihr Bescheid ist vollstaendig bearbeitet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Categories */}
      <div className="space-y-4">
        {CHECKLISTE.map((category, catIdx) => {
          const { done, total } = categoryProgress(category)
          const isExpanded = expandedCategories.has(category.id)
          const isComplete = done === total
          const CatIcon = category.icon

          return (
            <Card key={category.id}>
              <CardHeader
                className="cursor-pointer hover:bg-accent/30 transition-colors rounded-t-xl"
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2 ${
                      isComplete
                        ? 'bg-green-100 dark:bg-green-900/40'
                        : 'bg-muted'
                    }`}>
                      <CatIcon className={`h-5 w-5 ${
                        isComplete
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-normal">
                          Schritt {catIdx + 1}
                        </span>
                        {category.title}
                        {isComplete && (
                          <Badge variant="success" className="text-[10px]">Fertig</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        {done} von {total} erledigt
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 bg-muted rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${isComplete ? 'bg-green-500' : 'bg-fintutto-blue-500'}`}
                        style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
                      />
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0">
                  <Separator className="mb-4" />
                  <div className="space-y-2">
                    {category.items.map(item => {
                      const isChecked = checkedItems.has(item.id)
                      return (
                        <button
                          key={item.id}
                          onClick={() => toggleItem(item.id)}
                          className={`w-full flex items-start gap-3 rounded-lg p-3 text-left transition-colors ${
                            isChecked
                              ? 'bg-green-50/50 dark:bg-green-950/30 border border-green-200 dark:border-green-800'
                              : 'border border-border hover:bg-accent/30'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {isChecked ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${isChecked ? 'line-through text-muted-foreground' : ''}`}>
                              {item.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {item.description}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
