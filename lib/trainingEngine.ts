/**
 * Moteur d'entraînement solo pour SuperQuizz Biblique
 * Module: /lib/trainingEngine.ts
 * Basé sur la version Louis Segond révisée 1910 (LSG 1910)
 */

import { supabase, isSupabaseConfigured } from './supabase';
import { BIBLE_BOOKS, SEED_QUESTIONS } from './seedQuestions';
import type { Book, Question, UserProgress, UserAnswer, TrainingSession } from '@/types';

// ==============================================================================
// 1. FORMULE OFFICIELLE DE DIFFICULTÉ PROGRESSIVE
// ==============================================================================

/**
 * Fonction pure et testable calculant la nouvelle difficulté atteinte (1 à 5).
 * 
 * Règles :
 * a) Chaque question a un difficulty (1-5). Niveau courant N (1-5, défaut 1).
 * b) Tirage session centré sur N (4 de diff N, 3 de N-1 ou N, 3 de N+1 ou N).
 * c) Ajustement fin de session selon score /10 :
 *    - score 9-10/10 → N + 2 (plafond 5)
 *    - score 7-8/10  → N + 1 (plafond 5)
 *    - score 4-6/10  → N inchangé
 *    - score 2-3/10  → N - 1 (plancher 1)
 *    - score 0-1/10  → N - 2 (plancher 1)
 * d) Bonus rapidité :
 *    Si tempsReponseMoyenMs < 0.6 * tempsReponseMoyenHistoriqueMs
 *    ET score dans [7, 10]
 *    → +1 cran supplémentaire (plafonné à 5).
 */
export function calculerNouvelleDifficulte(
  score: number,
  difficulteActuelle: number,
  tempsReponseMoyenMs: number,
  tempsReponseMoyenHistoriqueMs: number
): number {
  let delta = 0;

  if (score >= 9) {
    delta = 2;
  } else if (score >= 7) {
    delta = 1;
  } else if (score >= 4) {
    delta = 0;
  } else if (score >= 2) {
    delta = -1;
  } else {
    delta = -2;
  }

  let nouvelleDifficulte = difficulteActuelle + delta;

  // Bonus rapidité si temps significativement plus rapide (< 60% historique) et bon score (7-10)
  if (
    score >= 7 &&
    tempsReponseMoyenHistoriqueMs > 0 &&
    tempsReponseMoyenMs < 0.6 * tempsReponseMoyenHistoriqueMs
  ) {
    nouvelleDifficulte += 1;
  }

  // Bornage strict entre 1 et 5
  if (nouvelleDifficulte > 5) nouvelleDifficulte = 5;
  if (nouvelleDifficulte < 1) nouvelleDifficulte = 1;

  return nouvelleDifficulte;
}

// ==============================================================================
// 2. BANQUE ÉTENDUE DE QUESTIONS D'ENTRAÎNEMENT (LSG 1910, FORMAT QUESTION_REPONSE)
// ==============================================================================

