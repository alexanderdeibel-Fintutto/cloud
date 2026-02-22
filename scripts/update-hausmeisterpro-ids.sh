#!/bin/bash
# ============================================================================
# Update hausmeisterPro/src/config/pricing.ts with yearly price IDs
#
# Adds yearlyPriceId to Starter and Pro, and updates Enterprise priceId
#
# Usage: ./scripts/update-hausmeisterpro-ids.sh [PRO_YEARLY_PRICE_ID]
#
# If P2 script failed for Pro, pass the ID manually after creating it:
#   STRIPE_SECRET_KEY=sk_live_xxx ./scripts/update-hausmeisterpro-ids.sh
# ============================================================================

set -e

FILE="$HOME/hausmeisterPro/src/config/pricing.ts"
HMP_STARTER_YEARLY="price_1T3lo152lqSgjCzeqQ5ZnvXc"
HMP_ENTERPRISE_MONTHLY="price_1T0nb452lqSgjCzeKfvkna7n"
HMP_ENTERPRISE_YEARLY="price_1T0nb552lqSgjCzelBBrkq6c"

# Check if Pro yearly ID was provided or needs to be created
HMP_PRO_YEARLY="${1:-}"

if [ ! -f "$FILE" ]; then
  echo "ERROR: $FILE not found"
  exit 1
fi

if [ -z "$HMP_PRO_YEARLY" ]; then
  echo "HausmeisterPro Pro yearly price ID not provided."
  echo ""
  if [ -n "${STRIPE_SECRET_KEY:-}" ]; then
    echo "Creating HausmeisterPro Pro yearly price in Stripe..."
    # Look up the product for the existing monthly price
    PROD_ID=$(curl -s "https://api.stripe.com/v1/prices/price_1St3FA52lqSgjCzeE8lXHzKH" \
      -u "$STRIPE_SECRET_KEY:" | grep -o '"product": "prod_[^"]*"' | head -1 | cut -d'"' -f4)

    if [ -z "$PROD_ID" ]; then
      echo "Could not find product. Creating new product..."
      PROD_ID=$(curl -s https://api.stripe.com/v1/products \
        -u "$STRIPE_SECRET_KEY:" \
        -d "name=HausmeisterPro - Pro" \
        -d "description=Unbegrenzte Gebaeude, Dokumenten-Management, Berichterstellung" | \
        grep -o '"id": "prod_[^"]*"' | head -1 | cut -d'"' -f4)
    fi
    echo "  Product: $PROD_ID"

    HMP_PRO_YEARLY=$(curl -s https://api.stripe.com/v1/prices \
      -u "$STRIPE_SECRET_KEY:" \
      -d "product=$PROD_ID" \
      -d "unit_amount=23990" \
      -d "currency=eur" \
      -d "recurring[interval]=year" \
      -d "nickname=HMP Pro Jaehrlich" | \
      grep -o '"id": "price_[^"]*"' | head -1 | cut -d'"' -f4)
    echo "  Pro Yearly: $HMP_PRO_YEARLY"
  else
    echo "Provide STRIPE_SECRET_KEY to create it automatically:"
    echo "  STRIPE_SECRET_KEY=sk_live_xxx ./scripts/update-hausmeisterpro-ids.sh"
    echo ""
    echo "Or pass the price ID manually:"
    echo "  ./scripts/update-hausmeisterpro-ids.sh price_1Txxxxxx"
    exit 1
  fi
fi

echo ""
echo "Updating $FILE with:"
echo "  Starter yearly: $HMP_STARTER_YEARLY"
echo "  Pro yearly: $HMP_PRO_YEARLY"
echo "  Enterprise monthly: $HMP_ENTERPRISE_MONTHLY"
echo "  Enterprise yearly: $HMP_ENTERPRISE_YEARLY"
echo ""

# Use Python for reliable multi-line file editing (works on macOS)
python3 << PYEOF
import re

with open('$FILE', 'r') as f:
    content = f.read()

# Add yearlyPriceId after Starter's priceId
content = content.replace(
    "priceId: 'price_1St3Eg52lqSgjCze5l6pqANG',",
    "priceId: 'price_1St3Eg52lqSgjCze5l6pqANG',\n    priceIdYearly: '$HMP_STARTER_YEARLY',"
)

# Add yearlyPriceId after Pro's priceId
content = content.replace(
    "priceId: 'price_1St3FA52lqSgjCzeE8lXHzKH',",
    "priceId: 'price_1St3FA52lqSgjCzeE8lXHzKH',\n    priceIdYearly: '$HMP_PRO_YEARLY',"
)

# Update Enterprise priceId (currently empty from patch)
content = content.replace(
    "priceId: '', // TODO: Replace after running create-all-stripe-products.sh",
    "priceId: '$HMP_ENTERPRISE_MONTHLY',\n    priceIdYearly: '$HMP_ENTERPRISE_YEARLY',"
)

with open('$FILE', 'w') as f:
    f.write(content)

print('File updated successfully!')
PYEOF

echo ""
echo "Verify changes:"
echo "  cd ~/hausmeisterPro && git diff"
echo ""
echo "Then commit and push:"
echo "  cd ~/hausmeisterPro && git add -A && git commit -m 'Add yearly Stripe price IDs for all tiers' && git push origin main"
