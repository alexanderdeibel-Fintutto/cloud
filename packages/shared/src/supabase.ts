// Shared Supabase client factory for all Fintutto apps
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export interface CreateSupabaseClientOptions {
  url: string
  anonKey: string
  persistSession?: boolean
  autoRefreshToken?: boolean
}

export function createSupabaseClient<T = any>(options: CreateSupabaseClientOptions): SupabaseClient<T> {
  if (!options.url || !options.anonKey) {
    throw new Error('Missing Supabase environment variables (url or anonKey)')
  }

  return createClient<T>(options.url, options.anonKey, {
    auth: {
      persistSession: options.persistSession ?? true,
      autoRefreshToken: options.autoRefreshToken ?? true,
    },
  })
}
