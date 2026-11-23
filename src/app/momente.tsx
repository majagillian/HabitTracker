// Marmeladenglas-Momente: besondere Erlebnisse mit Text, Fotos, Videos und Sprachmemos – lokal auf dem Gerät
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { DateField } from '@/components/Inputs';
import { MediaGrid, VoiceRecorder } from '@/components/MediaViews';
import { Screen } from '@/components/Screen';
import { Badge, Button, Card, Chip, Confirm, Empty, Field, IconButton, Note, Row, Segmented, Sheet, Txt } from '@/components/ui';
import { formatLong, today } from '@/lib/date';
import { uid } from '@/lib/id';
import { deleteMedia, extFromUri, persistMedia } from '@/lib/media';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/theme/useTheme';
import type { MediaItem, Moment } from '@/types';

const FEELINGS = ['Glücklich', 'Dankbar', 'Stolz', 'Verliebt', 'Frei', 'Geborgen', 'Lustig', 'Berührt'];
const MARBLE = ['#A78BFA', '#8FFFD6', '#FFC494', '#F472B6', '#60A5FA', '#FDE68A'];

export default function Momente() {
  const { c } = useTheme();
  const params = useLocalSearchParams<{ neu?: string }>();
  const moments = useStore((s) => s.moments);
  const { saveMoment, deleteMoment } = useStore();
  const [view, setView] = useState<'glas' | 'zeitleiste'>('glas');
  const [edit, setEdit] = useState<(Partial<Moment> & { title: string }) | null>(null);
  const [error, setError] = useState<string>();
  const [shown, setShown] = useState<Moment | null>(null);
  const [del, setDel] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (params.neu) setEdit({ title: '', date: today(), text: '', feeling: 'Glücklich', media: [] });
  }, [params.neu]);

  const shakeJar = () => {
    if (!moments.length) return;
    Animated.sequence([-1, 1, -1, 1, 0].map((v) => Animated.timing(shake, { toValue: v, duration: 90, useNativeDriver: true }))).start(() => setShown(moments[Math.floor(Math.random() * moments.length)]));
  };

  const addMedia = async (source: 'galerie' | 'kamera') => {
    if (!edit) return;
    setBusy(true);
    try {
      if (source === 'kamera') {
        const p = await ImagePicker.requestCameraPermissionsAsync();
        if (!p.granted) return setError('Ohne Kamera-Erlaubnis kann ich kein Foto aufnehmen.');
      }
      const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images', 'videos'], quality: 0.8, allowsMultipleSelection: source === 'galerie', videoMaxDuration: 120 };
      const res = source === 'kamera' ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
      if (res.canceled) return;
      const items: MediaItem[] = [];
      for (const a of res.assets) {
        const kind = a.type === 'video' ? 'video' : 'bild';
        const uri = await persistMedia(a.uri, extFromUri(a.uri, kind === 'video' ? 'mp4' : 'jpg'));
        items.push({ id: uid(), kind, uri, durationSec: a.duration ? Math.round(a.duration / 1000) : undefined });
      }
      setEdit((e) => (e ? { ...e, media: [...(e.media ?? []), ...items] } : e));
    } catch {
      setError('Das Medium konnte nicht gespeichert werden. Bitte versuch es noch einmal.');
    } finally {
      setBusy(false);
    }
  };

  const save = () => {
    if (!edit) return;
    if (!edit.title.trim()) return setError('Gib deinem Moment einen kurzen Titel.');
    saveMoment({ ...edit, title: edit.title.trim() });
    setEdit(null);
    setError(undefined);
  };

  return (
    <Screen title="Marmeladenglas" subtitle="Momente, die du nie vergessen willst">
      <Segmented value={view} onChange={setView} options={[{ value: 'glas', label: 'Glas' }, { value: 'zeitleiste', label: 'Zeitleiste' }]} />
      {moments.length === 0 && <Empty icon="flower-outline" title="Dein Glas ist noch leer" text="Halte besondere Erlebnisse fest – mit Text, Fotos, Videos oder einem Sprachmemo." />}
      {view === 'glas' && moments.length > 0 && (
        <View style={{ alignItems: 'center', gap: 10 }}>
          <Animated.View style={{ transform: [{ rotate: shake.interpolate({ inputRange: [-1, 1], outputRange: ['-8deg', '8deg'] }) }] }}>
            <Svg width={200} height={240} viewBox="0 0 110 130" accessibilityLabel={`Marmeladenglas mit ${moments.length} Momenten`}>
              <Rect x={30} y={4} width={50} height={12} rx={4} fill="#D6C4A8" />
              <Path d="M26 18 H84 Q96 26 96 44 V112 Q96 126 82 126 H28 Q14 126 14 112 V44 Q14 26 26 18 Z" fill={c.soft} stroke="#A78BFA" strokeWidth={3} />
              {moments.slice(0, 30).map((m, i) => (
                <Circle key={m.id} cx={24 + ((i * 17) % 62)} cy={116 - Math.floor(i / 5) * 12 - ((i % 2) * 3)} r={6} fill={MARBLE[i % MARBLE.length]} />
              ))}
            </Svg>
          </Animated.View>
          <Button title="Glas schütteln – Erinnerung ziehen" icon="sparkles" kind="mint" onPress={shakeJar} />
          {shown && (
            <Card tone="warn" onPress={() => setEdit(shown)} label="Moment öffnen" style={{ width: '100%' }}>
              <Badge text={formatLong(shown.date!)} />
              <Txt weight="800" size={18}>
                {shown.title}
              </Txt>
              {shown.text ? <Txt>{shown.text}</Txt> : null}
              <MediaGrid items={shown.media.slice(0, 1)} />
            </Card>
          )}
        </View>
      )}
      {view === 'zeitleiste' &&
        [...moments].sort((a, b) => b.date.localeCompare(a.date)).map((m) => (
          <Card key={m.id} onPress={() => setEdit(m)} label={`${m.title} öffnen`}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Txt size={12} muted>
                {formatLong(m.date)}
              </Txt>
              <Badge text={m.feeling} bg={c.okBg} />
            </Row>
            <Txt weight="800" size={17}>
              {m.title}
            </Txt>
            {m.text ? <Txt numberOfLines={3}>{m.text}</Txt> : null}
            <MediaGrid items={m.media} />
          </Card>
        ))}
      <Button title="Moment ins Glas legen" icon="add" onPress={() => setEdit({ title: '', date: today(), text: '', feeling: 'Glücklich', media: [] })} />
      <Note>Fotos, Videos und Sprachmemos werden nur im Speicher der App auf deinem Gerät abgelegt. Beim Export werden derzeit nur die Texte gesichert.</Note>

      <Sheet
        visible={!!edit}
        onClose={() => setEdit(null)}
        title={edit?.id ? 'Dein Moment' : 'Neuer Moment'}
        footer={
          <Row>
            {edit?.id ? <IconButton icon="trash-outline" label="Moment löschen" onPress={() => setDel(edit.id!)} /> : null}
            <Button title="Ins Glas legen" onPress={save} style={{ flex: 1 }} disabled={busy} />
          </Row>
        }
      >
        {edit && (
          <>
            <Field label="Was war besonders?" value={edit.title} onChangeText={(title) => setEdit({ ...edit, title })} error={error} placeholder="z. B. Sonnenaufgang am Meer" />
            <DateField label="Wann?" value={edit.date} onChange={(date) => date && setEdit({ ...edit, date })} quick={false} />
            <Field label="Erzähl davon" value={edit.text} onChangeText={(text) => setEdit({ ...edit, text })} multiline placeholder="Wer war dabei? Wie hat es sich angefühlt?" />
            <Txt weight="700">Gefühl</Txt>
            <Row wrap gap={6}>
              {FEELINGS.map((f) => (
                <Chip key={f} label={f} selected={edit.feeling === f} onPress={() => setEdit({ ...edit, feeling: f })} />
              ))}
            </Row>
            <Txt weight="700">Fotos, Videos & Sprachmemos</Txt>
            <MediaGrid
              items={edit.media ?? []}
              onRemove={(id) => {
                const m = edit.media?.find((x) => x.id === id);
                if (m && !edit.id) deleteMedia(m.uri);
                setEdit({ ...edit, media: (edit.media ?? []).filter((x) => x.id !== id) });
              }}
            />
            <Row>
              <Button title="Galerie" icon="images-outline" kind="secondary" onPress={() => addMedia('galerie')} style={{ flex: 1 }} small />
              <Button title="Kamera" icon="camera-outline" kind="secondary" onPress={() => addMedia('kamera')} style={{ flex: 1 }} small />
            </Row>
            <VoiceRecorder
              onRecorded={async (uri, sec) => {
                const stored = await persistMedia(uri, extFromUri(uri, 'm4a'));
                setEdit((e) => (e ? { ...e, media: [...(e.media ?? []), { id: uid(), kind: 'audio', uri: stored, durationSec: sec }] } : e));
              }}
            />
          </>
        )}
      </Sheet>
      <Confirm
        visible={!!del}
        title="Moment löschen?"
        text="Der Moment und seine Medien werden vom Gerät entfernt."
        confirm="Löschen"
        danger
        onCancel={() => setDel(null)}
        onConfirm={() => {
          const m = moments.find((x) => x.id === del);
          m?.media.forEach((x) => deleteMedia(x.uri));
          if (del) deleteMoment(del);
          setDel(null);
          setEdit(null);
          setShown(null);
        }}
      />
    </Screen>
  );
}
