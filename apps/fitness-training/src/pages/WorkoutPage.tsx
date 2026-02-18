import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Pause, SkipForward, ChevronLeft, ChevronRight,
  Check, X, Clock, Dumbbell, Flame, RotateCcw, Trophy,
  Timer, Volume2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn, formatDuration } from '@/lib/utils'
import type { PlannedWorkout, PlannedExercise, ExerciseSet, WorkoutSession, WorkoutExerciseLog } from '@/lib/types'
import { EXERCISES, getExerciseById } from '@/data/exercises'

export default function WorkoutPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const workout = location.state?.workout as PlannedWorkout | undefined

  const [currentExIdx, setCurrentExIdx] = useState(0)
  const [currentSetIdx, setCurrentSetIdx] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [restTimer, setRestTimer] = useState(0)
  const [isResting, setIsResting] = useState(false)
  const [showFinish, setShowFinish] = useState(false)
  const [rating, setRating] = useState(4)
  const [notes, setNotes] = useState('')

  // Build workout exercises with set tracking
  const [exercises, setExercises] = useState<{
    planned: PlannedExercise
    sets: { targetReps: number; targetWeight: number; actualReps: string; actualWeight: string; completed: boolean }[]
  }[]>([])

  useEffect(() => {
    if (!workout) {
      // Create a sample workout if none provided
      const sampleExercises = EXERCISES.filter(e => e.category === 'strength').slice(0, 6)
      const planned: PlannedExercise[] = sampleExercises.map((ex, i) => ({
        id: crypto.randomUUID(),
        workoutId: 'sample',
        exerciseId: ex.id,
        exercise: ex,
        sets: 3,
        reps: 10,
        weight: 0,
        restBetweenSets: 90,
        order: i,
      }))
      setExercises(planned.map(p => ({
        planned: p,
        sets: Array.from({ length: p.sets }, (_, i) => ({
          targetReps: p.reps || 10,
          targetWeight: p.weight || 0,
          actualReps: String(p.reps || 10),
          actualWeight: String(p.weight || ''),
          completed: false,
        })),
      })))
    } else {
      setExercises(workout.exercises.map(p => {
        const exercise = getExerciseById(p.exerciseId) || p.exercise
        return {
          planned: { ...p, exercise },
          sets: Array.from({ length: p.sets }, () => ({
            targetReps: p.reps || 10,
            targetWeight: p.weight || 0,
            actualReps: String(p.reps || 10),
            actualWeight: String(p.weight || ''),
            completed: false,
          })),
        }
      }))
    }
  }, [workout])

  // Workout timer
  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(() => setElapsed(p => p + 1), 1000)
    return () => clearInterval(interval)
  }, [isPaused])

  // Rest timer
  useEffect(() => {
    if (!isResting || restTimer <= 0) return
    const interval = setInterval(() => {
      setRestTimer(p => {
        if (p <= 1) {
          setIsResting(false)
          return 0
        }
        return p - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isResting, restTimer])

  const currentEx = exercises[currentExIdx]
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0)
  const completedSets = exercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.completed).length, 0)
  const progressPercent = totalSets > 0 ? (completedSets / totalSets) * 100 : 0

  const completeSet = () => {
    if (!currentEx) return
    const updated = [...exercises]
    updated[currentExIdx].sets[currentSetIdx].completed = true
    setExercises(updated)

    // Move to next set or exercise
    if (currentSetIdx < currentEx.sets.length - 1) {
      setCurrentSetIdx(currentSetIdx + 1)
      setRestTimer(currentEx.planned.restBetweenSets)
      setIsResting(true)
    } else if (currentExIdx < exercises.length - 1) {
      setCurrentExIdx(currentExIdx + 1)
      setCurrentSetIdx(0)
      setRestTimer(120) // longer rest between exercises
      setIsResting(true)
    } else {
      setShowFinish(true)
    }
  }

  const skipRest = () => {
    setIsResting(false)
    setRestTimer(0)
  }

  const finishWorkout = () => {
    const stats = {
      streak: (JSON.parse(localStorage.getItem('fittutto_stats') || '{}').streak || 0) + 1,
      weeklyWorkouts: (JSON.parse(localStorage.getItem('fittutto_stats') || '{}').weeklyWorkouts || 0) + 1,
      todayCalories: Math.round(elapsed / 60 * 7),
    }
    localStorage.setItem('fittutto_stats', JSON.stringify(stats))

    // Save workout to history
    const history = JSON.parse(localStorage.getItem('fittutto_history') || '[]')
    history.unshift({
      id: crypto.randomUUID(),
      name: workout?.name || 'Freies Training',
      date: new Date().toISOString(),
      duration: Math.round(elapsed / 60),
      exercises: exercises.length,
      volume: exercises.reduce((sum, ex) =>
        sum + ex.sets.reduce((s, set) =>
          s + (set.completed ? (parseFloat(set.actualWeight) || 0) * (parseInt(set.actualReps) || 0) : 0), 0), 0),
      rating,
    })
    localStorage.setItem('fittutto_history', JSON.stringify(history.slice(0, 100)))

    navigate('/dashboard')
  }

  if (exercises.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="font-medium">Workout wird geladen...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="p-2">
              <X className="h-5 w-5" />
            </button>
            <div className="text-center">
              <p className="font-semibold text-sm">{workout?.name || 'Training'}</p>
              <p className="text-xs text-muted-foreground">{formatDuration(elapsed)}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowFinish(true)}>
              Beenden
            </Button>
          </div>
          <Progress value={progressPercent} className="mt-2 h-1.5" />
        </div>
      </div>

      {/* Rest Timer Overlay */}
      <AnimatePresence>
        {isResting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/95 flex flex-col items-center justify-center"
          >
            <Timer className="h-10 w-10 text-primary mb-4" />
            <p className="text-sm text-muted-foreground mb-2">Pause</p>
            <p className="text-6xl font-bold tabular-nums">{formatDuration(restTimer)}</p>
            <p className="text-sm text-muted-foreground mt-4 mb-8">Nächster Satz gleich...</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setRestTimer(p => p + 30)}>+30s</Button>
              <Button variant="fitness" size="lg" onClick={skipRest}>
                Weiter
                <SkipForward className="ml-1 h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => setRestTimer(p => Math.max(0, p - 30))}>-30s</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Exercise */}
      <div className="container mx-auto px-4 py-4 space-y-4">
        {/* Exercise Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            disabled={currentExIdx === 0}
            onClick={() => { setCurrentExIdx(p => p - 1); setCurrentSetIdx(0) }}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Übung {currentExIdx + 1} von {exercises.length}
          </span>
          <Button
            variant="ghost"
            size="icon"
            disabled={currentExIdx === exercises.length - 1}
            onClick={() => { setCurrentExIdx(p => p + 1); setCurrentSetIdx(0) }}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Exercise Card */}
        {currentEx && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-3">
                  <Dumbbell className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold">{currentEx.planned.exercise?.name || 'Übung'}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentEx.planned.exercise?.muscleGroups.join(', ')}
                </p>
              </div>

              {/* Sets Table */}
              <div className="space-y-2">
                <div className="grid grid-cols-[40px_1fr_1fr_60px] gap-2 text-xs font-medium text-muted-foreground px-2">
                  <span>Satz</span>
                  <span>Gewicht (kg)</span>
                  <span>Wdh.</span>
                  <span></span>
                </div>

                {currentEx.sets.map((set, i) => (
                  <div
                    key={i}
                    className={cn(
                      'grid grid-cols-[40px_1fr_1fr_60px] gap-2 items-center p-2 rounded-lg transition-colors',
                      set.completed ? 'bg-primary/5' : i === currentSetIdx ? 'bg-muted/80 ring-1 ring-primary/20' : 'bg-muted/30'
                    )}
                  >
                    <span className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                      set.completed ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                    )}>
                      {set.completed ? <Check className="h-4 w-4" /> : i + 1}
                    </span>
                    <Input
                      value={set.actualWeight}
                      onChange={e => {
                        const updated = [...exercises]
                        updated[currentExIdx].sets[i].actualWeight = e.target.value
                        setExercises(updated)
                      }}
                      className="h-9 text-center"
                      disabled={set.completed}
                      placeholder={String(set.targetWeight || '-')}
                    />
                    <Input
                      value={set.actualReps}
                      onChange={e => {
                        const updated = [...exercises]
                        updated[currentExIdx].sets[i].actualReps = e.target.value
                        setExercises(updated)
                      }}
                      className="h-9 text-center"
                      disabled={set.completed}
                      placeholder={String(set.targetReps)}
                    />
                    <Button
                      size="sm"
                      variant={set.completed ? 'ghost' : i === currentSetIdx ? 'default' : 'outline'}
                      disabled={set.completed}
                      onClick={() => {
                        setCurrentSetIdx(i)
                        completeSet()
                      }}
                      className="h-9 w-full"
                    >
                      {set.completed ? <Check className="h-4 w-4 text-primary" /> : <Check className="h-4 w-4" />}
                    </Button>
                  </div>
                ))}
              </div>

              {/* Instructions */}
              {currentEx.planned.exercise?.instructions && (
                <details className="mt-4">
                  <summary className="text-sm font-medium cursor-pointer text-muted-foreground hover:text-foreground">
                    Anleitung anzeigen
                  </summary>
                  <ol className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                    {currentEx.planned.exercise.instructions.map((step, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="font-medium text-primary">{i + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </details>
              )}
            </CardContent>
          </Card>
        )}

        {/* Workout Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
          </Button>
          <Button
            variant="fitness"
            size="lg"
            className="px-8 h-12"
            onClick={completeSet}
            disabled={!currentEx || currentEx.sets[currentSetIdx]?.completed}
          >
            Satz abschließen
            <Check className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="stat-card">
            <Clock className="h-4 w-4 mx-auto text-blue-500 mb-1" />
            <p className="stat-value text-lg">{formatDuration(elapsed)}</p>
            <p className="stat-label">Dauer</p>
          </div>
          <div className="stat-card">
            <Dumbbell className="h-4 w-4 mx-auto text-primary mb-1" />
            <p className="stat-value text-lg">{completedSets}/{totalSets}</p>
            <p className="stat-label">Sätze</p>
          </div>
          <div className="stat-card">
            <Flame className="h-4 w-4 mx-auto text-orange-500 mb-1" />
            <p className="stat-value text-lg">{Math.round(elapsed / 60 * 7)}</p>
            <p className="stat-label">kcal</p>
          </div>
        </div>
      </div>

      {/* Finish Dialog */}
      <Dialog open={showFinish} onOpenChange={setShowFinish}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Training abschließen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-2xl font-bold">{formatDuration(elapsed)}</p>
                <p className="text-xs text-muted-foreground">Dauer</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{completedSets}</p>
                <p className="text-xs text-muted-foreground">Sätze</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.round(elapsed / 60 * 7)}</p>
                <p className="text-xs text-muted-foreground">kcal</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Wie war das Training?</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(r => (
                  <button
                    key={r}
                    onClick={() => setRating(r)}
                    className={cn(
                      'flex-1 p-2 rounded-lg text-center transition-colors',
                      r <= rating ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <Trophy className="h-5 w-5 mx-auto" />
                    <span className="text-xs">{r}</span>
                  </button>
                ))}
              </div>
            </div>

            <Input
              placeholder="Notizen zum Training..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowFinish(false)}>
                Weitermachen
              </Button>
              <Button variant="fitness" className="flex-1" onClick={finishWorkout}>
                Speichern
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
