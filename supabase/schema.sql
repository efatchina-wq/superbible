-- ==============================================================================
-- SUPERQUIZZ BIBLIQUE - Schéma PostgreSQL Officiel (Supabase)
-- Version Biblique de référence : Louis Segond révisée 1910 (LSG 1910)
-- ==============================================================================

-- 0. Extensions requises
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Nettoyage si recréation complète (décommenter si besoin)
-- DROP TABLE IF EXISTS public.user_answers CASCADE;
-- DROP TABLE IF EXISTS public.match_rounds CASCADE;
-- DROP TABLE IF EXISTS public.match_sessions CASCADE;
-- DROP TABLE IF EXISTS public.training_sessions CASCADE;
-- DROP TABLE IF EXISTS public.user_progress CASCADE;
-- DROP TABLE IF EXISTS public.questions CASCADE;
-- DROP TABLE IF EXISTS public.books CASCADE;
-- DROP TABLE IF EXISTS public.users CASCADE;

-- ------------------------------------------------------------------------------
-- 1. TABLE: BOOKS (66 Livres canoniques de la Bible LSG 1910)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    testament TEXT NOT NULL CHECK (testament IN ('ancien', 'nouveau')),
    position INT NOT NULL UNIQUE CHECK (position >= 1 AND position <= 66)
);

COMMENT ON TABLE public.books IS 'Livres de la Bible selon le canon protestant LSG 1910 (39 Ancien Testament, 27 Nouveau Testament).';

-- ------------------------------------------------------------------------------
-- 2. TABLE: QUESTIONS (Banque de questions LSG 1910)
-- ------------------------------------------------------------------------------
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

COMMENT ON TABLE public.questions IS 'Questions du jeu basées exclusivement sur la version LSG 1910.';
COMMENT ON COLUMN public.questions.theme IS 'Thème spécifique pour le match manche 2 (ex: rois, villes, propheties, armes, etc.).';
COMMENT ON COLUMN public.questions.format IS 'Format de la question : question_reponse, texte_a_trous, vrai_faux.';
COMMENT ON COLUMN public.questions.wrong_answers IS 'Tableau JSONB de mauvaises réponses ([] pour vrai_faux).';

-- ------------------------------------------------------------------------------
-- 3. TABLE: USERS (Profil applicatif lié à Supabase Auth)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    pseudo TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.users IS 'Profil applicatif des joueurs synchronisé avec auth.users de Supabase.';

-- ------------------------------------------------------------------------------
-- 4. TABLE: USER_PROGRESS (Progression joueur par livre biblique)
-- ------------------------------------------------------------------------------
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

COMMENT ON TABLE public.user_progress IS 'Suivi de la progression par livre et historique des questions vues pour éviter les répétitions.';

-- ------------------------------------------------------------------------------
-- 5. TABLE: TRAINING_SESSIONS (Sessions solo d''entraînement)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.training_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES public.books(id) ON DELETE SET NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    score INT NOT NULL DEFAULT 0,
    duree_totale INT NOT NULL DEFAULT 0 -- durée en secondes
);

COMMENT ON TABLE public.training_sessions IS 'Sessions d''entraînement thématique ou par livre.';

-- ------------------------------------------------------------------------------
-- 6. TABLE: MATCH_SESSIONS (Parties de match)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.match_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    opponent_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    score_total INT NOT NULL DEFAULT 0,
    statut TEXT NOT NULL DEFAULT 'en_cours' CHECK (statut IN ('en_cours', 'termine', 'abandonne'))
);

COMMENT ON TABLE public.match_sessions IS 'Parties de match officiel en 3 manches (solo vs score ou duel).';

-- ------------------------------------------------------------------------------
-- 7. TABLE: MATCH_ROUNDS (Manches 1, 2 et 3 d''un match)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.match_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_session_id UUID NOT NULL REFERENCES public.match_sessions(id) ON DELETE CASCADE,
    numero_manche INT NOT NULL CHECK (numero_manche IN (1, 2, 3)),
    theme_choisi TEXT, -- nullable, uniquement pour la manche 2
    score_manche INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.match_rounds IS 'Détail par manche de match avec score et thème sélectionné en manche 2.';

