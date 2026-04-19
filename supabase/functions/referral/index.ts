/**
 * Supabase Edge Function: referral
 *
 * Verwaltet das Referral-System (Empfehlungen) für das Fintutto-Ökosystem.
 * Genutzt von: Hausmeister App (useReferral.ts, useReferralCapture.ts)
 *
 * Request Body (action=create):
 *   { action: "create", referrerId: string, appId: string }
 *
 * Request Body (action=capture):
 *   { action: "capture", referralCode: string, referredUserId: string }
 *
 * Request Body (action=stats):
 *   { action: "stats", userId: string }
 *
 * Response:
 *   { success: boolean, data: any }
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Service-Client für privilegierte Operationen
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    // User-Client für Auth-Check
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: authHeader ? { Authorization: authHeader } : {} },
    });

    const { data: { user } } = await userClient.auth.getUser();

    const body = await req.json();
    const { action } = body;

    if (action === "create") {
      // Erstelle einen neuen Referral-Code
      const { appId } = body;
      if (!user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const code = `${user.id.slice(0, 8)}-${appId}-${Date.now().toString(36)}`.toUpperCase();

      const { data, error } = await serviceClient
        .from("ecosystem_referrals")
        .insert({ referrer_user_id: user.id, app_id: appId, referral_code: code, status: "pending" })
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (action === "capture") {
      // Erfasse eine Referral-Nutzung
      const { referralCode, referredUserId } = body;

      const { data: referral, error: findError } = await serviceClient
        .from("ecosystem_referrals")
        .select("*")
        .eq("referral_code", referralCode)
        .eq("status", "pending")
        .single();

      if (findError || !referral) {
        return new Response(JSON.stringify({ error: "Invalid or expired referral code" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error: updateError } = await serviceClient
        .from("ecosystem_referrals")
        .update({ referred_user_id: referredUserId, status: "converted", converted_at: new Date().toISOString() })
        .eq("id", referral.id);

      if (updateError) throw updateError;

      return new Response(JSON.stringify({ success: true, referral }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (action === "stats") {
      // Statistiken für einen Nutzer
      if (!user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data, error } = await serviceClient
        .from("ecosystem_referrals")
        .select("*")
        .eq("referrer_user_id", user.id);

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        converted: data?.filter((r: any) => r.status === "converted").length || 0,
        pending: data?.filter((r: any) => r.status === "pending").length || 0,
        referrals: data || [],
      };

      return new Response(JSON.stringify({ success: true, data: stats }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else {
      return new Response(JSON.stringify({ error: "Invalid action. Use 'create', 'capture' or 'stats'" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (err: any) {
    console.error("referral error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
