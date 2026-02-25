import { useState, useRef, useCallback, useEffect } from 'react';
import { MapPin, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

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

interface Prediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
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
  const [inputValue, setInputValue] = useState(initialValue);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const sessionTokenRef = useRef<string>(crypto.randomUUID());
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPredictions = useCallback(async (input: string) => {
    if (input.length < 3) {
      setPredictions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('places-autocomplete', {
        body: { input, sessionToken: sessionTokenRef.current },
      });

      if (fnError) throw fnError;

      setPredictions(data?.predictions || []);
      setIsOpen((data?.predictions || []).length > 0);
    } catch (err) {
      console.error('Autocomplete error:', err);
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSelectPrediction = async (prediction: Prediction) => {
    setInputValue(prediction.description);
    setIsOpen(false);
    setPredictions([]);
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('places-details', {
        body: { placeId: prediction.place_id, sessionToken: sessionTokenRef.current },
      });

      // Reset session token after place details request (Google billing optimization)
      sessionTokenRef.current = crypto.randomUUID();

      if (fnError) throw fnError;

      const addressData = data as AddressData;

      if (!addressData.street || !addressData.city) {
        setError('Ungültige Adresse - bitte vollständige Straße und Stadt angeben');
        setIsValidated(false);
        onAddressSelect(null);
        return;
      }

      setInputValue(addressData.formattedAddress);
      setIsValidated(true);
      onAddressSelect(addressData);
    } catch (err) {
      console.error('Place details error:', err);
      setError('Adressdetails konnten nicht geladen werden');
      setIsValidated(false);
      onAddressSelect(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setHighlightedIndex(-1);

    if (isValidated) {
      setIsValidated(false);
      onAddressSelect(null);
    }
    setError(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPredictions(value), 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || predictions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < predictions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : predictions.length - 1));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelectPrediction(predictions[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleBlur = () => {
    // Delay to allow click on prediction
    setTimeout(() => {
      if (inputValue && !isValidated) {
        setError('Bitte wählen Sie eine Adresse aus der Vorschlagsliste');
      }
    }, 200);
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      <Label htmlFor="address-autocomplete" className="text-sm font-medium">
        Adresse suchen {required && '*'}
      </Label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
        <Input
          id="address-autocomplete"
          type="text"
          placeholder="Straße und Hausnummer eingeben..."
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          autoComplete="off"
          className={cn(
            "pl-11 pr-11 h-12 rounded-xl border-border/50 bg-card/80 text-foreground focus:bg-card focus:ring-2 focus:ring-primary/30 transition-all",
            isValidated && "border-success/50 bg-success/5",
            error && "border-destructive/50 bg-destructive/5"
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isLoading && <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />}
          {!isLoading && isValidated && <CheckCircle2 className="w-5 h-5 text-success" />}
          {!isLoading && error && <AlertCircle className="w-5 h-5 text-destructive" />}
        </div>

        {/* Dropdown */}
        {isOpen && predictions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
            {predictions.map((prediction, index) => (
              <button
                key={prediction.place_id}
                type="button"
                className={cn(
                  "w-full px-4 py-3 text-left text-sm hover:bg-accent/50 transition-colors flex flex-col gap-0.5",
                  index === highlightedIndex && "bg-accent/50"
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelectPrediction(prediction)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <span className="font-medium text-foreground">
                  {prediction.structured_formatting.main_text}
                </span>
                <span className="text-xs text-muted-foreground">
                  {prediction.structured_formatting.secondary_text}
                </span>
              </button>
            ))}
          </div>
        )}
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
