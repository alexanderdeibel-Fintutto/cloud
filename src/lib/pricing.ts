import type { SubscriptionTier } from './types'

export interface FitnessPlan {
  id: SubscriptionTier
  name: string
  description: string
  price: number // cents
  yearlyPrice: number // cents
  features: string[]
  limitations: string[]
  highlight?: boolean
  stripePriceIdMonthly?: string
  stripePriceIdYearly?: string
}

export const FITNESS_PLANS: Record<SubscriptionTier, FitnessPlan> = {
  free: {
    id: 'free',
    name: 'Kostenlos',
    description: 'Trainingsplan erstellen & loslegen',
    price: 0,
    yearlyPrice: 0,
    features: [
      'Trainingsplan erstellen (KI-generiert)',
      '500+ Übungen mit Anleitungen',
      'Basis-Trainingsansicht',
      'Wöchentlicher Fortschritt',
      'Einstieg ins Fintutto-Universum',
    ],
    limitations: [
      'Keine Speichern/Laden-Funktion',
      'Keine Ernährungstracking',
      'Begrenzte Statistiken',
      'Werbung',
    ],
  },
  save_load: {
    id: 'save_load',
    name: 'Speichern & Laden',
    description: 'Pläne speichern und flexibel laden',
    price: 299, // 2.99 EUR
    yearlyPrice: 2870, // 28.70 EUR
    features: [
      'Alles aus Kostenlos',
      'Trainingsplan speichern & laden',
      'Mehrere Pläne verwalten',
      'Ausführliche Übungsbeschreibungen',
      'Trainingshistorie (30 Tage)',
      'Werbefrei',
    ],
    limitations: [
      'Keine Ernährungstracking',
      'Begrenzte Statistiken',
    ],
    stripePriceIdMonthly: 'price_fitness_save_monthly',
    stripePriceIdYearly: 'price_fitness_save_yearly',
  },
  basic: {
    id: 'basic',
    name: 'Basic',
    description: 'Das komplette Trainings-Erlebnis',
    price: 499, // 4.99 EUR
    yearlyPrice: 4790, // 47.90 EUR
    features: [
      'Alles aus Speichern & Laden',
      'Ernährungstracking mit Kalorienrechner',
      'Makro-Tracking (Protein, Kohlenhydrate, Fett)',
      'Fortschrittsstatistiken & Diagramme',
      'Streaks & Gamification',
      'Persönliche Rekorde',
      'KI-Trainingsanpassungen',
      'Trainingshistorie (unbegrenzt)',
    ],
    limitations: [
      'Keine Mobility-Routinen',
      'Kein KI-Ernährungsberater',
    ],
    highlight: true,
    stripePriceIdMonthly: 'price_fitness_basic_monthly',
    stripePriceIdYearly: 'price_fitness_basic_yearly',
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    description: 'Maximale Ergebnisse mit allen Features',
    price: 999, // 9.99 EUR
    yearlyPrice: 9590, // 95.90 EUR
    features: [
      'Alles aus Basic',
      '300+ Mobility-Übungen',
      'KI-Ernährungsberater',
      'Individuelle Mahlzeitenpläne',
      'Barcode-Scanner für Lebensmittel',
      'Erweiterte Körperanalyse',
      'Verletzungsprävention',
      'Periodisierte Trainingspläne',
      'Community-Zugang',
      'Priority Support',
      'Zugang zu allen Fintutto-Apps (Rabatt)',
    ],
    limitations: [],
    stripePriceIdMonthly: 'price_fitness_premium_monthly',
    stripePriceIdYearly: 'price_fitness_premium_yearly',
  },
}

export function canSavePlans(tier: SubscriptionTier): boolean {
  return tier !== 'free'
}

export function canTrackNutrition(tier: SubscriptionTier): boolean {
  return tier === 'basic' || tier === 'premium'
}

export function canViewMobility(tier: SubscriptionTier): boolean {
  return tier === 'premium'
}

export function canViewDetailedStats(tier: SubscriptionTier): boolean {
  return tier === 'basic' || tier === 'premium'
}

export function canUseAICoach(tier: SubscriptionTier): boolean {
  return tier === 'premium'
}

export function getHistoryLimit(tier: SubscriptionTier): number {
  if (tier === 'free') return 7
  if (tier === 'save_load') return 30
  return -1 // unlimited
}

export function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',') + ' €'
}
