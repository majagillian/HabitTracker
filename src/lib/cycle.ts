// Zyklus-Berechnungen: Statistik, Prognosen, Phasen, PMS, mögliche Schwangerschaft
// Hinweis: Schätzungen – keine Verhütungsmethode und keine Diagnose.
import { addDays, diffDays, today } from '@/lib/date';
import type { CycleData, ISODate } from '@/types';

export type CyclePhase = 'menstruation' | 'follikel' | 'ovulation' | 'luteal';

export const PHASE_INFO: Record<CyclePhase, { name: string; color: string; energy: string; tip: string; training: string }> = {
  menstruation: { name: 'Menstruation', color: '#E11D48', energy: 'Oft niedrigere Energie', tip: 'Wärme, Ruhe und Eisen-reiches Essen tun gut.', training: 'Sanft: Yin Yoga, Spaziergang, Rückenschule' },
  follikel: { name: 'Follikelphase', color: '#0D9488', energy: 'Energie steigt', tip: 'Gute Zeit für Neues, Planung und Kontakte.', training: 'Kraft und Intervalle werden oft gut vertragen' },
  ovulation: { name: 'Eisprung-Phase', color: '#2563EB', energy: 'Häufig Energie-Hoch', tip: 'Gesprächig, sozial, leistungsfähig.', training: 'Intensive Einheiten möglich – gut aufwärmen' },
  luteal: { name: 'Lutealphase', color: '#7C3AED', energy: 'Energie sinkt zum Ende hin', tip: 'Puffer einplanen, regelmäßig essen, früh schlafen.', training: 'Moderat: Yoga-Flow, Pilates, lockeres Ausdauertraining' },
};

export type CycleStats = { avgCycle: number; avgPeriod: number; cycles: number[]; variability: number; basedOn: number };

// Durchschnittliche Zyklus- und Periodenlänge aus den letzten (max. 6) Zyklen
export const cycleStats = (c: CycleData): CycleStats => {
  const starts = c.periods.map((p) => p.start).sort();
  const cycles: number[] = [];
  for (let i = 1; i < starts.length; i++) {
    const len = diffDays(starts[i], starts[i - 1]);
    if (len >= 18 && len <= 60) cycles.push(len); // Ausreißer ignorieren
  }
  const recent = cycles.slice(-6);
  const avgCycle = recent.length ? Math.round(recent.reduce((a, b) => a + b, 0) / recent.length) : c.avgCycleLen;
  const lens = c.periods.filter((p) => p.end).map((p) => diffDays(p.end!, p.start) + 1).filter((l) => l > 0 && l < 12).slice(-6);
  const avgPeriod = lens.length ? Math.round(lens.reduce((a, b) => a + b, 0) / lens.length) : c.avgPeriodLen;
  const variability = recent.length > 1 ? Math.max(...recent) - Math.min(...recent) : 0;
  return { avgCycle, avgPeriod, cycles, variability, basedOn: recent.length };
};

export const lastPeriodStart = (c: CycleData): ISODate | undefined => c.periods.map((p) => p.start).sort().at(-1);

export type Prediction = {
  cycleDay: number;
  phase: CyclePhase;
  nextPeriod: ISODate;
  ovulation: ISODate;
  fertileStart: ISODate;
  fertileEnd: ISODate;
  daysToPeriod: number;
  late: number; // Tage überfällig
  pmsStart: ISODate;
  pmsActive: boolean;
  pmsSoon: boolean;
};

export const predict = (c: CycleData, on: ISODate = today()): Prediction | null => {
  const last = lastPeriodStart(c);
  if (!last) return null;
  const { avgCycle, avgPeriod } = cycleStats(c);
  let start = last;
  // Für Tage in der Zukunft: Zyklen weiterrechnen
  while (diffDays(on, start) >= avgCycle && on > today()) start = addDays(start, avgCycle);
  const cycleDay = diffDays(on, start) + 1;
  const nextPeriod = addDays(start, avgCycle);
  const ovulation = addDays(nextPeriod, -14); // Lutealphase ist relativ konstant (~14 Tage)
  const fertileStart = addDays(ovulation, -5);
  const fertileEnd = addDays(ovulation, 1);
  let phase: CyclePhase = 'luteal';
  if (cycleDay <= avgPeriod) phase = 'menstruation';
  else if (on < addDays(ovulation, -1)) phase = 'follikel';
  else if (on <= addDays(ovulation, 1)) phase = 'ovulation';
  const late = Math.max(0, diffDays(on, nextPeriod));
  const pmsOffset = pmsDays(c);
  const pmsStart = addDays(nextPeriod, -pmsOffset);
  return {
    cycleDay,
    phase,
    nextPeriod,
    ovulation,
    fertileStart,
    fertileEnd,
    daysToPeriod: diffDays(nextPeriod, on),
    late,
    pmsStart,
    pmsActive: on >= pmsStart && on < nextPeriod,
    pmsSoon: diffDays(pmsStart, on) === 1,
  };
};

