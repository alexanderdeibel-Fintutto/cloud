// === AI-Powered Training Plan Generator for FitTutto ===

import type {
  FitnessGoal,
  FitnessLevel,
  TrainingLocation,
  Equipment,
  MuscleGroup,
  DayOfWeek,
  TrainingPlan,
  PlannedWorkout,
  PlannedExercise,
} from './types'

import { EXERCISES, getExercisesByMuscle, getExercisesForLocation } from '../data/exercises'

// === Interfaces ===

export interface PlanGeneratorParams {
  userId: string
  goal: FitnessGoal
  level: FitnessLevel
  location: TrainingLocation
  availableEquipment: Equipment[]
  daysPerWeek: number // 2-6
  minutesPerSession: number // 30-90
  focusAreas?: MuscleGroup[]
}

export type SplitType =
  | 'full_body_ab'
  | 'full_body_abc'
  | 'push_pull_legs'
  | 'upper_lower'
  | 'ppl_full_body'
  | 'ppl_upper_lower'
  | 'bro_split'
  | 'ppl_x2'

interface SetsAndReps {
  sets: number
  repsMin: number
  repsMax: number
  restSeconds: number
}

interface SplitTemplate {
  type: SplitType
  name: string
  description: string
  days: SplitDay[]
}

interface SplitDay {
  name: string
  focusAreas: MuscleGroup[]
  exerciseCount: number
}

// === Constants ===

const DAYS_OF_WEEK: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

const WARMUP_MUSCLES: MuscleGroup[] = ['full_body', 'cardio']
const COOLDOWN_MUSCLES: MuscleGroup[] = ['full_body']

// === Split Templates ===

