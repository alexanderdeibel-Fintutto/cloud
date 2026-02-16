import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

export interface SupabaseConfig {
  url: string
  anonKey: string
}

/**
 * Erstellt oder gibt den Singleton Supabase Client zurück.
 * Wird einmal pro App initialisiert.
 */
export function initSupabase(config: SupabaseConfig): SupabaseClient {
  if (_client) return _client

  _client = createClient(config.url, config.anonKey, {
    auth: {
      storage: typeof window !== 'undefined' ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  })

  return _client
}

/**
 * Gibt den initialisierten Supabase Client zurück.
 * Wirft einen Fehler wenn noch nicht initialisiert.
 */
export function getSupabase(): SupabaseClient {
  if (!_client) {
    throw new Error(
      '@fintutto/core: Supabase nicht initialisiert. ' +
      'Rufe initSupabase({ url, anonKey }) in deiner App auf.'
    )
  }
  return _client
}
