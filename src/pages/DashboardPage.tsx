import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate, formatCurrency } from '@/lib/utils'
import {
  FileCheck,
  Clock,
  TrendingUp,
  ArrowRight,
  Crown,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'

interface CheckerResultRecord {
  id: string
  checker_type: string
  result_data: {
    status: string
    title: string
    potentialSavings?: number
  }
  created_at: string
  form_redirect_url: string | null
}

export default function DashboardPage() {
  const { user, profile, loading } = useAuth()
  const navigate = useNavigate()
  const [results, setResults] = useState<CheckerResultRecord[]>([])
  const [loadingResults, setLoadingResults] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [user, loading, navigate])

  useEffect(() => {
    if (user) {
      fetchResults()
    }
  }, [user])

  const fetchResults = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('checker_results')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching results:', error)
    } else {
      setResults(data as unknown as CheckerResultRecord[])
    }
    setLoadingResults(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'positive':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'negative':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
    }
  }

  const checkerLabels: Record<string, string> = {
    mietpreisbremse: 'Mietpreisbremse',
    mieterhoehung: 'Mieterhoehung',
    nebenkosten: 'Nebenkosten',
    betriebskosten: 'Betriebskosten',
    kuendigung: 'Kuendigung',
    kaution: 'Kaution',
    mietminderung: 'Mietminderung',
    eigenbedarf: 'Eigenbedarf',
    modernisierung: 'Modernisierung',
    schoenheitsreparaturen: 'Schoenheitsreparaturen',
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-fintutto-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  const totalSavings = results.reduce(
    (sum, r) => sum + (r.result_data?.potentialSavings || 0),
    0
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Willkommen zurueck, {profile?.name || 'Nutzer'}
          </h1>
          <p className="text-gray-600 mt-1">
            Hier finden Sie alle Ihre durchgefuehrten Checks.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileCheck className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Durchgefuehrte Checks</p>
                  <p className="text-2xl font-bold text-gray-900">{results.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Moegliche Ersparnis</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(totalSavings)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Crown className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ihr Plan</p>
                  <p className="text-2xl font-bold text-gray-900 capitalize">{profile?.tier}</p>
                  <p className="text-xs text-gray-500">
                    {profile?.checksUsed}/{profile?.checksLimit === -1 ? 'unbegrenzt' : profile?.checksLimit} Checks genutzt
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Results */}
        <Card>
          <CardHeader>
            <CardTitle>Ihre letzten Checks</CardTitle>
            <CardDescription>
              Klicken Sie auf einen Check, um die Details zu sehen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingResults ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin w-6 h-6 border-4 border-fintutto-primary border-t-transparent rounded-full" />
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Noch keine Checks durchgefuehrt</p>
                <Button variant="fintutto" className="mt-4" asChild>
                  <Link to="/">Ersten Check starten</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {getStatusIcon(result.result_data?.status)}
                      <div>
                        <p className="font-medium text-gray-900">
                          {checkerLabels[result.checker_type] || result.checker_type}-Checker
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(result.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {(result.result_data?.potentialSavings ?? 0) > 0 && (
                        <span className="text-green-600 font-medium">
                          +{formatCurrency(result.result_data?.potentialSavings ?? 0)}
                        </span>
                      )}
                      {result.form_redirect_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={result.form_redirect_url} target="_blank" rel="noopener noreferrer">
                            Zum Formular
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
