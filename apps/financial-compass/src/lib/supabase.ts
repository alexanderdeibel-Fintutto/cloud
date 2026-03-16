import { createSupabaseClient } from '@fintutto/supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createSupabaseClient({
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
})
