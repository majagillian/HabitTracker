// Tagi – der Begleiter im Check-in. Gesicht und Farbe reagieren auf die Stimmung.
import React, { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated } from 'react-native';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

const MOUTHS = ['M58 96 Q75 82 92 96', 'M58 92 Q75 86 92 92', 'M60 90 L90 90', 'M58 88 Q75 98 92 88', 'M56 86 Q75 106 94 86'];
const COLORS = ['#C4B5FD', '#B9C6F5', '#BDE8DD', '#8FFFD6', '#8FFFD6'];
const MOODS = ['traurig', 'nachdenklich', 'neutral', 'froh', 'begeistert'];

export const Tagi = ({ mood = 3, size = 150, level = 1 }: { mood?: number; size?: number; level?: number }) => {
  const bob = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (reduce) return;
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(bob, { toValue: 1, duration: 1300, useNativeDriver: true }),
          Animated.timing(bob, { toValue: 0, duration: 1300, useNativeDriver: true }),
        ]),
      );
      loop.start();
    });
    return () => loop?.stop();
  }, [bob]);
  const m = Math.max(0, Math.min(4, Math.round(mood)));
  const crown = level >= 5;
  return (
    <Animated.View accessible accessibilityRole="image" accessibilityLabel={`Tagi schaut ${MOODS[m]}`} style={{ transform: [{ translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) }] }}>
      <Svg width={size} height={size * 0.87} viewBox="0 0 150 130">
        <Ellipse cx="75" cy="122" rx="40" ry="6" fill="#E7E3F0" />
        <Path d="M75 12 C118 12 132 50 128 80 C124 108 104 116 75 116 C46 116 26 108 22 80 C18 50 32 12 75 12 Z" fill={COLORS[m]} />
        {crown && <Path d="M55 16 L62 2 L70 12 L75 0 L80 12 L88 2 L95 16 Z" fill="#FDE68A" stroke="#D97706" strokeWidth={2} />}
        <Circle cx="56" cy="62" r="8" fill="#1F1B2E" />
        <Circle cx="94" cy="62" r="8" fill="#1F1B2E" />
        <Circle cx="59" cy="59" r="2.5" fill="#FFFFFF" />
        <Circle cx="97" cy="59" r="2.5" fill="#FFFFFF" />
        <Circle cx="44" cy="80" r="7" fill="#FFC494" opacity={0.8} />
        <Circle cx="106" cy="80" r="7" fill="#FFC494" opacity={0.8} />
        <Path d={MOUTHS[m]} stroke="#1F1B2E" strokeWidth={4} strokeLinecap="round" fill="none" />
      </Svg>
    </Animated.View>
  );
};
