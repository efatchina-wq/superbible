/**
 * Écran du Mode Match Officiel (3 Manches)
 * Module: /app/MatchScreen.tsx
 * Version Biblique : Louis Segond révisée 1910 (LSG 1910)
 * 
 * MANCHE 1 (9 questions) : Aléatoire tous livres, format question_reponse, chrono 20s, 10 pts/bonne réponse
 * MANCHE 2 (6 questions) : Choix parmi 3 thèmes aléatoires, format texte_a_trous {{blank}}, chrono 20s, 10 pts/bonne réponse
 * MANCHE 3 (5 questions) : Questions herméneutiques haute difficulté, format vrai_faux, chrono 15s tendu, 10 pts/bonne réponse
 * TOTAL : 200 points max (90 + 60 + 50)
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Swords, 
  Trophy, 
  Timer, 
  Flame, 
  Sparkles, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Check,
  X
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { TexteATrous } from '@/components/TexteATrous';
import { useAuthStore } from '@/store/useAuthStore';
import { useUserStore } from '@/store/useUserStore';
import { useAppNavigation } from './navigation';
import {
  getManche1Questions,
  getRandomThemeChoices,
  getManche2Questions,
  getManche3Questions,
  recordMatchSession,
  recordMatchRound,
  recordMatchUserAnswer,
  ThemeOption,
} from '@/lib/matchEngine';
import { 
  checkAndUnlockBadges, 
  notifyProgressionUpdated 
} from '@/lib/progressionEngine';
import type { Question, BadgeItem } from '@/types';

type MatchStep =
  | 'lobby'
  | 'm1_playing'
  | 'trans_1_to_2'
  | 'm2_theme_select'
  | 'm2_playing'
  | 'trans_2_to_3'
  | 'm3_playing'
  | 'results';

interface RecordedAnswer {
  question: Question;
  roundNumber: 1 | 2 | 3;
  userAnswer: string;
  isCorrect: boolean;
  timeMs: number;
}

export const MatchScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { progress, setProgress } = useUserStore();
  const { navigate, goBack } = useAppNavigation();

  // Étape du jeu
  const [step, setStep] = useState<MatchStep>('lobby');

  // Identifiant de la session de match
  const [sessionId, setSessionId] = useState<string>('');

  // Questions des différentes manches
  const [m1Questions, setM1Questions] = useState<Question[]>([]);
  const [m2Questions, setM2Questions] = useState<Question[]>([]);
  const [m3Questions, setM3Questions] = useState<Question[]>([]);

  // Thèmes proposés & choisi pour la Manche 2
  const [proposedThemes, setProposedThemes] = useState<ThemeOption[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<ThemeOption | null>(null);

  // Question courante dans la manche active (index 0-based)
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);

  // Scores par manche (en points)
  const [scoreM1, setScoreM1] = useState<number>(0);
  const [scoreM2, setScoreM2] = useState<number>(0);
  const [scoreM3, setScoreM3] = useState<number>(0);

  // Historique des réponses de la partie
  const [answersHistory, setAnswersHistory] = useState<RecordedAnswer[]>([]);

  // Chronomètre
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(20);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);
  const [isTimeExpired, setIsTimeExpired] = useState<boolean>(false);

  // Horodatage début de question
  const questionStartTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Réponse sélectionnée pour feedback immédiat (Manche 1 et 3)
  const [selectedAnswerForFeedback, setSelectedAnswerForFeedback] = useState<string | null>(null);
  const [isFeedbackShowing, setIsFeedbackShowing] = useState<boolean>(false);

  // Nouveaux badges débloqués durant cette partie
  const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState<BadgeItem[]>([]);

  // Score total calculé
  const totalScore = scoreM1 + scoreM2 + scoreM3;

  // Question actuellement jouée selon la manche
  const currentQuestion: Question | undefined = useMemo(() => {
    if (step === 'm1_playing') return m1Questions[currentQuestionIdx];
    if (step === 'm2_playing') return m2Questions[currentQuestionIdx];
    if (step === 'm3_playing') return m3Questions[currentQuestionIdx];
    return undefined;
  }, [step, currentQuestionIdx, m1Questions, m2Questions, m3Questions]);

  // Options pour question_reponse (Manche 1)
  const currentShuffledChoices = useMemo(() => {
    if (!currentQuestion || currentQuestion.format !== 'question_reponse') return [];
    const all = [currentQuestion.correct_answer, ...currentQuestion.wrong_answers];
    return [...all].sort(() => Math.random() - 0.5);
  }, [currentQuestion]);

  // ==============================================================================
  // 1. DÉMARRAGE DU MATCH
  // ==============================================================================
  const handleStartMatch = async () => {
    const newSessionId = `match-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setSessionId(newSessionId);
    setScoreM1(0);
    setScoreM2(0);
    setScoreM3(0);
    setAnswersHistory([]);

    // Enregistrement initial de la session
    await recordMatchSession({
      id: newSessionId,
      userId: user?.id || 'guest',
      scoreTotal: 0,
      statut: 'en_cours',
      startedAt: new Date().toISOString(),
    });

    // Préparation des questions de Manche 1 (9 questions)
    const q1 = await getManche1Questions(9);
    setM1Questions(q1);
    setCurrentQuestionIdx(0);

    // Initialisation du chrono à 20s pour la Manche 1
    setTimeLeftSeconds(20);
    setIsTimerPaused(false);
    setIsTimeExpired(false);
    setIsFeedbackShowing(false);
    setSelectedAnswerForFeedback(null);
    questionStartTimeRef.current = Date.now();

    setStep('m1_playing');
  };

  // ==============================================================================
  // 2. GESTION DU CHRONOMÈTRE
  // ==============================================================================
  useEffect(() => {
    if (step !== 'm1_playing' && step !== 'm2_playing' && step !== 'm3_playing') {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    if (isTimerPaused || isFeedbackShowing) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current!);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [step, isTimerPaused, isFeedbackShowing, currentQuestionIdx]);

  // Expiration du chrono
  const handleTimeExpired = () => {
    setIsTimeExpired(true);
    setIsTimerPaused(true);
    setIsFeedbackShowing(true);

    if (!currentQuestion) return;

    const roundNumber: 1 | 2 | 3 = step === 'm1_playing' ? 1 : step === 'm2_playing' ? 2 : 3;
    const maxTime = roundNumber === 3 ? 15000 : 20000;

    // Enregistrement de la réponse ratée (temps écoulé)
    const rec: RecordedAnswer = {
      question: currentQuestion,
      roundNumber,
      userAnswer: '[Temps écoulé]',
      isCorrect: false,
      timeMs: maxTime,
    };
    setAnswersHistory((prev) => [...prev, rec]);

    recordMatchUserAnswer({
      sessionId,
      questionId: currentQuestion.id,
      reponseDonnee: '[Temps écoulé]',
      estCorrecte: false,
      tempsReponseMs: maxTime,
      userId: user?.id,
      roundNumber,
    });

    // Attente brève pour montrer la bonne réponse avant de passer à la suite
    setTimeout(() => {
      goToNextQuestion(roundNumber);
    }, 1800);
  };

  // ==============================================================================
  // 3. SOUMISSION D'UNE RÉPONSE
  // ==============================================================================
  const handleAnswerQuestion = (selected: string, isCorrect: boolean, timeMs: number) => {
    if (isFeedbackShowing || isTimeExpired || !currentQuestion) return;

    setIsTimerPaused(true);
    setIsFeedbackShowing(true);
    setSelectedAnswerForFeedback(selected);

    const roundNumber: 1 | 2 | 3 = step === 'm1_playing' ? 1 : step === 'm2_playing' ? 2 : 3;

    // Ajout de 10 points si correct
    if (isCorrect) {
      if (roundNumber === 1) setScoreM1((s) => s + 10);
      if (roundNumber === 2) setScoreM2((s) => s + 10);
      if (roundNumber === 3) setScoreM3((s) => s + 10);
    }

    // Enregistrement dans l'historique
    const rec: RecordedAnswer = {
      question: currentQuestion,
      roundNumber,
      userAnswer: selected,
      isCorrect,
      timeMs,
    };
    setAnswersHistory((prev) => [...prev, rec]);

    // Persistance Supabase / local
    recordMatchUserAnswer({
      sessionId,
      questionId: currentQuestion.id,
      reponseDonnee: selected,
      estCorrecte: isCorrect,
      tempsReponseMs: timeMs,
      userId: user?.id,
      roundNumber,
    });

    // Évaluation badge vitesse éclair (< 3s et correcte)
    if (isCorrect && timeMs < 3000) {
      checkAndUnlockBadges({
        userId: user?.id || 'demo-user-123',
        eventType: 'fast_answer',
        answerTimeMs: timeMs,
        isAnswerCorrect: true,
      });
    }

    // Délai de transition pour afficher le feedback vert/rouge
    setTimeout(() => {
      goToNextQuestion(roundNumber);
    }, 1300);
  };

  // ==============================================================================
  // 4. AVANCEMENT VERS LA QUESTION SUIVANTE OU LA MANCHE SUIVANTE
  // ==============================================================================
  const goToNextQuestion = async (roundNumber: 1 | 2 | 3) => {
    setIsFeedbackShowing(false);
    setSelectedAnswerForFeedback(null);
    setIsTimeExpired(false);

    if (roundNumber === 1) {
      if (currentQuestionIdx + 1 < m1Questions.length) {
        setCurrentQuestionIdx((i) => i + 1);
        setTimeLeftSeconds(20);
        setIsTimerPaused(false);
        questionStartTimeRef.current = Date.now();
      } else {
        // Fin de Manche 1 : Enregistrement du round 1
        await recordMatchRound({
          id: `round-${sessionId}-1`,
          sessionId,
          roundNumber: 1,
          themeChoisi: null,
          scoreManche: scoreM1,
        });

        // Tirage des 3 thèmes aléatoires pour la Manche 2
        const themes = await getRandomThemeChoices(3);
        setProposedThemes(themes);
        setStep('trans_1_to_2');
      }
    } else if (roundNumber === 2) {
      if (currentQuestionIdx + 1 < m2Questions.length) {
        setCurrentQuestionIdx((i) => i + 1);
        setTimeLeftSeconds(20);
        setIsTimerPaused(false);
        questionStartTimeRef.current = Date.now();
      } else {
        // Fin de Manche 2 : Enregistrement du round 2
        await recordMatchRound({
          id: `round-${sessionId}-2`,
          sessionId,
          roundNumber: 2,
          themeChoisi: selectedTheme?.id || 'rois',
          scoreManche: scoreM2,
        });

        // Préparation des questions de Manche 3 (5 questions)
        const q3 = await getManche3Questions(5);
        setM3Questions(q3);
        setStep('trans_2_to_3');
      }
    } else if (roundNumber === 3) {
      if (currentQuestionIdx + 1 < m3Questions.length) {
        setCurrentQuestionIdx((i) => i + 1);
        setTimeLeftSeconds(15); // 15 secondes pour Manche 3
        setIsTimerPaused(false);
        questionStartTimeRef.current = Date.now();
      } else {
        // Fin de Manche 3 : Enregistrement du round 3 et finalisation de la session
        const finalScore = scoreM1 + scoreM2 + scoreM3;
        await recordMatchRound({
          id: `round-${sessionId}-3`,
          sessionId,
          roundNumber: 3,
          themeChoisi: null,
          scoreManche: scoreM3,
        });

        await recordMatchSession({
          id: sessionId,
          userId: user?.id || 'guest',
          scoreTotal: finalScore,
          statut: 'termine',
          completedAt: new Date().toISOString(),
        });

        // Attribution d'XP dans le profil local
        if (progress) {
          setProgress({
            ...progress,
            total_xp: (progress.total_xp || 0) + finalScore,
            games_played: (progress.games_played || 0) + 1,
            win_count: finalScore >= 140 ? (progress.win_count || 0) + 1 : progress.win_count,
            loss_count: finalScore < 140 ? (progress.loss_count || 0) + 1 : progress.loss_count,
          });
        }

        // Évaluation des badges obtenus lors du match
        try {
          const earned = await checkAndUnlockBadges({
            userId: user?.id || 'demo-user-123',
            eventType: 'match_completed',
            matchScoreTotal: finalScore,
            scoreManche2: scoreM2,
            scoreManche3: scoreM3,
          });
          if (earned.length > 0) {
            setNewlyUnlockedBadges(earned);
          }
        } catch (e) {
          console.error('[MatchScreen] Erreur badge check:', e);
        }

        // Déclencher le rafraîchissement réactif du profil et classement
        notifyProgressionUpdated();

        setStep('results');
      }
    }
  };

  // ==============================================================================
  // 5. SÉLECTION DU THÈME MANCHE 2
  // ==============================================================================
  const handleSelectTheme = async (theme: ThemeOption) => {
    setSelectedTheme(theme);
    const q2 = await getManche2Questions(theme.id, 6);
    setM2Questions(q2);
    setCurrentQuestionIdx(0);
    setTimeLeftSeconds(20);
    setIsTimerPaused(false);
    setIsTimeExpired(false);
    setIsFeedbackShowing(false);
    setSelectedAnswerForFeedback(null);
    questionStartTimeRef.current = Date.now();
    setStep('m2_playing');
  };

  // Lancement Manche 3
  const handleStartManche3 = () => {
    setCurrentQuestionIdx(0);
    setTimeLeftSeconds(15); // Chrono très tendu (15s)
    setIsTimerPaused(false);
    setIsTimeExpired(false);
    setIsFeedbackShowing(false);
    setSelectedAnswerForFeedback(null);
    questionStartTimeRef.current = Date.now();
    setStep('m3_playing');
  };

  // Statistiques de la partie
  const averageTimeRound1 = useMemo(() => {
    const r1 = answersHistory.filter((a) => a.roundNumber === 1);
    if (r1.length === 0) return 0;
    const total = r1.reduce((sum, a) => sum + a.timeMs, 0);
    return Math.round(total / r1.length / 100) / 10;
  }, [answersHistory]);

  const averageTimeRound2 = useMemo(() => {
    const r2 = answersHistory.filter((a) => a.roundNumber === 2);
    if (r2.length === 0) return 0;
    const total = r2.reduce((sum, a) => sum + a.timeMs, 0);
    return Math.round(total / r2.length / 100) / 10;
  }, [answersHistory]);

  const averageTimeRound3 = useMemo(() => {
    const r3 = answersHistory.filter((a) => a.roundNumber === 3);
    if (r3.length === 0) return 0;
    const total = r3.reduce((sum, a) => sum + a.timeMs, 0);
    return Math.round(total / r3.length / 100) / 10;
  }, [answersHistory]);

  const totalAverageTime = useMemo(() => {
    if (answersHistory.length === 0) return 0;
    const total = answersHistory.reduce((sum, a) => sum + a.timeMs, 0);
    return Math.round(total / answersHistory.length / 100) / 10;
  }, [answersHistory]);

  // ==============================================================================
  // RENDU UI SELON L'ÉTAPE
  // ==============================================================================

  return (
    <div className="flex flex-col min-h-full pb-24 max-w-lg mx-auto w-full">
      {/* ------------------------------------------------------------- */}
      {/* A. LOBBY DU MATCH */}
      {/* ------------------------------------------------------------- */}
      {step === 'lobby' && (
        <div className="flex flex-col gap-5 p-4 animate-in fade-in duration-300">
          <Header
            title="Arène de Match"
            subtitle="Compétition officielle en 3 Manches • LSG 1910"
            onBack={goBack}
          />

          {/* Carte Principale Banner */}
          <Card variant="gradient" padding="lg" className="relative overflow-hidden border-amber-500/30">
            <div className="relative z-10 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Badge variant="gold" size="sm" icon={<Swords className="w-3.5 h-3.5" />}>
                  Match 3 Manches
                </Badge>
                <span className="text-xs font-mono font-bold text-amber-300">
                  Total : 200 pts max
                </span>
              </div>

              <h2 className="text-2xl font-black text-white tracking-tight">
                Le Défi des 3 Manches
              </h2>

              <p className="text-xs text-slate-300 leading-relaxed">
                Affrontez les Écritures à travers 3 épreuves distinctes : rapidité transversale, maîtrise thématique à trous, et herméneutique finale sous haute pression temporelle.
              </p>

              <div className="flex items-center gap-2 pt-2 text-[11px] font-mono text-amber-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Texte garanti 100% conforme Louis Segond 1910</span>
              </div>
            </div>
          </Card>

          {/* Aperçu des 3 Manches */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Déroulement des 3 Manches
            </label>

            {/* Manche 1 */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-sm shrink-0">
                1
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">Manche 1 : Échauffement Rapide</h4>
                  <span className="text-xs font-bold text-amber-400">90 pts</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  9 questions aléatoires tous livres confondus • Format Q&R • Chrono 20s
                </p>
              </div>
            </div>

            {/* Manche 2 */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black text-sm shrink-0">
                2
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">Manche 2 : Thème au Choix</h4>
                  <span className="text-xs font-bold text-blue-400">60 pts</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  6 questions sur 1 thème choisi parmi 3 • Format Texte à trous • Chrono 20s
                </p>
              </div>
            </div>

            {/* Manche 3 */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-rose-500/30 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 font-black text-sm shrink-0">
                3
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">Manche 3 : Défi Herméneutique</h4>
                  <span className="text-xs font-bold text-rose-400">50 pts</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  5 questions théologiques de haute difficulté • Format Vrai / Faux • Chrono 15s tendu !
                </p>
              </div>
            </div>
          </div>

          {/* Bouton de démarrage */}
          <div className="pt-2">
            <Button
              variant="gold"
              size="lg"
              fullWidth
              rightIcon={<Swords className="w-5 h-5 fill-slate-950" />}
              onClick={handleStartMatch}
            >
              Lancer le Match (200 pts)
            </Button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* B. MANCHE 1 EN COURS (9 Questions Q&R, 20s) */}
      {/* ------------------------------------------------------------- */}
      {step === 'm1_playing' && currentQuestion && (
        <div className="flex flex-col gap-4 p-4 animate-in fade-in duration-200">
          {/* Header de jeu */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold font-mono">
                MANCHE 1
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Question {currentQuestionIdx + 1} / {m1Questions.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-extrabold text-white">{scoreM1} pts</span>
            </div>
          </div>

          {/* Barre de Chrono 20s */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Timer className="w-3.5 h-3.5 text-amber-400" />
                <span>Temps restant</span>
              </span>
              <span className={`font-bold ${timeLeftSeconds <= 5 ? 'text-rose-400 animate-pulse' : 'text-amber-300'}`}>
                {timeLeftSeconds}s
              </span>
            </div>

            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <motion.div
                className={`h-full rounded-full transition-all duration-300 ${
                  timeLeftSeconds <= 5 ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                }`}
                style={{ width: `${(timeLeftSeconds / 20) * 100}%` }}
              />
            </div>
          </div>

          {/* Carte Question */}
          <Card variant="gradient" padding="md" className="border-amber-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-amber-400">
                {currentQuestion.book_name} (LSG 1910)
              </span>
              <Badge variant="default" size="sm">
                +10 points
              </Badge>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
              {currentQuestion.question_text}
            </h3>

            {currentQuestion.reference_biblique && isFeedbackShowing && (
              <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800 italic">
                Réf : <strong className="text-amber-300 not-italic font-mono">{currentQuestion.reference_biblique}</strong>
              </p>
            )}
          </Card>

          {/* Choix de réponses Q&R */}
          <div className="flex flex-col gap-2.5">
            {currentShuffledChoices.map((choice, index) => {
              const letter = String.fromCharCode(65 + index);
              const isSelected = selectedAnswerForFeedback === choice;
              const isCorrect = choice === currentQuestion.correct_answer;

              let btnStyle = 'bg-slate-900 border-slate-800 text-slate-200 hover:border-amber-500/50 hover:bg-slate-850';

              if (isFeedbackShowing) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/40';
                } else if (isSelected) {
                  btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200 ring-2 ring-rose-500/40';
                } else {
                  btnStyle = 'bg-slate-900/40 border-slate-800/40 text-slate-500 opacity-50';
                }
              }

              return (
                <button
                  key={index}
                  disabled={isFeedbackShowing || isTimeExpired}
                  onClick={() => {
                    const elapsed = Math.max(150, Date.now() - questionStartTimeRef.current);
                    handleAnswerQuestion(choice, isCorrect, elapsed);
                  }}
                  className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all duration-150 ${btnStyle} ${
                    !isFeedbackShowing ? 'active:scale-[0.99]' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 ${
                        isFeedbackShowing && isCorrect
                          ? 'bg-emerald-500 text-slate-950'
                          : isFeedbackShowing && isSelected
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="text-sm font-semibold">{choice}</span>
                  </div>

                  {isFeedbackShowing && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  {isFeedbackShowing && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* C. TRANSITION MANCHE 1 -> MANCHE 2 */}
      {/* ------------------------------------------------------------- */}
      {step === 'trans_1_to_2' && (
        <div className="flex flex-col gap-5 p-4 animate-in fade-in zoom-in-95 duration-300">
          <Card variant="gradient" padding="lg" className="border-amber-500/40 text-center relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mx-auto text-amber-300 shadow-lg shadow-amber-500/20 mb-3">
              <CheckCircle2 className="w-8 h-8 text-amber-400" />
            </div>

            <Badge variant="gold" size="sm" className="mx-auto mb-2">
              Manche 1 Terminée !
            </Badge>

            <h2 className="text-3xl font-black text-white tracking-tight">
              {scoreM1} / 90 <span className="text-sm font-bold text-amber-400">pts</span>
            </h2>

            <p className="text-xs text-slate-300 mt-2 max-w-xs mx-auto">
              Excellent échauffement ! Votre temps moyen de réponse sur cette première manche est de <strong>{averageTimeRound1}s</strong>.
            </p>
          </Card>

          {/* Annonce Manche 2 */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-blue-500/30 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="info" size="sm">
                Prochaine Étape
              </Badge>
              <h4 className="text-sm font-bold text-white">Manche 2 : Texte à Trous</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Vous allez choisir un thème parmi 3 propositions aléatoires. 6 versets à trous du thème sélectionné vous attendent. Au tap sur une chip, le mot vient compléter le verset instantanément !
            </p>
            <div className="flex items-center justify-between text-xs font-bold text-blue-300 pt-2 border-t border-slate-800">
              <span>6 questions • 10 pts / bonne réponse</span>
              <span>Max 60 pts</span>
            </div>
          </div>

          <Button
            variant="gold"
            size="lg"
            fullWidth
            rightIcon={<ChevronRight className="w-5 h-5" />}
            onClick={() => setStep('m2_theme_select')}
          >
            Choisir mon Thème pour la Manche 2
          </Button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* D. MANCHE 2 : CHOIX PARMI LES 3 THÈMES ALÉATOIRES */}
      {/* ------------------------------------------------------------- */}
      {step === 'm2_theme_select' && (
        <div className="flex flex-col gap-5 p-4 animate-in fade-in duration-300">
          <div>
            <Badge variant="info" size="sm" className="mb-1">
              Manche 2 • Sélection Stratégique
            </Badge>
            <h2 className="text-xl font-black text-white">
              Choisissez 1 Thème parmi les 3
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ces 3 thèmes ont été tirés au sort parmi l'ensemble des thèmes bibliques.
            </p>
          </div>

          {/* 3 Cartes de thèmes cliquables */}
          <div className="flex flex-col gap-3">
            {proposedThemes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleSelectTheme(theme)}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500 hover:bg-slate-850 text-left transition-all duration-200 group active:scale-[0.99] flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                  {theme.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                      {theme.label}
                    </h4>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {theme.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Format QCM à trous avec 4 chips de même catégorie grammaticale/sémantique.</span>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* E. MANCHE 2 EN COURS (6 Questions Texte à Trous, 20s) */}
      {/* ------------------------------------------------------------- */}
      {step === 'm2_playing' && currentQuestion && (
        <div className="flex flex-col gap-4 p-4 animate-in fade-in duration-200">
          {/* Header de jeu */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-bold font-mono">
                MANCHE 2 • {selectedTheme?.label}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {currentQuestionIdx + 1} / {m2Questions.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800">
              <Trophy className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-extrabold text-white">{scoreM1 + scoreM2} pts</span>
            </div>
          </div>

          {/* Barre de Chrono 20s */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Timer className="w-3.5 h-3.5 text-blue-400" />
                <span>Temps restant</span>
              </span>
              <span className={`font-bold ${timeLeftSeconds <= 5 ? 'text-rose-400 animate-pulse' : 'text-blue-300'}`}>
                {timeLeftSeconds}s
              </span>
            </div>

            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <motion.div
                className={`h-full rounded-full transition-all duration-300 ${
                  timeLeftSeconds <= 5 ? 'bg-rose-500' : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                }`}
                style={{ width: `${(timeLeftSeconds / 20) * 100}%` }}
              />
            </div>
          </div>

          {/* Composant TexteATrous réutilisable avec {{blank}} */}
          <TexteATrous
            key={currentQuestion.id}
            questionText={currentQuestion.question_text}
            correctAnswer={currentQuestion.correct_answer}
            wrongAnswers={currentQuestion.wrong_answers}
            referenceBiblique={currentQuestion.reference_biblique}
            isTimedOut={isTimeExpired}
            disabled={isFeedbackShowing}
            onAnswer={(selected, isCorrect, elapsed) => {
              handleAnswerQuestion(selected, isCorrect, elapsed);
            }}
          />
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* F. TRANSITION MANCHE 2 -> MANCHE 3 */}
      {/* ------------------------------------------------------------- */}
      {step === 'trans_2_to_3' && (
        <div className="flex flex-col gap-5 p-4 animate-in fade-in zoom-in-95 duration-300">
          <Card variant="gradient" padding="lg" className="border-blue-500/40 text-center relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center mx-auto text-blue-300 shadow-lg shadow-blue-500/20 mb-3">
              <Trophy className="w-8 h-8 text-blue-400" />
            </div>

            <Badge variant="info" size="sm" className="mx-auto mb-2">
              Manche 2 Terminée !
            </Badge>

            <h2 className="text-3xl font-black text-white tracking-tight">
              {scoreM1 + scoreM2} / 150 <span className="text-sm font-bold text-blue-400">pts</span>
            </h2>

            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-300">
              <span>Manche 1 : <strong>{scoreM1}/90</strong></span>
              <span>•</span>
              <span>Manche 2 : <strong>{scoreM2}/60</strong></span>
            </div>
          </Card>

          {/* Alerte Manche 3 Haute Tension */}
          <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/40 flex flex-col gap-2.5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
                <h4 className="text-sm font-bold text-white">Manche 3 : Défi Final Herméneutique</h4>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                Chrono 15s !
              </span>
            </div>

            <p className="text-xs text-rose-200/90 leading-relaxed">
              Attention : 5 questions herméneutiques de haute difficulté au format <strong>Vrai ou Faux</strong>. Le chronomètre passe à <strong>15 secondes seulement</strong> par question avec tension visuelle accrue.
            </p>

            <div className="flex items-center justify-between text-xs font-bold text-rose-300 pt-2 border-t border-rose-900/60">
              <span>5 questions • 10 pts / bonne réponse</span>
              <span>Max 50 pts</span>
            </div>
          </div>

          <Button
            variant="danger"
            size="lg"
            fullWidth
            rightIcon={<Flame className="w-5 h-5" />}
            onClick={handleStartManche3}
          >
            Entrer dans la Manche Finale (15s)
          </Button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* G. MANCHE 3 EN COURS (5 Questions Vrai/Faux, Chrono 15s Tendu) */}
      {/* ------------------------------------------------------------- */}
      {step === 'm3_playing' && currentQuestion && (
        <div className="flex flex-col gap-4 p-4 animate-in fade-in duration-200">
          {/* Header de jeu */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-bold font-mono animate-pulse">
                MANCHE 3 • ULTIME
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {currentQuestionIdx + 1} / {m3Questions.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-rose-500/30">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-xs font-extrabold text-white">{totalScore} pts</span>
            </div>
          </div>

          {/* Chrono Tendu 15s avec Pulsation & Ambiance Incandescente */}
          <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/40 shadow-lg shadow-rose-950/50 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 text-rose-300 font-bold">
                <Timer className="w-4 h-4 text-rose-400 animate-spin" style={{ animationDuration: '3s' }} />
                <span>CHRONO ÉCLAIR (15s)</span>
              </span>
              <span className={`text-base font-black font-mono tracking-wider ${
                timeLeftSeconds <= 5 ? 'text-white bg-rose-600 px-2 py-0.5 rounded-md animate-ping' : 'text-rose-300'
              }`}>
                00:{String(timeLeftSeconds).padStart(2, '0')}
              </span>
            </div>

            {/* Barre incandescente */}
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-rose-800">
              <motion.div
                className={`h-full rounded-full transition-all duration-200 ${
                  timeLeftSeconds <= 5
                    ? 'bg-gradient-to-r from-rose-600 to-red-400 shadow-lg shadow-rose-500 animate-pulse'
                    : 'bg-gradient-to-r from-amber-500 via-rose-500 to-red-500'
                }`}
                style={{ width: `${(timeLeftSeconds / 15) * 100}%` }}
              />
            </div>
          </div>

          {/* Carte Question Herméneutique */}
          <Card variant="gradient" padding="md" className="border-rose-500/30 bg-slate-900/90">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-rose-400 font-mono">
                {currentQuestion.book_name} • Herméneutique LSG 1910
              </span>
              <Badge variant="danger" size="sm">
                Diff. {currentQuestion.difficulty} / 5
              </Badge>
            </div>

            <p className="text-base sm:text-lg font-bold text-white leading-snug">
              {currentQuestion.question_text}
            </p>

            {currentQuestion.reference_biblique && isFeedbackShowing && (
              <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800 italic">
                Réf : <strong className="text-amber-300 not-italic font-mono">{currentQuestion.reference_biblique}</strong>
              </p>
            )}
          </Card>

          {/* Boutons Vrai / Faux */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* VRAI */}
            <button
              disabled={isFeedbackShowing || isTimeExpired}
              onClick={() => {
                const elapsed = Math.max(150, Date.now() - questionStartTimeRef.current);
                handleAnswerQuestion('Vrai', currentQuestion.correct_answer === 'Vrai', elapsed);
              }}
              className={`py-4 px-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all duration-150 ${
                isFeedbackShowing
                  ? currentQuestion.correct_answer === 'Vrai'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/50'
                    : selectedAnswerForFeedback === 'Vrai'
                    ? 'bg-rose-950/80 border-rose-500 text-rose-200 ring-2 ring-rose-500/50'
                    : 'bg-slate-900/40 border-slate-800 text-slate-600 opacity-40'
                  : 'bg-slate-900 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 active:scale-95 text-white'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
              <span className="text-base font-black tracking-wide">VRAI</span>
            </button>

            {/* FAUX */}
            <button
              disabled={isFeedbackShowing || isTimeExpired}
              onClick={() => {
                const elapsed = Math.max(150, Date.now() - questionStartTimeRef.current);
                handleAnswerQuestion('Faux', currentQuestion.correct_answer === 'Faux', elapsed);
              }}
              className={`py-4 px-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all duration-150 ${
                isFeedbackShowing
                  ? currentQuestion.correct_answer === 'Faux'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/50'
                    : selectedAnswerForFeedback === 'Faux'
                    ? 'bg-rose-950/80 border-rose-500 text-rose-200 ring-2 ring-rose-500/50'
                    : 'bg-slate-900/40 border-slate-800 text-slate-600 opacity-40'
                  : 'bg-slate-900 border-slate-800 hover:border-rose-500/50 hover:bg-slate-850 active:scale-95 text-white'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <X className="w-5 h-5 stroke-[3]" />
              </div>
              <span className="text-base font-black tracking-wide">FAUX</span>
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* H. ÉCRAN RÉCAPITULATIF FINAL DU MATCH (SCORE SUR 200 PTS) */}
      {/* ------------------------------------------------------------- */}
      {step === 'results' && (
        <div className="flex flex-col gap-5 p-4 animate-in fade-in zoom-in-95 duration-400">
          {/* Bannière de score */}
          <Card variant="gradient" padding="lg" className="border-amber-500/50 text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center mx-auto text-amber-300 shadow-xl shadow-amber-500/20 mb-3">
              <Trophy className="w-9 h-9 text-amber-400" />
            </div>

            <Badge variant="gold" size="sm" className="mx-auto mb-2">
              Match Terminé • Score Officiel
            </Badge>

            <h1 className="text-4xl font-black text-white tracking-tight">
              {totalScore}{' '}
              <span className="text-lg font-bold text-amber-400">/ 200 pts</span>
            </h1>

            <p className="text-xs text-slate-300 mt-2 font-medium">
              {totalScore >= 180
                ? '🏆 Maître Exégète : Connaissance exceptionnelle des Écritures !'
                : totalScore >= 140
                ? '⭐ Disciple Émérite : Très belle prestation biblique !'
                : totalScore >= 100
                ? '📖 Scribe Diligent : Bon match, persévérez dans la lecture !'
                : '🌱 Disciple en Marche : Relevez le défi pour fortifier vos connaissances !'}
            </p>

            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-around text-xs text-slate-400">
              <span>Temps moyen total : <strong className="text-white font-mono">{totalAverageTime}s</strong></span>
              <span>XP Gagné : <strong className="text-amber-400 font-mono">+{totalScore} XP</strong></span>
            </div>
          </Card>

          {/* Décomposition par Manche */}
          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Détail des 3 Manches
            </label>

            {/* Manche 1 */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <div>
                  <h4 className="text-xs font-bold text-white">Manche 1 : Échauffement</h4>
                  <p className="text-[11px] text-slate-400">Temps moyen : {averageTimeRound1}s</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-amber-400">{scoreM1} / 90</span>
                <span className="text-[10px] text-slate-500 block">points</span>
              </div>
            </div>

            {/* Manche 2 */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <div>
                  <h4 className="text-xs font-bold text-white">Manche 2 : {selectedTheme?.label || 'Thématique'}</h4>
                  <p className="text-[11px] text-slate-400">Temps moyen : {averageTimeRound2}s</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-blue-400">{scoreM2} / 60</span>
                <span className="text-[10px] text-slate-500 block">points</span>
              </div>
            </div>

            {/* Manche 3 */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 font-bold text-xs flex items-center justify-center">
                  3
                </span>
                <div>
                  <h4 className="text-xs font-bold text-white">Manche 3 : Herméneutique (15s)</h4>
                  <p className="text-[11px] text-slate-400">Temps moyen : {averageTimeRound3}s</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-rose-400">{scoreM3} / 50</span>
                <span className="text-[10px] text-slate-500 block">points</span>
              </div>
            </div>
          </div>

          {/* Récapitulatif interactif des questions */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Historique des 20 Questions ({answersHistory.filter(a => a.isCorrect).length} / 20 réussies)
            </label>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
              {answersHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-2.5 text-xs"
                >
                  <div className="mt-0.5 shrink-0">
                    {item.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 line-clamp-2">
                      {item.question.question_text.replace('{{blank}}', `[${item.question.correct_answer}]`)}
                    </p>
                    <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                      <span>Réf : <strong className="text-amber-300 font-mono">{item.question.reference_biblique}</strong></span>
                      <span className="font-mono">{Math.round(item.timeMs / 100) / 10}s</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Célébration des nouveaux badges débloqués */}
          {newlyUnlockedBadges.length > 0 && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/20 border border-amber-500/50 shadow-lg shadow-amber-500/10 text-center"
            >
              <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-1">
                <Sparkles className="w-5 h-5 fill-amber-400" />
                <span className="text-xs font-black uppercase tracking-wider">
                  Nouveau{newlyUnlockedBadges.length > 1 ? 'x' : ''} Badge{newlyUnlockedBadges.length > 1 ? 's' : ''} Débloqué{newlyUnlockedBadges.length > 1 ? 's' : ''} !
                </span>
                <Sparkles className="w-5 h-5 fill-amber-400" />
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                {newlyUnlockedBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-amber-400/40 flex items-center gap-2"
                  >
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <div className="text-left">
                      <span className="text-xs font-black text-white block">{badge.title}</span>
                      <span className="text-[10px] text-amber-300 font-bold">+{badge.points_xp} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="gold"
              size="lg"
              fullWidth
              rightIcon={<RotateCcw className="w-5 h-5" />}
              onClick={handleStartMatch}
            >
              Rejouer un Match (200 pts)
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                size="md"
                leftIcon={<Trophy className="w-4 h-4 text-amber-400" />}
                onClick={() => navigate('Leaderboard')}
              >
                Classement
              </Button>

              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate('Profile')}
              >
                Mon Profil
              </Button>
            </div>

            <Button
              variant="outline"
              size="md"
              fullWidth
              onClick={() => navigate('Home')}
            >
              Retour à l'accueil
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
