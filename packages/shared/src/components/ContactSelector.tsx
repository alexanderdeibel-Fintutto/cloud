/**
 * ContactSelector — Zentrale Kontaktauswahl-Komponente
 *
 * Durchsucht core_contacts und zeigt Ergebnisse als Dropdown an.
 * Kann in Vermietify (Mieter auswählen), Financial Compass (Kunden)
 * und allen anderen Apps genutzt werden.
 *
 * Usage:
 *   <ContactSelector
 *     supabase={supabase}
 *     value={selectedContactId}
 *     onChange={(id, contact) => setContactId(id)}
 *     placeholder="Kontakt suchen..."
 *   />
 */
import { useState, useCallback, useRef, useEffect } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'

interface ContactResult {
  id: string
  contact_type: 'person' | 'company'
  display_name: string
  email: string | null
  phone: string | null
  company_name: string | null
}

export interface ContactSelectorProps {
  supabase: SupabaseClient
  value?: string | null
  onChange: (id: string | null, contact: ContactResult | null) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  /** Nur Personen, nur Firmen oder alle anzeigen */
  filterType?: 'person' | 'company' | 'all'
  /** Label für den "Neu erstellen" Button */
  createLabel?: string
  onCreateNew?: (query: string) => void
}

// Inline Debounce (ohne externen Import-Pfad-Konflikt)
function useDebounceLocal<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

export function ContactSelector({
  supabase,
  value,
  onChange,
  placeholder = 'Kontakt suchen...',
  className = '',
  disabled = false,
  filterType = 'all',
  createLabel = 'Neuen Kontakt anlegen',
  onCreateNew,
}: ContactSelectorProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ContactResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedContact, setSelectedContact] = useState<ContactResult | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebounceLocal(query, 300)

  // Ausgewählten Kontakt laden
  useEffect(() => {
    if (!value) {
      setSelectedContact(null)
      return
    }
    supabase
      .rpc('search_contacts', { p_query: '', p_limit: 100 })
      .then(({ data }) => {
        const found = (data as ContactResult[])?.find(c => c.id === value)
        if (found) setSelectedContact(found)
      })
  }, [value, supabase])

  // Suche ausführen
  useEffect(() => {
    if (!isOpen) return
    setIsLoading(true)
    supabase
      .rpc('search_contacts', { p_query: debouncedQuery, p_limit: 20 })
      .then(({ data, error }) => {
        if (!error && data) {
          let filtered = data as ContactResult[]
          if (filterType !== 'all') {
            filtered = filtered.filter(c => c.contact_type === filterType)
          }
          setResults(filtered)
        }
        setIsLoading(false)
      })
  }, [debouncedQuery, isOpen, supabase, filterType])

  // Außerhalb klicken → schließen
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = useCallback((contact: ContactResult) => {
    setSelectedContact(contact)
    setQuery('')
    setIsOpen(false)
    onChange(contact.id, contact)
  }, [onChange])

  const handleClear = useCallback(() => {
    setSelectedContact(null)
    setQuery('')
    onChange(null, null)
    inputRef.current?.focus()
  }, [onChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      handleSelect(results[selectedIndex])
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }, [isOpen, results, selectedIndex, handleSelect])

  const getContactIcon = (type: 'person' | 'company') =>
    type === 'company' ? '🏢' : '👤'

  return (
    <div className={`relative ${className}`}>
      {/* Ausgewählter Kontakt */}
      {selectedContact ? (
        <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2">
          <span className="text-base">{getContactIcon(selectedContact.contact_type)}</span>
          <div className="flex-1 min-w-0">
            <div className="truncate font-medium text-sm">{selectedContact.display_name}</div>
            {selectedContact.email && (
              <div className="truncate text-xs text-muted-foreground">{selectedContact.email}</div>
            )}
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="ml-1 rounded p-0.5 text-muted-foreground hover:text-foreground"
              aria-label="Kontakt entfernen"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      ) : (
        /* Sucheingabe */
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            {isLoading ? (
              <svg className="h-4 w-4 animate-spin text-muted-foreground" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            )}
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setIsOpen(true); setSelectedIndex(-1) }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      )}

      {/* Dropdown */}
      {isOpen && !selectedContact && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg"
        >
          <ul className="max-h-60 overflow-auto py-1">
            {results.length === 0 && !isLoading && (
              <li className="px-3 py-2 text-sm text-muted-foreground">
                {query ? 'Keine Kontakte gefunden' : 'Tippe um zu suchen...'}
              </li>
            )}
            {results.map((contact, index) => (
              <li
                key={contact.id}
                className={[
                  'flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-accent',
                  index === selectedIndex ? 'bg-accent' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => handleSelect(contact)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span className="text-base shrink-0">{getContactIcon(contact.contact_type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium">{contact.display_name}</div>
                  {(contact.email || contact.phone) && (
                    <div className="truncate text-xs text-muted-foreground">
                      {contact.email ?? contact.phone}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {/* "Neu erstellen" Option */}
          {onCreateNew && query && (
            <div className="border-t">
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-accent"
                onClick={() => { onCreateNew(query); setIsOpen(false) }}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                {createLabel}: „{query}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ContactSelector
