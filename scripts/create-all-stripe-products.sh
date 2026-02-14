#!/bin/bash

# ============================================================================
# Fintutto Ecosystem - Stripe Products & Prices Setup Script
# Creates ALL missing Stripe products and prices for the entire ecosystem
#
# Usage: STRIPE_SECRET_KEY=sk_live_xxx ./scripts/create-all-stripe-products.sh
#
# This script creates products for:
#   1. Fintutto Portal (4 plans x monthly/yearly)
#   2. Vermieter-Portal (3 plans x monthly/yearly)
#   3. BescheidBoxer (3 plans x monthly/yearly + 3 credit packages)
#   4. Financial Compass (2 yearly prices for existing products)
#   5. Mieter App (2 yearly prices for existing products)
#   6. HausmeisterPro Enterprise (new tier)
#   7. Ablesung Enterprise (new tier)
# ============================================================================

set -euo pipefail

if [ -z "${STRIPE_SECRET_KEY:-}" ]; then
  echo "Error: STRIPE_SECRET_KEY environment variable is required"
  echo "Usage: STRIPE_SECRET_KEY=sk_live_xxx ./scripts/create-all-stripe-products.sh"
  exit 1
fi

create_product() {
  local name="$1"
  local description="$2"
  local response
  response=$(curl -s https://api.stripe.com/v1/products \
    -u "$STRIPE_SECRET_KEY:" \
    -d "name=$name" \
    -d "description=$description")
  local prod_id
  prod_id=$(echo "$response" | grep -o '"id": "prod_[^"]*"' | head -1 | cut -d'"' -f4)
  if [ -z "$prod_id" ]; then
    echo "ERROR: Failed to create product '$name'" >&2
    echo "API Response: $response" >&2
    echo "FAILED"
    return 1
  fi
  echo "$prod_id"
}

create_price() {
  local product_id="$1"
  local amount="$2"
  local interval="$3"
  local nickname="$4"
  local response
  response=$(curl -s https://api.stripe.com/v1/prices \
    -u "$STRIPE_SECRET_KEY:" \
    -d "product=$product_id" \
    -d "unit_amount=$amount" \
    -d "currency=eur" \
    -d "recurring[interval]=$interval" \
    -d "nickname=$nickname")
  local price_id
  price_id=$(echo "$response" | grep -o '"id": "price_[^"]*"' | head -1 | cut -d'"' -f4)
  if [ -z "$price_id" ]; then
    echo "ERROR: Failed to create price '$nickname' for product $product_id" >&2
    echo "API Response: $response" >&2
    echo "FAILED"
    return 1
  fi
  echo "$price_id"
}

create_onetime_price() {
  local product_id="$1"
  local amount="$2"
  local nickname="$3"
  local response
  response=$(curl -s https://api.stripe.com/v1/prices \
    -u "$STRIPE_SECRET_KEY:" \
    -d "product=$product_id" \
    -d "unit_amount=$amount" \
    -d "currency=eur" \
    -d "nickname=$nickname")
  local price_id
  price_id=$(echo "$response" | grep -o '"id": "price_[^"]*"' | head -1 | cut -d'"' -f4)
  if [ -z "$price_id" ]; then
    echo "ERROR: Failed to create price '$nickname' for product $product_id" >&2
    echo "API Response: $response" >&2
    echo "FAILED"
    return 1
  fi
  echo "$price_id"
}

echo "=============================================="
echo "Fintutto Ecosystem - Stripe Products Setup"
echo "=============================================="
echo ""

# ============================================================================
# 1. FINTUTTO PORTAL - 4 Plans (Mieter, Vermieter, Kombi Pro, Unlimited)
# ============================================================================
echo "=== 1. FINTUTTO PORTAL ==="
echo ""

echo "1a. Portal Mieter (4.99/mo, 47.90/yr)..."
PORTAL_MIETER_PROD=$(create_product "Fintutto Portal - Mieter" "Alle Checker & Mieter-Formulare, 15 Credits/Monat, 10 KI-Nachrichten")
PORTAL_MIETER_MONTHLY=$(create_price "$PORTAL_MIETER_PROD" 499 "month" "Portal Mieter Monatlich")
PORTAL_MIETER_YEARLY=$(create_price "$PORTAL_MIETER_PROD" 4790 "year" "Portal Mieter Jaehrlich")
echo "   Product: $PORTAL_MIETER_PROD"
echo "   Monthly: $PORTAL_MIETER_MONTHLY"
echo "   Yearly:  $PORTAL_MIETER_YEARLY"
echo ""

