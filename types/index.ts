/**
-- ==============================================================================
-- SUPERQUIZZ BIBLIQUE - Types TypeScript Métier
-- Version Biblique : Louis Segond révisée 1910 (LSG 1910)
-- Module: /types/index.ts
-- ==============================================================================
 */

export type TestamentType = 'ancien' | 'nouveau';

export type QuestionMode = 
  | 'entrainement' 
  | 'match_manche1' 
  | 'match_manche2' 
  | 'match_manche3';

export type QuestionFormat = 
  | 'question_reponse' 
  | 'texte_a_trous' 
  | 'vrai_faux';

export type QuestionTheme =
  | 'villes'
  | 'rois'
  | 'reines'
  | 'prophétesses'
  | 'symboles'
  | 'la_femme'
  | 'montagnes'
  | 'cours_deau'
  | 'propheties'
  | 'livres_bible'
  | 'peres'
  | 'familles'
  | 'enfants_celebres'
  | 'jeunes_celebres'
  | 'moyens_transport'
  | 'armes'
  | 'guerres'
  | 'guerrieres_celebres'
  | 'guerriers_celebres'
  | 'tops_flops'
  | 'rois_majeurs'
  | 'maudits'
  | 'magie_magiciens'
  | 'peuples_civilisations'
  | 'edifices_celebres'
  | 'vallees_celebres'
  | 'divinites_celebres'
  | string;

export interface Book {
  id: string;
  name: string;
  testament: TestamentType;
  position: number;
}

export interface Utilisateur {
  id: string;
  email: string;
  pseudo: string;
  created_at: string;
}

export interface Question {
  id: string;
  book_id?: string | null;
  book_name?: string;
  mode: QuestionMode;
  theme?: QuestionTheme | null;
  format: QuestionFormat;
  question_text: string;
  correct_answer: string;
  wrong_answers: string[]; // tableau, vide pour vrai_faux
  difficulty: number; // 1-5
  reference_biblique: string; // ex: "Jean 3:16", LSG 1910
  created_at?: string;
}

export interface UserProgress {
  id?: string;
  user_id: string;
  book_id?: string;
  difficulty_atteinte?: number; // 1-5
  questions_vues?: string[]; // IDs des questions déjà rencontrées
  created_at?: string;
  updated_at?: string;

  // Gamification & Statistiques joueur
  level?: number;
  rank_title?: string;
  total_xp?: number;
  games_played?: number;
  win_count?: number;
  loss_count?: number;
  current_streak?: number;
  best_streak?: number;
  categories_mastery?: Record<string, number>;
  last_active_at?: string;
}

export interface TrainingSession {
  id: string;
  user_id: string;
  book_id?: string | null;
  started_at: string;
  score: number;
  duree_totale: number; // en secondes
}

export interface MatchSession {
  id: string;
  user_id: string;
  opponent_user_id?: string | null;
  started_at: string;
  score_total: number;
  statut: 'en_cours' | 'termine' | 'abandonne';
}

export interface MatchRound {
  id: string;
  match_session_id: string;
  numero_manche: 1 | 2 | 3;
  theme_choisi?: QuestionTheme | null;
  score_manche: number;
  created_at?: string;
}

export interface UserAnswer {
  id: string;
  session_id: string;
  session_type?: 'training' | 'match';
  question_id: string;
  reponse_donnee: string;
  est_correcte: boolean;
  temps_reponse_ms: number;
  created_at?: string;
}

/**
 * Types Badges & Réalisations (Tables badges et user_badges)
 */
export interface BadgeItem {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string; // nom lucide-react ou emoji
  category: 'match' | 'training' | 'speed' | 'mastery';
  points_xp: number;
  created_at?: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  unlocked_at: string;
  badge?: BadgeItem;
}

/**
 * Types Classement (Table / Vue leaderboard)
 */
export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  pseudo: string;
  best_score: number;
  matches_played: number;
  last_played_at: string;
  is_current_user?: boolean;
}

export interface BookDifficultyProgress {
  book_id: string;
  book_name: string;
  testament: TestamentType;
  position: number;
  difficulty_atteinte: number; // 1-5
  sessions_completed: number;
  last_trained_at?: string;
}

export interface UserProgressionOverview {
  user_id: string;
  pseudo: string;
  total_score_cumule: number; // entraînement + matchs
  matches_played: number;
  best_match_score: number; // sur 200 pts
  training_sessions_count: number;
  books_progress: BookDifficultyProgress[];
  unlocked_badges: UserBadge[];
  all_badges: BadgeItem[];
}

/**
 * Types pour React Navigation
 */
export type RootStackParamList = {
  MainTabs: undefined;
  Auth: undefined;
  Training: { bookId?: string; difficulty?: number } | undefined;
  Match: { round?: number } | undefined;
  Leaderboard: undefined;
  Profile: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Training: undefined;
  Match: undefined;
  Leaderboard: undefined;
  Profile: undefined;
};
