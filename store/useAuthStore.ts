/**
 * Store Zustand pour l'authentification
 * Module: /store/useAuthStore.ts
 */

import { create } from 'zustand';
import type { Utilisateur } from '@/types';
import { authHelper } from '@/lib/authHelper';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: Utilisateur | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: Utilisateur | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      error: null,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  signOut: async () => {
    set({ isLoading: true });
    await authHelper.signOut();
    set({ user: null, isAuthenticated: false, isLoading: false, error: null });
  },

  checkSession: async () => {
    set({ isLoading: true });
    try {
      const session = await authHelper.getSession();
      if (session?.user) {
        // Profil
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        const profileData = profile as {
          pseudo?: string;
          username?: string;
          created_at?: string;
        } | null;

        set({
          user: {
            id: session.user.id,
            email: session.user.email || '',
            pseudo: profileData?.pseudo || profileData?.username || session.user.user_metadata?.pseudo || session.user.user_metadata?.username || 'Joueur',
            created_at: profileData?.created_at || session.user.created_at,
          },
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
