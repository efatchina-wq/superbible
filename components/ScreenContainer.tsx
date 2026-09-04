/**
 * Conteneur d'écran mobile standardisé pour SuperQuizz Biblique
 * Module: /components/ScreenContainer.tsx
 */

import React from 'react';

export interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  className?: string;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  scrollable = true,
  className = '',
}) => {
  return (
    <div
      className={`w-full h-full flex flex-col bg-slate-950 text-slate-100 ${
        scrollable ? 'overflow-y-auto' : 'overflow-hidden'
      } ${className}`}
    >
      {children}
    </div>
  );
};
