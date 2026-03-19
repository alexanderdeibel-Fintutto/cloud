import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Google Cloud Vision API - General-purpose document OCR.
 * Extracts text from images/PDFs using Google's Vision API.
 *
 * Can be used for:
 * - Tax documents (Bescheidboxer)
 * - Invoices (Fintutto-Biz)
 * - Contracts (Vermietify)
 * - Utility bills (Ablesung)
 * - Any document with text
 *
 * Requires GOOGLE_CLOUD_VISION_API_KEY env var (or falls back to GOOGLE_MAPS_API_KEY
 * if Vision API is enabled on the same project).
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

    const { image, features = ["TEXT_DETECTION"], languageHints = ["de"] } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: "image (base64) is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Support both dedicated Vision key and shared Maps key
    const apiKey =
      Deno.env.get("GOOGLE_CLOUD_VISION_API_KEY") ||
      Deno.env.get("GOOGLE_MAPS_API_KEY");

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Google Cloud Vision API Key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Strip data URL prefix if present
    const base64Image = image.replace(/^data:image\/[a-z]+;base64,/, "");

    // Build Vision API request
    const visionFeatures = features.map((type: string) => ({
      type,
      // DOCUMENT_TEXT_DETECTION is better for documents, TEXT_DETECTION for short text
      ...(type === "DOCUMENT_TEXT_DETECTION" ? { maxResults: 1 } : {}),
    }));

    const requestBody = {
      requests: [
        {
          image: { content: base64Image },
          features: visionFeatures,
          imageContext: {
            languageHints,
          },
        },
      ],
    };

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error("Vision API error:", data.error);
      return new Response(
        JSON.stringify({ error: data.error.message || "Vision API error" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const visionResponse = data.responses?.[0];

    if (!visionResponse) {
      return new Response(
        JSON.stringify({ error: "No response from Vision API" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (visionResponse.error) {
      return new Response(
        JSON.stringify({ error: visionResponse.error.message }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract full text annotation
    const fullTextAnnotation = visionResponse.fullTextAnnotation;
    const textAnnotations = visionResponse.textAnnotations || [];

    // Build structured result
    const result: Record<string, any> = {
      // Full extracted text
      text: fullTextAnnotation?.text || textAnnotations[0]?.description || "",

      // Word-level detections with bounding boxes
      words: textAnnotations.slice(1).map((annotation: any) => ({
        text: annotation.description,
        bounds: annotation.boundingPoly?.vertices || [],
      })),

      // Page-level structure (paragraphs, blocks)
      pages: (fullTextAnnotation?.pages || []).map((page: any) => ({
        width: page.width,
        height: page.height,
        blocks: (page.blocks || []).map((block: any) => ({
          type: block.blockType,
          confidence: block.confidence,
          text: (block.paragraphs || [])
            .map((p: any) =>
              (p.words || [])
                .map((w: any) =>
                  (w.symbols || []).map((s: any) => s.text).join("")
                )
                .join(" ")
            )
            .join("\n"),
        })),
      })),

      // Language detection
      detectedLanguages: fullTextAnnotation?.pages?.[0]?.property?.detectedLanguages?.map(
        (lang: any) => ({
          languageCode: lang.languageCode,
          confidence: lang.confidence,
        })
      ) || [],

      // Confidence
      confidence: fullTextAnnotation?.pages?.[0]?.blocks?.[0]?.confidence || null,
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("analyze-document error:", error);
    return new Response(
      JSON.stringify({ error: "Interner Fehler" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
