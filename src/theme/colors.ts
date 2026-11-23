// Farbpalette „Eigene Palette“ – hell und dunkel
export const palette = {
  primary: '#7C3AED',
  secondary: '#8FFFD6',
  accent: '#FFC494',
  background: '#FFFFFF',
  text: '#1F1B2E',
};

export type Colors = {
  primary: string;
  primaryDark: string;
  onPrimary: string;
  secondary: string;
  accent: string;
  bg: string;
  card: string;
  soft: string; // leichtes Lila für Flächen
  border: string;
  text: string;
  muted: string; // Sekundärtext (Kontrast ≥ 4,5:1)
  danger: string;
  warnBg: string;
  okBg: string;
  overlay: string;
};

export const light: Colors = {
  primary: palette.primary,
  primaryDark: '#5B21B6',
  onPrimary: '#FFFFFF',
  secondary: palette.secondary,
  accent: palette.accent,
  bg: palette.background,
  card: '#FFFFFF',
  soft: '#F3EEFF',
  border: '#E7E3F0',
  text: palette.text,
  muted: '#5B5670',
  danger: '#BE123C',
  warnBg: '#FFF1E5',
  okBg: '#E6FFF6',
  overlay: 'rgba(31,27,46,0.45)',
};

export const dark: Colors = {
  primary: '#A78BFA',
  primaryDark: '#C4B5FD',
  onPrimary: '#1F1B2E',
  secondary: palette.secondary,
  accent: palette.accent,
  bg: '#14111F',
  card: '#1F1B2E',
  soft: '#2A2440',
  border: '#3A3352',
  text: '#F4F1FA',
  muted: '#BDB6CF',
  danger: '#FB7185',
  warnBg: '#3B2A1E',
  okBg: '#173A31',
  overlay: 'rgba(0,0,0,0.6)',
};

// Kategorie-Farben (unterscheiden sich auch in Helligkeit, farbenblind-freundlich ergänzt durch Text)
export const categoryColors: Record<string, string> = {
  arzt: '#E11D48',
  freunde: '#D97706',
  familie: '#DB2777',
  arbeit: '#2563EB',
  sport: '#0D9488',
  selbst: '#7C3AED',
  sonstiges: '#64748B',
};

export const priorityColors = { 1: '#E11D48', 2: '#F59E0B', 3: '#0D9488' } as const;
