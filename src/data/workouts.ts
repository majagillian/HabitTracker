// Trainingsprogramme – Aufbau nach sportwissenschaftlichen Grundsätzen
// (Aufwärmen → Hauptteil → Abkühlen; Belastungsnormative nach ACSM-Empfehlungen für Einsteiger:innen)
import type { CyclePhase } from '@/lib/cycle';

export type BlockPhase = 'Aufwärmen' | 'Hauptteil' | 'Abkühlen' | 'Flow' | 'Entspannung';

export type Block = {
  ex: string; // Übungs-ID
  phase: BlockPhase;
  sec?: number; // Belastungszeit
  reps?: number; // Wiederholungen
  sets?: number;
  rest?: number; // Pause nach jedem Satz (s)
  breaths?: number; // Yoga: Anzahl Atemzüge (≈ 5 s)
  perSide?: boolean;
  note?: string;
};

export type WorkoutCategory = 'yoga' | 'yin' | 'ruecken' | 'kraft' | 'hiit' | 'mobil';

export type Workout = {
  id: string;
  name: string;
  category: WorkoutCategory;
  level: 1 | 2 | 3;
  focus: string;
  description: string;
  science: string; // Warum ist das Training so aufgebaut?
  phases: CyclePhase[]; // Zyklusphasen, in denen es gut passt
  blocks: Block[];
};

const BREATH_SEC = 5;

// Sonnengruß A (Surya Namaskar A) in der traditionellen Abfolge, ein Atemzug pro Bewegung
const sunA = (rounds: number): Block[] => {
  const one: Block[] = [
    { ex: 'tadasana', phase: 'Flow', breaths: 1, note: 'Samasthiti – ankommen' },
    { ex: 'urdhvaHastasana', phase: 'Flow', breaths: 1, note: 'Einatmen: Arme hoch' },
    { ex: 'uttanasana', phase: 'Flow', breaths: 1, note: 'Ausatmen: Vorbeuge' },
    { ex: 'ardhaUttanasana', phase: 'Flow', breaths: 1, note: 'Einatmen: Rücken lang' },
    { ex: 'chaturanga', phase: 'Flow', breaths: 1, note: 'Ausatmen: zurücksteigen und absenken' },
    { ex: 'upDog', phase: 'Flow', breaths: 1, note: 'Einatmen: Brust nach vorn' },
    { ex: 'downDog', phase: 'Flow', breaths: 5, note: 'Ausatmen: Hund, 5 Atemzüge' },
    { ex: 'ardhaUttanasana', phase: 'Flow', breaths: 1, note: 'Nach vorn steigen, einatmen' },
    { ex: 'uttanasana', phase: 'Flow', breaths: 1, note: 'Ausatmen' },
    { ex: 'urdhvaHastasana', phase: 'Flow', breaths: 1, note: 'Einatmen: aufrichten' },
    { ex: 'tadasana', phase: 'Flow', breaths: 1, note: 'Ausatmen: Hände zum Herzen' },
  ];
  return Array.from({ length: rounds }, (_, r) => one.map((b) => ({ ...b, note: `Runde ${r + 1}: ${b.note}` }))).flat();
};

