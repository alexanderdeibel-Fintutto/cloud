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
    // Authenticate the user
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
        JSON.stringify({ error: "placeId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!apiKey) {
      console.error("GOOGLE_MAPS_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Google Maps API Key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call Google Place Details API
    const params = new URLSearchParams({
      place_id: placeId,
      key: apiKey,
      fields: "address_components,formatted_address,geometry,place_id",
      language: "de",
    });

    if (sessionToken) {
      params.set("sessiontoken", sessionToken);
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?${params}`
    );

    const data = await response.json();

    if (data.status !== "OK") {
      console.error("Google Place Details API error:", data.status, data.error_message);
      return new Response(
        JSON.stringify({ error: `Google API error: ${data.status}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = data.result;
    const components = result.address_components || [];

    const getComponent = (type: string): string => {
      const comp = components.find((c: any) => c.types.includes(type));
      return comp?.long_name || "";
    };

    const getShortComponent = (type: string): string => {
      const comp = components.find((c: any) => c.types.includes(type));
      return comp?.short_name || "";
    };

    const street = getComponent("route");
    const streetNumber = getComponent("street_number");
    const city =
      getComponent("locality") ||
      getComponent("sublocality") ||
      getComponent("administrative_area_level_2");
    const postalCode = getComponent("postal_code");
    const country = getShortComponent("country");

    const address = streetNumber ? `${street} ${streetNumber}` : street;

    const placeDetails = {
      address,
      city,
      postalCode,
      country,
      formattedAddress: result.formatted_address || "",
      placeId: result.place_id || placeId,
      lat: result.geometry?.location?.lat,
      lng: result.geometry?.location?.lng,
    };

    return new Response(
      JSON.stringify(placeDetails),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("get-place-details error:", error);
    return new Response(
      JSON.stringify({ error: "Interner Fehler" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
