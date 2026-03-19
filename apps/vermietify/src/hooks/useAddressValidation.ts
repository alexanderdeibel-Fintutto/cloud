import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AddressValidationResult {
  isValid: boolean;
  hasUnconfirmedComponents: boolean;
  hasInferredComponents: boolean;
  hasReplacedComponents: boolean;
  validationGranularity: string;
  formattedAddress: string;
  lat?: number;
  lng?: number;
  placeId: string;
  postalAddress: {
    regionCode: string;
    postalCode: string;
    locality: string;
    addressLines: string[];
  };
  components: Array<{
    name: string;
    type: string;
    confirmationLevel: string;
    isInferred: boolean;
    isReplaced: boolean;
  }>;
}

export function useAddressValidation() {
  const [result, setResult] = useState<AddressValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = async (address: string | { street?: string; address?: string; city?: string; postalCode?: string }) => {
    setIsValidating(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "validate-address-full",
        { body: { address } }
      );

      if (fnError) throw fnError;

      setResult(data);
      return data as AddressValidationResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Validierung fehlgeschlagen";
      setError(message);
      return null;
    } finally {
      setIsValidating(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return { validate, result, isValidating, error, reset };
}
