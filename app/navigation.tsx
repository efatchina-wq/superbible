/**
 * Système de Navigation pour SuperQuizz Biblique
 * Compatible avec l'architecture React Navigation
 * Module: /app/navigation.tsx
 */

import React, { createContext, useContext, useState } from 'react';

export type ScreenName = 'Home' | 'Training' | 'Match' | 'Leaderboard' | 'Profile' | 'Auth';

interface NavigationContextType {
  currentScreen: ScreenName;
  navigate: (screen: ScreenName, params?: Record<string, unknown>) => void;
  goBack: () => void;
  screenParams?: Record<string, unknown>;
  history: ScreenName[];
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{
  children: React.ReactNode;
  initialScreen?: ScreenName;
}> = ({ children, initialScreen = 'Home' }) => {
  const [history, setHistory] = useState<ScreenName[]>([initialScreen]);
  const [params, setParams] = useState<Record<string, unknown> | undefined>(undefined);

  const currentScreen = history[history.length - 1] || 'Home';

  const navigate = (screen: ScreenName, newParams?: Record<string, unknown>) => {
    setParams(newParams);
    setHistory((prev) => [...prev, screen]);
  };

  const goBack = () => {
    if (history.length > 1) {
      setHistory((prev) => prev.slice(0, -1));
    }
  };

  return (
    <NavigationContext.Provider
      value={{
        currentScreen,
        navigate,
        goBack,
        screenParams: params,
        history,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useAppNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useAppNavigation must be used within a NavigationProvider');
  }
  return context;
};
