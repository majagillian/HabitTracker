// Datenhoheit: Export & Import aller Daten als JSON-Datei (Cloud-Sync folgt in Phase 2)
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { today } from '@/lib/date';
import { exportableKeys, useStore, type AppState } from '@/store/useStore';

export const BACKUP_VERSION = 1;

export const snapshot = () => {
  const s = useStore.getState();
  const data: Record<string, unknown> = {};
  for (const k of exportableKeys) data[k] = s[k];
  return { app: 'dein-tag', version: BACKUP_VERSION, exportedAt: new Date().toISOString(), data };
};

export const exportData = async (): Promise<string> => {
  const json = JSON.stringify(snapshot(), null, 2);
  const name = `dein-tag-backup-${today()}.json`;
  if (Platform.OS === 'web') {
    // Browser: Download über einen temporären Link
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    return name;
  }
  const file = new File(Paths.cache, name);
  if (file.exists) file.delete();
  file.create();
  file.write(json);
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Backup speichern' });
  return name;
};

export const importData = async (): Promise<'ok' | 'abgebrochen'> => {
  const res = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
  if (res.canceled) return 'abgebrochen';
  const asset = res.assets[0];
  const text = Platform.OS === 'web' && asset.file ? await asset.file.text() : await new File(asset.uri).text();
  let parsed: { app?: string; data?: Partial<AppState> };
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Die Datei ist kein gültiges Backup (kein JSON).');
  }
  if (parsed.app !== 'dein-tag' || !parsed.data) throw new Error('Diese Datei stammt nicht aus „Dein Tag“.');
  useStore.getState().importAll(parsed.data);
  return 'ok';
};
