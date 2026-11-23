// Konsolidierte Auswertung: Welche Lebensbereiche beeinflussen sich gegenseitig?
// Vergleicht Durchschnittswerte aus Check-ins an Tagen mit/ohne bestimmte Faktoren.
import { predict } from '@/lib/cycle';
import { addDays, today } from '@/lib/date';
import { dayLoad } from '@/lib/load';
import type { AppState } from '@/store/useStore';
import type { CheckIn, ISODate } from '@/types';

export type Insight = { title: string; text: string; tone: 'gut' | 'achtung' | 'info'; strength: number };

const f1 = (n: number) => n.toFixed(1).replace('.', ',');
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN);

// Pro Tag den Durchschnitt aller Check-ins
export const dailyCheckins = (checkins: CheckIn[]) => {
  const map: Record<ISODate, { mood: number; energy: number; noise: number; sleep: number; n: number; good: string[] }> = {};
  for (const c of checkins) {
    const d = (map[c.date] ??= { mood: 0, energy: 0, noise: 0, sleep: 0, n: 0, good: [] });
    d.mood += c.mood;
    d.energy += c.energy;
    d.noise += c.noise;
    d.sleep += c.sleep;
    d.n++;
    d.good.push(...c.good);
  }
  for (const k of Object.keys(map)) {
    const d = map[k];
    d.mood /= d.n;
    d.energy /= d.n;
    d.noise /= d.n;
    d.sleep /= d.n;
  }
  return map;
};

// Vergleich zweier Gruppen; Mindestens 3 Tage je Gruppe, sonst kein Ergebnis
const compare = (days: ISODate[], test: (d: ISODate) => boolean, value: (d: ISODate) => number) => {
  const a: number[] = [], b: number[] = [];
  for (const d of days) (test(d) ? a : b).push(value(d));
  if (a.length < 3 || b.length < 3) return null;
  return { diff: avg(a) - avg(b), nA: a.length, nB: b.length };
};

export const buildInsights = (s: AppState): Insight[] => {
  const daily = dailyCheckins(s.checkins);
  const days = Object.keys(daily).sort();
  const out: Insight[] = [];
  const mood = (d: ISODate) => daily[d].mood;
  const energy = (d: ISODate) => daily[d].energy;

  // Bewegung → Stimmung
  const sportDays = new Set([...s.sessions.map((x) => x.date), ...s.events.filter((e) => e.category === 'sport').map((e) => e.date)]);
  const r1 = compare(days, (d) => sportDays.has(d), mood);
  if (r1 && Math.abs(r1.diff) >= 0.3)
    out.push({ title: r1.diff > 0 ? 'Bewegung hebt deine Stimmung' : 'Sport-Tage sind für dich anstrengend', text: `An Tagen mit Sport war deine Stimmung im Schnitt um ${f1(Math.abs(r1.diff))} Stufen ${r1.diff > 0 ? 'besser' : 'niedriger'}.`, tone: r1.diff > 0 ? 'gut' : 'achtung', strength: Math.abs(r1.diff) });

  // Volle Tage → Energie am Folgetag
  const r2 = compare(days, (d) => s.events.filter((e) => e.date === addDays(d, -1)).length > s.profile.maxEventsPerDay - 1, energy);
  if (r2 && r2.diff <= -0.3)
    out.push({ title: 'Volle Tage kosten dich Energie', text: `Nach Tagen mit ${s.profile.maxEventsPerDay} oder mehr Terminen lag deine Energie am Folgetag um ${f1(Math.abs(r2.diff))} Stufen niedriger.`, tone: 'achtung', strength: Math.abs(r2.diff) });

  // Schlaf → Stimmung
  const r3 = compare(days, (d) => daily[d].sleep >= 3, mood);
  if (r3 && r3.diff >= 0.3)
    out.push({ title: 'Guter Schlaf, gute Laune', text: `Nach mindestens 7 Stunden Schlaf war deine Stimmung um ${f1(r3.diff)} Stufen besser.`, tone: 'gut', strength: r3.diff });

  // Bildschirmzeit → Stimmung
  const r4 = compare(days, (d) => (s.screenTime[d] ?? 0) > s.settings.screenTimeLimitMin, mood);
  if (r4 && r4.diff <= -0.3)
    out.push({ title: 'Viel Bildschirm, weniger Wohlbefinden', text: `An Tagen über deinem Limit war deine Stimmung um ${f1(Math.abs(r4.diff))} Stufen niedriger.`, tone: 'achtung', strength: Math.abs(r4.diff) });

  // Zyklusphase → Energie
  if (s.settings.modules.zyklus && s.cycle.periods.length) {
    const r5 = compare(days, (d) => {
      const p = predict(s.cycle, d);
      return !!p && (p.phase === 'menstruation' || (p.phase === 'luteal' && p.daysToPeriod <= 5));
    }, energy);
    if (r5 && r5.diff <= -0.3)
      out.push({ title: 'Dein Zyklus beeinflusst deine Energie', text: `Kurz vor und während der Periode war deine Energie im Schnitt um ${f1(Math.abs(r5.diff))} Stufen niedriger. Plane dort bewusst Puffer ein.`, tone: 'info', strength: Math.abs(r5.diff) });
  }

  // Was tut gut? (Tags aus dem Check-in)
  const tagStats: Record<string, number[]> = {};
  for (const d of days) for (const t of new Set(daily[d].good)) (tagStats[t] ??= []).push(daily[d].mood);
  const overall = avg(days.map(mood));
  const best = Object.entries(tagStats).filter(([, v]) => v.length >= 3).map(([k, v]) => ({ k, diff: avg(v) - overall })).sort((a, b) => b.diff - a.diff)[0];
  if (best && best.diff >= 0.25) out.push({ title: `„${best.k}“ tut dir besonders gut`, text: `Wenn du „${best.k}“ angekreuzt hast, lag deine Stimmung ${f1(best.diff)} Stufen über deinem Schnitt.`, tone: 'gut', strength: best.diff });

  // Gewohnheiten → Stimmung
  for (const h of s.habits.filter((x) => !x.archived)) {
    const r = compare(days, (d) => h.log.includes(d), mood);
    if (r && r.diff >= 0.4) out.push({ title: `„${h.title}“ wirkt`, text: `An Tagen, an denen du „${h.title}“ geschafft hast, war deine Stimmung um ${f1(r.diff)} Stufen besser.`, tone: 'gut', strength: r.diff });
  }

  if (!out.length) {
    out.push({ title: 'Muster entstehen mit der Zeit', text: `Mach ein paar Tage lang Check-ins (bisher ${days.length}). Ab etwa einer Woche Daten erkennt die App Zusammenhänge.`, tone: 'info', strength: 0 });
  }
  return out.sort((a, b) => b.strength - a.strength);
};

