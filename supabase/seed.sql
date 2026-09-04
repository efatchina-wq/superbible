-- ==============================================================================
-- SUPERQUIZZ BIBLIQUE - SEED DATA (Supabase / Postgres)
-- Version Biblique : Louis Segond révisée 1910 (LSG 1910)
-- Contient :
-- 1. Les 66 Livres canoniques (39 AT + 27 NT) ordonnés par position
-- 2. 20 Questions d'exemple représentatives des 3 formats, des modes et thèmes
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SEED DES 66 LIVRES DE LA BIBLE (LSG 1910)
-- ------------------------------------------------------------------------------
INSERT INTO public.books (name, testament, position) VALUES
-- Ancien Testament (39 livres)
('Genèse', 'ancien', 1),
('Exode', 'ancien', 2),
('Lévitique', 'ancien', 3),
('Nombres', 'ancien', 4),
('Deutéronome', 'ancien', 5),
('Josué', 'ancien', 6),
('Juges', 'ancien', 7),
('Ruth', 'ancien', 8),
('1 Samuel', 'ancien', 9),
('2 Samuel', 'ancien', 10),
('1 Rois', 'ancien', 11),
('2 Rois', 'ancien', 12),
('1 Chroniques', 'ancien', 13),
('2 Chroniques', 'ancien', 14),
('Esdras', 'ancien', 15),
('Néhémie', 'ancien', 16),
('Esther', 'ancien', 17),
('Job', 'ancien', 18),
('Psaumes', 'ancien', 19),
('Proverbes', 'ancien', 20),
('Ecclésiaste', 'ancien', 21),
('Cantique des Cantiques', 'ancien', 22),
('Ésaïe', 'ancien', 23),
('Jérémie', 'ancien', 24),
('Lamentations', 'ancien', 25),
('Ézéchiel', 'ancien', 26),
('Daniel', 'ancien', 27),
('Osée', 'ancien', 28),
('Joël', 'ancien', 29),
('Amos', 'ancien', 30),
('Abdias', 'ancien', 31),
('Jonas', 'ancien', 32),
('Michée', 'ancien', 33),
('Nahum', 'ancien', 34),
('Habacuc', 'ancien', 35),
('Sophonie', 'ancien', 36),
('Aggée', 'ancien', 37),
('Zacharie', 'ancien', 38),
('Malachie', 'ancien', 39),

-- Nouveau Testament (27 livres)
('Matthieu', 'nouveau', 40),
('Marc', 'nouveau', 41),
('Luc', 'nouveau', 42),
('Jean', 'nouveau', 43),
('Actes', 'nouveau', 44),
('Romains', 'nouveau', 45),
('1 Corinthiens', 'nouveau', 46),
('2 Corinthiens', 'nouveau', 47),
('Galates', 'nouveau', 48),
('Éphésiens', 'nouveau', 49),
('Philippiens', 'nouveau', 50),
('Colossiens', 'nouveau', 51),
('1 Thessaloniciens', 'nouveau', 52),
('2 Thessaloniciens', 'nouveau', 53),
('1 Timothée', 'nouveau', 54),
('2 Timothée', 'nouveau', 55),
('Tite', 'nouveau', 56),
('Philémon', 'nouveau', 57),
('Hébreux', 'nouveau', 58),
('Jacques', 'nouveau', 59),
('1 Pierre', 'nouveau', 60),
('2 Pierre', 'nouveau', 61),
('1 Jean', 'nouveau', 62),
('2 Jean', 'nouveau', 63),
('3 Jean', 'nouveau', 64),
('Jude', 'nouveau', 65),
('Apocalypse', 'nouveau', 66)
ON CONFLICT (name) DO UPDATE 
SET testament = EXCLUDED.testament,
    position = EXCLUDED.position;

-- ------------------------------------------------------------------------------
-- 2. SEED DES 20 QUESTIONS EXEMPLES (LSG 1910)
-- ------------------------------------------------------------------------------

-- FORMAT 1 : QUESTION_REPONSE (10 questions)

