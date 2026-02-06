import { Link } from 'react-router-dom'
import { AlertTriangle, Sparkles, Crown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

export default function CheckerLimitBanner() {
  const { profile, getRemainingChecks, canUseChecker } = useAuth()

  const remainingChecks = getRemainingChecks()
  const tier = profile?.tier || 'free'

  // Premium users don't need to see this
  if (tier === 'premium' || remainingChecks === -1) {
    return null
  }

  // User has reached their limit
  if (!canUseChecker()) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-800">
              Monatliches Limit erreicht
            </h3>
            <p className="text-sm text-red-700 mt-1">
              {tier === 'free' ? (
                <>Sie haben Ihren kostenlosen Check diesen Monat bereits genutzt.</>
              ) : (
                <>Sie haben alle {profile?.checksLimit} Checks fuer diesen Monat aufgebraucht.</>
              )}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild size="sm" className="bg-fintutto-primary hover:bg-fintutto-primary/90">
                <Link to="/preise">
                  <Crown className="w-4 h-4 mr-1" />
                  Jetzt upgraden
                </Link>
              </Button>
              {!profile && (
                <Button asChild size="sm" variant="outline">
                  <Link to="/login">
                    Anmelden fuer mehr Checks
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show warning when running low on checks
  if (remainingChecks <= 1) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-amber-800">
              {remainingChecks === 1 ? 'Letzter Check' : 'Keine Checks mehr'}
            </h3>
            <p className="text-sm text-amber-700 mt-1">
              {remainingChecks === 1 ? (
                <>Dies ist Ihr letzter kostenloser Check diesen Monat.</>
              ) : (
                <>Sie haben keine Checks mehr diesen Monat.</>
              )}
              {' '}Upgraden Sie fuer unbegrenzte Checks!
            </p>
            <div className="mt-3">
              <Button asChild size="sm" variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-100">
                <Link to="/preise">
                  Preise ansehen
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show remaining checks info
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-blue-700">
          <span className="font-medium">{remainingChecks}</span> {remainingChecks === 1 ? 'Check' : 'Checks'} verbleibend diesen Monat
        </span>
        <Link to="/preise" className="text-sm text-fintutto-primary hover:underline font-medium">
          Mehr Checks
        </Link>
      </div>
    </div>
  )
}
