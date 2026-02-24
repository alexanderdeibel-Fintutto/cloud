#!/bin/bash

# ==============================================================================
# Fintutto Stripe Products & Prices Setup Script
# Creates ALL products and prices for Portal + Vermietify in Stripe LIVE mode
#
# Usage:
#   STRIPE_SECRET_KEY=sk_live_xxx ./scripts/create-stripe-products.sh
#
# This script creates:
#   1. Portal Plans (credits-based): Mieter, Vermieter, Kombi Pro, Unlimited
#   2. Vermietify Plans: Basic, Pro, Enterprise
#
# After running, copy the outputted environment variables to your
# Vercel project settings (or .env.local for development).
# ==============================================================================

set -e

if [ -z "$STRIPE_SECRET_KEY" ]; then
  echo "Error: STRIPE_SECRET_KEY environment variable is required"
  echo ""
  echo "Usage:"
  echo "  STRIPE_SECRET_KEY=sk_live_xxx ./scripts/create-stripe-products.sh"
  echo ""
  echo "For test mode:"
  echo "  STRIPE_SECRET_KEY=sk_test_xxx ./scripts/create-stripe-products.sh"
  exit 1
fi

# Detect if using test or live key
if [[ "$STRIPE_SECRET_KEY" == sk_test_* ]]; then
  echo "WARNING: Using TEST mode key. Products will be created in test mode."
  echo ""
fi

echo "========================================"
echo "Fintutto Stripe Setup"
echo "========================================"
echo ""

# ==============================================================================
# 1. PORTAL - Mieter Plan (4.99 EUR/month, 47.90 EUR/year)
# ==============================================================================
echo "1/7 Creating Portal Mieter product..."
MIETER_PRODUCT=$(curl -s https://api.stripe.com/v1/products \
  -u "$STRIPE_SECRET_KEY:" \
  -d "name=Fintutto Portal - Mieter" \
  -d "description=15 Credits/Monat, alle Mieter-Checker & Formulare, PDF-Export, 10 KI-Nachrichten")

MIETER_PRODUCT_ID=$(echo $MIETER_PRODUCT | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null || echo "ERROR")
echo "   Product: $MIETER_PRODUCT_ID"

MIETER_MONTHLY=$(curl -s https://api.stripe.com/v1/prices \
  -u "$STRIPE_SECRET_KEY:" \
  -d "product=$MIETER_PRODUCT_ID" \
  -d "unit_amount=499" \
  -d "currency=eur" \
  -d "recurring[interval]=month" \
  -d "nickname=Portal Mieter Monatlich")
MIETER_MONTHLY_ID=$(echo $MIETER_MONTHLY | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null || echo "ERROR")
echo "   Monthly: $MIETER_MONTHLY_ID (4.99 EUR)"

MIETER_YEARLY=$(curl -s https://api.stripe.com/v1/prices \
  -u "$STRIPE_SECRET_KEY:" \
  -d "product=$MIETER_PRODUCT_ID" \
  -d "unit_amount=4790" \
  -d "currency=eur" \
  -d "recurring[interval]=year" \
  -d "nickname=Portal Mieter Jaehrlich")
MIETER_YEARLY_ID=$(echo $MIETER_YEARLY | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null || echo "ERROR")
echo "   Yearly:  $MIETER_YEARLY_ID (47.90 EUR)"
echo ""

# ==============================================================================
# 2. PORTAL - Vermieter Plan (7.99 EUR/month, 76.70 EUR/year)
# ==============================================================================
echo "2/7 Creating Portal Vermieter product..."
VERMIETER_PRODUCT=$(curl -s https://api.stripe.com/v1/products \
  -u "$STRIPE_SECRET_KEY:" \
  -d "name=Fintutto Portal - Vermieter" \
  -d "description=20 Credits/Monat, alle Vermieter-Rechner & Formulare, PDF-Export, 20 KI-Nachrichten")

VERMIETER_PRODUCT_ID=$(echo $VERMIETER_PRODUCT | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null || echo "ERROR")
echo "   Product: $VERMIETER_PRODUCT_ID"

VERMIETER_MONTHLY=$(curl -s https://api.stripe.com/v1/prices \
  -u "$STRIPE_SECRET_KEY:" \
  -d "product=$VERMIETER_PRODUCT_ID" \
  -d "unit_amount=799" \
  -d "currency=eur" \
  -d "recurring[interval]=month" \
  -d "nickname=Portal Vermieter Monatlich")
