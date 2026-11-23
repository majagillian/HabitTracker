// Belohnung: Toast mit Sternen, bei großen Erfolgen zusätzlich Konfetti
import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo, useRef } from 'react';
import { AccessibilityInfo, Animated, Dimensions, Platform, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Txt } from '@/components/ui';
import { useUi } from '@/store/useUi';
import { useTheme } from '@/theme/useTheme';

const COLORS = ['#7C3AED', '#8FFFD6', '#FFC494', '#F472B6', '#60A5FA', '#FDE68A'];

const Piece = ({ i, h }: { i: number; h: number }) => {
  const y = useRef(new Animated.Value(-30)).current;
  const r = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(y, { toValue: h + 40, duration: 1800 + (i % 7) * 160, delay: (i % 10) * 60, useNativeDriver: true }),
      Animated.timing(r, { toValue: 1, duration: 2000, useNativeDriver: true }),
    ]).start();
  }, [h, i, r, y]);
  const w = Dimensions.get('window').width;
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: ((i * 37) % 100) * (w / 100),
        width: 9,
        height: 14,
        borderRadius: 2,
        backgroundColor: COLORS[i % COLORS.length],
        transform: [{ translateY: y }, { rotate: r.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${360 + i * 20}deg`] }) }],
      }}
    />
  );
};

export const Star = ({ size, fill }: { size: number; fill: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 2l3 6.5 7 .8-5.2 4.8 1.5 7-6.3-3.7-6.3 3.7 1.5-7L2 9.3l7-.8z" fill={fill} stroke="#7C3AED" strokeWidth={1.5} />
  </Svg>
);

export const Celebration = () => {
  const cel = useUi((s) => s.celebration);
  const clear = useUi((s) => s.clear);
  const { c } = useTheme();
  const pop = useRef(new Animated.Value(0)).current;
  const [reduce, setReduce] = React.useState(false);
  const h = Dimensions.get('window').height;
  const pieces = useMemo(() => Array.from({ length: 36 }, (_, i) => i), []);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduce).catch(() => {});
  }, []);

  useEffect(() => {
    if (!cel) return;
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    AccessibilityInfo.announceForAccessibility(`${cel.title}. ${cel.sub}`);
    pop.setValue(0);
    Animated.spring(pop, { toValue: 1, useNativeDriver: true, friction: 6 }).start();
    const timer = setTimeout(clear, cel.big ? 2600 : 1600);
    return () => clearTimeout(timer);
  }, [cel, clear, pop]);

  if (!cel) return null;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', inset: 0, zIndex: 100 }}>
      {cel.big && !reduce && pieces.map((i) => <Piece key={`${cel.id}-${i}`} i={i} h={h} />)}
      <Animated.View
        style={{
          position: 'absolute',
          left: 32,
          right: 32,
          top: cel.big ? h * 0.36 : undefined,
          bottom: cel.big ? undefined : 110,
          backgroundColor: cel.big ? c.card : '#1F1B2E',
          borderRadius: 24,
          padding: cel.big ? 20 : 14,
          alignItems: 'center',
          gap: 6,
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 20,
          elevation: 8,
          transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
          opacity: pop,
        }}
      >
        {cel.big && (
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <Star size={34} fill="#FFC494" />
            <Star size={42} fill="#7C3AED" />
            <Star size={34} fill="#8FFFD6" />
          </View>
        )}
        <Txt weight="800" size={cel.big ? 19 : 15} center color={cel.big ? c.text : '#FFFFFF'}>
          {cel.title}
        </Txt>
        <Txt size={13} center color={cel.big ? c.muted : '#E9E4F5'}>
          {cel.sub}
        </Txt>
      </Animated.View>
    </View>
  );
};
