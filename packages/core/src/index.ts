// @fintutto/core — Shared Core für alle Fintutto-Apps
// Auth, Supabase, Stripe, App-Konfiguration

// Types
export type {
  AppConfig,
  AppTheme,
  AppFeatures,
  AppStripeConfig,
  AppPwaConfig,
  AppSupabaseConfig,
  AppNavigation,
  NavItem,
  StripeTierPrices,
  UserRole,
  UserProfile,
  AuthState,
  AuthActions,
  AuthContextType,
} from './types'

// App Config
export { AppConfigProvider, useAppConfig, useFeature } from './config'

// Auth
export { AuthProvider, useAuth } from './auth/AuthProvider'
export { ProtectedRoute } from './auth/ProtectedRoute'

// Supabase
export { initSupabase, getSupabase, type SupabaseConfig } from './supabase/client'
export {
  useSupabaseQuery,
  useSupabaseRow,
  useSupabaseInsert,
  useSupabaseUpdate,
  useSupabaseDelete,
} from './supabase/hooks'

// Stripe
export { useSubscription, useCheckout, type SubscriptionData } from './stripe/hooks'