VERMIETER_MONTHLY_ID=$(echo $VERMIETER_MONTHLY | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null || echo "ERROR")
echo "   Monthly: $VERMIETER_MONTHLY_ID (7.99 EUR)"

VERMIETER_YEARLY=$(curl -s https://api.stripe.com/v1/prices \
  -u "$STRIPE_SECRET_KEY:" \
  -d "product=$VERMIETER_PRODUCT_ID" \
  -d "unit_amount=7670" \
  -d "currency=eur" \
  -d "recurring[interval]=year" \
  -d "nickname=Portal Vermieter Jaehrlich")
VERMIETER_YEARLY_ID=$(echo $VERMIETER_YEARLY | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null || echo "ERROR")
echo "   Yearly:  $VERMIETER_YEARLY_ID (76.70 EUR)"
echo ""

# ==============================================================================
# 3. PORTAL - Kombi Pro Plan (11.99 EUR/month, 115.10 EUR/year)
# ==============================================================================
echo "3/7 Creating Portal Kombi Pro product..."
KOMBI_PRODUCT=$(curl -s https://api.stripe.com/v1/products \
  -u "$STRIPE_SECRET_KEY:" \
  -d "name=Fintutto Portal - Kombi Pro" \
  -d "description=50 Credits/Monat, alle Checker + Rechner + Formulare, PDF-Export, 50 KI-Nachrichten")

KOMBI_PRODUCT_ID=$(echo $KOMBI_PRODUCT | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null || echo "ERROR")
echo "   Product: $KOMBI_PRODUCT_ID"

KOMBI_MONTHLY=$(curl -s https://api.stripe.com/v1/prices \
  -u "$STRIPE_SECRET_KEY:" \
  -d "product=$KOMBI_PRODUCT_ID" \
  -d "unit_amount=1199" \
  -d "currency=eur" \
  -d "recurring[interval]=month" \
  -d "nickname=Portal Kombi Pro Monatlich")
KOMBI_MONTHLY_ID=$(echo $KOMBI_MONTHLY | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null || echo "ERROR")
echo "   Monthly: $KOMBI_MONTHLY_ID (11.99 EUR)"

KOMBI_YEARLY=$(curl -s https://api.stripe.com/v1/prices \
  -u "$STRIPE_SECRET_KEY:" \
  -d "product=$KOMBI_PRODUCT_ID" \
  -d "unit_amount=11510" \
  -d "currency=eur" \
  -d "recurring[interval]=year" \
  -d "nickname=Portal Kombi Pro Jaehrlich")
KOMBI_YEARLY_ID=$(echo $KOMBI_YEARLY | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null || echo "ERROR")
echo "   Yearly:  $KOMBI_YEARLY_ID (115.10 EUR)"
echo ""

# ==============================================================================
# 4. PORTAL - Unlimited Plan (19.99 EUR/month, 191.90 EUR/year)
# ==============================================================================
echo "4/7 Creating Portal Unlimited product..."
UNLIMITED_PRODUCT=$(curl -s https://api.stripe.com/v1/products \
  -u "$STRIPE_SECRET_KEY:" \
  -d "name=Fintutto Portal - Unlimited" \
  -d "description=Unbegrenzte Credits, alle Features, unbegrenzt KI-Nachrichten")

UNLIMITED_PRODUCT_ID=$(echo $UNLIMITED_PRODUCT | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null || echo "ERROR")
echo "   Product: $UNLIMITED_PRODUCT_ID"

UNLIMITED_MONTHLY=$(curl -s https://api.stripe.com/v1/prices \
  -u "$STRIPE_SECRET_KEY:" \
  -d "product=$UNLIMITED_PRODUCT_ID" \
  -d "unit_amount=1999" \
  -d "currency=eur" \
  -d "recurring[interval]=month" \
  -d "nickname=Portal Unlimited Monatlich")
UNLIMITED_MONTHLY_ID=$(echo $UNLIMITED_MONTHLY | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null || echo "ERROR")
echo "   Monthly: $UNLIMITED_MONTHLY_ID (19.99 EUR)"

UNLIMITED_YEARLY=$(curl -s https://api.stripe.com/v1/prices \
  -u "$STRIPE_SECRET_KEY:" \
  -d "product=$UNLIMITED_PRODUCT_ID" \
  -d "unit_amount=19190" \
  -d "currency=eur" \
  -d "recurring[interval]=year" \
  -d "nickname=Portal Unlimited Jaehrlich")
