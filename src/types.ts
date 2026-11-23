// Zentrale Datentypen der App „Dein Tag“

export type ISODate = string; // Format JJJJ-MM-TT

export type ModuleId =
  | 'todos'
  | 'kalender'
  | 'habits'
  | 'zyklus'
  | 'checkin'
  | 'uebungen'
  | 'tagebuch'
  | 'fitness'
  | 'ernaehrung'
  | 'einkauf'
  | 'bildschirmzeit'
  | 'momente'
  | 'haushalt'
  | 'medikamente'
  | 'sterne';

export type Gender = 'w' | 'm' | 'd';

export type Profile = {
  name: string;
  gender: Gender;
  age: number;
  heightCm: number;
  weightKg: number;
  goodFor: string[]; // „Das tut mir gut“
  badFor: string[]; // „Das tut mir nicht gut“
  maxEventsPerDay: number; // Ab wie vielen Terminen wird es zu viel?
};

export type NotifId =
  | 'todos'
  | 'termine'
  | 'arztFolge'
  | 'habits'
  | 'periode'
  | 'eisprung'
  | 'pms'
  | 'zyklusHinweise'
  | 'pille'
  | 'checkin'
  | 'tagebuch'
  | 'fitness'
  | 'bildschirmzeit'
  | 'auslastung'
  | 'medikamente'
  | 'haushalt'
  | 'horoskop';

export type NotifSetting = { on: boolean; hour: number; minute: number };

export type CycleMode = 'tracken' | 'kinderwunsch';
export type CheckinMode = 'taeglich' | 'zweimal' | 'manuell';
export type FitnessMode = 'home' | 'kurse' | 'beides';
export type ThemeMode = 'system' | 'hell' | 'dunkel';

export type Settings = {
  onboarded: boolean;
  modules: Record<ModuleId, boolean>;
  cycleMode: CycleMode;
  checkinMode: CheckinMode;
  checkinTimes: { hour: number; minute: number }[];
  fitnessMode: FitnessMode;
  cycleBasedTraining: boolean;
  notifications: Record<NotifId, NotifSetting>;
  theme: ThemeMode;
  largeText: boolean;
  screenTimeLimitMin: number;
  storage: 'lokal'; // Cloud-Sync folgt in Phase 2
};

// ---------- To-dos ----------
export type Priority = 1 | 2 | 3; // 1 = hoch, 3 = niedrig
export type Energy = 1 | 2 | 3; // benötigte Energie
export type Repeat = 'keine' | 'taeglich' | 'woechentlich' | 'monatlich';

export type Subtask = { id: string; title: string; done: boolean };

export type Todo = {
  id: string;
  title: string;
  notes: string;
  due?: ISODate;
  priority: Priority;
  important: boolean;
  urgent: boolean;
  energy: Energy;
  area: string;
  subtasks: Subtask[];
  repeat: Repeat;
  done: boolean;
  doneAt?: string;
  createdAt: string;
};

// ---------- Gewohnheiten ----------
export type Habit = {
  id: string;
  title: string;
  startDate: ISODate;
  timesPerWeek: number; // 7 = täglich
  log: ISODate[]; // Tage, an denen erledigt
  pauses: ISODate[]; // Pausentage (schützen die Serie)
  color: string;
  archived: boolean;
};

// ---------- Kalender ----------
export type EventCategory = 'arzt' | 'freunde' | 'familie' | 'arbeit' | 'sport' | 'selbst' | 'sonstiges';

export type CalEvent = {
  id: string;
  title: string;
  date: ISODate;
  start: string; // HH:MM
  end?: string;
  category: EventCategory;
  priority: Priority;
  remindMin: number | null; // Minuten vorher, null = keine Erinnerung
  notes: string;
  doctorIntervalMonths?: number; // Nur bei Arztterminen: Rhythmus
  followUpBooked?: boolean;
};

// ---------- Zyklus ----------
export type Contraception = 'keine' | 'pille' | 'minipille' | 'hormonspirale' | 'kupferspirale' | 'ring' | 'pflaster' | 'kondom' | 'andere';

export type PeriodEntry = { start: ISODate; end?: ISODate };

export type DayLog = {
  flow?: 0 | 1 | 2 | 3; // 0 = Schmierblutung, 3 = stark
  symptoms: string[];
  sex?: 'verhuetet' | 'unverhuetet';
  pillTaken?: boolean;
  test?: 'positiv' | 'negativ';
  temp?: number; // Basaltemperatur (optional)
};