-- 1. Genèse / Entraînement (Diff 1)
INSERT INTO public.questions (book_id, mode, theme, format, question_text, correct_answer, wrong_answers, difficulty, reference_biblique)
VALUES (
    (SELECT id FROM public.books WHERE name = 'Genèse'),
    'entrainement',
    NULL,
    'question_reponse',
    'Selon Genèse 1:1, qu''est-ce que Dieu créa au commencement ?',
    'Les cieux et la terre',
    '["Le soleil et la lune", "Les animaux et les plantes", "La mer et les fleuves"]'::jsonb,
    1,
    'Genèse 1:1'
);

-- 2. 1 Samuel / Match Manche 2 - Thème "rois" (Diff 2)
INSERT INTO public.questions (book_id, mode, theme, format, question_text, correct_answer, wrong_answers, difficulty, reference_biblique)
VALUES (
    (SELECT id FROM public.books WHERE name = '1 Samuel'),
    'match_manche2',
    'rois',
    'question_reponse',
    'Qui fut le premier roi d''Israël à avoir reçu l''onction d''huile du prophète Samuel ?',
    'Saül',
    '["David", "Salomon", "Roboam"]'::jsonb,
    2,
    '1 Samuel 10:1'
);

-- 3. Exode / Match Manche 2 - Thème "montagnes" (Diff 2)
INSERT INTO public.questions (book_id, mode, theme, format, question_text, correct_answer, wrong_answers, difficulty, reference_biblique)
VALUES (
    (SELECT id FROM public.books WHERE name = 'Exode'),
    'match_manche2',
    'montagnes',
    'question_reponse',
    'Sur quelle montagne Moïse est-il monté pour recevoir les deux tables de pierre gravées du doigt de Dieu ?',
    'Le mont Sinaï',
    '["Le mont Nébo", "Le mont Carmel", "Le mont Sion"]'::jsonb,
    2,
    'Exode 19:20'
);

-- 4. 2 Rois / Match Manche 2 - Thème "cours_deau" (Diff 3)
INSERT INTO public.questions (book_id, mode, theme, format, question_text, correct_answer, wrong_answers, difficulty, reference_biblique)
VALUES (
    (SELECT id FROM public.books WHERE name = '2 Rois'),
    'match_manche2',
    'cours_deau',
    'question_reponse',
    'Dans quel cours d''eau Naaman le chef de l''armée syrienne s''est-il lavé sept fois pour être purifié de sa lèpre ?',
    'Le Jourdain',
    '["L''Euphrate", "Le Nil", "Le Chébar"]'::jsonb,
    3,
    '2 Rois 5:14'
);

-- 5. Juges / Match Manche 2 - Thème "prophétesses" (Diff 3)
INSERT INTO public.questions (book_id, mode, theme, format, question_text, correct_answer, wrong_answers, difficulty, reference_biblique)
VALUES (
    (SELECT id FROM public.books WHERE name = 'Juges'),
    'match_manche2',
    'prophétesses',
    'question_reponse',
    'Quelle femme prophétesse et juge en Israël siégeait sous un palmier entre Rama et Béthel ?',
    'Débora',
    '["Houlda", "Anne", "Miriam"]'::jsonb,
    3,
    'Juges 4:4-5'
);

-- 6. 1 Samuel / Match Manche 2 - Thème "armes" (Diff 2)
INSERT INTO public.questions (book_id, mode, theme, format, question_text, correct_answer, wrong_answers, difficulty, reference_biblique)
VALUES (
    (SELECT id FROM public.books WHERE name = '1 Samuel'),
    'match_manche2',
    'armes',
    'question_reponse',
    'Quelle arme David a-t-il utilisée pour terrasser le géant Goliath au front ?',
    'Une fronde et une pierre',
    '["Un arc et une flèche", "Une lance en airain", "Un javelot de bronze"]'::jsonb,
    2,
    '1 Samuel 17:49-50'
);

