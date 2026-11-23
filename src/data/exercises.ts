// Übungsbibliothek: Ansicht, Bewegungsablauf (Posen), Anleitung, typische Fehler, Varianten
import type { FrontPoseKey, SidePoseKey } from '@/data/poses';
import type { Prop } from '@/lib/pose';

export type Frame = { side?: SidePoseKey; front?: FrontPoseKey; mirror?: boolean; ms: number };
export type ExerciseView = 'side' | 'front' | 'both';

export type Exercise = {
  id: string;
  name: string;
  sanskrit?: string;
  view: ExerciseView; // gewählt danach, aus welcher Perspektive die Ausführung am besten erkennbar ist
  frames: Frame[];
  props?: Prop[];
  muscles: string;
  how: string[];
  mistakes: string[];
  easier: string;
  harder: string;
  breath?: string;
  caution?: string;
};

const E = (e: Exercise) => e;
const hold = (side?: SidePoseKey, front?: FrontPoseKey): Frame[] => [{ side, front, ms: 4000 }];

export const EXERCISES: Record<string, Exercise> = {
  // ================= YOGA =================
  tadasana: E({
    id: 'tadasana', name: 'Berghaltung', sanskrit: 'Tadasana / Samasthiti', view: 'both', frames: [{ side: 'stand', front: 'stand', ms: 4000 }],
    muscles: 'Haltung, Fußgewölbe, Rumpf',
    how: ['Füße hüftbreit oder zusammen, Gewicht gleichmäßig auf Ballen und Fersen.', 'Knie weich, Becken neutral, Brustbein leicht gehoben.', 'Schultern sinken, Scheitel strebt nach oben.'],
    mistakes: ['Hohlkreuz durch nach vorn gekipptes Becken.', 'Durchgedrückte Knie.'],
    easier: 'Füße etwas weiter auseinander.', harder: 'Augen schließen und die Balance halten.', breath: 'Ruhige Bauchatmung durch die Nase.',
  }),
  urdhvaHastasana: E({
    id: 'urdhvaHastasana', name: 'Gestreckte Berghaltung', sanskrit: 'Urdhva Hastasana', view: 'side', frames: hold('armsUp'),
    muscles: 'Schultern, Flanken, Wirbelsäulenstrecker',
    how: ['Mit der Einatmung die Arme seitlich über den Kopf führen.', 'Handflächen zueinander, Schultern weg von den Ohren.', 'Rippen nicht nach vorn schieben.'],
    mistakes: ['Hohlkreuz statt Länge im Rücken.'], easier: 'Arme schulterbreit lassen.', harder: 'Handflächen zusammen, Blick zu den Daumen.', breath: 'Einatmen.',
  }),
  uttanasana: E({
    id: 'uttanasana', name: 'Stehende Vorbeuge', sanskrit: 'Uttanasana', view: 'side', frames: hold('fold'),
    muscles: 'Rückseite der Beine, Rückenstrecker',
    how: ['Aus der Hüfte nach vorn beugen, nicht aus dem Rücken.', 'Knie dürfen gebeugt sein, Bauch Richtung Oberschenkel.', 'Kopf und Nacken hängen locker.'],
    mistakes: ['Mit rundem Rücken und gestreckten Knien ziehen.'], easier: 'Knie deutlich beugen, Hände auf Blöcke oder Schienbeine.', harder: 'Beine strecken, Hände flach neben die Füße.', breath: 'Ausatmen.',
  }),
  ardhaUttanasana: E({
    id: 'ardhaUttanasana', name: 'Halbe Vorbeuge', sanskrit: 'Ardha Uttanasana', view: 'side', frames: hold('halfLift'),
    muscles: 'Rückenstrecker, hintere Beinmuskulatur',
    how: ['Hände auf die Schienbeine, Rücken lang machen.', 'Brustbein nach vorn, Blick schräg nach unten.', 'Nacken in Verlängerung der Wirbelsäule.'],
    mistakes: ['Kopf in den Nacken legen.'], easier: 'Hände auf die Oberschenkel.', harder: 'Fingerspitzen neben den Füßen am Boden.', breath: 'Einatmen.',
  }),
  chaturanga: E({
    id: 'chaturanga', name: 'Stockhaltung', sanskrit: 'Chaturanga Dandasana', view: 'side', frames: [{ side: 'plank', ms: 1800 }, { side: 'chaturanga', ms: 2200 }],
    muscles: 'Trizeps, Brust, Rumpf',
    how: ['Aus dem Brett nach vorn auf die Zehenspitzen schieben.', 'Ellbogen nah am Körper nach hinten beugen, bis Oberarme parallel zum Boden sind.', 'Körper bleibt eine gerade Linie.'],
    mistakes: ['Schultern sinken tiefer als die Ellbogen.', 'Becken hängt durch.'],
    easier: 'Knie ablegen und dann den Oberkörper absenken.', harder: 'Langsam in 5 Sekunden absenken.', breath: 'Ausatmen.', caution: 'Bei Schulterproblemen die Knie-Variante wählen.',
  }),
  upDog: E({
    id: 'upDog', name: 'Heraufschauender Hund', sanskrit: 'Urdhva Mukha Svanasana', view: 'side', frames: hold('upDog'),
    muscles: 'Brustöffnung, Rückenstrecker, Arme',
    how: ['Hände unter den Schultern, Arme gestreckt.', 'Fußrücken in den Boden drücken, Oberschenkel heben leicht ab.', 'Brust nach vorn und oben, Schultern weg von den Ohren.'],
    mistakes: ['In den Schultern hängen.', 'Lendenwirbelsäule stauchen.'], easier: 'Kobra mit Becken am Boden.', harder: 'Länger halten, Oberschenkel aktiv.', breath: 'Einatmen.',
  }),
  downDog: E({
    id: 'downDog', name: 'Herabschauender Hund', sanskrit: 'Adho Mukha Svanasana', view: 'side', frames: hold('downDog'),
    muscles: 'Schultern, Waden, hintere Oberschenkel, Rücken',
    how: ['Hände schulterbreit, Finger gespreizt, Gesäß nach hinten oben.', 'Rücken lang, Knie dürfen gebeugt sein.', 'Fersen Richtung Boden sinken lassen.'],
    mistakes: ['Runder Rücken, weil die Beine erzwungen gestreckt werden.'], easier: 'Knie beugen, Fersen hoch.', harder: 'Abwechselnd ein Bein heben (Drei-Bein-Hund).', breath: '5 ruhige Atemzüge.',
  }),
  plank: E({
    id: 'plank', name: 'Brett / Liegestütz-Position', sanskrit: 'Phalakasana', view: 'side', frames: hold('plank'),
    muscles: 'Rumpf, Schultern, Gesäß',
    how: ['Hände unter den Schultern, Körper eine Linie von Kopf bis Ferse.', 'Bauchnabel Richtung Wirbelsäule, Gesäß aktiv.', 'Blick zwischen die Hände.'],
    mistakes: ['Hohlkreuz oder Po zu hoch.'], easier: 'Knie ablegen.', harder: 'Ein Bein abheben.',
  }),
  warrior1: E({
    id: 'warrior1', name: 'Krieger I', sanskrit: 'Virabhadrasana I', view: 'side', frames: hold('warrior1'),
    muscles: 'Beine, Hüftbeuger (hinten), Schultern',
    how: ['Großer Schritt, vorderes Knie über dem Knöchel, 90° gebeugt.', 'Hintere Ferse am Boden, Fuß ca. 45° ausgedreht.', 'Hüfte zeigt nach vorn, Arme nach oben.'],
    mistakes: ['Vorderes Knie fällt nach innen.'], easier: 'Kürzerer Schritt, Hände an die Hüfte.', harder: 'Tiefer ins vordere Knie.', breath: '5 Atemzüge je Seite.',
  }),
  warrior2: E({
    id: 'warrior2', name: 'Krieger II', sanskrit: 'Virabhadrasana II', view: 'front', frames: hold(undefined, 'warrior2'),
    muscles: 'Beine, Hüftöffnung, Schultern',
    how: ['Breiter Stand, vorderer Fuß zeigt nach vorn, hinterer quer.', 'Vorderes Knie über dem Knöchel, zeigt zum kleinen Zeh.', 'Arme auf Schulterhöhe, Blick über die vordere Hand.'],
    mistakes: ['Oberkörper kippt zum vorderen Bein.'], easier: 'Weniger tief beugen.', harder: 'Oberschenkel parallel zum Boden.', breath: '5 Atemzüge je Seite.',
  }),
  trikonasana: E({
    id: 'trikonasana', name: 'Dreieck', sanskrit: 'Utthita Trikonasana', view: 'front', frames: [{ front: 'armsSide', ms: 1500 }, { front: 'triangle', ms: 4000 }],
    muscles: 'Flanken, Beinrückseite, Hüfte',
    how: ['Breiter Stand mit gestreckten Beinen.', 'Becken nach hinten schieben, Oberkörper seitlich über das vordere Bein verlängern.', 'Untere Hand am Schienbein, obere Hand zur Decke.'],
    mistakes: ['Oberkörper rotiert nach unten.'], easier: 'Hand höher am Bein oder auf einen Block.', harder: 'Hand hinter den vorderen Fuß auf den Boden.', breath: '5 Atemzüge je Seite.',
  }),
  sideAngle: E({
    id: 'sideAngle', name: 'Gestreckter Seitwinkel', sanskrit: 'Utthita Parsvakonasana', view: 'front', frames: hold(undefined, 'sideAngle'),
    muscles: 'Beine, Flanken, Hüfte',
    how: ['Aus Krieger II den Unterarm auf den vorderen Oberschenkel legen.', 'Oberen Arm diagonal über das Ohr strecken.', 'Eine Linie von hinterer Ferse bis Fingerspitze.'],
    mistakes: ['Gewicht hängt auf dem Unterarm.'], easier: 'Unterarm auf dem Oberschenkel lassen.', harder: 'Hand neben den vorderen Fuß.',
  }),
  tree: E({
    id: 'tree', name: 'Baum', sanskrit: 'Vrksasana', view: 'front', frames: [{ front: 'treeHeart', ms: 3000 }, { front: 'tree', ms: 4000 }],
    muscles: 'Gleichgewicht, Fußmuskulatur, Hüftöffnung',
    how: ['Gewicht auf ein Bein, Fußsohle an Wade oder Innenschenkel – nie aufs Knie.', 'Knie zeigt zur Seite, Becken bleibt gerade.', 'Hände vor dem Herzen, dann nach oben.'],
    mistakes: ['Fuß gegen das Kniegelenk drücken.'], easier: 'Zehen am Boden lassen, Ferse an den Knöchel.', harder: 'Augen schließen.', breath: '5 Atemzüge je Seite.',
  }),
  chairPose: E({
    id: 'chairPose', name: 'Stuhl', sanskrit: 'Utkatasana', view: 'side', frames: [{ side: 'armsUp', ms: 1500 }, { side: 'chairPose', ms: 4000 }],
    muscles: 'Oberschenkel, Gesäß, Rückenstrecker',
    how: ['Knie beugen, als wolltest du dich setzen.', 'Gewicht auf den Fersen, Knie hinter den Zehen sichtbar.', 'Arme neben den Ohren.'],
    mistakes: ['Hohlkreuz.'], easier: 'Hände vor der Brust.', harder: 'Tiefer, länger halten.',
  }),
  lowLunge: E({
    id: 'lowLunge', name: 'Tiefer Ausfallschritt', sanskrit: 'Anjaneyasana', view: 'side', frames: [{ side: 'lowLungeHandsDown', ms: 2000 }, { side: 'lowLunge', ms: 4000 }],
    muscles: 'Hüftbeuger (hinteres Bein), Oberschenkel',
    how: ['Hinteres Knie ablegen (Decke unterlegen).', 'Becken sanft nach vorn unten sinken lassen.', 'Arme nach oben, Brust heben.'],
    mistakes: ['Vorderes Knie weit über die Zehen.'], easier: 'Hände auf dem vorderen Oberschenkel.', harder: 'Leichte Rückbeuge.', breath: '5 Atemzüge je Seite.',
  }),
  child: E({
    id: 'child', name: 'Kindhaltung', sanskrit: 'Balasana', view: 'side', frames: hold('child'),
    muscles: 'Rücken, Hüfte – Entspannung',
    how: ['Auf die Fersen setzen, Knie hüftbreit oder geschlossen.', 'Oberkörper sinkt auf die Oberschenkel, Stirn zum Boden.', 'Arme nach vorn oder neben den Körper.'],
    mistakes: ['Kein typischer Fehler – Kissen sind erlaubt.'], easier: 'Kissen zwischen Gesäß und Fersen.', harder: 'Arme weit nach vorn strecken.', breath: 'Tief in den Rücken atmen.',
  }),
  catCow: E({
    id: 'catCow', name: 'Katze-Kuh', sanskrit: 'Marjaryasana / Bitilasana', view: 'side', frames: [{ side: 'cow', ms: 2500 }, { side: 'cat', ms: 2500 }],
    muscles: 'Wirbelsäulen-Mobilität',
    how: ['Vierfüßlerstand: Hände unter Schultern, Knie unter Hüften.', 'Einatmen: Brust nach vorn, Rücken sinkt (Kuh).', 'Ausatmen: Rücken rund, Kinn zur Brust (Katze).'],
    mistakes: ['Bewegung nur im Nacken.'], easier: 'Kleinere Bewegung.', harder: 'Langsamer, Wirbel für Wirbel.', breath: 'Bewegung folgt dem Atem.',
  }),
  cobra: E({
    id: 'cobra', name: 'Kobra', sanskrit: 'Bhujangasana', view: 'side', frames: [{ side: 'prone', ms: 2000 }, { side: 'cobra', ms: 3500 }],
    muscles: 'Rückenstrecker, Brustöffnung',
    how: ['Bauchlage, Hände neben der Brust.', 'Mit der Einatmung Brust heben, Ellbogen bleiben gebeugt und nah.', 'Schambein bleibt am Boden.'],
    mistakes: ['Mit den Armen hochdrücken statt mit dem Rücken.'], easier: 'Sphinx auf den Unterarmen.', harder: 'Hände kurz abheben.',
  }),
  bridgeYoga: E({
    id: 'bridgeYoga', name: 'Schulterbrücke', sanskrit: 'Setu Bandha Sarvangasana', view: 'side', frames: [{ side: 'hookLying', ms: 2000 }, { side: 'bridge', ms: 4000 }],
    muscles: 'Gesäß, Beinrückseite, Brustöffnung',
    how: ['Rückenlage, Füße hüftbreit nah am Gesäß.', 'Becken heben, Knie zeigen nach vorn.', 'Kinn bleibt leicht zur Brust, Nacken lang.'],
    mistakes: ['Knie fallen auseinander.', 'Kopf drehen während der Haltung.'], easier: 'Becken nur wenig heben.', harder: 'Ein Bein strecken.',
  }),
  seatedFold: E({
    id: 'seatedFold', name: 'Sitzende Vorbeuge', sanskrit: 'Paschimottanasana', view: 'side', frames: [{ side: 'seatedTall', ms: 2000 }, { side: 'seatedFold', ms: 4000 }],
    muscles: 'Beinrückseite, Rücken',
    how: ['Aufrecht sitzen, Beine nach vorn gestreckt.', 'Aus der Hüfte über die Beine verlängern.', 'Hände an Schienbeine oder Füße.'],
    mistakes: ['Mit Kraft ziehen und den Rücken runden.'], easier: 'Knie beugen, auf ein Kissen setzen.', harder: 'Füße umfassen.',
  }),
  supineTwist: E({
    id: 'supineTwist', name: 'Liegender Drehsitz', sanskrit: 'Supta Matsyendrasana', view: 'side', frames: hold('supineTwist'),
    muscles: 'Wirbelsäulen-Rotation, Gesäß',
    how: ['Rückenlage, Knie anziehen und zur Seite sinken lassen.', 'Arme seitlich ausbreiten, Schultern bleiben am Boden.', 'Blick zur Gegenseite.'],
    mistakes: ['Schulter hebt ab.'], easier: 'Kissen unter die Knie.', harder: 'Oberes Bein strecken.',
  }),
  savasana: E({
    id: 'savasana', name: 'Endentspannung', sanskrit: 'Savasana', view: 'side', frames: hold('savasana'),
    muscles: 'Ganzer Körper – Regeneration',
    how: ['Rückenlage, Beine und Arme locker, Handflächen nach oben.', 'Augen schließen, Atem frei fließen lassen.', 'Körperteile nacheinander bewusst entspannen.'],
    mistakes: ['Zu früh aufstehen – mindestens 3 Minuten bleiben.'], easier: 'Kissen unter die Knie.', harder: 'Body-Scan dazu nehmen.',
  }),
  meditation: E({
    id: 'meditation', name: 'Bequemer Sitz', sanskrit: 'Sukhasana', view: 'front', frames: hold(undefined, 'crossLegged'),
    muscles: 'Aufrichtung, Hüftöffnung',
    how: ['Im Schneidersitz auf ein Kissen setzen.', 'Wirbelsäule aufrecht, Hände auf den Knien.', 'Augen schließen, Atem beobachten.'],
    mistakes: ['Knie höher als die Hüfte (Kissen fehlt).'], easier: 'Auf einem Stuhl sitzen.', harder: 'Ohne Kissen sitzen.',
  }),
  // ---- Yin ----
  butterflyYin: E({
    id: 'butterflyYin', name: 'Schmetterling (Yin)', sanskrit: 'Baddha Konasana (Yin-Variante)', view: 'front', frames: hold(undefined, 'butterfly'),
    muscles: 'Innenseite der Oberschenkel, unterer Rücken (Faszien)',
    how: ['Fußsohlen zusammen, Füße etwa eine Unterarmlänge vor dem Becken.', 'Oberkörper rund nach vorn sinken lassen – ohne Muskelkraft.', 'Still bleiben, Spannung nur bis zum ersten deutlichen Ziehen.'],
    mistakes: ['Aktiv dehnen oder wippen.'], easier: 'Kissen unter die Knie.', harder: 'Länger halten (5 Minuten).', breath: 'Lang ausatmen und loslassen.',
  }),
  caterpillar: E({
    id: 'caterpillar', name: 'Raupe (Yin)', sanskrit: 'Paschimottanasana (Yin-Variante)', view: 'side', frames: hold('caterpillar'),
    muscles: 'Rückseite der Beine, Rücken',
    how: ['Beine nach vorn, Knie dürfen gebeugt sein.', 'Rücken rund werden lassen, Kopf hängt.', 'Völlig passiv bleiben.'],
    mistakes: ['Zu den Füßen ziehen wollen.'], easier: 'Rolle unter die Knie.', harder: 'Beine strecken.',
  }),
  sphinx: E({
    id: 'sphinx', name: 'Sphinx', sanskrit: 'Salamba Bhujangasana', view: 'side', frames: hold('sphinx'),
    muscles: 'Lendenwirbelsäule (sanfte Kompression), Brustöffnung',
    how: ['Bauchlage, Ellbogen unter den Schultern.', 'Bauch und Gesäß entspannen.', 'Bei Druck im unteren Rücken Ellbogen weiter nach vorn.'],
    mistakes: ['Schultern hochziehen.'], easier: 'Stirn auf die Hände legen.', harder: 'Seehund mit gestreckten Armen.',
  }),
  dragon: E({
    id: 'dragon', name: 'Drache (Yin)', view: 'side', frames: hold('dragon'),
    muscles: 'Hüftbeuger, Leiste',
    how: ['Tiefer Ausfallschritt, hinteres Knie abgelegt.', 'Hände neben dem vorderen Fuß oder auf Blöcken.', 'Becken sinken lassen, nicht aktiv drücken.'],
    mistakes: ['Schmerz im Knie – Decke unterlegen.'], easier: 'Hände auf das vordere Knie.', harder: 'Unterarme auf Blöcke.',
  }),

  // ================= KRAFT / HIIT =================
  march: E({
    id: 'march', name: 'Marschieren auf der Stelle', view: 'side', frames: [{ side: 'march', ms: 600 }, { side: 'stand', ms: 300 }, { side: 'march', mirror: true, ms: 600 }, { side: 'stand', ms: 300 }],
    muscles: 'Kreislauf, Hüftbeuger', how: ['Knie im Wechsel auf Hüfthöhe heben.', 'Arme schwingen gegengleich mit.', 'Aufrecht bleiben.'],
    mistakes: ['Rücklage.'], easier: 'Knie weniger hoch.', harder: 'Tempo steigern.',
  }),
  jumpingJack: E({
    id: 'jumpingJack', name: 'Hampelmann', view: 'front', frames: [{ front: 'jackClosed', ms: 500 }, { front: 'jackOpen', ms: 500 }],
    muscles: 'Ganzkörper, Kreislauf', how: ['Gleichzeitig Beine öffnen und Arme über den Kopf.', 'Zurück in die Ausgangsposition.', 'Leise auf dem Vorfuß landen.'],
    mistakes: ['Harte Landung auf den Fersen.'], easier: 'Ohne Sprung: Bein abwechselnd zur Seite tippen.', harder: 'Tempo erhöhen.',
  }),
  armCircles: E({
    id: 'armCircles', name: 'Armkreisen', view: 'front', frames: [{ front: 'armsSide', ms: 700 }, { front: 'armsUp', ms: 700 }, { front: 'armsSide', ms: 700 }, { front: 'stand', ms: 700 }],
    muscles: 'Schultergelenk', how: ['Arme seitlich in großen Kreisen bewegen.', 'Nach 15 Sekunden Richtung wechseln.', 'Schultern locker.'],
    mistakes: ['Schultern hochziehen.'], easier: 'Kleinere Kreise.', harder: 'Größere, langsamere Kreise.',
  }),
  squat: E({
    id: 'squat', name: 'Kniebeuge', view: 'side', frames: [{ side: 'armsForward', ms: 1000 }, { side: 'squat', ms: 1500 }],
    muscles: 'Oberschenkel, Gesäß', how: ['Füße hüft- bis schulterbreit, Zehen leicht nach außen.', 'Gesäß nach hinten unten, als ob du dich setzt.', 'Knie folgen den Zehen, Rücken bleibt gerade, Fersen am Boden.'],
    mistakes: ['Knie fallen nach innen.', 'Fersen heben ab.'], easier: 'Nur bis zu einem Stuhl absenken.', harder: 'Unten 2 Sekunden halten oder Gewicht in die Hände.',
  }),
  lunge: E({
    id: 'lunge', name: 'Ausfallschritt', view: 'side', frames: [{ side: 'stand', ms: 900 }, { side: 'lunge', ms: 1400 }],
    muscles: 'Oberschenkel, Gesäß, Gleichgewicht', how: ['Großer Schritt nach vorn.', 'Hinteres Knie Richtung Boden senken, beide Knie ca. 90°.', 'Über die vordere Ferse zurückdrücken.'],
    mistakes: ['Oberkörper kippt nach vorn.'], easier: 'Kleinere Bewegung, an einer Wand festhalten.', harder: 'Gehende Ausfallschritte.',
  }),
  gluteBridge: E({
    id: 'gluteBridge', name: 'Glute Bridge', view: 'side', frames: [{ side: 'hookLying', ms: 1000 }, { side: 'bridge', ms: 1400 }],
    muscles: 'Gesäß, Beinrückseite', how: ['Rückenlage, Füße nah am Gesäß.', 'Becken heben, bis Knie, Hüfte und Schultern eine Linie bilden.', 'Oben das Gesäß 1 Sekunde fest anspannen.'],
    mistakes: ['Hohlkreuz statt Gesäßarbeit.'], easier: 'Kleinere Bewegung.', harder: 'Einbeinig.',
  }),
  donkeyKick: E({
    id: 'donkeyKick', name: 'Esel-Kick', view: 'side', frames: [{ side: 'tableTop', ms: 900 }, { side: 'donkeyKick', ms: 1200 }],
    muscles: 'Großer Gesäßmuskel', how: ['Vierfüßlerstand, Rücken gerade.', 'Ein Bein mit 90° im Knie Richtung Decke drücken.', 'Becken bleibt waagerecht.'],
    mistakes: ['Hohlkreuz beim Heben.'], easier: 'Bein weniger hoch.', harder: 'Oben 2 Sekunden halten.',
  }),
  sideLegRaise: E({
    id: 'sideLegRaise', name: 'Seitliches Beinheben im Stand', view: 'front', frames: [{ front: 'handsHips', ms: 900 }, { front: 'legRaiseR', ms: 1200 }],
    muscles: 'Mittlerer Gesäßmuskel (Hüftstabilität)', how: ['Hände an die Hüfte, aufrecht stehen.', 'Gestrecktes Bein seitlich heben, Zehen zeigen nach vorn.', 'Langsam zurück, Oberkörper bleibt ruhig.'],
    mistakes: ['Oberkörper neigt sich zur Seite.'], easier: 'An einer Wand festhalten.', harder: 'Widerstandsband um die Knöchel.',
  }),
  forearmPlank: E({
    id: 'forearmPlank', name: 'Unterarmstütz', view: 'side', frames: hold('forearmPlank'),
    muscles: 'Tiefe Bauchmuskulatur, Rumpf', how: ['Ellbogen unter den Schultern, Körper eine Linie.', 'Bauch fest, Gesäß angespannt.', 'Gleichmäßig weiteratmen.'],
    mistakes: ['Becken hängt durch.'], easier: 'Knie ablegen.', harder: 'Abwechselnd ein Bein heben.',
  }),
  pushUp: E({
    id: 'pushUp', name: 'Liegestütz', view: 'side', frames: [{ side: 'plank', ms: 1000 }, { side: 'chaturanga', ms: 1200 }],
    muscles: 'Brust, Trizeps, Rumpf', how: ['Hände etwas breiter als schulterbreit.', 'Ellbogen ca. 45° zum Körper beugen.', 'Körper bleibt gerade wie ein Brett.'],
    mistakes: ['Ellbogen 90° seitlich abgespreizt.'], easier: 'Auf den Knien oder an der Wand.', harder: 'Füße erhöht.',
  }),
  crunch: E({
    id: 'crunch', name: 'Crunch', view: 'side', frames: [{ side: 'hookLying', ms: 1000 }, { side: 'crunch', ms: 1100 }],
    muscles: 'Gerader Bauchmuskel', how: ['Rückenlage, Füße aufgestellt.', 'Schulterblätter vom Boden lösen, Blick schräg nach oben.', 'Langsam ablegen.'],
    mistakes: ['Am Kopf ziehen.'], easier: 'Kleinere Bewegung.', harder: 'Arme über den Kopf.',
  }),
  wallSit: E({
    id: 'wallSit', name: 'Wandsitzen', view: 'side', props: ['wall'], frames: hold('wallSit'),
    muscles: 'Oberschenkel (isometrisch)', how: ['Rücken an die Wand, Füße einen Schritt vor.', 'Herunterrutschen, bis die Knie ca. 90° gebeugt sind.', 'Halten, Knie über den Knöcheln.'],
    mistakes: ['Knie weiter vorn als die Zehen.'], easier: 'Weniger tief.', harder: 'Länger halten.',
  }),
  stepUp: E({
    id: 'stepUp', name: 'Step-up auf Stuhl/Stufe', view: 'side', props: ['step'], frames: [{ side: 'stepUpLow', ms: 1000 }, { side: 'stepUpHigh', ms: 1000 }],
    muscles: 'Oberschenkel, Gesäß', how: ['Einen Fuß komplett auf die Stufe stellen.', 'Über das obere Bein hochdrücken.', 'Kontrolliert wieder absteigen, Bein wechseln.'],
    mistakes: ['Mit dem unteren Bein abstoßen.'], easier: 'Niedrigere Stufe.', harder: 'Höhere Stufe.', caution: 'Nur auf einem stabilen, rutschfesten Stuhl oder einer Treppe.',
  }),
  tricepsDip: E({
    id: 'tricepsDip', name: 'Trizeps-Dips am Stuhl', view: 'side', props: ['chair'], frames: [{ side: 'dipUp', ms: 1000 }, { side: 'dipDown', ms: 1200 }],
    muscles: 'Trizeps, Schultern', how: ['Hände hinter dir auf der Stuhlkante.', 'Ellbogen nach hinten beugen, Gesäß nah am Stuhl.', 'Wieder hochdrücken.'],
    mistakes: ['Ellbogen nach außen.'], easier: 'Füße näher am Stuhl.', harder: 'Beine gestreckt.', caution: 'Nur stabile Stühle verwenden.',
  }),
  highKnees: E({
    id: 'highKnees', name: 'Kniehebelauf', view: 'side', frames: [{ side: 'highKneeA', ms: 350 }, { side: 'highKneeB', ms: 350 }],
    muscles: 'Kreislauf, Hüftbeuger', how: ['Auf der Stelle laufen, Knie bis Hüfthöhe.', 'Arme schwingen mit.', 'Auf dem Vorfuß landen.'],
    mistakes: ['Rücklage.'], easier: 'Marschieren.', harder: 'Tempo erhöhen.',
  }),
  pushUpRotation: E({
    id: 'pushUpRotation', name: 'Liegestütz mit Rotation', view: 'side', frames: [{ side: 'chaturanga', ms: 900 }, { side: 'plank', ms: 700 }, { side: 'plankArmUp', ms: 1100 }, { side: 'plank', ms: 600 }],
    muscles: 'Brust, Schultern, schräge Bauchmuskeln', how: ['Ein Liegestütz.', 'Oben einen Arm Richtung Decke drehen.', 'Zurück und Seite wechseln.'],
    mistakes: ['Becken sackt beim Drehen ab.'], easier: 'Ohne Liegestütz nur rotieren.', harder: 'Langsamer.',
  }),
  sidePlank: E({
    id: 'sidePlank', name: 'Seitstütz', view: 'front', frames: hold(undefined, 'sidePlank'),
    muscles: 'Seitliche Rumpfmuskulatur', how: ['Ellbogen unter der Schulter.', 'Becken heben, Körper eine Linie.', 'Oberen Arm nach oben.'],
    mistakes: ['Becken sinkt ab.'], easier: 'Unteres Knie ablegen.', harder: 'Oberes Bein heben.',
  }),
  sidePlankKnee: E({
    id: 'sidePlankKnee', name: 'Seitstütz auf dem Knie (McGill)', view: 'front', frames: hold(undefined, 'sidePlankKnee'),
    muscles: 'Seitliche Rumpfmuskulatur, Quadratus lumborum', how: ['Seitlage, Knie gebeugt, Ellbogen unter der Schulter.', 'Becken heben, bis Knie, Hüfte und Schulter eine Linie bilden.', '10 Sekunden halten, absetzen, wiederholen.'],
    mistakes: ['Becken nach hinten schieben.'], easier: 'Kürzer halten.', harder: 'Mit gestreckten Beinen.',
  }),
  birdDog: E({
    id: 'birdDog', name: 'Vogel-Hund', view: 'side', frames: [{ side: 'tableTop', ms: 1200 }, { side: 'birdDog', ms: 2500 }, { side: 'tableTop', ms: 1200 }, { side: 'birdDog', mirror: true, ms: 2500 }],
    muscles: 'Rückenstrecker, Gesäß, Rumpfstabilität', how: ['Vierfüßlerstand, Rücken neutral.', 'Gegenüberliegenden Arm und Bein lang strecken.', '10 Sekunden halten, Becken bleibt waagerecht.'],
    mistakes: ['Bein zu hoch, Hohlkreuz.'], easier: 'Nur das Bein strecken.', harder: 'Ellbogen und Knie unter dem Bauch zusammenführen.',
  }),
  deadBug: E({
    id: 'deadBug', name: 'Dead Bug', view: 'side', frames: [{ side: 'deadBug', ms: 1200 }, { side: 'deadBugExt', ms: 1600 }],
    muscles: 'Tiefe Bauchmuskulatur', how: ['Rückenlage, Arme zur Decke, Knie 90° angewinkelt.', 'Gegenüberliegenden Arm und Bein langsam absenken.', 'Unterer Rücken bleibt am Boden.'],
    mistakes: ['Hohlkreuz beim Absenken.'], easier: 'Nur die Beine bewegen.', harder: 'Langsamer, tiefer.',
  }),
  curlUp: E({
    id: 'curlUp', name: 'McGill Curl-up', view: 'side', frames: [{ side: 'hookLying', ms: 1500 }, { side: 'curlUp', ms: 3000 }],
    muscles: 'Gerader Bauchmuskel ohne Belastung der Lendenwirbelsäule', how: ['Rückenlage, ein Bein gebeugt, ein Bein gestreckt.', 'Hände unter das Hohlkreuz, um es zu erhalten.', 'Kopf und Schultern minimal anheben, 10 Sekunden halten.'],
    mistakes: ['Kinn zur Brust ziehen.'], easier: 'Kürzer halten.', harder: 'Ellbogen vom Boden heben.',
  }),
  pelvicTilt: E({
    id: 'pelvicTilt', name: 'Beckenkippen', view: 'side', frames: [{ side: 'hookLying', ms: 1500 }, { side: 'pelvicTilt', ms: 1500 }],
    muscles: 'Lendenwirbelsäule – Mobilität', how: ['Rückenlage, Füße aufgestellt.', 'Unteren Rücken sanft in den Boden drücken, Becken kippt.', 'Lösen und wiederholen.'],
    mistakes: ['Gesäß hebt ab.'], easier: 'Kleiner bewegen.', harder: 'Langsamer.',
  }),
  // ================= MOBILITÄT / DEHNUNG =================
  neckStretch: E({
    id: 'neckStretch', name: 'Nacken dehnen', view: 'front', frames: [{ front: 'neckTiltR', ms: 3000 }, { front: 'stand', ms: 1200 }, { front: 'neckTiltL', ms: 3000 }, { front: 'stand', ms: 1200 }],
    muscles: 'Seitliche Nackenmuskulatur', how: ['Ohr Richtung Schulter neigen.', 'Gegenüberliegende Schulter sinkt.', 'Seite wechseln.'],
    mistakes: ['Kopf mit der Hand ziehen.'], easier: 'Kleinere Neigung.', harder: 'Länger halten.',
  }),
  shoulderRoll: E({
    id: 'shoulderRoll', name: 'Schulterkreisen', view: 'front', frames: [{ front: 'shoulderRollUp', ms: 800 }, { front: 'stand', ms: 800 }],
    muscles: 'Schultern, Nacken', how: ['Schultern zu den Ohren ziehen.', 'Nach hinten unten kreisen.', 'Langsam und groß.'], mistakes: ['Zu schnell.'], easier: 'Kleiner.', harder: 'Mit Armkreisen kombinieren.',
  }),
  chestOpener: E({
    id: 'chestOpener', name: 'Brustöffner', view: 'front', frames: [{ front: 'stand', ms: 1000 }, { front: 'chestOpen', ms: 2500 }],
    muscles: 'Brust, vordere Schulter', how: ['Arme im „U“ anheben, Ellbogen auf Schulterhöhe.', 'Schulterblätter zusammenziehen, Brust öffnen.', 'Halten und atmen.'], mistakes: ['Hohlkreuz.'], easier: 'Arme tiefer.', harder: 'Länger halten.',
  }),
  standingTwist: E({
    id: 'standingTwist', name: 'Rumpfrotation im Stand', view: 'front', frames: [{ front: 'twistR', ms: 1500 }, { front: 'twistL', ms: 1500 }],
    muscles: 'Brustwirbelsäule', how: ['Hüftbreit stehen, Becken bleibt nach vorn.', 'Oberkörper abwechselnd drehen.', 'Arme locker mitschwingen.'], mistakes: ['Becken dreht mit.'], easier: 'Kleiner.', harder: 'Langsamer mit Halten.',
  }),
  sideBend: E({
    id: 'sideBend', name: 'Seitneigung', view: 'front', frames: [{ front: 'sideBendR', ms: 2500 }, { front: 'stand', ms: 1000 }, { front: 'sideBendL', ms: 2500 }, { front: 'stand', ms: 1000 }],
    muscles: 'Flanken', how: ['Einen Arm über den Kopf.', 'Sanft zur Gegenseite neigen.', 'Hüfte bleibt mittig.'], mistakes: ['Oberkörper kippt nach vorn.'], easier: 'Hand in die Hüfte.', harder: 'Beide Arme hoch.',
  }),
  hipFlexorStretch: E({
    id: 'hipFlexorStretch', name: 'Hüftbeuger-Dehnung', view: 'side', frames: hold('lowLungeHandsDown'),
    muscles: 'Hüftbeuger', how: ['Halbkniestand, hinteres Knie auf einer Decke.', 'Gesäß anspannen, Becken leicht nach vorn schieben.', 'Ziehen vorn an der Hüfte spüren.'], mistakes: ['Hohlkreuz statt Beckenbewegung.'], easier: 'Kleinerer Schritt.', harder: 'Arm der hinteren Seite nach oben.',
  }),
  quadStretch: E({
    id: 'quadStretch', name: 'Oberschenkel-Dehnung', view: 'side', frames: hold('quadStretch'),
    muscles: 'Vordere Oberschenkel', how: ['Ferse zum Gesäß ziehen.', 'Knie zeigen nach unten, nebeneinander.', 'Wenn nötig an der Wand festhalten.'], mistakes: ['Knie wandert nach vorn.'], easier: 'Im Liegen auf der Seite.', harder: 'Ohne Festhalten.',
  }),
  hamstringStretch: E({
    id: 'hamstringStretch', name: 'Beinrückseite dehnen', view: 'side', frames: hold('hamstringStretch'),
    muscles: 'Hintere Oberschenkel', how: ['Eine Ferse vor dir aufsetzen, Zehen hoch.', 'Mit geradem Rücken aus der Hüfte nach vorn neigen.', 'Hinteres Knie leicht beugen.'], mistakes: ['Rundrücken.'], easier: 'Weniger weit vorbeugen.', harder: 'Länger halten.',
  }),
};

// Spiegelt eine Pose (nahe ↔ ferne Seite), z. B. für die andere Körperseite
export const mirrorPose = <T extends { ua: [number, number]; fa: [number, number]; th: [number, number]; sh: [number, number]; ft?: [number, number] }>(p: T): T => ({
  ...p,
  ua: [p.ua[1], p.ua[0]],
  fa: [p.fa[1], p.fa[0]],
  th: [p.th[1], p.th[0]],
  sh: [p.sh[1], p.sh[0]],
  ft: p.ft ? [p.ft[1], p.ft[0]] : undefined,
});