UNLIMITED_YEARLY_ID=$(echo $UNLIMITED_YEARLY | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null || echo "ERROR")
echo "   Yearly:  $UNLIMITED_YEARLY_ID (191.90 EUR)"
echo ""

# ==============================================================================
# 5. VERMIETIFY - Basic Plan (9.99 EUR/month, 95.90 EUR/year)
# ==============================================================================
echo "5/7 Creating Vermietify Basic product..."
VF_BASIC_PRODUCT=$(curl -s https://api.stripe.com/v1/products \
  -u "$STRIPE_SECRET_KEY:" \
  -d "name=Vermietify - Basic" \
  -d "description=3 Immobilien, 25 Einheiten, alle Dashboards, 10 Portal-Credits")

VF_BASIC_PRODUCT_ID=$(echo $VF_BASIC_PRODUCT | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null || echo "ERROR")
echo "   Product: $VF_BASIC_PRODUCT_ID"

VF_BASIC_MONTHLY=$(curl -s https://api.stripe.com/v1/prices \
  -u "$STRIPE_SECRET_KEY:" \
  -d "product=$VF_BASIC_PRODUCT_ID" \
  -d "unit_amount=999" \
  -d "currency=eur" \
  -d "recurring[interval]=month" \
  -d "nickname=Vermietify Basic Monatlich")
VF_BASIC_MONTHLY_ID=$(echo $VF_BASIC_MONTHLY | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null || echo "ERROR")
echo "   Monthly: $VF_BASIC_MONTHLY_ID (9.99 EUR)"

VF_BASIC_YEARLY=$(curl -s https://api.stripe.com/v1/prices \
  -u "$STRIPE_SECRET_KEY:" \
  -d "product=$VF_BASIC_PRODUCT_ID" \
  -d "unit_amount=9590" \
  -d "currency=eur" \
  -d "recurring[interval]=year" \
  -d "nickname=Vermietify Basic Jaehrlich")
VF_BASIC_YEARLY_ID=$(echo $VF_BASIC_YEARLY | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null || echo "ERROR")
echo "   Yearly:  $VF_BASIC_YEARLY_ID (95.90 EUR)"
echo ""

# ==============================================================================
# 6. VERMIETIFY - Pro Plan (24.99 EUR/month, 239.90 EUR/year)
# ==============================================================================
echo "6/7 Creating Vermietify Pro product..."
VF_PRO_PRODUCT=$(curl -s https://api.stripe.com/v1/products \
  -u "$STRIPE_SECRET_KEY:" \
  -d "name=Vermietify - Pro" \
  -d "description=10 Immobilien, 100 Einheiten, Nebenkostenabrechnung, 30 Portal-Credits")

VF_PRO_PRODUCT_ID=$(echo $VF_PRO_PRODUCT | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null || echo "ERROR")
echo "   Product: $VF_PRO_PRODUCT_ID"

VF_PRO_MONTHLY=$(curl -s https://api.stripe.com/v1/prices \
  -u "$STRIPE_SECRET_KEY:" \
  -d "product=$VF_PRO_PRODUCT_ID" \
  -d "unit_amount=2499" \
  -d "currency=eur" \
  -d "recurring[interval]=month" \
  -d "nickname=Vermietify Pro Monatlich")
VF_PRO_MONTHLY_ID=$(echo $VF_PRO_MONTHLY | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null || echo "ERROR")
echo "   Monthly: $VF_PRO_MONTHLY_ID (24.99 EUR)"

VF_PRO_YEARLY=$(curl -s https://api.stripe.com/v1/prices \
  -u "$STRIPE_SECRET_KEY:" \
  -d "product=$VF_PRO_PRODUCT_ID" \
  -d "unit_amount=23990" \
  -d "currency=eur" \
  -d "recurring[interval]=year" \
  -d "nickname=Vermietify Pro Jaehrlich")
VF_PRO_YEARLY_ID=$(echo $VF_PRO_YEARLY | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null || echo "ERROR")
echo "   Yearly:  $VF_PRO_YEARLY_ID (239.90 EUR)"
echo ""

# ==============================================================================
# 7. VERMIETIFY - Enterprise Plan (49.99 EUR/month, 479.90 EUR/year)
# ==============================================================================
echo "7/7 Creating Vermietify Enterprise product..."
VF_ENTERPRISE_PRODUCT=$(curl -s https://api.stripe.com/v1/products \
  -u "$STRIPE_SECRET_KEY:" \
  -d "name=Vermietify - Enterprise" \
  -d "description=Unbegrenzte Immobilien & Einheiten, alle Features, API-Zugang")

