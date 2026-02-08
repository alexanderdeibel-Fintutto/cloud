import { loadStripe, Stripe } from '@stripe/stripe-js'
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client'

const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || ''

let stripePromise: Promise<Stripe | null> | null = null

export const getStripe = () => {
  if (!stripePromise && STRIPE_PUBLIC_KEY) {
    stripePromise = loadStripe(STRIPE_PUBLIC_KEY)
  }
  return stripePromise
}

export const isStripeConfigured = () => {
  return STRIPE_PUBLIC_KEY !== ''
}

// Produkt-Typen
export interface Product {
  id: string
  name: string
  description: string | null
  priceCents: number
  stripePriceId: string | null
  features: string[]
  isActive: boolean
}

export interface Bundle {
  id: string
  name: string
  description: string | null
  priceCents: number
  stripePriceId: string | null
  productIds: string[]
  isActive: boolean
}

// Produkte laden
export async function getProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return getDefaultProducts()
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .eq('app_id', 'ft-formulare')
    .order('sort_order')

  if (error) {
    console.error('Error loading products:', error)
    return getDefaultProducts()
  }

  if (!data) {
    return getDefaultProducts()
  }

  return data.map((p: any) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    priceCents: p.price_cents,
    stripePriceId: p.stripe_price_id,
    features: (p.features as string[]) || [],
    isActive: p.is_active,
  }))
}

// Bundles laden
export async function getBundles(): Promise<Bundle[]> {
  if (!isSupabaseConfigured()) {
    return getDefaultBundles()
  }

  const { data, error } = await supabase
    .from('bundles')
    .select('*')
    .eq('is_active', true)
    .order('price_cents')

  if (error) {
    console.error('Error loading bundles:', error)
    return getDefaultBundles()
  }

  if (!data) {
    return getDefaultBundles()
  }

  return data.map((b: any) => ({
    id: b.id,
    name: b.name,
    description: b.description,
    priceCents: b.price_cents,
    stripePriceId: b.stripe_price_id,
    productIds: b.product_ids,
    isActive: b.is_active,
  }))
}

// Checkout starten
export async function startCheckout(priceId: string, successUrl: string, cancelUrl: string): Promise<{ url: string } | { error: string }> {
  if (!isSupabaseConfigured()) {
    return { error: 'Zahlungssystem nicht konfiguriert' }
  }

  const { data, error } = await supabase.functions.invoke('stripe-checkout', {
    body: {
      price_id: priceId,
      success_url: successUrl,
      cancel_url: cancelUrl,
    }
  })

  if (error) {
    return { error: error.message }
  }

  return { url: data.url }
}

// Prüfen ob Benutzer Zugriff auf Produkt hat
export async function checkUserAccess(userId: string, productId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false
  }

  const { data, error } = await supabase.rpc('check_user_access', {
    p_user_id: userId,
    p_product_id: productId,
  } as any)

  if (error) {
    console.error('Error checking access:', error)
    return false
  }

  return data === true
}

// Benutzer-Käufe laden
export async function getUserPurchases(userId: string): Promise<string[]> {
  if (!isSupabaseConfigured()) {
    return []
  }

  const { data, error } = await supabase
    .from('user_purchases')
    .select('product_id')
    .eq('user_id', userId)

  if (error) {
    console.error('Error loading purchases:', error)
    return []
  }

  if (!data) {
    return []
  }

  return data.map((p: any) => p.product_id)
}

// Default Produkte (Fallback)
function getDefaultProducts(): Product[] {
  return [
    {
      id: 'mietvertrag',
      name: 'Mietvertrag Wohnraum',
      description: 'Vollständiger Wohnraummietvertrag',
      priceCents: 499,
      stripePriceId: null,
      features: ['PDF-Export', 'Rechtssicher', 'Anpassbar'],
      isActive: true,
    },
    {
      id: 'kuendigung',
      name: 'Kündigung Mietvertrag',
      description: 'Ordentliche und außerordentliche Kündigung',
      priceCents: 299,
      stripePriceId: null,
      features: ['Fristberechnung', 'PDF-Export'],
      isActive: true,
    },
    {
      id: 'nebenkostenabrechnung',
      name: 'Nebenkostenabrechnung',
      description: 'Betriebskostenabrechnung nach BetrKV',
      priceCents: 1499,
      stripePriceId: null,
      features: ['Automatische Berechnung', 'PDF-Export', 'Prüfung'],
      isActive: true,
    },
  ]
}

// Default Bundles (Fallback)
function getDefaultBundles(): Bundle[] {
  return [
    {
      id: 'vermieter-komplett',
      name: 'Vermieter Komplett-Paket',
      description: 'Alle 60 Formulare zum Vorteilspreis',
      priceCents: 9999,
      stripePriceId: null,
      productIds: ['*'],
      isActive: true,
    },
    {
      id: 'neuvermietung',
      name: 'Neuvermietung Paket',
      description: '5 Dokumente für den Mietstart',
      priceCents: 2499,
      stripePriceId: null,
      productIds: ['mietvertrag', 'selbstauskunft', 'uebergabeprotokoll', 'hausordnung', 'sepa-lastschriftmandat'],
      isActive: true,
    },
  ]
}

// Preis formatieren
export function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR',
  })
}
