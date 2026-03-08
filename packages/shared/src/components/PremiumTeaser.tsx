// Cross-app Premium Teaser - shows a subtle upgrade prompt for free users
// Usage: <PremiumTeaser feature="KI-Insights" upgradeUrl="/preise" />

import { type ReactNode } from 'react'

export interface PremiumTeaserProps {
  /** Feature name being promoted */
  feature: string
  /** Description of what upgrading unlocks */
  description?: string
  /** URL to upgrade/pricing page */
  upgradeUrl: string
  /** CTA button text */
  ctaText?: string
  /** Optional children to render inside */
  children?: ReactNode
}

/**
 * Renders a glassmorphic premium teaser card.
 * Designed to work with any UI framework - returns semantic HTML with CSS classes.
 * Apps should style the `.fintutto-premium-teaser` class in their own CSS.
 *
 * For React apps with Tailwind, use the Tailwind-specific classes directly:
 *
 * ```tsx
 * <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 p-6">
 *   <PremiumTeaser feature="KI-Insights" upgradeUrl="/preise" />
 * </div>
 * ```
 */
export function getPremiumTeaserConfig(props: Omit<PremiumTeaserProps, 'children'>) {
  return {
    feature: props.feature,
    description: props.description || `Upgrade auf Premium um ${props.feature} freizuschalten.`,
    upgradeUrl: props.upgradeUrl,
    ctaText: props.ctaText || 'Jetzt upgraden',
  }
}

// Entitlement-based feature definitions for cross-app upsell
export interface UpgradePromptConfig {
  app: string
  appIcon: string
  feature: string
  description: string
  entitlementKey: string
  upgradeUrl: string
  price: string
}

export const CROSS_APP_UPGRADES: UpgradePromptConfig[] = [
  {
    app: 'Finance Coach',
    appIcon: '💰',
    feature: 'KI-Finanzcoach',
    description: 'Personalisierte Spar-Tipps, Cashflow-Prognose und Multi-Bank-Anbindung.',
    entitlementKey: 'finance_coach_basic',
    upgradeUrl: 'https://finance-coach.fintutto.cloud/preise',
    price: 'ab 4,99\u20ac/Monat',
  },
  {
    app: 'Fintutto Biz',
    appIcon: '💼',
    feature: 'KI-CFO',
    description: 'Automatische Steuerschaetzung, Cashflow-Forecast und unbegrenzte Rechnungen.',
    entitlementKey: 'biz_ai_cfo',
    upgradeUrl: 'https://fintutto-biz.vercel.app/preise',
    price: 'ab 9,99\u20ac/Monat',
  },
  {
    app: 'Finance Mentor',
    appIcon: '📚',
    feature: 'Premium-Kurse',
    description: 'Alle 6 Finanz-Kurse, Zertifikate und KI-Tutor fuer Rueckfragen.',
    entitlementKey: 'learn_premium_courses',
    upgradeUrl: 'https://finance-mentor.fintutto.cloud/preise',
    price: 'ab 4,99\u20ac/Monat',
  },
  {
    app: 'Fintutto Portal',
    appIcon: '✨',
    feature: 'Kombi Pro',
    description: '50 Credits/Monat, alle Checker + Rechner + Formulare, KI-Assistent.',
    entitlementKey: 'portal_kombi_pro',
    upgradeUrl: 'https://portal.fintutto.cloud/preise',
    price: 'ab 11,99\u20ac/Monat',
  },
]

/**
 * Get relevant cross-app upgrade suggestions for a user.
 * Filters out apps the user already has entitlements for.
 */
export function getUpgradeSuggestions(
  currentAppId: string,
  userEntitlementKeys: string[],
  maxSuggestions: number = 2
): UpgradePromptConfig[] {
  return CROSS_APP_UPGRADES
    .filter((u) => !u.upgradeUrl.includes(currentAppId))
    .filter((u) => !userEntitlementKeys.includes(u.entitlementKey))
    .slice(0, maxSuggestions)
}
