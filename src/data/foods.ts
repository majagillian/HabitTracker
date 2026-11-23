// Grundnahrungsmittel-Datenbank (Nährwerte je 100 g, gerundete Richtwerte aus gängigen Nährwerttabellen)
// Ergänzt durch die Online-Suche in Open Food Facts (Barcode & Markenprodukte).
import type { Food } from '@/types';

// [Name, kcal, Eiweiß, Kohlenhydrate, Fett, Ballaststoffe, Zucker, vegan, Portion g, Gruppe]
type Row = [string, number, number, number, number, number, number, 0 | 1, number, string];

const ROWS: Row[] = [
  // Obst
  ['Apfel', 54, 0.3, 11.4, 0.2, 2.4, 10.3, 1, 150, 'Obst'], ['Banane', 93, 1.1, 20, 0.2, 1.9, 17, 1, 120, 'Obst'], ['Birne', 55, 0.5, 12.4, 0.3, 3.3, 9.8, 1, 150, 'Obst'],
  ['Orange', 47, 1, 8.3, 0.2, 2.2, 8.3, 1, 180, 'Obst'], ['Mandarine', 50, 0.7, 10.1, 0.3, 1.9, 10, 1, 80, 'Obst'], ['Erdbeeren', 32, 0.8, 5.5, 0.4, 2, 5.4, 1, 150, 'Obst'],
  ['Heidelbeeren', 42, 0.6, 7.4, 0.6, 4.9, 7.4, 1, 125, 'Obst'], ['Himbeeren', 36, 1.3, 4.8, 0.3, 6.7, 4.4, 1, 125, 'Obst'], ['Weintrauben', 70, 0.7, 15.6, 0.3, 1.5, 15.5, 1, 125, 'Obst'],
  ['Kiwi', 51, 1, 9.1, 0.6, 3.9, 9, 1, 75, 'Obst'], ['Mango', 62, 0.6, 12.8, 0.5, 1.7, 12.5, 1, 150, 'Obst'], ['Ananas', 59, 0.5, 12.4, 0.2, 1.4, 12.3, 1, 150, 'Obst'],
  ['Wassermelone', 38, 0.6, 8.3, 0.2, 0.2, 8.3, 1, 250, 'Obst'], ['Avocado', 160, 1.9, 0.4, 15.3, 6.3, 0.4, 1, 80, 'Obst'], ['Pfirsich', 41, 0.8, 8.9, 0.1, 1.9, 8.9, 1, 120, 'Obst'],
  ['Datteln, getrocknet', 285, 2, 65, 0.5, 8, 63, 1, 30, 'Obst'], ['Rosinen', 299, 2.5, 66, 0.6, 5.2, 59, 1, 30, 'Obst'],
  // Gemüse
  ['Tomate', 18, 1, 2.6, 0.2, 1.3, 2.6, 1, 100, 'Gemüse'], ['Gurke', 12, 0.6, 1.8, 0.2, 0.5, 1.7, 1, 150, 'Gemüse'], ['Paprika, rot', 37, 1, 6.4, 0.5, 3.6, 6.4, 1, 150, 'Gemüse'],
  ['Karotte', 36, 1, 4.8, 0.2, 3.6, 4.7, 1, 100, 'Gemüse'], ['Brokkoli', 35, 3.8, 2.7, 0.2, 3, 2.2, 1, 200, 'Gemüse'], ['Blumenkohl', 23, 2.5, 2.3, 0.3, 2.9, 2.3, 1, 200, 'Gemüse'],
  ['Zucchini', 20, 1.6, 2.1, 0.4, 1.1, 2, 1, 200, 'Gemüse'], ['Aubergine', 24, 1.2, 3.5, 0.2, 2.8, 3.2, 1, 200, 'Gemüse'], ['Spinat, frisch', 23, 2.7, 0.6, 0.4, 2.6, 0.4, 1, 100, 'Gemüse'],
  ['Feldsalat', 21, 1.8, 0.7, 0.4, 1.5, 0.6, 1, 50, 'Gemüse'], ['Eisbergsalat', 14, 0.9, 1.6, 0.2, 1.3, 1.6, 1, 80, 'Gemüse'], ['Rucola', 25, 2.6, 2.1, 0.7, 1.6, 2, 1, 40, 'Gemüse'],
  ['Zwiebel', 32, 1.2, 4.9, 0.3, 1.8, 4.7, 1, 80, 'Gemüse'], ['Knoblauch', 144, 6, 28, 0.1, 1.8, 1, 1, 5, 'Gemüse'], ['Champignons', 22, 3.1, 0.3, 0.3, 2, 0.2, 1, 150, 'Gemüse'],
  ['Kartoffeln, gekocht', 72, 2, 15, 0.1, 1.7, 0.8, 1, 200, 'Gemüse'], ['Süßkartoffel', 86, 1.6, 20, 0.1, 3, 4.2, 1, 200, 'Gemüse'], ['Kürbis (Hokkaido)', 63, 1.7, 12.6, 0.6, 2.5, 4.6, 1, 200, 'Gemüse'],
  ['Mais (Dose)', 81, 2.9, 15, 1.2, 2.8, 3, 1, 80, 'Gemüse'], ['Erbsen, TK', 81, 5.4, 10.6, 0.4, 5.1, 4.5, 1, 100, 'Gemüse'], ['Grüne Bohnen', 32, 2.4, 5, 0.2, 2.5, 2.3, 1, 150, 'Gemüse'],
  ['Rotkohl', 29, 1.5, 3.5, 0.2, 2.5, 3.5, 1, 150, 'Gemüse'], ['Sauerkraut', 20, 1.5, 0.8, 0.3, 2.1, 0.8, 1, 150, 'Gemüse'], ['Lauch', 31, 2.2, 3.3, 0.3, 2.3, 2.7, 1, 100, 'Gemüse'],
  ['Rote Bete, gekocht', 44, 1.7, 8, 0.2, 2, 6.8, 1, 100, 'Gemüse'], ['Kichererbsen (Dose)', 119, 7, 15.6, 2.4, 5, 0.3, 1, 120, 'Hülsenfrüchte'],
  // Hülsenfrüchte & Sojaprodukte
  ['Linsen, gekocht', 116, 9, 20, 0.4, 7.9, 1.8, 1, 150, 'Hülsenfrüchte'], ['Rote Linsen, trocken', 340, 24, 50, 1.5, 11, 2, 1, 60, 'Hülsenfrüchte'], ['Kidneybohnen (Dose)', 106, 7.4, 14, 0.5, 6.4, 0.5, 1, 120, 'Hülsenfrüchte'],
  ['Weiße Bohnen (Dose)', 92, 6.6, 12.4, 0.4, 5.6, 0.5, 1, 120, 'Hülsenfrüchte'], ['Edamame', 121, 11.9, 8.9, 5.2, 5.2, 2.2, 1, 100, 'Hülsenfrüchte'], ['Tofu natur', 144, 15.5, 2.3, 8.5, 1.5, 0.6, 1, 125, 'Sojaprodukte'],
  ['Räuchertofu', 160, 16, 2, 10, 1, 0.5, 1, 100, 'Sojaprodukte'], ['Tempeh', 192, 19, 9, 11, 5, 0.5, 1, 100, 'Sojaprodukte'], ['Seitan', 120, 24, 4, 1.5, 0.6, 0.5, 1, 100, 'Sojaprodukte'],
  ['Sojadrink, ungesüßt', 33, 3.3, 0.6, 1.8, 0.5, 0.3, 1, 250, 'Getränke'], ['Haferdrink', 45, 0.8, 7.2, 1.4, 0.8, 4, 1, 250, 'Getränke'], ['Sojajoghurt natur', 50, 4, 2.3, 2.5, 1, 0.8, 1, 150, 'Sojaprodukte'],
  ['Hummus', 177, 7.9, 14.3, 9.6, 6, 0.3, 1, 50, 'Aufstriche'], ['Erdnussbutter', 600, 25, 14, 49, 6, 5, 1, 20, 'Aufstriche'],
  // Getreide & Beilagen
  ['Haferflocken', 368, 13.5, 58.7, 7, 10, 0.7, 1, 50, 'Getreide'], ['Vollkornbrot', 213, 7.5, 38, 1.5, 8, 2.5, 1, 50, 'Getreide'], ['Weißbrot / Toast', 265, 8.5, 48, 3.5, 2.7, 4.5, 1, 30, 'Getreide'],
  ['Brötchen (Weizen)', 257, 8.5, 50, 1.6, 3, 2, 1, 60, 'Getreide'], ['Vollkornbrötchen', 230, 9, 40, 3, 6, 2, 1, 70, 'Getreide'], ['Knäckebrot', 350, 10, 66, 1.5, 15, 2, 1, 20, 'Getreide'],
  ['Nudeln, gekocht', 150, 5.2, 29.5, 0.9, 1.8, 0.6, 1, 220, 'Getreide'], ['Vollkornnudeln, gekocht', 140, 5.5, 26, 1, 4, 0.8, 1, 220, 'Getreide'], ['Reis, gekocht', 130, 2.7, 28, 0.3, 0.4, 0.1, 1, 180, 'Getreide'],
  ['Naturreis, gekocht', 123, 2.7, 25.6, 1, 1.6, 0.4, 1, 180, 'Getreide'], ['Quinoa, gekocht', 120, 4.4, 21.3, 1.9, 2.8, 0.9, 1, 150, 'Getreide'], ['Couscous, gekocht', 112, 3.8, 23.2, 0.2, 1.4, 0.1, 1, 150, 'Getreide'],
  ['Bulgur, gekocht', 83, 3.1, 18.6, 0.2, 4.5, 0.1, 1, 150, 'Getreide'], ['Müsli ohne Zucker', 360, 10, 60, 7, 9, 12, 1, 60, 'Getreide'], ['Cornflakes', 378, 7, 84, 0.9, 3.3, 8, 1, 30, 'Getreide'],
  ['Pizza Margherita', 239, 10, 30, 8.5, 2, 3, 0, 350, 'Gerichte'], ['Pommes frites', 291, 3.4, 35, 15, 3.1, 0.3, 1, 150, 'Gerichte'],
  // Milchprodukte & Eier
  ['Milch 1,5 %', 47, 3.4, 4.9, 1.5, 0, 4.9, 0, 250, 'Milchprodukte'], ['Joghurt natur 3,5 %', 64, 3.6, 4.5, 3.5, 0, 4.5, 0, 150, 'Milchprodukte'], ['Magerquark', 67, 12, 4, 0.3, 0, 4, 0, 125, 'Milchprodukte'],
  ['Skyr', 63, 11, 4, 0.2, 0, 4, 0, 150, 'Milchprodukte'], ['Hüttenkäse', 98, 12.5, 3, 4.3, 0, 2.7, 0, 100, 'Milchprodukte'], ['Gouda', 356, 25, 0, 28, 0, 0, 0, 30, 'Milchprodukte'],
  ['Mozzarella', 254, 18, 1, 20, 0, 1, 0, 60, 'Milchprodukte'], ['Feta', 264, 14, 0.5, 22, 0, 0.5, 0, 50, 'Milchprodukte'], ['Butter', 741, 0.7, 0.6, 83, 0, 0.6, 0, 10, 'Fette'],
  ['Ei (gekocht)', 155, 12.6, 1.1, 10.6, 0, 1.1, 0, 60, 'Eier'], ['Rührei', 148, 10, 1.6, 11, 0, 1.4, 0, 120, 'Eier'],
  // Fleisch & Fisch
  ['Hähnchenbrust', 110, 23, 0, 1.5, 0, 0, 0, 150, 'Fleisch'], ['Putenbrust', 107, 24, 0, 1, 0, 0, 0, 150, 'Fleisch'], ['Rinderhack', 250, 17, 0, 20, 0, 0, 0, 125, 'Fleisch'],
  ['Schweineschnitzel', 120, 22, 0, 3.5, 0, 0, 0, 150, 'Fleisch'], ['Salami', 400, 21, 1, 35, 0, 1, 0, 30, 'Fleisch'], ['Kochschinken', 115, 19, 1, 4, 0, 1, 0, 30, 'Fleisch'],
  ['Lachs', 202, 20, 0, 13.6, 0, 0, 0, 125, 'Fisch'], ['Thunfisch (Dose, Wasser)', 116, 26, 0, 1, 0, 0, 0, 80, 'Fisch'], ['Kabeljau', 82, 18, 0, 0.7, 0, 0, 0, 150, 'Fisch'],
  // Nüsse & Samen
  ['Walnüsse', 654, 15, 7, 65, 6.7, 2.6, 1, 25, 'Nüsse'], ['Mandeln', 579, 21, 9.5, 50, 12.5, 4.4, 1, 25, 'Nüsse'], ['Cashewkerne', 553, 18, 30, 44, 3.3, 6, 1, 25, 'Nüsse'],
  ['Leinsamen', 534, 18, 1.6, 42, 27, 1.6, 1, 10, 'Nüsse'], ['Chiasamen', 486, 17, 7.7, 31, 34, 0, 1, 15, 'Nüsse'], ['Sonnenblumenkerne', 584, 21, 12, 51, 8.6, 2.6, 1, 20, 'Nüsse'],
  // Fette, Süßes, Snacks
  ['Olivenöl', 884, 0, 0, 100, 0, 0, 1, 10, 'Fette'], ['Rapsöl', 884, 0, 0, 100, 0, 0, 1, 10, 'Fette'], ['Margarine (vegan)', 720, 0.2, 0.4, 80, 0, 0.4, 1, 10, 'Fette'],
  ['Zartbitterschokolade 70 %', 580, 8, 34, 42, 11, 28, 1, 20, 'Süßes'], ['Vollmilchschokolade', 535, 7.6, 59, 30, 3, 56, 0, 20, 'Süßes'], ['Gummibärchen', 343, 6.9, 77, 0.5, 0, 46, 0, 30, 'Süßes'],
  ['Kartoffelchips', 536, 6, 50, 34, 4.4, 0.5, 1, 30, 'Snacks'], ['Honig', 304, 0.3, 82, 0, 0, 82, 0, 15, 'Süßes'], ['Marmelade', 250, 0.4, 60, 0.1, 1, 55, 1, 20, 'Süßes'],
  ['Croissant', 406, 8, 45, 21, 2.6, 11, 0, 60, 'Backwaren'], ['Kuchen (Rührkuchen)', 380, 5.5, 50, 18, 1, 30, 0, 80, 'Backwaren'], ['Reiswaffeln', 387, 8, 81, 3, 4, 0.8, 1, 10, 'Snacks'],
  // Getränke
  ['Orangensaft', 45, 0.7, 10.4, 0.2, 0.2, 8.4, 1, 200, 'Getränke'], ['Cola', 42, 0, 10.6, 0, 0, 10.6, 1, 330, 'Getränke'], ['Bier', 43, 0.5, 3.6, 0, 0, 0, 1, 500, 'Getränke'],
  ['Wein, rot', 85, 0.1, 2.6, 0, 0, 0.6, 1, 150, 'Getränke'], ['Kaffee mit Milch', 15, 1, 1.3, 0.6, 0, 1.3, 0, 200, 'Getränke'], ['Latte Macchiato (Hafer)', 35, 0.6, 5.5, 1, 0.5, 3, 1, 300, 'Getränke'],
  // Fertige Gerichte (vegan & klassisch)
  ['Linsen-Curry (vegan)', 120, 6, 15, 3.5, 4, 3, 1, 350, 'Gerichte'], ['Chili sin Carne', 95, 5, 12, 2.5, 4.5, 3, 1, 400, 'Gerichte'], ['Gemüsepfanne mit Tofu', 110, 7, 7, 6, 2.5, 3, 1, 350, 'Gerichte'],
  ['Spaghetti Bolognese', 145, 7, 18, 5, 2, 3, 0, 400, 'Gerichte'], ['Spaghetti Tomatensoße', 120, 4, 22, 2, 2, 4, 1, 400, 'Gerichte'], ['Buddha Bowl', 130, 5, 16, 5.5, 4, 3, 1, 400, 'Gerichte'],
  ['Falafel', 333, 13, 32, 18, 5, 2, 1, 100, 'Gerichte'], ['Gemüsesuppe', 35, 1.2, 5, 1, 1.5, 2, 1, 350, 'Gerichte'], ['Kartoffelsuppe', 65, 1.6, 9, 2.5, 1.2, 1, 1, 350, 'Gerichte'],
  ['Döner Kebab', 215, 11, 20, 10, 2, 2, 0, 350, 'Gerichte'], ['Vegane Burger-Patty', 230, 17, 7, 14, 4, 1, 1, 110, 'Gerichte'], ['Sushi (Maki, Gemüse)', 140, 3, 28, 0.8, 1, 5, 1, 200, 'Gerichte'],
  ['Overnight Oats', 150, 5, 22, 4, 3.5, 7, 1, 250, 'Gerichte'], ['Porridge mit Beeren', 110, 3.5, 18, 2.5, 3, 5, 1, 300, 'Gerichte'], ['Smoothie Bowl', 85, 2, 16, 1.5, 3, 11, 1, 300, 'Gerichte'],
];

