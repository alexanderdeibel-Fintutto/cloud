#!/bin/bash
# ============================================================================
# Update vermieter-freude/src/config/plans.ts with real Stripe IDs
#
# Run from anywhere: ./scripts/update-vermietify-ids.sh
# ============================================================================

set -e

FILE="$HOME/vermieter-freude/src/config/plans.ts"

if [ ! -f "$FILE" ]; then
  echo "ERROR: $FILE not found"
  echo "Make sure vermieter-freude is cloned in your home directory"
  exit 1
fi

echo "Updating Vermietify Stripe IDs in $FILE..."

# Starter: Replace placeholder productId
sed -i.bak "s/productId: 'prod_starter',.*$/productId: 'prod_U1pSvWAWU4c4u1',/" "$FILE"

# Basic: Replace placeholder productId and add yearly price ID
sed -i.bak "s/productId: 'prod_basic',.*$/productId: 'prod_U1pS7uyPmAaErv',/" "$FILE"
sed -i.bak "/priceId: 'price_1Sr56K52lqSgjCzeqfCfOudX',/{n;s/priceIdYearly: '',.*$/priceIdYearly: 'price_1T3lny52lqSgjCzeANoPBYXE',/;}" "$FILE"

# Pro: Replace placeholder productId and add yearly price ID
sed -i.bak "s/productId: 'prod_pro',.*$/productId: 'prod_U1pSTln7VA6dSc',/" "$FILE"
sed -i.bak "/priceId: 'price_1Sr56o52lqSgjCzeRuGrant2',/{n;s/priceIdYearly: '',.*$/priceIdYearly: 'price_1T3lnz52lqSgjCzefUw85zKP',/;}" "$FILE"

# Enterprise: Replace placeholder productId and add yearly price ID
sed -i.bak "s/productId: 'prod_enterprise',.*$/productId: 'prod_U1pS1kAOQoBl5l',/" "$FILE"
sed -i.bak "/priceId: 'price_1Sr57E52lqSgjCze3iHixnBn',/{n;s/priceIdYearly: '',.*$/priceIdYearly: 'price_1T3lo052lqSgjCzepxt8D08u',/;}" "$FILE"

# Clean up backup files
rm -f "${FILE}.bak"

echo "Done! Verify changes:"
echo "  cd ~/vermieter-freude && git diff"
echo ""
echo "Then commit and push:"
echo "  cd ~/vermieter-freude && git add -A && git commit -m 'Add real Stripe Product IDs and yearly prices' && git push origin main"
