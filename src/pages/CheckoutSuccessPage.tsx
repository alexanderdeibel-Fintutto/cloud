import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    // In production, verify the session with your backend
    // and update the user's subscription status
    const verifySession = async () => {
      if (sessionId) {
        try {
          // TODO: Call your backend to verify the Stripe session
          // await fetch('/api/verify-checkout-session', {
          //   method: 'POST',
          //   body: JSON.stringify({ sessionId }),
          // })

          // Simulate verification delay
          await new Promise(resolve => setTimeout(resolve, 1500))
        } catch {
        }
      }
      setIsLoading(false)
    }

    verifySession()
  }, [sessionId])

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-fintutto-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Zahlung wird bestaetigt...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
      <div className="animate-fade-scale-in max-w-md w-full">
        <Card className="text-center">
          <CardContent className="pt-12 pb-8">
            <div className="animate-fade-scale-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Zahlung erfolgreich!
            </h1>
            <p className="text-gray-600 mb-8">
              Vielen Dank fuer Ihr Abonnement. Ihr Account wurde erfolgreich aktualisiert
              und Sie koennen jetzt alle Features nutzen.
            </p>

            <div className="space-y-3">
              <Button variant="fintutto" className="w-full" asChild>
                <Link to="/dashboard">
                  Zum Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/">
                  Zur Startseite
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          Sie erhalten in Kuerze eine Bestaetigung per E-Mail.
        </p>
      </div>
    </div>
  )
}
