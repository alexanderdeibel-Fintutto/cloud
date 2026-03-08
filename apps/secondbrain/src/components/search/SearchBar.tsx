import { useState, useRef, useEffect } from 'react'
import { Search, X, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  filters?: string[]
  onFilterToggle?: (filter: string) => void
  activeFilters?: string[]
  placeholder?: string
  autoFocus?: boolean
}

const FILTER_OPTIONS = ['PDF', 'Bilder', 'Text', 'Favoriten', 'Heute', 'Diese Woche']

export default function SearchBar({
  value,
  onChange,
  filters = FILTER_OPTIONS,
  onFilterToggle,
  activeFilters = [],
  placeholder = 'Dokumente durchsuchen...',
  autoFocus = false,
}: SearchBarProps) {
  const [showFilters, setShowFilters] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  // Global / shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as Element)?.tagName)) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-20 h-12 text-base rounded-xl"
          autoFocus={autoFocus}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onChange('')}>
              <X className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className={`w-4 h-4 ${activeFilters.length > 0 ? 'text-primary' : ''}`} />
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-2 animate-fade-in-up">
          {filters.map((filter) => (
            <Badge
              key={filter}
              variant={activeFilters.includes(filter) ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => onFilterToggle?.(filter)}
            >
              {filter}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