export const WORKOUTS: Workout[] = [
  {
    id: 'sonnengruss-a', name: 'Sonnengruß A', category: 'yoga', level: 1, focus: 'Ganzkörper · Atem & Bewegung',
    description: 'Der klassische Sonnengruß A aus dem Ashtanga-/Vinyasa-Yoga: jede Bewegung auf einen Atemzug, 3 Runden.',
    science: 'Die atemsynchrone Abfolge wärmt den ganzen Körper auf, mobilisiert die Wirbelsäule in Beugung und Streckung und kräftigt Schultern und Rumpf. Der Hund mit 5 Atemzügen dient als Ruhepunkt.',
    phases: ['follikel', 'ovulation', 'luteal'],
    blocks: sunA(3),
  },
  {
    id: 'morgen-flow', name: 'Hatha-Flow am Morgen', category: 'yoga', level: 1, focus: 'Mobilität · Kraft · Balance',
    description: 'Ein vollständiger Ablauf: Ankommen, Aufwärmen am Boden, Sonnengrüße, Stehhaltungen, Balance, Rückbeuge, Drehung, Endentspannung.',
    science: 'Die Reihenfolge folgt dem üblichen Aufbau einer Hatha-Stunde: Erst mobilisieren (Katze-Kuh, Hund), dann über Sonnengrüße aufwärmen, danach Stehhaltungen und Balance. Rückbeugen kommen erst, wenn der Körper warm ist. Drehungen neutralisieren die Wirbelsäule, und Savasana dient der Regeneration (mindestens 3 Minuten).',
    phases: ['follikel', 'ovulation', 'luteal'],
    blocks: [
      { ex: 'meditation', phase: 'Aufwärmen', breaths: 6, note: 'Ankommen, Atem beobachten' },
      { ex: 'catCow', phase: 'Aufwärmen', breaths: 8 },
      { ex: 'child', phase: 'Aufwärmen', breaths: 4 },
      { ex: 'downDog', phase: 'Aufwärmen', breaths: 5 },
      ...sunA(2),
      { ex: 'warrior1', phase: 'Hauptteil', breaths: 5, perSide: true },
      { ex: 'warrior2', phase: 'Hauptteil', breaths: 5, perSide: true },
      { ex: 'trikonasana', phase: 'Hauptteil', breaths: 5, perSide: true },
      { ex: 'tree', phase: 'Hauptteil', breaths: 5, perSide: true },
      { ex: 'bridgeYoga', phase: 'Hauptteil', breaths: 5, sets: 2, rest: 15 },
      { ex: 'supineTwist', phase: 'Abkühlen', breaths: 6, perSide: true },
      { ex: 'savasana', phase: 'Entspannung', sec: 240 },
    ],
  },
  {
    id: 'yin-abend', name: 'Yin Yoga für den Abend', category: 'yin', level: 1, focus: 'Entspannung · Faszien · Hüfte',
    description: 'Passive Haltungen, die 3–5 Minuten gehalten werden. Ideal vor dem Schlafen oder an Tagen mit wenig Energie.',
    science: 'Im Yin Yoga wirken lange, passive Haltungen auf das Bindegewebe. Langsames Ausatmen aktiviert das parasympathische Nervensystem. Die Muskeln bleiben bewusst locker, gedehnt wird nur bis zur ersten Spannung, nie in den Schmerz.',
    phases: ['menstruation', 'luteal'],
    blocks: [
      { ex: 'child', phase: 'Aufwärmen', sec: 120 },
      { ex: 'butterflyYin', phase: 'Hauptteil', sec: 240 },
      { ex: 'caterpillar', phase: 'Hauptteil', sec: 240 },
      { ex: 'sphinx', phase: 'Hauptteil', sec: 180 },
      { ex: 'dragon', phase: 'Hauptteil', sec: 150, perSide: true },
      { ex: 'supineTwist', phase: 'Abkühlen', sec: 120, perSide: true },
      { ex: 'savasana', phase: 'Entspannung', sec: 300 },
    ],
  },
  {
    id: 'rueckenschule', name: 'Rückenschule (McGill Big 3)', category: 'ruecken', level: 1, focus: 'Stabiler, schmerzfreier Rücken',
    description: 'Mobilisation und die „Big 3“ nach Prof. Stuart McGill: Curl-up, Seitstütz und Vogel-Hund – mit kurzen Halteintervallen.',
    science: 'McGills „Big 3“ trainieren die Rumpfstabilität bei geringer Belastung der Lendenwirbelsäule. Statt langer Halteübungen wird 10 Sekunden gehalten und in absteigenden Pyramiden wiederholt (z. B. 5–3–1), das fördert Ausdauer ohne Ermüdungsfehler. Vorher wird sanft mobilisiert, danach entspannt.',
    phases: ['menstruation', 'follikel', 'ovulation', 'luteal'],
    blocks: [
      { ex: 'pelvicTilt', phase: 'Aufwärmen', reps: 10 },
      { ex: 'catCow', phase: 'Aufwärmen', reps: 8 },
      { ex: 'curlUp', phase: 'Hauptteil', reps: 5, sets: 3, rest: 20, note: '10 s halten · Pyramide 5-3-1 Wiederholungen' },
      { ex: 'sidePlankKnee', phase: 'Hauptteil', reps: 5, sets: 3, rest: 20, perSide: true, note: '10 s halten' },
      { ex: 'birdDog', phase: 'Hauptteil', reps: 6, sets: 3, rest: 20, perSide: true, note: '10 s halten' },
      { ex: 'gluteBridge', phase: 'Hauptteil', reps: 12, sets: 2, rest: 30 },
      { ex: 'child', phase: 'Abkühlen', sec: 60 },
      { ex: 'supineTwist', phase: 'Abkühlen', sec: 45, perSide: true },
    ],
  },
  {
    id: 'bbp', name: 'Bauch-Beine-Po', category: 'kraft', level: 2, focus: 'Kraft · Unterkörper · Rumpf',
    description: 'Ganzheitliches Kraftprogramm ohne Geräte mit Aufwärmen, 7 Übungen im Hauptteil und Dehnung.',
    science: 'Für den Kraftaufbau empfiehlt das ACSM (American College of Sports Medicine) 2–3 Sätze mit 8–15 Wiederholungen und 60–90 Sekunden Pause. Komplexe Übungen wie Kniebeuge und Ausfallschritt kommen zuerst, isolierte Übungen und der Rumpf danach. Statisches Dehnen folgt erst am Ende, weil es vor dem Krafttraining die Leistung mindern kann.',
    phases: ['follikel', 'ovulation', 'luteal'],
    blocks: [
      { ex: 'march', phase: 'Aufwärmen', sec: 60 },
      { ex: 'jumpingJack', phase: 'Aufwärmen', sec: 45 },
      { ex: 'armCircles', phase: 'Aufwärmen', sec: 30 },
      { ex: 'squat', phase: 'Aufwärmen', reps: 8, note: 'locker, halbe Tiefe' },
      { ex: 'squat', phase: 'Hauptteil', reps: 12, sets: 3, rest: 60 },
      { ex: 'lunge', phase: 'Hauptteil', reps: 10, sets: 3, rest: 60, perSide: true },
      { ex: 'gluteBridge', phase: 'Hauptteil', reps: 15, sets: 3, rest: 45 },
      { ex: 'donkeyKick', phase: 'Hauptteil', reps: 12, sets: 2, rest: 45, perSide: true },
      { ex: 'sideLegRaise', phase: 'Hauptteil', reps: 15, sets: 2, rest: 45, perSide: true },
      { ex: 'forearmPlank', phase: 'Hauptteil', sec: 30, sets: 3, rest: 30 },
      { ex: 'deadBug', phase: 'Hauptteil', reps: 10, sets: 2, rest: 30, perSide: true },
      { ex: 'hipFlexorStretch', phase: 'Abkühlen', sec: 40, perSide: true },
      { ex: 'quadStretch', phase: 'Abkühlen', sec: 30, perSide: true },
      { ex: 'child', phase: 'Abkühlen', sec: 60 },
    ],
  },
  {
    id: 'sieben-minuten', name: '7-Minuten-Training', category: 'hiit', level: 2, focus: 'Hochintensiv · Ganzkörper',
    description: 'Das Original-Protokoll von Klika & Jordan (2013): 12 Übungen à 30 Sekunden, 10 Sekunden Pause.',
    science: 'Das Zirkeltraining nach Klika & Jordan (ACSM\'s Health & Fitness Journal, 2013) wechselt Ober- und Unterkörper sowie Rumpf ab, damit sich jede Muskelgruppe kurz erholt, während der Puls hoch bleibt. Für die volle Wirkung sind 2–3 Durchgänge sinnvoll. Ein kurzes Aufwärmen ist vorgeschaltet.',
    phases: ['follikel', 'ovulation'],
    blocks: [
      { ex: 'march', phase: 'Aufwärmen', sec: 60 },
      { ex: 'armCircles', phase: 'Aufwärmen', sec: 30 },
      ...['jumpingJack', 'wallSit', 'pushUp', 'crunch', 'stepUp', 'squat', 'tricepsDip', 'forearmPlank', 'highKnees', 'lunge', 'pushUpRotation', 'sidePlank'].map(
        (ex): Block => ({ ex, phase: 'Hauptteil', sec: 30, rest: 10 }),
      ),
      { ex: 'quadStretch', phase: 'Abkühlen', sec: 30, perSide: true },
      { ex: 'hamstringStretch', phase: 'Abkühlen', sec: 30, perSide: true },
    ],
  },
  {
    id: 'schreibtisch', name: 'Schreibtisch-Pause', category: 'mobil', level: 1, focus: 'Nacken · Schultern · Rücken',
    description: '6 Minuten Mobilität gegen langes Sitzen – im Stehen, ohne Matte.',
    science: 'Langes Sitzen verkürzt Hüftbeuger und Brustmuskulatur und belastet den Nacken. Kurze, aktive Bewegungspausen alle 30–60 Minuten verbessern die Durchblutung und mindern Verspannungen besser als eine einzige lange Einheit.',
    phases: ['menstruation', 'follikel', 'ovulation', 'luteal'],
    blocks: [
      { ex: 'shoulderRoll', phase: 'Hauptteil', sec: 30 },
      { ex: 'neckStretch', phase: 'Hauptteil', sec: 40 },
      { ex: 'chestOpener', phase: 'Hauptteil', sec: 30, sets: 2, rest: 10 },
      { ex: 'standingTwist', phase: 'Hauptteil', sec: 40 },
      { ex: 'sideBend', phase: 'Hauptteil', sec: 40 },
      { ex: 'hipFlexorStretch', phase: 'Hauptteil', sec: 30, perSide: true },
      { ex: 'squat', phase: 'Hauptteil', reps: 10 },
    ],
  },
];

