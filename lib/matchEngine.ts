/**
 * Moteur de Match en 3 Manches pour SuperQuizz Biblique
 * Module: /lib/matchEngine.ts
 * Version Biblique : Louis Segond révisée 1910 (LSG 1910)
 * 
 * RÈGLES OFFICIELLES DU MODE MATCH :
 * - Manche 1 : 9 questions aléatoires tous livres confondus (format question_reponse, chrono 20s, 10 pts/bonne rép)
 * - Manche 2 : 6 questions sur 1 thème choisi parmi 3 proposés (format texte_a_trous {{blank}}, chrono 20s, 10 pts/bonne rép)
 * - Manche 3 : 5 questions herméneutiques haute difficulté (format vrai_faux, chrono 15s tendu, 10 pts/bonne rép)
 * - Total : 200 points max (90 + 60 + 50)
 */

import { supabase, isSupabaseConfigured } from './supabase';
import { SEED_QUESTIONS } from './seedQuestions';
import type { Question, QuestionTheme, MatchSession, MatchRound, UserAnswer } from '@/types';

export interface ThemeOption {
  id: QuestionTheme;
  label: string;
  icon: string;
  description: string;
}

// ==============================================================================
// 1. BANQUE OFFICIELLE DE QUESTIONS MANCHE 1 (Format question_reponse, tous livres)
// ==============================================================================
export const MATCH_MANCHE1_QUESTIONS: Question[] = [
  {
    id: 'm1-01',
    book_name: 'Matthieu',
    mode: 'match_manche1',
    format: 'question_reponse',
    difficulty: 1,
    question_text: "Dans quelle ville de Judée Jésus est-il né selon l'évangile selon Matthieu ?",
    correct_answer: 'Bethléhem',
    wrong_answers: ['Nazareth', 'Jérusalem', 'Capernaüm'],
    reference_biblique: 'Matthieu 2:1',
  },
  {
    id: 'm1-02',
    book_name: 'Genèse',
    mode: 'match_manche1',
    format: 'question_reponse',
    difficulty: 2,
    question_text: "Combien d'années les enfants d'Israël ont-ils erré dans le désert avant d'entrer en Canaan ?",
    correct_answer: '40 ans',
    wrong_answers: ['70 ans', '12 ans', '400 ans'],
    reference_biblique: 'Nombres 14:34',
  },
  {
    id: 'm1-03',
    book_name: 'Actes',
    mode: 'match_manche1',
    format: 'question_reponse',
    difficulty: 2,
    question_text: "Quel jour l'Esprit Saint est-il descendu avec éclat sur les disciples réunis à Jérusalem ?",
    correct_answer: 'Le jour de la Pentecôte',
    wrong_answers: ['Le jour de la Pâque', 'Le jour des Expiations', 'Le jour des Tabernacles'],
    reference_biblique: 'Actes 2:1-4',
  },
  {
    id: 'm1-04',
    book_name: 'Exode',
    mode: 'match_manche1',
    format: 'question_reponse',
    difficulty: 2,
    question_text: "Combien de plaies l'Éternel a-t-il infligées à l'Égypte avant la libération du peuple hébreu ?",
    correct_answer: '10 plaies',
    wrong_answers: ['7 plaies', '12 plaies', '40 plaies'],
    reference_biblique: 'Exode 7 à 12',
  },
  {
    id: 'm1-05',
    book_name: '1 Samuel',
    mode: 'match_manche1',
    format: 'question_reponse',
    difficulty: 2,
    question_text: "Quel jeune berger et fils d'Isaï a été oint par Samuel pour être le futur roi d'Israël ?",
    correct_answer: 'David',
    wrong_answers: ['Jonathan', 'Éliab', 'Abner'],
    reference_biblique: '1 Samuel 16:13',
  },
  {
    id: 'm1-06',
    book_name: 'Jean',
    mode: 'match_manche1',
    format: 'question_reponse',
    difficulty: 2,
    question_text: "Dans quelle ville Jésus a-t-il accompli son premier miracle en changeant l'eau en vin ?",
    correct_answer: 'Cana en Galilée',
    wrong_answers: ['Béthanie', 'Jéricho', 'Sychar'],
    reference_biblique: 'Jean 2:11',
  },
  {
    id: 'm1-07',
    book_name: 'Josué',
    mode: 'match_manche1',
    format: 'question_reponse',
    difficulty: 3,
    question_text: "Quel fleuve les prêtres portant l'arche ont-ils foulé pour que les eaux se coupent et laissent passer Israël ?",
    correct_answer: 'Le Jourdain',
    wrong_answers: ['Le Nil', "L'Euphrate", 'Le Chébar'],
    reference_biblique: 'Josué 3:15-17',
  },
  {
    id: 'm1-08',
    book_name: 'Luc',
    mode: 'match_manche1',
    format: 'question_reponse',
    difficulty: 2,
    question_text: "Quel publicain de petite taille est monté sur un sycomore pour apercevoir Jésus à Jéricho ?",
    correct_answer: 'Zachée',
    wrong_answers: ['Barthélemy', 'Nicodème', 'Simon le lépreux'],
    reference_biblique: 'Luc 19:4',
  },
  {
    id: 'm1-09',
    book_name: 'Daniel',
    mode: 'match_manche1',
    format: 'question_reponse',
    difficulty: 3,
    question_text: "Dans quelle fosse le prophète Daniel a-t-il été jeté sous le décret du roi Darius ?",
    correct_answer: 'La fosse aux lions',
    wrong_answers: ['La fournaise ardente', 'Une citerne de boue', 'Une prison sous roche'],
    reference_biblique: 'Daniel 6:16',
  },
  {
    id: 'm1-10',
    book_name: '1 Rois',
    mode: 'match_manche1',
    format: 'question_reponse',
    difficulty: 3,
    question_text: "Sur quelle montagne le prophète Élie a-t-il défié et confondu les 450 prophètes de Baal ?",
    correct_answer: 'Le mont Carmel',
    wrong_answers: ['Le mont Horeb', 'Le mont Guilboa', 'Le mont Hermon'],
    reference_biblique: '1 Rois 18:19-38',
  },
  {
    id: 'm1-11',
    book_name: 'Actes',
    mode: 'match_manche1',
    format: 'question_reponse',
    difficulty: 3,
    question_text: "Qui fut le premier martyr chrétien lapidé pour son témoignage devant le sanhédrin ?",
    correct_answer: 'Étienne',
    wrong_answers: ['Jacques frère de Jean', 'Philippe', 'Barnabé'],
    reference_biblique: 'Actes 7:59-60',
  },
  {
    id: 'm1-12',
    book_name: 'Genèse',
    mode: 'match_manche1',
    format: 'question_reponse',
    difficulty: 2,
    question_text: "Combien d'âmes humaines sont montées dans l'arche de Noé pour être sauvées des eaux du déluge ?",
    correct_answer: '8 personnes',
    wrong_answers: ['12 personnes', '4 personnes', '70 personnes'],
    reference_biblique: '1 Pierre 3:20 / Genèse 7:13',
  },
  {
    id: 'm1-13',
    book_name: 'Jonas',
    mode: 'match_manche1',
    format: 'question_reponse',
    difficulty: 2,
    question_text: "Vers quelle ville lointaine Jonas a-t-il tenté de s'enfuir par bateau au lieu d'aller à Ninive ?",
    correct_answer: 'Tarsis',
    wrong_answers: ['Tyr', 'Joppé', 'Babylone'],
    reference_biblique: 'Jonas 1:3',
  },
  {
    id: 'm1-14',
    book_name: 'Matthieu',
    mode: 'match_manche1',
    format: 'question_reponse',
    difficulty: 3,
    question_text: "Combien de pains et de poissons le jeune garçon avait-il lors de la première grande multiplication par Jésus ?",
    correct_answer: '5 pains et 2 poissons',
    wrong_answers: ['7 pains et quelques petits poissons', '3 pains et 3 poissons', '12 pains d’orge'],
    reference_biblique: 'Jean 6:9 / Matthieu 14:17',
  },
  {
    id: 'm1-15',
    book_name: 'Apocalypse',
    mode: 'match_manche1',
    format: 'question_reponse',
    difficulty: 3,
    question_text: "Sur quelle île de déportation l'apôtre Jean a-t-il reçu les visions divines de l'Apocalypse ?",
    correct_answer: "L'île de Patmos",
    wrong_answers: ["L'île de Crète", "L'île de Malte", "L'île de Chypre"],
    reference_biblique: 'Apocalypse 1:9',
  },
];

