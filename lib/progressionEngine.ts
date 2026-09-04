/**
 * Moteur de Progression, Compétition & Système de Badges
 * Module: /lib/progressionEngine.ts
 * Version Biblique : Louis Segond révisée 1910 (LSG 1910)
 */

import { supabase, isSupabaseConfigured } from './supabase';
import { BIBLE_BOOKS } from './seedQuestions';
import type { 
  BadgeItem, 
  UserBadge, 
  LeaderboardEntry, 
  BookDifficultyProgress, 
  UserProgressionOverview,
  MatchSession,
  TrainingSession
} from '@/types';

export const LOCAL_BADGES_KEY = 'sq_badges_catalog_v1';
export const LOCAL_USER_BADGES_KEY = 'sq_user_badges_v1';
export const LOCAL_MATCH_SESSIONS_KEY = 'sq_match_sessions_v1';
export const LOCAL_TRAINING_SESSIONS_KEY = 'sq_training_sessions_v1';
export const LOCAL_PROGRESS_KEY = 'sq_user_progress_v1';

// ==============================================================================
// 1. CATALOGUE DES 8 BADGES OFFICIELS DU MVP
// ==============================================================================
export const BADGES_CATALOG: BadgeItem[] = [
  {
    id: 'badge-first-match',
    code: 'first_match',
    title: "Premier Pas dans l'Arène",
    description: 'Terminer un match officiel complet en 3 manches.',
    icon: 'Swords',
    category: 'match',
    points_xp: 50,
  },
  {
    id: 'badge-perfect-round3',
    code: 'perfect_round3',
    title: 'Exégète Infaillible',
    description: 'Réaliser un sans-faute en Manche 3 (50/50 pts au chrono tendu de 15s).',
    icon: 'Flame',
    category: 'match',
    points_xp: 100,
  },
  {
    id: 'badge-perfect-blank',
    code: 'perfect_blank',
    title: 'Maître du Texte',
    description: 'Compléter sans aucune faute les 6 versets à trous de la Manche 2 (60/60 pts).',
    icon: 'CheckCircle2',
    category: 'match',
    points_xp: 80,
  },
  {
    id: 'badge-high-match',
    code: 'score_high_match',
    title: "Champion de l'Arène",
    description: 'Obtenir un score total de 160 points ou plus sur un match (sur 200 max).',
    icon: 'Trophy',
    category: 'match',
    points_xp: 150,
  },
  {
    id: 'badge-first-training',
    code: 'first_training',
    title: 'Étudiant des Écritures',
    description: 'Compléter une première session solo d’entraînement progressif.',
    icon: 'Sparkles',
    category: 'training',
    points_xp: 30,
  },
  {
    id: 'badge-book-master-5',
    code: 'book_master_5',
    title: 'Scribe Fidèle',
    description: 'Compléter au moins 5 sessions d’entraînement sur un même livre biblique.',
    icon: 'BookOpen',
    category: 'mastery',
    points_xp: 120,
  },
  {
    id: 'badge-difficulty-max',
    code: 'difficulty_max',
    title: 'Sommet de la Sagesse',
    description: 'Atteindre le niveau maximal de difficulté (5/5) sur au moins un livre.',
    icon: 'Crown',
    category: 'mastery',
    points_xp: 200,
  },
  {
    id: 'badge-fast-responder',
    code: 'fast_responder',
    title: 'Vif comme l’Éclair',
    description: 'Donner une réponse correcte en moins de 3 secondes.',
    icon: 'Zap',
    category: 'speed',
    points_xp: 40,
  },
];

// Gestionnaire d'abonnements pour rafraîchissement réactif
type ProgressionListener = () => void;
const listeners = new Set<ProgressionListener>();

export function subscribeProgressionUpdates(listener: ProgressionListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifyProgressionUpdated(): void {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error('[ProgressionEngine] Erreur listener:', e);
    }
  });
}

// ==============================================================================
// 2. RÉCUPÉRATION DE L'HISTORIQUE & CALCUL DU PROFIL
// ==============================================================================

/**
 * Récupère les sessions de match d'un utilisateur (Supabase + localStorage)
 */
