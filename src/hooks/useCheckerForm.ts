import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChecker, CheckerResult as CheckerResultType, type CheckerType } from '@/contexts/CheckerContext'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface UseCheckerFormOptions<T> {
  checkerType: CheckerType
  totalSteps: number
  initialFormData: T
}

export function useCheckerForm<T extends object>({
  checkerType,
  totalSteps,
  initialFormData,
}: UseCheckerFormOptions<T>) {
  const navigate = useNavigate()
  const { startSession, completeSession, clearSession } = useChecker()
  const { canUseChecker, incrementChecksUsed } = useAuth()

  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<CheckerResultType | null>(null)
  const [formData, setFormData] = useState<T>(initialFormData)

  const initSession = useCallback(async () => {
    if (!canUseChecker()) {
      toast.error('Limit erreicht.')
      navigate('/')
      return
    }
    await startSession(checkerType, totalSteps)
  }, [canUseChecker, navigate, startSession, checkerType, totalSteps])

  useEffect(() => {
    initSession()
  }, [])

  const updateField = useCallback((field: keyof T, value: string | number | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const submitResult = useCallback(async (checkerResult: CheckerResultType) => {
    await completeSession(checkerResult)
    await incrementChecksUsed()
    setResult(checkerResult)
  }, [completeSession, incrementChecksUsed])

  const handleGoToForm = useCallback(() => {
    navigate(result?.formRedirectUrl ?? '/formulare')
  }, [navigate, result])

  const handleStartNew = useCallback(() => {
    clearSession()
    setResult(null)
    setStep(1)
    setFormData(initialFormData)
    initSession()
  }, [clearSession, initialFormData, initSession])

  return {
    step,
    setStep,
    isLoading,
    setIsLoading,
    result,
    formData,
    updateField,
    submitResult,
    handleGoToForm,
    handleStartNew,
  }
}