// ==============================================================================
// 2. THÈMES OFFICIELS & BANQUE DE QUESTIONS MANCHE 2 (Format texte_a_trous {{blank}})
// ==============================================================================
export const MATCH_THEMES: ThemeOption[] = [
  {
    id: 'rois',
    label: 'Rois d’Israël & Juda',
    icon: '👑',
    description: 'Saül, David, Salomon et les souverains de l’Alliance',
  },
  {
    id: 'montagnes',
    label: 'Montagnes Sacrées',
    icon: '⛰️',
    description: 'Sinaï, Carmel, Horeb, Morija et les hauts lieux de la foi',
  },
  {
    id: 'cours_deau',
    label: 'Cours d’eau & Fleuves',
    icon: '🌊',
    description: 'Jourdain, Nil, Euphrate et eaux de miracles',
  },
  {
    id: 'armes',
    label: 'Armes & Combats',
    icon: '⚔️',
    description: 'Fronde, épées, cuirasses et victoires divines',
  },
  {
    id: 'villes',
    label: 'Villes & Murailles',
    icon: '🏰',
    description: 'Jérusalem, Jéricho, Bethléhem, Ninive et forteresses',
  },
  {
    id: 'propheties',
    label: 'Prophéties Messianiques',
    icon: '✨',
    description: 'Les accomplissements annoncés dès les temps anciens',
  },
  {
    id: 'peres',
    label: 'Pères & Patriarches',
    icon: '📜',
    description: 'Abraham, Isaac, Jacob et les fondateurs des douze tribus',
  },
  {
    id: 'prophétesses',
    label: 'Femmes & Prophétesses',
    icon: '🕊️',
    description: 'Débora, Miriam, Ruth, Esther et héroïnes de la Bible',
  },
];

