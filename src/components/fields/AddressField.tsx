'use client'

import * as React from 'react'
import { MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn, validatePLZ } from '@/lib/utils'
import { AIFieldHelper } from '@/components/ai/AIFieldHelper'

export interface AddressData {
  strasse: string
  hausnummer: string
  zusatz?: string
  plz: string
  ort: string
  land?: string
}

interface AddressFieldProps {
  value: AddressData
  onChange: (value: AddressData) => void
  label?: string
  required?: boolean
  showAIHelper?: boolean
  error?: string
  disabled?: boolean
}

export function AddressField({
  value,
  onChange,
  label = "Adresse",
  required = false,
  showAIHelper = true,
  error,
  disabled = false
}: AddressFieldProps) {
  const [plzError, setPlzError] = React.useState<string | null>(null)

  const handleChange = (field: keyof AddressData, fieldValue: string) => {
    const newValue = { ...value, [field]: fieldValue }
    onChange(newValue)

    // PLZ-Validierung
    if (field === 'plz') {
      if (fieldValue && !validatePLZ(fieldValue)) {
        setPlzError('Bitte geben Sie eine gültige 5-stellige PLZ ein')
      } else {
        setPlzError(null)
      }
    }
  }

  const handleAISuggestion = (suggestion: Partial<AddressData>) => {
    onChange({ ...value, ...suggestion })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {showAIHelper && (
          <AIFieldHelper
            fieldId="address"
            fieldType="address"
            context={{ currentValue: value }}
            onSuggestion={handleAISuggestion}
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Straße */}
        <div className="md:col-span-8">
          <Label htmlFor="strasse" className="text-sm text-muted-foreground">
            Straße
          </Label>
          <Input
            id="strasse"
            value={value.strasse || ''}
            onChange={(e) => handleChange('strasse', e.target.value)}
            placeholder="Musterstraße"
            disabled={disabled}
            className="mt-1"
          />
        </div>

        {/* Hausnummer */}
        <div className="md:col-span-2">
          <Label htmlFor="hausnummer" className="text-sm text-muted-foreground">
            Nr.
          </Label>
          <Input
            id="hausnummer"
            value={value.hausnummer || ''}
            onChange={(e) => handleChange('hausnummer', e.target.value)}
            placeholder="1a"
            disabled={disabled}
            className="mt-1"
          />
        </div>

        {/* Zusatz */}
        <div className="md:col-span-2">
          <Label htmlFor="zusatz" className="text-sm text-muted-foreground">
            Zusatz
          </Label>
          <Input
            id="zusatz"
            value={value.zusatz || ''}
            onChange={(e) => handleChange('zusatz', e.target.value)}
            placeholder="App. 5"
            disabled={disabled}
            className="mt-1"
          />
        </div>

        {/* PLZ */}
        <div className="md:col-span-3">
          <Label htmlFor="plz" className="text-sm text-muted-foreground">
            PLZ
          </Label>
          <Input
            id="plz"
            value={value.plz || ''}
            onChange={(e) => handleChange('plz', e.target.value)}
            placeholder="12345"
            maxLength={5}
            disabled={disabled}
            className={cn("mt-1", plzError && "border-destructive")}
          />
          {plzError && (
            <p className="text-xs text-destructive mt-1">{plzError}</p>
          )}
        </div>

        {/* Ort */}
        <div className="md:col-span-6">
          <Label htmlFor="ort" className="text-sm text-muted-foreground">
            Ort
          </Label>
          <Input
            id="ort"
            value={value.ort || ''}
            onChange={(e) => handleChange('ort', e.target.value)}
            placeholder="Musterstadt"
            disabled={disabled}
            className="mt-1"
          />
        </div>

        {/* Land */}
        <div className="md:col-span-3">
          <Label htmlFor="land" className="text-sm text-muted-foreground">
            Land
          </Label>
          <Input
            id="land"
            value={value.land || 'Deutschland'}
            onChange={(e) => handleChange('land', e.target.value)}
            placeholder="Deutschland"
            disabled={disabled}
            className="mt-1"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  )
}
