import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Trash2, Edit3, Save, Wand2, GripVertical,
  Dumbbell, Search, X, Check, RefreshCw, ChevronDown, ChevronUp,
  ArrowLeft, ArrowRight, Target, MapPin, Calendar, Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { useFitness } from '@/contexts/FitnessContext'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { EXERCISES, searchExercises } from '@/lib/exercises'
import {
  TrainingPlan, PlanDay, PlanExercise, Exercise,
  FitnessGoal, FitnessLevel, TrainingLocation,
  FITNESS_GOAL_LABELS, FITNESS_GOAL_ICONS, FITNESS_LEVEL_LABELS, LOCATION_LABELS, MUSCLE_GROUP_LABELS,
} from '@/lib/fitness-types'

function generateId() { return crypto.randomUUID() }

// --- Plan generation based on parameters ---
function generatePlanFromGoal(
  goal: FitnessGoal, level: FitnessLevel, location: TrainingLocation, daysPerWeek: number
): PlanDay[] {
  const gymExercises = EXERCISES.filter(e => e.locations.includes(location))

  const splitConfigs: Record<number, { name: string; muscles: string[] }[]> = {
    2: [
      { name: 'Oberkoerper', muscles: ['chest', 'back', 'shoulders', 'biceps', 'triceps'] },
      { name: 'Unterkoerper & Core', muscles: ['quads', 'hamstrings', 'glutes', 'calves', 'abs'] },
    ],
    3: [
      { name: 'Push (Brust, Schultern, Trizeps)', muscles: ['chest', 'shoulders', 'triceps'] },
      { name: 'Pull (Ruecken, Bizeps)', muscles: ['back', 'lats', 'biceps', 'traps'] },
      { name: 'Beine & Core', muscles: ['quads', 'hamstrings', 'glutes', 'calves', 'abs'] },
    ],
    4: [
      { name: 'Brust & Trizeps', muscles: ['chest', 'triceps'] },
      { name: 'Ruecken & Bizeps', muscles: ['back', 'lats', 'biceps'] },
      { name: 'Schultern & Bauch', muscles: ['shoulders', 'traps', 'abs'] },
      { name: 'Beine', muscles: ['quads', 'hamstrings', 'glutes', 'calves'] },
    ],
    5: [
      { name: 'Brust', muscles: ['chest'] },
      { name: 'Ruecken', muscles: ['back', 'lats'] },
      { name: 'Schultern', muscles: ['shoulders', 'traps'] },
      { name: 'Beine', muscles: ['quads', 'hamstrings', 'glutes', 'calves'] },
      { name: 'Arme & Core', muscles: ['biceps', 'triceps', 'abs', 'forearms'] },
    ],
    6: [
      { name: 'Push A (Brust-Fokus)', muscles: ['chest', 'shoulders', 'triceps'] },
      { name: 'Pull A (Ruecken-Fokus)', muscles: ['back', 'lats', 'biceps'] },
      { name: 'Beine A (Quad-Fokus)', muscles: ['quads', 'glutes', 'abs'] },
      { name: 'Push B (Schulter-Fokus)', muscles: ['shoulders', 'chest', 'triceps'] },
      { name: 'Pull B (Lat-Fokus)', muscles: ['lats', 'back', 'biceps', 'traps'] },
      { name: 'Beine B (Beinbeuger-Fokus)', muscles: ['hamstrings', 'glutes', 'calves', 'abs'] },
    ],
  }

  const setsPerExercise = goal === 'gain_strength' ? 4 : goal === 'build_muscle' ? 3 : 3
  const repsRange = goal === 'gain_strength' ? '3-5' : goal === 'build_muscle' ? '8-12' : '10-15'
  const restSeconds = goal === 'gain_strength' ? 180 : goal === 'build_muscle' ? 90 : 60
  const exercisesPerDay = level === 'beginner' ? 4 : level === 'intermediate' ? 5 : 6

  const splits = splitConfigs[Math.min(daysPerWeek, 6)] || splitConfigs[3]

  return splits.map((split, dayIdx) => {
    const muscleExercises = gymExercises.filter(e =>
      e.primaryMuscles.some(m => split.muscles.includes(m))
    )

    const selected: Exercise[] = []
    const usedIds = new Set<string>()
    for (const ex of muscleExercises) {
      if (selected.length >= exercisesPerDay) break
      if (!usedIds.has(ex.id)) {
        selected.push(ex)
        usedIds.add(ex.id)
      }
    }

    const planExercises: PlanExercise[] = selected.map((ex, i) => ({
      exerciseId: ex.id,
      exercise: ex,
      sets: setsPerExercise,
      reps: repsRange,
      restSeconds,
      order: i,
    }))

    return {
      id: generateId(),
      name: `Tag ${dayIdx + 1}: ${split.name}`,
      exercises: planExercises,
      estimatedMinutes: planExercises.length * setsPerExercise * 2 + planExercises.length * (restSeconds / 60) * setsPerExercise,
    }
  })
}

