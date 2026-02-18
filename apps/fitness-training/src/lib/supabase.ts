import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://aaefocdqgdgexkcrjhks.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function signUp(email: string, password: string, referralCode?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        app: 'fitness-training',
        referral_code: referralCode || null,
      },
    },
  })
  return { data, error }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/dashboard` },
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('fitness_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  return { data, error }
}

export async function upsertUserProfile(profile: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('fitness_profiles')
    .upsert(profile, { onConflict: 'user_id' })
    .select()
    .single()
  return { data, error }
}

export async function saveTrainingPlan(plan: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('fitness_training_plans')
    .upsert(plan, { onConflict: 'id' })
    .select()
    .single()
  return { data, error }
}

export async function getTrainingPlans(userId: string) {
  const { data, error } = await supabase
    .from('fitness_training_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function saveWorkoutSession(session: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('fitness_workout_sessions')
    .insert(session)
    .select()
    .single()
  return { data, error }
}

export async function getWorkoutHistory(userId: string, limit = 50) {
  const { data, error } = await supabase
    .from('fitness_workout_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(limit)
  return { data, error }
}

export async function saveMealEntry(entry: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('fitness_meal_entries')
    .insert(entry)
    .select()
    .single()
  return { data, error }
}

export async function getMealEntries(userId: string, date: string) {
  const { data, error } = await supabase
    .from('fitness_meal_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('created_at', { ascending: true })
  return { data, error }
}

export async function getDailyProgress(userId: string, startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('fitness_daily_progress')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })
  return { data, error }
}

export async function upsertDailyProgress(progress: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('fitness_daily_progress')
    .upsert(progress, { onConflict: 'user_id,date' })
    .select()
    .single()
  return { data, error }
}
