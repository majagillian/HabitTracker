// Fitness: Trainingsprogramme mit Übersicht & Anleitung, Begleitung durch Vorturner:in, Trainingsplan, Kurse, zyklusbasierte Empfehlung
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { TimeField, WeekdayPicker } from '@/components/Inputs';
import { Screen } from '@/components/Screen';
import { TrainerFigure } from '@/components/TrainerFigure';
import { WorkoutPlayer } from '@/components/WorkoutPlayer';
import { Badge, Button, Card, Chip, Field, IconButton, Note, Row, Segmented, Sheet, Stepper, ToggleRow, Txt } from '@/components/ui';
import { EXERCISES } from '@/data/exercises';
import { CATEGORY_LABEL, scaleBlock, WORKOUTS, workoutMinutes, type Workout } from '@/data/workouts';
import { PHASE_INFO, predict } from '@/lib/cycle';
import { addDays, formatShort, today, weekday, WEEKDAYS } from '@/lib/date';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/theme/useTheme';

export default function Fitness() {
  const { c } = useTheme();
  const s = useStore();
  const [tab, setTab] = useState<'training' | 'plan' | 'verlauf'>('training');
  const [level, setLevel] = useState<1 | 2 | 3>(1);
  const [preview, setPreview] = useState<Workout | null>(null);
  const [open, setOpen] = useState<number | null>(0);
  const [playing, setPlaying] = useState<Workout | null>(null);
  const [planEdit, setPlanEdit] = useState<{ title: string; days: number[]; time: string; workoutId?: string; addToCalendar: boolean } | null>(null);
  const [course, setCourse] = useState<{ title: string; minutes: number } | null>(null);
  const phase = s.settings.modules.zyklus && s.settings.cycleBasedTraining ? predict(s.cycle)?.phase : undefined;

  if (playing) {
    return (
      <Screen title="Training" footer={<View />}>
        <WorkoutPlayer
          workout={playing}
          level={level}
          gender={s.profile.gender}
          onCancel={() => setPlaying(null)}
          onFinish={(minutes) => {
            s.addSession({ date: today(), title: playing.name, workoutId: playing.id, minutes, type: 'home' });
            setPlaying(null);
          }}
        />
      </Screen>
    );
  }

  if (preview) {
    const blocks = preview.blocks.map((b) => scaleBlock(b, level));
    // gleiche Übungen nacheinander zusammenfassen (z. B. Sonnengruß-Runden)
    const unique = blocks.filter((b, i) => blocks.findIndex((x) => x.ex === b.ex && x.phase === b.phase) === i);
    return (
      <Screen
        title={preview.name}
        subtitle={`${CATEGORY_LABEL[preview.category]} · ca. ${workoutMinutes(preview, level)} Min. · ${preview.focus}`}
        footer={
          <Row>
            <Button title="Zurück" kind="secondary" onPress={() => setPreview(null)} style={{ flex: 1 }} />
            <Button title="Training starten" icon="play" onPress={() => { setPlaying(preview); setPreview(null); }} style={{ flex: 2 }} />
          </Row>
        }
      >
        <Txt>{preview.description}</Txt>
        <Segmented value={level} onChange={setLevel} options={[{ value: 1, label: 'Anfänger' }, { value: 2, label: 'Mittel' }, { value: 3, label: 'Fortgeschritten' }]} />
        <Card tone="soft">
          <Txt weight="800">Warum so aufgebaut?</Txt>
          <Txt size={14}>{preview.science}</Txt>
        </Card>
        <Txt weight="800" size={17}>{`Diese ${unique.length} Übungen erwarten dich`}</Txt>
        {unique.map((b, i) => {
          const ex = EXERCISES[b.ex];
          const isOpen = open === i;
          const amount = b.breaths ? `${b.breaths} ${b.breaths === 1 ? 'Atemzug' : 'Atemzüge'}` : b.sec ? `${b.sec} s` : `${b.reps} Wdh.`;
          return (
            <Card key={b.ex + b.phase} style={{ padding: 0, overflow: 'hidden' }}>
              <Pressable accessibilityRole="button" accessibilityState={{ expanded: isOpen }} accessibilityLabel={`${ex.name}, Anleitung ${isOpen ? 'schließen' : 'öffnen'}`} onPress={() => setOpen(isOpen ? null : i)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, minHeight: 60, backgroundColor: isOpen ? c.soft : 'transparent' }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
                  <Txt weight="800" color={c.onPrimary}>
                    {i + 1}
                  </Txt>
                </View>
                <View style={{ flex: 1 }}>
                  <Txt weight="800">{ex.name}</Txt>
                  <Txt size={12} muted>{`${b.phase} · ${b.sets && b.sets > 1 ? b.sets + ' × ' : ''}${amount}${b.perSide ? ' je Seite' : ''}${b.rest ? ` · ${b.rest} s Pause` : ''}`}</Txt>
                </View>
                <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} color={c.primary} />
              </Pressable>
              {isOpen && (
                <View style={{ padding: 14, gap: 8 }}>
                  <TrainerFigure exercise={ex} gender={s.profile.gender} size={240} />
                  {ex.sanskrit ? <Txt size={13} muted>{ex.sanskrit}</Txt> : null}
                  <Txt size={13} muted>{`Trainiert: ${ex.muscles}`}</Txt>
                  <Txt weight="700">So geht’s</Txt>
                  {ex.how.map((h) => (
                    <Txt key={h} size={14}>{`• ${h}`}</Txt>
                  ))}
                  <Card tone="warn" style={{ padding: 10 }}>
                    <Txt size={13}>{`Häufiger Fehler: ${ex.mistakes.join(' ')}`}</Txt>
                  </Card>
                  <Card tone="ok" style={{ padding: 10 }}>
                    <Txt size={13}>{`Leichter: ${ex.easier}\nSchwerer: ${ex.harder}`}</Txt>
                  </Card>
                  {ex.caution ? <Txt size={13} color={c.danger}>{ex.caution}</Txt> : null}
                </View>
              )}
            </Card>
          );
        })}
        <Note>Bei Schmerzen, Schwangerschaft oder Vorerkrankungen sprich vorher mit deiner Ärztin oder deinem Arzt. Höre auf deinen Körper – Schmerz ist ein Stoppsignal.</Note>
      </Screen>
    );
  }

  const recommended = phase ? WORKOUTS.filter((w) => w.phases.includes(phase)) : [];
  const week = s.sessions.filter((x) => x.date >= addDays(today(), -6));

  return (
    <Screen title="Fitness">
      <Segmented value={tab} onChange={setTab} options={[{ value: 'training', label: 'Trainings' }, { value: 'plan', label: 'Mein Plan' }, { value: 'verlauf', label: 'Verlauf' }]} />
      {tab === 'training' && (
        <>
          {phase && (
            <Card tone="soft">
              <Txt weight="800">{`Passend zur ${PHASE_INFO[phase].name}`}</Txt>
              <Txt size={14}>{PHASE_INFO[phase].training}</Txt>
              <Note>Die Studienlage zu zyklusbasiertem Training ist noch dünn – nimm es als Orientierung und hör auf dein Gefühl.</Note>
            </Card>
          )}
          <Row style={{ justifyContent: 'space-between' }}>
            <Txt weight="700">{`Diese Woche: ${week.length} Einheiten · ${week.reduce((a, b) => a + b.minutes, 0)} Min.`}</Txt>
            <Badge text="Ziel: 150 Min." />
          </Row>
          {WORKOUTS.map((w) => {
            const rec = recommended.includes(w);
            return (
              <Card key={w.id} onPress={() => { setPreview(w); setOpen(0); setLevel(w.level); }} label={`${w.name} ansehen`}>
                <Row>
                  <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: rec ? c.secondary : c.soft, alignItems: 'center', justifyContent: 'center' }}>
                    <Txt weight="800" color="#1F1B2E">{`${workoutMinutes(w)}′`}</Txt>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Txt weight="800">{w.name}</Txt>
                    <Txt size={12} muted>{`${CATEGORY_LABEL[w.category]} · ${w.focus}`}</Txt>
                  </View>
                  {rec && <Badge text="passt jetzt" bg={c.okBg} />}
                </Row>
              </Card>
            );
          })}
          <Note>Die Wochenempfehlung der WHO für Erwachsene: 150–300 Minuten moderate Bewegung plus 2× Krafttraining.</Note>
        </>
      )}

      {tab === 'plan' && (
        <>
          {s.plan.length === 0 && <Txt muted>Lege fest, wann du trainierst – z. B. Pilates-Kurs montags 18 Uhr oder Rückenschule mittwochs.</Txt>}
          {[1, 2, 3, 4, 5, 6, 7].map((wd) => {
            const items = s.plan.filter((p) => p.weekday === wd).sort((a, b) => a.time.localeCompare(b.time));
            if (!items.length) return null;
            return (
              <View key={wd} style={{ gap: 6 }}>
                <Txt weight="800">{WEEKDAYS[wd - 1]}</Txt>
                {items.map((p) => (
                  <Row key={p.id} style={{ padding: 12, borderRadius: 16, backgroundColor: c.soft }}>
                    <Txt weight="800" style={{ width: 52 }}>
                      {p.time}
                    </Txt>
                    <Txt style={{ flex: 1 }}>{p.title}</Txt>
                    {p.workoutId && <IconButton icon="play" label={`${p.title} starten`} onPress={() => setPreview(WORKOUTS.find((w) => w.id === p.workoutId) ?? null)} />}
                    <IconButton icon="trash-outline" label="Eintrag löschen" onPress={() => s.deletePlanEntry(p.id)} />
                  </Row>
                ))}
              </View>
            );
          })}
          <Button title="Einheit planen" icon="add" onPress={() => setPlanEdit({ title: '', days: [weekday(today())], time: '18:00', addToCalendar: true })} />
          <ToggleRow title="Erinnerung 1 Stunde vorher" value={s.settings.notifications.fitness.on} onChange={(on) => s.setNotif('fitness', { on })} />
          {s.settings.modules.zyklus && <ToggleRow title="Zyklusbasierte Empfehlungen" value={s.settings.cycleBasedTraining} onChange={(cycleBasedTraining) => s.setSettings({ cycleBasedTraining })} />}
        </>
      )}

      {tab === 'verlauf' && (
        <>
          <Button title="Kurs / Sport eintragen" icon="add" kind="secondary" onPress={() => setCourse({ title: '', minutes: 60 })} />
          {[...s.sessions].reverse().slice(0, 30).map((x) => (
            <Row key={x.id} style={{ padding: 12, borderRadius: 16, borderWidth: 1, borderColor: c.border }}>
              <Ionicons name={x.type === 'kurs' ? 'people-outline' : 'home-outline'} size={20} color={c.primary} />
              <Txt style={{ flex: 1 }}>{x.title}</Txt>
              <Txt size={13} muted>{`${formatShort(x.date)} · ${x.minutes} Min.`}</Txt>
            </Row>
          ))}
          {!s.sessions.length && <Txt muted>Noch keine Einheiten – dein erstes Training wartet.</Txt>}
        </>
      )}

      <Sheet
        visible={!!planEdit}
        onClose={() => setPlanEdit(null)}
        title="Einheit planen"
        footer={
          <Button
            title="Speichern"
            disabled={!planEdit?.title.trim() || !planEdit?.days.length}
            onPress={() => {
              if (!planEdit) return;
              for (const wd of planEdit.days) {
                s.savePlanEntry({ title: planEdit.title.trim(), weekday: wd, time: planEdit.time, workoutId: planEdit.workoutId, addToCalendar: planEdit.addToCalendar });
                if (planEdit.addToCalendar) {
                  // Die nächsten 8 Wochen im Kalender eintragen
                  let d = today();
                  while (weekday(d) !== wd) d = addDays(d, 1);
                  for (let k = 0; k < 8; k++) s.saveEvent({ title: planEdit.title.trim(), date: addDays(d, k * 7), start: planEdit.time, category: 'sport', remindMin: 60 });
                }
              }
              setPlanEdit(null);
            }}
          />
        }
      >
        {planEdit && (
          <>
            <Field label="Was?" value={planEdit.title} onChangeText={(title) => setPlanEdit({ ...planEdit, title })} placeholder="z. B. Pilates-Kurs, Laufen, Rückenschule" />
            <Txt weight="700">Home-Training verknüpfen (optional)</Txt>
            <Row wrap gap={6}>
              {WORKOUTS.map((w) => (
                <Chip key={w.id} label={w.name} selected={planEdit.workoutId === w.id} onPress={() => setPlanEdit({ ...planEdit, workoutId: planEdit.workoutId === w.id ? undefined : w.id, title: planEdit.title || w.name })} />
              ))}
            </Row>
            <Txt weight="700">An welchen Tagen?</Txt>
            <WeekdayPicker value={planEdit.days} onChange={(days) => setPlanEdit({ ...planEdit, days })} />
            <TimeField label="Uhrzeit" value={planEdit.time} onChange={(time) => setPlanEdit({ ...planEdit, time })} />
            <ToggleRow title="Im Kalender eintragen" desc="Die nächsten 8 Wochen als Sport-Termin" value={planEdit.addToCalendar} onChange={(addToCalendar) => setPlanEdit({ ...planEdit, addToCalendar })} />
          </>
        )}
      </Sheet>
      <Sheet visible={!!course} onClose={() => setCourse(null)} title="Sport eintragen" footer={<Button title="Speichern" disabled={!course?.title.trim()} onPress={() => { if (course) s.addSession({ date: today(), title: course.title.trim(), minutes: course.minutes, type: 'kurs' }); setCourse(null); }} />}>
        {course && (
          <>
            <Field label="Was hast du gemacht?" value={course.title} onChangeText={(title) => setCourse({ ...course, title })} placeholder="z. B. Pilates-Kurs" />
            <Row wrap gap={6}>
              {['Pilates-Kurs', 'Yoga-Kurs', 'Laufen', 'Radfahren', 'Schwimmen', 'Fitnessstudio', 'Spazieren', 'Tanzen'].map((x) => (
                <Chip key={x} label={x} selected={course.title === x} onPress={() => setCourse({ ...course, title: x })} />
              ))}
            </Row>
            <Stepper label="Dauer" value={course.minutes} onChange={(minutes) => setCourse({ ...course, minutes })} min={5} max={240} step={5} suffix=" Min." />
          </>
        )}
      </Sheet>
    </Screen>
  );
}
