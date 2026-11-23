// Kalender: Monatsansicht mit Auslastungs-Färbung & Zyklus, Filter, Suche, Arzt-Rhythmus, Priorisierung
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, Pressable, View } from 'react-native';
import { DateField, TimeField } from '@/components/Inputs';
import { Screen } from '@/components/Screen';
import { Badge, Button, Card, Chip, Confirm, Dot, Field, IconButton, Row, Segmented, Sheet, Stepper, ToggleRow, Txt } from '@/components/ui';
import { PHASE_INFO, predict } from '@/lib/cycle';
import { formatLong, monthMatrix, MONTHS, today, WEEKDAYS_SHORT } from '@/lib/date';
import { dayLoad, LOAD_COLORS } from '@/lib/load';
import { useStore } from '@/store/useStore';
import { categoryColors } from '@/theme/colors';
import { useTheme } from '@/theme/useTheme';
import type { CalEvent, EventCategory, Priority } from '@/types';

const CATS: { id: EventCategory; label: string }[] = [
  { id: 'arzt', label: 'Arzt' },
  { id: 'freunde', label: 'Freunde' },
  { id: 'familie', label: 'Familie' },
  { id: 'arbeit', label: 'Arbeit' },
  { id: 'sport', label: 'Sport' },
  { id: 'selbst', label: 'Me-Time' },
  { id: 'sonstiges', label: 'Sonstiges' },
];

