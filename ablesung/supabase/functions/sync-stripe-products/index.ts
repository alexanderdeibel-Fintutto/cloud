import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
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
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Auth check - requires valid token or can be called server-side
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: authErr } = await supabase.auth.getUser(token);
      if (authErr || !userData.user) throw new Error("Not authenticated");
    }
    // When called without auth (e.g. from admin tooling), proceed

    // Get all products without stripe price IDs
    const { data: products, error: dbErr } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("app_id")
      .order("sort_order");

    if (dbErr) throw dbErr;

    const results: any[] = [];

    for (const product of products || []) {
      // Skip free products (no Stripe needed)
      if (product.price_monthly === 0 && product.price_yearly === 0) {
        results.push({ id: product.id, name: product.name, skipped: "free tier" });
        continue;
      }

      // Skip if already has both price IDs
      if (product.stripe_price_id_monthly && product.stripe_price_id_yearly) {
        results.push({ id: product.id, name: product.name, skipped: "already linked" });
        continue;
      }

      // Create or find Stripe product
      let stripeProduct: Stripe.Product;
      const existingProducts = await stripe.products.search({
        query: `metadata["db_id"]:"${product.id}"`,
      });

      if (existingProducts.data.length > 0) {
        stripeProduct = existingProducts.data[0];
        console.log(`Found existing Stripe product: ${stripeProduct.id} for ${product.name}`);
      } else {
        stripeProduct = await stripe.products.create({
          name: `${product.name} (${product.app_id})`,
          description: product.description || undefined,
          metadata: {
            db_id: product.id,
            app_id: product.app_id,
          },
        });
        console.log(`Created Stripe product: ${stripeProduct.id} for ${product.name}`);
      }

      // Create monthly price if missing
      let monthlyPriceId = product.stripe_price_id_monthly;
      if (!monthlyPriceId && product.price_monthly > 0) {
        const price = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: Math.round(product.price_monthly * 100),
          currency: "eur",
          recurring: { interval: "month" },
          metadata: { db_id: product.id, interval: "monthly" },
        });
        monthlyPriceId = price.id;
        console.log(`Created monthly price: ${price.id}`);
      }

      // Create yearly price if missing
      let yearlyPriceId = product.stripe_price_id_yearly;
      if (!yearlyPriceId && product.price_yearly > 0) {
        const price = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: Math.round(product.price_yearly * 100),
          currency: "eur",
          recurring: { interval: "year" },
          metadata: { db_id: product.id, interval: "yearly" },
        });
        yearlyPriceId = price.id;
        console.log(`Created yearly price: ${price.id}`);
      }

      // Update DB with price IDs
      const { error: updateErr } = await supabase
        .from("products")
        .update({
          stripe_price_id_monthly: monthlyPriceId,
          stripe_price_id_yearly: yearlyPriceId,
        })
        .eq("id", product.id);

      if (updateErr) {
        console.error(`Failed to update product ${product.id}:`, updateErr);
      }

      results.push({
        id: product.id,
        name: product.name,
        app_id: product.app_id,
        stripe_product_id: stripeProduct.id,
        stripe_price_id_monthly: monthlyPriceId,
        stripe_price_id_yearly: yearlyPriceId,
      });
    }

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[SYNC-STRIPE-PRODUCTS] ERROR:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
