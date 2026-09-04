/**
 * Application SuperQuizz Biblique
 * Preview Web Interactive & Simulateur Mobile Expo
 * Module: /src/App.tsx
 * Version Biblique : Louis Segond révisée 1910 (LSG 1910)
 */

import React, { useState } from 'react';
import { 
  Home, 
  BookOpen, 
  Swords, 
  User, 
  Database, 
  Smartphone, 
  Code2, 
  FileText, 
  CheckCircle2, 
  Layers, 
  Sparkles,
  RefreshCw,
  ExternalLink,
  ListFilter,
  Check,
  Search,
  BookMarked,
  Zap,
  ArrowRight,
  Play,
  Trophy
} from 'lucide-react';
import { NavigationProvider, useAppNavigation } from '@/app/navigation';
import { HomeScreen } from '@/app/HomeScreen';
import { TrainingScreen } from '@/app/TrainingScreen';
import { MatchScreen } from '@/app/MatchScreen';
import { LeaderboardScreen } from '@/app/LeaderboardScreen';
import { ProfileScreen } from '@/app/ProfileScreen';
import { AuthScreen } from '@/app/AuthScreen';
import { useAuthStore } from '@/store/useAuthStore';
import { useGameStore } from '@/store/useGameStore';
import { useUserStore } from '@/store/useUserStore';
import { isSupabaseConfigured, SUPABASE_URL } from '@/lib/supabase';
import { SEED_QUESTIONS, BIBLE_BOOKS } from '@/lib/seedQuestions';
import { calculerNouvelleDifficulte } from '@/lib/trainingEngine';
import { runDifficultyFormulaTests } from '@/lib/__tests__/difficulty.test';
import { MATCH_MANCHE1_QUESTIONS, MATCH_MANCHE2_QUESTIONS, MATCH_MANCHE3_QUESTIONS, MATCH_THEMES } from '@/lib/matchEngine';
import type { QuestionFormat, QuestionMode } from '@/types';

