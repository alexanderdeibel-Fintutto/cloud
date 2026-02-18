import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const { code, event, user_id, email } = await req.json();

    if (!code || !event) {
      return new Response(JSON.stringify({ error: "code and event are required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const validEvents = ["clicked", "registered", "subscribed"];
    if (!validEvents.includes(event)) {
      return new Response(JSON.stringify({ error: `event must be one of: ${validEvents.join(", ")}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Find the referral by code
    const { data: referral, error: findError } = await supabase
      .from("referrals")
      .select("id, status, referrer_id, target_app_id")
      .eq("referral_code", code)
      .maybeSingle();

    if (findError) throw findError;
    if (!referral) {
      return new Response(JSON.stringify({ error: "Referral code not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    // Status progression: pending → clicked → registered → subscribed
    const statusOrder = ["pending", "clicked", "registered", "subscribed"];
    const currentIndex = statusOrder.indexOf(referral.status);
    const newIndex = statusOrder.indexOf(event);

    // Only allow forward progression
    if (newIndex <= currentIndex) {
      return new Response(JSON.stringify({ 
        ok: true, 
        message: "Status already at or beyond requested state",
        status: referral.status,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Build update payload
    const updatePayload: Record<string, unknown> = { status: event };
    if (email) updatePayload.referred_email = email;
    if (user_id) updatePayload.referred_user_id = user_id;
    if (event === "subscribed") updatePayload.converted_at = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("referrals")
      .update(updatePayload)
      .eq("id", referral.id);

    if (updateError) throw updateError;

    // If subscribed, create a reward for the referrer
    if (event === "subscribed") {
      const { error: rewardError } = await supabase
        .from("referral_rewards")
        .insert({
          user_id: referral.referrer_id,
          referral_id: referral.id,
          reward_type: "discount",
          amount: 5.00,
          currency: "EUR",
          description: `Empfehlungsbonus: Neues Abo für ${referral.target_app_id}`,
        });

      if (rewardError) {
        console.error("[PROCESS-REFERRAL] Reward insert error:", rewardError);
      }
    }

    return new Response(JSON.stringify({ ok: true, status: event }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[PROCESS-REFERRAL] ERROR:", error);
    return new Response(JSON.stringify({ error: "Referral konnte nicht verarbeitet werden." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
