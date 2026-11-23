// Tarot-Deck (78 Karten) mit Bedeutungen – zur Unterhaltung und Selbstreflexion
export type TarotCard = { id: number; name: string; arcana: 'gross' | 'klein'; suit?: Suit; numeral: string; symbol: string; upright: string; reversed: string; keywords: string };
export type Suit = 'Stäbe' | 'Kelche' | 'Schwerter' | 'Münzen';

const MAJOR: [string, string, string, string][] = [
  ['Der Narr', 'Neubeginn, Spontanität, Vertrauen', 'Ein Sprung ins Unbekannte wartet. Geh mit Neugier und offenem Herzen los, auch wenn du noch nicht jeden Schritt kennst.', 'Achte darauf, nicht kopflos loszustürmen. Ein bisschen Planung schützt deinen Mut.'],
  ['Der Magier', 'Willenskraft, Können, Manifestation', 'Du hast alle Werkzeuge in der Hand. Jetzt ist der Moment, Ideen in Taten zu verwandeln.', 'Energie verpufft oder wird manipulativ eingesetzt. Prüfe deine Absichten.'],
  ['Die Hohepriesterin', 'Intuition, Geheimnis, inneres Wissen', 'Hör auf deine innere Stimme. Die Antwort liegt schon in dir, wenn du still wirst.', 'Du übergehst dein Bauchgefühl. Nimm dir Zeit für Rückzug.'],
  ['Die Herrscherin', 'Fülle, Fürsorge, Kreativität', 'Etwas darf wachsen und gedeihen. Pflege dich und andere mit Wärme und Genuss.', 'Du gibst zu viel oder vernachlässigst dich selbst. Fülle deinen eigenen Becher.'],
  ['Der Herrscher', 'Struktur, Stabilität, Verantwortung', 'Klare Strukturen geben dir Halt. Übernimm Führung mit ruhiger Autorität.', 'Starrheit oder Kontrolle blockieren. Lockere die Zügel ein wenig.'],
  ['Der Hierophant', 'Tradition, Lehre, Werte', 'Bewährtes Wissen und Mentor:innen unterstützen dich. Finde Halt in deinen Werten.', 'Zeit, eigene Wege zu gehen und Regeln zu hinterfragen.'],
  ['Die Liebenden', 'Liebe, Verbindung, Entscheidung', 'Eine Herzensentscheidung steht an. Wähle, was deinen Werten entspricht.', 'Ungleichgewicht in einer Beziehung oder ein innerer Zwiespalt.'],
  ['Der Wagen', 'Willensstärke, Fortschritt, Sieg', 'Mit Fokus und Entschlossenheit lenkst du dein Leben in die gewünschte Richtung.', 'Du ziehst in zu viele Richtungen. Sammle dich, bevor du weiterfährst.'],
  ['Die Kraft', 'Mut, Sanftmut, innere Stärke', 'Wahre Stärke ist sanft. Begegne Herausforderungen mit Geduld und Mitgefühl.', 'Selbstzweifel nagen. Erinnere dich an das, was du schon gemeistert hast.'],
  ['Der Eremit', 'Rückzug, Besinnung, Weisheit', 'Ziehe dich zurück, um Klarheit zu finden. Stille ist jetzt dein Lehrer.', 'Isolation statt Besinnung – such wieder Kontakt.'],
  ['Das Rad des Schicksals', 'Wandel, Zyklen, Glück', 'Das Leben dreht sich zu deinen Gunsten. Nimm den Wandel an.', 'Ein Abschnitt fühlt sich festgefahren an. Auch das geht vorüber.'],
  ['Die Gerechtigkeit', 'Wahrheit, Klarheit, Ausgleich', 'Ehrlichkeit und faire Entscheidungen bringen dich ins Gleichgewicht.', 'Etwas ist aus der Balance. Sei ehrlich zu dir selbst.'],
  ['Der Gehängte', 'Innehalten, Perspektivwechsel, Hingabe', 'Ein Perspektivwechsel öffnet neue Wege. Warten ist jetzt kein Stillstand.', 'Du hältst an etwas fest, das sich nicht mehr bewegt. Lass los.'],
  ['Der Tod', 'Ende, Transformation, Neubeginn', 'Ein Kapitel schließt sich, damit Neues entstehen kann. Verwandlung, nicht Verlust.', 'Widerstand gegen Veränderung macht es schwerer als nötig.'],
  ['Die Mäßigkeit', 'Balance, Geduld, Heilung', 'Das rechte Maß bringt Heilung. Mische Gegensätze mit Geduld.', 'Extreme bestimmen den Alltag. Finde zurück in die Mitte.'],
  ['Der Teufel', 'Bindung, Versuchung, Schatten', 'Schau ehrlich hin, was dich festhält – Gewohnheiten, Ängste, Abhängigkeiten.', 'Befreiung naht: Du erkennst Ketten und beginnst, sie zu lösen.'],
  ['Der Turm', 'Umbruch, Erkenntnis, Befreiung', 'Etwas Wackliges stürzt ein, damit Wahres sichtbar wird. Danach ist Raum für ein stabiles Fundament.', 'Du schiebst einen nötigen Umbruch auf. Klein anfangen hilft.'],
  ['Der Stern', 'Hoffnung, Heilung, Inspiration', 'Nach der Dunkelheit leuchtet Hoffnung. Vertraue darauf, dass es gut wird.', 'Die Zuversicht ist kurz getrübt. Suche das kleine Licht.'],
  ['Der Mond', 'Unterbewusstes, Träume, Unsicherheit', 'Nicht alles ist, wie es scheint. Achte auf Träume und Gefühle.', 'Nebel lichtet sich, Ängste verlieren ihre Macht.'],
  ['Die Sonne', 'Freude, Erfolg, Lebenskraft', 'Strahlende Energie! Freude, Klarheit und Erfolg begleiten dich.', 'Die Sonne ist hinter Wolken – die Freude ist da, nur leiser.'],
  ['Das Gericht', 'Erwachen, Bilanz, Ruf', 'Zeit, Bilanz zu ziehen und einem inneren Ruf zu folgen.', 'Selbstkritik bremst. Vergib dir und geh weiter.'],
  ['Die Welt', 'Vollendung, Ganzheit, Ankommen', 'Ein Zyklus vollendet sich. Feiere, was du erreicht hast.', 'Etwas ist fast fertig – bring es zu Ende, bevor du Neues beginnst.'],
];

const ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'];

const SUITS: { suit: Suit; symbol: string; domain: string; element: string }[] = [
  { suit: 'Stäbe', symbol: '♣', domain: 'Tatkraft, Leidenschaft und Projekte', element: 'Feuer' },
  { suit: 'Kelche', symbol: '♥', domain: 'Gefühle, Beziehungen und Intuition', element: 'Wasser' },
  { suit: 'Schwerter', symbol: '♠', domain: 'Gedanken, Kommunikation und Klarheit', element: 'Luft' },
  { suit: 'Münzen', symbol: '♦', domain: 'Körper, Geld, Arbeit und Alltag', element: 'Erde' },
];

const RANKS: { name: string; numeral: string; up: string; rev: string; kw: string }[] = [
  { name: 'Ass', numeral: 'A', up: 'Ein kraftvoller Neubeginn kündigt sich an', rev: 'Ein Anfang verzögert sich oder braucht mehr Vorbereitung', kw: 'Neubeginn, Potenzial' },
  { name: 'Zwei', numeral: 'II', up: 'Entscheidungen und Partnerschaft stehen im Mittelpunkt', rev: 'Unentschlossenheit oder Ungleichgewicht', kw: 'Wahl, Gleichgewicht' },
  { name: 'Drei', numeral: 'III', up: 'Erstes Wachstum und Zusammenarbeit zeigen sich', rev: 'Missverständnisse im Miteinander', kw: 'Wachstum, Gemeinschaft' },
  { name: 'Vier', numeral: 'IV', up: 'Stabilität und eine Pause zum Durchatmen', rev: 'Stillstand oder Festhalten', kw: 'Stabilität, Ruhe' },
  { name: 'Fünf', numeral: 'V', up: 'Herausforderung und Reibung, die dich wachsen lassen', rev: 'Ein Konflikt klingt ab', kw: 'Konflikt, Lernen' },
  { name: 'Sechs', numeral: 'VI', up: 'Harmonie, Austausch und Rückenwind', rev: 'Ungleiches Geben und Nehmen', kw: 'Harmonie, Fortschritt' },
  { name: 'Sieben', numeral: 'VII', up: 'Ausdauer und eine Phase der Prüfung', rev: 'Zweifel an der eigenen Richtung', kw: 'Ausdauer, Prüfung' },
  { name: 'Acht', numeral: 'VIII', up: 'Bewegung, Tempo und Hingabe an eine Aufgabe', rev: 'Ungeduld oder Verzettelung', kw: 'Bewegung, Fleiß' },
  { name: 'Neun', numeral: 'IX', up: 'Fast am Ziel – Zufriedenheit liegt nah', rev: 'Erschöpfung kurz vor dem Ziel', kw: 'Erfüllung, Durchhalten' },
  { name: 'Zehn', numeral: 'X', up: 'Ein Zyklus wird vollendet', rev: 'Zu viel Last auf einmal', kw: 'Vollendung, Last' },
  { name: 'Bube', numeral: 'B', up: 'Neugier und eine gute Nachricht', rev: 'Unreife oder Ungeduld', kw: 'Botschaft, Neugier' },
  { name: 'Ritter', numeral: 'R', up: 'Aufbruch und entschlossenes Handeln', rev: 'Übereiltes Vorgehen', kw: 'Aufbruch, Aktion' },
  { name: 'Königin', numeral: 'K', up: 'Reife, Fürsorge und Selbstvertrauen', rev: 'Unsicherheit oder Rückzug', kw: 'Fürsorge, Reife' },
  { name: 'König', numeral: 'Kö', up: 'Souveränität und Verantwortung', rev: 'Kontrolle oder Starrheit', kw: 'Führung, Meisterschaft' },
];

