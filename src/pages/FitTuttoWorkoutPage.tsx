import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Square, Plus, Check, Trash2, Timer, Trophy, ChevronDown, ChevronUp,
  Dumbbell, Search, X, RotateCcw, Flame,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { useFitness } from '@/contexts/FitnessContext'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { EXERCISES, searchExercises, getExerciseById } from '@/lib/exercises'
import {
  Exercise, WorkoutSession, WorkoutExercise, WorkoutSet, SetType,
  SET_TYPE_LABELS, SET_TYPE_ICONS, MUSCLE_GROUP_LABELS,
} from '@/lib/fitness-types'

function generateId() {
  return crypto.randomUUID()
}

function createEmptySet(setNumber: number, prevSet?: WorkoutSet): WorkoutSet {
  return {
    id: generateId(),
    setNumber,
    type: 'normal',
    weight: prevSet?.weight || 0,
    reps: prevSet?.reps || 0,
    rpe: null,
    completed: false,
    isPersonalRecord: false,
    notes: null,
  }
}

export default function FitTuttoWorkoutPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { activePlan, saveWorkout, checkAndSavePersonalRecord } = useFitness()

  // Workout state
  const [isActive, setIsActive] = useState(false)
  const [workoutName, setWorkoutName] = useState('')
  const [exercises, setExercises] = useState<WorkoutExercise[]>([])
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [elapsed, setElapsed] = useState(0)

  // Rest timer
  const [restSeconds, setRestSeconds] = useState(0)
  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Exercise picker
  const [showPicker, setShowPicker] = useState(false)
  const [pickerQuery, setPickerQuery] = useState('')

  // Elapsed timer
  useEffect(() => {
    if (!isActive || !startTime) return
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [isActive, startTime])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // --- Start / Stop Workout ---
  const startWorkout = () => {
    setIsActive(true)
    setStartTime(new Date())
    setElapsed(0)
    setWorkoutName(getDefaultWorkoutName())

    // Pre-fill from active plan if available
    if (activePlan && activePlan.days.length > 0) {
      const today = new Date().getDay()
      const dayIndex = today === 0 ? 6 : today - 1 // Mo=0
      const planDay = activePlan.days[dayIndex % activePlan.days.length]
      if (planDay) {
        setWorkoutName(planDay.name)
        const mapped: WorkoutExercise[] = planDay.exercises.map((pe, i) => {
          const ex = getExerciseById(pe.exerciseId) || EXERCISES[0]
          const repCount = parseInt(pe.reps) || ex.defaultReps || 10
          const sets: WorkoutSet[] = Array.from({ length: pe.sets }, (_, j) =>
            createEmptySet(j + 1, { weight: 0, reps: repCount } as any)
          )
          return {
            id: generateId(),
            exerciseId: pe.exerciseId,
            exercise: ex,
            sets,
            restSeconds: pe.restSeconds || ex.defaultRestSeconds || 90,
            supersetWithId: null,
            notes: null,
            order: i,
          }
        })
        setExercises(mapped)
      }
    }
  }

  const getDefaultWorkoutName = () => {
    const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
    return `Training - ${days[new Date().getDay()]}`
  }

  const finishWorkout = async () => {
    if (!user || exercises.length === 0) return

    const completedSets = exercises.flatMap(e => e.sets.filter(s => s.completed))
    if (completedSets.length === 0) {
      toast.error('Kein Satz abgeschlossen - Training nicht gespeichert.')
      return
    }

    const totalVolume = completedSets.reduce((sum, s) => sum + s.weight * s.reps, 0)
    const session: WorkoutSession = {
      id: generateId(),
      userId: user.id,
      planId: activePlan?.id || null,
      name: workoutName,
      startedAt: startTime!.toISOString(),
      completedAt: new Date().toISOString(),
      durationMinutes: Math.floor(elapsed / 60),
      exercises,
      totalVolume,
      caloriesBurned: null,
      rating: null,
      mood: null,
      notes: null,
    }

    await saveWorkout(session)
    toast.success(`Training beendet! ${completedSets.length} Saetze, ${Math.round(totalVolume)} kg Volumen`)

    setIsActive(false)
    setExercises([])
    setStartTime(null)
    setElapsed(0)
    stopRestTimer()
  }

  // --- Exercise Management ---
  const addExercise = (exercise: Exercise) => {
    const defaultSets = exercise.defaultSets || 3
    const defaultReps = exercise.defaultReps || 10
    const sets: WorkoutSet[] = Array.from({ length: defaultSets }, (_, i) =>
      createEmptySet(i + 1, { weight: 0, reps: defaultReps } as any)
    )

    setExercises(prev => [...prev, {
      id: generateId(),
      exerciseId: exercise.id,
      exercise,
      sets,
      restSeconds: exercise.defaultRestSeconds || 90,
      supersetWithId: null,
      notes: null,
      order: prev.length,
    }])
    setShowPicker(false)
    setPickerQuery('')
  }

  const removeExercise = (exerciseId: string) => {
    setExercises(prev => prev.filter(e => e.id !== exerciseId))
  }

  // --- Set Management ---
  const updateSet = (exerciseId: string, setId: string, update: Partial<WorkoutSet>) => {
    setExercises(prev => prev.map(ex =>
      ex.id === exerciseId
        ? { ...ex, sets: ex.sets.map(s => s.id === setId ? { ...s, ...update } : s) }
        : ex
    ))
  }

  const completeSet = async (exerciseId: string, set: WorkoutSet, exercise: Exercise) => {
    updateSet(exerciseId, set.id, { completed: true })

    // Check for PR
    if (set.weight > 0 && set.type !== 'warmup') {
      const isPR = await checkAndSavePersonalRecord(exercise.id, exercise.name, set.weight, set.reps)
      if (isPR) {
        updateSet(exerciseId, set.id, { completed: true, isPersonalRecord: true })
        toast.success(`Neuer PR! ${exercise.name}: ${set.weight}kg x ${set.reps}`, { icon: '🏆' })
      }
    }

    // Start rest timer
    const ex = exercises.find(e => e.id === exerciseId)
    if (ex) startRestTimer(ex.restSeconds)
  }

  const addSet = (exerciseId: string) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex
      const lastSet = ex.sets[ex.sets.length - 1]
      return { ...ex, sets: [...ex.sets, createEmptySet(ex.sets.length + 1, lastSet)] }
    }))
  }

  const removeSet = (exerciseId: string, setId: string) => {
    setExercises(prev => prev.map(ex =>
      ex.id === exerciseId
        ? { ...ex, sets: ex.sets.filter(s => s.id !== setId).map((s, i) => ({ ...s, setNumber: i + 1 })) }
        : ex
    ))
  }

  const changeSetType = (exerciseId: string, setId: string) => {
    const types: SetType[] = ['normal', 'warmup', 'dropset', 'failure', 'amrap']
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex
      return {
        ...ex, sets: ex.sets.map(s => {
          if (s.id !== setId) return s
          const idx = types.indexOf(s.type)
          return { ...s, type: types[(idx + 1) % types.length] }
        })
      }
    }))
  }

  // --- Rest Timer ---
  const startRestTimer = (target: number) => {
    stopRestTimer()
    setRestSeconds(target)
    restIntervalRef.current = setInterval(() => {
      setRestSeconds(prev => {
        if (prev <= 1) {
          stopRestTimer()
          toast.info('Pause vorbei!', { icon: '⏱️' })
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const stopRestTimer = () => {
    if (restIntervalRef.current) {
      clearInterval(restIntervalRef.current)
      restIntervalRef.current = null
    }
    setRestSeconds(0)
  }

  // Cleanup on unmount
  useEffect(() => () => stopRestTimer(), [])

  // --- Picker search ---
  const pickerResults = pickerQuery ? searchExercises(pickerQuery) : EXERCISES.slice(0, 30)

  // --- Not started UI ---
  if (!isActive) {
    return (
      <div className="py-8 px-4 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-6">
              <Dumbbell className="w-10 h-10 text-orange-500" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Workout starten</h1>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              {activePlan
                ? `Dein aktiver Plan: "${activePlan.name}" wird automatisch geladen.`
                : 'Starte ein leeres Training oder erstelle zuerst einen Trainingsplan.'}
            </p>
            <div className="flex gap-3 justify-center">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white" onClick={startWorkout}>
                <Play className="w-5 h-5 mr-2" />
                Training starten
              </Button>
              {!activePlan && (
                <Button size="lg" variant="outline" onClick={() => navigate('/fittutto/plan')}>
                  Plan erstellen
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // --- Active Workout UI ---
  return (
    <div className="py-4 px-4 max-w-4xl mx-auto pb-32">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b -mx-4 px-4 py-3 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <Input
              value={workoutName}
              onChange={e => setWorkoutName(e.target.value)}
              className="text-lg font-bold border-none p-0 h-auto focus-visible:ring-0"
            />
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
              <span className="flex items-center gap-1">
                <Timer className="w-3.5 h-3.5" />
                {formatTime(elapsed)}
              </span>
              <span>{exercises.flatMap(e => e.sets).filter(s => s.completed).length} Saetze</span>
            </div>
          </div>
          <Button size="sm" variant="destructive" onClick={finishWorkout}>
            <Square className="w-4 h-4 mr-1" /> Beenden
          </Button>
        </div>
      </div>

      {/* Rest Timer Banner */}
      <AnimatePresence>
        {restSeconds > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-4"
          >
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Timer className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Pause</span>
                </div>
                <span className="text-2xl font-mono font-bold text-blue-700">{formatTime(restSeconds)}</span>
                <Button size="sm" variant="ghost" onClick={stopRestTimer}>
                  <X className="w-4 h-4" /> Ueberspringen
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercises */}
      <div className="space-y-4">
        {exercises.map((workoutExercise) => (
          <WorkoutExerciseCard
            key={workoutExercise.id}
            workoutExercise={workoutExercise}
            onUpdateSet={(setId, update) => updateSet(workoutExercise.id, setId, update)}
            onCompleteSet={(set) => completeSet(workoutExercise.id, set, workoutExercise.exercise)}
            onAddSet={() => addSet(workoutExercise.id)}
            onRemoveSet={(setId) => removeSet(workoutExercise.id, setId)}
            onChangeSetType={(setId) => changeSetType(workoutExercise.id, setId)}
            onRemoveExercise={() => removeExercise(workoutExercise.id)}
          />
        ))}
      </div>

      {/* Add Exercise Button */}
      <Button
        variant="outline"
        className="w-full mt-4 border-dashed border-2"
        onClick={() => setShowPicker(true)}
      >
        <Plus className="w-4 h-4 mr-2" /> Uebung hinzufuegen
      </Button>

      {/* Exercise Picker Modal */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
            onClick={() => setShowPicker(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[80vh] flex flex-col"
            >
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg">Uebung waehlen</h3>
                  <button onClick={() => setShowPicker(false)}><X className="w-5 h-5" /></button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={pickerQuery}
                    onChange={e => setPickerQuery(e.target.value)}
                    placeholder="Uebung suchen..."
                    className="pl-10"
                    autoFocus
                  />
                </div>
              </div>
              <div className="overflow-y-auto flex-1 p-2">
                {pickerResults.map(ex => (
                  <button
                    key={ex.id}
                    onClick={() => addExercise(ex)}
                    className="w-full text-left p-3 rounded-lg hover:bg-orange-50 flex items-center gap-3 transition-colors"
                  >
                    <Dumbbell className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-sm">{ex.name}</div>
                      <div className="text-xs text-gray-500">
                        {ex.primaryMuscles.map(m => MUSCLE_GROUP_LABELS[m]).join(', ')}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// --- Exercise Card Component ---
function WorkoutExerciseCard({
  workoutExercise,
  onUpdateSet,
  onCompleteSet,
  onAddSet,
  onRemoveSet,
  onChangeSetType,
  onRemoveExercise,
}: {
  workoutExercise: WorkoutExercise
  onUpdateSet: (setId: string, update: Partial<WorkoutSet>) => void
  onCompleteSet: (set: WorkoutSet) => void
  onAddSet: () => void
  onRemoveSet: (setId: string) => void
  onChangeSetType: (setId: string) => void
  onRemoveExercise: () => void
}) {
  const [collapsed, setCollapsed] = useState(false)
  const { exercise, sets } = workoutExercise
  const completedCount = sets.filter(s => s.completed).length

  return (
    <Card className="overflow-hidden">
      {/* Exercise Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full text-left p-4 flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
          <Dumbbell className="w-5 h-5 text-orange-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate">{exercise.name}</div>
          <div className="text-xs text-gray-500">
            {completedCount}/{sets.length} Saetze · {exercise.primaryMuscles.map(m => MUSCLE_GROUP_LABELS[m]).join(', ')}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); onRemoveExercise() }} className="p-1 hover:bg-red-50 rounded">
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
          {collapsed ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronUp className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {!collapsed && (
        <CardContent className="pt-0 pb-3">
          {/* Set Header */}
          <div className="grid grid-cols-[40px_1fr_1fr_1fr_40px_40px] gap-1 text-xs font-medium text-gray-400 mb-1 px-1">
            <span>Satz</span>
            <span>kg</span>
            <span>Wdh</span>
            <span>RPE</span>
            <span></span>
            <span></span>
          </div>

          {/* Sets */}
          {sets.map(set => (
            <SetRow
              key={set.id}
              set={set}
              onUpdate={(update) => onUpdateSet(set.id, update)}
              onComplete={() => onCompleteSet(set)}
              onRemove={() => onRemoveSet(set.id)}
              onChangeType={() => onChangeSetType(set.id)}
            />
          ))}

          {/* Add Set Row */}
          <div className="flex gap-2 mt-2">
            <Button variant="ghost" size="sm" className="flex-1 text-gray-500" onClick={onAddSet}>
              <Plus className="w-3 h-3 mr-1" /> Satz
            </Button>
            <Button variant="ghost" size="sm" className="text-orange-500" onClick={() => {
              // Add drop set
              onAddSet()
            }}>
              <Flame className="w-3 h-3 mr-1" /> Drop
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// --- Set Row Component ---
function SetRow({
  set,
  onUpdate,
  onComplete,
  onRemove,
  onChangeType,
}: {
  set: WorkoutSet
  onUpdate: (update: Partial<WorkoutSet>) => void
  onComplete: () => void
  onRemove: () => void
  onChangeType: () => void
}) {
  return (
    <div className={cn(
      'grid grid-cols-[40px_1fr_1fr_1fr_40px_40px] gap-1 items-center py-1 px-1 rounded-lg transition-colors',
      set.completed && 'bg-green-50',
      set.isPersonalRecord && 'bg-yellow-50 ring-1 ring-yellow-300',
    )}>
      {/* Set number + type */}
      <button
        onClick={onChangeType}
        className={cn(
          'text-sm font-medium rounded px-1 py-0.5 text-center',
          set.type === 'warmup' && 'bg-yellow-100 text-yellow-700',
          set.type === 'dropset' && 'bg-red-100 text-red-700',
          set.type === 'failure' && 'bg-purple-100 text-purple-700',
          set.type === 'amrap' && 'bg-blue-100 text-blue-700',
          set.type === 'normal' && 'text-gray-500',
        )}
        title={SET_TYPE_LABELS[set.type]}
      >
        {SET_TYPE_ICONS[set.type] || set.setNumber}
      </button>

      {/* Weight */}
      <Input
        type="number"
        step="2.5"
        value={set.weight || ''}
        onChange={e => onUpdate({ weight: parseFloat(e.target.value) || 0 })}
        className="h-8 text-center text-sm p-1"
        placeholder="0"
        disabled={set.completed}
      />

      {/* Reps */}
      <Input
        type="number"
        value={set.reps || ''}
        onChange={e => onUpdate({ reps: parseInt(e.target.value) || 0 })}
        className="h-8 text-center text-sm p-1"
        placeholder="0"
        disabled={set.completed}
      />

      {/* RPE */}
      <Input
        type="number"
        min="1"
        max="10"
        value={set.rpe || ''}
        onChange={e => onUpdate({ rpe: parseInt(e.target.value) || null })}
        className="h-8 text-center text-sm p-1"
        placeholder="-"
        disabled={set.completed}
      />

      {/* Complete button */}
      {!set.completed ? (
        <button
          onClick={onComplete}
          disabled={set.weight === 0 && set.reps === 0}
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
            set.weight > 0 || set.reps > 0
              ? 'bg-orange-500 text-white hover:bg-orange-600'
              : 'bg-gray-100 text-gray-400'
          )}
        >
          <Check className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={() => onUpdate({ completed: false })}
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-100 text-green-600 hover:bg-green-200"
        >
          {set.isPersonalRecord ? <Trophy className="w-4 h-4 text-yellow-500" /> : <RotateCcw className="w-3 h-3" />}
        </button>
      )}

      {/* Remove */}
      <button onClick={onRemove} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50">
        <Trash2 className="w-3 h-3 text-red-300" />
      </button>
    </div>
  )
}
