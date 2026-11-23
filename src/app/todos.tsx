// To-dos: Priorität, Fälligkeit, Eisenhower-Matrix, Teilaufgaben, Energie-Aufwand, Wiederholung
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { DateField } from '@/components/Inputs';
import { Screen } from '@/components/Screen';
import { Badge, Button, Card, Chip, Confirm, Empty, Field, IconButton, Row, Segmented, Sheet, ToggleRow, Txt } from '@/components/ui';
import { addDays, relativeLabel, today } from '@/lib/date';
import { uid } from '@/lib/id';
import { useStore } from '@/store/useStore';
import { priorityColors } from '@/theme/colors';
import { useTheme } from '@/theme/useTheme';
import type { Energy, Priority, Repeat, Todo } from '@/types';

type Filter = 'heute' | 'woche' | 'alle' | 'ueberfaellig' | 'erledigt';
const AREAS = ['Allgemein', 'Arbeit', 'Privat', 'Haushalt', 'Gesundheit', 'Finanzen', 'Familie', 'Freunde', 'Uni/Schule'];
const PRIO_LABEL = { 1: 'Hoch', 2: 'Mittel', 3: 'Niedrig' } as const;
const ENERGY_LABEL = { 1: 'Wenig Energie', 2: 'Mittel', 3: 'Viel Energie' } as const;

const emptyTodo = (): Partial<Todo> & { title: string } => ({ title: '', notes: '', priority: 2, energy: 2, area: 'Allgemein', important: false, urgent: false, subtasks: [], repeat: 'keine', due: today() });

