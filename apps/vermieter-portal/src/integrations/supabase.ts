import { createSupabaseClient } from '@fintutto/shared'

export const supabase = createSupabaseClient({ url: import.meta.env.VITE_SUPABASE_URL, anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY })
export default supabase