echo "1b. Portal Vermieter (9.99/mo, 95.90/yr)..."
PORTAL_VERMIETER_PROD=$(create_product "Fintutto Portal - Vermieter" "Alle Rechner & Vermieter-Formulare, 20 Credits/Monat, 20 KI-Nachrichten")
PORTAL_VERMIETER_MONTHLY=$(create_price "$PORTAL_VERMIETER_PROD" 999 "month" "Portal Vermieter Monatlich")
PORTAL_VERMIETER_YEARLY=$(create_price "$PORTAL_VERMIETER_PROD" 9590 "year" "Portal Vermieter Jaehrlich")
echo "   Product: $PORTAL_VERMIETER_PROD"
echo "   Monthly: $PORTAL_VERMIETER_MONTHLY"
echo "   Yearly:  $PORTAL_VERMIETER_YEARLY"
echo ""

echo "1c. Portal Kombi Pro (14.99/mo, 143.90/yr)..."
PORTAL_KOMBI_PROD=$(create_product "Fintutto Portal - Kombi Pro" "Alles: Rechner + Checker + Formulare, 50 Credits/Monat, 50 KI-Nachrichten")
PORTAL_KOMBI_MONTHLY=$(create_price "$PORTAL_KOMBI_PROD" 1499 "month" "Portal Kombi Pro Monatlich")
PORTAL_KOMBI_YEARLY=$(create_price "$PORTAL_KOMBI_PROD" 14390 "year" "Portal Kombi Pro Jaehrlich")
echo "   Product: $PORTAL_KOMBI_PROD"
echo "   Monthly: $PORTAL_KOMBI_MONTHLY"
echo "   Yearly:  $PORTAL_KOMBI_YEARLY"
echo ""

echo "1d. Portal Unlimited (24.99/mo, 239.90/yr)..."
PORTAL_UNLIMITED_PROD=$(create_product "Fintutto Portal - Unlimited" "Unbegrenzt alles nutzen, Unbegrenzte Credits & KI-Nachrichten")
PORTAL_UNLIMITED_MONTHLY=$(create_price "$PORTAL_UNLIMITED_PROD" 2499 "month" "Portal Unlimited Monatlich")
PORTAL_UNLIMITED_YEARLY=$(create_price "$PORTAL_UNLIMITED_PROD" 23990 "year" "Portal Unlimited Jaehrlich")
echo "   Product: $PORTAL_UNLIMITED_PROD"
echo "   Monthly: $PORTAL_UNLIMITED_MONTHLY"
echo "   Yearly:  $PORTAL_UNLIMITED_YEARLY"
echo ""

# ============================================================================
# 2. VERMIETER-PORTAL - 3 Plans (Starter, Pro, Unlimited)
# ============================================================================
echo "=== 2. VERMIETER-PORTAL ==="
echo ""

echo "2a. Vermieter-Portal Starter (2.99/mo, 28.70/yr)..."
VP_STARTER_PROD=$(create_product "Vermieter-Portal - Starter" "10 Credits/Monat, Ergebnisse speichern")
VP_STARTER_MONTHLY=$(create_price "$VP_STARTER_PROD" 299 "month" "VP Starter Monatlich")
VP_STARTER_YEARLY=$(create_price "$VP_STARTER_PROD" 2870 "year" "VP Starter Jaehrlich")
echo "   Product: $VP_STARTER_PROD"
echo "   Monthly: $VP_STARTER_MONTHLY"
echo "   Yearly:  $VP_STARTER_YEARLY"
echo ""

echo "2b. Vermieter-Portal Pro (7.99/mo, 76.70/yr)..."
VP_PRO_PROD=$(create_product "Vermieter-Portal - Pro" "30 Credits/Monat, 50 KI-Nachrichten, alle Features")
VP_PRO_MONTHLY=$(create_price "$VP_PRO_PROD" 799 "month" "VP Pro Monatlich")
VP_PRO_YEARLY=$(create_price "$VP_PRO_PROD" 7670 "year" "VP Pro Jaehrlich")
echo "   Product: $VP_PRO_PROD"
echo "   Monthly: $VP_PRO_MONTHLY"
echo "   Yearly:  $VP_PRO_YEARLY"
echo ""

