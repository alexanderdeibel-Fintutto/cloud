import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Apple, Plus, Trash2, ChevronLeft, ChevronRight, X,
  Flame, Beef, Wheat, Droplets,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/AuthContext'
import { useFitness } from '@/contexts/FitnessContext'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  MealEntry, MealType,
  MEAL_TYPE_LABELS, MEAL_TYPE_ICONS,
} from '@/lib/fitness-types'

function generateId() { return crypto.randomUUID() }

function formatDateDE(date: Date): string {
  const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
  return `${days[date.getDay()]}, ${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`
}

function toDateStr(date: Date): string {
  return date.toISOString().split('T')[0]
}

// Common German foods for quick add
const QUICK_FOODS = [
  { name: 'Haferflocken (100g)', cal: 370, p: 13, c: 59, f: 7 },
  { name: 'Ei (1 Stueck)', cal: 78, p: 6, c: 1, f: 5 },
  { name: 'Haehnchenbrust (150g)', cal: 165, p: 31, c: 0, f: 4 },
  { name: 'Reis gekocht (200g)', cal: 260, p: 5, c: 58, f: 1 },
  { name: 'Lachs (150g)', cal: 310, p: 30, c: 0, f: 20 },
  { name: 'Vollkornbrot (1 Scheibe)', cal: 120, p: 4, c: 22, f: 1 },
  { name: 'Magerquark (250g)', cal: 170, p: 30, c: 10, f: 1 },
  { name: 'Banane', cal: 95, p: 1, c: 23, f: 0 },
  { name: 'Proteinshake', cal: 120, p: 24, c: 3, f: 1 },
  { name: 'Apfel', cal: 52, p: 0, c: 14, f: 0 },
  { name: 'Griechischer Joghurt (200g)', cal: 190, p: 20, c: 8, f: 10 },
  { name: 'Nudeln gekocht (200g)', cal: 262, p: 9, c: 50, f: 2 },
  { name: 'Thunfisch (1 Dose)', cal: 116, p: 26, c: 0, f: 1 },
  { name: 'Erdnussbutter (30g)', cal: 180, p: 7, c: 6, f: 15 },
  { name: 'Brokkoli (200g)', cal: 68, p: 6, c: 14, f: 1 },
  { name: 'Kartoffeln (200g)', cal: 154, p: 4, c: 34, f: 0 },
]

