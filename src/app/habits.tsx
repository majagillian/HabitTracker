// Gewohnheiten: Startdatum, Serien, „etabliert“-Fortschritt (66-Tage-Regel), Pausentage, Meilensteine
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { DateField } from '@/components/Inputs';
import { Screen } from '@/components/Screen';
import { Button, Card, Chip, Confirm, Empty, Field, IconButton, Progress, Row, Sheet, Stepper, Txt } from '@/components/ui';
import { formatShort, today } from '@/lib/date';
import { establishment, lastDays, motivation, nextMilestone, streak } from '@/lib/habits';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/theme/useTheme';
import type { Habit } from '@/types';

const COLORS = ['#7C3AED', '#0D9488', '#D97706', '#DB2777', '#2563EB', '#16A34A'];
const IDEAS = ['2 Liter Wasser', '10 Seiten lesen', '20 Min. draußen', '5 Min. Meditation', 'Kein Handy nach 22 Uhr', 'Dehnen am Morgen', 'Obst essen', 'Tagebuch schreiben'];

export default function Habits() {
  const { c } = useTheme();
  const params = useLocalSearchParams<{ neu?: string }>();
  const allHabits = useStore((s) => s.habits);
  const habits = allHabits.filter((h) => !h.archived);
  const freezes = useStore((s) => s.game.freezes);
  const { saveHabit, toggleHabit, pauseHabit, deleteHabit } = useStore();
  const [edit, setEdit] = useState<(Partial<Habit> & { title: string }) | null>(null);
  const [error, setError] = useState<string>();
  const [del, setDel] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (params.neu) setEdit({ title: '', timesPerWeek: 7, startDate: today(), color: COLORS[0] });
  }, [params.neu]);

  const save = () => {
    if (!edit) return;
    if (!edit.title.trim()) return setError('Bitte gib der Gewohnheit einen Namen.');
    saveHabit({ ...edit, title: edit.title.trim() });
    setEdit(null);
    setError(undefined);
  };

  return (
    <Screen title="Gewohnheiten" subtitle="Eine neue Gewohnheit braucht im Schnitt rund zwei Monate.">
      {habits.length === 0 && <Empty icon="repeat-outline" title="Noch keine Gewohnheit" text="Starte klein – eine Sache, die du jeden Tag schaffen kannst." />}
      {habits.map((h) => {
        const st = streak(h);
        const est = establishment(h);
        const done = h.log.includes(today());
        return (
          <Card key={h.id}>
            <Row>
              <Pressable accessibilityRole="button" accessibilityLabel={`${h.title} bearbeiten`} onPress={() => setEdit(h)} style={{ flex: 1 }}>
                <Txt weight="800" size={16}>
                  {h.title}
                </Txt>
                <Txt size={12} muted>{`Seit ${formatShort(h.startDate)} · ${h.timesPerWeek >= 7 ? 'täglich' : `${h.timesPerWeek}× pro Woche`}`}</Txt>
              </Pressable>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: done }}
                accessibilityLabel={`${h.title} heute erledigt`}
                onPress={() => toggleHabit(h.id)}
                style={{ width: 56, height: 56, borderRadius: 28, borderWidth: 3, borderColor: h.color, backgroundColor: done ? h.color : 'transparent', alignItems: 'center', justifyContent: 'center' }}
              >
                {done && <Ionicons name="checkmark" size={30} color="#FFFFFF" />}
              </Pressable>
            </Row>
            <View accessible accessibilityLabel={`Letzte 14 Tage: ${lastDays(h).filter((d) => d.done).length} erledigt`} style={{ flexDirection: 'row', gap: 4 }}>
              {lastDays(h).map((d) => (
                <View key={d.date} style={{ flex: 1, height: 18, borderRadius: 5, backgroundColor: d.done ? h.color : d.paused ? c.accent : c.soft, opacity: d.done && d.date !== today() ? 0.7 : 1 }} />
              ))}
            </View>
            <Row style={{ justifyContent: 'space-between' }}>
              <Txt weight="700" size={14}>{`Serie: ${st.value} ${st.unit}`}</Txt>
              <Txt size={13} muted>{`Nächster Meilenstein: ${nextMilestone(st.value)}`}</Txt>
            </Row>
            <Progress value={est} label="Etabliert" />
            <Txt size={13}>{`Etabliert zu ${est} % – ${motivation(h)}`}</Txt>
            {!done && (
              <Button
                small
                kind="secondary"
                icon="snow-outline"
                title={`Pausentag nutzen (${freezes} übrig)`}
                onPress={() => setMsg(pauseHabit(h.id) ? 'Pausentag gesetzt – deine Serie bleibt erhalten.' : 'Diesen Monat sind keine Pausentage mehr übrig.')}
              />
            )}
          </Card>
        );
      })}
      {msg && (
        <Card tone="warn">
          <Txt>{msg}</Txt>
        </Card>
      )}
      <Button title="Neue Gewohnheit" icon="add" onPress={() => setEdit({ title: '', timesPerWeek: 7, startDate: today(), color: COLORS[habits.length % COLORS.length] })} />
      <Txt size={12} muted>
        Pausentage (2 pro Monat) schützen deine Serie, wenn du krank oder unterwegs bist. Rückschläge gehören dazu – wichtig ist, am nächsten Tag weiterzumachen.
      </Txt>

      <Sheet
        visible={!!edit}
        onClose={() => setEdit(null)}
        title={edit?.id ? 'Gewohnheit bearbeiten' : 'Neue Gewohnheit'}
        footer={
          <Row>
            {edit?.id ? <IconButton icon="trash-outline" label="Gewohnheit löschen" onPress={() => setDel(edit.id!)} /> : null}
            <Button title="Speichern" onPress={save} style={{ flex: 1 }} />
          </Row>
        }
      >
        {edit && (
          <>
            <Field label="Gewohnheit" value={edit.title} onChangeText={(title) => setEdit({ ...edit, title })} error={error} placeholder="z. B. 10 Seiten lesen" />
            {!edit.id && (
              <Row wrap gap={6}>
                {IDEAS.map((x) => (
                  <Chip key={x} label={x} onPress={() => setEdit({ ...edit, title: x })} />
                ))}
              </Row>
            )}
            <DateField label="Gestartet am" value={edit.startDate} onChange={(startDate) => startDate && setEdit({ ...edit, startDate })} quick={false} />
            <Stepper label="Wie oft pro Woche?" value={edit.timesPerWeek ?? 7} onChange={(timesPerWeek) => setEdit({ ...edit, timesPerWeek })} min={1} max={7} suffix="×" />
            <Txt weight="700">Farbe</Txt>
            <Row gap={10}>
              {COLORS.map((col) => (
                <Pressable key={col} accessibilityRole="button" accessibilityLabel={`Farbe ${col}`} accessibilityState={{ selected: edit.color === col }} onPress={() => setEdit({ ...edit, color: col })} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: col, borderWidth: edit.color === col ? 4 : 0, borderColor: c.text }} />
              ))}
            </Row>
          </>
        )}
      </Sheet>
      <Confirm visible={!!del} title="Gewohnheit löschen?" text="Der Verlauf geht dabei verloren." confirm="Löschen" danger onCancel={() => setDel(null)} onConfirm={() => { if (del) deleteHabit(del); setDel(null); setEdit(null); }} />
    </Screen>
  );
}
