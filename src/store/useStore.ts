// Zentraler App-Zustand mit Zustand + lokaler Speicherung (AsyncStorage)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { addDays, diffDays, today, weekday } from '@/lib/date';
import { uid } from '@/lib/id';
import { celebrate } from '@/store/useUi';
import { formatAmount, RECIPES, scaleIngredients, type Diet } from '@/data/recipes';
import type {
  AstroProfile,
  Chore,
  MedLog,
  Medication,
  Moment,
  TarotReading,
  CalEvent,
  CheckIn,
  CycleData,
  DayLog,
  FoodEntry,
  Food,
  Gamification,
  Habit,
  ISODate,
  JournalDay,
  NotifId,
  NotifSetting,
  NutritionGoal,
  Profile,
  Session,
  Settings,
  ShopItem,
  Todo,
  TrainingPlanEntry,
} from '@/types';

const n = (on: boolean, hour: number, minute = 0): NotifSetting => ({ on, hour, minute });

export const defaultSettings: Settings = {
  onboarded: false,
  modules: {
    todos: true,
    kalender: true,
    habits: true,
    zyklus: false,
    checkin: true,
    uebungen: true,
    tagebuch: false,
    fitness: false,
    ernaehrung: false,
    einkauf: false,
    bildschirmzeit: false,
    momente: true,
    haushalt: false,
    medikamente: false,
    sterne: false,
  },
  cycleMode: 'tracken',
  checkinMode: 'taeglich',
  checkinTimes: [{ hour: 20, minute: 0 }],
  fitnessMode: 'beides',
  cycleBasedTraining: true,
  notifications: {
    todos: n(true, 8),
    termine: n(true, 0),
    arztFolge: n(true, 9),
    habits: n(true, 19),
    periode: n(true, 9),
    eisprung: n(false, 9),
    pms: n(true, 9),
    zyklusHinweise: n(false, 9),
    pille: n(false, 21),
    checkin: n(true, 20),
    tagebuch: n(false, 7, 30),
    fitness: n(false, 17),
    bildschirmzeit: n(true, 0),
    auslastung: n(true, 18),
    medikamente: n(true, 8),
    haushalt: n(true, 9),
    horoskop: n(false, 8),
  },
  theme: 'system',
  largeText: false,
  screenTimeLimitMin: 180,
  storage: 'lokal',
};

export const defaultProfile: Profile = {
  name: '',
  gender: 'w',
  age: 30,
  heightCm: 168,
  weightKg: 65,
  goodFor: ['Treffen mit Freunden', 'Sport', 'Zeit mit Familie', 'Wenig Bildschirmzeit'],
  badFor: ['Zu viele Termine', 'Wenig Me-Time'],
  maxEventsPerDay: 4,
};

const defaultCycle: CycleData = {
  setupDone: false,
  avgPeriodLen: 5,
  avgCycleLen: 28,
  periods: [],
  logs: {},
  contraception: 'keine',
  hormonalBreak: { enabled: false, days: 7 },
  pillHour: 21,
  pillMinute: 0,
};

const defaultGame: Gamification = {
  xp: 0,
  score: 50,
  lastOpen: today(),
  badges: [],
  freezes: 2,
  freezeMonth: today().slice(0, 7),
  tagiLevel: 1,
  scoreHistory: {},
};

