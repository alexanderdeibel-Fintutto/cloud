import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Trash2, Edit3, Save, Wand2, GripVertical,
  Dumbbell, Search, X, Check, RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
  FITNESS_GOAL_LABELS, FITNESS_LEVEL_LABELS, LOCATION_LABELS, MUSCLE_GROUP_LABELS,
} from '@/lib/fitness-types'

function generateId() { return crypto.randomUUID() }

// --- Plan Templates based on Goal ---
function generatePlanFromGoal(
  goal: FitnessGoal, level: FitnessLevel, location: TrainingLocation, daysPerWeek: number
): PlanDay[] {
  const gymExercises = EXERCISES.filter(e => e.locations.includes(location))

  const splitConfigs: Record<number, { name: string; muscles: string[] }[]> = {
    2: [
      { name: 'Oberkoerper', muscles: ['chest', 'back', 'shoulders', 'biceps', 'triceps'] },
      { name: 'Unterkoerper', muscles: ['quads', 'hamstrings', 'glutes', 'calves', 'abs'] },
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

    // Pick exercises avoiding duplicates
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

  const [view, setView] = useState<'list' | 'edit' | 'generate'>('list')
  const [editingPlan, setEditingPlan] = useState<TrainingPlan | null>(null)

  // Generator state
  const [genGoal, setGenGoal] = useState<FitnessGoal>(profile?.fitnessGoal || 'build_muscle')
  const [genLevel, setGenLevel] = useState<FitnessLevel>(profile?.fitnessLevel || 'intermediate')
  const [genLocation, setGenLocation] = useState<TrainingLocation>(profile?.trainingLocation || 'gym')
  const [genDays, setGenDays] = useState(profile?.trainingDaysPerWeek?.toString() || '3')

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

  useEffect(() => {
    if (profile) {
      setGenGoal(profile.fitnessGoal || 'build_muscle')
      setGenLevel(profile.fitnessLevel || 'intermediate')
      setGenLocation(profile.trainingLocation || 'gym')
      setGenDays(profile.trainingDaysPerWeek?.toString() || '3')
    }
  }, [profile])

  const handleGenerate = () => {
    const days = generatePlanFromGoal(genGoal, genLevel, genLocation, parseInt(genDays))
    const plan: TrainingPlan = {
      id: generateId(),
      userId: user?.id || '',
      name: `${FITNESS_GOAL_LABELS[genGoal]} - ${parseInt(genDays)}x/Woche`,
      description: `${FITNESS_LEVEL_LABELS[genLevel]} | ${LOCATION_LABELS[genLocation]}`,
      goal: genGoal,
      level: genLevel,
      location: genLocation,
      durationWeeks: 8,
      daysPerWeek: parseInt(genDays),
      days,
      isActive: false,
      isTemplate: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setEditingPlan(plan)
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

    // Find similar exercises (same primary muscles, not already in this day)
    return EXERCISES.filter(e =>
      !usedIds.has(e.id) &&
      e.primaryMuscles.some(m => currentEx.primaryMuscles.includes(m))
    ).slice(0, 20)
  }

  const pickerResults = pickerQuery ? searchExercises(pickerQuery) : EXERCISES.slice(0, 30)

  // --- LIST VIEW ---
  if (view === 'list') {
    return (
      <div className="py-8 px-4 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Trainingsplaene</h1>
                <p className="text-gray-500">{plans.length} {plans.length === 1 ? 'Plan' : 'Plaene'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setView('generate')}>
                <Wand2 className="w-4 h-4 mr-2" /> KI-Generator
              </Button>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => {
                const plan: TrainingPlan = {
                  id: generateId(), userId: user?.id || '', name: 'Neuer Plan',
                  description: null, goal: null, level: null, location: null,
                  durationWeeks: 8, daysPerWeek: 3, days: [],
                  isActive: false, isTemplate: false,
                  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
                }
                setEditingPlan(plan)
                setView('edit')
              }}>
                <Plus className="w-4 h-4 mr-2" /> Neuer Plan
              </Button>
            </div>
          </div>

          {plans.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Dumbbell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">Noch keine Plaene</h3>
                <p className="text-gray-500 mb-4">Erstelle deinen ersten Trainingsplan oder lass dir einen generieren.</p>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => setView('generate')}>
                  <Wand2 className="w-4 h-4 mr-2" /> Plan generieren
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {plans.map(plan => (
                <Card key={plan.id} className={cn(plan.isActive && 'ring-2 ring-orange-500')}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{plan.name}</h3>
                          {plan.isActive && (
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Aktiv</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {plan.daysPerWeek}x/Woche · {plan.days.length} Tage · {plan.days.reduce((sum, d) => sum + d.exercises.length, 0)} Uebungen
                        </p>
                        {plan.goal && (
                          <span className="text-xs text-gray-400">{FITNESS_GOAL_LABELS[plan.goal]} · {plan.level && FITNESS_LEVEL_LABELS[plan.level]}</span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {!plan.isActive && (
                          <Button size="sm" variant="ghost" onClick={() => handleActivate(plan.id)}>
                            <Check className="w-4 h-4 mr-1" /> Aktivieren
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => editPlan(plan)}>
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeletePlan(plan.id)} className="text-red-500 hover:text-red-600">
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

  // --- GENERATE VIEW ---
  if (view === 'generate') {
    return (
      <div className="py-8 px-4 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="ghost" onClick={() => setView('list')} className="mb-4">
            ← Zurueck
          </Button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
              <Wand2 className="w-8 h-8 text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold">Plan generieren</h1>
            <p className="text-gray-500">Wir erstellen dir einen massgeschneiderten Plan</p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label>Ziel</Label>
                  <Select value={genGoal} onValueChange={v => setGenGoal(v as FitnessGoal)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.entries(FITNESS_GOAL_LABELS) as [FitnessGoal, string][]).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Level</Label>
                  <Select value={genLevel} onValueChange={v => setGenLevel(v as FitnessLevel)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.entries(FITNESS_LEVEL_LABELS) as [FitnessLevel, string][]).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Trainingsort</Label>
                  <Select value={genLocation} onValueChange={v => setGenLocation(v as TrainingLocation)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.entries(LOCATION_LABELS) as [TrainingLocation, string][]).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Trainingstage pro Woche</Label>
                  <Select value={genDays} onValueChange={setGenDays}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 5, 6].map(n => (
                        <SelectItem key={n} value={n.toString()}>{n}x pro Woche</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Button
              size="lg"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              onClick={handleGenerate}
            >
              <Wand2 className="w-5 h-5 mr-2" /> Plan generieren
            </Button>
          </div>
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
              ← Zurueck
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleSavePlan}>
              <Save className="w-4 h-4 mr-2" /> Speichern
            </Button>
          </div>

          {/* Plan Name */}
          <div className="mb-6">
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
                    <Button size="sm" variant="ghost" className="text-red-400" onClick={() => removeDay(day.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {/* Exercises in this day */}
                  <div className="space-y-2">
                    {day.exercises.map((pe, exIdx) => (
                      <div key={exIdx} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
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
                            className="w-14 h-7 text-xs text-center"
                          />
                          <span className="text-xs text-gray-400">x</span>
                          <Input
                            value={pe.reps}
                            onChange={e => updateExerciseInDay(day.id, exIdx, { reps: e.target.value })}
                            className="w-16 h-7 text-xs text-center"
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-orange-400"
                          title="Uebung tauschen"
                          onClick={() => { setSwapDayId(day.id); setSwapIndex(exIdx); setShowSwap(true) }}
                        >
                          <RefreshCw className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-gray-400"
                          onClick={() => removeExerciseFromDay(day.id, exIdx)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 border border-dashed text-gray-500"
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
                      onClick={() => {
                        if (pickerDayId) addExerciseToDay(pickerDayId, ex)
                      }}
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
                    <button onClick={() => setShowSwap(false)}><X className="w-5 h-5" /></button>
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
                      className="w-full text-left p-3 rounded-lg hover:bg-orange-50 flex items-center gap-3 transition-colors"
                    >
                      <RefreshCw className="w-5 h-5 text-orange-500 flex-shrink-0" />
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
