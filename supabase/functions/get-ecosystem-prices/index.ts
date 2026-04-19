/**
 * Supabase Edge Function: get-ecosystem-prices
 *
 * Gibt die aktuellen Preise und Tier-Informationen aller Fintutto-Apps zurück.
 * Genutzt von: Mieter App (FintuttoApps.tsx)
 *
 * Response:
 *   { apps: [{ id, name, price, tier, features }] }
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Statische Preisliste — kann später aus DB geladen werden
const ECOSYSTEM_APPS = [
  { id: "vermietify", name: "Vermietify", description: "Professionelle Immobilienverwaltung", price: 1900, currency: "EUR", tier: "pro", url: "https://vermietify.fintutto.cloud" },
  { id: "ablesung", name: "Ablesung", description: "Digitale Zählerstandserfassung", price: 0, currency: "EUR", tier: "free", url: "https://ablesung.fintutto.cloud" },
  { id: "finance-coach", name: "Finance Coach", description: "Persönlicher Finanzcoach", price: 990, currency: "EUR", tier: "starter", url: "https://finance-coach.fintutto.cloud" },
  { id: "finance-mentor", name: "Finance Mentor", description: "KI-gestützter Finanzmentor", price: 1490, currency: "EUR", tier: "pro", url: "https://finance-mentor.fintutto.cloud" },
  { id: "secondbrain", name: "SecondBrain", description: "Persönliche Wissensdatenbank", price: 790, currency: "EUR", tier: "starter", url: "https://secondbrain.fintutto.cloud" },
  { id: "pflanzen-manager", name: "Pflanzen Manager", description: "Zimmerpflanzen-Verwaltung", price: 0, currency: "EUR", tier: "free", url: "https://pflanzen.fintutto.cloud" },
  { id: "bescheidboxer", name: "BescheidBoxer", description: "Steuerbescheide verstehen", price: 490, currency: "EUR", tier: "starter", url: "https://bescheidboxer.fintutto.cloud" },
  { id: "arbeitslos-portal", name: "Arbeitslos Portal", description: "Hilfe bei Bürgergeld & ALG II", price: 0, currency: "EUR", tier: "free", url: "https://arbeitslos.fintutto.cloud" },
];

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Versuche, Preise aus der DB zu laden (falls apps_registry Tabelle existiert)
    const { data: dbApps } = await supabase
      .from("apps_registry")
      .select("app_id, name, description, price_cents, tier, url")
      .eq("is_active", true);

    const apps = dbApps && dbApps.length > 0
      ? dbApps.map((a: any) => ({
          id: a.app_id,
          name: a.name,
          description: a.description,
          price: a.price_cents,
          currency: "EUR",
          tier: a.tier,
          url: a.url,
        }))
      : ECOSYSTEM_APPS;

    return new Response(JSON.stringify({ apps }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    // Fallback auf statische Daten
    return new Response(JSON.stringify({ apps: ECOSYSTEM_APPS }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
