// Auslastungs-Analyse: Wie voll ist ein Tag im Verhältnis zur persönlichen Kapazität?
import { predict, type CyclePhase } from '@/lib/cycle';
import { today } from '@/lib/date';
import type { AppState } from '@/store/useStore';
import type { ISODate } from '@/types';

export type DayLoad = {
  points: number;
  capacity: number;
  level: 0 | 1 | 2 | 3; // frei, gut gefüllt, voll, zu viel
  label: string;
  events: number;
  todos: number;
  phase?: CyclePhase;
  warning?: string;
};

// Kosten pro Termin-Kategorie; was gut tut, kostet weniger
const CATEGORY_COST: Record<string, number> = { arbeit: 2, arzt: 2, familie: 1.5, freunde: 1.5, sport: 1, selbst: 0.5, sonstiges: 1.5 };

export const dayLoad = (s: Pick<AppState, 'events' | 'todos' | 'cycle' | 'profile' | 'settings' | 'habits'>, date: ISODate): DayLoad => {
  const events = s.events.filter((e) => e.date === date);
  const todos = s.todos.filter((t) => !t.done && t.due === date);
  const good = s.profile.goodFor.join(' ').toLowerCase();
  let points = 0;
  for (const e of events) {
    let c = CATEGORY_COST[e.category] ?? 1.5;
    if ((e.category === 'freunde' && good.includes('freund')) || (e.category === 'familie' && good.includes('famil')) || (e.category === 'sport' && good.includes('sport'))) c -= 0.5;
    points += c;
  }
  points += todos.reduce((sum, t) => sum + t.energy * 0.6, 0);
  points += s.habits.filter((h) => !h.archived).length * 0.2;

  let capacity = 10;
  let phase: CyclePhase | undefined;
  if (s.settings.modules.zyklus) {
    const p = predict(s.cycle, date);
    if (p) {
      phase = p.phase;
      if (p.phase === 'menstruation') capacity = 8;
      if (p.phase === 'luteal' && p.daysToPeriod <= 5) capacity = 8;
      if (p.phase === 'follikel' || p.phase === 'ovulation') capacity = 11;
    }
  }
  const tooManyEvents = events.length > s.profile.maxEventsPerDay;
  const ratio = points / capacity;
  const level: DayLoad['level'] = ratio > 1 || tooManyEvents ? 3 : ratio > 0.75 ? 2 : ratio > 0.35 ? 1 : 0;
  const label = ['Viel Luft', 'Gut gefüllt', 'Voll', 'Zu viel'][level];
  let warning: string | undefined;
  if (level >= 2 && phase && capacity < 10) {
    warning = `Viel los in der ${phase === 'menstruation' ? 'Periode' : 'späten Lutealphase'} – deine Energie ist dann oft niedriger. Etwas verschieben?`;
  } else if (tooManyEvents) {
    warning = `Mehr als ${s.profile.maxEventsPerDay} Termine – das hast du als „tut mir nicht gut“ markiert.`;
  }
  return { points: Math.round(points * 10) / 10, capacity, level, label, events: events.length, todos: todos.length, phase, warning };
};

export const todayLoad = (s: Parameters<typeof dayLoad>[0]) => dayLoad(s, today());

export const LOAD_COLORS = ['transparent', '#EDE7FB', '#FFE1C7', '#FFB794'];
