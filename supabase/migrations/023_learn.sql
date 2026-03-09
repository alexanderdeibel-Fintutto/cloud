-- 023_learn.sql
-- Finance Mentor: Finanz-Education mit Gamification und Zertifikaten

CREATE TABLE IF NOT EXISTS public.learn_courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- budgeting, investing, taxes, credit, emergency_fund, insurance, mindset, saving, freedom, psychology, market, income
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

-- Seed: Alle Kurse (26 Kurse, ~180 Lektionen)
INSERT INTO public.learn_courses (title, description, category, difficulty, is_premium, lesson_count, estimated_minutes, sort_order) VALUES
  -- Grundlagen
  ('Budgetierung Grundlagen', 'Lerne die Basics der persoenlichen Finanzplanung', 'budgeting', 'beginner', false, 6, 45, 1),
  ('Dein Finanz-Mindset', 'Warum deine Ueberzeugungen ueber Geld dein Konto bestimmen', 'mindset', 'beginner', false, 8, 60, 2),
  ('Schulden strategisch abbauen', 'Verschaffe dir Ueberblick und werde systematisch schuldenfrei', 'budgeting', 'beginner', false, 5, 40, 3),
  -- Sparen
  ('Notfallfonds aufbauen', 'Finanzielle Sicherheit durch Ruecklagen', 'emergency_fund', 'beginner', false, 4, 30, 4),
  ('Automatisch Vermoegen aufbauen', 'Richte ein System ein das dein Vermoegen im Hintergrund wachsen laesst', 'saving', 'beginner', true, 9, 70, 5),
  -- Investieren
  ('ETFs verstehen', 'Einfuehrung in ETF-Investing fuer Einsteiger', 'investing', 'beginner', false, 10, 90, 6),
  ('Passives Einkommen aufbauen', 'Einkommensquellen die auch ohne taegliche Arbeit fliessen', 'investing', 'intermediate', true, 11, 130, 7),
  ('Immobilien als Investment', 'Rendite, Finanzierung, Steuervorteile bei Immobilien', 'investing', 'advanced', true, 9, 120, 8),
  ('Fortgeschrittenes Investieren', 'Portfoliotheorie, Sicherheitsmarge und systematische Anlagestrategien', 'investing', 'intermediate', true, 10, 120, 9),
  -- Geld-Psychologie
  ('Die Psychologie des Geldes', 'Warum wir irrational mit Geld umgehen und wie du bessere Entscheidungen triffst', 'psychology', 'beginner', true, 9, 90, 10),
  ('Denkfallen bei Geldentscheidungen', 'Verlustaversion Ankereffekte und andere kognitive Verzerrungen umgehen', 'psychology', 'intermediate', true, 9, 90, 11),
  -- Boerse verstehen
  ('Boersenpsychologie verstehen', 'Wie Emotionen die Maerkte bewegen und warum die Masse meist falsch liegt', 'market', 'intermediate', true, 9, 90, 12),
  ('Dein krisensicheres Portfolio', 'Ein Portfolio das in jeder Marktlage stabil bleibt', 'market', 'advanced', true, 9, 120, 13),
  -- Einkommen
  ('Denke wie ein Investor', 'Vermoegenswerte vs Verbindlichkeiten und Cashflow-Denken', 'income', 'beginner', true, 8, 60, 14),
  ('Zeitlose Geld-Prinzipien', 'Bewaehrte Weisheiten ueber Geld in moderner Anwendung', 'income', 'beginner', false, 7, 60, 15),
  ('Einkommen gezielt steigern', 'Strategien fuer Gehaltsverhandlung Nebeneinkuenfte und Positionierung', 'income', 'intermediate', true, 10, 100, 16),
  -- Steuern
  ('Steuern fuer Arbeitnehmer', 'Steuererklaerung und Absetzmoeglichkeiten verstehen', 'taxes', 'beginner', false, 8, 90, 17),
  ('Steuern fuer Freelancer und Selbststaendige', 'EUeR Umsatzsteuer Abschreibungen und Vorauszahlungen', 'taxes', 'intermediate', true, 8, 90, 18),
  ('Kredite und Schuldenmanagement', 'Richtig mit Krediten umgehen Zinsen vergleichen und optimieren', 'credit', 'beginner', false, 6, 50, 19),
  -- Vorsorge & Schutz
  ('Versicherungen optimieren', 'Welche Versicherungen brauchst du wirklich und wo zahlst du zu viel', 'insurance', 'beginner', true, 8, 70, 20),
  ('Altersvorsorge planen', 'Rente Riester Ruerup betriebliche Altersvorsorge', 'investing', 'intermediate', true, 8, 90, 21),
  -- Finanzielle Freiheit
  ('Der Weg zur finanziellen Freiheit', 'Von der Absicherung bis zur Unabhaengigkeit in vier Stufen', 'freedom', 'beginner', true, 11, 120, 22),
  ('Vermoegen schuetzen und erhalten', 'Wie du dein Vermoegen vor Inflation und Risiken bewahrst', 'freedom', 'advanced', true, 10, 100, 23),
  -- Grundlagen: Paar-Finanzen
  ('Finanzen als Paar', 'Gemeinsame Konten faire Aufteilung und finanzielle Ziele als Team', 'budgeting', 'beginner', false, 6, 50, 24),
  -- Investieren: Krypto
  ('Krypto verstehen', 'Bitcoin Ethereum Blockchain Risiken und Portfolio-Beimischung', 'investing', 'intermediate', true, 8, 80, 25)
ON CONFLICT DO NOTHING;
