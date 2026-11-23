// Achtsamkeitsübungen & Rituale – spielerisch, teils spirituell; zur Selbstreflexion
export type Ritual = {
  id: string;
  name: string;
  minutes: number;
  tag: string;
  color: string;
  dot: string;
  dark?: boolean;
  kind: 'oracle' | 'chakra' | 'clouds' | 'breath' | 'steps';
  intro: string;
  steps?: { text: string; sec: number }[];
};

export const RITUALS: Ritual[] = [
  { id: 'orakel', name: 'Orakelkarte ziehen', minutes: 1, tag: 'Intuition', color: '#1E1B4B', dot: '#FDE68A', dark: true, kind: 'oracle', intro: 'Atme dreimal tief und wähle intuitiv eine Karte.' },
  { id: 'chakra', name: 'Chakra-Atem', minutes: 7, tag: 'Farben & Atem', color: '#F3E8FF', dot: '#A855F7', kind: 'chakra', intro: 'Wandere mit dem Atem durch die sieben Energiezentren – von der Wurzel bis zur Krone.' },
  { id: 'wolken', name: 'Sorgen-Wolken', minutes: 2, tag: 'Loslassen', color: '#DBEAFE', dot: '#FFFFFF', kind: 'clouds', intro: 'Schreib Sorgen auf Wolken und puste sie davon.' },
  { id: 'box', name: 'Box-Atmen', minutes: 2, tag: 'Stress', color: '#F3EEFF', dot: '#7C3AED', kind: 'breath', intro: '4 Sekunden ein, 4 halten, 4 aus, 4 halten.' },
  { id: '478', name: '4-7-8-Atmung', minutes: 2, tag: 'Einschlafen', color: '#E0E7FF', dot: '#4F46E5', kind: 'breath', intro: '4 Sekunden ein, 7 halten, 8 aus – beruhigt das Nervensystem.' },
  {
    id: 'mond', name: 'Mond-Ritual', minutes: 6, tag: 'Intention', color: '#0F172A', dot: '#E2E8F0', dark: true, kind: 'steps', intro: 'Bei Neumond Wünsche säen, bei Vollmond loslassen.',
    steps: [
      { text: 'Zünde eine Kerze an oder dimme das Licht. Setz dich bequem hin.', sec: 30 },
      { text: 'Schließe die Augen und stell dir das silberne Mondlicht vor, das dich umhüllt.', sec: 45 },
      { text: 'Neumond: Was möchtest du in den nächsten Wochen wachsen lassen? Formuliere einen Satz im Präsens.', sec: 60 },
      { text: 'Vollmond: Was darfst du loslassen? Stell dir vor, wie es mit dem Ausatmen davonfließt.', sec: 60 },
      { text: 'Bedanke dich innerlich bei dir selbst für diesen Moment.', sec: 30 },
      { text: 'Halte deine Intention im Tagebuch fest.', sec: 45 },
    ],
  },
  {
    id: 'baum', name: 'Baum-Erdung', minutes: 5, tag: 'Wurzeln spüren', color: '#DCFCE7', dot: '#16A34A', kind: 'steps', intro: 'Spüre, wie du verwurzelt und getragen bist.',
    steps: [
      { text: 'Stell dich barfuß hin, Füße hüftbreit. Spüre den Boden.', sec: 30 },
      { text: 'Stell dir vor, aus deinen Fußsohlen wachsen Wurzeln tief in die Erde.', sec: 60 },
      { text: 'Mit jeder Einatmung ziehst du Ruhe und Kraft durch die Wurzeln nach oben.', sec: 60 },
      { text: 'Deine Arme sind Äste, die sich im Wind wiegen – lass sie sanft schwingen.', sec: 60 },
      { text: 'Komm zurück in den Stand. Wie fühlst du dich jetzt?', sec: 30 },
    ],
  },
  {
    id: 'klang', name: 'Klangschalen-Lauschen', minutes: 3, tag: 'Lauschen', color: '#FEF3C7', dot: '#D97706', kind: 'steps', intro: 'Folge einem Klang, bis er verklingt.',
    steps: [
      { text: 'Schließe die Augen. Stell dir den tiefen Ton einer Klangschale vor.', sec: 40 },
      { text: 'Folge dem Klang, wie er sich ausbreitet und langsam leiser wird.', sec: 60 },
      { text: 'Lausche danach den Geräuschen um dich herum – ohne sie zu bewerten.', sec: 60 },
      { text: 'Komm mit einem tiefen Atemzug zurück.', sec: 20 },
    ],
  },
  {
    id: 'aura', name: 'Aura-Farbe des Tages', minutes: 1, tag: 'Stimmung', color: '#FCE7F3', dot: '#EC4899', kind: 'steps', intro: 'Welche Farbe umgibt dich heute?',
    steps: [
      { text: 'Schließe die Augen und spüre in dich hinein.', sec: 20 },
      { text: 'Welche Farbe taucht auf? Rot (Kraft), Orange (Freude), Gelb (Mut), Grün (Heilung), Blau (Ruhe), Violett (Intuition)?', sec: 30 },
      { text: 'Stell dir vor, wie diese Farbe dich wie ein Mantel umhüllt und schützt.', sec: 30 },
    ],
  },
  {
    id: 'bodyscan', name: 'Body-Scan', minutes: 8, tag: 'Ruhe', color: '#E6FFF6', dot: '#0D9488', kind: 'steps', intro: 'Wandere mit der Aufmerksamkeit durch den Körper.',
    steps: [
      { text: 'Leg dich bequem hin. Spüre die Auflagefläche deines Körpers.', sec: 45 },
      { text: 'Richte die Aufmerksamkeit auf deine Füße und Zehen. Nur wahrnehmen.', sec: 60 },
      { text: 'Wandere weiter zu Waden, Knien und Oberschenkeln.', sec: 60 },
      { text: 'Spüre Becken, Bauch und den unteren Rücken. Wie bewegt sich der Atem?', sec: 75 },
      { text: 'Brust, Schultern, Arme bis in die Fingerspitzen.', sec: 75 },
      { text: 'Nacken, Kiefer, Gesicht – lass alles weich werden.', sec: 60 },
      { text: 'Spüre deinen Körper als Ganzes. Atme drei Mal tief.', sec: 45 },
    ],
  },
  {
    id: 'licht', name: 'Lichtdusche', minutes: 4, tag: 'Visualisierung', color: '#FFF7ED', dot: '#FFC494', kind: 'steps', intro: 'Ein warmer Lichtstrahl reinigt dich von Kopf bis Fuß.',
    steps: [
      { text: 'Stell dir über deinem Kopf eine Quelle aus warmem, goldenem Licht vor.', sec: 40 },
      { text: 'Das Licht fließt langsam über Kopf, Gesicht und Schultern.', sec: 50 },
      { text: 'Es wäscht alles ab, was du heute nicht mehr brauchst.', sec: 60 },
      { text: 'Das Licht sammelt sich unter deinen Füßen und versickert in der Erde.', sec: 50 },
      { text: 'Du fühlst dich klar, leicht und erfrischt.', sec: 30 },
    ],
  },
  {
    id: 'selbstmitgefuehl', name: 'Selbstmitgefühl-Pause', minutes: 3, tag: 'Stress', color: '#FDF2F8', dot: '#DB2777', kind: 'steps', intro: 'Nach Kristin Neff: freundlich zu dir sein, wenn es schwer ist.',
    steps: [
      { text: 'Leg eine Hand aufs Herz. Spüre die Wärme.', sec: 30 },
      { text: 'Sag innerlich: „Das ist gerade ein schwerer Moment.“', sec: 30 },
      { text: '„Schwierigkeiten gehören zum Leben – ich bin nicht allein damit.“', sec: 40 },
      { text: '„Möge ich freundlich zu mir sein.“ Wiederhole es ein paar Atemzüge lang.', sec: 60 },
    ],
  },
  {
    id: '54321', name: '5-4-3-2-1-Erdung', minutes: 2, tag: 'Angst & Unruhe', color: '#ECFDF5', dot: '#059669', kind: 'steps', intro: 'Mit allen Sinnen zurück ins Hier und Jetzt.',
    steps: [
      { text: 'Nenne 5 Dinge, die du siehst.', sec: 25 },
      { text: 'Nenne 4 Dinge, die du fühlst (Stoff, Boden, Temperatur …).', sec: 25 },
      { text: 'Nenne 3 Dinge, die du hörst.', sec: 25 },
      { text: 'Nenne 2 Dinge, die du riechst.', sec: 20 },
      { text: 'Nenne 1 Sache, die du schmeckst.', sec: 15 },
    ],
  },
];

