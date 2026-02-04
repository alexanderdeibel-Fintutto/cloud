'use client'

import * as React from 'react'
import { Check, AlertCircle, Edit2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface SummarySection {
  id: string
  title: string
  stepIndex: number
  items: SummaryItem[]
  isComplete: boolean
}

export interface SummaryItem {
  label: string
  value: string | React.ReactNode
  isRequired?: boolean
  isEmpty?: boolean
}

interface WizardSummaryProps {
  sections: SummarySection[]
  onEditSection: (stepIndex: number) => void
  title?: string
  description?: string
}

export function WizardSummary({
  sections,
  onEditSection,
  title: _title = "Zusammenfassung",
  description: _description = "Bitte überprüfen Sie Ihre Angaben vor dem Abschluss"
}: WizardSummaryProps) {
  const allComplete = sections.every(s => s.isComplete)
  const incompleteCount = sections.filter(s => !s.isComplete).length

  return (
    <div className="space-y-6">
      {/* Status-Übersicht */}
      <div className={cn(
        "p-4 rounded-lg border",
        allComplete ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"
      )}>
        <div className="flex items-center gap-3">
          {allComplete ? (
            <Check className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-600" />
          )}
          <div>
            <p className={cn(
              "font-medium",
              allComplete ? "text-green-800" : "text-yellow-800"
            )}>
              {allComplete
                ? "Alle Angaben vollständig"
                : `${incompleteCount} Abschnitt(e) unvollständig`
              }
            </p>
            <p className={cn(
              "text-sm",
              allComplete ? "text-green-600" : "text-yellow-600"
            )}>
              {allComplete
                ? "Sie können das Formular jetzt abschließen"
                : "Bitte vervollständigen Sie die markierten Abschnitte"
              }
            </p>
          </div>
        </div>
      </div>

      {/* Zusammenfassungs-Sektionen */}
      <div className="space-y-4">
        {sections.map((section) => (
          <Card key={section.id} className={cn(
            "transition-colors",
            !section.isComplete && "border-yellow-300"
          )}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{section.title}</CardTitle>
                  {section.isComplete ? (
                    <Badge variant="success" className="text-xs">
                      <Check className="h-3 w-3 mr-1" />
                      Vollständig
                    </Badge>
                  ) : (
                    <Badge variant="warning" className="text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Unvollständig
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditSection(section.stepIndex)}
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Bearbeiten
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.items.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <dt className="text-sm text-muted-foreground">
                      {item.label}
                      {item.isRequired && <span className="text-destructive ml-1">*</span>}
                    </dt>
                    <dd className={cn(
                      "text-sm font-medium",
                      item.isEmpty && "text-muted-foreground italic"
                    )}>
                      {item.isEmpty ? "Nicht angegeben" : item.value}
                    </dd>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
