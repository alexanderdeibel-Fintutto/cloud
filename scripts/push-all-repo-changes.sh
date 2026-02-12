#!/bin/bash
# ============================================================================
# Fintutto Pricing Review - Push alle Aenderungen in alle Repos
# Ausfuehren auf deinem Mac: ./scripts/push-all-repo-changes.sh
# Voraussetzung: gh CLI installiert und eingeloggt (gh auth login)
# ============================================================================

set -euo pipefail

ORG="alexanderdeibel-Fintutto"
BRANCH="claude/pricing-review"
MSG_SUFFIX="https://claude.ai/code/session_01LPiU4t1tKyqq3qgUgAypzB"

create_branch() {
  local repo="$1"
  local base_branch
  base_branch=$(gh api "repos/$ORG/$repo" --jq '.default_branch')
  local sha
  sha=$(gh api "repos/$ORG/$repo/git/ref/heads/$base_branch" --jq '.object.sha')
  gh api "repos/$ORG/$repo/git/refs" -f "ref=refs/heads/$BRANCH" -f "sha=$sha" 2>/dev/null || echo "  Branch exists already"
  echo "  Branch $BRANCH created from $base_branch ($sha)"
}

push_file() {
  local repo="$1"
  local path="$2"
  local content_b64="$3"
  local message="$4"

  # Check if file exists
  local existing_sha
  existing_sha=$(gh api "repos/$ORG/$repo/contents/$path?ref=$BRANCH" --jq '.sha' 2>/dev/null || echo "")

  if [ -n "$existing_sha" ]; then
    gh api "repos/$ORG/$repo/contents/$path" \
      -X PUT \
      -f "message=$message" \
      -f "content=$content_b64" \
      -f "sha=$existing_sha" \
      -f "branch=$BRANCH" > /dev/null
  else
    gh api "repos/$ORG/$repo/contents/$path" \
      -X PUT \
      -f "message=$message" \
      -f "content=$content_b64" \
      -f "branch=$BRANCH" > /dev/null
  fi
  echo "  Pushed: $path"
}

echo "============================================"
echo "Fintutto Pricing Review - Alle Repos updaten"
echo "============================================"
echo ""

# ============================================================================
# 1. BESCHEIDBOXER
# ============================================================================
echo "=== 1/6: bescheidboxer ==="
create_branch "bescheidboxer"

