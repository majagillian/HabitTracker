// Lokale Benachrichtigungen – werden bei jeder relevanten Änderung komplett neu geplant
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { isPillBreak, predict, typicalPmsSymptoms } from '@/lib/cycle';
import { addDays, parseISO, today } from '@/lib/date';
import { dayLoad } from '@/lib/load';
import { daysLeft, isDueOn } from '@/lib/meds';
import type { AppState } from '@/store/useStore';

const supported = Platform.OS !== 'web';
const CHANNEL = 'erinnerungen';
const T = Notifications.SchedulableTriggerInputTypes;

export const initNotifications = async () => {
  if (!supported) return false;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
  });
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, { name: 'Erinnerungen', importance: Notifications.AndroidImportance.HIGH, lightColor: '#7C3AED' });
  }
  return true;
};

export const requestNotificationPermission = async () => {
  if (!supported) return false;
  const cur = await Notifications.getPermissionsAsync();
  if (cur.granted) return true;
  const res = await Notifications.requestPermissionsAsync();
  return res.granted;
};

type Plan = { title: string; body: string; at?: Date; daily?: { hour: number; minute: number } };

const at = (date: string, hour: number, minute = 0) => {
  const d = parseISO(date);
  d.setHours(hour, minute, 0, 0);
  return d;
};

// Alle Benachrichtigungen aus dem aktuellen Zustand berechnen
export const buildPlan = (s: AppState): Plan[] => {
  const N = s.settings.notifications;
  const M = s.settings.modules;
  const plans: Plan[] = [];
  const now = new Date();
  const horizon = 21; // Tage im Voraus (Android begrenzt die Anzahl geplanter Alarme)

  // To-dos: am Fälligkeitstag morgens
  const todoOn = M.todos && N.todos.on;
  const choreOn = M.haushalt && N.haushalt.on;
  if (todoOn || choreOn) {
    for (const t of s.todos.filter((x) => !x.done && x.due && x.due >= today() && (x.area === 'Haushalt' ? choreOn : todoOn)).slice(0, 40)) {
      plans.push({ title: t.area === 'Haushalt' ? 'Haushalt heute' : 'Heute fällig', body: t.title, at: at(t.due!, N.todos.hour, N.todos.minute) });
    }
  }
  // Termine: x Minuten vorher
  if (M.kalender && N.termine.on) {
    for (const e of s.events.filter((x) => x.date >= today() && x.remindMin !== null).slice(0, 60)) {
      const [h, m] = e.start.split(':').map(Number);
      const d = at(e.date, h, m);
      d.setMinutes(d.getMinutes() - (e.remindMin ?? 0));
      plans.push({ title: `Gleich: ${e.title}`, body: `${e.start} Uhr${e.notes ? ' · ' + e.notes : ''}`, at: d });
    }
  }
  // Arzt-Folgetermine: Wenn noch kein Folgetermin vereinbart ist, rechtzeitig erinnern
  if (M.kalender && N.arztFolge.on) {
    for (const e of s.events.filter((x) => x.category === 'arzt' && x.doctorIntervalMonths && !x.followUpBooked)) {
      const due = parseISO(e.date);
      due.setMonth(due.getMonth() + (e.doctorIntervalMonths ?? 6));
      due.setDate(due.getDate() - 21);
      due.setHours(N.arztFolge.hour, N.arztFolge.minute);
      plans.push({ title: 'Folgetermin vereinbaren', body: `${e.title}: Der nächste Termin ist in ca. 3 Wochen fällig.`, at: due });
    }
  }
  // Gewohnheiten
  if (M.habits && N.habits.on && s.habits.some((h) => !h.archived)) {
    plans.push({ title: 'Deine Gewohnheiten', body: 'Ein kurzer Blick: Was fehlt heute noch? Deine Serie freut sich.', daily: N.habits });
  }
  // Check-in
  if (M.checkin && N.checkin.on && s.settings.checkinMode !== 'manuell') {
    for (const t of s.settings.checkinTimes) plans.push({ title: 'Tagi wartet auf dich', body: 'Wie geht es dir gerade? Ein Check-in dauert nur eine Minute.', daily: t });
  }
  // Tagebuch
  if (M.tagebuch && N.tagebuch.on) {
    plans.push({ title: 'Dein Morgen-Glas', body: 'Drei Dinge, für die du heute dankbar bist?', daily: N.tagebuch });
    plans.push({ title: 'Dein Abendhimmel', body: 'Welche schönen Momente lassen heute einen Stern leuchten?', daily: { hour: 21, minute: 0 } });
  }
  // Zyklus
  if (M.zyklus && s.cycle.periods.length) {
    const p = predict(s.cycle);
    if (p) {
      if (N.periode.on) plans.push({ title: 'Periode in 2 Tagen', body: 'Pack dir vorsorglich etwas ein und plane ruhige Abende.', at: at(addDays(p.nextPeriod, -2), N.periode.hour, N.periode.minute) });
      if (N.eisprung.on && s.settings.cycleMode === 'kinderwunsch') plans.push({ title: 'Fruchtbare Tage beginnen', body: 'Laut Prognose beginnt heute dein fruchtbares Fenster.', at: at(p.fertileStart, N.eisprung.hour, N.eisprung.minute) });
      if (N.eisprung.on && s.settings.cycleMode === 'tracken') plans.push({ title: 'Eisprung morgen (Prognose)', body: 'Keine Verhütungsmethode – nur eine Schätzung.', at: at(addDays(p.ovulation, -1), N.eisprung.hour, N.eisprung.minute) });
      if (N.pms.on) {
        const sym = typicalPmsSymptoms(s.cycle);
        plans.push({ title: 'PMS-Alarm: ab morgen', body: `Deine typischen PMS-Tage beginnen${sym.length ? ` (oft: ${sym.join(', ')})` : ''}. Gönn dir Puffer, Wärme und Schlaf.`, at: at(addDays(p.pmsStart, -1), N.pms.hour, N.pms.minute) });
      }
      if (N.zyklusHinweise.on) {
        plans.push({ title: 'Lutealphase beginnt', body: 'Stimmung und Energie können jetzt schwanken. Sei sanft mit dir.', at: at(addDays(p.ovulation, 2), N.zyklusHinweise.hour, N.zyklusHinweise.minute) });
      }
    }
  }
  // Pillenwecker (Pausentage werden ausgelassen)
  if (M.zyklus && N.pille.on && ['pille', 'minipille'].includes(s.cycle.contraception)) {
    for (let i = 0; i < 14; i++) {
      const d = addDays(today(), i);
      if (!isPillBreak(s.cycle, d)) plans.push({ title: 'Pillenwecker', body: 'Zeit für deine Pille.', at: at(d, s.cycle.pillHour, s.cycle.pillMinute) });
    }
  }
  // Auslastungs-Warnung am Vorabend
  if (N.auslastung.on) {
    for (let i = 1; i <= 7; i++) {
      const d = addDays(today(), i);
      const l = dayLoad(s, d);
      if (l.level >= 3 || l.warning) plans.push({ title: 'Morgen wird es voll', body: l.warning ?? 'Viele Termine und Aufgaben – plane Pausen ein oder verschiebe etwas.', at: at(addDays(d, -1), N.auslastung.hour, N.auslastung.minute) });
    }
  }
  // Fitness-Plan
  if (M.fitness && N.fitness.on) {
    for (let i = 0; i < 14; i++) {
      const d = addDays(today(), i);
      const wd = ((parseISO(d).getDay() + 6) % 7) + 1;
      for (const e of s.plan.filter((x) => x.weekday === wd)) {
        const [h, m] = e.time.split(':').map(Number);
        const t = at(d, h, m);
        t.setMinutes(t.getMinutes() - 60);
        plans.push({ title: `In einer Stunde: ${e.title}`, body: 'Trinkflasche schon gefüllt?', at: t });
      }
    }
  }
  // Medikamente
  if (M.medikamente && N.medikamente.on) {
    for (const m of s.meds.filter((x) => x.active && x.remind)) {
      for (let i = 0; i < 7; i++) {
        const d = addDays(today(), i);
        if (!isDueOn(m, d)) continue;
        for (const time of m.times) {
          const [h, mi] = time.split(':').map(Number);
          plans.push({ title: `Medikament: ${m.name}`, body: `${m.dose}${m.withFood !== 'egal' ? ' · ' + ({ vorher: 'vor dem Essen', zum: 'zum Essen', nachher: 'nach dem Essen' } as const)[m.withFood] : ''}`, at: at(d, h, mi) });
        }
      }
      const left = daysLeft(m);
      if (left !== null && left <= m.refillWarnDays) {
        plans.push({ title: `Vorrat: ${m.name}`, body: `Reicht noch etwa ${left} Tage – Rezept oder Nachkauf einplanen.`, at: at(addDays(today(), left > 0 ? 0 : 0), 10) });
      }
    }
  }
  // Horoskop des Tages
  if (M.sterne && N.horoskop.on && s.astro.birthDate) {
    plans.push({ title: 'Deine Sterne heute', body: 'Was der Himmel dir heute erzählt – jetzt ansehen.', daily: N.horoskop });
  }
  return plans.filter((p) => !p.at || p.at > now);
};

