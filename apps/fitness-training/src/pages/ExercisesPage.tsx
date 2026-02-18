import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Search, Filter, Dumbbell, Zap, Heart, ChevronDown,
  X, Info
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { Exercise, ExerciseCategory, MuscleGroup } from '@/lib/types'
import { EXERCISES, searchExercises, getExercisesByCategory, getExercisesByMuscle } from '@/data/exercises'

const CATEGORY_LABELS: Record<ExerciseCategory, { label: string; icon: typeof Dumbbell; color: string }> = {
  strength: { label: 'Kraft', icon: Dumbbell, color: 'text-red-500 bg-red-500/10' },
  cardio: { label: 'Cardio', icon: Zap, color: 'text-blue-500 bg-blue-500/10' },
  mobility: { label: 'Mobility', icon: Heart, color: 'text-purple-500 bg-purple-500/10' },
  stretching: { label: 'Stretching', icon: Heart, color: 'text-pink-500 bg-pink-500/10' },
  warmup: { label: 'Aufwärmen', icon: Zap, color: 'text-amber-500 bg-amber-500/10' },
  cooldown: { label: 'Cool-Down', icon: Heart, color: 'text-cyan-500 bg-cyan-500/10' },
}

const MUSCLE_LABELS: Record<string, string> = {
  chest: 'Brust', back: 'Rücken', shoulders: 'Schultern',
  biceps: 'Bizeps', triceps: 'Trizeps', forearms: 'Unterarme',
  abs: 'Bauch', obliques: 'Seitliche Bauchmuskeln', lower_back: 'Unterer Rücken',
  quadriceps: 'Oberschenkel (vorne)', hamstrings: 'Oberschenkel (hinten)',
  glutes: 'Gesäß', calves: 'Waden', full_body: 'Ganzkörper', cardio: 'Cardio',
}

export default function ExercisesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState<ExerciseCategory | 'all'>('all')
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null)
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const filteredExercises = useMemo(() => {
    let results = EXERCISES

    if (searchQuery) {
      results = searchExercises(searchQuery)
    }

    if (category !== 'all') {
      results = results.filter(e => e.category === category)
    }

    if (selectedMuscle) {
      results = results.filter(e => e.muscleGroups.includes(selectedMuscle))
    }

    return results
  }, [searchQuery, category, selectedMuscle])

  const muscleGroups = useMemo(() => {
    const muscles = new Set<MuscleGroup>()
    filteredExercises.forEach(e => e.muscleGroups.forEach(m => muscles.add(m)))
    return Array.from(muscles)
  }, [filteredExercises])

  return (
    <div className="container mx-auto px-4 py-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Übungsbibliothek</h1>
        <p className="text-muted-foreground">{EXERCISES.length} Übungen für jedes Level</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Übung suchen..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-9"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <Tabs value={category} onValueChange={v => { setCategory(v as ExerciseCategory | 'all'); setSelectedMuscle(null) }}>
        <TabsList className="w-full overflow-x-auto flex">
          <TabsTrigger value="all" className="flex-shrink-0">Alle</TabsTrigger>
          {Object.entries(CATEGORY_LABELS).map(([key, { label }]) => (
            <TabsTrigger key={key} value={key} className="flex-shrink-0">{label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Muscle Filter */}
      <div className="flex flex-wrap gap-1.5">
        {selectedMuscle && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedMuscle(null)}
            className="text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Filter zurücksetzen
          </Button>
        )}
        {muscleGroups.slice(0, showFilters ? undefined : 8).map(muscle => (
          <button
            key={muscle}
            onClick={() => setSelectedMuscle(selectedMuscle === muscle ? null : muscle)}
            className={cn(
              'muscle-tag cursor-pointer transition-colors',
              selectedMuscle === muscle && 'bg-primary/10 text-primary border-primary/30'
            )}
          >
            {MUSCLE_LABELS[muscle] || muscle}
          </button>
        ))}
        {muscleGroups.length > 8 && !showFilters && (
          <button
            onClick={() => setShowFilters(true)}
            className="muscle-tag cursor-pointer text-primary"
          >
            +{muscleGroups.length - 8} mehr
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">{filteredExercises.length} Übungen gefunden</p>

      {/* Exercise List */}
      <div className="grid gap-2">
        {filteredExercises.map((exercise, i) => {
          const catInfo = CATEGORY_LABELS[exercise.category]
          const CatIcon = catInfo?.icon || Dumbbell
          return (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: Math.min(i * 0.02, 0.5) }}
            >
              <Card
                className="exercise-card"
                onClick={() => setSelectedExercise(exercise)}
              >
                <div className="flex items-center gap-3">
                  <div className={cn('p-2.5 rounded-lg flex-shrink-0', catInfo?.color || 'bg-muted')}>
                    <CatIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{exercise.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {exercise.muscleGroups.slice(0, 3).map(m => (
                        <span key={m} className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {MUSCLE_LABELS[m] || m}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className={cn(
                      'text-[10px] px-2 py-0.5 rounded-full font-medium',
                      exercise.difficulty === 'beginner' ? 'bg-green-500/10 text-green-600' :
                      exercise.difficulty === 'intermediate' ? 'bg-blue-500/10 text-blue-600' :
                      exercise.difficulty === 'advanced' ? 'bg-orange-500/10 text-orange-600' :
                      'bg-red-500/10 text-red-600'
                    )}>
                      {exercise.difficulty === 'beginner' ? 'Anfänger' :
                       exercise.difficulty === 'intermediate' ? 'Mittel' :
                       exercise.difficulty === 'advanced' ? 'Fortgeschritten' : 'Profi'}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {filteredExercises.length === 0 && (
        <div className="text-center py-12">
          <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="font-medium">Keine Übungen gefunden</p>
          <p className="text-sm text-muted-foreground">Versuche einen anderen Suchbegriff oder Filter.</p>
        </div>
      )}

      {/* Exercise Detail Dialog */}
      <Dialog open={!!selectedExercise} onOpenChange={() => setSelectedExercise(null)}>
        {selectedExercise && (
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedExercise.name}</DialogTitle>
              <DialogDescription>{selectedExercise.nameEn}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{selectedExercise.description}</p>

              {/* Muscle groups */}
              <div>
                <p className="text-sm font-medium mb-2">Muskelgruppen</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedExercise.muscleGroups.map(m => (
                    <span key={m} className={cn(
                      'muscle-tag',
                      m === selectedExercise.primaryMuscle && 'bg-primary/10 text-primary font-semibold'
                    )}>
                      {MUSCLE_LABELS[m] || m}
                      {m === selectedExercise.primaryMuscle && ' (Haupt)'}
                    </span>
                  ))}
                </div>
              </div>

              {/* Equipment */}
              <div>
                <p className="text-sm font-medium mb-2">Equipment</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedExercise.equipment.map(e => (
                    <span key={e} className="muscle-tag">
                      {e === 'none' ? 'Kein Equipment' : e}
                    </span>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div>
                <p className="text-sm font-medium mb-2">Ausführung</p>
                <ol className="space-y-2">
                  {selectedExercise.instructions.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-semibold">
                        {i + 1}
                      </span>
                      <span className="text-muted-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Meta */}
              <div className="flex gap-4 text-sm text-muted-foreground border-t pt-3">
                <span>~{selectedExercise.caloriesPerMinute} kcal/min</span>
                <span>Schwierigkeit: {selectedExercise.difficulty}</span>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
