// Vermietify Supabase Client
// Initialisiert sowohl den lokalen Client als auch den Shared @fintutto/core Client.
import { createClient } from '@supabase/supabase-js';
import { initSupabase } from '@fintutto/core';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Lokaler typisierter Client (für bestehenden Vermietify-Code)
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Shared Client initialisieren (für @fintutto/core Hooks)
initSupabase({ url: SUPABASE_URL, anonKey: SUPABASE_PUBLISHABLE_KEY });