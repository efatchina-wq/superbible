/**
 * Écran d'accueil (HomeScreen) pour SuperQuizz Biblique
 * Style Duolingo : coloré, ludique, motivant avec mascotte Pax et micro-animations.
 * Module: /app/HomeScreen.tsx
 */

import React from 'react';
import { 
  Sparkles, 
  Play, 
  Swords, 
  Flame, 
  Trophy, 
  BookOpen, 
  ChevronRight,
  Zap,
  Volume2,
  VolumeX,
  Star
} from 'lucide-react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { BiblicalMascot } from '@/components/BiblicalMascot';
import { DuolingoProgressBar } from '@/components/DuolingoProgressBar';
import { useAuthStore } from '@/store/useAuthStore';
import { useUserStore } from '@/store/useUserStore';
import { useAppNavigation } from './navigation';

export const HomeScreen: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { progress, soundEnabled, toggleSound } = useUserStore();
  const { navigate } = useAppNavigation();

  return (
    <div className="flex flex-col gap-4 p-4 pb-24 max-w-lg mx-auto w-full select-none">
      {/* 1. Header Statut Duolingo : Streak, XP, Gemmes, Son */}
      <div className="flex items-center justify-between pt-1 pb-1">
        {/* Série de jours (Streak) */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#FF9600]/15 border-2 border-[#FF9600]/40 text-[#FF9600] font-black text-xs shadow-sm">
          <Flame className="w-4 h-4 text-[#FF9600] fill-[#FF9600]" />
          <span>{progress?.current_streak || 1} JOURS</span>
        </div>

        {/* Score XP */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#FFC800]/15 border-2 border-[#FFC800]/40 text-[#FFC800] font-black text-xs shadow-sm">
          <Star className="w-4 h-4 text-[#FFC800] fill-[#FFC800]" />
          <span>{progress?.total_xp || 0} XP</span>
        </div>

        {/* Son & Profil */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className={`w-8 h-8 rounded-2xl border-2 flex items-center justify-center transition-transform active:scale-90 ${
              soundEnabled
                ? 'bg-[#58CC02]/20 border-[#58CC02]/50 text-[#58CC02]'
                : 'bg-slate-850 border-slate-700 text-slate-500'
            }`}
            title={soundEnabled ? 'Son activé' : 'Son coupé'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {!isAuthenticated && (
            <button
              onClick={() => navigate('Auth')}
              className="text-xs font-black uppercase tracking-wider text-slate-900 bg-[#FFC800] hover:bg-[#FFD21F] border-b-2 border-[#E5A500] px-3 py-1.5 rounded-xl active:translate-y-[1px]"
            >
              Connexion
            </button>
          )}
        </div>
      </div>

      {/* 2. Rencontre avec Pax la Mascotte & Bulle de dialogue */}
      <div className="p-3.5 sm:p-4 rounded-3xl bg-slate-900 border-2 border-slate-800 shadow-sm flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Badge variant="gold" size="sm" icon={<Zap className="w-3 h-3" />} className="mb-1.5">
            Niveau {progress?.level || 1} • {progress?.rank_title || 'Scribe Apprenti'}
          </Badge>
          <h2 className="text-base sm:text-lg font-black text-white leading-tight">
            Bonjour, {user?.pseudo || 'Disciple'} !
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-bold">
            Prêt pour ton quiz biblique du jour ?
          </p>

          <div className="mt-2.5">
            <div className="flex justify-between text-[11px] font-black text-slate-400 mb-1">
              <span>Progression niveau</span>
              <span className="text-[#58CC02]">70%</span>
            </div>
            <DuolingoProgressBar progress={70} color="green" size="sm" />
          </div>
        </div>

        <BiblicalMascot mood="happy" size="md" />
      </div>

      {/* 3. Modes de jeu principaux en boutons 3D Duolingo */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black tracking-wider uppercase text-slate-400">
            Choisis ton mode
          </h3>
          <span className="text-[11px] font-extrabold text-[#58CC02] uppercase tracking-wider">
            66 Livres dispos
          </span>
        </div>

        {/* Carte Entraînement Solo (Vert Duolingo) */}
        <div
          onClick={() => navigate('Training')}
          className="p-4 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-850 border-2 border-[#58CC02]/40 border-b-4 border-b-[#46A302] hover:border-[#58CC02] cursor-pointer transition-all active:translate-y-[2px] active:border-b-2 shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-[#58CC02]/20 border-2 border-[#58CC02]/50 flex items-center justify-center text-[#58CC02] group-hover:scale-105 transition-transform">
                <BookOpen className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-black text-white group-hover:text-[#58CC02] transition-colors">
                    Entraînement Solo
                  </h4>
                  <Badge variant="success" size="sm">
                    Recommandé
                  </Badge>
                </div>
                <p className="text-xs font-bold text-slate-400 mt-0.5">
                  Progression livre par livre (Niveaux 1 à 5)
                </p>
              </div>
            </div>
            <div className="w-9 h-9 rounded-2xl bg-[#58CC02] text-slate-950 flex items-center justify-center shadow-md font-black">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
          </div>
        </div>

        {/* Carte Match 3 Manches (Bleu Ciel Duolingo) */}
        <div
          onClick={() => navigate('Match')}
          className="p-4 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-850 border-2 border-[#1CB0F6]/40 border-b-4 border-b-[#1899D6] hover:border-[#1CB0F6] cursor-pointer transition-all active:translate-y-[2px] active:border-b-2 shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-[#1CB0F6]/20 border-2 border-[#1CB0F6]/50 flex items-center justify-center text-[#1CB0F6] group-hover:scale-105 transition-transform">
                <Swords className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-black text-white group-hover:text-[#1CB0F6] transition-colors">
                    Match Officiel 3M
                  </h4>
                  <Badge variant="info" size="sm">
                    Duel
                  </Badge>
                </div>
                <p className="text-xs font-bold text-slate-400 mt-0.5">
                  3 Manches intenses • 200 pts max • Chrono
                </p>
              </div>
            </div>
            <div className="w-9 h-9 rounded-2xl bg-[#1CB0F6] text-white flex items-center justify-center shadow-md font-black">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Défi Quotidien (Corail / Émeraude) */}
        <div
          onClick={() => navigate('Training', { category: 'evangiles_jesus' })}
          className="p-4 rounded-3xl bg-slate-900 border-2 border-[#FFC800]/30 border-b-4 border-b-[#E5A500] hover:border-[#FFC800] cursor-pointer transition-all active:translate-y-[2px] active:border-b-2 shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#FFC800]/20 border-2 border-[#FFC800]/50 flex items-center justify-center text-[#FFC800] group-hover:rotate-12 transition-transform">
                <Sparkles className="w-6 h-6 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-white group-hover:text-[#FFC800]">
                    Défi Quotidien
                  </h4>
                  <Badge variant="gold" size="sm">
                    +50 XP
                  </Badge>
                </div>
                <p className="text-xs font-bold text-slate-400 mt-0.5">
                  Thème : Les paraboles & récits de Jésus
                </p>
              </div>
            </div>
            <Button size="sm" variant="gold" className="text-xs py-1.5 px-3">
              Relever
            </Button>
          </div>
        </div>

        {/* Classement Officiel (Or Duolingo) */}
        <div
          onClick={() => navigate('Leaderboard')}
          className="p-4 rounded-3xl bg-slate-900 border-2 border-[#CE82FF]/30 border-b-4 border-b-[#A557D6] hover:border-[#CE82FF] cursor-pointer transition-all active:translate-y-[2px] active:border-b-2 shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#CE82FF]/20 border-2 border-[#CE82FF]/50 flex items-center justify-center text-[#CE82FF] group-hover:scale-105 transition-transform">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-white group-hover:text-[#CE82FF]">
                    Classement Officiel
                  </h4>
                  <Badge variant="purple" size="sm">
                    Top 20
                  </Badge>
                </div>
                <p className="text-xs font-bold text-slate-400 mt-0.5">
                  Podium 7 jours & Tous les temps
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-[#CE82FF] transition-colors" />
          </div>
        </div>
      </div>

      {/* 4. Explorer les Écritures (Tuiles colorées) */}
      <div className="flex flex-col gap-2.5 pt-1">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black tracking-wider uppercase text-slate-400">
            Explorer les Écritures
          </h3>
          <span
            onClick={() => navigate('Training')}
            className="text-xs text-[#1CB0F6] font-extrabold cursor-pointer hover:underline uppercase tracking-wider"
          >
            Tous les livres →
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Ancien Testament', tag: '39 Livres', count: '120 Qs', icon: '📜', color: 'border-[#FF9600]/30 hover:border-[#FF9600]' },
            { label: 'Nouveau Testament', tag: '27 Livres', count: '150 Qs', icon: '🕊️', color: 'border-[#1CB0F6]/30 hover:border-[#1CB0F6]' },
            { label: 'Évangiles & Jésus', tag: '4 Récits', count: '85 Qs', icon: '✨', color: 'border-[#58CC02]/30 hover:border-[#58CC02]' },
            { label: 'Actes & Apôtres', tag: 'Église', count: '45 Qs', icon: '🔥', color: 'border-[#CE82FF]/30 hover:border-[#CE82FF]' },
          ].map((cat, i) => (
            <div
              key={i}
              onClick={() => navigate('Training')}
              className={`p-3.5 rounded-3xl bg-slate-900 border-2 border-b-4 border-b-slate-950 ${cat.color} cursor-pointer transition-all active:translate-y-[2px] active:border-b-2`}
            >
              <div className="text-2xl mb-1">{cat.icon}</div>
              <h5 className="text-xs sm:text-sm font-black text-slate-100 truncate">
                {cat.label}
              </h5>
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400 font-extrabold">
                <span>{cat.tag}</span>
                <span className="text-[#FFC800]">{cat.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
