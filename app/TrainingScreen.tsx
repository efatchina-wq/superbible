/**
 * Écran et Logique du Mode Entraînement Solo
 * Module: /app/TrainingScreen.tsx
 * Version Biblique : Louis Segond révisée 1910 (LSG 1910)
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  BookOpen, 
  Flame, 
  Check, 
  X, 
  Clock, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft,
  Sparkles, 
  Search, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Zap, 
  Award,
  BookMarked,
  Info,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppNavigation } from './navigation';
import { 
  calculerNouvelleDifficulte, 
  getBooksList, 
  getOrInitUserProgress, 
  saveUserProgress, 
  getSessionQuestions,
  getHistoricalAverageResponseTime,
  recordUserAnswer,
  recordTrainingSession
} from '@/lib/trainingEngine';
import { 
  checkAndUnlockBadges, 
  notifyProgressionUpdated 
} from '@/lib/progressionEngine';
import { playCorrectSound, playWrongSound, playCountdownTick } from '@/lib/soundEffects';
import { triggerCelebration } from '@/lib/confetti';
import { BiblicalMascot } from '@/components/BiblicalMascot';
import { DuolingoProgressBar } from '@/components/DuolingoProgressBar';
import type { Book, Question, UserProgress } from '@/types';

type TrainingView = 'book_select' | 'playing' | 'results';

interface AnsweredRecord {
  questionId: string;
  questionText: string;
  reponseDonnee: string;
  correctAnswer: string;
  estCorrecte: boolean;
  tempsReponseMs: number;
  referenceBiblique: string;
  difficulty: number;
}

const QUESTION_TIMEOUT_SECONDS = 20;

export const TrainingScreen: React.FC = () => {
  const { goBack } = useAppNavigation();
  const { user } = useAuthStore();
  const userId = user?.id || 'demo-user-123';

  // État général de la vue
  const [view, setView] = useState<TrainingView>('book_select');
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTestament, setSelectedTestament] = useState<'tous' | 'ancien' | 'nouveau'>('tous');
  
  // Dictionnaire de progression par livre (pour affichage dans la liste)
  const [progressMap, setProgressMap] = useState<Record<string, UserProgress>>({});

  // Session active
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [currentProgress, setCurrentProgress] = useState<UserProgress | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answeredRecords, setAnsweredRecords] = useState<AnsweredRecord[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [sessionStartTime, setSessionStartTime] = useState(0);
  const [wasPoolReset, setWasPoolReset] = useState(false);
  const [initialSessionDifficulty, setInitialSessionDifficulty] = useState(1);

  // État de la question en cours
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isTimeout, setIsTimeout] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIMEOUT_SECONDS);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [shakeKey, setShakeKey] = useState(0);

  // Résultats finaux
  const [finalScore, setFinalScore] = useState(0);
  const [avgResponseTimeMs, setAvgResponseTimeMs] = useState(0);
  const [historicalAvgMs, setHistoricalAvgMs] = useState(0);
  const [newDifficulty, setNewDifficulty] = useState(1);
  const [rapidityBonusGranted, setRapidityBonusGranted] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Charger les livres et leurs progressions
  const loadBooksAndProgress = useCallback(async () => {
    setLoading(true);
    try {
      const bookList = await getBooksList();
      setBooks(bookList);

      // Charger la progression de chaque livre
      const map: Record<string, UserProgress> = {};
      await Promise.all(
        bookList.map(async (b) => {
          const prog = await getOrInitUserProgress(userId, b.id);
          map[b.id] = prog;
        })
      );
      setProgressMap(map);
    } catch (e) {
      console.error('Erreur chargement livres/progressions:', e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadBooksAndProgress();
  }, [loadBooksAndProgress]);

  // Préparation d'une question
  const prepareQuestion = useCallback((q: Question) => {
    const allOptions = [q.correct_answer, ...q.wrong_answers];
    // Mélange déterministe par question
    const shuffled = [...allOptions].sort(() => Math.random() - 0.5);
    setShuffledOptions(shuffled);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsTimeout(false);
    setTimeLeft(QUESTION_TIMEOUT_SECONDS);
    setQuestionStartTime(Date.now());
  }, []);

  // Lancement d'une nouvelle session d'entraînement
  const handleStartSession = async (book: Book) => {
    setLoading(true);
    try {
      setSelectedBook(book);
      const prog = await getOrInitUserProgress(userId, book.id);
      setCurrentProgress(prog);
      setInitialSessionDifficulty(prog.difficulty_atteinte || 1);

      // Tirage des 10 questions selon la formule
      const sessionData = await getSessionQuestions(book, prog);
      setQuestions(sessionData.questions);
      setWasPoolReset(sessionData.wasReset);
      
      const newSessionId = `tr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      setSessionId(newSessionId);
      setSessionStartTime(Date.now());
      setCurrentIndex(0);
      setAnsweredRecords([]);

      if (sessionData.questions.length > 0) {
        prepareQuestion(sessionData.questions[0]);
        setView('playing');
      }
    } catch (err) {
      console.error('Erreur démarrage session:', err);
    } finally {
      setLoading(false);
    }
  };

  // Gestion de la fin de session et ajustement de difficulté
  const finalizeSession = useCallback(async (
    completedRecords: AnsweredRecord[],
    book: Book,
    prog: UserProgress,
    startDiff: number
  ) => {
    setLoading(true);
    try {
      const score = completedRecords.filter((r) => r.estCorrecte).length;
      setFinalScore(score);

      const totalTimeMs = completedRecords.reduce((acc, curr) => acc + curr.tempsReponseMs, 0);
      const avgMs = Math.round(totalTimeMs / completedRecords.length);
      setAvgResponseTimeMs(avgMs);

      // Récupérer le temps historique du joueur pour ce livre
      const histMs = await getHistoricalAverageResponseTime(userId, book.id);
      setHistoricalAvgMs(histMs);

      // Vérifier si le bonus rapidité est accordé
      const hasRapidityBonus = score >= 7 && histMs > 0 && avgMs < 0.6 * histMs;
      setRapidityBonusGranted(hasRapidityBonus);

      // Calcul de la nouvelle difficulté selon la formule pure
      const computedDifficulty = calculerNouvelleDifficulte(score, startDiff, avgMs, histMs);
      setNewDifficulty(computedDifficulty);

      // Mise à jour de la progression
      const updatedQuestionsVues = Array.from(
        new Set([...(prog.questions_vues || []), ...completedRecords.map((r) => r.questionId)])
      );

      const updatedProgress: UserProgress = {
        ...prog,
        difficulty_atteinte: computedDifficulty,
        questions_vues: updatedQuestionsVues,
        updated_at: new Date().toISOString(),
      };

      setCurrentProgress(updatedProgress);
      setProgressMap((prev) => ({
        ...prev,
        [book.id]: updatedProgress,
      }));

      // Sauvegarde dans user_progress
      await saveUserProgress(updatedProgress);

      // Enregistrement de la session dans training_sessions
      const sessionDurationSec = Math.round((Date.now() - sessionStartTime) / 1000);
      await recordTrainingSession({
        id: sessionId,
        userId,
        bookId: book.id,
        score,
        dureeTotaleSecondes: sessionDurationSec,
      });

      // Évaluation des badges d'entraînement et de progression
      try {
        await checkAndUnlockBadges({
          userId,
          eventType: 'training_completed',
          trainingScore: score,
          bookId: book.id,
          newBookDifficulty: computedDifficulty,
        });
      } catch (e) {
        console.error('[TrainingScreen] Erreur badge check:', e);
      }

      // Notifier le rafraîchissement réactif du profil et des compteurs
      notifyProgressionUpdated();

      // Célébration joyeuse si score >= 7
      if (score >= 7) {
        setTimeout(() => {
          triggerCelebration();
        }, 300);
      }

      setView('results');
    } catch (err) {
      console.error('Erreur finalisation session:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionId, sessionStartTime, userId]);

  // Passer à la question suivante ou clore la session
  const handleAdvanceNext = useCallback(() => {
    if (!selectedBook || !currentProgress) return;
    const nextIdx = currentIndex + 1;
    if (nextIdx < questions.length) {
      setCurrentIndex(nextIdx);
      prepareQuestion(questions[nextIdx]);
    } else {
      finalizeSession(answeredRecords, selectedBook, currentProgress, initialSessionDifficulty);
    }
  }, [answeredRecords, currentIndex, currentProgress, finalizeSession, initialSessionDifficulty, prepareQuestion, questions, selectedBook]);

  // Validation d'une réponse (ou timeout)
  const handleAnswer = useCallback(async (answer: string, isFromTimeout = false) => {
    if (isAnswered) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const currentQ = questions[currentIndex];
    const elapsedMs = isFromTimeout ? QUESTION_TIMEOUT_SECONDS * 1000 : Math.max(200, Date.now() - questionStartTime);
    const isCorrect = !isFromTimeout && answer === currentQ.correct_answer;

    setIsAnswered(true);
    setSelectedAnswer(answer);
    setIsTimeout(isFromTimeout);

    // Audio & Micro-animations style Duolingo
    if (isCorrect) {
      playCorrectSound();
    } else {
      playWrongSound();
      setShakeKey((prev) => prev + 1);
    }

    const record: AnsweredRecord = {
      questionId: currentQ.id,
      questionText: currentQ.question_text,
      reponseDonnee: isFromTimeout ? 'Temps écoulé' : answer,
      correctAnswer: currentQ.correct_answer,
      estCorrecte: isCorrect,
      tempsReponseMs: elapsedMs,
      referenceBiblique: currentQ.reference_biblique,
      difficulty: currentQ.difficulty,
    };

    const newRecords = [...answeredRecords, record];
    setAnsweredRecords(newRecords);

    // Enregistrer chaque réponse dans user_answers
    if (selectedBook) {
      recordUserAnswer({
        sessionId,
        questionId: currentQ.id,
        reponseDonnee: record.reponseDonnee,
        estCorrecte: isCorrect,
        tempsReponseMs: elapsedMs,
        userId,
        bookId: selectedBook.id,
      });

      if (isCorrect && elapsedMs < 3000) {
        checkAndUnlockBadges({
          userId,
          eventType: 'fast_answer',
          answerTimeMs: elapsedMs,
          isAnswerCorrect: true,
        });
      }
    }

    // Transition automatique après 1.8s
    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((prev) => prev + 1);
        prepareQuestion(questions[currentIndex + 1]);
      } else if (selectedBook && currentProgress) {
        finalizeSession(newRecords, selectedBook, currentProgress, initialSessionDifficulty);
      }
    }, 1800);
  }, [answeredRecords, currentIndex, currentProgress, finalizeSession, initialSessionDifficulty, isAnswered, prepareQuestion, questionStartTime, questions, selectedBook, sessionId, userId]);

  // Gestion du chrono (20 secondes)
  useEffect(() => {
    if (view !== 'playing' || isAnswered) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 5 && prev > 1) {
          playCountdownTick();
        }
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          handleAnswer('', true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [view, isAnswered, currentIndex, handleAnswer]);

  // Filtrage des livres pour l'écran de sélection
  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      if (selectedTestament !== 'tous' && b.testament !== selectedTestament) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        return (
          b.name.toLowerCase().includes(query) ||
          String(b.position).includes(query)
        );
      }
      return true;
    });
  }, [books, selectedTestament, searchQuery]);

  const currentQ = questions[currentIndex];

  // Helper pour afficher les étoiles de difficulté
  const renderStars = (count: number, max = 5) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, i) => (
          <span
            key={i}
            className={`text-xs ${
              i < count ? 'text-amber-400' : 'text-slate-700'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  // ============================================================================
  // VUE 1 : SÉLECTION DU LIVRE (LISTE DES LIVRES DEPUIS LA TABLE `books`)
  // ============================================================================
  if (view === 'book_select') {
    return (
      <div className="flex flex-col min-h-full pb-24 bg-slate-950 text-slate-100">
        <Header
          title="Mode Entraînement"
          subtitle="Choisissez un livre pour débuter (10 questions)"
          onBack={goBack}
        />

        <div className="p-4 flex flex-col gap-4 max-w-lg mx-auto w-full">
          {/* Bannière explicative de la formule progressive */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1 text-xs">
              <span className="font-bold text-amber-200 block mb-0.5">
                Progression Dynamique (Niveaux 1 à 5)
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Chaque session propose 10 questions calibrées sur votre niveau actuel. Score ≥ 7 vous fait progresser, et un temps ultra-rapide offre un bonus !
              </p>
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un livre (ex: Genèse, Jean)..."
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtres par Testament */}
          <div className="flex gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-800/80">
            {[
              { id: 'tous', label: `Tous (${books.length})` },
              { id: 'ancien', label: 'Ancien (39)' },
              { id: 'nouveau', label: 'Nouveau (27)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTestament(tab.id as any)}
                className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                  selectedTestament === tab.id
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Liste des 66 Livres */}
          <div className="space-y-2 mt-1">
            {filteredBooks.map((book) => {
              const prog = progressMap[book.id];
              const level = prog?.difficulty_atteinte || 1;
              const seenCount = prog?.questions_vues?.length || 0;

              return (
                <div
                  key={book.id}
                  onClick={() => handleStartSession(book)}
                  className="group p-3.5 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800/80 hover:border-amber-500/40 cursor-pointer transition-all duration-200 flex items-center justify-between shadow-sm active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-center font-mono font-bold text-xs text-amber-400 group-hover:bg-amber-500/10 group-hover:border-amber-500/30 transition-colors shrink-0">
                      {book.position}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100 group-hover:text-white truncate">
                          {book.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700/40 uppercase tracking-wider font-mono">
                          {book.testament === 'ancien' ? 'AT' : 'NT'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                        <span>Niveau {level}</span>
                        <span>•</span>
                        {renderStars(level, 5)}
                        {seenCount > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-slate-500">{seenCount} vues</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-8 h-8 rounded-full bg-slate-800/60 flex items-center justify-center text-slate-400 group-hover:text-amber-400 group-hover:bg-amber-500/10 transition-colors">
                      <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredBooks.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-xs">
                Aucun livre ne correspond à votre recherche.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // VUE 2 : SESSION DE 10 QUESTIONS (CHRONO 20S + FEEDBACK IMMÉDIAT)
  // ============================================================================
  if (view === 'playing' && currentQ) {
    const timerPercent = (timeLeft / QUESTION_TIMEOUT_SECONDS) * 100;
    const timerColor = 
      timeLeft > 10 ? 'text-[#58CC02] border-[#58CC02]/50 bg-[#58CC02]/15' :
      timeLeft > 4 ? 'text-[#FFC800] border-[#FFC800]/50 bg-[#FFC800]/15' :
      'text-[#FF4B4B] border-[#FF4B4B]/60 bg-[#FF4B4B]/20 animate-pulse';

    return (
      <div className="flex flex-col min-h-full pb-20 bg-slate-950 text-slate-100 select-none">
        {/* En-tête de session */}
        <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
          <button
            onClick={() => setView('book_select')}
            className="flex items-center gap-1 text-xs font-black text-slate-400 hover:text-slate-200 transition-colors uppercase tracking-wider"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Quitter</span>
          </button>

          <div className="text-center">
            <span className="text-xs font-black text-slate-200 block">
              {selectedBook?.name}
            </span>
            <span className="text-[10px] text-[#FFC800] font-black uppercase tracking-wider">
              Niveau joueur : {initialSessionDifficulty}/5
            </span>
          </div>

          {/* Indicateur Chrono Visuel */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-2xl border-2 text-xs font-black font-mono shadow-sm ${timerColor}`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{timeLeft}s</span>
          </div>
        </div>

        {/* Barre de chrono glossy style Duolingo */}
        <div className="px-4 py-1.5 bg-slate-900/60">
          <DuolingoProgressBar 
            progress={timerPercent} 
            color={timeLeft > 10 ? 'green' : timeLeft > 4 ? 'gold' : 'rose'} 
            size="sm" 
          />
        </div>

        {/* Stepper : 10 Questions avec statut */}
        <div className="px-4 py-2.5 flex items-center justify-between bg-slate-950/80 border-b border-slate-900">
          <span className="text-xs font-black tracking-wider uppercase text-slate-400">
            Question {currentIndex + 1} / 10
          </span>

          {/* Pastilles d'état des questions */}
          <div className="flex items-center gap-1.5">
            {questions.map((_, idx) => {
              const rec = answeredRecords[idx];
              let statusBg = 'bg-slate-800 text-slate-500';
              if (idx === currentIndex) {
                statusBg = 'bg-[#FFC800] text-slate-950 ring-2 ring-[#FFC800]/50 scale-110';
              } else if (rec) {
                statusBg = rec.estCorrecte ? 'bg-[#58CC02] text-white' : 'bg-[#FF4B4B] text-white';
              }

              return (
                <div
                  key={idx}
                  className={`w-3 h-3 rounded-full transition-all flex items-center justify-center font-bold text-[9px] ${statusBg}`}
                />
              );
            })}
          </div>

          <span className="text-xs font-black font-mono text-[#58CC02]">
            Score : {answeredRecords.filter((r) => r.estCorrecte).length}
          </span>
        </div>

        {/* Notification discrète si le stock de questions a été réinitialisé */}
        {wasPoolReset && currentIndex === 0 && (
          <div className="mx-4 mt-2 px-3 py-1.5 rounded-2xl bg-[#FFC800]/15 border-2 border-[#FFC800]/30 text-xs font-bold text-[#FFC800] flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>Toutes les questions du livre avaient été vues. Le cycle a été réinitialisé !</span>
          </div>
        )}

        {/* Zone Principale de la Question */}
        <div className="p-4 flex flex-col gap-4 max-w-lg mx-auto w-full flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentQ.id}-${shakeKey}`}
              initial={{ opacity: 0, x: 24 }}
              animate={
                isAnswered && selectedAnswer && selectedAnswer !== currentQ.correct_answer
                  ? { x: [0, -10, 10, -6, 6, 0] }
                  : { opacity: 1, x: 0 }
              }
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-4"
            >
              {/* Carte de la Question */}
              <Card variant="gradient" padding="lg" className="border-2 border-slate-800 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="gold" size="sm">
                    {currentQ.book_name} • Q{currentIndex + 1}
                  </Badge>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-bold">
                      Diff. {currentQ.difficulty}/5
                    </span>
                    {renderStars(currentQ.difficulty, 5)}
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-black text-white leading-snug mt-1">
                  {currentQ.question_text}
                </h3>
              </Card>

              {/* Feedback d'alerte en cas de Temps Écoulé */}
              {isTimeout && (
                <div className="p-3.5 rounded-2xl bg-[#FF4B4B]/20 border-2 border-[#FF4B4B]/40 text-white text-xs font-black flex items-center gap-2 animate-bounce">
                  <Clock className="w-4 h-4 shrink-0 text-[#FF4B4B]" />
                  <span>Temps écoulé ! (0 point)</span>
                </div>
              )}

              {/* 4 Choix de réponses (Feedback 3D Duolingo Vert / Rouge) */}
              <div className="flex flex-col gap-3 mt-1">
                {shuffledOptions.map((option, idx) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = option === currentQ.correct_answer;

                  let optionStyle = 'bg-slate-900 border-slate-800 border-b-4 border-b-slate-950 text-slate-100 hover:bg-slate-850 hover:border-slate-700 active:border-b-2 active:translate-y-[2px]';

                  if (isAnswered) {
                    if (isCorrect) {
                      // Bonne réponse : Vert Duolingo 3D
                      optionStyle = 'bg-[#58CC02]/20 border-[#58CC02] border-b-4 border-b-[#46A302] text-white shadow-md ring-2 ring-[#58CC02]/40';
                    } else if (isSelected) {
                      // Mauvaise réponse sélectionnée : Rouge Duolingo 3D
                      optionStyle = 'bg-[#FF4B4B]/20 border-[#FF4B4B] border-b-4 border-b-[#EA2B2B] text-white shadow-md ring-2 ring-[#FF4B4B]/40';
                    } else {
                      optionStyle = 'bg-slate-900/40 border-slate-800/40 text-slate-500 opacity-40';
                    }
                  }

                  const letter = String.fromCharCode(65 + idx); // A, B, C, D

                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => handleAnswer(option)}
                      className={`w-full text-left p-4 rounded-3xl border-2 transition-all duration-150 flex items-center justify-between ${optionStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-8 h-8 rounded-xl text-xs font-black font-mono flex items-center justify-center shrink-0 ${
                            isAnswered && isCorrect
                              ? 'bg-[#58CC02] text-slate-950'
                              : isAnswered && isSelected
                              ? 'bg-[#FF4B4B] text-white'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {letter}
                        </span>
                        <span className="text-sm font-black leading-snug">
                          {option}
                        </span>
                      </div>

                      {/* Icône de confirmation */}
                      {isAnswered && (
                        <div className="shrink-0 ml-2">
                          {isCorrect ? (
                            <div className="flex items-center gap-1 text-xs font-black text-[#58CC02]">
                              <span>Exact</span>
                              <CheckCircle2 className="w-5 h-5 text-[#58CC02]" />
                            </div>
                          ) : isSelected ? (
                            <div className="flex items-center gap-1 text-xs font-black text-[#FF4B4B]">
                              <span>Faux</span>
                              <XCircle className="w-5 h-5 text-[#FF4B4B]" />
                            </div>
                          ) : null}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Référence Biblique LSG 1910 affichée après réponse */}
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-2xl bg-slate-900 border-2 border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 text-slate-300">
                    <BookOpen className="w-4 h-4 text-[#FFC800] shrink-0" />
                    <span>
                      Réf. LSG 1910 : <strong className="text-[#FFC800] font-mono">{currentQ.reference_biblique}</strong>
                    </span>
                  </div>

                  <button
                    onClick={handleAdvanceNext}
                    className="px-3.5 py-2 rounded-xl bg-[#58CC02] hover:bg-[#61E002] border-b-2 border-[#46A302] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1 transition-all active:translate-y-[1px]"
                  >
                    <span>{currentIndex + 1 < questions.length ? 'Suivant' : 'Résultats'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ============================================================================
  // VUE 3 : ÉCRAN DE RÉSULTATS (SCORE /10, AJUSTEMENT DIFFICULTÉ, STATS & ACTIONS)
  // ============================================================================
  if (view === 'results') {
    const diffDelta = newDifficulty - initialSessionDifficulty;
    const isLevelUp = diffDelta > 0;
    const isLevelDown = diffDelta < 0;

    return (
      <div className="flex flex-col min-h-full pb-24 bg-slate-950 text-slate-100">
        <Header
          title="Fin de Session"
          subtitle={`Résultats de l'entraînement • ${selectedBook?.name}`}
          onBack={() => setView('book_select')}
        />

        <div className="p-4 flex flex-col gap-4 max-w-lg mx-auto w-full">
          {/* Mascotte Pax Célébrante ou Encourageante */}
          <div className="flex justify-center my-1">
            <BiblicalMascot 
              mood={finalScore >= 7 ? 'celebrating' : finalScore >= 4 ? 'happy' : 'encouraging'} 
              size="lg"
              speechBubble={
                finalScore >= 9
                  ? 'Exceptionnel ! Maîtrise parfaite des Écritures !'
                  : finalScore >= 7
                  ? 'Félicitations ! Tu progresses à grands pas !'
                  : finalScore >= 4
                  ? 'Bon effort ! La persévérance mène à la victoire !'
                  : 'Garde courage ! Révise et réessaie ce livre !'
              }
            />
          </div>

          {/* Carte Principale du Score Duolingo */}
          <div className="p-5 rounded-3xl bg-slate-900 border-2 border-slate-800 border-b-4 border-b-slate-950 text-center relative overflow-hidden shadow-sm">
            <div className="flex justify-center mb-1">
              <Badge variant={finalScore >= 7 ? 'gold' : 'info'} size="md">
                {finalScore >= 7 ? '⭐ Session Réussie' : '📖 Session Terminée'}
              </Badge>
            </div>

            <div className="text-5xl font-black text-white my-2 font-mono tracking-tight">
              {finalScore} <span className="text-xl font-bold text-slate-400">/ 10</span>
            </div>

            <div className="max-w-xs mx-auto">
              <DuolingoProgressBar 
                progress={(finalScore / 10) * 100} 
                color={finalScore >= 7 ? 'green' : finalScore >= 4 ? 'gold' : 'rose'} 
                size="md" 
              />
            </div>
          </div>

          {/* Carte d'Ajustement de la Difficulté (selon barème strict) */}
          <div className="p-4 rounded-3xl bg-slate-900 border-2 border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Ajustement Niveau (LSG 1910)
              </span>
              <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-slate-800 text-[#FFC800]">
                {selectedBook?.name}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border-2 border-slate-800">
              <div>
                <span className="text-xs font-bold text-slate-400 block">Départ</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-sm font-black text-slate-200">Niv. {initialSessionDifficulty}</span>
                  {renderStars(initialSessionDifficulty, 5)}
                </div>
              </div>

              <ArrowRight className="w-5 h-5 text-slate-500" />

              <div className="text-right">
                <span className="text-xs font-bold text-slate-400 block">Nouveau</span>
                <div className="flex items-center gap-1 justify-end mt-0.5">
                  <span className="text-sm font-black text-[#58CC02]">Niv. {newDifficulty}</span>
                  {renderStars(newDifficulty, 5)}
                </div>
              </div>
            </div>

            {/* Badge de variation */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {isLevelUp ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-2xl text-xs font-black bg-[#58CC02]/20 text-[#58CC02] border-2 border-[#58CC02]/40">
                    <TrendingUp className="w-3.5 h-3.5" />
                    +{diffDelta} {diffDelta > 1 ? 'Niveaux' : 'Niveau'} !
                  </span>
                ) : isLevelDown ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-2xl text-xs font-black bg-[#FF4B4B]/20 text-[#FF4B4B] border-2 border-[#FF4B4B]/40">
                    <TrendingDown className="w-3.5 h-3.5" />
                    {diffDelta} Niveau
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-2xl text-xs font-black bg-slate-800 text-slate-300 border-2 border-slate-700">
                    <Minus className="w-3.5 h-3.5" />
                    Niveau maintenu
                  </span>
                )}
              </div>

              {rapidityBonusGranted && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-2xl text-xs font-black bg-[#FFC800]/20 text-[#FFC800] border-2 border-[#FFC800]/40">
                  <Zap className="w-3 h-3 text-[#FFC800]" />
                  Bonus rapidité (+1 cran)
                </span>
              )}
            </div>
          </div>

          {/* Statistiques Chrono & Rapidité */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-3xl bg-slate-900 border-2 border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-1">
                <Clock className="w-3.5 h-3.5 text-[#FFC800]" />
                <span>Temps moyen</span>
              </div>
              <span className="text-lg font-black font-mono text-white">
                {(avgResponseTimeMs / 1000).toFixed(1)}s
              </span>
            </div>

            <div className="p-3.5 rounded-3xl bg-slate-900 border-2 border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Moyenne hist.</span>
              </div>
              <span className="text-lg font-black font-mono text-slate-300">
                {(historicalAvgMs / 1000).toFixed(1)}s
              </span>
            </div>
          </div>

          {/* Boutons d'action 3D Duolingo : Rejouer & Changer de livre */}
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <Button
              variant="primary"
              onClick={() => selectedBook && handleStartSession(selectedBook)}
              className="flex-1 py-3.5"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Rejouer ce livre
            </Button>

            <Button
              variant="secondary"
              onClick={() => {
                loadBooksAndProgress();
                setView('book_select');
              }}
              className="flex-1 py-3.5"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Changer de livre
            </Button>
          </div>

          {/* Détail Récapitulatif des 10 Questions */}
          <div className="mt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Détail des 10 questions répondues
            </h4>

            <div className="space-y-2">
              {answeredRecords.map((r, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border text-xs ${
                    r.estCorrecte
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-rose-950/20 border-rose-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-semibold text-slate-200">
                      {i + 1}. {r.questionText}
                    </span>
                    {r.estCorrecte ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 mt-1">
                    <span>
                      Rép. :{' '}
                      <strong className={r.estCorrecte ? 'text-emerald-300' : 'text-rose-300'}>
                        {r.reponseDonnee}
                      </strong>
                      {!r.estCorrecte && (
                        <span className="ml-1 text-slate-400">
                          (Bonne rép. : <span className="text-emerald-300">{r.correctAnswer}</span>)
                        </span>
                      )}
                    </span>

                    <span className="font-mono text-amber-400/90 text-[10px]">
                      {r.referenceBiblique} • {(r.tempsReponseMs / 1000).toFixed(1)}s
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
