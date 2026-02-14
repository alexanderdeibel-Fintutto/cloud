import { useState, useEffect } from 'react'
import { useChecker } from '@/contexts/CheckerContext'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Lightbulb, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CheckerFieldOption {
  value: string
  label: string
}

interface CheckerFieldProps {
  name: string
  label: string
  type?: 'text' | 'number' | 'date' | 'select' | 'currency' | 'area'
  placeholder?: string
  value: string | number
  onChange: (value: string | number) => void
  options?: CheckerFieldOption[]
  required?: boolean
  helpText?: string
  enableAIAdvice?: boolean
  context?: Record<string, unknown>
  error?: string
}

export default function CheckerField({
  name,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  options,
  required = false,
  helpText,
  enableAIAdvice = true,
  context = {},
  error,
}: CheckerFieldProps) {
  const { getAIAdvice, isLoadingAdvice, aiAdvice } = useChecker()
  const [showAdvice, setShowAdvice] = useState(false)
  const [localAdvice, setLocalAdvice] = useState<string | null>(null)

  const adviceCacheKey = `${name}`

  useEffect(() => {
    if (aiAdvice[adviceCacheKey]) {
      setLocalAdvice(aiAdvice[adviceCacheKey])
    }
  }, [aiAdvice, adviceCacheKey])

  const handleFocus = async () => {
    if (enableAIAdvice && !localAdvice) {
      setShowAdvice(true)
      const advice = await getAIAdvice(name, context)
      setLocalAdvice(advice)
    } else {
      setShowAdvice(true)
    }
  }

  const renderInput = () => {
    const baseInputProps = {
      id: name,
      name,
      placeholder,
      onFocus: handleFocus,
      onBlur: () => setTimeout(() => setShowAdvice(false), 200),
      className: cn(error && 'border-red-500 focus:ring-red-500'),
    }

    switch (type) {
      case 'select':
        return (
          <Select value={String(value)} onValueChange={(v) => onChange(v)}>
            <SelectTrigger {...baseInputProps}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'currency':
        return (
          <div className="relative">
            <Input
              {...baseInputProps}
              type="number"
              step="0.01"
              min="0"
              value={value}
              onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
              className={cn('pr-12', baseInputProps.className)}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">EUR</span>
          </div>
        )

      case 'area':
        return (
          <div className="relative">
            <Input
              {...baseInputProps}
              type="number"
              step="0.1"
              min="0"
              value={value}
              onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
              className={cn('pr-12', baseInputProps.className)}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">m2</span>
          </div>
        )

      case 'number':
        return (
          <Input
            {...baseInputProps}
            type="number"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          />
        )

      case 'date':
        return (
          <Input
            {...baseInputProps}
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        )

      default:
        return (
          <Input
            {...baseInputProps}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        )
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>

      {renderInput()}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {helpText && !showAdvice && <p className="text-sm text-gray-500">{helpText}</p>}

      {/* AI Advice Box */}
      {showAdvice && enableAIAdvice && (
        <div className="ai-hint animate-fade-in">
          <div className="flex items-start gap-2">
            {isLoadingAdvice ? (
              <Loader2 className="w-4 h-4 text-fintutto-primary animate-spin mt-0.5" />
            ) : (
              <Lightbulb className="w-4 h-4 text-fintutto-primary mt-0.5" />
            )}
            <div>
              <p className="font-medium text-fintutto-primary text-xs mb-1">KI-Hinweis</p>
              <p>{isLoadingAdvice ? 'Lade Hinweis...' : localAdvice}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
