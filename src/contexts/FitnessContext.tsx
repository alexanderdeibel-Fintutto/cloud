import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { supabase } from '@/integrations/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import {
  FitnessProfile, FitnessGoal, FitnessLevel, TrainingLocation,
  Gender, WorkoutSession, PersonalRecord, TrainingPlan,
  MealEntry, BodyMeasurement, MealType, WorkoutExercise,
  Equipment,
} from '@/lib/fitness-types'

// --- Internal DB row interfaces (snake_case) ---

interface FitnessProfileRow {
  id: string
  user_id: string
  display_name: string | null
  gender: string | null
  age: number | null
  height_cm: number | null
  weight_kg: number | null
  target_weight_kg: number | null
  fitness_goal: string | null
  fitness_level: string | null
  training_location: string | null
  available_equipment: string[]
  training_days_per_week: number
  training_minutes_per_session: number
  onboarding_completed: boolean
  subscription_tier: string
}

interface WorkoutSessionRow {
  id: string
  user_id: string
  plan_id: string | null
  name: string
  started_at: string
  completed_at: string | null
  duration_minutes: number
  exercises: string | WorkoutExercise[]
  total_volume: number
  total_calories_burned: number | null
  rating: number | null
  mood: string | null
  notes: string | null
}

interface TrainingPlanRow {
  id: string
  user_id: string
  name: string
  description: string | null
  goal: string | null
  level: string | null
  location: string | null
  duration_weeks: number
  days_per_week: number
  workouts: string | Record<string, unknown>[]
  is_active: boolean
  is_template: boolean
  created_at: string
  updated_at: string
}

interface PersonalRecordRow {
  id: string
  exercise_id: string
  exercise_name: string
  weight: number
  reps: number
  achieved_at: string
}

interface MealEntryRow {
  id: string
  user_id: string
  date: string
  meal_type: MealType
  name: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number | null
  notes: string | null
  created_at: string
}

interface BodyMeasurementRow {
  id: string
  user_id: string
  date: string
  weight_kg: number | null
  body_fat_percent: number | null
  chest_cm: number | null
  waist_cm: number | null
  hips_cm: number | null
  biceps_cm: number | null
  thigh_cm: number | null
  calf_cm: number | null
  notes: string | null
  created_at: string
}

interface FitnessContextType {
  profile: FitnessProfile | null
  loading: boolean
  workoutHistory: WorkoutSession[]
  personalRecords: PersonalRecord[]
  activePlan: TrainingPlan | null
  plans: TrainingPlan[]
  // Profile
  saveProfile: (data: Partial<FitnessProfile>) => Promise<void>
  // Workouts
  saveWorkout: (workout: WorkoutSession) => Promise<void>
  loadWorkoutHistory: () => Promise<void>
  // Plans
  savePlan: (plan: TrainingPlan) => Promise<void>
  deletePlan: (planId: string) => Promise<void>
  setActivePlan: (planId: string) => Promise<void>
  loadPlans: () => Promise<void>
  // PRs
  checkAndSavePersonalRecord: (exerciseId: string, exerciseName: string, weight: number, reps: number) => Promise<boolean>
  loadPersonalRecords: () => Promise<void>
  // Nutrition
  meals: MealEntry[]
  saveMeal: (meal: MealEntry) => Promise<void>
  deleteMeal: (mealId: string) => Promise<void>
  loadMeals: (date: string) => Promise<void>
  // Body Tracking
  bodyMeasurements: BodyMeasurement[]
  saveBodyMeasurement: (m: BodyMeasurement) => Promise<void>
  loadBodyMeasurements: () => Promise<void>
}

const FitnessContext = createContext<FitnessContextType | undefined>(undefined)