# credits.ts update
CREDITS_B64=$(base64 -i <(cat << 'ENDOFFILE'
export type PlanType = 'schnupperer' | 'starter' | 'kaempfer' | 'vollschutz'

export interface PlanConfig {
  name: string
  price: number
  priceYearly: number
  creditsPerMonth: number
  chatMessagesPerDay: number
  lettersPerMonth: number
  bescheidScansPerMonth: number
  forumAccess: 'read_post' | 'read_post_chat_limited' | 'full' | 'vip'
  postversandInklusive: number
  prioritySupport: boolean
  mieterAppInklusive: boolean | 'basic' | 'premium'
  letterPrice: number
  tier: number
  badge?: string
  stripePriceIdMonthly?: string
  stripePriceIdYearly?: string
}

export const PLANS: Record<PlanType, PlanConfig> = {
  schnupperer: {
    name: 'Schnupperer',
    price: 0,
    priceYearly: 0,
    creditsPerMonth: 0,
    chatMessagesPerDay: 3,
    lettersPerMonth: 0,
    bescheidScansPerMonth: 1,
    forumAccess: 'read_post',
    postversandInklusive: 0,
    prioritySupport: false,
    mieterAppInklusive: false,
    letterPrice: 2.99,
    tier: 0,
  },
  starter: {
    name: 'Starter',
    price: 2.99,
    priceYearly: 28.70,
    creditsPerMonth: 10,
    chatMessagesPerDay: 10,
    lettersPerMonth: 1,
    bescheidScansPerMonth: 3,
    forumAccess: 'read_post_chat_limited',
    postversandInklusive: 0,
    prioritySupport: false,
    mieterAppInklusive: false,
    letterPrice: 1.99,
    tier: 1,
    stripePriceIdMonthly: 'price_bb_starter_monthly',
    stripePriceIdYearly: 'price_bb_starter_yearly',
  },
  kaempfer: {
    name: 'Kaempfer',
    price: 4.99,
    priceYearly: 47.90,
    creditsPerMonth: 25,
    chatMessagesPerDay: -1,
    lettersPerMonth: 3,
    bescheidScansPerMonth: -1,
    forumAccess: 'full',
    postversandInklusive: 1,
    prioritySupport: true,
    mieterAppInklusive: 'basic',
    letterPrice: 0.99,
    tier: 2,
    badge: 'Beliebt',
    stripePriceIdMonthly: 'price_bb_kaempfer_monthly',
    stripePriceIdYearly: 'price_bb_kaempfer_yearly',
  },
  vollschutz: {
    name: 'Vollschutz',
    price: 7.99,
    priceYearly: 76.70,
    creditsPerMonth: 50,
    chatMessagesPerDay: -1,
    lettersPerMonth: -1,
    bescheidScansPerMonth: -1,
    forumAccess: 'vip',
    postversandInklusive: 3,
    prioritySupport: true,
    mieterAppInklusive: 'premium',
    letterPrice: 0,
    tier: 3,
    badge: 'VIP',
    stripePriceIdMonthly: 'price_bb_vollschutz_monthly',
    stripePriceIdYearly: 'price_bb_vollschutz_yearly',
  },
}

export const CREDIT_COSTS = {
  bescheidScan: 1,
  bescheidAnalyseDetail: 3,
  chatNachrichten5: 1,
  musterVorschau: 0,
  personalisierterBrief: 3,
  postversandStandard: 6,
  postversandEinschreiben: 10,
  privatchatProTag: 1,
}

export const CREDIT_PACKAGES = [
  { credits: 10, price: 4.99, label: '10 Credits', stripePriceId: 'price_bb_credits_10' },
  { credits: 25, price: 9.99, label: '25 Credits', discount: '10%', stripePriceId: 'price_bb_credits_25' },
  { credits: 50, price: 17.99, label: '50 Credits', discount: '20%', stripePriceId: 'price_bb_credits_50' },
]

export interface UserCredits {
  userId: string
  plan: PlanType
  creditsAktuell: number
  chatMessagesUsedToday: number
  lettersGeneratedThisMonth: number
  scansThisMonth: number
  periodStart: Date
  periodEnd: Date
}

export function canAskQuestion(credits: UserCredits): { allowed: boolean; reason?: string } {
  const plan = PLANS[credits.plan]
  if (plan.chatMessagesPerDay === -1) {
    return { allowed: true }
  }
  if (credits.chatMessagesUsedToday >= plan.chatMessagesPerDay) {
    if (credits.plan === 'schnupperer') {
      return {
        allowed: false,
        reason: 'Du hast deine 3 kostenlosen Nachrichten fuer heute aufgebraucht. Upgrade auf Starter fuer 10/Tag oder Kaempfer fuer unbegrenzt.',
      }
    }
    return {
      allowed: false,
      reason: `Tageslimit von ${plan.chatMessagesPerDay} Nachrichten erreicht. Upgrade auf Kaempfer fuer unbegrenzten Chat.`,
    }
  }
  return { allowed: true }
}

export function canGenerateLetter(credits: UserCredits): { allowed: boolean; reason?: string; cost: number } {
  const plan = PLANS[credits.plan]

  if (plan.lettersPerMonth === -1) {
    return { allowed: true, cost: 0 }
  }

  if (credits.plan === 'schnupperer') {
    return {
      allowed: true,
      cost: plan.letterPrice,
      reason: 'Einzelkauf: Personalisiertes Schreiben fuer dich erstellt.',
    }
  }

  if (credits.lettersGeneratedThisMonth < plan.lettersPerMonth) {
    return { allowed: true, cost: 0 }
  }

  return {
    allowed: true,
    cost: plan.letterPrice,
    reason: `Monatskontingent (${plan.lettersPerMonth}) aufgebraucht. Weitere: ${plan.letterPrice} EUR.`,
  }
}

export function canScanBescheid(credits: UserCredits): { allowed: boolean; reason?: string } {
  const plan = PLANS[credits.plan]
  if (plan.bescheidScansPerMonth === -1) {
    return { allowed: true }
  }
  if (credits.scansThisMonth >= plan.bescheidScansPerMonth) {
    return {
      allowed: false,
      reason: `Scan-Limit (${plan.bescheidScansPerMonth}/Monat) erreicht. Upgrade fuer mehr Scans.`,
    }
  }
  return { allowed: true }
}

export function canPostInForum(): { allowed: boolean; reason?: string } {
  return { allowed: true }
}
ENDOFFILE
))

