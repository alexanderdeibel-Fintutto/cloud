#!/bin/bash
# ============================================================
# FitTutto - Stripe Produkte & Preise Setup
# ============================================================
# Dieses Script erstellt 3 Produkte mit je 2 Preisen (monthly/yearly)
# und gibt die Vercel Env-Variablen zum Kopieren aus.
#
# Nutzung: bash scripts/setup-stripe-fittutto.sh sk_live_xxx
#   oder:  STRIPE_SECRET_KEY=sk_live_xxx bash scripts/setup-stripe-fittutto.sh
# ============================================================

STRIPE_KEY="${1:-$STRIPE_SECRET_KEY}"

if [ -z "$STRIPE_KEY" ]; then
  echo "❌ Bitte Stripe Key als Argument oder STRIPE_SECRET_KEY Env-Variable angeben!"
  echo "   Nutzung: bash scripts/setup-stripe-fittutto.sh sk_live_xxx"
  exit 1
fi

echo "🏋️ FitTutto Stripe Setup startet..."
echo ""

# ---- Produkt 1: Speichern & Laden ----
echo "📦 Erstelle Produkt: FitTutto Speichern & Laden..."
PRODUCT_SL=$(curl -s https://api.stripe.com/v1/products \
  -u "$STRIPE_KEY:" \
  -d "name=FitTutto Speichern & Laden" \
  -d "description=Speichere und lade deine Trainings- und Ernährungspläne" \
  -d "metadata[app]=fittutto" \
  -d "metadata[tier]=save_load")

PRODUCT_SL_ID=$(echo "$PRODUCT_SL" | grep -o '"id": "prod_[^"]*"' | head -1 | cut -d'"' -f4)
echo "   ✅ Produkt erstellt: $PRODUCT_SL_ID"

# Preise für Speichern & Laden
echo "   💰 Erstelle Monatspreis: €2,99..."
PRICE_SL_M=$(curl -s https://api.stripe.com/v1/prices \
  -u "$STRIPE_KEY:" \
  -d "product=$PRODUCT_SL_ID" \
  -d "unit_amount=299" \
  -d "currency=eur" \
  -d "recurring[interval]=month" \
  -d "metadata[tier]=save_load" \
  -d "metadata[interval]=monthly")

PRICE_SL_MONTHLY=$(echo "$PRICE_SL_M" | grep -o '"id": "price_[^"]*"' | head -1 | cut -d'"' -f4)
echo "   ✅ Monatspreis: $PRICE_SL_MONTHLY"

echo "   💰 Erstelle Jahrespreis: €28,70..."
PRICE_SL_Y=$(curl -s https://api.stripe.com/v1/prices \
  -u "$STRIPE_KEY:" \
  -d "product=$PRODUCT_SL_ID" \
  -d "unit_amount=2870" \
  -d "currency=eur" \
  -d "recurring[interval]=year" \
  -d "metadata[tier]=save_load" \
  -d "metadata[interval]=yearly")

PRICE_SL_YEARLY=$(echo "$PRICE_SL_Y" | grep -o '"id": "price_[^"]*"' | head -1 | cut -d'"' -f4)
echo "   ✅ Jahrespreis: $PRICE_SL_YEARLY"

echo ""

# ---- Produkt 2: Basic ----
echo "📦 Erstelle Produkt: FitTutto Basic..."
PRODUCT_BASIC=$(curl -s https://api.stripe.com/v1/products \
  -u "$STRIPE_KEY:" \
  -d "name=FitTutto Basic" \
  -d "description=Grundlegende Fitness-Funktionen mit Trainings- und Ernährungsplänen" \
  -d "metadata[app]=fittutto" \
  -d "metadata[tier]=basic")

PRODUCT_BASIC_ID=$(echo "$PRODUCT_BASIC" | grep -o '"id": "prod_[^"]*"' | head -1 | cut -d'"' -f4)
echo "   ✅ Produkt erstellt: $PRODUCT_BASIC_ID"

# Preise für Basic
echo "   💰 Erstelle Monatspreis: €4,99..."
PRICE_B_M=$(curl -s https://api.stripe.com/v1/prices \
  -u "$STRIPE_KEY:" \
  -d "product=$PRODUCT_BASIC_ID" \
  -d "unit_amount=499" \
  -d "currency=eur" \
  -d "recurring[interval]=month" \
  -d "metadata[tier]=basic" \
  -d "metadata[interval]=monthly")

