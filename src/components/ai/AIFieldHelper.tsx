'use client'

import * as React from 'react'
import { Sparkles, Loader2, Lightbulb, AlertCircle, Check, HelpCircle, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface AIFieldHelperProps {
  fieldId: string
  fieldType: 'text' | 'currency' | 'date' | 'address' | 'person' | 'legal' | 'custom'
  context?: Record<string, unknown>
  onSuggestion?: (suggestion: any) => void
  disabled?: boolean
}

// Vordefinierte Hilfe-Inhalte für verschiedene Feldtypen
const FIELD_HELP: Record<string, {
  title: string
  description: string
  tips?: string[]
  legalHints?: string[]
  examples?: string[]
}> = {
  'kaltmiete': {
    title: 'Kaltmiete (Nettomiete)',
    description: 'Die Kaltmiete ist die reine Miete ohne Nebenkosten. Sie ist die Basis für viele rechtliche Berechnungen.',
    tips: [
      'Die Kaltmiete sollte marktüblich sein',
      'Orientieren Sie sich am lokalen Mietspiegel',
      'Bei Neuvermietung gilt ggf. die Mietpreisbremse'
    ],
    legalHints: [
      'Die Kaution darf maximal 3 Kaltmieten betragen (§ 551 BGB)',
      'Mieterhöhungen beziehen sich auf die Kaltmiete'
    ],
    examples: ['500,00 €', '750,00 €', '1.200,00 €']
  },
  'nebenkosten': {
    title: 'Nebenkosten / Betriebskosten',
    description: 'Vorauszahlung für umlagefähige Betriebskosten nach der Betriebskostenverordnung (BetrKV).',
    tips: [
      'Typisch: 2-3 €/m² monatlich',
      'Heizkosten müssen zu 50-70% verbrauchsabhängig sein',
      'Jährliche Abrechnung mit 12-Monats-Frist'
    ],
    legalHints: [
      'Nur Kosten nach § 2 BetrKV sind umlagefähig',
      'Verwaltungskosten sind NICHT umlagefähig'
    ]
  },
  'kaution': {
    title: 'Mietkaution',
    description: 'Sicherheitsleistung des Mieters für eventuelle Schäden oder ausstehende Zahlungen.',
    tips: [
      'Darf in 3 Monatsraten gezahlt werden',
      'Muss auf einem separaten Konto angelegt werden',
      'Verzinsung zugunsten des Mieters'
    ],
    legalHints: [
      'Maximum: 3 Monatskaltmieten (§ 551 BGB)',
      'Rückgabe nach Auszug mit angemessener Prüffrist'
    ]
  },
  'mietbeginn': {
    title: 'Mietbeginn',
    description: 'Ab diesem Datum beginnt das Mietverhältnis und die Mietzahlungspflicht.',
    tips: [
      'Üblicherweise der 1. oder 15. eines Monats',
      'Schlüsselübergabe sollte vereinbart werden',
      'Übergabeprotokoll erstellen!'
    ]
  },
  'kuendigung': {
    title: 'Kündigungsfrist',
    description: 'Die gesetzliche Kündigungsfrist für Mieter beträgt 3 Monate.',
    tips: [
      'Kündigung muss schriftlich erfolgen',
      'Spätestens am 3. Werktag des Monats',
      'Per Einschreiben empfohlen'
    ],
    legalHints: [
      'Vermieter: 3-9 Monate je nach Wohndauer (§ 573c BGB)',
      'Mieter: immer 3 Monate, unabhängig von der Wohndauer'
    ]
  },
  'schoenheitsreparaturen': {
    title: 'Schönheitsreparaturen',
    description: 'Renovierungsarbeiten wie Tapezieren und Streichen während der Mietzeit.',
    tips: [
      'Starre Fristenpläne sind unwirksam (BGH)',
      'Unrenoviert übernommen = keine Pflicht',
      'Endrenovierungsklauseln meist unwirksam'
    ],
    legalHints: [
      'Viele Klauseln aus älteren Verträgen sind heute unwirksam',
      'Im Zweifel: Rechtsberatung einholen'
    ]
  },
  'address': {
    title: 'Adresse eingeben',
    description: 'Geben Sie die vollständige Anschrift ein.',
    tips: [
      'Straße mit Hausnummer angeben',
      '5-stellige Postleitzahl',
      'Zusätze wie Etage/Apartment bei Bedarf'
    ]
  },
  'person': {
    title: 'Personendaten',
    description: 'Geben Sie die vollständigen Daten der Person ein.',
    tips: [
      'Name wie im Ausweis',
      'Bei Firmen: vollständiger Firmenname mit Rechtsform',
      'Kontaktdaten für Korrespondenz'
    ]
  }
}

// Simulierte KI-Vorschläge (in Produktion: API-Call zu OpenAI/Claude)
const generateAISuggestion = async (
  fieldId: string,
  fieldType: string,
  context: Record<string, unknown>
): Promise<{ suggestion: any; explanation: string }> => {
  // Simulierte Verzögerung
  await new Promise(resolve => setTimeout(resolve, 800))

  // Kontext-basierte Vorschläge
  if (fieldType === 'currency' && fieldId.toLowerCase().includes('kalt')) {
    const qm = (context.wohnflaeche as number) || 80
    const avgPricePerQm = 12 // Durchschnitt
    return {
      suggestion: Math.round(qm * avgPricePerQm * 100) / 100,
      explanation: `Basierend auf ${qm}m² Wohnfläche und einem durchschnittlichen Quadratmeterpreis von ${avgPricePerQm}€ in Ihrer Region.`
    }
  }

  if (fieldType === 'currency' && fieldId.toLowerCase().includes('neben')) {
    const qm = (context.wohnflaeche as number) || 80
    return {
      suggestion: Math.round(qm * 2.5 * 100) / 100,
      explanation: `Typische Nebenkostenvorauszahlung von 2,50€/m² für ${qm}m² Wohnfläche.`
    }
  }

  return {
    suggestion: null,
    explanation: 'Keine automatische Empfehlung verfügbar.'
  }
}

export function AIFieldHelper({
  fieldId,
  fieldType,
  context = {},
  onSuggestion,
  disabled = false
}: AIFieldHelperProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [suggestion, setSuggestion] = React.useState<{ value: any; explanation: string } | null>(null)

  const helpContent = FIELD_HELP[fieldId.toLowerCase()] || FIELD_HELP[fieldType] || null

  const handleGetSuggestion = async () => {
    setIsLoading(true)
    try {
      const result = await generateAISuggestion(fieldId, fieldType, context)
      setSuggestion({
        value: result.suggestion,
        explanation: result.explanation
      })
    } catch (error) {
      console.error('AI suggestion error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplySuggestion = () => {
    if (suggestion && suggestion.value !== null && onSuggestion) {
      onSuggestion(suggestion.value)
      setIsOpen(false)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="h-7 px-2 text-primary hover:text-primary hover:bg-primary/10"
        >
          <Sparkles className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-sm">KI-Assistent</h4>
              <p className="text-xs text-muted-foreground">
                Hilfe und Vorschläge für dieses Feld
              </p>
            </div>
          </div>

          <Separator />

          {/* Hilfe-Inhalt */}
          {helpContent && (
            <div className="space-y-3">
              <div>
                <h5 className="font-medium text-sm flex items-center gap-1">
                  <HelpCircle className="h-3.5 w-3.5" />
                  {helpContent.title}
                </h5>
                <p className="text-xs text-muted-foreground mt-1">
                  {helpContent.description}
                </p>
              </div>

              {/* Tipps */}
              {helpContent.tips && helpContent.tips.length > 0 && (
                <div>
                  <h6 className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    <Lightbulb className="h-3 w-3" />
                    Tipps
                  </h6>
                  <ul className="text-xs space-y-1">
                    {helpContent.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <Check className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Rechtliche Hinweise */}
              {helpContent.legalHints && helpContent.legalHints.length > 0 && (
                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                  <h6 className="text-xs font-medium text-yellow-800 mb-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Rechtlicher Hinweis
                  </h6>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    {helpContent.legalHints.map((hint, i) => (
                      <li key={i}>• {hint}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Beispiele */}
              {helpContent.examples && (
                <div>
                  <h6 className="text-xs font-medium text-muted-foreground mb-1">Beispiele:</h6>
                  <div className="flex flex-wrap gap-1">
                    {helpContent.examples.map((example, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => onSuggestion?.(example)}
                      >
                        {example}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* KI-Vorschlag generieren */}
          {onSuggestion && (fieldType === 'currency' || fieldType === 'text') && (
            <>
              <Separator />
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGetSuggestion}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analysiere...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Vorschlag generieren
                    </>
                  )}
                </Button>

                {/* Vorschlag anzeigen */}
                {suggestion && suggestion.value !== null && (
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Vorschlag:</span>
                      <span className="font-medium">
                        {typeof suggestion.value === 'number'
                          ? suggestion.value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
                          : suggestion.value}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {suggestion.explanation}
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleApplySuggestion}
                      className="w-full"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Übernehmen
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
