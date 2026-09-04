/**
 * Définition des types de base de données PostgreSQL générés pour Supabase
 * Module: /types/database.ts
 * Basé sur le schéma SuperQuizz Biblique (LSG 1910)
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      books: {
        Row: {
          id: string;
          name: string;
          testament: 'ancien' | 'nouveau';
          position: number;
        };
        Insert: {
          id?: string;
          name: string;
          testament: 'ancien' | 'nouveau';
          position: number;
        };
        Update: {
          id?: string;
          name?: string;
          testament?: 'ancien' | 'nouveau';
          position?: number;
        };
        Relationships: [];
      };
      questions: {
        Row: {
          id: string;
          book_id: string | null;
          mode: 'entrainement' | 'match_manche1' | 'match_manche2' | 'match_manche3';
          theme: string | null;
          format: 'question_reponse' | 'texte_a_trous' | 'vrai_faux';
          question_text: string;
          correct_answer: string;
          wrong_answers: Json; // string[]
          difficulty: number;
          reference_biblique: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          book_id?: string | null;
          mode: 'entrainement' | 'match_manche1' | 'match_manche2' | 'match_manche3';
          theme?: string | null;
          format: 'question_reponse' | 'texte_a_trous' | 'vrai_faux';
          question_text: string;
          correct_answer: string;
          wrong_answers?: Json;
          difficulty: number;
          reference_biblique: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          book_id?: string | null;
          mode?: 'entrainement' | 'match_manche1' | 'match_manche2' | 'match_manche3';
          theme?: string | null;
          format?: 'question_reponse' | 'texte_a_trous' | 'vrai_faux';
          question_text?: string;
          correct_answer?: string;
          wrong_answers?: Json;
          difficulty?: number;
          reference_biblique?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          email: string;
          pseudo: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          pseudo?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          pseudo?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          book_id: string;
          difficulty_atteinte: number;
          questions_vues: Json; // string[]
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          book_id: string;
          difficulty_atteinte?: number;
          questions_vues?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          book_id?: string;
          difficulty_atteinte?: number;
          questions_vues?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      training_sessions: {
        Row: {
          id: string;
          user_id: string;
          book_id: string | null;
          started_at: string;
          score: number;
          duree_totale: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          book_id?: string | null;
          started_at?: string;
          score?: number;
          duree_totale?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          book_id?: string | null;
          started_at?: string;
          score?: number;
          duree_totale?: number;
        };
        Relationships: [];
      };
      match_sessions: {
        Row: {
          id: string;
          user_id: string;
          opponent_user_id: string | null;
          started_at: string;
          score_total: number;
          statut: 'en_cours' | 'termine' | 'abandonne';
        };
        Insert: {
          id?: string;
          user_id: string;
          opponent_user_id?: string | null;
          started_at?: string;
          score_total?: number;
          statut?: 'en_cours' | 'termine' | 'abandonne';
        };
        Update: {
          id?: string;
          user_id?: string;
          opponent_user_id?: string | null;
          started_at?: string;
          score_total?: number;
          statut?: 'en_cours' | 'termine' | 'abandonne';
        };
        Relationships: [];
      };
      match_rounds: {
        Row: {
          id: string;
          match_session_id: string;
          numero_manche: number;
          theme_choisi: string | null;
          score_manche: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          match_session_id: string;
          numero_manche: number;
          theme_choisi?: string | null;
          score_manche?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          match_session_id?: string;
          numero_manche?: number;
          theme_choisi?: string | null;
          score_manche?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      user_answers: {
        Row: {
          id: string;
          session_id: string;
          session_type: 'training' | 'match';
          question_id: string;
          reponse_donnee: string;
          est_correcte: boolean;
          temps_reponse_ms: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          session_type?: 'training' | 'match';
          question_id: string;
          reponse_donnee: string;
          est_correcte: boolean;
          temps_reponse_ms?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          session_type?: 'training' | 'match';
          question_id?: string;
          reponse_donnee?: string;
          est_correcte?: boolean;
          temps_reponse_ms?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      badges: {
        Row: {
          id: string;
          code: string;
          title: string;
          description: string;
          icon: string;
          category: string;
          points_xp: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          title: string;
          description: string;
          icon: string;
          category?: string;
          points_xp?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          title?: string;
          description?: string;
          icon?: string;
          category?: string;
          points_xp?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          unlocked_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_id: string;
          unlocked_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          badge_id?: string;
          unlocked_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      leaderboard_all_time: {
        Row: {
          user_id: string;
          pseudo: string | null;
          best_score: number;
          matches_played: number;
          last_played_at: string;
          rank: number;
        };
        Relationships: [];
      };
      leaderboard_7_days: {
        Row: {
          user_id: string;
          pseudo: string | null;
          best_score: number;
          matches_played: number;
          last_played_at: string;
          rank: number;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