export async function getUserMatchSessions(userId: string): Promise<MatchSession[]> {
  const localList: MatchSession[] = [];
  try {
    const raw = localStorage.getItem(LOCAL_MATCH_SESSIONS_KEY);
    if (raw) {
      const parsed: MatchSession[] = JSON.parse(raw);
      localList.push(...parsed.filter((s) => s.user_id === userId || userId === 'guest'));
    }
  } catch {
    // Ignore
  }

  if (isSupabaseConfigured() && userId && userId !== 'guest') {
    try {
      const { data, error } = await supabase
        .from('match_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false });

      if (!error && data) {
        // Fusionner sans doublon
        const ids = new Set(data.map((s) => s.id));
        const filteredLocal = localList.filter((s) => !ids.has(s.id));
        return [...data, ...filteredLocal];
      }
    } catch (e) {
      console.warn('[ProgressionEngine] Échec fetch match_sessions Supabase:', e);
    }
  }

  return localList;
}

/**
 * Récupère les sessions d'entraînement d'un utilisateur (Supabase + localStorage)
 */
export async function getUserTrainingSessions(userId: string): Promise<TrainingSession[]> {
  const localList: TrainingSession[] = [];
  try {
    const raw = localStorage.getItem(LOCAL_TRAINING_SESSIONS_KEY);
    if (raw) {
      const parsed: TrainingSession[] = JSON.parse(raw);
      localList.push(...parsed.filter((s) => s.user_id === userId || userId === 'guest'));
    }
  } catch {
    // Ignore
  }

  if (isSupabaseConfigured() && userId && userId !== 'guest') {
    try {
      const { data, error } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false });

      if (!error && data) {
        const ids = new Set(data.map((s) => s.id));
        const filteredLocal = localList.filter((s) => !ids.has(s.id));
        return [...data, ...filteredLocal];
      }
    } catch (e) {
      console.warn('[ProgressionEngine] Échec fetch training_sessions Supabase:', e);
    }
  }

  return localList;
}

/**
 * Récupère les badges débloqués par l'utilisateur
 */
export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  const localBadges: UserBadge[] = [];
  try {
    const raw = localStorage.getItem(`${LOCAL_USER_BADGES_KEY}_${userId}`);
    if (raw) {
      localBadges.push(...JSON.parse(raw));
    }
  } catch {
    // Ignore
  }

  if (isSupabaseConfigured() && userId && userId !== 'guest') {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userId);

      if (!error && data) {
        const ids = new Set(data.map((b) => b.badge_id));
        const filteredLocal = localBadges.filter((b) => !ids.has(b.badge_id));
        const merged = [...data, ...filteredLocal];
        return merged.map((ub) => ({
          ...ub,
          badge: BADGES_CATALOG.find((b) => b.id === ub.badge_id || b.code === ub.badge_id),
        }));
      }
    } catch (e) {
      console.warn('[ProgressionEngine] Échec fetch user_badges Supabase:', e);
    }
  }

  return localBadges.map((ub) => ({
    ...ub,
    badge: BADGES_CATALOG.find((b) => b.id === ub.badge_id || b.code === ub.badge_id),
  }));
}

/**
 * Récupère le dictionnaire de progression par livre (difficulté 1-5, nombre de sessions)
 */
