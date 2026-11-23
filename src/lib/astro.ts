// Astronomische Berechnungen (vereinfachte Formeln nach Meeus / JPL-Bahnelemente)
// Genauigkeit: Sonne & Planeten ca. ±1°, Mond ca. ±0,5° – ausreichend für Tierkreiszeichen.

const RAD = Math.PI / 180;
const norm = (x: number) => ((x % 360) + 360) % 360;
const sin = (d: number) => Math.sin(d * RAD);
const cos = (d: number) => Math.cos(d * RAD);

export const SIGNS = ['Widder', 'Stier', 'Zwillinge', 'Krebs', 'Löwe', 'Jungfrau', 'Waage', 'Skorpion', 'Schütze', 'Steinbock', 'Wassermann', 'Fische'] as const;
export type Sign = (typeof SIGNS)[number];
export const SIGN_SYMBOLS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
export const ELEMENTS: Record<Sign, 'Feuer' | 'Erde' | 'Luft' | 'Wasser'> = {
  Widder: 'Feuer', Löwe: 'Feuer', Schütze: 'Feuer',
  Stier: 'Erde', Jungfrau: 'Erde', Steinbock: 'Erde',
  Zwillinge: 'Luft', Waage: 'Luft', Wassermann: 'Luft',
  Krebs: 'Wasser', Skorpion: 'Wasser', Fische: 'Wasser',
};

export const signOf = (lon: number): Sign => SIGNS[Math.floor(norm(lon) / 30)];
export const degInSign = (lon: number) => Math.floor(norm(lon) % 30);

// Julianisches Datum aus einem JS-Date (UTC)
export const julianDay = (d: Date) => d.getTime() / 86400000 + 2440587.5;
const centuries = (jd: number) => (jd - 2451545.0) / 36525;

// Schiefe der Ekliptik
const obliquity = (T: number) => 23.439291 - 0.0130042 * T;

// ---------- Sonne ----------
export const sunLongitude = (jd: number) => {
  const T = centuries(jd);
  const L0 = 280.46646 + 36000.76983 * T;
  const M = 357.52911 + 35999.05029 * T;
  const C = (1.914602 - 0.004817 * T) * sin(M) + 0.019993 * sin(2 * M) + 0.000289 * sin(3 * M);
  return norm(L0 + C);
};

// ---------- Mond (Hauptterme nach Meeus Kap. 47) ----------
export const moonLongitude = (jd: number) => {
  const T = centuries(jd);
  const L = 218.3164477 + 481267.88123421 * T;
  const D = 297.8501921 + 445267.1114034 * T;
  const M = 357.5291092 + 35999.0502909 * T;
  const Mp = 134.9633964 + 477198.8675055 * T;
  const F = 93.272095 + 483202.0175233 * T;
  const lon =
    L +
    6.288774 * sin(Mp) +
    1.274027 * sin(2 * D - Mp) +
    0.658314 * sin(2 * D) +
    0.213618 * sin(2 * Mp) -
    0.185116 * sin(M) -
    0.114332 * sin(2 * F) +
    0.058793 * sin(2 * D - 2 * Mp) +
    0.057066 * sin(2 * D - M - Mp) +
    0.053322 * sin(2 * D + Mp) +
    0.045758 * sin(2 * D - M) -
    0.040923 * sin(M - Mp) -
    0.03472 * sin(D) -
    0.030383 * sin(M + Mp) +
    0.015327 * sin(2 * D - 2 * F) -
    0.012528 * sin(Mp + 2 * F) +
    0.01098 * sin(Mp - 2 * F) +
    0.010675 * sin(4 * D - Mp) +
    0.010034 * sin(3 * Mp) +
    0.008548 * sin(4 * D - 2 * Mp);
  return norm(lon);
};

