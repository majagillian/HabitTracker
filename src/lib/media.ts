// Medien für Marmeladenglas-Momente: dauerhaft im App-Speicher ablegen (bleiben auf dem Gerät)
import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';
import { uid } from '@/lib/id';

const dir = () => {
  const d = new Directory(Paths.document, 'momente');
  if (!d.exists) d.create({ intermediates: true, idempotent: true });
  return d;
};

// Kopiert eine (temporäre) Datei aus Kamera/Galerie/Recorder in den dauerhaften App-Ordner
export const persistMedia = async (uri: string, ext: string): Promise<string> => {
  if (Platform.OS === 'web') return uri; // Im Browser bleibt die Blob-URL (nur für die Sitzung)
  const target = new File(dir(), `${uid()}.${ext}`);
  await new File(uri).copy(target);
  return target.uri;
};

export const deleteMedia = (uri: string) => {
  if (Platform.OS === 'web') return;
  try {
    const f = new File(uri);
    if (f.exists) f.delete();
  } catch {
    // Datei war schon weg – kein Problem
  }
};

export const extFromUri = (uri: string, fallback: string) => {
  const m = uri.split('?')[0].match(/\.([a-zA-Z0-9]{2,4})$/);
  return m ? m[1].toLowerCase() : fallback;
};
