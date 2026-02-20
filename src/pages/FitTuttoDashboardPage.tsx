import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Dumbbell, Trophy, TrendingUp, Calendar, Clock, Target,
  Flame, BarChart3, Play, ChevronRight, Weight,
  Brain, Apple, Scale, History,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/AuthContext'
import { useFitness } from '@/contexts/FitnessContext'
import { cn, formatDate } from '@/lib/utils'
import {
  FITNESS_GOAL_LABELS, FITNESS_GOAL_ICONS,
  MUSCLE_GROUP_LABELS, MuscleGroup,
} from '@/lib/fitness-types'

export default function FitTuttoDashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    profile, activePlan, workoutHistory, personalRecords,
    loadWorkoutHistory, loadPersonalRecords, loadPlans,
  } = useFitness()

  useEffect(() => {
    if (user) {
      loadWorkoutHistory()
      loadPersonalRecords()
      loadPlans()
    }
  }, [user, loadWorkoutHistory, loadPersonalRecords, loadPlans])

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-6">
            <Dumbbell className="w-12 h-12 mx-auto mb-4 text-orange-500" />
            <h2 className="text-xl font-bold mb-2">Anmeldung erforderlich</h2>
            <p className="text-gray-600 mb-4">Melde dich an, um dein Dashboard zu sehen.</p>
            <Button variant="fintutto" onClick={() => navigate('/login')}>
              Jetzt anmelden
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // --- Stats Calculation ---
  const now = new Date()
  const thisWeekStart = new Date(now)
  thisWeekStart.setDate(now.getDate() - now.getDay() + 1) // Monday
  thisWeekStart.setHours(0, 0, 0, 0)

  const thisWeekWorkouts = workoutHistory.filter(w =>
    new Date(w.startedAt) >= thisWeekStart
  )
  const weeklyTarget = profile?.trainingDaysPerWeek || 3
  const weeklyProgress = Math.min(100, (thisWeekWorkouts.length / weeklyTarget) * 100)

  const totalVolume = thisWeekWorkouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0)
  const totalMinutes = thisWeekWorkouts.reduce((sum, w) => sum + (w.durationMinutes || 0), 0)

  // Muscle group frequency this week
  const muscleFrequency: Record<string, number> = {}
  thisWeekWorkouts.forEach(w => {
    (w.exercises || []).forEach(ex => {
      if (ex.exercise?.primaryMuscles) {
        ex.exercise.primaryMuscles.forEach(m => {
          muscleFrequency[m] = (muscleFrequency[m] || 0) + 1
        })
      }
    })
  })

  const topMuscles = Object.entries(muscleFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)

  // Current streak
  const getStreak = (): number => {
    if (workoutHistory.length === 0) return 0
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      const hasWorkout = workoutHistory.some(w => {
        const d = new Date(w.startedAt)
        d.setHours(0, 0, 0, 0)
        return d.getTime() === checkDate.getTime()
      })
      if (hasWorkout || i === 0) {
        if (hasWorkout) streak++
      } else {
        break
      }
    }
    return streak
  }

  const streak = getStreak()
  const recentPRs = personalRecords.slice(0, 5)

  return (
    <div className="py-8 px-4 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                Hallo{profile?.displayName ? `, ${profile.displayName}` : ''}!
              </h1>
              <p className="text-gray-500">
                {profile?.fitnessGoal
                  ? `Ziel: ${FITNESS_GOAL_ICONS[profile.fitnessGoal]} ${FITNESS_GOAL_LABELS[profile.fitnessGoal]}`
                  : 'Setze dein Fitness-Ziel'}
              </p>
            </div>
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => navigate('/fittutto/workout')}>
            <Play className="w-4 h-4 mr-2" /> Training starten
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard icon={<Calendar className="w-5 h-5" />} label="Diese Woche" value={`${thisWeekWorkouts.length}/${weeklyTarget}`} color="orange" />
          <StatCard icon={<Clock className="w-5 h-5" />} label="Trainingszeit" value={`${totalMinutes} min`} color="blue" />
          <StatCard icon={<Weight className="w-5 h-5" />} label="Volumen" value={`${Math.round(totalVolume / 1000)}t`} color="green" />
          <StatCard icon={<Flame className="w-5 h-5" />} label="Streak" value={`${streak} Tage`} color="red" />
        </div>

        {/* Weekly Progress */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Wochenziel</span>
              <span className="text-sm text-gray-500">{thisWeekWorkouts.length} von {weeklyTarget} Trainings</span>
            </div>
            <Progress value={weeklyProgress} className="h-3" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Active Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="w-5 h-5 text-orange-500" />
                  Aktiver Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activePlan ? (
                  <div>
                    <h3 className="font-semibold">{activePlan.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {activePlan.daysPerWeek}x/Woche · {activePlan.days.length} Tage
                    </p>
                    <div className="mt-3 space-y-1">
                      {activePlan.days.map((day, i) => (
                        <div key={day.id} className="text-sm flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-medium">
                            {i + 1}
                          </span>
                          <span>{day.name}</span>
                          <span className="text-gray-400 ml-auto">{day.exercises.length} Uebungen</span>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => navigate('/fittutto/plan')}>
                      Plan bearbeiten <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 mb-3">Kein aktiver Plan</p>
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => navigate('/fittutto/plan')}>
                      Plan erstellen
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Muscle Heatmap */}
            {topMuscles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="w-5 h-5 text-orange-500" />
                    Muskelgruppen diese Woche
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {topMuscles.map(([muscle, count]) => (
                      <div key={muscle} className="flex items-center gap-3">
                        <span className="text-sm w-32 truncate">{MUSCLE_GROUP_LABELS[muscle as MuscleGroup] || muscle}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(100, (count / Math.max(...topMuscles.map(([, c]) => c))) * 100)}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-500 w-6 text-right">{count}x</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Personal Records */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Persoenliche Rekorde
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentPRs.length > 0 ? (
                  <div className="space-y-2">
                    {recentPRs.map(pr => (
                      <div key={pr.id} className="flex items-center gap-3 p-2 rounded-lg bg-yellow-50">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{pr.exerciseName}</div>
                          <div className="text-xs text-gray-500">{formatDate(pr.achievedAt)}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm">{pr.weight} kg</div>
                          <div className="text-xs text-gray-500">{pr.reps} Wdh.</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">Starte dein erstes Training!</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Workouts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                  Letzte Trainings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {workoutHistory.length > 0 ? (
                  <div className="space-y-2">
                    {workoutHistory.slice(0, 5).map(w => (
                      <div key={w.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                        <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                          <Dumbbell className="w-5 h-5 text-orange-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{w.name}</div>
                          <div className="text-xs text-gray-500">
                            {formatDate(w.startedAt)} · {w.durationMinutes} min
                          </div>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          <div>{(w.exercises || []).length} Uebungen</div>
                          <div>{Math.round(w.totalVolume)} kg</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">Noch keine Trainings</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" className="h-auto py-3 flex-col" onClick={() => navigate('/fittutto/coach')}>
                    <Brain className="w-5 h-5 mb-1 text-purple-500" />
                    <span className="text-xs">KI-Coach</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-3 flex-col" onClick={() => navigate('/fittutto/ernaehrung')}>
                    <Apple className="w-5 h-5 mb-1 text-green-500" />
                    <span className="text-xs">Ernaehrung</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-3 flex-col" onClick={() => navigate('/fittutto/koerper')}>
                    <Scale className="w-5 h-5 mb-1 text-blue-500" />
                    <span className="text-xs">Koerper</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-3 flex-col" onClick={() => navigate('/fittutto/historie')}>
                    <History className="w-5 h-5 mb-1 text-orange-500" />
                    <span className="text-xs">Historie</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-3 flex-col" onClick={() => navigate('/fittutto/plan')}>
                    <BarChart3 className="w-5 h-5 mb-1 text-orange-500" />
                    <span className="text-xs">Plaene</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-3 flex-col" onClick={() => navigate('/fittutto/uebungen')}>
                    <Dumbbell className="w-5 h-5 mb-1 text-orange-500" />
                    <span className="text-xs">Uebungen</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const colorClasses: Record<string, string> = {
    orange: 'bg-orange-50 text-orange-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
  }

  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', colorClasses[color])}>
          {icon}
        </div>
        <div>
          <div className="text-lg font-bold">{value}</div>
          <div className="text-xs text-gray-500">{label}</div>
        </div>
      </CardContent>
    </Card>
  )
}