push_file "bescheidboxer" "src/lib/credits.ts" "$CREDITS_B64" "Add Stripe Price IDs, fix yearly to 20% discount - $MSG_SUFFIX"

# Referral migration
REFERRAL_SQL_B64=$(base64 -i <(cat << 'ENDOFFILE'
-- Referral-System fuer BescheidBoxer
-- Belohnung: 30 Bonus-Credits fuer BEIDE Seiten + 7 Tage Kaempfer-Trial

CREATE TABLE IF NOT EXISTS public.amt_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_user_id UUID NOT NULL,
  referred_email TEXT NOT NULL,
  referred_user_id UUID,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reward_type TEXT DEFAULT 'credits',
  reward_credits INTEGER DEFAULT 30,
  reward_applied_referrer BOOLEAN DEFAULT false,
  reward_applied_referred BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  converted_at TIMESTAMPTZ,
  reward_applied_at TIMESTAMPTZ
);

ALTER TABLE public.amt_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals"
ON public.amt_referrals FOR SELECT
USING (auth.uid() = referrer_user_id);

CREATE POLICY "Users can create referrals"
ON public.amt_referrals FOR INSERT
WITH CHECK (auth.uid() = referrer_user_id);

CREATE INDEX IF NOT EXISTS idx_amt_referrals_referrer ON public.amt_referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_amt_referrals_code ON public.amt_referrals(referral_code);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'amt_users' AND column_name = 'referral_code') THEN
    ALTER TABLE public.amt_users ADD COLUMN referral_code TEXT UNIQUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'amt_users' AND column_name = 'referred_by') THEN
    ALTER TABLE public.amt_users ADD COLUMN referred_by UUID;
  END IF;
END $$;
ENDOFFILE
))

push_file "bescheidboxer" "supabase/migrations/20260212120000_referral_system.sql" "$REFERRAL_SQL_B64" "Add referral system (30 credits for both sides) - $MSG_SUFFIX"

echo "  bescheidboxer done!"
echo ""

# ============================================================================
# 2. ABLESUNG
# ============================================================================
echo "=== 2/6: ablesung ==="
create_branch "ablesung"

FIX_SQL_B64=$(base64 -i <(cat << 'ENDOFFILE'
-- Fix falsche Preise in der products-Tabelle + Enterprise-Tiers

UPDATE public.products SET price_monthly = 9.99, price_yearly = 95.90, stripe_price_id_monthly = 'price_1Sr56K52lqSgjCzeqfCfOudX', updated_at = NOW()
WHERE app_id = 'vermietify' AND name = 'Vermietify Basic';

UPDATE public.products SET price_monthly = 24.99, price_yearly = 239.90, stripe_price_id_monthly = 'price_1Sr56o52lqSgjCzeRuGrant2', updated_at = NOW()
WHERE app_id = 'vermietify' AND name = 'Vermietify Pro';

UPDATE public.products SET name = 'HausmeisterPro Starter', price_monthly = 9.99, price_yearly = 95.90, stripe_price_id_monthly = 'price_1St3Eg52lqSgjCze5l6pqANG', features = '["Bis zu 10 Gebaeude", "Erweiterte Aufgabenverwaltung", "Kalender-Integration"]'::jsonb, updated_at = NOW()
WHERE app_id = 'hausmeister' AND name = 'HausmeisterPro';

INSERT INTO public.products (app_id, name, description, price_monthly, price_yearly, features, sort_order)
VALUES ('hausmeister', 'HausmeisterPro Pro', 'Fuer wachsende Unternehmen', 24.99, 239.90, '["Unbegrenzte Gebaeude", "Alle Starter-Features", "Dokumenten-Management", "API-Zugang"]'::jsonb, 2)
ON CONFLICT DO NOTHING;

UPDATE public.products SET price_yearly = 191.90, updated_at = NOW() WHERE app_id = 'nebenkosten' AND name = 'Nebenkosten Starter';
UPDATE public.products SET price_yearly = 95.90, updated_at = NOW() WHERE app_id = 'zaehler' AND name LIKE 'Zählerstand Basic%';
UPDATE public.products SET price_yearly = 239.90, updated_at = NOW() WHERE app_id = 'zaehler' AND name LIKE 'Zählerstand Pro%';

INSERT INTO public.products (app_id, name, description, price_monthly, price_yearly, features, sort_order)
VALUES ('zaehler', 'Zählerstand Enterprise', 'Fuer grosse Hausverwaltungen', 49.99, 479.90, '["Unbegrenzte Einheiten", "API-Zugang", "Dedizierter Support", "Custom Reports", "SLA-Garantie"]'::jsonb, 3)
ON CONFLICT DO NOTHING;

INSERT INTO public.products (app_id, name, description, price_monthly, price_yearly, features, sort_order)
VALUES ('hausmeister', 'HausmeisterPro Enterprise', 'Fuer grosse Hausverwaltungen', 49.99, 479.90, '["Unbegrenzte Gebaeude", "Multi-Team", "Custom Branding", "SLA-Garantie", "Dedizierter Support"]'::jsonb, 3)
ON CONFLICT DO NOTHING;
ENDOFFILE
))

