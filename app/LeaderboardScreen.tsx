/**
 * Écran "Classement" (LeaderboardScreen)
 * Affiche le Top 20 (7 derniers jours et All-Time)
 * + La position et le score de l'utilisateur connecté s'il n'est pas dans le top 20
 * Module: /app/LeaderboardScreen.tsx
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Trophy, 
  Medal, 
  Calendar, 
  Flame, 
  RotateCw, 
  Swords, 
  Sparkles, 
  Crown, 
  ChevronRight, 
  User, 
  CheckCircle2, 
  TrendingUp,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppNavigation } from './navigation';
import { 
  getLeaderboard, 
  subscribeProgressionUpdates,
  type LeaderboardResult 
} from '@/lib/progressionEngine';
import type { LeaderboardEntry } from '@/types';

export const LeaderboardScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { navigate } = useAppNavigation();

  const userId = user?.id || 'demo-user-123';
  const userPseudo = user?.pseudo || 'Vous';

  const [period, setPeriod] = useState<'7days' | 'alltime'>('7days');
  const [data, setData] = useState<LeaderboardResult | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const result = await getLeaderboard(period, userId, userPseudo);
      setData(result);
    } catch (e) {
      console.error('[LeaderboardScreen] Erreur chargement:', e);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [period, userId, userPseudo]);

  // Recharger au changement de période
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Rafraîchissement automatique après fin de session (pas de données obsolètes en cache)
  useEffect(() => {
    const unsubscribe = subscribeProgressionUpdates(() => {
      loadData(true);
    });
    return unsubscribe;
  }, [loadData]);

  const top3 = data?.top20.slice(0, 3) || [];
  const restTop20 = data?.top20.slice(3) || [];
  const userEntry = data?.currentUserRank;
  const isUserInTop20 = data?.isUserInTop20 || false;

  // Calcul du seuil d'accès au Top 20
  const score20th = data?.top20[data.top20.length - 1]?.best_score || 0;
  const pointsToTop20 = userEntry ? Math.max(1, score20th - userEntry.best_score + 10) : 100;

  return (
    <div className="flex flex-col min-h-full pb-28">
      <Header
        title="Classement Officiel"
        subtitle="Les meilleurs scores en match (sur 200 pts)"
        rightAction={
          <button
            onClick={() => loadData()}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-slate-700 transition-colors"
            title="Rafraîchir les scores"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        }
      />

      <div className="p-4 flex flex-col gap-4 max-w-lg mx-auto w-full">
        {/* Sélecteur de période */}
        <div className="flex p-1 bg-slate-900/90 border border-slate-800 rounded-2xl">
          <button
            onClick={() => setPeriod('7days')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              period === '7days'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            7 Derniers Jours
          </button>
          <button
            onClick={() => setPeriod('alltime')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              period === 'alltime'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            Tous les Temps
          </button>
        </div>

        {/* Bannière spéciale : Position du joueur connecté si HORS DU TOP 20 */}
        {!isUserInTop20 && userEntry && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-amber-950/60 border border-blue-500/40 p-3.5 shadow-lg shadow-blue-950/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 font-black text-sm">
                  #{userEntry.rank}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Votre Position</span>
                    <Badge variant="info" size="sm">Hors Top 20</Badge>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Score : <span className="font-bold text-amber-300">{userEntry.best_score} pts</span> • {userEntry.matches_played} match{userEntry.matches_played > 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                variant="primary"
                onClick={() => navigate('Match')}
                className="text-xs shrink-0 py-1.5 px-3"
              >
                Grimper au Top
              </Button>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
              <span>Seuil du Top 20 actuel : <strong className="text-slate-200">{score20th} pts</strong></span>
              <span className="text-amber-400 font-semibold">+{pointsToTop20} pts pour entrer</span>
            </div>
          </motion.div>
        )}

        {/* Podium Top 3 */}
        {top3.length >= 3 && (
          <div className="grid grid-cols-3 gap-2 pt-2 items-end">
            {/* 2ème place */}
            <div className="flex flex-col items-center">
              <div className="relative mb-2 flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-slate-400/50 flex items-center justify-center text-slate-300 font-bold text-base shadow-lg shadow-slate-700/20">
                  {top3[1].pseudo.slice(0, 2).toUpperCase()}
                </div>
                <div className="absolute -bottom-2 w-5 h-5 rounded-full bg-slate-400 text-slate-950 font-black text-[10px] flex items-center justify-center shadow">
                  2
                </div>
              </div>
              <span className="text-xs font-bold text-slate-200 truncate w-full text-center mt-1">
                {top3[1].pseudo}
              </span>
              <span className="text-xs font-extrabold text-slate-300 mt-0.5">
                {top3[1].best_score} pts
              </span>
              <div className="w-full h-16 mt-2 rounded-t-xl bg-slate-800/80 border-t border-slate-400/30 flex items-center justify-center text-[11px] font-bold text-slate-400">
                🥈 Argent
              </div>
            </div>

            {/* 1ère place (Plus haute) */}
            <div className="flex flex-col items-center -mt-3">
              <div className="text-amber-400 mb-1 animate-bounce">
                <Crown className="w-6 h-6 fill-amber-400" />
              </div>
              <div className="relative mb-2 flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-xl shadow-amber-500/30">
                  <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center text-amber-300 font-black text-lg">
                    {top3[0].pseudo.slice(0, 2).toUpperCase()}
                  </div>
                </div>
                <div className="absolute -bottom-2.5 w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
                  1
                </div>
              </div>
              <span className="text-xs font-black text-amber-300 truncate w-full text-center mt-1">
                {top3[0].pseudo}
              </span>
              <span className="text-sm font-black text-amber-400 mt-0.5">
                {top3[0].best_score} pts
              </span>
              <div className="w-full h-24 mt-2 rounded-t-xl bg-gradient-to-b from-amber-500/20 to-slate-900 border-t border-amber-500/40 flex items-center justify-center text-xs font-black text-amber-400">
                🥇 Champion
              </div>
            </div>

            {/* 3ème place */}
            <div className="flex flex-col items-center">
              <div className="relative mb-2 flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-amber-700/60 flex items-center justify-center text-amber-600 font-bold text-base shadow-lg shadow-amber-900/20">
                  {top3[2].pseudo.slice(0, 2).toUpperCase()}
                </div>
                <div className="absolute -bottom-2 w-5 h-5 rounded-full bg-amber-700 text-amber-100 font-black text-[10px] flex items-center justify-center shadow">
                  3
                </div>
              </div>
              <span className="text-xs font-bold text-slate-200 truncate w-full text-center mt-1">
                {top3[2].pseudo}
              </span>
              <span className="text-xs font-extrabold text-amber-500 mt-0.5">
                {top3[2].best_score} pts
              </span>
              <div className="w-full h-12 mt-2 rounded-t-xl bg-slate-800/80 border-t border-amber-700/40 flex items-center justify-center text-[11px] font-bold text-amber-600">
                🥉 Bronze
              </div>
            </div>
          </div>
        )}

        {/* Liste du Top 20 (places 4 à 20) */}
        <div>
          <div className="flex items-center justify-between mb-2 px-0.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Classement Général (Top 20)
            </h3>
            <span className="text-[11px] text-slate-500">
              {data?.totalParticipants || 20} disciples inscrits
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            {restTop20.map((entry) => {
              const isMe = entry.is_current_user;
              return (
                <div
                  key={entry.user_id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                    isMe
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/10'
                      : 'bg-slate-900/90 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 text-center font-black text-xs ${
                        entry.rank <= 10 ? 'text-amber-400' : 'text-slate-500'
                      }`}
                    >
                      #{entry.rank}
                    </span>

                    <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                      {entry.pseudo.slice(0, 2).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold ${isMe ? 'text-amber-300' : 'text-white'}`}>
                          {entry.pseudo}
                        </span>
                        {isMe && (
                          <span className="px-1.5 py-0.5 text-[9px] font-black rounded-full bg-amber-400 text-slate-950">
                            VOUS
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {entry.matches_played} partie{entry.matches_played > 1 ? 's' : ''} jouée{entry.matches_played > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-amber-400">
                      {entry.best_score}
                    </span>
                    <span className="text-[10px] text-slate-500 block">/ 200 pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Appel à l'action pour jouer un match */}
        <Card variant="surface" padding="md" className="border-amber-500/20 bg-amber-950/10 text-center mt-2">
          <div className="mx-auto w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2">
            <Swords className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-white">
            Améliorez votre meilleur score de match
          </h4>
          <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
            Chaque match en 3 manches peut vous rapporter jusqu'à 200 points et vous propulser au sommet !
          </p>
          <Button
            size="md"
            variant="primary"
            fullWidth
            onClick={() => navigate('Match')}
            className="mt-3 text-xs"
            leftIcon={<Swords className="w-4 h-4 text-slate-950" />}
          >
            Lancer un Match Officiel
          </Button>
        </Card>
      </div>
    </div>
  );
};