// Level-Anpassung: Anfänger:innen weniger, Fortgeschrittene mehr Volumen
export const scaleBlock = (b: Block, level: 1 | 2 | 3): Block => {
  if (b.phase === 'Flow' || b.phase === 'Entspannung' || b.breaths) return b;
  const f = level === 1 ? 0.75 : level === 3 ? 1.3 : 1;
  return {
    ...b,
    reps: b.reps ? Math.max(3, Math.round(b.reps * f)) : undefined,
    sec: b.sec && b.phase === 'Hauptteil' ? Math.round((b.sec * f) / 5) * 5 : b.sec,
    sets: b.sets ? Math.max(1, b.sets + (level === 1 ? -1 : level === 3 ? 1 : 0)) : undefined,
  };
};

// Dauer eines Blocks in Sekunden (inkl. Pausen und beider Seiten)
export const blockSeconds = (b: Block): number => {
  const work = b.breaths ? b.breaths * BREATH_SEC : b.sec ?? (b.reps ?? 10) * 3;
  const sets = b.sets ?? 1;
  const sides = b.perSide ? 2 : 1;
  return (work * sides + (b.rest ?? 0)) * sets;
};

export const workoutMinutes = (w: Workout, level: 1 | 2 | 3 = w.level) =>
  Math.max(1, Math.round(w.blocks.map((b) => scaleBlock(b, level)).reduce((s, b) => s + blockSeconds(b), 0) / 60));