PRICE_BASIC_MONTHLY=$(echo "$PRICE_B_M" | grep -o '"id": "price_[^"]*"' | head -1 | cut -d'"' -f4)
echo "   ✅ Monatspreis: $PRICE_BASIC_MONTHLY"

echo "   💰 Erstelle Jahrespreis: €47,90..."
PRICE_B_Y=$(curl -s https://api.stripe.com/v1/prices \
  -u "$STRIPE_KEY:" \
  -d "product=$PRODUCT_BASIC_ID" \
  -d "unit_amount=4790" \
  -d "currency=eur" \
  -d "recurring[interval]=year" \
  -d "metadata[tier]=basic" \
  -d "metadata[interval]=yearly")

PRICE_BASIC_YEARLY=$(echo "$PRICE_B_Y" | grep -o '"id": "price_[^"]*"' | head -1 | cut -d'"' -f4)
echo "   ✅ Jahrespreis: $PRICE_BASIC_YEARLY"

echo ""

# ---- Produkt 3: Premium ----
echo "📦 Erstelle Produkt: FitTutto Premium..."
PRODUCT_PREMIUM=$(curl -s https://api.stripe.com/v1/products \
  -u "$STRIPE_KEY:" \
  -d "name=FitTutto Premium" \
  -d "description=Alle Premium-Funktionen inkl. KI-Coaching und erweiterte Analysen" \
  -d "metadata[app]=fittutto" \
  -d "metadata[tier]=premium")

PRODUCT_PREMIUM_ID=$(echo "$PRODUCT_PREMIUM" | grep -o '"id": "prod_[^"]*"' | head -1 | cut -d'"' -f4)
echo "   ✅ Produkt erstellt: $PRODUCT_PREMIUM_ID"

# Preise für Premium
echo "   💰 Erstelle Monatspreis: €9,99..."
PRICE_P_M=$(curl -s https://api.stripe.com/v1/prices \
  -u "$STRIPE_KEY:" \
  -d "product=$PRODUCT_PREMIUM_ID" \
  -d "unit_amount=999" \
  -d "currency=eur" \
  -d "recurring[interval]=month" \
  -d "metadata[tier]=premium" \
  -d "metadata[interval]=monthly")

PRICE_PREMIUM_MONTHLY=$(echo "$PRICE_P_M" | grep -o '"id": "price_[^"]*"' | head -1 | cut -d'"' -f4)
echo "   ✅ Monatspreis: $PRICE_PREMIUM_MONTHLY"

echo "   💰 Erstelle Jahrespreis: €95,90..."
PRICE_P_Y=$(curl -s https://api.stripe.com/v1/prices \
  -u "$STRIPE_KEY:" \
  -d "product=$PRODUCT_PREMIUM_ID" \
  -d "unit_amount=9590" \
  -d "currency=eur" \
  -d "recurring[interval]=year" \
  -d "metadata[tier]=premium" \
  -d "metadata[interval]=yearly")

PRICE_PREMIUM_YEARLY=$(echo "$PRICE_P_Y" | grep -o '"id": "price_[^"]*"' | head -1 | cut -d'"' -f4)
echo "   ✅ Jahrespreis: $PRICE_PREMIUM_YEARLY"

echo ""
echo "============================================================"
echo "🎉 FERTIG! Alle 3 Produkte mit 6 Preisen erstellt!"
echo "============================================================"
echo ""
echo "📋 Kopiere diese Werte in deine Vercel Environment Variables:"
echo ""
echo "STRIPE_PRICE_SAVE_LOAD_MONTHLY=$PRICE_SL_MONTHLY"
echo "STRIPE_PRICE_SAVE_LOAD_YEARLY=$PRICE_SL_YEARLY"
echo "STRIPE_PRICE_BASIC_MONTHLY=$PRICE_BASIC_MONTHLY"
echo "STRIPE_PRICE_BASIC_YEARLY=$PRICE_BASIC_YEARLY"
echo "STRIPE_PRICE_PREMIUM_MONTHLY=$PRICE_PREMIUM_MONTHLY"
echo "STRIPE_PRICE_PREMIUM_YEARLY=$PRICE_PREMIUM_YEARLY"
echo ""
echo "============================================================"
echo "⚠️  Vergiss nicht auch den SUPABASE_SERVICE_ROLE_KEY!"
echo "   → Supabase Dashboard → Settings → API → service_role key"
echo "============================================================"