export const SPLIT_TEMPLATES: Record<SplitType, SplitTemplate> = {
  full_body_ab: {
    type: 'full_body_ab',
    name: 'Ganzkörper A/B',
    description: 'Zwei abwechselnde Ganzkörpereinheiten mit unterschiedlichen Übungen',
    days: [
      {
        name: 'Ganzkörper A',
        focusAreas: ['chest', 'back', 'quadriceps', 'shoulders', 'abs'],
        exerciseCount: 6,
      },
      {
        name: 'Ganzkörper B',
        focusAreas: ['back', 'chest', 'hamstrings', 'glutes', 'biceps', 'triceps'],
        exerciseCount: 6,
      },
    ],
  },

  full_body_abc: {
    type: 'full_body_abc',
    name: 'Ganzkörper A/B/C',
    description: 'Drei verschiedene Ganzkörpereinheiten für ausgewogenes Training',
    days: [
      {
        name: 'Ganzkörper A – Drücken-Fokus',
        focusAreas: ['chest', 'shoulders', 'triceps', 'quadriceps', 'abs'],
        exerciseCount: 6,
      },
      {
        name: 'Ganzkörper B – Ziehen-Fokus',
        focusAreas: ['back', 'biceps', 'hamstrings', 'glutes', 'lower_back'],
        exerciseCount: 6,
      },
      {
        name: 'Ganzkörper C – Beine & Core',
        focusAreas: ['quadriceps', 'hamstrings', 'glutes', 'calves', 'abs', 'obliques'],
        exerciseCount: 6,
      },
    ],
  },

  push_pull_legs: {
    type: 'push_pull_legs',
    name: 'Push/Pull/Beine',
    description: 'Klassischer Dreier-Split: Drückübungen, Zugübungen und Beine',
    days: [
      {
        name: 'Drücken (Push)',
        focusAreas: ['chest', 'shoulders', 'triceps'],
        exerciseCount: 6,
      },
      {
        name: 'Ziehen (Pull)',
        focusAreas: ['back', 'biceps', 'forearms'],
        exerciseCount: 6,
      },
      {
        name: 'Beine',
        focusAreas: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
        exerciseCount: 6,
      },
    ],
  },

  upper_lower: {
    type: 'upper_lower',
    name: 'Oberkörper/Unterkörper',
    description: 'Vierer-Split: abwechselnd Ober- und Unterkörper',
    days: [
      {
        name: 'Oberkörper A – Kraft',
        focusAreas: ['chest', 'back', 'shoulders', 'biceps', 'triceps'],
        exerciseCount: 7,
      },
      {
        name: 'Unterkörper A – Kraft',
        focusAreas: ['quadriceps', 'hamstrings', 'glutes', 'calves', 'abs'],
        exerciseCount: 6,
      },
      {
        name: 'Oberkörper B – Hypertrophie',
        focusAreas: ['chest', 'back', 'shoulders', 'biceps', 'triceps'],
        exerciseCount: 7,
      },
      {
        name: 'Unterkörper B – Hypertrophie',
        focusAreas: ['quadriceps', 'hamstrings', 'glutes', 'calves', 'abs'],
        exerciseCount: 6,
      },
    ],
  },

  ppl_full_body: {
    type: 'ppl_full_body',
    name: 'Push/Pull/Beine + Ganzkörper',
    description: 'Push/Pull/Legs-Split ergänzt durch eine Ganzkörpereinheit',
    days: [
      {
        name: 'Drücken (Push)',
        focusAreas: ['chest', 'shoulders', 'triceps'],
        exerciseCount: 6,
      },
      {
        name: 'Ziehen (Pull)',
        focusAreas: ['back', 'biceps', 'forearms'],
        exerciseCount: 6,
      },
      {
        name: 'Beine',
        focusAreas: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
        exerciseCount: 6,
      },
      {
        name: 'Ganzkörper',
        focusAreas: ['chest', 'back', 'shoulders', 'quadriceps', 'abs'],
        exerciseCount: 6,
      },
    ],
  },

  ppl_upper_lower: {
    type: 'ppl_upper_lower',
    name: 'Push/Pull/Beine/Ober/Unter',
    description: 'Fünf-Tage-Split mit PPL und Upper/Lower für maximale Frequenz',
    days: [
      {
        name: 'Drücken (Push)',
        focusAreas: ['chest', 'shoulders', 'triceps'],
        exerciseCount: 6,
      },
      {
        name: 'Ziehen (Pull)',
        focusAreas: ['back', 'biceps', 'forearms'],
        exerciseCount: 6,
      },
      {
        name: 'Beine',
        focusAreas: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
        exerciseCount: 6,
      },
      {
        name: 'Oberkörper',
        focusAreas: ['chest', 'back', 'shoulders', 'biceps', 'triceps'],
        exerciseCount: 7,
      },
      {
        name: 'Unterkörper & Core',
        focusAreas: ['quadriceps', 'hamstrings', 'glutes', 'calves', 'abs', 'obliques'],
        exerciseCount: 6,
      },
    ],
  },

  bro_split: {
    type: 'bro_split',
    name: 'Klassischer 5er-Split',
    description: 'Jede Muskelgruppe einmal pro Woche mit hohem Volumen',
    days: [
      {
        name: 'Brust',
        focusAreas: ['chest', 'triceps'],
        exerciseCount: 7,
      },
      {
        name: 'Rücken',
        focusAreas: ['back', 'biceps'],
        exerciseCount: 7,
      },
      {
        name: 'Schultern & Arme',
        focusAreas: ['shoulders', 'biceps', 'triceps', 'forearms'],
        exerciseCount: 7,
      },
      {
        name: 'Beine',
        focusAreas: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
        exerciseCount: 7,
      },
      {
        name: 'Core & Schwachstellen',
        focusAreas: ['abs', 'obliques', 'lower_back'],
        exerciseCount: 6,
      },
    ],
  },

  ppl_x2: {
    type: 'ppl_x2',
    name: 'Push/Pull/Beine x2',
    description: 'Sechs-Tage-Split: jede Muskelgruppe zweimal pro Woche',
    days: [
      {
        name: 'Drücken A – Kraft',
        focusAreas: ['chest', 'shoulders', 'triceps'],
        exerciseCount: 6,
      },
      {
        name: 'Ziehen A – Kraft',
        focusAreas: ['back', 'biceps', 'forearms'],
        exerciseCount: 6,
      },
      {
        name: 'Beine A – Kraft',
        focusAreas: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
        exerciseCount: 6,
      },
      {
        name: 'Drücken B – Hypertrophie',
        focusAreas: ['chest', 'shoulders', 'triceps'],
        exerciseCount: 7,
      },
      {
        name: 'Ziehen B – Hypertrophie',
        focusAreas: ['back', 'biceps', 'forearms'],
        exerciseCount: 7,
      },
      {
        name: 'Beine B – Hypertrophie',
        focusAreas: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
        exerciseCount: 7,
      },
    ],
  },
}

// === Core Functions ===