export default function FitTuttoNutritionPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { profile, meals, saveMeal, deleteMeal, loadMeals } = useFitness()

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showAddForm, setShowAddForm] = useState(false)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [addMealType, setAddMealType] = useState<MealType>('lunch')

  // Form state
  const [formName, setFormName] = useState('')
  const [formCalories, setFormCalories] = useState('')
  const [formProtein, setFormProtein] = useState('')
  const [formCarbs, setFormCarbs] = useState('')
  const [formFat, setFormFat] = useState('')

  const dateStr = toDateStr(selectedDate)

  useEffect(() => {
    if (user) loadMeals(dateStr)
  }, [user, dateStr, loadMeals])

  // Macro targets based on profile
  const weightKg = profile?.weightKg || 75
  const goal = profile?.fitnessGoal
  const calorieTarget = goal === 'lose_weight' ? weightKg * 28 : goal === 'build_muscle' ? weightKg * 35 : weightKg * 30
  const proteinTarget = goal === 'build_muscle' || goal === 'gain_strength' ? Math.round(weightKg * 2) : Math.round(weightKg * 1.6)
  const fatTarget = Math.round(weightKg * 1)
  const carbTarget = Math.round((calorieTarget - proteinTarget * 4 - fatTarget * 9) / 4)

  // Totals
  const totals = meals.reduce((acc, m) => ({
    calories: acc.calories + m.calories,
    protein: acc.protein + m.proteinG,
    carbs: acc.carbs + m.carbsG,
    fat: acc.fat + m.fatG,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 })

  const mealsByType: Record<MealType, MealEntry[]> = {
    breakfast: meals.filter(m => m.mealType === 'breakfast'),
    lunch: meals.filter(m => m.mealType === 'lunch'),
    dinner: meals.filter(m => m.mealType === 'dinner'),
    snack: meals.filter(m => m.mealType === 'snack'),
  }

  const changeDate = (days: number) => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + days)
    setSelectedDate(d)
  }

  const handleSave = async () => {
    if (!formName.trim()) { toast.error('Name eingeben'); return }

    const meal: MealEntry = {
      id: generateId(),
      userId: user?.id || '',
      date: dateStr,
      mealType: addMealType,
      name: formName,
      calories: parseInt(formCalories) || 0,
      proteinG: parseFloat(formProtein) || 0,
      carbsG: parseFloat(formCarbs) || 0,
      fatG: parseFloat(formFat) || 0,
      fiberG: null,
      notes: null,
      createdAt: new Date().toISOString(),
    }
    await saveMeal(meal)
    toast.success(`${formName} hinzugefuegt`)
    resetForm()
  }

  const handleQuickAdd = async (food: typeof QUICK_FOODS[0]) => {
    const meal: MealEntry = {
      id: generateId(),
      userId: user?.id || '',
      date: dateStr,
      mealType: addMealType,
      name: food.name,
      calories: food.cal,
      proteinG: food.p,
      carbsG: food.c,
      fatG: food.f,
      fiberG: null,
      notes: null,
      createdAt: new Date().toISOString(),
    }
    await saveMeal(meal)
    toast.success(`${food.name} hinzugefuegt`)
    setShowQuickAdd(false)
  }

  const resetForm = () => {
    setFormName('')
    setFormCalories('')
    setFormProtein('')
    setFormCarbs('')
    setFormFat('')
    setShowAddForm(false)
  }

  const handleDelete = async (mealId: string) => {
    await deleteMeal(mealId)
    toast.success('Eintrag geloescht')
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-6">
            <Apple className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <h2 className="text-xl font-bold mb-2">Anmeldung erforderlich</h2>
            <p className="text-gray-600 mb-4">Melde dich an, um deine Ernaehrung zu tracken.</p>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => navigate('/login')}>
              Jetzt anmelden
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="py-8 px-4 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Apple className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Ernaehrung</h1>
              <p className="text-gray-500">Mahlzeiten & Makros tracken</p>
            </div>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between mb-6 bg-white rounded-xl p-3 border">
          <Button variant="ghost" size="sm" onClick={() => changeDate(-1)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <div className="font-semibold">{formatDateDE(selectedDate)}</div>
            {toDateStr(selectedDate) === toDateStr(new Date()) ? (
              <span className="text-xs text-orange-500">Heute</span>
            ) : (
              <button
                className="text-xs text-orange-500 hover:underline"
                onClick={() => setSelectedDate(new Date())}
              >
                Zurueck zu Heute
              </button>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => changeDate(1)}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Macro Overview */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            {/* Calories */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="font-medium text-sm">Kalorien</span>
                </div>
                <span className="text-sm">
                  <span className="font-bold">{totals.calories}</span>
                  <span className="text-gray-400"> / {Math.round(calorieTarget)} kcal</span>
                </span>
              </div>
              <Progress value={Math.min(100, (totals.calories / calorieTarget) * 100)} className="h-3" />
            </div>

            {/* Macros */}
            <div className="grid grid-cols-3 gap-3">
              <MacroBar
                icon={<Beef className="w-3.5 h-3.5 text-red-500" />}
                label="Protein"
                current={totals.protein}
                target={proteinTarget}
                unit="g"
                color="red"
              />
              <MacroBar
                icon={<Wheat className="w-3.5 h-3.5 text-amber-500" />}
                label="Kohlenhydrate"
                current={totals.carbs}
                target={carbTarget}
                unit="g"
                color="amber"
              />
              <MacroBar
                icon={<Droplets className="w-3.5 h-3.5 text-blue-500" />}
                label="Fett"
                current={totals.fat}
                target={fatTarget}
                unit="g"
                color="blue"
              />
            </div>
          </CardContent>
        </Card>

        {/* Meals by Type */}
        {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map(type => (
          <Card key={type} className="mb-3">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{MEAL_TYPE_ICONS[type]}</span>
                  <span className="font-semibold text-sm">{MEAL_TYPE_LABELS[type]}</span>
                  <span className="text-xs text-gray-400">
                    {mealsByType[type].reduce((s, m) => s + m.calories, 0)} kcal
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-orange-500"
                  onClick={() => { setAddMealType(type); setShowAddForm(true) }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {mealsByType[type].length > 0 ? (
                <div className="space-y-1">
                  {mealsByType[type].map(meal => (
                    <div key={meal.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 group">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{meal.name}</div>
                        <div className="text-xs text-gray-500">
                          {meal.calories} kcal · P {meal.proteinG}g · K {meal.carbsG}g · F {meal.fatG}g
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(meal.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 py-1">Noch nichts eingetragen</p>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Quick Add Button */}
        <Button
          variant="outline"
          className="w-full mt-2 mb-4"
          onClick={() => { setShowQuickAdd(true) }}
        >
          <Plus className="w-4 h-4 mr-2" /> Schnell hinzufuegen
        </Button>
      </motion.div>

      {/* Add Meal Form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">
                  {MEAL_TYPE_ICONS[addMealType]} {MEAL_TYPE_LABELS[addMealType]} hinzufuegen
                </h3>
                <button onClick={() => setShowAddForm(false)}><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-3">
                <div>
                  <Label>Name</Label>
                  <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="z.B. Haehnchenbrust mit Reis" />
                </div>
                <div>
                  <Label>Kalorien (kcal)</Label>
                  <Input type="number" value={formCalories} onChange={e => setFormCalories(e.target.value)} placeholder="0" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label>Protein (g)</Label>
                    <Input type="number" value={formProtein} onChange={e => setFormProtein(e.target.value)} placeholder="0" />
                  </div>
                  <div>
                    <Label>Kohlenhydrate (g)</Label>
                    <Input type="number" value={formCarbs} onChange={e => setFormCarbs(e.target.value)} placeholder="0" />
                  </div>
                  <div>
                    <Label>Fett (g)</Label>
                    <Input type="number" value={formFat} onChange={e => setFormFat(e.target.value)} placeholder="0" />
                  </div>
                </div>
                <div>
                  <Label>Mahlzeit</Label>
                  <Select value={addMealType} onValueChange={v => setAddMealType(v as MealType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.entries(MEAL_TYPE_LABELS) as [MealType, string][]).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{MEAL_TYPE_ICONS[k]} {v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white" onClick={handleSave}>
                  Speichern
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Add Modal */}
      <AnimatePresence>
        {showQuickAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
            onClick={() => setShowQuickAdd(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[80vh] flex flex-col"
            >
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg">Schnell hinzufuegen</h3>
                  <button onClick={() => setShowQuickAdd(false)}><X className="w-5 h-5" /></button>
                </div>
                <Select value={addMealType} onValueChange={v => setAddMealType(v as MealType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.entries(MEAL_TYPE_LABELS) as [MealType, string][]).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{MEAL_TYPE_ICONS[k]} {v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="overflow-y-auto flex-1 p-2">
                {QUICK_FOODS.map(food => (
                  <button
                    key={food.name}
                    onClick={() => handleQuickAdd(food)}
                    className="w-full text-left p-3 rounded-lg hover:bg-green-50 flex items-center gap-3 transition-colors"
                  >
                    <Apple className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{food.name}</div>
                      <div className="text-xs text-gray-500">
                        {food.cal} kcal · P {food.p}g · K {food.c}g · F {food.f}g
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

function MacroBar({
  icon, label, current, target, unit, color,
}: {
  icon: React.ReactNode; label: string; current: number; target: number; unit: string; color: string
}) {
  const pct = Math.min(100, (current / target) * 100)
  const colorMap: Record<string, string> = {
    red: 'bg-red-500',
    amber: 'bg-amber-500',
    blue: 'bg-blue-500',
  }

  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        {icon}
        <span className="text-xs text-gray-500 truncate">{label}</span>
      </div>
      <div className="font-bold text-sm">
        {Math.round(current)}<span className="text-gray-400 text-xs font-normal">/{target}{unit}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
        <div className={cn('h-1.5 rounded-full transition-all', colorMap[color])} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
