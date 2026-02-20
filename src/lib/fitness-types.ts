// ============================================
// FitTutto - Complete Type Definitions
// ============================================

// --- Muscle Groups ---
export type MuscleGroup =
  | 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'forearms'
  | 'abs' | 'obliques' | 'quads' | 'hamstrings' | 'glutes' | 'calves'
  | 'traps' | 'lats' | 'lower_back' | 'hip_flexors'

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: 'Brust',
  back: 'Ruecken',
  shoulders: 'Schultern',
  biceps: 'Bizeps',
  triceps: 'Trizeps',
  forearms: 'Unterarme',
  abs: 'Bauch',
  obliques: 'Seitliche Bauchmuskeln',
  quads: 'Quadrizeps',
  hamstrings: 'Beinbeuger',
  glutes: 'Gesaess',
  calves: 'Waden',
  traps: 'Nacken',
  lats: 'Latissimus',
  lower_back: 'Unterer Ruecken',
  hip_flexors: 'Hueftbeuger',
}

// --- Equipment ---
export type Equipment =
  | 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight'
  | 'kettlebell' | 'resistance_band' | 'pull_up_bar' | 'bench'
  | 'ez_bar' | 'smith_machine' | 'trx' | 'foam_roller'

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  barbell: 'Langhantel',
  dumbbell: 'Kurzhanteln',
  cable: 'Kabelzug',
  machine: 'Maschine',
  bodyweight: 'Koerpergewicht',
  kettlebell: 'Kettlebell',
  resistance_band: 'Widerstandsband',
  pull_up_bar: 'Klimmzugstange',
  bench: 'Hantelbank',
  ez_bar: 'SZ-Stange',
  smith_machine: 'Multipresse',
  trx: 'Schlingentrainer',
  foam_roller: 'Faszienrolle',
}

// --- Exercise ---
export type ExerciseCategory = 'strength' | 'cardio' | 'flexibility' | 'bodyweight'
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'
export type TrainingLocation = 'gym' | 'home' | 'outdoor'

export const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  strength: 'Kraft',
  cardio: 'Ausdauer',
  flexibility: 'Beweglichkeit',
  bodyweight: 'Eigengewicht',
}

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: 'Anfaenger',
  intermediate: 'Fortgeschritten',
  advanced: 'Profi',
}

export const LOCATION_LABELS: Record<TrainingLocation, string> = {
  gym: 'Fitnessstudio',
  home: 'Zuhause',
  outdoor: 'Draussen',
}

export interface Exercise {
  id: string
  name: string
  nameEn?: string
  category: ExerciseCategory
  primaryMuscles: MuscleGroup[]
  secondaryMuscles: MuscleGroup[]
  equipment: Equipment[]
  difficulty: Difficulty
  locations: TrainingLocation[]
  instructions: string[]
  tips?: string[]
  defaultSets?: number
  defaultReps?: number
  defaultRestSeconds?: number
  isCustom?: boolean
}

// --- Fitness Goals ---
export type FitnessGoal = 'lose_weight' | 'build_muscle' | 'stay_fit' | 'improve_endurance' | 'increase_flexibility' | 'gain_strength'

export const FITNESS_GOAL_LABELS: Record<FitnessGoal, string> = {
  lose_weight: 'Abnehmen',
  build_muscle: 'Muskelaufbau',
  stay_fit: 'Fit bleiben',
  improve_endurance: 'Ausdauer verbessern',
  increase_flexibility: 'Beweglichkeit',
  gain_strength: 'Kraft steigern',
}

export const FITNESS_GOAL_ICONS: Record<FitnessGoal, string> = {
  lose_weight: '🔥',
  build_muscle: '💪',
  stay_fit: '🏃',
  improve_endurance: '❤️',
  increase_flexibility: '🧘',
  gain_strength: '🏋️',
}

export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced' | 'professional'

export const FITNESS_LEVEL_LABELS: Record<FitnessLevel, string> = {
  beginner: 'Anfaenger',
  intermediate: 'Fortgeschritten',
  advanced: 'Erfahren',
  professional: 'Profi',
}

export type Gender = 'male' | 'female' | 'diverse'

export const GENDER_LABELS: Record<Gender, string> = {
  male: 'Maennlich',
  female: 'Weiblich',
  diverse: 'Divers',
}

