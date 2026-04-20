import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface AddressPrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

interface AddressDetails {
  valid: boolean;
  formattedAddress: string;
  name?: string;
  streetNumber: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
}

interface AddressAutocompleteProps {
  value?: string;
  onAddressSelect: (address: AddressDetails | null) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

export function AddressAutocomplete({
  value = "",
  onAddressSelect,
  label = "Adresse",
  placeholder = "Straße und Hausnummer eingeben...",
  required = false,
  error,
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [predictions, setPredictions] = useState<AddressPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AddressDetails | null>(null);
  const [validationState, setValidationState] = useState<"idle" | "valid" | "invalid">("idle");
  const debounceRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (inputValue.length < 3) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }

    // Don't search if we have a valid selected address matching the input
    if (selectedAddress && inputValue === selectedAddress.formattedAddress) {
      return;
    }

    setValidationState("idle");
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("google-maps", {
          body: { action: "autocomplete", input: inputValue },
        });

        if (error) throw error;
        setPredictions(data.predictions || []);
        setShowDropdown(data.predictions?.length > 0);
      } catch (err) {
        console.error("Autocomplete error:", err);
        setPredictions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [inputValue, selectedAddress]);

  const handleSelectPrediction = async (prediction: AddressPrediction) => {
    setInputValue(prediction.description);
    setShowDropdown(false);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("google-maps", {
        body: { action: "geocode", placeId: prediction.placeId },
      });

      if (error) throw error;

      if (data.valid) {
        setSelectedAddress(data);
        setValidationState("valid");
        setInputValue(data.formattedAddress);
        onAddressSelect(data);
      } else {
        setValidationState("invalid");
        onAddressSelect(null);
      }
    } catch (err) {
      console.error("Geocode error:", err);
      setValidationState("invalid");
      onAddressSelect(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Reset validation when user types
    if (selectedAddress && newValue !== selectedAddress.formattedAddress) {
      setSelectedAddress(null);
      setValidationState("idle");
      onAddressSelect(null);
    }
  };

  const clearSelection = () => {
    setInputValue("");
    setSelectedAddress(null);
    setValidationState("idle");
    setPredictions([]);
    onAddressSelect(null);
  };

  return (
    <div ref={containerRef} className="relative space-y-2">
      {label && (
        <Label className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => predictions.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          className={cn(
            "pr-10",
            validationState === "valid" && "border-success focus-visible:ring-success",
            validationState === "invalid" && "border-destructive focus-visible:ring-destructive",
            error && "border-destructive"
          )}
        />
        
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : validationState === "valid" ? (
            <CheckCircle2 className="h-4 w-4 text-success" />
          ) : validationState === "invalid" ? (
            <XCircle className="h-4 w-4 text-destructive" />
          ) : null}
        </div>
      </div>

      {/* Dropdown */}
      {showDropdown && predictions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-lg shadow-lg overflow-hidden">
          {predictions.map((prediction) => (
            <button
              key={prediction.placeId}
              type="button"
              onClick={() => handleSelectPrediction(prediction)}
              className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-start gap-3"
            >
              <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">{prediction.mainText}</p>
                <p className="text-xs text-muted-foreground">{prediction.secondaryText}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Error message */}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Selected address details */}
      {selectedAddress && validationState === "valid" && (
        <div className="bg-success/10 border border-success/20 rounded-lg p-3 mt-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-success flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Adresse verifiziert
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedAddress.street} {selectedAddress.streetNumber}, {selectedAddress.postalCode} {selectedAddress.city}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="text-muted-foreground hover:text-foreground"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}