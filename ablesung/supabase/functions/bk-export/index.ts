import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

// BK-Export API: Returns consumption data for a building/period
// formatted for integration with Vermietify / Betriebskostenabrechnung.
//
// POST body: { building_id: string, period_year: number }
// Returns: JSON with per-unit, per-meter-type consumption data
//
// This is the bridge between Ablesung (meter readings) and
// Vermietify (operating cost calculations).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Default prices per unit (EUR) for cost estimation
const PRICE_DEFAULTS: Record<string, number> = {
  electricity: 0.32,
  gas: 0.12,
  water_cold: 4.50,
  water_hot: 8.00,
  heating: 0.10,
  district_heating: 0.10,
  oil: 1.10,
  pellets: 0.35,
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
    // Authenticate caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authorization required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const { building_id, period_year } = await req.json();
    if (!building_id || !period_year) {
      return new Response(JSON.stringify({ error: "building_id and period_year required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const periodStart = `${period_year}-01-01`;
    const periodEnd = `${period_year}-12-31`;

    // Verify user has access to this building
    const { data: building, error: buildingError } = await supabase
      .from("buildings")
      .select("id, name, address, total_area, organization_id")
      .eq("id", building_id)
      .single();

    if (buildingError || !building) {
      return new Response(JSON.stringify({ error: "Building not found or access denied" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    // Fetch units
    const { data: units } = await supabase
      .from("units")
      .select("id, unit_number, area, type, status")
      .eq("building_id", building_id);

    if (!units || units.length === 0) {
      return new Response(JSON.stringify({
        building,
        period: { start: periodStart, end: periodEnd, year: period_year },
        units: [],
        summary: {},
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const unitIds = units.map(u => u.id);

    // Fetch meters for these units
    const { data: meters } = await supabase
      .from("meters")
      .select("id, unit_id, meter_number, meter_type")
      .in("unit_id", unitIds);

    if (!meters || meters.length === 0) {
      return new Response(JSON.stringify({
        building,
        period: { start: periodStart, end: periodEnd, year: period_year },
        units: units.map(u => ({ ...u, consumptions: [] })),
        summary: {},
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const meterIds = meters.map(m => m.id);

    // Fetch all readings in the period (+ buffer for interpolation)
    const bufferStart = `${period_year - 1}-10-01`;
    const bufferEnd = `${period_year + 1}-03-31`;

    const { data: readings } = await supabase
      .from("meter_readings")
      .select("meter_id, reading_date, reading_value")
      .in("meter_id", meterIds)
      .gte("reading_date", bufferStart)
      .lte("reading_date", bufferEnd)
      .order("reading_date", { ascending: true });

    // Group readings by meter
    const readingsByMeter: Record<string, { date: string; value: number }[]> = {};
    for (const r of readings || []) {
      if (!readingsByMeter[r.meter_id]) readingsByMeter[r.meter_id] = [];
      readingsByMeter[r.meter_id].push({ date: r.reading_date, value: r.reading_value });
    }

    // Calculate consumption per unit per meter type
    interface UnitExport {
      unit_id: string;
      unit_number: string;
      area: number | null;
      consumptions: {
        meter_type: string;
        meter_number: string;
        start_date: string | null;
        start_value: number | null;
        end_date: string | null;
        end_value: number | null;
        consumption: number | null;
        consumption_share_percent: number;
        estimated_cost_eur: number | null;
        unit: string;
        has_data: boolean;
        warning: string | null;
      }[];
    }

    const unitExports: UnitExport[] = [];
    const summaryByType: Record<string, { total_consumption: number; total_cost: number; unit: string; meter_count: number }> = {};

    for (const unit of units) {
      const unitMeters = meters.filter(m => m.unit_id === unit.id);
      const consumptions: UnitExport["consumptions"] = [];

      for (const meter of unitMeters) {
        const meterReadings = readingsByMeter[meter.id] || [];

        // Find closest readings to period boundaries
        const beforeEnd = meterReadings.filter(r => r.date <= periodEnd);
        const afterStart = meterReadings.filter(r => r.date >= periodStart);

        const startReading = beforeEnd.length > 0
          ? beforeEnd.reduce((closest, r) => {
              const diff = Math.abs(new Date(r.date).getTime() - new Date(periodStart).getTime());
              const closestDiff = Math.abs(new Date(closest.date).getTime() - new Date(periodStart).getTime());
              return diff < closestDiff ? r : closest;
            })
          : null;

        const endReading = beforeEnd.length > 0 ? beforeEnd[beforeEnd.length - 1] : null;

        const hasData = startReading !== null && endReading !== null && startReading.date !== endReading.date;
        const consumption = hasData ? Math.max(0, endReading!.value - startReading!.value) : null;

        let warning: string | null = null;
        if (!startReading) warning = "Kein Anfangsstand";
        else if (!endReading) warning = "Kein Endstand";
        else if (startReading.date === endReading.date) warning = "Nur eine Ablesung";

        const UNIT_MAP: Record<string, string> = {
          electricity: "kWh", gas: "m³", water_cold: "m³", water_hot: "m³",
          heating: "kWh", district_heating: "kWh", oil: "Liter", pellets: "kg",
        };
        const meterUnit = UNIT_MAP[meter.meter_type] || "kWh";
        const price = PRICE_DEFAULTS[meter.meter_type] || 0;
        const estimatedCost = consumption !== null ? Math.round(consumption * price * 100) / 100 : null;

        consumptions.push({
          meter_type: meter.meter_type,
          meter_number: meter.meter_number,
          start_date: startReading?.date || null,
          start_value: startReading?.value || null,
          end_date: endReading?.date || null,
          end_value: endReading?.value || null,
          consumption,
          consumption_share_percent: 0, // calculated below
          estimated_cost_eur: estimatedCost,
          unit: meterUnit,
          has_data: hasData,
          warning,
        });

        // Accumulate summary
        if (!summaryByType[meter.meter_type]) {
          summaryByType[meter.meter_type] = { total_consumption: 0, total_cost: 0, unit: meterUnit, meter_count: 0 };
        }
        summaryByType[meter.meter_type].meter_count++;
        if (consumption !== null) {
          summaryByType[meter.meter_type].total_consumption += consumption;
          summaryByType[meter.meter_type].total_cost += estimatedCost || 0;
        }
      }

      unitExports.push({
        unit_id: unit.id,
        unit_number: unit.unit_number,
        area: unit.area,
        consumptions,
      });
    }

    // Calculate consumption shares per meter type
    for (const unitExport of unitExports) {
      for (const cons of unitExport.consumptions) {
        const total = summaryByType[cons.meter_type]?.total_consumption || 0;
        cons.consumption_share_percent = total > 0 && cons.consumption
          ? Math.round((cons.consumption / total) * 10000) / 100
          : 0;
      }
    }

    return new Response(JSON.stringify({
      building: {
        id: building.id,
        name: building.name,
        address: building.address,
        total_area: building.total_area,
      },
      period: {
        start: periodStart,
        end: periodEnd,
        year: period_year,
      },
      units: unitExports,
      summary: summaryByType,
      exported_at: new Date().toISOString(),
      source: "ablesung",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[BK-EXPORT] ERROR:", error);
    return new Response(JSON.stringify({ error: "Export fehlgeschlagen." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
