'use client'

import * as React from 'react'
import { Euro, Calculator } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn, formatCurrency } from '@/lib/utils'
import { AIFieldHelper } from '@/components/ai/AIFieldHelper'

interface CurrencyFieldProps {
  value: number | null
  onChange: (value: number | null) => void
  label: string
  required?: boolean
  min?: number
  max?: number
  step?: number
  helperText?: string
  error?: string
  disabled?: boolean
  showAIHelper?: boolean
  aiContext?: Record<string, unknown>
  calculation?: {
    label: string
    formula: () => number
  }
}

export function CurrencyField({
  value,
  onChange,
  label,
  required = false,
  min,
  max,
  step: _step = 0.01,
  helperText,
  error,
  disabled = false,
  showAIHelper = false,
  aiContext,
  calculation
}: CurrencyFieldProps) {
  const [inputValue, setInputValue] = React.useState<string>(
    value !== null ? value.toString().replace('.', ',') : ''
  )
  const [isFocused, setIsFocused] = React.useState(false)

  // Sync mit externem Value
  React.useEffect(() => {
    if (!isFocused && value !== null) {
      setInputValue(value.toString().replace('.', ','))
    } else if (!isFocused && value === null) {
      setInputValue('')
    }
  }, [value, isFocused])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    // Nur Zahlen, Komma und Punkt erlauben
    const cleaned = raw.replace(/[^\d,.-]/g, '')
    setInputValue(cleaned)

    // In Zahl umwandeln
    const normalized = cleaned.replace(',', '.')
    const numValue = parseFloat(normalized)

    if (!isNaN(numValue)) {
      onChange(numValue)
    } else if (cleaned === '' || cleaned === '-') {
      onChange(null)
    }
  }

  const handleBlur = () => {
    setIsFocused(false)
    // Formatieren bei Blur
    if (value !== null) {
      setInputValue(value.toFixed(2).replace('.', ','))
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleCalculation = () => {
    if (calculation) {
      const result = calculation.formula()
      onChange(result)
      setInputValue(result.toFixed(2).replace('.', ','))
    }
  }

  const handleAISuggestion = (suggestion: number) => {
    onChange(suggestion)
    setInputValue(suggestion.toFixed(2).replace('.', ','))
  }

  const isOutOfRange = value !== null && (
    (min !== undefined && value < min) ||
    (max !== undefined && value > max)
  )

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={label} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <div className="flex items-center gap-1">
          {calculation && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCalculation}
                    disabled={disabled}
                    className="h-7 px-2"
                  >
                    <Calculator className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{calculation.label}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {showAIHelper && (
            <AIFieldHelper
              fieldId={label}
              fieldType="currency"
              context={aiContext}
              onSuggestion={handleAISuggestion}
            />
          )}
        </div>
      </div>

      <div className="relative">
        <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id={label}
          type="text"
          inputMode="decimal"
          value={inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="0,00"
          disabled={disabled}
          className={cn(
            "pl-10 text-right font-mono",
            isOutOfRange && "border-yellow-500 focus-visible:ring-yellow-500",
            error && "border-destructive focus-visible:ring-destructive"
          )}
        />
      </div>

      {/* Formatierte Anzeige */}
      {value !== null && !isFocused && (
        <p className="text-xs text-muted-foreground text-right">
          {formatCurrency(value)}
        </p>
      )}

      {/* Min/Max Warnung */}
      {isOutOfRange && (
        <p className="text-xs text-yellow-600">
          {min !== undefined && value !== null && value < min && (
            <>Mindestbetrag: {formatCurrency(min)}</>
          )}
          {max !== undefined && value !== null && value > max && (
            <>Höchstbetrag: {formatCurrency(max)}</>
          )}
        </p>
      )}

      {/* Hilfetext */}
      {helperText && !error && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}

      {/* Fehler */}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}
