// Wandelt die Geometrie in einfache Zeichen-Elemente um (für react-native-svg und Tests)
import type { Gender } from '@/types';
import type { Geometry, Prop } from '@/lib/pose';

export type Shape =
  | { k: 'line'; x1: number; y1: number; x2: number; y2: number; stroke: string; w: number }
  | { k: 'circle'; cx: number; cy: number; r: number; fill: string }
  | { k: 'path'; d: string; fill: string; stroke?: string; w?: number }
  | { k: 'rect'; x: number; y: number; width: number; height: number; fill: string; rx?: number };

export type Look = { skin: string; skinFar: string; shirt: string; shirtFar: string; pants: string; pantsFar: string; hair: string; shoe: string };

export const LOOKS: Record<Gender, Look> = {
  w: { skin: '#E8B48A', skinFar: '#C9956D', shirt: '#7C3AED', shirtFar: '#5B21B6', pants: '#1F1B2E', pantsFar: '#3B3650', hair: '#5B3A29', shoe: '#8FFFD6' },
  m: { skin: '#D9A27A', skinFar: '#B8835D', shirt: '#0D9488', shirtFar: '#0B6E66', pants: '#1F2937', pantsFar: '#374151', hair: '#2D2A26', shoe: '#FFC494' },
  d: { skin: '#C98E6A', skinFar: '#A9714F', shirt: '#F59E0B', shirtFar: '#C27C06', pants: '#334155', pantsFar: '#475569', hair: '#6B4F3A', shoe: '#A78BFA' },
};

// Körperbau: Schulter- und Hüftbreite (Frontansicht)
export const BUILD: Record<Gender, { shoulder: number; hip: number }> = {
  w: { shoulder: 12, hip: 9 },
  m: { shoulder: 15, hip: 8 },
  d: { shoulder: 13, hip: 8.5 },
};

const RAD = Math.PI / 180;
const off = (x: number, y: number, a: number, l: number) => ({ x: x + Math.sin(a * RAD) * l, y: y + Math.cos(a * RAD) * l });

