// Schnell hinzufügen: in max. 2 Tipps zu jedem Eintrag
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/ui';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/theme/useTheme';
import type { ModuleId } from '@/types';

const ACTIONS: { label: string; icon: keyof typeof Ionicons.glyphMap; href: string; module: ModuleId; color: string }[] = [
  { label: 'To-do', icon: 'checkbox-outline', href: '/todos?neu=1', module: 'todos', color: '#7C3AED' },
  { label: 'Termin', icon: 'calendar-outline', href: '/kalender?neu=1', module: 'kalender', color: '#2563EB' },
  { label: 'Gewohnheit', icon: 'repeat-outline', href: '/habits?neu=1', module: 'habits', color: '#0D9488' },
  { label: 'Check-in', icon: 'happy-outline', href: '/checkin', module: 'checkin', color: '#8B5CF6' },
  { label: 'Moment', icon: 'flower-outline', href: '/momente?neu=1', module: 'momente', color: '#F59E0B' },
  { label: 'Periode / Symptome', icon: 'water-outline', href: '/zyklus', module: 'zyklus', color: '#E11D48' },
  { label: 'Mahlzeit', icon: 'nutrition-outline', href: '/ernaehrung?neu=1', module: 'ernaehrung', color: '#EA580C' },
  { label: 'Einkauf', icon: 'cart-outline', href: '/einkauf?neu=1', module: 'einkauf', color: '#D97706' },
  { label: 'Training', icon: 'barbell-outline', href: '/fitness', module: 'fitness', color: '#16A34A' },
  { label: 'Tagebuch', icon: 'book-outline', href: '/tagebuch', module: 'tagebuch', color: '#DB2777' },
];

export default function Schnell() {
  const { c } = useTheme();
  const router = useRouter();
  const modules = useStore((s) => s.settings.modules);
  return (
    <Screen title="Was möchtest du festhalten?">
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {ACTIONS.filter((a) => modules[a.module]).map((a) => (
          <Pressable
            key={a.label}
            accessibilityRole="button"
            accessibilityLabel={a.label}
            onPress={() => router.navigate(a.href as never)}
            style={({ pressed }) => ({ width: '47%', minHeight: 100, borderRadius: 20, backgroundColor: c.soft, padding: 14, justifyContent: 'space-between', opacity: pressed ? 0.8 : 1 })}
          >
            <Ionicons name={a.icon} size={28} color={a.color} />
            <Txt weight="800">{a.label}</Txt>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
