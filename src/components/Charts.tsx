// Einfache, barrierefreie Diagramme (Balken als Views – mit Textalternative)
import React from 'react';
import { View } from 'react-native';
import { Row, Txt } from '@/components/ui';
import { useTheme } from '@/theme/useTheme';

export const PairBars = ({ data, aLabel, bLabel, aColor, bColor }: { data: { label: string; a: number | null; b: number | null }[]; aLabel: string; bLabel: string; aColor?: string; bColor?: string }) => {
  const { c } = useTheme();
  const ca = aColor ?? c.primary;
  const cb = bColor ?? c.accent;
  const summary = data.map((d) => `${d.label}: ${aLabel} ${d.a ?? 'keine Daten'}, ${bLabel} ${d.b ?? 'keine Daten'}`).join('; ');
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={`Diagramm. ${summary}`} style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 130, gap: 6 }}>
        {data.map((d) => (
          <View key={d.label} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
            <View style={{ height: 110, width: '100%', flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
              <View style={{ flex: 1, height: `${d.a ?? 0}%`, backgroundColor: d.a === null ? 'transparent' : ca, borderTopLeftRadius: 4, borderTopRightRadius: 4, borderWidth: d.a === null ? 1 : 0, borderStyle: 'dashed', borderColor: c.border, minHeight: 2 }} />
              <View style={{ flex: 1, height: `${d.b ?? 0}%`, backgroundColor: cb, borderTopLeftRadius: 4, borderTopRightRadius: 4, minHeight: 2 }} />
            </View>
            <Txt size={10} muted>
              {d.label}
            </Txt>
          </View>
        ))}
      </View>
      <Row gap={14}>
        <Row gap={6}>
          <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: ca }} />
          <Txt size={12}>{aLabel}</Txt>
        </Row>
        <Row gap={6}>
          <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: cb }} />
          <Txt size={12}>{bLabel}</Txt>
        </Row>
      </Row>
    </View>
  );
};

export const HBar = ({ label, value, max = 100, color, suffix = '' }: { label: string; value: number; max?: number; color: string; suffix?: string }) => {
  const { c } = useTheme();
  return (
    <View accessible accessibilityLabel={`${label}: ${value}${suffix}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Txt size={13} style={{ width: 96 }}>
        {label}
      </Txt>
      <View style={{ flex: 1, height: 10, borderRadius: 5, backgroundColor: c.soft, overflow: 'hidden' }}>
        <View style={{ width: `${Math.min(100, (value / max) * 100)}%`, height: 10, backgroundColor: color }} />
      </View>
      <Txt size={13} weight="700" style={{ width: 52, textAlign: 'right' }}>
        {`${value}${suffix}`}
      </Txt>
    </View>
  );
};
