// Wiederverwendbare UI-Bausteine (barrierefrei: Rollen, Labels, ≥ 44 px Touch-Flächen)
import { Ionicons } from '@expo/vector-icons';
import React, { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/useTheme';

export type IconName = keyof typeof Ionicons.glyphMap;

// ---------- Text ----------
export const Txt = ({
  children,
  size = 15,
  weight = '400',
  color,
  muted,
  style,
  center,
  numberOfLines,
  role,
  accessibilityLabel,
}: {
  children: ReactNode;
  size?: number;
  weight?: '400' | '600' | '700' | '800';
  color?: string;
  muted?: boolean;
  style?: StyleProp<TextStyle>;
  center?: boolean;
  numberOfLines?: number;
  role?: 'header';
  accessibilityLabel?: string;
}) => {
  const { c, fs } = useTheme();
  return (
    <Text
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={role}
      numberOfLines={numberOfLines}
      style={[{ fontSize: fs(size), fontWeight: weight, color: color ?? (muted ? c.muted : c.text), lineHeight: fs(size) * 1.4, textAlign: center ? 'center' : undefined, fontFamily: 'PlusJakartaSans' + (weight === '400' ? '_400Regular' : weight === '600' ? '_600SemiBold' : weight === '700' ? '_700Bold' : '_800ExtraBold') }, style]}
    >
      {children}
    </Text>
  );
};

export const H1 = ({ children }: { children: ReactNode }) => (
  <Txt size={26} weight="800" role="header">
    {children}
  </Txt>
);
export const H2 = ({ children, right }: { children: ReactNode; right?: ReactNode }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
    <Txt size={18} weight="800" role="header">
      {children}
    </Txt>
    {right}
  </View>
);

// ---------- Karten & Flächen ----------
export const Card = ({ children, style, onPress, label, tone }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; label?: string; tone?: 'soft' | 'warn' | 'ok' | 'primary' | 'plain' }) => {
  const { c } = useTheme();
  const bg = tone === 'soft' ? c.soft : tone === 'warn' ? c.warnBg : tone === 'ok' ? c.okBg : tone === 'primary' ? c.primary : c.card;
  const border = tone && tone !== 'plain' ? 'transparent' : c.border;
  const base: ViewStyle = { backgroundColor: bg, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: border, gap: 8 };
  if (onPress)
    return (
      <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [base, { opacity: pressed ? 0.85 : 1 }, style]}>
        {children}
      </Pressable>
    );
  return <View style={[base, style]}>{children}</View>;
};

export const Row = ({ children, gap = 10, style, wrap }: { children: ReactNode; gap?: number; style?: StyleProp<ViewStyle>; wrap?: boolean }) => (
  <View style={[{ flexDirection: 'row', alignItems: 'center', gap, flexWrap: wrap ? 'wrap' : 'nowrap' }, style]}>{children}</View>
);

// ---------- Buttons ----------
export const Button = ({
  title,
  onPress,
  kind = 'primary',
  icon,
  disabled,
  style,
  small,
  label,
}: {
  title: string;
  onPress: () => void;
  kind?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'mint';
  icon?: IconName;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
  label?: string;
}) => {
  const { c } = useTheme();
  const bg = { primary: c.primary, secondary: c.soft, ghost: 'transparent', danger: c.danger, mint: c.secondary }[kind];
  const fg = { primary: c.onPrimary, secondary: c.text, ghost: c.primary, danger: '#FFFFFF', mint: '#1F1B2E' }[kind];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label ?? title}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        { minHeight: small ? 44 : 54, paddingHorizontal: small ? 14 : 18, borderRadius: 16, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, opacity: disabled ? 0.45 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {icon && <Ionicons name={icon} size={small ? 18 : 20} color={fg} />}
      <Txt weight="800" size={small ? 14 : 16} color={fg}>
        {title}
      </Txt>
    </Pressable>
  );
};

