'use client'

import * as React from 'react'
import { CalendarDays, ArrowRight, Info } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { differenceInDays, differenceInMonths, differenceInYears, addMonths, format } from 'date-fns'
import { de } from 'date-fns/locale'

export interface DateRangeData {
  startDate: string | null
  endDate: string | null
  isUnbefristet?: boolean
}

interface DateRangeFieldProps {
  value: DateRangeData
  onChange: (value: DateRangeData) => void
  label?: string
  startLabel?: string
  endLabel?: string
  required?: boolean
  showDuration?: boolean
  showUnbefristet?: boolean
  minDate?: string
  maxDate?: string
  error?: string
  disabled?: boolean
}

export function DateRangeField({
  value,
  onChange,
  label = "Zeitraum",
  startLabel = "Von",
  endLabel = "Bis",
  required = false,
  showDuration = true,
  showUnbefristet = true,
  minDate,
  maxDate,
  error,
  disabled = false
}: DateRangeFieldProps) {
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, startDate: e.target.value || null })
  }

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, endDate: e.target.value || null, isUnbefristet: false })
  }

  const handleUnbefristetChange = (checked: boolean) => {
    onChange({ ...value, isUnbefristet: checked, endDate: checked ? null : value.endDate })
  }

  // Dauer berechnen
  const calculateDuration = () => {
    if (!value.startDate) return null
    if (value.isUnbefristet) return 'Unbefristet'
    if (!value.endDate) return null

    const start = new Date(value.startDate)
    const end = new Date(value.endDate)

    const years = differenceInYears(end, start)
    const months = differenceInMonths(end, start) % 12
    const days = differenceInDays(end, addMonths(start, years * 12 + months))

    const parts = []
    if (years > 0) parts.push(`${years} Jahr${years > 1 ? 'e' : ''}`)
    if (months > 0) parts.push(`${months} Monat${months > 1 ? 'e' : ''}`)
    if (days > 0 && years === 0) parts.push(`${days} Tag${days > 1 ? 'e' : ''}`)

    return parts.length > 0 ? parts.join(', ') : 'Weniger als 1 Tag'
  }

  const duration = calculateDuration()
  const isEndBeforeStart = value.startDate && value.endDate &&
    new Date(value.endDate) < new Date(value.startDate)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-muted-foreground" />
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
        {showDuration && duration && (
          <Badge variant="secondary" className="font-normal">
            {duration}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        {/* Startdatum */}
        <div>
          <Label htmlFor="startDate" className="text-sm text-muted-foreground">
            {startLabel}
          </Label>
          <Input
            id="startDate"
            type="date"
            value={value.startDate || ''}
            onChange={handleStartChange}
            min={minDate}
            max={maxDate}
            disabled={disabled}
            className="mt-1"
          />
        </div>

        {/* Enddatum */}
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="endDate" className="text-sm text-muted-foreground">
              {endLabel}
            </Label>
            {showUnbefristet && (
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={value.isUnbefristet || false}
                  onChange={(e) => handleUnbefristetChange(e.target.checked)}
                  disabled={disabled}
                  className="rounded border-gray-300"
                />
                <span className="text-muted-foreground">Unbefristet</span>
              </label>
            )}
          </div>
          <Input
            id="endDate"
            type="date"
            value={value.endDate || ''}
            onChange={handleEndChange}
            min={value.startDate || minDate}
            max={maxDate}
            disabled={disabled || value.isUnbefristet}
            className={cn(
              "mt-1",
              value.isUnbefristet && "bg-muted",
              isEndBeforeStart && "border-destructive"
            )}
          />
        </div>
      </div>

      {/* Fehler: Ende vor Start */}
      {isEndBeforeStart && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <Info className="h-4 w-4" />
          Das Enddatum muss nach dem Startdatum liegen
        </p>
      )}

      {/* Zusätzliche Informationen */}
      {value.startDate && !value.isUnbefristet && value.endDate && (
        <div className="p-3 bg-muted rounded-md text-sm">
          <div className="flex items-center gap-2">
            <span>Vertragslaufzeit:</span>
            <span className="font-medium">
              {format(new Date(value.startDate), 'dd.MM.yyyy', { locale: de })}
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {format(new Date(value.endDate), 'dd.MM.yyyy', { locale: de })}
            </span>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
