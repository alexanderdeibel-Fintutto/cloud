/// <reference types="@types/google.maps" />
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

let isLoading = false;
let isLoaded = false;
let loadPromise: Promise<void> | null = null;

export function useGoogleMapsApi() {
  const [ready, setReady] = useState(isLoaded);
  const [error, setError] = useState<string | null>(null);

  const loadScript = useCallback(async () => {
    if (isLoaded) {
      setReady(true);
      return;
    }

    if (loadPromise) {
      await loadPromise;
      setReady(true);
      return;
    }

    if (isLoading) return;

    isLoading = true;

    loadPromise = new Promise((resolve, reject) => {
      (async () => {
        try {
          // Fetch API key from edge function
          const { data, error: fnError } = await supabase.functions.invoke('get-maps-key');

          if (fnError || !data?.apiKey) {
            throw new Error(fnError?.message || 'Could not load Google Maps API key');
          }

          // Create script element
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=places&language=de&region=DE`;
          script.async = true;
          script.defer = true;

          script.onload = () => {
            isLoaded = true;
            isLoading = false;
            resolve();
          };

          script.onerror = () => {
            isLoading = false;
            reject(new Error('Failed to load Google Maps script'));
          };

          document.head.appendChild(script);
        } catch (err) {
          isLoading = false;
          reject(err);
        }
      })();
    });

    try {
      await loadPromise;
      setReady(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  useEffect(() => {
    loadScript();
  }, [loadScript]);

  return { ready, error };
}
