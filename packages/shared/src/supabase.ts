import { createClient, SupabaseClient } from '@supabase/supabase-js'

const DEFAULT_SUPABASE_URL = 'https://aaefocdqgdgexkcrjhks.supabase.co'

/**
 * Creates a Supabase client with standard Fintutto auth config.
 * Reads env vars automatically - works with both VITE_SUPABASE_ANON_KEY
 * (portal apps) and VITE_SUPABASE_PUBLISHABLE_KEY (vermietify/lovable).
 */
export function createFintuttoClient(): SupabaseClient {
  const url =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
    DEFAULT_SUPABASE_URL

  const key =
    (typeof import.meta !== 'undefined' &&
      (import.meta.env?.VITE_SUPABASE_ANON_KEY ||
        import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY)) ||
    ''

  return createClient(url, key, {
    auth: {
      storage: typeof localStorage !== 'undefined' ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  })
}