// --- Fitness Profile ---
export interface FitnessProfile {
  id: string
  userId: string
  displayName: string | null
  gender: Gender | null
  age: number | null
  heightCm: number | null
  weightKg: number | null
  targetWeightKg: number | null
  fitnessGoal: FitnessGoal | null
  fitnessLevel: FitnessLevel | null
  trainingLocation: TrainingLocation | null
  availableEquipment: Equipment[]
  trainingDaysPerWeek: number
  trainingMinutesPerSession: number
  onboardingCompleted: boolean
  subscriptionTier: string
}

// --- Workout Recording ---
export type SetType = 'warmup' | 'normal' | 'dropset' | 'failure' | 'amrap' | 'superset'

export const SET_TYPE_LABELS: Record<SetType, string> = {
  warmup: 'Aufwaermen',
  normal: 'Normal',
  dropset: 'Drop-Set',
  failure: 'Bis Versagen',
  amrap: 'AMRAP',
  superset: 'Superset',
}

export const SET_TYPE_ICONS: Record<SetType, string> = {
  warmup: '☀️',
  normal: '',
  dropset: '🔥',
  failure: '💀',
  amrap: '♾️',
  superset: '⚡',
}

export interface WorkoutSet {
  id: string
  setNumber: number
  type: SetType
  weight: number
  reps: number
  rpe: number | null
  completed: boolean
  isPersonalRecord: boolean
  notes: string | null
}

export interface WorkoutExercise {
  id: string
  exerciseId: string
  exercise: Exercise
  sets: WorkoutSet[]
  restSeconds: number
  supersetWithId: string | null
  notes: string | null
  order: number
}

export interface WorkoutSession {
  id: string
  userId: string
  planId: string | null
  name: string
  startedAt: string
  completedAt: string | null
  durationMinutes: number | null
  exercises: WorkoutExercise[]
  totalVolume: number
  caloriesBurned: number | null
  rating: number | null
  mood: 'great' | 'good' | 'okay' | 'tired' | 'exhausted' | null
  notes: string | null
}

// --- Training Plan ---
export interface PlanExercise {
  exerciseId: string
  exercise: Exercise
  sets: number
  reps: string   // e.g. "8-12" or "5" or "AMRAP"
  restSeconds: number
  notes?: string
  supersetWithIndex?: number
  order: number
}

export interface PlanDay {
  id: string
  name: string        // e.g. "Tag 1: Brust & Trizeps"
  dayOfWeek?: number  // 0=Mo, 1=Di, etc.
  exercises: PlanExercise[]
  estimatedMinutes: number
}

export interface TrainingPlan {
  id: string
  userId: string
  name: string
  description: string | null
  goal: FitnessGoal | null
  level: FitnessLevel | null
  location: TrainingLocation | null
  durationWeeks: number
  daysPerWeek: number
  days: PlanDay[]
  isActive: boolean
  isTemplate: boolean
  createdAt: string
  updatedAt: string
}

// --- Personal Records ---
export interface PersonalRecord {
  id: string
  exerciseId: string
  exerciseName: string
  weight: number
  reps: number
  achievedAt: string
}

// --- Progress ---
export interface DailyProgress {
  date: string
  workoutsCompleted: number
  caloriesBurned: number
  totalVolume: number
  weightKg: number | null
}

// --- Nutrition Tracking ---
export interface MealEntry {
  id: string
  userId: string
  date: string
  mealType: MealType
  name: string
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
  fiberG: number | null
  notes: string | null
  createdAt: string
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Fruehstueck',
  lunch: 'Mittagessen',
  dinner: 'Abendessen',
  snack: 'Snack',
}

export const MEAL_TYPE_ICONS: Record<MealType, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
}

// --- Body Tracking ---
export interface BodyMeasurement {
  id: string
  userId: string
  date: string
  weightKg: number | null
  bodyFatPercent: number | null
  chestCm: number | null
  waistCm: number | null
  hipsCm: number | null
  bicepsCm: number | null
  thighCm: number | null
  calfCm: number | null
  notes: string | null
  createdAt: string
}

// --- Coach Tips ---
export interface CoachTip {
  id: string
  category: 'training' | 'nutrition' | 'recovery' | 'motivation'
  title: string
  content: string
  priority: number
}
