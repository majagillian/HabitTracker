// Einkaufsliste nach Kategorien – Erledigtes rutscht nach unten
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Button, Chip, Empty, Field, IconButton, Row, Sheet, Txt } from '@/components/ui';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/theme/useTheme';
import type { ShopCategory } from '@/types';

export const SHOP_CATS: { id: ShopCategory; label: string; color: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'lebensmittel', label: 'Lebensmittel', color: '#16A34A', icon: 'nutrition-outline' },
  { id: 'getraenke', label: 'Getränke', color: '#0891B2', icon: 'wine-outline' },
  { id: 'drogerie', label: 'Drogerie', color: '#2563EB', icon: 'water-outline' },
  { id: 'haushalt', label: 'Haushalt', color: '#D97706', icon: 'home-outline' },
  { id: 'apotheke', label: 'Apotheke', color: '#DC2626', icon: 'medkit-outline' },
  { id: 'kleidung', label: 'Kleidung', color: '#DB2777', icon: 'shirt-outline' },
  { id: 'sonstiges', label: 'Sonstiges', color: '#64748B', icon: 'pricetag-outline' },
];

export default function Einkauf() {
  const { c } = useTheme();
  const params = useLocalSearchParams<{ neu?: string }>();
  const items = useStore((s) => s.shopping);
  const { saveShopItem, toggleShopItem, clearDoneShopItems, deleteShopItem } = useStore();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');
  const [cat, setCat] = useState<ShopCategory>('lebensmittel');
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (params.neu) setAdding(true);
  }, [params.neu]);

  const add = (close: boolean) => {
    if (!name.trim()) return setError('Was soll auf die Liste?');
    saveShopItem({ name: name.trim(), qty: qty.trim(), category: cat });
    setName('');
    setQty('');
    setError(undefined);
    if (close) setAdding(false);
  };
  const open = items.filter((i) => !i.done).length;

  return (
    <Screen title="Einkaufsliste" subtitle={`${open} offen`} right={items.some((i) => i.done) ? <Button small kind="secondary" title="Erledigte löschen" onPress={clearDoneShopItems} /> : undefined}>
      {items.length === 0 && <Empty icon="cart-outline" title="Liste ist leer" text="Füge Artikel hinzu – oder übernimm Zutaten direkt aus einem Rezept." />}
      {SHOP_CATS.map((k) => {
        const list = items.filter((i) => i.category === k.id).sort((a, b) => Number(a.done) - Number(b.done));
        if (!list.length) return null;
        return (
          <View key={k.id} style={{ gap: 2 }}>
            <Row gap={8}>
              <Ionicons name={k.icon} size={18} color={k.color} />
              <Txt weight="800">{k.label}</Txt>
            </Row>
            {list.map((i) => (
              <Row key={i.id} style={{ minHeight: 52, borderBottomWidth: 1, borderColor: c.border }}>
                <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: i.done }} accessibilityLabel={`${i.name} ${i.qty}`} onPress={() => toggleShopItem(i.id)} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 50 }}>
                  <View style={{ width: 28, height: 28, borderRadius: 8, borderWidth: 2, borderColor: k.color, backgroundColor: i.done ? k.color : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                    {i.done && <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
                  </View>
                  <Txt style={{ flex: 1, textDecorationLine: i.done ? 'line-through' : 'none' }} muted={i.done}>
                    {i.name}
                  </Txt>
                  <Txt size={13} muted>
                    {i.qty}
                  </Txt>
                </Pressable>
                <IconButton icon="close" label={`${i.name} entfernen`} onPress={() => deleteShopItem(i.id)} size={40} />
              </Row>
            ))}
          </View>
        );
      })}
      <Button title="Artikel hinzufügen" icon="add" onPress={() => setAdding(true)} />
      <Sheet visible={adding} onClose={() => setAdding(false)} title="Auf die Liste" footer={<Row><Button title="Weiterer Artikel" kind="secondary" onPress={() => add(false)} style={{ flex: 1 }} /><Button title="Fertig" onPress={() => add(true)} style={{ flex: 1 }} /></Row>}>
        <Field label="Artikel" value={name} onChangeText={setName} error={error} placeholder="z. B. Hafermilch" autoFocus />
        <Field label="Menge (optional)" value={qty} onChangeText={setQty} placeholder="z. B. 2 Liter" />
        <Row wrap gap={6}>
          {SHOP_CATS.map((k) => (
            <Chip key={k.id} label={k.label} color={k.color} selected={cat === k.id} onPress={() => setCat(k.id)} />
          ))}
        </Row>
      </Sheet>
    </Screen>
  );
}