export const ORACLE = [
  { name: 'Vertrauen', msg: 'Du musst heute nicht alles wissen. Der nächste kleine Schritt reicht vollkommen.' },
  { name: 'Fülle', msg: 'Schau dich um: Was ist schon da, wofür du dankbar sein kannst? Fülle beginnt im Blick.' },
  { name: 'Grenzen', msg: 'Ein liebevolles Nein zu anderen ist ein Ja zu dir selbst.' },
  { name: 'Leichtigkeit', msg: 'Nimm dich heute nicht ganz so ernst. Lachen ist auch Selbstfürsorge.' },
  { name: 'Mut', msg: 'Die Angst geht mit, aber du hältst das Steuer. Trau dich.' },
  { name: 'Ruhe', msg: 'Pausen sind kein Luxus, sondern der Boden, auf dem Neues wächst.' },
  { name: 'Verbindung', msg: 'Melde dich bei jemandem, an den du gerade denkst.' },
  { name: 'Wandel', msg: 'Was sich verändert, macht Platz für etwas, das besser zu dir passt.' },
  { name: 'Intuition', msg: 'Dein Bauch weiß es schon. Hör heute genauer hin.' },
  { name: 'Selbstliebe', msg: 'Sprich heute mit dir wie mit deiner besten Freundin.' },
  { name: 'Geduld', msg: 'Auch Bäume wachsen nicht schneller, wenn man an ihnen zieht.' },
  { name: 'Freude', msg: 'Tu heute eine Sache nur, weil sie dir Freude macht.' },
];

