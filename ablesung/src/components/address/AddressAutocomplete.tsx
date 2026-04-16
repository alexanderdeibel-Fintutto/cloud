/**
 * AddressAutocomplete für die Ablesung/Zähler-App.
 * Nutzt die Supabase Edge Functions validate-address und get-place-details.
 * Das Interface AddressData ist vollständig rückwärtskompatibel.
 */
import { useState, useCallback, useRef, useEffect } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

// Rückwärtskompatibles Interface
export interface AddressData {
  formattedAddress: string
  street: string
  streetNumber: string
  city: string
  postalCode: string
  country: string
  placeId: string
  lat: number
  lng: number
}

interface PlaceDetails {
  address: string
  city: string
  postalCode: string
  country: string
  countryCode: string
  formattedAddress: string
  placeId: string
  lat?: number
  lng?: number
}

interface Prediction {
  place_id: string
  description: string
  structured_formatting?: {
    main_text: string
    secondary_text: string
  }
}

interface AddressAutocompleteProps {
  onAddressSelect: (address: AddressData | null) => void
  initialValue?: string
  required?: boolean
  disabled?: boolean
}

export function AddressAutocomplete({
  onAddressSelect,
  initialValue = '',
  required = false,
  disabled = false,
}: AddressAutocompleteProps) {
  const [value, setValue] = useState(initialValue)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isValidated, setIsValidated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sessionTokenRef = useRef<string>(crypto.randomUUID())
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchPredictions = useCallback(async (input: string) => {
    if (input.length < 3) {
      setPredictions([])
      setIsOpen(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: fnError } = await supabase.functions.invoke('validate-address', {
        body: { input, sessionToken: sessionTokenRef.current },
      })
      if (fnError) throw fnError
      const preds = data?.predictions || []
      setPredictions(preds)
      setIsOpen(preds.length > 0)
    } catch (err) {
      console.error('[AddressAutocomplete] error:', err)
      setPredictions([])
      setError('Adresssuche nicht verfügbar')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    if (isValidated) {
      setIsValidated(false)
      onAddressSelect(null)
    }
    setSelectedIndex(-1)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchPredictions(newValue), 300)
  }

  const handleSelectPrediction = async (prediction: Prediction) => {
    setIsLoading(true)
    setIsOpen(false)
    try {
      const { data, error: fnError } = await supabase.functions.invoke('get-place-details', {
        body: { placeId: prediction.place_id, sessionToken: sessionTokenRef.current },
      })
      if (fnError) throw fnError
      sessionTokenRef.current = crypto.randomUUID()
      const details = data as PlaceDetails
      const addressStr = details.address || ''
      const parts = addressStr.trim().split(/\s+/)
      const lastPart = parts[parts.length - 1] || ''
      const hasNumber = /^\d/.test(lastPart)
      const streetNumber = hasNumber ? lastPart : ''
      const street = hasNumber ? parts.slice(0, -1).join(' ') : addressStr
      setValue(details.address || prediction.structured_formatting?.main_text || prediction.description)
      setIsValidated(true)
      setError(null)
      onAddressSelect({
        formattedAddress: details.formattedAddress,
        street,
        streetNumber,
        city: details.city,
        postalCode: details.postalCode,
        country: details.country,
        placeId: details.placeId,
        lat: details.lat ?? 0,
        lng: details.lng ?? 0,
      })
    } catch (err) {
      console.error('[AddressAutocomplete] select error:', err)
      setValue(prediction.structured_formatting?.main_text || prediction.description)
      setIsValidated(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || predictions.length === 0) return
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, predictions.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) handleSelectPrediction(predictions[selectedIndex])
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  return (
    <div className="space-y-1">
      <label className="mb-1 block text-sm font-medium text-foreground">
        Adresse suchen{required && ' *'}
      </label>
      <div ref={containerRef} className="relative w-full">
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => predictions.length > 0 && setIsOpen(true)}
            placeholder="Straße und Hausnummer eingeben..."
            disabled={disabled}
            required={required}
            autoComplete="off"
            className={[
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm',
              'ring-offset-background placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              isValidated ? 'border-green-500' : '',
              error ? 'border-destructive' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            {isLoading ? (
              <svg className="h-4 w-4 animate-spin text-muted-foreground" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : isValidated ? (
              <svg className="h-4 w-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            )}
          </span>
        </div>

        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}

        {isOpen && predictions.length > 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
            <ul className="max-h-60 overflow-auto py-1">
              {predictions.map((prediction, index) => (
                <li
                  key={prediction.place_id}
                  className={[
                    'flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-accent',
                    index === selectedIndex ? 'bg-accent' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => handleSelectPrediction(prediction)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <svg className="h-4 w-4 shrink-0 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate font-medium">
                      {prediction.structured_formatting?.main_text || prediction.description}
                    </span>
                    {prediction.structured_formatting?.secondary_text && (
                      <span className="truncate text-xs text-muted-foreground">
                        {prediction.structured_formatting.secondary_text}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t px-3 py-1.5">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Powered by Google Maps
              </span>
            </div>
          </div>
        )}
      </div>
      {isValidated && (
        <p className="flex items-center gap-1 text-xs text-green-600">
          <CheckCircle2 className="h-3 w-3" />
          Adresse verifiziert
        </p>
      )}
    </div>
  )
}