/**
 * Returns the appropriate sets, reps range, and rest periods
 * based on the user's fitness goal and experience level.
 */
export function getSetsAndReps(goal: FitnessGoal, level: FitnessLevel): SetsAndReps {
  const goalDefaults: Record<FitnessGoal, SetsAndReps> = {
    lose_weight: { sets: 3, repsMin: 12, repsMax: 15, restSeconds: 45 },
    build_muscle: { sets: 4, repsMin: 8, repsMax: 12, restSeconds: 75 },
    gain_strength: { sets: 5, repsMin: 3, repsMax: 6, restSeconds: 150 },
    stay_fit: { sets: 3, repsMin: 10, repsMax: 15, restSeconds: 60 },
    improve_endurance: { sets: 3, repsMin: 15, repsMax: 20, restSeconds: 30 },
    increase_flexibility: { sets: 2, repsMin: 10, repsMax: 15, restSeconds: 45 },
  }

  const base = goalDefaults[goal]

  // Adjust volume based on fitness level
  const levelAdjustments: Record<FitnessLevel, { setsModifier: number; restModifier: number }> = {
    beginner: { setsModifier: -1, restModifier: 15 },
    intermediate: { setsModifier: 0, restModifier: 0 },
    advanced: { setsModifier: 1, restModifier: -10 },
    professional: { setsModifier: 1, restModifier: -15 },
  }

  const adjustment = levelAdjustments[level]

  return {
    sets: Math.max(2, base.sets + adjustment.setsModifier),
    repsMin: base.repsMin,
    repsMax: base.repsMax,
    restSeconds: Math.max(20, base.restSeconds + adjustment.restModifier),
  }
}

/**
 * Returns the best split type for the given number of training days
 * and fitness goal.
 */
export function getRecommendedSplit(daysPerWeek: number, goal: FitnessGoal): SplitType {
  const clampedDays = Math.max(2, Math.min(6, daysPerWeek))

  const recommendations: Record<number, Record<FitnessGoal, SplitType>> = {
    2: {
      lose_weight: 'full_body_ab',
      build_muscle: 'full_body_ab',
      gain_strength: 'full_body_ab',
      stay_fit: 'full_body_ab',
      improve_endurance: 'full_body_ab',
      increase_flexibility: 'full_body_ab',
    },
    3: {
      lose_weight: 'full_body_abc',
      build_muscle: 'push_pull_legs',
      gain_strength: 'push_pull_legs',
      stay_fit: 'full_body_abc',
      improve_endurance: 'full_body_abc',
      increase_flexibility: 'full_body_abc',
    },
    4: {
      lose_weight: 'upper_lower',
      build_muscle: 'upper_lower',
      gain_strength: 'upper_lower',
      stay_fit: 'ppl_full_body',
      improve_endurance: 'ppl_full_body',
      increase_flexibility: 'ppl_full_body',
    },
    5: {
      lose_weight: 'ppl_upper_lower',
      build_muscle: 'bro_split',
      gain_strength: 'ppl_upper_lower',
      stay_fit: 'ppl_upper_lower',
      improve_endurance: 'ppl_upper_lower',
      increase_flexibility: 'ppl_upper_lower',
    },
    6: {
      lose_weight: 'ppl_x2',
      build_muscle: 'ppl_x2',
      gain_strength: 'ppl_x2',
      stay_fit: 'ppl_x2',
      improve_endurance: 'ppl_x2',
      increase_flexibility: 'ppl_x2',
    },
  }

  return recommendations[clampedDays][goal]
}

/**
 * Generates a descriptive workout name based on focus areas and day number.
 * All names are in German.
 */
export function generateWorkoutName(focusAreas: MuscleGroup[], dayNumber: number): string {
  const muscleGroupNames: Record<MuscleGroup, string> = {
    chest: 'Brust',
    back: 'Rücken',
    shoulders: 'Schultern',
    biceps: 'Bizeps',
    triceps: 'Trizeps',
    forearms: 'Unterarme',
    abs: 'Bauch',
    obliques: 'Seitliche Bauchmuskeln',
    lower_back: 'Unterer Rücken',
    quadriceps: 'Oberschenkel (vorne)',
    hamstrings: 'Oberschenkel (hinten)',
    glutes: 'Gesäß',
    calves: 'Waden',
    full_body: 'Ganzkörper',
    cardio: 'Ausdauer',
  }

  if (focusAreas.includes('full_body')) {
    return `Tag ${dayNumber} – Ganzkörpertraining`
  }

  if (focusAreas.includes('cardio')) {
    return `Tag ${dayNumber} – Ausdauertraining`
  }

  // Group into primary areas for a concise name
  const primaryAreas = focusAreas.slice(0, 3)
  const names = primaryAreas.map((area) => muscleGroupNames[area])

  return `Tag ${dayNumber} – ${names.join(' & ')}`
}