push_file "ablesung" "supabase/migrations/20260212120000_fix_product_prices.sql" "$FIX_SQL_B64" "Fix cross-app prices, add enterprise tiers, standardize discounts - $MSG_SUFFIX"

echo "  ablesung done!"
echo ""

# ============================================================================
# 3. FINANCIAL COMPASS
# ============================================================================
echo "=== 3/6: fintutto-your-financial-compass ==="
create_branch "fintutto-your-financial-compass"

# Get current file, modify it
echo "  Updating useSubscription.ts with yearly prices..."
CURRENT=$(gh api "repos/$ORG/fintutto-your-financial-compass/contents/src/hooks/useSubscription.ts?ref=main" --jq '.content' | base64 -d)

# Replace the PLAN_CONFIG section
FC_B64=$(echo "$CURRENT" | sed '
/^export const PLAN_CONFIG/,/^} as const;/{
  /price: 0,/a\    yearlyPrice: 0,\n    yearlyPriceId: null,
  /price: 9.99,/a\    yearlyPrice: 95.90,\n    yearlyPriceId: null, // TODO: Replace after running create-all-stripe-products.sh
  /price: 19.99,/a\    yearlyPrice: 191.90,\n    yearlyPriceId: null, // TODO: Replace after running create-all-stripe-products.sh
}' | base64)

push_file "fintutto-your-financial-compass" "src/hooks/useSubscription.ts" "$FC_B64" "Add yearly pricing with 20% discount - $MSG_SUFFIX"

echo "  financial-compass done!"
echo ""

# ============================================================================
# 4. MIETER
# ============================================================================
echo "=== 4/6: mieter ==="
create_branch "mieter"

echo "  Updating useSubscription.ts with lower prices + yearly..."
CURRENT=$(gh api "repos/$ORG/mieter/contents/src/hooks/useSubscription.ts?ref=main" --jq '.content' | base64 -d)

