/**
 * Store Zustand pour la gestion des parties et sessions de jeu
 * Module: /store/useGameStore.ts
 * Basé sur le modèle de données officiel de SuperQuizz Biblique (LSG 1910)
 */

import { create } from 'zustand';
import type { Question, QuestionMode, QuestionFormat, QuestionTheme } from '@/types';

interface GameStoreState {
  // Configuration d'entraînement ou de match
  selectedMode: QuestionMode;
  selectedBookId: string | null;
  selectedBookName: string | null;
  selectedDifficulty: number; // 1-5
  selectedTheme: QuestionTheme | null;
  selectedFormat: QuestionFormat | 'all';

  // État de la session en cours
  activeSessionId: string | null;
  currentQuestions: Question[];
  currentQuestionIndex: number;
  score: number;
  isGameActive: boolean;

  // Actions
  setMode: (mode: QuestionMode) => void;
  setBook: (bookId: string | null, bookName: string | null) => void;
  setDifficulty: (difficulty: number) => void;
  setTheme: (theme: QuestionTheme | null) => void;
  setFormat: (format: QuestionFormat | 'all') => void;
  setQuestions: (questions: Question[]) => void;
  startSession: (sessionId: string, questions: Question[]) => void;
  answerQuestion: (isCorrect: boolean, points: number) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStoreState>((set) => ({
  selectedMode: 'entrainement',
  selectedBookId: null,
  selectedBookName: null,
  selectedDifficulty: 1,
  selectedTheme: null,
  selectedFormat: 'all',

  activeSessionId: null,
  currentQuestions: [],
  currentQuestionIndex: 0,
  score: 0,
  isGameActive: false,

  setMode: (selectedMode) => set({ selectedMode }),
  setBook: (selectedBookId, selectedBookName) => set({ selectedBookId, selectedBookName }),
  setDifficulty: (selectedDifficulty) => set({ selectedDifficulty }),
  setTheme: (selectedTheme) => set({ selectedTheme }),
  setFormat: (selectedFormat) => set({ selectedFormat }),
  setQuestions: (currentQuestions) => set({ currentQuestions }),

  startSession: (sessionId, questions) =>
    set({
      activeSessionId: sessionId,
      currentQuestions: questions,
      currentQuestionIndex: 0,
      score: 0,
      isGameActive: true,
    }),

  answerQuestion: (isCorrect, points) =>
    set((state) => ({
      score: isCorrect ? state.score + points : state.score,
      currentQuestionIndex: state.currentQuestionIndex + 1,
    })),

  resetGame: () =>
    set({
      activeSessionId: null,
      currentQuestions: [],
      currentQuestionIndex: 0,
      score: 0,
      isGameActive: false,
    }),
}));
