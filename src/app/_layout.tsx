// Wurzel-Layout: Seitenmenü (Drawer), Schriften, Benachrichtigungen, Hintergrund-Logik
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, usePathname, useRouter } from 'expo-router';
import { Drawer, DrawerContentScrollView, type DrawerContentComponentProps } from 'expo-router/drawer';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { AppState as RNAppState, Pressable, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Celebration } from '@/components/Celebration';
import { Txt } from '@/components/ui';
import { t, type Key } from '@/i18n';
import { today } from '@/lib/date';
import { initNotifications, notifyNow, rescheduleAll } from '@/lib/notifications';
import { formatMinutes, hasScreenTimePermission, usageForDay } from '@/lib/screenTime';
import { levelFromXp, useStore } from '@/store/useStore';
import { useTheme } from '@/theme/useTheme';
import type { ModuleId } from '@/types';

SplashScreen.preventAutoHideAsync().catch(() => {});

type MenuItem = { route: string; key: Key; icon: keyof typeof Ionicons.glyphMap; module?: ModuleId; color: string };
const MENU: { group: string; items: MenuItem[] }[] = [
  { group: 'Planen', items: [
    { route: '/', key: 'heute', icon: 'home-outline', color: '#7C3AED' },
    { route: '/kalender', key: 'kalender', icon: 'calendar-outline', module: 'kalender', color: '#2563EB' },
    { route: '/todos', key: 'todos', icon: 'checkbox-outline', module: 'todos', color: '#7C3AED' },
    { route: '/haushalt', key: 'haushalt', icon: 'sparkles-outline', module: 'haushalt', color: '#0891B2' },
    { route: '/einkauf', key: 'einkauf', icon: 'cart-outline', module: 'einkauf', color: '#D97706' },
  ] },
  { group: 'Körper & Gewohnheiten', items: [
    { route: '/habits', key: 'habits', icon: 'repeat-outline', module: 'habits', color: '#0D9488' },
    { route: '/zyklus', key: 'zyklus', icon: 'water-outline', module: 'zyklus', color: '#E11D48' },
    { route: '/fitness', key: 'fitness', icon: 'barbell-outline', module: 'fitness', color: '#16A34A' },
    { route: '/ernaehrung', key: 'ernaehrung', icon: 'nutrition-outline', module: 'ernaehrung', color: '#EA580C' },
    { route: '/medikamente', key: 'medikamente', icon: 'medkit-outline', module: 'medikamente', color: '#DC2626' },
  ] },
  { group: 'Achtsamkeit', items: [
    { route: '/checkin', key: 'checkin', icon: 'happy-outline', module: 'checkin', color: '#8B5CF6' },
    { route: '/uebungen', key: 'uebungen', icon: 'leaf-outline', module: 'uebungen', color: '#A855F7' },
    { route: '/tagebuch', key: 'tagebuch', icon: 'book-outline', module: 'tagebuch', color: '#DB2777' },
    { route: '/momente', key: 'momente', icon: 'flower-outline', module: 'momente', color: '#F59E0B' },
    { route: '/sterne', key: 'sterne', icon: 'moon-outline', module: 'sterne', color: '#4C1D95' },
  ] },
  { group: 'Du', items: [
    { route: '/bildschirmzeit', key: 'bildschirmzeit', icon: 'phone-portrait-outline', module: 'bildschirmzeit', color: '#475569' },
    { route: '/statistik', key: 'statistik', icon: 'stats-chart-outline', color: '#1F1B2E' },
    { route: '/einstellungen', key: 'einstellungen', icon: 'settings-outline', color: '#5B5670' },
  ] },
];