export const figureShapes = (g: Geometry, gender: Gender, props: Prop[] = []): Shape[] => {
  const L = LOOKS[gender];
  const s: Shape[] = [];
  const line = (a: { x: number; y: number }, b: { x: number; y: number }, stroke: string, w: number) =>
    s.push({ k: 'line', x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke, w });

  // Requisiten
  if (props.includes('wall')) s.push({ k: 'rect', x: g.hip.x - 22, y: 20, width: 8, height: 168, fill: '#CFCBDA' });
  if (props.includes('step')) {
    const foot = g.ankles[0];
    // Feste Stufenhöhe (28 px) unter dem nahen Fuß
    s.push({ k: 'rect', x: foot.x - 18, y: 188 - 28, width: 40, height: 28, fill: '#D6C4A8', rx: 3 });
  }
  if (props.includes('chair')) {
    const hand = g.hands[0];
    const h = Math.max(4, 188 - hand.y - 2);
    s.push({ k: 'rect', x: hand.x - 30, y: 188 - h, width: 38, height: h, fill: '#D6C4A8', rx: 3 });
  }

  const side = g.view === 'side';
  const far = side ? 1 : -1;

  // Ferne Gliedmaßen zuerst (Seitenansicht)
  const leg = (i: 0 | 1, near: boolean) => {
    line(g.hips[i], g.knees[i], near ? L.pants : L.pantsFar, 13);
    line(g.knees[i], g.ankles[i], near ? L.pants : L.pantsFar, 10);
    line(g.ankles[i], g.toes[i], L.shoe, 7);
  };
  const arm = (i: 0 | 1, near: boolean) => {
    line(g.shoulders[i], g.elbows[i], near ? L.shirt : L.shirtFar, 9);
    line(g.elbows[i], g.hands[i], near ? L.skin : L.skinFar, 7);
    s.push({ k: 'circle', cx: g.hands[i].x, cy: g.hands[i].y, r: 4, fill: near ? L.skin : L.skinFar });
  };

  if (side) {
    arm(1, false);
    leg(1, false);
  }

  // Haare hinten (Pferdeschwanz / Bob)
  const hd = g.headAngle;
  if (gender === 'w') {
    if (side) {
      // Pferdeschwanz: sitzt hinten am Kopf und hängt der Schwerkraft folgend nach unten
      const base = off(g.head.x, g.head.y, hd + 75, 9);
      const raw = off(base.x, base.y, -25, 17);
      const tip = { x: raw.x, y: Math.min(raw.y, 185) }; // nicht durch den Boden hängen
      s.push({ k: 'line', x1: base.x, y1: base.y, x2: tip.x, y2: tip.y, stroke: L.hair, w: 7 });
    } else {
      s.push({ k: 'circle', cx: g.head.x, cy: g.head.y, r: 12.5, fill: L.hair });
      const bun = off(g.head.x, g.head.y, hd, 12);
      s.push({ k: 'circle', cx: bun.x, cy: bun.y, r: 5.5, fill: L.hair });
    }
  }
  if (gender === 'd') s.push({ k: 'circle', cx: g.head.x, cy: g.head.y, r: 12.5, fill: L.hair });

  // Beine (Front: beide gleich), Rumpf
  if (!side) {
    leg(0, true);
    leg(1, true);
  } else {
    leg(0, true);
  }

  // Rumpf: gebogener Pfad (Seite) bzw. Trapez (Front)
  if (side) {
    s.push({ k: 'path', d: `M${g.hip.x} ${g.hip.y} Q${g.torsoCtrl.x} ${g.torsoCtrl.y} ${g.neck.x} ${g.neck.y}`, fill: 'none', stroke: L.shirt, w: gender === 'm' ? 19 : 17 });
  } else {
    const [sr, sl] = g.shoulders;
    const [hr, hl] = g.hips;
    const waistW = gender === 'w' ? 0.8 : 0.95;
    const mx = (g.hip.x + g.neck.x) / 2, my = (g.hip.y + g.neck.y) / 2;
    const wr = { x: mx + (sr.x - g.neck.x) * waistW, y: my + (sr.y - g.neck.y) * waistW };
    const wl = { x: mx + (sl.x - g.neck.x) * waistW, y: my + (sl.y - g.neck.y) * waistW };
    s.push({ k: 'path', d: `M${sl.x} ${sl.y} L${sr.x} ${sr.y} Q${wr.x} ${wr.y} ${hr.x} ${hr.y} L${hl.x} ${hl.y} Q${wl.x} ${wl.y} ${sl.x} ${sl.y} Z`, fill: L.shirt, stroke: L.shirt, w: 6 });
    s.push({ k: 'path', d: `M${hl.x} ${hl.y} L${hr.x} ${hr.y}`, fill: 'none', stroke: L.pants, w: 8 });
  }

  // Hals & Kopf
  const neckTop = off(g.neck.x, g.neck.y, hd, 7);
  line(g.neck, neckTop, L.skin, 7);
  s.push({ k: 'circle', cx: g.head.x, cy: g.head.y, r: 10, fill: L.skin });

  // Haare oben
  const crown = off(g.head.x, g.head.y, hd, 4);
  if (gender === 'm') {
    s.push({ k: 'circle', cx: crown.x, cy: crown.y, r: 8, fill: L.hair });
    if (side) {
      const backHair = off(g.head.x, g.head.y, hd + 90, 4);
      s.push({ k: 'circle', cx: backHair.x, cy: backHair.y, r: 7, fill: L.hair });
    }
    s.push({ k: 'circle', cx: g.head.x + (side ? Math.sin((hd - 90) * RAD) * 1.5 : 0), cy: g.head.y + (side ? Math.cos((hd - 90) * RAD) * 1.5 : 0), r: 8.6, fill: L.skin });
  } else {
    s.push({ k: 'circle', cx: crown.x, cy: crown.y, r: 8.5, fill: L.hair });
    const faceC = side ? off(g.head.x, g.head.y, hd - 90, 2.5) : off(g.head.x, g.head.y, hd + 180, 1.8);
    s.push({ k: 'circle', cx: faceC.x, cy: faceC.y, r: 8.2, fill: L.skin });
  }
  // Gesicht: Auge(n)
  if (side) {
    const eye = off(g.head.x, g.head.y, hd - 70, 5.5);
    s.push({ k: 'circle', cx: eye.x, cy: eye.y, r: 1.4, fill: '#1F1B2E' });
  } else {
    const c = off(g.head.x, g.head.y, hd + 180, 1);
    const e1 = off(c.x, c.y, hd + 90, 3.5);
    const e2 = off(c.x, c.y, hd - 90, 3.5);
    s.push({ k: 'circle', cx: e1.x, cy: e1.y, r: 1.3, fill: '#1F1B2E' });
    s.push({ k: 'circle', cx: e2.x, cy: e2.y, r: 1.3, fill: '#1F1B2E' });
  }

  // Arme vorne
  if (side) arm(0, true);
  else {
    arm(0, true);
    arm(1, true);
  }
  void far;
  return s;
};

// Für Tests/Export: Shapes als SVG-String
export const shapesToSvg = (shapes: Shape[], w = 220, h = 200) => {
  const body = shapes
    .map((x) => {
      if (x.k === 'line') return `<line x1="${x.x1}" y1="${x.y1}" x2="${x.x2}" y2="${x.y2}" stroke="${x.stroke}" stroke-width="${x.w}" stroke-linecap="round"/>`;
      if (x.k === 'circle') return `<circle cx="${x.cx}" cy="${x.cy}" r="${x.r}" fill="${x.fill}"/>`;
      if (x.k === 'rect') return `<rect x="${x.x}" y="${x.y}" width="${x.width}" height="${x.height}" rx="${x.rx ?? 0}" fill="${x.fill}"/>`;
      return `<path d="${x.d}" fill="${x.fill}" stroke="${x.stroke ?? 'none'}" stroke-width="${x.w ?? 0}" stroke-linecap="round" stroke-linejoin="round"/>`;
    })
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#E6FFF6"/><line x1="0" y1="188" x2="${w}" y2="188" stroke="#9AD8C2" stroke-width="2"/>${body}</svg>`;
};
