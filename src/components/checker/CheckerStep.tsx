import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'

interface CheckerStepProps {
  children: ReactNode
  onNext?: () => void
  onPrevious?: () => void
  nextLabel?: string
  previousLabel?: string
  isLoading?: boolean
  canProceed?: boolean
  showPrevious?: boolean
  showNext?: boolean
}

export default function CheckerStep({
  children,
  onNext,
  onPrevious,
  nextLabel = 'Weiter',
  previousLabel = 'Zurueck',
  isLoading = false,
  canProceed = true,
  showPrevious = true,
  showNext = true,
}: CheckerStepProps) {
  return (
    <div className="animate-slide-in-right">
        <div className="space-y-6">{children}</div>

        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
          {showPrevious && onPrevious ? (
            <Button variant="outline" onClick={onPrevious} disabled={isLoading}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {previousLabel}
            </Button>
          ) : (
            <div />
          )}

          {showNext && onNext && (
            <Button
              variant="fintutto"
              onClick={onNext}
              disabled={!canProceed || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Wird analysiert...
                </>
              ) : (
                <>
                  {nextLabel}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
    </div>
  )
}
