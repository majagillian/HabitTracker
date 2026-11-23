// Skelett-Modell für die animierte Vorturner:in
// Winkel in Grad, gemessen von „senkrecht nach unten“: 0 = unten, 90 = nach vorn (rechts), 180 = oben, -90 = nach hinten (links).
// Seitenansicht: Index 0 = nahe Körperseite, Index 1 = ferne Seite. Frontansicht: Index 0 = rechte Bildseite, Index 1 = linke Bildseite.

export type Pair = [number, number];
export type Pose = {
  t: number; // Rumpf (Hüfte → Schulter)
  h?: number; // Kopf (Schulter → Kopf), Standard = Rumpfrichtung
  arch?: number; // Wirbelsäulen-Krümmung in px (+ = Rundrücken, − = Hohlkreuz)
  ua: Pair; // Oberarme
  fa: Pair; // Unterarme
  th: Pair; // Oberschenkel
  sh: Pair; // Unterschenkel
  ft?: Pair; // Füße (Ferse → Zehen)
  lift?: number; // Anheben über den Boden in px (z. B. auf einer Stufe stehen)
};
export type View = 'side' | 'front';
export type Prop = 'wall' | 'step' | 'chair';

export const LEN = { torso: 44, neck: 9, head: 10, ua: 27, fa: 25, th: 38, sh: 37, ft: 11 };

type Pt = { x: number; y: number };
const RAD = Math.PI / 180;
const dir = (a: number): Pt => ({ x: Math.sin(a * RAD), y: Math.cos(a * RAD) });
const add = (p: Pt, a: number, len: number): Pt => {
  const d = dir(a);
  return { x: p.x + d.x * len, y: p.y + d.y * len };
};

export type Geometry = {
  view: View;
  hip: Pt;
  neck: Pt;
  head: Pt;
  headAngle: number;
  torsoCtrl: Pt; // Kontrollpunkt der Wirbelsäulen-Kurve
  shoulders: [Pt, Pt];
  hips: [Pt, Pt];
  elbows: [Pt, Pt];
  hands: [Pt, Pt];
  knees: [Pt, Pt];
  ankles: [Pt, Pt];
  toes: [Pt, Pt];
  torsoAngle: number;
};

// Berechnet alle Gelenkpositionen; danach wird die Figur auf den Boden gestellt und mittig ausgerichtet
export const solve = (p: Pose, view: View, build: { shoulder: number; hip: number }, box = { w: 220, h: 200, ground: 188 }): Geometry => {
  const hip: Pt = { x: 0, y: 0 };
  const neck = add(hip, p.t, LEN.torso);
  const td = dir(p.t);
  const perp: Pt = { x: -td.y, y: td.x }; // zeigt bei aufrechtem Rumpf nach rechts
  const mid: Pt = { x: (hip.x + neck.x) / 2, y: (hip.y + neck.y) / 2 };
  const arch = p.arch ?? 0;
  // Rundrücken wölbt sich vom Boden weg: in der Seitenansicht zur „Rückenseite“ (−perp)
  const torsoCtrl: Pt = { x: mid.x - perp.x * arch * 2, y: mid.y - perp.y * arch * 2 };
  const headAngle = p.h ?? p.t;
  const head = add(neck, headAngle, LEN.neck + LEN.head);

  const sw = view === 'front' ? build.shoulder : 0;
  const hw = view === 'front' ? build.hip : 0;
  const shoulders: [Pt, Pt] = [
    { x: neck.x + perp.x * sw, y: neck.y + perp.y * sw },
    { x: neck.x - perp.x * sw, y: neck.y - perp.y * sw },
  ];
  const hips: [Pt, Pt] = [
    { x: hip.x + perp.x * hw, y: hip.y + perp.y * hw },
    { x: hip.x - perp.x * hw, y: hip.y - perp.y * hw },
  ];
  const elbows = [0, 1].map((i) => add(shoulders[i], p.ua[i], LEN.ua)) as [Pt, Pt];
  const hands = [0, 1].map((i) => add(elbows[i], p.fa[i], LEN.fa)) as [Pt, Pt];
  const knees = [0, 1].map((i) => add(hips[i], p.th[i], LEN.th)) as [Pt, Pt];
  const ankles = [0, 1].map((i) => add(knees[i], p.sh[i], LEN.sh)) as [Pt, Pt];
  const defFt: Pair = view === 'front' ? [100, -100] : [p.sh[0] + 90, p.sh[1] + 90];
  const ft = p.ft ?? defFt;
  const toes = [0, 1].map((i) => add(ankles[i], ft[i], view === 'front' ? 6 : LEN.ft)) as [Pt, Pt];

  // Punkte mit „Dicke“, damit z. B. ein liegender Rücken auf dem Boden aufliegt
  const pts: [Pt, number][] = [
    [hip, 9], [neck, 8], [head, LEN.head], [mid, 8],
    ...elbows.map((q) => [q, 4] as [Pt, number]), ...hands.map((q) => [q, 3] as [Pt, number]),
    ...knees.map((q) => [q, 6] as [Pt, number]), ...ankles.map((q) => [q, 4] as [Pt, number]),
    ...toes.map((q) => [q, 2] as [Pt, number]), ...hips.map((q) => [q, 8] as [Pt, number]),
  ];
  const maxY = Math.max(...pts.map(([q, r]) => q.y + r));
  const minY = Math.min(...pts.map(([q, r]) => q.y - r));
  const minX = Math.min(...pts.map(([q, r]) => q.x - r));
  const maxX = Math.max(...pts.map(([q, r]) => q.x + r));
  // Skalieren, falls die Figur (z. B. liegend) zu breit ist
  const scale = Math.min(1, (box.w - 12) / (maxX - minX), (box.ground - 6) / (maxY - minY));
  const cx = (minX + maxX) / 2;
  const lift = p.lift ?? 0;
  const tr = (q: Pt): Pt => ({ x: box.w / 2 + (q.x - cx) * scale, y: box.ground - lift + (q.y - maxY) * scale });
  const trPair = (a: [Pt, Pt]) => [tr(a[0]), tr(a[1])] as [Pt, Pt];

  return {
    view,
    hip: tr(hip),
    neck: tr(neck),
    head: tr(head),
    headAngle,
    torsoCtrl: tr(torsoCtrl),
    shoulders: trPair(shoulders),
    hips: trPair(hips),
    elbows: trPair(elbows),
    hands: trPair(hands),
    knees: trPair(knees),
    ankles: trPair(ankles),
    toes: trPair(toes),
    torsoAngle: p.t,
  };
};

// Lineare Interpolation zwischen zwei Posen (k = 0 … 1)
export const lerpPose = (a: Pose, b: Pose, k: number): Pose => {
  const l = (x: number, y: number) => x + (y - x) * k;
  const lp = (x: Pair, y: Pair): Pair => [l(x[0], y[0]), l(x[1], y[1])];
  const af = a.ft, bf = b.ft;
  return {
    t: l(a.t, b.t),
    h: l(a.h ?? a.t, b.h ?? b.t),
    arch: l(a.arch ?? 0, b.arch ?? 0),
    ua: lp(a.ua, b.ua),
    fa: lp(a.fa, b.fa),
    th: lp(a.th, b.th),
    sh: lp(a.sh, b.sh),
    ft: af && bf ? lp(af, bf) : undefined,
    lift: l(a.lift ?? 0, b.lift ?? 0),
  };
};

export const easeInOut = (k: number) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
