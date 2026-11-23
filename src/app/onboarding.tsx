// Einrichtung in 4 Schritten: Name → Module & Modi → Profil → Zyklus & Erinnerungen
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { DateField } from '@/components/Inputs';
import { Screen } from '@/components/Screen';
import { Button, Card, Chip, Field, Note, Row, Segmented, Stepper, ToggleRow, Txt } from '@/components/ui';
import { requestNotificationPermission } from '@/lib/notifications';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/theme/useTheme';
import type { ModuleId } from '@/types';

const MODULES: { id: ModuleId; name: string; desc: string }[] = [
  { id: 'todos', name: 'To-dos', desc: 'Aufgaben mit Priorität, Fälligkeit, Teilaufgaben' },
  { id: 'kalender', name: 'Kalender', desc: 'Termine nach Kategorien, Arzt-Rhythmus, Auslastung' },
  { id: 'habits', name: 'Gewohnheiten', desc: 'Neue Routinen etablieren, Serien & Meilensteine' },
  { id: 'haushalt', name: 'Haushaltsplaner', desc: 'Wiederkehrende Aufgaben mit empfohlenem Rhythmus' },
  { id: 'einkauf', name: 'Einkaufsliste', desc: 'Nach Kategorien sortiert' },
  { id: 'zyklus', name: 'Zyklus', desc: 'Periode, Eisprung, PMS-Alarm, Pillenwecker' },
  { id: 'fitness', name: 'Fitness', desc: 'Workouts mit Vorturner:in, Kurse, Trainingsplan' },
  { id: 'ernaehrung', name: 'Ernährung & Rezepte', desc: 'Kalorien, Nährwerte, Rezepte, Wochenplan' },
  { id: 'medikamente', name: 'Medikamente', desc: 'Einnahmeplan mit Erinnerungen' },
  { id: 'checkin', name: 'Check-in mit Tagi', desc: 'Stimmung, Energie, Schlaf – spielerisch' },
  { id: 'uebungen', name: 'Übungen & Rituale', desc: 'Atemübungen, Chakra, Orakel, Body-Scan' },
  { id: 'tagebuch', name: '6-Minuten-Tagebuch', desc: 'Morgen-Glas & Abendhimmel' },
  { id: 'momente', name: 'Marmeladenglas', desc: 'Besondere Momente mit Fotos, Videos, Sprachmemos' },
  { id: 'sterne', name: 'Sterne', desc: 'Horoskop aus echten Planetenständen & Tarot' },
  { id: 'bildschirmzeit', name: 'Bildschirmzeit', desc: 'Messen & bei Grenzwert warnen (Android)' },
];