echo "2c. Vermieter-Portal Unlimited (14.99/mo, 143.90/yr)..."
VP_UNLIMITED_PROD=$(create_product "Vermieter-Portal - Unlimited" "Unbegrenzte Credits & KI-Nachrichten")
VP_UNLIMITED_MONTHLY=$(create_price "$VP_UNLIMITED_PROD" 1499 "month" "VP Unlimited Monatlich")
VP_UNLIMITED_YEARLY=$(create_price "$VP_UNLIMITED_PROD" 14390 "year" "VP Unlimited Jaehrlich")
echo "   Product: $VP_UNLIMITED_PROD"
echo "   Monthly: $VP_UNLIMITED_MONTHLY"
echo "   Yearly:  $VP_UNLIMITED_YEARLY"
echo ""

# ============================================================================
# 3. BESCHEIDBOXER - 3 Plans + 3 Credit Packages
# ============================================================================
echo "=== 3. BESCHEIDBOXER ==="
echo ""

echo "3a. BescheidBoxer Starter (2.99/mo, 28.70/yr)..."
BB_STARTER_PROD=$(create_product "BescheidBoxer - Starter" "10 Credits/Monat, 10 Chat/Tag, 3 Bescheid-Scans, 1 Schreiben")
BB_STARTER_MONTHLY=$(create_price "$BB_STARTER_PROD" 299 "month" "BB Starter Monatlich")
BB_STARTER_YEARLY=$(create_price "$BB_STARTER_PROD" 2870 "year" "BB Starter Jaehrlich")
echo "   Product: $BB_STARTER_PROD"
echo "   Monthly: $BB_STARTER_MONTHLY"
echo "   Yearly:  $BB_STARTER_YEARLY"
echo ""

echo "3b. BescheidBoxer Kaempfer (4.99/mo, 47.90/yr)..."
BB_KAEMPFER_PROD=$(create_product "BescheidBoxer - Kaempfer" "25 Credits/Monat, Unbegrenzt Chat & Scans, 3 Schreiben, MieterApp Basic")
BB_KAEMPFER_MONTHLY=$(create_price "$BB_KAEMPFER_PROD" 499 "month" "BB Kaempfer Monatlich")
BB_KAEMPFER_YEARLY=$(create_price "$BB_KAEMPFER_PROD" 4790 "year" "BB Kaempfer Jaehrlich")
echo "   Product: $BB_KAEMPFER_PROD"
echo "   Monthly: $BB_KAEMPFER_MONTHLY"
echo "   Yearly:  $BB_KAEMPFER_YEARLY"
echo ""

echo "3c. BescheidBoxer Vollschutz (7.99/mo, 76.70/yr)..."
BB_VOLLSCHUTZ_PROD=$(create_product "BescheidBoxer - Vollschutz" "50 Credits/Monat, Unbegrenzt alles, VIP-Forum, MieterApp Premium")
BB_VOLLSCHUTZ_MONTHLY=$(create_price "$BB_VOLLSCHUTZ_PROD" 799 "month" "BB Vollschutz Monatlich")
BB_VOLLSCHUTZ_YEARLY=$(create_price "$BB_VOLLSCHUTZ_PROD" 7670 "year" "BB Vollschutz Jaehrlich")
echo "   Product: $BB_VOLLSCHUTZ_PROD"
echo "   Monthly: $BB_VOLLSCHUTZ_MONTHLY"
echo "   Yearly:  $BB_VOLLSCHUTZ_YEARLY"
echo ""

echo "3d. BescheidBoxer Credit Packages..."
BB_CREDITS_PROD=$(create_product "BescheidBoxer - Credits" "Zusaetzliche Credits fuer BescheidBoxer")
BB_CREDITS_10=$(create_onetime_price "$BB_CREDITS_PROD" 499 "10 Credits")
BB_CREDITS_25=$(create_onetime_price "$BB_CREDITS_PROD" 999 "25 Credits")
BB_CREDITS_50=$(create_onetime_price "$BB_CREDITS_PROD" 1799 "50 Credits")
echo "   Product: $BB_CREDITS_PROD"
echo "   10 Credits: $BB_CREDITS_10"
echo "   25 Credits: $BB_CREDITS_25"
echo "   50 Credits: $BB_CREDITS_50"
echo ""

# ============================================================================
# 4. FINANCIAL COMPASS - Yearly Prices (for existing products)
# ============================================================================
echo "=== 4. FINANCIAL COMPASS - Yearly Prices ==="
echo ""

