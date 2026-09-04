/**
 * Composant Header d'écran pour SuperQuizz Biblique
 * Style Duolingo : arrondi, dynamique avec indicateurs de streak et son
 * Module: /components/Header.tsx
 */

import React from 'react';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { playClickSound } from '@/lib/soundEffects';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  transparent?: boolean;
  showSoundToggle?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onBack,
  rightAction,
  transparent = false,
  showSoundToggle = false,
}) => {
  const { soundEnabled, toggleSound } = useUserStore();

  const handleBack = () => {
    playClickSound();
    if (onBack) onBack();
  };

  const handleSoundToggle = () => {
    toggleSound();
    playClickSound();
  };

  return (
    <header
      className={`w-full py-3 px-4 flex items-center justify-between border-b transition-colors z-20 ${
        transparent
          ? 'bg-transparent border-transparent'
          : 'bg-slate-950/95 border-slate-800/90 backdrop-blur-md sticky top-0'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {onBack && (
          <button
            onClick={handleBack}
            className="w-9 h-9 rounded-2xl bg-slate-900 border-2 border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-all active:scale-95"
            aria-label="Retour"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-black text-slate-100 truncate tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs font-bold text-slate-400 truncate">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-2">
        {showSoundToggle && (
          <button
            onClick={handleSoundToggle}
            className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all active:scale-95 ${
              soundEnabled
                ? 'bg-[#58CC02]/20 border-[#58CC02]/40 text-[#58CC02]'
                : 'bg-slate-900 border-slate-700 text-slate-500'
            }`}
            title={soundEnabled ? 'Son activé' : 'Son coupé'}
            aria-label="Activer ou désactiver le son"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        )}
        {rightAction}
      </div>
    </header>
  );
};
