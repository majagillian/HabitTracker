// Gericht-Vorschläge für ausgewählte Tage – berücksichtigt Favoriten, Bewertungen, Lieblingszutaten, Ernährungsform, Kalorienziel und Abwechslung
import { RECIPES, type Recipe } from '@/data/recipes';
import { addDays } from '@/lib/date';
import type { AppState } from '@/store/useStore';
import type { ISODate } from '@/types';

export const allowedByDiet = (r: Recipe, diet: AppState['recipePrefs']['diet']) =>
  diet === 'alles' || r.diet === 'vegan' || (diet === 'vegetarisch' && r.diet === 'vegetarisch');

export const recipeScore = (r: Recipe, prefs: AppState['recipePrefs'], kcalTarget: number, recentlyUsed: Set<string>) => {
  let score = Math.random() * 1.5; // etwas Zufall für Abwechslung
  if (prefs.favorites.includes(r.id)) score += 3;
  const rating = prefs.ratings[r.id];
  if (rating === 'lecker') score += 2.5;
  if (rating === 'okay') score += 0.5;
  if (rating === 'nicht') score -= 100; // nicht mehr vorschlagen
  const liked = prefs.likedIngredients.map((x) => x.toLowerCase());
  score += r.ingredients.filter((ing) => liked.some((l) => ing.name.toLowerCase().includes(l))).length * 1.2;
  score -= Math.abs(r.kcal - kcalTarget) / 150; // Nähe zum Kalorienziel der Mahlzeit
  if (recentlyUsed.has(r.id)) score -= 4;
  return score;
};

// Für jeden ausgewählten Tag ein Hauptgericht (und optional ein Frühstück) vorschlagen
export const suggestMeals = (s: AppState, dates: ISODate[], kcalGoal: number, withBreakfast: boolean): Record<ISODate, string[]> => {
  const used = new Set<string>();
  // Bereits geplante Gerichte der letzten 7 Tage meiden
  for (const d of dates) for (let k = 1; k <= 7; k++) (s.mealPlan[addDays(d, -k)] ?? []).forEach((id) => used.add(id));
  const out: Record<ISODate, string[]> = {};
  const pool = RECIPES.filter((r) => allowedByDiet(r, s.recipePrefs.diet));
  for (const d of dates) {
    const pickBest = (meal: Recipe['meal'], target: number) =>
      pool
        .filter((r) => r.meal === meal)
        .map((r) => ({ r, sc: recipeScore(r, s.recipePrefs, target, used) }))
        .filter((x) => x.sc > -50)
        .sort((a, b) => b.sc - a.sc)[0]?.r;
    const ids: string[] = [];
    if (withBreakfast) {
      const b = pickBest('fruehstueck', kcalGoal * 0.25);
      if (b) { ids.push(b.id); used.add(b.id); }
    }
    const main = pickBest('hauptgericht', kcalGoal * 0.35);
    if (main) { ids.push(main.id); used.add(main.id); }
    out[d] = ids;
  }
  return out;
};