let scheduling: Promise<void> | null = null;

export const rescheduleAll = async (s: AppState) => {
  if (!supported) return;
  // Parallele Aufrufe vermeiden
  if (scheduling) await scheduling;
  scheduling = (async () => {
    try {
      const perm = await Notifications.getPermissionsAsync();
      if (!perm.granted) return;
      await Notifications.cancelAllScheduledNotificationsAsync();
      // Android erlaubt nur eine begrenzte Anzahl – die nächsten 60 Ereignisse genügen
      const plans = buildPlan(s).sort((a, b) => (a.at?.getTime() ?? 0) - (b.at?.getTime() ?? 0)).slice(0, 60);
      for (const p of plans) {
        await Notifications.scheduleNotificationAsync({
          content: { title: p.title, body: p.body },
          trigger: p.daily
            ? { type: T.DAILY, hour: p.daily.hour, minute: p.daily.minute, channelId: CHANNEL }
            : { type: T.DATE, date: p.at!, channelId: CHANNEL },
        });
      }
    } catch (e) {
      console.warn('Benachrichtigungen konnten nicht geplant werden', e);
    }
  })();
  await scheduling;
  scheduling = null;
};

// Sofort-Hinweis (z. B. Bildschirmzeit-Limit überschritten)
export const notifyNow = async (title: string, body: string) => {
  if (!supported) return;
  try {
    await Notifications.scheduleNotificationAsync({ content: { title, body }, trigger: null });
  } catch {
    // ignorieren
  }
};