export type AppState = {
  profile: Profile;
  settings: Settings;
  todos: Todo[];
  habits: Habit[];
  events: CalEvent[];
  cycle: CycleData;
  checkins: CheckIn[];
  journal: Record<ISODate, JournalDay>;
  sessions: Session[];
  plan: TrainingPlanEntry[];
  shopping: ShopItem[];
  foods: FoodEntry[];
  customFoods: Food[];
  nutritionGoal: NutritionGoal;
  screenTime: Record<ISODate, number>; // Minuten pro Tag
  game: Gamification;
  moments: Moment[];
  chores: Chore[];
  meds: Medication[];
  medLog: MedLog;
  astro: AstroProfile;
  tarot: TarotReading[];
  recipePrefs: { favorites: string[]; ratings: Record<string, RecipeRating>; likedIngredients: string[]; diet: Diet };
  mealPlan: Record<ISODate, string[]>;

  // Allgemein
  setProfile: (p: Partial<Profile>) => void;
  setSettings: (s: Partial<Settings>) => void;
  setNotif: (id: NotifId, v: Partial<NotifSetting>) => void;
  onAppOpen: () => void;
  addXp: (amount: number, reason: string, big?: boolean) => void;
  addBadge: (badge: string) => void;
  importAll: (data: Partial<AppState>) => void;
  resetAll: () => void;

  // To-dos
  saveTodo: (t: Partial<Todo> & { title: string }) => void;
  toggleTodo: (id: string) => void;
  toggleSubtask: (todoId: string, subId: string) => void;
  postponeTodo: (id: string) => void;
  deleteTodo: (id: string) => void;

  // Habits
  saveHabit: (h: Partial<Habit> & { title: string }) => void;
  toggleHabit: (id: string, date?: ISODate) => void;
  pauseHabit: (id: string, date?: ISODate) => boolean;
  deleteHabit: (id: string) => void;

  // Kalender
  saveEvent: (e: Partial<CalEvent> & { title: string; date: ISODate }) => void;
  deleteEvent: (id: string) => void;

  // Zyklus
  setCycle: (c: Partial<CycleData>) => void;
  startPeriod: (date?: ISODate) => void;
  endPeriod: (date?: ISODate) => void;
  logDay: (date: ISODate, patch: Partial<DayLog>) => void;

  // Achtsamkeit
  addCheckin: (c: Omit<CheckIn, 'id'>) => void;
  saveJournal: (date: ISODate, part: JournalDay) => void;
  finishExercise: (name: string) => void;

  // Fitness
  addSession: (s: Omit<Session, 'id'>) => void;
  savePlanEntry: (p: Partial<TrainingPlanEntry> & { title: string; weekday: number; time: string }) => void;
  deletePlanEntry: (id: string) => void;

  // Einkauf
  saveShopItem: (i: Partial<ShopItem> & { name: string }) => void;
  toggleShopItem: (id: string) => void;
  clearDoneShopItems: () => void;
  deleteShopItem: (id: string) => void;

  // Ernährung
  addFood: (f: Omit<FoodEntry, 'id'>) => void;
  deleteFood: (id: string) => void;
  addCustomFood: (f: Food) => void;
  setNutritionGoal: (g: NutritionGoal) => void;

  // Bildschirmzeit
  setScreenTime: (date: ISODate, minutes: number) => void;

  // Marmeladenglas
  saveMoment: (m: Partial<Moment> & { title: string }) => void;
  deleteMoment: (id: string) => void;

  // Haushalt
  saveChore: (c: Partial<Chore> & { name: string; intervalDays: number }) => void;
  deleteChore: (id: string) => void;
  syncChores: () => void;

  // Medikamente
  saveMed: (m: Partial<Medication> & { name: string }) => void;
  deleteMed: (id: string) => void;
  logMed: (key: string, v: 'genommen' | 'ausgelassen' | null) => void;

  // Sterne
  setAstro: (a: Partial<AstroProfile>) => void;
  addTarot: (r: Omit<TarotReading, 'id'>) => void;

  // Rezepte
  setRecipePrefs: (p: Partial<AppState['recipePrefs']>) => void;
  toggleFavRecipe: (id: string) => void;
  rateRecipe: (id: string, r: RecipeRating | null) => void;
  setMealPlan: (date: ISODate, ids: string[]) => void;
  addRecipeToShopping: (recipeId: string, servings: number) => number;
};

export type RecipeRating = 'lecker' | 'okay' | 'nicht';

// Nächster Termin einer Haushaltsaufgabe: letzter Termin + Intervall, dann auf den Wunsch-Wochentag schieben
export const nextChoreDate = (c: Chore): ISODate => {
  let due = c.lastDone ? addDays(c.lastDone, c.intervalDays) : today();
  if (due < today()) due = today();
  if (c.weekday && c.intervalDays >= 7) {
    const wd = weekday(due);
    const shift = (c.weekday - wd + 7) % 7;
    due = addDays(due, shift);
  }
  return due;
};