/**
 * Distributes training days evenly across the week,
 * placing rest days between sessions for recovery.
 */
function distributeTrainingDays(daysPerWeek: number): DayOfWeek[] {
  const distributions: Record<number, DayOfWeek[]> = {
    2: ['monday', 'thursday'],
    3: ['monday', 'wednesday', 'friday'],
    4: ['monday', 'tuesday', 'thursday', 'friday'],
    5: ['monday', 'tuesday', 'wednesday', 'friday', 'saturday'],
    6: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
  }

  return distributions[Math.max(2, Math.min(6, daysPerWeek))] ?? distributions[3]
}

/**
 * Filters available exercises based on location and available equipment,
 * then returns exercises matching the target muscle group.
 */
function selectExercisesForMuscle(
  muscle: MuscleGroup,
  location: TrainingLocation,
  availableEquipment: Equipment[],
  level: FitnessLevel,
  count: number
): typeof EXERCISES {
  // Get exercises for the target muscle that work in the given location
  const locationExercises = getExercisesForLocation(location)
  const muscleExercises = getExercisesByMuscle(muscle)

  // Intersect: exercises that match both muscle and location
  const muscleExerciseIds = new Set(muscleExercises.map((e) => e.id))
  let candidates = locationExercises.filter((e) => muscleExerciseIds.has(e.id))

  // Filter by available equipment
  candidates = candidates.filter((exercise) =>
    exercise.equipment.every(
      (eq) => eq === 'none' || availableEquipment.includes(eq)
    )
  )

  // Filter by difficulty: only show exercises at or below the user's level
  const levelOrder: Record<FitnessLevel, number> = {
    beginner: 0,
    intermediate: 1,
    advanced: 2,
    professional: 3,
  }

  const userLevelValue = levelOrder[level]
  candidates = candidates.filter(
    (exercise) => levelOrder[exercise.difficulty] <= userLevelValue
  )

  // Sort by relevance: primary muscle match first, then by difficulty match
  candidates.sort((a, b) => {
    const aPrimary = a.primaryMuscle === muscle ? 0 : 1
    const bPrimary = b.primaryMuscle === muscle ? 0 : 1
    if (aPrimary !== bPrimary) return aPrimary - bPrimary

    // Prefer exercises closer to the user's level
    const aDiff = Math.abs(levelOrder[a.difficulty] - userLevelValue)
    const bDiff = Math.abs(levelOrder[b.difficulty] - userLevelValue)
    return aDiff - bDiff
  })

  return candidates.slice(0, count)
}

/**
 * Selects warm-up exercises appropriate for the workout's focus areas.
 */
function generateWarmupExercises(
  focusAreas: MuscleGroup[],
  location: TrainingLocation,
  availableEquipment: Equipment[],
  level: FitnessLevel,
  workoutId: string
): PlannedExercise[] {
  const warmupExercises: PlannedExercise[] = []

  // General cardio warm-up (5 minutes)
  const cardioWarmups = selectExercisesForMuscle(
    'cardio',
    location,
    availableEquipment,
    level,
    1
  )

  if (cardioWarmups.length > 0) {
    warmupExercises.push({
      id: crypto.randomUUID(),
      workoutId,
      exerciseId: cardioWarmups[0].id,
      exercise: cardioWarmups[0],
      sets: 1,
      duration: 300, // 5 minutes
      restBetweenSets: 0,
      notes: 'Leichtes Aufwärmen – Puls langsam steigern',
      order: 0,
    })
  }

  // Dynamic stretching / mobility for the target muscles
  const mobilityExercises = selectExercisesForMuscle(
    'full_body',
    location,
    availableEquipment,
    level,
    2
  )

  mobilityExercises.forEach((exercise, index) => {
    warmupExercises.push({
      id: crypto.randomUUID(),
      workoutId,
      exerciseId: exercise.id,
      exercise,
      sets: 1,
      reps: 10,
      restBetweenSets: 0,
      notes: 'Dynamische Mobilisation – kontrolliert ausführen',
      order: index + 1,
    })
  })

  return warmupExercises
}

