/**
 * Helpers d'authentification Supabase (Email / Password)
 * Module: /lib/authHelper.ts
 */

import { supabase, isSupabaseConfigured } from './supabase';
import type { Utilisateur } from '@/types';

export interface AuthResult {
  success: boolean;
  user?: Utilisateur | null;
  error?: string | null;
}

export const authHelper = {
  /**
   * Inscription avec email et mot de passe
   */
  async signUp(email: string, password: string, pseudo: string): Promise<AuthResult> {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Supabase n\'est pas encore configuré. Remplissez vos variables d\'environnement (.env).',
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            pseudo,
            username: pseudo,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const mappedUser: Utilisateur = {
          id: data.user.id,
          email: data.user.email || email,
          pseudo: pseudo || email.split('@')[0],
          created_at: data.user.created_at || new Date().toISOString(),
        };
        return { success: true, user: mappedUser };
      }

      return { success: true, user: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inattendue lors de l\'inscription';
      return { success: false, error: message };
    }
  },

  /**
   * Connexion avec email et mot de passe
   */
  async signIn(email: string, password: string): Promise<AuthResult> {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Supabase n\'est pas encore configuré. Remplissez vos variables d\'environnement (.env).',
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Récupérer le profil public
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        const profileData = profile as {
          pseudo?: string;
          username?: string;
          created_at?: string;
        } | null;

        const mappedUser: Utilisateur = {
          id: data.user.id,
          email: data.user.email || email,
          pseudo: profileData?.pseudo || profileData?.username || data.user.user_metadata?.pseudo || data.user.user_metadata?.username || email.split('@')[0],
          created_at: profileData?.created_at || data.user.created_at,
        };

        return { success: true, user: mappedUser };
      }

      return { success: false, error: 'Aucun utilisateur retourné' };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inattendue lors de la connexion';
      return { success: false, error: message };
    }
  },

  /**
   * Déconnexion
   */
  async signOut(): Promise<{ success: boolean; error?: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la déconnexion';
      return { success: false, error: message };
    }
  },

  /**
   * Récupérer la session active
   */
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch {
      return null;
    }
  },
};
