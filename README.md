# 📖 SuperQuizz Biblique (MVP)

Application mobile moderne de quiz biblique conçue avec **React Native**, **Expo**, **Supabase** et **Zustand**.

---

## 🛠️ Stack Technique

- **Frontend Mobile** : [React Native](https://reactnative.dev/) avec [Expo](https://expo.dev/) (TypeScript)
- **Backend & Database** : [Supabase](https://supabase.com/) (PostgreSQL + Auth Email/Mot de passe + Row Level Security + API REST auto-générée)
- **Navigation** : Architecture [React Navigation](https://reactnavigation.org/) (Stack & Tab navigation)
- **State Management** : [Zustand](https://github.com/pmndrs/zustand) (stores légers, typés et modulaires)
- **Design & UI** : Composants sur-mesure typés, palette sobre et élégante (Dark mode, accents dorés bibliques)

---

## 📁 Structure du Projet

```text
superquizz-biblique/
├── app/                  # Écrans de l'application (Screens)
│   ├── HomeScreen.tsx        # Accueil, XP, série quotidienne, modes de jeu
│   ├── TrainingScreen.tsx    # Configuration du mode entraînement solo
│   ├── MatchScreen.tsx       # Arène multijoueur, salon privé, duels 1v1
│   ├── ProfileScreen.tsx     # Profil, stats, maîtrise par thème, paramètres
│   ├── AuthScreen.tsx        # Inscription & Connexion Supabase Auth
│   └── navigation.tsx        # Contexte et routeur React Navigation
├── components/           # Composants UI réutilisables
│   ├── Button.tsx            # Boutons typés (variants gold, primary, outline, sizes)
│   ├── Card.tsx              # Cartes conteneurs avec bordures & gradients
│   ├── Header.tsx            # En-têtes d'écran avec retour et actions
│   ├── Badge.tsx             # Badges de statut, difficulté, XP
│   ├── Input.tsx             # Champs de saisie avec icônes et validation
│   └── ScreenContainer.tsx   # Conteneur d'écran sécurisé
├── lib/                  # Intégrations & Helpers
│   ├── supabase.ts           # Client Supabase typé avec stockage cross-platform
│   └── authHelper.ts         # Fonctions d'authentification (signIn, signUp, signOut)
├── store/                # Stores Zustand
│   ├── useAuthStore.ts       # Gestion de la session utilisateur
│   ├── useGameStore.ts       # État préparé pour le déroulement des parties
│   └── useUserStore.ts       # Progression (XP, niveaux, séries, statistiques)
├── types/                # Types TypeScript partagés
│   ├── index.ts              # Modèles métier (Utilisateur, Question, Match, etc.)
│   └── database.ts           # Définitions TypeScript du schéma Supabase Postgres
├── assets/               # Ressources médias (icônes, bannières, animations)
├── supabase/             # Configuration & Scripts Backend
│   └── schema.sql            # Schéma initial Postgres (7 tables + RLS + Triggers)
├── .env.example          # Modèle des variables d'environnement
├── app.json              # Configuration Expo (iOS / Android / Web)
└── README.md             # Guide de démarrage local
```

---

## 🚀 Démarrage Rapide en Local

### 1. Prérequis

- **Node.js** (version 18 ou supérieure recommandée)
- **npm** ou **yarn**
- Application **Expo Go** installée sur votre smartphone ([iOS App Store](https://apps.apple.com/app/expo-go/id982107779) / [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)), ou un émulateur Android / simulateur iOS.

### 2. Installation des dépendances

Dans votre terminal :

```bash
# Cloner le dépôt (ou se placer dans le dossier du projet)
cd superquizz-biblique

# Installer les dépendances du projet
npm install
```

### 3. Configuration de la base Supabase

1. Créez un compte gratuit sur [supabase.com](https://supabase.com) et créez un nouveau projet (ex: `superquizz-biblique-db`).
2. Dans le tableau de bord Supabase, ouvrez le **SQL Editor** (icône `SQL` dans le menu latéral gauche).
3. Cliquez sur **New Query**, collez l'intégralité du contenu du fichier `supabase/schema.sql` présent dans ce projet, puis cliquez sur **Run**.
4. Cela va créer automatiquement les 7 tables initiales avec leurs indexes, la sécurité RLS et le déclencheur de synchronisation utilisateur :
   - `public.users` (profils synchronisés avec `auth.users`)
   - `public.questions` (banque de questions)
   - `public.training_sessions` (sessions solo)
   - `public.match_sessions` (parties multijoueur)
   - `public.match_rounds` (manches par partie)
   - `public.user_answers` (réponses enregistrées)
   - `public.user_progress` (XP, niveaux, séries)

### 4. Configuration des variables d'environnement

Dans Supabase, allez dans **Project Settings** > **API** et copiez :
- **Project URL**
- **Project API Keys** (`anon` / `public`)

Créez votre fichier d'environnement local :

```bash
cp .env.example .env
```

Puis complétez les valeurs dans `.env` :

```env
EXPO_PUBLIC_SUPABASE_URL="https://votre-projet.supabase.co"
EXPO_PUBLIC_SUPABASE_ANON_KEY="votre-cle-anon-publique"
```

> **Note Expo** : Toutes les variables préfixées par `EXPO_PUBLIC_` sont automatiquement injectées dans le code de l'application Expo sans configuration supplémentaire.

### 5. Lancer l'application

Démarrez le serveur Expo de développement :

```bash
npx expo start
```

Ou via le script de prévisualisation :
```bash
npm run dev
```

- **Sur mobile (Recommandé)** : Ouvrez l'appareil photo (iOS) ou l'application **Expo Go** (Android) et scannez le QR code affiché dans votre terminal.
- **Sur navigateur Web** : Appuyez sur la touche `w` dans le terminal pour ouvrir le mode web.
- **Sur émulateur Android** : Appuyez sur la touche `a`.
- **Sur simulateur iOS** : Appuyez sur la touche `i`.

---

## 🗄️ Schéma de Base de Données Initial (Postgres)

Le fichier `supabase/schema.sql` contient la structure initiale requise :

| Table | Description | Clé primaire | Relations clés |
| :--- | :--- | :--- | :--- |
| **users** | Profil public du joueur | `id (UUID)` | Lié à `auth.users(id)` |
| **questions** | Questions à choix multiples | `id (UUID)` | Catégorie, testament, difficulté |
| **training_sessions** | Sessions d'entraînement solo | `id (UUID)` | `user_id -> users(id)` |
| **match_sessions** | Parties duels / multijoueurs | `id (UUID)` | Code salon, `host_user_id` |
| **match_rounds** | Manches d'un match | `id (UUID)` | `match_id`, `question_id` |
| **user_answers** | Réponses détaillées avec temps de réponse | `id (UUID)` | `session_id`, `question_id`, `user_id` |
| **user_progress** | Progression, XP, rangs et séries | `id (UUID)` | `user_id -> users(id)` (unique) |

---

## 🔄 Gestion d'état (Zustand)

- **`useAuthStore`** : Gère l'utilisateur connecté, la session active Supabase et les actions de connexion/déconnexion.
- **`useGameStore`** : Conserve la catégorie active, la difficulté choisie, le mode de jeu et l'état en attente de la partie.
- **`useUserStore`** : Gère les statistiques du joueur (XP, niveau, taux de victoires), les préférences de sons et retours haptiques.

---

## 🔜 Prochaines étapes

1. Définition détaillée des colonnes spécifiques du schéma Postgres (selon votre prochain prompt).
2. Moteur de jeu interactif (chronomètre, affichage dynamique des questions, calcul des points, explications théologiques et versets bibliques).
3. Système temps-réel Supabase (Websockets / Presence) pour les matchs 1v1 en direct.