/**
 * Selects cool-down exercises for post-workout recovery.
 */
function generateCooldownExercises(
  focusAreas: MuscleGroup[],
  location: TrainingLocation,
  availableEquipment: Equipment[],
  level: FitnessLevel,
  workoutId: string,
  startingOrder: number
): PlannedExercise[] {
  const cooldownExercises: PlannedExercise[] = []

  // Static stretching for worked muscles
  for (const muscle of focusAreas.slice(0, 3)) {
    const stretches = selectExercisesForMuscle(
      muscle,
      location,
      [...availableEquipment, 'mat'],
      level,
      1
    )

    if (stretches.length > 0) {
      cooldownExercises.push({
        id: crypto.randomUUID(),
        workoutId,
        exerciseId: stretches[0].id,
        exercise: stretches[0],
        sets: 1,
        duration: 30, // 30 seconds per stretch
        restBetweenSets: 0,
        notes: 'Dehnung halten – ruhig atmen',
        order: startingOrder + cooldownExercises.length,
      })
    }
  }

  // General cool-down
  const generalCooldown = selectExercisesForMuscle(
    'full_body',
    location,
    availableEquipment,
    level,
    1
  )

  if (generalCooldown.length > 0) {
    cooldownExercises.push({
      id: crypto.randomUUID(),
      workoutId,
      exerciseId: generalCooldown[0].id,
      exercise: generalCooldown[0],
      sets: 1,
      duration: 180, // 3 minutes
      restBetweenSets: 0,
      notes: 'Lockeres Auslaufen – Puls senken',
      order: startingOrder + cooldownExercises.length,
    })
  }

  return cooldownExercises
}

/**
 * Builds a single PlannedWorkout for one training day,
 * including warm-up, main exercises, and cool-down.
 */
function buildWorkout(
  planId: string,
  dayOfWeek: DayOfWeek,
  weekNumber: number,
  splitDay: SplitDay,
  dayIndex: number,
  params: PlanGeneratorParams
): PlannedWorkout {
  const { goal, level, location, availableEquipment, minutesPerSession, focusAreas } = params
  const workoutId = crypto.randomUUID()

  // Merge focus areas from the split with user-specified focus areas
  let workoutFocusAreas = [...splitDay.focusAreas]
  if (focusAreas && focusAreas.length > 0) {
    // Prioritize user focus areas by including them if they overlap
    const userFocusSet = new Set(focusAreas)
    const hasOverlap = workoutFocusAreas.some((m) => userFocusSet.has(m))
    if (hasOverlap) {
      // Reorder: put user focus areas first
      workoutFocusAreas.sort((a, b) => {
        const aFocus = userFocusSet.has(a) ? 0 : 1
        const bFocus = userFocusSet.has(b) ? 0 : 1
        return aFocus - bFocus
      })
    }
  }

  const setsAndReps = getSetsAndReps(goal, level)

  // Calculate how many main exercises we can fit given the session duration
  // Reserve ~8 min for warm-up and ~5 min for cool-down
  const warmupMinutes = 8
  const cooldownMinutes = 5
  const mainMinutes = minutesPerSession - warmupMinutes - cooldownMinutes

  // Estimate time per exercise: (sets * (time per set + rest)) / 60
  const avgTimePerSet = 45 // seconds of work per set
  const timePerExercise =
    (setsAndReps.sets * (avgTimePerSet + setsAndReps.restSeconds)) / 60
  const maxExercises = Math.max(3, Math.min(splitDay.exerciseCount, Math.floor(mainMinutes / timePerExercise)))

  // Warm-up
  const warmupExercises = generateWarmupExercises(
    workoutFocusAreas,
    location,
    availableEquipment,
    level,
    workoutId
  )

  // Main exercises – distribute across focus areas
  const mainExercises: PlannedExercise[] = []
  const exercisesPerMuscle = Math.max(1, Math.floor(maxExercises / workoutFocusAreas.length))
  let exerciseOrder = warmupExercises.length
  const usedExerciseIds = new Set<string>()

  for (const muscle of workoutFocusAreas) {
    if (mainExercises.length >= maxExercises) break

    const remaining = maxExercises - mainExercises.length
    const count = Math.min(exercisesPerMuscle, remaining)

    const exercises = selectExercisesForMuscle(
      muscle,
      location,
      availableEquipment,
      level,
      count + 2 // fetch extra to allow filtering duplicates
    )

    for (const exercise of exercises) {
      if (mainExercises.length >= maxExercises) break
      if (usedExerciseIds.has(exercise.id)) continue

      usedExerciseIds.add(exercise.id)

      // Determine reps: use the midpoint with some variation
      const reps = Math.round((setsAndReps.repsMin + setsAndReps.repsMax) / 2)

      // For compound exercises (multi-joint), use slightly fewer reps but more sets
      const isCompound = exercise.muscleGroups.length >= 3
      const exerciseSets = isCompound
        ? Math.min(setsAndReps.sets + 1, 6)
        : setsAndReps.sets
      const exerciseReps = isCompound
        ? Math.max(setsAndReps.repsMin, reps - 2)
        : reps

      const plannedExercise: PlannedExercise = {
        id: crypto.randomUUID(),
        workoutId,
        exerciseId: exercise.id,
        exercise,
        sets: exerciseSets,
        reps: exerciseReps,
        restBetweenSets: setsAndReps.restSeconds,
        order: exerciseOrder++,
      }

      // Add notes in German for progressive overload guidance
      if (isCompound) {
        plannedExercise.notes = 'Grundübung – Gewicht wochenweise steigern'
      }

      mainExercises.push(plannedExercise)
    }
  }

  // Cool-down
  const cooldownExercises = generateCooldownExercises(
    workoutFocusAreas,
    location,
    availableEquipment,
    level,
    workoutId,
    exerciseOrder
  )

  const allExercises = [...warmupExercises, ...mainExercises, ...cooldownExercises]

  return {
    id: workoutId,
    planId,
    dayOfWeek,
    weekNumber,
    name: splitDay.name,
    description: generateWorkoutDescription(splitDay, goal),
    focusArea: workoutFocusAreas,
    estimatedDurationMinutes: minutesPerSession,
    exercises: allExercises,
    order: dayIndex,
  }
}

