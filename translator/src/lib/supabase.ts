import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://aaefocdqgdgexkcrjhks.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhZWZvY2RxZ2RnZXhrY3JqaGtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyNTU2NzYsImV4cCI6MjA1MzgzMTY3Nn0.KzAlgorLEJf_yfPY4RFEs1MERPyt5sYjIEvVPmPsWH4'

export const supabase = createClient(supabaseUrl, supabaseKey)
