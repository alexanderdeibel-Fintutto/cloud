import { ReactNode } from 'react'
import { useChecker } from '@/contexts/CheckerContext'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

interface CheckerLayoutProps {
  title: string
  description: string
  icon: ReactNode
  children: ReactNode
}

export default function CheckerLayout({ title, description, icon, children }: CheckerLayoutProps) {
  const { currentSession } = useChecker()

  const progressPercentage = currentSession
    ? (currentSession.currentStep / currentSession.totalSteps) * 100
    : 0

  return (
    <div className="py-8">
      <div className="container max-w-3xl">
        {/* Back Link */}
        <Link
          to="/checker"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Alle Checker
        </Link>

        {/* Header */}
        <div className="bg-card rounded-2xl shadow-lg border border-border p-8 mb-6">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              {icon}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{title}</h1>
              <p className="text-muted-foreground mt-1">{description}</p>
            </div>
          </div>

          {/* Progress Bar */}
          {currentSession && (
            <div className="mt-6">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>
                  Schritt {currentSession.currentStep} von {currentSession.totalSteps}
                </span>
                <span>{Math.round(progressPercentage)}% abgeschlossen</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
          {children}
        </div>

        {/* Legal Note */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          Hinweis: Dieser Check ersetzt keine Rechtsberatung. Bei komplexen Faellen empfehlen wir,
          einen Fachanwalt fuer Mietrecht zu konsultieren.
        </p>
      </div>
    </div>
  )
}
