// Tageshoroskop aus der aktuellen Planetenkonstellation und dem Geburtshoroskop
// Zur Unterhaltung und Selbstreflexion – keine Vorhersage im wissenschaftlichen Sinn.
import { aspectBetween, ELEMENTS, moonPhase, natalChart, SIGNS, skyAt, type AspectName, type Natal, type Planet, type PlanetPos, type Sign } from '@/lib/astro';
import { parseISO } from '@/lib/date';
import type { AstroProfile, ISODate } from '@/types';

export type HoroArea = { key: 'liebe' | 'arbeit' | 'energie' | 'achtsamkeit'; title: string; score: number; text: string };
export type Horoscope = { date: ISODate; sky: PlanetPos[]; phase: ReturnType<typeof moonPhase>; areas: HoroArea[]; headline: string; main: string; overall: number };

// Geburtsdaten → Zeichen (manuelle Angaben haben Vorrang)
export const natalFromProfile = (a: AstroProfile): (Natal & { sunSign: Sign; moonSign: Sign | null; ascSign: Sign | null }) | null => {
  if (!a.birthDate && !a.manual?.sun) return null;
  let chart: Natal | null = null;
  if (a.birthDate) {
    const [y, m, d] = a.birthDate.split('-').map(Number);
    const [hh, mm] = (a.birthTime ?? '12:00').split(':').map(Number);
    const offset = a.utcOffsetMin ?? -new Date(y, m - 1, d, hh, mm).getTimezoneOffset();
    const utc = new Date(Date.UTC(y, m - 1, d, hh, mm) - offset * 60000);
    chart = natalChart(utc, a.birthTime && a.place ? { lat: a.place.lat, lon: a.place.lon } : undefined);
  }
  const sunSign = (a.manual?.sun as Sign) ?? chart?.sun ?? 'Widder';
  const moonSign = (a.manual?.moon as Sign) ?? (a.birthTime ? chart?.moon ?? null : chart?.moon ?? null);
  const ascSign = (a.manual?.asc as Sign) ?? chart?.asc ?? null;
  const toLon = (s: Sign | null) => (s ? SIGNS.indexOf(s) * 30 + 15 : null);
  return {
    sun: sunSign,
    moon: moonSign ?? sunSign,
    asc: ascSign,
    sunLon: a.manual?.sun ? toLon(sunSign)! : chart?.sunLon ?? toLon(sunSign)!,
    moonLon: a.manual?.moon ? toLon(moonSign)! : chart?.moonLon ?? toLon(sunSign)!,
    ascLon: a.manual?.asc ? toLon(ascSign) : chart?.ascLon ?? null,
    sunSign,
    moonSign,
    ascSign,
  };
};

const HARMONIC: AspectName[] = ['Trigon', 'Sextil'];
const TENSE: AspectName[] = ['Quadrat', 'Opposition'];
const aspectScore = (a: AspectName) => (HARMONIC.includes(a) ? 1 : TENSE.includes(a) ? -1 : 0.5);

const PLANET_AREA: Partial<Record<Planet, HoroArea['key'][]>> = {
  Venus: ['liebe'], Mond: ['achtsamkeit', 'liebe'], Merkur: ['arbeit'], Mars: ['energie', 'arbeit'], Jupiter: ['arbeit', 'energie'], Saturn: ['arbeit', 'achtsamkeit'], Sonne: ['energie'], Neptun: ['achtsamkeit'], Uranus: ['energie'],
};

// Bausteine für ausführliche, bildhafte Texte
const PLANET_POETRY: Record<Planet, string> = {
  Sonne: 'Die Sonne, Quelle deiner Lebenskraft,',
  Mond: 'Der Mond, Hüter deiner Gefühle,',
  Merkur: 'Merkur, der flinke Bote der Gedanken,',
  Venus: 'Venus, die Planetin der Liebe und des Genusses,',
  Mars: 'Der feurige Mars, Motor deines Antriebs,',
  Jupiter: 'Jupiter, der großzügige Glücksbringer,',
  Saturn: 'Saturn, der weise Lehrmeister,',
  Uranus: 'Uranus, der Freigeist unter den Planeten,',
  Neptun: 'Neptun, der Träumer am Himmel,',
};

const ASPECT_TEXT: Record<AspectName, string> = {
  Konjunktion: 'verschmilzt heute mit',
  Sextil: 'reicht freundlich die Hand',
  Trigon: 'fließt in harmonischem Einklang mit',
  Quadrat: 'reibt sich spannungsvoll an',
  Opposition: 'steht gegenüber von',
};

const NATAL_LABEL = { sun: 'deiner Sonne', moon: 'deinem Mond', asc: 'deinem Aszendenten' } as const;