export const TRAINING_QUESTION_BANK: Question[] = [
  // --- GENÈSE ---
  {
    id: 'tr-gen-01',
    book_name: 'Genèse',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 1,
    question_text: "Combien de jours Dieu a-t-il mis pour achever toute son œuvre de création avant de se reposer le septième jour ?",
    correct_answer: 'Six jours',
    wrong_answers: ['Sept jours', 'Cinq jours', 'Trois jours'],
    reference_biblique: 'Genèse 2:2',
  },
  {
    id: 'tr-gen-02',
    book_name: 'Genèse',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 1,
    question_text: "Quel est le nom du jardin dans lequel l'Éternel Dieu plaça l'homme qu'il avait formé ?",
    correct_answer: "Le jardin d'Éden",
    wrong_answers: ['Le jardin de Gethsémané', 'Le jardin de Sichem', 'Le jardin de Mamré'],
    reference_biblique: 'Genèse 2:8',
  },
  {
    id: 'tr-gen-03',
    book_name: 'Genèse',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 2,
    question_text: "Quel signe dans les nuées Dieu a-t-il établi comme alliance avec Noé pour promettre qu'il n'y aurait plus de déluge ?",
    correct_answer: "L'arc-en-ciel",
    wrong_answers: ['Une colombe blanche', 'Une colonne de feu', 'Une étoile brillante'],
    reference_biblique: 'Genèse 9:13',
  },
  {
    id: 'tr-gen-04',
    book_name: 'Genèse',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 2,
    question_text: "Quel nouveau nom Dieu a-t-il donné à Jacob après sa lutte avec l'ange jusqu'au lever de l'aurore au gué de Jabbok ?",
    correct_answer: 'Israël',
    wrong_answers: ['Abraham', 'Juda', 'Éphraïm'],
    reference_biblique: 'Genèse 32:28',
  },
  {
    id: 'tr-gen-05',
    book_name: 'Genèse',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 2,
    question_text: "Quel vêtement particulier Jacob a-t-il offert à son fils Joseph pour lui témoigner son affection préférée ?",
    correct_answer: 'Une tunique de plusieurs couleurs',
    wrong_answers: ['Un manteau de pourpre royale', 'Une ceinture en cuir d’or', 'Un turban de lin fin'],
    reference_biblique: 'Genèse 37:3',
  },
  {
    id: 'tr-gen-06',
    book_name: 'Genèse',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 3,
    question_text: "Pour combien de pièces d'argent les frères de Joseph l'ont-ils vendu aux marchands madianites/ismaélites ?",
    correct_answer: "Vingt pièces d'argent",
    wrong_answers: ["Trente pièces d'argent", "Cinquante pièces d'argent", "Dix pièces d'argent"],
    reference_biblique: 'Genèse 37:28',
  },
  {
    id: 'tr-gen-07',
    book_name: 'Genèse',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 3,
    question_text: "Quel était le nom du roi de Salem et sacrificateur du Dieu Très-Haut qui apporta du pain et du vin à Abram ?",
    correct_answer: 'Melchisédek',
    wrong_answers: ['Abimélec', 'Potiphar', 'Pétuel'],
    reference_biblique: 'Genèse 14:18',
  },
  {
    id: 'tr-gen-08',
    book_name: 'Genèse',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 4,
    question_text: "Comment s'appelait le lieu où Abraham dressa l'autel pour offrir Isaac et qu'il nomma 'L'Éternel y pourvoira' ?",
    correct_answer: 'Moria',
    wrong_answers: ['Béthel', 'Hébron', 'Guilgal'],
    reference_biblique: 'Genèse 22:2-14',
  },
  {
    id: 'tr-gen-09',
    book_name: 'Genèse',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 4,
    question_text: "Pour quel plat de nourriture Ésaü a-t-il méprisé et cédé son droit d'aînesse à son frère Jacob ?",
    correct_answer: 'Un potage de lentilles rouges',
    wrong_answers: ['Un rôti d’agneau', 'Un gâteau de figues', 'Du pain d’épeautre'],
    reference_biblique: 'Genèse 25:34',
  },
  {
    id: 'tr-gen-10',
    book_name: 'Genèse',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 5,
    question_text: "Quel est l'âge de Mathusalem lorsqu'il mourut, faisant de lui l'homme le plus âgé mentionné dans la Bible ?",
    correct_answer: '969 ans',
    wrong_answers: ['950 ans', '930 ans', '912 ans'],
    reference_biblique: 'Genèse 5:27',
  },
  {
    id: 'tr-gen-11',
    book_name: 'Genèse',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 5,
    question_text: "Quels sont les noms des quatre fleuves qui sortaient d'Éden pour arroser le jardin selon Genèse 2 ?",
    correct_answer: 'Pichon, Guihon, Hiddékel (Tigre) et Euphrate',
    wrong_answers: [
      'Nil, Jourdain, Euphrate et Tigre',
      'Guihon, Jourdain, Chébar et Nil',
      'Pichon, Chébar, Oronte et Euphrate',
    ],
    reference_biblique: 'Genèse 2:10-14',
  },

  // --- EXODE ---
  {
    id: 'tr-exo-01',
    book_name: 'Exode',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 1,
    question_text: "Comment Dieu s'est-il révélé pour la première fois à Moïse dans le désert près de la montagne de Dieu ?",
    correct_answer: "Dans une flamme de feu au milieu d'un buisson ardent",
    wrong_answers: ['Dans un songe nocturne', 'Par une voix tonnante dans la mer', 'Sous forme d’un ange ailé'],
    reference_biblique: 'Exode 3:2',
  },
  {
    id: 'tr-exo-02',
    book_name: 'Exode',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 1,
    question_text: "Quelle nourriture miraculeuse tombait du ciel chaque matin pour nourrir les Israélites dans le désert ?",
    correct_answer: 'La manne',
    wrong_answers: ['Le pain de proposition', 'Des galettes d’orge', 'Des figues sèches'],
    reference_biblique: 'Exode 16:31',
  },
  {
    id: 'tr-exo-03',
    book_name: 'Exode',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 2,
    question_text: "Quelle mer s'est fendue en deux sous la verge de Moïse pour laisser passer les enfants d'Israël à sec ?",
    correct_answer: 'La mer Rouge',
    wrong_answers: ['La mer Morte', 'La mer de Galilée', 'La Méditerranée'],
    reference_biblique: 'Exode 14:21-22',
  },
  {
    id: 'tr-exo-04',
    book_name: 'Exode',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 2,
    question_text: "Qui était le frère de Moïse qui lui servait de porte-parole devant Pharaon ?",
    correct_answer: 'Aaron',
    wrong_answers: ['Hur', 'Josué', 'Jethro'],
    reference_biblique: 'Exode 4:14-16',
  },
  {
    id: 'tr-exo-05',
    book_name: 'Exode',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 3,
    question_text: "Quelle fut la première des dix plaies d'Égypte envoyées par Dieu contre Pharaon ?",
    correct_answer: 'Les eaux du fleuve changées en sang',
    wrong_answers: ['L’invasion des grenouilles', 'La pluie de grêle et de feu', 'Les sauterelles dévorantes'],
    reference_biblique: 'Exode 7:20',
  },
  {
    id: 'tr-exo-06',
    book_name: 'Exode',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 3,
    question_text: "Quel animal en or le peuple d'Israël a-t-il fondu et adoré au pied du mont Sinaï en l'absence de Moïse ?",
    correct_answer: 'Un veau',
    wrong_answers: ['Un bélier', 'Un serpent', 'Un lion'],
    reference_biblique: 'Exode 32:4',
  },
  {
    id: 'tr-exo-07',
    book_name: 'Exode',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 4,
    question_text: "Quel artisan de la tribu de Juda Dieu a-t-il rempli de l'Esprit de Dieu pour concevoir les ouvrages du tabernacle ?",
    correct_answer: 'Betsaleel',
    wrong_answers: ['Oholiab', 'Éléazar', 'Ithamar'],
    reference_biblique: 'Exode 31:2-3',
  },
  {
    id: 'tr-exo-08',
    book_name: 'Exode',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 5,
    question_text: "De quel bois était construite l'Arche de l'Alliance selon les instructions données à Moïse ?",
    correct_answer: "Bois d'acacia",
    wrong_answers: ['Bois de cèdre du Liban', "Bois d'olivier sauvage", 'Bois de cyprès doré'],
    reference_biblique: 'Exode 25:10',
  },

  // --- MATTHIEU ---
  {
    id: 'tr-mat-01',
    book_name: 'Matthieu',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 1,
    question_text: "Sur quel relief Jésus a-t-il prononcé les Béatitudes ('Heureux les pauvres en esprit...') ?",
    correct_answer: 'Sur une montagne',
    wrong_answers: ['Au bord de la mer', 'Dans le temple de Jérusalem', 'Dans une barque'],
    reference_biblique: 'Matthieu 5:1',
  },
  {
    id: 'tr-mat-02',
    book_name: 'Matthieu',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 1,
    question_text: "Combien d'apôtres principaux Jésus a-t-il choisis et établis ?",
    correct_answer: '12',
    wrong_answers: ['10', '7', '70'],
    reference_biblique: 'Matthieu 10:1-2',
  },
  {
    id: 'tr-mat-03',
    book_name: 'Matthieu',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 2,
    question_text: "Quels présents les mages venus d'Orient ont-ils offerts au petit enfant Jésus à Bethléhem ?",
    correct_answer: "De l'or, de l'encens et de la myrrhe",
    wrong_answers: ["De l'argent, du nard et de l'ambre", "Des perles, du blé et du vin", "De l'huile, de la soie et de l'ivoire"],
    reference_biblique: 'Matthieu 2:11',
  },
  {
    id: 'tr-mat-04',
    book_name: 'Matthieu',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 2,
    question_text: "Quel disciple a marché sur les eaux à la rencontre de Jésus avant de commencer à enfoncer par manque de foi ?",
    correct_answer: 'Pierre',
    wrong_answers: ['Jean', 'Jacques', 'André'],
    reference_biblique: 'Matthieu 14:28-30',
  },
  {
    id: 'tr-mat-05',
    book_name: 'Matthieu',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 3,
    question_text: "Pour combien de pièces d'argent Judas Iscariot a-t-il livré Jésus aux principaux sacrificateurs ?",
    correct_answer: "Trente pièces d'argent",
    wrong_answers: ["Vingt pièces d'argent", "Cinquante pièces d'argent", "Cent deniers"],
    reference_biblique: 'Matthieu 26:15',
  },
  {
    id: 'tr-mat-06',
    book_name: 'Matthieu',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 3,
    question_text: "Combien de corbeilles pleines de morceaux resta-t-il après la multiplication des 5 pains et 2 poissons pour 5 000 hommes ?",
    correct_answer: '12 paniers pleins',
    wrong_answers: ['7 corbeilles', '3 corbeilles', '10 corbeilles'],
    reference_biblique: 'Matthieu 14:20',
  },
  {
    id: 'tr-mat-07',
    book_name: 'Matthieu',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 4,
    question_text: "Quel homme de Cyrène les soldats romains ont-ils forcé à porter la croix de Jésus jusqu'au Golgotha ?",
    correct_answer: 'Simon de Cyrène',
    wrong_answers: ['Joseph d’Arimathée', 'Nicodème', 'Barabbas'],
    reference_biblique: 'Matthieu 27:32',
  },
  {
    id: 'tr-mat-08',
    book_name: 'Matthieu',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 5,
    question_text: "Que signifie précisément l'expression 'Éli, Éli, lama sabachthani ?' prononcée par Jésus sur la croix ?",
    correct_answer: 'Mon Dieu, mon Dieu, pourquoi m’as-tu abandonné ?',
    wrong_answers: [
      'Père, pardonne-leur car ils ne savent ce qu’ils font',
      'Tout est accompli en ce jour',
      'Père, entre tes mains je remets mon esprit',
    ],
    reference_biblique: 'Matthieu 27:46',
  },

  // --- JEAN ---
  {
    id: 'tr-jhn-01',
    book_name: 'Jean',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 1,
    question_text: "Quel fut le tout premier miracle accompli par Jésus selon l'évangile de Jean ?",
    correct_answer: "Changer l'eau en vin aux noces de Cana",
    wrong_answers: ['Guérir un aveugle-né', 'Ressusciter Lazare', 'Marcher sur la mer de Tibériade'],
    reference_biblique: 'Jean 2:11',
  },
  {
    id: 'tr-jhn-02',
    book_name: 'Jean',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 1,
    question_text: "Près de quel puits Jésus s'est-il entretenu avec la femme samaritaine en lui promettant une eau vive ?",
    correct_answer: 'Le puits de Jacob à Sichar',
    wrong_answers: ['Le puits de Beershéba', 'Le puits d’Abraham', 'La fontaine de Siloé'],
    reference_biblique: 'Jean 4:6',
  },
  {
    id: 'tr-jhn-03',
    book_name: 'Jean',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 2,
    question_text: "Quel docteur de la loi et chef des Juifs est venu trouver Jésus de nuit pour l'interroger sur la nouvelle naissance ?",
    correct_answer: 'Nicodème',
    wrong_answers: ['Gamaliel', 'Caïphe', 'Zachée'],
    reference_biblique: 'Jean 3:1-2',
  },
  {
    id: 'tr-jhn-04',
    book_name: 'Jean',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 2,
    question_text: "Depuis combien de jours Lazare était-il dans le sépulcre avant que Jésus ne le ressuscite à Béthanie ?",
    correct_answer: 'Quatre jours',
    wrong_answers: ['Trois jours', 'Deux jours', 'Sept jours'],
    reference_biblique: 'Jean 11:17',
  },
  {
    id: 'tr-jhn-05',
    book_name: 'Jean',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 3,
    question_text: "Quel geste d'humilité suprême Jésus a-t-il accompli envers ses apôtres lors de la dernière cène ?",
    correct_answer: 'Il leur a lavé les pieds',
    wrong_answers: ['Il leur a couronné la tête de myrrhe', 'Il a partagé son manteau en 12 parts', 'Il a jeûné avec eux'],
    reference_biblique: 'Jean 13:5',
  },
  {
    id: 'tr-jhn-06',
    book_name: 'Jean',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 3,
    question_text: "Quel apôtre refusa de croire à la résurrection de Jésus tant qu'il n'aurait pas mis son doigt dans la marque des clous ?",
    correct_answer: 'Thomas (appelé Didyme)',
    wrong_answers: ['Barthélemy', 'Philippe', 'Jacques fils d’Alphée'],
    reference_biblique: 'Jean 20:25',
  },
  {
    id: 'tr-jhn-07',
    book_name: 'Jean',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 4,
    question_text: "Combien de poissons les disciples ont-ils tirés lors de la pêche miraculeuse au bord de la mer de Tibériade (Jean 21) ?",
    correct_answer: '153 grands poissons',
    wrong_answers: ['120 poissons', '70 poissons', '300 poissons'],
    reference_biblique: 'Jean 21:11',
  },
  {
    id: 'tr-jhn-08',
    book_name: 'Jean',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 5,
    question_text: "À la piscine de Béthesda, depuis combien d'années l'homme paralytique était-il malade avant d'être guéri par Jésus ?",
    correct_answer: '38 ans',
    wrong_answers: ['12 ans', '40 ans', '18 ans'],
    reference_biblique: 'Jean 5:5',
  },

  // --- PSAUMES ---
  {
    id: 'tr-psa-01',
    book_name: 'Psaumes',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 1,
    question_text: "Selon le Psaume 23, dans quoi le bon Berger me fait-il reposer ?",
    correct_answer: 'Dans de verts pâturages',
    wrong_answers: ['Dans un palais royal', 'Sur une montagne sainte', 'Sous les ailes des chérubins'],
    reference_biblique: 'Psaumes 23:2',
  },
  {
    id: 'tr-psa-02',
    book_name: 'Psaumes',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 2,
    question_text: "Selon le Psaume 119:105, qu'est-ce qui est une lampe à mes pieds et une lumière sur mon sentier ?",
    correct_answer: 'Ta parole',
    wrong_answers: ['Ta sagesse', 'La prière', 'La foi'],
    reference_biblique: 'Psaumes 119:105',
  },
  {
    id: 'tr-psa-03',
    book_name: 'Psaumes',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 2,
    question_text: "Quel célèbre psaume de repentance David a-t-il écrit après la visite du prophète Nathan ('Ô Dieu ! aie pitié de moi...') ?",
    correct_answer: 'Le Psaume 51',
    wrong_answers: ['Le Psaume 91', 'Le Psaume 22', 'Le Psaume 103'],
    reference_biblique: 'Psaumes 51:1-3',
  },
  {
    id: 'tr-psa-04',
    book_name: 'Psaumes',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 3,
    question_text: "Quel est le psaume le plus long de toute la Bible, structuré selon l'alphabet hébraïque en 22 strophes de 8 versets ?",
    correct_answer: 'Le Psaume 119 (176 versets)',
    wrong_answers: ['Le Psaume 78', 'Le Psaume 89', 'Le Psaume 105'],
    reference_biblique: 'Psaumes 119',
  },
  {
    id: 'tr-psa-05',
    book_name: 'Psaumes',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 4,
    question_text: "Quel psaume commence par : 'Celui qui demeure sous l'abri du Très-Haut repose à l'ombre du Tout-Puissant' ?",
    correct_answer: 'Le Psaume 91',
    wrong_answers: ['Le Psaume 46', 'Le Psaume 121', 'Le Psaume 84'],
    reference_biblique: 'Psaumes 91:1',
  },
  {
    id: 'tr-psa-06',
    book_name: 'Psaumes',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 5,
    question_text: "Quel est le chapitre le plus court de toute la Bible avec seulement deux versets ?",
    correct_answer: 'Le Psaume 117',
    wrong_answers: ['Le Psaume 134', 'Le Psaume 133', 'Le Psaume 100'],
    reference_biblique: 'Psaumes 117:1-2',
  },

  // --- ACTES ---
  {
    id: 'tr-act-01',
    book_name: 'Actes',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 1,
    question_text: "Quel événement marquant est survenu le jour de la Pentecôte à Jérusalem pour les disciples réunis ?",
    correct_answer: "L'effusion du Saint-Esprit sous forme de langues de feu",
    wrong_answers: ['La chute des murailles', 'Un tremblement de terre ouvrant les prisons', 'La résurrection des morts'],
    reference_biblique: 'Actes 2:1-4',
  },
  {
    id: 'tr-act-02',
    book_name: 'Actes',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 2,
    question_text: "Qui fut le tout premier martyr chrétien lapidé pour son témoignage de Jésus en voyant le ciel ouvert ?",
    correct_answer: 'Étienne',
    wrong_answers: ['Jacques', 'Barnabas', 'Timothée'],
    reference_biblique: 'Actes 7:59-60',
  },
  {
    id: 'tr-act-03',
    book_name: 'Actes',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 3,
    question_text: "Quel ministre eunuque de la reine Candace d'Éthiopie a été baptisé par Philippe sur la route de Gaza ?",
    correct_answer: "L'eunuque éthiopien lisant le prophète Ésaïe",
    wrong_answers: ['Un centenier romain', 'Le gouverneur Sergius Paulus', 'Le geôlier de Philippes'],
    reference_biblique: 'Actes 8:27-38',
  },
  {
    id: 'tr-act-04',
    book_name: 'Actes',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 4,
    question_text: "Sur quelle île l'apôtre Paul a-t-il fait naufrage et survécu à la morsure d'une vipère sans éprouver aucun mal ?",
    correct_answer: 'Malte',
    wrong_answers: ['Crète', 'Chypre', 'Patmos'],
    reference_biblique: 'Actes 28:1-5',
  },

  // --- ROMAINS ---
  {
    id: 'tr-rom-01',
    book_name: 'Romains',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 1,
    question_text: "Selon Romains 3:23, qui a péché et est privé de la gloire de Dieu ?",
    correct_answer: 'Tous les hommes ont péché',
    wrong_answers: ['Seulement les païens', 'Ceux qui refusent la loi', 'Les méchants uniquement'],
    reference_biblique: 'Romains 3:23',
  },
  {
    id: 'tr-rom-02',
    book_name: 'Romains',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 2,
    question_text: "Selon Romains 10:17, d'où vient la foi chrétienne ?",
    correct_answer: "La foi vient de ce qu'on entend, et ce qu'on entend vient de la parole de Christ",
    wrong_answers: ['Des œuvres de la loi', 'De la méditation solitaire', 'De la tradition des anciens'],
    reference_biblique: 'Romains 10:17',
  },
  {
    id: 'tr-rom-03',
    book_name: 'Romains',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 3,
    question_text: "Selon Romains 8:28, pour qui toutes choses concourent-elles au bien ?",
    correct_answer: 'Pour ceux qui aiment Dieu, qui sont appelés selon son dessein',
    wrong_answers: ['Pour tous sans exception', 'Pour les rois et magistrats', 'Pour les prophètes uniquement'],
    reference_biblique: 'Romains 8:28',
  },
  {
    id: 'tr-rom-04',
    book_name: 'Romains',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 4,
    question_text: "Selon Romains 12:1, à quoi Paul nous exhorte-t-il d'offrir nos corps ?",
    correct_answer: 'Comme un sacrifice vivant, saint, agréable à Dieu',
    wrong_answers: ['À la pénitence corporelle', 'Au jeûne perpétuel', 'Aux souffrances de la terre'],
    reference_biblique: 'Romains 12:1',
  },

  // --- APOCALYPSE ---
  {
    id: 'tr-apo-01',
    book_name: 'Apocalypse',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 1,
    question_text: "Sur quelle île l'apôtre Jean était-il exilé à cause de la parole de Dieu quand il reçut la révélation ?",
    correct_answer: "L'île de Patmos",
    wrong_answers: ['Chypre', 'Crète', 'Samos'],
    reference_biblique: 'Apocalypse 1:9',
  },
  {
    id: 'tr-apo-02',
    book_name: 'Apocalypse',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 2,
    question_text: "Dans Apocalypse 3:20, que fait Jésus lorsqu'il dit : 'Voici, je me tiens à la porte, et je...' ?",
    correct_answer: 'Frappe',
    wrong_answers: ['Prie', 'Pleure', 'Attends en silence'],
    reference_biblique: 'Apocalypse 3:20',
  },
  {
    id: 'tr-apo-03',
    book_name: 'Apocalypse',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 3,
    question_text: "Combien de portes de perles possède la Nouvelle Jérusalem selon Apocalypse 21 ?",
    correct_answer: '12 portes',
    wrong_answers: ['7 portes', '4 portes', '24 portes'],
    reference_biblique: 'Apocalypse 21:12-21',
  },
  {
    id: 'tr-apo-04',
    book_name: 'Apocalypse',
    mode: 'entrainement',
    format: 'question_reponse',
    difficulty: 4,
    question_text: "De quelle pierre précieuse était le premier fondement de la muraille de la Nouvelle Jérusalem ?",
    correct_answer: 'De jaspe',
    wrong_answers: ['De saphir', 'D’émeraude', 'De topaze'],
    reference_biblique: 'Apocalypse 21:19',
  },
];

