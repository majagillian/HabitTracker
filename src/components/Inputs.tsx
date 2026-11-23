// Eingabefelder für Datum und Uhrzeit (deutsches Format, mit klaren Fehlermeldungen)
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Chip, Field, Row } from '@/components/ui';
import { addDays, formatShort, isValidISO, isValidTime, today, WEEKDAYS_SHORT } from '@/lib/date';
import type { ISODate } from '@/types';

const isoToDe = (iso?: string) => (iso ? iso.split('-').reverse().join('.') : '');
const deToIso = (de: string): string | null => {
  const m = de.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/);
  if (!m) return null;
  const y = m[3].length === 2 ? '20' + m[3] : m[3];
  const iso = `${y}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return isValidISO(iso) && new Date(iso).getDate() === Number(m[1]) ? iso : null;
};

export const DateField = ({ label, value, onChange, quick = true, optional }: { label: string; value?: ISODate; onChange: (v: ISODate | undefined) => void; quick?: boolean; optional?: boolean }) => {
  const [text, setText] = useState(isoToDe(value));
  const [error, setError] = useState<string | undefined>();
  useEffect(() => setText(isoToDe(value)), [value]);
  const commit = (t: string) => {
    setText(t);
    if (!t.trim()) {
      setError(optional ? undefined : 'Bitte ein Datum eingeben.');
      if (optional) onChange(undefined);
      return;
    }
    const iso = deToIso(t);
    if (iso) {
      setError(undefined);
      onChange(iso);
    } else setError('Bitte im Format TT.MM.JJJJ eingeben, z. B. 24.12.2026.');
  };
  return (
    <View style={{ gap: 8 }}>
      <Field label={label} value={text} onChangeText={commit} placeholder="TT.MM.JJJJ" keyboardType="numbers-and-punctuation" error={error} />
      {quick && (
        <Row wrap gap={6}>
          {[0, 1, 2, 7].map((n) => {
            const d = addDays(today(), n);
            return <Chip key={n} label={n === 0 ? 'Heute' : n === 1 ? 'Morgen' : n === 7 ? 'In 1 Woche' : formatShort(d)} selected={value === d} onPress={() => onChange(d)} />;
          })}
        </Row>
      )}
    </View>
  );
};

export const TimeField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => {
  const [text, setText] = useState(value);
  const [error, setError] = useState<string | undefined>();
  useEffect(() => setText(value), [value]);
  return (
    <Field
      label={label}
      value={text}
      placeholder="HH:MM"
      keyboardType="numbers-and-punctuation"
      error={error}
      onChangeText={(t) => {
        setText(t);
        const norm = t.replace('.', ':').padStart(5, '0');
        if (isValidTime(norm)) {
          setError(undefined);
          onChange(norm);
        } else setError('Bitte als Uhrzeit eingeben, z. B. 08:30.');
      }}
    />
  );
};

export const WeekdayPicker = ({ value, onChange, multi = true }: { value: number[]; onChange: (v: number[]) => void; multi?: boolean }) => (
  <Row wrap gap={6}>
    {WEEKDAYS_SHORT.map((d, i) => {
      const wd = i + 1;
      const sel = value.includes(wd);
      return <Chip key={d} label={d} selected={sel} onPress={() => onChange(multi ? (sel ? value.filter((x) => x !== wd) : [...value, wd].sort()) : sel ? [] : [wd])} />;
    })}
  </Row>
);
