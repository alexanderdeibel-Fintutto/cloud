import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

// Designed to run as a Supabase Cron Job (weekly, e.g. Monday 06:00 UTC)
// or triggered manually via POST request.
//
// Analyzes meter readings for consumption anomalies:
// - Sudden consumption spikes (>50% above average)
// - Unusual drops (possible meter malfunction)
// - Stale meters (no reading in >60 days)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnomalyResult {
  meter_id: string;
  meter_number: string;
  meter_type: string;
  building_name: string;
  unit_number: string | null;
  anomaly_type: "spike" | "drop" | "stale";
  details: string;
  severity: "warning" | "critical";
}

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
    // Parse optional org filter from request body
    let organizationId: string | null = null;
    try {
      const body = await req.json();
      organizationId = body?.organization_id || null;
    } catch {
      // No body provided, analyze all organizations
    }

    // 1. Fetch all meters with their recent readings
    let metersQuery = supabase
      .from("meters")
      .select(`
        id, meter_number, meter_type, reading_interval_days,
        unit_id, building_id,
        units!meters_unit_id_fkey ( unit_number, building_id, buildings!units_building_id_fkey ( name, organization_id ) ),
        buildings!meters_building_id_fkey ( name, organization_id )
      `);

    const { data: meters, error: metersError } = await metersQuery;
    if (metersError) throw metersError;
    if (!meters || meters.length === 0) {
      return new Response(JSON.stringify({ anomalies: [], count: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Filter by organization if specified
    const filteredMeters = organizationId
      ? meters.filter((m: any) => {
          const orgId = m.units?.buildings?.organization_id || m.buildings?.organization_id;
          return orgId === organizationId;
        })
      : meters;

    const meterIds = filteredMeters.map((m: any) => m.id);

    // 2. Fetch readings for last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const { data: readings, error: readingsError } = await supabase
      .from("meter_readings")
      .select("id, meter_id, reading_date, reading_value")
      .in("meter_id", meterIds)
      .gte("reading_date", twelveMonthsAgo.toISOString().split("T")[0])
      .order("reading_date", { ascending: true });

    if (readingsError) throw readingsError;

    // 3. Group readings by meter
    const readingsByMeter: Record<string, { date: string; value: number }[]> = {};
    for (const r of readings || []) {
      if (!readingsByMeter[r.meter_id]) readingsByMeter[r.meter_id] = [];
      readingsByMeter[r.meter_id].push({ date: r.reading_date, value: r.reading_value });
    }

    // 4. Analyze each meter
    const anomalies: AnomalyResult[] = [];
    const now = new Date();

    for (const meter of filteredMeters as any[]) {
      const meterReadings = readingsByMeter[meter.id] || [];
      const buildingName = meter.units?.buildings?.name || meter.buildings?.name || "Unbekannt";
      const unitNumber = meter.units?.unit_number || null;
      const intervalDays = meter.reading_interval_days || 30;

      // Check for stale meter (no reading in > 2x interval)
      if (meterReadings.length === 0) {
        anomalies.push({
          meter_id: meter.id,
          meter_number: meter.meter_number,
          meter_type: meter.meter_type,
          building_name: buildingName,
          unit_number: unitNumber,
          anomaly_type: "stale",
          details: "Keine Ablesungen in den letzten 12 Monaten.",
          severity: "critical",
        });
        continue;
      }

      const lastReading = meterReadings[meterReadings.length - 1];
      const daysSinceLastReading = Math.ceil(
        (now.getTime() - new Date(lastReading.date).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastReading > intervalDays * 2) {
        anomalies.push({
          meter_id: meter.id,
          meter_number: meter.meter_number,
          meter_type: meter.meter_type,
          building_name: buildingName,
          unit_number: unitNumber,
          anomaly_type: "stale",
          details: `Letzte Ablesung vor ${daysSinceLastReading} Tagen (Intervall: ${intervalDays} Tage).`,
          severity: daysSinceLastReading > intervalDays * 3 ? "critical" : "warning",
        });
      }

      // Check for consumption spikes/drops (need at least 3 readings)
      if (meterReadings.length < 3) continue;

      // Calculate consumption between consecutive readings
      const consumptions: number[] = [];
      for (let i = 1; i < meterReadings.length; i++) {
        const diff = meterReadings[i].value - meterReadings[i - 1].value;
        const days = Math.max(1, Math.ceil(
          (new Date(meterReadings[i].date).getTime() - new Date(meterReadings[i - 1].date).getTime()) / (1000 * 60 * 60 * 24)
        ));
        // Normalize to daily consumption
        consumptions.push(diff / days);
      }

      if (consumptions.length < 2) continue;

      // Calculate average daily consumption (excluding last period)
      const historicalConsumptions = consumptions.slice(0, -1);
      const avgDailyConsumption = historicalConsumptions.reduce((a, b) => a + b, 0) / historicalConsumptions.length;
      const latestDailyConsumption = consumptions[consumptions.length - 1];

      if (avgDailyConsumption <= 0) continue;

      const ratio = latestDailyConsumption / avgDailyConsumption;

      // Spike detection: >150% of average
      if (ratio > 1.5) {
        anomalies.push({
          meter_id: meter.id,
          meter_number: meter.meter_number,
          meter_type: meter.meter_type,
          building_name: buildingName,
          unit_number: unitNumber,
          anomaly_type: "spike",
          details: `Verbrauch ${Math.round((ratio - 1) * 100)}% über dem Durchschnitt (${latestDailyConsumption.toFixed(1)} vs. Ø ${avgDailyConsumption.toFixed(1)} pro Tag).`,
          severity: ratio > 2.0 ? "critical" : "warning",
        });
      }

      // Drop detection: <30% of average (possible meter malfunction or vacancy)
      if (ratio < 0.3 && avgDailyConsumption > 0.1) {
        anomalies.push({
          meter_id: meter.id,
          meter_number: meter.meter_number,
          meter_type: meter.meter_type,
          building_name: buildingName,
          unit_number: unitNumber,
          anomaly_type: "drop",
          details: `Verbrauch ${Math.round((1 - ratio) * 100)}% unter dem Durchschnitt. Mögliche Störung oder Leerstand.`,
          severity: "warning",
        });
      }
    }

    console.log(`[DETECT-ANOMALIES] Analyzed ${filteredMeters.length} meters, found ${anomalies.length} anomalies`);

    return new Response(JSON.stringify({
      anomalies,
      count: anomalies.length,
      meters_analyzed: filteredMeters.length,
      date: now.toISOString().split("T")[0],
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[DETECT-ANOMALIES] ERROR:", error);
    return new Response(JSON.stringify({ error: "Anomalie-Erkennung fehlgeschlagen." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