export const DECK: TarotCard[] = [
  ...MAJOR.map(([name, kw, up, rev], i) => ({ id: i, name, arcana: 'gross' as const, numeral: ROMAN[i], symbol: '✦', keywords: kw, upright: up, reversed: rev })),
  ...SUITS.flatMap((s, si) =>
    RANKS.map((r, ri) => ({
      id: 22 + si * 14 + ri,
      name: `${r.name} der ${s.suit}`,
      arcana: 'klein' as const,
      suit: s.suit,
      numeral: r.numeral,
      symbol: s.symbol,
      keywords: `${r.kw} · ${s.element}`,
      upright: `${r.up} – im Bereich ${s.domain}.`,
      reversed: `${r.rev} – im Bereich ${s.domain}.`,
    })),
  ),
];

export type Spread = { id: string; name: string; positions: string[]; description: string };
export const SPREADS: Spread[] = [
  { id: 'tag', name: 'Tageskarte', positions: ['Impuls für heute'], description: 'Eine Karte als Begleiter durch den Tag.' },
  { id: 'drei', name: '3 Karten', positions: ['Vergangenheit', 'Gegenwart', 'Zukunft'], description: 'Woher du kommst, wo du stehst, wohin es geht.' },
  { id: 'entscheidung', name: 'Entscheidung', positions: ['Die Situation', 'Weg A', 'Weg B', 'Was dich hindert', 'Rat der Karten'], description: 'Für Fragen mit zwei Möglichkeiten.' },
  { id: 'kreuz', name: 'Keltisches Kreuz', positions: ['Gegenwart', 'Herausforderung', 'Grundlage', 'Vergangenheit', 'Bewusstes Ziel', 'Nahe Zukunft', 'Du selbst', 'Umfeld', 'Hoffnungen & Ängste', 'Ausgang'], description: 'Die klassische, ausführliche Legung mit 10 Karten.' },
];

// Fisher-Yates-Mischen, je Karte 30 % Chance auf „umgekehrt“
export const drawCards = (n: number) => {
  const ids = DECK.map((c) => c.id);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids.slice(0, n).map((card) => ({ card, reversed: Math.random() < 0.3 }));
};

// Gesamtdeutung aus der Zusammensetzung der Legung
export const interpret = (cards: { card: number; reversed: boolean }[]): string => {
  const cs = cards.map((c) => ({ ...DECK[c.card], rev: c.reversed }));
  const majors = cs.filter((c) => c.arcana === 'gross').length;
  const rev = cs.filter((c) => c.rev).length;
  const suitCount: Record<string, number> = {};
  cs.forEach((c) => c.suit && (suitCount[c.suit] = (suitCount[c.suit] ?? 0) + 1));
  const dominant = Object.entries(suitCount).sort((a, b) => b[1] - a[1])[0];
  const parts: string[] = [];
  if (cs.length === 1) {
    const c = cs[0];
    return `${c.name}${c.rev ? ' (umgekehrt)' : ''}: ${c.rev ? c.reversed : c.upright} Stichworte: ${c.keywords}.`;
  }
  if (majors / cs.length >= 0.5) parts.push('Viele Karten der großen Arkana zeigen: Es geht um ein wichtiges Lebensthema, das größer ist als der Alltag.');
  else if (majors === 0) parts.push('Nur kleine Arkana – die Antwort liegt in alltäglichen Schritten, die du selbst gestalten kannst.');
  else parts.push(`${majors} große Arkana-Karte${majors > 1 ? 'n' : ''} markieren die entscheidenden Wendepunkte.`);
  if (dominant && dominant[1] >= 2) {
    const meaning: Record<string, string> = { Stäbe: 'Tatkraft und Leidenschaft', Kelche: 'Gefühle und Beziehungen', Schwerter: 'Gedanken und klare Kommunikation', Münzen: 'Körper, Finanzen und den Alltag' };
    parts.push(`Die ${dominant[0]} überwiegen – der Schwerpunkt liegt auf ${meaning[dominant[0]]}.`);
  }
  if (rev / cs.length >= 0.5) parts.push('Viele umgekehrte Karten deuten auf innere Blockaden oder Verzögerungen hin – sei geduldig und sanft mit dir.');
  const last = cs[cs.length - 1];
  parts.push(`Die letzte Karte, ${last.name}${last.rev ? ' (umgekehrt)' : ''}, gibt die Richtung vor: ${last.rev ? last.reversed : last.upright}`);
  return parts.join(' ');
};
