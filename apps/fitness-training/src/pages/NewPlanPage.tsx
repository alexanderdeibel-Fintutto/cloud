import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Dumbbell, Zap, Brain, ChevronRight, Loader2, Check,
  Calendar, Clock, Target
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { TrainingPlan, FitnessGoal, FitnessLevel, TrainingLocation, Equipment } from '@/lib/types'
import { generateTrainingPlan } from '@/lib/plan-generator'

const GOAL_LABELS: Record<FitnessGoal, string> = {
  lose_weight: 'Abnehmen',
  build_muscle: 'Muskelaufbau',
  stay_fit: 'Fit bleiben',
  improve_endurance: 'Ausdauer',
  increase_flexibility: 'Beweglichkeit',
  gain_strength: 'Maximalkraft',
}

export default function NewPlanPage() {
  const navigate = useNavigate()
  const [generating, setGenerating] = useState(false)
  const [generationStep, setGenerationStep] = useState(0)
  const [plan, setPlan] = useState<TrainingPlan | null>(null)

  const generationSteps = [
    'Ziele analysieren...',
    'Übungen auswählen...',
    'Trainingsplan erstellen...',
    'Plan optimieren...',
    'Fertig!',
  ]

  const handleGenerate = () => {
    setGenerating(true)
    setGenerationStep(0)

    // Load onboarding data
    const stored = localStorage.getItem('fittutto_onboarding')
    const onboardingData = stored ? JSON.parse(stored) : {
      goal: 'build_muscle',
      level: 'intermediate',
      location: 'gym',
      equipment: ['barbell', 'dumbbells', 'cable_machine', 'bench'],
      daysPerWeek: 4,
      minutesPerSession: 60,
    }

    // Simulate generation steps
    const stepInterval = setInterval(() => {
      setGenerationStep(prev => {
        if (prev >= generationSteps.length - 1) {
          clearInterval(stepInterval)
          return prev
        }
        return prev + 1
      })
    }, 600)

    // Generate plan
    setTimeout(() => {
      const generatedPlan = generateTrainingPlan({
        userId: 'local-user',
        goal: onboardingData.goal || 'build_muscle',
        level: onboardingData.level || 'intermediate',
        location: onboardingData.location || 'gym',
        availableEquipment: onboardingData.equipment || ['barbell', 'dumbbells'],
        daysPerWeek: onboardingData.daysPerWeek || 4,
        minutesPerSession: onboardingData.minutesPerSession || 60,
      })

      setPlan(generatedPlan)
      setGenerating(false)

      // Save to local storage
      const existingPlans = JSON.parse(localStorage.getItem('fittutto_plans') || '[]')
      const updatedPlans = existingPlans.map((p: TrainingPlan) => ({ ...p, isActive: false }))
      updatedPlans.unshift({ ...generatedPlan, isActive: true })
      localStorage.setItem('fittutto_plans', JSON.stringify(updatedPlans))
    }, 3000)
  }

  // Auto-generate on mount
  useEffect(() => {
    handleGenerate()
  }, [])

  const DAY_LABELS: Record<string, string> = {
    monday: 'Mo', tuesday: 'Di', wednesday: 'Mi',
    thursday: 'Do', friday: 'Fr', saturday: 'Sa', sunday: 'So',
  }

  if (generating) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="relative inline-flex mb-8">
            <div className="p-6 rounded-full gradient-fitness animate-pulse-glow">
              <Brain className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">KI erstellt deinen Plan</h1>
          <p className="text-muted-foreground mb-8">
            Basierend auf deinen Angaben wird ein individueller Trainingsplan erstellt.
          </p>

          <div className="space-y-3">
            {generationSteps.map((step, i) => (
              <div
                key={step}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg transition-all',
                  i <= generationStep ? 'bg-primary/5' : 'opacity-40'
                )}
              >
                {i < generationStep ? (
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                ) : i === generationStep ? (
                  <Loader2 className="h-5 w-5 text-primary flex-shrink-0 animate-spin" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-muted flex-shrink-0" />
                )}
                <span className={cn('text-sm', i <= generationStep ? 'font-medium' : 'text-muted-foreground')}>
                  {step}
                </span>
              </div>
            ))}
          </div>

          <Progress value={((generationStep + 1) / generationSteps.length) * 100} className="mt-6" />
        </motion.div>
      </div>
    )
  }

  if (plan) {
    const weekOneWorkouts = plan.workouts.filter(w => w.weekNumber === 1).sort((a, b) => a.order - b.order)

    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-full bg-primary/10 mb-3">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Dein Plan ist fertig!</h1>
            <p className="text-muted-foreground">{plan.name}</p>
          </div>

          {/* Plan overview */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <Calendar className="h-5 w-5 mx-auto text-primary mb-1" />
                  <p className="text-lg font-bold">{plan.daysPerWeek}x</p>
                  <p className="text-xs text-muted-foreground">pro Woche</p>
                </div>
                <div>
                  <Clock className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                  <p className="text-lg font-bold">{plan.durationWeeks}</p>
                  <p className="text-xs text-muted-foreground">Wochen</p>
                </div>
                <div>
                  <Target className="h-5 w-5 mx-auto text-orange-500 mb-1" />
                  <p className="text-lg font-bold">{GOAL_LABELS[plan.goal]}</p>
                  <p className="text-xs text-muted-foreground">Ziel</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly workout cards */}
          <h2 className="text-lg font-semibold mb-3">Woche 1</h2>
          <div className="space-y-3">
            {weekOneWorkouts.map((workout, i) => (
              <motion.div
                key={workout.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{DAY_LABELS[workout.dayOfWeek]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{workout.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {workout.exercises.length} Übungen &middot; ~{workout.estimatedDurationMinutes} min
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {workout.focusArea.slice(0, 3).map(area => (
                            <span key={area} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>

                    {/* Exercise preview */}
                    <div className="mt-3 pt-3 border-t space-y-1.5">
                      {workout.exercises.slice(0, 4).map(ex => (
                        <div key={ex.id} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{ex.exercise?.name || 'Übung'}</span>
                          <span className="font-medium">
                            {ex.sets}x{ex.reps || `${ex.duration}s`}
                            {ex.weight ? ` @ ${ex.weight}kg` : ''}
                          </span>
                        </div>
                      ))}
                      {workout.exercises.length > 4 && (
                        <p className="text-xs text-muted-foreground">+{workout.exercises.length - 4} weitere</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="fitness"
              size="lg"
              className="flex-1"
              onClick={() => navigate('/training')}
            >
              Plan verwenden
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleGenerate}
            >
              Neu generieren
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return null
}