export const MATCH_MANCHE2_QUESTIONS: Question[] = [
  // --- THÈME: ROIS ---
  {
    id: 'm2-rois-01',
    book_name: '1 Samuel',
    mode: 'match_manche2',
    theme: 'rois',
    format: 'texte_a_trous',
    difficulty: 2,
    question_text: "Le prophète Samuel répandit une corne d'huile sur la tête de {{blank}} pour en faire le premier roi d'Israël.",
    correct_answer: 'Saül',
    wrong_answers: ['David', 'Salomon', 'Roboam'],
    reference_biblique: '1 Samuel 10:1',
  },
  {
    id: 'm2-rois-02',
    book_name: '1 Rois',
    mode: 'match_manche2',
    theme: 'rois',
    format: 'texte_a_trous',
    difficulty: 2,
    question_text: "À Gabaon, le roi {{blank}} demanda à l'Éternel non la richesse mais un cœur intelligent pour gouverner son peuple.",
    correct_answer: 'Salomon',
    wrong_answers: ['David', 'Ézéchias', 'Josias'],
    reference_biblique: '1 Rois 3:9',
  },
  {
    id: 'm2-rois-03',
    book_name: '2 Rois',
    mode: 'match_manche2',
    theme: 'rois',
    format: 'texte_a_trous',
    difficulty: 3,
    question_text: "Le jeune roi {{blank}} fit réparer la maison de l'Éternel et pleura en entendant la lecture du livre de la loi retrouvé.",
    correct_answer: 'Josias',
    wrong_answers: ['Manassé', 'Ozias', 'Joram'],
    reference_biblique: '2 Rois 22:11',
  },
  {
    id: 'm2-rois-04',
    book_name: '1 Rois',
    mode: 'match_manche2',
    theme: 'rois',
    format: 'texte_a_trous',
    difficulty: 3,
    question_text: "Poussé par son épouse Jézabel, le roi {{blank}} fit périr Naboth de Jizreel pour s'emparer de sa vigne.",
    correct_answer: 'Achab',
    wrong_answers: ['Jéroboam', 'Béadad', 'Omri'],
    reference_biblique: '1 Rois 21:7-16',
  },
  {
    id: 'm2-rois-05',
    book_name: '2 Rois',
    mode: 'match_manche2',
    theme: 'rois',
    format: 'texte_a_trous',
    difficulty: 3,
    question_text: "Le roi {{blank}} déploya devant l'Éternel dans le temple la lettre menaçante envoyée par Sanchérib roi d'Assyrie.",
    correct_answer: 'Ézéchias',
    wrong_answers: ['Achaz', 'Amon', 'Joas'],
    reference_biblique: '2 Rois 19:14',
  },
  {
    id: 'm2-rois-06',
    book_name: '2 Samuel',
    mode: 'match_manche2',
    theme: 'rois',
    format: 'texte_a_trous',
    difficulty: 2,
    question_text: "Le roi {{blank}} dansa de toute sa force devant l'arche de l'Éternel lors de sa montée solennelle à Jérusalem.",
    correct_answer: 'David',
    wrong_answers: ['Saül', 'Salomon', 'Jonathan'],
    reference_biblique: '2 Samuel 6:14',
  },

  // --- THÈME: MONTAGNES ---
  {
    id: 'm2-mont-01',
    book_name: 'Exode',
    mode: 'match_manche2',
    theme: 'montagnes',
    format: 'texte_a_trous',
    difficulty: 2,
    question_text: "Moïse monta sur le mont {{blank}} enveloppé de fumée pour recevoir les tables de la loi gravées du doigt de Dieu.",
    correct_answer: 'Sinaï',
    wrong_answers: ['Nébo', 'Carmel', 'Sion'],
    reference_biblique: 'Exode 19:20',
  },
  {
    id: 'm2-mont-02',
    book_name: '1 Rois',
    mode: 'match_manche2',
    theme: 'montagnes',
    format: 'texte_a_trous',
    difficulty: 2,
    question_text: "Le feu de l'Éternel tomba sur l'holocauste dressé par le prophète Élie au sommet du mont {{blank}}.",
    correct_answer: 'Carmel',
    wrong_answers: ['Hermon', 'Thabor', 'Guilboa'],
    reference_biblique: '1 Rois 18:38',
  },
  {
    id: 'm2-mont-03',
    book_name: 'Deutéronome',
    mode: 'match_manche2',
    theme: 'montagnes',
    format: 'texte_a_trous',
    difficulty: 3,
    question_text: "C'est au sommet du mont {{blank}} que Moïse contempla tout le pays promis de Canaan avant d'y mourir selon l'ordre de Dieu.",
    correct_answer: 'Nébo',
    wrong_answers: ['Hor', 'Sinaï', 'Carmel'],
    reference_biblique: 'Deutéronome 34:1',
  },
  {
    id: 'm2-mont-04',
    book_name: 'Genèse',
    mode: 'match_manche2',
    theme: 'montagnes',
    format: 'texte_a_trous',
    difficulty: 3,
    question_text: "Abraham gravit le mont {{blank}} pour offrir son fils Isaac en obéissance à la voix divine.",
    correct_answer: 'Morija',
    wrong_answers: ['Sinaï', 'Ararat', 'Nébo'],
    reference_biblique: 'Genèse 22:2',
  },
  {
    id: 'm2-mont-05',
    book_name: 'Genèse',
    mode: 'match_manche2',
    theme: 'montagnes',
    format: 'texte_a_trous',
    difficulty: 2,
    question_text: "Après la décrue des eaux du déluge, l'arche de Noé vint se reposer sur les montagnes d'{{blank}}.",
    correct_answer: 'Ararat',
    wrong_answers: ['Hermon', 'Horeb', 'Ébal'],
    reference_biblique: 'Genèse 8:4',
  },
  {
    id: 'm2-mont-06',
    book_name: 'Matthieu',
    mode: 'match_manche2',
    theme: 'montagnes',
    format: 'texte_a_trous',
    difficulty: 2,
    question_text: "Jésus se retira avec ses disciples au mont des {{blank}} avant d'entrer dans la prière fervente de Gethsémané.",
    correct_answer: 'Oliviers',
    wrong_answers: ['Cèdres', 'Palmiers', 'Myrtes'],
    reference_biblique: 'Matthieu 26:30',
  },

  // --- THÈME: COURS D'EAU ---
  {
    id: 'm2-eau-01',
    book_name: '2 Rois',
    mode: 'match_manche2',
    theme: 'cours_deau',
    format: 'texte_a_trous',
    difficulty: 2,
    question_text: "Sur l'ordre du prophète Élisée, Naaman le Syrien se plongea 7 fois dans le fleuve du {{blank}} pour être guéri de sa lèpre.",
    correct_answer: 'Jourdain',
    wrong_answers: ['Nil', 'Euphrate', 'Chébar'],
    reference_biblique: '2 Rois 5:14',
  },
  {
    id: 'm2-eau-02',
    book_name: 'Exode',
    mode: 'match_manche2',
    theme: 'cours_deau',
    format: 'texte_a_trous',
    difficulty: 2,
    question_text: "Lorsque la première plaie frappa l'Égypte, les eaux du {{blank}} furent entièrement changées en sang sous la verge d'Aaron.",
    correct_answer: 'Nil',
    wrong_answers: ['Jourdain', 'Tigre', 'Euphrate'],
    reference_biblique: 'Exode 7:20',
  },
  {
    id: 'm2-eau-03',
    book_name: '1 Rois',
    mode: 'match_manche2',
    theme: 'cours_deau',
    format: 'texte_a_trous',
    difficulty: 3,
    question_text: "Durant la sécheresse en Israël, le prophète Élie fut nourri par des corbeaux près du torrent de {{blank}}.",
    correct_answer: 'Kérith',
    wrong_answers: ['Cédron', 'Kison', 'Arnon'],
    reference_biblique: '1 Rois 17:3-5',
  },
  {
    id: 'm2-eau-04',
    book_name: 'Jean',
    mode: 'match_manche2',
    theme: 'cours_deau',
    format: 'texte_a_trous',
    difficulty: 2,
    question_text: "Jean le Baptiste baptisait les foules confessant leurs péchés dans les eaux du {{blank}}.",
    correct_answer: 'Jourdain',
    wrong_answers: ['Nil', 'Cédron', 'Tigre'],
    reference_biblique: 'Matthieu 3:6',
  },
  {
    id: 'm2-eau-05',
    book_name: 'Genèse',
    mode: 'match_manche2',
    theme: 'cours_deau',
    format: 'texte_a_trous',
    difficulty: 3,
    question_text: "Jacob fit traverser à sa famille le gué de {{blank}} avant de lutter avec l'ange jusqu'au matin.",
    correct_answer: 'Jabbok',
    wrong_answers: ['Jourdain', 'Arnon', 'Jabbès'],
    reference_biblique: 'Genèse 32:22',
  },
  {
    id: 'm2-eau-06',
    book_name: 'Ézéchiel',
    mode: 'match_manche2',
    theme: 'cours_deau',
    format: 'texte_a_trous',
    difficulty: 3,
    question_text: "C'est au bord du fleuve {{blank}} en Babylonie qu'Ézéchiel vit s'ouvrir les cieux et contempla les visions divines.",
    correct_answer: 'Kébar',
    wrong_answers: ['Euphrate', 'Tigre', 'Jourdain'],
    reference_biblique: 'Ézéchiel 1:1',
  },

  // --- THÈME: ARMES ---
  {
    id: 'm2-armes-01',
    book_name: '1 Samuel',
    mode: 'match_manche2',
    theme: 'armes',
    format: 'texte_a_trous',
    difficulty: 2,
    question_text: "David refusa l'armure pesante du roi Saül et marcha contre Goliath avec sa {{blank}} et 5 pierres lisses du torrent.",
    correct_answer: 'fronde',
    wrong_answers: ['hache', 'lance', 'arbalète'],
    reference_biblique: '1 Samuel 17:40',
  },
  {
    id: 'm2-armes-02',
    book_name: 'Juges',
    mode: 'match_manche2',
    theme: 'armes',
    format: 'texte_a_trous',
    difficulty: 3,
    question_text: "Éhud le juge délivra Israël du roi Églon en forgeant une {{blank}} à deux tranchants longue d'une coudée.",
    correct_answer: 'épée',
    wrong_answers: ['dague', 'flèche', 'masse'],
    reference_biblique: 'Juges 3:16',
  },
  {
    id: 'm2-armes-03',
    book_name: 'Juges',
    mode: 'match_manche2',
    theme: 'armes',
    format: 'texte_a_trous',
    difficulty: 3,
    question_text: "Avec une mâchoire d'{{blank}} fraîche, Samson défit mille Philistins à Ramath-Léchi.",
    correct_answer: 'âne',
    wrong_answers: ['lion', 'ours', 'chameau'],
    reference_biblique: 'Juges 15:15',
  },
  {
    id: 'm2-armes-04',
    book_name: 'Juges',
    mode: 'match_manche2',
    theme: 'armes',
    format: 'texte_a_trous',
    difficulty: 2,
    question_text: "L'armée des 300 hommes de Gédéon cerna le camp de Madian avec des trompettes et des {{blank}} vides cachant des flambeaux.",
    correct_answer: 'cruches',
    wrong_answers: ['boucliers', 'paniers', 'outres'],
    reference_biblique: 'Juges 7:16',
  },
  {
    id: 'm2-armes-05',
    book_name: 'Éphésiens',
    mode: 'match_manche2',
    theme: 'armes',
    format: 'texte_a_trous',
    difficulty: 2,
    question_text: "Dans l'armure spirituelle du chrétien, Paul exhorte à prendre le {{blank}} de la foi pour éteindre tous les traits enflammés du malin.",
    correct_answer: 'bouclier',
    wrong_answers: ['casque', 'javelot', 'baudrier'],
    reference_biblique: 'Éphésiens 6:16',
  },
  {
    id: 'm2-armes-06',
    book_name: '1 Samuel',
    mode: 'match_manche2',
    theme: 'armes',
    format: 'texte_a_trous',
    difficulty: 2,
    question_text: "Rempli d'un esprit mauvais, le roi Saül tenta de clouer David au mur avec sa {{blank}} pendant qu'il jouait de la harpe.",
    correct_answer: 'lance',
    wrong_answers: ['flèche', 'dague', 'fronde'],
    reference_biblique: '1 Samuel 18:11',
  },

  // --- THÈME: VILLES ---
  {
    id: 'm2-vil-01',
    book_name: 'Josué',
    mode: 'match_manche2',
    theme: 'villes',
    format: 'texte_a_trous',
    difficulty: 2,
    question_text: "Après sept jours de marche solennelle, les murailles de la ville de {{blank}} s'écroulèrent aux cris du peuple d'Israël.",
    correct_answer: 'Jéricho',
    wrong_answers: ['Aï', 'Gabaon', 'Sichem'],
    reference_biblique: 'Josué 6:20',
  },
  {
    id: 'm2-vil-02',
    book_name: 'Michée',
    mode: 'match_manche2',
    theme: 'villes',
    format: 'texte_a_trous',
    difficulty: 2,
    question_text: "Et toi, {{blank}} Éphrata, petite entre les milliers de Juda, de toi sortira pour moi celui qui dominera sur Israël.",
    correct_answer: 'Bethléhem',
    wrong_answers: ['Nazareth', 'Jérusalem', 'Hébron'],
    reference_biblique: 'Michée 5:2',
  },
  {
    id: 'm2-vil-03',
    book_name: 'Jonas',
    mode: 'match_manche2',
    theme: 'villes',
    format: 'texte_a_trous',
    difficulty: 2,
    question_text: "Sur la prédication de Jonas, le roi et les habitants de {{blank}} jeûnèrent couverts de sacs et se repentirent de leur mauvaise voie.",
    correct_answer: 'Ninive',
    wrong_answers: ['Babylone', 'Suse', 'Damas'],
    reference_biblique: 'Jonas 3:5-6',
  },
  {
    id: 'm2-vil-04',
    book_name: 'Actes',
    mode: 'match_manche2',
    theme: 'villes',
    format: 'texte_a_trous',
    difficulty: 2,
    question_text: "Saul de Tarse vit resplendir une vive lumière céleste alors qu'il s'approchait de la ville de {{blank}}.",
    correct_answer: 'Damas',
    wrong_answers: ['Antioche', 'Éphèse', 'Césarée'],
    reference_biblique: 'Actes 9:3',
  },
  {
    id: 'm2-vil-05',
    book_name: 'Genèse',
    mode: 'match_manche2',
    theme: 'villes',
    format: 'texte_a_trous',
    difficulty: 2,
    question_text: "L'Éternel fit pleuvoir du soufre et du feu sur la ville de {{blank}} et sur Gomorrhe à cause de leur iniquité extrême.",
    correct_answer: 'Sodome',
    wrong_answers: ['Tsoar', 'Babel', 'Guérar'],
    reference_biblique: 'Genèse 19:24',
  },
  {
    id: 'm2-vil-06',
    book_name: 'Actes',
    mode: 'match_manche2',
    theme: 'villes',
    format: 'texte_a_trous',
    difficulty: 3,
    question_text: "C'est dans la ville d'{{blank}} que pour la première fois les disciples du Christ furent appelés chrétiens.",
    correct_answer: 'Antioche',
    wrong_answers: ['Alexandrie', 'Corinthe', 'Philippe'],
    reference_biblique: 'Actes 11:26',
  },

  // --- THÈME: PROPHÉTIES ---
  {
    id: 'm2-proph-01',
    book_name: 'Ésaïe',
    mode: 'match_manche2',
    theme: 'propheties',
    format: 'texte_a_trous',
    difficulty: 3,
    question_text: "Voici, la {{blank}} sera enceinte, elle enfantera un fils, et elle lui donnera le nom d'Emmanuel.",
    correct_answer: 'vierge',
    wrong_answers: ['reine', 'fiancée', 'veuve'],
    reference_biblique: 'Ésaïe 7:14',
  },
  {
    id: 'm2-proph-02',
    book_name: 'Ésaïe',
    mode: 'match_manche2',
    theme: 'propheties',
    format: 'texte_a_trous',
    difficulty: 3,
    question_text: "Mais il était blessé pour nos péchés, brisé pour nos iniquités; le châtiment qui nous donne la {{blank}} est tombé sur lui.",
    correct_answer: 'paix',
    wrong_answers: ['joie', 'force', 'gloire'],
    reference_biblique: 'Ésaïe 53:5',
  },
  {
    id: 'm2-proph-03',
    book_name: 'Zacharie',
    mode: 'match_manche2',
    theme: 'propheties',
    format: 'texte_a_trous',
    difficulty: 3,
    question_text: "Sois transportée d'allégresse, fille de Sion ! Voici, ton roi vient à toi, juste et victorieux, monté sur un {{blank}}.",
    correct_answer: 'âne',
    wrong_answers: ['cheval', 'char', 'chameau'],
    reference_biblique: 'Zacharie 9:9',
  },
  {
    id: 'm2-proph-04',
    book_name: 'Psaumes',
    mode: 'match_manche2',
    theme: 'propheties',
    format: 'texte_a_trous',
    difficulty: 3,
    question_text: "Ils se partagent mes vêtements, et ils tirent au sort ma {{blank}}.",
    correct_answer: 'tunique',
    wrong_answers: ['ceinture', 'couronne', 'sandale'],
    reference_biblique: 'Psaumes 22:18',
  },
  {
    id: 'm2-proph-05',
    book_name: 'Zacharie',
    mode: 'match_manche2',
    theme: 'propheties',
    format: 'texte_a_trous',
    difficulty: 3,
    question_text: "Ils pesèrent pour mon salaire {{blank}} pièces d'argent, qui furent ensuite jetées dans la maison de l'Éternel pour le potier.",
    correct_answer: 'trente',
    wrong_answers: ['vingt', 'cinquante', 'cent'],
    reference_biblique: 'Zacharie 11:12-13',
  },
  {
    id: 'm2-proph-06',
    book_name: 'Psaumes',
    mode: 'match_manche2',
    theme: 'propheties',
    format: 'texte_a_trous',
    difficulty: 3,
    question_text: "La pierre qu'ont rejetée ceux qui bâtissaient est devenue la principale de l'{{blank}}.",
    correct_answer: 'angle',
    wrong_answers: ['arche', 'autel', 'enceinte'],
    reference_biblique: 'Psaumes 118:22',
  },

  // --- THÈME: PÈRES ---
  {
    id: 'm2-peres-01',
    book_name: 'Genèse',
    mode: 'match_manche2',
    theme: 'peres',
    format: 'texte_a_trous',
    difficulty: 2,
    question_text: "Dieu changea le nom d'Abram en {{blank}} car il devenait le père d'une multitude de nations.",
    correct_answer: 'Abraham',
    wrong_answers: ['Israël', 'Melchisédek', 'Éliézer'],
    reference_biblique: 'Genèse 17:5',
  },
  {
    id: 'm2-peres-02',
    book_name: 'Genèse',
    mode: 'match_manche2',
    theme: 'peres',
    format: 'texte_a_trous',
    difficulty: 2,
    question_text: "Le patriarche {{blank}} eut 12 fils qui formèrent les douze tribus du peuple d'Israël.",
    correct_answer: 'Jacob',
    wrong_answers: ['Isaac', 'Noé', 'Laban'],
    reference_biblique: 'Genèse 35:22-26',
  },
  {
    id: 'm2-peres-03',
    book_name: 'Genèse',
    mode: 'match_manche2',
    theme: 'peres',
    format: 'texte_a_trous',
    difficulty: 2,
    question_text: "L'aîné des fils de Jacob et de Léa, qui intervint pour épargner la vie de Joseph, se nommait {{blank}}.",
    correct_answer: 'Ruben',
    wrong_answers: ['Siméon', 'Lévi', 'Juda'],
    reference_biblique: 'Genèse 37:21',
  },
  {
    id: 'm2-peres-04',
    book_name: 'Exode',
    mode: 'match_manche2',
    theme: 'peres',
    format: 'texte_a_trous',
    difficulty: 3,
    question_text: "{{blank}} était le père de Moïse, d'Aaron et de leur sœur Miriam dans la tribu de Lévi.",
    correct_answer: 'Amram',
    wrong_answers: ['Kehath', 'Merari', 'Guershon'],
    reference_biblique: 'Exode 6:20',
  },
  {
    id: 'm2-peres-05',
    book_name: '1 Samuel',
    mode: 'match_manche2',
    theme: 'peres',
    format: 'texte_a_trous',
    difficulty: 2,
    question_text: "{{blank}} de Bethléhem avait huit fils, dont le plus jeune David gardait les brebis au désert.",
    correct_answer: 'Isaï',
    wrong_answers: ['Kis', 'Boaz', 'Obed'],
    reference_biblique: '1 Samuel 16:10-11',
  },
  {
    id: 'm2-peres-06',
    book_name: 'Luc',
    mode: 'match_manche2',
    theme: 'peres',
    format: 'texte_a_trous',
    difficulty: 2,
    question_text: "Le sacrificateur {{blank}}, père de Jean le Baptiste, devint muet pour avoir douté de l'ange Gabriel dans le sanctuaire.",
    correct_answer: 'Zacharie',
    wrong_answers: ['Siméon', 'Gamaliel', 'Caïphe'],
    reference_biblique: 'Luc 1:20',
  },

  // --- THÈME: PROPHÉTESSES ---
  {
    id: 'm2-fem-01',
    book_name: 'Juges',
    mode: 'match_manche2',
    theme: 'prophétesses',
    format: 'texte_a_trous',
    difficulty: 2,
    question_text: "La prophétesse {{blank}} jugeait Israël sous un palmier et monta au combat aux côtés de Barak contre Sisera.",
    correct_answer: 'Débora',
    wrong_answers: ['Houlda', 'Miriam', 'Jaël'],
    reference_biblique: 'Juges 4:4',
  },
  {
    id: 'm2-fem-02',
    book_name: 'Exode',
    mode: 'match_manche2',
    theme: 'prophétesses',
    format: 'texte_a_trous',
    difficulty: 2,
    question_text: "La prophétesse {{blank}}, sœur d'Aaron, prit un tambourin en main et guida les femmes d'Israël en chantant la louange de l'Éternel après la mer Rouge.",
    correct_answer: 'Miriam',
    wrong_answers: ['Séphora', 'Débora', 'Abigaïl'],
    reference_biblique: 'Exode 15:20',
  },
  {
    id: 'm2-fem-03',
    book_name: '2 Rois',
    mode: 'match_manche2',
    theme: 'prophétesses',
    format: 'texte_a_trous',
    difficulty: 3,
    question_text: "Le roi Josias envoya consulter la prophétesse {{blank}} qui habitait à Jérusalem dans le second quartier.",
    correct_answer: 'Houlda',
    wrong_answers: ['Noadja', 'Anne', 'Priscille'],
    reference_biblique: '2 Rois 22:14',
  },
  {
    id: 'm2-fem-04',
    book_name: 'Luc',
    mode: 'match_manche2',
    theme: 'prophétesses',
    format: 'texte_a_trous',
    difficulty: 3,
    question_text: "La prophétesse {{blank}}, fille de Phanuel, âgée de quatre-vingt-quatre ans, ne quittait pas le temple et loua Dieu en voyant l'enfant Jésus.",
    correct_answer: 'Anne',
    wrong_answers: ['Élisabeth', 'Salomé', 'Marthe'],
    reference_biblique: 'Luc 2:36-38',
  },
  {
    id: 'm2-fem-05',
    book_name: 'Juges',
    mode: 'match_manche2',
    theme: 'prophétesses',
    format: 'texte_a_trous',
    difficulty: 3,
    question_text: "C'est la courageuse {{blank}}, femme de Héber le Kénien, qui tua le général Sisera dans sa tente avec un pieu.",
    correct_answer: 'Jaël',
    wrong_answers: ['Débora', 'Mical', 'Rahab'],
    reference_biblique: 'Juges 4:21',
  },
  {
    id: 'm2-fem-06',
    book_name: 'Esther',
    mode: 'match_manche2',
    theme: 'prophétesses',
    format: 'texte_a_trous',
    difficulty: 2,
    question_text: "La reine {{blank}} risqua sa vie en se présentant sans convocation devant le roi Assuérus pour sauver son peuple du complot d'Haman.",
    correct_answer: 'Esther',
    wrong_answers: ['Vasthi', 'Athalie', 'Jézabel'],
    reference_biblique: 'Esther 4:16',
  },
];

