// =====================================================
// AppConfig — Das Herzstück der Container-Architektur
// Jede App definiert ihre Identität, Features, Branding
// und Stripe-Produkte über diese Konfiguration.
// =====================================================

export interface AppConfig {
  // Identität
  id: string
  name: string
  displayName: string
  version: string
  description: string

  // Branding / Theme
  theme: AppTheme

  // Welche Features sind in dieser App aktiv?
  features: AppFeatures

  // Benutzerrollen
  defaultRole: UserRole
  availableRoles: UserRole[]

  // Stripe-Konfiguration
  stripe: AppStripeConfig

  // PWA-Konfiguration
  pwa: AppPwaConfig

  // Supabase-Konfiguration
  supabase: AppSupabaseConfig

  // Navigation
  navigation: AppNavigation
}

export interface AppTheme {
  primary: string
  secondary: string
  accent: string
  logo?: string
  favicon?: string
}

export interface AppFeatures {
  dashboard: boolean
  properties: boolean
  tenants: boolean
  meters: boolean
  documents: boolean
  payments: boolean
  calculators: boolean
  checkers: boolean
  bescheide: boolean
  tasks: boolean
  aiChat: boolean
  settings: boolean
  [key: string]: boolean // Erweiterbar für app-spezifische Features
}

export type UserRole = 'owner' | 'tenant' | 'caretaker' | 'admin' | 'employee'

export interface AppStripeConfig {
  products: Record<string, StripeTierPrices>
  features: Record<string, string[]>
}

export interface StripeTierPrices {
  monthly: string
  yearly: string
}

export interface AppPwaConfig {
  name: string
  shortName: string
  startUrl: string
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser'
  orientation: 'any' | 'portrait' | 'landscape'
  backgroundColor: string
  themeColor: string
  categories: string[]
}

export interface AppSupabaseConfig {
  url: string
  // Anon key kommt aus Umgebungsvariablen, nicht aus der Config
}

export interface NavItem {
  icon: string
  label: string
  path: string
  primary?: boolean
  badge?: string
}

export interface AppNavigation {
  sidebar: NavItem[]
  bottomNav: NavItem[]
}

// =====================================================
// Auth-related Types
// =====================================================

export interface UserProfile {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  role: UserRole
  tier: string
  organizationId: string | null
  onboardingCompleted: boolean
  metadata: Record<string, unknown>
}

export interface AuthState {
  user: import('@supabase/supabase-js').User | null
  profile: UserProfile | null
  session: import('@supabase/supabase-js').Session | null
  loading: boolean
  initialized: boolean
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<void>
  signInWithOAuth: (provider: 'google' | 'apple' | 'github') => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

export type AuthContextType = AuthState & AuthActions