const AREA_TEXT: Record<HoroArea['key'], { good: string[]; mid: string[]; low: string[]; title: string }> = {
  liebe: {
    title: 'Liebe & Beziehungen',
    good: [
      'Worte, die du sonst zurückhältst, finden heute einen weichen Landeplatz. Ein guter Tag für ehrliche, liebevolle Gespräche, eine kleine Geste der Zuneigung oder gemeinsame Stille, die mehr sagt als tausend Sätze.',
      'Dein Herz steht weit offen, und andere spüren das. Lade jemanden ein, mit dem du schon lange wieder Zeit verbringen wolltest – Nähe darf heute leicht sein.',
    ],
    mid: [
      'In Beziehungen herrscht ruhiges Fahrwasser. Kleine Aufmerksamkeiten wirken stärker als große Worte – ein Lächeln, eine Nachricht, eine Umarmung zur rechten Zeit.',
      'Gefühle zeigen sich heute eher leise. Hör genau hin, was zwischen den Zeilen mitschwingt, und gönn dir auch selbst ein wenig Zärtlichkeit.',
    ],
    low: [
      'Empfindlichkeiten liegen dicht unter der Oberfläche. Atme durch, bevor du reagierst, und frag lieber einmal nach, statt etwas hineinzulesen. Missverständnisse lösen sich, sobald sie ausgesprochen sind.',
      'Heute brauchst du vielleicht mehr Raum für dich, als andere erwarten. Das ist in Ordnung – sag es freundlich, dann bleibt die Verbindung warm.',
    ],
  },
  arbeit: {
    title: 'Arbeit & Ziele',
    good: [
      'Deine Gedanken sind klar und fokussiert, Ideen fügen sich wie Puzzleteile zusammen. Nutze den Rückenwind für Gespräche, Planung oder das Projekt, das schon zu lange wartet.',
      'Was du heute anstößt, hat gute Chancen zu wachsen. Zeig dich mit deinen Fähigkeiten – du überzeugst durch Ruhe und Kompetenz.',
    ],
    mid: [
      'Ein solider Arbeitstag ohne große Überraschungen. Ordnung schaffen, Liegengebliebenes abschließen und kleine Erfolge feiern bringt dich spürbar voran.',
      'Routine ist heute deine Freundin. Arbeite Schritt für Schritt und belohne dich nach jeder erledigten Aufgabe mit einer kurzen Pause.',
    ],
    low: [
      'Hinter manchen Aussagen steckt mehr, als zuerst sichtbar ist. Bleib in Verhandlungen geduldig, hör genau zu und triff wichtige Entscheidungen lieber mit einer Nacht Abstand.',
      'Vielleicht läuft nicht alles nach Plan. Priorisiere das Wesentliche, streiche, was warten kann, und erinnere dich: Ein Tag mit weniger Output ist kein verlorener Tag.',
    ],
  },
  energie: {
    title: 'Energie & Körper',
    good: [
      'Kraft und Lebensfreude sprudeln. Bewegung macht heute besonders Spaß – ob Workout, Tanz durch die Küche oder ein langer Spaziergang an der frischen Luft.',
      'Dein Körper ist bereit für Neues. Probiere ein anderes Training aus oder steigere dich sanft – du wirst überrascht sein, wie viel in dir steckt.',
    ],
    mid: [
      'Deine Energie ist ausgeglichen. Achte auf einen guten Rhythmus aus Aktivität und Ruhe, genug Wasser und eine warme Mahlzeit zur rechten Zeit.',
      'Weder Sprint noch Stillstand: Ein moderates Tempo trägt dich heute am besten durch den Tag. Höre auf die feinen Signale deines Körpers.',
    ],
    low: [
      'Der innere Motor will Vollgas geben, doch dein Körper wünscht sich Rhythmus statt Rekord. Plane bewusst Pausen ein und lenke überschüssige Kraft in Bewegung statt in Ungeduld.',
      'Deine Batterie lädt heute langsamer. Sanftes Yoga, ein früher Feierabend und ausreichend Schlaf sind jetzt kein Luxus, sondern kluge Selbstfürsorge.',
    ],
  },
  achtsamkeit: {
    title: 'Achtsamkeit & Seele',
    good: [
      'Deine Intuition ist hellwach. Nimm dir ein paar Minuten Stille, schreib auf, was dich bewegt, und vertraue dem leisen Gefühl, das sich dabei zeigt.',
      'Ein wunderbarer Tag für Rituale: eine Kerze, ein Tee, drei Dinge, für die du dankbar bist. Kleine Inseln der Ruhe tragen dich weit.',
    ],
    mid: [
      'Zwischen den Terminen liegen kleine Momente der Ruhe – entdecke sie bewusst. Drei tiefe Atemzüge an der roten Ampel können Wunder wirken.',
      'Heute lohnt sich ein kurzer Blick nach innen: Was brauchst du gerade wirklich? Die Antwort ist oft einfacher, als du denkst.',
    ],
    low: [
      'Das Gedankenkarussell dreht sich schneller als sonst. Erde dich mit einer Atemübung, einem Spaziergang barfuß oder ein paar Zeilen im Tagebuch.',
      'Fühlt sich heute vieles zu viel an? Dann darf es weniger sein. Sag einen Termin ab, schalte das Handy stumm und schenk dir eine Stunde nur für dich.',
    ],
  },
};