/**
 * Generates a German description for a workout based on its split day and goal.
 */
function generateWorkoutDescription(splitDay: SplitDay, goal: FitnessGoal): string {
  const goalDescriptions: Record<FitnessGoal, string> = {
    lose_weight: 'Kalorienverbrennung und Muskelerhalt',
    build_muscle: 'Muskelaufbau und Hypertrophie',
    gain_strength: 'Maximalkraft und neuronale Anpassung',
    stay_fit: 'Allgemeine Fitness und Gesundheit',
    improve_endurance: 'Ausdauer und kardiovaskuläre Fitness',
    increase_flexibility: 'Beweglichkeit und Mobilität',
  }

  const muscleGroupNames: Record<MuscleGroup, string> = {
    chest: 'Brust',
    back: 'Rücken',
    shoulders: 'Schultern',
    biceps: 'Bizeps',
    triceps: 'Trizeps',
    forearms: 'Unterarme',
    abs: 'Bauch',
    obliques: 'seitliche Bauchmuskeln',
    lower_back: 'unterer Rücken',
    quadriceps: 'Oberschenkelvorderseite',
    hamstrings: 'Oberschenkelrückseite',
    glutes: 'Gesäß',
    calves: 'Waden',
    full_body: 'Ganzkörper',
    cardio: 'Ausdauer',
  }

  const muscles = splitDay.focusAreas.slice(0, 3).map((m) => muscleGroupNames[m])
  const goalText = goalDescriptions[goal]

  return `${splitDay.name}: Fokus auf ${muscles.join(', ')} – Ziel: ${goalText}.`
}

/**
 * Generates a German name for the training plan based on goal and split.
 */
function generatePlanName(goal: FitnessGoal, splitType: SplitType): string {
  const goalNames: Record<FitnessGoal, string> = {
    lose_weight: 'Fettverbrennung',
    build_muscle: 'Muskelaufbau',
    gain_strength: 'Kraftaufbau',
    stay_fit: 'Fitness & Gesundheit',
    improve_endurance: 'Ausdauer',
    increase_flexibility: 'Beweglichkeit',
  }

  const splitTemplate = SPLIT_TEMPLATES[splitType]
  return `${goalNames[goal]} – ${splitTemplate.name}`
}

/**
 * Generates a German description for the overall training plan.
 */
