import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

// Designed to run as a Supabase Cron Job (daily at 08:00 UTC)
// or triggered manually via POST request.
//
// Checks all active contracts for upcoming cancellation deadlines
// and creates reminder entries if they don't exist yet.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    // 1. Fetch all active contracts with a cancellation deadline in the future
    const { data: contracts, error: contractsError } = await supabase
      .from("energy_contracts")
      .select("id, organization_id, provider_name, tariff_name, contract_end, cancellation_deadline, cancellation_period_days")
      .eq("status", "active")
      .not("cancellation_deadline", "is", null)
      .gte("cancellation_deadline", today);

    if (contractsError) throw contractsError;

    if (!contracts || contracts.length === 0) {
      return new Response(JSON.stringify({ processed: 0, reminders_created: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let remindersCreated = 0;

    for (const contract of contracts) {
      const deadline = new Date(contract.cancellation_deadline);
      const daysUntilDeadline = Math.ceil(
        (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Define reminder thresholds (days before deadline)
      const thresholds = [90, 30, 14, 7, 3, 1];

      for (const threshold of thresholds) {
        if (daysUntilDeadline !== threshold) continue;

        // Check if this reminder already exists
        const reminderDate = today;
        const { data: existing } = await supabase
          .from("contract_reminders")
          .select("id")
          .eq("contract_id", contract.id)
          .eq("reminder_date", reminderDate)
          .eq("reminder_type", "cancellation_deadline")
          .maybeSingle();

        if (existing) continue;

        // Create the reminder
        const { error: insertError } = await supabase
          .from("contract_reminders")
          .insert({
            contract_id: contract.id,
            reminder_date: reminderDate,
            reminder_type: "cancellation_deadline",
            is_dismissed: false,
          });

        if (insertError) {
          console.error(`[CONTRACT-REMINDERS] Failed to create reminder for contract ${contract.id}:`, insertError);
        } else {
          remindersCreated++;
        }
      }

      // Also check for contracts expiring soon (contract_end within 30 days)
      if (contract.contract_end) {
        const contractEnd = new Date(contract.contract_end);
        const daysUntilEnd = Math.ceil(
          (contractEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        if ([30, 14, 7].includes(daysUntilEnd)) {
          const { data: existingEnd } = await supabase
            .from("contract_reminders")
            .select("id")
            .eq("contract_id", contract.id)
            .eq("reminder_date", today)
            .eq("reminder_type", "contract_end")
            .maybeSingle();

          if (!existingEnd) {
            const { error: endInsertError } = await supabase
              .from("contract_reminders")
              .insert({
                contract_id: contract.id,
                reminder_date: today,
                reminder_type: "contract_end",
                is_dismissed: false,
              });

            if (!endInsertError) remindersCreated++;
          }
        }
      }
    }

    console.log(`[CONTRACT-REMINDERS] Processed ${contracts.length} contracts, created ${remindersCreated} reminders`);

    return new Response(JSON.stringify({
      processed: contracts.length,
      reminders_created: remindersCreated,
      date: today,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[CONTRACT-REMINDERS] ERROR:", error);
    return new Response(JSON.stringify({ error: "Erinnerungen konnten nicht verarbeitet werden." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
