// Nutzungsdauer einer App im abgefragten Zeitraum
export type AppUsage = {
  packageName: string;
  appName: string;
  totalMs: number;
};
