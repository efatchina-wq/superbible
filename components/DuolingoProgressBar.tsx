/**
 * Barre de progression style Duolingo
 * Reflet brillant (candy gloss), coins ultra-arrondis et micro-animations.
 * Module: /components/DuolingoProgressBar.tsx
 */

import React from 'react';
import { motion } from 'motion/react';

export interface DuolingoProgressBarProps {
  progress: number; // 0 à 100
  color?: 'green' | 'gold' | 'blue' | 'purple' | 'coral' | 'dynamic';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showShine?: boolean;
}

export const DuolingoProgressBar: React.FC<DuolingoProgressBarProps> = ({
  progress,
  color = 'green',
  size = 'md',
  className = '',
  showShine = true,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const heightStyles = {
    sm: 'h-2.5',
    md: 'h-4',
    lg: 'h-5',
  };

  // Couleurs dynamiques (style chrono : vert -> jaune -> corail)
  let resolvedColor = color;
  if (color === 'dynamic') {
    if (clampedProgress > 50) resolvedColor = 'green';
    else if (clampedProgress > 25) resolvedColor = 'gold';
    else resolvedColor = 'coral';
  }

  const colorStyles = {
    green: 'bg-[#58CC02] shadow-[0_2px_0_0_#46A302]',
    gold: 'bg-[#FFC800] shadow-[0_2px_0_0_#E5A500]',
    blue: 'bg-[#1CB0F6] shadow-[0_2px_0_0_#1899D6]',
    purple: 'bg-[#CE82FF] shadow-[0_2px_0_0_#A557D6]',
    coral: 'bg-[#FF4B4B] shadow-[0_2px_0_0_#EA2B2B]',
  }[resolvedColor as 'green' | 'gold' | 'blue' | 'purple' | 'coral'] || 'bg-[#58CC02]';

  return (
    <div
      className={`w-full bg-slate-800/90 rounded-full border-2 border-slate-700/80 p-0.5 overflow-hidden relative shadow-inner ${heightStyles[size]} ${className}`}
    >
      <motion.div
        className={`h-full rounded-full relative overflow-hidden transition-colors duration-300 ${colorStyles}`}
        initial={{ width: 0 }}
        animate={{ width: `${clampedProgress}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      >
        {/* Reflet brillant style Duolingo candy shine */}
        {showShine && clampedProgress > 3 && (
          <div className="absolute top-0.5 left-1 right-1 h-[30%] bg-white/40 rounded-full" />
        )}
      </motion.div>
    </div>
  );
};
