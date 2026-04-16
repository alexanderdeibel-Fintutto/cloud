const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const { input, sessionToken } = await req.json();
    if (!input || input.length < 3) {
      return new Response(JSON.stringify({ predictions: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!apiKey) throw new Error("GOOGLE_MAPS_API_KEY not configured");

    const body: Record<string, unknown> = {
      input,
      languageCode: "de",
      regionCode: "DE",
      includedRegionCodes: ["de", "at", "ch"],
      includedPrimaryTypes: ["street_address", "route"],
    };
    if (sessionToken) body.sessionToken = sessionToken;

    const response = await fetch(
      "https://places.googleapis.com/v1/places:autocomplete",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({ predictions: [], error: data.error?.message || "API error" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const predictions = (data.suggestions || []).map((s: Record<string, unknown>) => {
      const pp = s.placePrediction as Record<string, unknown> || {};
      const sf = pp.structuredFormat as Record<string, unknown> || {};
      const mainText = sf.mainText as Record<string, unknown> || {};
      const secondaryText = sf.secondaryText as Record<string, unknown> || {};
      const textObj = pp.text as Record<string, unknown> || {};
      return {
        description: textObj.text || "",
        place_id: pp.placeId || "",
        structured_formatting: {
          main_text: mainText.text || "",
          secondary_text: secondaryText.text || "",
        },
      };
    });

    return new Response(
      JSON.stringify({ predictions }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message, predictions: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