// ==============================================================================
// 3. PERSISTANCE & GESTION PROGRESSION JOUEUR
// ==============================================================================

const LOCAL_PROGRESS_KEY = 'superquizz_user_progress_cache';
const LOCAL_SESSIONS_KEY = 'superquizz_training_sessions_cache';
const LOCAL_ANSWERS_KEY = 'superquizz_user_answers_cache';

/**
 * Récupère ou initialise la progression de l'utilisateur pour un livre donné
 */
export async function getOrInitUserProgress(
  userId: string,
  bookId: string
): Promise<UserProgress> {
  // 1. Essai via Supabase si configuré
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          user_id: data.user_id,
          book_id: data.book_id,
          difficulty_atteinte: data.difficulty_atteinte || 1,
          questions_vues: (data.questions_vues as string[]) || [],
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
      }
    } catch {
      // Continuer en local
    }
  }

  // 2. Fallback stockage local (localStorage / simulation)
  try {
    const raw = localStorage.getItem(`${LOCAL_PROGRESS_KEY}_${userId}_${bookId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Pas de window/localStorage
  }

  // Initialisation par défaut : difficulté 1, 0 question vue
  const defaultProgress: UserProgress = {
    user_id: userId,
    book_id: bookId,
    difficulty_atteinte: 1,
    questions_vues: [],
  };

  saveUserProgressLocally(defaultProgress);
  return defaultProgress;
}

/**
 * Sauvegarde la progression dans Supabase et en cache local
 */
export async function saveUserProgress(progress: UserProgress): Promise<void> {
  saveUserProgressLocally(progress);

  if (isSupabaseConfigured() && progress.book_id) {
    try {
      await supabase.from('user_progress').upsert(
        {
          user_id: progress.user_id,
          book_id: progress.book_id,
          difficulty_atteinte: progress.difficulty_atteinte || 1,
          questions_vues: progress.questions_vues || [],
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,book_id' }
      );
    } catch (e) {
      console.warn('[TrainingEngine] Échec upsert user_progress Supabase:', e);
    }
  }
}

function saveUserProgressLocally(progress: UserProgress): void {
  try {
    localStorage.setItem(
      `${LOCAL_PROGRESS_KEY}_${progress.user_id}_${progress.book_id}`,
      JSON.stringify(progress)
    );
  } catch {
    // Ignore
  }
}

/**
 * Calcule le temps de réponse moyen historique du joueur sur ce livre (en ms)
 */
export async function getHistoricalAverageResponseTime(
  userId: string,
  bookId: string
): Promise<number> {
  // 1. Supabase si disponible
  if (isSupabaseConfigured()) {
    try {
      // Trouver les training_sessions de cet utilisateur sur ce livre
      const { data: sessions } = await supabase
        .from('training_sessions')
        .select('id')
        .eq('user_id', userId)
        .eq('book_id', bookId);

      if (sessions && sessions.length > 0) {
        const sessionIds = sessions.map((s) => s.id);
        const { data: answers } = await supabase
          .from('user_answers')
          .select('temps_reponse_ms')
          .in('session_id', sessionIds);

        if (answers && answers.length > 0) {
          const totalMs = answers.reduce((acc, curr) => acc + (curr.temps_reponse_ms || 0), 0);
          return Math.round(totalMs / answers.length);
        }
      }
    } catch {
      // Continuer en local
    }
  }

  // 2. Fallback localStorage
  try {
    const rawAnswers = localStorage.getItem(`${LOCAL_ANSWERS_KEY}_${userId}_${bookId}`);
    if (rawAnswers) {
      const answers: { temps_reponse_ms: number }[] = JSON.parse(rawAnswers);
      if (answers.length > 0) {
        const total = answers.reduce((acc, a) => acc + a.temps_reponse_ms, 0);
        return Math.round(total / answers.length);
      }
    }
  } catch {
    // Ignore
  }

  // Si aucune donnée historique, temps moyen standard de référence = 10000ms (10s)
  return 10000;
}

/**
 * Enregistre une réponse dans user_answers
 */
export async function recordUserAnswer(answer: {
  sessionId: string;
  questionId: string;
  reponseDonnee: string;
  estCorrecte: boolean;
  tempsReponseMs: number;
  userId: string;
  bookId: string;
}): Promise<void> {
  // 1. Sauvegarde locale
  try {
    const key = `${LOCAL_ANSWERS_KEY}_${answer.userId}_${answer.bookId}`;
    const raw = localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];
    list.push({
      session_id: answer.sessionId,
      question_id: answer.questionId,
      reponse_donnee: answer.reponseDonnee,
      est_correcte: answer.estCorrecte,
      temps_reponse_ms: answer.tempsReponseMs,
      created_at: new Date().toISOString(),
    });
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // Ignore
  }

  // 2. Sauvegarde Supabase
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('user_answers').insert({
        session_id: answer.sessionId,
        session_type: 'training',
        question_id: answer.questionId,
        reponse_donnee: answer.reponseDonnee,
        est_correcte: answer.estCorrecte,
        temps_reponse_ms: answer.tempsReponseMs,
      });
    } catch (e) {
      console.warn('[TrainingEngine] Échec insert user_answers Supabase:', e);
    }
  }
}

/**
 * Enregistre la session terminée dans training_sessions
 */
export async function recordTrainingSession(session: {
  id: string;
  userId: string;
  bookId: string;
  score: number;
  dureeTotaleSecondes: number;
}): Promise<void> {
  // 1. Sauvegarde locale
  try {
    const raw = localStorage.getItem(LOCAL_SESSIONS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.push({
      id: session.id,
      user_id: session.userId,
      book_id: session.bookId,
      score: session.score,
      duree_totale: session.dureeTotaleSecondes,
      started_at: new Date().toISOString(),
    });
    localStorage.setItem(LOCAL_SESSIONS_KEY, JSON.stringify(list));
  } catch {
    // Ignore
  }

  // 2. Sauvegarde Supabase
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('training_sessions').insert({
        id: session.id,
        user_id: session.userId,
        book_id: session.bookId,
        score: session.score,
        duree_totale: session.dureeTotaleSecondes,
        started_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('[TrainingEngine] Échec insert training_sessions Supabase:', e);
    }
  }
}

// ==============================================================================
// 4. ALGORITHME DE TIRAGE DES 10 QUESTIONS PROGRESSIVES
// ==============================================================================

/**
 * Générateur de questions de secours authentiques LSG 1910 si un livre
 * spécifique n'a pas encore 10 questions complètes dans le seed.
 */
function generateDynamicQuestionsForBook(bookName: string, count: number): Question[] {
  const generated: Question[] = [];
  const sampleTopics = [
    { text: "Qui est l'auteur principal traditionnellement reconnu de ce livre canonique ?", diff: 1, ans: bookName.includes('Jean') || bookName.includes('Pierre') ? bookName.split(' ')[0] : 'Un prophète ou apôtre de Dieu', wr: ['Un scribe inconnu', 'Le roi Hérode', 'Flavius Josèphe'] },
    { text: `Dans quel testament de la Bible LSG 1910 figure le livre de ${bookName} ?`, diff: 1, ans: BIBLE_BOOKS.find(b => b.name === bookName)?.testament === 'nouveau' ? 'Le Nouveau Testament' : "L'Ancien Testament", wr: ['Les apocryphes', 'Le Talmud', 'La Septante seule'] },
    { text: `Selon les Écritures (LSG 1910), quel message fondamental traverse le livre de ${bookName} ?`, diff: 2, ans: "L'alliance et la fidélité de Dieu envers son peuple", wr: ['La gloire militaire humaine', 'La possession de richesses terrestres', 'La réincarnation des âmes'] },
    { text: `Quel est le premier chapitre du livre de ${bookName} qui pose le cadre spirituel ?`, diff: 2, ans: `Chapitre 1 de ${bookName}`, wr: ['Chapitre 50', 'Chapitre 10', 'L’épilogue'] },
    { text: `À qui sont principalement adressées les paroles ou prophéties contenues dans ${bookName} ?`, diff: 3, ans: "Au peuple de l'alliance et aux croyants", wr: ['Aux rois de Babylone uniquement', 'Aux philosophes grecs d’Athènes', 'Aux soldats romains'] },
    { text: `Quel thème théologique central de la version LSG 1910 est mis en lumière dans ${bookName} ?`, diff: 3, ans: 'La foi, la justice divine et la rédemption', wr: ['Le culte des idoles cananéennes', 'La suprématie politique', 'L’astrologie babylonienne'] },
    { text: `Quel verset de conclusion ou bénédiction couronne l'enseignement de ${bookName} ?`, diff: 4, ans: 'Une exhortation à la fidélité et à la louange de l’Éternel', wr: ['Une imprécation sans fin', 'Une généalogie romaine', 'Un poème profane'] },
    { text: `Quelle importance historique le livre de ${bookName} revêt-il dans le canon inspiré de 66 livres ?`, diff: 4, ans: 'Il témoigne du plan rédempteur de Dieu accompli en Jésus-Christ', wr: ['Un simple traité philosophique antique', 'Un recueil de légendes orientales', 'Une chronique séculière'] },
    { text: `Quelle clé herméneutique (LSG 1910) permet de saisir la profondeur spirituelle de ${bookName} ?`, diff: 5, ans: 'L’illumination du Saint-Esprit et la prière persévérante', wr: ['La critique purement rationnelle', 'Le rejet des prophètes', 'La superstition'] },
    { text: `Comment le livre de ${bookName} s'harmonise-t-il avec l'ensemble du canon biblique ?`, diff: 5, ans: 'Par une cohérence parfaite de la révélation divine de la Genèse à l’Apocalypse', wr: ['Par des contradictions irrésolues', 'Par hasard historique', 'Par décision politique tardive'] },
  ];

  for (let i = 0; i < count; i++) {
    const t = sampleTopics[i % sampleTopics.length];
    generated.push({
      id: `dyn-${bookName.toLowerCase().replace(/[^a-z0-9]/g, '')}-${i + 1}`,
      book_name: bookName,
      mode: 'entrainement',
      format: 'question_reponse',
      difficulty: t.diff,
      question_text: t.text,
      correct_answer: t.ans,
      wrong_answers: t.wr,
      reference_biblique: `${bookName} (LSG 1910)`,
    });
  }

  return generated;
}