const DrawerContent = (props: DrawerContentComponentProps) => {
  const { c } = useTheme();
  const router = useRouter();
  const path = usePathname();
  const modules = useStore((s) => s.settings.modules);
  const name = useStore((s) => s.profile.name);
  const game = useStore((s) => s.game);
  const lvl = levelFromXp(game.xp);
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
      <View style={{ backgroundColor: c.primary, padding: 20, paddingTop: 48, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' }}>
          <Txt size={22} weight="800" color="#1F1B2E">
            {(name || 'D').charAt(0).toUpperCase()}
          </Txt>
        </View>
        <View>
          <Txt size={18} weight="800" color={c.onPrimary}>
            {name || 'Willkommen'}
          </Txt>
          <Txt size={13} color={c.onPrimary}>{`Level ${lvl.level} · ${game.xp} XP · Score ${game.score}`}</Txt>
        </View>
      </View>
      <View style={{ paddingHorizontal: 12, paddingBottom: 24 }}>
        {MENU.map((g) => {
          const items = g.items.filter((i) => !i.module || modules[i.module]);
          if (!items.length) return null;
          return (
            <View key={g.group}>
              <Txt size={12} weight="700" muted style={{ paddingTop: 16, paddingBottom: 4, paddingHorizontal: 10 }}>
                {g.group}
              </Txt>
              {items.map((i) => {
                const active = path === i.route;
                return (
                  <Pressable
                    key={i.route}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => {
                      router.navigate(i.route as never);
                      props.navigation.closeDrawer();
                    }}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 50, paddingHorizontal: 10, borderRadius: 14, backgroundColor: active ? c.soft : 'transparent' }}
                  >
                    <Ionicons name={i.icon} size={22} color={i.color} />
                    <Txt weight={active ? '800' : '600'} size={16}>
                      {t(i.key)}
                    </Txt>
                  </Pressable>
                );
              })}
            </View>
          );
        })}
        <Pressable accessibilityRole="button" onPress={() => { router.navigate('/onboarding' as never); props.navigation.closeDrawer(); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 50, paddingHorizontal: 10 }}>
          <Ionicons name="apps-outline" size={22} color={c.muted} />
          <Txt weight="600">{t('module')}</Txt>
        </Pressable>
        <Txt size={12} muted style={{ paddingHorizontal: 10, paddingTop: 12 }}>
          Deine Daten bleiben nur auf diesem Gerät.
        </Txt>
      </View>
    </DrawerContentScrollView>
  );
};

// Hintergrund-Aufgaben: Score-Verfall, Benachrichtigungen, Haushalt, Bildschirmzeit
const useAppLogic = (ready: boolean) => {
  const warned = useRef<string | null>(null);
  useEffect(() => {
    if (!ready) return;
    const st = useStore.getState();
    st.onAppOpen();
    st.syncChores();
    initNotifications().then(() => rescheduleAll(useStore.getState()));

    // Änderungen an relevanten Daten → Benachrichtigungen neu planen (gebündelt)
    let timer: ReturnType<typeof setTimeout> | null = null;
    const unsub = useStore.subscribe((s, prev) => {
      if (s.todos === prev.todos && s.events === prev.events && s.settings === prev.settings && s.cycle === prev.cycle && s.habits === prev.habits && s.meds === prev.meds && s.plan === prev.plan && s.astro === prev.astro) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => rescheduleAll(useStore.getState()), 1500);
    });

    // Bildschirmzeit messen und bei Überschreitung warnen
    const checkScreen = async () => {
      const s = useStore.getState();
      if (!s.settings.modules.bildschirmzeit || !hasScreenTimePermission()) return;
      const { totalMin } = await usageForDay();
      s.setScreenTime(today(), totalMin);
      if (s.settings.notifications.bildschirmzeit.on && totalMin > s.settings.screenTimeLimitMin && warned.current !== today()) {
        warned.current = today();
        notifyNow('Bildschirmzeit-Limit erreicht', `Heute schon ${formatMinutes(totalMin)}. Wie wäre eine kleine Pause ohne Handy?`);
      }
    };
    checkScreen();
    const interval = setInterval(checkScreen, 15 * 60 * 1000);
    const sub = RNAppState.addEventListener('change', (state) => {
      if (state === 'active') {
        useStore.getState().onAppOpen();
        checkScreen();
      }
    });
    return () => {
      unsub();
      clearInterval(interval);
      sub.remove();
    };
  }, [ready]);
};

export default function RootLayout() {
  const { c, isDark } = useTheme();
  const [fonts] = useFonts({ PlusJakartaSans_400Regular, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold });
  const [hydrated, setHydrated] = useState(useStore.persist.hasHydrated());
  useEffect(() => useStore.persist.onFinishHydration(() => setHydrated(true)), []);
  const ready = fonts && hydrated;
  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);
  useAppLogic(ready);
  const onboarded = useStore((s) => s.settings.onboarded);
  const path = usePathname();

  if (!ready) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: c.bg }}>
      <SafeAreaProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        {!onboarded && path !== '/onboarding' ? <Redirect href={'/onboarding' as never} /> : null}
        <Drawer
          drawerContent={(p) => <DrawerContent {...p} />}
          screenOptions={{ headerShown: false, swipeEdgeWidth: 32, drawerStyle: { backgroundColor: c.bg, width: 310 }, sceneStyle: { backgroundColor: c.bg } }}
        >
          {['index', 'kalender', 'todos', 'haushalt', 'einkauf', 'habits', 'zyklus', 'fitness', 'ernaehrung', 'rezepte', 'medikamente', 'checkin', 'uebungen', 'tagebuch', 'momente', 'sterne', 'bildschirmzeit', 'statistik', 'einstellungen', 'onboarding', 'schnell'].map((name) => (
            <Drawer.Screen key={name} name={name} options={{ swipeEnabled: name !== 'onboarding' }} />
          ))}
        </Drawer>
        <Celebration />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
