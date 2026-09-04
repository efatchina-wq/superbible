/**
 * Écran Profil & Progression (ProfileScreen)
 * Module: /app/ProfileScreen.tsx
 * Version Biblique : Louis Segond révisée 1910 (LSG 1910)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, 
  Trophy, 
  Flame, 
  Award, 
  Settings, 
  LogOut, 
  LogIn, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  Database, 
  CheckCircle, 
  AlertCircle,
  Swords,
  BookOpen,
  Sparkles,
  Crown,
  Zap,
  CheckCircle2,
  Lock,
  Search,
  ChevronRight,
  RotateCw,
  TrendingUp,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { useAuthStore } from '@/store/useAuthStore';
import { useUserStore } from '@/store/useUserStore';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useAppNavigation } from './navigation';
import { 
  getUserProgressionOverview, 
  subscribeProgressionUpdates 
} from '@/lib/progressionEngine';
import type { 
  UserProgressionOverview, 
  BadgeItem, 
  BookDifficultyProgress 
} from '@/types';

export const ProfileScreen: React.FC = () => {
  const { user, isAuthenticated, signOut } = useAuthStore();
  const { soundEnabled, hapticsEnabled, toggleSound, toggleHaptics } = useUserStore();
  const { navigate } = useAppNavigation();

  const userId = user?.id || 'demo-user-123';
  const pseudo = user?.pseudo || 'Disciple';
  const isConfigured = isSupabaseConfigured();

  const [overview, setOverview] = useState<UserProgressionOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookSearch, setBookSearch] = useState('');
  const [testamentFilter, setTestamentFilter] = useState<'tous' | 'ancien' | 'nouveau'>('tous');
  const [selectedBadge, setSelectedBadge] = useState<BadgeItem | null>(null);

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const data = await getUserProgressionOverview(userId, pseudo);
      setOverview(data);
    } catch (e) {
      console.error('[ProfileScreen] Erreur fetch progression:', e);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [userId, pseudo]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Écoute automatique des fins de parties (Match & Solo) pour éviter tout cache obsolète
  useEffect(() => {
    const unsubscribe = subscribeProgressionUpdates(() => {
      loadData(true);
    });
    return unsubscribe;
  }, [loadData]);

  // Filtrage des livres pour la vue de difficulté par livre
  const filteredBooks = (overview?.books_progress || []).filter((book) => {
    const matchSearch = book.book_name.toLowerCase().includes(bookSearch.toLowerCase().trim());
    const matchTestament = testamentFilter === 'tous' || book.testament === testamentFilter;
    return matchSearch && matchTestament;
  });

  // Calcul du nombre de badges débloqués
  const unlockedCodes = new Set(
    (overview?.unlocked_badges || []).map((ub) => ub.badge?.code || ub.badge_id)
  );

  // Dictionnaire d'icônes pour les badges
  const renderBadgeIcon = (iconName: string, className = 'w-5 h-5') => {
    switch (iconName) {
      case 'Swords': return <Swords className={className} />;
      case 'Flame': return <Flame className={className} />;
      case 'CheckCircle2': return <CheckCircle2 className={className} />;
      case 'Trophy': return <Trophy className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'BookOpen': return <BookOpen className={className} />;
      case 'Crown': return <Crown className={className} />;
      case 'Zap': return <Zap className={className} />;
      default: return <Award className={className} />;
    }
  };

  return (
    <div className="flex flex-col min-h-full pb-28">
      <Header
        title="Profil & Progression"
        subtitle="Vos statistiques et réalisations bibliques"
        rightAction={
          <button
            onClick={() => loadData()}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-slate-700 transition-colors"
            title="Rafraîchir les données"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        }
      />

      <div className="p-4 flex flex-col gap-6 max-w-lg mx-auto w-full">
        {/* En-tête Identité */}
        <Card variant="gradient" padding="lg" className="text-center relative overflow-hidden">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-300 p-1 flex items-center justify-center shadow-lg shadow-amber-500/20 mb-3">
            <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center text-amber-400 font-black text-2xl">
              {pseudo.slice(0, 2).toUpperCase()}
            </div>
          </div>

          <h2 className="text-lg font-black text-white">
            {pseudo}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {user?.email || 'Compte local actif'}
          </p>

          <div className="mt-3 flex items-center justify-center gap-2">
            <Badge variant="gold" size="md">
              {overview && overview.best_match_score >= 150 ? 'Maître des Écritures' : 'Disciple Fidèle'}
            </Badge>
            <Badge variant="outline" size="md">
              LSG 1910
            </Badge>
          </div>
        </Card>

        {/* 1. LES 4 STATISTIQUES CLÉS DE PROGRESSION EXIGÉES */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 block px-0.5">
            Bilan de Compétition & Progression
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {/* Score cumulé total (entraînement + matchs) */}
            <Card variant="default" padding="md" className="border-amber-500/30 bg-amber-950/10">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Score Cumulé Total</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-black text-amber-400 mt-2">
                {overview?.total_score_cumule || 0}
              </p>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Solo + Matchs cumulés
              </span>
            </Card>

            {/* Meilleur score en match (sur 200 pts) */}
            <Card variant="default" padding="md" className="border-blue-500/30 bg-blue-950/10">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Meilleur Score Match</span>
                <Trophy className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-black text-white">
                  {overview?.best_match_score || 0}
                </span>
                <span className="text-xs text-slate-400 font-bold">/ 200</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Record en 3 manches
              </span>
            </Card>

            {/* Nombre de matchs joués */}
            <Card variant="default" padding="md">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Matchs Disputés</span>
                <Swords className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xl font-black text-emerald-400 mt-2">
                {overview?.matches_played || 0}
              </p>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Parties complètes terminées
              </span>
            </Card>

            {/* Sessions d'entraînement solo */}
            <Card variant="default" padding="md">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Entraînements Solo</span>
                <BookOpen className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-xl font-black text-purple-400 mt-2">
                {overview?.training_sessions_count || 0}
              </p>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Sessions de 10 questions
              </span>
            </Card>
          </div>
        </div>

        {/* 2. SYSTÈME DE BADGES (TABLE BADGES & USER_BADGES) */}
        <div>
          <div className="flex items-center justify-between mb-2.5 px-0.5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Badges & Trophées Bibliques
              </label>
              <span className="text-[11px] text-slate-500">
                {unlockedCodes.size} sur {overview?.all_badges.length || 8} débloqués
              </span>
            </div>
            <Badge variant="gold" size="sm">
              MVP 8 Badges
            </Badge>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {(overview?.all_badges || []).map((badge) => {
              const isUnlocked = unlockedCodes.has(badge.code) || unlockedCodes.has(badge.id);
              const userBadgeRecord = overview?.unlocked_badges.find(
                (ub) => ub.badge?.code === badge.code || ub.badge_id === badge.id
              );

              return (
                <div
                  key={badge.id}
                  onClick={() => setSelectedBadge(badge)}
                  className={`p-2.5 rounded-2xl border text-center cursor-pointer transition-all active:scale-95 flex flex-col items-center justify-between relative group ${
                    isUnlocked
                      ? 'bg-amber-500/10 border-amber-500/40 hover:border-amber-400 shadow-md shadow-amber-500/10'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 opacity-65'
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105 ${
                      isUnlocked
                        ? 'bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isUnlocked ? (
                      renderBadgeIcon(badge.icon, 'w-5 h-5')
                    ) : (
                      <Lock className="w-4 h-4 text-slate-500" />
                    )}
                  </div>

                  <span className={`text-[10px] font-bold leading-tight truncate w-full ${
                    isUnlocked ? 'text-slate-200' : 'text-slate-500'
                  }`}>
                    {badge.title}
                  </span>

                  <span className={`text-[9px] mt-1 font-semibold ${
                    isUnlocked ? 'text-amber-400' : 'text-slate-600'
                  }`}>
                    +{badge.points_xp} XP
                  </span>
                </div>
              );
            })}
          </div>

          {/* Modal / Fiche de détail du badge sélectionné */}
          <AnimatePresence>
            {selectedBadge && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="mt-3 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 relative"
              >
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="absolute top-2.5 right-2.5 text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded-lg bg-slate-800"
                >
                  ✕
                </button>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    unlockedCodes.has(selectedBadge.code)
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-500'
                  }`}>
                    {unlockedCodes.has(selectedBadge.code)
                      ? renderBadgeIcon(selectedBadge.icon, 'w-6 h-6')
                      : <Lock className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white">
                        {selectedBadge.title}
                      </h4>
                      {unlockedCodes.has(selectedBadge.code) ? (
                        <Badge variant="success" size="sm">Débloqué</Badge>
                      ) : (
                        <Badge variant="outline" size="sm">À débloquer</Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">
                      {selectedBadge.description}
                    </p>
                    <span className="text-[10px] text-amber-400 font-bold block mt-1">
                      Récompense : +{selectedBadge.points_xp} XP
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. NIVEAU DE DIFFICULTÉ ATTEINT PAR LIVRE (EXIGENCE FORMELLE) */}
        <div>
          <div className="flex items-center justify-between mb-2.5 px-0.5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Niveau de Difficulté par Livre
              </label>
              <span className="text-[11px] text-slate-500">
                Progression 1 à 5 sur les 66 livres de la Bible (LSG 1910)
              </span>
            </div>
            <Badge variant="info" size="sm">
              {overview?.books_progress.filter((b) => b.difficulty_atteinte >= 2).length || 0} entamés
            </Badge>
          </div>

          {/* Filtres de recherche et testament */}
          <div className="space-y-2 mb-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher un livre (Genèse, Psaumes, Jean...)"
                value={bookSearch}
                onChange={(e) => setBookSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
              {[
                { id: 'tous' as const, label: 'Tous (66)' },
                { id: 'ancien' as const, label: 'Ancien T. (39)' },
                { id: 'nouveau' as const, label: 'Nouveau T. (27)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTestamentFilter(tab.id)}
                  className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                    testamentFilter === tab.id
                      ? 'bg-slate-800 text-amber-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Liste déroulante des livres avec indicateur de difficulté */}
          <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
            {filteredBooks.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 bg-slate-900 rounded-xl">
                Aucun livre ne correspond à votre recherche.
              </div>
            ) : (
              filteredBooks.map((book) => {
                const diff = book.difficulty_atteinte || 1;
                return (
                  <div
                    key={book.book_id}
                    className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-[10px] font-bold text-slate-500 w-5 text-center">
                        {book.position}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white truncate">
                            {book.book_name}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-medium shrink-0">
                            {book.testament === 'ancien' ? 'AT' : 'NT'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {book.sessions_completed} session{book.sessions_completed > 1 ? 's' : ''} jouée{book.sessions_completed > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Jauge / Étoiles de difficulté 1-5 */}
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((starLevel) => (
                            <div
                              key={starLevel}
                              className={`w-2 h-3.5 rounded-xs transition-colors ${
                                starLevel <= diff
                                  ? 'bg-amber-400 shadow-xs shadow-amber-400/50'
                                  : 'bg-slate-800'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-amber-400 mt-0.5">
                          Niv. {diff}/5
                        </span>
                      </div>

                      {/* Bouton S'entraîner directement sur ce livre */}
                      <button
                        onClick={() => navigate('Training')}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 text-[11px] font-bold transition-colors"
                      >
                        Jouer
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 4. PRÉFÉRENCES & SYSTÈME */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block px-0.5">
            Préférences & Système
          </label>
          <Card variant="default" padding="none" className="divide-y divide-slate-800">
            {/* Supabase Status */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-xs font-semibold text-slate-200">
                    Base de données Supabase
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Tables progression & leaderboard
                  </p>
                </div>
              </div>
              {isConfigured ? (
                <Badge variant="success" size="sm" icon={<CheckCircle className="w-3 h-3" />}>
                  Synchronisé
                </Badge>
              ) : (
                <Badge variant="warning" size="sm" icon={<AlertCircle className="w-3 h-3" />}>
                  Mode local sécurisé
                </Badge>
              )}
            </div>

            {/* Sons */}
            <div
              onClick={toggleSound}
              className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-850/50"
            >
              <div className="flex items-center gap-3">
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-amber-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
                <span className="text-xs font-semibold text-slate-200">
                  Effets sonores
                </span>
              </div>
              <span className="text-xs font-bold text-amber-400">
                {soundEnabled ? 'Activés' : 'Muet'}
              </span>
            </div>

            {/* Retours haptiques */}
            <div
              onClick={toggleHaptics}
              className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-850/50"
            >
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-200">
                  Vibrations haptiques
                </span>
              </div>
              <span className="text-xs font-bold text-amber-400">
                {hapticsEnabled ? 'Activés' : 'Désactivés'}
              </span>
            </div>
          </Card>
        </div>

        {/* Bouton Connexion / Déconnexion */}
        {isAuthenticated ? (
          <Button
            variant="outline"
            fullWidth
            size="md"
            leftIcon={<LogOut className="w-4 h-4 text-red-400" />}
            onClick={() => signOut()}
            className="text-red-400 border-red-500/20 hover:bg-red-950/20"
          >
            Se déconnecter
          </Button>
        ) : (
          <Button
            variant="primary"
            fullWidth
            size="md"
            leftIcon={<LogIn className="w-4 h-4 text-slate-950" />}
            onClick={() => navigate('Auth')}
          >
            Se connecter ou Créer un compte
          </Button>
        )}
      </div>
    </div>
  );
};
