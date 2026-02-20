#!/bin/bash
# ============================================================================
# P2: Create remaining yearly Stripe prices
#
# HausmeisterPro Starter and Pro have monthly prices but no yearly in Stripe.
# This script creates the missing yearly prices.
#
# Usage: STRIPE_SECRET_KEY=sk_live_xxx ./scripts/p2-remaining-stripe-prices.sh
# ============================================================================

set -euo pipefail

if [ -z "${STRIPE_SECRET_KEY:-}" ]; then
  echo "Error: STRIPE_SECRET_KEY environment variable is required"
  echo "Usage: STRIPE_SECRET_KEY=sk_live_xxx ./scripts/p2-remaining-stripe-prices.sh"
  exit 1
fi

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
    echo "ERROR creating price '$nickname'" >&2
    echo "Response: $response" >&2
    echo "FAILED"
    return 1
  fi
  echo "$price_id"
}

# First, find the product IDs for HausmeisterPro Starter and Pro
# by looking up existing monthly prices
find_product_for_price() {
  local price_id="$1"
  local response
  response=$(curl -s "https://api.stripe.com/v1/prices/$price_id" \
    -u "$STRIPE_SECRET_KEY:")
  echo "$response" | grep -o '"product": "prod_[^"]*"' | head -1 | cut -d'"' -f4
}

echo "=============================================="
echo "  P2: Create Missing Yearly Stripe Prices"
echo "=============================================="
echo ""

# --- HausmeisterPro Starter ---
echo "1/2 HausmeisterPro Starter yearly (95.90/yr)..."
echo "  Looking up product ID from monthly price price_1St3Eg52lqSgjCze5l6pqANG..."
HMP_STARTER_PROD=$(find_product_for_price "price_1St3Eg52lqSgjCze5l6pqANG")
if [ -z "$HMP_STARTER_PROD" ] || [ "$HMP_STARTER_PROD" = "FAILED" ]; then
  echo "  ERROR: Could not find product for Starter. Creating new product..."
  HMP_STARTER_PROD=$(curl -s https://api.stripe.com/v1/products \
    -u "$STRIPE_SECRET_KEY:" \
    -d "name=HausmeisterPro - Starter" \
    -d "description=Bis zu 10 Gebaeude, Erweiterte Aufgabenverwaltung" | \
    grep -o '"id": "prod_[^"]*"' | head -1 | cut -d'"' -f4)
fi
echo "  Product: $HMP_STARTER_PROD"
HMP_STARTER_YEARLY=$(create_price "$HMP_STARTER_PROD" 9590 "year" "HMP Starter Jaehrlich")
echo "  Yearly: $HMP_STARTER_YEARLY"
echo ""

# --- HausmeisterPro Pro ---
echo "2/2 HausmeisterPro Pro yearly (239.90/yr)..."
echo "  Looking up product ID from monthly price price_1St3FA52lqSgjCzeE8lXHzKH..."
HMP_PRO_PROD=$(find_product_for_price "price_1St3FA52lqSgjCzeE8lXHzKH")
if [ -z "$HMP_PRO_PROD" ] || [ "$HMP_PRO_PROD" = "FAILED" ]; then
  echo "  ERROR: Could not find product for Pro. Creating new product..."
  HMP_PRO_PROD=$(curl -s https://api.stripe.com/v1/products \
    -u "$STRIPE_SECRET_KEY:" \
    -d "name=HausmeisterPro - Pro" \
    -d "description=Unbegrenzte Gebaeude, Dokumenten-Management, Berichterstellung" | \
    grep -o '"id": "prod_[^"]*"' | head -1 | cut -d'"' -f4)
fi
echo "  Product: $HMP_PRO_PROD"
HMP_PRO_YEARLY=$(create_price "$HMP_PRO_PROD" 23990 "year" "HMP Pro Jaehrlich")
echo "  Yearly: $HMP_PRO_YEARLY"
echo ""

echo "=============================================="
echo "  DONE! Update hausmeisterPro/src/config/pricing.ts:"
echo "=============================================="
echo ""
echo "Starter:"
echo "  priceIdMonthly: 'price_1St3Eg52lqSgjCze5l6pqANG' (existing)"
echo "  priceIdYearly: '$HMP_STARTER_YEARLY'"
echo ""
echo "Pro:"
echo "  priceIdMonthly: 'price_1St3FA52lqSgjCzeE8lXHzKH' (existing)"
echo "  priceIdYearly: '$HMP_PRO_YEARLY'"
echo ""
echo "Also apply the Ablesung DB migration:"
echo "  cd ~/ablesung"
echo "  supabase db push"
echo "  (migration: supabase/migrations/20260212120000_fix_product_prices.sql)"
