import { ReactNode } from 'react'
import { useChecker } from '@/contexts/CheckerContext'
import { useDocumentTitle } from '@fintutto/shared'
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
  useDocumentTitle(title, 'Fintutto Checker')
  const { currentSession } = useChecker()

  const progressPercentage = currentSession
    ? (currentSession.currentStep / currentSession.totalSteps) * 100
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-fintutto-light to-white py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center text-gray-600 hover:text-fintutto-primary mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurueck zur Uebersicht
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-fintutto-primary/10 rounded-xl flex items-center justify-center text-fintutto-primary">
              {icon}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-gray-600 mt-1">{description}</p>
            </div>
          </div>

          {/* Progress Bar */}
          {currentSession && (
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
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
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {children}
        </div>

        {/* Legal Note */}
        <p className="text-xs text-gray-500 text-center mt-6">
          Hinweis: Dieser Check ersetzt keine Rechtsberatung. Bei komplexen Faellen empfehlen wir,
          einen Fachanwalt fuer Mietrecht zu konsultieren.
        </p>
      </div>
    </div>
  )
}
