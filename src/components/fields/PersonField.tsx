'use client'

import { User, Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { AIFieldHelper } from '@/components/ai/AIFieldHelper'

export interface PersonData {
  anrede: 'herr' | 'frau' | 'divers' | 'firma' | ''
  titel?: string
  vorname: string
  nachname: string
  geburtsdatum?: string
  telefon?: string
  email?: string
  steuernummer?: string
}

interface PersonFieldProps {
  value: PersonData
  onChange: (value: PersonData) => void
  label?: string
  required?: boolean
  showBirthdate?: boolean
  showContact?: boolean
  showTax?: boolean
  showAIHelper?: boolean
  error?: string
  disabled?: boolean
}

const ANREDE_OPTIONS = [
  { value: 'herr', label: 'Herr' },
  { value: 'frau', label: 'Frau' },
  { value: 'divers', label: 'Divers' },
  { value: 'firma', label: 'Firma' },
]

const TITEL_OPTIONS = [
  { value: '', label: 'Kein Titel' },
  { value: 'Dr.', label: 'Dr.' },
  { value: 'Prof.', label: 'Prof.' },
  { value: 'Prof. Dr.', label: 'Prof. Dr.' },
]

export function PersonField({
  value,
  onChange,
  label = "Person",
  required = false,
  showBirthdate = true,
  showContact = true,
  showTax = false,
  showAIHelper = true,
  error,
  disabled = false
}: PersonFieldProps) {
  const handleChange = (field: keyof PersonData, fieldValue: string) => {
    onChange({ ...value, [field]: fieldValue })
  }

  const isFirma = value.anrede === 'firma'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-muted-foreground" />
          <Label className="text-base font-medium">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        </div>
        {showAIHelper && (
          <AIFieldHelper
            fieldId="person"
            fieldType="person"
            context={{ currentValue: value }}
            onSuggestion={(suggestion) => onChange({ ...value, ...suggestion })}
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Anrede */}
        <div className="md:col-span-3">
          <Label htmlFor="anrede" className="text-sm text-muted-foreground">
            Anrede
          </Label>
          <Select
            value={value.anrede}
            onValueChange={(v) => handleChange('anrede', v)}
            disabled={disabled}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Bitte wählen" />
            </SelectTrigger>
            <SelectContent>
              {ANREDE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Titel (nur bei Personen) */}
        {!isFirma && (
          <div className="md:col-span-2">
            <Label htmlFor="titel" className="text-sm text-muted-foreground">
              Titel
            </Label>
            <Select
              value={value.titel || ''}
              onValueChange={(v) => handleChange('titel', v)}
              disabled={disabled}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="-" />
              </SelectTrigger>
              <SelectContent>
                {TITEL_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Vorname / Firmenname */}
        <div className={cn("md:col-span-4", isFirma && "md:col-span-9")}>
          <Label htmlFor="vorname" className="text-sm text-muted-foreground">
            {isFirma ? 'Firmenname' : 'Vorname'}
          </Label>
          <Input
            id="vorname"
            value={value.vorname}
            onChange={(e) => handleChange('vorname', e.target.value)}
            placeholder={isFirma ? 'Musterfirma GmbH' : 'Max'}
            disabled={disabled}
            className="mt-1"
          />
        </div>

        {/* Nachname (nur bei Personen) */}
        {!isFirma && (
          <div className="md:col-span-3">
            <Label htmlFor="nachname" className="text-sm text-muted-foreground">
              Nachname
            </Label>
            <Input
              id="nachname"
              value={value.nachname}
              onChange={(e) => handleChange('nachname', e.target.value)}
              placeholder="Mustermann"
              disabled={disabled}
              className="mt-1"
            />
          </div>
        )}
      </div>

      {/* Geburtsdatum */}
      {showBirthdate && !isFirma && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4">
            <Label htmlFor="geburtsdatum" className="text-sm text-muted-foreground">
              Geburtsdatum
            </Label>
            <Input
              id="geburtsdatum"
              type="date"
              value={value.geburtsdatum || ''}
              onChange={(e) => handleChange('geburtsdatum', e.target.value)}
              disabled={disabled}
              className="mt-1"
            />
          </div>
        </div>
      )}

      {/* Kontaktdaten */}
      {showContact && (
        <>
          <Separator className="my-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="telefon" className="text-sm text-muted-foreground">
                Telefon
              </Label>
              <Input
                id="telefon"
                type="tel"
                value={value.telefon || ''}
                onChange={(e) => handleChange('telefon', e.target.value)}
                placeholder="+49 30 12345678"
                disabled={disabled}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm text-muted-foreground">
                E-Mail
              </Label>
              <Input
                id="email"
                type="email"
                value={value.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="max@mustermann.de"
                disabled={disabled}
                className="mt-1"
              />
            </div>
          </div>
        </>
      )}

      {/* Steuernummer */}
      {showTax && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="steuernummer" className="text-sm text-muted-foreground">
              Steuernummer / USt-IdNr.
            </Label>
            <Input
              id="steuernummer"
              value={value.steuernummer || ''}
              onChange={(e) => handleChange('steuernummer', e.target.value)}
              placeholder="12/345/67890"
              disabled={disabled}
              className="mt-1"
            />
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}

// Komponente für mehrere Personen (z.B. mehrere Mieter)
interface MultiPersonFieldProps {
  values: PersonData[]
  onChange: (values: PersonData[]) => void
  label?: string
  maxPersons?: number
  minPersons?: number
  disabled?: boolean
}

export function MultiPersonField({
  values,
  onChange,
  label = "Personen",
  maxPersons = 5,
  minPersons = 1,
  disabled = false
}: MultiPersonFieldProps) {
  const emptyPerson: PersonData = {
    anrede: '',
    vorname: '',
    nachname: '',
  }

  const handleAdd = () => {
    if (values.length < maxPersons) {
      onChange([...values, emptyPerson])
    }
  }

  const handleRemove = (index: number) => {
    if (values.length > minPersons) {
      onChange(values.filter((_, i) => i !== index))
    }
  }

  const handleChange = (index: number, person: PersonData) => {
    const newValues = [...values]
    newValues[index] = person
    onChange(newValues)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">{label}</Label>
        {values.length < maxPersons && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAdd}
            disabled={disabled}
          >
            <Plus className="h-4 w-4 mr-1" />
            Person hinzufügen
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {values.map((person, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {index === 0 ? 'Hauptperson' : `Weitere Person ${index}`}
                </CardTitle>
                {values.length > minPersons && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(index)}
                    disabled={disabled}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <PersonField
                value={person}
                onChange={(p) => handleChange(index, p)}
                showContact={index === 0}
                showBirthdate={true}
                showAIHelper={false}
                disabled={disabled}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