VF_ENTERPRISE_PRODUCT_ID=$(echo $VF_ENTERPRISE_PRODUCT | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null || echo "ERROR")
echo "   Product: $VF_ENTERPRISE_PRODUCT_ID"

VF_ENTERPRISE_MONTHLY=$(curl -s https://api.stripe.com/v1/prices \
  -u "$STRIPE_SECRET_KEY:" \
  -d "product=$VF_ENTERPRISE_PRODUCT_ID" \
  -d "unit_amount=4999" \
  -d "currency=eur" \
  -d "recurring[interval]=month" \
  -d "nickname=Vermietify Enterprise Monatlich")
VF_ENTERPRISE_MONTHLY_ID=$(echo $VF_ENTERPRISE_MONTHLY | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null || echo "ERROR")
echo "   Monthly: $VF_ENTERPRISE_MONTHLY_ID (49.99 EUR)"

VF_ENTERPRISE_YEARLY=$(curl -s https://api.stripe.com/v1/prices \
  -u "$STRIPE_SECRET_KEY:" \
  -d "product=$VF_ENTERPRISE_PRODUCT_ID" \
  -d "unit_amount=47990" \
  -d "currency=eur" \
  -d "recurring[interval]=year" \
  -d "nickname=Vermietify Enterprise Jaehrlich")
VF_ENTERPRISE_YEARLY_ID=$(echo $VF_ENTERPRISE_YEARLY | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null || echo "ERROR")
echo "   Yearly:  $VF_ENTERPRISE_YEARLY_ID (479.90 EUR)"
echo ""

# ==============================================================================
# OUTPUT: Environment variables for Vercel
# ==============================================================================
echo "========================================"
echo "DONE! Copy these to Vercel Environment Variables:"
echo "========================================"
echo ""
echo "# Portal Stripe Price IDs"
echo "VITE_STRIPE_PRICE_MIETER_MONTHLY=$MIETER_MONTHLY_ID"
echo "VITE_STRIPE_PRICE_MIETER_YEARLY=$MIETER_YEARLY_ID"
echo "VITE_STRIPE_PRICE_VERMIETER_MONTHLY=$VERMIETER_MONTHLY_ID"
echo "VITE_STRIPE_PRICE_VERMIETER_YEARLY=$VERMIETER_YEARLY_ID"
echo "VITE_STRIPE_PRICE_KOMBI_MONTHLY=$KOMBI_MONTHLY_ID"
echo "VITE_STRIPE_PRICE_KOMBI_YEARLY=$KOMBI_YEARLY_ID"
echo "VITE_STRIPE_PRICE_UNLIMITED_MONTHLY=$UNLIMITED_MONTHLY_ID"
echo "VITE_STRIPE_PRICE_UNLIMITED_YEARLY=$UNLIMITED_YEARLY_ID"
echo ""
echo "# Vermietify Stripe Price IDs"
echo "VITE_STRIPE_PRICE_VERMIETIFY_BASIC_MONTHLY=$VF_BASIC_MONTHLY_ID"
echo "VITE_STRIPE_PRICE_VERMIETIFY_BASIC_YEARLY=$VF_BASIC_YEARLY_ID"
echo "VITE_STRIPE_PRICE_VERMIETIFY_PRO_MONTHLY=$VF_PRO_MONTHLY_ID"
echo "VITE_STRIPE_PRICE_VERMIETIFY_PRO_YEARLY=$VF_PRO_YEARLY_ID"
echo "VITE_STRIPE_PRICE_VERMIETIFY_ENTERPRISE_MONTHLY=$VF_ENTERPRISE_MONTHLY_ID"
echo "VITE_STRIPE_PRICE_VERMIETIFY_ENTERPRISE_YEARLY=$VF_ENTERPRISE_YEARLY_ID"
echo ""
echo "# Vermietify Stripe Product IDs"
echo "VITE_STRIPE_PRODUCT_VERMIETIFY_STARTER="
echo "VITE_STRIPE_PRODUCT_VERMIETIFY_BASIC=$VF_BASIC_PRODUCT_ID"
echo "VITE_STRIPE_PRODUCT_VERMIETIFY_PRO=$VF_PRO_PRODUCT_ID"
echo "VITE_STRIPE_PRODUCT_VERMIETIFY_ENTERPRISE=$VF_ENTERPRISE_PRODUCT_ID"
echo ""
