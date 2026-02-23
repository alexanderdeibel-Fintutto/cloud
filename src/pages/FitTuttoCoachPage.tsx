import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Brain, Dumbbell, Apple, Moon, Zap,
  TrendingUp, Lightbulb, Target,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { useFitness } from '@/contexts/FitnessContext'
import { cn } from '@/lib/utils'
import {
  FITNESS_GOAL_LABELS, FITNESS_GOAL_ICONS,
  MUSCLE_GROUP_LABELS, MuscleGroup,
  CoachTip, FitnessProfile, WorkoutSession, PersonalRecord,
  WorkoutExercise,
} from '@/lib/fitness-types'

type TipCategory = 'training' | 'nutrition' | 'recovery' | 'motivation'

const CATEGORY_META: Record<TipCategory, { label: string; icon: typeof Brain; color: string }> = {
  training: { label: 'Training', icon: Dumbbell, color: 'orange' },
  nutrition: { label: 'Ernaehrung', icon: Apple, color: 'green' },
  recovery: { label: 'Erholung', icon: Moon, color: 'blue' },
  motivation: { label: 'Motivation', icon: Zap, color: 'purple' },
}

function generateCoachTips(
  profile: FitnessProfile | null,
  workoutHistory: WorkoutSession[],
  personalRecords: PersonalRecord[],
): CoachTip[] {
  const tips: CoachTip[] = []
  const goal = profile?.fitnessGoal
  const level = profile?.fitnessLevel
  const daysPerWeek = profile?.trainingDaysPerWeek || 3

  // --- Training Tips ---
  const now = new Date()
  const thisWeekStart = new Date(now)
  thisWeekStart.setDate(now.getDate() - now.getDay() + 1)
  thisWeekStart.setHours(0, 0, 0, 0)
  const thisWeekWorkouts = workoutHistory.filter(w => new Date(w.startedAt) >= thisWeekStart)

  if (thisWeekWorkouts.length < daysPerWeek) {
    const remaining = daysPerWeek - thisWeekWorkouts.length
    tips.push({
      id: 'weekly-target',
      category: 'training',
      title: `Noch ${remaining} Training${remaining > 1 ? 's' : ''} diese Woche`,
      content: `Du hast ${thisWeekWorkouts.length} von ${daysPerWeek} geplanten Trainings absolviert. Bleib dran!`,
      priority: 10,
    })
  } else {
    tips.push({
      id: 'weekly-complete',
      category: 'motivation',
      title: 'Wochenziel erreicht!',
      content: `Starke Leistung! Du hast alle ${daysPerWeek} Trainings diese Woche geschafft. Goennen dir eine aktive Erholung.`,
      priority: 9,
    })
  }

  // Muscle balance analysis
  const last30Days = workoutHistory.filter(w => {
    const d = new Date(w.startedAt)
    return d >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  })
  const muscleFreq: Record<string, number> = {}
  last30Days.forEach(w => {
    (w.exercises || []).forEach((ex: WorkoutExercise) => {
      if (ex.exercise?.primaryMuscles) {
        ex.exercise.primaryMuscles.forEach((m: string) => {
          muscleFreq[m] = (muscleFreq[m] || 0) + 1
        })
      }
    })
  })

  const allMuscles = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'quads', 'hamstrings', 'glutes', 'abs', 'calves']
  const neglected = allMuscles.filter(m => (muscleFreq[m] || 0) < 2)
  if (neglected.length > 0 && last30Days.length > 4) {
    tips.push({
      id: 'muscle-balance',
      category: 'training',
      title: 'Muskelgruppen-Balance',
      content: `Diese Muskelgruppen kamen in den letzten 30 Tagen zu kurz: ${neglected.map(m => MUSCLE_GROUP_LABELS[m as MuscleGroup] || m).join(', ')}. Baue sie in dein naechstes Training ein.`,
      priority: 8,
    })
  }

  // Progressive overload tip
  if (personalRecords.length > 0) {
    const latestPR = personalRecords[0]
    tips.push({
      id: 'progressive-overload',
      category: 'training',
      title: 'Progressive Ueberlastung',
      content: `Dein letzter PR war ${latestPR.exerciseName} mit ${latestPR.weight}kg x ${latestPR.reps}. Versuche beim naechsten Training 2.5kg mehr oder 1 Wiederholung mehr.`,
      priority: 7,
    })
  }

  // --- Goal-specific tips ---
  if (goal === 'build_muscle') {
    tips.push({
      id: 'muscle-tip-1',
      category: 'nutrition',
      title: 'Protein-Zufuhr fuer Muskelaufbau',
      content: `Fuer optimalen Muskelaufbau solltest du ${profile?.weightKg ? Math.round(profile.weightKg * 1.8) + 'g' : '1.6-2.0g/kg'} Protein pro Tag zu dir nehmen. Verteile es auf 4-5 Mahlzeiten.`,
      priority: 8,
    })
    tips.push({
      id: 'muscle-tip-2',
      category: 'training',
      title: 'Optimales Volumen',
      content: 'Fuer Hypertrophie: 10-20 Saetze pro Muskelgruppe pro Woche. Beginne am unteren Ende und steigere langsam.',
      priority: 6,
    })
  }

  if (goal === 'lose_weight') {
    tips.push({
      id: 'weight-tip-1',
      category: 'nutrition',
      title: 'Kaloriendefizit einhalten',
      content: 'Ein moderates Defizit von 300-500 kcal pro Tag ist ideal. Zu aggressive Diaten fuehren zu Muskelabbau und Jojo-Effekt.',
      priority: 8,
    })
    tips.push({
      id: 'weight-tip-2',
      category: 'training',
      title: 'Krafttraining beim Abnehmen',
      content: 'Behalte schweres Krafttraining bei! Es schuetzt deine Muskelmasse waehrend der Diaet und erhoht den Grundumsatz.',
      priority: 7,
    })
  }

  if (goal === 'gain_strength') {
    tips.push({
      id: 'strength-tip-1',
      category: 'training',
      title: 'Schwere Grunduebungen priorisieren',
      content: 'Kniebeugen, Kreuzheben, Bankdruecken und Schulterdrücken sollten den Kern deines Trainings bilden. 3-5 Wiederholungen bei 85-95% des 1RM.',
      priority: 8,
    })
  }

  // --- Recovery tips ---
  const lastWorkout = workoutHistory[0]
  if (lastWorkout) {
    const hoursSince = (Date.now() - new Date(lastWorkout.startedAt).getTime()) / (1000 * 60 * 60)
    if (hoursSince < 16) {
      tips.push({
        id: 'recovery-rest',
        category: 'recovery',
        title: 'Erholungsphase',
        content: `Dein letztes Training war vor ${Math.round(hoursSince)} Stunden. Goennen deinen Muskeln mindestens 48 Stunden Erholung fuer die trainierten Muskelgruppen.`,
        priority: 7,
      })
    }
  }

  tips.push({
    id: 'sleep-tip',
    category: 'recovery',
    title: 'Schlaf ist der Schluessel',
    content: '7-9 Stunden Schlaf pro Nacht sind essenziell fuer Muskelregeneration und Leistungsfaehigkeit. Versuche jeden Tag zur gleichen Zeit ins Bett zu gehen.',
    priority: 5,
  })

  // --- Motivation ---
  if (workoutHistory.length >= 10) {
    tips.push({
      id: 'consistency',
      category: 'motivation',
      title: `${workoutHistory.length} Trainings geschafft!`,
      content: 'Konsistenz ist der wichtigste Faktor fuer Erfolg. Du bist auf dem richtigen Weg - weitermachen!',
      priority: 6,
    })
  }

  // Level-specific advice
  if (level === 'beginner') {
    tips.push({
      id: 'beginner-form',
      category: 'training',
      title: 'Technik vor Gewicht',
      content: 'Als Anfaenger ist die richtige Ausfuehrung wichtiger als schwere Gewichte. Lerne jede Uebung mit leichtem Gewicht und steigere erst, wenn die Form stimmt.',
      priority: 9,
    })
  }

  // Sort by priority (highest first)
  return tips.sort((a, b) => b.priority - a.priority)
}

