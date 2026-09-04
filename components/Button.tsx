/**
 * Composant Bouton Réutilisable pour SuperQuizz Biblique
 * Style Duolingo : tactile 3D (biseau bas), couleurs vives, micro-animations et son de clic.
 * Module: /components/Button.tsx
 */

import React from 'react';
import { Loader2 } from 'lucide-react';
import { playClickSound } from '@/lib/soundEffects';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold' | 'blue' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
  playSound?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className = '',
  disabled,
  playSound = true,
  onClick,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-extrabold rounded-2xl transition-all duration-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:translate-y-[2px] active:border-b-2 cursor-pointer uppercase tracking-wider';

  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-xs gap-1.5 border-b-[3px]',
    md: 'px-5 py-2.5 text-sm gap-2 border-b-4',
    lg: 'px-7 py-3.5 text-base gap-2.5 border-b-[5px]',
  };

  const variantStyles = {
    // Vert succès emblématique de Duolingo
    primary:
      'bg-[#58CC02] hover:bg-[#61E002] text-white border-[#46A302] focus:ring-[#58CC02] shadow-sm',
    // Jaune plume d'or / XP
    gold:
      'bg-[#FFC800] hover:bg-[#FFD21F] text-[#7A4B00] border-[#E5A500] focus:ring-[#FFC800] shadow-sm',
    // Bleu ciel défi
    blue:
      'bg-[#1CB0F6] hover:bg-[#38BBF8] text-white border-[#1899D6] focus:ring-[#1CB0F6] shadow-sm',
    // Violet sagesse
    purple:
      'bg-[#CE82FF] hover:bg-[#D799FF] text-white border-[#A557D6] focus:ring-[#CE82FF] shadow-sm',
    // Corail alerte / danger
    danger:
      'bg-[#FF4B4B] hover:bg-[#FF5C5C] text-white border-[#EA2B2B] focus:ring-[#FF4B4B] shadow-sm',
    // Neutre sombre avec biseau tactile
    secondary:
      'bg-slate-800 hover:bg-slate-750 text-slate-100 border-slate-900 focus:ring-slate-500',
    // Contour avec biseau discret
    outline:
      'bg-slate-900/60 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-500 focus:ring-slate-400',
    // Fantôme
    ghost:
      'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white border-transparent focus:ring-slate-400 normal-case',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (playSound && !disabled && !isLoading) {
      playClickSound();
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
      disabled={disabled || isLoading}
      onClick={handleClick}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
