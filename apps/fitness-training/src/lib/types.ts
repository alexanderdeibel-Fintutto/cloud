// === Core Types for FitTutto Fitness Training App ===

export type FitnessGoal = 'lose_weight' | 'build_muscle' | 'stay_fit' | 'improve_endurance' | 'increase_flexibility' | 'gain_strength'

export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced' | 'professional'

export type Gender = 'male' | 'female' | 'diverse'

export type MuscleGroup =
  | 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'forearms'
  | 'abs' | 'obliques' | 'lower_back'
  | 'quadriceps' | 'hamstrings' | 'glutes' | 'calves'
  | 'full_body' | 'cardio'

export type ExerciseCategory = 'strength' | 'cardio' | 'mobility' | 'stretching' | 'warmup' | 'cooldown'

export type Equipment =
  | 'none' | 'dumbbells' | 'barbell' | 'kettlebell' | 'resistance_band'
  | 'pull_up_bar' | 'bench' | 'cable_machine' | 'smith_machine'
  | 'leg_press' | 'treadmill' | 'bike' | 'rowing_machine' | 'mat' | 'foam_roller'

export type TrainingLocation = 'gym' | 'home' | 'outdoor'

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export type SubscriptionTier = 'free' | 'save_load' | 'basic' | 'premium'

// === User Profile ===

export interface UserProfile {
  id: string
  email: string
  displayName: string
  avatarUrl?: string
  gender: Gender
  age: number
  heightCm: number
  weightKg: number
  targetWeightKg?: number
  fitnessGoal: FitnessGoal
  fitnessLevel: FitnessLevel
  trainingLocation: TrainingLocation
  availableEquipment: Equipment[]
  trainingDaysPerWeek: number
  trainingMinutesPerSession: number
  onboardingCompleted: boolean
  subscriptionTier: SubscriptionTier
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  referralCode: string
  referredBy?: string
  createdAt: string
  updatedAt: string
}

// === Exercises ===

export interface Exercise {
  id: string
  name: string
  nameEn: string
  description: string
  instructions: string[]
  category: ExerciseCategory
  muscleGroups: MuscleGroup[]
  primaryMuscle: MuscleGroup
  equipment: Equipment[]
  difficulty: FitnessLevel
  videoUrl?: string
  imageUrl?: string
  animationFrames?: string[]
  caloriesPerMinute: number
  tags: string[]
}

export interface ExerciseSet {
  id: string
  exerciseId: string
  setNumber: number
  targetReps?: number
  targetWeight?: number
  targetDuration?: number // seconds for timed exercises
  actualReps?: number
  actualWeight?: number
  actualDuration?: number
  restAfter: number // seconds
  completed: boolean
}

// === Training Plans ===

export interface TrainingPlan {
  id: string
  userId: string
  name: string
  description: string
  goal: FitnessGoal
  level: FitnessLevel
  location: TrainingLocation
  durationWeeks: number
  daysPerWeek: number
  workouts: PlannedWorkout[]
  isActive: boolean
  isTemplate: boolean
  createdAt: string
  updatedAt: string
}

export interface PlannedWorkout {
  id: string
  planId: string
  dayOfWeek: DayOfWeek
  weekNumber: number
  name: string
  description: string
  focusArea: MuscleGroup[]
  estimatedDurationMinutes: number
  exercises: PlannedExercise[]
  order: number
}

export interface PlannedExercise {
  id: string
  workoutId: string
  exerciseId: string
  exercise?: Exercise
  sets: number
  reps?: number
  weight?: number
  duration?: number // seconds
  restBetweenSets: number // seconds
  notes?: string
  order: number
  supersetGroup?: string
}

// === Workout Tracking ===

export interface WorkoutSession {
  id: string
  userId: string
  planId?: string
  plannedWorkoutId?: string
  name: string
  startedAt: string
  completedAt?: string
  durationMinutes: number
  totalCaloriesBurned: number
  totalVolume: number // kg
  exercises: WorkoutExerciseLog[]
  rating?: number // 1-5
  notes?: string
  mood?: 'great' | 'good' | 'okay' | 'tired' | 'exhausted'
}

export interface WorkoutExerciseLog {
  id: string
  sessionId: string
  exerciseId: string
  exercise?: Exercise
  sets: ExerciseSet[]
  notes?: string
  order: number
}

// === Nutrition ===

export interface FoodItem {
  id: string
  name: string
  brand?: string
  caloriesPer100g: number
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
  fiberPer100g: number
  servingSize: number // grams
  servingUnit: string
  barcode?: string
  category: string
}

export interface MealEntry {
  id: string
  userId: string
  date: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  foods: MealFoodItem[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  notes?: string
  createdAt: string
}

export interface MealFoodItem {
  foodItemId: string
  foodItem?: FoodItem
  quantity: number // grams
  calories: number
  protein: number
  carbs: number
  fat: number
}

// === Progress & Gamification ===

export interface DailyProgress {
  date: string
  workoutsCompleted: number
  caloriesBurned: number
  caloriesConsumed: number
  proteinConsumed: number
  carbsConsumed: number
  fatConsumed: number
  waterMl: number
  sleepHours: number
  steps: number
  weightKg?: number
  mood?: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'workout' | 'streak' | 'nutrition' | 'strength' | 'milestone'
  requirement: number
  currentProgress: number
  unlockedAt?: string
}

export interface UserStats {
  totalWorkouts: number
  totalDurationMinutes: number
  totalCaloriesBurned: number
  totalVolumeKg: number
  currentStreak: number
  longestStreak: number
  averageWorkoutDuration: number
  personalRecords: PersonalRecord[]
  weeklyWorkouts: number[]
  monthlyProgress: MonthlyProgress[]
}

export interface PersonalRecord {
  exerciseId: string
  exerciseName: string
  weight: number
  reps: number
  achievedAt: string
}

export interface MonthlyProgress {
  month: string
  workouts: number
  calories: number
  volume: number
}
