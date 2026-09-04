/**
 * Composant Card Réutilisable pour SuperQuizz Biblique
 * Module: /components/Card.tsx
 */

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'surface' | 'gradient' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  interactive = false,
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-3xl transition-all duration-150';

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3.5',
    md: 'p-4 sm:p-5',
    lg: 'p-6 sm:p-7',
  };

  const variantStyles = {
    default: 'bg-slate-900/95 border-2 border-slate-800 shadow-sm backdrop-blur-sm',
    surface: 'bg-slate-850/90 border-2 border-slate-700/80',
    gradient: 'bg-gradient-to-br from-slate-900 via-slate-850 to-amber-950/25 border-2 border-[#FFC800]/30 shadow-md',
    bordered: 'bg-slate-900/40 border-2 border-dashed border-slate-700',
  };

  const interactiveStyles = interactive
    ? 'cursor-pointer hover:border-slate-600 hover:bg-slate-850 active:scale-[0.99] active:translate-y-[1px]'
    : '';

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${interactiveStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
