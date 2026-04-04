// Supabase client — using shared factory
import { createSupabaseClient } from '../../../../packages/shared/src/supabase'

export const supabase = createSupabaseClient({
  url: import.meta.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
})
