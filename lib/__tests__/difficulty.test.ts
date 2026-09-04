/**
 * Tests unitaires pour la formule progressive de SuperQuizz Biblique
 */

import { calculerNouvelleDifficulte } from '../trainingEngine';

export function runDifficultyFormulaTests(): { passed: boolean; results: string[] } {
  const logs: string[] = [];
  let allPass = true;

  function assertEqual(actual: number, expected: number, description: string) {
    if (actual === expected) {
      logs.push(`✅ PASS: ${description} => ${actual}`);
    } else {
      logs.push(`❌ FAIL: ${description} => attendu: ${expected}, obtenu: ${actual}`);
      allPass = false;
    }
  }

  // 1. Tests Score 9-10 (N + 2, max 5)
  assertEqual(calculerNouvelleDifficulte(10, 1, 8000, 10000), 3, 'Score 10/10 à N=1 -> N=3 (+2)');
  assertEqual(calculerNouvelleDifficulte(9, 3, 8000, 10000), 5, 'Score 9/10 à N=3 -> N=5 (+2)');
  assertEqual(calculerNouvelleDifficulte(9, 4, 8000, 10000), 5, 'Score 9/10 à N=4 -> N=5 (plafond 5)');
  assertEqual(calculerNouvelleDifficulte(10, 5, 8000, 10000), 5, 'Score 10/10 à N=5 -> N=5 (plafond 5)');

  // 2. Tests Score 7-8 (N + 1, max 5)
  assertEqual(calculerNouvelleDifficulte(8, 1, 8000, 10000), 2, 'Score 8/10 à N=1 -> N=2 (+1)');
  assertEqual(calculerNouvelleDifficulte(7, 3, 8000, 10000), 4, 'Score 7/10 à N=3 -> N=4 (+1)');
  assertEqual(calculerNouvelleDifficulte(7, 5, 8000, 10000), 5, 'Score 7/10 à N=5 -> N=5 (plafond 5)');

  // 3. Tests Score 4-6 (N inchangé)
  assertEqual(calculerNouvelleDifficulte(6, 3, 8000, 10000), 3, 'Score 6/10 à N=3 -> N=3');
  assertEqual(calculerNouvelleDifficulte(5, 1, 8000, 10000), 1, 'Score 5/10 à N=1 -> N=1');
  assertEqual(calculerNouvelleDifficulte(4, 5, 8000, 10000), 5, 'Score 4/10 à N=5 -> N=5');

  // 4. Tests Score 2-3 (N - 1, min 1)
  assertEqual(calculerNouvelleDifficulte(3, 4, 8000, 10000), 3, 'Score 3/10 à N=4 -> N=3 (-1)');
  assertEqual(calculerNouvelleDifficulte(2, 2, 8000, 10000), 1, 'Score 2/10 à N=2 -> N=1 (-1)');
  assertEqual(calculerNouvelleDifficulte(2, 1, 8000, 10000), 1, 'Score 2/10 à N=1 -> N=1 (plancher 1)');

  // 5. Tests Score 0-1 (N - 2, min 1)
  assertEqual(calculerNouvelleDifficulte(1, 4, 8000, 10000), 2, 'Score 1/10 à N=4 -> N=2 (-2)');
  assertEqual(calculerNouvelleDifficulte(0, 2, 8000, 10000), 1, 'Score 0/10 à N=2 -> N=1 (plancher 1)');
  assertEqual(calculerNouvelleDifficulte(0, 1, 8000, 10000), 1, 'Score 0/10 à N=1 -> N=1 (plancher 1)');

  // 6. Tests Bonus de rapidité (< 60% du temps historique ET score in [7, 10])
  // Exemple : temps = 5000ms < 0.6 * 10000ms (= 6000ms)
  // Score 7 à N=1 : base 1+1=2, avec bonus rapidité -> 3
  assertEqual(calculerNouvelleDifficulte(7, 1, 4500, 10000), 3, 'Score 7 + rapidité à N=1 -> N=3 (+1 base +1 bonus)');
  // Score 9 à N=2 : base 2+2=4, avec bonus rapidité -> 5
  assertEqual(calculerNouvelleDifficulte(9, 2, 5000, 10000), 5, 'Score 9 + rapidité à N=2 -> N=5 (+2 base +1 bonus)');
  // Score 8 à N=4 : base 4+1=5, avec bonus rapidité -> 5 (plafonné à 5)
  assertEqual(calculerNouvelleDifficulte(8, 4, 4000, 10000), 5, 'Score 8 + rapidité à N=4 -> N=5 (plafonné)');
  // Score 5 (<7) : même si très rapide, PAS de bonus
  assertEqual(calculerNouvelleDifficulte(5, 3, 2000, 10000), 3, 'Score 5 + rapide -> N=3 (pas de bonus car score < 7)');

  return { passed: allPass, results: logs };
}
