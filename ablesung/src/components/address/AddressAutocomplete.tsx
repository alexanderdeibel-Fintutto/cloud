/// <reference types="@types/google.maps" />
import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGoogleMapsApi } from '@/hooks/useGoogleMapsApi';
import { cn } from '@/lib/utils';

export interface AddressData {
  formattedAddress: string;
  street: string;
  streetNumber: string;
  city: string;
  postalCode: string;
  country: string;
  placeId: string;
  lat: number;
  lng: number;
}

interface AddressAutocompleteProps {
  onAddressSelect: (address: AddressData | null) => void;
  initialValue?: string;
  required?: boolean;
  disabled?: boolean;
}

export function AddressAutocomplete({
  onAddressSelect,
  initialValue = '',
  required = false,
  disabled = false,
}: AddressAutocompleteProps) {
  const { ready, error: apiError } = useGoogleMapsApi();
  const [inputValue, setInputValue] = useState(initialValue);
  const [isValidated, setIsValidated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const parseAddressComponents = useCallback((place: google.maps.places.PlaceResult): AddressData | null => {
    if (!place.address_components || !place.geometry?.location || !place.place_id) {
      return null;
    }

    const getComponent = (type: string): string => {
      const component = place.address_components?.find(c => c.types.includes(type));
      return component?.long_name || '';
    };

    const getShortComponent = (type: string): string => {
      const component = place.address_components?.find(c => c.types.includes(type));
      return component?.short_name || '';
    };

    const street = getComponent('route');
    const streetNumber = getComponent('street_number');
    const city = getComponent('locality') || getComponent('sublocality') || getComponent('administrative_area_level_2');
    const postalCode = getComponent('postal_code');
    const country = getShortComponent('country');

    // Require at least street and city for a valid address
    if (!street || !city) {
      return null;
    }

    return {
      formattedAddress: place.formatted_address || '',
      street,
      streetNumber,
      city,
      postalCode,
      country,
      placeId: place.place_id,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };
  }, []);

  useEffect(() => {
    if (!ready || !inputRef.current || autocompleteRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: ['de', 'at', 'ch'] }, // DACH region
      fields: ['address_components', 'formatted_address', 'geometry', 'place_id'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      
      if (!place.address_components) {
        setError('Bitte wählen Sie eine Adresse aus der Liste');
        setIsValidated(false);
        onAddressSelect(null);
        return;
      }

      const addressData = parseAddressComponents(place);
      
      if (addressData) {
        setInputValue(addressData.formattedAddress);
        setIsValidated(true);
        setError(null);
        onAddressSelect(addressData);
      } else {
        setError('Ungültige Adresse - bitte vollständige Straße und Stadt angeben');
        setIsValidated(false);
        onAddressSelect(null);
      }
    });

    autocompleteRef.current = autocomplete;

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [ready, parseAddressComponents, onAddressSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    // Reset validation when user types manually
    if (isValidated) {
      setIsValidated(false);
      onAddressSelect(null);
    }
    setError(null);
  };

  const handleBlur = () => {
    if (inputValue && !isValidated) {
      setError('Bitte wählen Sie eine Adresse aus der Vorschlagsliste');
    }
  };

  if (apiError) {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Adresse {required && '*'}
        </Label>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Google Maps konnte nicht geladen werden</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="address-autocomplete" className="text-sm font-medium">
        Adresse suchen {required && '*'}
      </Label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
        <Input
          ref={inputRef}
          id="address-autocomplete"
          type="text"
          placeholder={ready ? "Straße und Hausnummer eingeben..." : "Lade Google Maps..."}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          disabled={disabled || !ready}
          required={required}
          className={cn(
            "pl-11 pr-11 h-12 rounded-xl border-border/50 bg-background/50 focus:bg-background transition-all",
            isValidated && "border-success/50 bg-success/5",
            error && "border-destructive/50 bg-destructive/5"
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {!ready && <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />}
          {ready && isValidated && <CheckCircle2 className="w-5 h-5 text-success" />}
          {ready && error && <AlertCircle className="w-5 h-5 text-destructive" />}
        </div>
      </div>
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
      {isValidated && (
        <p className="text-xs text-success flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Adresse verifiziert
        </p>
      )}
    </div>
  );
}
