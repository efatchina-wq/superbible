/**
 * Mascotte "Pax" - La Colombe Biblique (Style Duolingo)
 * Expression ludique, attachante et motivante avec micro-animations.
 * Module: /components/BiblicalMascot.tsx
 */

import React from 'react';
import { motion } from 'motion/react';

export type MascotMood = 'happy' | 'celebrating' | 'cheering' | 'thinking' | 'encouraging';

export interface BiblicalMascotProps {
  mood?: MascotMood;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  speechBubble?: string;
  className?: string;
  animate?: boolean;
}

export const BiblicalMascot: React.FC<BiblicalMascotProps> = ({
  mood = 'happy',
  size = 'md',
  speechBubble,
  className = '',
  animate = true,
}) => {
  const sizePixels = {
    sm: 44,
    md: 68,
    lg: 100,
    xl: 140,
  }[size];

  // Variations d'animation selon l'humeur
  const bounceVariants = {
    happy: {
      y: [0, -4, 0],
      rotate: [0, -1.5, 1.5, 0],
      transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
    },
    celebrating: {
      y: [0, -10, 0],
      scale: [1, 1.06, 1],
      rotate: [0, -4, 4, 0],
      transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
    },
    cheering: {
      y: [0, -6, 0],
      scale: [1, 1.04, 1],
      transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' },
    },
    thinking: {
      rotate: [-2, 3, -2],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    },
    encouraging: {
      y: [0, -3, 0],
      scale: [1, 1.02, 1],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  return (
    <div className={`relative inline-flex items-center gap-3 ${className}`}>
      {/* Mascotte SVG vectorielle animée */}
      <motion.div
        className="relative shrink-0 select-none"
        style={{ width: sizePixels, height: sizePixels }}
        animate={animate ? bounceVariants[mood] : undefined}
      >
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full drop-shadow-md overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Ombre au sol */}
          <ellipse cx="60" cy="112" rx="34" ry="7" fill="rgba(15, 23, 42, 0.35)" />

          {/* Halo doré pour les humeurs célestes / victoire */}
          {(mood === 'celebrating' || mood === 'cheering') && (
            <motion.ellipse
              cx="60"
              cy="22"
              rx="28"
              ry="7"
              stroke="#FFC800"
              strokeWidth="4"
              fill="none"
              strokeDasharray="4 2"
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: '60px 22px' }}
            />
          )}

          {/* Couronne pour célébration */}
          {mood === 'celebrating' && (
            <g transform="translate(42, 8)">
              <polygon
                points="0,18 9,0 18,12 27,0 36,18"
                fill="#FFC800"
                stroke="#E5A500"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <circle cx="9" cy="2" r="2.5" fill="#FF4B4B" />
              <circle cx="18" cy="12" r="2" fill="#1CB0F6" />
              <circle cx="27" cy="2" r="2.5" fill="#58CC02" />
            </g>
          )}

          {/* Corps principal : colombe toute ronde (forme Duolingo) */}
          <path
            d="M60 26 C84 26 98 42 98 68 C98 94 82 108 60 108 C38 108 22 94 22 68 C22 42 36 26 60 26 Z"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="3.5"
          />

          {/* Ventre doux nacré / nuances bleutées célestes */}
          <path
            d="M60 48 C76 48 84 62 84 80 C84 98 74 104 60 104 C46 104 36 98 36 80 C36 62 44 48 60 48 Z"
            fill="#F1F5F9"
          />

          {/* Aile gauche */}
          <motion.path
            d={
              mood === 'cheering' || mood === 'celebrating'
                ? 'M24 62 C10 44 4 28 14 26 C24 24 30 42 34 56 Z' // Aile levée
                : 'M25 60 C12 62 10 78 18 88 C24 96 32 88 34 76 Z'
            }
            fill="#E2E8F0"
            stroke="#CBD5E1"
            strokeWidth="3"
            strokeLinejoin="round"
            animate={
              animate && (mood === 'cheering' || mood === 'celebrating')
                ? { rotate: [-4, 6, -4] }
                : undefined
            }
            transition={{ duration: 0.8, repeat: Infinity }}
            style={{ transformOrigin: '30px 65px' }}
          />

          {/* Aile droite */}
          <motion.path
            d={
              mood === 'cheering' || mood === 'celebrating'
                ? 'M96 62 C110 44 116 28 106 26 C96 24 90 42 86 56 Z' // Aile levée
                : 'M95 60 C108 62 110 78 102 88 C96 96 88 88 86 76 Z'
            }
            fill="#E2E8F0"
            stroke="#CBD5E1"
            strokeWidth="3"
            strokeLinejoin="round"
            animate={
              animate && (mood === 'cheering' || mood === 'celebrating')
                ? { rotate: [4, -6, 4] }
                : undefined
            }
            transition={{ duration: 0.8, repeat: Infinity }}
            style={{ transformOrigin: '90px 65px' }}
          />

          {/* Pattes douces orange Duolingo */}
          <ellipse cx="49" cy="108" rx="7" ry="4" fill="#FF9600" />
          <ellipse cx="71" cy="108" rx="7" ry="4" fill="#FF9600" />

          {/* Joues roses mignonnes */}
          <circle cx="41" cy="67" r="6" fill="#FFB4B4" opacity="0.8" />
          <circle cx="79" cy="67" r="6" fill="#FFB4B4" opacity="0.8" />

          {/* Yeux expressifs ronds */}
          {mood === 'encouraging' ? (
            // Clin d'œil joueur
            <>
              <path d="M40 56 C44 51 48 51 52 56" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
              <circle cx="73" cy="56" r="6.5" fill="#0F172A" />
              <circle cx="75" cy="54" r="2.5" fill="#FFFFFF" />
            </>
          ) : (
            // Yeux grands ouverts pétillants
            <>
              <circle cx="47" cy="56" r="6.5" fill="#0F172A" />
              <circle cx="49" cy="54" r="2.5" fill="#FFFFFF" />
              <circle cx="45" cy="58" r="1.2" fill="#FFFFFF" />

              <circle cx="73" cy="56" r="6.5" fill="#0F172A" />
              <circle cx="75" cy="54" r="2.5" fill="#FFFFFF" />
              <circle cx="71" cy="58" r="1.2" fill="#FFFFFF" />
            </>
          )}

          {/* Petit Bec d'or / orange avec micro-reflet */}
          <polygon
            points="55,62 65,62 60,73"
            fill="#FF9600"
            stroke="#E07600"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Rameau d'Olivier biblique dans le bec */}
          <g transform="translate(62, 65)">
            <path
              d="M0 0 C6 -3 14 -1 18 -6"
              stroke="#46A302"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Feuilles d'olivier vert Duolingo #58CC02 */}
            <ellipse cx="7" cy="-3" rx="4" ry="2.2" transform="rotate(-30 7 -3)" fill="#58CC02" />
            <ellipse cx="14" cy="-5" rx="4" ry="2.2" transform="rotate(25 14 -5)" fill="#58CC02" />
            <ellipse cx="19" cy="-7" rx="3.5" ry="1.8" transform="rotate(-15 19 -7)" fill="#58CC02" />
          </g>
        </svg>
      </motion.div>

      {/* Bulle de dialogue interactive façon Duolingo */}
      {speechBubble && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: -6 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 350 }}
          className="relative bg-white text-slate-900 px-3.5 py-2 rounded-2xl border-2 border-slate-200 shadow-md max-w-xs text-xs sm:text-sm font-bold leading-snug select-none"
        >
          {/* Petite flèche vers la mascotte */}
          <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-6 border-t-transparent border-b-6 border-b-transparent border-r-8 border-r-white z-10" />
          <div className="absolute top-1/2 -left-2.5 -translate-y-1/2 w-0 h-0 border-t-7 border-t-transparent border-b-7 border-b-transparent border-r-9 border-r-slate-200" />
          <span>{speechBubble}</span>
        </motion.div>
      )}
    </div>
  );
};