echo "4a. Financial Compass Basic Yearly (95.90/yr)..."
FC_BASIC_YEARLY=$(create_price "prod_TxmipPdak8JwmT" 9590 "year" "FC Basic Jaehrlich")
echo "   Yearly: $FC_BASIC_YEARLY"

echo "4b. Financial Compass Pro Yearly (191.90/yr)..."
FC_PRO_YEARLY=$(create_price "prod_Txmjs0RZOVqFzS" 19190 "year" "FC Pro Jaehrlich")
echo "   Yearly: $FC_PRO_YEARLY"
echo ""

# ============================================================================
# 5. MIETER APP - New prices (lowered) + Yearly
# ============================================================================
echo "=== 5. MIETER APP - New Prices ==="
echo ""

echo "5a. Mieter App Basic (4.99/mo, 47.90/yr) - NEW lower price..."
MIETER_BASIC_PROD=$(create_product "MieterApp - Basic" "Mangelmeldungen, Dokumente, Zaehlerstaende, Chat, E-Mail-Support")
MIETER_BASIC_MONTHLY=$(create_price "$MIETER_BASIC_PROD" 499 "month" "MieterApp Basic Monatlich")
MIETER_BASIC_YEARLY=$(create_price "$MIETER_BASIC_PROD" 4790 "year" "MieterApp Basic Jaehrlich")
echo "   Product: $MIETER_BASIC_PROD"
echo "   Monthly: $MIETER_BASIC_MONTHLY"
echo "   Yearly:  $MIETER_BASIC_YEARLY"
echo ""

echo "5b. Mieter App Pro (9.99/mo, 95.90/yr) - NEW lower price..."
MIETER_PRO_PROD=$(create_product "MieterApp - Pro" "Alle Basic-Features + Prioritaets-Support, KI-Analyse, Dokumenten-Scan")
MIETER_PRO_MONTHLY=$(create_price "$MIETER_PRO_PROD" 999 "month" "MieterApp Pro Monatlich")
MIETER_PRO_YEARLY=$(create_price "$MIETER_PRO_PROD" 9590 "year" "MieterApp Pro Jaehrlich")
echo "   Product: $MIETER_PRO_PROD"
echo "   Monthly: $MIETER_PRO_MONTHLY"
echo "   Yearly:  $MIETER_PRO_YEARLY"
echo ""

# ============================================================================
# 6. HAUSMEISTERPRO - Enterprise Tier
# ============================================================================
echo "=== 6. HAUSMEISTERPRO - Enterprise Tier ==="
echo ""

echo "6a. HausmeisterPro Enterprise (49.99/mo, 479.90/yr)..."
HMP_ENTERPRISE_PROD=$(create_product "HausmeisterPro - Enterprise" "Unbegrenzte Gebaeude, API-Zugang, Dedizierter Support, Custom Branding")
HMP_ENTERPRISE_MONTHLY=$(create_price "$HMP_ENTERPRISE_PROD" 4999 "month" "HMP Enterprise Monatlich")
HMP_ENTERPRISE_YEARLY=$(create_price "$HMP_ENTERPRISE_PROD" 47990 "year" "HMP Enterprise Jaehrlich")
echo "   Product: $HMP_ENTERPRISE_PROD"
echo "   Monthly: $HMP_ENTERPRISE_MONTHLY"
echo "   Yearly:  $HMP_ENTERPRISE_YEARLY"
echo ""

# ============================================================================
# 7. ABLESUNG - Enterprise Tier
# ============================================================================
echo "=== 7. ABLESUNG - Enterprise Tier ==="
echo ""

echo "7a. Ablesung Enterprise (49.99/mo, 479.90/yr)..."
ABL_ENTERPRISE_PROD=$(create_product "Ablesung - Enterprise" "Unbegrenzte Einheiten, API-Zugang, Dedizierter Support, Custom Reports")
ABL_ENTERPRISE_MONTHLY=$(create_price "$ABL_ENTERPRISE_PROD" 4999 "month" "Ablesung Enterprise Monatlich")
ABL_ENTERPRISE_YEARLY=$(create_price "$ABL_ENTERPRISE_PROD" 47990 "year" "Ablesung Enterprise Jaehrlich")
echo "   Product: $ABL_ENTERPRISE_PROD"
echo "   Monthly: $ABL_ENTERPRISE_MONTHLY"
echo "   Yearly:  $ABL_ENTERPRISE_YEARLY"
echo ""

