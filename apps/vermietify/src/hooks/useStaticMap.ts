import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface StaticMapOptions {
  center?: { lat: number; lng: number };
  markers?: Array<{ lat: number; lng: number; label?: string; color?: string }>;
  zoom?: number;
  size?: string;
  maptype?: "roadmap" | "satellite" | "terrain" | "hybrid";
}

interface StaticMapResult {
  image: string | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useStaticMap(
  address: string | null,
  options: StaticMapOptions = {}
): StaticMapResult {
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMap = async () => {
    if (!address && !options.center && (!options.markers || options.markers.length === 0)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // If we have an address but no center/markers, geocode first
      let center = options.center;
      let markers = options.markers;

      if (address && !center && (!markers || markers.length === 0)) {
        const { data: geoData, error: geoError } = await supabase.functions.invoke(
          "geocode-address",
          { body: { address } }
        );

        if (geoError) throw geoError;

        if (geoData.results?.length > 0) {
          const result = geoData.results[0];
          center = { lat: result.lat, lng: result.lng };
          markers = [{ lat: result.lat, lng: result.lng, label: "A", color: "red" }];
        } else {
          setError("Adresse nicht gefunden");
          setIsLoading(false);
          return;
        }
      }

      const { data, error: mapError } = await supabase.functions.invoke("get-static-map", {
        body: {
          center,
          markers,
          zoom: options.zoom || 15,
          size: options.size || "600x300",
          maptype: options.maptype || "roadmap",
        },
      });

      if (mapError) throw mapError;
      setImage(data.image);
    } catch (err) {
      console.error("Error fetching static map:", err);
      setError("Karte konnte nicht geladen werden");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMap();
  }, [address, options.center?.lat, options.center?.lng, options.zoom]);

  return { image, isLoading, error, refetch: fetchMap };
}
