/**
 * Données de seed pour SuperQuizz Biblique
 * Module: /lib/seedQuestions.ts
 * Basé EXCLUSIVEMENT sur la version Louis Segond révisée 1910 (LSG 1910)
 */

import { Book, Question } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';

export const BIBLE_BOOKS: Array<Omit<Book, 'id'> & { id?: string }> = [
  // Ancien Testament (39 livres)
  { name: 'Genèse', testament: 'ancien', position: 1 },
  { name: 'Exode', testament: 'ancien', position: 2 },
  { name: 'Lévitique', testament: 'ancien', position: 3 },
  { name: 'Nombres', testament: 'ancien', position: 4 },
  { name: 'Deutéronome', testament: 'ancien', position: 5 },
  { name: 'Josué', testament: 'ancien', position: 6 },
  { name: 'Juges', testament: 'ancien', position: 7 },
  { name: 'Ruth', testament: 'ancien', position: 8 },
  { name: '1 Samuel', testament: 'ancien', position: 9 },
  { name: '2 Samuel', testament: 'ancien', position: 10 },
  { name: '1 Rois', testament: 'ancien', position: 11 },
  { name: '2 Rois', testament: 'ancien', position: 12 },
  { name: '1 Chroniques', testament: 'ancien', position: 13 },
  { name: '2 Chroniques', testament: 'ancien', position: 14 },
  { name: 'Esdras', testament: 'ancien', position: 15 },
  { name: 'Néhémie', testament: 'ancien', position: 16 },
  { name: 'Esther', testament: 'ancien', position: 17 },
  { name: 'Job', testament: 'ancien', position: 18 },
  { name: 'Psaumes', testament: 'ancien', position: 19 },
  { name: 'Proverbes', testament: 'ancien', position: 20 },
  { name: 'Ecclésiaste', testament: 'ancien', position: 21 },
  { name: 'Cantique des Cantiques', testament: 'ancien', position: 22 },
  { name: 'Ésaïe', testament: 'ancien', position: 23 },
  { name: 'Jérémie', testament: 'ancien', position: 24 },
  { name: 'Lamentations', testament: 'ancien', position: 25 },
  { name: 'Ézéchiel', testament: 'ancien', position: 26 },
  { name: 'Daniel', testament: 'ancien', position: 27 },
  { name: 'Osée', testament: 'ancien', position: 28 },
  { name: 'Joël', testament: 'ancien', position: 29 },
  { name: 'Amos', testament: 'ancien', position: 30 },
  { name: 'Abdias', testament: 'ancien', position: 31 },
  { name: 'Jonas', testament: 'ancien', position: 32 },
  { name: 'Michée', testament: 'ancien', position: 33 },
  { name: 'Nahum', testament: 'ancien', position: 34 },
  { name: 'Habacuc', testament: 'ancien', position: 35 },
  { name: 'Sophonie', testament: 'ancien', position: 36 },
  { name: 'Aggée', testament: 'ancien', position: 37 },
  { name: 'Zacharie', testament: 'ancien', position: 38 },
  { name: 'Malachie', testament: 'ancien', position: 39 },

  // Nouveau Testament (27 livres)
  { name: 'Matthieu', testament: 'nouveau', position: 40 },
  { name: 'Marc', testament: 'nouveau', position: 41 },
  { name: 'Luc', testament: 'nouveau', position: 42 },
  { name: 'Jean', testament: 'nouveau', position: 43 },
  { name: 'Actes', testament: 'nouveau', position: 44 },
  { name: 'Romains', testament: 'nouveau', position: 45 },
  { name: '1 Corinthiens', testament: 'nouveau', position: 46 },
  { name: '2 Corinthiens', testament: 'nouveau', position: 47 },
  { name: 'Galates', testament: 'nouveau', position: 48 },
  { name: 'Éphésiens', testament: 'nouveau', position: 49 },
  { name: 'Philippiens', testament: 'nouveau', position: 50 },
  { name: 'Colossiens', testament: 'nouveau', position: 51 },
  { name: '1 Thessaloniciens', testament: 'nouveau', position: 52 },
  { name: '2 Thessaloniciens', testament: 'nouveau', position: 53 },
  { name: '1 Timothée', testament: 'nouveau', position: 54 },
  { name: '2 Timothée', testament: 'nouveau', position: 55 },
  { name: 'Tite', testament: 'nouveau', position: 56 },
  { name: 'Philémon', testament: 'nouveau', position: 57 },
  { name: 'Hébreux', testament: 'nouveau', position: 58 },
  { name: 'Jacques', testament: 'nouveau', position: 59 },
  { name: '1 Pierre', testament: 'nouveau', position: 60 },
  { name: '2 Pierre', testament: 'nouveau', position: 61 },
  { name: '1 Jean', testament: 'nouveau', position: 62 },
  { name: '2 Jean', testament: 'nouveau', position: 63 },
  { name: '3 Jean', testament: 'nouveau', position: 64 },
  { name: 'Jude', testament: 'nouveau', position: 65 },
  { name: 'Apocalypse', testament: 'nouveau', position: 66 },
];

