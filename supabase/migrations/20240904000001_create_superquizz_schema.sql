-- Migration: 20240904000001_create_superquizz_schema.sql
-- Description: Schéma initial de SuperQuizz Biblique (LSG 1910)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Table BOOKS
CREATE TABLE IF NOT EXISTS public.books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    testament TEXT NOT NULL CHECK (testament IN ('ancien', 'nouveau')),
    position INT NOT NULL UNIQUE CHECK (position >= 1 AND position <= 66)
);

-- 2. Table QUESTIONS
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES public.books(id) ON DELETE SET NULL,
    mode TEXT NOT NULL CHECK (mode IN ('entrainement', 'match_manche1', 'match_manche2', 'match_manche3')),
    theme TEXT,
    format TEXT NOT NULL CHECK (format IN ('question_reponse', 'texte_a_trous', 'vrai_faux')),
    question_text TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    wrong_answers JSONB NOT NULL DEFAULT '[]'::jsonb,
    difficulty INT NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
    reference_biblique TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Table USERS
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    pseudo TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Table USER_PROGRESS
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    difficulty_atteinte INT NOT NULL DEFAULT 1 CHECK (difficulty_atteinte BETWEEN 1 AND 5),
    questions_vues JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE (user_id, book_id)
);

-- 5. Table TRAINING_SESSIONS
CREATE TABLE IF NOT EXISTS public.training_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES public.books(id) ON DELETE SET NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    score INT NOT NULL DEFAULT 0,
    duree_totale INT NOT NULL DEFAULT 0
);

-- 6. Table MATCH_SESSIONS
CREATE TABLE IF NOT EXISTS public.match_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    opponent_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    score_total INT NOT NULL DEFAULT 0,
    statut TEXT NOT NULL DEFAULT 'en_cours' CHECK (statut IN ('en_cours', 'termine', 'abandonne'))
);

-- 7. Table MATCH_ROUNDS
CREATE TABLE IF NOT EXISTS public.match_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_session_id UUID NOT NULL REFERENCES public.match_sessions(id) ON DELETE CASCADE,
    numero_manche INT NOT NULL CHECK (numero_manche IN (1, 2, 3)),
    theme_choisi TEXT,
    score_manche INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Table USER_ANSWERS
CREATE TABLE IF NOT EXISTS public.user_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    session_type TEXT NOT NULL DEFAULT 'training' CHECK (session_type IN ('training', 'match')),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    reponse_donnee TEXT NOT NULL,
    est_correcte BOOLEAN NOT NULL,
    temps_reponse_ms INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_questions_book_id ON public.questions(book_id);
CREATE INDEX IF NOT EXISTS idx_questions_mode ON public.questions(mode);
CREATE INDEX IF NOT EXISTS idx_questions_theme ON public.questions(theme);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_format ON public.questions(format);

CREATE INDEX IF NOT EXISTS idx_questions_mode_diff ON public.questions(mode, difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_mode_theme ON public.questions(mode, theme) WHERE theme IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_questions_mode_book ON public.questions(mode, book_id) WHERE book_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_books_testament_pos ON public.books(testament, position);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_book ON public.user_progress(user_id, book_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_user ON public.training_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_match_sessions_user ON public.match_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_match_rounds_session ON public.match_rounds(match_session_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_session ON public.user_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_question ON public.user_answers(question_id);

-- RLS
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "books_select_public" ON public.books FOR SELECT USING (true);
CREATE POLICY "questions_select_public" ON public.questions FOR SELECT USING (true);
CREATE POLICY "users_select_all" ON public.users FOR SELECT USING (true);
CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "user_progress_all_own" ON public.user_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "training_sessions_all_own" ON public.training_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "match_sessions_select" ON public.match_sessions FOR SELECT USING (auth.uid() = user_id OR auth.uid() = opponent_user_id);
CREATE POLICY "match_sessions_insert_own" ON public.match_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "match_sessions_update_own" ON public.match_sessions FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = opponent_user_id);
CREATE POLICY "match_rounds_all" ON public.match_rounds FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.match_sessions ms
        WHERE ms.id = match_rounds.match_session_id
        AND (ms.user_id = auth.uid() OR ms.opponent_user_id = auth.uid())
    )
);
CREATE POLICY "user_answers_insert" ON public.user_answers FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.training_sessions ts WHERE ts.id = user_answers.session_id AND ts.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.match_sessions ms WHERE ms.id = user_answers.session_id AND (ms.user_id = auth.uid() OR ms.opponent_user_id = auth.uid()))
);
CREATE POLICY "user_answers_select" ON public.user_answers FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.training_sessions ts WHERE ts.id = user_answers.session_id AND ts.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.match_sessions ms WHERE ms.id = user_answers.session_id AND (ms.user_id = auth.uid() OR ms.opponent_user_id = auth.uid()))
);

-- Trigger Auth -> Public users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, pseudo, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'pseudo',
      NEW.raw_user_meta_data->>'username',
      split_part(NEW.email, '@', 1)
    ),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      pseudo = EXCLUDED.pseudo;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
