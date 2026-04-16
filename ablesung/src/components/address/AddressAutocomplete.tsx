/**
 * AddressAutocomplete für die Ablesung/Zähler-App.
 * Wrapper um die zentrale Komponente aus @fintutto/shared — nutzt
 * die Supabase Edge Functions (validate-address, get-place-details)
 * statt der alten Google Maps JavaScript API.
 *
 * Das Interface AddressData ist vollständig rückwärtskompatibel.
 */
import { useState } from 'react'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import {
  AddressAutocomplete as SharedAddressAutocomplete,
  type PlaceDetails,
} from '@fintutto/shared/components/address'

// Rückwärtskompatibles Interface (entspricht dem bisherigen AddressData)
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
  const [isValidated, setIsValidated] = useState(false)

  const handlePlaceSelect = (details: PlaceDetails) => {
    // Adresse in Straße + Hausnummer aufteilen
    const addressStr = details.address || ''
    const parts = addressStr.trim().split(/\s+/)
    const lastPart = parts[parts.length - 1] || ''
    const hasNumber = /^\d/.test(lastPart)
    const streetNumber = hasNumber ? lastPart : ''
    const street = hasNumber ? parts.slice(0, -1).join(' ') : addressStr

    const addressData: AddressData = {
      formattedAddress: details.formattedAddress,
      street,
      streetNumber,
      city: details.city,
      postalCode: details.postalCode,
      country: details.country,
      placeId: details.placeId,
      lat: details.lat ?? 0,
      lng: details.lng ?? 0,
    }

    setIsValidated(true)
    onAddressSelect(addressData)
  }

  const handleChange = (newValue: string) => {
    setValue(newValue)
    if (isValidated) {
      setIsValidated(false)
      onAddressSelect(null)
    }
  }

  return (
    <div className="space-y-1">
      <SharedAddressAutocomplete
        supabase={supabase}
        value={value}
        onChange={handleChange}
        onPlaceSelect={handlePlaceSelect}
        placeholder="Straße und Hausnummer eingeben..."
        required={required}
        disabled={disabled}
        label={`Adresse suchen${required ? ' *' : ''}`}
      />
      {isValidated && (
        <p className="flex items-center gap-1 text-xs text-green-600">
          <CheckCircle2 className="h-3 w-3" />
          Adresse verifiziert
        </p>
      )}
    </div>
  )
}