export const CHAKRAS = [
  { name: 'Wurzel-Chakra', color: '#EF4444', text: 'Spür den Boden unter dir. Du bist sicher und getragen.' },
  { name: 'Sakral-Chakra', color: '#F97316', text: 'Atme in den Bauch. Erlaube dir Freude und Kreativität.' },
  { name: 'Solarplexus-Chakra', color: '#EAB308', text: 'Atme in die Mitte. Spür deine Kraft und dein Selbstvertrauen.' },
  { name: 'Herz-Chakra', color: '#22C55E', text: 'Atme ins Herz. Schick dir selbst etwas Wärme.' },
  { name: 'Hals-Chakra', color: '#3B82F6', text: 'Atme in den Hals. Was möchtest du heute aussprechen?' },
  { name: 'Stirn-Chakra', color: '#6366F1', text: 'Atme zwischen die Augen. Vertrau deinem Gefühl.' },
  { name: 'Kronen-Chakra', color: '#A855F7', text: 'Atme zum Scheitel. Du bist verbunden mit allem, was ist.' },
];

export const AFFIRMATIONS = [
  'Ich bin genug, genau so wie ich heute bin.',
  'Ich darf Pausen machen, ohne sie zu verdienen.',
  'Ich wachse in meinem eigenen Tempo.',
  'Ich vertraue meinem Körper und meinem Gefühl.',
  'Ich lasse los, was ich nicht kontrollieren kann.',
  'Ich bin freundlich zu mir, auch an schweren Tagen.',
  'Mein Wert hängt nicht von meiner Leistung ab.',
  'Ich ziehe Menschen an, die mir guttun.',
  'Ich habe schon so viel geschafft – ich schaffe auch das.',
  'Heute wähle ich Ruhe statt Eile.',
];

export const INTENTIONS = ['Leichtigkeit', 'Mut', 'Geduld', 'Klarheit', 'Freude', 'Gelassenheit', 'Fokus', 'Dankbarkeit', 'Verbindung', 'Neugier', 'Sanftheit', 'Vertrauen'];

export const DAILY_QUESTIONS = [
  'Worauf freust du dich morgen?',
  'Wer hat dich heute zum Lächeln gebracht?',
  'Was hast du heute zum ersten Mal gemacht?',
  'Welche kleine Sache hat dir heute gutgetan?',
  'Was würdest du heute deinem jüngeren Ich sagen?',
  'Welches Geräusch magst du besonders?',
  'Was hat dich heute überrascht?',
];

export const GOOD_TAGS = ['Freunde', 'Bewegung', 'Familie', 'Natur', 'Handy weg', 'Me-Time', 'Gutes Essen', 'Musik', 'Schlaf', 'Kreativ', 'Lachen', 'Erfolg'];