export async function getBooksProgress(userId: string): Promise<BookDifficultyProgress[]> {
  const trainingSessions = await getUserTrainingSessions(userId);

  // Comptabiliser les sessions par livre
  const sessionCountByBook: Record<string, { count: number; lastTrained: string }> = {};
  for (const s of trainingSessions) {
    if (s.book_id) {
      if (!sessionCountByBook[s.book_id]) {
        sessionCountByBook[s.book_id] = { count: 0, lastTrained: s.started_at };
      }
      sessionCountByBook[s.book_id].count += 1;
      if (new Date(s.started_at) > new Date(sessionCountByBook[s.book_id].lastTrained)) {
        sessionCountByBook[s.book_id].lastTrained = s.started_at;
      }
    }
  }

  // Dictionnaire local des difficultés enregistrées
  const localProgressMap: Record<string, number> = {};
  for (const book of BIBLE_BOOKS) {
    const key = `${LOCAL_PROGRESS_KEY}_${userId}_${book.id}`;
    const altKey = `${LOCAL_PROGRESS_KEY}_${userId}_${book.name}`;
    try {
      const raw = localStorage.getItem(key) || localStorage.getItem(altKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.difficulty_atteinte) {
          localProgressMap[book.id] = parsed.difficulty_atteinte;
        }
      }
    } catch {
      // Ignore
    }
  }

  // Supabase si connecté
  if (isSupabaseConfigured() && userId && userId !== 'guest') {
    try {
      const { data } = await supabase
        .from('user_progress')
        .select('book_id, difficulty_atteinte')
        .eq('user_id', userId);

      if (data) {
        for (const p of data) {
          if (p.book_id && p.difficulty_atteinte) {
            localProgressMap[p.book_id] = p.difficulty_atteinte;
          }
        }
      }
    } catch {
      // Ignore
    }
  }

  // Compiler pour les 66 livres
  return BIBLE_BOOKS.map((b) => {
    const difficulty = localProgressMap[b.id] || 1;
    const sessionInfo = sessionCountByBook[b.id] || sessionCountByBook[b.name] || { count: 0, lastTrained: '' };

    return {
      book_id: b.id,
      book_name: b.name,
      testament: b.testament,
      position: b.position,
      difficulty_atteinte: difficulty,
      sessions_completed: sessionInfo.count,
      last_trained_at: sessionInfo.lastTrained,
    };
  });
}

/**
 * Vue globale d'ensemble du joueur (Profil)
 */
export async function getUserProgressionOverview(
  userId: string,
  pseudo: string = 'Disciple'
): Promise<UserProgressionOverview> {
  const [matchSessions, trainingSessions, unlockedBadges, booksProgress] = await Promise.all([
    getUserMatchSessions(userId),
    getUserTrainingSessions(userId),
    getUserBadges(userId),
    getBooksProgress(userId),
  ]);

  // Filtrer les matchs terminés
  const completedMatches = matchSessions.filter((m) => m.statut === 'termine');

  // Meilleur score en match
  const bestMatchScore = completedMatches.length > 0
    ? Math.max(...completedMatches.map((m) => m.score_total))
    : 0;

  // Total des points de match
  const totalMatchScore = completedMatches.reduce((sum, m) => sum + (m.score_total || 0), 0);

  // Total des points d'entraînement (score max 100 par session)
  const totalTrainingScore = trainingSessions.reduce((sum, t) => sum + (t.score || 0), 0);

  // Score cumulé total (entraînement + matchs)
  const totalScoreCumule = totalMatchScore + totalTrainingScore;

  return {
    user_id: userId,
    pseudo,
    total_score_cumule: totalScoreCumule,
    matches_played: completedMatches.length,
    best_match_score: bestMatchScore,
    training_sessions_count: trainingSessions.length,
    books_progress: booksProgress,
    unlocked_badges: unlockedBadges,
    all_badges: BADGES_CATALOG,
  };
}

// ==============================================================================
// 3. SYSTÈME D'ATTRIBUTION DES BADGES
// ==============================================================================

export interface BadgeEvaluationContext {
  userId: string;
  eventType: 'match_completed' | 'training_completed' | 'fast_answer';
  matchScoreTotal?: number;
  scoreManche2?: number;
  scoreManche3?: number;
  trainingScore?: number;
  bookId?: string;
  newBookDifficulty?: number;
  answerTimeMs?: number;
  isAnswerCorrect?: boolean;
}

/**
 * Évalue et débloque les badges admissibles, et les persiste dans user_badges
 */