// ---------- Planeten (JPL „Approximate Positions of the Planets“, 1800–2050) ----------
type El = [number, number, number, number, number, number]; // a, e, I, L, ϖ, Ω
const ELEMS: Record<string, [El, El]> = {
  Merkur: [[0.38709927, 0.20563593, 7.00497902, 252.2503235, 77.45779628, 48.33076593], [0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081]],
  Venus: [[0.72333566, 0.00677672, 3.39467605, 181.9790995, 131.60246718, 76.67984255], [0.0000039, -0.00004107, -0.0007889, 58517.81538729, 0.00268329, -0.27769418]],
  Erde: [[1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0.0], [0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0.0]],
  Mars: [[1.52371034, 0.0933941, 1.84969142, -4.55343205, -23.94362959, 49.55953891], [0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343]],
  Jupiter: [[5.20288700, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909], [-0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106]],
  Saturn: [[9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448], [-0.0012506, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794]],
  Uranus: [[19.18916464, 0.04725744, 0.77263783, 313.23810451, 170.95427630, 74.01692503], [-0.00196176, -0.00004397, -0.00242939, 428.48202785, 0.40805281, 0.04240589]],
  Neptun: [[30.06992276, 0.00859048, 1.77004347, -55.12002969, 44.96476227, 131.78422574], [0.00026291, 0.00005105, 0.00035372, 218.45945325, -0.32241464, -0.00508664]],
};

// Heliozentrische ekliptikale Koordinaten
const helio = (name: string, T: number) => {
  const [e0, rate] = ELEMS[name];
  const [a, e, I, L, w, O] = e0.map((v, i) => v + rate[i] * T) as El;
  const M = norm(L - w);
  const om = w - O;
  // Kepler-Gleichung iterativ lösen
  let E = M + (e / RAD) * sin(M);
  for (let i = 0; i < 6; i++) {
    const dM = M - (E - (e / RAD) * sin(E));
    E += dM / (1 - e * cos(E));
  }
  const xp = a * (cos(E) - e);
  const yp = a * Math.sqrt(1 - e * e) * sin(E);
  const x = (cos(om) * cos(O) - sin(om) * sin(O) * cos(I)) * xp + (-sin(om) * cos(O) - cos(om) * sin(O) * cos(I)) * yp;
  const y = (cos(om) * sin(O) + sin(om) * cos(O) * cos(I)) * xp + (-sin(om) * sin(O) + cos(om) * cos(O) * cos(I)) * yp;
  const z = sin(om) * sin(I) * xp + cos(om) * sin(I) * yp;
  return { x, y, z };
};

export const planetLongitude = (name: string, jd: number) => {
  const T = centuries(jd);
  const p = helio(name, T);
  const earth = helio('Erde', T);
  return norm(Math.atan2(p.y - earth.y, p.x - earth.x) / RAD);
};