-- 7. Matthieu / Match Manche 1 (Diff 1)
INSERT INTO public.questions (book_id, mode, theme, format, question_text, correct_answer, wrong_answers, difficulty, reference_biblique)
VALUES (
    (SELECT id FROM public.books WHERE name = 'Matthieu'),
    'match_manche1',
    NULL,
    'question_reponse',
    'Dans quelle ville de Judée Jésus est-il né aux jours du roi Hérode ?',
    'Bethléhem',
    '["Nazareth", "Jérusalem", "Capernaüm"]'::jsonb,
    1,
    'Matthieu 2:1'
);

-- 8. Josué / Match Manche 2 - Thème "villes" (Diff 2)
INSERT INTO public.questions (book_id, mode, theme, format, question_text, correct_answer, wrong_answers, difficulty, reference_biblique)
VALUES (
    (SELECT id FROM public.books WHERE name = 'Josué'),
    'match_manche2',
    'villes',
    'question_reponse',
    'Quelle ville fortifiée vit ses murailles s''écrouler après que le peuple d''Israël en eut fait le tour pendant 7 jours ?',
    'Jéricho',
    '["Aï", "Gabaon", "Sichem"]'::jsonb,
    2,
    'Josué 6:20'
);

-- 9. Actes / Match Manche 3 (Diff 3)
INSERT INTO public.questions (book_id, mode, theme, format, question_text, correct_answer, wrong_answers, difficulty, reference_biblique)
VALUES (
    (SELECT id FROM public.books WHERE name = 'Actes'),
    'match_manche3',
    NULL,
    'question_reponse',
    'Sur le chemin de quelle ville Saul de Tarse fut-il enveloppé d''une vive lumière avant d''entendre la voix du Seigneur ?',
    'Damas',
    '["Antioche", "Éphèse", "Césarée"]'::jsonb,
    3,
    'Actes 9:3-4'
);

-- 10. Apocalypse / Match Manche 3 (Diff 4)
INSERT INTO public.questions (book_id, mode, theme, format, question_text, correct_answer, wrong_answers, difficulty, reference_biblique)
VALUES (
    (SELECT id FROM public.books WHERE name = 'Apocalypse'),
    'match_manche3',
    NULL,
    'question_reponse',
    'À combien d''Églises situées dans la province d''Asie Jean doit-il écrire dans le livre de l''Apocalypse ?',
    '7',
    '["12", "10", "4"]'::jsonb,
    4,
    'Apocalypse 1:4'
);

-- FORMAT 2 : TEXTE_A_TROUS (5 questions)

-- 11. Jean / Entraînement (Diff 1)
INSERT INTO public.questions (book_id, mode, theme, format, question_text, correct_answer, wrong_answers, difficulty, reference_biblique)
VALUES (
    (SELECT id FROM public.books WHERE name = 'Jean'),
    'entrainement',
    NULL,
    'texte_a_trous',
    'Car Dieu a tant aimé le monde qu''il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu''il ait la vie _____.',
    'éternelle',
    '["abondante", "paisible", "terrestre"]'::jsonb,
    1,
    'Jean 3:16'
);

-- 12. Psaumes / Entraînement (Diff 1)
INSERT INTO public.questions (book_id, mode, theme, format, question_text, correct_answer, wrong_answers, difficulty, reference_biblique)
VALUES (
    (SELECT id FROM public.books WHERE name = 'Psaumes'),
    'entrainement',
    NULL,
    'texte_a_trous',
    'L''Éternel est mon _____: je ne manquerai de rien.',
    'berger',
    '["bouclier", "roi", "rocher"]'::jsonb,
    1,
    'Psaumes 23:1'
);

-- 13. Proverbes / Match Manche 1 (Diff 2)
INSERT INTO public.questions (book_id, mode, theme, format, question_text, correct_answer, wrong_answers, difficulty, reference_biblique)
VALUES (
    (SELECT id FROM public.books WHERE name = 'Proverbes'),
    'match_manche1',
    NULL,
    'texte_a_trous',
    'Le commencement de la sagesse, c''est la crainte de _____.',
    'l''Éternel',
    '["la loi", "l''inconnu", "l''autorité"]'::jsonb,
    2,
    'Proverbes 9:10'
);

