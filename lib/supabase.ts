/**
 * Client Supabase pour SuperQuizz Biblique
 * Module: /lib/supabase.ts
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Détection des variables d'environnement (compatibilité Expo & Web)
const getEnvVar = (expoKey: string, viteKey: string): string => {
  // 1. Expo SDK 49+ / React Native
  if (typeof process !== 'undefined' && process.env && process.env[expoKey]) {
    return process.env[expoKey] as string;
  }
  // 2. Vite Web
  const meta = import.meta as unknown as { env?: Record<string, string> };
  if (meta && meta.env && meta.env[viteKey]) {
    return meta.env[viteKey] as string;
  }
  return '';
};

export const SUPABASE_URL = getEnvVar('EXPO_PUBLIC_SUPABASE_URL', 'VITE_SUPABASE_URL');
export const SUPABASE_ANON_KEY = getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(SUPABASE_URL) &&
    Boolean(SUPABASE_ANON_KEY) &&
    !SUPABASE_URL.includes('xyzcompany') &&
    !SUPABASE_ANON_KEY.includes('your-anon-key')
  );
};

// Stockage sécurisé cross-platform (mémoire / localStorage / AsyncStorage)
const customStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // Ignorer les erreurs d'accès au stockage
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // Ignorer
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Ignorer
    }
  },
};

// Instance Supabase typée avec Database
export const supabase = createClient<Database>(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-anon-key',
  {
    auth: {
      storage: customStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // Recommandé pour React Native
    },
  }
);