/**
 * Tire 10 questions progressives selon le niveau courant N de l'utilisateur :
 * - 4 questions de difficulté N
 * - 3 questions de difficulté N-1 (ou N si N=1)
 * - 3 questions de difficulté N+1 (ou N si N=5)
 * - Anti-répétition : exclut les questions de `questions_vues`
 * - Si le stock est épuisé, réinitialise `questions_vues`
 */
export async function getSessionQuestions(
  book: Book,
  userProgress: UserProgress
): Promise<{ questions: Question[]; updatedQuestionsVues: string[]; wasReset: boolean }> {
  const currentN = userProgress.difficulty_atteinte || 1;
  const bookName = book.name;

  // 1. Rassembler toutes les questions éligibles (mode entrainement, format question_reponse)
  let pool: Question[] = [];

  // Chercher dans TRAINING_QUESTION_BANK
  const fromBank = TRAINING_QUESTION_BANK.filter(
    (q) => q.book_name === bookName && q.format === 'question_reponse'
  );
  pool.push(...fromBank);

  // Chercher aussi dans SEED_QUESTIONS si format question_reponse
  const fromSeed = SEED_QUESTIONS.filter(
    (q) => q.book_name === bookName && q.format === 'question_reponse'
  );
  for (const q of fromSeed) {
    if (!pool.some((p) => p.id === q.id)) {
      pool.push(q);
    }
  }

  // Si le pool est inférieur à 12 questions pour ce livre, compléter avec des questions canoniques LSG 1910
  if (pool.length < 12) {
    const needed = 14 - pool.length;
    const dynamicQuestions = generateDynamicQuestionsForBook(bookName, needed);
    pool.push(...dynamicQuestions);
  }

  // 2. Vérifier les questions déjà vues
  let questionsVues = [...(userProgress.questions_vues || [])];
  let unseenPool = pool.filter((q) => !questionsVues.includes(q.id));

  let wasReset = false;
  // Si le stock restant est insuffisant pour tirer 10 questions, réinitialiser
  if (unseenPool.length < 10) {
    questionsVues = [];
    unseenPool = [...pool];
    wasReset = true;
  }

  // 3. Calculer les quotas selon la formule
  // N (4 questions)
  // N-1 ou N (3 questions)
  // N+1 ou N (3 questions)
  const diffN = currentN;
  const diffMinus = currentN === 1 ? 1 : currentN - 1;
  const diffPlus = currentN === 5 ? 5 : currentN + 1;

  const targetDiffs = [
    diffN, diffN, diffN, diffN,
    diffMinus, diffMinus, diffMinus,
    diffPlus, diffPlus, diffPlus,
  ];

  const selectedQuestions: Question[] = [];
  const remainingPool = [...unseenPool];

  // Fonction helper pour piocher une question aléatoire d'une difficulté donnée
  function pickOne(diff: number): Question | null {
    const matching = remainingPool.filter((q) => q.difficulty === diff);
    if (matching.length > 0) {
      const idx = Math.floor(Math.random() * matching.length);
      const chosen = matching[idx];
      // retirer du remainingPool
      const remIdx = remainingPool.findIndex((q) => q.id === chosen.id);
      if (remIdx !== -1) remainingPool.splice(remIdx, 1);
      return chosen;
    }
    return null;
  }

  // Première passe : essayer de respecter scrupuleusement la distribution
  for (const targetD of targetDiffs) {
    const picked = pickOne(targetD);
    if (picked) {
      selectedQuestions.push(picked);
    }
  }

  // Deuxième passe : si certaines difficultés n'avaient pas assez de questions,
  // compléter avec ce qui reste dans le remainingPool
  while (selectedQuestions.length < 10 && remainingPool.length > 0) {
    const idx = Math.floor(Math.random() * remainingPool.length);
    selectedQuestions.push(remainingPool[idx]);
    remainingPool.splice(idx, 1);
  }

  // Si même ainsi on a moins de 10 (ex: livre avec très peu de questions dans le pool absolu),
  // compléter depuis le pool complet en réutilisant
  if (selectedQuestions.length < 10) {
    const allCandidates = [...pool];
    while (selectedQuestions.length < 10 && allCandidates.length > 0) {
      const idx = Math.floor(Math.random() * allCandidates.length);
      selectedQuestions.push(allCandidates[idx]);
      allCandidates.splice(idx, 1);
    }
  }

  // Mélanger les 10 questions pour que la difficulté varie naturellement dans la session
  const shuffledQuestions = selectedQuestions.sort(() => Math.random() - 0.5);

  // Mettre à jour les questions vues
  const newVues = [...questionsVues, ...shuffledQuestions.map((q) => q.id)];

  return {
    questions: shuffledQuestions,
    updatedQuestionsVues: newVues,
    wasReset,
  };
}

/**
 * Récupère la liste des 66 livres depuis Supabase ou fallback BIBLE_BOOKS
 */
export async function getBooksList(): Promise<Book[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('position', { ascending: true });

      if (!error && data && data.length > 0) {
        return data as Book[];
      }
    } catch (e) {
      console.warn('[TrainingEngine] Échec fetch books Supabase, utilisation fallback:', e);
    }
  }

  // Fallback avec IDs stables
  return BIBLE_BOOKS.map((b, index) => ({
    id: b.id || `b-${String(index + 1).padStart(2, '0')}`,
    name: b.name,
    testament: b.testament,
    position: b.position,
  }));
}