// ==============================================================================
// 3. BANQUE OFFICIELLE DE QUESTIONS MANCHE 3 (Format vrai_faux, haute difficulté)
// ==============================================================================
export const MATCH_MANCHE3_QUESTIONS: Question[] = [
  {
    id: 'm3-01',
    book_name: 'Genèse',
    mode: 'match_manche3',
    format: 'vrai_faux',
    difficulty: 4,
    question_text: "Selon la généalogie de Genèse 5, Hénoc est mort à l'âge de 365 ans après avoir engendré Mathusalem.",
    correct_answer: 'Faux',
    wrong_answers: [],
    reference_biblique: 'Genèse 5:24 (Hénoc ne mourut point : Dieu le prit)',
  },
  {
    id: 'm3-02',
    book_name: 'Hébreux',
    mode: 'match_manche3',
    format: 'vrai_faux',
    difficulty: 5,
    question_text: "Selon l'épître aux Hébreux (chapitre 7), Melchisédek sacrificateur du Dieu Très-Haut appartenait à l'ordre sacerdotal lévitique d'Aaron.",
    correct_answer: 'Faux',
    wrong_answers: [],
    reference_biblique: 'Hébreux 7:1-6 (Sans père, sans généalogie, ordre distinct)',
  },
  {
    id: 'm3-03',
    book_name: 'Exode',
    mode: 'match_manche3',
    format: 'vrai_faux',
    difficulty: 4,
    question_text: "Les premières tables de la loi en pierre ont été taillées par Moïse, mais les secondes ont été façonnées directement par Dieu.",
    correct_answer: 'Faux',
    wrong_answers: [],
    reference_biblique: 'Exode 34:1 (Les 1ères étaient l’œuvre de Dieu, les 2ndes taillées par Moïse)',
  },
  {
    id: 'm3-04',
    book_name: 'Galates',
    mode: 'match_manche3',
    format: 'vrai_faux',
    difficulty: 4,
    question_text: "Selon Galates 3:17, la loi mosaïque donnée 430 ans après la promesse faite à Abraham n'a pas pu annuler l'alliance scellée par Dieu.",
    correct_answer: 'Vrai',
    wrong_answers: [],
    reference_biblique: 'Galates 3:17',
  },
  {
    id: 'm3-05',
    book_name: '1 Corinthiens',
    mode: 'match_manche3',
    format: 'vrai_faux',
    difficulty: 4,
    question_text: "Selon 1 Corinthiens 15:6, le Christ ressuscité est apparu en une seule fois à plus de cinq cents frères à la fois, dont la plupart vivaient encore.",
    correct_answer: 'Vrai',
    wrong_answers: [],
    reference_biblique: '1 Corinthiens 15:6',
  },
  {
    id: 'm3-06',
    book_name: 'Nombres',
    mode: 'match_manche3',
    format: 'vrai_faux',
    difficulty: 4,
    question_text: "À Kadès, Moïse a été privé d'entrer en Canaan pour avoir parlé au rocher au lieu de le frapper selon l'ordre divin.",
    correct_answer: 'Faux',
    wrong_answers: [],
    reference_biblique: 'Nombres 20:8-12 (Dieu ordonna de parler au rocher, Moïse le frappa deux fois)',
  },
  {
    id: 'm3-07',
    book_name: 'Romains',
    mode: 'match_manche3',
    format: 'vrai_faux',
    difficulty: 5,
    question_text: "Selon Romains 4, Abraham a reçu le signe de la circoncision avant d'avoir été justifié par sa foi envers Dieu.",
    correct_answer: 'Faux',
    wrong_answers: [],
    reference_biblique: 'Romains 4:10-11 (Justifié incirconcis, puis reçu le sceau)',
  },
  {
    id: 'm3-08',
    book_name: '2 Rois',
    mode: 'match_manche3',
    format: 'vrai_faux',
    difficulty: 4,
    question_text: "Le prophète Élie a été enlevé au ciel dans un tourbillon par un char de feu et des chevaux de feu sans connaître la mort physique.",
    correct_answer: 'Vrai',
    wrong_answers: [],
    reference_biblique: '2 Rois 2:11',
  },
  {
    id: 'm3-09',
    book_name: 'Matthieu',
    mode: 'match_manche3',
    format: 'vrai_faux',
    difficulty: 4,
    question_text: "Dans la généalogie de Jésus selon Matthieu 1, quatre femmes de l'Ancien Testament (Thamar, Rahab, Ruth et celle d'Urie) sont explicitement mentionnées.",
    correct_answer: 'Vrai',
    wrong_answers: [],
    reference_biblique: 'Matthieu 1:3-6',
  },
  {
    id: 'm3-10',
    book_name: 'Apocalypse',
    mode: 'match_manche3',
    format: 'vrai_faux',
    difficulty: 5,
    question_text: "Dans la vision de la Nouvelle Jérusalem (Apocalypse 21), la cité céleste possède un temple magnifique au centre où se tiennent les 24 vieillards.",
    correct_answer: 'Faux',
    wrong_answers: [],
    reference_biblique: "Apocalypse 21:22 ('Je ne vis point de temple dans la ville; car le Seigneur Dieu Tout-Puissant est son temple, ainsi que l'agneau')",
  },
];

