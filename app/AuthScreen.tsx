/**
 * Écran d'Authentification Supabase (Connexion & Inscription)
 * Module: /app/AuthScreen.tsx
 */

import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2,
  Sparkles 
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Badge } from '@/components/Badge';
import { authHelper } from '@/lib/authHelper';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppNavigation } from './navigation';

export const AuthScreen: React.FC = () => {
  const { goBack } = useAppNavigation();
  const { setUser } = useAuthStore();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isConfigured = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (mode === 'signup' && !username) {
      setErrorMessage('Veuillez choisir un nom de disciple / pseudo.');
      return;
    }

    setLoading(true);

    if (!isConfigured) {
      // Simulation pour démo locale sans clés configurées
      setTimeout(() => {
        setLoading(false);
        const demoUser = {
          id: 'demo-user-123',
          email,
          pseudo: username || email.split('@')[0],
          created_at: new Date().toISOString(),
        };
        setUser(demoUser);
        setSuccessMessage('Connexion en mode démonstration réussie !');
        setTimeout(() => goBack(), 800);
      }, 700);
      return;
    }

    try {
      if (mode === 'signup') {
        const res = await authHelper.signUp(email, password, username);
        if (res.success) {
          if (res.user) {
            setUser(res.user);
            setSuccessMessage('Compte créé avec succès ! Bienvenue.');
            setTimeout(() => goBack(), 800);
          } else {
            setSuccessMessage('Vérifiez vos emails pour confirmer votre inscription.');
          }
        } else {
          setErrorMessage(res.error || 'Échec de l\'inscription.');
        }
      } else {
        const res = await authHelper.signIn(email, password);
        if (res.success && res.user) {
          setUser(res.user);
          setSuccessMessage('Connexion réussie ! Heureux de vous revoir.');
          setTimeout(() => goBack(), 800);
        } else {
          setErrorMessage(res.error || 'Email ou mot de passe incorrect.');
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur réseau';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full pb-20">
      <Header
        title="Authentification"
        subtitle="SuperQuizz Biblique"
        onBack={goBack}
      />

      <div className="p-4 flex flex-col gap-5 max-w-sm mx-auto w-full">
        {/* Supabase status banner */}
        {!isConfigured && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200/90 leading-relaxed">
              <span className="font-bold text-amber-300">Variables Supabase en attente.</span>{' '}
              Un compte de démonstration simulé sera utilisé tant que <code className="text-[10px] bg-amber-500/20 px-1 py-0.5 rounded">.env</code> n'est pas renseigné.
            </div>
          </div>
        )}

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Se Connecter
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Créer un Compte
          </button>
        </div>

        {/* Formulaire */}
        <Card variant="default" padding="lg">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'signup' && (
              <Input
                label="Nom d'utilisateur / Pseudo"
                placeholder="Ex: DavidDeBethleem"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
                required
              />
            )}

            <Input
              label="Adresse Email"
              type="email"
              placeholder="votre.email@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="gold"
              fullWidth
              size="lg"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="mt-1"
            >
              {mode === 'login' ? 'Connexion' : 'Créer mon Profil'}
            </Button>
          </form>
        </Card>

        {/* Note de sécurité */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>Authentification sécurisée par Supabase Auth (JWT & RLS)</span>
        </div>
      </div>
    </div>
  );
};
