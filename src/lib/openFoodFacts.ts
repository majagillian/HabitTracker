// Anbindung an die freie Lebensmitteldatenbank Open Food Facts (https://world.openfoodfacts.org)
import type { Food } from '@/types';

const UA = 'DeinTag/1.0 (https://github.com/majagillian/HabitTracker)';

type OffProduct = {
  code?: string;
  product_name?: string;
  product_name_de?: string;
  brands?: string;
  serving_quantity?: number | string;
  nutriments?: Record<string, number | string | undefined>;
  labels_tags?: string[];
  categories_tags?: string[];
};

const num = (v: unknown) => (typeof v === 'number' ? v : parseFloat(String(v ?? '0'))) || 0;

const toFood = (p: OffProduct): Food | null => {
  const n = p.nutriments ?? {};
  const kcal = num(n['energy-kcal_100g']) || num(n['energy_100g']) / 4.184;
  const name = p.product_name_de || p.product_name;
  if (!name || !kcal) return null;
  return {
    id: 'off-' + (p.code ?? name),
    name: p.brands ? `${name} (${p.brands.split(',')[0]})` : name,
    kcal: Math.round(kcal),
    p: num(n.proteins_100g),
    c: num(n.carbohydrates_100g),
    f: num(n.fat_100g),
    fiber: num(n.fiber_100g),
    sugar: num(n.sugars_100g),
    vegan: (p.labels_tags ?? []).some((t) => t.includes('vegan')),
    portion: num(p.serving_quantity) || 100,
    group: 'Open Food Facts',
  };
};

export const searchOff = async (query: string): Promise<Food[]> => {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20&lc=de&cc=de&fields=code,product_name,product_name_de,brands,serving_quantity,nutriments,labels_tags`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error('Die Lebensmittel-Datenbank ist gerade nicht erreichbar.');
  const json = (await res.json()) as { products?: OffProduct[] };
  return (json.products ?? []).map(toFood).filter((x): x is Food => !!x);
};

export const lookupBarcode = async (code: string): Promise<Food | null> => {
  const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json`, { headers: { 'User-Agent': UA } });
  if (!res.ok) return null;
  const json = (await res.json()) as { status?: number; product?: OffProduct };
  return json.status === 1 && json.product ? toFood({ ...json.product, code }) : null;
};
