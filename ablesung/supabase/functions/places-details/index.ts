import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Nicht autorisiert" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: "Nicht autorisiert" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { placeId, sessionToken } = await req.json();

    if (!placeId) {
      return new Response(
        JSON.stringify({ error: "placeId ist erforderlich" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Google Maps API Key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use Places API (New) - Place Details endpoint
    const fieldMask = "id,formattedAddress,addressComponents,location,displayName";
    const url = `https://places.googleapis.com/v1/places/${placeId}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": fieldMask,
    };

    if (sessionToken) {
      headers["X-Goog-Session-Token"] = sessionToken;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Places Details API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Places API Fehler", details: errorText }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const place = await response.json();

    // Parse address components from new API format
    const getComponent = (type: string): string => {
      const comp = place.addressComponents?.find(
        (c: any) => c.types?.includes(type)
      );
      return comp?.longText || "";
    };

    const getShortComponent = (type: string): string => {
      const comp = place.addressComponents?.find(
        (c: any) => c.types?.includes(type)
      );
      return comp?.shortText || "";
    };

    const street = getComponent("route");
    const streetNumber = getComponent("street_number");
    const city =
      getComponent("locality") ||
      getComponent("sublocality") ||
      getComponent("administrative_area_level_2");
    const postalCode = getComponent("postal_code");
    const country = getShortComponent("country");

    const result = {
      formattedAddress: place.formattedAddress || "",
      street,
      streetNumber,
      city,
      postalCode,
      country,
      placeId: place.id || placeId,
      lat: place.location?.latitude || 0,
      lng: place.location?.longitude || 0,
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("places-details error:", error);
    return new Response(
      JSON.stringify({ error: "Interner Fehler" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
