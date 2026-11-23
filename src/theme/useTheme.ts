// Theme-Hook: Hell/Dunkel nach System oder Einstellung, optional große Schrift
import { useColorScheme } from 'react-native';
import { useStore } from '@/store/useStore';
import { dark, light } from '@/theme/colors';

export const useTheme = () => {
  const system = useColorScheme();
  const mode = useStore((s) => s.settings.theme);
  const large = useStore((s) => s.settings.largeText);
  const isDark = mode === 'dunkel' || (mode === 'system' && system === 'dark');
  const c = isDark ? dark : light;
  const scale = large ? 1.18 : 1;
  const fs = (n: number) => Math.round(n * scale);
  return { c, isDark, fs, scale };
};
