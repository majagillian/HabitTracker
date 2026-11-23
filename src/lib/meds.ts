// Medikamentenplan: fällige Einnahmen, Einnahmetreue, Vorrat
import { addDays, diffDays, today, weekday } from '@/lib/date';
import type { ISODate, MedLog, Medication } from '@/types';

export const medKey = (medId: string, date: ISODate, time: string) => `${medId}|${date}|${time}`;

// Ist das Medikament an diesem Tag fällig?
export const isDueOn = (m: Medication, date: ISODate) => {
  if (!m.active || date < m.start || (m.end && date > m.end)) return false;
  if (m.everyNDays && m.everyNDays > 1) return diffDays(date, m.start) % m.everyNDays === 0;
  return m.days.length === 0 || m.days.includes(weekday(date));
};

export type Dose = { med: Medication; time: string; key: string; status?: 'genommen' | 'ausgelassen' };

export const dosesOn = (meds: Medication[], log: MedLog, date: ISODate): Dose[] =>
  meds
    .filter((m) => isDueOn(m, date))
    .flatMap((m) => m.times.map((t) => ({ med: m, time: t, key: medKey(m.id, date, t), status: log[medKey(m.id, date, t)] })))
    .sort((a, b) => (a.time < b.time ? -1 : 1));

// Einnahmetreue der letzten n Tage (nur vergangene Einnahmen)
export const adherence = (meds: Medication[], log: MedLog, days = 14) => {
  let due = 0, taken = 0;
  for (let i = 1; i <= days; i++) {
    for (const d of dosesOn(meds, log, addDays(today(), -i))) {
      due++;
      if (d.status === 'genommen') taken++;
    }
  }
  return due ? Math.round((taken / due) * 100) : null;
};

// Wie viele Tage reicht der Vorrat noch?
export const daysLeft = (m: Medication): number | null => {
  if (m.stock === undefined) return null;
  const perDay = (m.times.length * m.perDose * (m.everyNDays ? 1 / m.everyNDays : m.days.length ? m.days.length / 7 : 1)) || 1;
  return Math.floor(m.stock / perDay);
};

export const WITH_FOOD = { egal: 'unabhängig vom Essen', vorher: 'vor dem Essen', zum: 'zum Essen', nachher: 'nach dem Essen' } as const;
