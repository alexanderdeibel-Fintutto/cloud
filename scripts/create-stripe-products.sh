#!/bin/bash

# Stripe Products & Prices Setup Script for Mieter-Checker
# Run this script locally to create all products and prices in Stripe
#
# Usage: STRIPE_SECRET_KEY=sk_live_xxx ./scripts/create-stripe-products.sh

if [ -z "$STRIPE_SECRET_KEY" ]; then
  echo "Error: STRIPE_SECRET_KEY environment variable is required"
  echo "Usage: STRIPE_SECRET_KEY=sk_live_xxx ./scripts/create-stripe-products.sh"
  exit 1
fi

echo "Creating Mieter-Checker products in Stripe..."
echo ""

# Create Basis Product
echo "1. Creating Basis product..."
BASIC_PRODUCT=$(curl -s https://api.stripe.com/v1/products \
  -u "$STRIPE_SECRET_KEY:" \
  -d "name=Mieter-Checker Basis" \
  -d "description=3 Berechnungen pro Monat mit Speichern und Bearbeiten")

BASIC_PRODUCT_ID=$(echo $BASIC_PRODUCT | grep -o '"id": "prod_[^"]*"' | head -1 | cut -d'"' -f4)
echo "   Product ID: $BASIC_PRODUCT_ID"

# Create Basis Monthly Price (0.99 EUR)
echo "   Creating monthly price (0.99 EUR)..."
BASIC_MONTHLY=$(curl -s https://api.stripe.com/v1/prices \
  -u "$STRIPE_SECRET_KEY:" \
  -d "product=$BASIC_PRODUCT_ID" \
  -d "unit_amount=99" \
  -d "currency=eur" \
  -d "recurring[interval]=month" \
  -d "nickname=Basis Monatlich")

BASIC_MONTHLY_ID=$(echo $BASIC_MONTHLY | grep -o '"id": "price_[^"]*"' | head -1 | cut -d'"' -f4)
echo "   Monthly Price ID: $BASIC_MONTHLY_ID"

# Create Basis Yearly Price (9.99 EUR)
echo "   Creating yearly price (9.99 EUR)..."
BASIC_YEARLY=$(curl -s https://api.stripe.com/v1/prices \
  -u "$STRIPE_SECRET_KEY:" \
  -d "product=$BASIC_PRODUCT_ID" \
  -d "unit_amount=999" \
  -d "currency=eur" \
  -d "recurring[interval]=year" \
  -d "nickname=Basis Jaehrlich")

BASIC_YEARLY_ID=$(echo $BASIC_YEARLY | grep -o '"id": "price_[^"]*"' | head -1 | cut -d'"' -f4)
echo "   Yearly Price ID: $BASIC_YEARLY_ID"

echo ""

# Create Premium Product
echo "2. Creating Premium product..."
PREMIUM_PRODUCT=$(curl -s https://api.stripe.com/v1/products \
  -u "$STRIPE_SECRET_KEY:" \
  -d "name=Mieter-Checker Premium" \
  -d "description=Unbegrenzte Berechnungen mit allen Features")

PREMIUM_PRODUCT_ID=$(echo $PREMIUM_PRODUCT | grep -o '"id": "prod_[^"]*"' | head -1 | cut -d'"' -f4)
echo "   Product ID: $PREMIUM_PRODUCT_ID"

# Create Premium Monthly Price (3.99 EUR)
echo "   Creating monthly price (3.99 EUR)..."
PREMIUM_MONTHLY=$(curl -s https://api.stripe.com/v1/prices \
  -u "$STRIPE_SECRET_KEY:" \
  -d "product=$PREMIUM_PRODUCT_ID" \
  -d "unit_amount=399" \
  -d "currency=eur" \
  -d "recurring[interval]=month" \
  -d "nickname=Premium Monatlich")

PREMIUM_MONTHLY_ID=$(echo $PREMIUM_MONTHLY | grep -o '"id": "price_[^"]*"' | head -1 | cut -d'"' -f4)
echo "   Monthly Price ID: $PREMIUM_MONTHLY_ID"

# Create Premium Yearly Price (39.99 EUR)
echo "   Creating yearly price (39.99 EUR)..."
PREMIUM_YEARLY=$(curl -s https://api.stripe.com/v1/prices \
  -u "$STRIPE_SECRET_KEY:" \
  -d "product=$PREMIUM_PRODUCT_ID" \
  -d "unit_amount=3999" \
  -d "currency=eur" \
  -d "recurring[interval]=year" \
  -d "nickname=Premium Jaehrlich")

PREMIUM_YEARLY_ID=$(echo $PREMIUM_YEARLY | grep -o '"id": "price_[^"]*"' | head -1 | cut -d'"' -f4)
echo "   Yearly Price ID: $PREMIUM_YEARLY_ID"

echo ""
echo "========================================"
echo "Done! Update src/lib/stripe.ts with:"
echo "========================================"
echo ""
echo "Basis:"
echo "  monthlyPriceId: '$BASIC_MONTHLY_ID'"
echo "  yearlyPriceId: '$BASIC_YEARLY_ID'"
echo ""
echo "Premium:"
echo "  monthlyPriceId: '$PREMIUM_MONTHLY_ID'"
echo "  yearlyPriceId: '$PREMIUM_YEARLY_ID'"
echo ""
