// Entitlement Engine for the Fintutto Ecosystem
// Feature-flag-based access control across all apps
// Single source of truth for what each Stripe product unlocks

import type { SupabaseClient } from '@supabase/supabase-js'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Entitlement {
  feature_key: string
  expires_at: string | null
  source: string
}

export type FintuttoApp = 'finance_coach' | 'biz' | 'learn' | 'api' | 'social'

// ─── Feature Check Functions ─────────────────────────────────────────────────

export async function hasEntitlement(
  supabase: SupabaseClient,
  userId: string,
  featureKey: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('entitlements')
    .select('id, expires_at')
    .eq('user_id', userId)
    .eq('feature_key', featureKey)
    .single()

  if (error || !data) return false

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return false
  }

  return true
}

export async function getUserEntitlements(
  supabase: SupabaseClient,
  userId: string
): Promise<Entitlement[]> {
  const { data, error } = await supabase
    .from('entitlements')
    .select('feature_key, expires_at, source')
    .eq('user_id', userId)

  if (error || !data) return []

  const now = new Date()
  return data.filter(
    (e) => !e.expires_at || new Date(e.expires_at) > now
  )
}

export async function getAppEntitlements(
  supabase: SupabaseClient,
  userId: string,
  app: FintuttoApp
): Promise<string[]> {
  const entitlements = await getUserEntitlements(supabase, userId)
  const appPrefix = app === 'finance_coach' ? 'finance_' : `${app}_`
  return entitlements
    .filter((e) => e.feature_key.startsWith(appPrefix))
    .map((e) => e.feature_key)
}

// ─── Entitlement Management (server-side only) ──────────────────────────────

export async function grantEntitlement(
  supabase: SupabaseClient,
  userId: string,
  featureKey: string,
  source: string = 'stripe',
  expiresAt?: Date
): Promise<void> {
  await supabase.from('entitlements').upsert(
    {
      user_id: userId,
      feature_key: featureKey,
      source,
      expires_at: expiresAt?.toISOString() || null,
    },
    { onConflict: 'user_id,feature_key' }
  )
}

export async function revokeEntitlement(
  supabase: SupabaseClient,
  userId: string,
  featureKey: string
): Promise<void> {
  await supabase
    .from('entitlements')
    .delete()
    .eq('user_id', userId)
    .eq('feature_key', featureKey)
}

export async function grantEntitlements(
  supabase: SupabaseClient,
  userId: string,
  featureKeys: string[],
  source: string = 'stripe',
  expiresAt?: Date
): Promise<void> {
  const rows = featureKeys.map((key) => ({
    user_id: userId,
    feature_key: key,
    source,
    expires_at: expiresAt?.toISOString() || null,
  }))

  await supabase
    .from('entitlements')
    .upsert(rows, { onConflict: 'user_id,feature_key' })
}

export async function revokeAppEntitlements(
  supabase: SupabaseClient,
  userId: string,
  app: FintuttoApp,
  source: string = 'stripe'
): Promise<void> {
  const appPrefix = app === 'finance_coach' ? 'finance_' : `${app}_`

  const { data } = await supabase
    .from('entitlements')
    .select('id, feature_key')
    .eq('user_id', userId)
    .eq('source', source)
    .like('feature_key', `${appPrefix}%`)

  if (data && data.length > 0) {
    await supabase
      .from('entitlements')
      .delete()
      .in('id', data.map((e) => e.id))
  }
}

// ─── Stripe Product → Entitlements Mapping ───────────────────────────────────

// Maps Stripe product metadata.product_key to feature entitlements
export const STRIPE_PRODUCT_ENTITLEMENTS: Record<string, string[]> = {
  // Finance Coach
  fintutto_finance_coach_premium: [
    'finance_coach_basic',
    'finance_multi_bank',
    'finance_ai_insights',
  ],
  fintutto_ai_forecast_addon: [
    'finance_forecast',
    'finance_ai_coach',
  ],
  // Biz
  fintutto_biz_pro: [
    'biz_basic',
    'biz_unlimited_invoices',
    'biz_tax_reports',
  ],
  fintutto_biz_ai_cfo: [
    'biz_basic',
    'biz_unlimited_invoices',
    'biz_tax_reports',
    'biz_ai_cfo',
    'biz_cashflow_forecast',
  ],
  // Learn
  fintutto_learn_premium: [
    'learn_basic',
    'learn_premium_courses',
    'learn_certificates',
    'learn_ai_tutor',
  ],
  fintutto_learn_kursbundle: [
    'learn_basic',
    'learn_premium_courses',
    'learn_certificates',
  ],
  // API
  fintutto_api_startup: ['api_basic', 'api_startup'],
  fintutto_api_pro: ['api_basic', 'api_startup', 'api_pro'],
  fintutto_api_enterprise: ['api_basic', 'api_startup', 'api_pro', 'api_enterprise'],
  // Universe Bundle = ALLES
  fintutto_universe_bundle: [
    'finance_coach_basic', 'finance_multi_bank', 'finance_ai_insights',
    'finance_forecast', 'finance_ai_coach',
    'biz_basic', 'biz_unlimited_invoices', 'biz_tax_reports',
    'biz_ai_cfo', 'biz_cashflow_forecast',
    'learn_basic', 'learn_premium_courses', 'learn_certificates', 'learn_ai_tutor',
    'api_basic', 'api_startup',
  ],
}

// ─── Helper: Process Stripe Webhook Entitlements ─────────────────────────────

export async function processStripeEntitlements(
  supabase: SupabaseClient,
  userId: string,
  productKey: string,
  action: 'grant' | 'revoke',
  periodEnd?: Date
): Promise<void> {
  const features = STRIPE_PRODUCT_ENTITLEMENTS[productKey]
  if (!features) return

  if (action === 'grant') {
    await grantEntitlements(supabase, userId, features, 'stripe', periodEnd)
  } else {
    for (const key of features) {
      await revokeEntitlement(supabase, userId, key)
    }
  }
}

// ─── Referral Entitlement Grants ─────────────────────────────────────────────

export async function grantReferralReward(
  supabase: SupabaseClient,
  userId: string,
  featureKeys: string[],
  durationDays: number = 30
): Promise<void> {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + durationDays)
  await grantEntitlements(supabase, userId, featureKeys, 'referral', expiresAt)
}
