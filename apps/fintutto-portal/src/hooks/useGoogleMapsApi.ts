import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase";

let globalLoadPromise: Promise<string> | null = null;
let isScriptLoaded = false;

async function loadGoogleMapsScript(): Promise<string> {
  if (isScriptLoaded && window.google?.maps) {
    return "loaded";
  }

  if (globalLoadPromise) {
    return globalLoadPromise;
  }

  globalLoadPromise = (async () => {
    try {
      // Fetch API key from Supabase Edge Function
      const { data, error } = await supabase.functions.invoke("get-maps-key");
      if (error) throw error;
      if (!data?.apiKey) throw new Error("No API key returned");

      // Check if script is already in the DOM
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        isScriptLoaded = true;
        return "loaded";
      }

      return new Promise<string>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=places&language=de&region=DE`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          isScriptLoaded = true;
          resolve("loaded");
        };
        script.onerror = () => reject(new Error("Failed to load Google Maps script"));
        document.head.appendChild(script);
      });
    } catch (err) {
      globalLoadPromise = null;
      throw err;
    }
  })();

  return globalLoadPromise;
}

export function useGoogleMapsApi() {
  const [ready, setReady] = useState(isScriptLoaded);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isScriptLoaded) {
      setReady(true);
      return;
    }

    loadGoogleMapsScript()
      .then(() => setReady(true))
      .catch((err) => setError(err.message));
  }, []);

  return { ready, error };
}
