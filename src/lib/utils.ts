import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function formatCalories(kcal: number): string {
  return `${Math.round(kcal)} kcal`
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10
}

export function calculateTDEE(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female',
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
): number {
  // Mifflin-St Jeor
  let bmr: number
  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161
  }

  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  }

  return Math.round(bmr * multipliers[activityLevel])
}

export function calculateMacros(
  tdee: number,
  goal: 'lose' | 'maintain' | 'gain'
): { protein: number; carbs: number; fat: number; calories: number } {
  let calories = tdee
  if (goal === 'lose') calories = Math.round(tdee * 0.8)
  if (goal === 'gain') calories = Math.round(tdee * 1.15)

  // 30% protein, 40% carbs, 30% fat
  const protein = Math.round((calories * 0.3) / 4)
  const carbs = Math.round((calories * 0.4) / 4)
  const fat = Math.round((calories * 0.3) / 9)

  return { protein, carbs, fat, calories }
}

export function getStreakDays(dates: string[]): number {
  if (dates.length === 0) return 0
  const sorted = [...dates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  let streak = 1
  for (let i = 1; i < sorted.length; i++) {
    const diff = new Date(sorted[i - 1]).getTime() - new Date(sorted[i]).getTime()
    if (diff <= 86400000 * 1.5) {
      streak++
    } else {
      break
    }
  }
  return streak
}
