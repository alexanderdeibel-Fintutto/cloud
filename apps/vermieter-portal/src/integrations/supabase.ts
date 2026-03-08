import { createSupabaseClient } from '@fintutto/shared'

export const supabase = createSupabaseClient({
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
})
export default supabase