export const IconButton = ({ icon, label, onPress, color, bg, size = 44 }: { icon: IconName; label: string; onPress: () => void; color?: string; bg?: string; size?: number }) => {
  const { c } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => ({ width: size, height: size, borderRadius: size / 2, backgroundColor: bg ?? c.soft, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}
    >
      <Ionicons name={icon} size={size * 0.5} color={color ?? c.text} />
    </Pressable>
  );
};

// ---------- Auswahl ----------
export const Chip = ({ label, selected, onPress, color, icon }: { label: string; selected?: boolean; onPress?: () => void; color?: string; icon?: IconName }) => {
  const { c } = useTheme();
  const col = color ?? c.primary;
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={{ minHeight: 40, paddingHorizontal: 14, borderRadius: 20, borderWidth: 2, borderColor: col, backgroundColor: selected ? col : 'transparent', justifyContent: 'center', flexDirection: 'row', alignItems: 'center', gap: 6 }}
    >
      {icon && <Ionicons name={icon} size={16} color={selected ? '#FFFFFF' : c.text} />}
      <Txt size={13} weight="700" color={selected ? '#FFFFFF' : c.text}>
        {label}
      </Txt>
    </Pressable>
  );
};

export function Segmented<T extends string | number>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  const { c } = useTheme();
  return (
    <View accessibilityRole="tablist" style={{ flexDirection: 'row', backgroundColor: c.soft, borderRadius: 14, padding: 4 }}>
      {options.map((o) => {
        const sel = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: sel }}
            onPress={() => onChange(o.value)}
            style={{ flex: 1, minHeight: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: sel ? c.card : 'transparent', paddingHorizontal: 6 }}
          >
            <Txt size={13} weight={sel ? '800' : '600'} center>
              {o.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

export const ToggleRow = ({ title, desc, value, onChange }: { title: string; desc?: string; value: boolean; onChange: (v: boolean) => void }) => {
  const { c } = useTheme();
  return (
    <Pressable accessibilityRole="switch" accessibilityState={{ checked: value }} accessibilityLabel={title} onPress={() => onChange(!value)} style={{ flexDirection: 'row', alignItems: 'center', minHeight: 56, gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: c.border }}>
      <View style={{ flex: 1 }}>
        <Txt weight="700">{title}</Txt>
        {desc ? <Txt size={12} muted>{desc}</Txt> : null}
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: c.primary, false: c.border }} thumbColor="#FFFFFF" />
    </Pressable>
  );
};

// ---------- Eingabe ----------
export const Field = ({ label, error, hint, labelColor, ...props }: TextInputProps & { label: string; error?: string; hint?: string; labelColor?: string }) => {
  const { c, fs } = useTheme();
  return (
    <View style={{ gap: 4 }}>
      <Txt size={13} weight="700" color={labelColor}>
        {label}
      </Txt>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={c.muted}
        {...props}
        style={[{ minHeight: 48, borderWidth: 2, borderColor: error ? c.danger : c.border, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, fontSize: fs(16), color: c.text, backgroundColor: c.card }, props.multiline ? { minHeight: 90, textAlignVertical: 'top' } : null, props.style]}
      />
      {error ? (
        <Txt size={12} color={c.danger}>
          {error}
        </Txt>
      ) : hint ? (
        <Txt size={12} muted color={labelColor}>
          {hint}
        </Txt>
      ) : null}
    </View>
  );
};

export const Stepper = ({ label, value, onChange, min = 0, max = 999, step = 1, suffix }: { label: string; value: number; onChange: (n: number) => void; min?: number; max?: number; step?: number; suffix?: string }) => (
  <Row style={{ justifyContent: 'space-between' }}>
    <Txt weight="700">{label}</Txt>
    <Row>
      <IconButton icon="remove" label={`${label} verringern`} onPress={() => onChange(Math.max(min, value - step))} />
      <Txt weight="800" size={17} style={{ minWidth: 56, textAlign: 'center' }}>
        {`${value}${suffix ?? ''}`}
      </Txt>
      <IconButton icon="add" label={`${label} erhöhen`} onPress={() => onChange(Math.min(max, value + step))} />
    </Row>
  </Row>
);

// ---------- Fortschritt ----------
export const Progress = ({ value, color, height = 10, label }: { value: number; color?: string; height?: number; label?: string }) => {
  const { c } = useTheme();
  const v = Math.max(0, Math.min(100, value));
  return (
    <View accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max: 100, now: Math.round(v) }} style={{ height, borderRadius: height / 2, backgroundColor: c.soft, overflow: 'hidden' }}>
      <View style={{ width: `${v}%`, height, backgroundColor: color ?? c.secondary, borderRadius: height / 2 }} />
    </View>
  );
};

