'use client'

import * as React from 'react'
import { Check, ChevronLeft, ChevronRight, Save, FileDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface WizardStep {
  id: string
  title: string
  description?: string
  icon?: React.ReactNode
  isOptional?: boolean
}

export interface FormWizardProps {
  steps: WizardStep[]
  currentStep: number
  onStepChange: (step: number) => void
  onComplete: () => void
  onSaveDraft?: () => void
  onExportPDF?: () => void
  title: string
  description?: string
  children: React.ReactNode
  isLoading?: boolean
  canProceed?: boolean
  showSummary?: boolean
}

export function FormWizard({
  steps,
  currentStep,
  onStepChange,
  onComplete,
  onSaveDraft,
  onExportPDF,
  title,
  description,
  children,
  isLoading = false,
  canProceed = true,
  showSummary: _showSummary = false,
}: FormWizardProps) {
  const progress = ((currentStep + 1) / steps.length) * 100
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1

  const handleNext = () => {
    if (isLastStep) {
      onComplete()
    } else {
      onStepChange(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (!isFirstStep) {
      onStepChange(currentStep - 1)
    }
  }

  const handleStepClick = (index: number) => {
    // Nur zu bereits besuchten Schritten zurückspringen
    if (index <= currentStep) {
      onStepChange(index)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="border-b bg-background sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">{title}</h1>
              {description && (
                <p className="text-muted-foreground">{description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {onSaveDraft && (
                <Button variant="outline" onClick={onSaveDraft} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  Entwurf speichern
                </Button>
              )}
              {onExportPDF && isLastStep && (
                <Button variant="outline" onClick={onExportPDF} disabled={isLoading}>
                  <FileDown className="h-4 w-4 mr-2" />
                  PDF exportieren
                </Button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Schritt {currentStep + 1} von {steps.length}
              </span>
              <span className="font-medium">{Math.round(progress)}% abgeschlossen</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar mit Schritten */}
          <div className="lg:col-span-1">
            <Card className="sticky top-32">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Übersicht</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1 px-2 pb-4">
                  {steps.map((step, index) => {
                    const isCompleted = index < currentStep
                    const isCurrent = index === currentStep
                    const isClickable = index <= currentStep

                    return (
                      <button
                        key={step.id}
                        onClick={() => handleStepClick(index)}
                        disabled={!isClickable}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors",
                          isClickable && "cursor-pointer hover:bg-muted",
                          !isClickable && "cursor-not-allowed opacity-50",
                          isCurrent && "bg-primary/10 text-primary",
                          isCompleted && "text-muted-foreground"
                        )}
                      >
                        <div
                          className={cn(
                            "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border-2",
                            isCompleted && "bg-primary border-primary text-primary-foreground",
                            isCurrent && "border-primary text-primary",
                            !isCompleted && !isCurrent && "border-muted-foreground/30"
                          )}
                        >
                          {isCompleted ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={cn(
                            "text-sm font-medium truncate",
                            isCurrent && "text-primary"
                          )}>
                            {step.title}
                          </div>
                          {step.isOptional && (
                            <span className="text-xs text-muted-foreground">Optional</span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Hauptinhalt */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  {steps[currentStep]?.icon && (
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {steps[currentStep].icon}
                    </div>
                  )}
                  <div>
                    <CardTitle>{steps[currentStep]?.title}</CardTitle>
                    {steps[currentStep]?.description && (
                      <CardDescription>{steps[currentStep].description}</CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Formularinhalt */}
                <div className="min-h-[400px]">
                  {children}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-6 mt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={isFirstStep || isLoading}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Zurück
                  </Button>

                  <div className="flex items-center gap-2">
                    {steps[currentStep]?.isOptional && !isLastStep && (
                      <Button
                        variant="ghost"
                        onClick={() => onStepChange(currentStep + 1)}
                        disabled={isLoading}
                      >
                        Überspringen
                      </Button>
                    )}
                    <Button
                      onClick={handleNext}
                      disabled={!canProceed || isLoading}
                    >
                      {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {isLastStep ? (
                        <>
                          Abschließen
                          <Check className="h-4 w-4 ml-2" />
                        </>
                      ) : (
                        <>
                          Weiter
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
