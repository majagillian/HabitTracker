// Rezepte & Wochenplan: Portionen skalieren, Zutaten auf die Einkaufsliste, Favoriten, Bewertung, Vorschläge für ausgewählte Tage
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Badge, Button, Card, Chip, Field, IconButton, Note, Row, Segmented, Sheet, Stepper, ToggleRow, Txt } from '@/components/ui';
import { calorieGoal } from '@/data/foods';
import { formatAmount, MEAL_LABEL, RECIPES, scaleIngredients, type Recipe } from '@/data/recipes';
import { addDays, formatShort, today, WEEKDAYS_SHORT, weekday } from '@/lib/date';
import { allowedByDiet, suggestMeals } from '@/lib/recipes';
import { useStore, type RecipeRating } from '@/store/useStore';
import { useTheme } from '@/theme/useTheme';

export default function Rezepte() {
  const { c } = useTheme();
  const s = useStore();
  const prefs = s.recipePrefs;
  const [tab, setTab] = useState<'rezepte' | 'plan'>('rezepte');
  const [open, setOpen] = useState<Recipe | null>(null);
  const [servings, setServings] = useState(2);
  const [query, setQuery] = useState('');
  const [onlyFav, setOnlyFav] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [days, setDays] = useState<string[]>([today()]);
  const [breakfast, setBreakfast] = useState(false);
  const [liked, setLiked] = useState('');
  const kcalGoal = calorieGoal(s.profile.gender, s.profile.age, s.profile.heightCm, s.profile.weightKg, s.nutritionGoal);
  const next14 = Array.from({ length: 14 }, (_, i) => addDays(today(), i));

  const list = useMemo(
    () =>
      RECIPES.filter((r) => allowedByDiet(r, prefs.diet))
        .filter((r) => !onlyFav || prefs.favorites.includes(r.id))
        .filter((r) => !query.trim() || (r.name + ' ' + r.tags.join(' ') + ' ' + r.ingredients.map((x) => x.name).join(' ')).toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => Number(prefs.favorites.includes(b.id)) - Number(prefs.favorites.includes(a.id)) || (prefs.ratings[a.id] === 'nicht' ? 1 : 0) - (prefs.ratings[b.id] === 'nicht' ? 1 : 0)),
    [prefs, onlyFav, query],
  );

  const toShopping = (r: Recipe, n: number) => {
    const cnt = s.addRecipeToShopping(r.id, n);
    setMsg(`${cnt} Zutaten für ${n} Portionen „${r.name}“ stehen jetzt auf deiner Einkaufsliste.`);
  };
  const rate = (r: Recipe, v: RecipeRating) => s.rateRecipe(r.id, prefs.ratings[r.id] === v ? null : v);

  const suggest = () => {
    const plan = suggestMeals(s, days, kcalGoal, breakfast);
    for (const [d, ids] of Object.entries(plan)) s.setMealPlan(d, ids);
    setMsg(`Vorschläge für ${days.length} Tag${days.length > 1 ? 'e' : ''} erstellt – passe sie gern an.`);
  };

  return (
    <Screen title="Rezepte" subtitle={`${{ vegan: 'Vegan', vegetarisch: 'Vegetarisch', alles: 'Alles' }[prefs.diet]} · ${prefs.favorites.length} Favoriten`}>
      <Segmented value={tab} onChange={setTab} options={[{ value: 'rezepte', label: 'Rezepte' }, { value: 'plan', label: 'Wochenplan' }]} />
      <Segmented value={prefs.diet} onChange={(diet) => s.setRecipePrefs({ diet })} options={[{ value: 'alles', label: 'Alles' }, { value: 'vegetarisch', label: 'Vegetarisch' }, { value: 'vegan', label: 'Vegan' }]} />
      {msg && (
        <Card tone="ok">
          <Txt>{msg}</Txt>
        </Card>
      )}

      {tab === 'rezepte' && (
        <>
          <Field label="Suchen" value={query} onChangeText={setQuery} placeholder="Gericht oder Zutat, z. B. Linsen" />
          <Row wrap gap={6}>
            <Chip label="Nur Favoriten" icon="heart" selected={onlyFav} onPress={() => setOnlyFav(!onlyFav)} color="#DB2777" />
          </Row>
          {list.map((r) => (
            <Card key={r.id} onPress={() => { setOpen(r); setServings(r.servings); }} label={`${r.name} öffnen`} style={{ opacity: prefs.ratings[r.id] === 'nicht' ? 0.55 : 1 }}>
              <Row>
                <View style={{ flex: 1 }}>
                  <Txt weight="800">{r.name}</Txt>
                  <Txt size={12} muted>{`${MEAL_LABEL[r.meal]} · ${r.minutes} Min. · ${r.kcal} kcal/Portion · ${r.p} g Eiweiß`}</Txt>
                </View>
                {prefs.favorites.includes(r.id) && <Ionicons name="heart" size={20} color="#DB2777" />}
              </Row>
              <Row wrap gap={6}>
                {r.diet !== 'alles' && <Badge text={r.diet} bg={c.okBg} />}
                {prefs.ratings[r.id] === 'lecker' && <Badge text="Hat dir geschmeckt" bg={c.warnBg} />}
                {r.tags.slice(0, 2).map((t) => (
                  <Badge key={t} text={t} />
                ))}
              </Row>
            </Card>
          ))}
        </>
      )}

      {tab === 'plan' && (
        <>
          <Txt weight="800">Für welche Tage soll ich Gerichte vorschlagen?</Txt>
          <Row wrap gap={6}>
            {next14.map((d) => (
              <Chip key={d} label={`${WEEKDAYS_SHORT[weekday(d) - 1]} ${formatShort(d)}`} selected={days.includes(d)} onPress={() => setDays(days.includes(d) ? days.filter((x) => x !== d) : [...days, d].sort())} />
            ))}
          </Row>
          <ToggleRow title="Auch Frühstück vorschlagen" value={breakfast} onChange={setBreakfast} />
          <Txt weight="700">Das schmeckt mir besonders gut</Txt>
          <Row wrap gap={6}>
            {prefs.likedIngredients.map((x) => (
              <Chip key={x} label={`${x} ✕`} selected color="#0D9488" onPress={() => s.setRecipePrefs({ likedIngredients: prefs.likedIngredients.filter((y) => y !== x) })} />
            ))}
          </Row>
          <Row>
            <View style={{ flex: 1 }}>
              <Field label="Lieblingszutat hinzufügen" value={liked} onChangeText={setLiked} placeholder="z. B. Kichererbsen, Kokos, Pilze" />
            </View>
            <IconButton icon="add" label="Zutat hinzufügen" onPress={() => { if (liked.trim()) { s.setRecipePrefs({ likedIngredients: [...prefs.likedIngredients, liked.trim()] }); setLiked(''); } }} />
          </Row>
          <Button title="Gerichte vorschlagen" icon="sparkles" disabled={!days.length} onPress={suggest} />
          <Txt size={12} muted>Berücksichtigt Favoriten, deine Bewertungen, Lieblingszutaten, Ernährungsform, dein Kalorienziel und Abwechslung (keine Wiederholung innerhalb einer Woche).</Txt>
          {next14.filter((d) => s.mealPlan[d]?.length).map((d) => (
            <View key={d} style={{ gap: 6 }}>
              <Txt weight="800">{`${WEEKDAYS_SHORT[weekday(d) - 1]}, ${formatShort(d)}`}</Txt>
              {s.mealPlan[d].map((id) => {
                const r = RECIPES.find((x) => x.id === id);
                if (!r) return null;
                return (
                  <Row key={id} style={{ padding: 10, borderRadius: 14, backgroundColor: c.soft }}>
                    <Pressable accessibilityRole="button" onPress={() => { setOpen(r); setServings(r.servings); }} style={{ flex: 1 }}>
                      <Txt weight="700">{r.name}</Txt>
                      <Txt size={12} muted>{`${MEAL_LABEL[r.meal]} · ${r.kcal} kcal`}</Txt>
                    </Pressable>
                    <IconButton icon="refresh" label="Anderes Gericht vorschlagen" onPress={() => { const alt = suggestMeals({ ...s, mealPlan: { ...s.mealPlan, [d]: [] } }, [d], kcalGoal, r.meal === 'fruehstueck'); const repl = alt[d].find((x) => RECIPES.find((y) => y.id === x)?.meal === r.meal && x !== id); if (repl) s.setMealPlan(d, s.mealPlan[d].map((x) => (x === id ? repl : x))); }} />
                    <IconButton icon="close" label="Aus Plan entfernen" onPress={() => s.setMealPlan(d, s.mealPlan[d].filter((x) => x !== id))} />
                  </Row>
                );
              })}
            </View>
          ))}
          {next14.some((d) => s.mealPlan[d]?.length) && (
            <Button
              title="Alle Zutaten des Plans einkaufen"
              icon="cart-outline"
              kind="secondary"
              onPress={() => {
                let n = 0;
                for (const d of next14) for (const id of s.mealPlan[d] ?? []) n += s.addRecipeToShopping(id, RECIPES.find((x) => x.id === id)?.servings ?? 2);
                setMsg(`${n} Zutaten aus deinem Wochenplan stehen auf der Einkaufsliste (gleiche Zutaten zusammengerechnet).`);
              }}
            />
          )}
        </>
      )}
      <Note>Nährwerte pro Portion sind Richtwerte.</Note>

      <Sheet visible={!!open} onClose={() => setOpen(null)} title={open?.name ?? ''} footer={open ? <Button title="Zutaten auf die Einkaufsliste" icon="cart-outline" onPress={() => { toShopping(open, servings); setOpen(null); }} /> : undefined}>
        {open && (
          <>
            <Row wrap gap={6}>
              <Badge text={`${open.minutes} Min.`} />
              <Badge text={`${open.kcal} kcal/Portion`} />
              <Badge text={`${open.p} g Eiweiß · ${open.c} g KH · ${open.f} g Fett`} />
            </Row>
            <Row>
              <Button small kind={prefs.favorites.includes(open.id) ? 'primary' : 'secondary'} icon={prefs.favorites.includes(open.id) ? 'heart' : 'heart-outline'} title="Favorit" onPress={() => s.toggleFavRecipe(open.id)} style={{ flex: 1 }} />
              <Button small kind="secondary" icon="restaurant-outline" title="Gegessen" onPress={() => { s.addFood({ date: today(), meal: open.meal === 'fruehstueck' ? 'fruehstueck' : new Date().getHours() < 15 ? 'mittag' : 'abend', name: open.name, grams: 0, kcal: open.kcal, p: open.p, c: open.c, f: open.f, fiber: 6, sugar: 5, group: 'Gerichte' }); setMsg(`„${open.name}“ im Ernährungstagebuch eingetragen.`); }} style={{ flex: 1 }} />
            </Row>
            <Txt weight="700">Hat es dir geschmeckt?</Txt>
            <Row wrap gap={6}>
              <Chip label="Lecker!" icon="happy-outline" selected={prefs.ratings[open.id] === 'lecker'} onPress={() => rate(open, 'lecker')} color="#16A34A" />
              <Chip label="Okay" selected={prefs.ratings[open.id] === 'okay'} onPress={() => rate(open, 'okay')} color="#D97706" />
              <Chip label="Nicht mein Fall" icon="sad-outline" selected={prefs.ratings[open.id] === 'nicht'} onPress={() => rate(open, 'nicht')} color="#E11D48" />
            </Row>
            <Stepper label="Portionen" value={servings} onChange={setServings} min={1} max={12} />
            <Txt weight="800">Zutaten</Txt>
            {scaleIngredients(open, servings).map((x) => (
              <Row key={x.name} style={{ justifyContent: 'space-between', minHeight: 32 }}>
                <Txt>{x.name}</Txt>
                <Txt weight="700">{`${formatAmount(x.amount)} ${x.unit}`}</Txt>
              </Row>
            ))}
            <Txt weight="800">Zubereitung</Txt>
            {open.steps.map((st, i) => (
              <Txt key={i}>{`${i + 1}. ${st}`}</Txt>
            ))}
          </>
        )}
      </Sheet>
    </Screen>
  );
}