export const Empty = ({ icon, title, text, action }: { icon: IconName; title: string; text: string; action?: ReactNode }) => {
  const { c } = useTheme();
  return (
    <View style={{ alignItems: 'center', padding: 24, gap: 8 }}>
      <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: c.soft, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={30} color={c.primary} />
      </View>
      <Txt weight="800" size={17} center>
        {title}
      </Txt>
      <Txt muted center>
        {text}
      </Txt>
      {action}
    </View>
  );
};

export const Badge = ({ text, color, bg }: { text: string; color?: string; bg?: string }) => {
  const { c } = useTheme();
  return (
    <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: bg ?? c.soft, alignSelf: 'flex-start' }}>
      <Txt size={12} weight="700" color={color ?? c.text}>
        {text}
      </Txt>
    </View>
  );
};

export const Dot = ({ color, size = 10 }: { color: string; size?: number }) => <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />;

// ---------- Bottom-Sheet (Formulare) ----------
export const Sheet = ({ visible, onClose, title, children, footer }: { visible: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) => {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: c.overlay }}>
        <Pressable accessibilityLabel="Schließen" style={{ flex: 1 }} onPress={onClose} />
        <View style={{ backgroundColor: c.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '92%', paddingBottom: insets.bottom + 12 }}>
          <View style={{ alignItems: 'center', paddingTop: 10 }}>
            <View style={{ width: 44, height: 5, borderRadius: 3, backgroundColor: c.border }} />
          </View>
          <Row style={{ paddingHorizontal: 20, paddingVertical: 10, justifyContent: 'space-between' }}>
            <Txt size={20} weight="800" role="header">
              {title}
            </Txt>
            <IconButton icon="close" label="Schließen" onPress={onClose} />
          </Row>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12, gap: 14 }} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
          {footer ? <View style={{ paddingHorizontal: 20, paddingTop: 8, gap: 8 }}>{footer}</View> : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// Dezenter Hinweis (z. B. Disclaimer)
export const Note = ({ children }: { children: ReactNode }) => (
  <Txt size={12} muted style={{ lineHeight: 17 }}>
    {children}
  </Txt>
);

// Einfache Bestätigung (statt Alert, funktioniert auch im Web)
export const Confirm = ({ visible, title, text, confirm, onConfirm, onCancel, danger }: { visible: boolean; title: string; text: string; confirm: string; onConfirm: () => void; onCancel: () => void; danger?: boolean }) => {
  const { c } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={{ flex: 1, backgroundColor: c.overlay, justifyContent: 'center', padding: 28 }}>
        <View accessibilityRole="alert" style={{ backgroundColor: c.bg, borderRadius: 24, padding: 20, gap: 12 }}>
          <Txt size={18} weight="800">
            {title}
          </Txt>
          <Txt muted>{text}</Txt>
          <Row>
            <Button title="Abbrechen" kind="secondary" onPress={onCancel} style={{ flex: 1 }} small />
            <Button title={confirm} kind={danger ? 'danger' : 'primary'} onPress={onConfirm} style={{ flex: 1 }} small />
          </Row>
        </View>
      </View>
    </Modal>
  );
};