export const PMS_SYMPTOMS = ['Reizbar', 'Traurig', 'Ängstlich', 'Heißhunger', 'Brustspannen', 'Blähbauch', 'Kopfweh', 'Müde', 'Unreine Haut', 'Schlecht geschlafen'];

// Typischer PMS-Beginn: wie viele Tage vor der Periode traten PMS-Symptome zuerst auf? (Median, Standard 5)
export const pmsDays = (c: CycleData): number => {
  const starts = c.periods.map((p) => p.start).sort();
  const offsets: number[] = [];
  for (const s of starts.slice(-6)) {
    for (let d = 10; d >= 1; d--) {
      const log = c.logs[addDays(s, -d)];
      if (log?.symptoms.some((x) => PMS_SYMPTOMS.includes(x))) {
        offsets.push(d);
        break;
      }
    }
  }
  if (!offsets.length) return 5;
  offsets.sort((a, b) => a - b);
  return offsets[Math.floor(offsets.length / 2)];
};

// Häufigste PMS-Beschwerden aus vergangenen Zyklen
export const typicalPmsSymptoms = (c: CycleData): string[] => {
  const count: Record<string, number> = {};
  for (const s of c.periods.map((p) => p.start)) {
    for (let d = 1; d <= 7; d++) {
      for (const sym of c.logs[addDays(s, -d)]?.symptoms ?? []) if (PMS_SYMPTOMS.includes(sym)) count[sym] = (count[sym] ?? 0) + 1;
    }
  }
  return Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);
};

// Hinweis auf mögliche Schwangerschaft: ungeschützter Sex im fruchtbaren Fenster + Periode überfällig
export const pregnancyHint = (c: CycleData, on: ISODate = today()): { level: 'keiner' | 'moeglich' | 'test'; text: string } => {
  const p = predict(c, on);
  if (!p) return { level: 'keiner', text: '' };
  const last = lastPeriodStart(c)!;
  const unprotected = Object.entries(c.logs).some(([d, l]) => d >= last && l.sex === 'unverhuetet' && d >= p.fertileStart && d <= p.fertileEnd);
  const positive = Object.entries(c.logs).some(([d, l]) => d >= last && l.test === 'positiv');
  if (positive) return { level: 'test', text: 'Du hast einen positiven Test eingetragen. Bitte lass das ärztlich bestätigen.' };
  if (unprotected && p.late >= 3) return { level: 'test', text: `Deine Periode ist ${p.late} Tage überfällig und es gab ungeschützten Sex in den fruchtbaren Tagen. Ein Schwangerschaftstest gibt Klarheit.` };
  if (unprotected) return { level: 'moeglich', text: `Ungeschützter Sex in den wahrscheinlich fruchtbaren Tagen. Ein Test ist ab dem ${p.nextPeriod.split('-').reverse().join('.')} aussagekräftig.` };
  return { level: 'keiner', text: '' };
};

// Hormonelle Verhütung mit Pause: Ist heute ein Pausentag? (Blister-Rhythmus 21+7 o. ä.)
export const isPillBreak = (c: CycleData, on: ISODate = today()): boolean => {
  if (!c.hormonalBreak.enabled || !c.hormonalBreak.startDate) return false;
  const cycleLen = 21 + c.hormonalBreak.days;
  const d = ((diffDays(on, c.hormonalBreak.startDate) % cycleLen) + cycleLen) % cycleLen;
  return d < c.hormonalBreak.days;
};

export const SYMPTOMS = ['Krämpfe', 'Kopfweh', 'Rückenschmerzen', 'Müde', 'Reizbar', 'Traurig', 'Ängstlich', 'Heißhunger', 'Brustspannen', 'Blähbauch', 'Übelkeit', 'Unreine Haut', 'Schlecht geschlafen', 'Viel Energie', 'Libido hoch', 'Ausfluss klar'];
