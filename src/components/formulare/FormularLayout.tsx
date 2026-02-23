import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface FormularLayoutProps {
  title: string
  subtitle: string
  steps: string[]
  currentStep: number
  onStepChange: (step: number) => void
  children: ReactNode
}

export default function FormularLayout({
  title,
  subtitle,
  steps,
  currentStep,
  onStepChange,
  children,
}: FormularLayoutProps) {
  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-6">
        <Link to="/formulare" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Zurück zu Formulare
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      <p className="text-muted-foreground mb-6">{subtitle}</p>

      <div className="flex gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s} className={`flex-1 text-center text-xs py-2 rounded-full ${i === currentStep ? 'bg-primary text-primary-foreground' : i < currentStep ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
            {s}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          {children}

          <div className="flex justify-between mt-6 pt-4 border-t">
            <Button variant="outline" onClick={() => onStepChange(currentStep - 1)} disabled={currentStep === 0}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Zurück
            </Button>
            <Button onClick={() => onStepChange(currentStep + 1)} disabled={currentStep === steps.length - 1}>
              Weiter <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