/**
 * 20 Questions d'exemple représentatives réparties sur les 3 formats :
 * - question_reponse (10)
 * - texte_a_trous (5)
 * - vrai_faux (5)
 * Version : Louis Segond révisée 1910
 */
export const SEED_QUESTIONS: Question[] = [
  // ==========================================
  // FORMAT 1: QUESTION_REPONSE (10)
  // ==========================================
  {
    id: 'q-seed-01',
    book_name: 'Genèse',
    mode: 'entrainement',
    theme: null,
    format: 'question_reponse',
    question_text: "Selon Genèse 1:1, qu'est-ce que Dieu créa au commencement ?",
    correct_answer: 'Les cieux et la terre',
    wrong_answers: ["Le soleil et la lune", "Les animaux et les plantes", "La mer et les fleuves"],
    difficulty: 1,
    reference_biblique: 'Genèse 1:1',
  },
  {
    id: 'q-seed-02',
    book_name: '1 Samuel',
    mode: 'match_manche2',
    theme: 'rois',
    format: 'question_reponse',
    question_text: "Qui fut le premier roi d'Israël à avoir reçu l'onction d'huile du prophète Samuel ?",
    correct_answer: 'Saül',
    wrong_answers: ['David', 'Salomon', 'Roboam'],
    difficulty: 2,
    reference_biblique: '1 Samuel 10:1',
  },
  {
    id: 'q-seed-03',
    book_name: 'Exode',
    mode: 'match_manche2',
    theme: 'montagnes',
    format: 'question_reponse',
    question_text: "Sur quelle montagne Moïse est-il monté pour recevoir les deux tables de pierre gravées du doigt de Dieu ?",
    correct_answer: 'Le mont Sinaï',
    wrong_answers: ['Le mont Nébo', 'Le mont Carmel', 'Le mont Sion'],
    difficulty: 2,
    reference_biblique: 'Exode 19:20',
  },
  {
    id: 'q-seed-04',
    book_name: '2 Rois',
    mode: 'match_manche2',
    theme: 'cours_deau',
    format: 'question_reponse',
    question_text: "Dans quel cours d'eau Naaman le chef de l'armée syrienne s'est-il lavé sept fois pour être purifié de sa lèpre ?",
    correct_answer: 'Le Jourdain',
    wrong_answers: ["L'Euphrate", 'Le Nil', 'Le Chébar'],
    difficulty: 3,
    reference_biblique: '2 Rois 5:14',
  },
  {
    id: 'q-seed-05',
    book_name: 'Juges',
    mode: 'match_manche2',
    theme: 'prophétesses',
    format: 'question_reponse',
    question_text: "Quelle femme prophétesse et juge en Israël siégeait sous un palmier entre Rama et Béthel ?",
    correct_answer: 'Débora',
    wrong_answers: ['Houlda', 'Anne', 'Miriam'],
    difficulty: 3,
    reference_biblique: 'Juges 4:4-5',
  },
  {
    id: 'q-seed-06',
    book_name: '1 Samuel',
    mode: 'match_manche2',
    theme: 'armes',
    format: 'question_reponse',
    question_text: "Quelle arme David a-t-il utilisée pour terrasser le géant Goliath au front ?",
    correct_answer: 'Une fronde et une pierre',
    wrong_answers: ['Un arc et une flèche', 'Une lance en airain', 'Un javelot de bronze'],
    difficulty: 2,
    reference_biblique: '1 Samuel 17:49-50',
  },
  {
    id: 'q-seed-07',
    book_name: 'Matthieu',
    mode: 'match_manche1',
    theme: null,
    format: 'question_reponse',
    question_text: "Dans quelle ville de Judée Jésus est-il né aux jours du roi Hérode ?",
    correct_answer: 'Bethléhem',
    wrong_answers: ['Nazareth', 'Jérusalem', 'Capernaüm'],
    difficulty: 1,
    reference_biblique: 'Matthieu 2:1',
  },
  {
    id: 'q-seed-08',
    book_name: 'Josué',
    mode: 'match_manche2',
    theme: 'villes',
    format: 'question_reponse',
    question_text: "Quelle ville fortifiée vit ses murailles s'écrouler après que le peuple d'Israël en eut fait le tour pendant 7 jours ?",
    correct_answer: 'Jéricho',
    wrong_answers: ['Aï', 'Gabaon', 'Sichem'],
    difficulty: 2,
    reference_biblique: 'Josué 6:20',
  },
  {
    id: 'q-seed-09',
    book_name: 'Actes',
    mode: 'match_manche3',
    theme: null,
    format: 'question_reponse',
    question_text: "Sur le chemin de quelle ville Saul de Tarse fut-il enveloppé d'une vive lumière avant d'entendre la voix du Seigneur ?",
    correct_answer: 'Damas',
    wrong_answers: ['Antioche', 'Éphèse', 'Césarée'],
    difficulty: 3,
    reference_biblique: 'Actes 9:3-4',
  },
  {
    id: 'q-seed-10',
    book_name: 'Apocalypse',
    mode: 'match_manche3',
    theme: null,
    format: 'question_reponse',
    question_text: "À combien d'Églises situées dans la province d'Asie Jean doit-il écrire dans le livre de l'Apocalypse ?",
    correct_answer: '7',
    wrong_answers: ['12', '10', '4'],
    difficulty: 4,
    reference_biblique: 'Apocalypse 1:4',
  },

  // ==========================================
  // FORMAT 2: TEXTE_A_TROUS (5)
  // ==========================================
  {
    id: 'q-seed-11',
    book_name: 'Jean',
    mode: 'entrainement',
    theme: null,
    format: 'texte_a_trous',
    question_text: "Car Dieu a tant aimé le monde qu'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu'il ait la vie _____.",
    correct_answer: 'éternelle',
    wrong_answers: ['abondante', 'paisible', 'terrestre'],
    difficulty: 1,
    reference_biblique: 'Jean 3:16',
  },
  {
    id: 'q-seed-12',
    book_name: 'Psaumes',
    mode: 'entrainement',
    theme: null,
    format: 'texte_a_trous',
    question_text: "L'Éternel est mon _____: je ne manquerai de rien.",
    correct_answer: 'berger',
    wrong_answers: ['bouclier', 'roi', 'rocher'],
    difficulty: 1,
    reference_biblique: 'Psaumes 23:1',
  },
  {
    id: 'q-seed-13',
    book_name: 'Proverbes',
    mode: 'match_manche1',
    theme: null,
    format: 'texte_a_trous',
    question_text: "Le commencement de la sagesse, c'est la crainte de _____.",
    correct_answer: "l'Éternel",
    wrong_answers: ['la loi', "l'inconnu", "l'autorité"],
    difficulty: 2,
    reference_biblique: 'Proverbes 9:10',
  },
  {
    id: 'q-seed-14',
    book_name: 'Romains',
    mode: 'match_manche3',
    theme: null,
    format: 'texte_a_trous',
    question_text: "Car le salaire du péché, c'est la mort; mais le don gratuit de Dieu, c'est la vie éternelle en _____ notre Seigneur.",
    correct_answer: 'Jésus-Christ',
    wrong_answers: ["l'Esprit", 'la grâce', 'la prière'],
    difficulty: 3,
    reference_biblique: 'Romains 6:23',
  },
  {
    id: 'q-seed-15',
    book_name: 'Philippiens',
    mode: 'entrainement',
    theme: null,
    format: 'texte_a_trous',
    question_text: "Je puis tout par celui qui me _____.",
    correct_answer: 'fortifie',
    wrong_answers: ['guide', 'pardonne', 'délivre'],
    difficulty: 2,
    reference_biblique: 'Philippiens 4:13',
  },

  // ==========================================
  // FORMAT 3: VRAI_FAUX (5) (wrong_answers = [])
  // ==========================================
  {
    id: 'q-seed-16',
    book_name: 'Genèse',
    mode: 'entrainement',
    theme: null,
    format: 'vrai_faux',
    question_text: "Selon Genèse 5:32, les trois fils de Noé se nommaient Sem, Cham et Japhet.",
    correct_answer: 'Vrai',
    wrong_answers: [],
    difficulty: 1,
    reference_biblique: 'Genèse 5:32',
  },
  {
    id: 'q-seed-17',
    book_name: 'Matthieu',
    mode: 'match_manche1',
    theme: null,
    format: 'vrai_faux',
    question_text: "Selon Matthieu 4:2, Jésus a jeûné quarante jours et quarante nuits dans le désert avant d'être tenté.",
    correct_answer: 'Vrai',
    wrong_answers: [],
    difficulty: 1,
    reference_biblique: 'Matthieu 4:2',
  },
  {
    id: 'q-seed-18',
    book_name: 'Genèse',
    mode: 'match_manche2',
    theme: 'peres',
    format: 'vrai_faux',
    question_text: "Isaac était le père direct de Moïse et d'Aaron.",
    correct_answer: 'Faux',
    wrong_answers: [],
    difficulty: 2,
    reference_biblique: 'Exode 6:20',
  },
  {
    id: 'q-seed-19',
    book_name: 'Jonas',
    mode: 'entrainement',
    theme: null,
    format: 'vrai_faux',
    question_text: "Le prophète Jonas s'est immédiatement rendu à Ninive dès le premier ordre de l'Éternel sans chercher à fuir à Tarsis.",
    correct_answer: 'Faux',
    wrong_answers: [],
    difficulty: 2,
    reference_biblique: 'Jonas 1:1-3',
  },
  {
    id: 'q-seed-20',
    book_name: '1 Rois',
    mode: 'match_manche2',
    theme: 'rois',
    format: 'vrai_faux',
    question_text: "À Gabaon, le roi Salomon a demandé à Dieu une longue vie et les richesses de ses ennemis plutôt qu'un cœur intelligent pour juger son peuple.",
    correct_answer: 'Faux',
    wrong_answers: [],
    difficulty: 2,
    reference_biblique: '1 Rois 3:9-11',
  },
];