// Wohlbefinden (Stimmung + Energie) und Auslastung der letzten n Tage für Diagramme
export const wellbeingSeries = (s: AppState, n = 7) => {
  const daily = dailyCheckins(s.checkins);
  return Array.from({ length: n }, (_, i) => addDays(today(), i - (n - 1))).map((d) => {
    const c = daily[d];
    const load = dayLoad(s, d);
    return {
      date: d,
      wellbeing: c ? Math.round(((c.mood + c.energy) / 8) * 100) : null,
      load: Math.min(100, Math.round((load.points / load.capacity) * 100)),
    };
  });
};

// Balance der Lebensbereiche (0–100) aus den letzten 14 Tagen
export const areaBalance = (s: AppState) => {
  const from = addDays(today(), -13);
  const inRange = (d: ISODate) => d >= from && d <= today();
  const ev = s.events.filter((e) => inRange(e.date));
  const pct = (x: number, target: number) => Math.min(100, Math.round((x / target) * 100));
  const daily = dailyCheckins(s.checkins.filter((c) => inRange(c.date)));
  const sleepVals = Object.values(daily).map((d) => d.sleep);
  return [
    { name: 'Arbeit', value: pct(ev.filter((e) => e.category === 'arbeit').length, 10), color: '#2563EB' },
    { name: 'Soziales', value: pct(ev.filter((e) => e.category === 'freunde' || e.category === 'familie').length, 4), color: '#D97706' },
    { name: 'Bewegung', value: pct(s.sessions.filter((x) => inRange(x.date)).length + ev.filter((e) => e.category === 'sport').length, 6), color: '#16A34A' },
    { name: 'Me-Time', value: pct(ev.filter((e) => e.category === 'selbst').length + s.checkins.filter((c) => inRange(c.date)).length / 2, 7), color: '#7C3AED' },
    { name: 'Schlaf', value: sleepVals.length ? Math.round((avg(sleepVals) / 4) * 100) : 0, color: '#0D9488' },
  ];
};
