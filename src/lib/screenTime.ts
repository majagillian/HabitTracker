// Bildschirmzeit: automatische Messung auf Android (eigenes Native-Modul), sonst manuelle Eingabe
import { Platform } from 'react-native';
import ScreenTime from '../../modules/screen-time';
import type { AppUsage } from '../../modules/screen-time/src/ExpoScreenTime.types';

export const screenTimeSupported = () => Platform.OS === 'android' && !!ScreenTime;

export const hasScreenTimePermission = (): boolean => {
  try {
    return screenTimeSupported() ? ScreenTime!.hasPermission() : false;
  } catch {
    return false;
  }
};

export const openScreenTimeSettings = () => {
  if (screenTimeSupported()) ScreenTime!.openPermissionSettings();
};

// Nutzung eines Tages (lokale Mitternacht bis jetzt bzw. Tagesende)
export const usageForDay = async (date: Date = new Date()): Promise<{ totalMin: number; apps: AppUsage[] }> => {
  if (!screenTimeSupported() || !hasScreenTimePermission()) return { totalMin: 0, apps: [] };
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const apps = await ScreenTime!.getUsage(start.getTime(), Math.min(end.getTime(), Date.now()));
  const totalMin = Math.round(apps.reduce((s, a) => s + a.totalMs, 0) / 60000);
  return { totalMin, apps };
};

export const formatMinutes = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')} min` : `${m} min`);