// Level aus XP: jedes Level braucht etwas mehr XP
export const levelFromXp = (xp: number) => {
  let level = 1;
  let need = 100;
  let rest = xp;
  while (rest >= need) {
    rest -= need;
    level++;
    need = 100 + (level - 1) * 50;
  }
  return { level, current: rest, needed: need };
};

const initialData = {
  profile: defaultProfile,
  settings: defaultSettings,
  todos: [] as Todo[],
  habits: [] as Habit[],
  events: [] as CalEvent[],
  cycle: defaultCycle,
  checkins: [] as CheckIn[],
  journal: {} as Record<ISODate, JournalDay>,
  sessions: [] as Session[],
  plan: [] as TrainingPlanEntry[],
  shopping: [] as ShopItem[],
  foods: [] as FoodEntry[],
  customFoods: [] as Food[],
  nutritionGoal: 'halten' as NutritionGoal,
  screenTime: {} as Record<ISODate, number>,
  game: defaultGame,
  moments: [] as Moment[],
  chores: [] as Chore[],
  meds: [] as Medication[],
  medLog: {} as MedLog,
  astro: {} as AstroProfile,
  tarot: [] as TarotReading[],
  recipePrefs: { favorites: [] as string[], ratings: {} as Record<string, RecipeRating>, likedIngredients: [] as string[], diet: 'alles' as Diet },
  mealPlan: {} as Record<ISODate, string[]>,
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialData,

      setProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),
      setSettings: (p) => set((s) => ({ settings: { ...s.settings, ...p } })),
      setNotif: (id, v) =>
        set((s) => ({
          settings: { ...s.settings, notifications: { ...s.settings.notifications, [id]: { ...s.settings.notifications[id], ...v } } },
        })),

      // Score sinkt pro inaktivem Tag; neue Pausentage jeden Monat
      onAppOpen: () =>
        set((s) => {
          const t = today();
          const away = Math.max(0, diffDays(t, s.game.lastOpen) - 1);
          let score = s.game.score;
          if (away > 0) score = Math.max(0, score - Math.min(60, away * 6));
          const month = t.slice(0, 7);
          const freezes = month !== s.game.freezeMonth ? 2 : s.game.freezes;
          return {
            game: {
              ...s.game,
              score,
              lastOpen: t,
              freezes,
              freezeMonth: month,
              scoreHistory: { ...s.game.scoreHistory, [t]: score },
            },
          };
        }),

      addXp: (amount, reason, big = false) => {
        const before = levelFromXp(get().game.xp).level;
        set((s) => {
          const score = Math.min(100, s.game.score + Math.max(1, Math.round(amount / 5)));
          const xp = s.game.xp + amount;
          return {
            game: {
              ...s.game,
              xp,
              score,
              tagiLevel: 1 + Math.floor(xp / 400),
              scoreHistory: { ...s.game.scoreHistory, [today()]: score },
            },
          };
        });
        const after = levelFromXp(get().game.xp).level;
        if (after > before) celebrate(`Level ${after} erreicht!`, `+${amount} XP · ${reason}`, true);
        else celebrate(reason, `+${amount} XP`, big);
      },

      addBadge: (badge) =>
        set((s) => (s.game.badges.includes(badge) ? s : { game: { ...s.game, badges: [...s.game.badges, badge] } })),

      importAll: (data) => set(() => ({ ...initialData, ...data })),
      resetAll: () => set(() => ({ ...initialData, game: { ...defaultGame, lastOpen: today() } })),

      // ---------- To-dos ----------
      saveTodo: (t) =>
        set((s) => {
          if (t.id && s.todos.some((x) => x.id === t.id)) {
            return { todos: s.todos.map((x) => (x.id === t.id ? { ...x, ...t } : x)) };
          }
          const todo: Todo = {
            id: uid(),
            notes: '',
            priority: 2,
            important: false,
            urgent: false,
            energy: 2,
            area: 'Allgemein',
            subtasks: [],
            repeat: 'keine',
            done: false,
            createdAt: new Date().toISOString(),
            ...t,
          };
          return { todos: [todo, ...s.todos] };
        }),

      toggleTodo: (id) => {
        const t = get().todos.find((x) => x.id === id);
        if (!t) return;
        const nowDone = !t.done;
        // Haushaltsaufgabe erledigt → Zeitpunkt merken, nächste Aufgabe wird erzeugt
        const chore = get().chores.find((c) => c.todoId === id);
        if (chore && nowDone) {
          set((s) => ({ chores: s.chores.map((c) => (c.id === chore.id ? { ...c, lastDone: today(), todoId: undefined } : c)) }));
        }
        set((s) => {
          let todos = s.todos.map((x) => (x.id === id ? { ...x, done: nowDone, doneAt: nowDone ? new Date().toISOString() : undefined } : x));
          // Wiederkehrende Aufgaben: nächste Instanz anlegen
          if (nowDone && t.repeat !== 'keine') {
            const base = t.due ?? today();
            const next = t.repeat === 'taeglich' ? addDays(base, 1) : t.repeat === 'woechentlich' ? addDays(base, 7) : addDays(base, 30);
            todos = [{ ...t, id: uid(), done: false, doneAt: undefined, due: next, subtasks: t.subtasks.map((st) => ({ ...st, done: false })), createdAt: new Date().toISOString() }, ...todos];
          }
          return { todos };
        });
        if (nowDone) get().addXp(t.priority === 1 ? 20 : 10, chore ? 'Haushalt erledigt' : 'To-do erledigt');
        if (chore && nowDone) get().syncChores();
      },

      toggleSubtask: (todoId, subId) =>
        set((s) => ({
          todos: s.todos.map((x) =>
            x.id === todoId ? { ...x, subtasks: x.subtasks.map((st) => (st.id === subId ? { ...st, done: !st.done } : st)) } : x,
          ),
        })),

      postponeTodo: (id) =>
        set((s) => ({ todos: s.todos.map((x) => (x.id === id ? { ...x, due: addDays(x.due && x.due > today() ? x.due : today(), 1) } : x)) })),

      deleteTodo: (id) => set((s) => ({ todos: s.todos.filter((x) => x.id !== id) })),

      // ---------- Habits ----------
      saveHabit: (h) =>
        set((s) => {
          if (h.id && s.habits.some((x) => x.id === h.id)) {
            return { habits: s.habits.map((x) => (x.id === h.id ? { ...x, ...h } : x)) };
          }
          const habit: Habit = { id: uid(), startDate: today(), timesPerWeek: 7, log: [], pauses: [], color: '#7C3AED', archived: false, ...h };
          return { habits: [...s.habits, habit] };
        }),

      toggleHabit: (id, date = today()) => {
        const h = get().habits.find((x) => x.id === id);
        if (!h) return;
        const done = h.log.includes(date);
        set((s) => ({
          habits: s.habits.map((x) => (x.id === id ? { ...x, log: done ? x.log.filter((d) => d !== date) : [...x.log, date] } : x)),
        }));
        if (!done) {
          const all = get().habits.filter((x) => !x.archived);
          const allDone = all.length > 0 && all.every((x) => x.log.includes(date));
          get().addXp(allDone ? 40 : 15, allDone ? 'Alle Gewohnheiten geschafft!' : `${h.title} erledigt`, allDone);
        }
      },

      pauseHabit: (id, date = today()) => {
        const g = get().game;
        if (g.freezes <= 0) return false;
        set((s) => ({
          habits: s.habits.map((x) => (x.id === id && !x.pauses.includes(date) ? { ...x, pauses: [...x.pauses, date] } : x)),
          game: { ...s.game, freezes: s.game.freezes - 1 },
        }));
        return true;
      },

      deleteHabit: (id) => set((s) => ({ habits: s.habits.filter((x) => x.id !== id) })),

      // ---------- Kalender ----------
      saveEvent: (e) =>
        set((s) => {
          if (e.id && s.events.some((x) => x.id === e.id)) {
            return { events: s.events.map((x) => (x.id === e.id ? { ...x, ...e } : x)) };
          }
          const ev: CalEvent = { id: uid(), start: '09:00', category: 'sonstiges', priority: 2, remindMin: 30, notes: '', ...e };
          return { events: [...s.events, ev] };
        }),
      deleteEvent: (id) => set((s) => ({ events: s.events.filter((x) => x.id !== id) })),

      // ---------- Zyklus ----------
      setCycle: (c) => set((s) => ({ cycle: { ...s.cycle, ...c } })),
      startPeriod: (date = today()) => {
        set((s) => {
          const periods = s.cycle.periods.filter((p) => p.start !== date);
          periods.push({ start: date });
          periods.sort((a, b) => (a.start < b.start ? -1 : 1));
          const prevLog = s.cycle.logs[date];
          const logs = { ...s.cycle.logs, [date]: { ...prevLog, symptoms: prevLog?.symptoms ?? [], flow: prevLog?.flow ?? 2 } };
          return { cycle: { ...s.cycle, periods, logs } };
        });
        get().addXp(10, 'Periode eingetragen');
      },
      endPeriod: (date = today()) =>
        set((s) => {
          const periods = [...s.cycle.periods];
          const last = periods[periods.length - 1];
          if (last && !last.end && date >= last.start) periods[periods.length - 1] = { ...last, end: date };
          return { cycle: { ...s.cycle, periods } };
        }),
      logDay: (date, patch) =>
        set((s) => ({ cycle: { ...s.cycle, logs: { ...s.cycle.logs, [date]: { ...s.cycle.logs[date], ...patch, symptoms: patch.symptoms ?? s.cycle.logs[date]?.symptoms ?? [] } } } })),

      // ---------- Achtsamkeit ----------
      addCheckin: (c) => {
        set((s) => ({ checkins: [...s.checkins, { ...c, id: uid() }] }));
        const count = get().checkins.length;
        if (count === 1) get().addBadge('Erster Check-in');
        if (count === 30) get().addBadge('30 Check-ins');
        get().addXp(20, 'Check-in geschafft', true);
      },
      saveJournal: (date, part) => {
        const before = get().journal[date] ?? {};
        set((s) => ({ journal: { ...s.journal, [date]: { ...s.journal[date], ...part } } }));
        const isNew = (part.morning && !before.morning) || (part.evening && !before.evening);
        if (isNew) get().addXp(15, part.morning ? 'Morgen-Glas verschlossen' : 'Abendhimmel gespeichert', true);
      },
      finishExercise: (name) => get().addXp(15, `${name} abgeschlossen`, true),

      // ---------- Fitness ----------
      addSession: (x) => {
        set((s) => ({ sessions: [...s.sessions, { ...x, id: uid() }] }));
        const count = get().sessions.length;
        if (count === 1) get().addBadge('Erstes Training');
        if (count === 10) get().addBadge('Bewegungstalent');
        get().addXp(40, 'Training geschafft', true);
      },
      savePlanEntry: (p) =>
        set((s) => {
          if (p.id && s.plan.some((x) => x.id === p.id)) return { plan: s.plan.map((x) => (x.id === p.id ? { ...x, ...p } : x)) };
          return { plan: [...s.plan, { id: uid(), addToCalendar: true, ...p }] };
        }),
      deletePlanEntry: (id) => set((s) => ({ plan: s.plan.filter((x) => x.id !== id) })),

      // ---------- Einkauf ----------
      saveShopItem: (i) =>
        set((s) => {
          if (i.id && s.shopping.some((x) => x.id === i.id)) return { shopping: s.shopping.map((x) => (x.id === i.id ? { ...x, ...i } : x)) };
          return { shopping: [...s.shopping, { id: uid(), qty: '', category: 'lebensmittel', done: false, ...i }] };
        }),
      toggleShopItem: (id) => set((s) => ({ shopping: s.shopping.map((x) => (x.id === id ? { ...x, done: !x.done } : x)) })),
      clearDoneShopItems: () => set((s) => ({ shopping: s.shopping.filter((x) => !x.done) })),
      deleteShopItem: (id) => set((s) => ({ shopping: s.shopping.filter((x) => x.id !== id) })),

      // ---------- Ernährung ----------
      addFood: (f) => {
        set((s) => ({ foods: [...s.foods, { ...f, id: uid() }] }));
        get().addXp(3, 'Mahlzeit erfasst');
      },
      deleteFood: (id) => set((s) => ({ foods: s.foods.filter((x) => x.id !== id) })),
      addCustomFood: (f) => set((s) => ({ customFoods: [...s.customFoods.filter((x) => x.id !== f.id), f] })),
      setNutritionGoal: (g) => set(() => ({ nutritionGoal: g })),

      // ---------- Bildschirmzeit ----------
      setScreenTime: (date, minutes) => set((s) => ({ screenTime: { ...s.screenTime, [date]: Math.max(0, Math.round(minutes)) } })),

      // ---------- Marmeladenglas ----------
      saveMoment: (m) => {
        const exists = !!m.id && get().moments.some((x) => x.id === m.id);
        set((s) => {
          if (exists) return { moments: s.moments.map((x) => (x.id === m.id ? { ...x, ...m } : x)) };
          return { moments: [{ id: uid(), date: today(), text: '', feeling: 'Glücklich', media: [], createdAt: new Date().toISOString(), ...m }, ...s.moments] };
        });
        if (!exists) {
          get().addXp(15, 'Moment ins Glas gelegt', true);
          if (get().moments.length === 10) get().addBadge('Volles Glas');
        }
      },
      deleteMoment: (id) => set((s) => ({ moments: s.moments.filter((x) => x.id !== id) })),

      // ---------- Haushalt ----------
      saveChore: (c) => {
        set((s) => {
          if (c.id && s.chores.some((x) => x.id === c.id)) {
            // Rhythmus geändert → offenes To-do neu berechnen lassen
            const old = s.chores.find((x) => x.id === c.id)!;
            return {
              chores: s.chores.map((x) => (x.id === c.id ? { ...x, ...c, todoId: undefined } : x)),
              todos: old.todoId ? s.todos.filter((t) => t.id !== old.todoId || t.done) : s.todos,
            };
          }
          return { chores: [...s.chores, { id: uid(), room: 'Allgemein', weekday: null, active: true, ...c }] };
        });
        get().syncChores();
      },
      deleteChore: (id) =>
        set((s) => {
          const c = s.chores.find((x) => x.id === id);
          return { chores: s.chores.filter((x) => x.id !== id), todos: c?.todoId ? s.todos.filter((t) => t.id !== c.todoId) : s.todos };
        }),
      // Für jede aktive Haushaltsaufgabe genau ein offenes To-do mit dem nächsten Termin
      syncChores: () =>
        set((s) => {
          let todos = [...s.todos];
          const chores = s.chores.map((c) => {
            const open = c.todoId ? todos.find((t) => t.id === c.todoId && !t.done) : undefined;
            if (!c.active) {
              if (open) todos = todos.filter((t) => t.id !== open.id);
              return { ...c, todoId: undefined };
            }
            if (open) return c;
            const due = nextChoreDate(c);
            const todo: Todo = {
              id: uid(), title: c.name, notes: `Haushalt · alle ${c.intervalDays} Tage`, due, priority: 3, important: false, urgent: false,
              energy: 2, area: 'Haushalt', subtasks: [], repeat: 'keine', done: false, createdAt: new Date().toISOString(),
            };
            todos = [todo, ...todos];
            return { ...c, todoId: todo.id };
          });
          return { chores, todos };
        }),

      // ---------- Medikamente ----------
      saveMed: (m) =>
        set((s) => {
          if (m.id && s.meds.some((x) => x.id === m.id)) return { meds: s.meds.map((x) => (x.id === m.id ? { ...x, ...m } : x)) };
          const med: Medication = {
            id: uid(), dose: '1 Tablette', times: ['08:00'], days: [], start: today(), withFood: 'egal', perDose: 1, refillWarnDays: 7,
            notes: '', remind: true, active: true, ...m,
          };
          return { meds: [...s.meds, med] };
        }),
      deleteMed: (id) => set((s) => ({ meds: s.meds.filter((x) => x.id !== id) })),
      logMed: (key, v) => {
        const prev = get().medLog[key];
        const medId = key.split('|')[0];
        set((s) => {
          const medLog = { ...s.medLog };
          if (v) medLog[key] = v;
          else delete medLog[key];
          // Vorrat anpassen
          const meds = s.meds.map((m) => {
            if (m.id !== medId || m.stock === undefined) return m;
            let stock = m.stock;
            if (prev !== 'genommen' && v === 'genommen') stock -= m.perDose;
            if (prev === 'genommen' && v !== 'genommen') stock += m.perDose;
            return { ...m, stock: Math.max(0, stock) };
          });
          return { medLog, meds };
        });
        if (v === 'genommen' && prev !== 'genommen') get().addXp(5, 'Medikament genommen');
      },

      // ---------- Sterne ----------
      setAstro: (a) => set((s) => ({ astro: { ...s.astro, ...a } })),
      addTarot: (r) => set((s) => ({ tarot: [{ ...r, id: uid() }, ...s.tarot].slice(0, 100) })),

      // ---------- Rezepte ----------
      setRecipePrefs: (p) => set((s) => ({ recipePrefs: { ...s.recipePrefs, ...p } })),
      toggleFavRecipe: (id) =>
        set((s) => {
          const f = s.recipePrefs.favorites;
          return { recipePrefs: { ...s.recipePrefs, favorites: f.includes(id) ? f.filter((x) => x !== id) : [...f, id] } };
        }),
      rateRecipe: (id, r) =>
        set((s) => {
          const ratings = { ...s.recipePrefs.ratings };
          if (r) ratings[id] = r;
          else delete ratings[id];
          return { recipePrefs: { ...s.recipePrefs, ratings } };
        }),
      setMealPlan: (date, ids) => set((s) => ({ mealPlan: { ...s.mealPlan, [date]: ids } })),
      // Zutaten (skaliert) auf die Einkaufsliste; gleiche Zutat + Einheit werden zusammengerechnet
      addRecipeToShopping: (recipeId, servings) => {
        const r = RECIPES.find((x) => x.id === recipeId);
        if (!r) return 0;
        const ings = scaleIngredients(r, servings);
        set((s) => {
          const shopping = [...s.shopping];
          for (const ing of ings) {
            const idx = shopping.findIndex((x) => !x.done && x.name.toLowerCase() === ing.name.toLowerCase() && x.qty.endsWith(' ' + ing.unit));
            if (idx >= 0) {
              const prev = parseFloat(shopping[idx].qty.replace(',', '.')) || 0;
              shopping[idx] = { ...shopping[idx], qty: `${formatAmount(prev + ing.amount)} ${ing.unit}` };
            } else {
              shopping.push({ id: uid(), name: ing.name, qty: `${formatAmount(ing.amount)} ${ing.unit}`, category: ing.cat, done: false });
            }
          }
          return { shopping };
        });
        return ings.length;
      },
    }),
    {
      name: 'dein-tag-daten',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      // Neue Felder aus späteren Versionen mit Standardwerten auffüllen
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AppState>;
        return {
          ...current,
          ...p,
          settings: {
            ...defaultSettings,
            ...p.settings,
            modules: { ...defaultSettings.modules, ...p.settings?.modules },
            notifications: { ...defaultSettings.notifications, ...p.settings?.notifications },
          },
          profile: { ...defaultProfile, ...p.profile },
          cycle: { ...defaultCycle, ...p.cycle },
          recipePrefs: { ...initialData.recipePrefs, ...p.recipePrefs },
          game: { ...defaultGame, ...p.game },
        };
      },
    },
  ),
);

// Alle speicherbaren Daten (für Export/Backup)
export const exportableKeys = Object.keys(initialData) as (keyof typeof initialData)[];