export const FOODS: Food[] = ROWS.map(([name, kcal, p, c, f, fiber, sugar, vegan, portion, group], i) => ({
  id: 'b' + i, name, kcal, p, c, f, fiber, sugar, vegan: vegan === 1, portion, group,
}));

// Ziel-Kalorien nach Mifflin-St-Jeor (Grundumsatz × Aktivitätsfaktor 1,4) ± Zielanpassung
export const calorieGoal = (gender: 'w' | 'm' | 'd', age: number, heightCm: number, weightKg: number, goal: 'abnehmen' | 'halten' | 'zunehmen') => {
  const s = gender === 'm' ? 5 : gender === 'w' ? -161 : -78;
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + s;
  const tdee = bmr * 1.4;
  return Math.round((tdee + (goal === 'abnehmen' ? -400 : goal === 'zunehmen' ? 300 : 0)) / 10) * 10;
};

// Makro-Verteilung nach DGE-Orientierung: Eiweiß ~15–20 %, Fett ~30 %, Kohlenhydrate ~50 %
export const macroGoals = (kcal: number, weightKg: number) => ({
  p: Math.round(Math.max(0.8 * weightKg, (kcal * 0.18) / 4)),
  f: Math.round((kcal * 0.3) / 9),
  c: Math.round((kcal * 0.52) / 4),
  fiber: 30,
  sugar: Math.round((kcal * 0.1) / 4),
});
