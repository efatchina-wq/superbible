/**
 * Système d'animation de célébration (Confettis & Étoiles) style Duolingo
 * Module: /lib/confetti.ts
 */

import confetti from 'canvas-confetti';
import { playFanfareSound } from '@/lib/soundEffects';

/**
 * Déclenche une explosion de confettis joyeux aux couleurs de l'application
 */
export function triggerCelebration(options?: { withSound?: boolean; durationMs?: number }) {
  if (options?.withSound !== false) {
    playFanfareSound();
  }

  // Couleurs Duolingo SuperQuizz : Vert émeraude, Jaune or, Bleu ciel, Corail, Violet
  const duoColors = ['#58CC02', '#FFC800', '#1CB0F6', '#FF4B4B', '#CE82FF', '#FF9600'];

  // 1ère vague : pop central
  confetti({
    particleCount: 70,
    spread: 70,
    origin: { y: 0.6 },
    colors: duoColors,
    ticks: 200,
    gravity: 1.1,
    scalar: 1.1,
  });

  // 2ème vague : tirs latéraux gauche et droite
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0.1, y: 0.65 },
      colors: duoColors,
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 0.9, y: 0.65 },
      colors: duoColors,
    });
  }, 250);

  // 3ème vague : étoiles dorées si grand succès
  setTimeout(() => {
    confetti({
      particleCount: 35,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#FFC800', '#FFE27A', '#FF9600'],
      shapes: ['star'],
      scalar: 1.25,
    });
  }, 500);
}