-- ------------------------------------------------------------------------------
-- 8. TABLE: USER_ANSWERS (Réponses détaillées du joueur)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL, -- identifiant de training_sessions ou match_sessions
    session_type TEXT NOT NULL DEFAULT 'training' CHECK (session_type IN ('training', 'match')),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    reponse_donnee TEXT NOT NULL,
    est_correcte BOOLEAN NOT NULL,
    temps_reponse_ms INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.user_answers IS 'Audit et métriques de chaque réponse donnée par le joueur.';

-- ------------------------------------------------------------------------------
-- 9. TABLE: BADGES (Catalogue des accomplissements)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.badges (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'match' CHECK (category IN ('match', 'training', 'speed', 'mastery')),
    points_xp INT NOT NULL DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.badges IS 'Catalogue des badges de progression et prouesses bibliques.';

-- ------------------------------------------------------------------------------
-- 10. TABLE: USER_BADGES (Badges débloqués par les joueurs)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id, badge_id)
);

COMMENT ON TABLE public.user_badges IS 'Historique des récompenses obtenues par chaque joueur.';

-- ------------------------------------------------------------------------------
-- 11. VUES LEADERBOARD (Classement des meilleurs scores de match)
-- ------------------------------------------------------------------------------

-- Classement All-Time : meilleurs scores historiques
CREATE OR REPLACE VIEW public.leaderboard_all_time AS
SELECT 
    ms.user_id,
    COALESCE(u.pseudo, 'Disciple Anonyme') AS pseudo,
    MAX(ms.score_total) AS best_score,
    COUNT(ms.id) AS matches_played,
    MAX(ms.started_at) AS last_played_at,
    DENSE_RANK() OVER (ORDER BY MAX(ms.score_total) DESC, COUNT(ms.id) DESC) AS rank
FROM public.match_sessions ms
LEFT JOIN public.users u ON u.id = ms.user_id
WHERE ms.statut = 'termine'
GROUP BY ms.user_id, u.pseudo;

COMMENT ON VIEW public.leaderboard_all_time IS 'Classement officiel de tous les temps basé sur le meilleur score en match (max 200 pts).';

-- Classement 7 derniers jours : compétition hebdomadaire
CREATE OR REPLACE VIEW public.leaderboard_7_days AS
SELECT 
    ms.user_id,
    COALESCE(u.pseudo, 'Disciple Anonyme') AS pseudo,
    MAX(ms.score_total) AS best_score,
    COUNT(ms.id) AS matches_played,
    MAX(ms.started_at) AS last_played_at,
    DENSE_RANK() OVER (ORDER BY MAX(ms.score_total) DESC, COUNT(ms.id) DESC) AS rank
FROM public.match_sessions ms
LEFT JOIN public.users u ON u.id = ms.user_id
WHERE ms.statut = 'termine'
  AND ms.started_at >= (timezone('utc'::text, now()) - INTERVAL '7 days')
GROUP BY ms.user_id, u.pseudo;

COMMENT ON VIEW public.leaderboard_7_days IS 'Classement glissant des 7 derniers jours pour stimuler la compétition active.';

-- ==============================================================================
-- INDEXES DE RECHERCHE ET SÉLECTION ALÉATOIRE RAPIDE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_questions_book_id ON public.questions(book_id);
CREATE INDEX IF NOT EXISTS idx_questions_mode ON public.questions(mode);
CREATE INDEX IF NOT EXISTS idx_questions_theme ON public.questions(theme);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_format ON public.questions(format);

