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

    const { center, markers, zoom = 15, size = "600x300", maptype = "roadmap" } = await req.json();

    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Google Maps API Key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build Static Maps URL
    const params = new URLSearchParams({
      key: apiKey,
      size,
      zoom: zoom.toString(),
      maptype,
      language: "de",
      scale: "2", // Retina display
    });

    // Center: either explicit or derived from first marker
    if (center) {
      params.set("center", `${center.lat},${center.lng}`);
    }

    // Build URL with markers
    let url = `https://maps.googleapis.com/maps/api/staticmap?${params}`;

    if (markers && Array.isArray(markers)) {
      for (const marker of markers) {
        const color = marker.color || "red";
        const label = marker.label?.[0]?.toUpperCase() || "";
        const markerParam = `color:${color}|label:${label}|${marker.lat},${marker.lng}`;
        url += `&markers=${encodeURIComponent(markerParam)}`;
      }
    }

    // Fetch the image
    const response = await fetch(url);

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Google Static Maps API returned ${response.status}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const imageBuffer = await response.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));

    return new Response(
      JSON.stringify({
        image: `data:image/png;base64,${base64}`,
        url, // For debugging - remove key in production
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("get-static-map error:", error);
    return new Response(
      JSON.stringify({ error: "Interner Fehler" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
