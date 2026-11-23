// Profil & Einstellungen: Profil, Erinnerungen pro Thema, Darstellung, Datenhoheit (Export/Import/Löschen)
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { TimeField } from '@/components/Inputs';
import { Screen } from '@/components/Screen';
import { Button, Card, Chip, Confirm, Field, Note, Row, Segmented, Stepper, ToggleRow, Txt } from '@/components/ui';
import { exportData, importData } from '@/lib/backup';
import { requestNotificationPermission } from '@/lib/notifications';
import { useStore } from '@/store/useStore';
import type { NotifId } from '@/types';

const NOTIFS: { id: NotifId; title: string; desc: string; time?: boolean; module?: keyof ReturnType<typeof useStore.getState>['settings']['modules'] }[] = [
  { id: 'todos', title: 'To-dos fällig', desc: 'Am Morgen des Fälligkeitstags', time: true, module: 'todos' },
  { id: 'haushalt', title: 'Haushalt', desc: 'Als To-do am Fälligkeitstag', module: 'haushalt' },
  { id: 'termine', title: 'Termine', desc: 'Vorlaufzeit pro Termin einstellbar', module: 'kalender' },
  { id: 'arztFolge', title: 'Arzt-Folgetermine', desc: '3 Wochen vor Fälligkeit, wenn keiner vereinbart ist', time: true, module: 'kalender' },
  { id: 'auslastung', title: 'Volle Tage', desc: 'Am Vorabend, wenn der nächste Tag zu voll wird', time: true },
  { id: 'habits', title: 'Gewohnheiten', desc: 'Täglich, solange etwas offen ist', time: true, module: 'habits' },
  { id: 'checkin', title: 'Achtsamkeits-Check-in', desc: 'Zu deinen Check-in-Zeiten', module: 'checkin' },
  { id: 'tagebuch', title: 'Tagebuch', desc: 'Morgens & abends', time: true, module: 'tagebuch' },
  { id: 'periode', title: 'Nächste Periode', desc: '2 Tage vorher', time: true, module: 'zyklus' },
  { id: 'pms', title: 'PMS-Alarm', desc: '1 Tag vor deinen typischen PMS-Tagen', time: true, module: 'zyklus' },
  { id: 'eisprung', title: 'Eisprung / fruchtbare Tage', desc: 'Prognose', time: true, module: 'zyklus' },
  { id: 'zyklusHinweise', title: 'Stimmung & Beschwerden im Zyklus', desc: 'Hinweis zu Beginn der Lutealphase', time: true, module: 'zyklus' },
  { id: 'pille', title: 'Pillenwecker', desc: 'Uhrzeit im Zyklus-Bereich', module: 'zyklus' },
  { id: 'medikamente', title: 'Medikamente', desc: 'Zu jeder Einnahmezeit', module: 'medikamente' },
  { id: 'fitness', title: 'Training', desc: '1 Stunde vor geplanten Einheiten', module: 'fitness' },
  { id: 'bildschirmzeit', title: 'Bildschirmzeit-Limit', desc: 'Beim Überschreiten', module: 'bildschirmzeit' },
  { id: 'horoskop', title: 'Horoskop des Tages', desc: 'Täglich', time: true, module: 'sterne' },
];