export function FitnessProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState<FitnessProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>([])
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([])
  const [plans, setPlans] = useState<TrainingPlan[]>([])
  const [activePlan, setActivePlanState] = useState<TrainingPlan | null>(null)
  const [meals, setMeals] = useState<MealEntry[]>([])
  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurement[]>([])

  // Load fitness profile when user changes
  useEffect(() => {
    if (user) {
      loadProfile()
    } else {
      setProfile(null)
      setLoading(false)
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('fitness_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code === 'PGRST116') {
        // No profile exists yet - create one
        const { data: newProfile, error: insertError } = await supabase
          .from('fitness_profiles')
          .insert({ user_id: user.id })
          .select()
          .single()

        if (!insertError && newProfile) {
          setProfile(mapDbToProfile(newProfile as FitnessProfileRow))
        }
      } else if (data) {
        setProfile(mapDbToProfile(data as FitnessProfileRow))
      }
    } catch {
      // Silently handle - profile will be null
    }
    setLoading(false)
  }

  const mapDbToProfile = (data: FitnessProfileRow): FitnessProfile => ({
    id: data.id,
    userId: data.user_id,
    displayName: data.display_name,
    gender: data.gender as Gender | null,
    age: data.age,
    heightCm: data.height_cm,
    weightKg: data.weight_kg ? Number(data.weight_kg) : null,
    targetWeightKg: data.target_weight_kg ? Number(data.target_weight_kg) : null,
    fitnessGoal: data.fitness_goal as FitnessGoal | null,
    fitnessLevel: data.fitness_level as FitnessLevel | null,
    trainingLocation: data.training_location as TrainingLocation | null,
    availableEquipment: (data.available_equipment || []) as Equipment[],
    trainingDaysPerWeek: data.training_days_per_week || 3,
    trainingMinutesPerSession: data.training_minutes_per_session || 45,
    onboardingCompleted: data.onboarding_completed || false,
    subscriptionTier: data.subscription_tier || 'free',
  })

  const saveProfile = async (data: Partial<FitnessProfile>) => {
    if (!user || !profile) return

    const dbData: Record<string, string | number | boolean | string[] | null> = {}
    if (data.displayName !== undefined) dbData.display_name = data.displayName
    if (data.gender !== undefined) dbData.gender = data.gender
    if (data.age !== undefined) dbData.age = data.age
    if (data.heightCm !== undefined) dbData.height_cm = data.heightCm
    if (data.weightKg !== undefined) dbData.weight_kg = data.weightKg
    if (data.targetWeightKg !== undefined) dbData.target_weight_kg = data.targetWeightKg
    if (data.fitnessGoal !== undefined) dbData.fitness_goal = data.fitnessGoal
    if (data.fitnessLevel !== undefined) dbData.fitness_level = data.fitnessLevel
    if (data.trainingLocation !== undefined) dbData.training_location = data.trainingLocation
    if (data.availableEquipment !== undefined) dbData.available_equipment = data.availableEquipment
    if (data.trainingDaysPerWeek !== undefined) dbData.training_days_per_week = data.trainingDaysPerWeek
    if (data.trainingMinutesPerSession !== undefined) dbData.training_minutes_per_session = data.trainingMinutesPerSession
    if (data.onboardingCompleted !== undefined) dbData.onboarding_completed = data.onboardingCompleted

    const { error } = await supabase
      .from('fitness_profiles')
      .update(dbData)
      .eq('id', profile.id)

    if (!error) {
      setProfile({ ...profile, ...data })
    }
  }

  // --- Workouts ---
  const saveWorkout = async (workout: WorkoutSession) => {
    if (!user) return

    const { error } = await supabase
      .from('fitness_workout_sessions')
      .insert({
        id: workout.id,
        user_id: user.id,
        plan_id: workout.planId,
        name: workout.name,
        started_at: workout.startedAt,
        completed_at: workout.completedAt,
        duration_minutes: workout.durationMinutes,
        total_calories_burned: workout.caloriesBurned || 0,
        total_volume: workout.totalVolume,
        exercises: JSON.stringify(workout.exercises),
        rating: workout.rating,
        mood: workout.mood,
        notes: workout.notes,
      })

    if (error) {
      toast.error('Fehler beim Speichern des Trainings.')
      return
    }

    toast.success('Training gespeichert!')
    setWorkoutHistory(prev => [workout, ...prev])
  }

  const loadWorkoutHistory = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('fitness_workout_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(50)

    if (data) {
      setWorkoutHistory(data.map((d: WorkoutSessionRow) => ({
        id: d.id,
        userId: d.user_id,
        planId: d.plan_id,
        name: d.name,
        startedAt: d.started_at,
        completedAt: d.completed_at,
        durationMinutes: d.duration_minutes,
        exercises: typeof d.exercises === 'string' ? JSON.parse(d.exercises) : d.exercises || [],
        totalVolume: Number(d.total_volume) || 0,
        caloriesBurned: d.total_calories_burned,
        rating: d.rating,
        mood: d.mood as WorkoutSession['mood'],
        notes: d.notes,
      }) as WorkoutSession))
    }
  }, [user])

  // --- Plans ---
  const savePlan = async (plan: TrainingPlan) => {
    if (!user) return

    const dbPlan = {
      id: plan.id,
      user_id: user.id,
      name: plan.name,
      description: plan.description,
      goal: plan.goal,
      level: plan.level,
      location: plan.location,
      duration_weeks: plan.durationWeeks,
      days_per_week: plan.daysPerWeek,
      workouts: JSON.stringify(plan.days),
      is_active: plan.isActive,
      is_template: plan.isTemplate,
    }

    const { error } = await supabase
      .from('fitness_training_plans')
      .upsert(dbPlan)

    if (error) {
      toast.error('Fehler beim Speichern des Plans.')
      return
    }

    toast.success('Plan gespeichert!')
    await loadPlans()
  }

  const deletePlan = async (planId: string) => {
    if (!user) return
    const { error } = await supabase.from('fitness_training_plans').delete().eq('id', planId).eq('user_id', user.id)
    if (error) {
      toast.error('Fehler beim Loeschen des Plans.')
      return
    }
    setPlans(prev => prev.filter(p => p.id !== planId))
    if (activePlan?.id === planId) setActivePlanState(null)
  }

  const setActivePlan = async (planId: string) => {
    if (!user) return
    // Deactivate all
    await supabase.from('fitness_training_plans').update({ is_active: false }).eq('user_id', user.id)
    // Activate selected
    await supabase.from('fitness_training_plans').update({ is_active: true }).eq('id', planId)
    await loadPlans()
  }

  const loadPlans = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('fitness_training_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (data) {
      const mapped = data.map((d: TrainingPlanRow): TrainingPlan => ({
        id: d.id,
        userId: d.user_id,
        name: d.name,
        description: d.description,
        goal: d.goal as FitnessGoal | null,
        level: d.level as FitnessLevel | null,
        location: d.location as TrainingLocation | null,
        durationWeeks: d.duration_weeks,
        daysPerWeek: d.days_per_week,
        days: typeof d.workouts === 'string' ? JSON.parse(d.workouts) : d.workouts || [],
        isActive: d.is_active,
        isTemplate: d.is_template,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      }))
      setPlans(mapped)
      setActivePlanState(mapped.find(p => p.isActive) || null)
    }
  }, [user])

  // --- Personal Records ---
  const checkAndSavePersonalRecord = async (
    exerciseId: string, exerciseName: string, weight: number, reps: number
  ): Promise<boolean> => {
    if (!user) return false

    const { data: existing } = await supabase
      .from('fitness_personal_records')
      .select('*')
      .eq('user_id', user.id)
      .eq('exercise_id', exerciseId)
      .order('weight', { ascending: false })
      .limit(1)
      .single()

    const isNewPR = !existing || weight > Number(existing.weight) ||
      (weight === Number(existing.weight) && reps > existing.reps)

    if (isNewPR) {
      await supabase.from('fitness_personal_records').insert({
        user_id: user.id,
        exercise_id: exerciseId,
        exercise_name: exerciseName,
        weight,
        reps,
      })
      toast.success('Neuer persoenlicher Rekord!')
      await loadPersonalRecords()
    }

    return isNewPR
  }

  const loadPersonalRecords = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('fitness_personal_records')
      .select('*')
      .eq('user_id', user.id)
      .order('achieved_at', { ascending: false })

    if (data) {
      setPersonalRecords(data.map((d: PersonalRecordRow) => ({
        id: d.id,
        exerciseId: d.exercise_id,
        exerciseName: d.exercise_name,
        weight: Number(d.weight),
        reps: d.reps,
        achievedAt: d.achieved_at,
      })))
    }
  }, [user])

  // --- Nutrition ---
  const saveMeal = async (meal: MealEntry) => {
    if (!user) return
    const { error } = await supabase.from('fitness_meal_entries').upsert({
      id: meal.id,
      user_id: user.id,
      date: meal.date,
      meal_type: meal.mealType,
      name: meal.name,
      calories: meal.calories,
      protein_g: meal.proteinG,
      carbs_g: meal.carbsG,
      fat_g: meal.fatG,
      fiber_g: meal.fiberG,
      notes: meal.notes,
    })
    if (error) {
      toast.error('Fehler beim Speichern der Mahlzeit.')
      return
    }
    setMeals(prev => {
      const exists = prev.find(m => m.id === meal.id)
      if (exists) return prev.map(m => m.id === meal.id ? meal : m)
      return [...prev, meal]
    })
  }

  const deleteMeal = async (mealId: string) => {
    if (!user) return
    const { error } = await supabase.from('fitness_meal_entries').delete().eq('id', mealId).eq('user_id', user.id)
    if (error) {
      toast.error('Fehler beim Loeschen.')
      return
    }
    setMeals(prev => prev.filter(m => m.id !== mealId))
  }

  const loadMeals = useCallback(async (date: string) => {
    if (!user) return
    const { data } = await supabase
      .from('fitness_meal_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)
      .order('created_at', { ascending: true })

    if (data) {
      setMeals(data.map((d: MealEntryRow): MealEntry => ({
        id: d.id,
        userId: d.user_id,
        date: d.date,
        mealType: d.meal_type,
        name: d.name,
        calories: Number(d.calories) || 0,
        proteinG: Number(d.protein_g) || 0,
        carbsG: Number(d.carbs_g) || 0,
        fatG: Number(d.fat_g) || 0,
        fiberG: d.fiber_g ? Number(d.fiber_g) : null,
        notes: d.notes,
        createdAt: d.created_at,
      })))
    }
  }, [user])

  // --- Body Measurements ---
  const saveBodyMeasurement = async (m: BodyMeasurement) => {
    if (!user) return
    const { error } = await supabase.from('fitness_body_measurements').upsert({
      id: m.id,
      user_id: user.id,
      date: m.date,
      weight_kg: m.weightKg,
      body_fat_percent: m.bodyFatPercent,
      chest_cm: m.chestCm,
      waist_cm: m.waistCm,
      hips_cm: m.hipsCm,
      biceps_cm: m.bicepsCm,
      thigh_cm: m.thighCm,
      calf_cm: m.calfCm,
      notes: m.notes,
    })
    if (error) {
      toast.error('Fehler beim Speichern der Messung.')
      return
    }
    toast.success('Messung gespeichert!')
    setBodyMeasurements(prev => {
      const exists = prev.find(x => x.id === m.id)
      if (exists) return prev.map(x => x.id === m.id ? m : x)
      return [...prev, m].sort((a, b) => a.date.localeCompare(b.date))
    })
  }

  const loadBodyMeasurements = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('fitness_body_measurements')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true })
      .limit(365)

    if (data) {
      setBodyMeasurements(data.map((d: BodyMeasurementRow): BodyMeasurement => ({
        id: d.id,
        userId: d.user_id,
        date: d.date,
        weightKg: d.weight_kg ? Number(d.weight_kg) : null,
        bodyFatPercent: d.body_fat_percent ? Number(d.body_fat_percent) : null,
        chestCm: d.chest_cm ? Number(d.chest_cm) : null,
        waistCm: d.waist_cm ? Number(d.waist_cm) : null,
        hipsCm: d.hips_cm ? Number(d.hips_cm) : null,
        bicepsCm: d.biceps_cm ? Number(d.biceps_cm) : null,
        thighCm: d.thigh_cm ? Number(d.thigh_cm) : null,
        calfCm: d.calf_cm ? Number(d.calf_cm) : null,
        notes: d.notes,
        createdAt: d.created_at,
      })))
    }
  }, [user])

  return (
    <FitnessContext.Provider value={{
      profile,
      loading,
      workoutHistory,
      personalRecords,
      activePlan,
      plans,
      saveProfile,
      saveWorkout,
      loadWorkoutHistory,
      savePlan,
      deletePlan,
      setActivePlan,
      loadPlans,
      checkAndSavePersonalRecord,
      loadPersonalRecords,
      meals,
      saveMeal,
      deleteMeal,
      loadMeals,
      bodyMeasurements,
      saveBodyMeasurement,
      loadBodyMeasurements,
    }}>
      {children}
    </FitnessContext.Provider>
  )
}

export function useFitness() {
  const context = useContext(FitnessContext)
  if (!context) throw new Error('useFitness must be used within FitnessProvider')
  return context
}
