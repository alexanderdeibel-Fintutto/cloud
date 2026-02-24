
# Stripe Subscription Integration Plan

## Overview
Implementierung einer vollstaendigen Stripe-Subscription-Loesung mit Pricing-Seite, Checkout-Flow, Feature-Gating und Abo-Verwaltung.

## 1. Datenbank-Schema

Neue Tabelle `user_subscriptions` mit:
- `id`, `user_id`, `stripe_customer_id`, `stripe_subscription_id`
- `app_id` (z.B. 'vermietify'), `plan_id` (z.B. 'free', 'basic', 'pro')
- `status` ('active', 'cancelled', 'past_due', 'trialing')
- `current_period_start`, `current_period_end`, `cancel_at_period_end`
- Unique Index auf (user_id, app_id)
- RLS-Policies: User sieht nur eigene Subscriptions

## 2. Edge Functions

### create-checkout
- Erstellt Stripe Checkout Session
- Prueft/erstellt Stripe Customer basierend auf User-Email
- Unterstuetzt monatliche und jaehrliche Preise
- Gibt Checkout-URL zurueck

### check-subscription
- Prueft aktiven Subscription-Status via Stripe API
- Gibt subscribed-Status, plan_id und subscription_end zurueck
- Wird bei Login, Page-Load und periodisch aufgerufen

### customer-portal
- Erstellt Stripe Customer Portal Session
- Ermoeglicht Abo-Verwaltung (Kuendigen, Zahlungsmethode aendern)

## 3. Frontend-Komponenten

### PricingPage (`/pricing`)
- Header mit monatlich/jaehrlich Toggle (20% Rabatt bei jaehrlich)
- 3-4 Pricing Cards (Free, Basic, Pro, Business)
- Dynamische Button-Logik basierend auf aktuellem Plan
- Deutsche UI-Texte

### SuccessPage (`/success`)
- Konfetti-Animation
- Erfolgsmeldung
- Button zum Dashboard

### useSubscription Hook
- Laed Subscription-Status aus Datenbank/Stripe
- Stellt `plan`, `isPro`, `isActive` bereit
- Auto-Refresh nach Login

### UpgradePrompt Component
- Lock-Icon mit Upgrade-Aufforderung
- Button zur Pricing-Seite

## 4. Routing

Neue Routes:
- `/pricing` - Pricing-Seite
- `/success` - Nach erfolgreicher Zahlung
- `/cancel` - Bei abgebrochenem Checkout

## 5. Pricing-Struktur

Verwendung der existierenden Stripe-Produkte:

| Plan | Monatlich | Jaehrlich |
|------|-----------|-----------|
| Free | 0 EUR | - |
| Basic | 9,99 EUR | 99,90 EUR |
| Pro | 24,99 EUR | 249,90 EUR |
| Business | 79,00 EUR | 790,00 EUR |

---

## Technische Details

### Datenbankschema SQL
```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  app_id TEXT NOT NULL DEFAULT 'vermietify',
  plan_id TEXT NOT NULL DEFAULT 'free',
  status TEXT DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_user_app_subscription ON user_subscriptions(user_id, app_id);
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
```

### Edge Function Struktur
```text
supabase/functions/
  create-checkout/index.ts
  check-subscription/index.ts
  customer-portal/index.ts
```

### Komponenten-Struktur
```text
src/
  components/
    subscription/
      PricingCard.tsx
      PricingToggle.tsx
      UpgradePrompt.tsx
  hooks/
    useSubscription.tsx
  pages/
    Pricing.tsx
    Success.tsx
  lib/
    stripe.ts (Pricing-Config)
```

### useSubscription Hook Interface
```typescript
interface UseSubscriptionReturn {
  subscription: Subscription | null;
  plan: 'free' | 'basic' | 'pro' | 'business';
  isPro: boolean;
  isActive: boolean;
  isLoading: boolean;
  checkSubscription: () => Promise<void>;
  openCheckout: (priceId: string) => Promise<void>;
  openPortal: () => Promise<void>;
}
```

### Feature-Gating Pattern
```typescript
const { isPro } = useSubscription();

{isPro ? (
  <ProFeature />
) : (
  <UpgradePrompt feature="OCR-Erkennung" />
)}
```