export const PLANETS = ['Sonne', 'Mond', 'Merkur', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptun'] as const;
export type Planet = (typeof PLANETS)[number];

export const longitudeOf = (planet: Planet, jd: number) =>
  planet === 'Sonne' ? sunLongitude(jd) : planet === 'Mond' ? moonLongitude(jd) : planetLongitude(planet, jd);

export type PlanetPos = { planet: Planet; lon: number; sign: Sign; deg: number; retro: boolean };

// Aktuelle Konstellation inkl. Rückläufigkeit
export const skyAt = (date: Date): PlanetPos[] => {
  const jd = julianDay(date);
  return PLANETS.map((planet) => {
    const lon = longitudeOf(planet, jd);
    let retro = false;
    if (planet !== 'Sonne' && planet !== 'Mond') {
      const d = norm(longitudeOf(planet, jd + 1) - longitudeOf(planet, jd - 1) + 180) - 180;
      retro = d < 0;
    }
    return { planet, lon, sign: signOf(lon), deg: degInSign(lon), retro };
  });
};

// Mondphase: 0 = Neumond, 0,5 = Vollmond
export const moonPhase = (date: Date) => {
  const jd = julianDay(date);
  const elong = norm(moonLongitude(jd) - sunLongitude(jd));
  const frac = elong / 360;
  const names = ['Neumond', 'Zunehmende Sichel', 'Erstes Viertel', 'Zunehmender Mond', 'Vollmond', 'Abnehmender Mond', 'Letztes Viertel', 'Abnehmende Sichel'];
  const idx = Math.round(frac * 8) % 8;
  return { frac, name: names[idx], illumination: (1 - cos(elong)) / 2 };
};

// Greenwich-Sternzeit in Grad
const gmst = (jd: number) => {
  const T = centuries(jd);
  return norm(280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * T * T);
};

// Aszendent aus Geburtszeit (UTC) und Ort
export const ascendant = (date: Date, lat: number, lon: number) => {
  const jd = julianDay(date);
  const theta = norm(gmst(jd) + lon); // lokale Sternzeit = RAMC
  const eps = obliquity(centuries(jd));
  const asc = Math.atan2(cos(theta), -(sin(theta) * cos(eps) + Math.tan(lat * RAD) * sin(eps))) / RAD;
  return norm(asc);
};

export type Natal = { sun: Sign; moon: Sign; asc: Sign | null; sunLon: number; moonLon: number; ascLon: number | null };

export const natalChart = (birthUtc: Date, place?: { lat: number; lon: number }): Natal => {
  const jd = julianDay(birthUtc);
  const sunLon = sunLongitude(jd);
  const moonLon = moonLongitude(jd);
  const ascLon = place ? ascendant(birthUtc, place.lat, place.lon) : null;
  return { sun: signOf(sunLon), moon: signOf(moonLon), asc: ascLon === null ? null : signOf(ascLon), sunLon, moonLon, ascLon };
};

// Aspekte zwischen zwei Längen
export type AspectName = 'Konjunktion' | 'Sextil' | 'Quadrat' | 'Trigon' | 'Opposition';
const ASPECTS: [AspectName, number, number][] = [
  ['Konjunktion', 0, 8],
  ['Sextil', 60, 5],
  ['Quadrat', 90, 6],
  ['Trigon', 120, 6],
  ['Opposition', 180, 7],
];
export const aspectBetween = (a: number, b: number): AspectName | null => {
  const d = Math.abs(norm(a - b + 180) - 180);
  for (const [name, angle, orb] of ASPECTS) if (Math.abs(d - angle) <= orb) return name;
  return null;
};

// Orte für die Aszendenten-Berechnung (Auswahl)
export const CITIES: { name: string; lat: number; lon: number }[] = [
  { name: 'Berlin', lat: 52.52, lon: 13.405 },
  { name: 'Hamburg', lat: 53.551, lon: 9.993 },
  { name: 'München', lat: 48.137, lon: 11.575 },
  { name: 'Köln', lat: 50.938, lon: 6.96 },
  { name: 'Frankfurt am Main', lat: 50.11, lon: 8.682 },
  { name: 'Stuttgart', lat: 48.775, lon: 9.182 },
  { name: 'Düsseldorf', lat: 51.227, lon: 6.773 },
  { name: 'Leipzig', lat: 51.339, lon: 12.373 },
  { name: 'Dresden', lat: 51.05, lon: 13.737 },
  { name: 'Hannover', lat: 52.375, lon: 9.732 },
  { name: 'Nürnberg', lat: 49.452, lon: 11.077 },
  { name: 'Bremen', lat: 53.079, lon: 8.801 },
  { name: 'Dortmund', lat: 51.514, lon: 7.465 },
  { name: 'Essen', lat: 51.456, lon: 7.012 },
  { name: 'Münster', lat: 51.961, lon: 7.626 },
  { name: 'Kiel', lat: 54.323, lon: 10.123 },
  { name: 'Rostock', lat: 54.092, lon: 12.099 },
  { name: 'Freiburg', lat: 47.999, lon: 7.842 },
  { name: 'Mainz', lat: 49.993, lon: 8.247 },
  { name: 'Saarbrücken', lat: 49.234, lon: 6.997 },
  { name: 'Erfurt', lat: 50.978, lon: 11.029 },
  { name: 'Magdeburg', lat: 52.12, lon: 11.628 },
  { name: 'Wien', lat: 48.208, lon: 16.373 },
  { name: 'Graz', lat: 47.07, lon: 15.439 },
  { name: 'Salzburg', lat: 47.81, lon: 13.055 },
  { name: 'Zürich', lat: 47.377, lon: 8.541 },
  { name: 'Bern', lat: 46.948, lon: 7.447 },
  { name: 'Basel', lat: 47.559, lon: 7.588 },
  { name: 'Amsterdam', lat: 52.368, lon: 4.904 },
  { name: 'Paris', lat: 48.857, lon: 2.352 },
  { name: 'London', lat: 51.507, lon: -0.128 },
  { name: 'Warschau', lat: 52.23, lon: 21.012 },
  { name: 'Istanbul', lat: 41.008, lon: 28.978 },
  { name: 'Rom', lat: 41.903, lon: 12.496 },
  { name: 'Madrid', lat: 40.417, lon: -3.704 },
  { name: 'New York', lat: 40.713, lon: -74.006 },
];
