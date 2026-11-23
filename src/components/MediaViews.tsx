// Anzeige & Aufnahme von Medien für Marmeladenglas-Momente (Bild, Video, Sprachmemo)
import { Ionicons } from '@expo/vector-icons';
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus, useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button, IconButton, Row, Txt } from '@/components/ui';
import type { MediaItem } from '@/types';
import { useTheme } from '@/theme/useTheme';

export const AudioPlayerView = ({ uri }: { uri: string }) => {
  const { c } = useTheme();
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);
  const pct = status.duration ? (status.currentTime / status.duration) * 100 : 0;
  return (
    <Row style={{ padding: 10, borderRadius: 16, backgroundColor: c.soft }}>
      <IconButton
        icon={status.playing ? 'pause' : 'play'}
        label={status.playing ? 'Sprachmemo pausieren' : 'Sprachmemo abspielen'}
        bg={c.primary}
        color={c.onPrimary}
        onPress={() => {
          if (status.playing) player.pause();
          else {
            if (status.duration && status.currentTime >= status.duration - 0.2) player.seekTo(0);
            player.play();
          }
        }}
      />
      <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: c.border, overflow: 'hidden' }}>
        <View style={{ width: `${pct}%`, height: 6, backgroundColor: c.primary }} />
      </View>
      <Txt size={12} muted>{`${Math.round(status.duration || 0)} s`}</Txt>
    </Row>
  );
};

export const VideoItem = ({ uri }: { uri: string }) => {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
  });
  return <VideoView player={player} style={{ width: '100%', aspectRatio: 16 / 9, borderRadius: 16 }} nativeControls contentFit="contain" />;
};

export const MediaGrid = ({ items, onRemove }: { items: MediaItem[]; onRemove?: (id: string) => void }) => (
  <View style={{ gap: 8 }}>
    {items.map((m) => (
      <View key={m.id} style={{ position: 'relative' }}>
        {m.kind === 'bild' && <Image source={{ uri: m.uri }} style={{ width: '100%', aspectRatio: 4 / 3, borderRadius: 16 }} contentFit="cover" accessibilityLabel="Foto zum Moment" />}
        {m.kind === 'video' && <VideoItem uri={m.uri} />}
        {m.kind === 'audio' && <AudioPlayerView uri={m.uri} />}
        {onRemove && (
          <View style={{ position: 'absolute', top: 6, right: 6 }}>
            <IconButton icon="close" label="Medium entfernen" onPress={() => onRemove(m.id)} size={36} />
          </View>
        )}
      </View>
    ))}
  </View>
);

// Sprachmemo aufnehmen
export const VoiceRecorder = ({ onRecorded }: { onRecorded: (uri: string, seconds: number) => void }) => {
  const { c } = useTheme();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const state = useAudioRecorderState(recorder);
  const [error, setError] = useState<string>();

  const start = async () => {
    const perm = await requestRecordingPermissionsAsync();
    if (!perm.granted) return setError('Ohne Mikrofon-Erlaubnis kann ich nichts aufnehmen. Du kannst sie in den Handy-Einstellungen erteilen.');
    setError(undefined);
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
  };
  const stop = async () => {
    await recorder.stop();
    await setAudioModeAsync({ allowsRecording: false });
    if (recorder.uri) onRecorded(recorder.uri, Math.round((state.durationMillis ?? 0) / 1000));
  };
  return (
    <View style={{ gap: 6 }}>
      {state.isRecording ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Aufnahme beenden" onPress={stop} style={{ minHeight: 54, borderRadius: 16, backgroundColor: c.danger, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Ionicons name="stop" size={20} color="#FFFFFF" />
          <Txt weight="800" color="#FFFFFF">{`Aufnahme läuft · ${Math.round((state.durationMillis ?? 0) / 1000)} s · Stopp`}</Txt>
        </Pressable>
      ) : (
        <Button title="Sprachmemo aufnehmen" icon="mic-outline" kind="secondary" onPress={start} />
      )}
      {error ? (
        <Txt size={12} color={c.danger}>
          {error}
        </Txt>
      ) : null}
    </View>
  );
};
