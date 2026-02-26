// scripts/setup-stripe-fintech.ts
// Creates all Stripe products and prices for the Fintutto FinTech Universe
//
// Usage: npx tsx scripts/setup-stripe-fintech.ts
//
// Prerequisites:
//   - STRIPE_SECRET_KEY environment variable set
//   - stripe package installed (npm i stripe)

import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
})

interface PriceSetup {
  nickname: string
  amount: number // in cents
  interval?: 'month' | 'year'
  usageType?: 'metered'
  isOneTime?: boolean
}

interface ProductSetup {
  name: string
  productKey: string // used in metadata for entitlement mapping
  description: string
  prices: PriceSetup[]
}

const PRODUCTS: ProductSetup[] = [
  // ─── Finance Coach ───────────────────────────────────────────
  {
    name: 'Fintutto Finance Coach Premium',
    productKey: 'fintutto_finance_coach_premium',
    description: 'KI-Finanzberatung mit Multi-Bank-Sync und Insights',
    prices: [
      { nickname: 'finance_coach_monthly', amount: 999, interval: 'month' },
      { nickname: 'finance_coach_yearly', amount: 9590, interval: 'year' },
    ],
  },
  {
    name: 'Fintutto AI Forecast Addon',
    productKey: 'fintutto_ai_forecast_addon',
    description: '90-Tage Cashflow-Prognose und KI-Optimierung',
    prices: [
      { nickname: 'ai_forecast_monthly', amount: 499, interval: 'month' },
    ],
  },

  // ─── Fintutto Biz ────────────────────────────────────────────
  {
    name: 'Fintutto Biz Pro',
    productKey: 'fintutto_biz_pro',
    description: 'Freelancer OS: Rechnungen, Banking, Steuer-Reports',
    prices: [
      { nickname: 'biz_pro_monthly', amount: 1999, interval: 'month' },
      { nickname: 'biz_pro_yearly', amount: 19190, interval: 'year' },
    ],
  },
  {
    name: 'Fintutto Biz AI CFO',
    productKey: 'fintutto_biz_ai_cfo',
    description: 'KI-CFO: Cashflow-Prognose, Steueroptimierung, Wachstumsplanung',
    prices: [
      { nickname: 'biz_ai_cfo_monthly', amount: 3999, interval: 'month' },
      { nickname: 'biz_ai_cfo_yearly', amount: 38390, interval: 'year' },
    ],
  },

  // ─── Finance Mentor / Learn ──────────────────────────────────
  {
    name: 'Fintutto Learn Premium',
    productKey: 'fintutto_learn_premium',
    description: 'Alle Kurse, Lernpfade, Zertifikate und KI-Tutor',
    prices: [
      { nickname: 'learn_premium_monthly', amount: 999, interval: 'month' },
      { nickname: 'learn_premium_yearly', amount: 9590, interval: 'year' },
    ],
  },
  {
    name: 'Fintutto Learn Kursbundle',
    productKey: 'fintutto_learn_kursbundle',
    description: 'Einmaliger Zugang zu allen aktuellen Kursen',
    prices: [
      { nickname: 'learn_kursbundle', amount: 2999, isOneTime: true },
    ],
  },

  // ─── B2B API ─────────────────────────────────────────────────
  {
    name: 'Fintutto API Startup',
    productKey: 'fintutto_api_startup',
    description: '50.000 API-Calls/Monat',
    prices: [
      { nickname: 'api_startup_monthly', amount: 4999, interval: 'month' },
    ],
  },
  {
    name: 'Fintutto API Pro',
    productKey: 'fintutto_api_pro',
    description: '500.000 API-Calls/Monat mit Priority Support',
    prices: [
      { nickname: 'api_pro_monthly', amount: 19999, interval: 'month' },
    ],
  },
  {
    name: 'Fintutto API Usage',
    productKey: 'fintutto_api_usage',
    description: 'Usage-basierte Abrechnung (0.01 EUR pro Call)',
    prices: [
      { nickname: 'api_metered', amount: 1, interval: 'month', usageType: 'metered' },
    ],
  },

  // ─── Universe Bundle ─────────────────────────────────────────
  {
    name: 'Fintutto Universe Bundle',
    productKey: 'fintutto_universe_bundle',
    description: 'Zugang zu ALLEN Fintutto-Apps und Features',
    prices: [
      { nickname: 'universe_monthly', amount: 4999, interval: 'month' },
      { nickname: 'universe_yearly', amount: 47990, interval: 'year' },
    ],
  },
]

async function setup() {
  console.log('=== Fintutto FinTech Universe: Stripe Setup ===\n')

  const envLines: string[] = []

  for (const product of PRODUCTS) {
    console.log(`Creating: ${product.name}`)

    const stripeProduct = await stripe.products.create({
      name: product.name,
      description: product.description,
      metadata: {
        ecosystem: 'fintutto',
        product_key: product.productKey,
      },
    })

    const envKey = product.productKey.toUpperCase()
    envLines.push(`VITE_STRIPE_PRODUCT_${envKey}=${stripeProduct.id}`)

    for (const priceSetup of product.prices) {
      const priceParams: Stripe.PriceCreateParams = {
        product: stripeProduct.id,
        currency: 'eur',
        nickname: priceSetup.nickname,
        metadata: {
          ecosystem: 'fintutto',
          product_key: product.productKey,
        },
      }

      if (priceSetup.usageType === 'metered') {
        priceParams.recurring = {
          interval: priceSetup.interval || 'month',
          usage_type: 'metered',
        }
        priceParams.billing_scheme = 'per_unit'
        priceParams.unit_amount = priceSetup.amount
      } else if (priceSetup.isOneTime) {
        priceParams.unit_amount = priceSetup.amount
      } else {
        priceParams.unit_amount = priceSetup.amount
        priceParams.recurring = {
          interval: priceSetup.interval || 'month',
        }
      }

      const price = await stripe.prices.create(priceParams)
      const priceEnvKey = priceSetup.nickname.toUpperCase()
      envLines.push(`VITE_STRIPE_PRICE_${priceEnvKey}=${price.id}`)
      console.log(`  ${priceSetup.nickname}: ${price.id}`)
    }

    console.log(`  Product: ${stripeProduct.id}\n`)
  }

  console.log('\n=== ENV Variables (add to .env.local) ===\n')
  console.log(envLines.join('\n'))
}

setup().catch((err) => {
  console.error('Setup failed:', err)
  process.exit(1)
})