function generatePlanDescription(
  goal: FitnessGoal,
  level: FitnessLevel,
  daysPerWeek: number,
  splitType: SplitType
): string {
  const levelNames: Record<FitnessLevel, string> = {
    beginner: 'Einsteiger',
    intermediate: 'Fortgeschrittene',
    advanced: 'Erfahrene',
    professional: 'Profis',
  }

  const goalPhrases: Record<FitnessGoal, string> = {
    lose_weight: 'Fett zu verlieren und die Muskelmasse zu erhalten',
    build_muscle: 'Muskelmasse aufzubauen und Hypertrophie zu maximieren',
    gain_strength: 'die Maximalkraft systematisch zu steigern',
    stay_fit: 'die allgemeine Fitness und Gesundheit zu verbessern',
    improve_endurance: 'die Ausdauer und kardiovaskuläre Leistung zu steigern',
    increase_flexibility: 'die Beweglichkeit und Mobilität zu verbessern',
  }

  const splitTemplate = SPLIT_TEMPLATES[splitType]

  return (
    `Individueller Trainingsplan für ${levelNames[level]}: ` +
    `${splitTemplate.name}-Split mit ${daysPerWeek} Trainingstagen pro Woche. ` +
    `Ziel: ${goalPhrases[goal]}. ` +
    `Basierend auf wissenschaftlichen Trainingsprinzipien mit progressiver Belastungssteigerung.`
  )
}

/**
 * Calculates the recommended plan duration in weeks based on level and goal.
 */
function calculatePlanDuration(level: FitnessLevel, goal: FitnessGoal): number {
  const baseDuration: Record<FitnessLevel, number> = {
    beginner: 8,
    intermediate: 10,
    advanced: 12,
    professional: 16,
  }

  const goalModifier: Record<FitnessGoal, number> = {
    lose_weight: 2,
    build_muscle: 0,
    gain_strength: 2,
    stay_fit: -2,
    improve_endurance: 0,
    increase_flexibility: -2,
  }

  return baseDuration[level] + goalModifier[goal]
}

// === Main Generator ===

/**
 * Generates a complete, scientifically-based training plan
 * tailored to the user's goals, level, location, and schedule.
 *
 * The plan includes:
 * - Appropriate split selection based on training frequency
 * - Warm-up and cool-down for each session
 * - Progressive overload principles
 * - Equipment and location filtering
 * - Balanced muscle group distribution
 * - Goal-specific sets, reps, and rest periods
 */
export function generateTrainingPlan(params: PlanGeneratorParams): TrainingPlan {
  const {
    userId,
    goal,
    level,
    location,
    daysPerWeek,
    minutesPerSession,
  } = params

  // Clamp inputs to valid ranges
  const clampedDays = Math.max(2, Math.min(6, daysPerWeek))
  const clampedMinutes = Math.max(30, Math.min(90, minutesPerSession))
  const adjustedParams = { ...params, daysPerWeek: clampedDays, minutesPerSession: clampedMinutes }

  // Select the best split for this combination
  const splitType = getRecommendedSplit(clampedDays, goal)
  const splitTemplate = SPLIT_TEMPLATES[splitType]

  // Determine training day distribution across the week
  const trainingDays = distributeTrainingDays(clampedDays)

  // Calculate plan duration
  const durationWeeks = calculatePlanDuration(level, goal)

  const planId = crypto.randomUUID()
  const now = new Date().toISOString()

  // Generate workouts for week 1 (template week)
  const workouts: PlannedWorkout[] = []

  for (let weekNumber = 1; weekNumber <= durationWeeks; weekNumber++) {
    for (let dayIndex = 0; dayIndex < clampedDays; dayIndex++) {
      const splitDayIndex = dayIndex % splitTemplate.days.length
      const splitDay = splitTemplate.days[splitDayIndex]
      const dayOfWeek = trainingDays[dayIndex]

      const workout = buildWorkout(
        planId,
        dayOfWeek,
        weekNumber,
        splitDay,
        dayIndex,
        adjustedParams
      )

      // Apply progressive overload: slightly increase volume in later weeks
      if (weekNumber > 1) {
        applyProgressiveOverload(workout, weekNumber, level)
      }

      workouts.push(workout)
    }
  }

  const plan: TrainingPlan = {
    id: planId,
    userId,
    name: generatePlanName(goal, splitType),
    description: generatePlanDescription(goal, level, clampedDays, splitType),
    goal,
    level,
    location,
    durationWeeks,
    daysPerWeek: clampedDays,
    workouts,
    isActive: true,
    isTemplate: false,
    createdAt: now,
    updatedAt: now,
  }

  return plan
}

