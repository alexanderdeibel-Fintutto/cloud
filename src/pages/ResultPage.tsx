import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase'
import { CheckerResult } from '@/components/checker'
import type { CheckerResult as CheckerResultType, CheckerType } from '@/contexts/CheckerContext'
import { Loader2 } from 'lucide-react'

interface ResultData {
  id: string
  checker_type: CheckerType
  result_data: CheckerResultType
  form_redirect_url: string | null
}

export default function ResultPage() {
  const { checkerId, resultId } = useParams<{ checkerId: string; resultId: string }>()
  const navigate = useNavigate()
  const [result, setResult] = useState<ResultData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResult()
  }, [resultId])

  const fetchResult = async () => {
    if (!resultId) return

    const { data, error } = await supabase
      .from('checker_results')
      .select('*')
      .eq('id', resultId)
      .single()

    if (error) {
      console.error('Error fetching result:', error)
      navigate('/')
      return
    }

    setResult(data as unknown as ResultData)
    setLoading(false)
  }

  const handleGoToForm = () => {
    if (result?.form_redirect_url) {
      window.open(result.form_redirect_url, '_blank')
    }
  }

  const handleStartNew = () => {
    navigate(`/checker/${checkerId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-fintutto-primary" />
      </div>
    )
  }

  if (!result) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-fintutto-light to-white py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Ihr Ergebnis
        </h1>
        <CheckerResult
          result={result.result_data}
          checkerType={result.checker_type}
          onGoToForm={handleGoToForm}
          onStartNew={handleStartNew}
        />
      </div>
    </div>
  )
}