export type CycleData = {
  setupDone: boolean;
  avgPeriodLen: number;
  avgCycleLen: number;
  periods: PeriodEntry[];
  logs: Record<ISODate, DayLog>;
  contraception: Contraception;
  hormonalBreak: { enabled: boolean; days: number; startDate?: ISODate };
  pillHour: number;
  pillMinute: number;
};

// ---------- Achtsamkeit ----------
export type CheckIn = {
  id: string;
  date: ISODate;
  time: string;
  mood: number; // 0–4
  energy: number;
  sleep: number;
  noise: number; // innere Lautstärke / Anspannung 0 = ruhig
  good: string[];
  note: string;
};

export type JournalDay = {
  morning?: { grat: string[]; intent: string; affirmation: string; great: string };
  evening?: { moments: string[]; goodDeed: string; improve: string };
};

// ---------- Fitness ----------
export type Session = {
  id: string;
  date: ISODate;
  title: string;
  workoutId?: string;
  minutes: number;
  type: 'home' | 'kurs';
};

export type TrainingPlanEntry = {
  id: string;
  weekday: number; // 1 = Montag … 7 = Sonntag
  time: string;
  title: string;
  workoutId?: string; // Home-Training
  addToCalendar: boolean;
};

// ---------- Einkauf ----------
export type ShopCategory = 'lebensmittel' | 'getraenke' | 'drogerie' | 'haushalt' | 'kleidung' | 'apotheke' | 'sonstiges';
export type ShopItem = { id: string; name: string; qty: string; category: ShopCategory; done: boolean };

// ---------- Ernährung ----------
export type NutritionGoal = 'abnehmen' | 'halten' | 'zunehmen';
export type Meal = 'fruehstueck' | 'mittag' | 'abend' | 'snack';

export type Food = {
  id: string;
  name: string;
  kcal: number; // pro 100 g
  p: number; // Eiweiß g/100 g
  c: number; // Kohlenhydrate
  f: number; // Fett
  fiber: number; // Ballaststoffe
  sugar: number;
  vegan: boolean;
  portion: number; // typische Portion in g
  group: string; // Lebensmittelgruppe
};

export type FoodEntry = {
  id: string;
  date: ISODate;
  meal: Meal;
  name: string;
  grams: number;
  kcal: number;
  p: number;
  c: number;
  f: number;
  fiber: number;
  sugar: number;
  group: string;
};

// ---------- Marmeladenglas-Momente ----------
export type MediaKind = 'bild' | 'video' | 'audio';
export type MediaItem = { id: string; kind: MediaKind; uri: string; durationSec?: number };
export type Moment = { id: string; date: ISODate; title: string; text: string; feeling: string; media: MediaItem[]; createdAt: string };

// ---------- Haushalt ----------
export type Chore = {
  id: string;
  name: string;
  room: string;
  intervalDays: number;
  weekday: number | null; // bevorzugter Wochentag (1–7) oder null = egal
  lastDone?: ISODate;
  active: boolean;
  todoId?: string; // aktuell offenes To-do
};

// ---------- Medikamente ----------
export type Medication = {
  id: string;
  name: string;
  dose: string; // z. B. „1 Tablette“, „400 mg“
  times: string[]; // HH:MM
  days: number[]; // Wochentage 1–7; leer = täglich
  everyNDays?: number; // alternativ: alle n Tage ab Start
  start: ISODate;
  end?: ISODate;
  withFood: 'egal' | 'vorher' | 'zum' | 'nachher';
  stock?: number; // Vorrat in Einheiten
  perDose: number; // Verbrauch pro Einnahme
  refillWarnDays: number;
  notes: string;
  remind: boolean;
  active: boolean;
};
export type MedLog = Record<string, 'genommen' | 'ausgelassen'>; // Schlüssel: medId|datum|uhrzeit

// ---------- Sterne ----------
export type AstroProfile = {
  birthDate?: ISODate;
  birthTime?: string; // HH:MM (Ortszeit)
  utcOffsetMin?: number; // Zeitzone zur Geburt in Minuten (z. B. 60 = MEZ)
  place?: { name: string; lat: number; lon: number };
  manual?: { sun?: string; moon?: string; asc?: string }; // eigene Angaben überschreiben die Berechnung
};
export type TarotReading = { id: string; date: ISODate; spread: string; question: string; cards: { card: number; reversed: boolean }[] };

// ---------- Gamification ----------
export type Gamification = {
  xp: number;
  score: number; // 0–100, sinkt bei Inaktivität
  lastOpen: ISODate;
  badges: string[];
  freezes: number; // Pausentage pro Monat
  freezeMonth: string;
  tagiLevel: number;
  scoreHistory: Record<ISODate, number>;
};
