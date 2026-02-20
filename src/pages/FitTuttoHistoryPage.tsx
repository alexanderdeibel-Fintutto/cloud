import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  History, Dumbbell, Clock, Calendar, Trophy,
  X, ChevronDown, ChevronUp, Weight, Flame,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { useFitness } from '@/contexts/FitnessContext'
import { cn, formatDate } from '@/lib/utils'
import {
  WorkoutSession,
  SET_TYPE_ICONS, MUSCLE_GROUP_LABELS, MuscleGroup,
} from '@/lib/fitness-types'

export default function FitTuttoHistoryPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { workoutHistory, loadWorkoutHistory } = useFitness()
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutSession | null>(null)

  useEffect(() => {
    if (user) loadWorkoutHistory()
  }, [user, loadWorkoutHistory])

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-6">
            <History className="w-12 h-12 mx-auto mb-4 text-orange-500" />
            <h2 className="text-xl font-bold mb-2">Anmeldung erforderlich</h2>
            <p className="text-gray-600 mb-4">Melde dich an, um deine Trainingshistorie zu sehen.</p>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => navigate('/login')}>
              Jetzt anmelden
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Group workouts by month
  const groupedByMonth: Record<string, WorkoutSession[]> = {}
  workoutHistory.forEach(w => {
    const d = new Date(w.startedAt)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!groupedByMonth[key]) groupedByMonth[key] = []
    groupedByMonth[key].push(w)
  })

  const monthLabels: Record<string, string> = {
    '01': 'Januar', '02': 'Februar', '03': 'Maerz', '04': 'April',
    '05': 'Mai', '06': 'Juni', '07': 'Juli', '08': 'August',
    '09': 'September', '10': 'Oktober', '11': 'November', '12': 'Dezember',
  }

  // Stats overview
  const totalWorkouts = workoutHistory.length
  const totalVolume = workoutHistory.reduce((s, w) => s + (w.totalVolume || 0), 0)
  const totalMinutes = workoutHistory.reduce((s, w) => s + (w.durationMinutes || 0), 0)
  const totalSets = workoutHistory.reduce((s, w) => s + (w.exercises || []).reduce((es, e) => es + e.sets.filter(st => st.completed).length, 0), 0)

  return (
    <div className="py-8 px-4 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
            <History className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Trainingshistorie</h1>
            <p className="text-gray-500">{totalWorkouts} Trainings gesamt</p>
          </div>
        </div>

        {/* Quick Stats */}
        {totalWorkouts > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatMini icon={<Dumbbell className="w-4 h-4" />} label="Trainings" value={String(totalWorkouts)} />
            <StatMini icon={<Clock className="w-4 h-4" />} label="Stunden" value={`${Math.round(totalMinutes / 60)}`} />
            <StatMini icon={<Weight className="w-4 h-4" />} label="Volumen" value={`${Math.round(totalVolume / 1000)}t`} />
            <StatMini icon={<Flame className="w-4 h-4" />} label="Saetze" value={String(totalSets)} />
          </div>
        )}

        {/* Workouts grouped by month */}
        {Object.entries(groupedByMonth).length > 0 ? (
          Object.entries(groupedByMonth).map(([monthKey, workouts]) => {
            const [year, month] = monthKey.split('-')
            return (
              <div key={monthKey} className="mb-6">
                <h2 className="text-sm font-semibold text-gray-500 mb-2">
                  {monthLabels[month] || month} {year}
                </h2>
                <div className="space-y-2">
                  {workouts.map(w => (
                    <Card
                      key={w.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedWorkout(w)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                            <Dumbbell className="w-6 h-6 text-orange-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold truncate">{w.name}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-3 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDate(w.startedAt)}
                              </span>
                              {w.durationMinutes && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {w.durationMinutes} min
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-sm font-medium">{(w.exercises || []).length} Uebungen</div>
                            <div className="text-xs text-gray-500">{Math.round(w.totalVolume)} kg</div>
                          </div>
                        </div>

                        {/* Muscle tags */}
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {getUniqueMuscles(w).slice(0, 5).map(m => (
                            <span key={m} className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">
                              {MUSCLE_GROUP_LABELS[m as MuscleGroup] || m}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Dumbbell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">Noch keine Trainings</h3>
              <p className="text-gray-500 mb-4">Starte dein erstes Training, um die Historie zu fuellen.</p>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => navigate('/fittutto/workout')}>
                <Dumbbell className="w-4 h-4 mr-2" /> Training starten
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Workout Detail Modal */}
      <AnimatePresence>
        {selectedWorkout && (
          <WorkoutDetailModal
            workout={selectedWorkout}
            onClose={() => setSelectedWorkout(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function getUniqueMuscles(w: WorkoutSession): string[] {
  const muscles = new Set<string>()
  ;(w.exercises || []).forEach(ex => {
    (ex.exercise?.primaryMuscles || []).forEach(m => muscles.add(m))
  })
  return Array.from(muscles)
}

function StatMini({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-3 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
          {icon}
        </div>
        <div>
          <div className="text-lg font-bold leading-tight">{value}</div>
          <div className="text-xs text-gray-500">{label}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function WorkoutDetailModal({ workout, onClose }: { workout: WorkoutSession; onClose: () => void }) {
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null)
  const exercises = workout.exercises || []
  const completedSets = exercises.flatMap(e => e.sets.filter(s => s.completed))
  const totalVolume = completedSets.reduce((s, set) => s + set.weight * set.reps, 0)
  const prs = completedSets.filter(s => s.isPersonalRecord)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">{workout.name}</h3>
            <div className="text-sm text-gray-500 flex items-center gap-3">
              <span>{formatDate(workout.startedAt)}</span>
              {workout.durationMinutes && <span>{workout.durationMinutes} min</span>}
            </div>
          </div>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 p-4 border-b">
          <div className="text-center">
            <div className="text-lg font-bold">{exercises.length}</div>
            <div className="text-xs text-gray-500">Uebungen</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{completedSets.length}</div>
            <div className="text-xs text-gray-500">Saetze</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{Math.round(totalVolume)} <span className="text-xs font-normal">kg</span></div>
            <div className="text-xs text-gray-500">Volumen</div>
          </div>
        </div>

        {/* PRs */}
        {prs.length > 0 && (
          <div className="px-4 py-2 bg-yellow-50 border-b">
            <div className="flex items-center gap-2 text-yellow-700 text-sm font-medium">
              <Trophy className="w-4 h-4" />
              {prs.length} persoenliche{prs.length > 1 ? ' Rekorde' : 'r Rekord'}
            </div>
          </div>
        )}

        {/* Exercise list */}
        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {exercises.map(ex => {
            const isExpanded = expandedExercise === ex.id
            const exCompletedSets = ex.sets.filter(s => s.completed)
            const bestSet = exCompletedSets.reduce((best, s) =>
              s.weight * s.reps > best.weight * best.reps ? s : best
            , exCompletedSets[0] || { weight: 0, reps: 0 })

            return (
              <div key={ex.id} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedExercise(isExpanded ? null : ex.id)}
                  className="w-full text-left p-3 flex items-center gap-3 hover:bg-gray-50"
                >
                  <Dumbbell className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{ex.exercise?.name || 'Uebung'}</div>
                    <div className="text-xs text-gray-500">
                      {exCompletedSets.length} Saetze · Bester: {bestSet?.weight || 0}kg x {bestSet?.reps || 0}
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>

                {isExpanded && (
                  <div className="px-3 pb-3 border-t bg-gray-50">
                    <div className="grid grid-cols-[40px_1fr_1fr_1fr] gap-1 text-xs font-medium text-gray-400 py-2 px-1">
                      <span>Satz</span>
                      <span>Gewicht</span>
                      <span>Wdh</span>
                      <span>RPE</span>
                    </div>
                    {ex.sets.map(set => (
                      <div
                        key={set.id}
                        className={cn(
                          'grid grid-cols-[40px_1fr_1fr_1fr] gap-1 text-sm py-1 px-1 rounded',
                          set.completed && 'bg-white',
                          set.isPersonalRecord && 'bg-yellow-50',
                          !set.completed && 'opacity-40',
                        )}
                      >
                        <span className={cn(
                          'text-xs font-medium',
                          set.type === 'warmup' && 'text-yellow-600',
                          set.type === 'dropset' && 'text-red-600',
                          set.type === 'failure' && 'text-purple-600',
                          set.type === 'amrap' && 'text-blue-600',
                        )}>
                          {SET_TYPE_ICONS[set.type] || set.setNumber}
                          {set.isPersonalRecord && ' 🏆'}
                        </span>
                        <span>{set.weight} kg</span>
                        <span>{set.reps}</span>
                        <span>{set.rpe || '-'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
