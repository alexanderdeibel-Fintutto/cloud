import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { X, Sparkles, Clock, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrialBannerProps {
  className?: string;
  dismissible?: boolean;
}

export function TrialBanner({ className, dismissible = true }: TrialBannerProps) {
  const navigate = useNavigate();
  const { isTrial, daysLeftInTrial, subscription, isLoading } = useSubscription();
  const [dismissed, setDismissed] = useState(false);

  // Check if banner was dismissed in this session
  useEffect(() => {
    const dismissedUntil = localStorage.getItem('fintutto_trial_banner_dismissed');
    if (dismissedUntil) {
      const dismissedDate = new Date(dismissedUntil);
      if (dismissedDate > new Date()) {
        setDismissed(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    // Dismiss for 24 hours
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    localStorage.setItem('fintutto_trial_banner_dismissed', tomorrow.toISOString());
    setDismissed(true);
  };

  if (isLoading || !isTrial || dismissed || daysLeftInTrial <= 0) {
    return null;
  }

  const isUrgent = daysLeftInTrial <= 7;
  const isCritical = daysLeftInTrial <= 3;

  return (
    <div
      className={cn(
        'relative flex items-center justify-between gap-4 px-4 py-2 text-sm',
        isCritical
          ? 'bg-red-500 text-white'
          : isUrgent
          ? 'bg-orange-500 text-white'
          : 'bg-gradient-to-r from-primary/90 to-primary text-primary-foreground',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {isCritical ? (
          <Clock className="h-4 w-4 animate-pulse" />
        ) : (
          <Gift className="h-4 w-4" />
        )}
        <span>
          {isCritical ? (
            <>
              <strong>Nur noch {daysLeftInTrial} {daysLeftInTrial === 1 ? 'Tag' : 'Tage'}!</strong> Ihre Testphase endet bald.
            </>
          ) : isUrgent ? (
            <>
              Noch <strong>{daysLeftInTrial} Tage</strong> in Ihrer kostenlosen Testphase.
            </>
          ) : (
            <>
              Sie nutzen Fintutto im <strong>kostenlosen Testmodus</strong> – noch {daysLeftInTrial} Tage verfügbar.
            </>
          )}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={isCritical || isUrgent ? 'secondary' : 'outline'}
          className={cn(
            'h-7 text-xs',
            !isCritical && !isUrgent && 'bg-white/20 hover:bg-white/30 border-white/30'
          )}
          onClick={() => navigate('/pricing')}
        >
          <Sparkles className="h-3 w-3 mr-1" />
          Jetzt upgraden
        </Button>

        {dismissible && (
          <Button
            size="sm"
            variant="ghost"
            className={cn(
              'h-7 w-7 p-0',
              isCritical || isUrgent ? 'hover:bg-white/20' : 'hover:bg-white/10'
            )}
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// Compact version for sidebar footer
export function TrialBadge() {
  const navigate = useNavigate();
  const { isTrial, daysLeftInTrial, isLoading } = useSubscription();

  if (isLoading || !isTrial || daysLeftInTrial <= 0) {
    return null;
  }

  const isCritical = daysLeftInTrial <= 3;
  const isUrgent = daysLeftInTrial <= 7;

  return (
    <button
      onClick={() => navigate('/pricing')}
      className={cn(
        'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
        isCritical
          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50'
          : isUrgent
          ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50'
          : 'bg-primary/10 text-primary hover:bg-primary/20'
      )}
    >
      <div className="flex items-center gap-2">
        <Gift className={cn('h-4 w-4', isCritical && 'animate-pulse')} />
        <span className="font-medium">Testphase</span>
      </div>
      <span className="text-xs opacity-80">{daysLeftInTrial} Tage</span>
    </button>
  );
}

// Inline usage counter
export function UsageIndicator() {
  const { usage, subscription, isLoading } = useSubscription();

  if (isLoading || !usage) {
    return null;
  }

  const bookingsPercent = usage.bookingsLimit === Infinity
    ? 0
    : Math.min(100, (usage.bookingsUsed / usage.bookingsLimit) * 100);

  const isNearLimit = bookingsPercent >= 80;
  const isAtLimit = bookingsPercent >= 100;

  if (!isNearLimit) {
    return null;
  }

  return (
    <div className={cn(
      'px-3 py-2 rounded-lg text-sm',
      isAtLimit
        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
        : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
    )}>
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium">Buchungen</span>
        <span className="text-xs">
          {usage.bookingsUsed} / {usage.bookingsLimit === Infinity ? '∞' : usage.bookingsLimit}
        </span>
      </div>
      <div className="h-1.5 bg-black/10 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            isAtLimit ? 'bg-red-500' : 'bg-orange-500'
          )}
          style={{ width: `${bookingsPercent}%` }}
        />
      </div>
    </div>
  );
}

export default TrialBanner;
