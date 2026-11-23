// Haushaltsplaner: Vorlagen mit empfohlenem Rhythmus, eigener Rhythmus & Wochentag → automatisch in die To-dos
import React, { useState } from 'react';
import { View } from 'react-native';
import { WeekdayPicker } from '@/components/Inputs';
import { Screen } from '@/components/Screen';
import { Badge, Button, Card, Chip, Confirm, Empty, Field, IconButton, Note, Row, Sheet, ToggleRow, Txt } from '@/components/ui';
import { CHORE_TEMPLATES, INTERVAL_OPTIONS, intervalLabel } from '@/data/chores';
import { relativeLabel, today, WEEKDAYS } from '@/lib/date';
import { nextChoreDate, useStore } from '@/store/useStore';
import { useTheme } from '@/theme/useTheme';
import type { Chore } from '@/types';

export default function Haushalt() {
  const { c } = useTheme();
  const chores = useStore((s) => s.chores);
  const todos = useStore((s) => s.todos);
  const { saveChore, deleteChore, toggleTodo } = useStore();
  const [edit, setEdit] = useState<(Partial<Chore> & { name: string; intervalDays: number; why?: string }) | null>(null);
  const [browse, setBrowse] = useState(false);
  const [del, setDel] = useState<string | null>(null);
  const [error, setError] = useState<string>();
  const rooms = [...new Set(chores.map((x) => x.room))];
  const used = new Set(chores.map((x) => x.name));

  const save = () => {
    if (!edit) return;
    if (!edit.name.trim()) return setError('Wie heißt die Aufgabe?');
    const { why: _why, ...rest } = edit;
    void _why;
    saveChore({ ...rest, name: rest.name.trim() });
    setEdit(null);
    setError(undefined);
  };

  return (
    <Screen title="Haushalt" subtitle="Wiederkehrende Aufgaben, automatisch in deinen To-dos">
      {chores.length === 0 && (
        <Empty icon="sparkles-outline" title="Noch keine Haushaltsroutine" text="Wähle Aufgaben aus der Vorlage – mit empfohlenem Rhythmus. Die App legt die nächste fällige Aufgabe als To-do an." action={<Button title="Vorlagen ansehen" onPress={() => setBrowse(true)} />} />
      )}
      {rooms.map((room) => (
        <View key={room} style={{ gap: 6 }}>
          <Txt weight="800" size={17}>
            {room}
          </Txt>
          {chores.filter((x) => x.room === room).map((ch) => {
            const todo = todos.find((t) => t.id === ch.todoId);
            const due = todo?.due ?? nextChoreDate(ch);
            return (
              <Card key={ch.id} onPress={() => setEdit(ch)} label={`${ch.name} bearbeiten`} style={{ opacity: ch.active ? 1 : 0.5, padding: 12 }}>
                <Row>
                  <View style={{ flex: 1 }}>
                    <Txt weight="700">{ch.name}</Txt>
                    <Txt size={12} muted>{`${intervalLabel(ch.intervalDays)}${ch.weekday ? ' · meist ' + WEEKDAYS[ch.weekday - 1] : ''}${ch.lastDone ? ' · zuletzt ' + relativeLabel(ch.lastDone) : ''}`}</Txt>
                  </View>
                  {ch.active && <Badge text={relativeLabel(due)} bg={due <= today() ? c.warnBg : c.soft} />}
                </Row>
                {ch.active && todo && <Button small kind="secondary" icon="checkmark" title="Erledigt" onPress={() => toggleTodo(todo.id)} />}
              </Card>
            );
          })}
        </View>
      ))}
      <Row>
        <Button title="Aus Vorlagen" icon="list-outline" kind="secondary" onPress={() => setBrowse(true)} style={{ flex: 1 }} />
        <Button title="Eigene Aufgabe" icon="add" onPress={() => setEdit({ name: '', intervalDays: 7, room: 'Wohnung', weekday: null, active: true })} style={{ flex: 1 }} />
      </Row>
      <Note>Empfohlene Rhythmen sind Richtwerte aus Hygiene- und Haushaltsratgebern. Passe sie an deinen Alltag an.</Note>

      <Sheet visible={browse} onClose={() => setBrowse(false)} title="Vorlagen" footer={<Button title="Fertig" onPress={() => setBrowse(false)} />}>
        {[...new Set(CHORE_TEMPLATES.map((t) => t.room))].map((room) => (
          <View key={room} style={{ gap: 6 }}>
            <Txt weight="800">{room}</Txt>
            {CHORE_TEMPLATES.filter((t) => t.room === room).map((t) => (
              <Card key={t.name} tone={used.has(t.name) ? 'ok' : undefined} style={{ padding: 12 }}>
                <Row>
                  <View style={{ flex: 1 }}>
                    <Txt weight="700">{t.name}</Txt>
                    <Txt size={12} muted>{`Empfohlen: ${intervalLabel(t.days)} – ${t.why}`}</Txt>
                  </View>
                  {used.has(t.name) ? <Badge text="aktiv" /> : <IconButton icon="add" label={`${t.name} übernehmen`} onPress={() => { setBrowse(false); setEdit({ name: t.name, room: t.room, intervalDays: t.days, weekday: null, active: true, why: t.why }); }} />}
                </Row>
              </Card>
            ))}
          </View>
        ))}
      </Sheet>

      <Sheet
        visible={!!edit}
        onClose={() => setEdit(null)}
        title={edit?.id ? 'Aufgabe bearbeiten' : 'Neue Haushaltsaufgabe'}
        footer={
          <Row>
            {edit?.id ? <IconButton icon="trash-outline" label="Aufgabe löschen" onPress={() => setDel(edit.id!)} /> : null}
            <Button title="Speichern" onPress={save} style={{ flex: 1 }} />
          </Row>
        }
      >
        {edit && (
          <>
            <Field label="Aufgabe" value={edit.name} onChangeText={(name) => setEdit({ ...edit, name })} error={error} />
            {edit.why ? (
              <Card tone="soft" style={{ padding: 10 }}>
                <Txt size={13}>{`Empfehlung: ${intervalLabel(CHORE_TEMPLATES.find((t) => t.name === edit.name)?.days ?? edit.intervalDays)} – ${edit.why}`}</Txt>
              </Card>
            ) : null}
            <Txt weight="700">Rhythmus</Txt>
            <Row wrap gap={6}>
              {INTERVAL_OPTIONS.map((o) => (
                <Chip key={o.days} label={o.label} selected={edit.intervalDays === o.days} onPress={() => setEdit({ ...edit, intervalDays: o.days })} />
              ))}
            </Row>
            <Txt weight="700">Wann erledigst du das meistens?</Txt>
            <WeekdayPicker multi={false} value={edit.weekday ? [edit.weekday] : []} onChange={(v) => setEdit({ ...edit, weekday: v[0] ?? null })} />
            <Txt size={12} muted>Ab wöchentlichem Rhythmus wird die Aufgabe auf diesen Tag gelegt.</Txt>
            <Txt weight="700">Raum</Txt>
            <Row wrap gap={6}>
              {['Bad', 'Küche', 'Schlafzimmer', 'Wohnung', 'Hauswirtschaft', 'Garten', 'Auto'].map((r) => (
                <Chip key={r} label={r} selected={edit.room === r} onPress={() => setEdit({ ...edit, room: r })} />
              ))}
            </Row>
            {edit.id ? <ToggleRow title="Aktiv" desc="Pausierte Aufgaben erscheinen nicht in den To-dos" value={edit.active ?? true} onChange={(active) => setEdit({ ...edit, active })} /> : null}
          </>
        )}
      </Sheet>
      <Confirm visible={!!del} title="Aufgabe löschen?" text="Das offene To-do wird ebenfalls entfernt." confirm="Löschen" danger onCancel={() => setDel(null)} onConfirm={() => { if (del) deleteChore(del); setDel(null); setEdit(null); }} />
    </Screen>
  );
}