export default function Einstellungen() {
  const router = useRouter();
  const s = useStore();
  const [msg, setMsg] = useState<string | null>(null);
  const [reset, setReset] = useState(false);
  const pad = (n: number) => String(n).padStart(2, '0');

  const toggleList = (key: 'goodFor' | 'badFor', x: string) => s.setProfile({ [key]: s.profile[key].includes(x) ? s.profile[key].filter((y) => y !== x) : [...s.profile[key], x] });
  const [goodNew, setGoodNew] = useState('');
  const [badNew, setBadNew] = useState('');

  return (
    <Screen title="Profil & Einstellungen">
      <Card>
        <Txt weight="800" size={17}>
          Über dich
        </Txt>
        <Field label="Name" value={s.profile.name} onChangeText={(name) => s.setProfile({ name })} />
        <Txt weight="700">Geschlecht</Txt>
        <Txt size={13} muted>
          Bestimmt u. a., wer dir die Übungen vormacht (weiblich, männlich, neutral).
        </Txt>
        <Segmented value={s.profile.gender} onChange={(gender) => s.setProfile({ gender })} options={[{ value: 'w', label: 'Weiblich' }, { value: 'm', label: 'Männlich' }, { value: 'd', label: 'Divers' }]} />
        <Stepper label="Alter" value={s.profile.age} onChange={(age) => s.setProfile({ age })} min={12} max={110} />
        <Stepper label="Größe" value={s.profile.heightCm} onChange={(heightCm) => s.setProfile({ heightCm })} min={120} max={220} suffix=" cm" />
        <Stepper label="Gewicht" value={s.profile.weightKg} onChange={(weightKg) => s.setProfile({ weightKg })} min={35} max={250} suffix=" kg" />
      </Card>

      <Card>
        <Txt weight="800" size={17}>
          Das tut mir gut
        </Txt>
        <Row wrap gap={6}>
          {s.profile.goodFor.map((x) => (
            <Chip key={x} label={`${x} ✕`} selected color="#0D9488" onPress={() => toggleList('goodFor', x)} />
          ))}
        </Row>
        <Row>
          <View style={{ flex: 1 }}>
            <Field label="Hinzufügen" value={goodNew} onChangeText={setGoodNew} placeholder="z. B. Spaziergang im Wald" />
          </View>
          <Button small title="+" label="Hinzufügen" onPress={() => { if (goodNew.trim()) { toggleList('goodFor', goodNew.trim()); setGoodNew(''); } }} />
        </Row>
        <Txt weight="800" size={17}>
          Das tut mir nicht gut
        </Txt>
        <Row wrap gap={6}>
          {s.profile.badFor.map((x) => (
            <Chip key={x} label={`${x} ✕`} selected color="#D97706" onPress={() => toggleList('badFor', x)} />
          ))}
        </Row>
        <Row>
          <View style={{ flex: 1 }}>
            <Field label="Hinzufügen" value={badNew} onChangeText={setBadNew} placeholder="z. B. Spät essen" />
          </View>
          <Button small title="+" label="Hinzufügen" onPress={() => { if (badNew.trim()) { toggleList('badFor', badNew.trim()); setBadNew(''); } }} />
        </Row>
        <Stepper label="Ab so vielen Terminen wird es zu viel" value={s.profile.maxEventsPerDay} onChange={(maxEventsPerDay) => s.setProfile({ maxEventsPerDay })} min={1} max={10} />
      </Card>

      <Card>
        <Txt weight="800" size={17}>
          Erinnerungen
        </Txt>
        <Button small kind="secondary" title="Benachrichtigungen erlauben" onPress={async () => setMsg((await requestNotificationPermission()) ? 'Benachrichtigungen sind erlaubt.' : 'Bitte erlaube Benachrichtigungen in den Handy-Einstellungen.')} />
        {NOTIFS.filter((n) => !n.module || s.settings.modules[n.module]).map((n) => {
          const v = s.settings.notifications[n.id];
          return (
            <View key={n.id}>
              <ToggleRow title={n.title} desc={n.desc} value={v.on} onChange={(on) => s.setNotif(n.id, { on })} />
              {v.on && n.time && (
                <TimeField
                  label="Uhrzeit"
                  value={`${pad(v.hour)}:${pad(v.minute)}`}
                  onChange={(t) => {
                    const [hour, minute] = t.split(':').map(Number);
                    s.setNotif(n.id, { hour, minute });
                  }}
                />
              )}
            </View>
          );
        })}
        {s.settings.modules.checkin && (
          <>
            <Txt weight="700">Check-in-Rhythmus</Txt>
            <Segmented
              value={s.settings.checkinMode}
              onChange={(v) => s.setSettings({ checkinMode: v, checkinTimes: v === 'zweimal' ? [{ hour: 9, minute: 0 }, { hour: 20, minute: 0 }] : [{ hour: 20, minute: 0 }] })}
              options={[{ value: 'taeglich', label: 'Täglich' }, { value: 'zweimal', label: '2× täglich' }, { value: 'manuell', label: 'Manuell' }]}
            />
            {s.settings.checkinMode !== 'manuell' &&
              s.settings.checkinTimes.map((t, i) => (
                <TimeField
                  key={i}
                  label={`Check-in ${i + 1}`}
                  value={`${pad(t.hour)}:${pad(t.minute)}`}
                  onChange={(v) => {
                    const [hour, minute] = v.split(':').map(Number);
                    s.setSettings({ checkinTimes: s.settings.checkinTimes.map((x, j) => (j === i ? { hour, minute } : x)) });
                  }}
                />
              ))}
          </>
        )}
      </Card>

      <Card>
        <Txt weight="800" size={17}>
          Darstellung
        </Txt>
        <Segmented value={s.settings.theme} onChange={(theme) => s.setSettings({ theme })} options={[{ value: 'system', label: 'System' }, { value: 'hell', label: 'Hell' }, { value: 'dunkel', label: 'Dunkel' }]} />
        <ToggleRow title="Große Schrift" desc="Zusätzlich zur Schriftgröße deines Handys" value={s.settings.largeText} onChange={(largeText) => s.setSettings({ largeText })} />
        <Button kind="secondary" title="Module an- und abschalten" icon="apps-outline" onPress={() => router.navigate('/onboarding' as never)} />
      </Card>

      <Card tone="ok">
        <Txt weight="800" size={17}>
          Deine Daten
        </Txt>
        <Txt size={14}>Speicherort: nur dieses Gerät. Niemand außer dir hat Zugriff. Mit dem Export sicherst du alles als Datei – z. B. in deiner eigenen Cloud. Automatischer Cloud-Sync mit Ende-zu-Ende-Verschlüsselung (Google Drive, Nextcloud/WebDAV) ist für die nächste Version geplant.</Txt>
        <Row>
          <Button small title="Exportieren" icon="download-outline" kind="secondary" style={{ flex: 1 }} onPress={async () => { try { const f = await exportData(); setMsg(`Backup „${f}“ erstellt.`); } catch { setMsg('Export fehlgeschlagen. Bitte versuch es erneut.'); } }} />
          <Button small title="Importieren" icon="cloud-upload-outline" kind="secondary" style={{ flex: 1 }} onPress={async () => { try { const r = await importData(); if (r === 'ok') setMsg('Backup wurde eingespielt.'); } catch (e) { setMsg((e as Error).message); } }} />
        </Row>
        <Button small title="Alle Daten löschen" kind="danger" onPress={() => setReset(true)} />
      </Card>
      {msg && (
        <Card tone="warn">
          <Txt>{msg}</Txt>
        </Card>
      )}
      <Note>Dein Tag ersetzt keine medizinische, psychologische oder ernährungsfachliche Beratung. Zyklusprognosen sind keine Verhütungsmethode. Im Notfall: 112. Telefonseelsorge: 0800 111 0 111 (kostenlos, rund um die Uhr).</Note>
      <Confirm visible={reset} title="Alle Daten löschen?" text="Alle Einträge werden von diesem Gerät entfernt. Erstelle vorher ein Backup, wenn du sie behalten willst." confirm="Endgültig löschen" danger onCancel={() => setReset(false)} onConfirm={() => { s.resetAll(); setReset(false); router.replace('/onboarding' as never); }} />
    </Screen>
  );
}
