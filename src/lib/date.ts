// Datums-Hilfsfunktionen (lokale Zeit, Format JJJJ-MM-TT)
import type { ISODate } from '@/types';

const pad = (n: number) => String(n).padStart(2, '0');

export const toISO = (d: Date): ISODate => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const today = (): ISODate => toISO(new Date());

export const parseISO = (s: ISODate): Date => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (s: ISODate, n: number): ISODate => {
  const d = parseISO(s);
  d.setDate(d.getDate() + n);
  return toISO(d);
};

export const diffDays = (a: ISODate, b: ISODate): number =>
  Math.round((parseISO(a).getTime() - parseISO(b).getTime()) / 86400000);

// Wochentag 1 = Montag … 7 = Sonntag
export const weekday = (s: ISODate): number => {
  const w = parseISO(s).getDay();
  return w === 0 ? 7 : w;
};

export const startOfWeek = (s: ISODate): ISODate => addDays(s, 1 - weekday(s));

export const monthMatrix = (year: number, month: number): (ISODate | null)[] => {
  // Kalenderraster ab Montag, leere Felder = null
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (ISODate | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= days; d++) cells.push(toISO(new Date(year, month, d)));
  while (cells.length % 7) cells.push(null);
  return cells;
};

export const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
export const WEEKDAYS_SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
export const WEEKDAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

export const formatLong = (s: ISODate): string => {
  const d = parseISO(s);
  return `${WEEKDAYS[weekday(s) - 1]}, ${d.getDate()}. ${MONTHS[d.getMonth()]}`;
};

export const formatShort = (s: ISODate): string => {
  const d = parseISO(s);
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.`;
};

export const relativeLabel = (s: ISODate): string => {
  const n = diffDays(s, today());
  if (n === 0) return 'Heute';
  if (n === 1) return 'Morgen';
  if (n === -1) return 'Gestern';
  if (n < 0) return `vor ${-n} Tagen`;
  if (n < 7) return WEEKDAYS[weekday(s) - 1];
  return formatShort(s);
};

export const nowTime = (): string => {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const timeToMinutes = (t: string): number => {
  const [h, m] = t.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

export const isValidISO = (s: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(parseISO(s).getTime());
export const isValidTime = (s: string): boolean => /^([01]\d|2[0-3]):[0-5]\d$/.test(s);

export const greeting = (): string => {
  const h = new Date().getHours();
  if (h < 11) return 'Guten Morgen';
  if (h < 17) return 'Hallo';
  return 'Guten Abend';
};
