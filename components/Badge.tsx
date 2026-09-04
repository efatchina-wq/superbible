/**
 * Composant Badge Réutilisable pour SuperQuizz Biblique
 * Module: /components/Badge.tsx
 */

import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'gold' | 'success' | 'warning' | 'info' | 'purple' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  icon,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1 font-extrabold',
    md: 'text-xs px-3 py-1 gap-1.5 font-extrabold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-black',
  };

  const variantStyles = {
    default: 'bg-slate-800 text-slate-200 border border-slate-700',
    gold: 'bg-[#FFC800]/20 text-[#FFC800] border-2 border-[#FFC800]/50 shadow-sm',
    success: 'bg-[#58CC02]/20 text-[#58CC02] border-2 border-[#58CC02]/50 shadow-sm',
    warning: 'bg-[#FF9600]/20 text-[#FF9600] border-2 border-[#FF9600]/50 shadow-sm',
    info: 'bg-[#1CB0F6]/20 text-[#1CB0F6] border-2 border-[#1CB0F6]/50 shadow-sm',
    purple: 'bg-[#CE82FF]/20 text-[#CE82FF] border-2 border-[#CE82FF]/50 shadow-sm',
    danger: 'bg-[#FF4B4B]/20 text-[#FF4B4B] border-2 border-[#FF4B4B]/50 shadow-sm',
    outline: 'bg-transparent text-slate-300 border-2 border-slate-700',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full leading-none whitespace-nowrap uppercase tracking-wider select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