MIETER_B64=$(echo "$CURRENT" | sed '
  s/price_monthly: 9.99,/price_monthly: 4.99, \/\/ gesenkt von 9.99/
  s/price_yearly: 95.88, \/\/ 20% Rabatt/price_yearly: 47.90, \/\/ 20% Rabatt/
  s/price_monthly: 19.99,/price_monthly: 9.99, \/\/ gesenkt von 19.99/
  s/price_yearly: 191.88,/price_yearly: 95.90, \/\/ 20% Rabatt/
' | base64)

push_file "mieter" "src/hooks/useSubscription.ts" "$MIETER_B64" "Lower prices (4.99/9.99) for tenant persona, add yearly - $MSG_SUFFIX"

echo "  mieter done!"
echo ""

# ============================================================================
# 5. HAUSMEISTERPRO
# ============================================================================
echo "=== 5/6: hausmeisterPro ==="
create_branch "hausmeisterPro"

HMP_B64=$(base64 -i <(cat << 'ENDOFFILE'
export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  priceId: string;
  features: string[];
  highlighted?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Für den Einstieg',
    monthlyPrice: 0,
    yearlyPrice: 0,
    priceId: '',
    features: [
      'Bis zu 3 Gebäude',
      'Basis-Aufgabenverwaltung',
      'E-Mail-Support',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'Für kleine Teams',
    monthlyPrice: 9.99,
    yearlyPrice: 95.90,
    priceId: 'price_1St3Eg52lqSgjCze5l6pqANG',
    features: [
      'Bis zu 10 Gebäude',
      'Erweiterte Aufgabenverwaltung',
      'Kalender-Integration',
      'Nachrichten-System',
      'E-Mail-Support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Für wachsende Unternehmen',
    monthlyPrice: 24.99,
    yearlyPrice: 239.90,
    priceId: 'price_1St3FA52lqSgjCzeE8lXHzKH',
    features: [
      'Unbegrenzte Gebäude',
      'Alle Starter-Features',
      'Dokumenten-Management',
      'Berichterstellung',
      'API-Zugang',
      'Prioritäts-Support',
    ],
    highlighted: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Für große Hausverwaltungen',
    monthlyPrice: 49.99,
    yearlyPrice: 479.90,
    priceId: '',
    features: [
      'Unbegrenzte Gebäude',
      'Alle Pro-Features',
      'Multi-Team-Verwaltung',
      'Custom Branding',
      'SLA-Garantie',
      'Dedizierter Account-Manager',
      'API-Zugang mit höheren Limits',
      'Onboarding-Support',
    ],
  },
];

export const PRICE_TO_PLAN: Record<string, string> = {
  'price_1St3Eg52lqSgjCze5l6pqANG': 'starter',
  'price_1St3FA52lqSgjCzeE8lXHzKH': 'pro',
};

export const formatPrice = (price: number): string => {
  if (price === 0) return 'Kostenlos';
  return `${price.toFixed(2).replace('.', ',')} €/Monat`;
};
ENDOFFILE
))

push_file "hausmeisterPro" "src/config/pricing.ts" "$HMP_B64" "Add Enterprise tier (49.99/mo) for large property managers - $MSG_SUFFIX"

echo "  hausmeisterPro done!"
echo ""

# ============================================================================
# 6. VERMIETER-FREUDE
# ============================================================================
echo "=== 6/6: vermieter-freude ==="
create_branch "vermieter-freude"

VF_SQL_B64=$(base64 -i <(cat << 'ENDOFFILE'
-- Referral-Belohnungen fuer Vermietify: 1 Monat gratis fuer BEIDE Seiten

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ecosystem_referrals' AND column_name = 'reward_type') THEN
    ALTER TABLE public.ecosystem_referrals ADD COLUMN reward_type TEXT DEFAULT 'free_month';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ecosystem_referrals' AND column_name = 'reward_applied_referrer') THEN
    ALTER TABLE public.ecosystem_referrals ADD COLUMN reward_applied_referrer BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ecosystem_referrals' AND column_name = 'reward_applied_referred') THEN
    ALTER TABLE public.ecosystem_referrals ADD COLUMN reward_applied_referred BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ecosystem_referrals' AND column_name = 'stripe_coupon_id_referrer') THEN
    ALTER TABLE public.ecosystem_referrals ADD COLUMN stripe_coupon_id_referrer TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ecosystem_referrals' AND column_name = 'stripe_coupon_id_referred') THEN
    ALTER TABLE public.ecosystem_referrals ADD COLUMN stripe_coupon_id_referred TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ecosystem_referrals' AND column_name = 'reward_applied_at') THEN
    ALTER TABLE public.ecosystem_referrals ADD COLUMN reward_applied_at TIMESTAMPTZ;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.referral_reward_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reward_type TEXT NOT NULL DEFAULT 'free_month',
  reward_description TEXT NOT NULL DEFAULT '1 Monat gratis fuer beide Seiten',
  referrer_gets TEXT NOT NULL DEFAULT '1 Monat Basic gratis (Wert: 9.99 EUR)',
  referred_gets TEXT NOT NULL DEFAULT '1 Monat Basic gratis (Wert: 9.99 EUR)',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.referral_reward_config (reward_type, reward_description, referrer_gets, referred_gets)
VALUES ('free_month', '1 Monat gratis fuer beide Seiten', '1 Monat Basic gratis (Wert: 9.99 EUR)', '1 Monat Basic gratis (Wert: 9.99 EUR)')
ON CONFLICT DO NOTHING;
ENDOFFILE
))

push_file "vermieter-freude" "supabase/migrations/20260212120000_referral_rewards.sql" "$VF_SQL_B64" "Upgrade referral with real rewards: 1 month free for both sides - $MSG_SUFFIX"

echo "  vermieter-freude done!"
echo ""

echo "============================================"
echo "FERTIG! Alle 6 Repos aktualisiert."
echo "Branch: $BRANCH"
echo "============================================"
