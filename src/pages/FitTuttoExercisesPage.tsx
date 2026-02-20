import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Dumbbell, ChevronDown, ChevronUp, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { EXERCISES, searchExercises } from '@/lib/exercises'
import {
  Exercise, MuscleGroup, Equipment, ExerciseCategory, Difficulty,
  MUSCLE_GROUP_LABELS, EQUIPMENT_LABELS, CATEGORY_LABELS, DIFFICULTY_LABELS,
} from '@/lib/fitness-types'

const MUSCLE_GROUPS = Object.keys(MUSCLE_GROUP_LABELS) as MuscleGroup[]

export default function FitTuttoExercisesPage() {
  const [query, setQuery] = useState('')
  const [muscleFilter, setMuscleFilter] = useState<string>('all')
  const [equipmentFilter, setEquipmentFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    let results = query ? searchExercises(query) : [...EXERCISES]

    if (muscleFilter !== 'all') {
      results = results.filter(e =>
        e.primaryMuscles.includes(muscleFilter as MuscleGroup) ||
        e.secondaryMuscles.includes(muscleFilter as MuscleGroup)
      )
    }
    if (equipmentFilter !== 'all') {
      results = results.filter(e => e.equipment.includes(equipmentFilter as Equipment))
    }
    if (categoryFilter !== 'all') {
      results = results.filter(e => e.category === categoryFilter)
    }
    if (difficultyFilter !== 'all') {
      results = results.filter(e => e.difficulty === difficultyFilter)
    }

    return results
  }, [query, muscleFilter, equipmentFilter, categoryFilter, difficultyFilter])

  const activeFilterCount = [muscleFilter, equipmentFilter, categoryFilter, difficultyFilter]
    .filter(f => f !== 'all').length

  const clearFilters = () => {
    setMuscleFilter('all')
    setEquipmentFilter('all')
    setCategoryFilter('all')
    setDifficultyFilter('all')
    setQuery('')
  }

  return (
    <div className="py-8 px-4 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Uebungsbibliothek</h1>
            <p className="text-gray-500">{EXERCISES.length} Uebungen mit Anleitungen</p>
          </div>
        </div>

        {/* Search + Filter Toggle */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Uebung suchen..."
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(activeFilterCount > 0 && 'border-orange-500 text-orange-600')}
          >
            <Filter className="w-4 h-4 mr-1" />
            Filter {activeFilterCount > 0 && `(${activeFilterCount})`}
          </Button>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <Card className="mb-4">
                <CardContent className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Muskelgruppe</label>
                    <Select value={muscleFilter} onValueChange={setMuscleFilter}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alle</SelectItem>
                        {MUSCLE_GROUPS.map(m => (
                          <SelectItem key={m} value={m}>{MUSCLE_GROUP_LABELS[m]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Equipment</label>
                    <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alle</SelectItem>
                        {(Object.entries(EQUIPMENT_LABELS) as [Equipment, string][]).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Kategorie</label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alle</SelectItem>
                        {(Object.entries(CATEGORY_LABELS) as [ExerciseCategory, string][]).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Schwierigkeit</label>
                    <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alle</SelectItem>
                        {(Object.entries(DIFFICULTY_LABELS) as [Difficulty, string][]).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {activeFilterCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="col-span-full">
                      <X className="w-4 h-4 mr-1" /> Filter zuruecksetzen
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Muscle Group Quick Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          <button
            onClick={() => setMuscleFilter('all')}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm whitespace-nowrap border transition-colors',
              muscleFilter === 'all' ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-300 hover:border-orange-300'
            )}
          >
            Alle
          </button>
          {(['chest', 'back', 'shoulders', 'biceps', 'triceps', 'quads', 'hamstrings', 'glutes', 'abs'] as MuscleGroup[]).map(m => (
            <button
              key={m}
              onClick={() => setMuscleFilter(m)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm whitespace-nowrap border transition-colors',
                muscleFilter === m ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-300 hover:border-orange-300'
              )}
            >
              {MUSCLE_GROUP_LABELS[m]}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-3">
          {filtered.length} {filtered.length === 1 ? 'Uebung' : 'Uebungen'} gefunden
        </p>

        {/* Exercise List */}
        <div className="space-y-2">
          {filtered.map(exercise => (
            <ExerciseListItem
              key={exercise.id}
              exercise={exercise}
              expanded={expandedId === exercise.id}
              onToggle={() => setExpandedId(expandedId === exercise.id ? null : exercise.id)}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Keine Uebungen gefunden.</p>
            <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-2">
              Filter zuruecksetzen
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

function ExerciseListItem({ exercise, expanded, onToggle }: {
  exercise: Exercise
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <Card className={cn('transition-shadow', expanded && 'shadow-md')}>
      <button
        onClick={onToggle}
        className="w-full text-left p-4 flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
          <Dumbbell className="w-5 h-5 text-orange-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{exercise.name}</div>
          <div className="text-xs text-gray-500 flex gap-2 mt-0.5">
            <span>{exercise.primaryMuscles.map(m => MUSCLE_GROUP_LABELS[m]).join(', ')}</span>
            <span>·</span>
            <span>{DIFFICULTY_LABELS[exercise.difficulty]}</span>
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {exercise.equipment.map(eq => (
            <span key={eq} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full hidden sm:inline">
              {EQUIPMENT_LABELS[eq]}
            </span>
          ))}
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <CardContent className="pt-0 pb-4 border-t">
              {/* Muscle Groups */}
              <div className="flex gap-2 flex-wrap mt-3 mb-4">
                {exercise.primaryMuscles.map(m => (
                  <span key={m} className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                    {MUSCLE_GROUP_LABELS[m]}
                  </span>
                ))}
                {exercise.secondaryMuscles.map(m => (
                  <span key={m} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {MUSCLE_GROUP_LABELS[m]}
                  </span>
                ))}
              </div>

              {/* Instructions */}
              <h4 className="font-medium text-sm mb-2">Ausfuehrung:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 mb-3">
                {exercise.instructions.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>

              {/* Tips */}
              {exercise.tips && exercise.tips.length > 0 && (
                <div className="bg-yellow-50 rounded-lg p-3 mt-3">
                  <h4 className="font-medium text-sm mb-1 text-yellow-800">Tipps:</h4>
                  <ul className="list-disc list-inside text-sm text-yellow-700 space-y-0.5">
                    {exercise.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Defaults */}
              <div className="flex gap-4 mt-3 text-sm text-gray-500">
                {exercise.defaultSets && <span>{exercise.defaultSets} Saetze</span>}
                {exercise.defaultReps && <span>{exercise.defaultReps} Wdh.</span>}
                {exercise.defaultRestSeconds && <span>{exercise.defaultRestSeconds}s Pause</span>}
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}
