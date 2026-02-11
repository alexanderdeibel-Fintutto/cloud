import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Check if Supabase is configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Create a mock client for when Supabase is not configured
const createMockClient = (): SupabaseClient => {
  const mockResponse = {
    data: null,
    error: { message: 'Supabase not configured', code: 'NOT_CONFIGURED' },
  }

  const mockAuth = {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
    signInWithPassword: async () => mockResponse,
    signUp: async () => mockResponse,
    signOut: async () => ({ error: null }),
  }

  const mockFrom = () => ({
    select: () => ({
      eq: () => ({
        single: async () => mockResponse,
        gt: () => ({ single: async () => mockResponse }),
      }),
      single: async () => mockResponse,
    }),
    insert: () => ({
      select: () => ({ single: async () => mockResponse }),
    }),
    update: () => ({
      eq: async () => mockResponse,
    }),
  })

  return {
    auth: mockAuth,
    from: mockFrom,
  } as unknown as SupabaseClient
}

export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : createMockClient()

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase is not configured. Please create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. See .env.example for reference.'
  )
}

export default supabase
