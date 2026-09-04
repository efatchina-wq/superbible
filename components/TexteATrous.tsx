/**
 * Composant TexteATrous
 * Module: /components/TexteATrous.tsx
 * 
 * QCM à trous basé sur le marqueur littéral `{{blank}}`.
 * Évite les faux négatifs de saisie libre sur les noms propres bibliques.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { playCorrectSound, playWrongSound } from '@/lib/soundEffects';

export interface TexteATrousProps {
  questionText: string; // Doit contenir "{{blank}}"
  correctAnswer: string;
  wrongAnswers: string[]; // 3 distracteurs homogènes
  onAnswer: (selected: string, isCorrect: boolean, tempsReponseMs: number) => void;
  isTimedOut?: boolean;
  disabled?: boolean;
  referenceBiblique?: string;
}

export const TexteATrous: React.FC<TexteATrousProps> = ({
  questionText,
  correctAnswer,
  wrongAnswers,
  onAnswer,
  isTimedOut = false,
  disabled = false,
  referenceBiblique,
}) => {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [hasAnswered, setHasAnswered] = useState(false);
  const [shakeKey, setShakeKey] = useState<number>(0);

  // Réinitialisation lors du changement de question
  useEffect(() => {
    setSelectedWord(null);
    setHasAnswered(false);
    setStartTime(Date.now());
  }, [questionText, correctAnswer]);

  // Mélange aléatoire des 4 options (bonne réponse + 3 distracteurs)
  const options = useMemo(() => {
    const all = [correctAnswer, ...wrongAnswers];
    return [...all].sort(() => Math.random() - 0.5);
  }, [correctAnswer, wrongAnswers]);

  // Découpage de la phrase autour du marqueur {{blank}}
  const { prefix, suffix } = useMemo(() => {
    const parts = questionText.split('{{blank}}');
    return {
      prefix: parts[0] || '',
      suffix: parts[1] || '',
    };
  }, [questionText]);

  // Gestion de la sélection d'une chip
  const handleSelect = (option: string) => {
    if (disabled || hasAnswered || isTimedOut) return;

    const elapsed = Math.max(150, Date.now() - startTime);
    const isCorrect = option === correctAnswer;

    setSelectedWord(option);
    setHasAnswered(true);

    if (isCorrect) {
      playCorrectSound();
    } else {
      playWrongSound();
      setShakeKey((prev) => prev + 1);
    }

    onAnswer(option, isCorrect, elapsed);
  };

  // État affiché dans le trou
  const displayedBlankWord = isTimedOut && !selectedWord ? correctAnswer : selectedWord;
  const isSelectedCorrect = selectedWord === correctAnswer;

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Phrase avec le trou stylisé Duolingo */}
      <motion.div
        key={`card-${shakeKey}`}
        animate={
          hasAnswered && !isSelectedCorrect
            ? { x: [0, -10, 10, -6, 6, 0] }
            : hasAnswered && isSelectedCorrect
            ? { scale: [1, 1.02, 1] }
            : {}
        }
        transition={{ duration: 0.4 }}
        className="p-4 sm:p-5 rounded-3xl bg-slate-900 border-2 border-slate-700/80 shadow-md relative overflow-hidden"
      >
        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#FFC800] mb-2">
          <Sparkles className="w-4 h-4 text-[#FFC800]" />
          <span>Texte Biblique à trous</span>
        </div>

        <p className="text-base sm:text-lg leading-relaxed text-slate-100 font-bold">
          {prefix}
          <span className="inline-block mx-1.5 align-middle">
            <AnimatePresence mode="wait">
              {displayedBlankWord ? (
                <motion.span
                  key={displayedBlankWord}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 22 }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-sm sm:text-base font-extrabold border-2 shadow-sm ${
                    hasAnswered && isSelectedCorrect
                      ? 'bg-[#58CC02]/25 text-[#58CC02] border-[#58CC02] ring-2 ring-[#58CC02]/40'
                      : hasAnswered && !isSelectedCorrect
                      ? 'bg-[#FF4B4B]/25 text-[#FF4B4B] border-[#FF4B4B] ring-2 ring-[#FF4B4B]/40'
                      : isTimedOut
                      ? 'bg-[#FFC800]/25 text-[#FFC800] border-[#FFC800] animate-pulse'
                      : 'bg-[#FFC800]/20 text-[#FFC800] border-[#FFC800]/60'
                  }`}
                >
                  <span>{displayedBlankWord}</span>
                  {hasAnswered && isSelectedCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-[#58CC02] shrink-0" />
                  )}
                  {hasAnswered && !isSelectedCorrect && (
                    <XCircle className="w-4 h-4 text-[#FF4B4B] shrink-0" />
                  )}
                </motion.span>
              ) : (
                <span className="inline-flex items-center justify-center min-w-[120px] px-3.5 py-1 rounded-2xl border-2 border-dashed border-[#FFC800] bg-[#FFC800]/10 text-[#FFC800] text-xs font-black tracking-wider animate-pulse">
                  [ mot manquant ]
                </span>
              )}
            </AnimatePresence>
          </span>
          {suffix}
        </p>

        {referenceBiblique && (hasAnswered || isTimedOut) && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 pt-2.5 border-t-2 border-slate-800 text-xs text-slate-400 flex items-center justify-between"
          >
            <span>Réf. biblique : <strong className="text-[#FFC800] font-black">{referenceBiblique}</strong></span>
            {isTimedOut && !selectedWord && (
              <span className="text-[#FF4B4B] font-extrabold text-[11px]">Temps écoulé</span>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* 4 Chips de réponses en bouton 3D tactile */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-black uppercase tracking-wider text-slate-400 px-1">
          Choisis le terme exact :
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {options.map((option, index) => {
            const isSelected = selectedWord === option;
            const isCorrect = option === correctAnswer;

            let chipStyle =
              'bg-slate-850 hover:bg-slate-800 text-slate-100 border-2 border-slate-700 border-b-4 border-b-slate-900 active:translate-y-[2px] active:border-b-2';

            if (hasAnswered || isTimedOut) {
              if (isCorrect) {
                chipStyle =
                  'bg-[#58CC02]/20 border-2 border-[#58CC02] border-b-4 border-b-[#46A302] text-white ring-1 ring-[#58CC02]/50';
              } else if (isSelected) {
                chipStyle =
                  'bg-[#FF4B4B]/20 border-2 border-[#FF4B4B] border-b-4 border-b-[#EA2B2B] text-white ring-1 ring-[#FF4B4B]/50';
              } else {
                chipStyle = 'bg-slate-900/40 border-2 border-slate-800 border-b-2 text-slate-500 opacity-40';
              }
            }

            const letter = String.fromCharCode(65 + index); // A, B, C, D

            return (
              <button
                key={index}
                disabled={disabled || hasAnswered || isTimedOut}
                onClick={() => handleSelect(option)}
                className={`py-3.5 px-4 rounded-2xl text-left flex items-center justify-between transition-all duration-100 select-none cursor-pointer ${chipStyle}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center shrink-0 border ${
                      hasAnswered && isCorrect
                        ? 'bg-[#58CC02] text-slate-950 border-[#46A302]'
                        : hasAnswered && isSelected
                        ? 'bg-[#FF4B4B] text-white border-[#EA2B2B]'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="text-sm sm:text-base font-extrabold truncate">
                    {option}
                  </span>
                </div>

                {/* Statut icône */}
                {(hasAnswered || isTimedOut) && isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-[#58CC02] shrink-0 ml-1.5" />
                )}
                {hasAnswered && isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-[#FF4B4B] shrink-0 ml-1.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