export async function checkAndUnlockBadges(
  context: BadgeEvaluationContext
): Promise<BadgeItem[]> {
  const { userId, eventType } = context;
  const currentBadges = await getUserBadges(userId);
  const existingCodes = new Set(
    currentBadges.map((ub) => ub.badge?.code || ub.badge_id)
  );

  const newlyUnlocked: BadgeItem[] = [];

  const grantBadge = async (code: string) => {
    if (existingCodes.has(code)) return;
    const badgeItem = BADGES_CATALOG.find((b) => b.code === code);
    if (!badgeItem) return;

    existingCodes.add(code);
    newlyUnlocked.push(badgeItem);

    // 1. Sauvegarde locale
    const newRecord: UserBadge = {
      id: `ub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      badge_id: badgeItem.id,
      unlocked_at: new Date().toISOString(),
      badge: badgeItem,
    };

    try {
      const key = `${LOCAL_USER_BADGES_KEY}_${userId}`;
      const raw = localStorage.getItem(key);
      const list: UserBadge[] = raw ? JSON.parse(raw) : [];
      list.push(newRecord);
      localStorage.setItem(key, JSON.stringify(list));
    } catch {
      // Ignore
    }

    // 2. Sauvegarde Supabase
    if (isSupabaseConfigured() && userId && userId !== 'guest') {
      try {
        await supabase.from('user_badges').insert({
          user_id: userId,
          badge_id: badgeItem.id,
          unlocked_at: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('[ProgressionEngine] Échec insert user_badges Supabase:', e);
      }
    }
  };

  // --- RÈGLE 1 : Premier match terminé ---
  if (eventType === 'match_completed') {
    await grantBadge('first_match');

    // Sans-faute Manche 3 (50 pts)
    if (context.scoreManche3 === 50) {
      await grantBadge('perfect_round3');
    }

    // Sans-faute Manche 2 (60 pts)
    if (context.scoreManche2 === 60) {
      await grantBadge('perfect_blank');
    }

    // Score élevé en match (>= 160)
    if ((context.matchScoreTotal || 0) >= 160) {
      await grantBadge('score_high_match');
    }
  }

  // --- RÈGLE 2 : Entraînement solo ---
  if (eventType === 'training_completed') {
    await grantBadge('first_training');

    if (context.newBookDifficulty === 5) {
      await grantBadge('difficulty_max');
    }

    if (context.bookId) {
      const trainingSessions = await getUserTrainingSessions(userId);
      const onThisBook = trainingSessions.filter((s) => s.book_id === context.bookId).length;
      if (onThisBook >= 5) {
        await grantBadge('book_master_5');
      }
    }
  }

  // --- RÈGLE 3 : Vitesse éclair ---
  if (eventType === 'fast_answer') {
    if (context.isAnswerCorrect && (context.answerTimeMs || 9999) < 3000) {
      await grantBadge('fast_responder');
    }
  }

  if (newlyUnlocked.length > 0) {
    notifyProgressionUpdated();
  }

  return newlyUnlocked;
}

// ==============================================================================
// 4. MOTEUR DU CLASSEMENT (TABLE / VUE LEADERBOARD)
// ==============================================================================

/**
 * Joueurs bibliques fictifs compétitifs pour alimenter le top 20 vivant
 */
const SEED_LEADERBOARD_PLAYERS: Array<{
  id: string;
  pseudo: string;
  score7d: number;
  scoreAllTime: number;
  matches7d: number;
  matchesAllTime: number;
  daysAgo: number;
}> = [
  { id: 'bot-01', pseudo: "Apollos d'Alexandrie", score7d: 190, scoreAllTime: 200, matches7d: 14, matchesAllTime: 48, daysAgo: 1 },
  { id: 'bot-02', pseudo: 'Priscille la Fidèle', score7d: 180, scoreAllTime: 190, matches7d: 11, matchesAllTime: 42, daysAgo: 2 },
  { id: 'bot-03', pseudo: 'Gamaliel le Sage', score7d: 180, scoreAllTime: 190, matches7d: 9, matchesAllTime: 39, daysAgo: 1 },
  { id: 'bot-04', pseudo: "Timothée d'Éphèse", score7d: 170, scoreAllTime: 180, matches7d: 15, matchesAllTime: 36, daysAgo: 3 },
  { id: 'bot-05', pseudo: 'Phoebé de Cenchrées', score7d: 170, scoreAllTime: 180, matches7d: 8, matchesAllTime: 31, daysAgo: 2 },
  { id: 'bot-06', pseudo: 'Étienne le Témoin', score7d: 160, scoreAllTime: 180, matches7d: 12, matchesAllTime: 35, daysAgo: 4 },
  { id: 'bot-07', pseudo: 'Lydie de Thyatire', score7d: 160, scoreAllTime: 170, matches7d: 10, matchesAllTime: 28, daysAgo: 2 },
  { id: 'bot-08', pseudo: 'Aquilas le Compagnon', score7d: 150, scoreAllTime: 170, matches7d: 7, matchesAllTime: 29, daysAgo: 3 },
  { id: 'bot-09', pseudo: 'Barnabas le Consolateur', score7d: 150, scoreAllTime: 170, matches7d: 9, matchesAllTime: 33, daysAgo: 1 },
  { id: 'bot-10', pseudo: 'Silas le Chantre', score7d: 140, scoreAllTime: 160, matches7d: 6, matchesAllTime: 25, daysAgo: 5 },
  { id: 'bot-11', pseudo: 'Tite de Crète', score7d: 140, scoreAllTime: 160, matches7d: 8, matchesAllTime: 22, daysAgo: 4 },
  { id: 'bot-12', pseudo: 'Nathanaël sans Fraude', score7d: 140, scoreAllTime: 160, matches7d: 5, matchesAllTime: 20, daysAgo: 6 },
  { id: 'bot-13', pseudo: 'Marie de Béthanie', score7d: 130, scoreAllTime: 160, matches7d: 11, matchesAllTime: 27, daysAgo: 2 },
  { id: 'bot-14', pseudo: 'Nicodème le Chercheur', score7d: 130, scoreAllTime: 150, matches7d: 7, matchesAllTime: 24, daysAgo: 3 },
  { id: 'bot-15', pseudo: 'Onésiphore le Courageux', score7d: 130, scoreAllTime: 150, matches7d: 6, matchesAllTime: 19, daysAgo: 5 },
  { id: 'bot-16', pseudo: 'Épaphrodite l’Envoyé', score7d: 120, scoreAllTime: 150, matches7d: 4, matchesAllTime: 18, daysAgo: 6 },
  { id: 'bot-17', pseudo: 'Dorcas la Bienfaitrice', score7d: 120, scoreAllTime: 140, matches7d: 8, matchesAllTime: 21, daysAgo: 2 },
  { id: 'bot-18', pseudo: 'Philémon de Colosses', score7d: 110, scoreAllTime: 140, matches7d: 5, matchesAllTime: 17, daysAgo: 4 },
  { id: 'bot-19', pseudo: 'Cléopas d’Emmaüs', score7d: 110, scoreAllTime: 130, matches7d: 6, matchesAllTime: 16, daysAgo: 3 },
  { id: 'bot-20', pseudo: 'Zachée de Jéricho', score7d: 100, scoreAllTime: 130, matches7d: 5, matchesAllTime: 15, daysAgo: 5 },
  { id: 'bot-21', pseudo: 'Barthélemy l’Apôtre', score7d: 90, scoreAllTime: 120, matches7d: 4, matchesAllTime: 14, daysAgo: 6 },
  { id: 'bot-22', pseudo: 'Tertius le Copiste', score7d: 90, scoreAllTime: 120, matches7d: 3, matchesAllTime: 12, daysAgo: 5 },
  { id: 'bot-23', pseudo: 'Ananias de Damas', score7d: 80, scoreAllTime: 110, matches7d: 2, matchesAllTime: 10, daysAgo: 7 },
  { id: 'bot-24', pseudo: 'Gaius de Derbé', score7d: 80, scoreAllTime: 110, matches7d: 3, matchesAllTime: 9, daysAgo: 6 },
  { id: 'bot-25', pseudo: 'Rufus le Choisi', score7d: 70, scoreAllTime: 100, matches7d: 2, matchesAllTime: 8, daysAgo: 7 },
];

export interface LeaderboardResult {
  period: '7days' | 'alltime';
  top20: LeaderboardEntry[];
  currentUserRank: LeaderboardEntry | null;
  isUserInTop20: boolean;
  totalParticipants: number;
}

/**
 * Calcule et renvoie le classement Top 20 + la position du joueur connecté
 */
export async function getLeaderboard(
  period: '7days' | 'alltime',
  currentUserId: string,
  currentUserPseudo: string = 'Vous'
): Promise<LeaderboardResult> {
  const userMatches = await getUserMatchSessions(currentUserId);
  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  // Filtrer les matchs terminés du joueur
  const eligibleUserMatches = userMatches.filter((m) => {
    if (m.statut !== 'termine') return false;
    if (period === '7days') {
      const matchTime = new Date(m.started_at).getTime();
      return now - matchTime <= sevenDaysMs;
    }
    return true;
  });

  const userBestScore = eligibleUserMatches.length > 0
    ? Math.max(...eligibleUserMatches.map((m) => m.score_total))
    : 0;

  const userMatchesCount = eligibleUserMatches.length;
  const userLastPlayed = eligibleUserMatches.length > 0
    ? eligibleUserMatches[0].started_at
    : new Date().toISOString();

  // Construire la liste combinée de participants
  const entries: Array<{
    user_id: string;
    pseudo: string;
    best_score: number;
    matches_played: number;
    last_played_at: string;
    is_current_user: boolean;
  }> = [];

  // Ajouter les bots
  for (const bot of SEED_LEADERBOARD_PLAYERS) {
    const score = period === '7days' ? bot.score7d : bot.scoreAllTime;
    const matches = period === '7days' ? bot.matches7d : bot.matchesAllTime;
    const playedDate = new Date(now - bot.daysAgo * 24 * 60 * 60 * 1000).toISOString();

    entries.push({
      user_id: bot.id,
      pseudo: bot.pseudo,
      best_score: score,
      matches_played: matches,
      last_played_at: playedDate,
      is_current_user: false,
    });
  }

  // Ajouter ou mettre à jour le joueur connecté s'il a au moins un match
  // Si le joueur n'a pas encore de match, on lui crée une entrée virtuelle avec 0 pt pour connaître sa position
  entries.push({
    user_id: currentUserId,
    pseudo: currentUserPseudo || 'Vous',
    best_score: userBestScore,
    matches_played: userMatchesCount,
    last_played_at: userLastPlayed,
    is_current_user: true,
  });

  // Si Supabase est connecté, tenter de récupérer les vrais scores d'autres utilisateurs réels
  if (isSupabaseConfigured()) {
    try {
      const viewName = period === '7days' ? 'leaderboard_7_days' : 'leaderboard_all_time';
      const { data, error } = await supabase
        .from(viewName)
        .select('*')
        .limit(30);

      if (!error && data && data.length > 0) {
        // Remplacer les doublons par les données Supabase
        for (const row of data) {
          const existingIdx = entries.findIndex((e) => e.user_id === row.user_id);
          const isMe = row.user_id === currentUserId;
          const mapped = {
            user_id: row.user_id,
            pseudo: row.pseudo || 'Disciple Anonyme',
            best_score: row.best_score || 0,
            matches_played: row.matches_played || 1,
            last_played_at: row.last_played_at || new Date().toISOString(),
            is_current_user: isMe,
          };
          if (existingIdx >= 0) {
            entries[existingIdx] = mapped;
          } else {
            entries.push(mapped);
          }
        }
      }
    } catch {
      // Ignore
    }
  }

  // Tri par meilleur score DESC, puis par nombre de matchs DESC
  entries.sort((a, b) => {
    if (b.best_score !== a.best_score) {
      return b.best_score - a.best_score;
    }
    return b.matches_played - a.matches_played;
  });

  // Calcul du classement DENSE_RANK
  let currentRank = 1;
  const rankedEntries: LeaderboardEntry[] = entries.map((entry, index) => {
    if (index > 0 && entry.best_score < entries[index - 1].best_score) {
      currentRank = index + 1;
    }
    return {
      ...entry,
      rank: currentRank,
    };
  });

  const top20 = rankedEntries.slice(0, 20);
  const currentUserEntry = rankedEntries.find((e) => e.is_current_user) || null;
  const isUserInTop20 = top20.some((e) => e.is_current_user);

  return {
    period,
    top20,
    currentUserRank: currentUserEntry,
    isUserInTop20,
    totalParticipants: rankedEntries.length,
  };
}