export default function Onboarding() {
  const { c } = useTheme();
  const router = useRouter();
  const s = useStore();
  const [step, setStep] = useState(0);
  const [lastPeriod, setLastPeriod] = useState<string | undefined>();
  const mods = s.settings.modules;
  const toggle = (id: ModuleId) => s.setSettings({ modules: { ...mods, [id]: !mods[id] } });
  const count = Object.values(mods).filter(Boolean).length;

  const finish = async () => {
    if (mods.zyklus && lastPeriod && !s.cycle.periods.length) {
      s.setCycle({ periods: [{ start: lastPeriod }], setupDone: true });
    }
    await requestNotificationPermission();
    s.setSettings({ onboarded: true });
    s.addBadge('Willkommen');
    router.replace('/' as never);
  };

  const steps = [
    // 1 – Willkommen
    <View key="w" style={{ gap: 14 }}>
      <Txt size={16}>Dein Tag hilft dir, Termine, Aufgaben, Gewohnheiten und dein Wohlbefinden in Balance zu halten – damit deine Energie für das reicht, was dir wichtig ist.</Txt>
      <Field label="Wie dürfen wir dich nennen?" value={s.profile.name} onChangeText={(name) => s.setProfile({ name })} placeholder="Vorname" autoComplete="given-name" />
      <Card tone="ok">
        <Txt weight="800">Deine Daten gehören dir</Txt>
        <Txt size={14}>Alles wird nur auf diesem Gerät gespeichert. Du kannst es jederzeit exportieren. Cloud-Sync mit Verschlüsselung folgt.</Txt>
      </Card>
    </View>,
    // 2 – Module
    <View key="m" style={{ gap: 10 }}>
      <Txt muted>Wähle nur, was dir hilft. Du kannst es jederzeit ändern.</Txt>
      {MODULES.map((m) => (
        <Card key={m.id} style={{ borderWidth: 2, borderColor: mods[m.id] ? c.primary : c.border, padding: 12 }}>
          <ToggleRow title={m.name} desc={m.desc} value={mods[m.id]} onChange={() => toggle(m.id)} />
          {m.id === 'zyklus' && mods.zyklus && (
            <Segmented value={s.settings.cycleMode} onChange={(v) => s.setSettings({ cycleMode: v })} options={[{ value: 'tracken', label: 'Zyklus tracken' }, { value: 'kinderwunsch', label: 'Kinderwunsch' }]} />
          )}
          {m.id === 'checkin' && mods.checkin && (
            <Segmented
              value={s.settings.checkinMode}
              onChange={(v) => s.setSettings({ checkinMode: v, checkinTimes: v === 'zweimal' ? [{ hour: 9, minute: 0 }, { hour: 20, minute: 0 }] : [{ hour: 20, minute: 0 }] })}
              options={[{ value: 'taeglich', label: 'Täglich' }, { value: 'zweimal', label: '2× täglich' }, { value: 'manuell', label: 'Nur manuell' }]}
            />
          )}
          {m.id === 'fitness' && mods.fitness && (
            <Segmented value={s.settings.fitnessMode} onChange={(v) => s.setSettings({ fitnessMode: v })} options={[{ value: 'home', label: 'Home-Training' }, { value: 'kurse', label: 'Kurse' }, { value: 'beides', label: 'Beides' }]} />
          )}
        </Card>
      ))}
    </View>,
    // 3 – Profil
    <View key="p" style={{ gap: 14 }}>
      <Txt weight="700">Geschlecht</Txt>
      <Txt size={13} muted>
        Bestimmt u. a., wer dir im Fitness-Bereich die Übungen vormacht.
      </Txt>
      <Segmented value={s.profile.gender} onChange={(gender) => s.setProfile({ gender })} options={[{ value: 'w', label: 'Weiblich' }, { value: 'm', label: 'Männlich' }, { value: 'd', label: 'Divers' }]} />
      <Stepper label="Alter" value={s.profile.age} onChange={(age) => s.setProfile({ age })} min={12} max={110} />
      <Txt weight="700">Das tut mir gut</Txt>
      <Row wrap gap={6}>
        {['Treffen mit Freunden', 'Sport', 'Zeit mit Familie', 'Wenig Bildschirmzeit', 'Natur', 'Me-Time', 'Kreatives', 'Ausschlafen'].map((x) => (
          <Chip key={x} label={x} selected={s.profile.goodFor.includes(x)} color="#0D9488" onPress={() => s.setProfile({ goodFor: s.profile.goodFor.includes(x) ? s.profile.goodFor.filter((y) => y !== x) : [...s.profile.goodFor, x] })} />
        ))}
      </Row>
      <Txt weight="700">Das tut mir nicht gut</Txt>
      <Row wrap gap={6}>
        {['Zu viele Termine', 'Wenig Me-Time', 'Spät ins Bett', 'Viel Bildschirmzeit', 'Lange Arbeitstage', 'Keine Bewegung'].map((x) => (
          <Chip key={x} label={x} selected={s.profile.badFor.includes(x)} color="#D97706" onPress={() => s.setProfile({ badFor: s.profile.badFor.includes(x) ? s.profile.badFor.filter((y) => y !== x) : [...s.profile.badFor, x] })} />
        ))}
      </Row>
      <Stepper label="Ab so vielen Terminen wird es mir zu viel" value={s.profile.maxEventsPerDay} onChange={(maxEventsPerDay) => s.setProfile({ maxEventsPerDay })} min={1} max={10} />
    </View>,
    // 4 – Zyklus & Erinnerungen
    <View key="z" style={{ gap: 14 }}>
      {mods.zyklus ? (
        <>
          <Txt weight="800" size={17}>
            Dein Zyklus
          </Txt>
          <DateField label="Wann hat deine letzte Periode begonnen?" value={lastPeriod} onChange={setLastPeriod} quick={false} optional />
          <Stepper label="Periode dauert im Schnitt" value={s.cycle.avgPeriodLen} onChange={(avgPeriodLen) => s.setCycle({ avgPeriodLen })} min={2} max={10} suffix=" Tage" />
          <Stepper label="Zyklus dauert im Schnitt" value={s.cycle.avgCycleLen} onChange={(avgCycleLen) => s.setCycle({ avgCycleLen })} min={20} max={45} suffix=" Tage" />
          <Note>Die App lernt mit jedem eingetragenen Zyklus dazu. Prognosen sind Schätzungen – keine Verhütungsmethode und keine Diagnose.</Note>
        </>
      ) : null}
      <Txt weight="800" size={17}>
        Erinnerungen
      </Txt>
      <Txt muted>Im nächsten Schritt fragt dein Handy, ob „Dein Tag“ dir Benachrichtigungen schicken darf. In den Einstellungen entscheidest du für jedes Thema einzeln.</Txt>
    </View>,
  ];

  const titles = ['Willkommen bei Dein Tag', 'Was möchtest du begleiten?', 'Ein bisschen über dich', 'Fast geschafft'];
  return (
    <Screen
      title={titles[step]}
      subtitle={`Schritt ${step + 1} von 4`}
      footer={
        <Row>
          {step > 0 && <Button title="Zurück" kind="secondary" onPress={() => setStep(step - 1)} style={{ flex: 1 }} />}
          <Button title={step < 3 ? (step === 1 ? `Weiter mit ${count} Modulen` : 'Weiter') : 'Los geht’s'} onPress={() => (step < 3 ? setStep(step + 1) : finish())} style={{ flex: 2 }} disabled={step === 1 && count === 0} />
        </Row>
      }
    >
      {steps[step]}
    </Screen>
  );
}
