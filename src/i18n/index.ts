// Mehrsprachigkeit vorbereitet: Texte der Navigation & allgemeine Begriffe zentral.
// Weitere Sprachen: neues Objekt anlegen (z. B. en) und in `dictionaries` eintragen.
import { getLocales } from 'expo-localization';

const de = {
  appName: 'Dein Tag',
  heute: 'Heute',
  kalender: 'Kalender',
  todos: 'To-dos',
  haushalt: 'Haushalt',
  einkauf: 'Einkaufsliste',
  habits: 'Gewohnheiten',
  zyklus: 'Zyklus',
  fitness: 'Fitness',
  ernaehrung: 'Ernährung',
  medikamente: 'Medikamente',
  checkin: 'Check-in mit Tagi',
  uebungen: 'Übungen & Rituale',
  tagebuch: '6-Minuten-Tagebuch',
  momente: 'Marmeladenglas',
  sterne: 'Sterne: Horoskop & Tarot',
  bildschirmzeit: 'Bildschirmzeit',
  statistik: 'Dashboard & Analyse',
  einstellungen: 'Profil & Einstellungen',
  module: 'Module wählen',
  speichern: 'Speichern',
  abbrechen: 'Abbrechen',
  loeschen: 'Löschen',
  hinzufuegen: 'Hinzufügen',
  menue: 'Menü',
};

const en: typeof de = {
  appName: 'Your Day',
  heute: 'Today',
  kalender: 'Calendar',
  todos: 'To-dos',
  haushalt: 'Household',
  einkauf: 'Shopping list',
  habits: 'Habits',
  zyklus: 'Cycle',
  fitness: 'Fitness',
  ernaehrung: 'Nutrition',
  medikamente: 'Medication',
  checkin: 'Check-in with Tagi',
  uebungen: 'Exercises & rituals',
  tagebuch: '6-minute journal',
  momente: 'Memory jar',
  sterne: 'Stars: horoscope & tarot',
  bildschirmzeit: 'Screen time',
  statistik: 'Dashboard & insights',
  einstellungen: 'Profile & settings',
  module: 'Choose modules',
  speichern: 'Save',
  abbrechen: 'Cancel',
  loeschen: 'Delete',
  hinzufuegen: 'Add',
  menue: 'Menu',
};

const dictionaries = { de, en };
export type Key = keyof typeof de;

// Vorerst ist Deutsch fest eingestellt; Englisch ist vorbereitet
const lang: keyof typeof dictionaries = 'de';
export const deviceLanguage = () => getLocales()[0]?.languageCode ?? 'de';
export const t = (k: Key) => dictionaries[lang][k] ?? k;
