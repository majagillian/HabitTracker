// Gewohnheiten: Serien, Erfüllungsquote, „Etabliert“-Fortschritt
// Grundlage: Lally et al. (2010) – Automatisierung dauerte im Mittel 66 Tage (Spanne 18–254).
import { addDays, diffDays, startOfWeek, today } from '@/lib/date';
import type { Habit, ISODate } from '@/types';

export const HABIT_DAYS = 66;

const doneOrPaused = (h: Habit, d: ISODate) => h.log.includes(d) || h.pauses.includes(d);

// Aktuelle Serie in Tagen (täglich) bzw. Wochen (x-mal pro Woche)
export const streak = (h: Habit): { value: number; unit: 'Tage' | 'Wochen' } => {
  const t = today();
  if (h.timesPerWeek >= 7) {
    let d = doneOrPaused(h, t) ? t : addDays(t, -1);
    let n = 0;
    while (doneOrPaused(h, d) && d >= h.startDate) {
      n++;
      d = addDays(d, -1);
    }
    return { value: n, unit: 'Tage' };
  }
  // Wochenziel: aktuelle Woche zählt mit, wenn erreicht
  let wk = startOfWeek(t);
  let n = 0;
  const countWeek = (start: ISODate) => Array.from({ length: 7 }, (_, i) => addDays(start, i)).filter((d) => doneOrPaused(h, d)).length;
  if (countWeek(wk) >= h.timesPerWeek) n++;
  wk = addDays(wk, -7);
  while (wk >= startOfWeek(h.startDate) && countWeek(wk) >= h.timesPerWeek) {
    n++;
    wk = addDays(wk, -7);
  }
  return { value: n, unit: 'Wochen' };
};

// Erfüllungsquote der letzten 30 Tage (bezogen auf das Ziel)
export const completionRate = (h: Habit, days = 30): number => {
  const span = Math.min(days, diffDays(today(), h.startDate) + 1);
  if (span <= 0) return 0;
  const from = addDays(today(), -(span - 1));
  const done = h.log.filter((d) => d >= from).length + h.pauses.filter((d) => d >= from).length;
  const target = (span * h.timesPerWeek) / 7;
  return Math.min(1, done / Math.max(1, target));
};

// Fortschritt Richtung „etabliert“ (0–100): Zeit seit Start × Regelmäßigkeit
export const establishment = (h: Habit): number => {
  const age = diffDays(today(), h.startDate) + 1;
  const timePart = Math.min(1, age / HABIT_DAYS);
  return Math.round(timePart * (0.4 + 0.6 * completionRate(h)) * 100);
};

export const lastDays = (h: Habit, n = 14) =>
  Array.from({ length: n }, (_, i) => addDays(today(), i - (n - 1))).map((d) => ({ date: d, done: h.log.includes(d), paused: h.pauses.includes(d) }));

// Motivierende Meilensteine
export const MILESTONES = [3, 7, 14, 21, 30, 50, 66, 100];
export const nextMilestone = (n: number) => MILESTONES.find((m) => m > n) ?? n + 50;

export const motivation = (h: Habit): string => {
  const s = streak(h).value;
  const e = establishment(h);
  if (e >= 100) return 'Geschafft – diese Gewohnheit gehört jetzt zu dir!';
  if (s === 0) return 'Jeder Tag ist ein neuer Anfang. Ein kleiner Schritt reicht.';
  if (s < 3) return 'Du bist losgelaufen – bleib dran!';
  if (s < 7) return `Noch ${nextMilestone(s) - s} bis zum nächsten Meilenstein.`;
  if (e > 60) return 'Die Gewohnheit wird gerade automatisch – fast geschafft.';
  return 'Starke Serie! Dein Gehirn baut neue Bahnen.';
};
