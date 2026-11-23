// Rezeptsammlung – Nährwerte pro Portion (Richtwerte), Zutaten für die angegebene Portionenzahl
import type { ShopCategory } from '@/types';

export type Ingredient = { name: string; amount: number; unit: string; cat: ShopCategory };
export type Diet = 'vegan' | 'vegetarisch' | 'alles';
export type Recipe = {
  id: string;
  name: string;
  diet: Diet;
  meal: 'fruehstueck' | 'hauptgericht' | 'snack';
  minutes: number;
  servings: number;
  kcal: number; p: number; c: number; f: number;
  tags: string[];
  ingredients: Ingredient[];
  steps: string[];
};

const L: ShopCategory = 'lebensmittel';
const i = (name: string, amount: number, unit: string, cat: ShopCategory = L): Ingredient => ({ name, amount, unit, cat });

export const RECIPES: Recipe[] = [
  { id: 'linsencurry', name: 'Rotes Linsen-Curry mit Kokos', diet: 'vegan', meal: 'hauptgericht', minutes: 30, servings: 2, kcal: 560, p: 22, c: 68, f: 20, tags: ['wärmend', 'eiweißreich', 'Meal-Prep'],
    ingredients: [i('Rote Linsen', 150, 'g'), i('Kokosmilch', 200, 'ml'), i('Gehackte Tomaten', 400, 'g'), i('Zwiebel', 1, 'Stück'), i('Knoblauch', 2, 'Zehen'), i('Ingwer', 15, 'g'), i('Currypulver', 2, 'TL'), i('Reis', 120, 'g'), i('Babyspinat', 100, 'g')],
    steps: ['Zwiebel, Knoblauch und Ingwer fein hacken und in etwas Öl andünsten.', 'Currypulver kurz mitrösten, Linsen, Tomaten und Kokosmilch zugeben.', '15 Minuten köcheln lassen, bis die Linsen weich sind. Reis parallel kochen.', 'Spinat unterheben, mit Salz und Zitrone abschmecken.'] },
  { id: 'chili', name: 'Chili sin Carne', diet: 'vegan', meal: 'hauptgericht', minutes: 35, servings: 3, kcal: 480, p: 24, c: 66, f: 10, tags: ['eiweißreich', 'Meal-Prep'],
    ingredients: [i('Kidneybohnen (Dose)', 2, 'Dosen'), i('Mais (Dose)', 1, 'Dose'), i('Gehackte Tomaten', 800, 'g'), i('Paprika, rot', 2, 'Stück'), i('Zwiebel', 1, 'Stück'), i('Knoblauch', 2, 'Zehen'), i('Kreuzkümmel', 1, 'TL'), i('Chilipulver', 1, 'TL'), i('Zartbitterschokolade', 10, 'g')],
    steps: ['Zwiebel, Knoblauch und Paprika würfeln und anbraten.', 'Gewürze kurz mitrösten, Tomaten zugeben.', 'Bohnen und Mais abspülen, zugeben und 20 Minuten köcheln.', 'Mit Schokolade, Salz und Pfeffer abrunden.'] },
  { id: 'buddhabowl', name: 'Buddha Bowl mit Kichererbsen', diet: 'vegan', meal: 'hauptgericht', minutes: 30, servings: 2, kcal: 590, p: 21, c: 72, f: 22, tags: ['bunt', 'ballaststoffreich'],
    ingredients: [i('Quinoa', 120, 'g'), i('Kichererbsen (Dose)', 1, 'Dose'), i('Süßkartoffel', 1, 'Stück'), i('Avocado', 1, 'Stück'), i('Rotkohl', 150, 'g'), i('Tahin', 2, 'EL'), i('Zitrone', 1, 'Stück'), i('Paprikapulver', 1, 'TL')],
    steps: ['Süßkartoffel würfeln, mit Kichererbsen, Öl und Paprika 25 Minuten bei 200 °C rösten.', 'Quinoa kochen.', 'Rotkohl fein hobeln, Avocado schneiden.', 'Dressing aus Tahin, Zitrone und Wasser rühren, alles in Schüsseln anrichten.'] },
  { id: 'tofupfanne', name: 'Gemüsepfanne mit knusprigem Tofu', diet: 'vegan', meal: 'hauptgericht', minutes: 25, servings: 2, kcal: 470, p: 26, c: 42, f: 22, tags: ['schnell', 'eiweißreich'],
    ingredients: [i('Tofu natur', 200, 'g'), i('Brokkoli', 1, 'Stück'), i('Paprika, rot', 1, 'Stück'), i('Karotten', 2, 'Stück'), i('Sojasoße', 3, 'EL'), i('Speisestärke', 1, 'EL'), i('Reis', 120, 'g'), i('Sesam', 1, 'EL')],
    steps: ['Tofu würfeln, in Stärke wenden und knusprig braten.', 'Gemüse klein schneiden und im Wok bissfest braten.', 'Mit Sojasoße ablöschen, Tofu unterheben.', 'Mit Reis und Sesam servieren.'] },
  { id: 'pastapomodoro', name: 'Pasta Pomodoro mit Basilikum', diet: 'vegan', meal: 'hauptgericht', minutes: 20, servings: 2, kcal: 520, p: 16, c: 90, f: 10, tags: ['schnell', 'Klassiker'],
    ingredients: [i('Spaghetti', 200, 'g'), i('Gehackte Tomaten', 400, 'g'), i('Knoblauch', 2, 'Zehen'), i('Olivenöl', 2, 'EL'), i('Basilikum', 1, 'Bund')],
    steps: ['Nudeln in Salzwasser kochen.', 'Knoblauch in Olivenöl anschwitzen, Tomaten zugeben und 10 Minuten köcheln.', 'Mit Salz, Pfeffer und Basilikum abschmecken, mit Nudeln mischen.'] },
  { id: 'overnightoats', name: 'Overnight Oats mit Beeren', diet: 'vegan', meal: 'fruehstueck', minutes: 5, servings: 1, kcal: 380, p: 14, c: 55, f: 11, tags: ['schnell', 'Meal-Prep', 'Frühstück'],
    ingredients: [i('Haferflocken', 60, 'g'), i('Sojadrink', 150, 'ml', 'getraenke'), i('Sojajoghurt', 100, 'g'), i('Chiasamen', 1, 'EL'), i('Heidelbeeren', 80, 'g')],
    steps: ['Haferflocken, Sojadrink, Joghurt und Chiasamen verrühren.', 'Über Nacht im Kühlschrank quellen lassen.', 'Morgens mit Beeren toppen.'] },
  { id: 'porridge', name: 'Warmer Apfel-Zimt-Porridge', diet: 'vegan', meal: 'fruehstueck', minutes: 10, servings: 1, kcal: 360, p: 11, c: 58, f: 9, tags: ['wärmend', 'Frühstück'],
    ingredients: [i('Haferflocken', 60, 'g'), i('Haferdrink', 250, 'ml', 'getraenke'), i('Apfel', 1, 'Stück'), i('Zimt', 1, 'TL'), i('Walnüsse', 10, 'g')],
    steps: ['Haferflocken mit Haferdrink aufkochen.', 'Apfel reiben, mit Zimt unterrühren und 3 Minuten quellen lassen.', 'Mit gehackten Walnüssen servieren.'] },
  { id: 'smoothiebowl', name: 'Grüne Smoothie Bowl', diet: 'vegan', meal: 'fruehstueck', minutes: 10, servings: 1, kcal: 340, p: 9, c: 58, f: 9, tags: ['frisch', 'Frühstück'],
    ingredients: [i('Banane, gefroren', 1, 'Stück'), i('Babyspinat', 40, 'g'), i('Mango, TK', 100, 'g'), i('Haferdrink', 100, 'ml', 'getraenke'), i('Granola', 25, 'g')],
    steps: ['Banane, Spinat, Mango und Haferdrink cremig mixen.', 'In eine Schüssel füllen und mit Granola toppen.'] },
  { id: 'hummusbrot', name: 'Vollkornbrot mit Hummus & Gemüse', diet: 'vegan', meal: 'snack', minutes: 5, servings: 1, kcal: 330, p: 13, c: 42, f: 12, tags: ['schnell', 'Abendbrot'],
    ingredients: [i('Vollkornbrot', 2, 'Scheiben'), i('Hummus', 60, 'g'), i('Gurke', 0.5, 'Stück'), i('Tomate', 1, 'Stück')],
    steps: ['Brot mit Hummus bestreichen.', 'Mit Gurken- und Tomatenscheiben belegen, salzen und pfeffern.'] },
  { id: 'kuerbissuppe', name: 'Kürbissuppe mit Ingwer', diet: 'vegan', meal: 'hauptgericht', minutes: 35, servings: 3, kcal: 320, p: 6, c: 34, f: 17, tags: ['wärmend', 'Herbst'],
    ingredients: [i('Hokkaido-Kürbis', 1, 'Stück'), i('Kartoffeln', 2, 'Stück'), i('Zwiebel', 1, 'Stück'), i('Ingwer', 20, 'g'), i('Gemüsebrühe', 750, 'ml'), i('Kokosmilch', 200, 'ml'), i('Kürbiskerne', 30, 'g')],
    steps: ['Kürbis (mit Schale) und Kartoffeln würfeln, Zwiebel und Ingwer hacken.', 'Alles andünsten, mit Brühe ablöschen und 20 Minuten köcheln.', 'Kokosmilch zugeben und fein pürieren.', 'Mit gerösteten Kürbiskernen servieren.'] },
  { id: 'falafelwrap', name: 'Falafel-Wrap mit Joghurt-Soße', diet: 'vegetarisch', meal: 'hauptgericht', minutes: 20, servings: 2, kcal: 610, p: 22, c: 70, f: 26, tags: ['schnell', 'zum Mitnehmen'],
    ingredients: [i('Falafel (Kühlregal)', 8, 'Stück'), i('Tortilla-Wraps', 2, 'Stück'), i('Joghurt natur', 150, 'g'), i('Gurke', 0.5, 'Stück'), i('Tomate', 2, 'Stück'), i('Eisbergsalat', 0.25, 'Kopf'), i('Minze', 0.5, 'Bund')],
    steps: ['Falafel im Ofen oder in der Pfanne erwärmen.', 'Joghurt mit geriebener Gurke, Minze und Salz verrühren.', 'Wraps mit Salat, Tomate, Falafel und Soße füllen und einrollen.'] },
  { id: 'shakshuka', name: 'Shakshuka', diet: 'vegetarisch', meal: 'hauptgericht', minutes: 25, servings: 2, kcal: 380, p: 20, c: 22, f: 22, tags: ['eiweißreich', 'Brunch'],
    ingredients: [i('Eier', 4, 'Stück'), i('Gehackte Tomaten', 400, 'g'), i('Paprika, rot', 1, 'Stück'), i('Zwiebel', 1, 'Stück'), i('Feta', 80, 'g'), i('Kreuzkümmel', 1, 'TL'), i('Fladenbrot', 1, 'Stück')],
    steps: ['Zwiebel und Paprika anbraten, Gewürze und Tomaten zugeben, 10 Minuten köcheln.', 'Mulden formen, Eier hineinschlagen, zugedeckt 6–8 Minuten stocken lassen.', 'Mit Feta bestreuen und mit Brot servieren.'] },
  { id: 'gemuesefrittata', name: 'Gemüse-Frittata', diet: 'vegetarisch', meal: 'hauptgericht', minutes: 25, servings: 2, kcal: 360, p: 24, c: 10, f: 25, tags: ['low carb', 'eiweißreich'],
    ingredients: [i('Eier', 5, 'Stück'), i('Zucchini', 1, 'Stück'), i('Champignons', 150, 'g'), i('Babyspinat', 60, 'g'), i('Parmesan', 30, 'g')],
    steps: ['Gemüse schneiden und in einer ofenfesten Pfanne anbraten.', 'Eier mit Parmesan, Salz und Pfeffer verquirlen und darübergießen.', 'Bei 180 °C 12 Minuten im Ofen stocken lassen.'] },
  { id: 'ofengemuese', name: 'Ofengemüse mit Feta', diet: 'vegetarisch', meal: 'hauptgericht', minutes: 40, servings: 2, kcal: 450, p: 16, c: 38, f: 26, tags: ['einfach', 'bunt'],
    ingredients: [i('Kartoffeln', 400, 'g'), i('Paprika, rot', 1, 'Stück'), i('Zucchini', 1, 'Stück'), i('Rote Zwiebel', 1, 'Stück'), i('Feta', 150, 'g'), i('Olivenöl', 3, 'EL'), i('Rosmarin', 2, 'Zweige')],
    steps: ['Gemüse in Stücke schneiden, mit Öl, Salz und Rosmarin mischen.', '25 Minuten bei 200 °C backen.', 'Feta zerbröseln, darübergeben und 10 Minuten weiterbacken.'] },
  { id: 'caprese', name: 'Caprese-Salat mit Vollkornbrot', diet: 'vegetarisch', meal: 'snack', minutes: 10, servings: 2, kcal: 390, p: 18, c: 26, f: 23, tags: ['schnell', 'Sommer'],
    ingredients: [i('Tomaten', 4, 'Stück'), i('Mozzarella', 125, 'g'), i('Basilikum', 1, 'Bund'), i('Olivenöl', 2, 'EL'), i('Balsamico', 1, 'EL'), i('Vollkornbrot', 2, 'Scheiben')],
    steps: ['Tomaten und Mozzarella in Scheiben schneiden und abwechselnd anrichten.', 'Mit Basilikum, Öl, Balsamico, Salz und Pfeffer beträufeln.', 'Mit Brot servieren.'] },
  { id: 'quarkbowl', name: 'Skyr-Bowl mit Nüssen', diet: 'vegetarisch', meal: 'fruehstueck', minutes: 5, servings: 1, kcal: 340, p: 26, c: 30, f: 12, tags: ['eiweißreich', 'schnell', 'Frühstück'],
    ingredients: [i('Skyr', 200, 'g'), i('Himbeeren', 80, 'g'), i('Mandeln', 15, 'g'), i('Honig', 1, 'TL')],
    steps: ['Skyr in eine Schale geben.', 'Mit Beeren, gehackten Mandeln und Honig toppen.'] },
  { id: 'lachsreis', name: 'Ofenlachs mit Brokkoli & Reis', diet: 'alles', meal: 'hauptgericht', minutes: 25, servings: 2, kcal: 590, p: 36, c: 52, f: 25, tags: ['Omega-3', 'eiweißreich'],
    ingredients: [i('Lachsfilet', 2, 'Stück'), i('Brokkoli', 1, 'Stück'), i('Reis', 120, 'g'), i('Zitrone', 1, 'Stück'), i('Dill', 0.5, 'Bund')],
    steps: ['Reis kochen.', 'Lachs und Brokkoli auf ein Blech legen, mit Öl, Salz und Zitrone würzen.', '15 Minuten bei 200 °C garen, mit Dill bestreuen.'] },
  { id: 'haehnchencurry', name: 'Hähnchen-Gemüse-Curry', diet: 'alles', meal: 'hauptgericht', minutes: 30, servings: 2, kcal: 580, p: 38, c: 55, f: 20, tags: ['eiweißreich'],
    ingredients: [i('Hähnchenbrust', 300, 'g'), i('Kokosmilch', 200, 'ml'), i('Paprika, rot', 1, 'Stück'), i('Zuckerschoten', 150, 'g'), i('Currypaste, rot', 1, 'EL'), i('Reis', 120, 'g')],
    steps: ['Hähnchen in Streifen schneiden und anbraten.', 'Currypaste kurz mitrösten, Gemüse und Kokosmilch zugeben.', '10 Minuten köcheln lassen, mit Reis servieren.'] },
  { id: 'bolognese', name: 'Spaghetti Bolognese', diet: 'alles', meal: 'hauptgericht', minutes: 40, servings: 3, kcal: 620, p: 30, c: 72, f: 22, tags: ['Klassiker', 'Familie'],
    ingredients: [i('Spaghetti', 300, 'g'), i('Rinderhack', 300, 'g'), i('Gehackte Tomaten', 800, 'g'), i('Karotten', 2, 'Stück'), i('Zwiebel', 1, 'Stück'), i('Tomatenmark', 2, 'EL'), i('Parmesan', 40, 'g')],
    steps: ['Hack krümelig braten, gewürfelte Zwiebel und Karotten zugeben.', 'Tomatenmark anrösten, Tomaten zugeben, 25 Minuten köcheln.', 'Nudeln kochen und mit Soße und Parmesan servieren.'] },
  { id: 'putenwrap', name: 'Puten-Salat-Wrap', diet: 'alles', meal: 'snack', minutes: 15, servings: 2, kcal: 420, p: 32, c: 38, f: 14, tags: ['schnell', 'zum Mitnehmen'],
    ingredients: [i('Putenbrust', 200, 'g'), i('Tortilla-Wraps', 2, 'Stück'), i('Frischkäse', 50, 'g'), i('Rucola', 50, 'g'), i('Tomate', 1, 'Stück')],
    steps: ['Pute in Streifen braten und würzen.', 'Wraps mit Frischkäse bestreichen, mit Rucola, Tomate und Pute belegen, aufrollen.'] },
  { id: 'gnocchipfanne', name: 'Gnocchi-Pfanne mit Spinat', diet: 'vegetarisch', meal: 'hauptgericht', minutes: 20, servings: 2, kcal: 540, p: 15, c: 78, f: 18, tags: ['schnell', 'Soulfood'],
    ingredients: [i('Gnocchi', 500, 'g'), i('Babyspinat', 150, 'g'), i('Kirschtomaten', 250, 'g'), i('Knoblauch', 2, 'Zehen'), i('Parmesan', 30, 'g')],
    steps: ['Gnocchi in Öl goldbraun braten.', 'Knoblauch und Tomaten zugeben, kurz schmoren.', 'Spinat unterheben, bis er zusammenfällt, mit Parmesan servieren.'] },
  { id: 'kichererbsensalat', name: 'Mediterraner Kichererbsensalat', diet: 'vegan', meal: 'snack', minutes: 15, servings: 2, kcal: 380, p: 14, c: 40, f: 18, tags: ['Meal-Prep', 'zum Mitnehmen'],
    ingredients: [i('Kichererbsen (Dose)', 1, 'Dose'), i('Gurke', 1, 'Stück'), i('Kirschtomaten', 200, 'g'), i('Rote Zwiebel', 0.5, 'Stück'), i('Petersilie', 1, 'Bund'), i('Olivenöl', 2, 'EL'), i('Zitrone', 1, 'Stück')],
    steps: ['Kichererbsen abspülen, Gemüse würfeln, Petersilie hacken.', 'Mit Öl, Zitrone, Salz und Pfeffer mischen.'] },
  { id: 'veganerburger', name: 'Bunter Veggie-Burger', diet: 'vegan', meal: 'hauptgericht', minutes: 25, servings: 2, kcal: 620, p: 28, c: 64, f: 26, tags: ['Wochenende', 'Soulfood'],
    ingredients: [i('Vegane Burger-Patties', 2, 'Stück'), i('Burgerbrötchen', 2, 'Stück'), i('Avocado', 1, 'Stück'), i('Tomate', 1, 'Stück'), i('Salat', 4, 'Blätter'), i('Rote Zwiebel', 0.5, 'Stück')],
    steps: ['Patties nach Packungsanweisung braten.', 'Brötchen anrösten.', 'Mit zerdrückter Avocado, Salat, Tomate, Zwiebel und Patty belegen.'] },
  { id: 'misosuppe', name: 'Miso-Nudelsuppe mit Tofu', diet: 'vegan', meal: 'hauptgericht', minutes: 20, servings: 2, kcal: 430, p: 22, c: 56, f: 12, tags: ['wärmend', 'schnell'],
    ingredients: [i('Udon- oder Soba-Nudeln', 160, 'g'), i('Miso-Paste', 2, 'EL'), i('Tofu natur', 150, 'g'), i('Pak Choi', 2, 'Stück'), i('Frühlingszwiebeln', 2, 'Stück'), i('Champignons', 100, 'g')],
    steps: ['1 Liter Wasser erhitzen, Pilze und Pak Choi 4 Minuten garen.', 'Nudeln separat kochen.', 'Topf vom Herd nehmen, Miso einrühren (nicht mehr kochen).', 'Mit Tofu, Nudeln und Frühlingszwiebeln servieren.'] },
  { id: 'bananenpancakes', name: 'Bananen-Hafer-Pancakes', diet: 'vegetarisch', meal: 'fruehstueck', minutes: 15, servings: 2, kcal: 390, p: 16, c: 54, f: 12, tags: ['Wochenende', 'Frühstück'],
    ingredients: [i('Banane', 2, 'Stück'), i('Eier', 2, 'Stück'), i('Haferflocken', 80, 'g'), i('Backpulver', 1, 'TL'), i('Joghurt natur', 100, 'g')],
    steps: ['Bananen zerdrücken, mit Eiern, Haferflocken und Backpulver verrühren.', 'Kleine Pancakes in einer beschichteten Pfanne ausbacken.', 'Mit Joghurt servieren.'] },
  { id: 'risotto', name: 'Pilzrisotto', diet: 'vegetarisch', meal: 'hauptgericht', minutes: 35, servings: 2, kcal: 560, p: 16, c: 80, f: 18, tags: ['Soulfood'],
    ingredients: [i('Risottoreis', 180, 'g'), i('Champignons', 250, 'g'), i('Zwiebel', 1, 'Stück'), i('Gemüsebrühe', 800, 'ml'), i('Parmesan', 40, 'g'), i('Weißwein', 100, 'ml', 'getraenke')],
    steps: ['Zwiebel andünsten, Reis glasig werden lassen, mit Wein ablöschen.', 'Nach und nach heiße Brühe zugeben und rühren (ca. 18 Minuten).', 'Pilze separat anbraten und mit Parmesan unterheben.'] },
  { id: 'energyballs', name: 'Dattel-Energy-Balls', diet: 'vegan', meal: 'snack', minutes: 15, servings: 6, kcal: 160, p: 4, c: 20, f: 8, tags: ['Snack', 'Meal-Prep'],
    ingredients: [i('Datteln, entsteint', 150, 'g'), i('Mandeln', 80, 'g'), i('Haferflocken', 40, 'g'), i('Kakao', 1, 'EL'), i('Kokosraspeln', 20, 'g')],
    steps: ['Alle Zutaten außer Kokosraspeln im Mixer zerkleinern.', 'Kugeln formen und in Kokos wälzen.', 'Im Kühlschrank bis zu einer Woche haltbar.'] },
  { id: 'ofenkartoffel', name: 'Ofenkartoffel mit Kräuterquark', diet: 'vegetarisch', meal: 'hauptgericht', minutes: 50, servings: 2, kcal: 420, p: 22, c: 60, f: 9, tags: ['einfach', 'Klassiker'],
    ingredients: [i('Große Kartoffeln', 4, 'Stück'), i('Magerquark', 250, 'g'), i('Schnittlauch', 1, 'Bund'), i('Leinöl', 1, 'EL'), i('Radieschen', 1, 'Bund')],
    steps: ['Kartoffeln waschen und 45 Minuten bei 200 °C backen.', 'Quark mit Kräutern, Leinöl, Salz und Pfeffer verrühren.', 'Kartoffeln aufschneiden, mit Quark und Radieschen servieren.'] },
  { id: 'thaisuppe', name: 'Thai-Kokos-Suppe mit Gemüse', diet: 'vegan', meal: 'hauptgericht', minutes: 25, servings: 2, kcal: 450, p: 12, c: 40, f: 27, tags: ['wärmend', 'exotisch'],
    ingredients: [i('Kokosmilch', 400, 'ml'), i('Gemüsebrühe', 400, 'ml'), i('Currypaste, rot', 1, 'EL'), i('Karotten', 2, 'Stück'), i('Zuckerschoten', 100, 'g'), i('Reisnudeln', 100, 'g'), i('Limette', 1, 'Stück'), i('Koriander', 0.5, 'Bund')],
    steps: ['Currypaste anrösten, mit Kokosmilch und Brühe aufgießen.', 'Gemüse in Streifen 5 Minuten garen.', 'Reisnudeln zugeben, mit Limette und Koriander abschmecken.'] },
];

// Wochentage, Mahlzeiten-Labels
export const MEAL_LABEL = { fruehstueck: 'Frühstück', hauptgericht: 'Hauptgericht', snack: 'Snack / Abendbrot' } as const;

// Zutaten für eine Portionenzahl skalieren
export const scaleIngredients = (r: Recipe, servings: number) =>
  r.ingredients.map((x) => ({ ...x, amount: Math.round(((x.amount * servings) / r.servings) * 100) / 100 }));

export const formatAmount = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(n < 1 ? 2 : 1).replace('.', ','));
