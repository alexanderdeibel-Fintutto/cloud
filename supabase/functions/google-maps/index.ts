/**
 * Supabase Edge Function: google-maps
 *
 * Proxy für Google Maps Places API (Adress-Autocomplete).
 * Genutzt von: Mieter App (AddressAutocomplete.tsx)
 *
 * Request Body:
 *   { action: "autocomplete" | "details", input?: string, placeId?: string }
 *
 * Response (autocomplete):
 *   { predictions: [{ description, place_id }] }
 *
 * Response (details):
 *   { result: { formatted_address, geometry, address_components } }
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!apiKey) throw new Error("GOOGLE_MAPS_API_KEY is not configured");

    const { action, input, placeId } = await req.json();

    if (action === "autocomplete" && input) {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&language=de&components=country:de&key=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      return new Response(JSON.stringify({ predictions: data.predictions || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (action === "details" && placeId) {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_address,geometry,address_components&language=de&key=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      return new Response(JSON.stringify({ result: data.result || null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else {
      return new Response(JSON.stringify({ error: "Invalid action or missing parameters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (err: any) {
    console.error("google-maps error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
