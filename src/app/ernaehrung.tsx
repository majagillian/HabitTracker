// Ernährung: Kalorienzähler mit Grundnahrungsmitteln + Open Food Facts (Suche & Barcode), Ziel, Nährwert-Auswertung
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, View } from 'react-native';
import { HBar } from '@/components/Charts';
import { Screen } from '@/components/Screen';
import { Badge, Button, Card, Chip, Field, IconButton, Note, Row, Segmented, Sheet, Stepper, Txt } from '@/components/ui';
import { calorieGoal, FOODS, macroGoals } from '@/data/foods';
import { addDays, formatShort, today } from '@/lib/date';
import { lookupBarcode, searchOff } from '@/lib/openFoodFacts';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/theme/useTheme';
import type { Food, Meal } from '@/types';

const MEALS: { v: Meal; l: string }[] = [
  { v: 'fruehstueck', l: 'Frühstück' },
  { v: 'mittag', l: 'Mittag' },
  { v: 'abend', l: 'Abend' },
  { v: 'snack', l: 'Snack' },
];
const guessMeal = (): Meal => {
  const h = new Date().getHours();
  return h < 11 ? 'fruehstueck' : h < 15 ? 'mittag' : h < 18 ? 'snack' : 'abend';
};

export default function Ernaehrung() {
  const { c } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ neu?: string }>();
  const s = useStore();
  const d = today();
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState('');
  const [veganOnly, setVeganOnly] = useState(false);
  const [online, setOnline] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [pick, setPick] = useState<Food | null>(null);
  const [grams, setGrams] = useState(100);
  const [meal, setMeal] = useState<Meal>(guessMeal());
  const [scan, setScan] = useState(false);
  const [perm, requestPerm] = useCameraPermissions();
  const [goalSheet, setGoalSheet] = useState(false);

  useEffect(() => {
    if (params.neu) setAdding(true);
  }, [params.neu]);

  const kcalGoal = calorieGoal(s.profile.gender, s.profile.age, s.profile.heightCm, s.profile.weightKg, s.nutritionGoal);
  const goals = macroGoals(kcalGoal, s.profile.weightKg);
  const entries = s.foods.filter((f) => f.date === d);
  const sum = entries.reduce((a, f) => ({ kcal: a.kcal + f.kcal, p: a.p + f.p, c: a.c + f.c, f: a.f + f.f, fiber: a.fiber + f.fiber, sugar: a.sugar + f.sugar }), { kcal: 0, p: 0, c: 0, f: 0, fiber: 0, sugar: 0 });

  // Ausgewogenheit (0–100): Makro-Verteilung, Ballaststoffe, Zucker, Vielfalt der Lebensmittelgruppen
  const balance = useMemo(() => {
    if (!entries.length) return null;
    const energy = sum.p * 4 + sum.c * 4 + sum.f * 9 || 1;
    const pShare = (sum.p * 4) / energy, fShare = (sum.f * 9) / energy;
    let score = 100;
    score -= Math.max(0, 0.15 - pShare) * 200;
    score -= Math.max(0, fShare - 0.35) * 150;
    score -= Math.max(0, 1 - sum.fiber / (goals.fiber * Math.min(1, sum.kcal / kcalGoal + 0.1))) * 20;
    score -= Math.max(0, sum.sugar - goals.sugar) * 0.5;
    const groups = new Set(entries.map((e) => e.group));
    score += Math.min(10, groups.size * 2) - 6;
    const tips: string[] = [];
    if (pShare < 0.15) tips.push('Etwas mehr Eiweiß – z. B. Linsen, Tofu, Skyr oder Eier.');
    if (sum.fiber < goals.fiber * 0.5 && sum.kcal > kcalGoal * 0.5) tips.push('Mehr Ballaststoffe: Vollkorn, Hülsenfrüchte, Gemüse.');
    if (sum.sugar > goals.sugar) tips.push('Der Zucker liegt über der Empfehlung der WHO (unter 10 % der Energie).');
    if (!groups.has('Gemüse') && !groups.has('Obst')) tips.push('Noch kein Obst oder Gemüse heute – Ziel sind 5 Portionen.');
    if (!tips.length) tips.push('Sehr ausgewogen – weiter so!');
    return { score: Math.max(0, Math.min(100, Math.round(score))), tips };
  }, [entries, sum, goals, kcalGoal]);

  const local = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...s.customFoods, ...FOODS].filter((f) => (!veganOnly || f.vegan) && (!q || f.name.toLowerCase().includes(q))).slice(0, q ? 40 : 20);
  }, [query, veganOnly, s.customFoods]);

  const searchOnline = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(undefined);
    try {
      const r = await searchOff(query);
      setOnline(veganOnly ? r.filter((x) => x.vegan) : r);
      if (!r.length) setError('Keine Treffer in Open Food Facts. Versuch einen anderen Begriff.');
    } catch {
      setError('Keine Verbindung zur Lebensmittel-Datenbank. Die Grundnahrungsmittel funktionieren auch offline.');
    } finally {
      setLoading(false);
    }
  };

  const onScanned = async (code: string) => {
    setScan(false);
    setLoading(true);
    try {
      const f = await lookupBarcode(code);
      if (f) {
        setPick(f);
        setGrams(f.portion);
      } else setError(`Produkt ${code} nicht gefunden. Du kannst es über die Suche eintragen.`);
    } catch {
      setError('Barcode konnte nicht abgefragt werden (keine Internetverbindung?).');
    } finally {
      setLoading(false);
    }
  };

  const add = () => {
    if (!pick) return;
    const k = grams / 100;
    s.addFood({ date: d, meal, name: pick.name, grams, kcal: Math.round(pick.kcal * k), p: +(pick.p * k).toFixed(1), c: +(pick.c * k).toFixed(1), f: +(pick.f * k).toFixed(1), fiber: +(pick.fiber * k).toFixed(1), sugar: +(pick.sugar * k).toFixed(1), group: pick.group });
    if (pick.id.startsWith('off-')) s.addCustomFood(pick);
    setPick(null);
    setAdding(false);
    setQuery('');
    setOnline([]);
  };

  const pct = Math.min(100, (sum.kcal / kcalGoal) * 100);
  return (
    <Screen title="Ernährung" subtitle={`Ziel: ${{ abnehmen: 'Abnehmen', halten: 'Gewicht halten', zunehmen: 'Zunehmen' }[s.nutritionGoal]} · ${kcalGoal.toLocaleString('de-DE')} kcal`} right={<IconButton icon="options-outline" label="Ziel einstellen" onPress={() => setGoalSheet(true)} />}>
      <Card>
        <Row style={{ alignItems: 'center' }}>
          <View accessible accessibilityLabel={`${Math.round(sum.kcal)} von ${kcalGoal} Kilokalorien`} style={{ width: 112, height: 112, borderRadius: 56, borderWidth: 12, borderColor: c.soft, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ position: 'absolute', bottom: -12, left: -12, right: -12, height: 112 * (pct / 100) + 12, backgroundColor: c.primary, opacity: 0.15, borderBottomLeftRadius: 56, borderBottomRightRadius: 56 }} />
            <Txt weight="800" size={20}>
              {Math.round(sum.kcal).toLocaleString('de-DE')}
            </Txt>
            <Txt size={11} muted>{`von ${kcalGoal.toLocaleString('de-DE')} kcal`}</Txt>
          </View>
          <View style={{ flex: 1, gap: 6 }}>
            <HBar label="Eiweiß" value={Math.round(sum.p)} max={goals.p} color="#0D9488" suffix=" g" />
            <HBar label="Kohlenhydr." value={Math.round(sum.c)} max={goals.c} color="#F59E0B" suffix=" g" />
            <HBar label="Fett" value={Math.round(sum.f)} max={goals.f} color="#E11D48" suffix=" g" />
            <HBar label="Ballaststoffe" value={Math.round(sum.fiber)} max={goals.fiber} color="#16A34A" suffix=" g" />
          </View>
        </Row>
      </Card>
      {balance && (
        <Card tone="ok">
          <Txt weight="800">{`Ausgewogenheit: ${balance.score} / 100`}</Txt>
          {balance.tips.map((t) => (
            <Txt key={t} size={14}>{`• ${t}`}</Txt>
          ))}
        </Card>
      )}
      <Row>
        <Button title="Essen eintragen" icon="add" onPress={() => setAdding(true)} style={{ flex: 1 }} />
        <Button title="Rezepte" icon="restaurant-outline" kind="secondary" onPress={() => router.navigate('/rezepte' as never)} style={{ flex: 1 }} />
      </Row>
      {MEALS.map((m) => {
        const list = entries.filter((e) => e.meal === m.v);
        if (!list.length) return null;
        return (
          <View key={m.v} style={{ gap: 6 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Txt weight="800">{m.l}</Txt>
              <Txt size={13} muted>{`${list.reduce((a, b) => a + b.kcal, 0)} kcal`}</Txt>
            </Row>
            {list.map((e) => (
              <Row key={e.id} style={{ padding: 10, borderRadius: 14, backgroundColor: c.soft }}>
                <View style={{ flex: 1 }}>
                  <Txt weight="700">{e.name}</Txt>
                  <Txt size={12} muted>{`${e.grams} g · ${e.kcal} kcal · ${e.p} g Eiweiß`}</Txt>
                </View>
                <IconButton icon="trash-outline" label={`${e.name} entfernen`} onPress={() => s.deleteFood(e.id)} />
              </Row>
            ))}
          </View>
        );
      })}
      <Txt weight="800">Letzte 7 Tage</Txt>
      {Array.from({ length: 7 }, (_, i) => {
        const iso = addDays(today(), i - 6);
        const k = s.foods.filter((f) => f.date === iso).reduce((a, b) => a + b.kcal, 0);
        return <HBar key={iso} label={formatShort(iso)} value={k} max={kcalGoal * 1.3} color={k > kcalGoal * 1.1 ? '#F97316' : c.primary} suffix="" />;
      })}
      <Note>Nährwerte sind Richtwerte. Kalorienbedarf geschätzt nach Mifflin-St Jeor mit leichter Aktivität. Bei Essstörungen oder Erkrankungen bitte ärztlich begleiten lassen – die Zahlen lassen sich in den Einstellungen ausblenden, indem du das Modul abschaltest.</Note>

      <Sheet visible={adding} onClose={() => { setAdding(false); setPick(null); }} title={pick ? pick.name : 'Was hast du gegessen?'} footer={pick ? <Button title="Eintragen" onPress={add} /> : undefined}>
        {pick ? (
          <>
            <Txt muted>{`Pro 100 g: ${pick.kcal} kcal · ${pick.p} g Eiweiß · ${pick.c} g KH · ${pick.f} g Fett`}</Txt>
            <Stepper label="Menge" value={grams} onChange={setGrams} min={5} max={2000} step={grams >= 100 ? 25 : 5} suffix=" g" />
            <Row wrap gap={6}>
              <Chip label={`1 Portion (${pick.portion} g)`} selected={grams === pick.portion} onPress={() => setGrams(pick.portion)} />
              <Chip label="100 g" selected={grams === 100} onPress={() => setGrams(100)} />
            </Row>
            <Txt weight="800" size={18}>{`= ${Math.round((pick.kcal * grams) / 100)} kcal`}</Txt>
            <Segmented value={meal} onChange={setMeal} options={MEALS.map((m) => ({ value: m.v, label: m.l }))} />
            <Button title="Anderes Lebensmittel" kind="ghost" onPress={() => setPick(null)} />
          </>
        ) : scan ? (
          <View style={{ height: 360, borderRadius: 20, overflow: 'hidden' }}>
            <CameraView style={{ flex: 1 }} facing="back" barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'] }} onBarcodeScanned={(r) => onScanned(r.data)} />
            <Button title="Abbrechen" kind="secondary" onPress={() => setScan(false)} />
          </View>
        ) : (
          <>
            <Row>
              <View style={{ flex: 1 }}>
                <Field label="Suchen" value={query} onChangeText={(t) => { setQuery(t); setOnline([]); }} placeholder="z. B. Haferflocken, Tofu, Pizza" onSubmitEditing={searchOnline} returnKeyType="search" />
              </View>
              {Platform.OS !== 'web' && (
                <IconButton
                  icon="barcode-outline"
                  label="Barcode scannen"
                  size={52}
                  onPress={async () => {
                    if (!perm?.granted) {
                      const r = await requestPerm();
                      if (!r.granted) return setError('Für den Barcode-Scan braucht die App Zugriff auf die Kamera.');
                    }
                    setScan(true);
                  }}
                />
              )}
            </Row>
            <Row wrap gap={6}>
              <Chip label="Nur vegan" selected={veganOnly} onPress={() => setVeganOnly(!veganOnly)} color="#16A34A" />
              {query.trim() ? <Chip label="Online suchen (Open Food Facts)" icon="globe-outline" onPress={searchOnline} /> : null}
            </Row>
            {loading && <ActivityIndicator color={c.primary} />}
            {error ? <Txt size={13} color={c.danger}>{error}</Txt> : null}
            {[...online, ...local].map((f) => (
              <Pressable key={f.id} accessibilityRole="button" accessibilityLabel={`${f.name}, ${f.kcal} Kilokalorien pro 100 Gramm`} onPress={() => { setPick(f); setGrams(f.portion); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 14, backgroundColor: c.soft }}>
                <View style={{ flex: 1 }}>
                  <Txt weight="700">{f.name}</Txt>
                  <Txt size={12} muted>{`${f.kcal} kcal/100 g · ${f.group}`}</Txt>
                </View>
                {f.vegan && <Badge text="vegan" bg={c.okBg} />}
              </Pressable>
            ))}
          </>
        )}
      </Sheet>

      <Sheet visible={goalSheet} onClose={() => setGoalSheet(false)} title="Dein Ziel" footer={<Button title="Fertig" onPress={() => setGoalSheet(false)} />}>
        <Segmented value={s.nutritionGoal} onChange={s.setNutritionGoal} options={[{ value: 'abnehmen', label: 'Abnehmen' }, { value: 'halten', label: 'Halten' }, { value: 'zunehmen', label: 'Zunehmen' }]} />
        <Stepper label="Größe" value={s.profile.heightCm} onChange={(heightCm) => s.setProfile({ heightCm })} min={120} max={220} suffix=" cm" />
        <Stepper label="Gewicht" value={s.profile.weightKg} onChange={(weightKg) => s.setProfile({ weightKg })} min={35} max={250} suffix=" kg" />
        <Stepper label="Alter" value={s.profile.age} onChange={(age) => s.setProfile({ age })} min={12} max={110} />
        <Txt>{`Empfohlene Tagesmenge: ${kcalGoal.toLocaleString('de-DE')} kcal · ${goals.p} g Eiweiß · ${goals.c} g Kohlenhydrate · ${goals.f} g Fett`}</Txt>
        <Note>Ein moderates Defizit (ca. 400 kcal) gilt als nachhaltig. Sehr niedrige Kalorienmengen sind nicht empfehlenswert.</Note>
      </Sheet>
    </Screen>
  );
}
