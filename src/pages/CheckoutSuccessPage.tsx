import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight, Loader2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface VerificationResult {
  success: boolean
  tier?: string
  checksLimit?: number
  error?: string
}

export default function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    const verifySession = async () => {
      if (!sessionId) {
        setVerificationResult({ success: false, error: 'Keine Session-ID gefunden' })
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch('/api/verify-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        })

        const data = await response.json()

        if (response.ok && data.success) {
          setVerificationResult({
            success: true,
            tier: data.tier,
            checksLimit: data.checksLimit,
          })
        } else {
          setVerificationResult({
            success: false,
            error: data.error || 'Verifizierung fehlgeschlagen',
          })
        }
      } catch (error) {
        console.error('Session verification error:', error)
        setVerificationResult({
          success: false,
          error: 'Netzwerkfehler bei der Verifizierung',
        })
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

  const tierNames: Record<string, string> = {
    basic: 'Basic',
    premium: 'Premium',
  }

  // Error state
  if (verificationResult && !verificationResult.success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <Card className="text-center">
            <CardContent className="pt-12 pb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="w-12 h-12 text-red-500" />
                </div>
              </motion.div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Verifizierung fehlgeschlagen
              </h1>
              <p className="text-gray-600 mb-8">
                {verificationResult.error || 'Die Zahlung konnte nicht verifiziert werden.'}
                {' '}Bitte kontaktieren Sie unseren Support, falls das Problem weiterhin besteht.
              </p>

              <div className="space-y-3">
                <Button variant="fintutto" className="w-full" asChild>
                  <Link to="/preise">
                    Erneut versuchen
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
        </motion.div>
      </div>
    )
  }

  // Success state
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <Card className="text-center">
          <CardContent className="pt-12 pb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
            </motion.div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Zahlung erfolgreich!
            </h1>

            {verificationResult?.tier && (
              <div className="inline-block px-4 py-1 mb-4 rounded-full bg-fintutto-primary/10 text-fintutto-primary font-medium text-sm">
                {tierNames[verificationResult.tier] || verificationResult.tier} Abo aktiviert
              </div>
            )}

            <p className="text-gray-600 mb-8">
              Vielen Dank fuer Ihr Abonnement. Ihr Account wurde erfolgreich aktualisiert
              und Sie koennen jetzt alle Features nutzen.
              {verificationResult?.checksLimit && verificationResult.checksLimit > 0 && (
                <span className="block mt-2 text-sm">
                  Sie haben jetzt {verificationResult.checksLimit} Checks pro Monat.
                </span>
              )}
              {verificationResult?.checksLimit === -1 && (
                <span className="block mt-2 text-sm">
                  Sie haben jetzt unbegrenzte Checks.
                </span>
              )}
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
      </motion.div>
    </div>
  )
}