/**
 * Fonction d'injection optionnelle dans Supabase via le client JS
 */
export async function seedSupabaseData(): Promise<{ success: boolean; message: string; count: number }> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: 'Supabase non configuré. Renseignez EXPO_PUBLIC_SUPABASE_URL et ANON_KEY.',
      count: 0,
    };
  }

  try {
    // 1. Seed Books
    const { error: booksError } = await supabase
      .from('books')
      .upsert(
        BIBLE_BOOKS.map((b) => ({
          name: b.name,
          testament: b.testament,
          position: b.position,
        })),
        { onConflict: 'name' }
      );

    if (booksError) {
      return { success: false, message: `Erreur livres: ${booksError.message}`, count: 0 };
    }

    // 2. Fetch inserted books to resolve book_id
    const { data: dbBooks, error: fetchBooksError } = await supabase
      .from('books')
      .select('id, name');

    if (fetchBooksError || !dbBooks) {
      return { success: false, message: `Erreur récupération livres: ${fetchBooksError?.message}`, count: 0 };
    }

    const bookMap = new Map<string, string>(dbBooks.map((b) => [b.name, b.id]));

    // 3. Seed Questions
    const questionsToInsert = SEED_QUESTIONS.map((q) => ({
      book_id: q.book_name ? bookMap.get(q.book_name) || null : null,
      mode: q.mode,
      theme: q.theme || null,
      format: q.format,
      question_text: q.question_text,
      correct_answer: q.correct_answer,
      wrong_answers: q.wrong_answers,
      difficulty: q.difficulty,
      reference_biblique: q.reference_biblique,
    }));

    const { error: qError } = await supabase.from('questions').insert(questionsToInsert);

    if (qError) {
      return { success: false, message: `Erreur questions: ${qError.message}`, count: 0 };
    }

    return {
      success: true,
      message: `20 questions et 66 livres LSG 1910 insérés avec succès !`,
      count: 20,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Erreur inattendue durant le seed',
      count: 0,
    };
  }
}