-- Index composites pour le tirage aléatoire optimisé selon le mode et critères
CREATE INDEX IF NOT EXISTS idx_questions_mode_diff ON public.questions(mode, difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_mode_theme ON public.questions(mode, theme) WHERE theme IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_questions_mode_book ON public.questions(mode, book_id) WHERE book_id IS NOT NULL;

-- Index annexes
CREATE INDEX IF NOT EXISTS idx_books_testament_pos ON public.books(testament, position);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_book ON public.user_progress(user_id, book_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_user ON public.training_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_match_sessions_user ON public.match_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_match_rounds_session ON public.match_rounds(match_session_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_session ON public.user_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_question ON public.user_answers(question_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;

-- 1. Books : lecture publique
CREATE POLICY "books_select_public" ON public.books
    FOR SELECT USING (true);

-- 2. Questions : lecture autorisée pour tous (joueurs connectés et anonymes)
CREATE POLICY "questions_select_public" ON public.questions
    FOR SELECT USING (true);

-- 3. Users : lecture publique de base, modification de son propre profil
CREATE POLICY "users_select_all" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "users_insert_own" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- 4. User Progress : accès réservé au joueur concerné
CREATE POLICY "user_progress_all_own" ON public.user_progress
    FOR ALL USING (auth.uid() = user_id);

-- 5. Training Sessions : accès réservé au joueur
CREATE POLICY "training_sessions_all_own" ON public.training_sessions
    FOR ALL USING (auth.uid() = user_id);

-- 6. Match Sessions : consultation par les participants
CREATE POLICY "match_sessions_select" ON public.match_sessions
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = opponent_user_id);

CREATE POLICY "match_sessions_insert_own" ON public.match_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "match_sessions_update_own" ON public.match_sessions
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = opponent_user_id);

-- 7. Match Rounds : consultation par le propriétaire du match
CREATE POLICY "match_rounds_all" ON public.match_rounds
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.match_sessions ms
            WHERE ms.id = match_rounds.match_session_id
            AND (ms.user_id = auth.uid() OR ms.opponent_user_id = auth.uid())
        )
    );

-- 8. User Answers : insertion et lecture par le joueur
CREATE POLICY "user_answers_insert" ON public.user_answers
    FOR INSERT WITH CHECK (
        -- Vérifie que l'utilisateur participe à la session
        EXISTS (
            SELECT 1 FROM public.training_sessions ts WHERE ts.id = user_answers.session_id AND ts.user_id = auth.uid()
        ) OR EXISTS (
            SELECT 1 FROM public.match_sessions ms WHERE ms.id = user_answers.session_id AND (ms.user_id = auth.uid() OR ms.opponent_user_id = auth.uid())
        )
    );

CREATE POLICY "user_answers_select" ON public.user_answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.training_sessions ts WHERE ts.id = user_answers.session_id AND ts.user_id = auth.uid()
        ) OR EXISTS (
            SELECT 1 FROM public.match_sessions ms WHERE ms.id = user_answers.session_id AND (ms.user_id = auth.uid() OR ms.opponent_user_id = auth.uid())
        )
    );

-- 9. Badges : lecture publique pour tous
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "badges_select_public" ON public.badges
    FOR SELECT USING (true);

-- 10. User Badges : consultation publique des succès et insertion pour son propre profil
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_badges_select_all" ON public.user_badges
    FOR SELECT USING (true);

CREATE POLICY "user_badges_insert_own" ON public.user_badges
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- SEED INITIAL DES BADGES MVP (8 Badges)
-- ==============================================================================
INSERT INTO public.badges (id, code, title, description, icon, category, points_xp)
VALUES
    ('badge-first-match', 'first_match', 'Premier Pas dans l''Arène', 'Terminer un match officiel complet en 3 manches.', 'Swords', 'match', 50),
    ('badge-perfect-round3', 'perfect_round3', 'Exégète Infaillible', 'Réaliser un sans-faute en Manche 3 (50/50 pts au chrono tendu de 15s).', 'Flame', 'match', 100),
    ('badge-perfect-blank', 'perfect_blank', 'Maître du Texte', 'Compléter sans aucune faute les 6 versets à trous de la Manche 2 (60/60 pts).', 'CheckCircle2', 'match', 80),
    ('badge-high-match', 'score_high_match', 'Champion de l''Arène', 'Obtenir un score total de 160 points ou plus sur un match (sur 200 max).', 'Trophy', 'match', 150),
    ('badge-first-training', 'first_training', 'Étudiant des Écritures', 'Compléter une première session solo d’entraînement progressif.', 'Sparkles', 'training', 30),
    ('badge-book-master-5', 'book_master_5', 'Scribe Fidèle', 'Compléter au moins 5 sessions d’entraînement sur un même livre biblique.', 'BookOpen', 'mastery', 120),
    ('badge-difficulty-max', 'difficulty_max', 'Sommet de la Sagesse', 'Atteindre le niveau maximal de difficulté (5/5) sur au moins un livre.', 'Crown', 'mastery', 200),
    ('badge-fast-responder', 'fast_responder', 'Vif comme l’Éclair', 'Donner une réponse correcte en moins de 3 secondes.', 'Zap', 'speed', 40)
ON CONFLICT (code) DO NOTHING;

-- ==============================================================================
-- TRIGGER : Synchronisation automatique auth.users -> public.users
-- ==============================================================================
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
