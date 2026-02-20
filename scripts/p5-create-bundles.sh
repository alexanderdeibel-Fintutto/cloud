#!/bin/bash
# ============================================================================
# P5: Create Ecosystem Bundle Stripe Products
#
# Creates 4 bundle products for multi-app discounts:
#   1. Mieter Komplett (Portal Mieter + BescheidBoxer)     7.99/mo
#   2. Vermieter Starter (Portal Vermieter + Vermietify)  14.99/mo
#   3. Vermieter Pro (Portal + Vermietify + Ablesung)     34.99/mo
#   4. Hausverwaltung (Everything)                        79.99/mo
#
# Usage: STRIPE_SECRET_KEY=sk_live_xxx ./scripts/p5-create-bundles.sh
# ============================================================================

set -euo pipefail

if [ -z "${STRIPE_SECRET_KEY:-}" ]; then
  echo "Error: STRIPE_SECRET_KEY environment variable is required"
  exit 1
fi

create_product() {
  local name="$1"
  local description="$2"
  curl -s https://api.stripe.com/v1/products \
    -u "$STRIPE_SECRET_KEY:" \
    -d "name=$name" \
    -d "description=$description" | \
    grep -o '"id": "prod_[^"]*"' | head -1 | cut -d'"' -f4
}

create_price() {
  local product_id="$1"
  local amount="$2"
  local interval="$3"
  local nickname="$4"
  curl -s https://api.stripe.com/v1/prices \
    -u "$STRIPE_SECRET_KEY:" \
    -d "product=$product_id" \
    -d "unit_amount=$amount" \
    -d "currency=eur" \
    -d "recurring[interval]=$interval" \
    -d "nickname=$nickname" | \
    grep -o '"id": "price_[^"]*"' | head -1 | cut -d'"' -f4
}

echo "=============================================="
echo "  P5: Create Ecosystem Bundles"
echo "=============================================="
echo ""

# --- Bundle 1: Mieter Komplett ---
echo "1/4 Mieter Komplett (7.99/mo, 76.70/yr) - 20% off 9.98..."
B1_PROD=$(create_product "Fintutto Bundle - Mieter Komplett" "Portal Mieter + BescheidBoxer Kaempfer: Alle Checker, Formulare, Bescheid-Analyse")
B1_MONTHLY=$(create_price "$B1_PROD" 799 "month" "Bundle Mieter Komplett Monatlich")
B1_YEARLY=$(create_price "$B1_PROD" 7670 "year" "Bundle Mieter Komplett Jaehrlich")
echo "  Product: $B1_PROD | Monthly: $B1_MONTHLY | Yearly: $B1_YEARLY"
echo ""

# --- Bundle 2: Vermieter Starter ---
echo "2/4 Vermieter Starter (14.99/mo, 143.90/yr) - 25% off 19.98..."
B2_PROD=$(create_product "Fintutto Bundle - Vermieter Starter" "Portal Vermieter + Vermietify Basic: Alle Rechner, Formulare, Immobilienverwaltung")
B2_MONTHLY=$(create_price "$B2_PROD" 1499 "month" "Bundle Vermieter Starter Monatlich")
B2_YEARLY=$(create_price "$B2_PROD" 14390 "year" "Bundle Vermieter Starter Jaehrlich")
echo "  Product: $B2_PROD | Monthly: $B2_MONTHLY | Yearly: $B2_YEARLY"
echo ""

# --- Bundle 3: Vermieter Pro ---
echo "3/4 Vermieter Pro (34.99/mo, 335.90/yr) - 30% off 49.97..."
B3_PROD=$(create_product "Fintutto Bundle - Vermieter Pro" "Portal Kombi Pro + Vermietify Pro + Ablesung Basic: Komplettverwaltung")
B3_MONTHLY=$(create_price "$B3_PROD" 3499 "month" "Bundle Vermieter Pro Monatlich")
B3_YEARLY=$(create_price "$B3_PROD" 33590 "year" "Bundle Vermieter Pro Jaehrlich")
echo "  Product: $B3_PROD | Monthly: $B3_MONTHLY | Yearly: $B3_YEARLY"
echo ""

# --- Bundle 4: Hausverwaltung ---
echo "4/4 Hausverwaltung (79.99/mo, 767.90/yr) - 36% off 124.96..."
B4_PROD=$(create_product "Fintutto Bundle - Hausverwaltung" "Portal Unlimited + Vermietify Enterprise + Ablesung Pro + HausmeisterPro Pro: Alles fuer Profis")
B4_MONTHLY=$(create_price "$B4_PROD" 7999 "month" "Bundle Hausverwaltung Monatlich")
B4_YEARLY=$(create_price "$B4_PROD" 76790 "year" "Bundle Hausverwaltung Jaehrlich")
echo "  Product: $B4_PROD | Monthly: $B4_MONTHLY | Yearly: $B4_YEARLY"
echo ""

echo "=============================================="
echo "  Bundle Products Created!"
echo "=============================================="
echo ""
echo "Mieter Komplett:    prod=$B1_PROD  monthly=$B1_MONTHLY  yearly=$B1_YEARLY"
echo "Vermieter Starter:  prod=$B2_PROD  monthly=$B2_MONTHLY  yearly=$B2_YEARLY"
echo "Vermieter Pro:      prod=$B3_PROD  monthly=$B3_MONTHLY  yearly=$B3_YEARLY"
echo "Hausverwaltung:     prod=$B4_PROD  monthly=$B4_MONTHLY  yearly=$B4_YEARLY"
echo ""
echo "Add these to the Admin-Hub pricing configuration and"
echo "each app's checkout flow to offer bundle upsells."