export default function FitTuttoCoachPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { profile, workoutHistory, personalRecords, loadWorkoutHistory, loadPersonalRecords } = useFitness()
  const [activeCategory, setActiveCategory] = useState<TipCategory | 'all'>('all')
  const [tips, setTips] = useState<CoachTip[]>([])

  useEffect(() => {
    if (user) {
      loadWorkoutHistory()
      loadPersonalRecords()
    }
  }, [user, loadWorkoutHistory, loadPersonalRecords])

  useEffect(() => {
    if (profile) {
      setTips(generateCoachTips(profile, workoutHistory, personalRecords))
    }
  }, [profile, workoutHistory, personalRecords])

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-6">
            <Brain className="w-12 h-12 mx-auto mb-4 text-orange-500" />
            <h2 className="text-xl font-bold mb-2">Anmeldung erforderlich</h2>
            <p className="text-gray-600 mb-4">Melde dich an, um den KI-Coach zu nutzen.</p>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => navigate('/login')}>
              Jetzt anmelden
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const filteredTips = activeCategory === 'all'
    ? tips
    : tips.filter(t => t.category === activeCategory)

  const categoryIcon = (cat: TipCategory) => {
    const meta = CATEGORY_META[cat]
    const Icon = meta.icon
    return <Icon className="w-5 h-5" />
  }

  const categoryColor = (cat: TipCategory): string => {
    const colors: Record<string, string> = {
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
    }
    return colors[CATEGORY_META[cat].color] || colors.orange
  }

  return (
    <div className="py-8 px-4 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mx-auto mb-4 text-white">
            <Brain className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">KI-Coach</h1>
          <p className="text-gray-500 mt-1">
            {profile?.fitnessGoal
              ? `Personalisierte Tipps fuer: ${FITNESS_GOAL_ICONS[profile.fitnessGoal]} ${FITNESS_GOAL_LABELS[profile.fitnessGoal]}`
              : 'Dein persoenlicher Trainings-Berater'}
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border',
              activeCategory === 'all'
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
            )}
          >
            Alle ({tips.length})
          </button>
          {(Object.entries(CATEGORY_META) as [TipCategory, typeof CATEGORY_META['training']][]).map(([key, meta]) => {
            const count = tips.filter(t => t.category === key).length
            return (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border flex items-center gap-1.5',
                  activeCategory === key
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
                )}
              >
                {meta.label} ({count})
              </button>
            )
          })}
        </div>

        {/* Tips */}
        <div className="space-y-3">
          {filteredTips.map((tip, i) => (
            <motion.div
              key={tip.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border', categoryColor(tip.category))}>
                      {categoryIcon(tip.category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm">{tip.title}</h3>
                        <span className={cn('text-xs px-2 py-0.5 rounded-full', categoryColor(tip.category))}>
                          {CATEGORY_META[tip.category].label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{tip.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredTips.length === 0 && (
          <div className="text-center py-12">
            <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Keine Tipps in dieser Kategorie.</p>
          </div>
        )}

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3">Schnellzugriff</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="h-auto py-3 flex-col" onClick={() => navigate('/fittutto/workout')}>
                <Dumbbell className="w-5 h-5 mb-1 text-orange-500" />
                <span className="text-xs">Training starten</span>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col" onClick={() => navigate('/fittutto/ernaehrung')}>
                <Apple className="w-5 h-5 mb-1 text-green-500" />
                <span className="text-xs">Mahlzeit loggen</span>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col" onClick={() => navigate('/fittutto/koerper')}>
                <TrendingUp className="w-5 h-5 mb-1 text-blue-500" />
                <span className="text-xs">Gewicht tracken</span>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col" onClick={() => navigate('/fittutto/profil')}>
                <Target className="w-5 h-5 mb-1 text-purple-500" />
                <span className="text-xs">Ziele aendern</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