// Composant interne rendu dans le simulateur mobile
const MobileAppContent: React.FC = () => {
  const { currentScreen, navigate } = useAppNavigation();

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 select-none relative overflow-hidden">
      {/* Barre d'état mobile (Status bar) */}
      <div className="h-10 shrink-0 w-full px-6 flex items-center justify-between text-[11px] font-semibold text-slate-400 bg-slate-950/80 backdrop-blur-sm z-30 border-b border-slate-900/50">
        <span>09:41</span>
        <div className="w-20 h-4 bg-slate-900 rounded-full mx-auto" />
        <div className="flex items-center gap-1.5">
          <span>5G</span>
          <div className="w-5 h-2.5 rounded-sm border border-slate-400 p-0.5 flex items-center">
            <div className="w-full h-full bg-amber-400 rounded-xs" />
          </div>
        </div>
      </div>

      {/* Contenu de l'écran actif */}
      <div className="flex-1 overflow-y-auto relative custom-scrollbar">
        {currentScreen === 'Home' && <HomeScreen />}
        {currentScreen === 'Training' && <TrainingScreen />}
        {currentScreen === 'Match' && <MatchScreen />}
        {currentScreen === 'Leaderboard' && <LeaderboardScreen />}
        {currentScreen === 'Profile' && <ProfileScreen />}
        {currentScreen === 'Auth' && <AuthScreen />}
      </div>

      {/* Barre de navigation inférieure (Tab bar) */}
      {currentScreen !== 'Auth' && (
        <div className="h-16 shrink-0 w-full px-2 flex items-center justify-around bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 z-30">
          {[
            { screen: 'Home' as const, label: 'Accueil', icon: Home },
            { screen: 'Training' as const, label: 'Solo', icon: BookOpen },
            { screen: 'Match' as const, label: 'Match', icon: Swords },
            { screen: 'Leaderboard' as const, label: 'Classement', icon: Trophy },
            { screen: 'Profile' as const, label: 'Profil', icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentScreen === tab.screen;
            return (
              <button
                key={tab.screen}
                onClick={() => navigate(tab.screen)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 ${
                  isActive ? 'text-amber-400' : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className={`text-[10px] mt-1 ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export function App() {
  const [activeTab, setActiveTab] = useState<'progression' | 'match' | 'formule' | 'schema' | 'seed' | 'stores' | 'guide'>('progression');
  const [deviceFrame, setDeviceFrame] = useState<'mobile' | 'expanded'>('mobile');
  
  // Filtres pour l'explorateur de questions seed
  const [seedFormatFilter, setSeedFormatFilter] = useState<QuestionFormat | 'all'>('all');
  const [seedModeFilter, setSeedModeFilter] = useState<QuestionMode | 'all'>('all');
  const [seedSearch, setSeedSearch] = useState('');

  // Simulateur interactif de formule de difficulté
  const [testScore, setTestScore] = useState(8);
  const [testLevel, setTestLevel] = useState(2);
  const [testAvgTimeMs, setTestAvgTimeMs] = useState(4800);
  const [testHistTimeMs, setTestHistTimeMs] = useState(10000);
  const [unitTestOutput, setUnitTestOutput] = useState<{ passed: boolean; results: string[] } | null>(null);

  const authState = useAuthStore();
  const gameState = useGameStore();
  const userState = useUserStore();

  const isConfigured = isSupabaseConfigured();

  const filteredSeedQuestions = SEED_QUESTIONS.filter((q) => {
    if (seedFormatFilter !== 'all' && q.format !== seedFormatFilter) return false;
    if (seedModeFilter !== 'all' && q.mode !== seedModeFilter) return false;
    if (seedSearch) {
      const s = seedSearch.toLowerCase();
      return (
        q.question_text.toLowerCase().includes(s) ||
        q.reference_biblique.toLowerCase().includes(s) ||
        (q.book_name && q.book_name.toLowerCase().includes(s)) ||
        (q.theme && q.theme.toLowerCase().includes(s))
      );
    }
    return true;
  });

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Zone Centrale : Simulateur Mobile / Écran Interactif */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-slate-800/80">
        {/* Barre d'outils du simulateur */}
        <div className="h-14 px-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-black text-sm shadow-md shadow-amber-500/20">
              SQ
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-white flex items-center gap-2">
                SuperQuizz Biblique
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                  LSG 1910
                </span>
              </h1>
              <p className="text-[10px] text-slate-400">Modèle Postgres & 8 Tables Supabase</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
              <span className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
              <span>{isConfigured ? 'Supabase Connecté' : 'Mode Local / Seed'}</span>
            </div>

            <button
              onClick={() => setDeviceFrame(deviceFrame === 'mobile' ? 'expanded' : 'mobile')}
              className="p-1.5 px-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">{deviceFrame === 'mobile' ? 'Plein Écran' : 'Vue Mobile'}</span>
            </button>
          </div>
        </div>

        {/* Zone de rendu de l'appareil */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-2 sm:p-6 bg-radial from-slate-900/50 to-slate-950">
          <div
            className={`transition-all duration-300 shadow-2xl flex flex-col ${
              deviceFrame === 'mobile'
                ? 'w-full max-w-[390px] h-[780px] max-h-[92vh] rounded-[48px] border-[8px] border-slate-800 ring-1 ring-slate-700/50 overflow-hidden shadow-amber-950/10'
                : 'w-full max-w-xl h-full rounded-2xl border border-slate-800 overflow-hidden'
            }`}
          >
            <NavigationProvider initialScreen="Match">
              <MobileAppContent />
            </NavigationProvider>
          </div>
        </div>
      </div>

      {/* Panneau Latéral : Inspecteur de Modèle de Données */}
      <div className="w-80 lg:w-[420px] shrink-0 flex flex-col h-full bg-slate-950 border-l border-slate-800/80">
        {/* Navigation des Onglets Inspecteur */}
        <div className="h-14 px-2 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/90 shrink-0">
          <div className="flex gap-1 w-full overflow-x-auto custom-scrollbar pb-0.5">
            {[
              { id: 'progression', label: 'Top 20 & Badges', icon: Trophy },
              { id: 'match', label: 'Match 3M', icon: Swords },
              { id: 'formule', label: 'Formule N', icon: Zap },
              { id: 'schema', label: 'Schéma (8)', icon: Database },
              { id: 'seed', label: 'Seed (20)', icon: BookMarked },
              { id: 'stores', label: 'Zustand', icon: Code2 },
              { id: 'guide', label: 'Guide', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenu de l'onglet actif */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs custom-scrollbar">
          {/* ONGLET PROGRESSION & CLASSEMENT */}
          {activeTab === 'progression' && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Progression & Compétition Légère
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-bold">
                  MVP Complet
                </span>
              </div>

              {/* 1. Écran Profil */}
              <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/30 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-amber-300">
                  <span>1. Profil : Les 4 Indicateurs Clés</span>
                  <span className="text-[10px] font-mono text-slate-400">ProfileScreen</span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-300">
                  <div>• <strong>Score cumulé total</strong> : Entraînement solo + Matchs officiels.</div>
                  <div>• <strong>Matchs joués</strong> : Nombre total de parties complètes disputées.</div>
                  <div>• <strong>Meilleur score en match</strong> : Record personnel (sur 200 pts max).</div>
                  <div>• <strong>Niveau par livre</strong> : Jauge 1 à 5 sur les 66 livres bibliques LSG 1910 avec recherche instantanée.</div>
                </div>
              </div>

              {/* 2. Vues SQL de Leaderboard */}
              <div className="p-3 rounded-xl bg-slate-900 border border-blue-500/30 space-y-2">
                <div className="flex items-center justify-between font-bold text-blue-300">
                  <span>2. Vues SQL de Classement</span>
                  <span className="text-[10px] font-mono text-slate-400">DENSE_RANK()</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Agrégation des meilleurs scores de match avec gestion des ex-aequo :
                </p>
                <div className="space-y-1 font-mono text-[10px] bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <div className="text-amber-400 font-bold">public.leaderboard_all_time</div>
                  <div className="text-slate-400">Vue SQL All-Time sur match_sessions (statut='termine')</div>
                  <div className="text-emerald-400 font-bold mt-1.5">public.leaderboard_7_days</div>
                  <div className="text-slate-400">Vue SQL 7 jours (completed_at &gt;= NOW() - INTERVAL '7 days')</div>
                </div>
              </div>

              {/* 3. Écran Classement */}
              <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-emerald-300">
                  <span>3. Écran Classement (Top 20 + Joueur)</span>
                  <span className="text-[10px] font-mono text-slate-400">LeaderboardScreen</span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-300">
                  <div>• <strong>Top 20</strong> : Podium dynamique (Or, Argent, Bronze) + rangs 4 à 20.</div>
                  <div>• <strong>Position du joueur</strong> : Bannière dédiée si le joueur est hors du Top 20 (ex: #28 avec points manquants pour y entrer).</div>
                  <div>• <strong>Périodes</strong> : Bascule 7 jours / Tous les temps.</div>
                </div>
              </div>

              {/* 4. Système de Badges */}
              <div className="p-3 rounded-xl bg-slate-900 border border-purple-500/30 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-purple-300">
                  <span>4. Badges & Déblocage Automatique</span>
                  <span className="text-[10px] font-mono text-slate-400">8 Badges MVP</span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-300">
                  <div>• <code>first_match</code> : Premier match officiel terminé (+50 XP)</div>
                  <div>• <code>perfect_round3</code> : 50/50 pts en Manche 3 sous chrono 15s (+100 XP)</div>
                  <div>• <code>perfect_blank</code> : 60/60 pts sans faute en Manche 2 (+80 XP)</div>
                  <div>• <code>score_high_match</code> : Score ≥ 160 pts sur 200 (+150 XP)</div>
                  <div>• <code>first_training</code> : 1ère session solo terminée (+30 XP)</div>
                  <div>• <code>book_master_5</code> : 5 sessions sur le même livre (+120 XP)</div>
                  <div>• <code>difficulty_max</code> : Atteindre le niveau 5/5 (+200 XP)</div>
                  <div>• <code>fast_responder</code> : Réponse correcte en &lt; 3s (+40 XP)</div>
                </div>
              </div>

              {/* 5. Fraîcheur des Données */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-200">
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Gestion du Cache & Réactivité</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Grâce à l'événement <code>progression_updated</code> et aux abonnements réactifs (<code>subscribeProgressionUpdates</code>), chaque fin de match ou de session d'entraînement invalide immédiatement les données en cache et recharge les statistiques et le classement sans aucun rechargement de page.
                </p>
              </div>
            </div>
          )}

          {/* ONGLET MATCH 3 MANCHES */}
          {activeTab === 'match' && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Mode Match Officiel (3 Manches)
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-bold">
                  200 pts max
                </span>
              </div>

              {/* Résumé des 3 Manches */}
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/30">
                  <div className="flex items-center justify-between font-bold text-amber-300 mb-1">
                    <span>Manche 1 : Échauffement Rapide</span>
                    <span className="font-mono">90 pts</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    9 questions aléatoires tous livres • Format <strong>question_reponse</strong> • Chrono 20s • 10 pts/bonne réponse
                  </p>
                  <div className="mt-1.5 text-[10px] text-slate-400 font-mono">
                    Pool : {MATCH_MANCHE1_QUESTIONS.length} questions disponibles
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-blue-500/30">
                  <div className="flex items-center justify-between font-bold text-blue-300 mb-1">
                    <span>Manche 2 : Texte à Trous ({'{{blank}}'})</span>
                    <span className="font-mono">60 pts</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Tirage de 3 thèmes aléatoires • Choix d'1 thème • 6 questions QCM à trous avec le marqueur <code>{'{{blank}}'}</code> et 4 chips cliquables homogènes.
                  </p>
                  <div className="mt-1.5 text-[10px] text-slate-400 font-mono">
                    Thèmes : {MATCH_THEMES.length} thèmes • {MATCH_MANCHE2_QUESTIONS.length} versets à trous
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-rose-500/30">
                  <div className="flex items-center justify-between font-bold text-rose-300 mb-1">
                    <span>Manche 3 : Défi Herméneutique</span>
                    <span className="font-mono">50 pts</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    5 questions théologiques de haute difficulté • Format <strong>vrai_faux</strong> • Chrono tendu de 15s incandescent !
                  </p>
                  <div className="mt-1.5 text-[10px] text-slate-400 font-mono">
                    Pool : {MATCH_MANCHE3_QUESTIONS.length} questions herméneutiques
                  </div>
                </div>
              </div>

              {/* Règle QCM à trous */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  Mécanisme QCM Texte à Trous
                </h4>
                <div className="text-[11px] text-slate-300 space-y-1.5 leading-relaxed">
                  <div>• <strong>Anti-faux négatifs</strong> : Élimine les erreurs typographiques sur les noms propres bibliques (ex: Nabuchodonosor, Melchisédek).</div>
                  <div>• <strong>Distracteurs homogènes</strong> : Même catégorie sémantique (rois vs rois, fleuves vs fleuves, armes vs armes) pour garantir la pertinence biblique.</div>
                  <div>• <strong>Interaction fluide</strong> : Tap sur chip → mot inséré immédiatement dans le trou → validation automatique dans le chrono.</div>
                </div>
              </div>

              {/* Tables Postgres associées */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Persistance des Données de Match
                </span>
                <div className="space-y-1 font-mono text-[10px] text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-amber-400">match_sessions</span>
                    <span className="text-slate-400">id, user_id, score_total, statut</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-400">match_rounds</span>
                    <span className="text-slate-400">match_session_id, numero_manche, theme_choisi, score</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-400">user_answers</span>
                    <span className="text-slate-400">session_id, session_type='match', temps_ms</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* ONGLET 1 : SCHÉMA POSTGRESQL (8 TABLES) */}
          {activeTab === 'schema' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Schéma Postgres (8 Tables)
                </h3>
                <span className="text-[10px] text-emerald-400 font-mono">LSG 1910</span>
              </div>

              <div className="space-y-2.5">
                {/* 1. books */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-amber-400">1. public.books</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono">66 Livres</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mb-1.5">
                    Canon protestant LSG 1910 ordonné par position.
                  </p>
                  <div className="font-mono text-[10px] text-slate-400 space-y-0.5 bg-slate-950 p-2 rounded-lg">
                    <div><strong className="text-slate-200">id</strong> UUID PK</div>
                    <div><strong className="text-slate-200">name</strong> TEXT UNIQUE (ex: "Genèse")</div>
                    <div><strong className="text-slate-200">testament</strong> 'ancien' | 'nouveau'</div>
                    <div><strong className="text-slate-200">position</strong> INT (1 à 66)</div>
                  </div>
                </div>

                {/* 2. questions */}
                <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-amber-400">2. public.questions</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">Cœur Métier</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mb-1.5">
                    Banque LSG 1910 avec 3 formats & thèmes Manche 2.
                  </p>
                  <div className="font-mono text-[10px] text-slate-400 space-y-0.5 bg-slate-950 p-2 rounded-lg">
                    <div><strong className="text-slate-200">id</strong> UUID PK</div>
                    <div><strong className="text-slate-200">book_id</strong> UUID FK (nullable)</div>
                    <div><strong className="text-slate-200">mode</strong> enum ('entrainement', 'match_manche1', 'match_manche2', 'match_manche3')</div>
                    <div><strong className="text-slate-200">theme</strong> TEXT (nullable, uniquement match_manche2)</div>
                    <div><strong className="text-slate-200">format</strong> enum ('question_reponse', 'texte_a_trous', 'vrai_faux')</div>
                    <div><strong className="text-slate-200">question_text</strong> TEXT</div>
                    <div><strong className="text-slate-200">correct_answer</strong> TEXT</div>
                    <div><strong className="text-slate-200">wrong_answers</strong> JSONB (tableau, vide si vrai_faux)</div>
                    <div><strong className="text-slate-200">difficulty</strong> INT (1 à 5)</div>
                    <div><strong className="text-slate-200">reference_biblique</strong> TEXT (ex: "Jean 3:16")</div>
                    <div><strong className="text-slate-200">created_at</strong> TIMESTAMPTZ</div>
                  </div>
                </div>

                {/* 3. users */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-amber-400">3. public.users</span>
                    <span className="text-[10px] text-slate-400">auth.users sync</span>
                  </div>
                  <div className="font-mono text-[10px] text-slate-400 space-y-0.5 bg-slate-950 p-2 rounded-lg">
                    <div><strong className="text-slate-200">id</strong> UUID PK FK auth.users</div>
                    <div><strong className="text-slate-200">email</strong> TEXT UNIQUE</div>
                    <div><strong className="text-slate-200">pseudo</strong> TEXT</div>
                    <div><strong className="text-slate-200">created_at</strong> TIMESTAMPTZ</div>
                  </div>
                </div>

                {/* 4. user_progress */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-amber-400">4. public.user_progress</span>
                    <span className="text-[10px] text-slate-400">Anti-répétition</span>
                  </div>
                  <div className="font-mono text-[10px] text-slate-400 space-y-0.5 bg-slate-950 p-2 rounded-lg">
                    <div><strong className="text-slate-200">id</strong> UUID PK</div>
                    <div><strong className="text-slate-200">user_id</strong> UUID FK</div>
                    <div><strong className="text-slate-200">book_id</strong> UUID FK</div>
                    <div><strong className="text-slate-200">difficulty_atteinte</strong> INT (1 à 5)</div>
                    <div><strong className="text-slate-200">questions_vues</strong> JSONB (tableau d'IDs)</div>
                  </div>
                </div>

                {/* 5. training_sessions */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="font-mono font-bold text-amber-400">5. public.training_sessions</span>
                  <div className="font-mono text-[10px] text-slate-400 mt-1 bg-slate-950 p-2 rounded-lg">
                    <div><strong className="text-slate-200">id, user_id, book_id, started_at, score, duree_totale</strong></div>
                  </div>
                </div>

                {/* 6. match_sessions */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="font-mono font-bold text-amber-400">6. public.match_sessions</span>
                  <div className="font-mono text-[10px] text-slate-400 mt-1 bg-slate-950 p-2 rounded-lg">
                    <div><strong className="text-slate-200">id, user_id, opponent_user_id, started_at, score_total, statut</strong></div>
                  </div>
                </div>

                {/* 7. match_rounds */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="font-mono font-bold text-amber-400">7. public.match_rounds</span>
                  <div className="font-mono text-[10px] text-slate-400 mt-1 bg-slate-950 p-2 rounded-lg">
                    <div><strong className="text-slate-200">id, match_session_id, numero_manche (1/2/3), theme_choisi, score_manche</strong></div>
                  </div>
                </div>

                {/* 8. user_answers */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="font-mono font-bold text-amber-400">8. public.user_answers</span>
                  <div className="font-mono text-[10px] text-slate-400 mt-1 bg-slate-950 p-2 rounded-lg">
                    <div><strong className="text-slate-200">id, session_id, question_id, reponse_donnee, est_correcte, temps_reponse_ms</strong></div>
                  </div>
                </div>
              </div>

              {/* Index de sélection rapide */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="text-xs font-bold text-amber-300 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Index de Sélection Aléatoire Rapide
                </div>
                <div className="font-mono text-[10px] text-amber-200/80 space-y-0.5">
                  <div>• idx_questions_book_id (book_id)</div>
                  <div>• idx_questions_mode (mode)</div>
                  <div>• idx_questions_theme (theme)</div>
                  <div>• idx_questions_difficulty (difficulty)</div>
                  <div>• idx_questions_mode_diff (mode, difficulty)</div>
                  <div>• idx_questions_mode_theme (mode, theme)</div>
                </div>
              </div>
            </div>
          )}

          {/* ONGLET 2 : EXPLORATEUR DU SEED (20 QUESTIONS LSG 1910) */}
          {activeTab === 'seed' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Banque Seed (20 Questions)
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    LSG 1910 • 3 formats • 66 livres
                  </p>
                </div>
                <span className="text-xs font-bold text-amber-400 font-mono">
                  {filteredSeedQuestions.length} affichée(s)
                </span>
              </div>

              {/* Barre de recherche */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Rechercher verset, livre, mot..."
                  value={seedSearch}
                  onChange={(e) => setSeedSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
                />
              </div>

              {/* Filtres Formats */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Format :
                </span>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { id: 'all', label: 'Tous' },
                    { id: 'question_reponse', label: 'QCM' },
                    { id: 'texte_a_trous', label: 'À trous' },
                    { id: 'vrai_faux', label: 'Vrai/Faux' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      onClick={() => setSeedFormatFilter(fmt.id as any)}
                      className={`py-1 px-1.5 rounded text-[10px] font-bold transition-all text-center border ${
                        seedFormatFilter === fmt.id
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtres Mode */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Mode :
                </span>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { id: 'all', label: 'Tous' },
                    { id: 'entrainement', label: 'Solo' },
                    { id: 'match_manche1', label: 'Manche 1' },
                    { id: 'match_manche2', label: 'Manche 2' },
                  ].map((md) => (
                    <button
                      key={md.id}
                      onClick={() => setSeedModeFilter(md.id as any)}
                      className={`py-1 px-1 rounded text-[10px] font-bold transition-all text-center border ${
                        seedModeFilter === md.id
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {md.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Liste des Questions */}
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
                {filteredSeedQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 font-bold">
                        {q.book_name} • Niv. {q.difficulty}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {q.theme && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 font-mono">
                            #{q.theme}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 font-mono">
                          {q.format}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-200 leading-snug">
                      {q.question_text}
                    </p>

                    <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-emerald-400 font-semibold truncate max-w-[200px]">
                        ✓ {q.correct_answer}
                      </span>
                      <span className="text-slate-400 italic shrink-0">
                        {q.reference_biblique}
                      </span>
                    </div>

                    {q.wrong_answers.length > 0 && (
                      <div className="text-[10px] text-slate-500">
                        Distracteurs : {q.wrong_answers.join(' • ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ONGLET 3 : PROJET */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Architecture MVP Initialisée
                </h3>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Application :</span>
                    <span className="text-amber-400 font-bold">SuperQuizz Biblique</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Version Biblique :</span>
                    <span className="text-amber-300">LSG 1910 (Exclusif)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Livres Canoniques :</span>
                    <span>66 (39 AT + 27 NT)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Backend :</span>
                    <span>Supabase (PostgreSQL 8 Tables)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Sélection Aléatoire :</span>
                    <span className="text-emerald-400">Indexes optimisés</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Fichiers SQL Générés
                </h3>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] space-y-1.5 text-slate-300">
                  <div className="text-amber-400 font-bold">📁 /supabase</div>
                  <div className="pl-4 text-emerald-400">└ schema.sql (8 tables + RLS + trigger)</div>
                  <div className="pl-4 text-emerald-400">└ seed.sql (66 livres + 20 questions LSG)</div>
                  <div className="text-amber-400 font-bold">📁 /supabase/migrations</div>
                  <div className="pl-4 text-slate-400">└ 20240904000001_create_superquizz_schema.sql</div>
                </div>
              </div>
            </div>
          )}

          {/* ONGLET 4 : STORES ZUSTAND */}
          {activeTab === 'stores' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                État Actuel des Stores Zustand
              </h3>

              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="font-bold text-amber-400 font-mono">useAuthStore</span>
                  <div className="mt-1.5 text-[11px] text-slate-300 space-y-1">
                    <div>Statut : <span className="font-semibold">{authState.isAuthenticated ? 'Connecté' : 'Invité'}</span></div>
                    <div>Pseudo : <span className="text-amber-300 font-mono">{authState.user?.pseudo || 'Non connecté'}</span></div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="font-bold text-blue-400 font-mono">useGameStore</span>
                  <div className="mt-1.5 text-[11px] text-slate-300 space-y-1">
                    <div>Livre : <span className="text-slate-200">{gameState.selectedBookName || 'Tous'}</span></div>
                    <div>Difficulté : <span className="text-slate-200">Niv. {gameState.selectedDifficulty}</span></div>
                    <div>Format : <span className="text-slate-200">{gameState.selectedFormat}</span></div>
                    <div>Mode : <span className="text-slate-200">{gameState.selectedMode}</span></div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="font-bold text-emerald-400 font-mono">useUserStore</span>
                  <div className="mt-1.5 text-[11px] text-slate-300 space-y-1">
                    <div>Niveau : <span className="text-emerald-300">Niv. {userState.progress?.level} ({userState.progress?.rank_title})</span></div>
                    <div>Total XP : <span className="text-amber-400 font-bold">{userState.progress?.total_xp} XP</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ONGLET 0 : FORMULE & TESTS UNITAIRES */}
          {activeTab === 'formule' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Formule Progressive (LSG 1910)
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono">
                  Fonction Pure
                </span>
              </div>

              {/* Résumé des règles */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-[11px] text-slate-300">
                <div className="font-bold text-amber-400">Règles du Barème /10 :</div>
                <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
                  <div className="p-1.5 rounded bg-slate-950 text-emerald-300">9-10/10 → N + 2 (max 5)</div>
                  <div className="p-1.5 rounded bg-slate-950 text-emerald-400">7-8/10 → N + 1 (max 5)</div>
                  <div className="p-1.5 rounded bg-slate-950 text-slate-300">4-6/10 → N inchangé</div>
                  <div className="p-1.5 rounded bg-slate-950 text-rose-300">2-3/10 → N - 1 (min 1)</div>
                  <div className="p-1.5 rounded bg-slate-950 text-rose-400 col-span-2">0-1/10 → N - 2 (min 1)</div>
                </div>
                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                  ⚡ <strong>Bonus rapidité</strong> : si temps moyen session &lt; 60% de la moyenne historique ET score ∈ [7, 10] → <strong>+1 cran additionnel</strong> (plafond 5).
                </div>
              </div>

              {/* Simulateur interactif */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 text-xs">Simulateur Interactif</span>
                  <span className="text-[10px] text-slate-400">calculerNouvelleDifficulte()</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Score de la session :</span>
                      <span className="font-bold font-mono text-amber-400">{testScore} / 10</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={testScore}
                      onChange={(e) => setTestScore(Number(e.target.value))}
                      className="w-full accent-amber-400"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Niveau de départ (N) :</span>
                      <span className="font-bold font-mono text-slate-200">Niveau {testLevel}</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={testLevel}
                      onChange={(e) => setTestLevel(Number(e.target.value))}
                      className="w-full accent-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Temps session (ms)</span>
                      <input
                        type="number"
                        value={testAvgTimeMs}
                        onChange={(e) => setTestAvgTimeMs(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs font-mono text-slate-200"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Temps historique (ms)</span>
                      <input
                        type="number"
                        value={testHistTimeMs}
                        onChange={(e) => setTestHistTimeMs(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs font-mono text-slate-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Résultat simulé */}
                {(() => {
                  const calculated = calculerNouvelleDifficulte(
                    testScore,
                    testLevel,
                    testAvgTimeMs,
                    testHistTimeMs
                  );
                  const isBonus =
                    testScore >= 7 &&
                    testHistTimeMs > 0 &&
                    testAvgTimeMs < 0.6 * testHistTimeMs;
                  const delta = calculated - testLevel;

                  return (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Nouveau Niveau Atteint</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-base font-extrabold text-amber-400 font-mono">
                            Niveau {calculated} / 5
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              delta > 0
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : delta < 0
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {delta > 0 ? `+${delta}` : delta}
                          </span>
                        </div>
                      </div>

                      {isBonus && (
                        <div className="text-right">
                          <span className="text-[10px] text-amber-300 flex items-center gap-1 font-bold">
                            <Zap className="w-3 h-3 text-amber-400" />
                            Bonus rapidité appliqué !
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono">
                            {testAvgTimeMs}ms &lt; {0.6 * testHistTimeMs}ms
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Bouton pour lancer les tests unitaires */}
              <div className="space-y-2">
                <button
                  onClick={() => setUnitTestOutput(runDifficultyFormulaTests())}
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Exécuter les Tests Unitaires de la Formule</span>
                </button>

                {unitTestOutput && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 font-mono text-[10px]">
                    <div className="flex items-center justify-between font-bold pb-1 border-b border-slate-800">
                      <span className={unitTestOutput.passed ? 'text-emerald-400' : 'text-rose-400'}>
                        {unitTestOutput.passed ? 'TOUS LES TESTS PASSENT (100%)' : 'ÉCHECS DÉTECTÉS'}
                      </span>
                      <span className="text-slate-400">{unitTestOutput.results.length} assertions</span>
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar text-slate-300">
                      {unitTestOutput.results.map((log, i) => (
                        <div key={i}>{log}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ONGLET 5 : GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Application du Schéma sur Supabase
              </h3>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2 text-[11px] text-slate-300">
                <p>Pour appliquer ce modèle à votre instance Supabase :</p>
                <div className="space-y-1 font-mono text-[10px] bg-slate-950 p-2.5 rounded-lg text-amber-300">
                  <div>1. Ouvrez Supabase Studio &gt; SQL Editor</div>
                  <div>2. Copiez/collez le contenu de <code>supabase/schema.sql</code></div>
                  <div>3. Exécutez le script (Run)</div>
                  <div>4. Copiez/collez le contenu de <code>supabase/seed.sql</code></div>
                  <div>5. Exécutez le seed (Run)</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
