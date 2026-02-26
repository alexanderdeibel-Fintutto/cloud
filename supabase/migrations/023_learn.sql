-- 023_learn.sql
-- Finance Mentor: Finanz-Education mit Gamification und Zertifikaten

CREATE TABLE IF NOT EXISTS public.learn_courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- budgeting, investing, taxes, credit, emergency_fund, insurance
  difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  is_premium BOOLEAN DEFAULT false,
  lesson_count INT DEFAULT 0,
  estimated_minutes INT DEFAULT 30,
  image_url TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.learn_courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "courses_public_read" ON public.learn_courses FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.learn_lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.learn_courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL, -- structured lesson content blocks
  sort_order INT DEFAULT 0,
  quiz JSONB DEFAULT '[]', -- [{question, options[], correct_index, explanation}]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.learn_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lessons_public_read" ON public.learn_lessons FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.learn_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.learn_courses(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.learn_lessons(id) ON DELETE CASCADE,
  progress NUMERIC DEFAULT 0, -- 0-100
  quiz_score NUMERIC,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id, lesson_id)
);

CREATE INDEX idx_learn_progress_user ON public.learn_progress(user_id, course_id);
ALTER TABLE public.learn_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_progress" ON public.learn_progress FOR ALL USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.learn_certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.learn_courses(id) ON DELETE CASCADE NOT NULL,
  certificate_number TEXT NOT NULL UNIQUE,
  final_score NUMERIC NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.learn_certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_certificates" ON public.learn_certificates FOR ALL USING (user_id = auth.uid());

-- Seed: Basis-Kurse
INSERT INTO public.learn_courses (title, description, category, difficulty, is_premium, lesson_count, estimated_minutes, sort_order) VALUES
  ('Budgetierung Grundlagen', 'Lerne die Basics der persoenlichen Finanzplanung', 'budgeting', 'beginner', false, 5, 30, 1),
  ('ETFs verstehen', 'Einfuehrung in ETF-Investing fuer Einsteiger', 'investing', 'beginner', false, 6, 45, 2),
  ('Steuern fuer Arbeitnehmer', 'Steuererklaerung und Absetzmoeglichkeiten verstehen', 'taxes', 'beginner', false, 4, 25, 3),
  ('Kredite und Schuldenmanagement', 'Richtig mit Krediten umgehen und Schulden abbauen', 'credit', 'beginner', false, 5, 35, 4),
  ('Notfallfonds aufbauen', 'Finanzielle Sicherheit durch Ruecklagen', 'emergency_fund', 'beginner', false, 3, 20, 5),
  ('Fortgeschrittenes Investing', 'Portfoliotheorie, Diversifikation, Rebalancing', 'investing', 'intermediate', true, 8, 60, 6),
  ('Steuern fuer Freelancer', 'EUeR, Umsatzsteuer, Abschreibungen fuer Selbststaendige', 'taxes', 'intermediate', true, 7, 50, 7),
  ('Immobilien als Investment', 'Rendite, Finanzierung, Steuervorteile bei Immobilien', 'investing', 'advanced', true, 6, 45, 8),
  ('Versicherungen optimieren', 'Welche Versicherungen braucht man wirklich?', 'insurance', 'beginner', true, 5, 30, 9),
  ('Altersvorsorge planen', 'Rente, Riester, Ruerup, betriebliche Altersvorsorge', 'investing', 'intermediate', true, 7, 55, 10)
ON CONFLICT DO NOTHING;
