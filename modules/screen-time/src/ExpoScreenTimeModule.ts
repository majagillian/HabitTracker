import { NativeModule, requireOptionalNativeModule } from 'expo';
import type { AppUsage } from './ExpoScreenTime.types';

declare class ExpoScreenTimeModule extends NativeModule<{}> {
  hasPermission(): boolean;
  openPermissionSettings(): void;
  getUsage(startMs: number, endMs: number): Promise<AppUsage[]>;
}

// „Optional“, damit die App auch in Expo Go oder auf iOS nicht abstürzt (dann ist das Modul null)
export default requireOptionalNativeModule<ExpoScreenTimeModule>('ExpoScreenTime');
