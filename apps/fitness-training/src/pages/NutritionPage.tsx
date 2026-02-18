import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Apple, Plus, Search, X, ChevronRight, Flame,
  Beef, Wheat, Droplets, Target, Lock, Crown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { canTrackNutrition } from '@/lib/pricing'
import { cn, calculateTDEE, calculateMacros } from '@/lib/utils'
import { FOODS, searchFoods, getFoodsByCategory, FOOD_CATEGORIES, calculateNutrition } from '@/data/foods'
import type { FoodItem, MealEntry, MealFoodItem } from '@/lib/types'
import { Link } from 'react-router-dom'

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Frühstück', icon: '🌅' },
  { id: 'lunch', label: 'Mittagessen', icon: '☀️' },
  { id: 'dinner', label: 'Abendessen', icon: '🌙' },
  { id: 'snack', label: 'Snacks', icon: '🍎' },
] as const

export default function NutritionPage() {
  const { subscriptionTier } = useAuth()
  const canTrack = canTrackNutrition(subscriptionTier)
  const [showAddFood, setShowAddFood] = useState(false)
  const [activeMeal, setActiveMeal] = useState<string>('breakfast')
  const [foodSearch, setFoodSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Daily targets (based on default user)
  const dailyTarget = { calories: 2200, protein: 165, carbs: 220, fat: 73 }

  // Today's meals (from localStorage)
  const [meals, setMeals] = useState<Record<string, { food: FoodItem; grams: number }[]>>(() => {
    const stored = localStorage.getItem('fittutto_meals_today')
    return stored ? JSON.parse(stored) : {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    }
  })

  const totals = useMemo(() => {
    let calories = 0, protein = 0, carbs = 0, fat = 0
    Object.values(meals).forEach(mealFoods => {
      mealFoods.forEach(({ food, grams }) => {
        const mult = grams / 100
        calories += food.caloriesPer100g * mult
        protein += food.proteinPer100g * mult
        carbs += food.carbsPer100g * mult
        fat += food.fatPer100g * mult
      })
    })
    return {
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
    }
  }, [meals])

  const mealTotals = useMemo(() => {
    const result: Record<string, number> = {}
    Object.entries(meals).forEach(([mealType, foods]) => {
      result[mealType] = Math.round(foods.reduce((sum, { food, grams }) =>
        sum + food.caloriesPer100g * (grams / 100), 0))
    })
    return result
  }, [meals])

  const searchResults = useMemo(() => {
    if (foodSearch) return searchFoods(foodSearch)
    if (selectedCategory !== 'all') return getFoodsByCategory(selectedCategory)
    return FOODS.slice(0, 20)
  }, [foodSearch, selectedCategory])

  const addFood = (food: FoodItem) => {
    const updated = { ...meals }
    updated[activeMeal] = [...(updated[activeMeal] || []), { food, grams: food.servingSize }]
    setMeals(updated)
    localStorage.setItem('fittutto_meals_today', JSON.stringify(updated))
    setShowAddFood(false)
    setFoodSearch('')
  }

  const removeFood = (mealType: string, index: number) => {
    const updated = { ...meals }
    updated[mealType] = updated[mealType].filter((_, i) => i !== index)
    setMeals(updated)
    localStorage.setItem('fittutto_meals_today', JSON.stringify(updated))
  }

  // Paywall for non-subscribers
  if (!canTrack) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Ernährungstracking</h1>
          <p className="text-muted-foreground">Kalorien und Makros tracken</p>
        </div>

        <Card className="text-center py-12">
          <CardContent>
            <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ernährungstracking freischalten</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Tracke Kalorien, Makros und Mahlzeiten mit dem Basic-Abo ab 4,99 €/Monat.
              Berechne deinen individuellen Kalorienbedarf und erreiche deine Ziele schneller.
            </p>
            <Link to="/pricing">
              <Button variant="fitness" size="lg">
                <Crown className="h-4 w-4 mr-2" />
                Basic-Abo ab 4,99 €
              </Button>
            </Link>

            {/* Feature preview */}
            <div className="grid grid-cols-2 gap-3 mt-8 text-left max-w-md mx-auto">
              {[
                { icon: Flame, label: 'Kalorientracking', desc: 'Tägliche Kalorien tracken' },
                { icon: Beef, label: 'Makro-Tracking', desc: 'Protein, Carbs, Fett' },
                { icon: Search, label: 'Lebensmitteldatenbank', desc: '2000+ Lebensmittel' },
                { icon: Target, label: 'Individuelle Ziele', desc: 'Basierend auf deinem Profil' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                  <Icon className="h-4 w-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs font-medium">{label}</p>
                    <p className="text-[10px] text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Ernährung</h1>
        <p className="text-muted-foreground">Heute, {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      {/* Daily Overview */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center mb-4">
            <p className="text-4xl font-bold">{totals.calories}</p>
            <p className="text-sm text-muted-foreground">von {dailyTarget.calories} kcal</p>
            <Progress value={(totals.calories / dailyTarget.calories) * 100} className="mt-2" />
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            {[
              { label: 'Protein', value: totals.protein, target: dailyTarget.protein, unit: 'g', color: 'bg-red-500', icon: Beef },
              { label: 'Kohlenhydrate', value: totals.carbs, target: dailyTarget.carbs, unit: 'g', color: 'bg-amber-500', icon: Wheat },
              { label: 'Fett', value: totals.fat, target: dailyTarget.fat, unit: 'g', color: 'bg-blue-500', icon: Droplets },
            ].map(({ label, value, target, unit, color, icon: Icon }) => (
              <div key={label} className="text-center">
                <Icon className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                <p className="text-sm font-bold">{value}{unit}</p>
                <p className="text-[10px] text-muted-foreground">/ {target}{unit}</p>
                <div className="h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${Math.min((value / target) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Meals */}
      <div className="space-y-3">
        {MEAL_TYPES.map(({ id, label, icon }) => (
          <Card key={id}>
            <CardContent className="py-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{icon}</span>
                  <span className="font-semibold text-sm">{label}</span>
                  <span className="text-xs text-muted-foreground">{mealTotals[id] || 0} kcal</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setActiveMeal(id); setShowAddFood(true) }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {meals[id]?.length > 0 && (
                <div className="space-y-1.5">
                  {meals[id].map((entry, i) => {
                    const cals = Math.round(entry.food.caloriesPer100g * (entry.grams / 100))
                    return (
                      <div key={i} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/30">
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium text-xs">{entry.food.name}</p>
                          <p className="text-[10px] text-muted-foreground">{entry.grams}g</p>
                        </div>
                        <span className="text-xs font-medium">{cals} kcal</span>
                        <button onClick={() => removeFood(id, i)}>
                          <X className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Food Dialog */}
      <Dialog open={showAddFood} onOpenChange={setShowAddFood}>
        <DialogContent className="max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Lebensmittel hinzufügen</DialogTitle>
          </DialogHeader>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Lebensmittel suchen..."
              value={foodSearch}
              onChange={e => setFoodSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {!foodSearch && (
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedCategory('all')}
                className={cn('muscle-tag cursor-pointer', selectedCategory === 'all' && 'bg-primary/10 text-primary')}
              >
                Alle
              </button>
              {FOOD_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn('muscle-tag cursor-pointer', selectedCategory === cat && 'bg-primary/10 text-primary')}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-1 -mx-6 px-6">
            {searchResults.map(food => (
              <button
                key={food.id}
                onClick={() => addFood(food)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{food.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {food.servingSize}{food.servingUnit} &middot; {Math.round(food.caloriesPer100g * food.servingSize / 100)} kcal
                  </p>
                </div>
                <div className="flex gap-2 text-[10px] text-muted-foreground">
                  <span>P: {food.proteinPer100g}g</span>
                  <span>K: {food.carbsPer100g}g</span>
                  <span>F: {food.fatPer100g}g</span>
                </div>
                <Plus className="h-4 w-4 text-primary flex-shrink-0" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
