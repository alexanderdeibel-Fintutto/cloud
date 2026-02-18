-- ============================================
-- FitTutto - Fitness Training App Schema
-- Part of the Fintutto Ecosystem
-- ============================================

-- Fitness user profiles
CREATE TABLE IF NOT EXISTS fitness_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'diverse')),
  age INTEGER,
  height_cm INTEGER,
  weight_kg NUMERIC(5,1),
  target_weight_kg NUMERIC(5,1),
  fitness_goal TEXT CHECK (fitness_goal IN ('lose_weight', 'build_muscle', 'stay_fit', 'improve_endurance', 'increase_flexibility', 'gain_strength')),
  fitness_level TEXT CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced', 'professional')),
  training_location TEXT CHECK (training_location IN ('gym', 'home', 'outdoor')),
  available_equipment TEXT[] DEFAULT '{}',
  training_days_per_week INTEGER DEFAULT 3,
  training_minutes_per_session INTEGER DEFAULT 45,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'save_load', 'basic', 'premium')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Training plans
CREATE TABLE IF NOT EXISTS fitness_training_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  goal TEXT,
  level TEXT,
  location TEXT,
  duration_weeks INTEGER DEFAULT 8,
  days_per_week INTEGER DEFAULT 3,
  workouts JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT FALSE,
  is_template BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workout sessions (completed workouts)
CREATE TABLE IF NOT EXISTS fitness_workout_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES fitness_training_plans(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  total_calories_burned INTEGER DEFAULT 0,
  total_volume NUMERIC(10,1) DEFAULT 0,
  exercises JSONB DEFAULT '[]',
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  notes TEXT,
  mood TEXT CHECK (mood IN ('great', 'good', 'okay', 'tired', 'exhausted')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meal entries for nutrition tracking
CREATE TABLE IF NOT EXISTS fitness_meal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  foods JSONB DEFAULT '[]',
  total_calories INTEGER DEFAULT 0,
  total_protein NUMERIC(6,1) DEFAULT 0,
  total_carbs NUMERIC(6,1) DEFAULT 0,
  total_fat NUMERIC(6,1) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily progress tracking
CREATE TABLE IF NOT EXISTS fitness_daily_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  workouts_completed INTEGER DEFAULT 0,
  calories_burned INTEGER DEFAULT 0,
  calories_consumed INTEGER DEFAULT 0,
  protein_consumed NUMERIC(6,1) DEFAULT 0,
  carbs_consumed NUMERIC(6,1) DEFAULT 0,
  fat_consumed NUMERIC(6,1) DEFAULT 0,
  water_ml INTEGER DEFAULT 0,
  sleep_hours NUMERIC(3,1) DEFAULT 0,
  steps INTEGER DEFAULT 0,
  weight_kg NUMERIC(5,1),
  mood TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Personal records
CREATE TABLE IF NOT EXISTS fitness_personal_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  weight NUMERIC(6,1),
  reps INTEGER,
  achieved_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements
CREATE TABLE IF NOT EXISTS fitness_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Fitness referrals (linked to main referral system)
CREATE TABLE IF NOT EXISTS fitness_referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_email TEXT,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'registered', 'converted')),
  reward_claimed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  converted_at TIMESTAMPTZ
);

-- === RLS Policies ===

ALTER TABLE fitness_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_meal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_referrals ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON fitness_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON fitness_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON fitness_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own plans" ON fitness_training_plans FOR SELECT USING (auth.uid() = user_id OR is_template = TRUE);
CREATE POLICY "Users can manage own plans" ON fitness_training_plans FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sessions" ON fitness_workout_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own sessions" ON fitness_workout_sessions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own meals" ON fitness_meal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own meals" ON fitness_meal_entries FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own progress" ON fitness_daily_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own progress" ON fitness_daily_progress FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own records" ON fitness_personal_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own records" ON fitness_personal_records FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own achievements" ON fitness_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own achievements" ON fitness_achievements FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own referrals" ON fitness_referrals FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "Users can manage own referrals" ON fitness_referrals FOR ALL USING (auth.uid() = referrer_id);

-- === Indexes ===

CREATE INDEX IF NOT EXISTS idx_fitness_profiles_user_id ON fitness_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_fitness_plans_user_id ON fitness_training_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_fitness_sessions_user_id ON fitness_workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_fitness_sessions_started_at ON fitness_workout_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_fitness_meals_user_date ON fitness_meal_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_fitness_progress_user_date ON fitness_daily_progress(user_id, date);
CREATE INDEX IF NOT EXISTS idx_fitness_records_user_id ON fitness_personal_records(user_id);

-- === Auto-generate referral code on profile creation ===

CREATE OR REPLACE FUNCTION generate_fitness_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := 'FT-' || UPPER(SUBSTRING(NEW.user_id::text, 1, 8));
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER fitness_profile_referral_code
  BEFORE INSERT OR UPDATE ON fitness_profiles
  FOR EACH ROW EXECUTE FUNCTION generate_fitness_referral_code();