// Ablauf als einzelne Schritte für den Player (Satz × Seite)
export type Step = { block: Block; set: number; sets: number; side?: 'rechts' | 'links'; seconds: number; label: string };

export const buildSteps = (w: Workout, level: 1 | 2 | 3): Step[] => {
  const steps: Step[] = [];
  for (const raw of w.blocks) {
    const b = scaleBlock(raw, level);
    const sets = b.sets ?? 1;
    for (let s = 1; s <= sets; s++) {
      const sides: ('rechts' | 'links' | undefined)[] = b.perSide ? ['rechts', 'links'] : [undefined];
      for (const side of sides) {
        const seconds = b.breaths ? b.breaths * BREATH_SEC : b.sec ?? (b.reps ?? 10) * 3;
        const amount = b.breaths ? `${b.breaths} ${b.breaths === 1 ? 'Atemzug' : 'Atemzüge'}` : b.sec ? `${b.sec} s` : `${b.reps} Wdh.`;
        steps.push({ block: b, set: s, sets, side, seconds, label: amount });
      }
    }
  }
  return steps;
};

export const CATEGORY_LABEL: Record<WorkoutCategory, string> = {
  yoga: 'Yoga', yin: 'Yin Yoga', ruecken: 'Rücken', kraft: 'Kraft', hiit: 'HIIT', mobil: 'Mobilität',
};