# ============================================================================
# OUTPUT SUMMARY
# ============================================================================
echo ""
echo "========================================================================"
echo "ALLE STRIPE PRICE IDs - Zum Eintragen in die jeweiligen Apps"
echo "========================================================================"
echo ""
echo "--- FINTUTTO PORTAL (apps/fintutto-portal/src/lib/credits.ts) ---"
echo "mieter_basic:"
echo "  stripePriceIdMonthly: '$PORTAL_MIETER_MONTHLY'"
echo "  stripePriceIdYearly:  '$PORTAL_MIETER_YEARLY'"
echo "vermieter_basic:"
echo "  stripePriceIdMonthly: '$PORTAL_VERMIETER_MONTHLY'"
echo "  stripePriceIdYearly:  '$PORTAL_VERMIETER_YEARLY'"
echo "kombi_pro:"
echo "  stripePriceIdMonthly: '$PORTAL_KOMBI_MONTHLY'"
echo "  stripePriceIdYearly:  '$PORTAL_KOMBI_YEARLY'"
echo "unlimited:"
echo "  stripePriceIdMonthly: '$PORTAL_UNLIMITED_MONTHLY'"
echo "  stripePriceIdYearly:  '$PORTAL_UNLIMITED_YEARLY'"
echo ""
echo "--- VERMIETER-PORTAL (apps/vermieter-portal/src/lib/credits.ts) ---"
echo "starter:"
echo "  stripePriceIdMonthly: '$VP_STARTER_MONTHLY'"
echo "  stripePriceIdYearly:  '$VP_STARTER_YEARLY'"
echo "pro:"
echo "  stripePriceIdMonthly: '$VP_PRO_MONTHLY'"
echo "  stripePriceIdYearly:  '$VP_PRO_YEARLY'"
echo "unlimited:"
echo "  stripePriceIdMonthly: '$VP_UNLIMITED_MONTHLY'"
echo "  stripePriceIdYearly:  '$VP_UNLIMITED_YEARLY'"
echo ""
echo "--- BESCHEIDBOXER (src/lib/credits.ts) ---"
echo "starter:"
echo "  stripePriceIdMonthly: '$BB_STARTER_MONTHLY'"
echo "  stripePriceIdYearly:  '$BB_STARTER_YEARLY'"
echo "kaempfer:"
echo "  stripePriceIdMonthly: '$BB_KAEMPFER_MONTHLY'"
echo "  stripePriceIdYearly:  '$BB_KAEMPFER_YEARLY'"
echo "vollschutz:"
echo "  stripePriceIdMonthly: '$BB_VOLLSCHUTZ_MONTHLY'"
echo "  stripePriceIdYearly:  '$BB_VOLLSCHUTZ_YEARLY'"
echo "credit_packages:"
echo "  10_credits: '$BB_CREDITS_10'"
echo "  25_credits: '$BB_CREDITS_25'"
echo "  50_credits: '$BB_CREDITS_50'"
echo ""
echo "--- FINANCIAL COMPASS (src/hooks/useSubscription.ts) ---"
echo "basic_yearly: '$FC_BASIC_YEARLY'"
echo "pro_yearly:   '$FC_PRO_YEARLY'"
echo ""
echo "--- MIETER APP (src/hooks/useSubscription.ts) ---"
echo "basic:"
echo "  price_id_monthly: '$MIETER_BASIC_MONTHLY'"
echo "  price_id_yearly:  '$MIETER_BASIC_YEARLY'"
echo "pro:"
echo "  price_id_monthly: '$MIETER_PRO_MONTHLY'"
echo "  price_id_yearly:  '$MIETER_PRO_YEARLY'"
echo ""
echo "--- HAUSMEISTERPRO (src/config/pricing.ts) ---"
echo "enterprise:"
echo "  priceIdMonthly: '$HMP_ENTERPRISE_MONTHLY'"
echo "  priceIdYearly:  '$HMP_ENTERPRISE_YEARLY'"
echo ""
echo "--- ABLESUNG ---"
echo "enterprise:"
echo "  priceIdMonthly: '$ABL_ENTERPRISE_MONTHLY'"
echo "  priceIdYearly:  '$ABL_ENTERPRISE_YEARLY'"
echo ""
echo "========================================================================"
echo "Fertig! Bitte die IDs in die jeweiligen Config-Dateien eintragen."
echo "========================================================================"
