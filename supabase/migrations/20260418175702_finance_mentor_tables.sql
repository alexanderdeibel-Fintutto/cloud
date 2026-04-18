-- ============================================================
-- Migration: Finance Mentor (LernApp) – E-Learning-Plattform
--            Kurse, Lektionen, Lernfortschritt, Zertifikate
-- ============================================================

-- ── learn_courses ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.learn_courses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  description  TEXT,
  category     TEXT NOT NULL,
  level        TEXT NOT NULL DEFAULT 'anfaenger' CHECK (level IN (
    'anfaenger','fortgeschritten','experte'
  )),
  duration     TEXT,
  icon         TEXT,
  color        TEXT,
  free         BOOLEAN NOT NULL DEFAULT false,
  certificate  BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.learn_courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read published courses" ON public.learn_courses;
CREATE POLICY "Anyone can read published courses"
  ON public.learn_courses FOR SELECT TO authenticated
  USING (is_published = true);

DROP POLICY IF EXISTS "Deny anonymous access to learn_courses" ON public.learn_courses;
CREATE POLICY "Deny anonymous access to learn_courses"
  ON public.learn_courses FOR ALL TO anon USING (false);

-- ── learn_lessons ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.learn_lessons (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID NOT NULL REFERENCES public.learn_courses(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  content     TEXT,
  duration    TEXT,
  free        BOOLEAN NOT NULL DEFAULT false,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.learn_lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read lessons" ON public.learn_lessons;
CREATE POLICY "Authenticated users can read lessons"
  ON public.learn_lessons FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Deny anonymous access to learn_lessons" ON public.learn_lessons;
CREATE POLICY "Deny anonymous access to learn_lessons"
  ON public.learn_lessons FOR ALL TO anon USING (false);

-- ── learn_progress ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.learn_progress (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id    UUID NOT NULL REFERENCES public.learn_courses(id) ON DELETE CASCADE,
  lesson_id    UUID REFERENCES public.learn_lessons(id) ON DELETE SET NULL,
  completed    BOOLEAN NOT NULL DEFAULT false,
  score        INTEGER,
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id, lesson_id)
);

ALTER TABLE public.learn_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own learn_progress" ON public.learn_progress;
CREATE POLICY "Users manage own learn_progress"
  ON public.learn_progress FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Deny anonymous access to learn_progress" ON public.learn_progress;
CREATE POLICY "Deny anonymous access to learn_progress"
  ON public.learn_progress FOR ALL TO anon USING (false);

-- ── learn_certificates ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.learn_certificates (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id          UUID NOT NULL REFERENCES public.learn_courses(id) ON DELETE CASCADE,
  course_title       TEXT NOT NULL,
  certificate_number TEXT NOT NULL UNIQUE DEFAULT 'CERT-' || upper(substring(gen_random_uuid()::text, 1, 8)),
  final_score        INTEGER,
  issued_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);

ALTER TABLE public.learn_certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own learn_certificates" ON public.learn_certificates;
CREATE POLICY "Users manage own learn_certificates"
  ON public.learn_certificates FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Deny anonymous access to learn_certificates" ON public.learn_certificates;
CREATE POLICY "Deny anonymous access to learn_certificates"
  ON public.learn_certificates FOR ALL TO anon USING (false);

-- ── updated_at Trigger ────────────────────────────────────────
DROP TRIGGER IF EXISTS set_updated_at_learn_courses ON public.learn_courses;
CREATE TRIGGER set_updated_at_learn_courses
  BEFORE UPDATE ON public.learn_courses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