/**
 * Applies progressive overload to a workout for later weeks.
 * Gradually increases volume (sets or reps) to drive adaptation.
 */
function applyProgressiveOverload(
  workout: PlannedWorkout,
  weekNumber: number,
  level: FitnessLevel
): void {
  // Calculate progression rate based on level
  const progressionRates: Record<FitnessLevel, number> = {
    beginner: 0.05, // 5% per week
    intermediate: 0.03, // 3% per week
    advanced: 0.02, // 2% per week
    professional: 0.01, // 1% per week
  }

  const rate = progressionRates[level]
  const weekMultiplier = 1 + rate * (weekNumber - 1)

  for (const exercise of workout.exercises) {
    // Skip warm-up and cool-down exercises (those with duration but no reps, or order 0/1)
    if (exercise.notes?.includes('Aufwärmen') || exercise.notes?.includes('Dehnung') || exercise.notes?.includes('Auslaufen')) {
      continue
    }

    if (exercise.reps) {
      // Every 4 weeks, add a rep (if within reasonable range)
      const extraReps = Math.floor((weekNumber - 1) / 4)
      exercise.reps = Math.min(exercise.reps + extraReps, 20)
    }

    // Every 3 weeks, consider adding a set for advanced/professional
    if (
      (level === 'advanced' || level === 'professional') &&
      weekNumber > 3 &&
      weekNumber % 3 === 0
    ) {
      exercise.sets = Math.min(exercise.sets + 1, 6)
    }

    // Add deload week every 4th week: reduce volume by 40%
    if (weekNumber % 4 === 0) {
      exercise.sets = Math.max(2, Math.ceil(exercise.sets * 0.6))
      if (exercise.reps) {
        exercise.reps = Math.max(exercise.reps - 2, 3)
      }
      exercise.notes = exercise.notes
        ? `${exercise.notes} (Deload-Woche: reduziertes Volumen)`
        : 'Deload-Woche: reduziertes Volumen'
    }
  }
}

/**
 * Adjusts the difficulty of an existing training plan by modifying
 * sets, reps, and rest periods based on the target fitness level.
 */
export function adjustPlanDifficulty(plan: TrainingPlan, level: FitnessLevel): TrainingPlan {
  const adjustedPlan = { ...plan, level, updatedAt: new Date().toISOString() }
  const setsAndReps = getSetsAndReps(plan.goal, level)

  adjustedPlan.workouts = plan.workouts.map((workout) => {
    const adjustedWorkout = { ...workout }
    adjustedWorkout.exercises = workout.exercises.map((exercise) => {
      const adjustedExercise = { ...exercise }

      // Skip warm-up and cool-down exercises
      if (
        adjustedExercise.notes?.includes('Aufwärmen') ||
        adjustedExercise.notes?.includes('Dehnung') ||
        adjustedExercise.notes?.includes('Auslaufen') ||
        adjustedExercise.notes?.includes('Mobilisation')
      ) {
        return adjustedExercise
      }

      // Adjust main exercises
      adjustedExercise.sets = setsAndReps.sets
      adjustedExercise.restBetweenSets = setsAndReps.restSeconds

      if (adjustedExercise.reps) {
        adjustedExercise.reps = Math.round(
          (setsAndReps.repsMin + setsAndReps.repsMax) / 2
        )
      }

      // Compound exercise adjustments
      if (adjustedExercise.exercise && adjustedExercise.exercise.muscleGroups.length >= 3) {
        adjustedExercise.sets = Math.min(setsAndReps.sets + 1, 6)
        if (adjustedExercise.reps) {
          adjustedExercise.reps = Math.max(setsAndReps.repsMin, adjustedExercise.reps - 2)
        }
      }

      return adjustedExercise
    })

    return adjustedWorkout
  })

  // Update plan description to reflect new difficulty
  const levelNames: Record<FitnessLevel, string> = {
    beginner: 'Einsteiger',
    intermediate: 'Fortgeschrittene',
    advanced: 'Erfahrene',
    professional: 'Profis',
  }
  adjustedPlan.description =
    `Angepasster Trainingsplan für ${levelNames[level]}. ${adjustedPlan.description}`

  return adjustedPlan
}
