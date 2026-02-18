import React, { createContext, useContext, useState, useCallback } from 'react'
import type { WorkoutSession, WorkoutExerciseLog, ExerciseSet, Exercise } from '@/lib/types'

interface ActiveWorkout {
  session: WorkoutSession
  currentExerciseIndex: number
  currentSetIndex: number
  isPaused: boolean
  elapsedSeconds: number
  restTimerSeconds: number
  isResting: boolean
}

interface WorkoutContextType {
  activeWorkout: ActiveWorkout | null
  startWorkout: (session: WorkoutSession) => void
  completeSet: (exerciseIndex: number, setIndex: number, actualReps: number, actualWeight: number) => void
  skipSet: (exerciseIndex: number, setIndex: number) => void
  nextExercise: () => void
  previousExercise: () => void
  pauseWorkout: () => void
  resumeWorkout: () => void
  finishWorkout: (rating: number, notes: string, mood: string) => WorkoutSession | null
  cancelWorkout: () => void
  updateElapsedTime: (seconds: number) => void
  startRestTimer: (seconds: number) => void
  clearRestTimer: () => void
}

const WorkoutContext = createContext<WorkoutContextType>({
  activeWorkout: null,
  startWorkout: () => {},
  completeSet: () => {},
  skipSet: () => {},
  nextExercise: () => {},
  previousExercise: () => {},
  pauseWorkout: () => {},
  resumeWorkout: () => {},
  finishWorkout: () => null,
  cancelWorkout: () => {},
  updateElapsedTime: () => {},
  startRestTimer: () => {},
  clearRestTimer: () => {},
})

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(null)

  const startWorkout = useCallback((session: WorkoutSession) => {
    setActiveWorkout({
      session: { ...session, startedAt: new Date().toISOString() },
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      isPaused: false,
      elapsedSeconds: 0,
      restTimerSeconds: 0,
      isResting: false,
    })
  }, [])

  const completeSet = useCallback((exerciseIndex: number, setIndex: number, actualReps: number, actualWeight: number) => {
    setActiveWorkout(prev => {
      if (!prev) return null
      const session = { ...prev.session }
      const exercises = [...session.exercises]
      const exercise = { ...exercises[exerciseIndex] }
      const sets = [...exercise.sets]
      sets[setIndex] = {
        ...sets[setIndex],
        actualReps,
        actualWeight,
        completed: true,
      }
      exercise.sets = sets
      exercises[exerciseIndex] = exercise
      session.exercises = exercises
      session.totalVolume = exercises.reduce((total, ex) =>
        total + ex.sets.reduce((setTotal, s) =>
          setTotal + (s.completed ? (s.actualWeight || 0) * (s.actualReps || 0) : 0), 0), 0)
      return { ...prev, session }
    })
  }, [])

  const skipSet = useCallback((exerciseIndex: number, setIndex: number) => {
    setActiveWorkout(prev => {
      if (!prev) return null
      const session = { ...prev.session }
      const exercises = [...session.exercises]
      const exercise = { ...exercises[exerciseIndex] }
      const sets = [...exercise.sets]
      sets[setIndex] = { ...sets[setIndex], completed: true, actualReps: 0, actualWeight: 0 }
      exercise.sets = sets
      exercises[exerciseIndex] = exercise
      session.exercises = exercises
      return { ...prev, session }
    })
  }, [])

  const nextExercise = useCallback(() => {
    setActiveWorkout(prev => {
      if (!prev) return null
      const nextIdx = Math.min(prev.currentExerciseIndex + 1, prev.session.exercises.length - 1)
      return { ...prev, currentExerciseIndex: nextIdx, currentSetIndex: 0 }
    })
  }, [])

  const previousExercise = useCallback(() => {
    setActiveWorkout(prev => {
      if (!prev) return null
      return { ...prev, currentExerciseIndex: Math.max(prev.currentExerciseIndex - 1, 0), currentSetIndex: 0 }
    })
  }, [])

  const pauseWorkout = useCallback(() => {
    setActiveWorkout(prev => prev ? { ...prev, isPaused: true } : null)
  }, [])

  const resumeWorkout = useCallback(() => {
    setActiveWorkout(prev => prev ? { ...prev, isPaused: false } : null)
  }, [])

  const finishWorkout = useCallback((rating: number, notes: string, mood: string) => {
    if (!activeWorkout) return null
    const completedSession: WorkoutSession = {
      ...activeWorkout.session,
      completedAt: new Date().toISOString(),
      durationMinutes: Math.round(activeWorkout.elapsedSeconds / 60),
      rating,
      notes,
      mood: mood as WorkoutSession['mood'],
      totalCaloriesBurned: Math.round(activeWorkout.elapsedSeconds / 60 * 7),
    }
    setActiveWorkout(null)
    return completedSession
  }, [activeWorkout])

  const cancelWorkout = useCallback(() => {
    setActiveWorkout(null)
  }, [])

  const updateElapsedTime = useCallback((seconds: number) => {
    setActiveWorkout(prev => prev ? { ...prev, elapsedSeconds: seconds } : null)
  }, [])

  const startRestTimer = useCallback((seconds: number) => {
    setActiveWorkout(prev => prev ? { ...prev, restTimerSeconds: seconds, isResting: true } : null)
  }, [])

  const clearRestTimer = useCallback(() => {
    setActiveWorkout(prev => prev ? { ...prev, restTimerSeconds: 0, isResting: false } : null)
  }, [])

  return (
    <WorkoutContext.Provider
      value={{
        activeWorkout,
        startWorkout,
        completeSet,
        skipSet,
        nextExercise,
        previousExercise,
        pauseWorkout,
        resumeWorkout,
        finishWorkout,
        cancelWorkout,
        updateElapsedTime,
        startRestTimer,
        clearRestTimer,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  )
}

export function useWorkout() {
  return useContext(WorkoutContext)
}