export default function Todos() {
  const { c } = useTheme();
  const params = useLocalSearchParams<{ neu?: string }>();
  const todos = useStore((s) => s.todos);
  const { saveTodo, toggleTodo, toggleSubtask, postponeTodo, deleteTodo } = useStore();
  const [filter, setFilter] = useState<Filter>('heute');
  const [view, setView] = useState<'liste' | 'matrix'>('liste');
  const [edit, setEdit] = useState<(Partial<Todo> & { title: string }) | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [newSub, setNewSub] = useState('');
  const [del, setDel] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (params.neu) setEdit(emptyTodo());
  }, [params.neu]);

  const t0 = today();
  const counts = useMemo(
    () => ({
      heute: todos.filter((t) => !t.done && t.due && t.due <= t0).length,
      woche: todos.filter((t) => !t.done && t.due && t.due <= addDays(t0, 7)).length,
      ueberfaellig: todos.filter((t) => !t.done && t.due && t.due < t0).length,
    }),
    [todos, t0],
  );
  const list = useMemo(() => {
    let l = todos.filter((t) => {
      if (filter === 'erledigt') return t.done;
      if (t.done) return false;
      if (filter === 'heute') return !!t.due && t.due <= t0;
      if (filter === 'woche') return !!t.due && t.due <= addDays(t0, 7);
      if (filter === 'ueberfaellig') return !!t.due && t.due < t0;
      return true;
    });
    if (query.trim()) l = l.filter((t) => (t.title + ' ' + t.notes + ' ' + t.area).toLowerCase().includes(query.toLowerCase()));
    return l.sort((a, b) => a.priority - b.priority || (a.due ?? '9999').localeCompare(b.due ?? '9999'));
  }, [todos, filter, t0, query]);

  const save = () => {
    if (!edit) return;
    if (!edit.title.trim()) return setError('Bitte gib dem To-do einen Namen.');
    saveTodo({ ...edit, title: edit.title.trim() });
    setEdit(null);
    setError(undefined);
  };

  const quadrant = (imp: boolean, urg: boolean) => todos.filter((t) => !t.done && t.important === imp && t.urgent === urg);

  return (
    <Screen
      title="To-dos"
      right={<Segmented value={view} onChange={setView} options={[{ value: 'liste', label: 'Liste' }, { value: 'matrix', label: 'Matrix' }]} />}
    >
      <Field label="Suchen" value={query} onChangeText={setQuery} placeholder="To-dos durchsuchen" />
      <Row wrap gap={6}>
        <Chip label={`Heute ${counts.heute}`} selected={filter === 'heute'} onPress={() => setFilter('heute')} />
        <Chip label={`Woche ${counts.woche}`} selected={filter === 'woche'} onPress={() => setFilter('woche')} />
        <Chip label="Alle" selected={filter === 'alle'} onPress={() => setFilter('alle')} />
        {counts.ueberfaellig > 0 && <Chip label={`Überfällig ${counts.ueberfaellig}`} color={c.danger} selected={filter === 'ueberfaellig'} onPress={() => setFilter('ueberfaellig')} />}
        <Chip label="Erledigt" selected={filter === 'erledigt'} onPress={() => setFilter('erledigt')} />
      </Row>

      {view === 'matrix' ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {[
            { t: 'Wichtig & dringend', s: 'Sofort erledigen', imp: true, urg: true, bg: '#FDE7EC' },
            { t: 'Wichtig, nicht dringend', s: 'Einplanen', imp: true, urg: false, bg: '#F3EEFF' },
            { t: 'Dringend, nicht wichtig', s: 'Abgeben oder kurz halten', imp: false, urg: true, bg: '#FFF1E5' },
            { t: 'Weder noch', s: 'Später oder streichen', imp: false, urg: false, bg: '#E6FFF6' },
          ].map((q) => (
            <View key={q.t} style={{ width: '48%', minHeight: 150, borderRadius: 18, backgroundColor: q.bg, padding: 12, gap: 4 }}>
              <Txt weight="800" size={14} color="#1F1B2E">
                {q.t}
              </Txt>
              <Txt size={12} color="#5B5670">
                {q.s}
              </Txt>
              {quadrant(q.imp, q.urg).map((t) => (
                <Pressable key={t.id} accessibilityRole="button" onPress={() => setEdit(t)} style={{ paddingVertical: 4 }}>
                  <Txt size={14} color="#1F1B2E">{`• ${t.title}`}</Txt>
                </Pressable>
              ))}
            </View>
          ))}
          <Txt size={12} muted>
            Lege die Matrix-Felder beim Bearbeiten über „Wichtig“ und „Dringend“ fest.
          </Txt>
        </View>
      ) : list.length === 0 ? (
        <Empty icon="sparkles-outline" title={filter === 'erledigt' ? 'Noch nichts erledigt' : 'Alles erledigt!'} text={filter === 'erledigt' ? 'Abgehakte Aufgaben erscheinen hier.' : 'Genieß den freien Kopf – oder lege ein neues To-do an.'} />
      ) : (
        list.map((t) => {
          const subDone = t.subtasks.filter((x) => x.done).length;
          const overdue = !t.done && t.due && t.due < t0;
          return (
            <Card key={t.id} style={{ borderLeftWidth: 6, borderLeftColor: priorityColors[t.priority], padding: 12 }}>
              <Row style={{ alignItems: 'flex-start' }}>
                <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: t.done }} accessibilityLabel={`${t.title} erledigt`} onPress={() => toggleTodo(t.id)} hitSlop={8} style={{ width: 34, height: 34, borderRadius: 10, borderWidth: 2, borderColor: c.primary, backgroundColor: t.done ? c.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                  {t.done && <Ionicons name="checkmark" size={20} color={c.onPrimary} />}
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel={`${t.title} bearbeiten`} onPress={() => setOpen(open === t.id ? null : t.id)} style={{ flex: 1, gap: 4 }}>
                  <Txt weight="700" style={{ textDecorationLine: t.done ? 'line-through' : 'none' }}>
                    {t.title}
                  </Txt>
                  <Txt size={12} color={overdue ? c.danger : c.muted}>
                    {[t.due ? relativeLabel(t.due) : 'Ohne Datum', t.subtasks.length ? `${subDone}/${t.subtasks.length} Teilaufgaben` : null, t.repeat !== 'keine' ? 'wiederkehrend' : null].filter(Boolean).join(' · ')}
                  </Txt>
                  <Row wrap gap={6}>
                    <Badge text={`Priorität ${PRIO_LABEL[t.priority]}`} />
                    <Badge text={ENERGY_LABEL[t.energy]} bg={c.okBg} />
                    <Badge text={t.area} bg={c.warnBg} />
                  </Row>
                </Pressable>
              </Row>
              {open === t.id && (
                <View style={{ gap: 6, paddingTop: 6 }}>
                  {t.notes ? <Txt size={14}>{t.notes}</Txt> : null}
                  {t.subtasks.map((st) => (
                    <Pressable key={st.id} accessibilityRole="checkbox" accessibilityState={{ checked: st.done }} onPress={() => toggleSubtask(t.id, st.id)} style={{ flexDirection: 'row', gap: 8, alignItems: 'center', minHeight: 40 }}>
                      <Ionicons name={st.done ? 'checkbox' : 'square-outline'} size={22} color={c.primary} />
                      <Txt style={{ textDecorationLine: st.done ? 'line-through' : 'none' }}>{st.title}</Txt>
                    </Pressable>
                  ))}
                  <Row wrap gap={8}>
                    {!t.done && <Button small kind="secondary" icon="arrow-forward" title="Auf morgen" onPress={() => postponeTodo(t.id)} />}
                    <Button small kind="secondary" icon="create-outline" title="Bearbeiten" onPress={() => setEdit(t)} />
                    <IconButton icon="trash-outline" label="To-do löschen" onPress={() => setDel(t.id)} />
                  </Row>
                </View>
              )}
            </Card>
          );
        })
      )}
      <Button title="Neues To-do" icon="add" onPress={() => setEdit(emptyTodo())} />

      <Sheet visible={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'To-do bearbeiten' : 'Neues To-do'} footer={<Button title="Speichern" onPress={save} />}>
        {edit && (
          <>
            <Field label="Was ist zu tun?" value={edit.title} onChangeText={(title) => setEdit({ ...edit, title })} error={error} autoFocus={!edit.id} />
            <DateField label="Fällig am" value={edit.due} onChange={(due) => setEdit({ ...edit, due })} optional />
            <Txt weight="700">Priorität</Txt>
            <Segmented value={edit.priority ?? 2} onChange={(p) => setEdit({ ...edit, priority: p as Priority })} options={[{ value: 1, label: 'Hoch' }, { value: 2, label: 'Mittel' }, { value: 3, label: 'Niedrig' }]} />
            <ToggleRow title="Wichtig" desc="Bringt dich deinen Zielen näher" value={!!edit.important} onChange={(important) => setEdit({ ...edit, important })} />
            <ToggleRow title="Dringend" desc="Hat eine nahe Frist" value={!!edit.urgent} onChange={(urgent) => setEdit({ ...edit, urgent })} />
            <Txt weight="700">Wie viel Energie kostet es?</Txt>
            <Segmented value={edit.energy ?? 2} onChange={(e) => setEdit({ ...edit, energy: e as Energy })} options={[{ value: 1, label: 'Wenig' }, { value: 2, label: 'Mittel' }, { value: 3, label: 'Viel' }]} />
            <Txt weight="700">Bereich</Txt>
            <Row wrap gap={6}>
              {AREAS.map((a) => (
                <Chip key={a} label={a} selected={edit.area === a} onPress={() => setEdit({ ...edit, area: a })} />
              ))}
            </Row>
            <Txt weight="700">Wiederholen</Txt>
            <Segmented value={edit.repeat ?? 'keine'} onChange={(r) => setEdit({ ...edit, repeat: r as Repeat })} options={[{ value: 'keine', label: 'Nein' }, { value: 'taeglich', label: 'Täglich' }, { value: 'woechentlich', label: 'Wöchentl.' }, { value: 'monatlich', label: 'Monatl.' }]} />
            <Txt weight="700">Teilaufgaben</Txt>
            {(edit.subtasks ?? []).map((st) => (
              <Row key={st.id}>
                <Txt style={{ flex: 1 }}>{`• ${st.title}`}</Txt>
                <IconButton icon="close" label="Teilaufgabe entfernen" onPress={() => setEdit({ ...edit, subtasks: edit.subtasks!.filter((x) => x.id !== st.id) })} />
              </Row>
            ))}
            <Row>
              <View style={{ flex: 1 }}>
                <Field label="Neue Teilaufgabe" value={newSub} onChangeText={setNewSub} placeholder="z. B. Unterlagen sammeln" />
              </View>
              <IconButton
                icon="add"
                label="Teilaufgabe hinzufügen"
                onPress={() => {
                  if (!newSub.trim()) return;
                  setEdit({ ...edit, subtasks: [...(edit.subtasks ?? []), { id: uid(), title: newSub.trim(), done: false }] });
                  setNewSub('');
                }}
              />
            </Row>
            <Field label="Notiz" value={edit.notes} onChangeText={(notes) => setEdit({ ...edit, notes })} multiline />
          </>
        )}
      </Sheet>
      <Confirm visible={!!del} title="To-do löschen?" text="Das kann nicht rückgängig gemacht werden." confirm="Löschen" danger onCancel={() => setDel(null)} onConfirm={() => { if (del) deleteTodo(del); setDel(null); }} />
    </Screen>
  );
}
