/**
 * Store Zustand pour la progression et le profil utilisateur
 * Module: /store/useUserStore.ts
 */

import { create } from 'zustand';
import type { UserProgress } from '@/types';

interface UserStoreState {
  progress: UserProgress | null;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  theme: 'dark' | 'light';

  setProgress: (progress: UserProgress | null) => void;
  toggleSound: () => void;
  toggleHaptics: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

export const useUserStore = create<UserStoreState>((set) => ({
  progress: {
    id: 'demo-progress-id',
    user_id: 'guest',
    total_xp: 450,
    level: 3,
    rank_title: 'Scribe Apprenti',
    games_played: 12,
    win_count: 8,
    loss_count: 4,
    current_streak: 3,
    best_streak: 5,
    categories_mastery: {
      genese_patriarches: 65,
      evangiles_jesus: 80,
      actes_eglise: 40,
    },
    last_active_at: new Date().toISOString(),
  },
  soundEnabled: true,
  hapticsEnabled: true,
  theme: 'dark',

  setProgress: (progress) => set({ progress }),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  toggleHaptics: () => set((state) => ({ hapticsEnabled: !state.hapticsEnabled })),
  setTheme: (theme) => set({ theme }),
}));