export default function FitTuttoPlanPage() {
  const { user } = useAuth()
  const { profile, plans, savePlan, deletePlan, setActivePlan, loadPlans } = useFitness()

  const [view, setView] = useState<'list' | 'edit' | 'wizard'>('list')
  const [editingPlan, setEditingPlan] = useState<TrainingPlan | null>(null)
  const [wizardStep, setWizardStep] = useState(0)

  // Generator state - starts empty so user MUST choose
  const [genGoal, setGenGoal] = useState<FitnessGoal | ''>('')
  const [genLevel, setGenLevel] = useState<FitnessLevel | ''>('')
  const [genLocation, setGenLocation] = useState<TrainingLocation | ''>('')
  const [genDays, setGenDays] = useState('')
  const [genName, setGenName] = useState('')

  // Edit view: settings panel
  const [showSettings, setShowSettings] = useState(false)

  // Exercise picker
  const [showPicker, setShowPicker] = useState(false)
  const [pickerDayId, setPickerDayId] = useState<string | null>(null)
  const [pickerQuery, setPickerQuery] = useState('')

  // Exercise swap
  const [showSwap, setShowSwap] = useState(false)
  const [swapDayId, setSwapDayId] = useState<string | null>(null)
  const [swapIndex, setSwapIndex] = useState<number>(0)
  const [swapQuery, setSwapQuery] = useState('')

  useEffect(() => { loadPlans() }, [loadPlans])

  const startWizard = () => {
    // Pre-fill from profile if available, but user can change everything
    setGenGoal(profile?.fitnessGoal || '')
    setGenLevel(profile?.fitnessLevel || '')
    setGenLocation(profile?.trainingLocation || '')
    setGenDays(profile?.trainingDaysPerWeek?.toString() || '')
    setGenName('')
    setWizardStep(0)
    setView('wizard')
  }

  const handleGenerate = () => {
    if (!genGoal || !genLevel || !genLocation || !genDays) {
      toast.error('Bitte fuelle alle Felder aus.')
      return
    }
    const days = generatePlanFromGoal(genGoal as FitnessGoal, genLevel as FitnessLevel, genLocation as TrainingLocation, parseInt(genDays))
    const planName = genName.trim() || `${FITNESS_GOAL_LABELS[genGoal as FitnessGoal]} - ${parseInt(genDays)}x/Woche`
    const plan: TrainingPlan = {
      id: generateId(),
      userId: user?.id || '',
      name: planName,
      description: `${FITNESS_LEVEL_LABELS[genLevel as FitnessLevel]} | ${LOCATION_LABELS[genLocation as TrainingLocation]}`,
      goal: genGoal as FitnessGoal,
      level: genLevel as FitnessLevel,
      location: genLocation as TrainingLocation,
      durationWeeks: 8,
      daysPerWeek: parseInt(genDays),
      days,
      isActive: false,
      isTemplate: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setEditingPlan(plan)
    setShowSettings(false)
    setView('edit')
  }

  const handleSavePlan = async () => {
    if (!editingPlan) return
    await savePlan(editingPlan)
    toast.success('Trainingsplan gespeichert!')
    setView('list')
    setEditingPlan(null)
  }

  const handleActivate = async (planId: string) => {
    await setActivePlan(planId)
    toast.success('Plan aktiviert!')
  }

  const handleDeletePlan = async (planId: string) => {
    await deletePlan(planId)
    toast.success('Plan geloescht.')
  }

  const editPlan = (plan: TrainingPlan) => {
    setEditingPlan({ ...plan })
    setShowSettings(false)
    setView('edit')
  }

  // --- Plan Editor helpers ---
  const updatePlanDay = (dayId: string, update: Partial<PlanDay>) => {
    if (!editingPlan) return
    setEditingPlan({
      ...editingPlan,
      days: editingPlan.days.map(d => d.id === dayId ? { ...d, ...update } : d),
    })
  }

  const addDay = () => {
    if (!editingPlan) return
    setEditingPlan({
      ...editingPlan,
      days: [...editingPlan.days, {
        id: generateId(),
        name: `Tag ${editingPlan.days.length + 1}`,
        exercises: [],
        estimatedMinutes: 0,
      }],
    })
  }

  const removeDay = (dayId: string) => {
    if (!editingPlan) return
    setEditingPlan({
      ...editingPlan,
      days: editingPlan.days.filter(d => d.id !== dayId),
    })
  }

  const addExerciseToDay = (dayId: string, exercise: Exercise) => {
    if (!editingPlan) return
    const day = editingPlan.days.find(d => d.id === dayId)
    if (!day) return

    const pe: PlanExercise = {
      exerciseId: exercise.id,
      exercise,
      sets: exercise.defaultSets || 3,
      reps: `${exercise.defaultReps || 10}`,
      restSeconds: exercise.defaultRestSeconds || 90,
      order: day.exercises.length,
    }

    updatePlanDay(dayId, { exercises: [...day.exercises, pe] })
    setShowPicker(false)
    setPickerQuery('')
  }

  const removeExerciseFromDay = (dayId: string, order: number) => {
    if (!editingPlan) return
    const day = editingPlan.days.find(d => d.id === dayId)
    if (!day) return
    updatePlanDay(dayId, {
      exercises: day.exercises.filter((_, i) => i !== order).map((e, i) => ({ ...e, order: i })),
    })
  }

  const updateExerciseInDay = (dayId: string, order: number, update: Partial<PlanExercise>) => {
    if (!editingPlan) return
    const day = editingPlan.days.find(d => d.id === dayId)
    if (!day) return
    updatePlanDay(dayId, {
      exercises: day.exercises.map((e, i) => i === order ? { ...e, ...update } : e),
    })
  }

  const swapExercise = (dayId: string, index: number, newExercise: Exercise) => {
    if (!editingPlan) return
    const day = editingPlan.days.find(d => d.id === dayId)
    if (!day) return
    const old = day.exercises[index]
    updatePlanDay(dayId, {
      exercises: day.exercises.map((e, i) => i === index ? {
        ...e,
        exerciseId: newExercise.id,
        exercise: newExercise,
        sets: old.sets,
        reps: old.reps,
        restSeconds: newExercise.defaultRestSeconds || old.restSeconds,
      } : e),
    })
    setShowSwap(false)
    setSwapQuery('')
  }

  const getSwapSuggestions = (): Exercise[] => {
    if (!editingPlan || !swapDayId) return []
    const day = editingPlan.days.find(d => d.id === swapDayId)
    if (!day || !day.exercises[swapIndex]) return []
    const currentEx = day.exercises[swapIndex].exercise
    const usedIds = new Set(day.exercises.map(e => e.exerciseId))

    if (swapQuery) {
      return searchExercises(swapQuery).filter(e => !usedIds.has(e.id))
    }

    return EXERCISES.filter(e =>
      !usedIds.has(e.id) &&
      e.primaryMuscles.some(m => currentEx.primaryMuscles.includes(m))
    ).slice(0, 20)
  }

  const pickerResults = pickerQuery ? searchExercises(pickerQuery) : EXERCISES.slice(0, 30)

  const wizardSteps = [
    { key: 'goal', title: 'Was ist dein Ziel?', icon: <Target className="w-6 h-6" /> },
    { key: 'level', title: 'Dein Fitness-Level?', icon: <Zap className="w-6 h-6" /> },
    { key: 'location', title: 'Wo trainierst du?', icon: <MapPin className="w-6 h-6" /> },
    { key: 'days', title: 'Wie oft pro Woche?', icon: <Calendar className="w-6 h-6" /> },
  ]

  const canGoNext = (): boolean => {
    if (wizardStep === 0) return !!genGoal
    if (wizardStep === 1) return !!genLevel
    if (wizardStep === 2) return !!genLocation
    if (wizardStep === 3) return !!genDays
    return false
  }

  // Regenerate plan in edit view with new parameters
  const regenerateInEditor = () => {
    if (!editingPlan || !editingPlan.goal || !editingPlan.level || !editingPlan.location) {
      toast.error('Bitte waehle Ziel, Level und Trainingsort.')
      return
    }
    const days = generatePlanFromGoal(editingPlan.goal, editingPlan.level, editingPlan.location, editingPlan.daysPerWeek)
    setEditingPlan({
      ...editingPlan,
      days,
      description: `${FITNESS_LEVEL_LABELS[editingPlan.level]} | ${LOCATION_LABELS[editingPlan.location]}`,
    })
    toast.success('Plan neu generiert!')
    setShowSettings(false)
  }

  // --- WIZARD VIEW ---
  if (view === 'wizard') {
    return (
      <div className="py-8 px-4 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="ghost" onClick={() => setView('list')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Zurueck
          </Button>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2 mb-8">
            {wizardSteps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-2 flex-1 rounded-full transition-all duration-300',
                  i <= wizardStep ? 'bg-orange-500' : 'bg-gray-200'
                )}
              />
            ))}
          </div>

          {/* Step Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-4 text-orange-600">
              {wizardSteps[wizardStep].icon}
            </div>
            <h1 className="text-2xl font-bold">{wizardSteps[wizardStep].title}</h1>
            <p className="text-gray-500 mt-1">Schritt {wizardStep + 1} von {wizardSteps.length}</p>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={wizardStep}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
            >
              {/* Step 0: Goal */}
              {wizardStep === 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {(Object.entries(FITNESS_GOAL_LABELS) as [FitnessGoal, string][]).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setGenGoal(key)}
                      className={cn(
                        'p-5 rounded-2xl border-2 text-left transition-all',
                        genGoal === key
                          ? 'border-orange-500 bg-orange-50 shadow-md shadow-orange-100'
                          : 'border-gray-200 hover:border-orange-300 bg-white'
                      )}
                    >
                      <span className="text-3xl block mb-2">{FITNESS_GOAL_ICONS[key]}</span>
                      <span className="font-semibold text-sm">{label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 1: Level */}
              {wizardStep === 1 && (
                <div className="space-y-3">
                  {(Object.entries(FITNESS_LEVEL_LABELS) as [FitnessLevel, string][]).map(([key, label]) => {
                    const descriptions: Record<string, string> = {
                      beginner: 'Weniger als 6 Monate Trainingserfahrung',
                      intermediate: '6 Monate bis 2 Jahre regelmaessiges Training',
                      advanced: 'Mehr als 2 Jahre konsequentes Training',
                      professional: 'Wettkampf-Athlet oder Coach',
                    }
                    return (
                      <button
                        key={key}
                        onClick={() => setGenLevel(key)}
                        className={cn(
                          'w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4',
                          genLevel === key
                            ? 'border-orange-500 bg-orange-50 shadow-md shadow-orange-100'
                            : 'border-gray-200 hover:border-orange-300 bg-white'
                        )}
                      >
                        <div className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold',
                          genLevel === key ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'
                        )}>
                          {key === 'beginner' && '1'}
                          {key === 'intermediate' && '2'}
                          {key === 'advanced' && '3'}
                          {key === 'professional' && '4'}
                        </div>
                        <div>
                          <div className="font-semibold">{label}</div>
                          <div className="text-sm text-gray-500">{descriptions[key]}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Step 2: Location */}
              {wizardStep === 2 && (
                <div className="space-y-3">
                  {(Object.entries(LOCATION_LABELS) as [TrainingLocation, string][]).map(([key, label]) => {
                    const icons: Record<string, string> = {
                      gym: 'Alle Geraete verfuegbar',
                      home: 'Koerpergewicht, Hanteln, Baender',
                      outdoor: 'Laufen, Calisthenics, Koerpergewicht',
                    }
                    return (
                      <button
                        key={key}
                        onClick={() => setGenLocation(key)}
                        className={cn(
                          'w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4',
                          genLocation === key
                            ? 'border-orange-500 bg-orange-50 shadow-md shadow-orange-100'
                            : 'border-gray-200 hover:border-orange-300 bg-white'
                        )}
                      >
                        <div className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center',
                          genLocation === key ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'
                        )}>
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold">{label}</div>
                          <div className="text-sm text-gray-500">{icons[key]}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Step 3: Days per week */}
              {wizardStep === 3 && (
                <div>
                  <div className="grid grid-cols-5 gap-3 mb-6">
                    {[2, 3, 4, 5, 6].map(n => (
                      <button
                        key={n}
                        onClick={() => setGenDays(n.toString())}
                        className={cn(
                          'aspect-square rounded-2xl border-2 flex flex-col items-center justify-center transition-all',
                          genDays === n.toString()
                            ? 'border-orange-500 bg-orange-50 shadow-md shadow-orange-100'
                            : 'border-gray-200 hover:border-orange-300 bg-white'
                        )}
                      >
                        <span className="text-2xl font-bold">{n}</span>
                        <span className="text-xs text-gray-500">Tage</span>
                      </button>
                    ))}
                  </div>
                  <div>
                    <Label>Plan-Name (optional)</Label>
                    <Input
                      value={genName}
                      onChange={e => setGenName(e.target.value)}
                      placeholder={genGoal ? `${FITNESS_GOAL_LABELS[genGoal as FitnessGoal]} - ${genDays}x/Woche` : 'Mein Trainingsplan'}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8">
            {wizardStep > 0 && (
              <Button variant="outline" size="lg" onClick={() => setWizardStep(s => s - 1)} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" /> Zurueck
              </Button>
            )}
            {wizardStep < wizardSteps.length - 1 ? (
              <Button
                size="lg"
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => setWizardStep(s => s + 1)}
                disabled={!canGoNext()}
              >
                Weiter <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                size="lg"
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                onClick={handleGenerate}
                disabled={!canGoNext()}
              >
                <Wand2 className="w-5 h-5 mr-2" /> Plan generieren
              </Button>
            )}
          </div>

          {/* Summary of selections */}
          {wizardStep > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <div className="text-xs font-medium text-gray-400 uppercase mb-2">Deine Auswahl</div>
              <div className="flex flex-wrap gap-2">
                {genGoal && (
                  <span className="px-3 py-1 bg-white rounded-full text-sm border border-orange-200 text-orange-700">
                    {FITNESS_GOAL_ICONS[genGoal as FitnessGoal]} {FITNESS_GOAL_LABELS[genGoal as FitnessGoal]}
                  </span>
                )}
                {genLevel && (
                  <span className="px-3 py-1 bg-white rounded-full text-sm border border-orange-200 text-orange-700">
                    {FITNESS_LEVEL_LABELS[genLevel as FitnessLevel]}
                  </span>
                )}
                {genLocation && (
                  <span className="px-3 py-1 bg-white rounded-full text-sm border border-orange-200 text-orange-700">
                    {LOCATION_LABELS[genLocation as TrainingLocation]}
                  </span>
                )}
                {genDays && (
                  <span className="px-3 py-1 bg-white rounded-full text-sm border border-orange-200 text-orange-700">
                    {genDays}x/Woche
                  </span>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    )
  }

  // --- LIST VIEW ---
  if (view === 'list') {
    const userPlans = plans.filter(p => !p.isTemplate)

    return (
      <div className="py-8 px-4 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Trainingsplaene</h1>
                <p className="text-gray-500">{userPlans.length} {userPlans.length === 1 ? 'Plan' : 'Plaene'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={startWizard}
              >
                <Wand2 className="w-4 h-4 mr-2" /> Neuer Plan
              </Button>
            </div>
          </div>

          {userPlans.length === 0 ? (
            <Card className="text-center py-16 border-2 border-dashed">
              <CardContent>
                <div className="w-20 h-20 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-6">
                  <Dumbbell className="w-10 h-10 text-orange-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Erstelle deinen ersten Plan</h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  Waehle dein Ziel, Level und Trainingsort - wir erstellen dir einen massgeschneiderten Trainingsplan.
                </p>
                <Button
                  size="lg"
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={startWizard}
                >
                  <Wand2 className="w-5 h-5 mr-2" /> Plan erstellen
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {userPlans.map(plan => (
                <Card key={plan.id} className={cn(
                  'transition-all hover:shadow-md',
                  plan.isActive && 'ring-2 ring-orange-500 shadow-md shadow-orange-50'
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{plan.name}</h3>
                          {plan.isActive && (
                            <span className="text-xs bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full font-medium">Aktiv</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {plan.daysPerWeek}x/Woche · {plan.days.length} Tage · {plan.days.reduce((sum, d) => sum + d.exercises.length, 0)} Uebungen
                        </p>
                        {plan.goal && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {FITNESS_GOAL_ICONS[plan.goal]} {FITNESS_GOAL_LABELS[plan.goal]}
                            </span>
                            {plan.level && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                {FITNESS_LEVEL_LABELS[plan.level]}
                              </span>
                            )}
                            {plan.location && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                {LOCATION_LABELS[plan.location]}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 ml-2">
                        {!plan.isActive && (
                          <Button size="sm" variant="outline" onClick={() => handleActivate(plan.id)} className="text-orange-600 border-orange-200 hover:bg-orange-50">
                            <Check className="w-4 h-4 mr-1" /> Aktivieren
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => editPlan(plan)}>
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeletePlan(plan.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    )
  }

  // --- EDIT VIEW ---
  if (view === 'edit' && editingPlan) {
    return (
      <div className="py-8 px-4 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => { setView('list'); setEditingPlan(null) }}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Zurueck
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleSavePlan}>
              <Save className="w-4 h-4 mr-2" /> Speichern
            </Button>
          </div>

          {/* Plan Name & Description */}
          <div className="mb-4">
            <Input
              value={editingPlan.name}
              onChange={e => setEditingPlan({ ...editingPlan, name: e.target.value })}
              className="text-2xl font-bold border-none p-0 h-auto focus-visible:ring-0"
              placeholder="Plan-Name..."
            />
            <Input
              value={editingPlan.description || ''}
              onChange={e => setEditingPlan({ ...editingPlan, description: e.target.value })}
              className="text-gray-500 border-none p-0 h-auto focus-visible:ring-0 mt-1"
              placeholder="Beschreibung (optional)..."
            />
          </div>

          {/* Plan Settings - Collapsible */}
          <Card className="mb-6">
            <button
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-xl"
              onClick={() => setShowSettings(!showSettings)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Target className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Planeinstellungen</div>
                  <div className="text-sm text-gray-500">
                    {editingPlan.goal ? `${FITNESS_GOAL_LABELS[editingPlan.goal]}` : 'Kein Ziel'}
                    {editingPlan.level ? ` · ${FITNESS_LEVEL_LABELS[editingPlan.level]}` : ''}
                    {editingPlan.location ? ` · ${LOCATION_LABELS[editingPlan.location]}` : ''}
                    {editingPlan.daysPerWeek ? ` · ${editingPlan.daysPerWeek}x/Woche` : ''}
                  </div>
                </div>
              </div>
              {showSettings ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <CardContent className="pt-0 pb-4 space-y-4 border-t">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                      <div>
                        <Label>Ziel</Label>
                        <Select
                          value={editingPlan.goal || ''}
                          onValueChange={v => setEditingPlan({ ...editingPlan, goal: v as FitnessGoal })}
                        >
                          <SelectTrigger><SelectValue placeholder="Ziel waehlen..." /></SelectTrigger>
                          <SelectContent>
                            {(Object.entries(FITNESS_GOAL_LABELS) as [FitnessGoal, string][]).map(([k, v]) => (
                              <SelectItem key={k} value={k}>{FITNESS_GOAL_ICONS[k]} {v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Level</Label>
                        <Select
                          value={editingPlan.level || ''}
                          onValueChange={v => setEditingPlan({ ...editingPlan, level: v as FitnessLevel })}
                        >
                          <SelectTrigger><SelectValue placeholder="Level waehlen..." /></SelectTrigger>
                          <SelectContent>
                            {(Object.entries(FITNESS_LEVEL_LABELS) as [FitnessLevel, string][]).map(([k, v]) => (
                              <SelectItem key={k} value={k}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Trainingsort</Label>
                        <Select
                          value={editingPlan.location || ''}
                          onValueChange={v => setEditingPlan({ ...editingPlan, location: v as TrainingLocation })}
                        >
                          <SelectTrigger><SelectValue placeholder="Ort waehlen..." /></SelectTrigger>
                          <SelectContent>
                            {(Object.entries(LOCATION_LABELS) as [TrainingLocation, string][]).map(([k, v]) => (
                              <SelectItem key={k} value={k}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Trainingstage pro Woche</Label>
                        <Select
                          value={editingPlan.daysPerWeek.toString()}
                          onValueChange={v => setEditingPlan({ ...editingPlan, daysPerWeek: parseInt(v) })}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {[2, 3, 4, 5, 6].map(n => (
                              <SelectItem key={n} value={n.toString()}>{n}x pro Woche</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border-orange-200 text-orange-600 hover:bg-orange-50"
                      onClick={regenerateInEditor}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" /> Uebungen neu generieren
                    </Button>
                    <p className="text-xs text-gray-400 text-center">
                      Achtung: Generiert alle Tage und Uebungen neu basierend auf den Einstellungen.
                    </p>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Days */}
          <div className="space-y-4">
            {editingPlan.days.map((day) => (
              <Card key={day.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Input
                      value={day.name}
                      onChange={e => updatePlanDay(day.id, { name: e.target.value })}
                      className="font-semibold border-none p-0 h-auto focus-visible:ring-0 text-lg"
                    />
                    <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => removeDay(day.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {day.exercises.map((pe, exIdx) => (
                      <div key={exIdx} className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                        <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{pe.exercise.name}</div>
                          <div className="text-xs text-gray-500">
                            {pe.exercise.primaryMuscles.map(m => MUSCLE_GROUP_LABELS[m]).join(', ')}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            value={pe.sets}
                            onChange={e => updateExerciseInDay(day.id, exIdx, { sets: parseInt(e.target.value) || 3 })}
                            className="w-14 h-8 text-xs text-center rounded-lg"
                          />
                          <span className="text-xs text-gray-400">x</span>
                          <Input
                            value={pe.reps}
                            onChange={e => updateExerciseInDay(day.id, exIdx, { reps: e.target.value })}
                            className="w-16 h-8 text-xs text-center rounded-lg"
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-orange-400 hover:bg-orange-50"
                          title="Uebung tauschen"
                          onClick={() => { setSwapDayId(day.id); setSwapIndex(exIdx); setShowSwap(true) }}
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                          onClick={() => removeExerciseFromDay(day.id, exIdx)}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 border border-dashed text-gray-500 hover:text-orange-600 hover:border-orange-300"
                    onClick={() => { setPickerDayId(day.id); setShowPicker(true) }}
                  >
                    <Plus className="w-3 h-3 mr-1" /> Uebung hinzufuegen
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button variant="outline" className="w-full mt-4 border-dashed" onClick={addDay}>
            <Plus className="w-4 h-4 mr-2" /> Tag hinzufuegen
          </Button>

          <div className="mt-6">
            <Button size="lg" className="w-full bg-orange-500 hover:bg-orange-600 text-white" onClick={handleSavePlan}>
              <Save className="w-5 h-5 mr-2" /> Plan speichern
            </Button>
          </div>
        </motion.div>

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
                    <button onClick={() => setShowPicker(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
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
                      onClick={() => {
                        if (pickerDayId) addExerciseToDay(pickerDayId, ex)
                      }}
                      className="w-full text-left p-3 rounded-xl hover:bg-orange-50 flex items-center gap-3 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <Dumbbell className="w-5 h-5 text-orange-500" />
                      </div>
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

        {/* Exercise Swap Modal */}
        <AnimatePresence>
          {showSwap && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
              onClick={() => setShowSwap(false)}
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
                    <div>
                      <h3 className="font-bold text-lg">Uebung tauschen</h3>
                      <p className="text-sm text-gray-500">Aehnliche Uebungen fuer gleiche Muskelgruppe</p>
                    </div>
                    <button onClick={() => setShowSwap(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      value={swapQuery}
                      onChange={e => setSwapQuery(e.target.value)}
                      placeholder="Oder suche eine andere Uebung..."
                      className="pl-10"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="overflow-y-auto flex-1 p-2">
                  {getSwapSuggestions().map(ex => (
                    <button
                      key={ex.id}
                      onClick={() => {
                        if (swapDayId) swapExercise(swapDayId, swapIndex, ex)
                      }}
                      className="w-full text-left p-3 rounded-xl hover:bg-orange-50 flex items-center gap-3 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <RefreshCw className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{ex.name}</div>
                        <div className="text-xs text-gray-500">
                          {ex.primaryMuscles.map(m => MUSCLE_GROUP_LABELS[m]).join(', ')}
                          {ex.equipment.length > 0 && ` · ${ex.equipment[0]}`}
                        </div>
                      </div>
                    </button>
                  ))}
                  {getSwapSuggestions().length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      Keine passenden Uebungen gefunden
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return null
}