export default function Kalender() {
  const { c } = useTheme();
  const params = useLocalSearchParams<{ neu?: string }>();
  const s = useStore();
  const now = new Date();
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [sel, setSel] = useState(today());
  const [hidden, setHidden] = useState<EventCategory[]>([]);
  const [query, setQuery] = useState('');
  const [edit, setEdit] = useState<(Partial<CalEvent> & { title: string; date: string }) | null>(null);
  const [error, setError] = useState<string>();
  const [del, setDel] = useState<string | null>(null);

  useEffect(() => {
    if (params.neu) setEdit({ title: '', date: sel, start: '10:00', category: 'sonstiges', priority: 2, remindMin: 30, notes: '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.neu]);

  const shift = (d: number) => setYm(({ y, m }) => ({ y: m + d < 0 ? y - 1 : m + d > 11 ? y + 1 : y, m: (m + d + 12) % 12 }));
  const shiftRef = useRef(shift);
  shiftRef.current = shift;
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 25 && Math.abs(g.dx) > Math.abs(g.dy) * 2,
      onPanResponderTerminationRequest: () => false,
      onPanResponderRelease: (_, g) => {
        if (g.dx < -60) shiftRef.current(1);
        if (g.dx > 60) shiftRef.current(-1);
      },
    }),
  ).current;

  const cells = monthMatrix(ym.y, ym.m);
  const showCycle = s.settings.modules.zyklus && s.cycle.periods.length > 0;
  const visible = s.events.filter((e) => !hidden.includes(e.category));
  const searchHits = query.trim() ? visible.filter((e) => (e.title + ' ' + e.notes).toLowerCase().includes(query.toLowerCase())).sort((a, b) => a.date.localeCompare(b.date)) : [];
  const dayEvents = visible.filter((e) => e.date === sel).sort((a, b) => a.priority - b.priority || a.start.localeCompare(b.start));
  const dayTodos = s.todos.filter((t) => !t.done && t.due === sel);
  const selLoad = useMemo(() => dayLoad(s, sel), [s, sel]);

  const save = () => {
    if (!edit) return;
    if (!edit.title.trim()) return setError('Bitte gib dem Termin einen Namen.');
    s.saveEvent({ ...edit, title: edit.title.trim() });
    setSel(edit.date);
    setEdit(null);
    setError(undefined);
  };

  return (
    <Screen title={`${MONTHS[ym.m]} ${ym.y}`} right={<Row gap={6}><IconButton icon="chevron-back" label="Vorheriger Monat" onPress={() => shift(-1)} /><IconButton icon="chevron-forward" label="Nächster Monat" onPress={() => shift(1)} /></Row>}>
      <Field label="Termine suchen" value={query} onChangeText={setQuery} placeholder="z. B. Zahnarzt" />
      {searchHits.length > 0 && (
        <Card tone="soft">
          {searchHits.slice(0, 8).map((e) => (
            <Pressable key={e.id} accessibilityRole="button" onPress={() => { setSel(e.date); const d = new Date(e.date); setYm({ y: d.getFullYear(), m: d.getMonth() }); setQuery(''); }} style={{ minHeight: 40, justifyContent: 'center' }}>
              <Txt>{`${e.date.split('-').reverse().join('.')} · ${e.start} · ${e.title}`}</Txt>
            </Pressable>
          ))}
        </Card>
      )}
      <Row wrap gap={6}>
        {CATS.map((k) => (
          <Chip key={k.id} label={k.label} color={categoryColors[k.id]} selected={!hidden.includes(k.id)} onPress={() => setHidden(hidden.includes(k.id) ? hidden.filter((x) => x !== k.id) : [...hidden, k.id])} />
        ))}
      </Row>

      <View {...pan.panHandlers} accessibilityHint="Nach links oder rechts wischen, um den Monat zu wechseln">
        <View style={{ flexDirection: 'row' }}>
          {WEEKDAYS_SHORT.map((w) => (
            <Txt key={w} size={12} weight="700" muted center style={{ flex: 1 }}>
              {w}
            </Txt>
          ))}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {cells.map((d, i) => {
            if (!d) return <View key={i} style={{ width: `${100 / 7}%`, height: 52 }} />;
            const l = dayLoad(s, d);
            const p = showCycle ? predict(s.cycle, d) : null;
            const isPeriod = p && p.cycleDay <= (s.cycle.avgPeriodLen || 5) && p.cycleDay > 0;
            const fertile = p && d >= p.fertileStart && d <= p.fertileEnd;
            const cnt = visible.filter((e) => e.date === d).length;
            return (
              <View key={d} style={{ width: `${100 / 7}%`, padding: 2 }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: d === sel }}
                  accessibilityLabel={`${formatLong(d)}, ${cnt} Termine, ${l.label}${isPeriod ? ', Periode' : ''}${fertile ? ', fruchtbare Tage' : ''}`}
                  onPress={() => setSel(d)}
                  style={{ height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 2, backgroundColor: l.level ? LOAD_COLORS[l.level] : c.card, borderWidth: d === sel ? 2 : 1, borderColor: d === sel ? c.primary : d === today() ? c.text : c.border }}
                >
                  <Txt weight="700" size={14} color={l.level ? '#1F1B2E' : c.text}>
                    {Number(d.slice(8))}
                  </Txt>
                  <Row gap={2}>
                    {isPeriod ? <Dot color="#E11D48" size={6} /> : fertile ? <Dot color="#0D9488" size={6} /> : null}
                    {cnt > 0 ? <Dot color={c.primary} size={5} /> : null}
                  </Row>
                </Pressable>
              </View>
            );
          })}
        </View>
        <Row wrap gap={10} style={{ paddingTop: 6 }}>
          <Row gap={4}><View style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: LOAD_COLORS[2] }} /><Txt size={11}>voll</Txt></Row>
          <Row gap={4}><View style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: LOAD_COLORS[3] }} /><Txt size={11}>zu viel</Txt></Row>
          {showCycle && <Row gap={4}><Dot color="#E11D48" size={8} /><Txt size={11}>Periode (Prognose)</Txt></Row>}
          {showCycle && <Row gap={4}><Dot color="#0D9488" size={8} /><Txt size={11}>fruchtbar</Txt></Row>}
        </Row>
      </View>

      <Row style={{ justifyContent: 'space-between' }}>
        <Txt weight="800" size={17}>{formatLong(sel)}</Txt>
        <Badge text={selLoad.label} bg={selLoad.level >= 2 ? c.warnBg : c.okBg} />
      </Row>
      {selLoad.phase && <Txt size={13} muted>{`${PHASE_INFO[selLoad.phase].name} · ${PHASE_INFO[selLoad.phase].energy}`}</Txt>}
      {selLoad.warning && (
        <Card tone="warn">
          <Txt size={14}>{selLoad.warning}</Txt>
        </Card>
      )}
      {dayEvents.length === 0 && dayTodos.length === 0 && <Txt muted>Keine Termine – freier Tag.</Txt>}
      {dayEvents.map((e) => (
        <Pressable key={e.id} accessibilityRole="button" accessibilityLabel={`${e.title} um ${e.start}, bearbeiten`} onPress={() => setEdit(e)} style={{ flexDirection: 'row', gap: 12, alignItems: 'center', padding: 12, borderRadius: 16, backgroundColor: c.soft, borderLeftWidth: 6, borderLeftColor: categoryColors[e.category] }}>
          <Txt weight="800" style={{ width: 52 }}>
            {e.start}
          </Txt>
          <View style={{ flex: 1 }}>
            <Txt weight="700">{e.title}</Txt>
            <Txt size={12} muted>
              {[CATS.find((k) => k.id === e.category)?.label, e.priority === 1 ? 'wichtig' : null, e.doctorIntervalMonths ? `alle ${e.doctorIntervalMonths} Monate${e.followUpBooked ? ' · Folgetermin steht' : ' · Folgetermin fehlt'}` : null].filter(Boolean).join(' · ')}
            </Txt>
          </View>
          {e.remindMin !== null && <Ionicons name="notifications-outline" size={18} color={c.muted} />}
        </Pressable>
      ))}
      {dayTodos.map((t) => (
        <Row key={t.id} style={{ padding: 12, borderRadius: 16, borderWidth: 1, borderColor: c.border }}>
          <Ionicons name="checkbox-outline" size={20} color={c.primary} />
          <Txt>{t.title}</Txt>
        </Row>
      ))}
      <Button title="Termin hinzufügen" icon="add" onPress={() => setEdit({ title: '', date: sel, start: '10:00', category: 'sonstiges', priority: 2, remindMin: 30, notes: '' })} />

      <Sheet
        visible={!!edit}
        onClose={() => setEdit(null)}
        title={edit?.id ? 'Termin bearbeiten' : 'Neuer Termin'}
        footer={
          <Row>
            {edit?.id ? <IconButton icon="trash-outline" label="Termin löschen" onPress={() => setDel(edit.id!)} /> : null}
            <Button title="Speichern" onPress={save} style={{ flex: 1 }} />
          </Row>
        }
      >
        {edit && (
          <>
            <Field label="Titel" value={edit.title} onChangeText={(title) => setEdit({ ...edit, title })} error={error} placeholder="z. B. Zahnarzt Dr. Weber" />
            <Txt weight="700">Kategorie</Txt>
            <Row wrap gap={6}>
              {CATS.map((k) => (
                <Chip key={k.id} label={k.label} color={categoryColors[k.id]} selected={edit.category === k.id} onPress={() => setEdit({ ...edit, category: k.id })} />
              ))}
            </Row>
            <DateField label="Datum" value={edit.date} onChange={(date) => date && setEdit({ ...edit, date })} />
            <Row>
              <View style={{ flex: 1 }}>
                <TimeField label="Beginn" value={edit.start ?? '10:00'} onChange={(start) => setEdit({ ...edit, start })} />
              </View>
              <View style={{ flex: 1 }}>
                <TimeField label="Ende (optional)" value={edit.end ?? ''} onChange={(end) => setEdit({ ...edit, end })} />
              </View>
            </Row>
            <Txt weight="700">Priorität</Txt>
            <Segmented value={edit.priority ?? 2} onChange={(p) => setEdit({ ...edit, priority: p as Priority })} options={[{ value: 1, label: 'Wichtig' }, { value: 2, label: 'Normal' }, { value: 3, label: 'Optional' }]} />
            <Txt weight="700">Erinnere mich</Txt>
            <Row wrap gap={6}>
              {[{ v: null, l: 'Nicht' }, { v: 15, l: '15 Min.' }, { v: 30, l: '30 Min.' }, { v: 60, l: '1 Std.' }, { v: 1440, l: '1 Tag' }].map((o) => (
                <Chip key={String(o.v)} label={o.l} selected={edit.remindMin === o.v} onPress={() => setEdit({ ...edit, remindMin: o.v })} />
              ))}
            </Row>
            {edit.category === 'arzt' && (
              <Card tone="soft">
                <Txt weight="700">Arzttermin-Rhythmus</Txt>
                <Stepper label="Alle … Monate" value={edit.doctorIntervalMonths ?? 0} onChange={(v) => setEdit({ ...edit, doctorIntervalMonths: v || undefined })} min={0} max={36} />
                <ToggleRow title="Folgetermin ist vereinbart" desc="Sonst erinnere ich dich rechtzeitig daran" value={!!edit.followUpBooked} onChange={(followUpBooked) => setEdit({ ...edit, followUpBooked })} />
              </Card>
            )}
            <Field label="Notiz / Ort" value={edit.notes} onChangeText={(notes) => setEdit({ ...edit, notes })} />
          </>
        )}
      </Sheet>
      <Confirm visible={!!del} title="Termin löschen?" text="Das kann nicht rückgängig gemacht werden." confirm="Löschen" danger onCancel={() => setDel(null)} onConfirm={() => { if (del) s.deleteEvent(del); setDel(null); setEdit(null); }} />
    </Screen>
  );
}
