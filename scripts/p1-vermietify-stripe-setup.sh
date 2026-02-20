#!/bin/bash
# ============================================================================
# P1: Create Vermietify Stripe Products & Prices
#
# Vermietify (vermieter-freude) has placeholder product IDs (prod_starter etc.)
# and no yearly prices in Stripe. This script creates everything needed.
#
# Usage: STRIPE_SECRET_KEY=sk_live_xxx ./scripts/p1-vermietify-stripe-setup.sh
#
# After running, update vermieter-freude/src/config/plans.ts with the output IDs
# ============================================================================

set -euo pipefail

if [ -z "${STRIPE_SECRET_KEY:-}" ]; then
  echo "Error: STRIPE_SECRET_KEY environment variable is required"
  echo "Usage: STRIPE_SECRET_KEY=sk_live_xxx ./scripts/p1-vermietify-stripe-setup.sh"
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
  echo "$response" | grep -o '"id": "prod_[^"]*"' | head -1 | cut -d'"' -f4
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
  echo "$response" | grep -o '"id": "price_[^"]*"' | head -1 | cut -d'"' -f4
}

echo "=============================================="
echo "  Vermietify - Stripe Product Setup"
echo "=============================================="
echo ""

# Note: Starter is free, but we still create a product for tracking
echo "1/4 Creating Vermietify Starter (Free)..."
STARTER_PROD=$(create_product "Vermietify - Starter" "Kostenlos: 1 Immobilie, 5 Einheiten, Basisfunktionen")
echo "  Product: $STARTER_PROD"
echo ""

echo "2/4 Creating Vermietify Basic (9.99/mo, 95.90/yr)..."
BASIC_PROD=$(create_product "Vermietify - Basic" "3 Immobilien, 25 Einheiten, Alle Formulare, Mietermanagement, E-Mail-Support")
BASIC_MONTHLY=$(create_price "$BASIC_PROD" 999 "month" "Vermietify Basic Monatlich")
BASIC_YEARLY=$(create_price "$BASIC_PROD" 9590 "year" "Vermietify Basic Jaehrlich")
echo "  Product: $BASIC_PROD"
echo "  Monthly: $BASIC_MONTHLY"
echo "  Yearly:  $BASIC_YEARLY"
echo ""

echo "3/4 Creating Vermietify Pro (24.99/mo, 239.90/yr)..."
PRO_PROD=$(create_product "Vermietify - Pro" "10 Immobilien, 100 Einheiten, KI-Assistent, Automatisierungen, Prioritaets-Support")
PRO_MONTHLY=$(create_price "$PRO_PROD" 2499 "month" "Vermietify Pro Monatlich")
PRO_YEARLY=$(create_price "$PRO_PROD" 23990 "year" "Vermietify Pro Jaehrlich")
echo "  Product: $PRO_PROD"
echo "  Monthly: $PRO_MONTHLY"
echo "  Yearly:  $PRO_YEARLY"
echo ""

echo "4/4 Creating Vermietify Enterprise (49.99/mo, 479.90/yr)..."
ENT_PROD=$(create_product "Vermietify - Enterprise" "Unbegrenzte Immobilien, White-Label, API-Zugang, Dedizierter Account-Manager")
ENT_MONTHLY=$(create_price "$ENT_PROD" 4999 "month" "Vermietify Enterprise Monatlich")
ENT_YEARLY=$(create_price "$ENT_PROD" 47990 "year" "Vermietify Enterprise Jaehrlich")
echo "  Product: $ENT_PROD"
echo "  Monthly: $ENT_MONTHLY"
echo "  Yearly:  $ENT_YEARLY"
echo ""

echo "=============================================="
echo "  DONE! Update vermieter-freude/src/config/plans.ts:"
echo "=============================================="
echo ""
echo "Starter:"
echo "  productId: '$STARTER_PROD'"
echo "  priceId: 'price_1Sr55p52lqSgjCzeX6tlI5tv'  (existing)"
echo "  priceIdYearly: ''"
echo ""
echo "Basic:"
echo "  productId: '$BASIC_PROD'"
echo "  priceId: '$BASIC_MONTHLY'  (or keep existing: price_1Sr56K52lqSgjCzeqfCfOudX)"
echo "  priceIdYearly: '$BASIC_YEARLY'"
echo ""
echo "Pro:"
echo "  productId: '$PRO_PROD'"
echo "  priceId: '$PRO_MONTHLY'  (or keep existing: price_1Sr56o52lqSgjCzeRuGrant2)"
echo "  priceIdYearly: '$PRO_YEARLY'"
echo ""
echo "Enterprise:"
echo "  productId: '$ENT_PROD'"
echo "  priceId: '$ENT_MONTHLY'  (or keep existing: price_1Sr57E52lqSgjCze3iHixnBn)"
echo "  priceIdYearly: '$ENT_YEARLY'"
echo ""
echo "NOTE: If you already have working monthly prices (price_1Sr5...), keep them."
echo "Only the yearly prices and product IDs need updating."
