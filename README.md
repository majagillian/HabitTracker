# Dein Tag

Planer, Habit-Tracker, Achtsamkeitstagebuch, Kalender und Zyklusplaner in einer App. Die App achtet darauf, wie viel du dir vornimmst, und hilft dir so, deine Energie über alle Lebensbereiche hinweg einzuteilen.

- **Plattform:** Android zuerst (iOS vorbereitet) und eine Web-Version auf GitHub Pages
- **Technik:** React Native mit [Expo](https://expo.dev) (SDK 58), TypeScript, Expo Router, Zustand
- **Daten:** nur lokal auf dem Gerät, mit Export und Import als JSON
- **Klickdummy (Design):** https://claude.ai/artifact/Lm7oGKt7Rw4JKaVbJWA5Hn
- **Analyse** (Benchmark, Ideen, Einschätzung zur Wettbewerbsfähigkeit): [`docs/ANALYSE.md`](docs/ANALYSE.md)

## Funktionen

| Bereich | Was die App kann |
|---|---|
| Heute | Level, XP, Tages-Score, Kapazitäts-Anzeige, Zyklusphase mit PMS-Alarm, Medikamente, Gewohnheiten, Termine |
| To-dos | Priorität, Fälligkeit, Eisenhower-Matrix, Teilaufgaben, Energie-Aufwand, Wiederholung, „auf morgen schieben“, Suche |
| Kalender | Kategorien, Filter, Suche, Färbung von Tagen mit hoher Auslastung, Zyklus-Overlay, Warnung bei vollen Tagen in der Lutealphase, Arzt-Rhythmus mit Erinnerung an den Folgetermin |
| Haushalt | 30 Vorlagen mit empfohlenem Rhythmus. Eigener Rhythmus und Wochentag möglich, die nächste Aufgabe landet automatisch in den To-dos |
| Gewohnheiten | Startdatum, Serien, Fortschritt bis „etabliert“ (66-Tage-Regel nach Lally et al., 2010), Pausentage, Meilensteine |
| Zyklus | Modi „Tracken“ und „Kinderwunsch“, automatische Berechnung der Zyklus- und Periodenlänge, Prognosen, PMS-Alarm, Beschwerden, Geschlechtsverkehr (verhütet/unverhütet), Hinweis auf mögliche Schwangerschaft, Verhütung, Pillenpause, Pillenwecker |
| Fitness | 7 Programme: Sonnengruß A, Hatha-Flow, Yin Yoga, Rückenschule (McGill Big 3), Bauch-Beine-Po, 7-Minuten-Training, Schreibtisch-Pause. Animierte Vorturner:in (je nach Profil weiblich, männlich oder neutral), Ansicht von der Seite, von vorn oder beides. Übersicht und Anleitung vor dem Start, Begleitung mit Timer, Trainingsplan im Kalender, Empfehlung nach Zyklusphase |
| Ernährung | Kalorienzähler mit 133 Grundnahrungsmitteln plus Open Food Facts (Suche und Barcode), Ziel (abnehmen, halten, zunehmen), Nährwerte, Ausgewogenheits-Score |
| Rezepte | 29 Rezepte mit anpassbaren Portionen. Zutaten gehen mit Menge auf die Einkaufsliste. Favoriten, Bewertung („Hat es geschmeckt?“), Lieblingszutaten, Wochenplan-Vorschläge |
| Einkaufsliste | Nach Kategorien sortiert |
| Medikamente | Einnahmezeiten, Tage oder Intervall, Erinnerungen, Einnahmetreue, Warnung bei knappem Vorrat |
| Check-in mit Tagi | Spielerisch in 6 Schritten (Stimmungs-Wetter, Akku, Schlaf, innere Lautstärke, Sticker), danach Belohnung, Tagesfrage und eine passende Übung |
| Übungen & Rituale | Orakel, Chakra-Atem, Sorgen-Wolken, Box-Atmen, 4-7-8-Atmung, Mond-Ritual, Baum-Erdung, Body-Scan und mehr |
| 6-Minuten-Tagebuch | Morgens das Dankbarkeitsglas mit Intentionskarte und Affirmation, abends der Sternenhimmel |
| Marmeladenglas | Besondere Momente mit Text, Fotos, Videos und Sprachmemos, als Zeitleiste und als Glas zum „Schütteln“ |
| Sterne | Horoskop aus echten, auf dem Gerät berechneten Planetenständen. Sternzeichen, Mondzeichen und Aszendent werden berechnet oder selbst eingetragen. Tarot mit 78 Karten und 4 Legungen. Abgleich des Horoskops mit deinen Check-ins |
| Bildschirmzeit | Automatische Messung auf Android über ein eigenes Native-Modul, Top-Apps, Limit mit Warnung |
| Dashboard | Wohlbefinden und Auslastung im Vergleich, Zusammenhänge zwischen den Bereichen, Balance der Lebensbereiche, Kennzahlen, Abzeichen |
| Einstellungen | Profil (Geschlecht, Alter, „tut mir gut“ / „tut mir nicht gut“), Erinnerungen einzeln pro Thema, Hell-/Dunkelmodus, große Schrift, Module ein- und ausschalten, Export, Import, alles löschen |

**Gamification:** XP, Level, Konfetti und Sterne, Serien und Abzeichen. Tagi wächst mit. Der Tages-Score sinkt, wenn du die App länger nicht öffnest, und steigt mit jeder Aktivität wieder.

**Barrierefreiheit:** Screenreader-Labels und -Rollen, Touch-Flächen von mindestens 44 px, Kontrast nach WCAG AA, Farben nie als einzige Information, Unterstützung für „Bewegung reduzieren“. Die Navigation liegt in der Daumenzone. Zwischen Heute, Kalender, To-dos und Gewohnheiten kannst du wischen.

## Installation & Start

Voraussetzungen: [Node.js](https://nodejs.org) ab Version 20 und Git.

```bash
git clone https://github.com/majagillian/HabitTracker.git
cd HabitTracker
npm install
```

**Schnell ausprobieren (Browser):**
```bash
npm run web
```

**Auf dem Android-Handy (empfohlen: Development Build, damit alle Funktionen inkl. Bildschirmzeit laufen):**
```bash
# Variante A – lokal (Android Studio + SDK nötig, Handy per USB mit USB-Debugging)
npx expo run:android

# Variante B – in der Cloud bauen, ohne Android Studio (kostenloses Expo-Konto)
npx eas-cli@latest login
npx eas-cli@latest build --profile development --platform android   # APK aufs Handy laden & installieren
npx expo start --dev-client                                           # danach den Dev-Server starten
```

> In **Expo Go** startet die App zwar, aber das eigene Bildschirmzeit-Modul fehlt dort. Die Zeit kann dann nur manuell eingetragen werden.

**Fertige APK zum Weitergeben:** `npx eas-cli@latest build --profile preview --platform android`
**Für den Play Store:** `npx eas-cli@latest build --profile production --platform android`, danach `eas submit`.

**Prüfen:** `npm run typecheck`

## Web-Version (GitHub Pages)

Bei jedem Push auf `main` baut `.github/workflows/pages.yml` die Web-Version und veröffentlicht sie unter **https://majagillian.github.io/HabitTracker/**.
Einmalig nötig: im Repository unter **Settings → Pages → Source** die Option **„GitHub Actions“** wählen. Im Browser gibt es keine Bildschirmzeit und keine Erinnerungen.

## Dateistruktur

```
src/
  app/            Bildschirme (jede Datei ist eine Seite, Expo Router), _layout.tsx = Seitenmenü & Start-Logik
  components/     UI-Bausteine, Vorturner:in, Tagi, Workout-Player, Diagramme, Medien
  data/           Inhalte: Übungen & Posen, Trainingsprogramme, Rezepte, Lebensmittel, Tarot, Haushalt, Rituale
  lib/            Logik: Zyklus, Auslastung, Analysen, Astronomie & Horoskop, Erinnerungen, Backup …
  store/          App-Zustand (Zustand + lokale Speicherung)
  theme/          Farben (hell/dunkel) & Theme-Hook
  i18n/           Texte – Deutsch, Englisch vorbereitet
modules/screen-time/   Eigenes Android-Modul (Kotlin) für die Bildschirmzeit
docs/ANALYSE.md        Benchmark, Zusatzideen, Wettbewerbsfähigkeit, weitere Lebensbereiche
```

## Roadmap

1. Cloud-Sync mit Ende-zu-Ende-Verschlüsselung (Google Drive, Nextcloud/WebDAV) bei voller Datenhoheit
2. iOS (die Bildschirmzeit erfordert dort Apples „Family Controls“-Berechtigung)
3. Englisch und weitere Sprachen
4. Home-Widget, Wochenrückblick, Familienmodus mit geteilter Einkaufsliste
5. Medien im Backup (Fotos, Videos, Sprachmemos)

## Hinweise

Dein Tag ersetzt keine medizinische, psychologische oder ernährungsfachliche Beratung. Zyklusprognosen sind **keine Verhütungsmethode**. Horoskop und Tarot dienen der Unterhaltung und Selbstreflexion. Wenn es dir nicht gut geht: Telefonseelsorge 0800 111 0 111 (kostenlos, rund um die Uhr), im Notfall 112.
