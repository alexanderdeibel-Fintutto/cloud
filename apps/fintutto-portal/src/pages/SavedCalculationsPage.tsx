import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, Save, Trash2, Calculator, Shield, FileText,
  Search, Clock, Star, Lock, AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import {
  getSavedCalculations,
  deleteCalculation,
  getToolDisplayName,
  SAVE_LIMITS,
  type SavedCalculation,
} from '@/lib/savedCalculations'

const TOOL_TYPE_ICONS = {
  rechner: Calculator,
  checker: Shield,
  formular: FileText,
}

const TOOL_TYPE_COLORS = {
  rechner: 'bg-purple-100 text-purple-700',
  checker: 'bg-blue-100 text-blue-700',
  formular: 'bg-green-100 text-green-700',
}

export default function SavedCalculationsPage() {
  const [calculations, setCalculations] = useState<SavedCalculation[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'rechner' | 'checker' | 'formular'>('all')

  // Demo: assume free tier (can be upgraded)
  const currentPlan = 'free' as const
  const canSave = currentPlan !== 'free'
  const limit = SAVE_LIMITS[currentPlan]

  useEffect(() => {
    setCalculations(getSavedCalculations())
  }, [])

  const filtered = calculations.filter((c) => {
    if (filterType !== 'all' && c.toolType !== filterType) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        c.toolName.toLowerCase().includes(query) ||
        getToolDisplayName(c.toolId).toLowerCase().includes(query) ||
        c.notes?.toLowerCase().includes(query)
      )
    }
    return true
  })

  const handleDelete = (id: string) => {
    deleteCalculation(id)
    setCalculations(getSavedCalculations())
  }

  return (
    <div>
      {/* Hero */}
      <section className="gradient-portal py-12">
        <div className="container">
          <Link to="/" className="inline-flex items-center gap-1 text-white/80 hover:text-white mb-4 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Startseite
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
              <Save className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Gespeicherte Berechnungen</h1>
              <p className="text-white/80">Alle deine gespeicherten Ergebnisse an einem Ort</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container">
          {/* Upgrade Banner for Free Users */}
          {!canSave && (
            <Card className="mb-6 border-warning/30 bg-warning/5">
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <Lock className="h-8 w-8 text-warning shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold">Berechnungen speichern</h3>
                    <p className="text-sm text-muted-foreground">
                      Im kostenlosen Plan können Berechnungen nicht gespeichert werden.
                      Upgrade auf einen kostenpflichtigen Plan, um Ergebnisse zu speichern und später abzurufen.
                    </p>
                  </div>
                  <Button asChild size="sm">
                    <Link to="/preise">Upgrade</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Limits Info */}
          {canSave && limit !== -1 && (
            <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4" />
              <span>{calculations.length} / {limit} Speicherplätze belegt</span>
              {calculations.length >= limit && (
                <span className="text-warning flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Limit erreicht
                </span>
              )}
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Berechnungen suchen..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {([
                { value: 'all', label: 'Alle' },
                { value: 'rechner', label: 'Rechner' },
                { value: 'checker', label: 'Checker' },
                { value: 'formular', label: 'Formulare' },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilterType(opt.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === opt.value
                      ? 'gradient-portal text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Calculations List */}
          {filtered.length === 0 ? (
            <Card className="bg-muted/30">
              <CardContent className="py-12 text-center">
                <Save className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">
                  {calculations.length === 0
                    ? 'Noch keine Berechnungen gespeichert'
                    : 'Keine Berechnungen gefunden'}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Nutze die Rechner und Checker, um Berechnungen zu speichern.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button asChild variant="outline">
                    <Link to="/rechner">Zu den Rechnern</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/checker">Zu den Checkern</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((calc) => {
                const Icon = TOOL_TYPE_ICONS[calc.toolType]
                const colorClass = TOOL_TYPE_COLORS[calc.toolType]
                return (
                  <Card key={calc.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="py-4">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colorClass}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold">{getToolDisplayName(calc.toolId)}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{formatDate(calc.savedAt)}</span>
                            {calc.notes && (
                              <>
                                <span>&middot;</span>
                                <span className="truncate">{calc.notes}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/${calc.toolType === 'rechner' ? 'rechner' : calc.toolType === 'checker' ? 'checker' : 'formulare'}/${calc.toolId}`}>
                              Öffnen
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(calc.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