-- 14. Romains / Match Manche 3 (Diff 3)
INSERT INTO public.questions (book_id, mode, theme, format, question_text, correct_answer, wrong_answers, difficulty, reference_biblique)
VALUES (
    (SELECT id FROM public.books WHERE name = 'Romains'),
    'match_manche3',
    NULL,
    'texte_a_trous',
    'Car le salaire du péché, c''est la mort; mais le don gratuit de Dieu, c''est la vie éternelle en _____ notre Seigneur.',
    'Jésus-Christ',
    '["l''Esprit", "la grâce", "la prière"]'::jsonb,
    3,
    'Romains 6:23'
);

-- 15. Philippiens / Entraînement (Diff 2)
INSERT INTO public.questions (book_id, mode, theme, format, question_text, correct_answer, wrong_answers, difficulty, reference_biblique)
VALUES (
    (SELECT id FROM public.books WHERE name = 'Philippiens'),
    'entrainement',
    NULL,
    'texte_a_trous',
    'Je puis tout par celui qui me _____.',
    'fortifie',
    '["guide", "pardonne", "délivre"]'::jsonb,
    2,
    'Philippiens 4:13'
);

-- FORMAT 3 : VRAI_FAUX (5 questions, wrong_answers vide '[]'::jsonb)

-- 16. Genèse / Entraînement (Diff 1)
INSERT INTO public.questions (book_id, mode, theme, format, question_text, correct_answer, wrong_answers, difficulty, reference_biblique)
VALUES (
    (SELECT id FROM public.books WHERE name = 'Genèse'),
    'entrainement',
    NULL,
    'vrai_faux',
    'Selon Genèse 5:32, les trois fils de Noé se nommaient Sem, Cham et Japhet.',
    'Vrai',
    '[]'::jsonb,
    1,
    'Genèse 5:32'
);

-- 17. Matthieu / Match Manche 1 (Diff 1)
INSERT INTO public.questions (book_id, mode, theme, format, question_text, correct_answer, wrong_answers, difficulty, reference_biblique)
VALUES (
    (SELECT id FROM public.books WHERE name = 'Matthieu'),
    'match_manche1',
    NULL,
    'vrai_faux',
    'Selon Matthieu 4:2, Jésus a jeûné quarante jours et quarante nuits dans le désert avant d''être tenté.',
    'Vrai',
    '[]'::jsonb,
    1,
    'Matthieu 4:2'
);

-- 18. Genèse / Match Manche 2 - Thème "peres" (Diff 2)
INSERT INTO public.questions (book_id, mode, theme, format, question_text, correct_answer, wrong_answers, difficulty, reference_biblique)
VALUES (
    (SELECT id FROM public.books WHERE name = 'Genèse'),
    'match_manche2',
    'peres',
    'vrai_faux',
    'Isaac était le père direct de Moïse et d''Aaron.',
    'Faux',
    '[]'::jsonb,
    2,
    'Exode 6:20'
);

-- 19. Jonas / Entraînement (Diff 2)
INSERT INTO public.questions (book_id, mode, theme, format, question_text, correct_answer, wrong_answers, difficulty, reference_biblique)
VALUES (
    (SELECT id FROM public.books WHERE name = 'Jonas'),
    'entrainement',
    NULL,
    'vrai_faux',
    'Le prophète Jonas s''est immédiatement rendu à Ninive dès le premier ordre de l''Éternel sans chercher à fuir à Tarsis.',
    'Faux',
    '[]'::jsonb,
    2,
    'Jonas 1:1-3'
);

-- 20. 1 Rois / Match Manche 2 - Thème "rois" (Diff 2)
INSERT INTO public.questions (book_id, mode, theme, format, question_text, correct_answer, wrong_answers, difficulty, reference_biblique)
VALUES (
    (SELECT id FROM public.books WHERE name = '1 Rois'),
    'match_manche2',
    'rois',
    'vrai_faux',
    'À Gabaon, le roi Salomon a demandé à Dieu une longue vie et les richesses de ses ennemis plutôt qu''un cœur intelligent pour juger son peuple.',
    'Faux',
    '[]'::jsonb,
    2,
    '1 Rois 3:9-11'
);
