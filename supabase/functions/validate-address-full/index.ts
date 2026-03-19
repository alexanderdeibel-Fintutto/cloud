import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Google Address Validation API - validates that an address actually exists
 * and is deliverable. Goes beyond Places Autocomplete by checking postal
 * service databases.
 *
 * Docs: https://developers.google.com/maps/documentation/address-validation
 */
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

    const { address, regionCode = "DE" } = await req.json();

    if (!address) {
      return new Response(
        JSON.stringify({ error: "address is required" }),
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

    // Build the request body for Address Validation API
    const requestBody: Record<string, any> = {
      address: typeof address === "string"
        ? { addressLines: [address], regionCode }
        : {
            regionCode: address.regionCode || regionCode,
            locality: address.city,
            postalCode: address.postalCode,
            addressLines: [
              address.street || address.address,
            ].filter(Boolean),
          },
      enableUspsCass: false, // Only for US addresses
    };

    const response = await fetch(
      `https://addressvalidation.googleapis.com/v1:validateAddress?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error("Address Validation API error:", data.error);
      return new Response(
        JSON.stringify({ error: data.error.message || "Validation failed" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = data.result;
    const verdict = result?.verdict || {};
    const geocode = result?.geocode || {};
    const postalAddress = result?.address?.postalAddress || {};

    // Extract validation details
    const validation = {
      // Overall verdict
      isValid: verdict.addressComplete === true,
      hasUnconfirmedComponents: verdict.hasUnconfirmedComponents === true,
      hasInferredComponents: verdict.hasInferredComponents === true,
      hasReplacedComponents: verdict.hasReplacedComponents === true,

      // Granularity of the validation
      validationGranularity: verdict.validationGranularity || "OTHER",
      // PREMISE = exact building, SUB_PREMISE = apartment, ROUTE = street level

      // Corrected/confirmed address
      formattedAddress: result?.address?.formattedAddress || "",
      postalAddress: {
        regionCode: postalAddress.regionCode || "",
        postalCode: postalAddress.postalCode || "",
        locality: postalAddress.locality || "",
        addressLines: postalAddress.addressLines || [],
      },

      // Coordinates
      lat: geocode.location?.latitude,
      lng: geocode.location?.longitude,
      placeId: geocode.placeId || "",

      // Individual component confirmation
      components: (result?.address?.addressComponents || []).map((comp: any) => ({
        name: comp.componentName?.text || "",
        type: comp.componentType || "",
        confirmationLevel: comp.confirmationLevel || "UNCONFIRMED",
        // CONFIRMED, UNCONFIRMED_BUT_PLAUSIBLE, UNCONFIRMED_AND_SUSPICIOUS
        isInferred: comp.inferred === true,
        isReplaced: comp.replaced === true,
      })),
    };

    return new Response(
      JSON.stringify(validation),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("validate-address-full error:", error);
    return new Response(
      JSON.stringify({ error: "Interner Fehler" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
