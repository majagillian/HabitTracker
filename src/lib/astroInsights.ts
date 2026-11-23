// Abgleich: Passen Horoskop und Mondstand zu deinen echten Daten aus der App?
import { ELEMENTS, moonLongitude, moonPhase, signOf, julianDay } from '@/lib/astro';
import { parseISO } from '@/lib/date';
import { horoscopeFor } from '@/lib/horoscope';
import { dailyCheckins } from '@/lib/insights';
import type { AppState } from '@/store/useStore';

export type AstroMatch = {
  days: number;
  agreement: number | null; // Anteil Tage, an denen Prognose und Befinden übereinstimmten (%)
  correlation: number | null; // Pearson-Korrelation −1 … 1
  verdict: string;
  patterns: { title: string; text: string }[];
};

const pearson = (a: number[], b: number[]) => {
  const n = a.length;
  if (n < 5) return null;
  const ma = a.reduce((s, x) => s + x, 0) / n;
  const mb = b.reduce((s, x) => s + x, 0) / n;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) {
    num += (a[i] - ma) * (b[i] - mb);
    da += (a[i] - ma) ** 2;
    db += (b[i] - mb) ** 2;
  }
  return da && db ? num / Math.sqrt(da * db) : null;
};

const avg = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;

export const astroMatch = (s: AppState): AstroMatch => {
  const daily = dailyCheckins(s.checkins);
  const days = Object.keys(daily).sort().slice(-90);
  const predicted: number[] = [];
  const actual: number[] = [];
  let agree = 0;
  for (const d of days) {
    const h = horoscopeFor(s.astro, d);
    if (!h) continue;
    const energyArea = h.areas.find((a) => a.key === 'energie')!.score;
    const pred = (h.overall + energyArea) / 2; // 1–5
    const real = 1 + ((daily[d].mood + daily[d].energy) / 8) * 4; // 1–5
    predicted.push(pred);
    actual.push(real);
    if (Math.abs(pred - real) <= 1) agree++;
  }
  const r = pearson(predicted, actual);
  const agreement = predicted.length >= 5 ? Math.round((agree / predicted.length) * 100) : null;
  let verdict = 'Noch zu wenige Check-ins für einen Abgleich – ab etwa 5 Tagen mit Check-in und Geburtsdaten geht es los.';
  if (r !== null) {
    const strength = Math.abs(r) < 0.1 ? 'kein erkennbarer' : Math.abs(r) < 0.3 ? 'ein schwacher' : Math.abs(r) < 0.5 ? 'ein mittlerer' : 'ein deutlicher';
    verdict = `${strength.charAt(0).toUpperCase() + strength.slice(1)} Zusammenhang (r = ${r.toFixed(2).replace('.', ',')}) über ${predicted.length} Tage. ${
      Math.abs(r) < 0.3 ? 'Ehrlich gesagt: Das kann gut Zufall sein.' : r > 0 ? 'Deine Tage verliefen öfter so, wie die Sterne es andeuteten.' : 'Interessant: Oft war es genau umgekehrt.'
    }${predicted.length < 30 ? ' Mit mehr Daten wird das Bild verlässlicher.' : ''}`;
  }

  // Muster nach Mondphase und Mondzeichen-Element
  const patterns: AstroMatch['patterns'] = [];
  const full: number[] = [], other: number[] = [];
  const byElement: Record<string, number[]> = {};
  for (const d of days) {
    const when = parseISO(d);
    when.setHours(12);
    const ph = moonPhase(when).frac;
    const mood = daily[d].mood;
    (Math.abs(ph - 0.5) < 0.05 ? full : other).push(mood);
    const el = ELEMENTS[signOf(moonLongitude(julianDay(when)))];
    (byElement[el] ??= []).push(daily[d].energy);
  }
  if (full.length >= 3 && other.length >= 3) {
    const diff = avg(full) - avg(other);
    patterns.push({
      title: 'Vollmond & Stimmung',
      text: Math.abs(diff) < 0.3 ? `An Vollmondtagen war deine Stimmung ähnlich wie sonst (Unterschied ${diff.toFixed(1).replace('.', ',')}).` : `An Vollmondtagen war deine Stimmung um ${Math.abs(diff).toFixed(1).replace('.', ',')} Stufen ${diff > 0 ? 'besser' : 'niedriger'} (${full.length} Tage).`,
    });
  }
  const els = Object.entries(byElement).filter(([, v]) => v.length >= 3).map(([k, v]) => ({ k, v: avg(v), n: v.length })).sort((a, b) => b.v - a.v);
  if (els.length >= 2) {
    const best = els[0], worst = els[els.length - 1];
    if (best.v - worst.v >= 0.4) patterns.push({ title: 'Mond-Element & Energie', text: `Stand der Mond in einem ${best.k}zeichen, war deine Energie am höchsten; bei ${worst.k}zeichen am niedrigsten (Differenz ${(best.v - worst.v).toFixed(1).replace('.', ',')}).` });
    else patterns.push({ title: 'Mond-Element & Energie', text: 'Deine Energie hängt bisher kaum davon ab, in welchem Element der Mond steht.' });
  }
  return { days: predicted.length, agreement, correlation: r, verdict, patterns };
};
