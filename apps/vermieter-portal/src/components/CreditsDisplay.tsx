import { Link } from 'react-router-dom'
import { Coins, ChevronRight } from 'lucide-react'
import { useCredits } from '../contexts/CreditsContext'
import { formatCreditsDisplay } from '../lib/credits'
import { ALL_PLANS } from '../../../../packages/shared/src/credits'

export function CreditsDisplay() {
  const { credits, isLoading } = useCredits()

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted animate-pulse">
        <Coins className="h-4 w-4" />
        <span className="text-sm">...</span>
      </div>
    )
  }

  if (!credits) {
    return (
      <Link
        to="/anmelden"
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
      >
        <Coins className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Anmelden</span>
      </Link>
    )
  }

  const plan = ALL_PLANS[credits.plan]
  const isUnlimited = plan.monthlyCredits === -1
  const creditsDisplay = formatCreditsDisplay(credits.creditsRemaining)
  const maxCredits = formatCreditsDisplay(plan.monthlyCredits)

  // Calculate percentage for the progress indicator
  const percentage = isUnlimited ? 100 : (credits.creditsRemaining / plan.monthlyCredits) * 100
  const isLow = !isUnlimited && percentage < 30

  return (
    <Link
      to="/preise"
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${
        isLow ? 'bg-destructive/10 hover:bg-destructive/20' : 'bg-primary/10 hover:bg-primary/20'
      }`}
    >
      <div className="relative">
        <Coins className={`h-4 w-4 ${isLow ? 'text-destructive' : 'text-primary'}`} />
        {isLow && (
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive animate-pulse" />
        )}
      </div>
      <span className={`text-sm font-medium ${isLow ? 'text-destructive' : ''}`}>
        {creditsDisplay}
        {!isUnlimited && <span className="text-muted-foreground">/{maxCredits}</span>}
      </span>
      <ChevronRight className="h-3 w-3 text-muted-foreground" />
    </Link>
  )
}

export function CreditsCard() {
  const { credits, isLoading } = useCredits()
  if (isLoading || !credits) return null
  const plan = ALL_PLANS[credits.plan]
  const isUnlimited = plan.monthlyCredits === -1
  const percentage = isUnlimited ? 100 : (credits.creditsRemaining / plan.monthlyCredits) * 100

  return (
    <div className="bg-card rounded-xl border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-primary" />
          <span className="font-semibold">Deine Credits</span>
        </div>
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
          {plan.name}
        </span>
      </div>

      <div className="text-3xl font-bold mb-2">
        {formatCreditsDisplay(credits.creditsRemaining)}
        {!isUnlimited && (
          <span className="text-lg text-muted-foreground font-normal">
            {' '}/ {plan.monthlyCredits}
          </span>
        )}
      </div>

      {!isUnlimited && (
        <div className="mb-3">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                percentage < 30 ? 'bg-destructive' : 'bg-primary'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {isUnlimited
          ? 'Unbegrenzte Credits verfügbar'
          : `Erneuert am ${credits.periodEnd.toLocaleDateString('de-DE')}`}
      </p>

      {plan.id !== 'unlimited' && (
        <Link
          to="/preise"
          className="mt-3 block text-center text-sm text-primary hover:underline"
        >
          Upgrade für mehr Credits →
        </Link>
      )}
    </div>
  )
}
