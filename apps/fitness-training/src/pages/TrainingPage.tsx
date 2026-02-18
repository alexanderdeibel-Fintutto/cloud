import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Plus, Dumbbell, Calendar, Clock, Target, ChevronRight,
  Play, MoreHorizontal, Trash2, Copy, Edit, Lock, Crown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { canSavePlans } from '@/lib/pricing'
import { cn } from '@/lib/utils'
import type { TrainingPlan } from '@/lib/types'

const DAY_LABELS: Record<string, string> = {
  monday: 'Montag', tuesday: 'Dienstag', wednesday: 'Mittwoch',
  thursday: 'Donnerstag', friday: 'Freitag', saturday: 'Samstag', sunday: 'Sonntag',
}

export default function TrainingPage() {
  const { subscriptionTier } = useAuth()
  const navigate = useNavigate()
  const [plans, setPlans] = useState<TrainingPlan[]>([])
  const [activePlanId, setActivePlanId] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('fittutto_plans')
    if (stored) {
      const parsed = JSON.parse(stored)
      setPlans(parsed)
      const active = parsed.find((p: TrainingPlan) => p.isActive)
      if (active) setActivePlanId(active.id)
    }
  }, [])

  const activePlan = plans.find(p => p.id === activePlanId)
  const canSave = canSavePlans(subscriptionTier)

  const deletePlan = (planId: string) => {
    const updated = plans.filter(p => p.id !== planId)
    setPlans(updated)
    localStorage.setItem('fittutto_plans', JSON.stringify(updated))
    if (activePlanId === planId) setActivePlanId(null)
  }

  const setActive = (planId: string) => {
    const updated = plans.map(p => ({ ...p, isActive: p.id === planId }))
    setPlans(updated)
    setActivePlanId(planId)
    localStorage.setItem('fittutto_plans', JSON.stringify(updated))
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Training</h1>
          <p className="text-muted-foreground">Deine Trainingspläne und Workouts</p>
        </div>
        <Link to="/training/new">
          <Button variant="fitness" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Neuer Plan
          </Button>
        </Link>
      </div>

      {/* Active Plan */}
      {activePlan && (
        <Card className="overflow-hidden border-primary/20">
          <div className="gradient-fitness p-1" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-primary font-semibold uppercase tracking-wide">Aktiver Plan</span>
                <CardTitle className="mt-1">{activePlan.name}</CardTitle>
              </div>
              <span className="streak-badge">
                <Calendar className="h-3 w-3" />
                {activePlan.daysPerWeek}x/Woche
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{activePlan.description}</p>

            {/* Workout schedule for this week */}
            <div className="space-y-2">
              {activePlan.workouts
                .filter(w => w.weekNumber === 1)
                .sort((a, b) => a.order - b.order)
                .map(workout => (
                  <div
                    key={workout.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => navigate('/workout', { state: { workout } })}
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Dumbbell className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{workout.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {DAY_LABELS[workout.dayOfWeek]} &middot; {workout.exercises.length} Übungen &middot; ~{workout.estimatedDurationMinutes} min
                      </p>
                    </div>
                    <Play className="h-4 w-4 text-primary flex-shrink-0" />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Plans */}
      {plans.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Alle Pläne</h2>
          <div className="grid gap-3">
            {plans.map(plan => (
              <Card
                key={plan.id}
                className={cn(
                  'transition-all',
                  plan.id === activePlanId && 'border-primary/30'
                )}
              >
                <CardContent className="py-4 px-5">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold truncate">{plan.name}</p>
                        {plan.id === activePlanId && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                            Aktiv
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {plan.daysPerWeek}x/Woche &middot; {plan.durationWeeks} Wochen &middot; {plan.workouts.filter(w => w.weekNumber === 1).reduce((sum, w) => sum + w.exercises.length, 0)} Übungen
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {plan.id !== activePlanId && (
                        <Button variant="ghost" size="sm" onClick={() => setActive(plan.id)}>
                          Aktivieren
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => deletePlan(plan.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {plans.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Noch kein Trainingsplan</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Erstelle deinen ersten personalisierten Trainingsplan mit unserem KI-Generator.
            </p>
            <Link to="/training/new">
              <Button variant="fitness" size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Trainingsplan erstellen
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Save/Load Info */}
      {!canSave && plans.length > 0 && (
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="pt-5 flex items-start gap-3">
            <Lock className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Pläne speichern & laden</p>
              <p className="text-xs text-muted-foreground mt-1">
                Mit dem Speichern & Laden Abo (ab 2,99 €/Monat) kannst du deine Pläne dauerhaft speichern
                und jederzeit wieder laden.
              </p>
              <Link to="/pricing" className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-2">
                <Crown className="h-3 w-3" />
                Jetzt upgraden
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
