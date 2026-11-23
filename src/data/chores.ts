// Haushalts-Vorlagen mit empfohlenem Rhythmus (Richtwerte aus Hygiene- und Haushaltsratgebern)
export type ChoreTemplate = { name: string; room: string; days: number; why: string };

export const CHORE_TEMPLATES: ChoreTemplate[] = [
  { name: 'Bad putzen (Waschbecken, WC, Dusche)', room: 'Bad', days: 7, why: 'Feuchtigkeit fördert Keime und Kalk – wöchentlich hält es hygienisch.' },
  { name: 'Handtücher wechseln', room: 'Bad', days: 4, why: 'Feuchte Handtücher sammeln schnell Bakterien – alle 3–4 Tage wechseln.' },
  { name: 'Duschvorhang / Duschwand reinigen', room: 'Bad', days: 30, why: 'Verhindert Schimmel und Kalkablagerungen.' },
  { name: 'Abflüsse reinigen', room: 'Bad', days: 30, why: 'Haare und Seifenreste regelmäßig entfernen beugt Verstopfungen vor.' },
  { name: 'Bettwäsche wechseln', room: 'Schlafzimmer', days: 14, why: 'Empfohlen alle 1–2 Wochen, bei Allergien oder Schwitzen wöchentlich.' },
  { name: 'Matratze wenden / lüften', room: 'Schlafzimmer', days: 90, why: 'Gleichmäßige Abnutzung und weniger Milben.' },
  { name: 'Kissen & Bettdecke waschen', room: 'Schlafzimmer', days: 180, why: 'Laut Herstellern 2–4× im Jahr.' },
  { name: 'Staubsaugen', room: 'Wohnung', days: 4, why: '1–2× pro Woche, mit Haustieren öfter.' },
  { name: 'Boden wischen', room: 'Wohnung', days: 7, why: 'Wöchentlich in Küche und Bad, sonst alle 1–2 Wochen.' },
  { name: 'Staub wischen', room: 'Wohnung', days: 7, why: 'Weniger Staub = weniger Allergene.' },
  { name: 'Fenster putzen', room: 'Wohnung', days: 90, why: 'Etwa alle 3 Monate bzw. zum Jahreszeitenwechsel.' },
  { name: 'Heizkörper abstauben', room: 'Wohnung', days: 60, why: 'Staub auf Heizkörpern wird aufgewirbelt und senkt die Effizienz.' },
  { name: 'Lichtschalter & Türgriffe desinfizieren', room: 'Wohnung', days: 7, why: 'Häufig berührte Flächen sind Keimschleudern.' },
  { name: 'Pflanzen gießen', room: 'Wohnung', days: 4, why: 'Die meisten Zimmerpflanzen alle 3–7 Tage, je nach Art.' },
  { name: 'Müll rausbringen', room: 'Küche', days: 3, why: 'Gegen Gerüche und Fruchtfliegen.' },
  { name: 'Küchenarbeitsflächen gründlich reinigen', room: 'Küche', days: 3, why: 'Lebensmittelhygiene – täglich abwischen, gründlich alle paar Tage.' },
  { name: 'Spüllappen & Schwamm wechseln', room: 'Küche', days: 7, why: 'Schwämme gehören zu den keimreichsten Orten im Haushalt.' },
  { name: 'Geschirrtücher wechseln', room: 'Küche', days: 3, why: 'Feuchte Tücher alle 2–3 Tage wechseln.' },
  { name: 'Kühlschrank auswischen & aussortieren', room: 'Küche', days: 30, why: 'Monatlich gegen Schimmel und Gerüche.' },
  { name: 'Mikrowelle reinigen', room: 'Küche', days: 14, why: 'Spritzer lassen sich frisch leichter entfernen.' },
  { name: 'Backofen reinigen', room: 'Küche', days: 60, why: 'Alle 1–3 Monate, je nach Nutzung.' },
  { name: 'Wasserkocher & Kaffeemaschine entkalken', room: 'Küche', days: 30, why: 'Kalk verlängert die Heizzeit und kostet Strom.' },
  { name: 'Spülmaschinen-Sieb reinigen', room: 'Küche', days: 14, why: 'Verhindert Gerüche und schlechte Spülergebnisse.' },
  { name: 'Dunstabzugsfilter reinigen', room: 'Küche', days: 90, why: 'Fettfilter alle 2–3 Monate in die Spülmaschine.' },
  { name: 'Waschmaschine pflegen (90 °C, Dichtung)', room: 'Hauswirtschaft', days: 30, why: 'Gegen Biofilm und muffigen Geruch.' },
  { name: 'Wäsche waschen', room: 'Hauswirtschaft', days: 4, why: 'Rhythmus je nach Haushaltsgröße.' },
  { name: 'Bügeln / Wäsche wegräumen', room: 'Hauswirtschaft', days: 7, why: 'Ein fester Termin verhindert Wäscheberge.' },
  { name: 'Kleiderschrank ausmisten', room: 'Schlafzimmer', days: 180, why: 'Zum Saisonwechsel – schafft Platz und Überblick.' },
  { name: 'Rauchmelder testen', room: 'Wohnung', days: 365, why: 'Mindestens einmal jährlich prüfen.' },
  { name: 'Mülleimer auswaschen', room: 'Küche', days: 30, why: 'Gegen Gerüche und Maden im Sommer.' },
];

export const INTERVAL_OPTIONS = [
  { days: 1, label: 'Täglich' },
  { days: 2, label: 'Alle 2 Tage' },
  { days: 3, label: 'Alle 3 Tage' },
  { days: 4, label: '2× pro Woche' },
  { days: 7, label: 'Wöchentlich' },
  { days: 14, label: 'Alle 2 Wochen' },
  { days: 30, label: 'Monatlich' },
  { days: 60, label: 'Alle 2 Monate' },
  { days: 90, label: 'Vierteljährlich' },
  { days: 180, label: 'Halbjährlich' },
  { days: 365, label: 'Jährlich' },
];

export const intervalLabel = (d: number) => INTERVAL_OPTIONS.find((o) => o.days === d)?.label ?? `Alle ${d} Tage`;
