const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const { placeId, sessionToken } = await req.json();
    if (!placeId) {
      return new Response(
        JSON.stringify({ error: "placeId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!apiKey) throw new Error("GOOGLE_MAPS_API_KEY not configured");

    const fields = "addressComponents,formattedAddress,location";
    const headers: Record<string, string> = {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": fields,
      "Content-Type": "application/json",
    };
    if (sessionToken) headers["X-Goog-SessionToken"] = sessionToken;

    const response = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}?languageCode=de`,
      { method: "GET", headers }
    );

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: data.error?.message || "API error" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const components = data.addressComponents || [];
    const getComponent = (type: string) =>
      components.find((c: Record<string, unknown>) => (c.types as string[])?.includes(type))?.longText || "";
    const getShortComponent = (type: string) =>
      components.find((c: Record<string, unknown>) => (c.types as string[])?.includes(type))?.shortText || "";

    const streetNumber = getComponent("street_number");
    const route = getComponent("route");
    const city =
      getComponent("locality") ||
      getComponent("sublocality") ||
      getComponent("administrative_area_level_2");
    const postalCode = getComponent("postal_code");
    const country = getComponent("country");
    const countryCode = getShortComponent("country");
    const address = [route, streetNumber].filter(Boolean).join(" ");
    const loc = data.location || {};

    return new Response(
      JSON.stringify({
        address,
        city,
        postalCode,
        country,
        countryCode,
        formattedAddress: data.formattedAddress || "",
        placeId,
        lat: loc.latitude,
        lng: loc.longitude,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
