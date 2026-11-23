// Medikamentenplan: Einnahmezeiten, Tage/Intervall, Erinnerungen, Einnahmetreue, Vorrat
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { DateField, TimeField, WeekdayPicker } from '@/components/Inputs';
import { Screen } from '@/components/Screen';
import { Badge, Button, Card, Chip, Confirm, Empty, Field, IconButton, Note, Row, Segmented, Sheet, Stepper, ToggleRow, Txt } from '@/components/ui';
import { formatLong, today, WEEKDAYS_SHORT } from '@/lib/date';
import { adherence, daysLeft, dosesOn, WITH_FOOD } from '@/lib/meds';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/theme/useTheme';
import type { Medication } from '@/types';

type Edit = Partial<Medication> & { name: string };

export default function Medikamente() {
  const { c } = useTheme();
  const s = useStore();
  const [edit, setEdit] = useState<Edit | null>(null);
  const [error, setError] = useState<string>();
  const [newTime, setNewTime] = useState('20:00');
  const [del, setDel] = useState<string | null>(null);
  const doses = dosesOn(s.meds, s.medLog, today());
  const adh = adherence(s.meds, s.medLog);

  const save = () => {
    if (!edit) return;
    if (!edit.name.trim()) return setError('Bitte den Namen des Medikaments eingeben.');
    if (!edit.times?.length) return setError('Bitte mindestens eine Einnahmezeit festlegen.');
    s.saveMed({ ...edit, name: edit.name.trim() });
    setEdit(null);
    setError(undefined);
  };

  return (
    <Screen title="Medikamente" subtitle={formatLong(today())}>
      {s.meds.length === 0 && <Empty icon="medkit-outline" title="Noch kein Medikament" text="Lege deinen Einnahmeplan an – die App erinnert dich zuverlässig." />}
      {doses.length > 0 && (
        <>
          <Txt weight="800" size={17}>
            Heute
          </Txt>
          {doses.map((d) => (
            <Card key={d.key} tone={d.status === 'genommen' ? 'ok' : undefined} style={{ padding: 12 }}>
              <Row>
                <Txt weight="800" style={{ width: 52 }}>
                  {d.time}
                </Txt>
                <View style={{ flex: 1 }}>
                  <Txt weight="700">{d.med.name}</Txt>
                  <Txt size={12} muted>{`${d.med.dose}${d.med.withFood !== 'egal' ? ' · ' + WITH_FOOD[d.med.withFood] : ''}`}</Txt>
                </View>
                {d.status && <Badge text={d.status} bg={d.status === 'genommen' ? c.secondary : c.warnBg} color="#1F1B2E" />}
              </Row>
              <Row>
                <Button small title="Genommen" icon="checkmark" kind={d.status === 'genommen' ? 'primary' : 'secondary'} onPress={() => s.logMed(d.key, d.status === 'genommen' ? null : 'genommen')} style={{ flex: 1 }} />
                <Button small title="Ausgelassen" kind="secondary" onPress={() => s.logMed(d.key, d.status === 'ausgelassen' ? null : 'ausgelassen')} style={{ flex: 1 }} />
              </Row>
            </Card>
          ))}
        </>
      )}
      {adh !== null && (
        <Card tone="soft">
          <Txt weight="800">{`Einnahmetreue (14 Tage): ${adh} %`}</Txt>
          <Txt size={13} muted>
            {adh >= 90 ? 'Sehr zuverlässig – stark!' : 'Tipp: Kopple die Einnahme an eine feste Routine, z. B. Zähneputzen.'}
          </Txt>
        </Card>
      )}
      {s.meds.length > 0 && (
        <Txt weight="800" size={17}>
          Dein Plan
        </Txt>
      )}
      {s.meds.map((m) => {
        const left = daysLeft(m);
        return (
          <Pressable key={m.id} accessibilityRole="button" accessibilityLabel={`${m.name} bearbeiten`} onPress={() => setEdit(m)} style={{ padding: 12, borderRadius: 16, borderWidth: 1, borderColor: c.border, gap: 4, opacity: m.active ? 1 : 0.5 }}>
            <Row>
              <Ionicons name="medical-outline" size={20} color={c.primary} />
              <Txt weight="700" style={{ flex: 1 }}>{`${m.name} · ${m.dose}`}</Txt>
              {!m.remind && <Ionicons name="notifications-off-outline" size={18} color={c.muted} />}
            </Row>
            <Txt size={13} muted>{`${m.times.join(', ')} · ${m.everyNDays && m.everyNDays > 1 ? `alle ${m.everyNDays} Tage` : m.days.length ? m.days.map((d) => WEEKDAYS_SHORT[d - 1]).join(', ') : 'täglich'}${m.end ? ` · bis ${m.end.split('-').reverse().join('.')}` : ''}`}</Txt>
            {left !== null && <Txt size={13} color={left <= m.refillWarnDays ? c.danger : c.muted}>{`Vorrat: ${m.stock} Stück · reicht ca. ${left} Tage`}</Txt>}
          </Pressable>
        );
      })}
      <Button title="Medikament hinzufügen" icon="add" onPress={() => setEdit({ name: '', dose: '1 Tablette', times: ['08:00'], days: [], start: today(), withFood: 'egal', perDose: 1, refillWarnDays: 7, notes: '', remind: true, active: true })} />
      <ToggleRow title="Erinnerungen an Einnahmen" value={s.settings.notifications.medikamente.on} onChange={(on) => s.setNotif('medikamente', { on })} />
      <Note>Die App ersetzt keine ärztliche oder pharmazeutische Beratung. Ändere Dosierungen nur in Absprache mit deiner Ärztin oder deinem Arzt.</Note>

      <Sheet
        visible={!!edit}
        onClose={() => setEdit(null)}
        title={edit?.id ? 'Medikament bearbeiten' : 'Neues Medikament'}
        footer={
          <Row>
            {edit?.id ? <IconButton icon="trash-outline" label="Medikament löschen" onPress={() => setDel(edit.id!)} /> : null}
            <Button title="Speichern" onPress={save} style={{ flex: 1 }} />
          </Row>
        }
      >
        {edit && (
          <>
            <Field label="Name" value={edit.name} onChangeText={(name) => setEdit({ ...edit, name })} error={error} placeholder="z. B. Vitamin D, L-Thyroxin" />
            <Field label="Dosis" value={edit.dose} onChangeText={(dose) => setEdit({ ...edit, dose })} placeholder="z. B. 1 Tablette, 400 mg" />
            <Txt weight="700">Einnahmezeiten</Txt>
            <Row wrap gap={6}>
              {(edit.times ?? []).map((t) => (
                <Chip key={t} label={`${t} ✕`} selected onPress={() => setEdit({ ...edit, times: edit.times!.filter((x) => x !== t) })} />
              ))}
            </Row>
            <Row>
              <View style={{ flex: 1 }}>
                <TimeField label="Weitere Uhrzeit" value={newTime} onChange={setNewTime} />
              </View>
              <IconButton icon="add" label="Uhrzeit hinzufügen" onPress={() => !edit.times?.includes(newTime) && setEdit({ ...edit, times: [...(edit.times ?? []), newTime].sort() })} />
            </Row>
            <Txt weight="700">Wann?</Txt>
            <Segmented
              value={edit.everyNDays && edit.everyNDays > 1 ? 'intervall' : edit.days?.length ? 'tage' : 'taeglich'}
              onChange={(v) => setEdit({ ...edit, everyNDays: v === 'intervall' ? 2 : undefined, days: v === 'tage' ? [1, 3, 5] : [] })}
              options={[{ value: 'taeglich', label: 'Täglich' }, { value: 'tage', label: 'Wochentage' }, { value: 'intervall', label: 'Alle x Tage' }]}
            />
            {!!edit.days?.length && <WeekdayPicker value={edit.days} onChange={(days) => setEdit({ ...edit, days })} />}
            {!!edit.everyNDays && edit.everyNDays > 1 && <Stepper label="Alle … Tage" value={edit.everyNDays} onChange={(everyNDays) => setEdit({ ...edit, everyNDays })} min={2} max={60} />}
            <DateField label="Ab" value={edit.start} onChange={(start) => start && setEdit({ ...edit, start })} quick={false} />
            <DateField label="Bis (optional, z. B. Antibiotikum)" value={edit.end} onChange={(end) => setEdit({ ...edit, end })} quick={false} optional />
            <Txt weight="700">Einnahme</Txt>
            <Row wrap gap={6}>
              {(Object.keys(WITH_FOOD) as (keyof typeof WITH_FOOD)[]).map((k) => (
                <Chip key={k} label={WITH_FOOD[k]} selected={edit.withFood === k} onPress={() => setEdit({ ...edit, withFood: k })} />
              ))}
            </Row>
            <ToggleRow title="Vorrat verfolgen" value={edit.stock !== undefined} onChange={(on) => setEdit({ ...edit, stock: on ? 30 : undefined })} />
            {edit.stock !== undefined && (
              <>
                <Stepper label="Vorrat (Stück)" value={edit.stock} onChange={(stock) => setEdit({ ...edit, stock })} min={0} max={1000} />
                <Stepper label="Pro Einnahme" value={edit.perDose ?? 1} onChange={(perDose) => setEdit({ ...edit, perDose })} min={1} max={10} />
                <Stepper label="Warnen, wenn Vorrat unter" value={edit.refillWarnDays ?? 7} onChange={(refillWarnDays) => setEdit({ ...edit, refillWarnDays })} min={1} max={30} suffix=" Tage" />
              </>
            )}
            <ToggleRow title="An Einnahme erinnern" value={edit.remind ?? true} onChange={(remind) => setEdit({ ...edit, remind })} />
            {edit.id ? <ToggleRow title="Aktiv" value={edit.active ?? true} onChange={(active) => setEdit({ ...edit, active })} /> : null}
            <Field label="Notiz" value={edit.notes} onChangeText={(notes) => setEdit({ ...edit, notes })} placeholder="z. B. nicht mit Milch einnehmen" />
          </>
        )}
      </Sheet>
      <Confirm visible={!!del} title="Medikament löschen?" text="Der Plan und die Erinnerungen werden entfernt." confirm="Löschen" danger onCancel={() => setDel(null)} onConfirm={() => { if (del) s.deleteMed(del); setDel(null); setEdit(null); }} />
    </Screen>
  );
}