const MOON_SIGN_TEXT: Record<'Feuer' | 'Erde' | 'Luft' | 'Wasser', string> = {
  Feuer: 'Der Mond im Feuerzeichen entfacht Tatendrang und Mut – die Stimmung ist lebhaft und spontan.',
  Erde: 'Der Mond im Erdzeichen schenkt Bodenhaftung – ideal für Praktisches, Genuss und Struktur.',
  Luft: 'Der Mond im Luftzeichen bringt Leichtigkeit und Neugier – Gespräche und Ideen fließen.',
  Wasser: 'Der Mond im Wasserzeichen macht feinfühlig und intuitiv – Gefühle dürfen Raum bekommen.',
};

// Deterministische Auswahl einer Textvariante pro Tag
const pick = <T,>(arr: T[], seed: number) => arr[Math.abs(seed) % arr.length];
const seedOf = (s: string) => s.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7);

export const horoscopeFor = (profile: AstroProfile, date: ISODate): Horoscope | null => {
  const natal = natalFromProfile(profile);
  if (!natal) return null;
  const when = parseISO(date);
  when.setHours(12);
  const sky = skyAt(when);
  const phase = moonPhase(when);
  const points: Record<HoroArea['key'], number> = { liebe: 0, arbeit: 0, energie: 0, achtsamkeit: 0 };
  const reasons: { text: string; weight: number; planet?: Planet }[] = [];

  const natalPoints: [keyof typeof NATAL_LABEL, number | null][] = [['sun', natal.sunLon], ['moon', natal.moonLon], ['asc', natal.ascLon]];
  for (const p of sky) {
    for (const [key, lon] of natalPoints) {
      if (lon === null) continue;
      const asp = aspectBetween(p.lon, lon);
      if (!asp) continue;
      const w = (p.planet === 'Mond' ? 0.6 : 1) * (key === 'sun' ? 1.2 : 1);
      for (const area of PLANET_AREA[p.planet] ?? []) points[area] += aspectScore(asp) * w;
      reasons.push({ planet: p.planet, text: `${PLANET_POETRY[p.planet]} ${p.retro ? 'rückläufig im' : 'im'} ${p.sign}, ${ASPECT_TEXT[asp]} ${NATAL_LABEL[key]}.`, weight: Math.abs(aspectScore(asp)) * w + (p.planet === 'Mond' ? 0 : 0.2) });
    }
  }
  // Rückläufiger Merkur dämpft Kommunikation
  if (sky.find((p) => p.planet === 'Merkur')?.retro) {
    points.arbeit -= 0.7;
    reasons.push({ planet: 'Merkur', text: 'Merkur läuft rückwärts – prüfe Nachrichten zweimal und plane Puffer für Technik und Termine ein.', weight: 1 });
  }
  // Mondphase
  if (phase.name === 'Vollmond') { points.achtsamkeit += 0.8; points.energie += 0.3; }
  if (phase.name === 'Neumond') { points.achtsamkeit += 0.6; points.energie -= 0.4; }

  const toScore = (v: number) => Math.max(1, Math.min(5, Math.round(3 + v)));
  const seed = seedOf(date + natal.sunSign);
  const areas: HoroArea[] = (Object.keys(points) as HoroArea['key'][]).map((k, i) => {
    const score = toScore(points[k]);
    const bank = AREA_TEXT[k];
    const variant = score >= 4 ? bank.good : score <= 2 ? bank.low : bank.mid;
    const reason = [...reasons].sort((a, b) => b.weight - a.weight).find((r) => r.planet && (PLANET_AREA[r.planet] ?? []).includes(k));
    return { key: k, title: bank.title, score, text: (reason ? reason.text + ' ' : '') + pick(variant, seed + i) };
  });

  const moon = sky.find((p) => p.planet === 'Mond')!;
  const top = reasons.sort((a, b) => b.weight - a.weight)[0];
  const overall = Math.round((areas.reduce((s, a) => s + a.score, 0) / 4) * 10) / 10;
  const headline = `${phase.name} im ${moon.sign}`;
  const main = [
    `Liebe ${natal.sunSign}-Seele${natal.ascSign ? ` mit Aszendent ${natal.ascSign}` : ''}: ${MOON_SIGN_TEXT[ELEMENTS[moon.sign]]}`,
    top ? `Der wichtigste Einfluss heute: ${top.text}` : 'Heute bilden die Planeten keine engen Aspekte zu deinem Horoskop – ein ruhiger Tag, den du ganz nach deinem Gefühl gestalten kannst.',
  ].join(' ');
  return { date, sky, phase, areas, headline, main, overall };
};