// ==============================================================================
// 4. FONCTIONS DE SÉLECTION ALÉATOIRE SÉCURISÉE DES QUESTIONS DU MATCH
// ==============================================================================

/**
 * Tire 9 questions pour la Manche 1 (format question_reponse, tous livres)
 */
export async function getManche1Questions(count = 9): Promise<Question[]> {
  let pool = [...MATCH_MANCHE1_QUESTIONS];

  // Compléter avec SEED_QUESTIONS si besoin
  const additional = SEED_QUESTIONS.filter(
    (q) => q.mode === 'match_manche1' && q.format === 'question_reponse'
  );
  for (const q of additional) {
    if (!pool.some((p) => p.id === q.id)) pool.push(q);
  }

  // Mélange aléatoire Fisher-Yates
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Retourne la liste des thèmes disponibles pour la Manche 2
 */
export async function getAvailableMatchThemes(): Promise<ThemeOption[]> {
  return MATCH_THEMES;
}

/**
 * Tire 3 thèmes aléatoires distincts parmi les thèmes disponibles
 */
export async function getRandomThemeChoices(count = 3): Promise<ThemeOption[]> {
  const shuffled = [...MATCH_THEMES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Tire 6 questions du thème sélectionné pour la Manche 2 (format texte_a_trous)
 */
export async function getManche2Questions(themeId: QuestionTheme, count = 6): Promise<Question[]> {
  let pool = MATCH_MANCHE2_QUESTIONS.filter(
    (q) => q.theme === themeId && q.format === 'texte_a_trous'
  );

  // Fallback si le thème n'avait pas assez de questions
  if (pool.length < count) {
    const backup = MATCH_MANCHE2_QUESTIONS.filter(
      (q) => q.format === 'texte_a_trous' && !pool.some((p) => p.id === q.id)
    );
    pool = [...pool, ...backup];
  }

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Tire 5 questions pour la Manche 3 (format vrai_faux, haute difficulté)
 */
export async function getManche3Questions(count = 5): Promise<Question[]> {
  let pool = [...MATCH_MANCHE3_QUESTIONS];

  const additional = SEED_QUESTIONS.filter(
    (q) => q.mode === 'match_manche3' && q.format === 'vrai_faux'
  );
  for (const q of additional) {
    if (!pool.some((p) => p.id === q.id)) pool.push(q);
  }

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ==============================================================================
// 5. PERSISTANCE DES SESSIONS, MANCHES ET RÉPONSES
// ==============================================================================

const LOCAL_MATCH_SESSIONS_KEY = 'superquizz_match_sessions';
const LOCAL_MATCH_ROUNDS_KEY = 'superquizz_match_rounds';
const LOCAL_USER_ANSWERS_KEY = 'superquizz_user_answers';

/**
 * Enregistre ou met à jour une session de Match dans match_sessions
 */
export async function recordMatchSession(session: {
  id: string;
  userId: string;
  scoreTotal: number;
  statut: 'en_cours' | 'termine' | 'abandonne';
  startedAt?: string;
  completedAt?: string;
}): Promise<void> {
  const startedAt = session.startedAt || new Date().toISOString();

  // 1. Sauvegarde locale
  try {
    const raw = localStorage.getItem(LOCAL_MATCH_SESSIONS_KEY);
    const list: MatchSession[] = raw ? JSON.parse(raw) : [];
    const existingIdx = list.findIndex((s) => s.id === session.id);

    const payload: MatchSession = {
      id: session.id,
      user_id: session.userId,
      score_total: session.scoreTotal,
      statut: session.statut,
      started_at: startedAt,
    };

    if (existingIdx >= 0) {
      list[existingIdx] = payload;
    } else {
      list.push(payload);
    }
    localStorage.setItem(LOCAL_MATCH_SESSIONS_KEY, JSON.stringify(list));
  } catch {
    // Ignore
  }

  // 2. Sauvegarde Supabase
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('match_sessions').upsert({
        id: session.id,
        user_id: session.userId,
        score_total: session.scoreTotal,
        statut: session.statut,
        started_at: startedAt,
      });
    } catch (e) {
      console.warn('[MatchEngine] Échec upsert match_sessions Supabase:', e);
    }
  }
}

/**
 * Enregistre une manche de match dans match_rounds
 */
export async function recordMatchRound(round: {
  id: string;
  sessionId: string;
  roundNumber: 1 | 2 | 3;
  themeChoisi?: string | null;
  scoreManche: number;
}): Promise<void> {
  // 1. Sauvegarde locale
  try {
    const raw = localStorage.getItem(LOCAL_MATCH_ROUNDS_KEY);
    const list: MatchRound[] = raw ? JSON.parse(raw) : [];
    list.push({
      id: round.id,
      match_session_id: round.sessionId,
      numero_manche: round.roundNumber,
      theme_choisi: round.themeChoisi as any,
      score_manche: round.scoreManche,
      created_at: new Date().toISOString(),
    });
    localStorage.setItem(LOCAL_MATCH_ROUNDS_KEY, JSON.stringify(list));
  } catch {
    // Ignore
  }

  // 2. Sauvegarde Supabase
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('match_rounds').insert({
        id: round.id,
        match_session_id: round.sessionId,
        numero_manche: round.roundNumber,
        theme_choisi: round.themeChoisi,
        score_manche: round.scoreManche,
      });
    } catch (e) {
      console.warn('[MatchEngine] Échec insert match_rounds Supabase:', e);
    }
  }
}

/**
 * Enregistre une réponse joueur dans user_answers (avec session_type = 'match')
 */
export async function recordMatchUserAnswer(answer: {
  sessionId: string;
  questionId: string;
  reponseDonnee: string;
  estCorrecte: boolean;
  tempsReponseMs: number;
  userId?: string;
  roundNumber?: number;
}): Promise<void> {
  // 1. Sauvegarde locale
  try {
    const raw = localStorage.getItem(LOCAL_USER_ANSWERS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.push({
      id: `ans-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      session_id: answer.sessionId,
      session_type: 'match',
      question_id: answer.questionId,
      reponse_donnee: answer.reponseDonnee,
      est_correcte: answer.estCorrecte,
      temps_reponse_ms: answer.tempsReponseMs,
      round_number: answer.roundNumber,
      created_at: new Date().toISOString(),
    });
    localStorage.setItem(LOCAL_USER_ANSWERS_KEY, JSON.stringify(list));
  } catch {
    // Ignore
  }

  // 2. Sauvegarde Supabase
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('user_answers').insert({
        session_id: answer.sessionId,
        session_type: 'match',
        question_id: answer.questionId,
        reponse_donnee: answer.reponseDonnee,
        est_correcte: answer.estCorrecte,
        temps_reponse_ms: answer.tempsReponseMs,
      });
    } catch (e) {
      console.warn('[MatchEngine] Échec insert user_answers Supabase:', e);
    }
  }
}
