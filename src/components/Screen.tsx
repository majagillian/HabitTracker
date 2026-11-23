// Seiten-Rahmen: Kopfzeile, scrollbarer Inhalt, Daumenzone-Navigation unten, Wischen zwischen Hauptseiten
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, usePathname, useRouter } from 'expo-router';
import React, { useMemo, useRef, type ReactNode } from 'react';
import { Animated, PanResponder, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Txt } from '@/components/ui';
import { t } from '@/i18n';
import { useTheme } from '@/theme/useTheme';

// Reihenfolge der Seiten, zwischen denen man wischen kann
const SWIPE_ORDER = ['/', '/kalender', '/todos', '/habits'];

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  right?: ReactNode;
  scroll?: boolean;
  bg?: string;
  fg?: string;
  footer?: ReactNode; // ersetzt die Navigationsleiste (z. B. Speichern-Button)
};

export const Screen = ({ title, subtitle, children, right, scroll = true, bg, fg, footer }: Props) => {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const path = usePathname();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const fade = useRef(new Animated.Value(0)).current;
  const wide = width > 720; // Querformat/Tablet: Inhalt zentriert begrenzen

  React.useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }).start();
  }, [fade]);

  const idx = SWIPE_ORDER.indexOf(path);
  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => idx >= 0 && Math.abs(g.dx) > 30 && Math.abs(g.dx) > Math.abs(g.dy) * 2 && g.moveX > 40,
        onPanResponderRelease: (_, g) => {
          if (g.dx < -70 && idx < SWIPE_ORDER.length - 1) router.navigate(SWIPE_ORDER[idx + 1] as never);
          if (g.dx > 70 && idx > 0) router.navigate(SWIPE_ORDER[idx - 1] as never);
        },
      }),
    [idx, router],
  );

  const openMenu = () => navigation.dispatch({ type: 'OPEN_DRAWER' } as never);
  const text = fg ?? c.text;

  const body = (
    <View style={{ width: '100%', maxWidth: wide ? 760 : undefined, alignSelf: 'center', paddingHorizontal: 20, gap: 14, paddingBottom: 24 }}>{children}</View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: bg ?? c.bg }} {...pan.panHandlers}>
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%', maxWidth: wide ? 800 : undefined, alignSelf: 'center' }}>
        <View style={{ flex: 1 }}>
          {subtitle ? (
            <Txt size={13} color={fg ? fg : c.muted}>
              {subtitle}
            </Txt>
          ) : null}
          <Txt size={26} weight="800" role="header" color={text}>
            {title}
          </Txt>
        </View>
        {right}
      </View>
      <Animated.View style={{ flex: 1, opacity: fade, transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }}>
        {scroll ? (
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingTop: 6 }}>
            {body}
          </ScrollView>
        ) : (
          <View style={{ flex: 1, paddingTop: 6 }}>{body}</View>
        )}
      </Animated.View>
      {footer ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: insets.bottom + 12, borderTopWidth: 1, borderColor: c.border, backgroundColor: bg ?? c.bg, gap: 8 }}>{footer}</View>
      ) : (
        <BottomBar onMenu={openMenu} bottom={insets.bottom} />
      )}
    </View>
  );
};

// Navigation in der Daumenzone
const BottomBar = ({ onMenu, bottom }: { onMenu: () => void; bottom: number }) => {
  const { c } = useTheme();
  const router = useRouter();
  const path = usePathname();
  const item = (icon: keyof typeof Ionicons.glyphMap, label: string, href: string | null, onPress?: () => void) => {
    const active = href === path;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected: active }}
        onPress={onPress ?? (() => router.navigate(href as never))}
        style={{ minWidth: 60, minHeight: 52, alignItems: 'center', justifyContent: 'center', gap: 2 }}
      >
        <Ionicons name={icon} size={24} color={active ? c.primary : c.text} />
        <Txt size={11} weight={active ? '800' : '600'} color={active ? c.primary : c.text}>
          {label}
        </Txt>
      </Pressable>
    );
  };
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingBottom: bottom + 6, paddingTop: 6, borderTopWidth: 1, borderColor: c.border, backgroundColor: c.bg }}>
      {item('menu', t('menue'), null, onMenu)}
      {item('home-outline', t('heute'), '/')}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Schnell hinzufügen"
        onPress={() => router.navigate('/schnell' as never)}
        style={({ pressed }) => ({ width: 60, height: 60, borderRadius: 30, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center', marginTop: -26, opacity: pressed ? 0.85 : 1, shadowColor: '#7C3AED', shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 })}
      >
        <Ionicons name="add" size={32} color={c.onPrimary} />
      </Pressable>
      {item('calendar-outline', t('kalender'), '/kalender')}
      {item('heart-outline', 'Check-in', '/checkin')}
    </View>
  );
};
